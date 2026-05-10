import { useCallback, useEffect, useState } from "react";
import { directGet } from "@/lib/ctfdClient";

export interface Solve {
  challenge_id: number;
  challenge: { name: string; category: string };
  date: string;
}

export function useSolves() {
  const [solves, setSolves] = useState<Solve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const json = await directGet<{ success: boolean; data: Solve[] }>(
        "/users/me/solves",
      );
      if (!json.success) throw new Error("solves fetch failed");
      setSolves(json.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSolves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const hasSolved = useCallback(
    (challengeId: number) => solves.some((s) => s.challenge_id === challengeId),
    [solves],
  );

  return { solves, loading, error, hasSolved, refresh: load };
}
