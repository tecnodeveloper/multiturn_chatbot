"use client";

import { FC, useState, useMemo } from "react";
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
import { Clock, AlertCircle, Zap } from "lucide-react";
import { ResponseTimeTrendPoint } from "@/types/analytics-graphs";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "../tokens";

interface ChartResponseTimeTrendProps {
  data: ResponseTimeTrendPoint[];
  isLoading?: boolean;
}

export const ChartResponseTimeTrend: FC<ChartResponseTimeTrendProps> = ({
  data = [],
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [axisMode, setAxisMode] = useState<"turn" | "time">("turn");
  const [rangeLimit, setRangeLimit] = useState<number>(50);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (result.length > rangeLimit) {
      result = result.slice(result.length - rangeLimit);
    }
    return result;
  }, [data, rangeLimit]);

  const hasData = filteredData.length > 0;

  // Compute stats on displayed set
  const stats = useMemo(() => {
    if (!hasData) return { min: null, max: null, avg: null };
    const times = filteredData.map((d) => d.response_time);
    const min = Math.min(...times);
    const max = Math.max(...times);
    const avg = Number((times.reduce((a, b) => a + b, 0) / times.length).toFixed(2));
    return { min, max, avg };
  }, [filteredData, hasData]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-[440px] border border-border animate-pulse">
        <div className="w-48 h-4 rounded bg-muted/40" />
        <div className="flex-1 rounded-xl bg-muted/20" />
      </div>
    );
  }

  const chartData = filteredData.map((d, i) => ({
    ...d,
    xAxisLabel: axisMode === "turn" ? `Turn #${d.turn_index}` : d.formatted_time,
  }));

  return (
    <div
      id="graph-response-time-trend"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col justify-between h-[440px] border border-border scroll-mt-24"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20">
              <Clock className="h-4 w-4" />
            </div>
            <h3 className="text-[15px] font-medium text-foreground tracking-tight">
              Response Time Trend
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-muted/50 text-muted-foreground border border-border">
              FR20 &bull; Graph 5
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Chronological assistant model response generation latency in seconds
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Axis Mode Toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden text-[11px] font-medium">
            <button
              onClick={() => setAxisMode("turn")}
              className={`px-2.5 py-1 transition-colors ${
                axisMode === "turn"
                  ? "bg-[#f5a623]/15 text-[#f5a623] font-semibold"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              By Turn
            </button>
            <button
              onClick={() => setAxisMode("time")}
              className={`px-2.5 py-1 border-l border-border transition-colors ${
                axisMode === "time"
                  ? "bg-[#f5a623]/15 text-[#f5a623] font-semibold"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              By Time
            </button>
          </div>

          {/* Range Limit */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden text-[11px] font-medium">
            <button
              onClick={() => setRangeLimit(15)}
              className={`px-2 py-1 transition-colors ${
                rangeLimit === 15
                  ? "bg-[#f5a623]/15 text-[#f5a623] font-semibold"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              15
            </button>
            <button
              onClick={() => setRangeLimit(30)}
              className={`px-2 py-1 border-x border-border transition-colors ${
                rangeLimit === 30
                  ? "bg-[#f5a623]/15 text-[#f5a623] font-semibold"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              30
            </button>
            <button
              onClick={() => setRangeLimit(100)}
              className={`px-2 py-1 transition-colors ${
                rangeLimit === 100
                  ? "bg-[#f5a623]/15 text-[#f5a623] font-semibold"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="flex-1 w-full my-2 min-h-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 28, left: -16, bottom: 6 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? ANALYTICS_TOKENS.neutral.gridDark : ANALYTICS_TOKENS.neutral.gridLight}
              />
              <XAxis
                dataKey="xAxisLabel"
                axisLine={{ stroke: isDark ? "#27272a" : "#e2e8f0" }}
                tickLine={false}
                tick={{
                  fill: isDark ? ANALYTICS_TOKENS.text.secondaryDark : ANALYTICS_TOKENS.text.secondaryLight,
                  fontSize: 10.5,
                  fontWeight: 500,
                }}
              />
              <YAxis
                unit="s"
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
                  const item = payload[0].payload as ResponseTimeTrendPoint;
                  return (
                    <div className="p-3 rounded-xl bg-[#12141c] border border-border shadow-xl min-w-[210px] flex flex-col gap-1.5">
                      <div className="flex items-center justify-between border-b border-border pb-1">
                        <span className="font-semibold text-foreground text-[12.5px]">
                          Turn #{item.turn_index}
                        </span>
                        <span className="font-mono font-bold text-[#f5a623] text-[13px]">
                          {item.response_time.toFixed(2)}s
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Session:</span>
                          <span className="text-foreground font-medium truncate max-w-[130px]">
                            {item.session_title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Recorded:</span>
                          <span className="text-foreground font-mono">
                            {item.formatted_time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Domain:</span>
                          <span className="text-foreground font-medium">
                            {item.topic}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              {stats.avg !== null && (
                <ReferenceLine
                  y={stats.avg}
                  stroke="#f5a623"
                  strokeDasharray="4 4"
                  strokeOpacity={0.6}
                  label={{
                    value: `Avg: ${stats.avg}s`,
                    position: "right",
                    fill: "#f5a623",
                    fontSize: 10.5,
                    fontWeight: 500,
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="response_time"
                stroke={ANALYTICS_TOKENS.accent}
                strokeWidth={2.5}
                dot={{
                  r: 4,
                  fill: ANALYTICS_TOKENS.accent,
                  stroke: isDark ? "#06080d" : "#ffffff",
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 6,
                  fill: "#ffffff",
                  stroke: ANALYTICS_TOKENS.accent,
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No latency measurements recorded
            </p>
            <p className="text-[12px] text-muted-foreground max-w-xs mt-1">
              Response generation times recorded during chat turns will plot chronologically here.
            </p>
          </div>
        )}
      </div>

      {/* Footer KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/60">
          <span className="text-[11px] text-muted-foreground font-medium">Average Latency:</span>
          <span className="text-[12.5px] font-bold font-mono text-[#f5a623]">
            {stats.avg !== null ? `${stats.avg}s` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/60">
          <span className="text-[11px] text-muted-foreground font-medium">Fastest (Min):</span>
          <span className="text-[12.5px] font-bold font-mono text-emerald-500">
            {stats.min !== null ? `${stats.min}s` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/60">
          <span className="text-[11px] text-muted-foreground font-medium">Slowest (Max):</span>
          <span className="text-[12.5px] font-bold font-mono text-rose-400">
            {stats.max !== null ? `${stats.max}s` : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/60">
          <span className="text-[11px] text-muted-foreground font-medium">Total Responses:</span>
          <span className="text-[12.5px] font-bold font-mono text-foreground">
            {filteredData.length}
          </span>
        </div>
      </div>
    </div>
  );
};
