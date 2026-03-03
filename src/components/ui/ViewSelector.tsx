import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

export type ViewTab = "scoreboard" | "teams" | "adventurers" | "quests" | "changelog";

interface ViewSelectorProps {
  active: ViewTab;
  onChange: (tab: ViewTab) => void;
}

export default function ViewSelector({ active, onChange }: ViewSelectorProps) {
  const theme = useTheme();
  const c = theme.classes;
  const l = theme.labels;

  const TABS: { id: ViewTab; label: string; icon: string }[] = [
    { id: "scoreboard", label: l.tabScoreboard, icon: "🏆" },
    { id: "teams", label: l.tabTeams, icon: theme.id === "fantasy" ? "🛡️" : "👥" },
    { id: "adventurers", label: l.tabPlayers, icon: theme.id === "fantasy" ? "🗡️🧙🏻" : "🏅" },
    { id: "quests", label: l.tabChallenges, icon: theme.id === "fantasy" ? "⚔️" : "🔓" },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-4">
    <div className={`flex items-center gap-1 p-1 rounded-lg ${c.tabContainerBg} ${c.tabContainerBorder}`}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            relative px-4 py-1.5 rounded-md text-sm ${c.fontBody}
            transition-colors duration-200
            ${active === tab.id ? c.tabActive : c.tabInactive}
          `}
        >
          {active === tab.id && (
            <motion.div
              layoutId="activeTab"
              className={`absolute inset-0 ${c.tabActiveBg} ${c.tabActiveBorder} rounded-md`}
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
    {/* Changelog button */}
    <button
      onClick={() => onChange("changelog")}
      title={l.tabChangelog}
      className={`
        relative p-2 rounded-lg text-lg
        border transition-all duration-200
        ${active === "changelog" ? c.tabChangelogActive : c.tabChangelogInactive}
      `}
    >
      📜
    </button>
    </div>
  );
}
