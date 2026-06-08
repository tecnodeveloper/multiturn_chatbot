import { FC, ReactNode } from "react";
import { CheckCircle, ThumbsUp, AlertCircle, Target, XCircle } from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";

interface InsightProps {
  icon: ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
  borderColor: string;
}

const InsightCard: FC<InsightProps> = ({ icon, title, description, bgColor, iconColor, borderColor }) => (
  <div className={`${bgColor} border ${borderColor} rounded-xl p-4 flex gap-4 items-start shadow-sm`}>
    <div className={`${iconColor} mt-0.5`}>
      {icon}
    </div>
    <div className="flex flex-col gap-1">
      <h4 className="font-bold text-gray-900 text-sm">{title}</h4>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  </div>
);

interface PerformanceInsightsProps {
  data: AnalyticsData | null;
}

export const PerformanceInsights: FC<PerformanceInsightsProps> = ({ data: analyticsData }) => {
  const totalFeedback = analyticsData?.summary.total_feedback || 0;
  const avgRating = analyticsData?.summary.average_rating || 0;
  const correctness = analyticsData?.stats.correctness || {};
  const accuracy = ((correctness.correct || 0) + (correctness.partial || 0)).toFixed(1);
  const helpfulPct = (correctness.correct || 0).toFixed(1);
  const negativeCount = analyticsData?.stats.ratings["1"] || 0 + (analyticsData?.stats.ratings["2"] || 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full">
      <h3 className="text-lg font-bold text-gray-900">Performance Insights</h3>
      <div className="flex flex-col gap-4">
        <InsightCard
          icon={<CheckCircle className="h-5 w-5" />}
          title="Accuracy Overview"
          description={`Your chatbot achieved ${accuracy}% accuracy overall. Consistently high quality responses across analyzed sessions.`}
          bgColor="bg-green-50"
          iconColor="text-[#a8c686]"
          borderColor="border-green-100"
        />
        <InsightCard
          icon={<ThumbsUp className="h-5 w-5" />}
          title="User Satisfaction"
          description={`${helpfulPct}% of users explicitly marked responses as helpful. Average rating is ${avgRating}/5 stars.`}
          bgColor="bg-blue-50"
          iconColor="text-blue-500"
          borderColor="border-blue-100"
        />
        {parseFloat(accuracy) < 90 && (
          <InsightCard
            icon={<AlertCircle className="h-5 w-5" />}
            title="Improvement Opportunity"
            description="Accuracy is below 90%. Review 'Partially Helpful' feedback to identify areas for refinement."
            bgColor="bg-orange-50"
            iconColor="text-[#ffb74d]"
            borderColor="border-orange-100"
          />
        )}
        <InsightCard
          icon={<Target className="h-5 w-5" />}
          title="Data Coverage"
          description={`${totalFeedback} total feedback points analyzed. Larger sample sizes will provide more robust topic clustering.`}
          bgColor="bg-purple-50"
          iconColor="text-purple-500"
          borderColor="border-purple-100"
        />
        {negativeCount > 0 && (
          <InsightCard
            icon={<XCircle className="h-5 w-5" />}
            title="Negative Feedback"
            description={`${negativeCount} responses received low ratings. Analyze these specific cases to improve model performance.`}
            bgColor="bg-red-50"
            iconColor="text-[#e57373]"
            borderColor="border-red-100"
          />
        )}
      </div>
    </div>
  );
};
