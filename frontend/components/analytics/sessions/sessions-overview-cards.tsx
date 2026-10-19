"use client";

import { FC } from "react";
import {
  MessagesSquare,
  Bot,
  CheckCircle2,
  Target,
  Clock,
  Hourglass,
  Layers,
} from "lucide-react";
import { SessionsOverviewKPIs } from "@/types/analytics-sessions";

interface SessionsOverviewCardsProps {
  kpis?: SessionsOverviewKPIs | null;
  isLoading?: boolean;
}

export const SessionsOverviewCards: FC<SessionsOverviewCardsProps> = ({
  kpis,
  isLoading = false,
}) => {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card rounded-2xl border border-border p-4 h-[116px] flex flex-col justify-between"
          >
            <div className="h-3.5 w-24 bg-muted/40 rounded" />
            <div className="h-6 w-16 bg-muted/60 rounded" />
            <div className="h-3 w-20 bg-muted/30 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const accuracyFormatted =
    kpis.average_session_accuracy !== null
      ? `${kpis.average_session_accuracy}%`
      : "—";

  const latencyFormatted =
    kpis.average_response_time !== null
      ? `${kpis.average_response_time.toFixed(2)}s`
      : "—";

  const cards = [
    {
      label: "Total Sessions",
      value: kpis.total_sessions.toString(),
      subtext: "Chat conversations",
      icon: MessagesSquare,
      color: "#3b82f6",
    },
    {
      label: "Assistant Responses",
      value: kpis.total_assistant_responses.toString(),
      subtext: "Generated turns",
      icon: Bot,
      color: "#8b5cf6",
    },
    {
      label: "Evaluated Responses",
      value: kpis.total_evaluated_responses.toString(),
      subtext: "Human reviews",
      icon: CheckCircle2,
      color: "#10b981",
    },
    {
      label: "Average Accuracy",
      value: accuracyFormatted,
      subtext: "Weighted (Correct + Partial)",
      icon: Target,
      color: "#f5a623",
      highlight: true,
    },
    {
      label: "Average Latency",
      value: latencyFormatted,
      subtext: "Response generation speed",
      icon: Clock,
      color: "#06b6d4",
    },
    {
      label: "Average Duration",
      value: kpis.average_session_duration_formatted || "< 1m",
      subtext: "Elapsed per session",
      icon: Hourglass,
      color: "#ec4899",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`bg-card rounded-2xl border p-4 flex flex-col justify-between shadow-sm transition-all duration-200 hover:border-[#f5a623]/30 ${
              card.highlight ? "border-[#f5a623]/30 bg-[#f5a623]/[0.02]" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-medium text-muted-foreground truncate">
                {card.label}
              </span>
              <div
                className="p-1 rounded-lg shrink-0"
                style={{
                  backgroundColor: `${card.color}15`,
                  color: card.color,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="my-1.5">
              <span
                className={`text-[20px] font-bold font-mono tracking-tight ${
                  card.highlight ? "text-[#f5a623]" : "text-foreground"
                }`}
              >
                {card.value}
              </span>
            </div>

            <span className="text-[10.5px] text-muted-foreground/75 truncate">
              {card.subtext}
            </span>
          </div>
        );
      })}
    </div>
  );
};
