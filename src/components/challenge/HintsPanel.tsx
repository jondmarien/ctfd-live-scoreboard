import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useHints } from "@/hooks/useHints";

interface HintsPanelProps {
  challengeId: number;
}

export default function HintsPanel({ challengeId }: HintsPanelProps) {
  const { isAuthenticated, login } = useAuth();
  const { hints, unlocked, loading, unlocking, error, unlock } = useHints(challengeId, isAuthenticated);
  const [confirmingHint, setConfirmingHint] = useState<number | null>(null);

  if (loading) {
    return (
      <p className="mb-8 font-medievalsharp text-amber-500/60 italic">
        Consulting the oracle for hints...
      </p>
    );
  }

  if (hints.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 font-quintessential text-xl text-amber-200">Whispered Hints</h2>
      <div className="space-y-3">
        {hints.map((hint, index) => {
          const unlockedContent = unlocked[hint.id];
          const isUnlocked = !!unlockedContent;
          const isUnlockingThis = unlocking === hint.id;

          return (
            <motion.div
              key={hint.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-lg border-2 border-amber-700/30 bg-stone-900/40 p-4 backdrop-blur-md"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-quintessential text-amber-300">Hint {index + 1}</span>
                <span className="font-quintessential text-sm text-amber-400/80">
                  {hint.cost > 0 ? `${hint.cost} GP` : "free"}
                </span>
              </div>

              <AnimatePresence mode="wait">
                {isUnlocked ? (
                  <motion.div
                    key="unlocked"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2"
                  >
                    <div
                      className="prose prose-invert max-w-none font-medievalsharp text-amber-200/80 [&_code]:rounded [&_code]:bg-stone-900/60 [&_code]:px-1 [&_code]:text-amber-300"
                      dangerouslySetInnerHTML={{ __html: unlockedContent }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="locked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2"
                  >
                    {isAuthenticated ? (
                      confirmingHint === hint.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medievalsharp text-sm text-amber-300/80">
                            Spend {hint.cost} GP from your purse?
                          </span>
                          <button
                            onClick={async () => {
                              setConfirmingHint(null);
                              await unlock(hint.id);
                            }}
                            disabled={isUnlockingThis}
                            className="rounded border border-amber-600/60 bg-amber-900/30 px-3 py-1 font-medievalsharp text-sm text-amber-100 hover:bg-amber-800/50 disabled:opacity-50"
                          >
                            {isUnlockingThis ? "Unlocking..." : "Yes"}
                          </button>
                          <button
                            onClick={() => setConfirmingHint(null)}
                            className="rounded border border-amber-700/40 px-3 py-1 font-medievalsharp text-sm text-amber-400/80 hover:text-amber-300"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingHint(hint.id)}
                          className="rounded-lg border border-amber-700/40 bg-stone-900/50 px-4 py-1.5 font-medievalsharp text-sm text-amber-300 transition hover:border-amber-600 hover:bg-amber-900/30"
                        >
                          Unlock for {hint.cost} GP
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => login(window.location.pathname)}
                        className="rounded-lg border border-amber-700/40 bg-stone-900/50 px-4 py-1.5 font-medievalsharp text-sm text-amber-400/70 hover:text-amber-300"
                      >
                        Sign in to unlock hints
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        {error && <p className="font-medievalsharp text-sm text-red-400/80">Hint error: {error}</p>}
      </div>
    </section>
  );
}

