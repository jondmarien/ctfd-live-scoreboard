import { Link } from "react-router-dom";
import ClickSpark from "@/components/animation/ClickSpark";
import TavernBackground from "@/components/background/TavernBackground";
import SplitText from "@/components/animation/SplitText";
import ShinyText from "@/components/animation/ShinyText";
import AnimatedContent from "@/components/animation/AnimatedContent";
import { useAuth } from "@/hooks/useAuth";

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();

  return (
    <ClickSpark sparkColor="oklch(0.86 0.16 95)" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500}>
      <div className="relative min-h-dvh overflow-x-hidden">
        <TavernBackground />
        <div className="relative z-30 mx-auto max-w-5xl px-6 py-10">
          <section className="flex min-h-[85vh] flex-col items-center justify-center text-center">
            <AnimatedContent distance={20} direction="vertical" duration={0.8} delay={0.2}>
              <h1 className="mb-6">
                <SplitText
                  text="The Quest Giver Awaits"
                  className="font-display text-4xl font-bold tracking-wide text-amber-100 md:text-5xl lg:text-6xl"
                  delay={60}
                  from={{ opacity: 0, y: 20 }}
                  to={{ opacity: 1, y: 0 }}
                  ease="power3.out"
                  threshold={0.1}
                  tag="span"
                />
              </h1>
            </AnimatedContent>
            <p className="mb-4 max-w-3xl font-body text-lg text-amber-200/80 md:text-xl">
              Twenty-two quests across cryptography, programming, language-magick, OSINT,
              reverse engineering, and the wilds beyond.
            </p>
            <ShinyText
              text="Will you take up the call?"
              speed={4}
              className="font-body text-base tracking-widest text-amber-400/80 md:text-lg"
            />
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {isAuthenticated ? (
                <Link
                  to="/challenges"
                  className="rounded-lg border-2 border-amber-600/60 bg-stone-950/70 px-8 py-3 font-display text-lg text-amber-200 transition hover:border-amber-500 hover:bg-amber-900/30"
                >
                  Enter the Quest Hall
                </Link>
              ) : (
                <button
                  onClick={() => login("/challenges")}
                  className="rounded-lg border-2 border-amber-600/60 bg-stone-950/70 px-8 py-3 font-display text-lg text-amber-200 transition hover:border-amber-500 hover:bg-amber-900/30"
                >
                  Start Your Adventure
                </button>
              )}
              <Link
                to="/scoreboard"
                className="rounded-lg border-2 border-amber-700/40 bg-stone-900/50 px-8 py-3 font-display text-lg text-amber-300/80 transition hover:bg-stone-800/60 hover:text-amber-200"
              >
                View the Scoreboard
              </Link>
            </div>
          </section>

          <section className="min-h-[75vh] py-16">
            <h2 className="mb-6 font-display text-3xl text-amber-100">The Quests</h2>
            <div className="space-y-8">
              <div>
                <p className="font-display text-xl text-amber-300">Crypto and Programming</p>
                <p className="max-w-3xl font-body text-amber-200/75">
                  Precision puzzles, protocol traps, and executable riddles where each solve feels earned.
                </p>
              </div>
              <div>
                <p className="font-display text-xl text-amber-300">Language-Magick and OSINT</p>
                <p className="max-w-3xl font-body text-amber-200/75">
                  Prompt-side deception and real-world artifact hunting, tuned for creative technical thinking.
                </p>
              </div>
              <div>
                <p className="font-display text-xl text-amber-300">Reverse and Miscellany</p>
                <p className="max-w-3xl font-body text-amber-200/75">
                  Binary archaeology and chaotic side quests that reward patient curiosity.
                </p>
              </div>
            </div>
          </section>

          <section className="min-h-[75vh] py-16">
            <h2 className="mb-6 font-display text-3xl text-amber-100">What hides in the LLM challenges</h2>
            <div className="max-w-4xl space-y-4 font-body text-amber-200/80">
              <p>
                The LLM questline uses a bring-your-own-key model. Players can plug in their own
                provider keys and route calls through the challenge tooling without handing secrets to
                long-lived storage.
              </p>
              <p>
                Requests pass through narrow challenge adapters that constrain prompt shape, timing,
                and expected outputs. This keeps the puzzle logic intact while still allowing different
                model backends to participate.
              </p>
              <p>
                The result is a practical test bed: players experience realistic model behavior while
                the platform remains accountable, auditable, and cost-aware.
              </p>
            </div>
          </section>

          <section className="min-h-[70vh] py-16">
            <h2 className="mb-6 font-display text-3xl text-amber-100">Behind the curtain</h2>
            <p className="mb-6 max-w-4xl font-body text-amber-200/80">
              This project is not only a challenge set. It is a full system that combines CTFd, a
              dedicated scoreboard SPA, challenge infrastructure, and deployment automation.
            </p>
            <a
              href="https://github.com/jondmarien/fantasy_ctf_challs"
              className="font-display text-xl text-amber-300 underline transition hover:text-amber-100"
            >
              Explore the monorepo
            </a>
          </section>

          <section className="min-h-[55vh] py-16">
            <h2 className="mb-6 font-display text-3xl text-amber-100">About Jon</h2>
            <p className="max-w-4xl font-body text-amber-200/80">
              Jon designs challenge systems where mechanics, infrastructure, and visual narrative
              reinforce each other. The Fantasy CTF is both portfolio artifact and living lab.
            </p>
            <Link to="/about" className="mt-6 inline-block font-display text-amber-300 underline hover:text-amber-100">
              Read the full about page
            </Link>
          </section>

          <footer className="border-t border-amber-800/30 py-10 font-body text-sm text-amber-500/70">
            <p>FantasyCTF by Jon Marien, originally designed for ISSessions Fantasy 2026.</p>
            <p className="mt-2">Built with CTFd, Vite, and a shared tavern design system.</p>
          </footer>
        </div>
      </div>
    </ClickSpark>
  );
}
