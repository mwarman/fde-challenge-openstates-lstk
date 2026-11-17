# 0003. State legislators only, from OpenStates

- **Status:** accepted
- **Date:** 2026-11-17
- **Deciders:** product owner, solo engineer
- **Related:** [0002](0002-real-synced-data-only.md)

## Context

The PRD asks for the representatives in the 52 jurisdictions of the United States, with data from OpenStates ([PRD-0001](../prds/PRD-0001.md)). OpenStates provides state legislators. We assume it does not cover the U.S. Congress (TODO(verify)). The time budget is 30 minutes for a first demo.

## Decision

"Representatives" means state legislators as returned by the OpenStates people endpoint for each jurisdiction. The app has one data source. Displaying vacant seats is deferred, because OpenStates lists people, not empty seats (TODO(verify)), and showing them would need derived data (see [0002](0002-real-synced-data-only.md)).

## Consequences

- **Good:** one source and one data model fit the time budget.
- **Bad:** members of Congress and other office-holders are absent. A user expecting federal representatives will not find them. Vacancies are invisible, so counts per chamber can look short.
- **Follow-ups:** state the scope in the UI. Revisit vacant seats and Congress if a second source is wanted.

## Alternatives considered

- **Also include governors and executives:** more scope without a stated need.
- **Also include U.S. Congress:** needs a second data source and a merge model, which does not fit in 30 minutes.
- **Show vacant seats now:** deferred, as it is not a cheap change.
