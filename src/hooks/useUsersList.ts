import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

export interface UserListEntry {
  id: number;
  name: string;
  score: number;
  affiliation: string;
  country: string;
  website: string;
}

interface UsersListData {
  users: UserListEntry[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

// ── Module-level cache so every consumer shares the same data ──
const CACHE_TTL = 30_000; // 30 seconds
let _usersCache: UserListEntry[] = [];
let _lastFetch = 0;
let _fetching = false;
let _lastUpdateTime: Date | null = null;

async function fetchUsersData(): Promise<UserListEntry[]> {
  if (_fetching) return _usersCache;
  _fetching = true;

  try {
    const res = await fetchWithRetry("/api/v1/users");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) {
      throw new Error("Invalid users response");
    }

    const users: UserListEntry[] = json.data
      .filter((u: { banned: boolean; hidden: boolean }) => !u.banned && !u.hidden)
      .map((u: Record<string, unknown>) => ({
        id: u.id as number,
        name: (u.name as string) ?? "Unknown",
        score: (u.score as number) ?? 0,
        affiliation: (u.affiliation as string) ?? "",
        country: (u.country as string) ?? "",
        website: (u.website as string) ?? "",
      }));

    // Sort by score descending
    users.sort((a, b) => b.score - a.score);

    _usersCache = users;
    _lastFetch = Date.now();
    _lastUpdateTime = new Date();
    return users;
  } catch (err) {
    console.warn("Users list fetch failed:", err);
    throw err;
  } finally {
    _fetching = false;
  }
}

export function useUsersList(): UsersListData & { refresh: () => void } {
  const [users, setUsers] = useState<UserListEntry[]>(_usersCache);
  const [loading, setLoading] = useState(_usersCache.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(_lastUpdateTime);
  const mountedRef = useRef(true);

  const load = useCallback(async (force = false) => {
    // If cache is fresh and not forced, use it
    if (!force && _usersCache.length > 0 && Date.now() - _lastFetch < CACHE_TTL) {
      setUsers(_usersCache);
      setLastUpdate(_lastUpdateTime);
      setLoading(false);
      return;
    }

    // Show cached data immediately while refreshing
    if (_usersCache.length > 0) {
      setUsers(_usersCache);
      setLastUpdate(_lastUpdateTime);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const data = await fetchUsersData();
      if (mountedRef.current) {
        setUsers(data);
        setLastUpdate(_lastUpdateTime);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Failed to load users");
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

  return { users, loading, error, lastUpdate, refresh: () => load(true) };
}
