import { useState } from "react";
import { useScoreboard } from "@/hooks/useScoreboard";
import TeamCard from "@/components/ui/TeamCard";
import AnimatedContent from "@/components/animation/AnimatedContent";
import ViewSelector, { type ViewTab } from "@/components/ui/ViewSelector";
import TeamsView from "@/components/ui/TeamsView";
import ChallengesView from "@/components/ui/ChallengesView";
import AdventurersView from "@/components/ui/AdventurersView";
import ChangelogView from "@/components/ui/ChangelogView";
import ScoreboardGraph from "@/components/ui/ScoreboardGraph";
import { useTheme } from "@/contexts/ThemeContext";

export default function Scoreboard() {
  const { teams, loading, lastUpdate, isMock } = useScoreboard();
  const [activeView, setActiveView] = useState<ViewTab>("scoreboard");
  const [viewLastUpdate, setViewLastUpdate] = useState<Date | null>(null);
  const theme = useTheme();
  const c = theme.classes;

  return (
    <main className="relative z-30 w-full max-w-2xl mx-auto px-4 pb-12">
      <AnimatedContent
        distance={20}
        direction="vertical"
        duration={0.6}
        delay={0.6}
      >
        {/* Pill selector */}
        <ViewSelector active={activeView} onChange={setActiveView} />

        {/* Themed container */}
        <div
          className={`rounded-xl overflow-hidden ${c.cardBorder} ${c.cardBg} ${c.cardShadow}`}
        >
          {/* Top ornament */}
          <div className="flex justify-center -mb-1 pt-2">
            <span className={c.ornament}>⚜</span>
          </div>

          {/* Scoreboard graph — shown above team list */}
          {activeView === "scoreboard" && <ScoreboardGraph />}

          {/* Content area */}
          <div className="px-2 py-2 space-y-0.5">
            {activeView === "scoreboard" && (
              <>
                {loading && teams.length === 0 ? (
                  <LoadingState />
                ) : teams.length === 0 ? (
                  <EmptyState />
                ) : (
                  teams.map((team) => <TeamCard key={team.pos} team={team} isMock={isMock} />)
                )}
              </>
            )}
            {activeView === "teams" && <TeamsView onLastUpdate={setViewLastUpdate} />}
            {activeView === "adventurers" && <AdventurersView teams={teams} isMock={isMock} />}
            {activeView === "quests" && <ChallengesView onLastUpdate={setViewLastUpdate} />}
            {activeView === "changelog" && <ChangelogView />}
          </div>

          {/* Timestamp footer */}
          {(() => {
            const ts = activeView === "scoreboard" ? lastUpdate : viewLastUpdate;
            return ts ? (
              <div className={`flex items-center justify-between px-4 py-2 ${c.footerBorder} ${c.footerBg}`}>
                <span className={c.footerText}>
                  {theme.labels.lastUpdate}
                </span>
                <span className={c.footerTimestamp}>
                  {ts.toLocaleString()}
                </span>
              </div>
            ) : null;
          })()}
        </div>
      </AnimatedContent>
    </main>
  );
}

function LoadingState() {
  const theme = useTheme();
  const c = theme.classes;
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`w-6 h-6 border-2 ${c.spinnerBorder} rounded-full animate-spin`} />
      <p className={c.loadingText}>
        {theme.labels.loadingScoreboard}
      </p>
    </div>
  );
}

function EmptyState() {
  const theme = useTheme();
  const c = theme.classes;
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <span className="text-2xl">⚠️</span>
      <p className={c.emptyTitle}>
        {theme.labels.emptyScoreboard}
      </p>
      <p className={c.emptySubtitle}>
        {theme.id === "fantasy" ? "The guild awaits brave souls..." : "The competition hasn't started yet."}
      </p>
    </div>
  );
}
