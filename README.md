# Tena Health — frontend foundation

A multi-sided health platform (Patient, Doctor, Hospital/Clinic, Pharmacy). This repo currently holds three pieces built to let web and mobile start before the real backend exists:

1. **[contracts/](contracts/openapi.yaml)** — the API contract for Search, Cases, Appointments, and Chat.
2. **[mock-server/](mock-server/README.md)** — a stateful mock implementation of that contract.
3. **This Next.js app** — Tailwind theme, role-based layout, a reusable component library, and English/Amharic/Afaan Oromo translations, with one representative dashboard per role.

See [CLAUDE.md](CLAUDE.md) for the full architecture and what's intentionally out of scope for this pass.

## Run it

Two processes, in separate terminals:

```bash
# 1. Mock API server (port 4000)
cd mock-server
npm install
npm run dev
```

```bash
# 2. Web app (port 3000)
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) — you'll land on a dev-only sign-in picker (`/en/login`) listing seeded accounts for each role. Pick one to see that role's dashboard. Switch language from the top bar.

## Commands

```bash
npm run dev     # web app, Turbopack
npm run build   # production build
npm run lint    # eslint
npx next typegen  # regenerate route types after adding routes
```
