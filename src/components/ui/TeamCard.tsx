import { memo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import type { Team } from "@/hooks/useScoreboard";
import Counter from "@/components/animation/Counter";
import AdventurerModal from "@/components/modals/AdventurerModal";
import TeamSummaryModal from "@/components/modals/TeamSummaryModal";
import { useTheme } from "@/contexts/ThemeContext";

interface TeamCardProps {
  team: Team;
  isMock?: boolean;
}

function TeamCard({ team, isMock = false }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<{ id: number; name: string; score: number } | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const theme = useTheme();
  const isUserMode = theme.id !== "fantasy";
  const c = theme.classes;
  const isTopRank = team.pos <= 3;
  const RANK_COLORS: Record<number, string> = {
    1: c.rankBadge1,
    2: c.rankBadge2,
    3: c.rankBadge3,
  };
  const rankClass = RANK_COLORS[team.pos] || c.rankBadgeDefault;

  return (
    <div>
      {/* Main row — compact single line */}
      <div
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg ${!isUserMode || team.members ? "cursor-pointer" : ""}
          transition-all duration-200
          ${c.rowHover}
          ${isTopRank ? c.rowTopRankBg : "bg-transparent"}
        `}
        onClick={() => !isUserMode && setExpanded(!expanded)}
      >
        {/* Rank badge */}
        <span
          className={`
          shrink-0 w-8 h-8 rounded-md flex items-center justify-center
          text-sm font-bold font-quintessential shadow-sm
          ${rankClass}
        `}
        >
          #{team.pos}
        </span>

        {/* Team name + eye icon */}
        <div className="flex items-center gap-1.5 min-w-0 grow">
          <span
            className={`
            min-w-0 truncate ${c.fontHeading} text-base
            ${isTopRank ? "text-white font-semibold" : "text-white/80"}
          `}
          >
            {team.name}
          </span>
          {!isMock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isUserMode) {
                  setShowUserModal(true);
                } else {
                  setShowTeamModal(true);
                }
              }}
              className={`shrink-0 p-1 rounded-md ${c.eyeButton} transition-colors`}
              title="View details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right-aligned stats: quests | score GP — fixed total width keeps pipe aligned */}
        <div className="shrink-0 hidden sm:flex items-center ml-auto w-[250px]">
          {/* Quest count — fills left half, text pushed toward pipe */}
          <span className={`flex-1 text-xs ${c.statLabel} ${c.fontBody} text-right`}>
            ■ {team.solveCount ?? 0} {(team.solveCount ?? 0) !== 1 ? theme.labels.solveUnitPlural : theme.labels.solveUnit}
          </span>

          {/* Separator */}
          <span className={`shrink-0 ${c.separator} mx-3`}>│</span>

          {/* Score */}
          <span className="flex-1 flex items-center justify-end gap-1">
            <span
              className={`
                ${c.fontHeading} font-bold tabular-nums
                ${isTopRank ? c.scoreTop : c.scoreDefault}
              `}
            >
              <Counter
                value={team.score}
                fontSize={22}
                padding={8}
                horizontalPadding={0}
                gap={2}
                textColor="inherit"
                fontWeight="bold"
                gradientHeight={0}
              />
            </span>
            <span className={`text-xs ${c.fontBody} ${c.scoreUnit}`}>
              {theme.labels.scoreUnit}
            </span>
          </span>
        </div>

        {/* Mobile — score only, no pipe. Uses plain text to avoid duplicate Counter motion.spans */}
        <div className="shrink-0 flex items-center gap-1 ml-auto sm:hidden">
          <span
            className={`
              ${c.fontHeading} font-bold tabular-nums text-[22px]
              ${isTopRank ? c.scoreTop : c.scoreDefault}
            `}
          >
            {team.score}
          </span>
          <span className={`text-xs ${c.fontBody} ${c.scoreUnit}`}>{theme.labels.scoreUnit}</span>
        </div>
      </div>

      {/* Expanded members — compact sub-list */}
      {expanded && team.members && (
        <div className="ml-11 mr-3 mb-2 mt-1 space-y-1">
          {team.members
            .sort((a, b) => b.score - a.score)
            .map((member) => (
              <div
                key={member.id}
                className={`flex items-center justify-between px-3 py-1.5 rounded ${c.memberRow} text-sm ${!isMock ? `cursor-pointer ${c.rowHover}` : ""} transition-colors`}
                onClick={() => !isMock && setSelectedMemberId({ id: member.id, name: member.name, score: member.score })}
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

      {/* Adventurer Modal */}
      <AnimatePresence>
        {selectedMemberId && (
          <AdventurerModal
            memberId={selectedMemberId.id}
            memberName={selectedMemberId.name}
            memberScore={selectedMemberId.score}
            onClose={() => setSelectedMemberId(null)}
          />
        )}
      </AnimatePresence>

      {/* Team Summary Modal */}
      <AnimatePresence>
        {showTeamModal && (
          <TeamSummaryModal
            team={team}
            onClose={() => setShowTeamModal(false)}
          />
        )}
      </AnimatePresence>

      {/* User Detail Modal (user mode) */}
      <AnimatePresence>
        {showUserModal && team.teamId && (
          <AdventurerModal
            memberId={team.teamId}
            memberName={team.name}
            memberScore={team.score}
            onClose={() => setShowUserModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(TeamCard, (prev, next) => {
  const a = prev.team;
  const b = next.team;
  return (
    a.pos === b.pos &&
    a.name === b.name &&
    a.score === b.score &&
    a.members?.length === b.members?.length &&
    a.affiliation === b.affiliation &&
    a.solveCount === b.solveCount &&
    prev.isMock === next.isMock
  );
});
