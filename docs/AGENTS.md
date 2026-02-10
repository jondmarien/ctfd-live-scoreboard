# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**ISSessions Fantasy CTF - Guild Quest Board** (2026)

A high-fantasy themed real-time scoreboard for CTFd competitions. Built for ISSessions Fantasy CTF 2026 with D&D/Baldur's Gate 3 inspired visuals. Features floating magical runes, medieval styling, and immersive RPG terminology.

**Live CTFd Instance:** https://issessionsctf.ctfd.io  
**Planned Deployment:** https://scoreboard.issessions.ca

## Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling:** Press Start 2P font, CSS animations (torch flicker, floating particles)
- **Server:** NGINX (production via Docker)
- **CI/CD:** GitHub Actions → GitHub Container Registry (GHCR)
- **API:** CTFd REST API
- **Local Dev:** Bun dev server with API proxy

## Development Commands

```bash
# Local development (with API proxy)
bun dev-server.ts

# Simple static server (no API, uses mock data)
python -m http.server 8000

# Docker build & run
docker build -t fantasy-ctf-scoreboard .
docker run -p 8080:80 fantasy-ctf-scoreboard
```

## Configuration

Create `assets/js/config.js` (gitignored):

```javascript
window.CONFIG = {
    API_URL: '/api/v1/scoreboard',      // Proxied through nginx/bun
    API_TOKEN: 'ctfd_xxx',               // CTFd Admin API token
    UPDATE_INTERVAL: 300000,             // 5 minutes (use 10000 for testing)
    MAX_TEAMS: 200,
    FONT_FAMILY: "'Press Start 2P', cursive",
};
```

## Fantasy Theme

### Terminology Mapping

| Original | Fantasy |
|----------|---------|
| Teams | Adventuring Parties |
| Score/pts | Gold Pieces (GP) |
| Solves | Quests |
| Members | Party Members |
| Last Update | Last Scrying |
| Loading | Consulting the Oracle |
| Error | Arcane Disruption |

### Color Palette (CSS Variables)

| Variable | Hex | Usage |
|----------|-----|-------|
| `--gold` | #FFD700 | Primary accent, headers |
| `--gold-dark` | #B8860B | Borders |
| `--purple-magic` | #8B5CF6 | Magical highlights |
| `--stone-dark` | #1a1a2e | Background |
| `--parchment` | #F4E4BA | Text |
| `--torch-orange` | #FF6B35 | Glow effects |
| `--emerald` | #50C878 | Position badges (4+) |

## Architecture

### Core Files

```
├── index.html              # Entry point, loads fonts/CSS/JS
├── assets/
│   ├── css/
│   │   └── styles.css      # Fantasy theme styling
│   ├── js/
│   │   ├── config.js       # API config (gitignored)
│   │   └── scoreboard.js   # Main Scoreboard class
│   └── img/
│       └── fantasy-ctf-banner.png
├── nginx.conf              # Production server config
├── dev-server.ts           # Bun local dev server
└── dockerfile              # Docker build config
```

### Scoreboard Class (scoreboard.js)

| Method | Description |
|--------|-------------|
| `initMagicParticles()` | Canvas animation - Elder Futhark runes floating upward |
| `fetchScoreboard()` | Fetches from CTFd API with token auth |
| `renderTeam()` | Generates party HTML with XSS-safe sanitization |
| `startAutoUpdate()` | Manages periodic refresh interval |
| `getMockData()` | Fantasy-themed demo parties for fallback |
| `escapeHTML()` | Sanitizes user input to prevent XSS |

### Data Flow

1. `Scoreboard` constructor initializes magic particles and starts auto-update
2. `fetchScoreboard()` calls CTFd API via proxy: `/api/v1/scoreboard`
3. Response mapped to `{id, name, score, pos, members}` objects
4. `renderTeam()` generates expandable party cards with GP and quest counts
5. "Last Scrying" timestamp appended, DOM updated

### API Response Structure

```javascript
// CTFd returns: { success: true, data: [...teams] }
// Each team: { account_id, name, score, pos, members: [] }
```

## Security

### XSS Prevention

All user-controlled data is sanitized via `escapeHTML()`:
```javascript
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
```

Applied to: team names, member names, IDs, scores.

### CORS Handling

- **Production:** NGINX proxies `/api/*` to CTFd (no CORS)
- **Development:** Bun dev server proxies to CTFd
- Better error messages when CORS fails

### Security Headers (nginx.conf)

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy` (restricts connections to self + CTFd)

## Docker/Deployment

- `dockerfile` - NGINX Alpine-based, copies static files to `/app/`
- `nginx.conf` - Proxies `/api/*` to `issessionsctf.ctfd.io`, serves static files
- GitHub Actions builds multi-platform images (amd64/arm64) on push to `main`
- Images tagged with `latest` and commit SHA

## Branches

| Branch | Description |
|--------|-------------|
| `main` | ISSessions Fantasy CTF 2026 (current) |
| `2025` | Black Hat Bureau Edition (archived) |

## Key Notes

- `config.js` is gitignored - create manually or inject at deploy time
- Magic particles use Elder Futhark runes: ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛟᛞ
- Top 3 positions have special styling (gold/silver/bronze gradients)
- Error handling falls back to fantasy-themed mock data
- Party interactions (expand/collapse) use event delegation
