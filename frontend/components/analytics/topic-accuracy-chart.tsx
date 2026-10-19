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
  LabelList,
} from "recharts";
import { AlertCircle } from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "./tokens";

interface TopicAccuracyChartProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
}

export const TopicAccuracyChart: FC<TopicAccuracyChartProps> = ({
  data: analyticsData,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const topics = analyticsData?.topics || [];
  const hasData = topics.some((t) => t.count > 0);

  const chartData = topics.map((t) => ({
    topic: t.name || t.keywords.join(", "),
    val: t.count,
  }));

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full border border-border animate-pulse">
        <div className="w-48 h-4 rounded bg-muted/40" />
        <div className="h-[260px] w-full rounded-xl bg-muted/20" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full border border-border">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[16px] font-medium text-foreground">
          Feedback volume by topic
        </h3>
        <p className="text-[11.5px] text-muted-foreground">
          Count of human evaluations categorized across 5 AI domains
        </p>
      </div>

      <div className="h-[280px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ left: 10, right: 40 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke={isDark ? ANALYTICS_TOKENS.neutral.gridDark : ANALYTICS_TOKENS.neutral.gridLight}
              />
              <XAxis type="number" allowDecimals={false} hide />
              <YAxis
                dataKey="topic"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: isDark ? ANALYTICS_TOKENS.text.secondaryDark : ANALYTICS_TOKENS.text.secondaryLight,
                  fontSize: 11,
                  fontWeight: 400,
                }}
                width={130}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
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
                formatter={(value: any) => [
                  `${value} evaluation${value === 1 ? "" : "s"}`,
                  "Feedback Volume",
                ]}
              />
              <Bar
                dataKey="val"
                fill={ANALYTICS_TOKENS.accent}
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                <LabelList
                  dataKey="val"
                  position="right"
                  style={{
                    fill: isDark ? ANALYTICS_TOKENS.text.mutedDark : ANALYTICS_TOKENS.text.mutedLight,
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <AlertCircle className="h-6 w-6 text-muted-foreground/50 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No topic feedback recorded
            </p>
            <p className="text-[12px] text-muted-foreground max-w-xs mt-1">
              Feedback evaluations across Machine Learning, Deep Learning, Healthcare, Power Systems, and E-commerce AI will aggregate here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
