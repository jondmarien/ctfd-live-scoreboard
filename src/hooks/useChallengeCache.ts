import { useEffect, useRef, useState } from "react";

export interface ChallengeInfo {
  id: number;
  name: string;
  category: string;
  value: number;
  type: string;
  solves: number;
}

// Module-level singleton so every consumer shares the same cache
let _cache: Map<number, ChallengeInfo> = new Map();
let _lastFetch = 0;
let _fetching = false;

async function fetchChallenges(): Promise<Map<number, ChallengeInfo>> {
  if (_fetching) return _cache;
  _fetching = true;

  try {
    const res = await fetch("/api/v1/challenges");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.success || !Array.isArray(json.data)) {
      throw new Error("Invalid challenges response");
    }

    const map = new Map<number, ChallengeInfo>();
    for (const c of json.data) {
      map.set(c.id, {
        id: c.id,
        name: c.name ?? "Unknown",
        category: c.category ?? "Uncategorized",
        value: c.value ?? 0,
        type: c.type ?? "standard",
        solves: c.solves ?? 0,
      });
    }
    _cache = map;
    _lastFetch = Date.now();
    return map;
  } catch (err) {
    console.warn("Challenge cache fetch failed:", err);
    return _cache;
  } finally {
    _fetching = false;
  }
}

const CACHE_TTL = 30_000; // 30 seconds — matches scoreboard refresh

export function useChallengeCache(): { challenges: Map<number, ChallengeInfo>; lastUpdate: Date | null } {
  const [challenges, setChallenges] = useState<Map<number, ChallengeInfo>>(_cache);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(_lastFetch ? new Date(_lastFetch) : null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const load = async () => {
      const map = await fetchChallenges();
      if (mounted.current) {
        setChallenges(map);
        setLastUpdate(new Date(_lastFetch));
      }
    };

    // Fetch immediately if stale or empty
    if (_cache.size === 0 || Date.now() - _lastFetch > CACHE_TTL) {
      load();
    }

    // Periodic refresh
    const interval = setInterval(() => {
      if (Date.now() - _lastFetch > CACHE_TTL) load();
    }, CACHE_TTL);

    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, []);

  return { challenges, lastUpdate };
}

// Direct access for hooks that don't need reactivity
export function getChallengeCache(): Map<number, ChallengeInfo> {
  return _cache;
}

export function ensureChallengeCache(): Promise<Map<number, ChallengeInfo>> {
  if (_cache.size > 0 && Date.now() - _lastFetch < CACHE_TTL) {
    return Promise.resolve(_cache);
  }
  return fetchChallenges();
}
