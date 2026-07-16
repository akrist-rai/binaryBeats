# Binary Beats

A competitive-programming judge: browse problems pulled from Codeforces, run
timed Blitz/Duel sessions, and submit C++ that's compiled and judged against
real test suites.

## Structure

- `src/` — Vite + React frontend
- `server/` — Koa API: Postgres (Neon) via Drizzle, Codeforces integration,
  session-authoritative Blitz/Duel, and a local C++ judge (`g++` + sandboxed
  execution)

## Local development

```
npm install
npm --prefix server install
npm run dev
```

This runs the Vite dev server and the API concurrently; Vite proxies `/api`
to `http://localhost:4000` (see `vite.config.ts`). The API needs
`server/.env` with `DATABASE_URL` and `SESSION_SECRET` — see the comments in
that file for where to get each.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) — frontend on Vercel, backend on Render
by default, with Railway/Fly.io/VPS alternatives and how to switch between
them.
