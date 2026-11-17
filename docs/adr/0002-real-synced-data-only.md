# 0002. Show only real synced data

- **Status:** accepted
- **Date:** 2026-11-17
- **Deciders:** product owner, solo engineer
- **Related:** [0001](0001-synced-local-cache-with-manual-refresh.md), [0003](0003-state-legislators-only-from-openstates.md)

## Context

The demo's value is that it shows who the representatives are right now. If the rate limit stops a full sync, there is a temptation to fill gaps with mock or hand-written records. That would make the app look complete while showing data that is not real.

## Decision

The app shows only records that were synced from OpenStates and cached. We do not generate, mock, hand-write or infer records. A "seeded" cache means a real earlier sync. Gaps appear as missing or failed jurisdictions in the UI, not as invented rows.

## Consequences

- **Good:** every row traces back to the source. The demo is honest about coverage.
- **Bad:** a rate-limited or failed sync leaves visible holes in the demo. There are no fixtures for UI development or tests, so the engineer needs at least one real sync early.
- **Follow-ups:** show per-jurisdiction sync status and counts in the UI.

## Alternatives considered

- **Mock or fixture data for gaps:** rejected because it presents invented data as real.
- **Derive vacant seats from seat counts:** rejected because it creates data the API did not return (see [0003](0003-state-legislators-only-from-openstates.md)).
