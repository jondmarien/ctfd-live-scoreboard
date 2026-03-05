import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import { useUsersList } from "@/hooks/useUsersList";
import type { UserListEntry } from "@/hooks/useUsersList";
import AdventurerModal from "@/components/modals/AdventurerModal";
import { useTheme } from "@/contexts/ThemeContext";

export default function PlayersView({ onLastUpdate }: { onLastUpdate?: (d: Date | null) => void }) {
  const { users, loading, error, lastUpdate } = useUsersList();
  const theme = useTheme();
  const c = theme.classes;

  // Bubble lastUpdate up to parent
  useEffect(() => {
    if (onLastUpdate && lastUpdate) onLastUpdate(lastUpdate);
  }, [onLastUpdate, lastUpdate]);

  const [selectedUser, setSelectedUser] = useState<UserListEntry | null>(null);

  const RANK_COLORS: Record<number, string> = {
    1: c.rankBadge1,
    2: c.rankBadge2,
    3: c.rankBadge3,
  };
  const DEFAULT_RANK_CLASS = c.rankBadgeDefault;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className={`w-6 h-6 border-2 ${c.spinnerBorder} rounded-full animate-spin`} />
        <p className={c.loadingText}>{theme.labels.loadingPlayers}</p>
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

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <span className="text-2xl">🏅</span>
        <p className={c.emptyTitle}>{theme.labels.emptyPlayers}</p>
        <p className={c.emptySubtitle}>No players have registered yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-0.5">
        {/* Summary */}
        <div className="flex items-center justify-between px-3 pb-1">
          <span className={c.summaryLabel}>
            {users.length} player{users.length !== 1 ? "s" : ""}
          </span>
          <span className={c.summaryValue}>
            {users.reduce((sum, u) => sum + u.score, 0)} {theme.labels.scoreUnit} total
          </span>
        </div>

        {users.map((user, idx) => {
          const rank = idx + 1;
          const isTopRank = rank <= 3;
          const rankClass = RANK_COLORS[rank] ?? DEFAULT_RANK_CLASS;

          return (
            <div
              key={user.id}
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
                #{rank}
              </span>

              {/* Name + eye icon */}
              <div className="flex items-center gap-1.5 min-w-0 grow">
                <span
                  className={`
                    min-w-0 truncate ${c.fontHeading} text-base
                    ${isTopRank ? "text-white font-semibold" : "text-white/80"}
                  `}
                >
                  {user.name}
                </span>
                <button
                  onClick={() => setSelectedUser(user)}
                  className={`shrink-0 p-1 rounded-md ${c.eyeButton} transition-colors`}
                  title="View details"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Right-aligned stats: affiliation | score */}
              <div className="shrink-0 hidden sm:flex items-center ml-auto w-[250px]">
                <span className={`flex-1 text-xs ${c.statLabel} ${c.fontBody} text-right truncate`}>
                  {user.affiliation || "—"}
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
                    {user.score}
                  </span>
                  <span className={`text-xs ${c.fontBody} ${c.scoreUnit}`}>{theme.labels.scoreUnit}</span>
                </span>
              </div>

              {/* Mobile score */}
              <div className="shrink-0 flex items-center gap-1 ml-auto sm:hidden">
                <span className={`${c.fontHeading} font-bold ${c.scoreDefault} tabular-nums`}>
                  {user.score}
                </span>
                <span className={`text-xs ${c.fontBody} ${c.scoreUnit}`}>{theme.labels.scoreUnit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adventurer Modal */}
      <AnimatePresence>
        {selectedUser && (
          <AdventurerModal
            memberId={selectedUser.id}
            memberName={selectedUser.name}
            memberScore={selectedUser.score}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
