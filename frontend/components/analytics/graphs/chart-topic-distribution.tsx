"use client";

import { FC } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon, AlertCircle, Info } from "lucide-react";
import { TopicDistributionSlice } from "@/types/analytics-graphs";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "../tokens";

interface ChartTopicDistributionProps {
  data: TopicDistributionSlice[];
  totalEvaluations: number;
  isLoading?: boolean;
}

export const ChartTopicDistribution: FC<ChartTopicDistributionProps> = ({
  data = [],
  totalEvaluations = 0,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasData = totalEvaluations > 0 && data.some((d) => d.count > 0);
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
      id="graph-topic-distribution"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col justify-between h-[440px] border border-border scroll-mt-24"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20">
              <PieIcon className="h-4 w-4" />
            </div>
            <h3 className="text-[15px] font-medium text-foreground tracking-tight">
              Topic Distribution
            </h3>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Share of human-evaluated replies across conversational domains
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border shrink-0">
          <span className="text-[11px] text-muted-foreground font-medium">Evaluations:</span>
          <span className="text-[12px] font-semibold text-foreground font-mono">
            {totalEvaluations}
          </span>
        </div>
      </div>

      {/* Main Chart Body */}
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
                paddingAngle={2}
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
                formatter={(value: any, name: any, props: any) => {
                  const pct = props?.payload?.percentage || 0;
                  return [
                    `${value} replies (${pct}%)`,
                    props?.payload?.topic || "Domain",
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No topic evaluations recorded
            </p>
            <p className="text-[12px] text-muted-foreground max-w-xs mt-1">
              Evaluations across Machine Learning, Deep Learning, Healthcare AI, Power Systems, and E-commerce AI will appear here.
            </p>
          </div>
        )}

        {/* Center Donut Label */}
        {hasData && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[20px] font-bold text-foreground font-mono leading-none">
              {totalEvaluations}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
              Evaluated
            </span>
          </div>
        )}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-border/60">
        {data.map((item) => (
          <div
            key={item.topic}
            className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded-md text-[11.5px] transition-colors ${
              item.count > 0 ? "bg-muted/20" : "opacity-50"
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-muted-foreground font-medium">
                {item.topic}
              </span>
            </div>
            <span className="font-mono text-foreground font-medium shrink-0 text-[11px]">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
