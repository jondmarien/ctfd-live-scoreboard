import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LLM_DEMOS, type LLMDemo } from "@/data/llm-demos";

export default function LLMDemoAnimation({ challengeSlug }: { challengeSlug: string }) {
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState<"idle" | "prompt" | "pause" | "response" | "done">("idle");

  const demo: LLMDemo | undefined = LLM_DEMOS[challengeSlug];
  const promptLength = demo?.prompt.length ?? 0;
  const responseLength = demo?.response.length ?? 0;

  const start = () => {
    setPlaying(true);
    setStep("prompt");
  };

  const reset = () => {
    setPlaying(false);
    setStep("idle");
  };

  useEffect(() => {
    if (!demo) return;
    if (step === "prompt") {
      const t = setTimeout(() => setStep("pause"), promptLength * 30 + 400);
      return () => clearTimeout(t);
    }
    if (step === "pause") {
      const t = setTimeout(() => setStep("response"), 800);
      return () => clearTimeout(t);
    }
    if (step === "response") {
      const t = setTimeout(() => setStep("done"), responseLength * 22 + 400);
      return () => clearTimeout(t);
    }
  }, [step, demo, promptLength, responseLength]);

  if (!demo) {
    return (
      <p className="mt-4 font-body text-xs text-amber-500/40">
        (No demo available for this quest yet.)
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-amber-800/30 bg-stone-950/50 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-body text-xs uppercase tracking-wider text-amber-400/60">
          Successful Solve Replay
        </span>
        {playing ? (
          <button
            onClick={reset}
            className="font-body text-xs text-amber-400/60 hover:text-amber-300"
          >
            Reset
          </button>
        ) : (
          <button
            onClick={start}
            className="rounded border border-amber-700/40 px-2 py-1 font-body text-xs text-amber-300 hover:text-amber-100"
          >
            Play
          </button>
        )}
      </div>

      {playing && (
        <div className="space-y-3 font-mono text-sm">
          <div>
            <p className="mb-1 font-body text-xs text-amber-500/50">PROMPT</p>
            <Typewriter
              text={demo.prompt}
              active={
                step === "prompt" ||
                step === "pause" ||
                step === "response" ||
                step === "done"
              }
              cps={30}
            />
          </div>
          {(step === "response" || step === "done") && (
            <div>
              <p className="mb-1 font-body text-xs text-amber-500/50">RESPONSE</p>
              <Typewriter
                text={demo.response}
                active
                cps={22}
                highlightRanges={demo.flagSpans}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Typewriter({
  text,
  active,
  cps,
  highlightRanges,
}: {
  text: string;
  active: boolean;
  cps: number;
  highlightRanges?: Array<[number, number]>;
}) {
  const [shown, setShown] = useState(active ? 0 : text.length);

  useEffect(() => {
    if (!active) return;
    setShown(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setShown(i);
      if (i >= text.length) clearInterval(interval);
    }, 1000 / cps);
    return () => clearInterval(interval);
  }, [text, active, cps]);

  return (
    <pre className="whitespace-pre-wrap text-amber-100">
      {text
        .slice(0, shown)
        .split("")
        .map((ch, i) => {
          const isFlag = highlightRanges?.some(([a, b]) => i >= a && i < b);
          return (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, color: isFlag ? "oklch(0.86 0.16 95)" : undefined }}
              transition={{ duration: 0.15 }}
              className={isFlag ? "font-bold" : ""}
            >
              {ch}
            </motion.span>
          );
        })}
      {shown < text.length && <span className="animate-pulse text-amber-400">▋</span>}
    </pre>
  );
}
