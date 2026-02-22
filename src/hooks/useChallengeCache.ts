import { useEffect, useRef, useState } from "react";

export interface ChallengeInfo {
  id: number;
  name: string;
  category: string;
  value: number;
  initial_value?: number;
  type: string;
  solves: number;
  description?: string;
  tags?: string[];
  max_attempts?: number;
  state?: string;
}

// ── Mock data shown when API returns empty or fails ──
const MOCK_CHALLENGES: ChallengeInfo[] = [
  {
    id: -1,
    name: "The Dragon's Cipher",
    category: "Crypto",
    value: 100,
    initial_value: 100,
    type: "standard",
    solves: 12,
    description:
      "A dragon guards an ancient cipher scroll. Decode the message hidden within the shifting runes to claim your reward. The cipher uses a classical substitution — but beware, the dragon has added a twist.",
    tags: ["beginner"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -2,
    name: "Enchanted Key Exchange",
    category: "Crypto",
    value: 250,
    initial_value: 300,
    type: "dynamic",
    solves: 5,
    description:
      "Two wizards wish to share a secret across the enchanted forest, but dark forces are listening. Intercept their key exchange and recover the shared secret before the spell is complete.",
    tags: ["diffie-hellman"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -3,
    name: "Goblin's Web Lair",
    category: "Web",
    value: 100,
    initial_value: 100,
    type: "standard",
    solves: 18,
    description:
      "The goblins have built a crude web portal to manage their stolen treasure. Find the vulnerability in their login page and steal back the kingdom's gold.",
    tags: ["beginner", "injection"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -4,
    name: "SQL Sorcery",
    category: "Web",
    value: 200,
    initial_value: 250,
    type: "dynamic",
    solves: 9,
    description:
      "The dark sorcerer stores forbidden knowledge in a magical database. Craft the perfect incantation to bypass the arcane protections and extract the hidden flag.",
    tags: ["sqli"],
    max_attempts: 5,
    state: "visible",
  },
  {
    id: -5,
    name: "The Forbidden Scroll",
    category: "Web",
    value: 400,
    initial_value: 500,
    type: "dynamic",
    solves: 2,
    description:
      "Deep within the temple lies a scroll protected by layered enchantments. Chain multiple vulnerabilities together — SSRF, deserialization, and path traversal — to claim the ultimate prize.",
    tags: ["advanced", "chain"],
    max_attempts: 3,
    state: "visible",
  },
  {
    id: -6,
    name: "Stack Smash Keep",
    category: "Pwn",
    value: 150,
    initial_value: 150,
    type: "standard",
    solves: 7,
    description:
      "The fortress walls have a weakness in their foundation. Overflow the guard's stack to open the gates and capture the flag within.",
    tags: ["buffer-overflow"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -7,
    name: "Return to the Abyss",
    category: "Pwn",
    value: 350,
    initial_value: 400,
    type: "dynamic",
    solves: 3,
    description:
      "The Abyss calls you back. Use return-oriented programming to navigate the cursed memory landscape and escape with the flag.",
    tags: ["rop"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -8,
    name: "Cursed Binary",
    category: "Reverse",
    value: 200,
    initial_value: 200,
    type: "standard",
    solves: 6,
    description:
      "A cursed artifact has been found — a binary that speaks in riddles. Reverse engineer its dark logic to reveal the password it guards.",
    tags: ["binary"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -9,
    name: "The Alchemist's Formula",
    category: "Reverse",
    value: 450,
    initial_value: 500,
    type: "dynamic",
    solves: 1,
    description:
      "The royal alchemist encoded their secret formula into an obfuscated program. Unravel layers of anti-debugging traps and virtual machine protection to recover the recipe.",
    tags: ["obfuscation", "vm"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -10,
    name: "Lost Tome of Logs",
    category: "Forensics",
    value: 100,
    initial_value: 100,
    type: "standard",
    solves: 14,
    description:
      "A tome of server logs was recovered from the ruins. Sift through the entries to find evidence of the intruder's presence and extract the stolen secret.",
    tags: ["logs", "beginner"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -11,
    name: "Memory of the Fallen",
    category: "Forensics",
    value: 300,
    initial_value: 350,
    type: "dynamic",
    solves: 4,
    description:
      "A fallen warrior's memory dump contains the key to the kingdom. Analyze the volatile memory image to recover credentials and hidden artifacts.",
    tags: ["memory", "volatility"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -12,
    name: "The Riddler's Challenge",
    category: "Misc",
    value: 50,
    initial_value: 50,
    type: "standard",
    solves: 22,
    description:
      "The Riddler awaits at the crossroads with a simple puzzle. Solve the riddle to prove your worth and begin your adventure.",
    tags: ["warmup"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -13,
    name: "Shadows in the Map",
    category: "OSINT",
    value: 150,
    initial_value: 150,
    type: "standard",
    solves: 8,
    description:
      "A mysterious figure left traces across the realm's public records. Use your investigative skills to track their movements and uncover their true identity.",
    tags: ["osint"],
    max_attempts: 0,
    state: "visible",
  },
  {
    id: -14,
    name: "Hidden Runes",
    category: "Stego",
    value: 200,
    initial_value: 200,
    type: "standard",
    solves: 5,
    description:
      "An innocent-looking painting hangs in the guild hall, but hidden runes are embedded within. Extract the concealed message using steganographic techniques.",
    tags: ["image"],
    max_attempts: 0,
    state: "visible",
  },
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
        description: c.description,
        initial_value: c.initial_value,
        tags: Array.isArray(c.tags)
          ? c.tags.map((t: string | { value: string }) =>
              typeof t === "string" ? t : t.value,
            )
          : undefined,
        max_attempts: c.max_attempts,
        state: c.state,
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

export function useChallengeCache(): {
  challenges: Map<number, ChallengeInfo>;
  lastUpdate: Date | null;
  isMock: boolean;
} {
  const [challenges, setChallenges] =
    useState<Map<number, ChallengeInfo>>(_cache);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(
    _lastFetch ? new Date(_lastFetch) : null,
  );
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
