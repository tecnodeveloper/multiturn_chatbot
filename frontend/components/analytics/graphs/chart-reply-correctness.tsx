"use client";

import { FC, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CheckCircle2, AlertCircle, Filter, Star, Clock, Layers } from "lucide-react";
import { ReplyCorrectnessPoint } from "@/types/analytics-graphs";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "../tokens";

interface ChartReplyCorrectnessProps {
  data: ReplyCorrectnessPoint[];
  isLoading?: boolean;
}

export const ChartReplyCorrectness: FC<ChartReplyCorrectnessProps> = ({
  data = [],
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Functional interactive controls: Correctness filter & Range limit
  const [correctnessFilter, setCorrectnessFilter] = useState<"all" | "correct" | "partial" | "incorrect">("all");
  const [rangeLimit, setRangeLimit] = useState<number>(25);

  const filteredData = useMemo(() => {
    let result = [...data];
    if (correctnessFilter !== "all") {
      result = result.filter((r) => r.correctness === correctnessFilter);
    }
    // Limit to latest N chronologically
    if (result.length > rangeLimit) {
      result = result.slice(result.length - rangeLimit);
    }
    return result;
  }, [data, correctnessFilter, rangeLimit]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-[440px] border border-border animate-pulse">
        <div className="w-48 h-4 rounded bg-muted/40" />
        <div className="flex-1 rounded-xl bg-muted/20" />
      </div>
    );
  }

  // Numerical value for categorical height
  const chartData = filteredData.map((d) => ({
    ...d,
    val: 1, // Categorical bar indicator
    label: `#${d.index}`,
  }));

  const getColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "correct":
        return "#10b981"; // Emerald
      case "partial":
        return "#f5a623"; // Brand Orange
      case "incorrect":
        return "#ef4444"; // Rose / Red
      default:
        return "#71717a";
    }
  };

  return (
    <div
      id="graph-reply-correctness"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col justify-between h-[440px] border border-border scroll-mt-24"
    >
      {/* Header with Interactive Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <h3 className="text-[15px] font-medium text-foreground tracking-tight">
              Correctness by Reply
            </h3>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Categorical classification of individual evaluated assistant turns
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Status selector */}
          <select
            value={correctnessFilter}
            onChange={(e) => setCorrectnessFilter(e.target.value as any)}
            className="text-[11.5px] bg-muted/30 border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-[#f5a623]"
          >
            <option value="all">All statuses</option>
            <option value="correct">Correct only</option>
            <option value="partial">Partial only</option>
            <option value="incorrect">Incorrect only</option>
          </select>

          {/* Range limit */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden text-[11px] font-medium">
            <button
              onClick={() => setRangeLimit(10)}
              className={`px-2 py-1 transition-colors ${
                rangeLimit === 10
                  ? "bg-[#f5a623]/15 text-[#f5a623] font-semibold"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              10
            </button>
            <button
              onClick={() => setRangeLimit(25)}
              className={`px-2 py-1 border-x border-border transition-colors ${
                rangeLimit === 25
                  ? "bg-[#f5a623]/15 text-[#f5a623] font-semibold"
                  : "bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              25
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

      {/* Main Categorical Bar Chart */}
      <div className="flex-1 w-full my-2 min-h-0">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 16, right: 12, left: -24, bottom: 6 }}
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
                  fontSize: 10.5,
                  fontWeight: 500,
                }}
              />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 1]}
                tickFormatter={() => ""}
                axisLine={false}
                tickLine={false}
                width={12}
              />
              <Tooltip
                cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)" }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as ReplyCorrectnessPoint;
                  return (
                    <div className="p-3 rounded-xl bg-[#12141c] border border-border shadow-2xl max-w-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between border-b border-border pb-1.5">
                        <span className="font-semibold text-foreground text-[12.5px] flex items-center gap-1.5">
                          Reply #{item.index}
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                            style={{
                              backgroundColor: `${getColor(item.status)}20`,
                              color: getColor(item.status),
                              border: `1px solid ${getColor(item.status)}40`,
                            }}
                          >
                            {item.status}
                          </span>
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {item.formatted_time}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-[11.5px] text-muted-foreground">
                        <div className="flex items-center justify-between">
                          <span>Session:</span>
                          <span className="text-foreground font-medium truncate max-w-[180px]">
                            {item.session_title}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Domain:</span>
                          <span className="text-foreground font-medium">
                            {item.topic}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Human Rating:</span>
                          <span className="text-[#f5a623] font-mono font-medium flex items-center gap-1">
                            <Star className="h-3 w-3 fill-[#f5a623]" />
                            {item.rating} / 4
                          </span>
                        </div>
                        {item.response_time !== null && (
                          <div className="flex items-center justify-between">
                            <span>Latency:</span>
                            <span className="text-foreground font-mono font-medium">
                              {item.response_time.toFixed(2)}s
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-border/70 text-[11px] text-muted-foreground/90 line-clamp-2 italic">
                        &ldquo;{item.preview}&rdquo;
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="val" radius={[6, 6, 0, 0]} maxBarSize={32}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColor(entry.status)}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No replies matching filter
            </p>
            <p className="text-[12px] text-muted-foreground max-w-xs mt-1">
              Adjust your status filter or submit feedback evaluations to inspect reply correctness.
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11.5px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
            <span className="text-muted-foreground font-medium">Correct</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#f5a623] shrink-0" />
            <span className="text-muted-foreground font-medium">Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 shrink-0" />
            <span className="text-muted-foreground font-medium">Incorrect</span>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          Showing {chartData.length} of {data.length} evaluations
        </span>
      </div>
    </div>
  );
};
