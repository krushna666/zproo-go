# Testing

```bash
npm run test          # every workspace (Turborepo)
npm run test -w @zproo/api
npm run test -w @zproo/web
```

| Workspace             | Runner                                      | What is covered                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api` (platform) | Vitest + Supertest                          | Health/ready/live (up, degraded, timeout), 404 envelope, malformed/oversized JSON, request-ID propagation, security headers, CORS allow/deny, rate limiting, Swagger on/off and coverage, env validation, error mapping (Zod, Prisma, unknown), `validate()` middleware, log redaction, shared enums = Prisma enums                                                                                                                                                                                                                                                                      |
| `apps/api` (auth)     | Vitest + Supertest, real PostgreSQL + Redis | OTP sign-up/sign-in, wrong/expired/reused/superseded codes, attempt lockout, resend cooldown, enumeration-safe responses, register conflicts, argon2id storage, password login (phone/email), per-account lockout, suspended accounts, password reset by SMS and email (revokes sessions), refresh rotation, reuse detection revoking the session, logout/logout-all, forged/expired/wrong-audience JWTs, Google/Apple sign-in and account linking, OIDC verification, `/me`, admin RBAC (customer 403, operator 403, support 200, client-claimed roles ignored), Redis rate-limit store |
| `apps/web`            | Vitest + Testing Library (jsdom)            | Real route tree: home, planned pages, admin shell, 404s, quick search; route guards (login redirect with `next`, 403, loading state, signed-in redirect, every account page protected); full sign-up (phone → OTP → profile), OTP sign-in, validation, wrong code, password login and errors, off-site redirect blocked, password reset; token refresh single-flight, session restore, 401 → refresh → retry once; OTP input (typing, paste); Logo; HTTP errors                                                                                                                          |
| `packages/utils`      | Vitest                                      | Paise arithmetic and INR formatting, booking reference generation, validation and normalisation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `packages/validation` | Vitest                                      | Mobile number normalisation, email, password, OTP, pagination                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

API tests need **PostgreSQL and Redis** running (`npm run db:up`, or local services). They use a
separate database, `zproo_test`, which is created, migrated and loaded with reference data
automatically before each run (`apps/api/test/globalSetup.ts`), and truncated between tests. The
setup refuses to run against a database whose URL does not contain `test`. Override with
`TEST_DATABASE_URL` / `TEST_REDIS_URL`. Test files run one at a time because they share the database.

External providers are replaced by fakes (`test/helpers.ts`): SMS and email providers record
messages so tests read the real OTP, and a fake identity verifier stands in for Google. The real
OIDC verifier is tested against a local JWKS server with genuinely signed tokens.

## CI

`.github/workflows/ci.yml` runs on every pull request: install → format check → lint →
typecheck → migrate a fresh Postgres → verify the schema matches the migrations → seed → test →
build. Any failure blocks the PR.

## Coming next

- Phase 20: Playwright end-to-end journeys (signup → OTP → search → book → pay → ticket for flights,
  buses, trains, hotels, cabs, wallet) added to CI.
