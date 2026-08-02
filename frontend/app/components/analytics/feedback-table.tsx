import { FC } from "react";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";

interface FeedbackTableProps {
  data: AnalyticsData | null;
}

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    'Helpful': 'bg-secondary/20 text-secondary',
    'Not Helpful': 'bg-destructive/20 text-destructive',
    'Partially Helpful': 'bg-amber-500/20 text-amber-500',
    'No Feedback': 'bg-muted text-muted-foreground',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles['No Feedback']}`}>
      {status}
    </span>
  );
};

const FeedbackIcon: FC<{ type: "up" | "down" | "none" }> = ({ type }) => {
  if (type === 'up') return <ThumbsUp className="h-4 w-4 text-secondary" />;
  if (type === 'down') return <ThumbsDown className="h-4 w-4 text-destructive" />;
  return (
    <div className="flex gap-1">
      <ThumbsUp className="h-4 w-4 text-muted-foreground/30" />
      <ThumbsDown className="h-4 w-4 text-muted-foreground/30" />
    </div>
  );
};

export const FeedbackTable: FC<FeedbackTableProps> = ({ data: analyticsData }) => {
  const feedbackItems = analyticsData?.recent_feedback || [];

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full overflow-hidden border border-border">
      <h3 className="text-lg font-bold text-foreground">Recent User Feedback</h3>
      
      <div className="overflow-x-auto">
        {feedbackItems.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-4 font-semibold text-sm text-muted-foreground">Date/Time</th>
                <th className="pb-4 font-semibold text-sm text-muted-foreground">Question Topic</th>
                <th className="pb-4 font-semibold text-sm text-muted-foreground">Response Preview</th>
                <th className="pb-4 font-semibold text-sm text-muted-foreground">User Feedback</th>
                <th className="pb-4 font-semibold text-sm text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {feedbackItems.map((item, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors group">
                  <td className="py-4 text-sm text-muted-foreground whitespace-nowrap">{item.time}</td>
                  <td className="py-4 text-sm font-medium text-foreground">{item.topic}</td>
                  <td className="py-4 text-sm text-muted-foreground italic">"{item.preview}"</td>
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
          <div className="py-8 text-center text-muted-foreground italic">
            No recent feedback to display
          </div>
        )}
      </div>
    </div>
  );
};
