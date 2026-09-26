# API

- Base URL: `/api` (development: `http://localhost:5000/api`)
- Interactive docs: `/api/docs` (Swagger UI) and `/api/docs/openapi.json`. Enabled by default
  outside production (`ENABLE_API_DOCS`).
- The OpenAPI document is generated from the same Zod schemas the API validates with.

## Response envelope

```json
{ "success": true, "message": "Success", "data": {} }
```

```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": null,
  "details": [{ "path": "body.phone", "message": "Enter a valid 10-digit mobile number" }],
  "requestId": "0538849f-36e1-4e3d-ba46-dc6a47022590"
}
```

`requestId` matches the `X-Request-Id` response header and the server logs. Clients may send a
well-formed `X-Request-Id` (8–128 chars of `A-Z a-z 0-9 . _ -`) to correlate across services.

## Error codes

| HTTP | `errorCode`               | When                                                     |
| ---- | ------------------------- | -------------------------------------------------------- |
| 400  | `BAD_REQUEST`             | Malformed JSON or request                                |
| 400  | `VALIDATION_ERROR`        | Input failed validation (`details` lists each field)     |
| 401  | `UNAUTHENTICATED`         | Not signed in, or session expired                        |
| 401  | `INVALID_CREDENTIALS`     | Wrong mobile number/email or password                    |
| 400  | `INVALID_OTP`             | Wrong code (message says how many attempts are left)     |
| 400  | `OTP_EXPIRED`             | Code expired, already used, or too many attempts         |
| 403  | `ACCOUNT_DISABLED`        | Account suspended or deactivated                         |
| 400  | `PROVIDER_NOT_CONFIGURED` | That social sign-in is not enabled                       |
| 403  | `FORBIDDEN`               | Authenticated but lacking permission                     |
| 404  | `NOT_FOUND`               | Unknown route or record                                  |
| 409  | `CONFLICT`                | Unique constraint (e.g. phone already registered)        |
| 402  | `PAYMENT_ERROR`           | Payment failed or could not be verified                  |
| 413  | `PAYLOAD_TOO_LARGE`       | Body over 100 kB                                         |
| 429  | `RATE_LIMITED`            | Too many requests (see `RateLimit` headers)              |
| 500  | `DATABASE_ERROR`          | Unexpected database error                                |
| 500  | `INTERNAL_ERROR`          | Anything unexpected (details are logged, never returned) |
| 502  | `PROVIDER_ERROR`          | An upstream supplier (airline, payment…) failed          |
| 503  | `SERVICE_UNAVAILABLE`     | A dependency is down                                     |

## Endpoints

### System

| Method | Path                | Description                                                            |
| ------ | ------------------- | ---------------------------------------------------------------------- |
| GET    | `/api/health`       | Health report: version, uptime, database and Redis status (always 200) |
| GET    | `/api/health/ready` | Readiness probe: 200 when all dependencies are up, else 503            |
| GET    | `/api/health/live`  | Liveness probe: 200 while the process serves requests                  |

Health endpoints are exempt from rate limiting.

### Authentication

| Method | Path                              | Auth           | Description                                                                         |
| ------ | --------------------------------- | -------------- | ----------------------------------------------------------------------------------- |
| POST   | `/api/auth/send-otp`              | —              | Send a 6-digit code to a mobile number (same response for new and existing numbers) |
| POST   | `/api/auth/verify-otp`            | —              | Existing user → signed in. New number → `SIGNUP_REQUIRED` + 15-minute `signupToken` |
| POST   | `/api/auth/register`              | signup token   | Create the account (name, optional email and password) and sign in                  |
| POST   | `/api/auth/login`                 | —              | Mobile number or email + password                                                   |
| POST   | `/api/auth/social/{google,apple}` | —              | Sign in with a provider ID token (enabled when its client ID is configured)         |
| POST   | `/api/auth/refresh`               | refresh cookie | Rotate the refresh cookie, return a new access token                                |
| POST   | `/api/auth/logout`                | refresh cookie | End this device's session (idempotent)                                              |
| POST   | `/api/auth/logout-all`            | bearer         | End every session on every device                                                   |
| POST   | `/api/auth/forgot-password`       | —              | Send a reset code by SMS or email (always the same response)                        |
| POST   | `/api/auth/reset-password`        | —              | Code + new password; signs out all sessions                                         |

Every sign-in response has the shape `{ user, accessToken, expiresIn }` and sets the refresh cookie.

- **Access token**: JWT (HS256), 15 minutes, sent as `Authorization: Bearer <token>`. The web app
  keeps it in memory only.
- **Refresh token**: random 256-bit value in an `HttpOnly`, `SameSite=Lax` cookie `zp_rt` scoped to
  `/api/auth` (`Secure` in production), valid 30 days. Each use returns a new one. Replaying an old
  one is treated as theft and ends that session everywhere.
- **Development**: with `SMS_PROVIDER=console`, `send-otp` and `forgot-password` responses include
  `devCode`, and the code is printed in the API terminal. The console provider is refused in
  production.

Mobile OTP sign-up flow:

```
POST /auth/send-otp { phone }                   → { expiresIn: 300, resendIn: 60 }
POST /auth/verify-otp { phone, otp }            → { status: "SIGNUP_REQUIRED", signupToken, phone }
POST /auth/register { signupToken, fullName, email?, password? } → 201 { user, accessToken, expiresIn } + cookie
```

### Account

| Method | Path      | Auth   | Description                                       |
| ------ | --------- | ------ | ------------------------------------------------- |
| GET    | `/api/me` | bearer | The signed-in user with roles and permissions     |
| PATCH  | `/api/me` | bearer | Update profile (`fullName`); other fields ignored |

### Admin

Every `/api/admin/*` route requires `admin:access` plus its own permission.

| Method | Path               | Permission      | Description                                                                       |
| ------ | ------------------ | --------------- | --------------------------------------------------------------------------------- |
| GET    | `/api/admin/users` | `user:read:any` | Paginated users; `search` (name, phone, email), `role`, `status`, `page`, `limit` |

The full endpoint plan (flights, buses, trains, hotels, rides, holidays, parcels, wallet, bookings,
payments, offers, support, admin) is in
[IMPLEMENTATION_PLAN.md §5](IMPLEMENTATION_PLAN.md#5-api-architecture); each is documented here as
its phase ships.

### Rate limits

| Scope                                  | Limit                             | Key                      |
| -------------------------------------- | --------------------------------- | ------------------------ |
| All `/api` routes                      | 300 / minute (configurable)       | IP                       |
| `/api/auth/*` (except refresh, logout) | 60 / 10 minutes                   | IP (generous: CGNAT)     |
| Sending a code (per flow)              | 1 / minute                        | phone or email           |
| Sending a code (all flows)             | 5 / hour                          | phone or email           |
| Verifying a code                       | 20 / 15 minutes, 5 tries per code | phone or email           |
| Password login                         | 10 / 15 minutes                   | account (phone or email) |

Limits are shared across API instances through Redis. If Redis is down, requests are allowed
through; the per-code attempt limit in PostgreSQL still applies.

## Conventions

- JSON only; request bodies up to 100 kB.
- Pagination: `?page=1&limit=20` (max 100) → `data: { items, page, limit, total }`.
- Money: integer minor units (paise) with an explicit currency.
- Mutations that move money require an `Idempotency-Key` header (from Phase 4).
