# Database

PostgreSQL 16 via Prisma 6. Works with local Postgres, Supabase and Neon.

## Conventions

- Tables and columns are `snake_case` in SQL (`@@map`/`@map`); models and fields are camelCase in code.
- Primary keys: `cuid` strings (not guessable or enumerable).
- Money: integer minor units (paise), never floating point.
- Timestamps: `created_at`, `updated_at`; `deleted_at` for soft deletion (users, addresses, and
  later bookings and inventory). Queries must filter `deleted_at IS NULL`.
- Every foreign key and every column used for filtering or sorting is indexed.
- Secrets are never stored in plain text: refresh tokens and OTPs are stored as hashes; partner API
  credentials will be encrypted (AES-GCM).

## Connection strings

| Provider | `DATABASE_URL`                                         | `DIRECT_DATABASE_URL`             |
| -------- | ------------------------------------------------------ | --------------------------------- |
| Local    | `postgresql://…@localhost:5432/zproo_go`               | same as `DATABASE_URL`            |
| Supabase | Transaction pooler URL (port 6543) + `?pgbouncer=true` | Direct connection URL (port 5432) |
| Neon     | Pooled URL (`-pooler` host)                            | Direct (non-pooled) URL           |

Prisma uses `DIRECT_DATABASE_URL` for migrations and `DATABASE_URL` at runtime.

## Phase 1 schema (identity & platform)

| Table              | Purpose                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------- |
| `users`            | Customers, staff, drivers, partners. Unique `phone` (E.164) and `email` (lower-cased).  |
| `roles`            | The nine system roles (`USER` … `CORPORATE_ADMIN`)                                      |
| `permissions`      | `resource:action[:scope]` keys, e.g. `booking:read:any`                                 |
| `user_roles`       | User ↔ role, with who assigned it                                                       |
| `role_permissions` | Role ↔ permission                                                                       |
| `refresh_tokens`   | Hashed refresh tokens with rotation chain (`family_id`, `replaced_by_id`)               |
| `otp_codes`        | Hashed OTPs with purpose, channel, attempts and expiry                                  |
| `auth_identities`  | Linked Google / Apple accounts                                                          |
| `addresses`        | Saved addresses with optional coordinates                                               |
| `audit_logs`       | Append-only log of security and admin actions (actor, entity, before/after, request ID) |
| `system_settings`  | Admin-editable runtime settings (JSON values)                                           |

The roles and permissions come from `@zproo/types` (`Permission`, `ROLE_PERMISSIONS`), the same
constants the API checks against. `npm run db:seed` syncs them, so code and database cannot drift.
A test in `apps/api` asserts the shared enums equal the Prisma enums.

Soft-deleted users keep their unique `phone`/`email`. Account deletion (Phase 2) anonymises
those fields so the number can be registered again.

## Workflow

```bash
npm run db:migrate -- --name add_flights   # create + apply a migration in development
npm run db:deploy                          # apply pending migrations (CI / production)
npm run db:seed                            # idempotent seed
npm run db:studio                          # browse data
```

CI applies all migrations to a fresh database, checks that the result matches
`schema.prisma` exactly, and runs the seed.

## Upcoming models

Each phase adds its models in its own migration. The full model plan (bookings, flights, buses,
trains, hotels, rides, parcels, holidays, corporate, wallet, payments, refunds, offers,
notifications, support, partners) is in
[IMPLEMENTATION_PLAN.md §3–4](IMPLEMENTATION_PLAN.md#3-database-erd-plan). The large demo
dataset (100 users, 30 flights, …) grows with those phases.
