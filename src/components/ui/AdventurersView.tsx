import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import type { Team, TeamMember } from "@/hooks/useScoreboard";
import AdventurerModal from "@/components/modals/AdventurerModal";

interface RankedAdventurer extends TeamMember {
  teamName: string;
  rank: number;
}

const RANK_COLORS: Record<number, string> = {
  1: "bg-gradient-to-r from-yellow-700 to-yellow-500 text-yellow-100",
  2: "bg-gradient-to-r from-gray-500 to-gray-400 text-gray-100",
  3: "bg-gradient-to-r from-amber-800 to-amber-600 text-amber-100",
};
const DEFAULT_RANK_CLASS = "bg-stone-700 text-stone-300";

interface AdventurersViewProps {
  teams: Team[];
  isMock: boolean;
}

export default function AdventurersView({ teams, isMock }: AdventurersViewProps) {
  const [modalTarget, setModalTarget] = useState<RankedAdventurer | null>(null);

  const adventurers = useMemo<RankedAdventurer[]>(() => {
    const seen = new Map<number, RankedAdventurer>();
    for (const team of teams) {
      if (!team.members) continue;
      for (const m of team.members) {
        const existing = seen.get(m.id);
        // Keep the entry with the higher score (shouldn't differ, but just in case)
        if (!existing || m.score > existing.score) {
          seen.set(m.id, { ...m, teamName: team.name, rank: 0 });
        }
      }
    }
    const sorted = Array.from(seen.values()).sort((a, b) => b.score - a.score);
    sorted.forEach((a, i) => { a.rank = i + 1; });
    return sorted;
  }, [teams]);

  if (adventurers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <span className="text-2xl">🗡️</span>
        <p className="font-quintessential text-base text-amber-300/50 text-center">
          No Adventurers Found
        </p>
        <p className="font-medievalsharp text-xs text-amber-500/30 text-center">
          The guild hall is empty — no brave souls have joined yet...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0.5">
        {/* Summary */}
        <div className="flex items-center justify-between px-3 pb-1">
          <span className="font-medievalsharp text-xs text-amber-500/50 uppercase tracking-wider">
            {adventurers.length} adventurer{adventurers.length !== 1 ? "s" : ""}
          </span>
          <span className="font-quintessential text-xs text-amber-400/50">
            {adventurers.reduce((sum, a) => sum + a.score, 0)} GP total
          </span>
        </div>

        {adventurers.map((adv) => {
          const isTopRank = adv.rank <= 3;
          const rankClass = RANK_COLORS[adv.rank] ?? DEFAULT_RANK_CLASS;

          return (
            <div
              key={adv.id}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200
                ${isTopRank ? "bg-amber-950/20" : "bg-transparent"}
              `}
            >
              {/* Rank badge */}
              <span
                className={`
                  shrink-0 w-8 h-8 rounded-md flex items-center justify-center
                  text-sm font-bold font-quintessential shadow-sm
                  ${rankClass}
                `}
              >
                #{adv.rank}
              </span>

              {/* Name + eye icon */}
              <div className="flex items-center gap-1.5 min-w-0 grow">
                <span
                  className={`
                    min-w-0 truncate font-quintessential text-base
                    ${isTopRank ? "text-amber-200 font-semibold" : "text-amber-100/80"}
                  `}
                >
                  {adv.name}
                </span>
                {!isMock && (
                  <button
                    onClick={() => setModalTarget(adv)}
                    className="shrink-0 p-1 rounded-md text-amber-600/30 hover:text-amber-400 hover:bg-amber-900/20 transition-colors"
                    title="View adventurer details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right-aligned stats: team | score GP */}
              <div className="shrink-0 hidden sm:flex items-center ml-auto w-[250px]">
                {/* Team name pill */}
                <span className="flex-1 text-xs text-amber-600/40 font-medievalsharp text-right truncate">
                  {adv.teamName}
                </span>

                {/* Separator */}
                <span className="shrink-0 text-amber-700/20 mx-3">│</span>

                {/* Score + GP */}
                <span className="flex-1 flex items-center justify-end gap-1">
                  <span
                    className={`
                      font-quintessential font-bold tabular-nums
                      ${isTopRank ? "text-amber-400" : "text-amber-400/70"}
                      text-[22px]
                    `}
                  >
                    {adv.score}
                  </span>
                  <span className="text-xs text-amber-600/50 font-medievalsharp">GP</span>
                </span>
              </div>

              {/* Mobile score */}
              <div className="shrink-0 flex items-center gap-1 ml-auto sm:hidden">
                <span className="font-quintessential font-bold text-amber-400/70 tabular-nums">
                  {adv.score}
                </span>
                <span className="text-xs text-amber-600/50 font-medievalsharp">GP</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adventurer Modal */}
      <AnimatePresence>
        {modalTarget && (
          <AdventurerModal
            memberId={modalTarget.id}
            memberName={modalTarget.name}
            memberScore={modalTarget.score}
            onClose={() => setModalTarget(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
