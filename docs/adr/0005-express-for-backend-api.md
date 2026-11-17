# 0005. Express for the backend API

- **Status:** accepted
- **Date:** 2026-11-17
- **Deciders:** product owner, solo engineer
- **Related:** [0004](0004-typescript-on-both-ends.md), [backend framework evaluation](../research/backend-framework-eval.md)

## Context

[ADR 0004](0004-typescript-on-both-ends.md) fixed TypeScript on both ends and left the backend framework open among Hono, Express and Fastify. The build is solo, local-only and short. The criteria, all high weight, were solo build, prototype fit and familiarity. The evaluation compared Express, Hono, Fastify and NestJS and found Express and Hono close. Express leads on ecosystem familiarity, at about 200.8M weekly npm downloads against 110.7M for Hono (sources in the [evaluation](../research/backend-framework-eval.md)).

## Decision

We use Express 5 with TypeScript for the backend API. The frontend dev server proxies `/api` to it through Vite's `server.proxy`, so no CORS middleware is needed.

## Consequences

- **Good:** the most widely known framework, with official TypeScript and v5 docs. Express 5 forwards async errors to the error handler, which helps the sync and refresh routes. The Vite proxy removes the CORS setup.
- **Bad:** Express ships no types, so the project needs `@types/express` and `@types/node`. Many older tutorials target Express 4 and CommonJS and may not match an ESM project. Hono would have needed less setup.
- **Follow-ups:** run `node -v` and check the version against Express's native `.ts` run requirement (Node 22.18+). Do a short spike with `tsx watch` or `node --watch` plus the Vite proxy.

## Alternatives considered

- **Hono:** close second, with the least setup and a TypeScript template. Not chosen because it is less widely known, and its template setup was not verified.
- **Fastify:** built-in types and small code. Not chosen because it has a smaller ecosystem and the docs show a compile step.
- **NestJS:** the stack-profile default. Not chosen because of the module and controller structure, the decorator config and the high Node floor for its CLI.
