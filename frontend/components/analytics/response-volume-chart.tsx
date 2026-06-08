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
import { AnalyticsData } from "@/hooks/use-analytics";
import { useTheme } from "next-themes";

interface ResponseVolumeChartProps {
  data: AnalyticsData | null;
}

export const ResponseVolumeChart: FC<ResponseVolumeChartProps> = ({ data: analyticsData }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartData = analyticsData?.trends || [];

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full border border-border">
      <h3 className="text-lg font-bold text-foreground">Response Volume & Quality</h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1f2937" : "#f0f0f0"} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9ca3af", fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: "#9ca3af", fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: isDark ? '#161821' : '#ffffff',
                color: isDark ? '#ffffff' : '#111827'
              }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            <Bar 
              name="Total Responses" 
              dataKey="total" 
              fill={isDark ? "#3b82f6" : "#8b6f5c"} 
              radius={[4, 4, 0, 0]} 
              barSize={32}
            />
            <Bar 
              name="Helpful Responses" 
              dataKey="helpful" 
              fill={isDark ? "#60a5fa" : "#a8c686"} 
              radius={[4, 4, 0, 0]} 
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
