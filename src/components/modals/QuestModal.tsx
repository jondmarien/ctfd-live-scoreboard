import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FADE_IN_VARIANTS,
  SCALE_POP_VARIANTS,
  STAGGER_CONTAINER_VARIANTS,
  SLIDE_UP_VARIANTS,
  HIGH_TENSION_SPRING,
} from "@/lib/animations";
import type { ChallengeInfo } from "@/hooks/useChallengeCache";

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

interface QuestModalProps {
  quest: ChallengeInfo;
  isMock: boolean;
  onClose: () => void;
}

export default function QuestModal({ quest, isMock, onClose }: QuestModalProps) {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const isDynamic = quest.type === "dynamic";
  const hasDecayed = isDynamic && quest.initial_value != null && quest.value < quest.initial_value;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        variants={FADE_IN_VARIANTS}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Scroll + click-outside wrapper */}
      <div
        className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center px-4 py-6"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          variants={SCALE_POP_VARIANTS}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="relative bg-stone-950/95 w-full max-w-lg border border-amber-700/30 rounded-2xl shadow-[0_0_60px_rgba(255,165,0,0.08)] flex flex-col max-h-[calc(100vh-3rem)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 border-b border-amber-800/20 bg-stone-900/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Quest icon */}
                <div className="w-12 h-12 rounded-lg bg-linear-to-br from-amber-700 to-amber-900 flex items-center justify-center text-2xl shadow-lg border border-amber-600/30">
                  ⚔️
                </div>
                <div>
                  <motion.h2
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl font-quintessential font-bold text-amber-100"
                  >
                    {quest.name}
                  </motion.h2>
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-2 mt-0.5"
                  >
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(quest.category)}`}
                    >
                      {quest.category}
                    </span>
                    <span className="text-amber-500/40 text-xs font-medievalsharp">
                      {quest.type}
                    </span>
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
            {/* Mock banner */}
            {isMock && (
              <div className="px-3 py-1.5 rounded-lg bg-amber-900/20 border border-amber-700/20 text-center">
                <span className="font-medievalsharp text-[10px] text-amber-400/50 uppercase tracking-wider">
                  Sample quest — real data appears when the competition begins
                </span>
              </div>
            )}

            {/* Stats grid */}
            <motion.div
              variants={STAGGER_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-3 gap-3"
            >
              <StatCard
                label="Current Value"
                value={`${quest.value} GP`}
                icon="💰"
                highlight={hasDecayed}
              />
              <StatCard
                label={isDynamic ? "Original Value" : "Base Value"}
                value={`${quest.initial_value ?? quest.value} GP`}
                icon="📜"
              />
              <StatCard
                label="Solves"
                value={String(quest.solves)}
                icon="🏆"
              />
            </motion.div>

            {/* Value decay indicator */}
            {hasDecayed && (
              <motion.div
                variants={SLIDE_UP_VARIANTS}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-900/10 border border-red-800/20"
              >
                <span className="text-sm">📉</span>
                <span className="font-medievalsharp text-xs text-red-400/60">
                  Value decayed from {quest.initial_value} GP to {quest.value} GP ({quest.solves} solve{quest.solves !== 1 ? "s" : ""})
                </span>
              </motion.div>
            )}

            {/* Tags */}
            {quest.tags && quest.tags.length > 0 && (
              <motion.div
                variants={SLIDE_UP_VARIANTS}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-1.5"
              >
                {quest.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medievalsharp text-amber-400/50 bg-stone-800/40 border border-amber-900/15"
                  >
                    #{tag}
                  </span>
                ))}
              </motion.div>
            )}

            {/* Max attempts */}
            {quest.max_attempts != null && quest.max_attempts > 0 && (
              <motion.div
                variants={SLIDE_UP_VARIANTS}
                initial="hidden"
                animate="visible"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-800/30 border border-amber-900/10"
              >
                <span className="text-sm">⚠️</span>
                <span className="font-medievalsharp text-xs text-amber-400/50">
                  Limited to {quest.max_attempts} attempt{quest.max_attempts !== 1 ? "s" : ""}
                </span>
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              variants={SLIDE_UP_VARIANTS}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              <h3 className="text-sm font-medievalsharp text-amber-500/60 uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-3 bg-amber-500/50 rounded-full" />
                Quest Description
              </h3>
              <div className="px-3 py-3 rounded-lg bg-stone-800/30 border border-amber-900/10">
                {quest.description ? (
                  <p className="text-amber-200/60 font-medievalsharp text-sm leading-relaxed whitespace-pre-wrap">
                    {quest.description}
                  </p>
                ) : (
                  <p className="text-amber-500/30 font-medievalsharp text-sm italic">
                    No description available for this quest.
                  </p>
                )}
              </div>
            </motion.div>

            {/* CTFd link hint */}
            <motion.div
              variants={SLIDE_UP_VARIANTS}
              initial="hidden"
              animate="visible"
              className="text-center pt-2"
            >
              <span className="font-medievalsharp text-[10px] text-amber-600/30 uppercase tracking-wider">
                Submit flags and view hints on the CTFd platform
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      variants={SLIDE_UP_VARIANTS}
      className={`p-3 rounded-lg border text-center ${
        highlight
          ? "bg-red-900/10 border-red-800/20"
          : "bg-stone-800/30 border-amber-900/15"
      }`}
    >
      <div className="text-lg mb-0.5">{icon}</div>
      <div
        className={`font-quintessential font-bold text-base ${
          highlight ? "text-red-300" : "text-amber-300"
        }`}
      >
        {value}
      </div>
      <div className="text-amber-600/40 font-medievalsharp text-[10px] uppercase tracking-wider mt-0.5">
        {label}
      </div>
    </motion.div>
  );
}
