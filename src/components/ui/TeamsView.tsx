import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import { useTeamsList } from "@/hooks/useTeamsList";
import type { TeamListEntry } from "@/hooks/useTeamsList";
import AdventurerModal from "@/components/modals/AdventurerModal";
import TeamSummaryModal from "@/components/modals/TeamSummaryModal";
import type { Team } from "@/hooks/useScoreboard";

const RANK_COLORS: Record<number, string> = {
  1: "bg-gradient-to-r from-yellow-700 to-yellow-500 text-yellow-100",
  2: "bg-gradient-to-r from-gray-500 to-gray-400 text-gray-100",
  3: "bg-gradient-to-r from-amber-800 to-amber-600 text-amber-100",
};

function teamListEntryToTeam(t: TeamListEntry, idx: number): Team {
  return {
    pos: idx + 1,
    name: t.name,
    score: t.members.reduce((sum, m) => sum + m.score, 0),
    teamId: t.id,
    affiliation: t.affiliation || undefined,
    country: t.country || undefined,
    website: t.website || undefined,
    members: t.members.map((m) => ({ id: m.id, name: m.name, score: m.score })),
  };
}

export default function TeamsView() {
  const { teams, loading, error } = useTeamsList();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ id: number; name: string; score: number } | null>(null);
  const [teamModalData, setTeamModalData] = useState<Team | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
        <p className="font-medievalsharp text-sm text-amber-400/50 tracking-wider">
          Summoning the guilds...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <span className="text-2xl">⚠️</span>
        <p className="font-medievalsharp text-sm text-red-400/60 text-center">{error}</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <span className="text-2xl">🛡️</span>
        <p className="font-quintessential text-base text-amber-300/50 text-center">
          No Guilds Found
        </p>
        <p className="font-medievalsharp text-xs text-amber-500/30 text-center">
          The realm awaits its champions...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0.5">
        {teams.map((team, idx) => {
          const isExpanded = expandedId === team.id;
          const totalScore = team.members.reduce((sum, m) => sum + m.score, 0);

          const rank = idx + 1;
          const isTopRank = rank <= 3;
          const rankClass = RANK_COLORS[rank] || "bg-stone-700 text-stone-300";

          return (
            <div key={team.id}>
              {/* Team row */}
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-amber-900/15 ${isTopRank ? "bg-amber-950/20" : "bg-transparent"}`}
                onClick={() => setExpandedId(isExpanded ? null : team.id)}
              >
                {/* Rank */}
                <span className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-sm font-bold font-quintessential shadow-sm ${rankClass}`}>
                  #{rank}
                </span>

                {/* Name + eye */}
                <div className="flex items-center gap-1.5 min-w-0 grow">
                  <span className={`min-w-0 truncate font-quintessential text-base ${isTopRank ? "text-amber-200 font-semibold" : "text-amber-100/80"}`}>
                    {team.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTeamModalData(teamListEntryToTeam(team, idx));
                    }}
                    className="shrink-0 p-1 rounded-md text-amber-600/30 hover:text-amber-400 hover:bg-amber-900/20 transition-colors"
                    title="View party details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info pills */}
                <div className="shrink-0 hidden sm:flex items-center gap-2 ml-auto">
                  {team.affiliation && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medievalsharp text-amber-400/50 bg-stone-800/40 border border-amber-900/15">
                      {team.affiliation}
                    </span>
                  )}
                  {team.country && (
                    <span className="text-xs text-amber-500/40 font-medievalsharp">
                      📍 {team.country}
                    </span>
                  )}
                  <span className="text-xs text-amber-600/40 font-medievalsharp">
                    {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-amber-700/20">│</span>
                  <span className="font-quintessential font-bold text-amber-400/70 tabular-nums">
                    {totalScore}
                  </span>
                  <span className="text-xs text-amber-600/50 font-medievalsharp">GP</span>
                </div>

                {/* Mobile score */}
                <div className="shrink-0 flex items-center gap-1 ml-auto sm:hidden">
                  <span className="font-quintessential font-bold text-amber-400/70 tabular-nums">
                    {totalScore}
                  </span>
                  <span className="text-xs text-amber-600/50 font-medievalsharp">GP</span>
                </div>
              </div>

              {/* Expanded members */}
              {isExpanded && team.members.length > 0 && (
                <div className="ml-11 mr-3 mb-2 mt-1 space-y-1">
                  {[...team.members]
                    .sort((a, b) => b.score - a.score)
                    .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between px-3 py-1.5 rounded bg-stone-800/20 border border-amber-900/10 text-sm cursor-pointer hover:bg-amber-900/15 transition-colors"
                        onClick={() => setSelectedMember({ id: member.id, name: member.name, score: member.score })}
                      >
                        <span className="text-amber-200/60 font-medievalsharp truncate">
                          🗡️ {member.name}
                        </span>
                        <span className="text-amber-400/50 font-quintessential ml-2 shrink-0">
                          {member.score} GP
                        </span>
                      </div>
                    ))}
                </div>
              )}
              {isExpanded && team.members.length === 0 && (
                <div className="ml-11 mr-3 mb-2 mt-1 px-3 py-2 text-xs text-amber-500/30 font-medievalsharp">
                  No members found
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Adventurer Modal */}
      <AnimatePresence>
        {selectedMember && (
          <AdventurerModal
            memberId={selectedMember.id}
            memberName={selectedMember.name}
            memberScore={selectedMember.score}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>

      {/* Team Summary Modal */}
      <AnimatePresence>
        {teamModalData && (
          <TeamSummaryModal
            team={teamModalData}
            onClose={() => setTeamModalData(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
