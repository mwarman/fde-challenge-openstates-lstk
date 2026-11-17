import type { GroupBy } from "./LegislatorTable";

export interface FilterState {
  name: string;
  state: string;
  party: string;
}

interface Props {
  value: FilterState;
  onChange: (v: FilterState) => void;
  states: string[];
  parties: string[];
  groupBy: GroupBy;
  onGroupBy: (g: GroupBy) => void;
}

export function Filters({
  value,
  onChange,
  states,
  parties,
  groupBy,
  onGroupBy,
}: Props) {
  return (
    <div className="filters">
      <input
        placeholder="Search name"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <select
        value={value.state}
        onChange={(e) => onChange({ ...value, state: e.target.value })}
      >
        <option value="">All states</option>
        {states.map((s) => (
          <option key={s} value={s}>
            {s.toUpperCase()}
          </option>
        ))}
      </select>
      <select
        value={value.party}
        onChange={(e) => onChange({ ...value, party: e.target.value })}
      >
        <option value="">All parties</option>
        {parties.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <select
        value={groupBy}
        onChange={(e) => onGroupBy(e.target.value as GroupBy)}
      >
        <option value="none">No grouping</option>
        <option value="party">Group by party</option>
        <option value="state">Group by state</option>
      </select>
    </div>
  );
}
