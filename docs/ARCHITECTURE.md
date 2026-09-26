# Architecture

ZPROO GO is a **modular monolith**: one API deployable, one web app, sharing typed packages.
The full design (booking engine, payments, providers, real-time) is in
[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md). This document describes what exists now.

## Monorepo

```
apps/web ─┬─> @zproo/ui ──────────┐
          ├─> @zproo/types        │
          ├─> @zproo/utils        ├─> @zproo/config (tsconfig presets, brand)
          └─> @zproo/config       │
apps/api ─┬─> @zproo/types        │
          ├─> @zproo/validation ──┘
          ├─> @zproo/utils
          └─> @zproo/config
```

Internal packages ship TypeScript source (no build step). Vite compiles them for the web app;
`tsup` bundles them into `apps/api/dist/server.js`, leaving third-party dependencies external.
Turborepo runs `build`, `lint`, `typecheck` and `test` across workspaces with caching.

## API (`apps/api`)

```
server.ts          boot: env → logger → Prisma → Redis → services → app → listen; graceful shutdown
container.ts       composition root: the only place concrete repositories, services and providers are wired
app.ts             createApp(services): middleware + routers, no side effects (testable with Supertest)
config/env.ts      Zod-validated environment; fails fast with names (never values) of bad vars
middleware/        httpLogger (request IDs), security (Helmet, CORS), rateLimit, validate,
                   auth (authenticate, authorize), notFound, errorHandler
routes/            one router per module, mounted under /api (health, auth, me, admin)
controllers/       HTTP adapters only (read validated input, set cookies, send envelope)
services/          business logic: Auth, Otp, Token, Password, Rbac, Audit, User, Health
repositories/      data access with Prisma; accept a transaction client for multi-step writes
providers/         external integrations behind interfaces: sms/, email/, identity/ (Google, Apple)
models/            DTO mappers (e.g. toPublicUser — the only shape a user leaves the API in)
validators/        route-specific Zod schemas (shared ones live in @zproo/validation)
docs/              OpenAPI registry built from Zod schemas + Swagger UI router
utils/             AppError hierarchy, response envelope, logger
```

Request pipeline: `request ID + log → Helmet → CORS → JSON body (100 kB) → rate limit →
router → validate → controller → service → repository`, with `notFound` and `errorHandler`
last. Express 5 forwards rejected promises from async handlers to the error handler.

Every response uses the envelope `{ success, message, data }`; failures add `errorCode`,
optional `details` (validation) and `requestId`.

## Web (`apps/web`)

```
routes/routes.tsx     route tree; every page is lazy-loaded (route-level code splitting)
routes/routeMap.ts    UI page map: every planned route, its title and delivery phase
layouts/              PublicLayout (header, footer, bottom nav), AuthLayout, AdminLayout
components/           brand/Logo, layout/*, feedback/*, seo/Seo
config/               service catalogue and navigation (single source for header/footer/search)
features/<domain>/    API hooks (TanStack Query) and domain components
services/http.ts      Axios instance; unwraps the envelope; normalises errors to ApiClientError
store/                Zustand stores (UI preferences)
features/auth/        session store (access token in memory), refresh with cross-tab lock,
                      guards (RequireAuth, RequirePermission), flows, form components
styles/globals.css    design tokens (CSS variables) mapped into Tailwind's theme
```

- Routes whose module has not shipped render `PlannedPage` (marked `noindex`), so navigation never
  breaks. Each phase replaces its placeholders with real pages.
- The admin area (`/admin`) is a separate lazy chunk with its own layout, behind
  `RequirePermission("admin:access")`. The API enforces permissions; client-side guards are only for UX.

## Authentication flow (web)

```
page load ──(had a session before?)──> POST /auth/refresh (cookie) ──> access token in memory
API call ──> Authorization: Bearer <access> ──401──> refresh once (Web Lock across tabs) ──> replay
sign in  ──> { user, accessToken } + HttpOnly refresh cookie (Path=/api/auth)
```

- Page metadata (title, description, canonical, Open Graph, Twitter) uses React 19's native
  `<title>`/`<meta>` hoisting via `<Seo />`.
- Mobile gets its own navigation model: app-style bottom navigation plus a slide-in menu.

## Design system

Tokens are CSS variables on `:root` (`--primary`, `--primary-hover`, `--primary-light`,
`--background`, `--foreground`, `--muted`, `--border`, `--success`, `--warning`, `--danger`)
exposed to Tailwind via `@theme inline`, so utilities like `bg-primary` and `text-muted` follow
them. The same values are exported from `@zproo/config` (`BRAND.colors`) for emails and PDFs.
Typeface: Plus Jakarta Sans (self-hosted, no third-party requests). Motion respects
`prefers-reduced-motion`.
