# Chron0 CTF Frontend (`ctfd-live-scoreboard`)

The FantasyCTF web app and live scoreboard frontend, built with React + Vite and deployed on Vercel.

This repository now covers more than the scoreboard UI: it includes public challenge browsing routes, auth callback handling, writeup/solution pages, and serverless API endpoints (proxy + first-blood webhook).

![ISSessions Fantasy CTF](public/img/fantasy-ctf-banner.png)

[![Chron0 CTF Status](https://status.ctf.chron0.tech/api/badge/1/status)](https://status.ctf.chron0.tech)

## Development Docs

All implementation and workflow details live in [`DEVELOPMENT.md`](./DEVELOPMENT.md).

Use this README for architecture and deployment orientation, and use `DEVELOPMENT.md` for local setup, scripts, debugging, and release workflows.

## Core Capabilities

### Frontend Experience

- High-fantasy themed UI with layered atmospheric effects
- Live scoreboard, guild/team views, players view, challenge board, and changelog
- Modal-driven detail exploration for teams, players, and challenges
- Route-based pages for challenge detail, solution display, about, and login callback handling
- Responsive layout with motion-driven transitions and animated counters

### Data + Security

- Read-only CTFd API proxy via Vercel serverless (`api/[...path].ts`)
- Host and origin allowlists for API access control
- Path-level API allowlisting for least-privilege reads
- IP-based rate limiting in the proxy layer
- Sensitive field stripping on user payload responses
- Sanitization of rendered user-generated content in frontend hooks/components

### Eventing

- First Blood webhook handler at `api/webhook/firstblood.ts`
- Signature verification (HMAC + timestamp window)
- Challenge/submission enrichment from CTFd API
- Discord embed notification publishing

## Tech Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Framer Motion + GSAP
- Radix UI + shadcn-style component patterns
- Bun for install/build scripts
- Vercel serverless functions for API surfaces

## Runtime Configuration

### Frontend + Proxy

`.env.example` includes:

- `CTFD_BASE_URL` (defaults to `https://api.ctf.chron0.tech` in proxy code if omitted)
- `CTFD_API_TOKEN` for read-only proxy requests

### First Blood Webhook (Serverless)

Required environment variables:

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `CTFD_API_TOKEN` | Yes | Enrich webhook events from CTFd API |
| `WEBHOOK_SECRET` | Yes | Verify CTFd webhook signatures |
| `WEBHOOK_URL` | Yes | Discord destination for First Blood announcements |

## Deployment

Recommended target: Vercel.

`vercel.json` config currently defines:

- Bun install/build commands
- API rewrites (`/api/:path* -> /api/[...path]`)
- SPA rewrites for non-API routes
- host-based redirect of `scoreboard.chron0.tech` to `https://ctf.chron0.tech/scoreboard`

### Custom Domains

- Primary app: `ctf.chron0.tech`
- Redirect host: `scoreboard.chron0.tech`

### Optional Self-Hosting

A legacy `dockerfile` is kept for self-hosting scenarios, but Vercel is the maintained deployment path.

## Repository Layout

```text
ctfd-live-scoreboard/
├── src/
│   ├── components/              # UI primitives, backgrounds, modals, forms, animation
│   ├── hooks/                   # Data fetching/state hooks
│   ├── pages/                   # Route-level pages
│   ├── archived/                # Archived route/theme implementations
│   ├── lib/                     # Shared utils + motion config
│   ├── data/                    # Static data modules (for example changelog)
│   ├── App.tsx
│   └── main.tsx
├── api/
│   ├── [...path].ts             # Read-only CTFd proxy with hardening controls
│   └── webhook/firstblood.ts    # Verified First Blood -> Discord handler
├── public/
├── docs/
├── vercel.json
└── README.md
```

## Companion Backend Repository

Challenge content and core infra are maintained in the sibling repository:

- `J:/projects/personal-projects/fantasy_ctf_challs`

This frontend repo focuses on player UX and safe API/webhook surfaces.

## Credits

- Theme origin: ISSessions Fantasy CTF 2026
- Developer: [Jonathan Marien](https://github.com/jondmarien)
- CTF engine/API: [CTFd](https://docs.ctfd.io/docs/api/getting-started/)
