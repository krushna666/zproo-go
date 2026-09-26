<p align="center">
  <img src="apps/web/public/assets/brand/zproo-go-logo.png" alt="ZPROO GO" height="56" />
</p>

<h3 align="center">Unified Mobility & Travel Super App</h3>
<p align="center"><em>Travel Smarter. Go Further.</em></p>

---

ZPROO GO brings flights, buses, trains, hotels, cabs, bike taxis, holidays, parcel delivery and
corporate travel into one platform: a customer website, an admin panel, a REST + real-time API,
and a PostgreSQL database.

> **Status: Phase 5 (buses) complete.** Buses across Maharashtra and India: search, filters, a
> live seat map (sleeper and seater, both decks, ladies seats), boarding and dropping points, and
> the same secure booking, payment and e-ticket flow as flights. Phase 4 (flights): Flights can be searched, filtered, booked and paid for end
> to end: one way, round trip and multi-city search, seat holds, idempotent booking, verified
> payment (simulated gateway in development), PNR and a PDF e-ticket. Development uses a mock
> timetable with fictional airlines. Travel modules land phase by phase; see
> [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md).

## Tech stack

| Layer   | Technology                                                                                                                   |
| ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Web     | React 19, TypeScript, Vite, React Router, TanStack Query, Zustand, Axios, Tailwind CSS 4, shadcn/ui-style primitives, Lucide |
| API     | Node.js, Express 5, TypeScript, Zod, Pino, Helmet, OpenAPI (Swagger UI)                                                      |
| Data    | PostgreSQL + Prisma, Redis                                                                                                   |
| Tooling | npm workspaces, Turborepo, ESLint, Prettier, Vitest, Testing Library, Supertest, GitHub Actions                              |

## Repository layout

```
apps/
  web/        Customer website + admin panel (/admin), React + Vite
  api/        REST API (Express), health checks, OpenAPI docs
packages/
  config/     Shared tsconfig presets and brand constants
  types/      Shared enums, API envelope types, permission keys
  validation/ Shared Zod schemas (used by web forms and API validators)
  utils/      Money (paise) and booking-reference helpers
  ui/         Design-system primitives (Button, Card, Dialog, …)
prisma/       Schema, migrations, seed
docs/         Architecture, API, database, environment, security, testing
```

## Getting started

Prerequisites: **Node.js 22** (see `.nvmrc`), **npm 10+**, and either Docker or local PostgreSQL 16 + Redis 7.

```bash
npm install                 # also generates the Prisma client
cp .env.example .env        # one .env at the repo root serves every app
npm run db:up               # Postgres + Redis via docker compose (skip if running locally)
npm run db:migrate          # apply migrations
npm run db:seed             # roles, permissions, settings, 100 demo users
npm run dev                 # web → http://localhost:5173, API → http://localhost:5000
```

- API docs (Swagger UI): http://localhost:5000/api/docs
- Health: http://localhost:5000/api/health
- In development the web app proxies `/api` to the API, and the footer shows a live API/DB/Redis status dot.
- **Signing in locally:** use any mobile number. OTP codes are shown on screen and printed in the API
  terminal (development SMS provider). Seeded staff accounts, e.g. admin **9000000002**, support
  **9000000003**, are listed in [docs/DATABASE.md](docs/DATABASE.md#seed-data).
- API tests use a separate `zproo_test` database, created automatically; Postgres and Redis must be running.

## Scripts

| Command              | What it does                                         |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Run web and API in watch mode                        |
| `npm run build`      | Production builds (`apps/web/dist`, `apps/api/dist`) |
| `npm run lint`       | ESLint (incl. accessibility and React hooks rules)   |
| `npm run typecheck`  | Strict TypeScript across all workspaces              |
| `npm run test`       | Unit and integration tests                           |
| `npm run format`     | Prettier                                             |
| `npm run db:migrate` | Create/apply migrations in development               |
| `npm run db:deploy`  | Apply migrations in CI/production                    |
| `npm run db:seed`    | Idempotent seed                                      |
| `npm run db:studio`  | Prisma Studio                                        |

## Documentation

- [Implementation plan](docs/IMPLEMENTATION_PLAN.md): architecture, phases, decisions
- [Architecture](docs/ARCHITECTURE.md)
- [API](docs/API.md)
- [Database](docs/DATABASE.md)
- [Environment variables](docs/ENVIRONMENT.md)
- [Security](docs/SECURITY.md)
- [Testing](docs/TESTING.md)
- [Brand assets](docs/BRAND.md)
- [Contributing](CONTRIBUTING.md)

Deployment documentation arrives with the Docker and deployment phases (21–23).
