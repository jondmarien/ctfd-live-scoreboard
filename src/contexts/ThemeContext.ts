import { createContext, useContext } from "react";

export type ThemeId = "fantasy";

export interface ScoreboardTheme {
  id: ThemeId;
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
    modalPlayerIcon: string;
    modalStatSolves: string;
    modalStatScore: string;
    modalStatCategories: string;
    modalStatSolvesIcon: string;
    modalStatScoreIcon: string;
    modalStatCategoriesIcon: string;
    modalSolvesHeader: string;
    modalSolveCountUnit: string;
    modalLoading: string;
    modalEmptyTitle: string;
    modalEmptySubtitle: string;
  };
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
    modalBg: string;
    modalBorder: string;
    modalShadow: string;
    modalHeaderBg: string;
    modalHeaderBorder: string;
    modalEmblemBg: string;
    modalEmblemBorder: string;
    modalName: string;
    modalScore: string;
    modalAffiliation: string;
    modalCloseBtn: string;
    modalStatCardBg: string;
    modalStatCardBorder: string;
    modalStatValue: string;
    modalStatLabel: string;
    modalProfilePill: string;
    modalProfilePillHover: string;
    modalSectionHeader: string;
    modalSectionAccent: string;
    modalCategoryCount: string;
    modalSolveRow: string;
    modalSolveName: string;
    modalSolveScore: string;
    modalSolveDate: string;
    modalSpinner: string;
    modalLoadingText: string;
    modalErrorText: string;
    modalEmptyTitleClass: string;
    modalEmptySubtitleClass: string;
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
    modalPlayerIcon: "🗡️",
    modalStatSolves: "Quests Completed",
    modalStatScore: "Gold Earned",
    modalStatCategories: "Realms Conquered",
    modalStatSolvesIcon: "⚔️",
    modalStatScoreIcon: "💰",
    modalStatCategoriesIcon: "🏰",
    modalSolvesHeader: "Quest Log",
    modalSolveCountUnit: "quest",
    modalLoading: "Consulting the Oracle...",
    modalEmptyTitle: "No Quests Completed Yet",
    modalEmptySubtitle: "This adventurer's quest log is empty...",
  },
  classes: {
    fontHeading: "font-display",
    fontBody: "font-body",
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
    tabChangelogInactive:
      "bg-stone-900/50 border-amber-800/20 text-amber-500/40 hover:text-amber-400/60 hover:border-amber-700/20",
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
    footerText: "font-body text-xs text-amber-500/50",
    footerTimestamp: "font-display text-xs text-amber-400/60",
    ornament: "text-amber-500/50 text-sm",
    spinnerBorder: "border-amber-500/30 border-t-amber-400",
    spinnerTrack: "",
    loadingText: "font-body text-sm text-amber-400/50 tracking-wider",
    emptyTitle: "font-display text-base text-amber-300/60 text-center",
    emptySubtitle: "font-body text-xs text-amber-500/40 text-center",
    axisFont: "Crimson Pro, serif",
    axisFill: "oklch(0.42 0.08 50)",
    tooltipBg: "bg-stone-900/95 border border-amber-800/30",
    tooltipBorder: "border-amber-800/30",
    tooltipTime: "font-body text-amber-400/60",
    tooltipName: "font-body text-amber-200/70",
    tooltipScore: "font-display text-amber-400",
    graphToggleText: "font-body text-xs text-amber-500/50 uppercase tracking-widest group-hover:text-amber-400/70",
    graphToggleBorder: "hover:bg-amber-900/10",
    graphContainerBorder: "border-b border-amber-800/20",
    compressedActive: "bg-amber-600/20 border-amber-600/40 text-amber-400/80",
    compressedInactive: "bg-stone-800/30 border-amber-900/20 text-amber-600/40 hover:text-amber-500/60",
    eyeButton: "text-amber-600/30 hover:text-amber-400 hover:bg-amber-900/20",
    categoryPill: "",
    questRow: "bg-stone-800/30 border border-amber-900/10 hover:bg-stone-800/50",
    questName: "text-amber-200/70 font-body text-sm",
    questMeta: "text-amber-500/30 font-body text-[10px]",
    questScore: "text-amber-400/60 font-display text-sm font-bold",
    questSectionBg: "bg-stone-900/30",
    questSectionBorder: "border border-amber-900/20",
    mockBanner: "bg-amber-900/20 border border-amber-700/20",
    summaryLabel: "font-body text-xs text-amber-500/50 uppercase tracking-wider",
    summaryValue: "font-display text-xs text-amber-400/50",
    modalBg: "bg-stone-950/95",
    modalBorder: "border border-amber-700/30",
    modalShadow: "shadow-[0_0_60px_rgba(255,165,0,0.08)]",
    modalHeaderBg: "bg-stone-900/50",
    modalHeaderBorder: "border-b border-amber-800/20",
    modalEmblemBg: "bg-linear-to-br from-amber-700 to-amber-900",
    modalEmblemBorder: "border border-amber-600/30",
    modalName: "text-xl font-display font-bold text-amber-100",
    modalScore: "text-amber-400 font-display font-bold text-lg",
    modalAffiliation: "text-amber-500/50 text-xs font-body",
    modalCloseBtn: "hover:bg-amber-900/20 text-amber-500/50 hover:text-amber-300",
    modalStatCardBg: "bg-stone-800/30 border border-amber-900/15",
    modalStatCardBorder: "",
    modalStatValue: "text-amber-300 font-display font-bold text-base",
    modalStatLabel: "text-amber-600/40 font-body text-[10px] uppercase tracking-wider",
    modalProfilePill: "bg-stone-800/50 border border-amber-900/20 text-xs text-amber-300/60 font-body",
    modalProfilePillHover: "hover:text-amber-200 hover:border-amber-700/40",
    modalSectionHeader: "text-sm font-body text-amber-500/60 uppercase tracking-wider",
    modalSectionAccent: "bg-amber-500/50",
    modalCategoryCount: "text-amber-600/30 text-xs font-body",
    modalSolveRow: "bg-stone-800/30 border border-amber-900/10 hover:bg-stone-800/50",
    modalSolveName: "text-amber-200/70 font-body text-sm",
    modalSolveScore: "text-amber-400/60 font-display text-sm font-bold",
    modalSolveDate: "text-amber-600/30 text-[10px] font-body",
    modalSpinner: "border-amber-500/30 border-t-amber-400",
    modalLoadingText: "font-body text-sm text-amber-400/50 tracking-wider",
    modalErrorText: "font-body text-sm text-red-400/60",
    modalEmptyTitleClass: "font-display text-base text-amber-300/50",
    modalEmptySubtitleClass: "font-body text-xs text-amber-500/30",
  },
};

const ThemeContext = createContext<ScoreboardTheme>(FANTASY_THEME);

export function useTheme(): ScoreboardTheme {
  return useContext(ThemeContext);
}

export { ThemeContext };
