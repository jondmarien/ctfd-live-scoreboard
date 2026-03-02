export interface ChangelogEntry {
  title: string;
  date: string;
  version?: string;
  tags: string[];
  content: ChangelogSection[];
}

export interface ChangelogSection {
  heading?: string;
  body: string;
  bullets?: string[];
}

export const changelog: ChangelogEntry[] = [
  {
    title: "The Oracle's Eye: Quest Intel & the War Map",
    date: "2026-03-02",
    version: "v0.9.0",
    tags: ["Feature", "UI", "Fix"],
    content: [
      {
        body: "The Oracle has spoken. The Quest Board now reveals which battles rage hardest across the realm, and the Scoreboard unfurls a living war map — a score progression chart that traces every guild's rise to power across the timeline of the contest.",
      },
      {
        heading: "The Oracle's Quest Intelligence",
        body: "Three new collapsible scrolls appear atop the Quest Board, each scrying a different truth from the realm's solve history. Tap any heading to reveal its secrets.",
        bullets: [
          "**Most Conquered**: The five quests most guilds have already claimed — well-trodden ground, but worth knowing.",
          "**Least Conquered**: The five quests only the bravest have overcome — where reputation is forged and glory is scarce.",
          "**Unconquered**: Every quest that has yet to be claimed by a single soul. These are the untouched relics of the realm — be the first to break them.",
        ],
      },
      {
        heading: "The War Map",
        body: "A score progression chart now rests above the scoreboard rankings, hidden beneath the 📈 banner until summoned. Expand it to reveal a living record of each top guild's cumulative score, plotted across the full span of the contest.",
        bullets: [
          "**Top 10 Guilds Tracked**: Every line traces a guild's rise from silence to supremacy — or their quiet fade into history.",
          "**Collapse by Default**: The map sleeps until called upon. Click the header to unfurl it; click again to seal it away.",
          "**Amber Tooltip**: Hovering any point in time reveals where every guild stood at that exact moment, rendered in the board's signature amber palette.",
          "**Mock Scroll**: When the realm has not yet begun, a sample war map keeps the chart from going dark.",
        ],
      },
      {
        heading: "Scrolls of Mending",
        body: "Two curses plaguing the realm have been lifted.",
        bullets: [
          "**Unconquered Quests Now Revealed**: The Unconquered scroll was showing empty even when unsolved quests existed. The Oracle now consults the realm's official tally directly, ensuring no quest hides from the light.",
          "**Adventurer Roster Throttled**: The Guilds tab was summoning too many adventurer spirits at once, overwhelming the realm's gate and triggering rejections. Spirits are now called forth in measured groups, three at a time, ensuring every adventurer arrives safely.",
        ],
      },
    ],
  },
  {
    title: "Guilds & the Chronicle: A New Identity",
    date: "2026-02-23",
    version: "v0.8.0",
    tags: ["Feature", "UI"],
    content: [
      {
        body: "The Guild Quest Board continues to embrace its fantasy roots with a pair of thematic updates that deepen the RPG identity of the scoreboard.",
      },
      {
        heading: "Teams Rebranded to Guilds",
        body: 'The "Teams" tab has been renamed to "Guilds" across the entire application. This isn\'t just a label swap — it\'s a commitment to the fantasy world we\'ve built. Every party of adventurers is now recognized as a proper guild, as it should be.',
      },
      {
        heading: "Chronicle of Changes",
        body: "You're reading it right now. The Guild Quest Board now has its own changelog — the Chronicle of Changes — accessible via the 📜 scroll icon next to the view selector. Every major update, fix, and security hardening since the project's rebirth is documented here in rich detail.",
        bullets: [
          "**Timeline Layout**: A vertical timeline with dates, version badges, and tags mirrors the style of a medieval chronicle.",
          "**Fantasy Themed**: Styled with the same amber-and-stone palette, medieval fonts, and atmospheric design as the rest of the board.",
          "**Seven Entries Deep**: The chronicle launches with a complete history covering the React rebuild, security hardening, quest system, modals, and more.",
        ],
      },
    ],
  },
  {
    title: "The Adventurers Tab & Score Engine Overhaul",
    date: "2026-02-22",
    version: "v0.7.0",
    tags: ["Feature", "Fix", "Performance"],
    content: [
      {
        body: "A major update to how the Guild Quest Board tracks individual heroes. We've introduced a dedicated Adventurers tab and completely reworked the scoring engine under the hood.",
      },
      {
        heading: "Adventurers Tab",
        body: "Individual adventurers now have their own ranking view, derived directly from the scoreboard data. See who's climbing the leaderboard on their own merit — no guild required.",
        bullets: [
          "**Individual Rankings**: Each adventurer's score is calculated and ranked independently from their guild.",
          "**Derived from Scoreboard**: Rankings stay perfectly in sync with the main scoreboard data — no extra API calls needed.",
        ],
      },
      {
        heading: "Score Engine Rework",
        body: "We've rebuilt how team scores are fetched and calculated to eliminate race conditions and improve reliability.",
        bullets: [
          "**Batch Fetching**: Team scores are now fetched all in one go, replacing the previous per-team approach that could hit rate limits.",
          "**Race Condition Fix**: Resolved an issue where scores could fail to reset properly between refreshes, leading to stale or incorrect rankings.",
          "**Redeploy Trigger**: Forced a clean redeploy to ensure the new scoring logic propagated correctly across all edge nodes.",
        ],
      },
    ],
  },
  {
    title: "UI Polish & Modal Fixes",
    date: "2026-02-21",
    version: "v0.6.0",
    tags: ["Fix", "UI"],
    content: [
      {
        body: "A focused round of bug fixes and visual improvements across the board. Modals are smoother, tags render correctly, and the overall layout is tighter.",
      },
      {
        heading: "Modal Improvements",
        body: "Modals received significant attention this update to ensure they render correctly in all contexts.",
        bullets: [
          "**Portal Rendering**: All modals now render via a portal into `document.body`, escaping any `overflow:hidden` containers that previously clipped them.",
          "**Challenge Descriptions**: The Quest Modal now fetches the full challenge description from the API on open, rather than relying on potentially stale cached data.",
          "**Centering Fix**: Modals are now properly centered on screen across all viewport sizes.",
        ],
      },
      {
        heading: "Layout & Data Fixes",
        body: "Several small but impactful fixes to how data is displayed throughout the scoreboard.",
        bullets: [
          "**Quest Count**: Fixed an incorrect quest count that was off by one in certain edge cases.",
          "**Teams Alignment**: Tightened up the visual alignment in the Guilds list view.",
          "**Tag Extraction**: CTFd returns tag objects with nested values — we now correctly extract the string values to prevent React render errors.",
          "**Affiliation & Country**: Moved affiliation and country details from the teams list into the modal only, keeping the list view clean.",
          "**Rank Badge Removal**: Removed the rank badge from the teams list to reduce visual clutter; batch enrichment was also adjusted to avoid rate limits.",
        ],
      },
    ],
  },
  {
    title: "Domain Lockdown & Enumeration Protection",
    date: "2026-02-18",
    version: "v0.5.1",
    tags: ["Security"],
    content: [
      {
        body: "A targeted security update to expand our allowed domains and close an enumeration vector.",
      },
      {
        heading: "Allowed Hosts Expansion",
        body: "Added `scoreboard.issessions.ca` to the list of allowed hosts and CORS origins, enabling the scoreboard to be served from the official ISSessions subdomain.",
      },
      {
        heading: "Enumeration Lockdown",
        body: "Removed `/v1/challenges/:id` and `/v1/submissions/:id` from the API proxy allowlist. These endpoints could previously be used to enumerate challenge details and submission data — they're now blocked at the proxy layer.",
      },
    ],
  },
  {
    title: "Fortifying the Realm: Security Hardening",
    date: "2026-02-17",
    version: "v0.5.0",
    tags: ["Security", "Performance"],
    content: [
      {
        body: "A comprehensive security overhaul of the API proxy and webhook system. Multiple layers of defense were added to protect the scoreboard from abuse and data leakage.",
      },
      {
        heading: "API Proxy Hardening",
        body: "The serverless API proxy received a complete security audit and multiple new protections.",
        bullets: [
          "**GET-Only Enforcement**: The proxy now rejects all non-GET requests, preventing any write operations through the scoreboard.",
          "**Endpoint Allowlist**: Only specific, pre-approved API endpoints can be accessed through the proxy. Everything else returns a 403.",
          "**Locked CORS**: Cross-origin requests are now restricted to a strict allowlist of known origins.",
          "**IP Rate Limiting**: A token-bucket rate limiter (60 requests/minute) prevents abuse from any single IP address.",
          "**Vercel Edge Host Validation**: The primary authentication gate now uses Vercel's `x-forwarded-host` header, ensuring requests originate from the correct deployment.",
        ],
      },
      {
        heading: "User Data Protection",
        body: "New safeguards to prevent user data enumeration and leakage.",
        bullets: [
          "**Seen-Member Allowlist**: User profile fetches are now gated by a server-side set of member IDs seen in team responses. You can only fetch a user if they've appeared in a team roster.",
          "**Email Stripping**: Email addresses and other sensitive fields are stripped from all `/v1/users/:id` responses before they reach the client.",
          "**Solo Player Support**: The `captain_id` is now included in the member list even for solo players with empty member arrays, ensuring they can still be viewed.",
        ],
      },
      {
        heading: "Webhook Security",
        body: "The Discord webhook endpoint received its own hardening pass.",
        bullets: [
          "**HMAC Validation**: Webhook payloads are now verified using `timingSafeEqual` to prevent timing attacks.",
          "**Timestamp & Replay Protection**: Requests with stale timestamps are rejected, and payload size limits prevent abuse.",
          "**Required Secrets**: The `API_PROXY_SECRET` is now mandatory — the server returns 500 if it's unset, eliminating any accidental open-access deployments.",
        ],
      },
      {
        heading: "Performance",
        body: "Added module-level caching and per-user profile caching to the teams list hook, making repeat visits load instantly.",
      },
    ],
  },
  {
    title: "The Great Expansion: Views, Modals & Quests",
    date: "2026-02-16",
    version: "v0.4.0",
    tags: ["Feature", "UI", "Infrastructure"],
    content: [
      {
        body: "The biggest feature update yet. The scoreboard evolved from a single leaderboard into a multi-view application with modals, a quest system, and a completely reworked deployment infrastructure.",
      },
      {
        heading: "Multi-View System",
        body: "The scoreboard now features a pill-style view selector with four distinct views.",
        bullets: [
          "**Pill View Selector**: A sleek tab bar lets you switch between Scoreboard, Guilds, Adventurers, and Quests views with smooth animated transitions.",
          "**Adventurer & Team Modals**: Click on any adventurer or team to see detailed stats, solve history, and category breakdowns in a beautifully themed modal.",
          "**Component Reorganization**: The entire component tree was restructured to support the new multi-view architecture.",
        ],
      },
      {
        heading: "Quest System",
        body: 'Challenges were rebranded as "Quests" to match the fantasy theme, complete with their own dedicated view and modal.',
        bullets: [
          "**Quest Modal**: Each quest now has a detailed modal showing its description, point value, tags, and solve count.",
          "**Mock Data Fallback**: When the API returns empty or fails, the quest view gracefully falls back to mock data so the UI never breaks.",
          "**FOUC Prevention**: Added flash-of-unstyled-content prevention to eliminate visual jank on page load.",
        ],
      },
      {
        heading: "Server-Side Caching",
        body: 'Introduced server-side caching with 30-second and 60-second TTLs for different endpoints, plus a "Last Scrying" timestamp footer so you always know how fresh the data is.',
      },
      {
        heading: "Deployment Infrastructure",
        body: "A marathon debugging session to get Vercel serverless functions working correctly with the Vite SPA.",
        bullets: [
          "**Bun Runtime**: Switched serverless functions to the Bun runtime (`bunVersion: 1.x`) after discovering that `@vercel/node` types caused hangs with the Web API pattern.",
          "**TypeScript Project References**: Added `tsconfig.api.json` to properly include the `api/` directory in the TypeScript build.",
          "**SPA Routing Fix**: Used a negative lookahead rewrite (`/((?!api/).*)`) to prevent the SPA fallback from swallowing API routes.",
          "**Node 24.x**: Upgraded the Node.js engine to 24.x.",
        ],
      },
    ],
  },
  {
    title: "First Blood & Webhook Polish",
    date: "2026-02-13",
    version: "v0.3.0",
    tags: ["Feature", "Fix"],
    content: [
      {
        body: "A quick but impactful update adding competitive flair and fixing a webhook integration issue.",
      },
      {
        heading: "First Blood Support",
        body: "Challenges now display first blood indicators, highlighting the first team to solve each quest. A badge of honor for the swiftest adventurers.",
      },
      {
        heading: "Webhook Fix",
        body: "Fixed an issue where the Discord webhook embed image was broken, ensuring notifications display correctly with the proper scoreboard branding.",
      },
    ],
  },
  {
    title: "The Grand Opening: From Flask to React",
    date: "2026-02-10",
    version: "v0.2.0",
    tags: ["Launch", "Architecture"],
    content: [
      {
        body: "The Guild Quest Board was reborn. What started as a simple Flask application was completely rebuilt from the ground up as a modern React single-page application with a fantasy RPG theme.",
      },
      {
        heading: "Complete Rebuild",
        body: "The entire application was rebuilt using a modern stack designed for performance and visual flair.",
        bullets: [
          "**Vite + React + TypeScript**: Blazing-fast development and production builds with full type safety.",
          "**Tailwind CSS + ShadCN**: A utility-first styling approach with pre-built accessible components.",
          "**Framer Motion + GSAP**: Smooth animations throughout — from page transitions to particle effects.",
          "**Fantasy Theme**: Custom medieval fonts (MedievalSharp, Quintessential), a tavern color palette, and ambient particle effects create an immersive RPG atmosphere.",
        ],
      },
      {
        heading: "Vercel Deployment",
        body: "Migrated from a Docker-based deployment to Vercel's edge network for instant global access.",
        bullets: [
          "**Serverless API Proxy**: A catch-all serverless function proxies CTFd API requests with a server-side auth token, keeping credentials secure.",
          "**Vercel Configuration**: Custom `vercel.json` with SPA rewrites and API routing.",
          "**Official Favicon**: Added the ISSessions Fantasy CTF branding.",
        ],
      },
      {
        heading: "Performance Optimization",
        body: "Even at launch, we focused on keeping the bundle lean and the experience snappy.",
        bullets: [
          "**Code Splitting**: Rollup manual chunks separate vendor libraries (React, Framer Motion, GSAP, Particles) for optimal caching.",
          "**Memory Optimization**: Reduced unnecessary re-renders and optimized memory usage patterns.",
          "**Dynamic Imports**: Heavy components are loaded on demand to keep the initial bundle small.",
        ],
      },
    ],
  },
];
