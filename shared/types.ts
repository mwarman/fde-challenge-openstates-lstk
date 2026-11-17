export interface Legislator {
  id: string;
  name: string;
  party: string;
  jurisdiction: string; // lowercase state code, e.g. "wa"
  chamber: string; // org_classification: upper | lower | legislature
  district: string;
  title: string;
  imageUrl?: string;
  email?: string;
  openstatesUrl?: string;
}

export interface JurisdictionStatus {
  code: string;
  state: "ok" | "failed" | "pending";
  count: number;
  syncedAt?: string;
  error?: string;
}

export interface CacheFile {
  lastSyncedAt: string | null;
  legislators: Legislator[];
  jurisdictions: JurisdictionStatus[];
}

export interface SyncProgress {
  running: boolean;
  done: number;
  total: number;
  current?: string;
}

export interface StatusResponse {
  lastSyncedAt: string | null;
  jurisdictions: JurisdictionStatus[];
  totalLegislators: number;
  sync: SyncProgress;
}
