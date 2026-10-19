"use client";

import { FC, ReactNode } from "react";
import {
  CheckCircle,
  ThumbsUp,
  AlertCircle,
  Target,
  XCircle,
  Layers,
  Sparkles,
} from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";

interface InsightProps {
  icon: ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

const InsightCard: FC<InsightProps> = ({
  icon,
  title,
  description,
  bgColor,
  iconColor,
  borderColor,
}) => (
  <div
    className={`${bgColor} border ${borderColor} rounded-xl p-4 flex gap-3.5 items-start shadow-sm transition-colors`}
  >
    <div className={`${iconColor} mt-0.5 shrink-0`}>{icon}</div>
    <div className="flex flex-col gap-1">
      <h4 className="font-medium text-foreground text-[13.5px]">{title}</h4>
      <p className="text-[12px] font-normal text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

interface PerformanceInsightsProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
}

export const PerformanceInsights: FC<PerformanceInsightsProps> = ({
  data: analyticsData,
  isLoading = false,
}) => {
  const totalFeedback = analyticsData?.summary.total_feedback || 0;
  const avgRating = analyticsData?.summary.average_rating || 0;
  const correctness = analyticsData?.stats.correctness || {};
  const totalAssistantResponses = analyticsData?.raw_data_count || 0;

  const correctPct = Number(correctness.correct || 0);
  const partialPct = Number(correctness.partial || 0);
  const incorrectPct = Number(correctness.incorrect || 0);
  const accuracy = (correctPct + partialPct).toFixed(1);

  const correctCount = Math.round((correctPct / 100) * totalFeedback);
  const partialCount = Math.round((partialPct / 100) * totalFeedback);
  const incorrectCount = Math.round((incorrectPct / 100) * totalFeedback);

  // Top topic activity
  const topics = analyticsData?.topics || [];
  const sortedTopics = [...topics].sort((a, b) => b.count - a.count);
  const topTopic = sortedTopics.length > 0 && sortedTopics[0].count > 0 ? sortedTopics[0] : null;

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full border border-border animate-pulse">
        <div className="w-48 h-4 rounded bg-muted/40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 w-full rounded-xl bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full border border-border">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[16px] font-medium text-foreground">
          Performance insights
        </h3>
        <p className="text-[11.5px] text-muted-foreground">
          Verified heuristic observations based on genuine evaluation data
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        {totalFeedback === 0 ? (
          <>
            <InsightCard
              icon={<Target className="h-4 w-4" />}
              title="Awaiting evaluation data"
              description="No feedback records submitted yet. Complete the mandatory evaluation after chat turns to unlock accuracy and satisfaction insights."
              bgColor="bg-muted/20"
              iconColor="text-[#f5a623]"
              borderColor="border-border/60"
            />
            {totalAssistantResponses > 0 && (
              <InsightCard
                icon={<Layers className="h-4 w-4" />}
                title="Generated responses"
                description={`${totalAssistantResponses} assistant response${
                  totalAssistantResponses === 1 ? "" : "s"
                } recorded in database awaiting evaluation.`}
                bgColor="bg-muted/20"
                iconColor="text-muted-foreground"
                borderColor="border-border/60"
              />
            )}
          </>
        ) : (
          <>
            {/* Accuracy Insight with honest sample size qualification */}
            <InsightCard
              icon={<CheckCircle className="h-4 w-4" />}
              title="Accuracy overview"
              description={
                totalFeedback < 3
                  ? `Preliminary accuracy is ${accuracy}% based on ${totalFeedback} evaluation${
                      totalFeedback === 1 ? "" : "s"
                    }. Higher sample sizes will produce more stable trends.`
                  : `Model achieved ${accuracy}% accuracy across ${totalFeedback} evaluated replies (${correctCount} correct, ${partialCount} partial).`
              }
              bgColor="bg-[#f5a623]/10"
              iconColor="text-[#f5a623]"
              borderColor="border-[#f5a623]/25"
            />

            {/* User Satisfaction */}
            <InsightCard
              icon={<ThumbsUp className="h-4 w-4" />}
              title="User satisfaction"
              description={`${correctPct.toFixed(1)}% of evaluated turns marked fully correct. Average rating is ${avgRating.toFixed(1)} / 4.`}
              bgColor="bg-muted/20"
              iconColor="text-[#f5a623]"
              borderColor="border-border/60"
            />

            {/* Areas for refinement */}
            {(partialCount > 0 || incorrectCount > 0) && (
              <InsightCard
                icon={<AlertCircle className="h-4 w-4" />}
                title="Refinement opportunities"
                description={`${partialCount + incorrectCount} response${
                  partialCount + incorrectCount === 1 ? "" : "s"
                } evaluated as partial or incorrect. Inspect recent feedback to refine domain responses.`}
                bgColor="bg-muted/20"
                iconColor="text-amber-500/90"
                borderColor="border-border/60"
              />
            )}

            {/* Topic Activity Insight */}
            {topTopic && (
              <InsightCard
                icon={<Sparkles className="h-4 w-4" />}
                title="Dominant topic focus"
                description={`Highest user evaluation volume is in ${topTopic.name || "Domain"} with ${topTopic.count} feedback record${
                  topTopic.count === 1 ? "" : "s"
                }.`}
                bgColor="bg-muted/20"
                iconColor="text-[#f5a623]"
                borderColor="border-border/60"
              />
            )}

            {/* Coverage Insight */}
            <InsightCard
              icon={<Target className="h-4 w-4" />}
              title="Evaluation coverage"
              description={`${totalFeedback} out of ${totalAssistantResponses} assistant response${
                totalAssistantResponses === 1 ? "" : "s"
              } evaluated (${
                totalAssistantResponses > 0
                  ? ((totalFeedback / totalAssistantResponses) * 100).toFixed(0)
                  : "0"
              }% coverage).`}
              bgColor="bg-muted/20"
              iconColor="text-muted-foreground"
              borderColor="border-border/60"
            />
          </>
        )}
      </div>
    </div>
  );
};
