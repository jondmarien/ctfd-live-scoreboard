import { Link } from "react-router-dom";
import TavernBackground from "@/components/background/TavernBackground";
import { useChallengeCache, type ChallengeInfo } from "@/hooks/useChallengeCache";
import { useSolves } from "@/hooks/useSolves";
import { useAuth } from "@/hooks/useAuth";
import ProfileBadge from "@/components/ui/ProfileBadge";

const CATEGORY_ORDER = ["crypto", "prog", "llm", "osint", "rev", "misc"];
const CATEGORY_LABELS: Record<string, string> = {
  crypto: "Crypto",
  prog: "Programming",
  llm: "Language-Magick",
  osint: "OSINT",
  rev: "Reverse Engineering",
  misc: "Miscellany",
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ChallengesPage() {
  const { isAuthenticated } = useAuth();
  const { challenges } = useChallengeCache();
  const { hasSolved } = useSolves();

  const grouped = new Map<string, ChallengeInfo[]>();
  for (const c of challenges.values()) {
    const cat = c.category.toLowerCase();
    if (!grouped.has(cat)) grouped.set(cat, []);
    grouped.get(cat)?.push(c);
  }
  for (const list of grouped.values()) list.sort((a, b) => a.value - b.value);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <TavernBackground />
      <div className="absolute right-6 top-6 z-40">
        <ProfileBadge />
      </div>
      <div className="relative z-30 mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-8 text-center font-quintessential text-3xl text-amber-100 md:text-4xl">
          The Quest Hall
        </h1>

        {!isAuthenticated && (
          <div className="mb-8 rounded-lg border border-amber-700/40 bg-amber-950/30 p-4 text-center backdrop-blur-md">
            <p className="font-medievalsharp text-amber-200/80">
              Sign in to track your quest progress and submit flags.{" "}
              <Link to="/" className="text-amber-300 underline hover:text-amber-100">
                Return to the gates
              </Link>
            </p>
          </div>
        )}

        {CATEGORY_ORDER.map((cat) => {
          const list = grouped.get(cat) ?? [];
          if (list.length === 0) return null;
          return (
            <section key={cat} className="mb-10">
              <h2 className="mb-4 border-b border-amber-800/30 pb-2 font-quintessential text-2xl text-amber-300/90">
                {CATEGORY_LABELS[cat] ?? cat}
              </h2>
              <ul className="grid gap-3 md:grid-cols-2">
                {list.map((c) => {
                  const solved = hasSolved(c.id);
                  return (
                    <li key={c.id}>
                      <Link
                        to={`/challenges/${slugify(c.name)}`}
                        state={{ challengeId: c.id }}
                        className={`block rounded-lg border-2 p-4 backdrop-blur-md transition ${
                          solved
                            ? "border-emerald-700/40 bg-emerald-950/20 hover:bg-emerald-900/30"
                            : "border-amber-700/30 bg-stone-900/40 hover:border-amber-600/50 hover:bg-stone-800/60"
                        }`}
                      >
                        <div className="flex items-baseline justify-between">
                          <h3 className="font-quintessential text-lg text-amber-100">
                            {solved ? "Solved: " : ""}
                            {c.name}
                          </h3>
                          <span className="font-quintessential text-amber-400 font-bold">
                            {c.value} GP
                          </span>
                        </div>
                        <p className="mt-1 font-medievalsharp text-xs text-amber-500/60">
                          {c.solves} {c.solves === 1 ? "adventurer has" : "adventurers have"} completed this quest
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
