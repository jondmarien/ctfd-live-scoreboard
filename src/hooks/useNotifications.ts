import { useEffect, useState } from "react";
import { proxyGet } from "@/lib/ctfdClient";

export interface CtfdNotification {
  id: number;
  title: string;
  content: string;
  date: string;
  type: "toast" | "alert" | "background";
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<CtfdNotification[]>([]);

  useEffect(() => {
    let cancelled = false;
    proxyGet<{ success: boolean; data: CtfdNotification[] }>("/v1/notifications")
      .then((json) => {
        if (!cancelled) setNotifications(json.data);
      })
      .catch(() => {
        // Silent fail keeps UI clean when notifications aren't enabled.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return notifications;
}

