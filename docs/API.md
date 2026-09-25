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

| HTTP | `errorCode`           | When                                                     |
| ---- | --------------------- | -------------------------------------------------------- |
| 400  | `BAD_REQUEST`         | Malformed JSON or request                                |
| 400  | `VALIDATION_ERROR`    | Input failed validation (`details` lists each field)     |
| 401  | `UNAUTHENTICATED`     | Missing or invalid credentials                           |
| 403  | `FORBIDDEN`           | Authenticated but lacking permission                     |
| 404  | `NOT_FOUND`           | Unknown route or record                                  |
| 409  | `CONFLICT`            | Unique constraint (e.g. phone already registered)        |
| 402  | `PAYMENT_ERROR`       | Payment failed or could not be verified                  |
| 413  | `PAYLOAD_TOO_LARGE`   | Body over 100 kB                                         |
| 429  | `RATE_LIMITED`        | Too many requests (see `RateLimit` headers)              |
| 500  | `DATABASE_ERROR`      | Unexpected database error                                |
| 500  | `INTERNAL_ERROR`      | Anything unexpected (details are logged, never returned) |
| 502  | `PROVIDER_ERROR`      | An upstream supplier (airline, payment…) failed          |
| 503  | `SERVICE_UNAVAILABLE` | A dependency is down                                     |

## Endpoints (Phase 1)

| Method | Path                | Description                                                            |
| ------ | ------------------- | ---------------------------------------------------------------------- |
| GET    | `/api/health`       | Health report: version, uptime, database and Redis status (always 200) |
| GET    | `/api/health/ready` | Readiness probe: 200 when all dependencies are up, else 503            |
| GET    | `/api/health/live`  | Liveness probe: 200 while the process serves requests                  |

Health endpoints are exempt from rate limiting. The full endpoint plan (auth, flights, buses,
trains, hotels, rides, holidays, parcels, wallet, bookings, payments, offers, support, admin) is in
[IMPLEMENTATION_PLAN.md §5](IMPLEMENTATION_PLAN.md#5-api-architecture); each is documented
here as its phase ships.

## Conventions

- JSON only; request bodies up to 100 kB.
- Pagination: `?page=1&limit=20` (max 100) → `data: { items, page, limit, total }`.
- Money: integer minor units (paise) with an explicit currency.
- Mutations that move money require an `Idempotency-Key` header (from Phase 4).
