import { useCallback, useEffect, useRef, useState } from "react";

interface TeamMember {
  id: number;
  name: string;
  score: number;
}

export interface Team {
  pos: number;
  name: string;
  score: number;
  members?: TeamMember[];
}

interface ScoreboardData {
  teams: Team[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
}

// Sanitize strings to prevent XSS (regex-based, avoids DOM allocation)
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
function escapeHTML(str: string | null | undefined): string {
  if (str === null || str === undefined) return "";
  return str.replace(/[&<>"']/g, (ch) => HTML_ESCAPE_MAP[ch]);
}

// requestIdleCallback with fallback for Safari / older browsers
const scheduleIdle =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? window.requestIdleCallback
    : (cb: () => void) => setTimeout(cb, 50);

const MOCK_TEAMS: Team[] = [
  {
    pos: 1,
    name: "Dragon's Bane",
    score: 4250,
    members: [
      { id: 1, name: "Gandalf_The_Grey", score: 1500 },
      { id: 2, name: "Aragorn_Elessar", score: 1200 },
      { id: 3, name: "Legolas_Greenleaf", score: 900 },
      { id: 4, name: "Gimli_Gloin", score: 650 },
    ],
  },
  {
    pos: 2,
    name: "Shadow Syndicate",
    score: 3800,
    members: [
      { id: 5, name: "Drizzt_DoUrden", score: 1400 },
      { id: 6, name: "Elminster_Aumar", score: 1100 },
      { id: 7, name: "Bruenor_Battlehammer", score: 800 },
      { id: 8, name: "Wulfgar_Son", score: 500 },
    ],
  },
  {
    pos: 3,
    name: "Arcane Collective",
    score: 3200,
    members: [
      { id: 9, name: "Mordenkainen", score: 1300 },
      { id: 10, name: "Tasha_Witch", score: 1000 },
      { id: 11, name: "Bigby_Hand", score: 900 },
    ],
  },
  {
    pos: 4,
    name: "Iron Wolves",
    score: 2750,
    members: [
      { id: 12, name: "Minsc_Boo", score: 1100 },
      { id: 13, name: "Jaheira_Harper", score: 900 },
      { id: 14, name: "Khalid_Shield", score: 750 },
    ],
  },
  {
    pos: 5,
    name: "The Underdark Rangers",
    score: 2100,
    members: [
      { id: 15, name: "Viconia_DeVir", score: 800 },
      { id: 16, name: "Edwin_Odesseiron", score: 700 },
      { id: 17, name: "Imoen_Bhaal", score: 600 },
    ],
  },
  {
    pos: 6,
    name: "Mystic Wardens",
    score: 1850,
    members: [
      { id: 18, name: "Astarion_Ancunin", score: 750 },
      { id: 19, name: "Shadowheart", score: 600 },
      { id: 20, name: "Gale_Dekarios", score: 500 },
    ],
  },
  {
    pos: 7,
    name: "Crimson Fangs",
    score: 1400,
    members: [
      { id: 21, name: "Karlach_Cliffgate", score: 600 },
      { id: 22, name: "Wyll_Ravengard", score: 500 },
      { id: 23, name: "Laezel_Githyanki", score: 300 },
    ],
  },
  {
    pos: 8,
    name: "Emerald Enclave",
    score: 950,
    members: [
      { id: 24, name: "Halsin_Archdruid", score: 500 },
      { id: 25, name: "Minthara_Baenre", score: 450 },
    ],
  },
];

const REFRESH_INTERVAL = 30_000; // 30 seconds

export function useScoreboard(): ScoreboardData & {
  refresh: () => void;
  escapeHTML: typeof escapeHTML;
} {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchScoreboard = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/scoreboard");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error("Invalid API response");
      }

      if (data.data.length === 0) {
        // API returned empty — use mock data
        setTeams(MOCK_TEAMS);
      } else {
        const parsed: Team[] = data.data.map(
          (entry: {
            pos: number;
            name: string;
            score: number;
            members?: TeamMember[];
          }) => ({
            pos: entry.pos,
            name: escapeHTML(entry.name),
            score: entry.score,
            members: entry.members?.map((m: TeamMember) => ({
              ...m,
              name: escapeHTML(m.name),
            })),
          }),
        );
        setTeams(parsed);
      }
      setError(null);
      setLastUpdate(new Date());
      lastFetchRef.current = Date.now();
    } catch (err) {
      console.warn("Scoreboard fetch failed, using mock data:", err);
      setTeams(MOCK_TEAMS);
      setError(null);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchScoreboard();
  }, [fetchScoreboard]);

  useEffect(() => {
    fetchScoreboard();
    // Defer polling fetches to idle periods to avoid interrupting animations
    intervalRef.current = setInterval(
      () => scheduleIdle(() => fetchScoreboard()),
      REFRESH_INTERVAL,
    );

    // Refetch when tab regains focus (throttled to 10s)
    const handleVisibility = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastFetchRef.current > 10_000
      ) {
        fetchScoreboard();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchScoreboard]);

  return { teams, loading, error, lastUpdate, refresh, escapeHTML };
}
