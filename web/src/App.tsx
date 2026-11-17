import { useCallback, useEffect, useMemo, useState } from "react";
import type { Legislator, StatusResponse } from "../../shared/types";
import { fetchLegislators, fetchStatus, startRefresh } from "./api";
import { StatusBar } from "./components/StatusBar";
import { Filters, type FilterState } from "./components/Filters";
import { LegislatorTable, type GroupBy } from "./components/LegislatorTable";

export default function App() {
  const [legislators, setLegislators] = useState<Legislator[]>([]);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    name: "",
    state: "",
    party: "",
  });
  const [groupBy, setGroupBy] = useState<GroupBy>("none");

  const load = useCallback(async () => {
    try {
      const [l, s] = await Promise.all([fetchLegislators(), fetchStatus()]);
      setLegislators(l);
      setStatus(s);
      setError(null);
    } catch (e) {
      setError(
        `Cannot reach the backend (${(e as Error).message}). Is it running?`,
      );
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const syncing = status?.sync.running ?? false;
  useEffect(() => {
    if (!syncing) return;
    const t = setInterval(async () => {
      try {
        const s = await fetchStatus();
        setStatus(s);
        if (!s.sync.running) setLegislators(await fetchLegislators());
      } catch (e) {
        setError(`Lost the backend (${(e as Error).message}).`);
      }
    }, 2000);
    return () => clearInterval(t);
  }, [syncing]);

  const refresh = async () => {
    try {
      await startRefresh();
      setStatus(await fetchStatus());
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const states = useMemo(
    () => [...new Set(legislators.map((l) => l.jurisdiction))].sort(),
    [legislators],
  );
  const parties = useMemo(
    () => [...new Set(legislators.map((l) => l.party).filter(Boolean))].sort(),
    [legislators],
  );
  const filtered = useMemo(() => {
    const q = filters.name.trim().toLowerCase();
    return legislators.filter(
      (l) =>
        (!q || l.name.toLowerCase().includes(q)) &&
        (!filters.state || l.jurisdiction === filters.state) &&
        (!filters.party || l.party === filters.party),
    );
  }, [legislators, filters]);

  return (
    <main>
      <h1>State Legislators</h1>
      {error && <div className="banner error">{error}</div>}
      {status && <StatusBar status={status} onRefresh={refresh} />}
      {legislators.length === 0 && status && !syncing ? (
        <p className="empty">
          No data yet. Click Refresh to sync from OpenStates.
        </p>
      ) : (
        <>
          <Filters
            value={filters}
            onChange={setFilters}
            states={states}
            parties={parties}
            groupBy={groupBy}
            onGroupBy={setGroupBy}
          />
          <p className="count">
            {filtered.length} of {legislators.length} legislators
          </p>
          <LegislatorTable rows={filtered} groupBy={groupBy} />
        </>
      )}
    </main>
  );
}
