"use client";

import { FC } from "react";
import { Target, MessageCircle, Star, Bot } from "lucide-react";
import { StatCard } from "./stat-card";
import { AnalyticsData } from "@/hooks/use-analytics";

interface OverviewStatsProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
  viewMode?: "this_session" | "all_sessions";
}

export const OverviewStats: FC<OverviewStatsProps> = ({
  data,
  isLoading = false,
  viewMode = "all_sessions",
}) => {
  const totalFeedback = data?.summary.total_feedback ?? 0;
  const avgRating = data?.summary.average_rating ?? 0;
  const correctness = data?.stats.correctness || {};
  const totalAssistantResponses = data?.raw_data_count ?? 0;

  const hasFeedback = totalFeedback > 0;

  // FR18 Definition: Overall correctness percentage = (Correct + Partial) / Total Feedback
  const correctPct = Number(correctness.correct || 0);
  const partialPct = Number(correctness.partial || 0);
  const rawAccuracy = correctPct + partialPct;
  const accuracyRateFormatted = hasFeedback ? `${rawAccuracy.toFixed(1)}%` : "—";

  // Approximate counts from percentages if exact counts are not exposed separately
  const correctCount = Math.round((correctPct / 100) * totalFeedback);
  const partialCount = Math.round((partialPct / 100) * totalFeedback);

  // Evaluation Coverage
  const coveragePct =
    totalAssistantResponses > 0
      ? ((totalFeedback / totalAssistantResponses) * 100).toFixed(0)
      : "0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Accuracy Rate */}
      <StatCard
        title="Accuracy rate"
        value={accuracyRateFormatted}
        subtitle={
          hasFeedback
            ? `${correctCount} correct, ${partialCount} partial (${totalFeedback} evaluated)`
            : "Awaiting feedback evaluations"
        }
        tooltip="Formula (FR18): (Correct + Partial responses) / Total evaluated responses. Calculated from genuine database feedback."
        icon={<Target className="h-6 w-6" />}
        isLoading={isLoading}
      />

      {/* 2. Total Feedback */}
      <StatCard
        title="Total feedback"
        value={totalFeedback.toLocaleString()}
        subtitle={
          viewMode === "this_session"
            ? "Evaluated in this session"
            : "Across all chat sessions"
        }
        tooltip="Count of genuine human feedback evaluations stored in the database for the active scope."
        icon={<MessageCircle className="h-6 w-6" />}
        isLoading={isLoading}
      />

      {/* 3. Average Rating (Strictly 1–4 scale) */}
      <StatCard
        title="Average rating"
        value={hasFeedback ? `${avgRating.toFixed(1)} / 4` : "—"}
        subtitle={
          hasFeedback
            ? `From ${totalFeedback} rating${totalFeedback === 1 ? "" : "s"} (1–4 scale)`
            : "1–4 point rating scale"
        }
        tooltip="Average score on the project's 4-point rating scale (1 = Poor, 2 = Fair, 3 = Good, 4 = Excellent). No division by zero."
        icon={<Star className="h-6 w-6" />}
        isLoading={isLoading}
      />

      {/* 4. Total AI Responses */}
      <StatCard
        title="Total AI responses"
        value={totalAssistantResponses.toLocaleString()}
        subtitle={
          totalAssistantResponses > 0
            ? `${coveragePct}% evaluated (${totalFeedback} / ${totalAssistantResponses})`
            : "No assistant messages in scope"
        }
        tooltip="Total assistant responses generated in the current scope compared against how many received feedback."
        icon={<Bot className="h-6 w-6" />}
        isLoading={isLoading}
      />
    </div>
  );
};
