import { useEffect, useRef, useState } from "react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";
import type { ScoreboardMode } from "@/hooks/useScoreboard";

export interface ScorePoint {
  time: number;
  score: number;
}

export interface TeamScoreSeries {
  teamId: number;
  name: string;
  series: ScorePoint[];
}

// ── Mock data for when the API returns empty or fails ──
const MOCK_SERIES: TeamScoreSeries[] = (() => {
  const now = Date.now();
  const hour = 3_600_000;
  const teams = [
    { teamId: 1, name: "Dragon's Bane" },
    { teamId: 2, name: "Shadow Syndicate" },
    { teamId: 3, name: "Arcane Collective" },
    { teamId: 4, name: "Iron Wolves" },
    { teamId: 5, name: "The Underdark Rangers" },
  ];
  return teams.map((t, i) => {
    const solves = [100, 200, 150, 300, 250, 100, 200, 150].map((v, j) => ({
      time: now - (8 - j) * hour + i * 1_200_000,
      score: v - i * 10,
    }));
    let cumulative = 0;
    const series: ScorePoint[] = solves.map((s) => {
      cumulative += Math.max(s.score, 10);
      return { time: s.time, score: cumulative };
    });
    return { ...t, series };
  });
})();

const CACHE_TTL = 30_000;

interface ModeCache {
  data: TeamScoreSeries[];
  lastFetch: number;
  fetching: boolean;
  isMock: boolean;
}

const _caches: Record<ScoreboardMode, ModeCache> = {
  user: { data: [], lastFetch: 0, fetching: false, isMock: false },
  team: { data: [], lastFetch: 0, fetching: false, isMock: false },
};

async function fetchScoreboardTop(count = 10, mode: ScoreboardMode = "team"): Promise<TeamScoreSeries[]> {
  const c = _caches[mode];
  if (c.fetching) return c.data;
  c.fetching = true;

  try {
    const res = await fetchWithRetry(`/api/v1/scoreboard/top/${count}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.success || !json.data || typeof json.data !== "object") {
      throw new Error("Invalid scoreboard/top response");
    }

    const series: TeamScoreSeries[] = [];

    for (const [, entry] of Object.entries(
      json.data as Record<
        string,
        {
          id: number;
          name: string;
          solves: { value: number; date: string }[];
        }
      >,
    )) {
      if (!entry?.solves) continue;

      const sorted = [...entry.solves].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      let cumulative = 0;
      const pts: ScorePoint[] = sorted.map((s) => {
        cumulative += s.value;
        return { time: new Date(s.date).getTime(), score: cumulative };
      });

      if (pts.length > 0) {
        series.push({ teamId: entry.id, name: entry.name, series: pts });
      }
    }

    if (series.length === 0) {
      c.data = MOCK_SERIES;
      c.isMock = true;
    } else {
      c.data = series;
      c.isMock = false;
    }
    c.lastFetch = Date.now();
    return c.data;
  } catch (err) {
    console.warn("ScoreboardTop fetch failed, using mock data:", err);
    if (c.data.length === 0) {
      c.data = MOCK_SERIES;
      c.isMock = true;
    }
    return c.data;
  } finally {
    c.fetching = false;
  }
}

export function useScoreboardTop(count = 10, mode: ScoreboardMode = "team"): {
  series: TeamScoreSeries[];
  loading: boolean;
  isMock: boolean;
} {
  const c = _caches[mode];
  const [series, setSeries] = useState<TeamScoreSeries[]>(c.data);
  const [loading, setLoading] = useState(c.data.length === 0);
  const [isMock, setIsMock] = useState(c.isMock);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const mc = _caches[mode];

    const load = async () => {
      const data = await fetchScoreboardTop(count, mode);
      if (mounted.current) {
        setSeries(data);
        setIsMock(_caches[mode].isMock);
        setLoading(false);
      }
    };

    if (mc.data.length === 0 || Date.now() - mc.lastFetch > CACHE_TTL) {
      load();
    } else {
      setLoading(false);
    }

    const interval = setInterval(() => {
      if (Date.now() - _caches[mode].lastFetch > CACHE_TTL) load();
    }, CACHE_TTL);

    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [count, mode]);

  return { series, loading, isMock };
}
