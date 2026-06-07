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

const data = [
  { day: 'Mon', total: 124, helpful: 108 },
  { day: 'Tue', total: 142, helpful: 128 },
  { day: 'Wed', total: 156, helpful: 135 },
  { day: 'Thu', total: 138, helpful: 127 },
  { day: 'Fri', total: 165, helpful: 152 },
  { day: 'Sat', total: 118, helpful: 109 },
  { day: 'Sun', total: 132, helpful: 124 },
];

export const ResponseVolumeChart: FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full">
      <h3 className="text-lg font-bold text-gray-900">Response Volume & Quality</h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
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
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
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
              fill="#8b6f5c" 
              radius={[4, 4, 0, 0]} 
              barSize={32}
            />
            <Bar 
              name="Helpful Responses" 
              dataKey="helpful" 
              fill="#a8c686" 
              radius={[4, 4, 0, 0]} 
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
