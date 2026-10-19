"use client";

import React, { FC } from "react";
import {
  Tag,
  Bot,
  CheckCircle2,
  Target,
  ThumbsUp,
  Percent,
} from "lucide-react";
import type { TopicsOverviewKPIs } from "@/types/analytics-topics";

interface TopicsOverviewCardsProps {
  kpis?: TopicsOverviewKPIs | null;
  isLoading?: boolean;
}

export const TopicsOverviewCards: FC<TopicsOverviewCardsProps> = ({
  kpis,
  isLoading = false,
}) => {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[#161821] rounded-2xl border border-[#1f2937] p-4 h-[116px] flex flex-col justify-between"
          >
            <div className="h-3.5 w-24 bg-gray-700/40 rounded" />
            <div className="h-6 w-16 bg-gray-700/60 rounded" />
            <div className="h-3 w-20 bg-gray-700/30 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const strictAccFormatted =
    kpis.overall_strict_accuracy !== null
      ? `${kpis.overall_strict_accuracy}%`
      : "—";

  const helpfulnessFormatted =
    kpis.overall_helpfulness !== null
      ? `${kpis.overall_helpfulness}%`
      : "—";

  const coverageFormatted = `${kpis.overall_feedback_coverage}%`;

  const cards = [
    {
      label: "Topics Identified",
      value: kpis.topics_identified.toString(),
      subtext: "Domains with activity",
      icon: Tag,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Total AI Responses",
      value: kpis.total_ai_responses.toString(),
      subtext: "Assistant messages",
      icon: Bot,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Evaluated Responses",
      value: kpis.total_evaluated_responses.toString(),
      subtext: "Submitted feedback",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Strict Accuracy",
      value: strictAccFormatted,
      subtext: "Correct / Evaluated",
      icon: Target,
      color: "text-[#f5a623]",
      bg: "bg-[#f5a623]/10",
      border: "border-[#f5a623]/20",
    },
    {
      label: "Helpfulness Rate",
      value: helpfulnessFormatted,
      subtext: "Correct + Partial",
      icon: ThumbsUp,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
    },
    {
      label: "Feedback Coverage",
      value: coverageFormatted,
      subtext: "Evaluated / Total AI",
      icon: Percent,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className="bg-[#161821] rounded-2xl border border-[#1f2937] p-4 flex flex-col justify-between hover:border-[#f5a623]/40 transition-colors shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400 truncate">
                {card.label}
              </span>
              <div className={`p-1.5 rounded-lg ${card.bg} ${card.border} border`}>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-2">
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
                {card.value}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
