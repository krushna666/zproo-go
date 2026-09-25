# Testing

```bash
npm run test          # every workspace (Turborepo)
npm run test -w @zproo/api
npm run test -w @zproo/web
```

| Workspace             | Runner                           | What is covered                                                                                                                                                                                                                                                                                        |
| --------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/api`            | Vitest + Supertest               | Health/ready/live (up, degraded, timeout), 404 envelope, malformed/oversized JSON, request-ID propagation, security headers, CORS allow/deny, rate limiting, Swagger on/off, env validation, error mapping (Zod, Prisma, unknown), `validate()` middleware, log redaction, shared enums = Prisma enums |
| `apps/web`            | Vitest + Testing Library (jsdom) | Real route tree: home, planned pages, auth layout, admin shell, 404s, quick search → navigation; Logo asset/aspect ratio; HTTP error normalisation                                                                                                                                                     |
| `packages/utils`      | Vitest                           | Paise arithmetic and INR formatting, booking reference generation, validation and normalisation                                                                                                                                                                                                        |
| `packages/validation` | Vitest                           | Mobile number normalisation, email, password, OTP, pagination                                                                                                                                                                                                                                          |

API tests build the app with `createApp()` and fake dependency checks, so they need no database
or Redis. The Prisma client must be generated (`npm install` does this).

## CI

`.github/workflows/ci.yml` runs on every pull request: install → format check → lint →
typecheck → migrate a fresh Postgres → verify the schema matches the migrations → seed → test →
build. Any failure blocks the PR.

## Coming next

- Phase 2: auth integration tests against a real Postgres + Redis (OTP, login, refresh rotation, RBAC).
- Phase 20: Playwright end-to-end journeys (signup → OTP → search → book → pay → ticket for flights,
  buses, trains, hotels, cabs, wallet) added to CI.
