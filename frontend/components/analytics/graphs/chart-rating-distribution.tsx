"use client";

import { FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { Star, AlertCircle } from "lucide-react";
import { RatingDistributionBar } from "@/types/analytics-graphs";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "../tokens";

interface ChartRatingDistributionProps {
  data: RatingDistributionBar[];
  isLoading?: boolean;
}

export const ChartRatingDistribution: FC<ChartRatingDistributionProps> = ({
  data = [],
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totalRatings = data.reduce((acc, curr) => acc + curr.count, 0);
  const hasData = totalRatings > 0;

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-[440px] border border-border animate-pulse">
        <div className="w-48 h-4 rounded bg-muted/40" />
        <div className="flex-1 rounded-xl bg-muted/20" />
      </div>
    );
  }

  // Display in 1 -> 2 -> 3 -> 4 order
  const sortedData = [...data].sort((a, b) => a.rating - b.rating);

  const RATING_DESC: Record<number, string> = {
    1: "Inaccurate, unhelpful, or off-topic answer",
    2: "Partially addressed prompt with deficiencies",
    3: "Accurate and clear response answering question",
    4: "Flawless, comprehensive, and well-structured",
  };

  return (
    <div
      id="graph-rating-distribution"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col justify-between h-[440px] border border-border scroll-mt-24"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20">
              <Star className="h-4 w-4" />
            </div>
            <h3 className="text-[15px] font-medium text-foreground tracking-tight">
              User Rating Distribution
            </h3>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Distribution of evaluations strictly across the project&apos;s 1–4 point scale
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border shrink-0">
          <span className="text-[11px] text-muted-foreground font-medium">Total:</span>
          <span className="text-[12px] font-semibold text-foreground font-mono">
            {totalRatings} ratings
          </span>
        </div>
      </div>

      {/* Main Chart */}
      <div className="flex-1 w-full my-2 min-h-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              margin={{ top: 20, right: 12, left: -20, bottom: 6 }}
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
                tickFormatter={(label, index) => `${index + 1} • ${label}`}
                tick={{
                  fill: isDark ? ANALYTICS_TOKENS.text.secondaryDark : ANALYTICS_TOKENS.text.secondaryLight,
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDark ? ANALYTICS_TOKENS.text.mutedDark : ANALYTICS_TOKENS.text.mutedLight,
                  fontSize: 10.5,
                  fontWeight: 400,
                }}
              />
              <Tooltip
                cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)" }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as RatingDistributionBar;
                  return (
                    <div className="p-3 rounded-xl bg-[#12141c] border border-border shadow-xl min-w-[210px] flex flex-col gap-1.5">
                      <div className="flex items-center justify-between border-b border-border pb-1.5">
                        <span className="font-semibold text-foreground text-[12.5px] flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          Level {item.rating} ({item.label})
                        </span>
                        <span className="font-mono font-bold text-[#f5a623] text-[12.5px]">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Submitted count:</span>
                        <span className="font-mono text-foreground font-medium">
                          {item.count} rating{item.count === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="text-[10.5px] text-muted-foreground/90 pt-1 border-t border-border/60">
                        {RATING_DESC[item.rating]}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                maxBarSize={50}
              >
                {sortedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    fillOpacity={entry.count > 0 ? 0.9 : 0.3}
                  />
                ))}
                <LabelList
                  dataKey="percentage"
                  position="top"
                  formatter={(v: any) => `${v}%`}
                  style={{
                    fill: isDark ? ANALYTICS_TOKENS.text.secondaryDark : ANALYTICS_TOKENS.text.secondaryLight,
                    fontSize: 10.5,
                    fontWeight: 600,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No rating evaluations submitted
            </p>
            <p className="text-[12px] text-muted-foreground max-w-xs mt-1">
              Human ratings from 1 (Poor) to 4 (Excellent) will display here.
            </p>
          </div>
        )}
      </div>

      {/* Rating Cards Grid */}
      <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border/60">
        {sortedData.map((item) => (
          <div
            key={item.rating}
            className="p-2 rounded-xl bg-muted/20 border border-border/80 flex flex-col gap-0.5"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11px] text-muted-foreground truncate font-medium">
                {item.label}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-[14px] font-bold font-mono text-foreground">
                {item.count}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
