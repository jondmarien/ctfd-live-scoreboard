import { motion } from "framer-motion";

export type ViewTab = "scoreboard" | "teams" | "quests";

interface ViewSelectorProps {
  active: ViewTab;
  onChange: (tab: ViewTab) => void;
}

const TABS: { id: ViewTab; label: string; icon: string }[] = [
  { id: "scoreboard", label: "Scoreboard", icon: "🏆" },
  { id: "teams", label: "Teams", icon: "🛡️" },
  { id: "quests", label: "Quests", icon: "⚔️" },
];

export default function ViewSelector({ active, onChange }: ViewSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-1 p-1 rounded-lg bg-stone-900/50 border border-amber-800/20 mb-4">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            relative px-4 py-1.5 rounded-md text-sm font-medievalsharp
            transition-colors duration-200
            ${active === tab.id
              ? "text-amber-200"
              : "text-amber-500/40 hover:text-amber-400/60"
            }
          `}
        >
          {active === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-amber-800/20 border border-amber-700/30 rounded-md"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            <span className="text-xs">{tab.icon}</span>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
