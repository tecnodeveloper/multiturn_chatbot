import { FC } from "react";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";

interface FeedbackTableProps {
  data: AnalyticsData | null;
}

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    'Helpful': 'bg-[#a8c686]/20 text-[#a8c686]',
    'Not Helpful': 'bg-[#e57373]/20 text-[#e57373]',
    'Partially Helpful': 'bg-[#ffb74d]/20 text-[#ffb74d]',
    'No Feedback': 'bg-gray-100 text-gray-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles['No Feedback']}`}>
      {status}
    </span>
  );
};

const FeedbackIcon: FC<{ type: "up" | "down" | "none" }> = ({ type }) => {
  if (type === 'up') return <ThumbsUp className="h-4 w-4 text-[#a8c686]" />;
  if (type === 'down') return <ThumbsDown className="h-4 w-4 text-[#e57373]" />;
  return (
    <div className="flex gap-1">
      <ThumbsUp className="h-4 w-4 text-gray-300" />
      <ThumbsDown className="h-4 w-4 text-gray-300" />
    </div>
  );
};

export const FeedbackTable: FC<FeedbackTableProps> = ({ data: analyticsData }) => {
  const feedbackItems = analyticsData?.recent_feedback || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full overflow-hidden">
      <h3 className="text-lg font-bold text-gray-900">Recent User Feedback</h3>
      
      <div className="overflow-x-auto">
        {feedbackItems.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-4 font-semibold text-sm text-gray-500">Date/Time</th>
                <th className="pb-4 font-semibold text-sm text-gray-500">Question Topic</th>
                <th className="pb-4 font-semibold text-sm text-gray-500">Response Preview</th>
                <th className="pb-4 font-semibold text-sm text-gray-500">User Feedback</th>
                <th className="pb-4 font-semibold text-sm text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {feedbackItems.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 text-sm text-gray-600 whitespace-nowrap">{item.time}</td>
                  <td className="py-4 text-sm font-medium text-gray-900">{item.topic}</td>
                  <td className="py-4 text-sm text-gray-500 italic">"{item.preview}"</td>
                  <td className="py-4">
                    <FeedbackIcon type={item.feedback} />
                  </td>
                  <td className="py-4">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-8 text-center text-gray-400">
            No recent feedback to display
          </div>
        )}
      </div>
    </div>
  );
};
