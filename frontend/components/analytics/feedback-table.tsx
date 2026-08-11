"use client";

import { FC, useState } from "react";
import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";
import { FeedbackDetailModal, FeedbackModalItem } from "./feedback-detail-modal";

interface FeedbackTableProps {
  data: AnalyticsData | null;
}

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    'Correct': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    'Helpful': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    'Incorrect': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    'Not Helpful': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    'Partial': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    'Partially Helpful': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    'No Feedback': 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || styles['No Feedback']}`}>
      {status}
    </span>
  );
};

const FeedbackIcon: FC<{ type: "up" | "down" | "none" }> = ({ type }) => {
  if (type === 'up') return <ThumbsUp className="h-4 w-4 text-emerald-500" />;
  if (type === 'down') return <ThumbsDown className="h-4 w-4 text-rose-500" />;
  return (
    <div className="flex gap-1">
      <ThumbsUp className="h-4 w-4 text-muted-foreground/30" />
      <ThumbsDown className="h-4 w-4 text-muted-foreground/30" />
    </div>
  );
};

export const FeedbackTable: FC<FeedbackTableProps> = ({ data: analyticsData }) => {
  const feedbackItems = analyticsData?.recent_feedback || [];
  const [selectedItem, setSelectedItem] = useState<FeedbackModalItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (item: FeedbackModalItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full overflow-hidden border border-border">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Recent User Feedback</h3>
        <span className="text-xs text-muted-foreground">Click any row to view model response</span>
      </div>
      
      <div className="overflow-x-auto">
        {feedbackItems.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-4 pr-6 font-semibold text-sm text-muted-foreground whitespace-nowrap min-w-[150px]">Date/Time</th>
                <th className="pb-4 pr-6 font-semibold text-sm text-muted-foreground whitespace-nowrap min-w-[160px]">Question Topic</th>
                <th className="pb-4 pr-6 font-semibold text-sm text-muted-foreground">Response Preview</th>
                <th className="pb-4 pr-6 font-semibold text-sm text-muted-foreground whitespace-nowrap text-center min-w-[120px]">User Feedback</th>
                <th className="pb-4 font-semibold text-sm text-muted-foreground whitespace-nowrap text-right min-w-[120px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {feedbackItems.map((item, i) => (
                <tr
                  key={i}
                  onClick={() => handleRowClick(item)}
                  className="hover:bg-blue-50/50 dark:hover:bg-zinc-800/60 transition-colors group cursor-pointer"
                >
                  <td className="py-4 pr-6 text-sm text-muted-foreground whitespace-nowrap font-mono">{item.time}</td>
                  <td className="py-4 pr-6 text-sm font-medium text-foreground whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold whitespace-nowrap border border-blue-200/50 dark:border-blue-800/50">
                      {item.topic}
                    </span>
                  </td>
                  <td className="py-4 pr-6 text-sm text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate max-w-xs md:max-w-sm lg:max-w-md">"{item.preview}"</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-blue-500" />
                    </div>
                  </td>
                  <td className="py-4 pr-6 text-center">
                    <div className="flex justify-center">
                      <FeedbackIcon type={item.feedback} />
                    </div>
                  </td>
                  <td className="py-4 text-right whitespace-nowrap">
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

      <FeedbackDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
};

