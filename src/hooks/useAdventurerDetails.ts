import { useCallback, useEffect, useRef, useState } from "react";
import { ensureChallengeCache, type ChallengeInfo } from "@/hooks/useChallengeCache";
import { apiFetch } from "@/lib/apiFetch";

export interface UserProfile {
  id: number;
  name: string;
  affiliation: string;
  country: string;
  website: string;
  team_id: number | null;
}

export interface UserSolve {
  challenge_id: number;
  challenge_name: string;
  category: string;
  value: number;
  type: string;
  date: string;
}

interface AdventurerDetailsData {
  user: UserProfile | null;
  solves: UserSolve[];
  loading: boolean;
  error: string | null;
}

// Per-user cache
const _userCache = new Map<number, { user: UserProfile; solves: UserSolve[] }>();

export function useAdventurerDetails(memberId: number | null): AdventurerDetailsData {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [solves, setSolves] = useState<UserSolve[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchDetails = useCallback(async (id: number) => {
    // Check cache first
    const cached = _userCache.get(id);
    if (cached) {
      setUser(cached.user);
      setSolves(cached.solves);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Fetch user profile, user solves, and challenge cache in parallel
      const [userRes, solvesRes, challengeMap] = await Promise.all([
        apiFetch(`/api/v1/users/${id}`, { signal: controller.signal }),
        apiFetch(`/api/v1/users/${id}/solves`, { signal: controller.signal }),
        ensureChallengeCache(),
      ]);

      if (!userRes.ok) throw new Error(`User fetch failed: HTTP ${userRes.status}`);
      if (!solvesRes.ok) throw new Error(`Solves fetch failed: HTTP ${solvesRes.status}`);

      const userData = await userRes.json();
      const solvesData = await solvesRes.json();

      if (!userData.success) throw new Error("Invalid user response");

      const profile: UserProfile = {
        id: userData.data.id,
        name: userData.data.name ?? "Unknown",
        affiliation: userData.data.affiliation ?? "",
        country: userData.data.country ?? "",
        website: userData.data.website ?? "",
        team_id: userData.data.team_id ?? null,
      };

      const enrichedSolves: UserSolve[] = [];
      const rawSolves = solvesData.success && Array.isArray(solvesData.data) ? solvesData.data : [];

      for (const s of rawSolves) {
        const challengeId = s.challenge_id ?? s.challenge?.id;
        const cached: ChallengeInfo | undefined = challengeMap.get(challengeId);

        enrichedSolves.push({
          challenge_id: challengeId,
          challenge_name: cached?.name ?? s.challenge?.name ?? "Unknown Quest",
          category: cached?.category ?? s.challenge?.category ?? "Uncategorized",
          value: cached?.value ?? s.challenge?.value ?? 0,
          type: cached?.type ?? "standard",
          date: s.date ?? "",
        });
      }

      // Sort by date descending (most recent first)
      enrichedSolves.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Cache result
      _userCache.set(id, { user: profile, solves: enrichedSolves });

      if (!controller.signal.aborted) {
        setUser(profile);
        setSolves(enrichedSolves);
        setError(null);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.warn("Adventurer details fetch failed:", err);
      if (!controller.signal.aborted) {
        setError(err instanceof Error ? err.message : "Failed to load adventurer");
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (memberId === null) {
      setUser(null);
      setSolves([]);
      setLoading(false);
      setError(null);
      return;
    }

    fetchDetails(memberId);

    return () => {
      abortRef.current?.abort();
    };
  }, [memberId, fetchDetails]);

  return { user, solves, loading, error };
}
