"use client";

import { FC } from "react";
import { AlignLeft, AlertCircle, Star } from "lucide-react";
import { LengthPreferenceRow } from "@/types/analytics-tables";

interface TableLengthPreferenceProps {
  data: LengthPreferenceRow[];
  isLoading?: boolean;
}

export const TableLengthPreference: FC<TableLengthPreferenceProps> = ({
  data = [],
  isLoading = false,
}) => {
  const totalLengthCount = data.reduce((sum, r) => sum + r.count, 0);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-4 border border-border animate-pulse">
        <div className="w-56 h-5 rounded bg-muted/40" />
        <div className="w-80 h-3 rounded bg-muted/30" />
        <div className="space-y-2 mt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-11 w-full rounded-lg bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id="table-length-preference"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-5 w-full border border-border overflow-hidden scroll-mt-28"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20 shrink-0">
            <AlignLeft className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-foreground tracking-tight">
              Response-Length Preference
            </h3>

          </div>
        </div>

        <div className="text-[11.5px] font-mono text-muted-foreground bg-muted/30 px-3 py-1 rounded-lg border border-border/60 self-start sm:self-auto">
          Categories: Short &bull; To the Point &bull; Lengthy
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[650px]">
          <colgroup>
            <col className="w-[180px]" />
            <col className="w-[140px]" />
            <col className="w-[200px]" />
            <col className="w-[130px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[12px] text-muted-foreground font-medium">
              <th className="py-3 px-3.5">Response Length</th>
              <th className="py-3 px-3.5 text-center">Responses</th>
              <th className="py-3 px-3.5 text-right">Percentage</th>
              <th className="py-3 px-3.5 text-right">Average Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-[13px]">
            {data.map((row) => {
              const hasCount = row.count > 0;
              return (
                <tr key={row.length_type} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-3.5">
                    <span className="font-medium text-foreground">
                      {row.length_type}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-center font-mono">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11.5px] ${hasCount
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground/60"
                        }`}
                    >
                      {row.count}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono">
                    {totalLengthCount > 0 ? (
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
                  <td className="py-3.5 px-3.5 text-right font-mono">
                    {row.avg_rating !== null ? (
                      <div className="inline-flex items-center gap-1 font-semibold text-foreground">
                        <Star className="w-3 h-3 fill-[#f5a623] text-[#f5a623]" />
                        <span>{row.avg_rating.toFixed(1)}</span>
                        <span className="text-[10px] text-muted-foreground">/4</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 text-[12px] italic">
                        &mdash;
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {totalLengthCount > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border font-semibold text-[13px] bg-muted/10">
                <td className="py-3 px-3.5 text-foreground">Total Evaluated</td>
                <td className="py-3 px-3.5 text-center font-mono text-[#f5a623]">
                  {totalLengthCount}
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-foreground">
                  100.0%
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-muted-foreground text-[12px]">
                  &mdash;
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {totalLengthCount === 0 && (
        <div className="py-4 text-center text-[12px] text-muted-foreground flex items-center justify-center gap-1.5 border-t border-border/50">
          <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
          <span>No response-length preferences recorded yet in this scope.</span>
        </div>
      )}
    </div>
  );
};
