import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FADE_IN_VARIANTS,
  SCALE_POP_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  SLIDE_UP_VARIANTS,
  HIGH_TENSION_SPRING,
} from "@/lib/animations";
import { useAdventurerDetails } from "@/hooks/useAdventurerDetails";

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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
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
          className="relative bg-stone-950/95 w-full max-w-2xl mx-auto my-6 border border-amber-700/30 rounded-2xl shadow-[0_0_60px_rgba(255,165,0,0.08)] flex flex-col max-h-[calc(100vh-3rem)]"
        >
          {/* Header */}
          <div className="p-5 border-b border-amber-800/20 bg-stone-900/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Rank emblem */}
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-amber-700 to-amber-900 flex items-center justify-center text-2xl shadow-lg border border-amber-600/30">
                  🗡️
                </div>
                <div>
                  <motion.h2
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-quintessential font-bold text-amber-100"
                  >
                    {user?.name ?? memberName}
                  </motion.h2>
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2 mt-0.5"
                  >
                    <span className="text-amber-400 font-quintessential font-bold text-lg">
                      {totalGP || memberScore} GP
                    </span>
                    {user?.affiliation && (
                      <span className="text-amber-500/50 text-xs font-medievalsharp">
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
                className="p-1.5 hover:bg-amber-900/20 rounded-lg transition-colors text-amber-500/50 hover:text-amber-300"
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
                  <StatCard label="Quests Completed" value={String(solves.length)} icon="⚔️" />
                  <StatCard label="Gold Earned" value={`${totalGP} GP`} icon="💰" />
                  <StatCard label="Realms Conquered" value={String(categoryCount)} icon="🏰" />
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
                      <span className="px-3 py-1 bg-stone-800/50 border border-amber-900/20 rounded-lg text-xs text-amber-300/60 font-medievalsharp">
                        📍 {user.country}
                      </span>
                    )}
                    {user.website && (
                      <a
                        href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-stone-800/50 border border-amber-900/20 rounded-lg text-xs text-amber-300/60 font-medievalsharp hover:text-amber-200 hover:border-amber-700/40 transition-colors"
                      >
                        🌐 {user.website}
                      </a>
                    )}
                  </motion.div>
                )}

                {/* Solved quests by category */}
                {solves.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medievalsharp text-amber-500/60 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1 h-3 bg-amber-500/50 rounded-full" />
                      Quest Log
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
                          <span className="text-amber-600/30 text-xs font-medievalsharp">
                            {catSolves.length} quest{catSolves.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                        {catSolves.map((solve) => (
                          <motion.div
                            key={solve.challenge_id}
                            variants={SLIDE_UP_VARIANTS}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-800/30 border border-amber-900/10 hover:bg-stone-800/50 transition-colors"
                          >
                            <span className="text-amber-200/70 font-medievalsharp text-sm truncate mr-3">
                              {solve.challenge_name}
                            </span>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-amber-400/60 font-quintessential text-sm font-bold">
                                {solve.value} GP
                              </span>
                              <span className="text-amber-600/30 text-[10px] font-medievalsharp">
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
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <motion.div
      variants={SLIDE_UP_VARIANTS}
      className="p-3 rounded-lg bg-stone-800/30 border border-amber-900/15 text-center"
    >
      <div className="text-lg mb-0.5">{icon}</div>
      <div className="text-amber-300 font-quintessential font-bold text-base">{value}</div>
      <div className="text-amber-600/40 font-medievalsharp text-[10px] uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </motion.div>
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

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <span className="text-2xl">⚠️</span>
      <p className="font-medievalsharp text-sm text-red-400/60 text-center">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <span className="text-2xl">📜</span>
      <p className="font-quintessential text-base text-amber-300/50 text-center">
        No Quests Completed Yet
      </p>
      <p className="font-medievalsharp text-xs text-amber-500/30 text-center">
        This adventurer's quest log is empty...
      </p>
    </div>
  );
}
