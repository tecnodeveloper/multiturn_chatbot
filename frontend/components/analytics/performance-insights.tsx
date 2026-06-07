import { FC, ReactNode } from "react";
import { CheckCircle, ThumbsUp, AlertCircle, Target, XCircle } from "lucide-react";

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

export const PerformanceInsights: FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6 h-full">
      <h3 className="text-lg font-bold text-gray-900">Performance Insights</h3>
      <div className="flex flex-col gap-4">
        <InsightCard
          icon={<CheckCircle className="h-5 w-5" />}
          title="Excellent Accuracy!"
          description="Your chatbot achieved 91.5% accuracy this week, with Mindfulness topics performing best at 96%."
          bgColor="bg-green-50"
          iconColor="text-[#a8c686]"
          borderColor="border-green-100"
        />
        <InsightCard
          icon={<ThumbsUp className="h-5 w-5" />}
          title="User Satisfaction Trending Up"
          description="60.2% of users marked responses as helpful. Friday had the highest engagement with 165 responses."
          bgColor="bg-blue-50"
          iconColor="text-blue-500"
          borderColor="border-blue-100"
        />
        <InsightCard
          icon={<AlertCircle className="h-5 w-5" />}
          title="Improvement Opportunity"
          description="Relationships topic shows 85% accuracy. Consider refining responses in this category for better performance."
          bgColor="bg-orange-50"
          iconColor="text-[#ffb74d]"
          borderColor="border-orange-100"
        />
        <InsightCard
          icon={<Target className="h-5 w-5" />}
          title="Response Time"
          description="Average response time of 1.2s is excellent. Users appreciate the quick and accurate assistance."
          bgColor="bg-purple-50"
          iconColor="text-purple-500"
          borderColor="border-purple-100"
        />
        <InsightCard
          icon={<XCircle className="h-5 w-5" />}
          title="Negative Feedback Analysis"
          description="156 responses received 'Not Helpful' feedback. Review these cases to identify common issues and improve accuracy."
          bgColor="bg-red-50"
          iconColor="text-[#e57373]"
          borderColor="border-red-100"
        />
      </div>
    </div>
  );
};
