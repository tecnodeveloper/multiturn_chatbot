"use client";

import React, { FC } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon, Info } from "lucide-react";
import type { TopicDistributionItem } from "@/types/analytics-topics";

interface TopicDistributionChartProps {
  data: TopicDistributionItem[];
  totalAiResponses: number;
  isLoading?: boolean;
}

export const TopicDistributionChart: FC<TopicDistributionChartProps> = ({
  data = [],
  totalAiResponses = 0,
  isLoading = false,
}) => {
  const hasData = totalAiResponses > 0 && data.some((d) => d.count > 0);
  const activeSlices = data.filter((d) => d.count > 0);

  if (isLoading) {
    return (
      <div className="bg-[#161821] rounded-2xl p-6 flex flex-col gap-6 h-[440px] border border-[#1f2937] animate-pulse">
        <div className="w-48 h-4 rounded bg-gray-700/40" />
        <div className="flex-1 rounded-xl bg-gray-700/20" />
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
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
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
    <div className="bg-[#161821] rounded-2xl shadow-sm p-6 flex flex-col h-[440px] border border-[#1f2937] hover:border-[#f5a623]/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/25">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Topic Distribution
            </h3>
            <p className="text-xs text-gray-400">
              Proportion of {totalAiResponses} assistant responses across topics
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
          <Info className="w-8 h-8 text-[#f5a623] mb-2 opacity-60" />
          <p className="text-sm font-medium text-white">No Topic Data Recorded</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Start conversations across machine learning, deep learning, healthcare, power systems, or e-commerce domains to populate distribution.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row items-center justify-between gap-4 min-h-0">
          {/* Donut Chart */}
          <div className="w-full sm:w-1/2 h-[260px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeSlices}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="topic"
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {activeSlices.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke="#161821"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TopicDistributionItem;
                      return (
                        <div className="bg-[#1f2937] border border-gray-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-white">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            {data.topic}
                          </div>
                          <div className="text-gray-300">
                            Responses: <span className="font-semibold text-white">{data.count}</span>
                          </div>
                          <div className="text-gray-300">
                            Share: <span className="font-semibold text-[#f5a623]">{data.percentage}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-white font-mono">{totalAiResponses}</span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400">Replies</span>
            </div>
          </div>

          {/* Legend Grid */}
          <div className="w-full sm:w-1/2 flex flex-col gap-2 overflow-y-auto max-h-[250px] pr-1 scrollbar-thin">
            {data.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-[#06080d]/60 border border-[#1f2937] text-xs hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-200 font-medium truncate">{item.topic}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                  <span className="text-gray-400">{item.count} replies</span>
                  <span className="font-semibold text-white w-10 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
