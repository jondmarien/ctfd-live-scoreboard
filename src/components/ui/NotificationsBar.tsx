import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

const DISMISSED_KEY = "dismissed_notifications";
const BAR_POSITION_KEY = "notifications_bar_position";

function getDismissed(): Set<number> {
  try {
    return new Set<number>(JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? "[]"));
  } catch {
    return new Set<number>();
  }
}

function getSavedPosition(): { x: number; y: number } {
  try {
    const parsed = JSON.parse(localStorage.getItem(BAR_POSITION_KEY) ?? "null");
    if (parsed && typeof parsed.x === "number" && typeof parsed.y === "number") {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {
    // ignore malformed storage
  }
  return { x: 0, y: 0 };
}

export default function NotificationsBar() {
  const notifications = useNotifications();
  const [dismissed, setDismissed] = useState<Set<number>>(getDismissed);
  const [position, setPosition] = useState(getSavedPosition);
  const visible = notifications.filter((n) => !dismissed.has(n.id));
  const moved = useMemo(() => position.x !== 0 || position.y !== 0, [position.x, position.y]);

  if (visible.length === 0) return null;

  function dismiss(id: number) {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(Array.from(next)));
  }

  function savePosition(x: number, y: number) {
    const next = { x, y };
    setPosition(next);
    localStorage.setItem(BAR_POSITION_KEY, JSON.stringify(next));
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => {
        savePosition(position.x + info.offset.x, position.y + info.offset.y);
      }}
      style={{ x: position.x, y: position.y }}
      className="fixed left-1/2 top-2 z-50 w-full max-w-5xl -translate-x-1/2 border-b border-amber-700/40 bg-stone-950/80 backdrop-blur-md"
    >
      <div className="flex items-center justify-end gap-2 border-b border-amber-700/20 px-3 py-1">
        <span className="cursor-move select-none font-body text-[10px] uppercase tracking-widest text-amber-500/60">
          drag
        </span>
        {moved && (
          <button
            onClick={() => savePosition(0, 0)}
            className="font-body text-[10px] uppercase tracking-widest text-amber-400/70 hover:text-amber-200"
            title="Reset notification bar position"
          >
            reset
          </button>
        )}
      </div>
      <AnimatePresence>
        {visible.map((notice) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2"
          >
            <div className="flex-1 font-body text-sm text-amber-200/90">
              <strong className="text-amber-100">{notice.title}</strong>
              {notice.content && (
                <span className="ml-2 text-amber-300/70">— {notice.content}</span>
              )}
            </div>
            <button
              onClick={() => dismiss(notice.id)}
              className="font-body text-xs text-amber-500/60 hover:text-amber-300"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

