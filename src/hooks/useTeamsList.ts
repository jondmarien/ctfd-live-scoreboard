import { useCallback, useEffect, useRef, useState } from "react";

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

// ── Module-level cache so every consumer shares the same data ──
const CACHE_TTL = 30_000; // 30 seconds
let _teamsCache: TeamListEntry[] = [];
let _lastFetch = 0;
let _fetching = false;
let _lastUpdateTime: Date | null = null;

// Per-user profile cache — avoids re-fetching the same user across teams
const _userProfileCache = new Map<number, TeamListMember>();

async function fetchTeamsData(): Promise<TeamListEntry[]> {
  if (_fetching) return _teamsCache;
  _fetching = true;

  try {
    const res = await fetch("/api/v1/teams");
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
          const teamRes = await fetch(`/api/v1/teams/${t.id}`);
          if (teamRes.ok) {
            const teamJson = await teamRes.json();
            const memberIds: number[] =
              teamJson.success && Array.isArray(teamJson.data?.members)
                ? teamJson.data.members
                : [];

            // Fetch each user's profile in parallel (with per-user cache)
            const userDetails = await Promise.allSettled(
              memberIds.map(async (uid: number) => {
                // Return cached profile if available
                const cached = _userProfileCache.get(uid);
                if (cached) return cached;

                const userRes = await fetch(`/api/v1/users/${uid}`);
                if (!userRes.ok) return null;
                const userJson = await userRes.json();
                if (!userJson.success) return null;
                const profile: TeamListMember = {
                  id: userJson.data.id,
                  name: userJson.data.name ?? "Unknown",
                  score: userJson.data.score ?? 0,
                };
                _userProfileCache.set(uid, profile);
                return profile;
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

    _teamsCache = enriched;
    _lastFetch = Date.now();
    _lastUpdateTime = new Date();
    return enriched;
  } catch (err) {
    console.warn("Teams list fetch failed:", err);
    throw err;
  } finally {
    _fetching = false;
  }
}

export function useTeamsList(): TeamsListData & { refresh: () => void } {
  const [teams, setTeams] = useState<TeamListEntry[]>(_teamsCache);
  const [loading, setLoading] = useState(_teamsCache.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(_lastUpdateTime);
  const mountedRef = useRef(true);

  const load = useCallback(async (force = false) => {
    // If cache is fresh and not forced, use it
    if (!force && _teamsCache.length > 0 && Date.now() - _lastFetch < CACHE_TTL) {
      setTeams(_teamsCache);
      setLastUpdate(_lastUpdateTime);
      setLoading(false);
      return;
    }

    // Show cached data immediately while refreshing (no loading spinner on repeat visits)
    if (_teamsCache.length > 0) {
      setTeams(_teamsCache);
      setLastUpdate(_lastUpdateTime);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const data = await fetchTeamsData();
      if (mountedRef.current) {
        setTeams(data);
        setLastUpdate(_lastUpdateTime);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load teams");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  return { teams, loading, error, lastUpdate, refresh: () => load(true) };
}
