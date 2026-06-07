import { FC } from "react";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

interface FeedbackItem {
  time: string;
  topic: string;
  preview: string;
  feedback: 'up' | 'down' | 'both' | 'none';
  status: 'Helpful' | 'Not Helpful' | 'Partially Helpful' | 'No Feedback';
}

const data: FeedbackItem[] = [
  { time: 'Today 2:45 PM', topic: 'Anxiety', preview: 'Deep breathing exercises...', feedback: 'up', status: 'Helpful' },
  { time: 'Today 1:30 PM', topic: 'Sleep', preview: 'Establishing bedtime routine...', feedback: 'up', status: 'Helpful' },
  { time: 'Today 12:15 PM', topic: 'Relationships', preview: 'Communication is key...', feedback: 'none', status: 'No Feedback' },
  { time: 'Today 11:20 AM', topic: 'Depression', preview: 'Professional help recommended...', feedback: 'down', status: 'Not Helpful' },
  { time: 'Today 10:05 AM', topic: 'Mindfulness', preview: '5-minute meditation...', feedback: 'up', status: 'Helpful' },
  { time: 'Today 9:30 AM', topic: 'Stress', preview: 'Progressive muscle relaxation...', feedback: 'up', status: 'Partially Helpful' },
];

const StatusBadge: FC<{ status: FeedbackItem['status'] }> = ({ status }) => {
  const styles = {
    'Helpful': 'bg-[#a8c686]/20 text-[#a8c686]',
    'Not Helpful': 'bg-[#e57373]/20 text-[#e57373]',
    'Partially Helpful': 'bg-[#ffb74d]/20 text-[#ffb74d]',
    'No Feedback': 'bg-gray-100 text-gray-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
};

const FeedbackIcon: FC<{ type: FeedbackItem['feedback'] }> = ({ type }) => {
  if (type === 'up') return <ThumbsUp className="h-4 w-4 text-[#a8c686]" />;
  if (type === 'down') return <ThumbsDown className="h-4 w-4 text-[#e57373]" />;
  return (
    <div className="flex gap-1">
      <ThumbsUp className="h-4 w-4 text-gray-300" />
      <ThumbsDown className="h-4 w-4 text-gray-300" />
    </div>
  );
};

export const FeedbackTable: FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full overflow-hidden">
      <h3 className="text-lg font-bold text-gray-900">Recent User Feedback</h3>
      
      <div className="overflow-x-auto">
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
            {data.map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors group">
                <td className="py-4 text-sm text-gray-600">{item.time}</td>
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
      </div>
    </div>
  );
};
