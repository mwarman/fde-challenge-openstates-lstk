import type { Legislator, StatusResponse } from "../../shared/types";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} returned ${res.status}`);
  return res.json();
}

export const fetchLegislators = () => get<Legislator[]>("/api/legislators");
export const fetchStatus = () => get<StatusResponse>("/api/status");
export async function startRefresh(): Promise<void> {
  const res = await fetch("/api/refresh", { method: "POST" });
  if (!res.ok && res.status !== 409)
    throw new Error(`refresh returned ${res.status}`);
}
