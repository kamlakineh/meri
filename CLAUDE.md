# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

This repo holds three pieces of a multi-sided health platform (Patient, Doctor, Hospital/Clinic, Pharmacy):

- **[contracts/](contracts/openapi.yaml)** — OpenAPI 3.1 contract for the Search, Cases, Appointments, and Chat domains. Source of truth for both the mock server and the web app's `lib/api/*` client. See [contracts/README.md](contracts/README.md) for what's explicitly out of scope (real auth, pharmacy orders/inventory, payments, OCR).
- **[mock-server/](mock-server/README.md)** — standalone Express + TypeScript service implementing that contract with stateful, seeded in-memory fixtures, so web and mobile can integrate before the real backend exists. Its own `package.json`/`node_modules`, run separately from the web app (`cd mock-server && npm run dev`, port 4000).
- **Everything else** (`app/`, `components/`, `lib/`, `i18n/`, `messages/`) — the Next.js web app described below.

## This is Next.js 16, not the Next.js you may remember

This project runs **Next.js 16.4.0** with **React 19.3.0**, which includes breaking changes and new APIs versus earlier Next.js versions. Before writing code that touches routing, data fetching, caching, config, images, or middleware, check the matching guide in `node_modules/next/dist/docs/` — it is version-matched to the installed `next` package and is the authoritative source over prior training data. Key things already in play in this repo:

- **Turbopack is the default** bundler for both `next dev` and `next build` (no `--turbopack` flag needed).
- **`cacheComponents: true`** and **`partialPrefetching: true`** are enabled in [next.config.ts](next.config.ts). Data fetching is dynamic by default; Next tries to prerender a static shell and anything dynamic/uncached (reading `cookies()`, fetching per-request) must either be wrapped in `<Suspense>` or the segment must opt out with `export const instant = false`. **Every route under `app/[locale]/`** reads the mock-session cookie and/or fetches live mock-API data, so they all set `instant = false` rather than hand-placing `<Suspense>` boundaries — see `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`. If a route becomes genuinely static later, remove the flag and follow the validation errors.
- **`middleware.ts` is renamed `proxy.ts`** — see [proxy.ts](proxy.ts), which wraps `next-intl`'s middleware for locale routing.
- **`params`/`searchParams` are async everywhere** — always `await` them.
- **`next lint` is removed** — linting runs via the ESLint CLI (`npm run lint` → `eslint`, flat config in [eslint.config.mjs](eslint.config.mjs)).
- **`experimental.agentFeedback: true`** is enabled, which is why `next dev` manages the `<!-- BEGIN:nextjs-agent-feedback -->` / `<!-- BEGIN:nextjs-agent-rules -->` blocks in [AGENTS.md](AGENTS.md). Don't hand-edit or strip those blocks; commit them as `next dev` rewrites them.

## Commands

Web app (repo root):

```bash
npm run dev     # start dev server (Turbopack, outputs to .next/dev) — needs the mock server running too
npm run build   # production build
npm run lint    # eslint (flat config)
npx next typegen  # (re)generate route/layout/page TypeScript helpers
```

Mock API server (separate process):

```bash
cd mock-server
npm install   # first time only
npm run dev   # listens on :4000
```

There is no test runner configured in this repo yet.

## Architecture

### Auth is a dev-only placeholder

There's no real backend auth yet (see [contracts/README.md](contracts/README.md)). `/[locale]/login` lists the seeded users from the mock server (`GET /v1/_dev/users`) and signing in (`lib/actions/session.ts` → `loginAs`) just sets a `mock_session` cookie (`{role, userId, name}`, read by [lib/session.ts](lib/session.ts)). Every `lib/api/*` request attaches that session as `X-Mock-Role`/`X-Mock-User-Id` headers, which the mock server uses to scope `cases`/`appointments`/`chats` to the caller — the same shape a real session/JWT would provide.

### i18n (next-intl)

Routes live under `app/[locale]/` for three locales — `en` (default), `am` (Amharic), `om` (Afaan Oromo) — configured in [i18n/routing.ts](i18n/routing.ts). [proxy.ts](proxy.ts) handles locale detection/redirects. Translation catalogs are in `messages/{locale}.json`, namespaced by `common`, `nav`, `auth`, and one namespace per role (`patient`, `doctor`, `hospital`, `pharmacy`). Server Components read strings via `getTranslations()`; the one client-side piece that needs them (`components/layout/LanguageSwitcher.tsx`) uses `useTranslations()`. Use `@/i18n/navigation`'s `Link`/`usePathname`/`useRouter` (not `next/link` or `next/navigation`) for any in-app navigation so the locale prefix is preserved — pass locale-less paths (e.g. `/patient`, not `/en/patient`).

### Role-based layout

`app/[locale]/(roles)/{patient,doctor,hospital,pharmacy}/layout.tsx` each: read the session, redirect to `/login` if the role doesn't match, build a translated `NavItem[]` list (only "Home" is wired to a real page right now — other nav items render as inert placeholders, see `components/layout/Sidebar.tsx`), and wrap `children` in `components/layout/DashboardShell.tsx` (Sidebar + Topbar). Each role's `page.tsx` is a representative home dashboard — stat cards + data tables fed by `lib/api/*` — matching the reference screenshot's visual pattern (not its branding or its unrelated hospital-ops modules like ICU/HR/Payslips). Deeper flows (map search, OCR scan, video/voice call, pharmacy orders, payments) are intentionally not built yet.

### Component library

- `components/ui/` — primitives (Button, Input, Select, Textarea, Checkbox, Badge, Avatar, Card). The form controls are Client Components (`"use client"`); Badge/Avatar/Card are server-renderable.
- `components/forms/FormField.tsx` — label/hint/error wrapper for form controls; `zod` is the intended validation library for forms built on top of it (installed, not yet wired to a concrete form in this pass).
- `components/table/DataTable.tsx` — generic typed-column table used by every role dashboard.
- `components/modal/Modal.tsx` + `ConfirmDialog.tsx` — Client Components (open/close state, Escape-to-close).
- `components/layout/` — `Sidebar`, `Topbar`, `DashboardShell`, `StatCard`, `PageHeader`, `LanguageSwitcher`, `LogoutButton`, `RoleCard` (the `/login` picker), `Skeleton` (loading placeholders, not yet wired up since routes use `instant = false` instead of `<Suspense>` today).

### API client

`lib/api/{search,cases,appointments,chat,devUsers}.ts` are thin typed wrappers around `lib/api/client.ts`'s `apiFetch`, which reads `NEXT_PUBLIC_API_URL` (see `.env.local` / `.env.example`) and attaches the mock-auth headers via `lib/session.ts`. `lib/api/types.ts` mirrors `contracts/openapi.yaml`'s schemas — keep both in sync by hand for now (no codegen wired up yet).

Path alias `@/*` maps to the repo root (see [tsconfig.json](tsconfig.json)).
