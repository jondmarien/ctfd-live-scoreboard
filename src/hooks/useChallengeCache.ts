import { useEffect, useRef, useState } from "react";

export interface ChallengeInfo {
  id: number;
  name: string;
  category: string;
  value: number;
  type: string;
  solves: number;
}

// ── Mock data shown when API returns empty or fails ──
const MOCK_CHALLENGES: ChallengeInfo[] = [
  { id: -1, name: "The Dragon's Cipher", category: "Crypto", value: 100, type: "standard", solves: 12 },
  { id: -2, name: "Enchanted Key Exchange", category: "Crypto", value: 250, type: "standard", solves: 5 },
  { id: -3, name: "Goblin's Web Lair", category: "Web", value: 100, type: "standard", solves: 18 },
  { id: -4, name: "SQL Sorcery", category: "Web", value: 200, type: "standard", solves: 9 },
  { id: -5, name: "The Forbidden Scroll", category: "Web", value: 400, type: "standard", solves: 2 },
  { id: -6, name: "Stack Smash Keep", category: "Pwn", value: 150, type: "standard", solves: 7 },
  { id: -7, name: "Return to the Abyss", category: "Pwn", value: 350, type: "standard", solves: 3 },
  { id: -8, name: "Cursed Binary", category: "Reverse", value: 200, type: "standard", solves: 6 },
  { id: -9, name: "The Alchemist's Formula", category: "Reverse", value: 450, type: "standard", solves: 1 },
  { id: -10, name: "Lost Tome of Logs", category: "Forensics", value: 100, type: "standard", solves: 14 },
  { id: -11, name: "Memory of the Fallen", category: "Forensics", value: 300, type: "standard", solves: 4 },
  { id: -12, name: "The Riddler's Challenge", category: "Misc", value: 50, type: "standard", solves: 22 },
  { id: -13, name: "Shadows in the Map", category: "OSINT", value: 150, type: "standard", solves: 8 },
  { id: -14, name: "Hidden Runes", category: "Stego", value: 200, type: "standard", solves: 5 },
];

function buildMockCache(): Map<number, ChallengeInfo> {
  const map = new Map<number, ChallengeInfo>();
  for (const c of MOCK_CHALLENGES) map.set(c.id, c);
  return map;
}

// Module-level singleton so every consumer shares the same cache
let _cache: Map<number, ChallengeInfo> = new Map();
let _lastFetch = 0;
let _fetching = false;
let _isMock = false;

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
    if (map.size === 0) {
      // API returned empty — use mock data
      _cache = buildMockCache();
      _isMock = true;
    } else {
      _cache = map;
      _isMock = false;
    }
    _lastFetch = Date.now();
    return _cache;
  } catch (err) {
    console.warn("Challenge cache fetch failed, using mock data:", err);
    if (_cache.size === 0) {
      _cache = buildMockCache();
      _isMock = true;
    }
    return _cache;
  } finally {
    _fetching = false;
  }
}

const CACHE_TTL = 30_000; // 30 seconds — matches scoreboard refresh

export function useChallengeCache(): { challenges: Map<number, ChallengeInfo>; lastUpdate: Date | null; isMock: boolean } {
  const [challenges, setChallenges] = useState<Map<number, ChallengeInfo>>(_cache);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(_lastFetch ? new Date(_lastFetch) : null);
  const [isMock, setIsMock] = useState(_isMock);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const load = async () => {
      const map = await fetchChallenges();
      if (mounted.current) {
        setChallenges(map);
        setLastUpdate(new Date(_lastFetch));
        setIsMock(_isMock);
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

  return { challenges, lastUpdate, isMock };
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
