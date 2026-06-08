import { FC } from "react";
import { Target, MessageCircle, ThumbsUp, Award } from "lucide-react";
import { StatCard } from "./stat-card";
import { AnalyticsData } from "@/hooks/use-analytics";

interface OverviewStatsProps {
  data: AnalyticsData | null;
}

export const OverviewStats: FC<OverviewStatsProps> = ({ data }) => {
  const totalFeedback = data?.summary.total_feedback || 0;
  const avgRating = data?.summary.average_rating || 0;
  
  // Calculate accuracy from correctness stats (correct + partial)
  const correctness = data?.stats.correctness || {};
  const accuracyRate = ((correctness.correct || 0) + (correctness.partial || 0)).toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Accuracy Rate"
        value={`${accuracyRate}%`}
        subtitle="Correct + Partial"
        icon={<Target className="h-6 w-6" />}
        iconBgColor="bg-[#a8c686]/10 text-[#a8c686]"
      />
      <StatCard
        title="Total Feedback"
        value={totalFeedback.toLocaleString()}
        subtitle="Across all chats"
        icon={<MessageCircle className="h-6 w-6" />}
        iconBgColor="bg-blue-50 text-blue-500"
      />
      <StatCard
        title="Average Rating"
        value={avgRating.toFixed(1)}
        subtitle="Out of 5 stars"
        icon={<ThumbsUp className="h-6 w-6" />}
        iconBgColor="bg-[#a8c686]/10 text-[#a8c686]"
      />
      <StatCard
        title="Responses Found"
        value={data?.raw_data_count?.toString() || "0"}
        subtitle="Analyzed data points"
        icon={<Award className="h-6 w-6" />}
        iconBgColor="bg-purple-50 text-purple-500"
      />
    </div>
  );
};
