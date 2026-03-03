import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useChallengeCache, type ChallengeInfo } from "@/hooks/useChallengeCache";
import QuestModal from "@/components/modals/QuestModal";
import { useTheme } from "@/contexts/ThemeContext";

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

interface QuestIntelSectionProps {
  title: string;
  icon: string;
  quests: ChallengeInfo[];
  onSelect: (q: ChallengeInfo) => void;
  emptyText: string;
  accentClass: string;
}

function QuestIntelSection({ title, icon, quests, onSelect, emptyText, accentClass }: QuestIntelSectionProps) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const c = theme.classes;

  return (
    <div className={`rounded-lg ${c.questSectionBorder} ${c.questSectionBg} overflow-hidden`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 ${c.graphToggleBorder} transition-colors group`}
      >
        <span className={`${c.fontBody} text-xs ${c.graphToggleText} flex items-center gap-2`}>
          <span>{icon}</span>
          {title}
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${accentClass}`}>
            {quests.length}
          </span>
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <ChevronDown className="w-3 h-3 text-current opacity-40 group-hover:opacity-60 transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-2 pb-2 space-y-0.5">
              {quests.length === 0 ? (
                <p className={`text-center py-3 ${c.fontBody} text-xs ${c.statLabel}`}>
                  {emptyText}
                </p>
              ) : (
                quests.map((q) => (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg ${c.questRow} cursor-pointer transition-colors`}
                    onClick={() => onSelect(q)}
                  >
                    <div className="flex items-center gap-2 min-w-0 mr-3">
                      <span
                        className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getCategoryColor(q.category)}`}
                      >
                        {q.category}
                      </span>
                      <span className={`${c.questName} truncate`}>
                        {q.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`${c.questMeta}`}>
                        {q.solves} solve{q.solves !== 1 ? "s" : ""}
                      </span>
                      <span className={c.questScore}>
                        {q.value} {theme.labels.scoreUnit}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChallengesView({ onLastUpdate }: { onLastUpdate?: (d: Date | null) => void }) {
  const { challenges, lastUpdate, isMock } = useChallengeCache();
  const [selectedQuest, setSelectedQuest] = useState<ChallengeInfo | null>(null);
  const theme = useTheme();
  const c = theme.classes;

  // Bubble lastUpdate up to parent
  useEffect(() => {
    if (onLastUpdate && lastUpdate) onLastUpdate(lastUpdate);
  }, [onLastUpdate, lastUpdate]);

  if (challenges.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <span className="text-2xl">{theme.id === "fantasy" ? "⚔️" : "🔓"}</span>
        <p className={c.emptyTitle}>{theme.labels.emptyChallenges}</p>
        <p className={c.emptySubtitle}>
          {theme.id === "fantasy" ? "The quest board is empty — quests haven't been released yet..." : "No challenges have been released yet."}
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

  // Solve intel sections
  const solved = challengeArr.filter((c) => c.solves > 0);
  const mostConquered = [...solved].sort((a, b) => b.solves - a.solves).slice(0, 5);
  const leastConquered = [...solved].sort((a, b) => a.solves - b.solves).slice(0, 5);
  const unconquered = challengeArr.filter((c) => c.solves === 0);

  return (
    <>
    <div className="space-y-4 px-1">
      {/* Mock data banner */}
      {isMock && (
        <div className={`mx-2 px-3 py-1.5 rounded-lg ${c.mockBanner} text-center`}>
          <span className={`${c.fontBody} text-[10px] ${c.statLabel} uppercase tracking-wider`}>
            {theme.id === "fantasy" ? "Sample quests — real quests appear when the competition begins" : "Sample challenges — real challenges appear when the competition begins"}
          </span>
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between px-2">
        <span className={c.summaryLabel}>
          {challengeArr.length} {theme.id === "fantasy" ? `quest${challengeArr.length !== 1 ? "s" : ""}` : `challenge${challengeArr.length !== 1 ? "s" : ""}`} across {categories.length} {theme.id === "fantasy" ? `realm${categories.length !== 1 ? "s" : ""}` : `categor${categories.length !== 1 ? "ies" : "y"}`}
        </span>
        <span className={c.summaryValue}>
          {challengeArr.reduce((sum, ch) => sum + ch.value, 0)} {theme.labels.scoreUnit} total
        </span>
      </div>

      {/* Intel Sections */}
      <div className="space-y-1.5">
        <QuestIntelSection
          title={theme.id === "fantasy" ? "Most Conquered" : "Most Solved"}
          icon="🏆"
          quests={mostConquered}
          onSelect={setSelectedQuest}
          emptyText={theme.id === "fantasy" ? "No quests have been solved yet." : "No challenges have been solved yet."}
          accentClass="bg-amber-500/10 text-amber-400/60 border-amber-600/20"
        />
        <QuestIntelSection
          title={theme.id === "fantasy" ? "Least Conquered" : "Least Solved"}
          icon={theme.id === "fantasy" ? "⚔️" : "🔍"}
          quests={leastConquered}
          onSelect={setSelectedQuest}
          emptyText={theme.id === "fantasy" ? "No quests have been solved yet." : "No challenges have been solved yet."}
          accentClass="bg-orange-500/10 text-orange-400/60 border-orange-600/20"
        />
        <QuestIntelSection
          title={theme.id === "fantasy" ? "Unconquered" : "Unsolved"}
          icon="💀"
          quests={unconquered}
          onSelect={setSelectedQuest}
          emptyText={theme.id === "fantasy" ? "All quests have been conquered!" : "All challenges have been solved!"}
          accentClass="bg-red-500/10 text-red-400/60 border-red-600/20"
        />
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
            <span className={`text-xs ${c.statLabel} ${c.fontBody}`}>
              {challs.length} {theme.id === "fantasy" ? `quest${challs.length !== 1 ? "s" : ""}` : `challenge${challs.length !== 1 ? "s" : ""}`}
            </span>
          </div>
          {challs
            .sort((a, b) => a.value - b.value)
            .map((challenge) => (
              <div
                key={challenge.id}
                className={`flex items-center justify-between px-3 py-2 rounded-lg ${c.questRow} cursor-pointer transition-colors`}
                onClick={() => setSelectedQuest(challenge)}
              >
                <div className="flex flex-col min-w-0 mr-3">
                  <span className={`${c.questName} truncate`}>
                    {challenge.name}
                  </span>
                  <span className={c.questMeta}>
                    {challenge.type} • {challenge.solves} solve{challenge.solves !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className={`${c.questScore} shrink-0`}>
                  {challenge.value} {theme.labels.scoreUnit}
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
