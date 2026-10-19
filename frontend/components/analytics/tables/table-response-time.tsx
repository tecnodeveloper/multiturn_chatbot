"use client";

import { FC } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { ResponseTimeSummary } from "@/types/analytics-tables";

interface TableResponseTimeProps {
  data?: ResponseTimeSummary;
  isLoading?: boolean;
}

export const TableResponseTime: FC<TableResponseTimeProps> = ({
  data,
  isLoading = false,
}) => {
  const metrics = data?.metrics || [];
  const hasMeasurements = (data?.count || 0) > 0;

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-4 border border-border animate-pulse">
        <div className="w-56 h-5 rounded bg-muted/40" />
        <div className="w-80 h-3 rounded bg-muted/30" />
        <div className="space-y-2 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-11 w-full rounded-lg bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id="table-response-time"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-5 w-full border border-border overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20 shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-foreground tracking-tight">
              Table 4: Response-Time Summary
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Summarize chatbot response generation latency across minimum, maximum, mean, and median percentiles
            </p>
          </div>
        </div>

        <div className="text-[11.5px] text-muted-foreground bg-muted/30 px-3 py-1 rounded-lg border border-border/60 self-start sm:self-auto">
          {data?.population || "All measured assistant replies in scope"}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
          <colgroup>
            <col className="w-[220px]" />
            <col className="w-[140px]" />
            <col className="w-[100px]" />
            <col className="w-[140px]" />
            <col className="w-auto" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[12px] text-muted-foreground font-medium">
              <th className="py-3 px-3.5">Metric</th>
              <th className="py-3 px-3.5 font-mono">Overall Value</th>
              <th className="py-3 px-3.5">Unit</th>
              <th className="py-3 px-3.5 text-center">Measurements</th>
              <th className="py-3 px-3.5">Statistical Scope</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-[13px]">
            {metrics.map((m) => (
              <tr key={m.metric} className="hover:bg-muted/30 transition-colors">
                <td className="py-3.5 px-3.5 font-medium text-foreground">
                  {m.metric}
                </td>
                <td className="py-3.5 px-3.5 font-mono text-[14px] font-semibold text-[#f5a623]">
                  {m.formatted_value}
                </td>
                <td className="py-3.5 px-3.5 text-muted-foreground text-[12px]">
                  {m.unit}
                </td>
                <td className="py-3.5 px-3.5 text-center font-mono text-muted-foreground">
                  {m.sample_count}
                </td>
                <td className="py-3.5 px-3.5 text-[12px] text-muted-foreground/80 leading-relaxed">
                  {m.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!hasMeasurements && (
        <div className="py-4 text-center text-[12px] text-muted-foreground flex items-center justify-center gap-1.5 border-t border-border/50">
          <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
          <span>No response timing measurements recorded yet in this scope.</span>
        </div>
      )}
    </div>
  );
};
