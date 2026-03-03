import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import { useTeamsList } from "@/hooks/useTeamsList";
import type { TeamListEntry } from "@/hooks/useTeamsList";
import AdventurerModal from "@/components/modals/AdventurerModal";
import TeamSummaryModal from "@/components/modals/TeamSummaryModal";
import type { Team } from "@/hooks/useScoreboard";
import { useTheme } from "@/contexts/ThemeContext";

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

export default function TeamsView({ onLastUpdate }: { onLastUpdate?: (d: Date | null) => void }) {
  const { teams, loading, error, lastUpdate } = useTeamsList();
  const theme = useTheme();
  const c = theme.classes;

  // Bubble lastUpdate up to parent
  useEffect(() => {
    if (onLastUpdate && lastUpdate) onLastUpdate(lastUpdate);
  }, [onLastUpdate, lastUpdate]);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ id: number; name: string; score: number } | null>(null);
  const [teamModalData, setTeamModalData] = useState<Team | null>(null);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className={`w-6 h-6 border-2 ${c.spinnerBorder} rounded-full animate-spin`} />
        <p className={c.loadingText}>{theme.labels.loadingTeams}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <span className="text-2xl">⚠️</span>
        <p className={`${c.fontBody} text-sm text-red-400/60 text-center`}>{error}</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <span className="text-2xl">{theme.id === "fantasy" ? "🛡️" : "👥"}</span>
        <p className={c.emptyTitle}>{theme.labels.emptyTeams}</p>
        <p className={c.emptySubtitle}>
          {theme.id === "fantasy" ? "The realm awaits its champions..." : "No teams have registered yet."}
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

          return (
            <div key={team.id}>
              {/* Team row */}
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${c.rowHover} bg-transparent`}
                onClick={() => setExpandedId(isExpanded ? null : team.id)}
              >
                {/* Name + eye */}
                <div className="flex items-center gap-1.5 min-w-0 grow">
                  <span className={`min-w-0 truncate ${c.fontHeading} text-base text-white/80`}>
                    {team.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTeamModalData(teamListEntryToTeam(team, idx));
                    }}
                    className={`shrink-0 p-1 rounded-md ${c.eyeButton} transition-colors`}
                    title="View details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info pills + stats — fixed width to match scoreboard alignment */}
                <div className="shrink-0 hidden sm:flex items-center ml-auto w-[250px]">
                  {/* Left side: member count */}
                  <div className="flex-1 flex items-center justify-end gap-2">
                    <span className={`text-xs ${c.statLabel} ${c.fontBody} shrink-0`}>
                      ■ {team.members.length} member{team.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {/* Separator */}
                  <span className={`shrink-0 ${c.separator} mx-3`}>│</span>
                  {/* Score */}
                  <span className="flex-1 flex items-center justify-end gap-1">
                    <span className={`${c.fontHeading} font-bold ${c.scoreDefault} tabular-nums text-[22px]`}>
                      {totalScore}
                    </span>
                    <span className={`text-xs ${c.fontBody} ${c.scoreUnit}`}>{theme.labels.scoreUnit}</span>
                  </span>
                </div>

                {/* Mobile score */}
                <div className="shrink-0 flex items-center gap-1 ml-auto sm:hidden">
                  <span className={`${c.fontHeading} font-bold ${c.scoreDefault} tabular-nums`}>
                    {totalScore}
                  </span>
                  <span className={`text-xs ${c.fontBody} ${c.scoreUnit}`}>{theme.labels.scoreUnit}</span>
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
                        className={`flex items-center justify-between px-3 py-1.5 rounded ${c.memberRow} text-sm cursor-pointer ${c.rowHover} transition-colors`}
                        onClick={() => setSelectedMember({ id: member.id, name: member.name, score: member.score })}
                      >
                        <span className={`${c.memberName} ${c.fontBody} truncate`}>
                          {theme.labels.memberPrefix} {member.name}
                        </span>
                        <span className={`${c.memberScore} ${c.fontHeading} ml-2 shrink-0`}>
                          {member.score} {theme.labels.scoreUnit}
                        </span>
                      </div>
                    ))}
                </div>
              )}
              {isExpanded && team.members.length === 0 && (
                <div className={`ml-11 mr-3 mb-2 mt-1 px-3 py-2 text-xs ${c.statLabel} ${c.fontBody}`}>
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
