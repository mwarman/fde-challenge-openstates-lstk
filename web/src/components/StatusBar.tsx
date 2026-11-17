import type { StatusResponse } from "../../../shared/types";

export function StatusBar({
  status,
  onRefresh,
}: {
  status: StatusResponse;
  onRefresh: () => void;
}) {
  const { sync, jurisdictions } = status;
  const ok = jurisdictions.filter((j) => j.state === "ok");
  const missing = jurisdictions.filter((j) => j.state !== "ok");
  const showPartial =
    !sync.running && status.totalLegislators > 0 && missing.length > 0;
  return (
    <section>
      <div className="statusbar">
        <span>
          Last updated:{" "}
          {status.lastSyncedAt
            ? new Date(status.lastSyncedAt).toLocaleString()
            : "Never synced"}
        </span>
        <button onClick={onRefresh} disabled={sync.running}>
          {sync.running
            ? `Syncing ${sync.done}/${sync.total}${sync.current ? ` (${sync.current})` : ""}…`
            : "Refresh"}
        </button>
      </div>
      <p className="note">
        State legislators from OpenStates. Vacant seats are not shown.
      </p>
      {showPartial && (
        <div className="banner warn">
          {ok.length} of {jurisdictions.length} jurisdictions synced. Missing:{" "}
          {missing.map((j) => j.code.toUpperCase()).join(", ")}
        </div>
      )}
      <details>
        <summary>Sync status by jurisdiction</summary>
        <ul className="jur">
          {jurisdictions.map((j) => (
            <li
              key={j.code}
              className={j.state}
              title={j.error ?? j.syncedAt ?? "not synced"}
            >
              {j.code.toUpperCase()} {j.state === "ok" ? j.count : j.state}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
