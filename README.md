# Party-Up

> Plan something special with your people.

Party-Up is a full-stack web application for organising private events — birthdays, house parties, group trips. A host creates an event, sends time-limited invite links (with a QR code for in-person sharing), and manages the guest list; guests RSVP and, once admitted, see event details, upload photos, and post in the event's chat feed.

Built solo as a capstone project for the RNCP 6 *Concepteur·ice Développeur·se d'Applications* title (fiche RNCP 37873).

Live at [party-up.app](https://party-up.app).

## Stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/docs) (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) / Radix UI |
| Auth | [Better Auth](https://www.better-auth.com/docs) (Argon2 password hashing, database-backed sessions and rate limiting) |
| Database | [Neon](https://neon.tech) serverless PostgreSQL, via `@neondatabase/serverless` (HTTP driver) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Forms/validation | React Hook Form + Zod, shared between client and server |
| Email | [Resend](https://resend.com) |
| File uploads | [UploadThing](https://uploadthing.com) |
| Testing | Vitest (unit/integration) + Playwright (E2E) |
| Package manager | pnpm — **do not use npm or yarn** (see `STRUCTURE.md`) |
| Deployment | Vercel, via GitHub Actions |

See `STRUCTURE.md` for the layered server-side architecture (`dal/` → `services/` → `actions/`) and `docs/rgpd.md` / `docs/test-plan.md` for compliance and testing detail.

## Getting started

### Prerequisites

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- A [Neon](https://neon.tech) project (free tier is enough for local development)

### Install

```bash
pnpm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in the values below (see note below if `.env.example` doesn't exist yet in your checkout). **Never commit `.env`** — it's already covered by `.gitignore`.

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Session/cookie signing secret |
| `BETTER_AUTH_URL` | Yes | Base URL Better Auth runs at (`http://localhost:3000` in dev) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL, used to build invite links |
| `RESEND_API_KEY` | Yes | Transactional email (invites, password reset) |
| `UPLOADTHING_TOKEN` | Yes | Photo upload storage |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Reserved for Google OAuth — **not yet wired into `src/lib/auth.ts`**; declared for `docker-compose.yml` but currently unused by the app |
| `NEON_API_KEY` / `NEON_PROJECT_ID` / `NEON_PARENT_BRANCH_ID` | Only for `docker compose` | Used by the `neon_local` service to create an ephemeral local branch (see below) |

### Database

```bash
pnpm db:push       # push the schema straight to your database (fast local iteration)
pnpm db:generate    # generate a migration from schema changes
pnpm db:migrate     # apply migrations
pnpm db:studio      # open Drizzle Studio to browse data
```

Migration history lives in `migrations/`. Note: `guests`, `event_posts`, `photos`, and `invites` were applied via `db:push` rather than a generated migration, so the migration files alone don't fully reconstruct the schema from scratch — use `db:push` against a fresh database if you need to bootstrap one outside of `migrations/`.

### Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run with Docker Compose

```bash
docker compose --profile dev up
```

This starts the app (bind-mounted for live reload) alongside a `neon_local` container, which proxies to an ephemeral Neon branch rather than running a plain local Postgres — set `NEON_API_KEY`, `NEON_PROJECT_ID`, and `NEON_PARENT_BRANCH_ID` in `.env` first. This is a **development convenience**, not a rehearsal of the production build; the standalone production image is built separately (see `Dockerfile`, three stages: deps → build → a minimal non-root runtime image).

## Testing

```bash
pnpm test             # unit + integration tests (Vitest)
pnpm test:coverage     # same, with a coverage report
pnpm test:e2e          # end-to-end tests (Playwright) — run manually, not currently part of CI
```

See `docs/test-plan.md` for the full testing strategy, scope justification, and known limitations.

## Quality checks

```bash
pnpm lint          # ESLint, zero warnings allowed
pnpm type-check    # tsc --noEmit
```

Both run in CI (`.github/workflows/ci.yml`) on every push and on pull requests targeting `main`, alongside the unit test suite and a production build.

## Deployment

Deployment to Vercel is automated via `.github/workflows/deploy.yml` on every push to `main`, using the Vercel CLI in a build-then-deploy split (`vercel build --prod` → `vercel deploy --prebuilt --prod`) so environment drift between build and deploy is minimised. Dependency updates are proposed weekly via Dependabot (`.github/dependabot.yml`), each PR gated behind the full CI suite.

## Project structure

See `STRUCTURE.md` for the full breakdown. In short:

```
src/app/            Routes — (auth) and (app) route groups, plus a small number of Route Handlers
src/components/     UI — never imports from src/server/
src/lib/             Shared, client-safe utilities (validation schemas, auth client, QR generation)
src/server/
  actions/           Server Actions — the write path
  services/          Pure business logic — no framework or database imports
  dal/                Data access layer — every function checks the session before querying
  db/                 Drizzle schema and the Neon client
```

## License

[Add a license if you intend to open the repository, or state "All rights reserved" / private if not.]
