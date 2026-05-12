import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

const DISMISSED_KEY = "dismissed_notifications";

function getDismissed(): Set<number> {
  try {
    return new Set<number>(JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? "[]"));
  } catch {
    return new Set<number>();
  }
}

export default function NotificationsBar() {
  const notifications = useNotifications();
  const [dismissed, setDismissed] = useState<Set<number>>(getDismissed);
  const visible = notifications.filter((n) => !dismissed.has(n.id));

  if (visible.length === 0) return null;

  function dismiss(id: number) {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(next)));
  }

  return (
    <div className="sticky top-0 z-50 border-b border-amber-700/40 bg-stone-950/80 backdrop-blur-md">
      <AnimatePresence>
        {visible.map((notice) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2"
          >
            <div className="flex-1 font-medievalsharp text-sm text-amber-200/90">
              <strong className="text-amber-100">{notice.title}</strong>
              {notice.content && (
                <span className="ml-2 text-amber-300/70">— {notice.content}</span>
              )}
            </div>
            <button
              onClick={() => dismiss(notice.id)}
              className="font-medievalsharp text-xs text-amber-500/60 hover:text-amber-300"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

