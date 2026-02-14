# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**ISSessions Fantasy CTF - Guild Quest Board** (2026)

A high-fantasy themed real-time scoreboard for CTFd competitions. Built for ISSessions Fantasy CTF 2026 with D&D/Baldur's Gate 3 inspired visuals. Features animated tavern background, floating fireflies, aurora effects, and immersive RPG terminology.

**Live CTFd Instance:** <https://issessionsctf.ctfd.io>  
**Planned Deployment:** <https://scoreboard.issessions.ca>

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build:** Vite 7
- **Styling:** Tailwind CSS 4 with custom `@theme`
- **Animations:** Framer Motion, GSAP, tsparticles
- **UI Components:** Radix UI, shadcn/ui, Lucide icons
- **Fonts:** Quintessential (headers), MedievalSharp (body)
- **Server:** NGINX (production via Docker)
- **CI/CD:** GitHub Actions → GHCR
- **API:** CTFd REST API

## Development Commands

```bash
# Install dependencies
bun install

# Local dev server (port 8000, proxies /api to CTFd)
bun run dev

# Type check
tsc -b

# Lint
bun run lint

# Production build
bun run build

# Preview production build
bun run preview

# Docker
docker build -t fantasy-ctf-scoreboard .
docker run -p 8080:80 fantasy-ctf-scoreboard
```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── AnimatedContent.tsx   # Scroll-triggered animations
│   │   ├── AnimatedList.tsx      # Staggered list animations
│   │   ├── Aurora.tsx            # WebGL aurora background
│   │   ├── ClickSpark.tsx        # Gold spark effect on click
│   │   ├── Counter.tsx           # Animated number counter
│   │   ├── Fireflies.tsx         # Floating ember particles
│   │   ├── Fog.tsx               # Drifting fog layer
│   │   ├── Header.tsx            # Banner + title with SplitText
│   │   ├── Noise.tsx             # Film grain texture overlay
│   │   ├── Scoreboard.tsx        # Main scoreboard container
│   │   ├── ShinyText.tsx         # Animated gradient text
│   │   ├── SplitText.tsx         # GSAP letter-by-letter animation
│   │   ├── SpotlightCard.tsx     # Hover spotlight effect
│   │   ├── StarBorder.tsx        # Animated border effect
│   │   ├── TavernBackground.tsx  # Composites all background layers
│   │   └── TeamCard.tsx          # Individual team row + expansion
│   ├── hooks/
│   │   └── useScoreboard.ts      # Data fetching + XSS sanitization
│   ├── lib/
│   │   └── utils.ts              # cn() classname merge utility
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Tailwind + custom fonts/colors
├── public/
│   └── img/
│       └── fantasy-ctf-banner.png
├── docs/
│   ├── AGENTS.md                 # This file
│   └── WORK_DONE.md              # Development log
├── api/
│   ├── [...path].ts              # Vercel serverless CTFd API proxy
│   └── webhook/
│       └── firstblood.ts         # CTFd First Blood → Discord webhook
├── vite.config.ts                # Vite + API proxy config
├── tailwind via index.css        # Tailwind 4 @theme config
├── nginx.conf                    # Production server
└── dockerfile                    # Docker build
```

## Key Components

### TavernBackground.tsx

Composites the layered background effect:

1. Deep dark base (`#110a00`)
2. Aurora - warm amber/gold WebGL shader
3. Fog - drifting fireplace smoke
4. Fireflies - floating ember particles
5. Noise - film grain texture
6. Dark overlay for text readability

### useScoreboard Hook

```typescript
const { teams, loading, lastUpdate, refresh, escapeHTML } = useScoreboard();
```

- Fetches from `/api/v1/scoreboard` (proxied)
- Auto-refreshes every 30 seconds
- XSS sanitization via `escapeHTML()`
- Falls back to fantasy-themed mock data on error

### TeamCard.tsx

- Top 3 ranks: gold/silver/bronze gradient badges
- Expandable member list (sorted by score)
- Animated counter for scores
- GP (Gold Pieces) terminology

## Fantasy Theme

### Terminology

| Original | Fantasy |
|----------|--------|
| Teams | Adventuring Parties |
| Score | Gold Pieces (GP) |
| Solves | Quests |
| Members | Party Members |
| Last Update | Last Scrying |
| Loading | Consulting the Oracle |

### Color Palette (Tailwind @theme)

```css
--color-tavern-dark: #110a00;    /* Background */
--color-tavern-amber: #8b4513;   /* Borders */
--color-amber-gold: #ffd700;     /* Accents */
--color-ember-orange: #ff8c42;   /* Glows */
--color-parchment: #e8d5b0;      /* Text */
```

## Configuration

### Vite Dev Proxy (vite.config.ts)

```typescript
server: {
  port: 8000,
  proxy: {
    "/api": {
      target: "https://issessionsctf.ctfd.io",
      changeOrigin: true,
      secure: true,
    },
  },
}
```

### API Response Structure

```typescript
// CTFd returns: { success: true, data: [...teams] }
interface Team {
  pos: number;
  name: string;
  score: number;
  members?: { id: number; name: string; score: number }[];
}
```

## Security

### XSS Prevention

All user data sanitized in `useScoreboard.ts`:

```typescript
function escapeHTML(str: string | null | undefined): string {
  if (str === null || str === undefined) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
```

### CORS Handling

- **Dev:** Vite proxy handles `/api/*` → CTFd
- **Prod:** NGINX reverse proxy to CTFd

### Security Headers (nginx.conf)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Content-Security-Policy` (restricts to self + CTFd)

## Deployment

### Docker Build

Builds React app with Vite, serves via NGINX:

```bash
docker build -t fantasy-ctf-scoreboard .
docker run -p 80:80 fantasy-ctf-scoreboard
```

### GitHub Actions

- Triggers on push to `main`
- Builds multi-platform images (amd64/arm64)
- Pushes to GHCR with `latest` + SHA tags

## Branches

| Branch | Description |
|--------|-------------|
| `main` | React/Vite 2026 version (current) |
| `2025` | Vanilla JS Black Hat Bureau (archived) |

## First Blood Discord Webhook

### Overview

A Vercel serverless function at `/api/webhook/firstblood` receives CTFd First Blood webhook events and sends fantasy-themed Discord embed notifications.

### Flow

1. **Validation (GET):** CTFd sends `GET /api/webhook/firstblood?token=<token>` — the function responds with `HMAC-SHA256(WEBHOOK_SECRET, token)`
2. **Event (POST):** CTFd sends a First Blood event payload `{ id, challenge_id, date, type }`
3. **Enrichment:** The function fetches full submission + challenge details from the CTFd API
4. **Notification:** A gold-themed Discord embed is sent via the `WEBHOOK_URL` webhook

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CTFD_API_TOKEN` | Yes | API token for CTFd instance |
| `WEBHOOK_URL` | Yes | Discord channel webhook URL |
| `WEBHOOK_SECRET` | Yes | CTFd shared secret (Admin → Webhooks) |

### CTFd Setup

1. Go to **Admin → Webhooks** in CTFd
2. Copy the **Shared Secret** → set as `WEBHOOK_SECRET` in Vercel env vars
3. Add webhook target URL: `https://<your-domain>/api/webhook/firstblood`
4. Select **First Blood** event type
5. CTFd will validate the endpoint, then push events on first solves

## Key Notes

- No config file needed - API URL hardcoded in Vite proxy
- Mock data loads automatically if API fails
- Top 3 positions have special gradient styling
- All animations respect `prefers-reduced-motion`
- Background uses WebGL (Aurora) - falls back gracefully
