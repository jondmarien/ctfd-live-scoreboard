import { Link } from "react-router-dom";
import { useChallengeSolves } from "@/hooks/useChallengeSolves";

interface SolvesPanelProps {
  challengeId: number;
}

export default function SolvesPanel({ challengeId }: SolvesPanelProps) {
  const { solves, loading } = useChallengeSolves(challengeId);

  if (loading) return null;

  if (solves.length === 0) {
    return (
      <section className="mb-6 rounded-lg border border-amber-800/30 bg-stone-900/30 p-4">
        <p className="font-medievalsharp text-sm text-amber-500/60 italic">
          No adventurer has yet vanquished this quest.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-6 rounded-lg border border-amber-800/30 bg-stone-900/30 p-4">
      <h3 className="mb-2 font-quintessential text-base text-amber-200">
        {solves.length} {solves.length === 1 ? "Victor" : "Victors"}
      </h3>
      <ul className="space-y-1 text-sm">
        {solves.slice(0, 10).map((solve, index) => (
          <li key={`${solve.account_id}-${solve.date}`} className="flex justify-between font-medievalsharp text-amber-300/80">
            <Link to={`/players/${solve.account_id}`} className="hover:text-amber-100">
              {index === 0 && <span className="mr-1" title="First blood">🩸</span>}
              {solve.name}
            </Link>
            <span className="text-xs text-amber-500/60">{new Date(solve.date).toLocaleString()}</span>
          </li>
        ))}
      </ul>
      {solves.length > 10 && (
        <p className="mt-2 font-medievalsharp text-xs text-amber-500/60">
          and {solves.length - 10} more...
        </p>
      )}
    </section>
  );
}

