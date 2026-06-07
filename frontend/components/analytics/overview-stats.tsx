import { FC } from "react";
import { Target, MessageCircle, ThumbsUp, Award } from "lucide-react";
import { StatCard } from "./stat-card";

export const OverviewStats: FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Accuracy Rate"
        value="91.5%"
        trend={{ value: "+4.2% this week", isUp: true }}
        icon={<Target className="h-6 w-6" />}
        iconBgColor="bg-[#a8c686]/10 text-[#a8c686]"
      />
      <StatCard
        title="Total Responses"
        value="1,300"
        subtitle="Last 7 days"
        icon={<MessageCircle className="h-6 w-6" />}
        iconBgColor="bg-blue-50 text-blue-500"
      />
      <StatCard
        title="Positive Feedback"
        value="782"
        subtitle="60.2% helpful rate"
        icon={<ThumbsUp className="h-6 w-6" />}
        iconBgColor="bg-[#a8c686]/10 text-[#a8c686]"
      />
      <StatCard
        title="Avg Response Time"
        value="1.2s"
        subtitle="Per response"
        icon={<Award className="h-6 w-6" />}
        iconBgColor="bg-purple-50 text-purple-500"
      />
    </div>
  );
};
