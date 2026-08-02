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
import { AnalyticsData } from "@/hooks/use-analytics";
import { useTheme } from "next-themes";

interface TopicAccuracyChartProps {
  data: AnalyticsData | null;
}

export const TopicAccuracyChart: FC<TopicAccuracyChartProps> = ({ data: analyticsData }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const chartData = analyticsData?.topics.map(t => ({
    topic: t.keywords.join(", "),
    val: t.count
  })) || [];

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full border border-border">
      <h3 className="text-lg font-bold text-foreground">Feedback Volume by Topic (Clustered)</h3>
      
      <div className="h-[300px] w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ left: 20, right: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? "#1f2937" : "#f0f0f0"} />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="topic" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 10, fontWeight: 500 }}
                width={120}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  backgroundColor: isDark ? '#161821' : '#ffffff',
                  color: isDark ? '#ffffff' : '#111827'
                }}
                formatter={(value: any) => [value ?? 0, 'Feedback Count']}
              />
              <Bar dataKey="val" fill={isDark ? "#3b82f6" : "#8b6f5c"} radius={[0, 4, 4, 0]} barSize={20}>
                <LabelList 
                  dataKey="val" 
                  position="right" 
                  style={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 12, fontWeight: 600 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground italic">
            Insufficient data for topic clustering
          </div>
        )}
      </div>
    </div>
  );
};
