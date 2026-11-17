# 0001. Synced local cache with manual refresh

- **Status:** accepted
- **Date:** 2026-11-17
- **Deciders:** product owner, solo engineer
- **Related:** [0002](0002-real-synced-data-only.md), [design outline](../design/politician-researcher-prototype.md)

## Context

The app must show the latest representatives, because data changes after elections or when someone leaves office ([PRD-0001](../prds/PRD-0001.md)). Covering 52 jurisdictions takes many paged OpenStates requests. The free-tier quota is not published in the OpenStates docs, so it is unknown (TODO(verify): the real limits).

## Decision

We serve the UI from a local cache on the backend. A manual Refresh button starts a sync from OpenStates into that cache. The UI shows when the cache was last synced. Auto-refresh is deferred. The first build step is a probe that makes real requests to detect the rate limits, and the sync's throttling and batching are set from what it finds.

## Consequences

- **Good:** the UI is fast and does not depend on rate limits while browsing. A partial sync still leaves usable data. The API key stays on the backend.
- **Bad:** data is only as fresh as the last manual sync. The cache and sync code are extra work in a 30-minute build. A partial sync can leave some jurisdictions missing or stale, so the UI must show per-jurisdiction status.
- **Follow-ups:** write and run the rate-limit probe. Set the throttle and batch size from its results. Record the observed limits in the design outline.

## Alternatives considered

- **Live passthrough:** always fresh, but slow and likely to hit rate limits when viewing across states.
- **Static snapshot only:** simplest, but it does not meet the "latest data" need without re-running a script.
- **Auto-refresh on a timer:** deferred as not needed for the prototype.
