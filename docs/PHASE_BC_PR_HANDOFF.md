# Phase B/C PR + Handoff Checklist

## Single PR Merge Plan

1. Open one PR from `feat/full-site` into `main`.
2. Title suggestion: `feat: ship Chron0 fantasy CTF full-site Phase B/C`.
3. Keep PR scope focused on:
   - Chron0 branding + host/path rewrites.
   - Public-read proxy hardening updates.
   - Authenticated CTFd integration hooks and client.
   - New routed pages (`landing`, `challenges`, `challenge detail`, `solution`, `auth callback`, `about`).
   - LLM quest UX (`BYO key`, demo replay animation).
   - SkillsSheridan assets moved under `src/archived/skillssheridan`.
   - Markdown hardening in `SolutionPage` via `marked` + `DOMPurify`.
4. Before merge, include verification notes:
   - `bun run build` passes.
   - `bun run lint` still fails due pre-existing project-wide issues unrelated to this PR.
   - Local preview route checks pass for `/`, `/scoreboard`, `/challenges`, `/challenges/:slug`, `/about`.
5. Merge with a regular merge commit (recommended) so the migration scope remains easy to audit.

## Jon Post-Merge Vercel Handoff

1. Project + branch:
   - Ensure Vercel Production tracks `main`.
   - Ensure this merged commit is the active production deployment.
2. Domains:
   - Attach `ctf.chron0.tech` to this Vercel project.
   - Attach `scoreboard.chron0.tech` if legacy host redirect should terminate at this app.
   - Confirm whether `scoreboard.issessions.ca` should exist in this project or another Vercel project (current curl indicates `DEPLOYMENT_NOT_FOUND`).
3. Environment variables (Production, plus Preview if desired):
   - `CTFD_BASE_URL=https://api.ctf.chron0.tech`
   - Any existing values used by the API proxy runtime.
4. Redirect/rewrite validation on deployed URL:
   - `https://scoreboard.chron0.tech` redirects to `https://ctf.chron0.tech/scoreboard`.
   - `https://scoreboard.issessions.ca` redirects similarly once domain is correctly attached.
   - SPA rewrites continue to serve app routes.
5. API proxy validation:
   - Check `GET /api/v1/challenges` from production host.
   - If `502 Failed to reach CTFd API` persists, verify:
     - `api.ctf.chron0.tech` is reachable from Vercel functions.
     - TLS certificate chain is valid.
     - CTFd/API origin allows expected traffic.
6. OAuth callback validation:
   - Confirm callback route configured to `https://ctf.chron0.tech/auth/callback`.
   - Sign-in flow returns user to requested route.
7. Final manual smoke:
   - Landing, scoreboard, challenge list, challenge detail, solution gating, about page.
   - Flag submission for authenticated user.
   - LLM BYO form persists key only in session storage.
