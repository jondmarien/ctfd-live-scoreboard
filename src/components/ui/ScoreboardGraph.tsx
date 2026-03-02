import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useScoreboardTop } from "@/hooks/useScoreboardTop";

const TEAM_COLORS = [
  "#f59e0b", // amber
  "#60a5fa", // blue
  "#34d399", // green
  "#f87171", // red
  "#a78bfa", // purple
  "#fb923c", // orange
  "#38bdf8", // sky
  "#4ade80", // lime
  "#e879f9", // fuchsia
  "#94a3b8", // slate
];

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function buildChartData(
  seriesList: { teamId: number; name: string; series: { time: number; score: number }[] }[],
) {
  const allTimes = new Set<number>();
  for (const s of seriesList) {
    for (const p of s.series) allTimes.add(p.time);
  }
  const sorted = Array.from(allTimes).sort((a, b) => a - b);

  return sorted.map((t) => {
    const row: Record<string, number | string> = { time: t };
    for (const s of seriesList) {
      const latest = s.series.filter((p) => p.time <= t).at(-1);
      if (latest) row[s.name] = latest.score;
    }
    return row;
  });
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="bg-stone-900/95 border border-amber-800/30 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="font-medievalsharp text-amber-400/60 mb-1">{formatTime(label)}</p>
      {[...payload]
        .sort((a, b) => b.value - a.value)
        .map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="font-medievalsharp text-amber-200/70 truncate max-w-[120px]">
              {p.name}
            </span>
            <span className="font-quintessential text-amber-400 ml-auto pl-2">
              {p.value.toLocaleString()} GP
            </span>
          </div>
        ))}
    </div>
  );
}

export default function ScoreboardGraph() {
  const [open, setOpen] = useState(false);
  const { series, loading, isMock } = useScoreboardTop(10);

  const chartData = open ? buildChartData(series) : [];

  return (
    <div className="border-b border-amber-800/20">
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-amber-900/10 transition-colors group"
      >
        <span className="font-medievalsharp text-xs text-amber-500/50 uppercase tracking-widest group-hover:text-amber-400/70 transition-colors flex items-center gap-2">
          <span>📈</span>
          Score Progression
          {isMock && (
            <span className="text-[9px] text-amber-600/30 normal-case tracking-normal">
              (sample)
            </span>
          )}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-amber-600/40 group-hover:text-amber-500/60 transition-colors" />
        </motion.div>
      </button>

      {/* Collapsible chart */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="graph"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-2 pb-4 pt-1">
              {loading ? (
                <div className="flex items-center justify-center py-10 gap-3">
                  <div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
                  <span className="font-medievalsharp text-xs text-amber-400/40">
                    Scrying the battlefield...
                  </span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                  >
                    <XAxis
                      dataKey="time"
                      tickFormatter={formatTime}
                      tick={{ fontSize: 9, fill: "#a16207", fontFamily: "MedievalSharp, serif" }}
                      tickLine={false}
                      axisLine={{ stroke: "#44403c40" }}
                      interval="preserveStartEnd"
                      minTickGap={40}
                    />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#a16207", fontFamily: "MedievalSharp, serif" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) =>
                        v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                      }
                      width={36}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{
                        fontSize: "9px",
                        fontFamily: "MedievalSharp, serif",
                        color: "#a16207",
                        paddingTop: "6px",
                      }}
                      iconSize={6}
                      iconType="circle"
                    />
                    {series.map((s, i) => (
                      <Line
                        key={s.teamId}
                        type="monotone"
                        dataKey={s.name}
                        stroke={TEAM_COLORS[i % TEAM_COLORS.length]}
                        strokeWidth={1.5}
                        dot={false}
                        activeDot={{ r: 3, strokeWidth: 0 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
