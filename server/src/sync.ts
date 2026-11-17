import type { Legislator, SyncProgress } from "../../shared/types.ts";
import { osGet } from "./openstates.ts";
import { normalize } from "./normalize.ts";
import { readCache, writeCache } from "./cache.ts";
import { JURISDICTIONS } from "./jurisdictions.ts";

// Probe: ~10 requests/minute, 429 without Retry-After headers. ~7s spacing stays under it.
const DELAY_MS = Number(process.env.SYNC_DELAY_MS ?? 7000);
const RATE_LIMIT_WAIT_MS = 65_000;
const MAX_ATTEMPTS = 4;
const PER_PAGE = 50; // API maximum, confirmed by the probe

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let progress: SyncProgress = {
  running: false,
  done: 0,
  total: JURISDICTIONS.length,
};
export const getProgress = (): SyncProgress => ({ ...progress });

async function fetchPage(code: string, page: number) {
  let lastErr = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const r = await osGet("/people", {
      jurisdiction: code,
      per_page: PER_PAGE,
      page,
    });
    if (r.status === 200 && r.json) return r.json;
    lastErr = `HTTP ${r.status} ${JSON.stringify(r.json ?? "").slice(0, 200)}`;
    if (r.status === 429) {
      const ra = Number(r.headers["retry-after"]);
      await sleep(
        Number.isFinite(ra) && ra > 0 ? ra * 1000 : RATE_LIMIT_WAIT_MS,
      );
    } else if (r.status >= 500) {
      await sleep(2000 * 2 ** attempt);
    } else break; // 4xx other than 429: retrying will not help
  }
  throw new Error(lastErr);
}

async function syncOne(code: string): Promise<Legislator[]> {
  const out: Legislator[] = [];
  let page = 1;
  let maxPage = 1;
  do {
    const body = await fetchPage(code, page);
    maxPage = body.pagination?.max_page ?? 1;
    for (const raw of body.results ?? []) {
      const l = normalize(raw, code);
      if (l) out.push(l);
    }
    page++;
    if (page <= maxPage) await sleep(DELAY_MS);
  } while (page <= maxPage);
  return out;
}

/** Starts a sync in the background. Returns false if one is already running. */
export function startSync(): boolean {
  if (progress.running) return false;
  progress = { running: true, done: 0, total: JURISDICTIONS.length };
  void run()
    .catch((e) => console.error("[sync] fatal", e))
    .finally(() => {
      progress = { ...progress, running: false, current: undefined };
    });
  return true;
}

export async function runSyncToEnd(): Promise<void> {
  if (!startSync()) return;
  while (progress.running) await sleep(500);
}

async function run() {
  for (const code of JURISDICTIONS) {
    progress.current = code;
    const cache = await readCache();
    const status = cache.jurisdictions.find((j) => j.code === code)!;
    try {
      const fresh = await syncOne(code);
      cache.legislators = [
        ...cache.legislators.filter((l) => l.jurisdiction !== code),
        ...fresh,
      ];
      Object.assign(status, {
        state: "ok",
        count: fresh.length,
        syncedAt: new Date().toISOString(),
        error: undefined,
      });
      console.log(`[sync] ${code}: ${fresh.length}`);
    } catch (e: any) {
      // Keep previous records; mark failed. Never fill in rows.
      Object.assign(status, { state: "failed", error: String(e.message ?? e) });
      console.error(`[sync] ${code} failed: ${status.error}`);
    }
    progress.done++;
    if (progress.done === JURISDICTIONS.length)
      cache.lastSyncedAt = new Date().toISOString();
    await writeCache(cache);
    await sleep(DELAY_MS);
  }
}
