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

const data = [
  { day: 'Mon', val: 85 },
  { day: 'Tue', val: 88 },
  { day: 'Wed', val: 82 },
  { day: 'Thu', val: 91 },
  { day: 'Fri', val: 89 },
  { day: 'Sat', val: 93 },
  { day: 'Sun', val: 95 },
];

export const AccuracyTrendChart: FC = () => {
  const [range, setRange] = useState("Week");

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">Response Accuracy Trend</h3>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {["Week", "Month", "Year"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${
                range === r
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a8c686" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a8c686" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area
              type="monotone"
              dataKey="val"
              stroke="#a8c686"
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
