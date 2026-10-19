"use client";

import { FC, useState } from "react";
import { ThumbsUp, ThumbsDown, ExternalLink, Inbox } from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";
import { FeedbackDetailModal, FeedbackModalItem } from "./feedback-detail-modal";

interface FeedbackTableProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
}

const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    Correct: "bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25",
    Helpful: "bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25",
    Incorrect:
      "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50",
    "Not Helpful":
      "bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/50",
    Partial:
      "bg-[#f5a623]/5 text-[#d48812] dark:text-[#f5a623]/80 border border-[#f5a623]/15",
    "Partially Helpful":
      "bg-[#f5a623]/5 text-[#d48812] dark:text-[#f5a623]/80 border border-[#f5a623]/15",
    "No Feedback":
      "bg-zinc-100/60 text-zinc-500 border border-zinc-200/50 dark:bg-zinc-900 dark:text-zinc-500 dark:border-zinc-800",
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${
        styles[status] || styles["No Feedback"]
      }`}
    >
      {status}
    </span>
  );
};

const FeedbackIcon: FC<{ type: "up" | "down" | "none" }> = ({ type }) => {
  if (type === "up") return <ThumbsUp className="h-3.5 w-3.5 text-[#f5a623]" />;
  if (type === "down")
    return <ThumbsDown className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />;
  return (
    <div className="flex gap-1">
      <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground/30" />
      <ThumbsDown className="h-3.5 w-3.5 text-muted-foreground/30" />
    </div>
  );
};

export const FeedbackTable: FC<FeedbackTableProps> = ({
  data: analyticsData,
  isLoading = false,
}) => {
  const feedbackItems = analyticsData?.recent_feedback || [];
  const [selectedItem, setSelectedItem] = useState<FeedbackModalItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (item: FeedbackModalItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full border border-border animate-pulse">
        <div className="flex justify-between items-center">
          <div className="w-48 h-4 rounded bg-muted/40" />
          <div className="w-36 h-3 rounded bg-muted/40" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-6 w-full overflow-hidden border border-border">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-[16px] font-medium text-foreground">
            Recent user feedback
          </h3>
          <p className="text-[11.5px] text-muted-foreground">
            Latest genuine evaluation records in the selected scope
          </p>
        </div>
        <span className="text-[11.5px] font-normal text-muted-foreground">
          Click any row to inspect response & prompt
        </span>
      </div>

      <div className="overflow-x-auto">
        {feedbackItems.length > 0 ? (
          <table className="w-full text-left border-collapse table-fixed">
            <colgroup>
              <col className="w-[140px]" />
              <col className="w-[160px]" />
              <col className="w-auto" />
              <col className="w-[110px]" />
              <col className="w-[120px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 px-3 font-normal text-[12px] text-muted-foreground whitespace-nowrap">
                  Time
                </th>
                <th className="pb-3 px-3 font-normal text-[12px] text-muted-foreground whitespace-nowrap">
                  Topic
                </th>
                <th className="pb-3 px-3 font-normal text-[12px] text-muted-foreground">
                  Response preview
                </th>
                <th className="pb-3 px-3 font-normal text-[12px] text-muted-foreground whitespace-nowrap text-center">
                  Rating
                </th>
                <th className="pb-3 px-3 font-normal text-[12px] text-muted-foreground whitespace-nowrap text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {feedbackItems.map((item, i) => (
                <tr
                  key={item.id || i}
                  onClick={() => handleRowClick(item)}
                  className="hover:bg-[#f5a623]/5 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                >
                  <td className="py-3 px-3 text-[12px] font-normal text-muted-foreground whitespace-nowrap font-mono">
                    {item.time}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20 text-[11.5px] font-medium whitespace-nowrap">
                      {item.topic}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[12.5px] font-normal text-muted-foreground group-hover:text-foreground transition-colors">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="truncate">&ldquo;{item.preview}&rdquo;</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[#f5a623]" />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <FeedbackIcon type={item.feedback} />
                      <span className="text-[11.5px] font-medium text-foreground">
                        {item.rating}/4
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border/80 bg-muted/10">
            <Inbox className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-[13px] font-medium text-foreground">
              No feedback records yet
            </p>
            <p className="text-[12px] text-muted-foreground max-w-sm mt-1">
              Evaluations submitted after assistant responses will be displayed here chronologically with drill-down review.
            </p>
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
