import "./env.ts";

const BASE = "https://v3.openstates.org";

export interface OsResponse<T = any> {
  status: number;
  headers: Record<string, string>;
  json: T | null;
  ms: number;
}

export async function osGet<T = any>(
  path: string,
  params: Record<string, string | number> = {},
): Promise<OsResponse<T>> {
  const key = process.env.OPENSTATES_API_KEY;
  if (!key) throw new Error("OPENSTATES_API_KEY is not set (see .env.example)");
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params))
    url.searchParams.set(k, String(v));
  const start = Date.now();
  const res = await fetch(url, { headers: { "X-API-KEY": key } });
  const text = await res.text();
  let json: T | null = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON body */
  }
  const headers: Record<string, string> = {};
  res.headers.forEach((v, k) => (headers[k] = v));
  return { status: res.status, headers, json, ms: Date.now() - start };
}
