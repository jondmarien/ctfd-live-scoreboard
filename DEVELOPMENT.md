# `ctfd-live-scoreboard` Development Guide

This guide covers local development, configuration, and release checks for the frontend + serverless layer.

For architecture overview and project context, use [`README.md`](./README.md).

## Prerequisites

- Bun 1.x
- Node.js 24.x (project `engines.node` target)
- Git
- Optional: React DevTools standalone if you want local devtools injection on port `8097`

## Install

```bash
bun install
```

## Scripts

Defined in `package.json`:

- `bun run dev` - start local Vite dev server
- `bun run build` - type-check + production build
- `bun run build:profile` - profiling-mode build with source maps
- `bun run lint` - ESLint across the repo
- `bun run preview` - preview built output

## Local Runtime Behavior

### Dev Server

- Vite runs on `http://localhost:8000`
- `/api/*` requests are proxied by Vite to `https://issessionsctf.ctfd.io`
- If `CTFD_API_TOKEN` is present in local env, proxy requests include `Authorization: Token <token>`

### React DevTools Injection

`vite.config.ts` injects:

```text
<script src="http://localhost:8097"></script>
```

only during dev server runs. If you do not run React DevTools standalone, this is harmless but logs failed script loading in browser devtools.

## Environment Variables

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Currently used values:

| Variable | Used By | Notes |
| -------- | ------- | ----- |
| `CTFD_BASE_URL` | `api/[...path].ts` | Defaults to `https://api.ctf.chron0.tech` if unset |
| `CTFD_API_TOKEN` | Vite dev proxy + Vercel proxy function + webhook function | Required for authenticated server-to-server CTFd reads |
| `WEBHOOK_SECRET` | `api/webhook/firstblood.ts` | Required for signature validation |
| `WEBHOOK_URL` | `api/webhook/firstblood.ts` | Required for Discord notifications |

## Key Backend-Surface Files

- `api/[...path].ts`
  - read-only proxy (`GET` + `OPTIONS`)
  - host/origin/path allowlists
  - IP token-bucket limiter
  - response cache headers for edge caching

- `api/webhook/firstblood.ts`
  - CTFd signature verification (`ctfd-webhook-signature`)
  - timestamp replay protection
  - CTFd enrichment lookups
  - Discord embed dispatch

## Deployment Notes (Vercel)

- `vercel.json` controls install/build commands, output directory, rewrites, and domain redirects
- Set production env vars in Vercel project settings (not in repo files)
- Ensure `CTFD_API_TOKEN`, `WEBHOOK_SECRET`, and `WEBHOOK_URL` are present for production

## Recommended Verification Before Merge

Run from repo root:

```bash
bun run lint
bun run build
```

Manual checks:

1. Load `http://localhost:8000`
2. Confirm scoreboard data populates
3. Confirm `/api/...` reads succeed and no CORS regressions appear in browser console
4. If editing webhook logic, test signature rejection and success paths in a staging deployment

## Troubleshooting

- **403 from proxy**: verify host/origin allowlists in `api/[...path].ts`
- **500 `CTFD_API_TOKEN is not configured`**: set env var locally or in Vercel
- **No First Blood Discord message**: verify `WEBHOOK_SECRET`, `WEBHOOK_URL`, and CTFd webhook signing setup
- **Local API requests fail**: verify Vite proxy target accessibility and token validity
