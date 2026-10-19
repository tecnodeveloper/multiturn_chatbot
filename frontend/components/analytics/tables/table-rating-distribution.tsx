"use client";

import { FC } from "react";
import { Star, AlertCircle } from "lucide-react";
import { RatingDistributionRow } from "@/types/analytics-tables";

interface TableRatingDistributionProps {
  data: RatingDistributionRow[];
  isLoading?: boolean;
}

export const TableRatingDistribution: FC<TableRatingDistributionProps> = ({
  data = [],
  isLoading = false,
}) => {
  const totalRatings = data.reduce((sum, r) => sum + r.count, 0);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-4 border border-border animate-pulse">
        <div className="w-56 h-5 rounded bg-muted/40" />
        <div className="w-80 h-3 rounded bg-muted/30" />
        <div className="space-y-2 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 w-full rounded-lg bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id="table-rating-distribution"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-5 w-full border border-border overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20 shrink-0">
            <Star className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-foreground tracking-tight">
              Table 5: Rating Distribution
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Distribution of human evaluations strictly on the project&apos;s 1&ndash;4 scale
            </p>
          </div>
        </div>

        <div className="text-[11.5px] font-mono text-muted-foreground bg-muted/30 px-3 py-1 rounded-lg border border-border/60 self-start sm:self-auto">
          Scale: 1 (Poor) to 4 (Excellent)
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[650px]">
          <colgroup>
            <col className="w-[120px]" />
            <col className="w-[160px]" />
            <col className="w-[150px]" />
            <col className="w-[220px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[12px] text-muted-foreground font-medium">
              <th className="py-3 px-3.5">Score</th>
              <th className="py-3 px-3.5">Rating Label</th>
              <th className="py-3 px-3.5 text-center">Number of Ratings</th>
              <th className="py-3 px-3.5 text-right">Percentage of Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-[13px]">
            {data.map((row) => {
              const hasCount = row.count > 0;
              return (
                <tr key={row.rating} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-3.5">
                    <div className="flex items-center gap-1.5 font-mono font-semibold text-foreground">
                      <div className="flex">
                        {Array.from({ length: row.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-[#f5a623] text-[#f5a623]"
                          />
                        ))}
                      </div>
                      <span className="text-[12px] text-muted-foreground ml-1">
                        ({row.rating}/4)
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 font-medium text-foreground">
                    {row.label}
                  </td>
                  <td className="py-3.5 px-3.5 text-center font-mono">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11.5px] ${
                        hasCount
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {row.count}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono">
                    {totalRatings > 0 ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-[#f5a623] rounded-full"
                            style={{ width: `${Math.min(row.percentage, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-foreground">
                          {row.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 text-[12px] italic">
                        0.0%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {totalRatings > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border font-semibold text-[13px] bg-muted/10">
                <td colSpan={2} className="py-3 px-3.5 text-foreground">
                  Total Submitted Ratings
                </td>
                <td className="py-3 px-3.5 text-center font-mono text-[#f5a623]">
                  {totalRatings}
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-foreground">
                  100.0%
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {totalRatings === 0 && (
        <div className="py-4 text-center text-[12px] text-muted-foreground flex items-center justify-center gap-1.5 border-t border-border/50">
          <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
          <span>No numerical ratings submitted yet in this scope.</span>
        </div>
      )}
    </div>
  );
};
