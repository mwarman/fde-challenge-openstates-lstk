import type { Legislator } from "../../shared/types.ts";

// Maps one OpenStates /people result. Missing fields stay empty; nothing is invented.
export function normalize(raw: any, code: string): Legislator | null {
  if (!raw?.id || !raw?.name) {
    console.warn(
      `[normalize] ${code}: skipped person with unexpected shape`,
      Object.keys(raw ?? {}),
    );
    return null;
  }
  const role = raw.current_role ?? {};
  return {
    id: raw.id,
    name: raw.name,
    party: raw.party ?? "",
    jurisdiction: code,
    chamber: role.org_classification ?? "",
    district: role.district != null ? String(role.district) : "",
    title: role.title ?? "",
    imageUrl: raw.image || undefined,
    email: raw.email || undefined,
    openstatesUrl: raw.openstates_url || undefined,
  };
}
