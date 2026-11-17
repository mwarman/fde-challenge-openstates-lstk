# AGENTS.md

Politician Researcher: a local prototype that syncs U.S. state legislators from the OpenStates API into a local cache and shows them in a filterable web UI. Overview: [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md). Requirements: [PRD-0001](docs/prds/PRD-0001.md). Design: [docs/design/politician-researcher-prototype.md](docs/design/politician-researcher-prototype.md). Decisions: [docs/adr/](docs/adr/README.md).

## Stack

TypeScript ESM everywhere. npm workspaces (`server`, `web`) with one lockfile at the root.

- `server/`: Express 5 API on port 3001, run with `tsx`.
- `web/`: React 19 + Vite. Vite proxies `/api` to `localhost:3001`.

## Structure

```
server/src/   API (index.ts), OpenStates client, sync, normalize, JSON cache, CLIs (sync-cli.ts, probe.ts)
web/src/      React app: App.tsx, api.ts, components/
shared/       types.ts, the server/web contract; imported by both
data/         gitignored sync output (cache.json, probe reports)
docs/         PRD, plans, ADRs, design, research
```

## Commands

Run from the repo root unless noted. Requires `OPENSTATES_API_KEY` in the root `.env` (copy `.env.example`; the server loads it from the repo root regardless of cwd).

```bash
npm install
npm run dev                  # server and web in parallel
npm run sync                 # full OpenStates sync into data/cache.json (needs key and network)
npm run probe                # measure OpenStates rate limits (needs key and network)
npm run build                # web build (tsc -b + vite build), then server typecheck
npm run typecheck -w server  # server types only
npm run lint -w web          # oxlint, web only
npm run format               # prettier --write .
```

There is no test suite and no CI. Do not invent a test command.

## Conventions

- Server relative imports use explicit `.ts` extensions (`rewriteRelativeImportExtensions`); keep that style.
- Put types used by both sides in `shared/types.ts`; do not duplicate them in `web/`.
- The API key stays on the server. Never expose it to the web bundle.
- Cache writes should be atomic (temp file + rename); concurrent syncs are unsafe: the CLI and the UI Refresh keep separate locks, so never run both at once ([ADR-0006](docs/adr/0006-json-file-cache-storage.md)).
- Formatting is Prettier; lint rules live in `web/.oxlintrc.json`. Run the tools instead of restating rules.

## Boundaries

Always:

- Run `npm run build` and `npm run lint -w web` before calling a change done.
- Read the relevant ADR before changing data scope, storage, or the sync model.

Ask first:

- Reversing any accepted ADR: manual-refresh cache (0001), real data only (0002), state legislators only (0003), Express (0005), JSON file cache (0006).
- Adding a dependency, a database, or a second data source.
- Running `sync` or `probe`; they spend rate-limited API quota.

Never:

- Create mock, fixture, hand-written, or inferred legislator records. Gaps must show as missing or failed jurisdictions ([ADR-0002](docs/adr/0002-real-synced-data-only.md)).
- Commit `.env` or `data/`, or write real key values anywhere.

## Definition of done

`npm run build` and `npm run lint -w web` pass, `npm run format` leaves no diff, and any new decision is recorded as an ADR in `docs/adr/`.
