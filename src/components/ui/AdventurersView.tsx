import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import type { Team, TeamMember } from "@/hooks/useScoreboard";
import AdventurerModal from "@/components/modals/AdventurerModal";
import { useTheme } from "@/contexts/ThemeContext";

interface RankedAdventurer extends TeamMember {
  teamName: string;
  rank: number;
}


interface AdventurersViewProps {
  teams: Team[];
  isMock: boolean;
}

export default function AdventurersView({ teams, isMock }: AdventurersViewProps) {
  const [modalTarget, setModalTarget] = useState<RankedAdventurer | null>(null);
  const theme = useTheme();
  const c = theme.classes;
  const RANK_COLORS: Record<number, string> = {
    1: c.rankBadge1,
    2: c.rankBadge2,
    3: c.rankBadge3,
  };
  const DEFAULT_RANK_CLASS = c.rankBadgeDefault;

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
        <span className="text-2xl">{theme.id === "fantasy" ? "🗡️" : "🏅"}</span>
        <p className={c.emptyTitle}>{theme.labels.emptyPlayers}</p>
        <p className={c.emptySubtitle}>
          {theme.id === "fantasy" ? "The guild hall is empty — no brave souls have joined yet..." : "No players have registered yet."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0.5">
        {/* Summary */}
        <div className="flex items-center justify-between px-3 pb-1">
          <span className={`${c.summaryLabel}`}>
            {adventurers.length} {theme.id === "fantasy" ? `adventurer${adventurers.length !== 1 ? "s" : ""}` : `player${adventurers.length !== 1 ? "s" : ""}`}
          </span>
          <span className={c.summaryValue}>
            {adventurers.reduce((sum, a) => sum + a.score, 0)} {theme.labels.scoreUnit} total
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
                ${isTopRank ? c.rowTopRankBg : "bg-transparent"}
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
                    min-w-0 truncate ${c.fontHeading} text-base
                    ${isTopRank ? "text-white font-semibold" : "text-white/80"}
                  `}
                >
                  {adv.name}
                </span>
                {!isMock && (
                  <button
                    onClick={() => setModalTarget(adv)}
                    className={`shrink-0 p-1 rounded-md ${c.eyeButton} transition-colors`}
                    title="View details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right-aligned stats: team | score */}
              <div className="shrink-0 hidden sm:flex items-center ml-auto w-[250px]">
                <span className={`flex-1 text-xs ${c.statLabel} ${c.fontBody} text-right truncate`}>
                  {adv.teamName}
                </span>
                <span className={`shrink-0 ${c.separator} mx-3`}>│</span>
                <span className="flex-1 flex items-center justify-end gap-1">
                  <span
                    className={`
                      ${c.fontHeading} font-bold tabular-nums
                      ${isTopRank ? c.scoreTop : c.scoreDefault}
                      text-[22px]
                    `}
                  >
                    {adv.score}
                  </span>
                  <span className={`text-xs ${c.fontBody} ${c.scoreUnit}`}>{theme.labels.scoreUnit}</span>
                </span>
              </div>

              {/* Mobile score */}
              <div className="shrink-0 flex items-center gap-1 ml-auto sm:hidden">
                <span className={`${c.fontHeading} font-bold ${c.scoreDefault} tabular-nums`}>
                  {adv.score}
                </span>
                <span className={`text-xs ${c.fontBody} ${c.scoreUnit}`}>{theme.labels.scoreUnit}</span>
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
