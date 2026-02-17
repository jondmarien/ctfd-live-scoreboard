import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useChallengeCache, type ChallengeInfo } from "@/hooks/useChallengeCache";
import QuestModal from "@/components/modals/QuestModal";

// Category → color mapping
const CATEGORY_COLORS: Record<string, string> = {
  web: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  crypto: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  pwn: "bg-red-500/20 text-red-300 border-red-500/30",
  reverse: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  forensics: "bg-green-500/20 text-green-300 border-green-500/30",
  misc: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  osint: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  stego: "bg-pink-500/20 text-pink-300 border-pink-500/30",
};

function getCategoryColor(category: string): string {
  const key = category.toLowerCase().trim();
  for (const [k, v] of Object.entries(CATEGORY_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "bg-amber-500/20 text-amber-300 border-amber-500/30";
}

export default function ChallengesView({ onLastUpdate }: { onLastUpdate?: (d: Date | null) => void }) {
  const { challenges, lastUpdate, isMock } = useChallengeCache();
  const [selectedQuest, setSelectedQuest] = useState<ChallengeInfo | null>(null);

  // Bubble lastUpdate up to parent
  useEffect(() => {
    if (onLastUpdate && lastUpdate) onLastUpdate(lastUpdate);
  }, [onLastUpdate, lastUpdate]);

  if (challenges.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <span className="text-2xl">⚔️</span>
        <p className="font-quintessential text-base text-amber-300/50 text-center">
          No Quests Available
        </p>
        <p className="font-medievalsharp text-xs text-amber-500/30 text-center">
          The quest board is empty — quests haven't been released yet...
        </p>
      </div>
    );
  }

  // Group by category
  const challengeArr = Array.from(challenges.values());
  const grouped = new Map<string, ChallengeInfo[]>();
  for (const c of challengeArr) {
    if (!grouped.has(c.category)) grouped.set(c.category, []);
    grouped.get(c.category)!.push(c);
  }
  const categories = Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <>
    <div className="space-y-4 px-1">
      {/* Mock data banner */}
      {isMock && (
        <div className="mx-2 px-3 py-1.5 rounded-lg bg-amber-900/20 border border-amber-700/20 text-center">
          <span className="font-medievalsharp text-[10px] text-amber-400/50 uppercase tracking-wider">
            Sample quests — real quests appear when the competition begins
          </span>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between px-2">
        <span className="font-medievalsharp text-xs text-amber-500/50 uppercase tracking-wider">
          {challengeArr.length} quest{challengeArr.length !== 1 ? "s" : ""} across {categories.length} realm{categories.length !== 1 ? "s" : ""}
        </span>
        <span className="font-quintessential text-xs text-amber-400/50">
          {challengeArr.reduce((sum, c) => sum + c.value, 0)} GP total
        </span>
      </div>

      {/* Categories */}
      {categories.map(([category, challs]) => (
        <div key={category} className="space-y-1.5">
          <div className="flex items-center gap-2 px-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(category)}`}
            >
              {category}
            </span>
            <span className="text-amber-600/30 text-xs font-medievalsharp">
              {challs.length} quest{challs.length !== 1 ? "s" : ""}
            </span>
          </div>
          {challs
            .sort((a, b) => a.value - b.value)
            .map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-800/30 border border-amber-900/10 cursor-pointer hover:bg-stone-800/50 transition-colors"
                onClick={() => setSelectedQuest(challenge)}
              >
                <div className="flex flex-col min-w-0 mr-3">
                  <span className="text-amber-200/70 font-medievalsharp text-sm truncate">
                    {challenge.name}
                  </span>
                  <span className="text-amber-500/30 font-medievalsharp text-[10px]">
                    {challenge.type} • {challenge.solves} solve{challenge.solves !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-amber-400/60 font-quintessential text-sm font-bold shrink-0">
                  {challenge.value} GP
                </span>
              </div>
            ))}
        </div>
      ))}
    </div>

    {/* Quest Detail Modal */}
    <AnimatePresence>
      {selectedQuest && (
        <QuestModal
          quest={selectedQuest}
          isMock={isMock}
          onClose={() => setSelectedQuest(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
