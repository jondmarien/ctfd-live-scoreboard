import { createContext, useContext } from "react";

export type ThemeId = "fantasy" | "skillssheridan";

export interface ScoreboardTheme {
  id: ThemeId;

  // Labels
  labels: {
    scoreUnit: string;
    tabScoreboard: string;
    tabTeams: string;
    tabPlayers: string;
    tabChallenges: string;
    tabChangelog: string;
    loadingScoreboard: string;
    loadingTeams: string;
    loadingPlayers: string;
    loadingChallenges: string;
    emptyScoreboard: string;
    emptyTeams: string;
    emptyPlayers: string;
    emptyChallenges: string;
    lastUpdate: string;
    scoreProgression: string;
    scryingBattlefield: string;
    memberPrefix: string;
    solveUnit: string;
    solveUnitPlural: string;
  };

  // CSS classes
  classes: {
    fontHeading: string;
    fontBody: string;
    cardBg: string;
    cardBorder: string;
    cardShadow: string;
    rowHover: string;
    rowTopRankBg: string;
    tabContainerBg: string;
    tabContainerBorder: string;
    tabActive: string;
    tabActiveBg: string;
    tabActiveBorder: string;
    tabInactive: string;
    tabChangelogActive: string;
    tabChangelogInactive: string;
    rankBadge1: string;
    rankBadge2: string;
    rankBadge3: string;
    rankBadgeDefault: string;
    scoreTop: string;
    scoreDefault: string;
    scoreUnit: string;
    memberRow: string;
    memberName: string;
    memberScore: string;
    separator: string;
    statLabel: string;
    footerBorder: string;
    footerBg: string;
    footerText: string;
    footerTimestamp: string;
    ornament: string;
    spinnerBorder: string;
    spinnerTrack: string;
    loadingText: string;
    emptyTitle: string;
    emptySubtitle: string;
    axisFont: string;
    axisFill: string;
    tooltipBg: string;
    tooltipBorder: string;
    tooltipTime: string;
    tooltipName: string;
    tooltipScore: string;
    graphToggleText: string;
    graphToggleBorder: string;
    graphContainerBorder: string;
    compressedActive: string;
    compressedInactive: string;
    eyeButton: string;
    categoryPill: string;
    questRow: string;
    questName: string;
    questMeta: string;
    questScore: string;
    questSectionBg: string;
    questSectionBorder: string;
    mockBanner: string;
    summaryLabel: string;
    summaryValue: string;
  };
}

export const FANTASY_THEME: ScoreboardTheme = {
  id: "fantasy",
  labels: {
    scoreUnit: "GP",
    tabScoreboard: "Scoreboard",
    tabTeams: "Guilds",
    tabPlayers: "Adventurers",
    tabChallenges: "Quests",
    tabChangelog: "Changelog",
    loadingScoreboard: "Consulting the Oracle...",
    loadingTeams: "Summoning the guilds...",
    loadingPlayers: "Gathering the adventurers...",
    loadingChallenges: "Unfurling the quest scroll...",
    emptyScoreboard: "No Adventurers Have Joined",
    emptyTeams: "No Guilds Found",
    emptyPlayers: "No Adventurers Found",
    emptyChallenges: "No Quests Available",
    lastUpdate: "🔮 LAST SCRYING:",
    scoreProgression: "Score Progression",
    scryingBattlefield: "Scrying the battlefield...",
    memberPrefix: "🗡️",
    solveUnit: "quest",
    solveUnitPlural: "quests",
  },
  classes: {
    fontHeading: "font-quintessential",
    fontBody: "font-medievalsharp",
    cardBg: "bg-stone-950/50 backdrop-blur-md",
    cardBorder: "border-2 border-amber-600/40",
    cardShadow: "shadow-[0_0_30px_rgba(255,165,0,0.06)]",
    rowHover: "hover:bg-amber-900/15",
    rowTopRankBg: "bg-amber-950/20",
    tabContainerBg: "bg-stone-900/50",
    tabContainerBorder: "border border-amber-800/20",
    tabActive: "text-amber-200",
    tabActiveBg: "bg-amber-800/20",
    tabActiveBorder: "border border-amber-700/30",
    tabInactive: "text-amber-500/40 hover:text-amber-400/60",
    tabChangelogActive: "bg-amber-800/20 border-amber-700/30 text-amber-200 shadow-[0_0_8px_rgba(255,165,0,0.15)]",
    tabChangelogInactive: "bg-stone-900/50 border-amber-800/20 text-amber-500/40 hover:text-amber-400/60 hover:border-amber-700/20",
    rankBadge1: "bg-gradient-to-r from-yellow-700 to-yellow-500 text-yellow-100",
    rankBadge2: "bg-gradient-to-r from-gray-500 to-gray-400 text-gray-100",
    rankBadge3: "bg-gradient-to-r from-amber-800 to-amber-600 text-amber-100",
    rankBadgeDefault: "bg-stone-700 text-stone-300",
    scoreTop: "text-amber-400",
    scoreDefault: "text-amber-400/70",
    scoreUnit: "text-xs text-amber-600/50",
    memberRow: "bg-stone-800/20 border border-amber-900/10",
    memberName: "text-amber-200/60",
    memberScore: "text-amber-400/50",
    separator: "text-amber-700/20",
    statLabel: "text-amber-600/40",
    footerBorder: "border-t border-amber-800/20",
    footerBg: "bg-stone-950/30",
    footerText: "font-medievalsharp text-xs text-amber-500/50",
    footerTimestamp: "font-quintessential text-xs text-amber-400/60",
    ornament: "text-amber-500/50 text-sm",
    spinnerBorder: "border-amber-500/30 border-t-amber-400",
    spinnerTrack: "",
    loadingText: "font-medievalsharp text-sm text-amber-400/50 tracking-wider",
    emptyTitle: "font-quintessential text-base text-amber-300/60 text-center",
    emptySubtitle: "font-medievalsharp text-xs text-amber-500/40 text-center",
    axisFont: "MedievalSharp, serif",
    axisFill: "#a16207",
    tooltipBg: "bg-stone-900/95 border border-amber-800/30",
    tooltipBorder: "border-amber-800/30",
    tooltipTime: "font-medievalsharp text-amber-400/60",
    tooltipName: "font-medievalsharp text-amber-200/70",
    tooltipScore: "font-quintessential text-amber-400",
    graphToggleText: "font-medievalsharp text-xs text-amber-500/50 uppercase tracking-widest group-hover:text-amber-400/70",
    graphToggleBorder: "hover:bg-amber-900/10",
    graphContainerBorder: "border-b border-amber-800/20",
    compressedActive: "bg-amber-600/20 border-amber-600/40 text-amber-400/80",
    compressedInactive: "bg-stone-800/30 border-amber-900/20 text-amber-600/40 hover:text-amber-500/60",
    eyeButton: "text-amber-600/30 hover:text-amber-400 hover:bg-amber-900/20",
    categoryPill: "",
    questRow: "bg-stone-800/30 border border-amber-900/10 hover:bg-stone-800/50",
    questName: "text-amber-200/70 font-medievalsharp text-sm",
    questMeta: "text-amber-500/30 font-medievalsharp text-[10px]",
    questScore: "text-amber-400/60 font-quintessential text-sm font-bold",
    questSectionBg: "bg-stone-900/30",
    questSectionBorder: "border border-amber-900/20",
    mockBanner: "bg-amber-900/20 border border-amber-700/20",
    summaryLabel: "font-medievalsharp text-xs text-amber-500/50 uppercase tracking-wider",
    summaryValue: "font-quintessential text-xs text-amber-400/50",
  },
};

export const SS_THEME: ScoreboardTheme = {
  id: "skillssheridan",
  labels: {
    scoreUnit: "pts",
    tabScoreboard: "Scoreboard",
    tabTeams: "Teams",
    tabPlayers: "Players",
    tabChallenges: "Challenges",
    tabChangelog: "Changelog",
    loadingScoreboard: "Loading scoreboard...",
    loadingTeams: "Loading teams...",
    loadingPlayers: "Loading players...",
    loadingChallenges: "Loading challenges...",
    emptyScoreboard: "No Players Have Joined",
    emptyTeams: "No Teams Found",
    emptyPlayers: "No Players Found",
    emptyChallenges: "No Challenges Available",
    lastUpdate: "LAST UPDATE:",
    scoreProgression: "Score Progression",
    scryingBattlefield: "Loading chart data...",
    memberPrefix: "›",
    solveUnit: "solve",
    solveUnitPlural: "solves",
  },
  classes: {
    fontHeading: "font-rajdhani",
    fontBody: "font-inter",
    cardBg: "bg-[rgba(5,13,26,0.75)] backdrop-blur-md",
    cardBorder: "border-2 border-[rgba(11,51,94,0.6)]",
    cardShadow: "shadow-[0_0_20px_rgba(0,0,0,0.6)]",
    rowHover: "hover:bg-[rgba(11,51,94,0.2)]",
    rowTopRankBg: "bg-[rgba(11,51,94,0.15)]",
    tabContainerBg: "bg-[rgba(5,13,26,0.7)]",
    tabContainerBorder: "border border-[rgba(11,51,94,0.5)]",
    tabActive: "text-white",
    tabActiveBg: "bg-[rgba(11,51,94,0.4)]",
    tabActiveBorder: "border border-[rgba(240,192,64,0.4)]",
    tabInactive: "text-[#a8c4e8]/50 hover:text-[#a8c4e8]/80",
    tabChangelogActive: "bg-[rgba(11,51,94,0.4)] border-[rgba(240,192,64,0.4)] text-white",
    tabChangelogInactive: "bg-[rgba(5,13,26,0.7)] border-[rgba(11,51,94,0.5)] text-[#a8c4e8]/40 hover:text-[#a8c4e8]/70",
    rankBadge1: "bg-[rgba(240,192,64,0.2)] text-[#f0c040] border border-[rgba(240,192,64,0.5)]",
    rankBadge2: "bg-[rgba(192,192,192,0.2)] text-[#c0c0c0] border border-[rgba(192,192,192,0.4)]",
    rankBadge3: "bg-[rgba(205,127,50,0.2)] text-[#cd7f32] border border-[rgba(205,127,50,0.4)]",
    rankBadgeDefault: "bg-[rgba(11,51,94,0.3)] text-[#a8c4e8]",
    scoreTop: "text-[#f0c040]",
    scoreDefault: "text-[#f0c040]/70",
    scoreUnit: "text-xs text-[#a8c4e8]/50",
    memberRow: "bg-[rgba(11,51,94,0.15)] border border-[rgba(11,51,94,0.3)]",
    memberName: "text-[#e0e8f0]/70",
    memberScore: "text-[#f0c040]/60",
    separator: "text-[rgba(11,51,94,0.5)]",
    statLabel: "text-[#a8c4e8]/50",
    footerBorder: "border-t-2 border-[rgba(11,51,94,0.8)]",
    footerBg: "bg-[rgba(5,13,26,0.97)]",
    footerText: "font-rajdhani text-xs text-[#a8c4e8] tracking-wider",
    footerTimestamp: "font-inter text-xs text-[#a8c4e8]/60",
    ornament: "text-[#f0c040]/40 text-sm",
    spinnerBorder: "border-[rgba(11,51,94,0.4)] border-t-[#4a90d9]",
    spinnerTrack: "",
    loadingText: "font-inter text-sm text-[#a8c4e8]/60 tracking-wider",
    emptyTitle: "font-rajdhani text-base text-[#a8c4e8]/60 text-center uppercase tracking-wider",
    emptySubtitle: "font-inter text-xs text-[#a8c4e8]/40 text-center",
    axisFont: "Inter, sans-serif",
    axisFill: "#a8c4e8",
    tooltipBg: "bg-[rgba(5,13,26,0.97)] border border-[rgba(11,51,94,0.7)]",
    tooltipBorder: "border-[rgba(11,51,94,0.7)]",
    tooltipTime: "font-inter text-[#a8c4e8]/60",
    tooltipName: "font-inter text-[#e0e8f0]/70",
    tooltipScore: "font-rajdhani text-[#f0c040]",
    graphToggleText: "font-rajdhani text-xs text-[#a8c4e8]/50 uppercase tracking-widest group-hover:text-[#a8c4e8]/80",
    graphToggleBorder: "hover:bg-[rgba(11,51,94,0.15)]",
    graphContainerBorder: "border-b border-[rgba(11,51,94,0.4)]",
    compressedActive: "bg-[rgba(11,51,94,0.4)] border-[rgba(240,192,64,0.4)] text-[#f0c040]/80",
    compressedInactive: "bg-[rgba(5,13,26,0.5)] border-[rgba(11,51,94,0.3)] text-[#a8c4e8]/40 hover:text-[#a8c4e8]/70",
    eyeButton: "text-[#a8c4e8]/30 hover:text-[#4a90d9] hover:bg-[rgba(11,51,94,0.2)]",
    categoryPill: "",
    questRow: "bg-[rgba(11,51,94,0.15)] border border-[rgba(11,51,94,0.3)] hover:bg-[rgba(11,51,94,0.3)]",
    questName: "text-[#e0e8f0]/70 font-inter text-sm",
    questMeta: "text-[#a8c4e8]/40 font-inter text-[10px]",
    questScore: "text-[#f0c040]/70 font-rajdhani text-sm font-bold",
    questSectionBg: "bg-[rgba(5,13,26,0.5)]",
    questSectionBorder: "border border-[rgba(11,51,94,0.4)]",
    mockBanner: "bg-[rgba(11,51,94,0.2)] border border-[rgba(11,51,94,0.4)]",
    summaryLabel: "font-inter text-xs text-[#a8c4e8]/50 uppercase tracking-wider",
    summaryValue: "font-rajdhani text-xs text-[#f0c040]/60",
  },
};

const ThemeContext = createContext<ScoreboardTheme>(FANTASY_THEME);

export function useTheme(): ScoreboardTheme {
  return useContext(ThemeContext);
}

export { ThemeContext };
