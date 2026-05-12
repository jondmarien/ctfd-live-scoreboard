import { useEffect, useState } from "react";
import { proxyGet } from "@/lib/ctfdClient";

export interface Award {
  id: number;
  name: string;
  description: string;
  category: string;
  date: string;
  value: number;
  icon: string | null;
}

export function usePlayerAwards(userId: number) {
  const [awards, setAwards] = useState<Award[]>([]);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    proxyGet<{ success: boolean; data: Award[] }>(`/v1/users/${userId}/awards`)
      .then((json) => {
        if (!cancelled) setAwards(json.data);
      })
      .catch(() => {
        // Keep empty awards when endpoint is unavailable/forbidden.
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return awards;
}

