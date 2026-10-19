"use client";

import { FC } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, AlertCircle } from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "./tokens";

interface AccuracyTrendChartProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
}

export const AccuracyTrendChart: FC<AccuracyTrendChartProps> = ({
  data: analyticsData,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const trends = analyticsData?.trends || [];
  const hasData = trends.some((t) => t.total > 0);

  const chartData = trends.map((t) => ({
    day: t.day,
    val: t.accuracy,
    total: t.total,
    helpful: t.helpful,
  }));

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full border border-border animate-pulse">
        <div className="flex justify-between items-center">
          <div className="w-44 h-4 rounded bg-muted/40" />
          <div className="w-24 h-6 rounded bg-muted/40" />
        </div>
        <div className="h-[250px] w-full rounded-xl bg-muted/20" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full border border-border">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[16px] font-medium text-foreground">
            Response accuracy trend
          </h3>
          <p className="text-[11.5px] text-muted-foreground">
            Daily percentage of helpful and partially helpful responses
          </p>
        </div>

        {/* Replaced decorative selector with honest time scope badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-muted/30 border border-border text-[11.5px] font-normal text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-[#f5a623]" />
          <span>Last 7 Days</span>
        </div>
      </div>

      <div className="h-[250px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ANALYTICS_TOKENS.accent} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={ANALYTICS_TOKENS.accent} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? ANALYTICS_TOKENS.neutral.gridDark : ANALYTICS_TOKENS.neutral.gridLight}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDark ? ANALYTICS_TOKENS.text.mutedDark : ANALYTICS_TOKENS.text.mutedLight,
                  fontSize: 11,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDark ? ANALYTICS_TOKENS.text.mutedDark : ANALYTICS_TOKENS.text.mutedLight,
                  fontSize: 11,
                }}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
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
                formatter={(val: any, _name: any, item: any) => [
                  `${val}% (${item.payload.helpful}/${item.payload.total} helpful)`,
                  "Accuracy",
                ]}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke={ANALYTICS_TOKENS.accent}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorAccuracy)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No evaluation trend data available
            </p>
            <p className="text-[12px] text-muted-foreground max-w-sm mt-1">
              Complete mandatory feedback evaluations after chat turns to populate daily accuracy trajectory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
