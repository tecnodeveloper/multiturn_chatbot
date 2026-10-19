"use client";

import { FC } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AlignLeft, AlertCircle, Star } from "lucide-react";
import { LengthPreferenceSlice } from "@/types/analytics-graphs";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "../tokens";

interface ChartLengthPreferenceProps {
  data: LengthPreferenceSlice[];
  isLoading?: boolean;
}

export const ChartLengthPreference: FC<ChartLengthPreferenceProps> = ({
  data = [],
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totalResponses = data.reduce((acc, curr) => acc + curr.count, 0);
  const hasData = totalResponses > 0 && data.some((d) => d.count > 0);
  const activeSlices = data.filter((d) => d.count > 0);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-[440px] border border-border animate-pulse">
        <div className="w-48 h-4 rounded bg-muted/40" />
        <div className="flex-1 rounded-xl bg-muted/20" />
      </div>
    );
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.08) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div
      id="graph-length-preference"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col justify-between h-[440px] border border-border scroll-mt-24"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20">
              <AlignLeft className="h-4 w-4" />
            </div>
            <h3 className="text-[15px] font-medium text-foreground tracking-tight">
              Response Length Preferences
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-muted/50 text-muted-foreground border border-border">
              FR20 &bull; Graph 7
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            User preferences across Short, To the Point, and Lengthy responses
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border shrink-0">
          <span className="text-[11px] text-muted-foreground font-medium">Submissions:</span>
          <span className="text-[12px] font-semibold text-foreground font-mono">
            {totalResponses}
          </span>
        </div>
      </div>

      {/* Main Donut Chart */}
      <div className="relative flex-1 w-full my-2 min-h-0">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeSlices}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={3}
                labelLine={false}
                label={renderCustomizedLabel}
                dataKey="count"
              >
                {activeSlices.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={isDark ? ANALYTICS_TOKENS.surface.cardDark : "#ffffff"}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: isDark
                    ? `1px solid ${ANALYTICS_TOKENS.neutral.darkest}`
                    : `1px solid ${ANALYTICS_TOKENS.surface.borderLight}`,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.35)",
                  backgroundColor: isDark ? "#12141c" : "#ffffff",
                  color: isDark ? "#ffffff" : "#0f172a",
                  fontSize: 12,
                }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as LengthPreferenceSlice;
                  return (
                    <div className="p-3 rounded-xl bg-[#12141c] border border-border shadow-xl min-w-[200px] flex flex-col gap-1.5">
                      <div className="flex items-center justify-between border-b border-border pb-1.5">
                        <span className="font-semibold text-foreground text-[12.5px] flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.type}
                        </span>
                        <span className="font-mono font-bold text-[#f5a623] text-[12.5px]">
                          {item.percentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Preferences:</span>
                        <span className="font-mono text-foreground font-medium">
                          {item.count} responses
                        </span>
                      </div>
                      {item.avg_rating !== null && (
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                          <span>Average Rating:</span>
                          <span className="font-mono text-foreground font-medium flex items-center gap-1 text-[#f5a623]">
                            <Star className="h-3 w-3 fill-[#f5a623]" />
                            {item.avg_rating.toFixed(2)} / 4
                          </span>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No length preferences submitted
            </p>
            <p className="text-[12px] text-muted-foreground max-w-xs mt-1">
              Select Short, To the Point, or Lengthy preferences on completed turns to view distribution.
            </p>
          </div>
        )}

        {/* Center Donut Label */}
        {hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[20px] font-bold text-foreground font-mono leading-none">
              {totalResponses}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Responses
            </span>
          </div>
        )}
      </div>

      {/* Legend Grid with All 3 Categories */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60">
        {data.map((item) => (
          <div
            key={item.type}
            className={`p-2 rounded-xl flex flex-col gap-0.5 border ${
              item.count > 0
                ? "bg-muted/20 border-border/80"
                : "bg-muted/5 border-dashed border-border/50 opacity-60"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[11.5px] font-medium text-foreground truncate">
                {item.type}
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-[14px] font-bold font-mono text-foreground">
                {item.count}
              </span>
              <span className="text-[10.5px] text-muted-foreground font-mono">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
