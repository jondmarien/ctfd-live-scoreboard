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
import { useTheme } from "@/contexts/ThemeContext";
import type { ScoreboardMode } from "@/hooks/useScoreboard";

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
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dayOf(ts: number) {
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

/** Returns explicit tick timestamps: ~4 evenly spaced per day, always including the first of each day. */
function buildTicks(allTimes: number[]): number[] {
  if (allTimes.length === 0) return [];
  const sorted = [...allTimes].sort((a, b) => a - b);

  // Group into days
  const byDay = new Map<string, number[]>();
  for (const ts of sorted) {
    const d = dayOf(ts);
    if (!byDay.has(d)) byDay.set(d, []);
    byDay.get(d)!.push(ts);
  }

  const ticks: number[] = [];
  for (const dayTimes of byDay.values()) {
    // Always include the first timestamp of this day
    ticks.push(dayTimes[0]);
    // Add ~3 more evenly spaced ticks within the day
    const step = Math.floor(dayTimes.length / 4);
    if (step > 0) {
      for (let i = step; i < dayTimes.length - step / 2; i += step) {
        ticks.push(dayTimes[i]);
      }
    }
    // Always include last of day
    const last = dayTimes[dayTimes.length - 1];
    if (!ticks.includes(last)) ticks.push(last);
  }

  return ticks.sort((a, b) => a - b);
}

function makeTickFormatter(firstOfDaySet: Set<number>) {
  return (ts: number): string => {
    const d = new Date(ts);
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (firstOfDaySet.has(ts)) {
      return `${dayOf(ts)} ${time}`;
    }
    return time;
  };
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
  virtualToReal?: Map<number, number>;
}

function CustomTooltip({ active, payload, label, virtualToReal }: CustomTooltipProps) {
  const theme = useTheme();
  const c = theme.classes;
  if (!active || !payload?.length || !label) return null;
  const realTs = virtualToReal?.get(label) ?? label;
  return (
    <div className={`${c.tooltipBg} rounded-lg px-3 py-2 shadow-xl text-xs`}>
      <p className={`${c.tooltipTime} mb-1`}>{formatTime(realTs)}</p>
      {[...payload]
        .sort((a, b) => b.value - a.value)
        .map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
            <span className={`${c.tooltipName} truncate max-w-[120px]`}>
              {p.name}
            </span>
            <span className={`${c.tooltipScore} ml-auto pl-2`}>
              {p.value.toLocaleString()} {theme.labels.scoreUnit}
            </span>
          </div>
        ))}
    </div>
  );
}

// ── Gap compression ─────────────────────────────────────────────────────────
const GAP_THRESHOLD = 30 * 60 * 1000; // gaps longer than 30 min get compressed
const GAP_FILL = 5 * 60 * 1000;       // compressed to 5 min of virtual time

function buildVirtualMap(allRealTimes: number[]): Map<number, number> {
  const sorted = [...new Set(allRealTimes)].sort((a, b) => a - b);
  const realToVirtual = new Map<number, number>();
  if (sorted.length === 0) return realToVirtual;

  let virtual = sorted[0];
  realToVirtual.set(sorted[0], virtual);

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i] - sorted[i - 1];
    virtual += gap > GAP_THRESHOLD ? GAP_FILL : gap;
    realToVirtual.set(sorted[i], virtual);
  }
  return realToVirtual;
}

function buildChartDataCompressed(
  seriesList: { teamId: number; name: string; series: { time: number; score: number }[] }[],
  realToVirtual: Map<number, number>,
): { virtualToReal: Map<number, number>; data: Record<string, number | string>[] } {
  const allReal = new Set<number>();
  for (const s of seriesList) for (const p of s.series) allReal.add(p.time);
  const sorted = Array.from(allReal).sort((a, b) => a - b);

  const virtualToReal = new Map<number, number>();
  const data = sorted.map((t) => {
    const vt = realToVirtual.get(t) ?? t;
    virtualToReal.set(vt, t);
    const row: Record<string, number | string> = { time: vt };
    for (const s of seriesList) {
      const latest = s.series.filter((p) => p.time <= t).at(-1);
      if (latest) row[s.name] = latest.score;
    }
    return row;
  });
  return { virtualToReal, data };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ScoreboardGraph() {
  const [open, setOpen] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const theme = useTheme();
  const mode: ScoreboardMode = theme.id === "fantasy" ? "team" : "user";
  const { series, loading, isMock } = useScoreboardTop(10, mode);
  const c = theme.classes;

  const allTimes = series.flatMap((s) => s.series.map((p) => p.time));

  // Real-time chart data + ticks
  const sortedAllTimes = [...allTimes].sort((a, b) => a - b);
  const firstOfDaySet = new Set<number>();
  const seenDayLabels = new Set<string>();
  for (const ts of sortedAllTimes) {
    const d = dayOf(ts);
    if (!seenDayLabels.has(d)) { seenDayLabels.add(d); firstOfDaySet.add(ts); }
  }
  const explicitTicks = buildTicks(allTimes);
  const tickFormatter = makeTickFormatter(firstOfDaySet);

  // Compressed chart data + ticks
  const realToVirtual = buildVirtualMap(allTimes);
  const { virtualToReal, data: compressedData } = buildChartDataCompressed(series, realToVirtual);
  // For compressed ticks: map each real tick to its virtual equivalent
  const compressedTicks = explicitTicks.map((t) => realToVirtual.get(t) ?? t);
  const compressedFirstOfDay = new Set<number>(
    Array.from(firstOfDaySet).map((t) => realToVirtual.get(t) ?? t),
  );
  const compressedTickFormatter = (vt: number) => {
    const real = virtualToReal.get(vt) ?? vt;
    const d = new Date(real);
    const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return compressedFirstOfDay.has(vt) ? `${dayOf(real)} ${time}` : time;
  };

  const chartData = open ? (compressed ? compressedData : buildChartData(series)) : [];

  // In user mode, hide graph entirely when there's no data
  if (!loading && series.length === 0 && !isMock) return null;

  return (
    <div className={c.graphContainerBorder}>
      {/* Toggle header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-4 py-2.5 ${c.graphToggleBorder} transition-colors group`}
      >
        <span className={`${c.graphToggleText} flex items-center gap-2`}>
          <span>📈</span>
          {theme.labels.scoreProgression}
          {isMock && (
            <span className={`text-[9px] normal-case tracking-normal opacity-40`}>
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
                  <div className={`w-5 h-5 border-2 ${c.spinnerBorder} rounded-full animate-spin`} />
                  <span className={`${c.fontBody} text-xs opacity-40`}>
                    {theme.labels.scryingBattlefield}
                  </span>
                </div>
              ) : (
                <>
                  {/* Compress toggle */}
                  {seenDayLabels.size > 1 && (
                    <div className="flex justify-end mb-1">
                      <button
                        onClick={() => setCompressed((v) => !v)}
                        className={`${c.fontBody} text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border transition-colors ${
                          compressed ? c.compressedActive : c.compressedInactive
                        }`}
                      >
                        {compressed ? "⇔ compressed" : "⇔ compress gaps"}
                      </button>
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart
                      data={chartData}
                      margin={{ top: 4, right: 8, left: 0, bottom: 4 }}
                    >
                      <XAxis
                        dataKey="time"
                        type="number"
                        scale="time"
                        domain={["dataMin", "dataMax"]}
                        ticks={compressed ? compressedTicks : explicitTicks}
                        tickFormatter={compressed ? compressedTickFormatter : tickFormatter}
                        tick={{ fontSize: 9, fill: c.axisFill, fontFamily: c.axisFont }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(100,116,139,0.25)" }}
                        minTickGap={50}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: c.axisFill, fontFamily: c.axisFont }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) =>
                          v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                        }
                        width={36}
                      />
                      <Tooltip
                        content={
                          <CustomTooltip
                            virtualToReal={compressed ? virtualToReal : undefined}
                          />
                        }
                      />
                      <Legend
                        wrapperStyle={{
                          fontSize: "9px",
                          fontFamily: c.axisFont,
                          color: c.axisFill,
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
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
