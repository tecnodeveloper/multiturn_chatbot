"use client";

import { FC } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AnalyticsData } from "@/hooks/use-analytics";

interface FeedbackDistributionChartProps {
  data: AnalyticsData | null;
}

export const FeedbackDistributionChart: FC<FeedbackDistributionChartProps> = ({ data: analyticsData }) => {
  const correctness = analyticsData?.stats.correctness || {};
  
  const chartData = [
    { name: 'Helpful', value: correctness.correct || 0, color: '#a8c686' },
    { name: 'Not Helpful', value: correctness.incorrect || 0, color: '#e57373' },
    { name: 'Partially Helpful', value: correctness.partial || 0, color: '#ffb74d' },
    { name: 'No Feedback', value: correctness.none || 0, color: '#e0e0e0' },
  ].filter(item => item.value > 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full">
      <h3 className="text-lg font-bold text-gray-900">User Feedback Distribution</h3>
      
      <div className="h-[250px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value}%`, 'Percentage']}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No feedback data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-auto">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{item.name}</span>
              <span className="text-sm font-bold text-gray-900">{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
