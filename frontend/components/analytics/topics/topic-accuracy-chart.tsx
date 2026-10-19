"use client";

import React, { FC, useState } from "react";
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
import { BarChart3, Info, Target, ThumbsUp } from "lucide-react";
import type { TopicAccuracyItem } from "@/types/analytics-topics";

interface TopicAccuracyChartProps {
  data: TopicAccuracyItem[];
  isLoading?: boolean;
}

export const TopicAccuracyChart: FC<TopicAccuracyChartProps> = ({
  data = [],
  isLoading = false,
}) => {
  const [metricMode, setMetricMode] = useState<"strict" | "helpfulness">("strict");

  const hasEvaluations = data.some((d) => d.total_evaluated > 0);

  if (isLoading) {
    return (
      <div className="bg-[#161821] rounded-2xl p-6 flex flex-col gap-6 h-[440px] border border-[#1f2937] animate-pulse">
        <div className="w-48 h-4 rounded bg-gray-700/40" />
        <div className="flex-1 rounded-xl bg-gray-700/20" />
      </div>
    );
  }

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

  // Prepare chart data: For un-evaluated topics, value is 0 for drawing, but evaluated=0 flag distinguishes it
  const chartData = data.map((d) => {
    const val = metricMode === "strict" ? d.strict_accuracy : d.helpfulness;
    return {
      topic: d.topic,
      shortLabel: formatXAxis(d.topic),
      accuracy: val !== null ? val : 0,
      hasEvaluation: d.total_evaluated > 0 && val !== null,
      strict_accuracy: d.strict_accuracy,
      helpfulness: d.helpfulness,
      total_evaluated: d.total_evaluated,
      total_ai_responses: d.total_ai_responses,
      color: d.color,
    };
  });

  return (
    <div className="bg-[#161821] rounded-2xl shadow-sm p-6 flex flex-col h-[440px] border border-[#1f2937] hover:border-[#f5a623]/30 transition-colors">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/25">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Topic Accuracy Comparison
            </h3>
            <p className="text-xs text-gray-400">
              {metricMode === "strict"
                ? "Strict Correctness (Correct / Evaluated)"
                : "Helpfulness Rate (Correct + Partial / Evaluated)"}
            </p>
          </div>
        </div>

        {/* Metric Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#06080d] p-1 rounded-xl border border-[#1f2937] text-xs">
          <button
            onClick={() => setMetricMode("strict")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              metricMode === "strict"
                ? "bg-[#f5a623] text-black font-semibold shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Target className="w-3 h-3" /> Strict
          </button>
          <button
            onClick={() => setMetricMode("helpfulness")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
              metricMode === "helpfulness"
                ? "bg-[#f5a623] text-black font-semibold shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <ThumbsUp className="w-3 h-3" /> Helpful
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!hasEvaluations ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
          <Info className="w-8 h-8 text-[#f5a623] mb-2 opacity-60" />
          <p className="text-sm font-medium text-white">No Topic Evaluations Available</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Evaluations submitted during chats will appear here as accuracy bars across topics. Topics with 0 evaluations are distinguished from 0% accuracy.
          </p>
        </div>
      ) : (
        <div className="flex-1 w-full min-h-0 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#1f2937" }}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#1f2937" }}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-[#1f2937] border border-gray-700 p-3 rounded-lg shadow-xl text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 font-semibold text-white">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          {d.topic}
                        </div>
                        <div className="border-t border-gray-700 pt-1.5 space-y-1">
                          <div className="text-gray-300">
                            Strict Accuracy:{" "}
                            <span className="font-semibold text-white">
                              {d.strict_accuracy !== null ? `${d.strict_accuracy}%` : "N/A (No eval)"}
                            </span>
                          </div>
                          <div className="text-gray-300">
                            Helpfulness Rate:{" "}
                            <span className="font-semibold text-teal-400">
                              {d.helpfulness !== null ? `${d.helpfulness}%` : "N/A (No eval)"}
                            </span>
                          </div>
                          <div className="text-gray-400 text-[11px]">
                            Evaluations: {d.total_evaluated} / {d.total_ai_responses} responses
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="accuracy" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hasEvaluation ? entry.color : "#374151"}
                    opacity={entry.hasEvaluation ? 1 : 0.3}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subtext info */}
      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-[#1f2937]">
        <span>ML = Machine Learning · DL = Deep Learning · E-com = E-commerce AI</span>
        <span>Muted bars = 0 evaluations (N/A)</span>
      </div>
    </div>
  );
};
