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
  Legend,
} from "recharts";
import { AlertCircle } from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "./tokens";

interface ResponseVolumeChartProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
}

export const ResponseVolumeChart: FC<ResponseVolumeChartProps> = ({
  data: analyticsData,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const trends = analyticsData?.trends || [];
  const hasData = trends.some((t) => t.total > 0);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full border border-border animate-pulse">
        <div className="w-56 h-4 rounded bg-muted/40" />
        <div className="h-[280px] w-full rounded-xl bg-muted/20" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full border border-border">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[16px] font-medium text-foreground">
          Response volume & quality
        </h3>
        <p className="text-[11.5px] text-muted-foreground">
          Daily assistant response generation count vs evaluated helpful responses
        </p>
      </div>

      <div className="h-[280px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trends} barGap={8}>
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
                  fontWeight: 400,
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                tick={{
                  fill: isDark ? ANALYTICS_TOKENS.text.mutedDark : ANALYTICS_TOKENS.text.mutedLight,
                  fontSize: 11,
                  fontWeight: 400,
                }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
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
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: "20px", fontSize: "11px", fontWeight: 400 }}
              />
              <Bar
                name="Total evaluated"
                dataKey="total"
                fill={isDark ? ANALYTICS_TOKENS.neutral.medium : "#94a3b8"}
                radius={[4, 4, 0, 0]}
                barSize={28}
              />
              <Bar
                name="Helpful responses"
                dataKey="helpful"
                fill={ANALYTICS_TOKENS.accent}
                radius={[4, 4, 0, 0]}
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No daily response activity recorded
            </p>
            <p className="text-[12px] text-muted-foreground max-w-sm mt-1">
              Active turn interactions and human evaluations will display daily volume progression here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
