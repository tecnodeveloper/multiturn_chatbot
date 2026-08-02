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
    <div className={`${iconColor} mt-0.5 shrink-0`}>
      {icon}
    </div>
    <div className="flex flex-col gap-1">
      <h4 className="font-bold text-foreground text-sm">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
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
  const negativeCount = Number(analyticsData?.stats.ratings["1"] || 0) + Number(analyticsData?.stats.ratings["2"] || 0);

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full border border-border">
      <h3 className="text-lg font-bold text-foreground">Performance Insights</h3>
      <div className="flex flex-col gap-4">
        <InsightCard
          icon={<CheckCircle className="h-5 w-5" />}
          title="Accuracy Overview"
          description={`Your chatbot achieved ${accuracy}% accuracy overall. Consistently high quality responses across analyzed sessions.`}
          bgColor="bg-green-500/10"
          iconColor="text-green-500"
          borderColor="border-green-500/20"
        />
        <InsightCard
          icon={<ThumbsUp className="h-5 w-5" />}
          title="User Satisfaction"
          description={`${helpfulPct}% of users explicitly marked responses as helpful. Average rating is ${avgRating}/5 stars.`}
          bgColor="bg-blue-500/10"
          iconColor="text-blue-500"
          borderColor="border-blue-500/20"
        />
        {parseFloat(accuracy) < 90 && (
          <InsightCard
            icon={<AlertCircle className="h-5 w-5" />}
            title="Improvement Opportunity"
            description="Accuracy is below 90%. Review 'Partially Helpful' feedback to identify areas for refinement."
            bgColor="bg-amber-500/10"
            iconColor="text-amber-500"
            borderColor="border-amber-500/20"
          />
        )}
        <InsightCard
          icon={<Target className="h-5 w-5" />}
          title="Data Coverage"
          description={`${totalFeedback} total feedback points analyzed. Larger sample sizes will provide more robust topic clustering.`}
          bgColor="bg-purple-500/10"
          iconColor="text-purple-500"
          borderColor="border-purple-500/20"
        />
        {negativeCount > 0 && (
          <InsightCard
            icon={<XCircle className="h-5 w-5" />}
            title="Negative Feedback"
            description={`${negativeCount} responses received low ratings. Analyze these specific cases to improve model performance.`}
            bgColor="bg-destructive/10"
            iconColor="text-destructive"
            borderColor="border-destructive/20"
          />
        )}
      </div>
    </div>
  );
};
