"use client";

import { FC, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AnalyticsData } from "@/hooks/use-analytics";
import { useTheme } from "next-themes";

interface AccuracyTrendChartProps {
  data: AnalyticsData | null;
}

export const AccuracyTrendChart: FC<AccuracyTrendChartProps> = ({ data: analyticsData }) => {
  const [range, setRange] = useState("Week");
  const { theme } = useTheme();
  
  const chartData = analyticsData?.trends.map(t => ({
    day: t.day,
    val: t.accuracy
  })) || [];

  const isDark = theme === "dark";

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full border border-border">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-foreground">Response Accuracy Trend</h3>
        <div className="flex bg-muted p-1 rounded-lg">
          {["Week", "Month", "Year"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? "#3b82f6" : "#a8c686"} stopOpacity={0.3} />
                <stop offset="95%" stopColor={isDark ? "#3b82f6" : "#a8c686"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1f2937" : "#f0f0f0"} />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: isDark ? "#9ca3af" : "#9ca3af", fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: isDark ? "#9ca3af" : "#9ca3af", fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
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
            <Area
              type="monotone"
              dataKey="val"
              stroke={isDark ? "#3b82f6" : "#a8c686"}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorAccuracy)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
