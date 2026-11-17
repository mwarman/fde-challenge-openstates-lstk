import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { osGet } from "./openstates.ts";

const dataDir = fileURLToPath(new URL("../../data/", import.meta.url));
await mkdir(dataDir, { recursive: true });
const interesting = (h: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(h).filter(([k]) =>
      /retry|ratelimit|rate-limit|x-request/i.test(k),
    ),
  );

const report: Record<string, unknown> = {};

// 1. sample
const sample = await osGet("/people", {
  jurisdiction: "wa",
  per_page: 50,
  page: 1,
});
console.log("sample status", sample.status, sample.ms + "ms");
if (sample.status === 401 || sample.status === 403) {
  console.error("Key rejected. Stop and check .env.");
  process.exit(1);
}
await writeFile(
  dataDir + "probe-sample.json",
  JSON.stringify(sample.json, null, 2),
);
report.sample = {
  status: sample.status,
  headers: interesting(sample.headers),
  pagination: sample.json?.pagination,
  resultCount: sample.json?.results?.length,
  firstResultKeys:
    sample.json?.results?.[0] && Object.keys(sample.json.results[0]),
};

// 2. per_page limits
const perPage: Record<number, unknown> = {};
for (const n of [100, 200]) {
  const r = await osGet("/people", {
    jurisdiction: "wa",
    per_page: n,
    page: 1,
  });
  perPage[n] = {
    status: r.status,
    count: r.json?.results?.length,
    detail: r.status >= 400 ? r.json : undefined,
  };
}
report.perPage = perPage;

// 3. dc and pr
const jur: Record<string, unknown> = {};
for (const code of ["dc", "pr"]) {
  const r = await osGet("/people", { jurisdiction: code, per_page: 1 });
  jur[code] = {
    status: r.status,
    total: r.json?.pagination?.total_items,
    detail: r.status >= 400 ? r.json : undefined,
  };
}
report.jurisdictions = jur;

// 4. bursts: sequential at 1000ms, then 250ms, stop on first 429 or 20 requests
const burst: unknown[] = [];
for (const delay of [1000, 250]) {
  for (let i = 0; i < 10; i++) {
    const r = await osGet("/people", { jurisdiction: "or", per_page: 1 });
    burst.push({
      delay,
      status: r.status,
      ms: r.ms,
      headers: interesting(r.headers),
    });
    if (r.status === 429) break;
    await new Promise((res) => setTimeout(res, delay));
  }
  if ((burst.at(-1) as any).status === 429) break;
}
report.burst = burst;

await writeFile(dataDir + "probe-report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
