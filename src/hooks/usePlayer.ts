import { useEffect, useState } from "react";
import { proxyGet } from "@/lib/ctfdClient";

export interface PlayerProfile {
  id: number;
  name: string;
  score: number;
  place: number | null;
  team_id: number | null;
  affiliation: string | null;
  country: string | null;
}

export interface PlayerSolve {
  challenge_id: number;
  challenge: {
    name: string;
    category: string;
    value: number;
  };
  date: string;
}

export function usePlayer(id: number) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [solves, setSolves] = useState<PlayerSolve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    Promise.all([
      proxyGet<{ success: boolean; data: PlayerProfile }>(`/v1/users/${id}`),
      proxyGet<{ success: boolean; data: PlayerSolve[] }>(`/v1/users/${id}/solves`),
    ])
      .then(([profileResp, solvesResp]) => {
        if (cancelled) return;
        setProfile(profileResp.data);
        setSolves(solvesResp.data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { profile, solves, loading, error };
}

