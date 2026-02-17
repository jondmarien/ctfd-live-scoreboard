import { memo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import type { Team } from "@/hooks/useScoreboard";
import Counter from "@/components/animation/Counter";
import AdventurerModal from "@/components/modals/AdventurerModal";
import TeamSummaryModal from "@/components/modals/TeamSummaryModal";

const RANK_COLORS: Record<number, string> = {
  1: "bg-gradient-to-r from-yellow-700 to-yellow-500 text-yellow-100",
  2: "bg-gradient-to-r from-gray-500 to-gray-400 text-gray-100",
  3: "bg-gradient-to-r from-amber-800 to-amber-600 text-amber-100",
};

interface TeamCardProps {
  team: Team;
  isMock?: boolean;
}

function TeamCard({ team, isMock = false }: TeamCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<{ id: number; name: string; score: number } | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const isTopRank = team.pos <= 3;
  const rankClass = RANK_COLORS[team.pos] || "bg-stone-700 text-stone-300";

  return (
    <div>
      {/* Main row — compact single line */}
      <div
        className={`
          flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
          transition-all duration-200
          hover:bg-amber-900/15
          ${isTopRank ? "bg-amber-950/20" : "bg-transparent"}
        `}
        onClick={() => setExpanded(!expanded)}
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
            min-w-0 truncate font-quintessential text-base
            ${isTopRank ? "text-amber-200 font-semibold" : "text-amber-100/80"}
          `}
          >
            {team.name}
          </span>
          {!isMock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTeamModal(true);
              }}
              className="shrink-0 p-1 rounded-md text-amber-600/30 hover:text-amber-400 hover:bg-amber-900/20 transition-colors"
              title="View party details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right-aligned stats: quests | score GP — fixed total width keeps pipe aligned */}
        <div className="shrink-0 hidden sm:flex items-center ml-auto w-[250px]">
          {/* Quest count — fills left half, text pushed toward pipe */}
          <span className="flex-1 text-xs text-amber-600/40 font-medievalsharp text-right">
            ■ {team.members ? team.members.length : 0} quest{team.members && team.members.length !== 1 ? "s" : ""}
          </span>

          {/* Separator — fixed in center of the 250px container */}
          <span className="shrink-0 text-amber-700/20 mx-3">│</span>

          {/* Score + GP — fills right half, content pushed right */}
          <span className="flex-1 flex items-center justify-end gap-1">
            <span
              className={`
                font-quintessential font-bold tabular-nums
                ${isTopRank ? "text-amber-400" : "text-amber-400/70"}
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
            <span className="text-xs text-amber-600/50 font-medievalsharp">
              GP
            </span>
          </span>
        </div>

        {/* Mobile — score only, no pipe. Uses plain text to avoid duplicate Counter motion.spans */}
        <div className="shrink-0 flex items-center gap-1 ml-auto sm:hidden">
          <span
            className={`
              font-quintessential font-bold tabular-nums text-[22px]
              ${isTopRank ? "text-amber-400" : "text-amber-400/70"}
            `}
          >
            {team.score}
          </span>
          <span className="text-xs text-amber-600/50 font-medievalsharp">GP</span>
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
                className={`flex items-center justify-between px-3 py-1.5 rounded bg-stone-800/20 border border-amber-900/10 text-sm ${!isMock ? "cursor-pointer hover:bg-amber-900/15" : ""} transition-colors`}
                onClick={() => !isMock && setSelectedMemberId({ id: member.id, name: member.name, score: member.score })}
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
    prev.isMock === next.isMock
  );
});
