import { useCallback, useState } from "react";
import { directPost } from "@/lib/ctfdClient";

export type SubmitResult =
  | { kind: "correct" }
  | { kind: "incorrect" }
  | { kind: "already_solved" }
  | { kind: "rate_limited"; retryAfter?: number }
  | { kind: "error"; message: string };

interface AttemptResponse {
  success: boolean;
  data: { status: "correct" | "incorrect" | "already_solved"; message: string };
}

export function useSubmitFlag(challengeId: number) {
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<SubmitResult | null>(null);

  const submit = useCallback(
    async (flag: string): Promise<SubmitResult> => {
      setSubmitting(true);
      try {
        const json = await directPost<AttemptResponse>("/challenges/attempt", {
          challenge_id: challengeId,
          submission: flag,
        });
        const status = json?.data?.status;
        let result: SubmitResult;
        if (status === "correct") result = { kind: "correct" };
        else if (status === "already_solved") result = { kind: "already_solved" };
        else result = { kind: "incorrect" };
        setLastResult(result);
        return result;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("420") || msg.includes("429")) {
          const result: SubmitResult = { kind: "rate_limited" };
          setLastResult(result);
          return result;
        }
        const result: SubmitResult = { kind: "error", message: msg };
        setLastResult(result);
        return result;
      } finally {
        setSubmitting(false);
      }
    },
    [challengeId],
  );

  return { submit, submitting, lastResult };
}
