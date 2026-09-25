# Security

This document tracks controls that are **implemented**. Planned controls for later phases (JWT
rotation, RBAC middleware, payment signature checks, webhook dedupe, encryption of partner
credentials) are specified in [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and move here
as they ship.

## Implemented (Phase 1)

| Area                | Control                                                                                                                                                                                                                                                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Configuration       | Zod-validated env at boot; production refuses to start without distinct ≥32-char JWT secrets; config errors never print values                                                                                                                                                                                                                              |
| Secrets             | `.env` git-ignored; only `VITE_*` values reach the browser; no secrets in the repo                                                                                                                                                                                                                                                                          |
| HTTP headers        | Helmet: `default-src 'none'` CSP for JSON responses (relaxed only under `/api/docs`), HSTS, `nosniff`, `frame-ancestors 'none'`, same-site CORP; `X-Powered-By` removed                                                                                                                                                                                     |
| CORS                | Explicit origin allowlist (`CORS_ORIGINS`), credentials allowed only for listed origins                                                                                                                                                                                                                                                                     |
| Rate limiting       | Per-IP limit on `/api` with standard `RateLimit` headers (in-memory now; Redis-backed with per-route OTP/login limits in Phase 2)                                                                                                                                                                                                                           |
| Input               | JSON bodies capped at 100 kB; malformed JSON → 400; `validate()` middleware with shared Zod schemas                                                                                                                                                                                                                                                         |
| Errors              | Unknown errors return a generic message and `INTERNAL_ERROR`; stack traces and internals are only logged                                                                                                                                                                                                                                                    |
| SQL injection       | Prisma parameterised queries only; raw SQL must use tagged templates (`$queryRaw\`…\``)                                                                                                                                                                                                                                                                     |
| Logging             | Structured JSON (Pino) with request ID, method, path, status and duration. Query strings are dropped (PII). Redacted: `authorization`, `cookie`, `set-cookie`, Razorpay signature, and any `password`, `passwordHash`, `otp`, `otpCode`, `token`, `accessToken`, `refreshToken`, `secret`, `signature`, `cardNumber`, `cvv` field. A test asserts redaction |
| Data at rest        | Schema stores only hashes of refresh tokens and OTPs                                                                                                                                                                                                                                                                                                        |
| Authorization model | Permission keys and role grants are defined once in `@zproo/types` and seeded into the DB; the API will enforce them server-side (the web UI only hides controls)                                                                                                                                                                                           |
| Web                 | React escapes output by default; no `dangerouslySetInnerHTML`; admin routes are `noindex` and disallowed in `robots.txt`                                                                                                                                                                                                                                    |

## Dependency audit

`npm audit` reports one **low** advisory at the time of writing:

- `esbuild` < 0.28.1 (pulled in by `tsup` 8.5): the esbuild _development server_ on Windows can
  serve arbitrary files (GHSA-g7r4-m6w7-qqqr). We only use esbuild to bundle the API, never its
  dev server, so it isn't exploitable here. It goes away when `tsup` updates its esbuild range.

A high-severity `deepmerge-ts` advisory in Prisma's CLI config loader is resolved by an npm
`overrides` entry (`deepmerge-ts@^8`) in the root `package.json`.

## Reporting

Report suspected vulnerabilities privately to the maintainers. Do not open public issues for
security problems.
