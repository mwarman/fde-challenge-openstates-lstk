import type { Legislator } from "../../../shared/types";

export type GroupBy = "none" | "party" | "state";

const byName = (a: Legislator, b: Legislator) => a.name.localeCompare(b.name);

function Row({ l }: { l: Legislator }) {
  return (
    <tr>
      <td>
        {l.openstatesUrl ? (
          <a href={l.openstatesUrl} target="_blank" rel="noreferrer">
            {l.name}
          </a>
        ) : (
          l.name
        )}
      </td>
      <td>{l.party}</td>
      <td>{l.jurisdiction.toUpperCase()}</td>
      <td>{l.chamber}</td>
      <td>{l.district}</td>
      <td>{l.title}</td>
    </tr>
  );
}

export function LegislatorTable({
  rows,
  groupBy,
}: {
  rows: Legislator[];
  groupBy: GroupBy;
}) {
  const sorted = [...rows].sort(byName);
  const groups = new Map<string, Legislator[]>();
  if (groupBy !== "none") {
    for (const l of sorted) {
      const key =
        (groupBy === "party" ? l.party : l.jurisdiction.toUpperCase()) ||
        "(none)";
      groups.set(key, [...(groups.get(key) ?? []), l]);
    }
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Party</th>
          <th>State</th>
          <th>Chamber</th>
          <th>District</th>
          <th>Title</th>
        </tr>
      </thead>
      {groupBy === "none" ? (
        <tbody>
          {sorted.map((l) => (
            <Row key={l.id} l={l} />
          ))}
        </tbody>
      ) : (
        [...groups.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, ls]) => (
            <tbody key={key}>
              <tr className="group">
                <th colSpan={6}>
                  {key} ({ls.length})
                </th>
              </tr>
              {ls.map((l) => (
                <Row key={l.id} l={l} />
              ))}
            </tbody>
          ))
      )}
    </table>
  );
}
