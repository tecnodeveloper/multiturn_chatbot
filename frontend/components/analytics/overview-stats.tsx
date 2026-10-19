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

  // Strict accuracy = Correct responses / Evaluated responses × 100
  const correctPct = Number(correctness.correct || 0);
  const partialPct = Number(correctness.partial || 0);
  const strictAccuracyFormatted = hasFeedback ? `${correctPct.toFixed(1)}%` : "N/A";

  // Approximate counts from percentages
  const correctCount = Math.round((correctPct / 100) * totalFeedback);
  const partialCount = Math.round((partialPct / 100) * totalFeedback);

  // Evaluation Coverage
  const coveragePct =
    totalAssistantResponses > 0
      ? ((totalFeedback / totalAssistantResponses) * 100).toFixed(0)
      : "0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Accuracy Rate (Strict: Correct / Evaluated * 100) */}
      <StatCard
        title="Accuracy rate"
        value={strictAccuracyFormatted}
        subtitle={
          hasFeedback
            ? `${correctCount} strictly correct (${totalFeedback} evaluated)`
            : "N/A (Awaiting evaluations)"
        }
        tooltip="Strict accuracy formula: Correct responses / Evaluated responses × 100. Unevaluated responses are excluded."
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
        value={hasFeedback && avgRating > 0 ? `${avgRating.toFixed(1)} / 4` : "N/A"}
        subtitle={
          hasFeedback
            ? `From ${totalFeedback} rating${totalFeedback === 1 ? "" : "s"} (1–4 scale)`
            : "N/A (No ratings submitted)"
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
