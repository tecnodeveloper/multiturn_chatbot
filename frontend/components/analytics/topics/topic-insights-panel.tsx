"use client";

import React, { FC } from "react";
import { Lightbulb, AlertTriangle, CheckCircle, Info, Sparkles } from "lucide-react";
import type { TopicInsight } from "@/types/analytics-topics";

interface TopicInsightsPanelProps {
  insights: TopicInsight[];
}

export const TopicInsightsPanel: FC<TopicInsightsPanelProps> = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-[#161821] border border-[#1f2937] rounded-xl p-6 text-center text-gray-400">
        <Sparkles className="w-8 h-8 text-[#f5a623] mx-auto mb-2 opacity-60" />
        <p className="text-sm">
          No topic-level insights available yet. Engage in conversations across different domains and submit feedback evaluations to generate domain performance insights.
        </p>
      </div>
    );
  }

  const getInsightIcon = (type: TopicInsight["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />;
      default:
        return <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />;
    }
  };

  const getBorderColor = (type: TopicInsight["type"]) => {
    switch (type) {
      case "success":
        return "border-emerald-500/20 bg-emerald-950/10";
      case "warning":
        return "border-amber-500/20 bg-amber-950/10";
      default:
        return "border-blue-500/20 bg-blue-950/10";
    }
  };

  return (
    <div className="bg-[#161821] border border-[#1f2937] rounded-xl p-5 mb-8">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1f2937]">
        <Lightbulb className="w-5 h-5 text-[#f5a623]" />
        <h3 className="text-base font-semibold text-white">Topic Performance Insights</h3>
        <span className="text-xs text-gray-400 ml-auto">
          Dynamically calculated from user domain activity
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-lg border ${getBorderColor(insight.type)} flex items-start gap-3`}
          >
            {getInsightIcon(insight.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-semibold text-white tracking-wide uppercase">
                  {insight.title}
                </h4>
                {insight.metric_value && (
                  <span className="text-xs font-mono font-medium text-[#f5a623] bg-[#f5a623]/10 px-1.5 py-0.5 rounded border border-[#f5a623]/20">
                    {insight.metric_value}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{insight.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
