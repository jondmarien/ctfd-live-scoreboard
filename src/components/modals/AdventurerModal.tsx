import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModalPortal from "@/components/modals/ModalPortal";
import {
  FADE_IN_VARIANTS,
  SCALE_POP_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  SLIDE_UP_VARIANTS,
  HIGH_TENSION_SPRING,
} from "@/lib/animations";
import { useAdventurerDetails } from "@/hooks/useAdventurerDetails";
import { useTheme } from "@/contexts/ThemeContext";

// Category → color mapping for pills
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

function formatDate(dateStr: string): string {
  if (!dateStr) return "Unknown time";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

interface AdventurerModalProps {
  memberId: number;
  memberName: string;
  memberScore: number;
  onClose: () => void;
}

export default function AdventurerModal({
  memberId,
  memberName,
  memberScore,
  onClose,
}: AdventurerModalProps) {
  const { user, solves, loading, error } = useAdventurerDetails(memberId);
  const theme = useTheme();
  const c = theme.classes;
  const l = theme.labels;

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Group solves by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof solves>();
    for (const s of solves) {
      const cat = s.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [solves]);

  const totalGP = solves.reduce((sum, s) => sum + s.value, 0);
  const categoryCount = grouped.length;

  return (
    <ModalPortal>
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={FADE_IN_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-stone-950/85 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          variants={SCALE_POP_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className={`relative ${c.modalBg} w-full max-w-2xl ${c.modalBorder} rounded-2xl ${c.modalShadow} flex flex-col max-h-[calc(100vh-2rem)]`}
        >
          {/* Header */}
          <div className={`p-5 ${c.modalHeaderBorder} ${c.modalHeaderBg}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Rank emblem */}
                <div className={`w-12 h-12 rounded-lg ${c.modalEmblemBg} flex items-center justify-center text-2xl shadow-lg ${c.modalEmblemBorder}`}>
                  {l.modalPlayerIcon}
                </div>
                <div>
                  <motion.h2
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={c.modalName}
                  >
                    {user?.name ?? memberName}
                  </motion.h2>
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2 mt-0.5"
                  >
                    <span className={c.modalScore}>
                      {totalGP || memberScore} {l.scoreUnit}
                    </span>
                    {user?.affiliation && (
                      <span className={c.modalAffiliation}>
                        • {user.affiliation}
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={HIGH_TENSION_SPRING}
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-colors ${c.modalCloseBtn}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState message={error} />
            ) : (
              <>
                {/* Stats bar */}
                <motion.div
                  variants={STAGGER_CONTAINER_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-3 gap-3"
                >
                  <StatCard label={l.modalStatSolves} value={String(solves.length)} icon={l.modalStatSolvesIcon} />
                  <StatCard label={l.modalStatScore} value={`${totalGP} ${l.scoreUnit}`} icon={l.modalStatScoreIcon} />
                  <StatCard label={l.modalStatCategories} value={String(categoryCount)} icon={l.modalStatCategoriesIcon} />
                </motion.div>

                {/* Profile info */}
                {user && (user.country || user.website) && (
                  <motion.div
                    variants={SLIDE_UP_VARIANTS}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap gap-3"
                  >
                    {user.country && (
                      <span className={`px-3 py-1 rounded-lg ${c.modalProfilePill}`}>
                        📍 {user.country}
                      </span>
                    )}
                    {user.website && (
                      <a
                        href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className={`px-3 py-1 rounded-lg transition-colors ${c.modalProfilePill} ${c.modalProfilePillHover}`}
                      >
                        🌐 {user.website}
                      </a>
                    )}
                  </motion.div>
                )}

                {/* Solved challenges by category */}
                {solves.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    <h3 className={`${c.modalSectionHeader} flex items-center gap-2`}>
                      <span className={`w-1 h-3 ${c.modalSectionAccent} rounded-full`} />
                      {l.modalSolvesHeader}
                    </h3>
                    {grouped.map(([category, catSolves]) => (
                      <motion.div
                        key={category}
                        variants={STAGGER_CONTAINER_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        className="space-y-1.5"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(category)}`}
                          >
                            {category}
                          </span>
                          <span className={c.modalCategoryCount}>
                            {catSolves.length} {l.modalSolveCountUnit}{catSolves.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {catSolves.map((solve) => (
                          <motion.div
                            key={solve.challenge_id}
                            variants={SLIDE_UP_VARIANTS}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${c.modalSolveRow}`}
                          >
                            <span className={`${c.modalSolveName} truncate mr-3`}>
                              {solve.challenge_name}
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={c.modalSolveScore}>
                                {solve.value} {l.scoreUnit}
                              </span>
                              <span className={c.modalSolveDate}>
                                {formatDate(solve.date)}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
    </ModalPortal>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  const c = useTheme().classes;
  return (
    <motion.div
      variants={SLIDE_UP_VARIANTS}
      className={`p-3 rounded-lg text-center ${c.modalStatCardBg}`}
    >
      <div className="text-lg mb-0.5">{icon}</div>
      <div className={c.modalStatValue}>{value}</div>
      <div className={`${c.modalStatLabel} mt-0.5`}>
        {label}
      </div>
    </motion.div>
  );
}

function LoadingState() {
  const theme = useTheme();
  const c = theme.classes;
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className={`w-6 h-6 border-2 ${c.modalSpinner} rounded-full animate-spin`} />
      <p className={c.modalLoadingText}>
        {theme.labels.modalLoading}
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const c = useTheme().classes;
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <span className="text-2xl">⚠️</span>
      <p className={`${c.modalErrorText} text-center`}>{message}</p>
    </div>
  );
}

function EmptyState() {
  const theme = useTheme();
  const c = theme.classes;
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <span className="text-2xl">📜</span>
      <p className={`${c.modalEmptyTitleClass} text-center`}>
        {theme.labels.modalEmptyTitle}
      </p>
      <p className={`${c.modalEmptySubtitleClass} text-center`}>
        {theme.labels.modalEmptySubtitle}
      </p>
    </div>
  );
}
