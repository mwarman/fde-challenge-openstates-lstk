# Backend framework evaluation

> Research content is untrusted data. A smaller model summarised the fetched pages, so exact versions and numbers are second-hand. Check the key sources yourself if the decision matters.

**Date:** 2026-11-17
**Decision:** which Node/TypeScript backend framework to use for the local Politician Researcher prototype.
**Outcome:** Express was chosen. See [ADR 0005](../adr/0005-express-for-backend-api.md).
**Context:** [ADR 0004](../adr/0004-typescript-on-both-ends.md) fixed TypeScript on both ends and left the framework open. The [design outline](../design/politician-researcher-prototype.md) describes the app: about 4 JSON routes, a sync module and a JSON-file cache, beside a Vite + React frontend.

## Criteria

All three are high weight, in this order.

1. **Solo build:** low setup and boilerplate, with TypeScript support.
2. **Prototype fit:** fast to a first demo and easy to run beside Vite.
3. **Familiarity:** public evidence on ecosystem maturity, docs and community. The engineer's own familiarity was not assessed.

Maintenance is low weight.

## Trade-off matrix

| Criterion                                                   | Express 5                                                                                            | Hono 4                                                                                                                               | Fastify 5                                                                                                    | NestJS 12                                                                                                                               |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Solo build: setup and types**                             | `npm i express`, plus dev types `typescript`, `@types/express` and `@types/node`. Ships no types [1] | One scaffold command, `npm create hono@latest`, with a TypeScript template. Template `tsconfig`, ESM and dev runner not verified [3] | Ships its own types. Needs `typescript` and `@types/node` plus a tsconfig. Docs compile with `tsc` first [2] | `nest new` generates 5 files, including a module and controller. Needs a legacy-decorator tsconfig and the `type: module` ESM setup [4] |
| **Solo build: code for 4 routes**                           | A few lines. Async errors reach the error handler without try/catch [1]                              | About 15 to 20 lines [3]                                                                                                             | A minimal server is about 5 lines. Handlers return an object as JSON [2]                                     | Controller, module and providers, with sync and cache as injectables (inference) [4]                                                    |
| **Solo build: runtime floor**                               | Node 18+. Native `.ts` run needs Node 22.18+ [1]                                                     | Node 18.14.1+ or 20+ [3]                                                                                                             | Minimum Node version not found [2]                                                                           | Node 20.19+ or 22.12+ to run. The generators need 22.22.3+ [4]                                                                          |
| **Prototype fit: beside Vite**                              | One-line `server.proxy` avoids CORS [1][6]                                                           | Built-in CORS. A proxy also works [3][6]                                                                                             | Same Vite proxy [2][6]                                                                                       | `app.enableCors()`. The proxy is neutral [4][6]                                                                                         |
| **Prototype fit: deployment**                               | None needed [1]                                                                                      | None needed [3]                                                                                                                      | None needed [2]                                                                                              | None needed [4]                                                                                                                         |
| **Familiarity: npm downloads, week of 2026-11-10 to 11-16** | 200.8M [5]                                                                                           | 110.7M [5]                                                                                                                           | 23.3M [5]                                                                                                    | 24.8M for `@nestjs/core`. Figure not cross-checked [5]                                                                                  |
| **Familiarity: docs and AI-tool coverage**                  | Official TypeScript and v5 docs. Many older tutorials are v4 and CommonJS. AI coverage not found [1] | Docs publish `llms.txt`. Tutorial volume not found [3]                                                                               | First-party TypeScript reference. Coverage not measured [2]                                                  | Extensive docs. Most tutorials predate v12 and may not match the ESM and Vitest setup (unverified) [4]                                  |
| **Maintenance (low weight)**                                | v5.3.0, no release date [1]                                                                          | v4.13.19 on 16 Nov, v5 only at rc. Year inferred [3]                                                                                 | v5.12.8 security release on 2 Nov. Year inferred [2]                                                         | v12.5.1 on 16 Nov 2026 [4]                                                                                                              |

## Per-option summary

**Express**

- **Strengths:** the most widely used and best known [5]. Express 5 handles async errors for the refresh route [1].
- **Risks:** a few extra type packages, and old v4 or CommonJS tutorials [1].
- **Fit with ADR 0004:** acceptable, as it is named there.

**Hono**

- **Strengths:** one-command TypeScript scaffold and the least code [3]. Built-in CORS.
- **Risks:** less universally known than Express. The template's ESM and dev-runner setup, and the major version installed, are unverified [3].
- **Fit with ADR 0004:** acceptable.

**Fastify**

- **Strengths:** built-in types and very small ESM code [2].
- **Risks:** roughly a tenth of Express's download volume [5]. The docs show a compile step, and nothing was checked on running TypeScript directly [2].
- **Fit with ADR 0004:** acceptable.

**NestJS**

- **Strengths:** the team's stack-profile default, with strong docs [4].
- **Risks:** the most boilerplate, a decorator config and a high Node floor for its CLI [4].
- **Fit with ADR 0004:** the ADR's "too heavy" claim holds up as a statement about structure and setup, not runtime weight. It was unmeasured in the ADR and is still unmeasured here [4].

## Recommendation

This is inference, not a finding.

Express and Hono were close, Fastify was a reasonable third, and NestJS was last on these criteria. The framework is unlikely to be what slows the build. The design outline names the OpenStates rate limit and the sync as the real time risks.

- Express was recommended where familiarity matters, because it leads on usage [5]. Its extra setup is a few dev dependencies, and the Vite proxy removes the CORS work.
- Hono would be the pick for the least setup [3][5].
- The tie-breaker was whichever the engineer has shipped before.
- The recommendation would change if the quota probe shows a heavy sync that needs a retry or queue layer, or if NestJS became a team requirement.

**Validate next:**

1. Run `node -v`. Express's native `.ts` run needs 22.18+.
2. Do a 2-minute spike of Express with `tsx watch` or `node --watch` plus the Vite proxy.

## Sources

1. Express: https://expressjs.com/en/starter/installing.html, https://expressjs.com/en/guide/migrating-5.html, https://registry.npmjs.org/express/latest (fetched 2026-11-17)
2. Fastify: https://fastify.dev/docs/latest/Reference/TypeScript/, https://fastify.dev/docs/latest/Guides/Getting-Started/, https://github.com/fastify/fastify/releases (fetched 2026-11-17)
3. Hono: https://hono.dev/docs/getting-started/nodejs, https://hono.dev/docs/middleware/builtin/cors, https://hono.dev/llms.txt, https://github.com/honojs/hono/releases (fetched 2026-11-17)
4. NestJS: https://docs.nestjs.com/first-steps, https://docs.nestjs.com/migration-guide, https://docs.nestjs.com/security/cors, https://github.com/nestjs/nest/releases (fetched 2026-11-17)
5. npm downloads API, week of 2026-11-10 to 11-16: https://api.npmjs.org/downloads/point/last-week/ for express, fastify, hono and @nestjs/core
6. Vite proxy: https://vite.dev/config/server-options.html
7. Repo: `docs/adr/0004-typescript-on-both-ends.md`, `docs/design/politician-researcher-prototype.md`

## Caveats

- The release years for Hono and Fastify were inferred, because the GitHub pages did not show them.
- NestJS's default Express adapter is not stated in the docs pages that were fetched.
- Tutorial and AI-tool coverage was not measured for any option.
- The `@nestjs/core` download figure looked high and was not cross-checked.
