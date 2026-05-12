import { useCallback, useEffect, useState } from "react";
import { directGet, directPost, proxyGet } from "@/lib/ctfdClient";

export interface HintMeta {
  id: number;
  cost: number;
}

interface HintDetail {
  id: number;
  cost: number;
  content?: string;
  html?: string;
}

interface UseHintsResult {
  hints: HintMeta[];
  unlocked: Record<number, string>;
  loading: boolean;
  unlocking: number | null;
  error: string | null;
  unlock: (hintId: number) => Promise<void>;
}

export function useHints(challengeId: number, isAuthenticated: boolean): UseHintsResult {
  const [hints, setHints] = useState<HintMeta[]>([]);
  const [unlocked, setUnlocked] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const path = isAuthenticated
          ? `/challenges/${challengeId}/hints`
          : `/v1/challenges/${challengeId}/hints`;
        const fetchHints = isAuthenticated ? directGet : proxyGet;
        const hintList = await fetchHints<{ success: boolean; data: HintMeta[] }>(path);
        if (cancelled) return;
        setHints(hintList.data);

        if (isAuthenticated) {
          const contentById: Record<number, string> = {};
          await Promise.all(
            hintList.data.map(async (hint) => {
              try {
                const detail = await directGet<{ success: boolean; data: HintDetail }>(`/hints/${hint.id}`);
                const html = detail.data.html ?? detail.data.content ?? "";
                if (html) contentById[hint.id] = html;
              } catch {
                // locked hints throw until unlocked
              }
            }),
          );
          if (!cancelled) setUnlocked(contentById);
        } else if (!cancelled) {
          setUnlocked({});
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (challengeId) load();
    return () => {
      cancelled = true;
    };
  }, [challengeId, isAuthenticated]);

  const unlock = useCallback(async (hintId: number) => {
    setUnlocking(hintId);
    setError(null);
    try {
      await directPost<{ success: boolean }>("/unlocks", {
        target: hintId,
        type: "hints",
      });
      const detail = await directGet<{ success: boolean; data: HintDetail }>(`/hints/${hintId}`);
      const html = detail.data.html ?? detail.data.content ?? "";
      if (html) {
        setUnlocked((prev) => ({ ...prev, [hintId]: html }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setUnlocking(null);
    }
  }, []);

  return { hints, unlocked, loading, unlocking, error, unlock };
}

