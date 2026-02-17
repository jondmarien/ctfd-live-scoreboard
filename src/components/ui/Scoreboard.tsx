import { useState } from "react";
import { useScoreboard } from "@/hooks/useScoreboard";
import TeamCard from "@/components/ui/TeamCard";
import AnimatedContent from "@/components/animation/AnimatedContent";
import ViewSelector, { type ViewTab } from "@/components/ui/ViewSelector";
import TeamsView from "@/components/ui/TeamsView";
import ChallengesView from "@/components/ui/ChallengesView";

export default function Scoreboard() {
  const { teams, loading, lastUpdate, isMock } = useScoreboard();
  const [activeView, setActiveView] = useState<ViewTab>("scoreboard");
  const [viewLastUpdate, setViewLastUpdate] = useState<Date | null>(null);

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

        {/* Gold-bordered container */}
        <div
          className="
          rounded-xl overflow-hidden
          border-2 border-amber-600/40
          bg-stone-950/50 backdrop-blur-md
          shadow-[0_0_30px_rgba(255,165,0,0.06)]
        "
        >
          {/* Top ornament */}
          <div className="flex justify-center -mb-1 pt-2">
            <span className="text-amber-500/50 text-sm">⚜</span>
          </div>

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
            {activeView === "challenges" && <ChallengesView onLastUpdate={setViewLastUpdate} />}
          </div>

          {/* Timestamp footer */}
          {(() => {
            const ts = activeView === "scoreboard" ? lastUpdate : viewLastUpdate;
            return ts ? (
              <div className="flex items-center justify-between px-4 py-2 border-t border-amber-800/20 bg-stone-950/30">
                <span className="font-medievalsharp text-xs text-amber-500/50">
                  🔮 LAST SCRYING:
                </span>
                <span className="font-quintessential text-xs text-amber-400/60">
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
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
      <p className="font-medievalsharp text-sm text-amber-400/50 tracking-wider">
        Consulting the Oracle...
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <span className="text-2xl">⚠️</span>
      <p className="font-quintessential text-base text-amber-300/60 text-center">
        No Adventurers Have Joined
      </p>
      <p className="font-medievalsharp text-xs text-amber-500/40 text-center">
        The guild awaits brave souls...
      </p>
    </div>
  );
}
