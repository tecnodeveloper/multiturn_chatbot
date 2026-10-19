"use client";

import { FC } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AlertCircle } from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "./tokens";

interface FeedbackDistributionChartProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
}

export const FeedbackDistributionChart: FC<FeedbackDistributionChartProps> = ({
  data: analyticsData,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const correctness = analyticsData?.stats.correctness || {};
  const totalFeedback = analyticsData?.summary.total_feedback || 0;

  const chartData = [
    {
      name: "Helpful (Correct)",
      value: correctness.correct || 0,
      color: ANALYTICS_TOKENS.accent,
    },
    {
      name: "Partially helpful",
      value: correctness.partial || 0,
      color: isDark ? "rgba(245, 166, 35, 0.55)" : "rgba(245, 166, 35, 0.65)",
    },
    {
      name: "Not helpful (Incorrect)",
      value: correctness.incorrect || 0,
      color: isDark ? "#71717a" : "#9ca3af",
    },
  ].filter((item) => item.value > 0);

  const hasData = totalFeedback > 0 && chartData.length > 0;

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full border border-border animate-pulse">
        <div className="w-48 h-4 rounded bg-muted/40" />
        <div className="h-[250px] w-full rounded-xl bg-muted/20" />
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

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#0f1117"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={11}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full border border-border">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[16px] font-medium text-foreground">
          Correctness distribution
        </h3>
        <p className="text-[11.5px] text-muted-foreground">
          Evaluated model replies grouped into correctness categories
        </p>
      </div>

      <div className="h-[250px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={95}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={
                      isDark
                        ? ANALYTICS_TOKENS.surface.cardDark
                        : ANALYTICS_TOKENS.surface.cardLight
                    }
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
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.25)",
                  backgroundColor: isDark
                    ? ANALYTICS_TOKENS.surface.cardDark
                    : ANALYTICS_TOKENS.surface.cardLight,
                  color: isDark
                    ? ANALYTICS_TOKENS.text.primaryDark
                    : ANALYTICS_TOKENS.text.primaryLight,
                  fontSize: 12,
                }}
                formatter={(value: any) => [`${value}% of evaluations`, "Share"]}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No feedback evaluations submitted
            </p>
            <p className="text-[12px] text-muted-foreground max-w-xs mt-1">
              Submit ratings and correctness categories on completed turns to view the breakdown.
            </p>
          </div>
        )}
      </div>

      {hasData && (
        <div className="grid grid-cols-3 gap-3 mt-auto pt-3 border-t border-border/60">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex flex-col">
                <span className="text-[11px] font-normal text-muted-foreground truncate">
                  {item.name}
                </span>
                <span className="text-[12.5px] font-semibold text-foreground">
                  {item.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
