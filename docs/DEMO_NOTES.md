# Demo notes: Politician Researcher prototype

## Run it

1. Put `OPENSTATES_API_KEY` in `.env` (see `.env.example`).
2. `npm install`, then `npm run sync` once (about 25 min, real data), then `npm run dev`.
3. Open http://localhost:5173.

## What is shown

- Table of current state legislators from OpenStates (52 jurisdictions) with name search, state and party filters, and a group-by toggle (none, party, state).
- "Last updated" time, manual Refresh with progress, per-jurisdiction sync status, and a banner when a sync is partial.
- Data comes only from real syncs. No mocks or generated rows (ADR 0002).

## Observed facts

- OpenStates `/people`: `per_page` max 50. About 10 requests, then a 429 at roughly 1 request/s, with no rate-limit headers. The sync spaces requests 7 s apart and waits 65 s after a 429.
- Full sync: 52 of 52 jurisdictions OK, about 200 requests, about 25 minutes.
- `/people` also returns executives (governors, AGs and others). They are excluded (ADR 0003, legislators only): 179 records dropped, leaving 7,417 legislators.

## Cut, and why

- Automated tests: real-data-only means no fixtures. Verified manually instead.
- Scheduled refresh, pagination, detail pages, vacant seats, Congress, auth, Docker, CI, SQLite, oxlint. See PLAN-0001 "Cuts and why".

## Known limits

- The CLI sync and the UI Refresh each hold their own lock. Do not run both at once.
- Not yet done: browser walkthrough of the UI and a spot-check of three legislators against openstates.org.
