import { useEffect, useState } from "react";
import { proxyGet } from "@/lib/ctfdClient";

export interface ChallengeSolve {
  account_id: number;
  name: string;
  date: string;
  account_url: string;
}

export function useChallengeSolves(challengeId: number) {
  const [solves, setSolves] = useState<ChallengeSolve[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!challengeId) return;
    let cancelled = false;
    proxyGet<{ success: boolean; data: ChallengeSolve[] }>(`/v1/challenges/${challengeId}/solves`)
      .then((json) => {
        if (!cancelled) setSolves(json.data);
      })
      .catch(() => {
        // Keep silent for hidden/private scoreboard states.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [challengeId]);

  return { solves, loading };
}

