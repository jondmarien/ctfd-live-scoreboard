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
    <ClickSpark sparkColor="#FFD700" sparkSize={12} sparkRadius={20} sparkCount={10} duration={500}>
      <div className="relative min-h-screen overflow-x-hidden">
        <TavernBackground />
        <div className="relative z-30 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <AnimatedContent distance={20} direction="vertical" duration={0.8} delay={0.2}>
            <h1 className="mb-6">
              <SplitText
                text="The Quest Giver Awaits"
                className="font-quintessential text-4xl font-bold tracking-wide text-amber-100 md:text-5xl lg:text-6xl"
                delay={60}
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                ease="power3.out"
                threshold={0.1}
                tag="span"
              />
            </h1>
          </AnimatedContent>

          <AnimatedContent distance={15} direction="vertical" duration={0.8} delay={0.6}>
            <p className="mb-2 max-w-2xl font-medievalsharp text-lg text-amber-200/70 md:text-xl">
              Twenty-two quests across the realms of cryptography, programming, OSINT,
              reverse engineering, language-magick, and the wilds beyond.
            </p>
            <ShinyText
              text="Will you take up the call?"
              speed={4}
              className="font-medievalsharp text-base tracking-widest text-amber-400/80 md:text-lg"
            />
          </AnimatedContent>

          <AnimatedContent distance={10} direction="vertical" duration={0.6} delay={1.0}>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {isAuthenticated ? (
                <Link
                  to="/challenges"
                  className="rounded-lg border-2 border-amber-600/60 bg-stone-950/60 px-8 py-3 font-quintessential text-lg text-amber-200 shadow-[0_0_20px_rgba(255,165,0,0.15)] backdrop-blur-md transition hover:border-amber-500 hover:bg-amber-900/30"
                >
                  Enter the Quest Hall
                </Link>
              ) : (
                <button
                  onClick={() => login("/challenges")}
                  className="rounded-lg border-2 border-amber-600/60 bg-stone-950/60 px-8 py-3 font-quintessential text-lg text-amber-200 shadow-[0_0_20px_rgba(255,165,0,0.15)] backdrop-blur-md transition hover:border-amber-500 hover:bg-amber-900/30"
                >
                  Start Your Adventure
                </button>
              )}
              <Link
                to="/scoreboard"
                className="rounded-lg border-2 border-amber-700/40 bg-stone-900/40 px-8 py-3 font-quintessential text-lg text-amber-300/70 backdrop-blur-md transition hover:bg-stone-800/60 hover:text-amber-200"
              >
                View the Scoreboard
              </Link>
            </div>
          </AnimatedContent>

          <AnimatedContent distance={5} direction="vertical" duration={0.5} delay={1.4}>
            <Link
              to="/about"
              className="mt-12 font-medievalsharp text-sm text-amber-500/40 hover:text-amber-400/70"
            >
              About the Realm
            </Link>
          </AnimatedContent>
        </div>
      </div>
    </ClickSpark>
  );
}
