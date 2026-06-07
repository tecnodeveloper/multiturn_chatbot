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

const data = [
  { topic: 'Mindfulness', val: 96 },
  { topic: 'Stress', val: 92 },
  { topic: 'Anxiety', val: 94 },
  { topic: 'Depression', val: 89 },
  { topic: 'Sleep', val: 87 },
  { topic: 'Relationships', val: 85 },
].sort((a, b) => b.val - a.val);

export const TopicAccuracyChart: FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full">
      <h3 className="text-lg font-bold text-gray-900">Accuracy by Topic</h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ left: 20, right: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="topic" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 500 }}
              width={100}
            />
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number) => [`${value}%`, 'Accuracy']}
            />
            <Bar dataKey="val" fill="#8b6f5c" radius={[0, 4, 4, 0]} barSize={20}>
              <LabelList 
                dataKey="val" 
                position="right" 
                formatter={(val: number) => `${val}%`}
                style={{ fill: '#4b5563', fontSize: 12, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
