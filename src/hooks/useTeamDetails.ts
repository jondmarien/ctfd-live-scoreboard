import { useCallback, useEffect, useRef, useState } from "react";
import { ensureChallengeCache, type ChallengeInfo } from "@/hooks/useChallengeCache";
import { apiFetch } from "@/lib/apiFetch";

export interface TeamProfile {
  id: number;
  name: string;
  affiliation: string;
  country: string;
  website: string;
  captain_id: number | null;
  created: string;
}

export interface TeamSolve {
  challenge_id: number;
  challenge_name: string;
  category: string;
  value: number;
  type: string;
  date: string;
  user_id: number;
  user_name: string;
}

interface TeamDetailsData {
  team: TeamProfile | null;
  solves: TeamSolve[];
  loading: boolean;
  error: string | null;
}

// Per-team cache
const _teamCache = new Map<number, { team: TeamProfile; solves: TeamSolve[] }>();

export function useTeamDetails(teamId: number | null): TeamDetailsData {
  const [team, setTeam] = useState<TeamProfile | null>(null);
  const [solves, setSolves] = useState<TeamSolve[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchDetails = useCallback(async (id: number) => {
    // Check cache first
    const cached = _teamCache.get(id);
    if (cached) {
      setTeam(cached.team);
      setSolves(cached.solves);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const [teamRes, solvesRes, challengeMap] = await Promise.all([
        apiFetch(`/api/v1/teams/${id}`, { signal: controller.signal }),
        apiFetch(`/api/v1/teams/${id}/solves`, { signal: controller.signal }),
        ensureChallengeCache(),
      ]);

      if (!teamRes.ok) throw new Error(`Team fetch failed: HTTP ${teamRes.status}`);
      if (!solvesRes.ok) throw new Error(`Team solves fetch failed: HTTP ${solvesRes.status}`);

      const teamData = await teamRes.json();
      const solvesData = await solvesRes.json();

      if (!teamData.success) throw new Error("Invalid team response");

      const profile: TeamProfile = {
        id: teamData.data.id,
        name: teamData.data.name ?? "Unknown Party",
        affiliation: teamData.data.affiliation ?? "",
        country: teamData.data.country ?? "",
        website: teamData.data.website ?? "",
        captain_id: teamData.data.captain_id ?? null,
        created: teamData.data.created ?? "",
      };

      const enrichedSolves: TeamSolve[] = [];
      const rawSolves = solvesData.success && Array.isArray(solvesData.data) ? solvesData.data : [];

      for (const s of rawSolves) {
        const challengeId = s.challenge_id ?? s.challenge?.id;
        const info: ChallengeInfo | undefined = challengeMap.get(challengeId);

        enrichedSolves.push({
          challenge_id: challengeId,
          challenge_name: info?.name ?? s.challenge?.name ?? "Unknown Quest",
          category: info?.category ?? s.challenge?.category ?? "Uncategorized",
          value: info?.value ?? s.challenge?.value ?? 0,
          type: info?.type ?? "standard",
          date: s.date ?? "",
          user_id: s.user_id ?? s.user ?? 0,
          user_name: s.user_name ?? "",
        });
      }

      enrichedSolves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      _teamCache.set(id, { team: profile, solves: enrichedSolves });

      if (!controller.signal.aborted) {
        setTeam(profile);
        setSolves(enrichedSolves);
        setError(null);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.warn("Team details fetch failed:", err);
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Failed to load party details");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (teamId === null) {
      setTeam(null);
      setSolves([]);
      setLoading(false);
      setError(null);
      return;
    }

    fetchDetails(teamId);

    return () => {
      abortRef.current?.abort();
    };
  }, [teamId, fetchDetails]);

  return { team, solves, loading, error };
}
