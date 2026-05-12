import { useEffect, useState } from "react";
import { directGet, getBearerToken } from "@/lib/ctfdClient";

export interface MeStats {
  id: number;
  name: string;
  score: number;
  place: number | null;
  team_id: number | null;
}

export function useMe() {
  const [me, setMe] = useState<MeStats | null>(null);
  const [loading, setLoading] = useState(() => !!getBearerToken());

  useEffect(() => {
    if (!getBearerToken()) {
      return;
    }

    directGet<{ success: boolean; data: MeStats }>("/users/me")
      .then((json) => setMe(json.data))
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  return { me, loading };
}

