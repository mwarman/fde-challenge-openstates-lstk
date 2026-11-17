# 0004. TypeScript on both ends

- **Status:** accepted
- **Date:** 2026-11-17
- **Deciders:** product owner, solo engineer
- **Related:** [design outline](../design/politician-researcher-prototype.md)

## Context

The PRD requires a React or Angular single-page app and leaves the backend open ([PRD-0001](../prds/PRD-0001.md)). The repo is empty and states no stack. The app is local-only and the build is solo and short.

## Decision

We use TypeScript for the whole app. The frontend is Vite + React. The backend is a small Node/TypeScript API, with the framework (Hono, Express or Fastify) left to the engineer. The OpenStates API key is read from a git-ignored `.env` file and used only by the backend. We do not use NestJS, Lambda or CDK, because nothing is deployed.

## Consequences

- **Good:** one language and one toolchain, with shared types between sync, API and UI.
- **Bad:** the stack defaults for NestJS and AWS go unused, so a later move to deployment needs more work.
- **Follow-ups:** pick the backend framework when scaffolding. No ADR is needed unless the choice becomes costly to reverse.

## Alternatives considered

- **Different backend language, such as Python with FastAPI:** not chosen. The user accepted TypeScript on both ends.
- **Angular frontend:** not chosen. React is the stack default.
- **NestJS backend:** too heavy for a local prototype.
