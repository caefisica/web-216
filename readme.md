# 216

[![CodeQL](https://github.com/caefisica/216/actions/workflows/analyze_codeql.yml/badge.svg)](https://github.com/caefisica/216/actions/workflows/analyze_codeql.yml)

Library catalogue and loan tracker for the physics undergrad library at UNMSM's
Faculty of Physical Sciences.

## Get started

```bash
bun install
cp .env.example .env.local
```

Open `.env.local` and fill in `DATABASE_URL`. Then start the dev server. Schema
sync and seeding run automatically on first start:

```bash
bun run dev
```

## Environment variables

| Variable        | Description                                         |
| --------------- | --------------------------------------------------- |
| `DATABASE_URL`  | PostgreSQL connection string                        |
| `SEED_PASSWORD` | Password for demo accounts (default: `password123`) |

## Deploying to Cloudflare

```bash
bun run pages:build   # next build + Cloudflare worker bundle
bun run deploy
```

Set `DATABASE_URL` as an environment variable in the Cloudflare dashboard before
deploying. Demo accounts are not seeded in production.

## Test accounts

Created automatically on first `bun run dev`. Password for all: `password123`
(or your `SEED_PASSWORD`).

- `admin@unmsm.edu.pe` (admin)
- `librarian@unmsm.edu.pe` (librarian)
- `student@unmsm.edu.pe` (user)
