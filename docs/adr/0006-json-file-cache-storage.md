# 0006. JSON file for cache storage

- **Status:** accepted
- **Date:** 2026-11-17
- **Deciders:** product owner, solo engineer
- **Related:** [0001](0001-synced-local-cache-with-manual-refresh.md), [design outline](../design/politician-researcher-prototype.md)

## Context

[ADR 0001](0001-synced-local-cache-with-manual-refresh.md) puts legislators in a local cache that a manual sync fills. The cache must hold the normalized records and the last-sync time. The dataset is small, a few thousand records (an estimate, TODO(verify) after the first sync). The build is solo, local-only and time-boxed.

## Decision

We store the cache in a JSON file on the backend's local disk, for simplicity in the prototype. The API reads it and the sync module writes it.

## Consequences

- **Good:** no database to install, configure or migrate. The file is easy to inspect by hand. It fits the time budget.
- **Bad:** there are no queries or indexes, so filtering and grouping run over the whole list in memory. A write that fails halfway can leave a corrupt file, so the sync should write to a temporary file and rename it. Concurrent syncs are not safe. It does not suit a larger dataset or a deployed app.
- **Follow-ups:** write the file atomically. Add the cache file to `.gitignore`, since it holds synced data and not source. Revisit SQLite if the data grows or queries get richer.

## Alternatives considered

- **SQLite:** supports queries and safer writes. Not chosen because it adds a dependency and a schema for little gain at this size.
