import { useState } from "react";
import { useSubmitFlag, type SubmitResult } from "@/hooks/useSubmitFlag";

export default function FlagSubmissionForm({ challengeId }: { challengeId: number }) {
  const [flag, setFlag] = useState("");
  const { submit, submitting, lastResult } = useSubmitFlag(challengeId);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim()) return;
    const r = await submit(flag.trim());
    if (r.kind === "correct" || r.kind === "already_solved") setFlag("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={flag}
          onChange={(e) => setFlag(e.target.value)}
          placeholder="FantasyCTF{...}"
          className="flex-1 rounded-lg border-2 border-amber-700/40 bg-stone-950/70 px-4 py-2 font-mono text-sm text-amber-100 placeholder-amber-700/40 backdrop-blur-md focus:border-amber-500 focus:outline-none"
          autoComplete="off"
          spellCheck={false}
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !flag.trim()}
          className="rounded-lg border-2 border-amber-600/60 bg-amber-900/30 px-6 py-2 font-quintessential text-amber-100 backdrop-blur-md transition hover:bg-amber-800/50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Strike"}
        </button>
      </div>
      <FlagResult result={lastResult} />
    </form>
  );
}

function FlagResult({ result }: { result: SubmitResult | null }) {
  if (!result) return null;
  const map: Record<SubmitResult["kind"], { color: string; text: string }> = {
    correct: { color: "text-emerald-300", text: "Correct! Quest completed." },
    incorrect: { color: "text-red-400/80", text: "The seal does not yield. Try again." },
    already_solved: { color: "text-amber-400/70", text: "Already vanquished by you." },
    rate_limited: { color: "text-amber-400/70", text: "Too many attempts. Rest a moment." },
    error: { color: "text-red-400/80", text: `Error: ${"message" in result ? result.message : "unknown"}` },
  };
  const { color, text } = map[result.kind];
  return <p className={`font-medievalsharp text-sm ${color}`}>{text}</p>;
}
