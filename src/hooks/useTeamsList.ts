import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/apiFetch";

export interface TeamListEntry {
  id: number;
  name: string;
  affiliation: string;
  country: string;
  website: string;
  captain_id: number | null;
  members: TeamListMember[];
}

export interface TeamListMember {
  id: number;
  name: string;
  score: number;
}

interface TeamsListData {
  teams: TeamListEntry[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

export function useTeamsList(): TeamsListData & { refresh: () => void } {
  const [teams, setTeams] = useState<TeamListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const fetchedRef = useRef(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch("/api/v1/teams");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (!json.success || !Array.isArray(json.data)) {
        throw new Error("Invalid teams response");
      }

      const rawTeams = json.data.filter(
        (t: { banned: boolean; hidden: boolean }) => !t.banned && !t.hidden,
      );

      // Fetch team detail (includes member IDs) + user profiles in parallel
      const enriched: TeamListEntry[] = await Promise.all(
        rawTeams.map(async (t: Record<string, unknown>) => {
          let members: TeamListMember[] = [];
          try {
            // Team detail returns members as an array of user IDs
            const teamRes = await apiFetch(`/api/v1/teams/${t.id}`);
            if (teamRes.ok) {
              const teamJson = await teamRes.json();
              const memberIds: number[] =
                teamJson.success && Array.isArray(teamJson.data?.members)
                  ? teamJson.data.members
                  : [];

              // Fetch each user's profile in parallel
              const userDetails = await Promise.allSettled(
                memberIds.map(async (uid: number) => {
                  const userRes = await apiFetch(`/api/v1/users/${uid}`);
                  if (!userRes.ok) return null;
                  const userJson = await userRes.json();
                  if (!userJson.success) return null;
                  return {
                    id: userJson.data.id,
                    name: userJson.data.name ?? "Unknown",
                    score: userJson.data.score ?? 0,
                  };
                }),
              );
              members = userDetails
                .filter(
                  (r): r is PromiseFulfilledResult<TeamListMember | null> =>
                    r.status === "fulfilled" && r.value !== null,
                )
                .map((r) => r.value!);
            }
          } catch {
            // Team detail fetch failed — continue without members
          }

          return {
            id: t.id as number,
            name: (t.name as string) ?? "Unknown Team",
            affiliation: (t.affiliation as string) ?? "",
            country: (t.country as string) ?? "",
            website: (t.website as string) ?? "",
            captain_id: (t.captain_id as number) ?? null,
            members,
          };
        }),
      );

      setTeams(enriched);
      setLastUpdate(new Date());
    } catch (err) {
      console.warn("Teams list fetch failed:", err);
      setError(err instanceof Error ? err.message : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchTeams();
    }
  }, [fetchTeams]);

  return { teams, loading, error, lastUpdate, refresh: fetchTeams };
}
