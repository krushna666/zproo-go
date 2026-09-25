# Environment variables

One `.env` file at the repository root is read by the API, Prisma and Vite. Copy
`.env.example` to start. `.env` is git-ignored. Never commit it.

- The API validates its variables at startup (`apps/api/src/config/env.ts`) and exits with a
  list of the invalid **names** (never values).
- `KEY=` with nothing after it means "not set".
- Only variables prefixed `VITE_` reach the browser. **Never put a secret in a `VITE_` variable.**

## API: active from Phase 1

| Variable               | Required | Default                 | Notes                                                          |
| ---------------------- | -------- | ----------------------- | -------------------------------------------------------------- |
| `NODE_ENV`             | no       | `development`           | `development` · `test` · `production`                          |
| `PORT`                 | no       | `5000`                  |                                                                |
| `LOG_LEVEL`            | no       | `info`                  | `fatal`…`trace`, `silent`                                      |
| `APP_VERSION`          | no       | `0.1.0`                 | Reported by `/api/health`; set from the release tag            |
| `DATABASE_URL`         | **yes**  |                         | `postgres://` or `postgresql://` (pooled URL on Supabase/Neon) |
| `DIRECT_DATABASE_URL`  | no       |                         | Direct URL for migrations (Supabase/Neon)                      |
| `REDIS_URL`            | **yes**  |                         | `redis://` or `rediss://` (TLS)                                |
| `FRONTEND_URL`         | no       | `http://localhost:5173` | Used in links and as the default CORS origin                   |
| `CORS_ORIGINS`         | no       | `FRONTEND_URL`          | Comma-separated allowlist                                      |
| `TRUST_PROXY`          | no       | `0`                     | Proxy hops in front of the API (for correct client IPs)        |
| `RATE_LIMIT_WINDOW_MS` | no       | `60000`                 |                                                                |
| `RATE_LIMIT_MAX`       | no       | `300`                   | Requests per IP per window                                     |
| `ENABLE_API_DOCS`      | no       | on outside production   | Swagger UI at `/api/docs`                                      |
| `JWT_SECRET`           | prod     |                         | ≥ 32 chars. Required in production (used from Phase 2)         |
| `JWT_REFRESH_SECRET`   | prod     |                         | ≥ 32 chars, must differ from `JWT_SECRET`                      |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

## API: reserved for later phases

These appear in `.env.example` so the full configuration surface is visible. Each is validated
from the phase that starts using it.

| Phase         | Variables                                                                                                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2 Auth        | `JWT_ACCESS_TTL`, `REFRESH_TOKEN_TTL_DAYS`, `COOKIE_DOMAIN`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `SMS_PROVIDER`, `SMS_API_KEY` |
| 4–7 Suppliers | `FLIGHT_PROVIDER`, `BUS_PROVIDER`, `TRAIN_PROVIDER`, `HOTEL_PROVIDER` (`mock` until real adapters exist)                                           |
| 8 Maps        | `MAP_PROVIDER`, `GOOGLE_MAPS_API_KEY`, `MAPBOX_ACCESS_TOKEN`                                                                                       |
| 14 Payments   | `PAYMENT_PROVIDER`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`                                                            |
| 16 Email      | `EMAIL_PROVIDER`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `RESEND_API_KEY`                                           |
| 18 Partners   | `ENCRYPTION_KEY`                                                                                                                                   |

## Web (public)

| Variable               | Default        | Notes                                                 |
| ---------------------- | -------------- | ----------------------------------------------------- |
| `VITE_API_URL`         | `/api`         | Empty in development → Vite proxies `/api` to the API |
| `VITE_SITE_URL`        | current origin | Absolute URL for canonical links and social cards     |
| `VITE_GOOGLE_MAPS_KEY` |                | Phase 8. Browser key **restricted by HTTP referrer**  |
| `VITE_RAZORPAY_KEY_ID` |                | Phase 14. Public key ID only, never the secret        |
