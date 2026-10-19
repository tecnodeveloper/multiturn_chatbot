"use client";

import { FC } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingUp, AlertCircle, HelpCircle } from "lucide-react";
import { PhaseAccuracyPoint } from "@/types/analytics-graphs";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "../tokens";

interface ChartPhaseAccuracyProps {
  data: PhaseAccuracyPoint[];
  isLoading?: boolean;
}

export const ChartPhaseAccuracy: FC<ChartPhaseAccuracyProps> = ({
  data = [],
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totalEvaluated = data.reduce((acc, curr) => acc + curr.total_evaluated, 0);
  const hasEvaluations = totalEvaluated > 0;

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-[440px] border border-border animate-pulse">
        <div className="w-48 h-4 rounded bg-muted/40" />
        <div className="flex-1 rounded-xl bg-muted/20" />
      </div>
    );
  }

  // Format data for Recharts, ensuring unavailable phases are null so no fake 0% is rendered
  const chartData = data.map((d) => ({
    ...d,
    displayAccuracy: d.total_evaluated > 0 && d.accuracy !== null ? d.accuracy : null,
  }));

  return (
    <div
      id="graph-phase-accuracy"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col justify-between h-[440px] border border-border scroll-mt-24"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h3 className="text-[15px] font-medium text-foreground tracking-tight">
              Accuracy Across Session Phases
            </h3>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Multi-turn accuracy trajectory: Start (turns 1–2), Middle (turns 3–5), and End (turns 6+)
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border shrink-0">
          <span className="text-[11px] text-muted-foreground font-medium">Evaluations:</span>
          <span className="text-[12px] font-semibold text-foreground font-mono">
            {totalEvaluated}
          </span>
        </div>
      </div>

      {/* Main Line Chart */}
      <div className="flex-1 w-full my-2 min-h-0">
        {hasEvaluations ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 24, right: 28, left: -16, bottom: 6 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? ANALYTICS_TOKENS.neutral.gridDark : ANALYTICS_TOKENS.neutral.gridLight}
              />
              <XAxis
                dataKey="label"
                axisLine={{ stroke: isDark ? "#27272a" : "#e2e8f0" }}
                tickLine={false}
                tick={{
                  fill: isDark ? ANALYTICS_TOKENS.text.secondaryDark : ANALYTICS_TOKENS.text.secondaryLight,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDark ? ANALYTICS_TOKENS.text.mutedDark : ANALYTICS_TOKENS.text.mutedLight,
                  fontSize: 10.5,
                  fontWeight: 400,
                }}
              />
              <Tooltip
                cursor={{ stroke: isDark ? "#3f3f46" : "#cbd5e1", strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as PhaseAccuracyPoint;
                  const hasDataForPhase = item.total_evaluated > 0 && item.accuracy !== null;

                  return (
                    <div className="p-3 rounded-xl bg-[#12141c] border border-border shadow-xl min-w-[210px]">
                      <div className="flex items-center justify-between border-b border-border pb-1.5 mb-2">
                        <div>
                          <span className="font-semibold text-foreground text-[13px] block">
                            {item.label} Phase
                          </span>
                          <span className="text-[11px] text-[#f5a623] font-medium">
                            {item.turns_range}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-foreground text-[13px]">
                          {hasDataForPhase ? `${item.accuracy}%` : "No data"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                        <span>Evaluated Replies:</span>
                        <span className="font-mono text-foreground font-medium text-right">
                          {item.total_evaluated}
                        </span>
                        <span className="text-emerald-400">Correct:</span>
                        <span className="font-mono text-foreground font-medium text-right">
                          {item.correct}
                        </span>
                        <span className="text-amber-400">Partial:</span>
                        <span className="font-mono text-foreground font-medium text-right">
                          {item.partial}
                        </span>
                        <span className="text-rose-400">Incorrect:</span>
                        <span className="font-mono text-foreground font-medium text-right">
                          {item.incorrect}
                        </span>
                      </div>
                      {!hasDataForPhase && (
                        <p className="text-[10.5px] text-amber-500/90 mt-2 pt-1 border-t border-border/60 flex items-center gap-1">
                          <HelpCircle className="h-3 w-3 shrink-0" />
                          No evaluations reached this phase yet
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={75}
                stroke={isDark ? "rgba(16, 185, 129, 0.35)" : "rgba(16, 185, 129, 0.45)"}
                strokeDasharray="4 4"
                label={{
                  value: "75% Target",
                  position: "right",
                  fill: "#10b981",
                  fontSize: 10,
                  fontWeight: 500,
                }}
              />
              <Line
                type="monotone"
                dataKey="displayAccuracy"
                stroke={ANALYTICS_TOKENS.accent}
                strokeWidth={3}
                connectNulls={false}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.displayAccuracy === null) {
                    return (
                      <circle
                        key={`dot-empty-${cx}`}
                        cx={cx}
                        cy={220}
                        r={4}
                        fill="transparent"
                        stroke={isDark ? "#3f3f46" : "#cbd5e1"}
                        strokeDasharray="2 2"
                      />
                    );
                  }
                  return (
                    <circle
                      key={`dot-${cx}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={ANALYTICS_TOKENS.accent}
                      stroke={isDark ? "#06080d" : "#ffffff"}
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{
                  r: 7,
                  fill: ANALYTICS_TOKENS.accent,
                  stroke: isDark ? "#ffffff" : "#0f172a",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No phase evaluations recorded
            </p>
            <p className="text-[12px] text-muted-foreground max-w-xs mt-1">
              Start conversations with multiple turns to evaluate model accuracy across Start, Middle, and End phases.
            </p>
          </div>
        )}
      </div>

      {/* Phase Cards Footer */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60">
        {data.map((p) => {
          const hasData = p.total_evaluated > 0 && p.accuracy !== null;
          return (
            <div
              key={p.phase}
              className={`p-2 rounded-xl flex flex-col gap-0.5 border ${
                hasData
                  ? "bg-muted/20 border-border/80"
                  : "bg-muted/5 border-dashed border-border/50 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-medium text-foreground">
                  {p.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {p.turns_range}
                </span>
              </div>
              <div className="flex items-baseline justify-between mt-0.5">
                <span className="text-[14px] font-bold font-mono text-[#f5a623]">
                  {hasData ? `${p.accuracy}%` : "—"}
                </span>
                <span className="text-[10.5px] text-muted-foreground">
                  {p.total_evaluated} eval{p.total_evaluated === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
