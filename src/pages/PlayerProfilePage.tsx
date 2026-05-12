import { Link, useParams } from "react-router-dom";
import TavernBackground from "@/components/background/TavernBackground";
import ProfileBadge from "@/components/ui/ProfileBadge";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlayerAwards } from "@/hooks/usePlayerAwards";

const CATEGORY_ICONS: Record<string, string> = {
  crypto: "🗝️",
  prog: "⚙️",
  llm: "🦜",
  osint: "🔭",
  rev: "📜",
  misc: "🌒",
  web: "🌐",
};

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const playerId = Number(id);
  const { profile, solves, loading, error } = usePlayer(playerId);
  const awards = usePlayerAwards(playerId);

  if (loading) {
    return (
      <Shell>
        <p className="font-medievalsharp text-amber-300/70">Consulting the oracle...</p>
      </Shell>
    );
  }

  if (error || !profile) {
    return (
      <Shell>
        <p className="font-medievalsharp text-red-400/70">No adventurer found.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <header className="mb-8">
        <h1 className="font-quintessential text-3xl text-amber-100">{profile.name}</h1>
        <div className="mt-2 flex flex-wrap gap-6 font-medievalsharp text-amber-300/80">
          <span>
            <span className="font-quintessential text-amber-400">{profile.score}</span> GP
          </span>
          {profile.place !== null && (
            <span>
              Rank <span className="font-quintessential text-amber-400">#{profile.place}</span>
            </span>
          )}
          {profile.country && <span>{profile.country}</span>}
          {profile.affiliation && <span>{profile.affiliation}</span>}
        </div>
      </header>

      <section>
        {awards.length > 0 && (
          <section className="mb-6">
            <h2 className="mb-3 font-quintessential text-xl text-amber-200">
              Honours ({awards.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {awards.map((award) => (
                <div
                  key={award.id}
                  className="rounded-lg border border-amber-600/60 bg-amber-900/30 px-3 py-1.5 backdrop-blur-md"
                >
                  <span className="font-quintessential text-sm text-amber-100">{award.name}</span>
                  {award.description && (
                    <span className="ml-2 font-medievalsharp text-xs text-amber-300/70">
                      — {award.description}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <h2 className="mb-3 font-quintessential text-xl text-amber-200">
          Quest Log ({solves.length})
        </h2>
        {solves.length === 0 ? (
          <p className="font-medievalsharp italic text-amber-500/60">No quests completed yet.</p>
        ) : (
          <ul className="space-y-2">
            {solves.map((solve) => (
              <li
                key={`${solve.challenge_id}-${solve.date}`}
                className="flex items-baseline justify-between rounded-lg border border-amber-800/20 bg-stone-900/40 p-3"
              >
                <div className="flex items-center gap-2">
                  <span>{CATEGORY_ICONS[solve.challenge.category.toLowerCase()] ?? "•"}</span>
                  <Link
                    to={`/challenges/${slugify(solve.challenge.name)}`}
                    className="font-medievalsharp text-amber-200 hover:text-amber-100"
                  >
                    {solve.challenge.name}
                  </Link>
                </div>
                <div className="flex gap-3 text-sm">
                  <span className="font-quintessential text-amber-400">{solve.challenge.value} GP</span>
                  <span className="text-xs text-amber-500/60">
                    {new Date(solve.date).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <TavernBackground />
      <div className="absolute right-6 top-6 z-40">
        <ProfileBadge />
      </div>
      <div className="relative z-30 mx-auto max-w-3xl px-6 py-12">
        <Link
          to="/scoreboard"
          className="font-medievalsharp text-sm text-amber-400/60 hover:text-amber-300"
        >
          Scoreboard
        </Link>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

