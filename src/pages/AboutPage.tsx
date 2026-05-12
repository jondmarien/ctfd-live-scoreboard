import { Link } from "react-router-dom";
import TavernBackground from "@/components/background/TavernBackground";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <TavernBackground />
      <div className="relative z-30 mx-auto max-w-3xl px-6 py-12">
        <Link to="/" className="font-body text-sm text-amber-400/60 hover:text-amber-300">
          Gates
        </Link>

        <h1 className="mb-6 mt-4 font-display text-3xl text-amber-100">About the Realm</h1>

        <article className="prose prose-invert max-w-none space-y-4 font-body text-amber-200/80">
          <p>
            <strong>Chron0 PerpetualCTF</strong> is a permanent home for the 22 Capture-The-Flag
            challenges designed for the ISSessions Fantasy 2026 CTF, now maintained on Jon's own domain.
          </p>

          <h2 className="font-display text-xl text-amber-200">The Challenges</h2>
          <p>
            Twenty-two quests across six realms: Crypto, Programming, Language-Magick, OSINT,
            Reverse Engineering, and Miscellany. Each quest includes lore, challenge artifacts,
            and solve materials.
          </p>

          <h2 className="font-display text-xl text-amber-200">The Architecture</h2>
          <p>
            CTFd runs headless on a Hetzner VPS behind Traefik. This SPA runs on Vercel and consumes
            CTFd APIs. Public reads go through a hardened read-only proxy; authenticated actions
            go directly to `api.ctf.chron0.tech` using a session-bound bearer token.
          </p>
          <p>
            Language-Magick challenges use bring-your-own-key model routing through LiteLLM.
            Player keys are session-scoped and not persisted server-side.
          </p>

          <h2 className="font-display text-xl text-amber-200">Live Status</h2>
          <p className="flex items-center gap-3">
            <a
              href="https://status.ctf.chron0.tech"
              className="text-amber-400 underline"
              target="_blank"
              rel="noreferrer"
            >
              Uptime Kuma
            </a>
            <img
              src="https://status.ctf.chron0.tech/api/badge/1/status"
              alt="Chron0 CTF status badge"
              className="inline-block h-5"
              loading="lazy"
            />
          </p>

          <h2 className="font-display text-xl text-amber-200">Source</h2>
          <ul className="list-disc list-inside">
            <li>
              <a
                href="https://github.com/jondmarien/fantasy_ctf_challs"
                className="text-amber-400 underline"
              >
                Monorepo (challenges + infra)
              </a>
            </li>
            <li>
              <a
                href="https://github.com/jondmarien/ctfd-live-scoreboard"
                className="text-amber-400 underline"
              >
                Site repository
              </a>
            </li>
            <li>
              <a href="https://github.com/jondmarien" className="text-amber-400 underline">
                GitHub
              </a>
            </li>
            <li>
              <a href="https://www.linkedin.com/in/jondmarien/" className="text-amber-400 underline">
                LinkedIn
              </a>
            </li>
          </ul>

          <h2 className="font-display text-xl text-amber-200">Browser compatibility</h2>
          <p className="text-sm text-amber-300/70">
            This site is tested in Chrome, Edge, Safari, and Firefox. Under
            Firefox's <em>Strict</em> tracking-protection mode the cross-origin
            auth flow can be unreliable due to Total Cookie Protection — if
            you see a blank page or the sign-in flow misbehaves, either lower
            the protection level for this site (shield icon in the address bar)
            or use a Chromium browser. The site degrades gracefully if WebGL
            is unavailable: the aurora effect simply isn't drawn.
          </p>

          <h2 className="font-display text-xl text-amber-200">Credit</h2>
          <p className="text-sm text-amber-500/60">
            Originally designed for ISSessions Fantasy 2026 CTF.
            Maintained as a personal project by Jon Marien at chron0.tech.
          </p>
        </article>
      </div>
    </div>
  );
}
