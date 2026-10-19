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
import { BarChart3, AlertCircle } from "lucide-react";
import { AccuracyByTopicPoint } from "@/types/analytics-graphs";
import { useTheme } from "next-themes";
import { ANALYTICS_TOKENS } from "../tokens";

interface ChartAccuracyByTopicProps {
  data: AccuracyByTopicPoint[];
  isLoading?: boolean;
}

export const ChartAccuracyByTopic: FC<ChartAccuracyByTopicProps> = ({
  data = [],
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasEvaluations = data.some((d) => d.total_evaluated > 0);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-[440px] border border-border animate-pulse">
        <div className="w-48 h-4 rounded bg-muted/40" />
        <div className="flex-1 rounded-xl bg-muted/20" />
      </div>
    );
  }

  // Abbreviated label for compact display on x-axis
  const formatXAxis = (topic: string) => {
    switch (topic) {
      case "Machine Learning":
        return "ML";
      case "Deep Learning":
        return "DL";
      case "Healthcare AI":
        return "Health";
      case "Power Systems":
        return "Power";
      case "E-commerce AI":
        return "E-com";
      default:
        return topic;
    }
  };

  return (
    <div
      id="graph-accuracy-by-topic"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col justify-between h-[440px] border border-border scroll-mt-24"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="text-[15px] font-medium text-foreground tracking-tight">
              Accuracy by Topic
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-muted/50 text-muted-foreground border border-border">
              FR20 &bull; Graph 2
            </span>
          </div>
          <p className="text-[12px] text-muted-foreground">
            Correctness accuracy rate: (Correct + Partial) / Total Evaluated &times; 100
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border shrink-0">
          <span className="text-[11px] text-muted-foreground font-medium">Scale:</span>
          <span className="text-[11px] font-semibold text-foreground font-mono">0% – 100%</span>
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="flex-1 w-full my-2 min-h-0">
        {hasEvaluations ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 12, left: -16, bottom: 6 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDark ? ANALYTICS_TOKENS.neutral.gridDark : ANALYTICS_TOKENS.neutral.gridLight}
              />
              <XAxis
                dataKey="topic"
                tickFormatter={formatXAxis}
                axisLine={{ stroke: isDark ? "#27272a" : "#e2e8f0" }}
                tickLine={false}
                tick={{
                  fill: isDark ? ANALYTICS_TOKENS.text.secondaryDark : ANALYTICS_TOKENS.text.secondaryLight,
                  fontSize: 11,
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
                cursor={{ fill: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.03)" }}
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
                  const item = payload[0].payload as AccuracyByTopicPoint;
                  return (
                    <div className="p-2.5 flex flex-col gap-1.5 min-w-[190px]">
                      <div className="flex items-center justify-between border-b border-border pb-1">
                        <span className="font-semibold text-foreground text-[12.5px]">
                          {item.topic}
                        </span>
                        <span className="font-mono font-bold text-[#f5a623] text-[12px]">
                          {item.total_evaluated > 0 ? `${item.accuracy}%` : "No data"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-0.5">
                        <span>Evaluated:</span>
                        <span className="font-mono text-foreground font-medium text-right">
                          {item.total_evaluated}
                        </span>
                        <span className="text-emerald-500">Correct:</span>
                        <span className="font-mono text-foreground font-medium text-right">
                          {item.correct}
                        </span>
                        <span className="text-amber-500">Partial:</span>
                        <span className="font-mono text-foreground font-medium text-right">
                          {item.partial}
                        </span>
                        <span className="text-rose-500">Incorrect:</span>
                        <span className="font-mono text-foreground font-medium text-right">
                          {item.incorrect}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="accuracy"
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
              >
                {data.map((entry, index) => {
                  const hasSamples = entry.total_evaluated > 0;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        hasSamples
                          ? entry.accuracy >= 75
                            ? "#10b981"
                            : entry.accuracy >= 50
                            ? ANALYTICS_TOKENS.accent
                            : "#f59e0b"
                          : isDark
                          ? "#27272a"
                          : "#e4e4e7"
                      }
                      fillOpacity={hasSamples ? 0.9 : 0.4}
                    />
                  );
                })}
                <LabelList
                  dataKey="accuracy"
                  position="top"
                  formatter={(val: any) => (val > 0 ? `${val}%` : "")}
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
              No topic accuracy evaluations recorded
            </p>
            <p className="text-[12px] text-muted-foreground max-w-xs mt-1">
              Submit feedback on model answers across domains to calculate accuracy benchmarking.
            </p>
          </div>
        )}
      </div>

      {/* Legend / Sample Indicator */}
      <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[11.5px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500 shrink-0" />
            <span>&ge; 75% High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#f5a623] shrink-0" />
            <span>50–74% Good</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-muted-foreground/40 shrink-0" />
            <span>No evaluations</span>
          </div>
        </div>
        <span className="text-[11px] text-muted-foreground font-mono">
          N = {data.reduce((acc, curr) => acc + curr.total_evaluated, 0)} replies
        </span>
      </div>
    </div>
  );
};
