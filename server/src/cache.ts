import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import type { CacheFile } from "../../shared/types.ts";
import { JURISDICTIONS } from "./jurisdictions.ts";

const dir = fileURLToPath(new URL("../../data/", import.meta.url));
const file = dir + "cache.json";

export function emptyCache(): CacheFile {
  return {
    lastSyncedAt: null,
    legislators: [],
    jurisdictions: JURISDICTIONS.map((code) => ({
      code,
      state: "pending",
      count: 0,
    })),
  };
}

export async function readCache(): Promise<CacheFile> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (e: any) {
    if (e.code === "ENOENT") return emptyCache();
    throw e;
  }
}

export async function writeCache(cache: CacheFile): Promise<void> {
  await mkdir(dir, { recursive: true });
  const tmp = file + ".tmp";
  await writeFile(tmp, JSON.stringify(cache));
  await rename(tmp, file);
}
