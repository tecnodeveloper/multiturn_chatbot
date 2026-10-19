"use client";

import { FC } from "react";
import { Tag, AlertCircle, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { TopicAccuracyRow } from "@/types/analytics-tables";

interface TableTopicAccuracyProps {
  data: TopicAccuracyRow[];
  isLoading?: boolean;
}

export const TableTopicAccuracy: FC<TableTopicAccuracyProps> = ({
  data = [],
  isLoading = false,
}) => {
  const totalEvaluatedAll = data.reduce((sum, r) => sum + r.total_evaluated, 0);

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-4 border border-border animate-pulse">
        <div className="w-56 h-5 rounded bg-muted/40" />
        <div className="w-80 h-3 rounded bg-muted/30" />
        <div className="space-y-2 mt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-11 w-full rounded-lg bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id="table-topic-accuracy"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-5 w-full border border-border overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20 shrink-0">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-foreground tracking-tight">
              Table 1: Topic vs Accuracy
            </h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Compare accuracy rates and correctness breakdown across all 5 project domains plus Other (FR19.1)
            </p>
          </div>
        </div>

        <div className="text-[11.5px] font-mono text-muted-foreground bg-muted/30 px-3 py-1 rounded-lg border border-border/60 self-start sm:self-auto">
          Formula: (Correct + Partial) / Total &times; 100
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
          <colgroup>
            <col className="w-[200px]" />
            <col className="w-[130px]" />
            <col className="w-[110px]" />
            <col className="w-[110px]" />
            <col className="w-[110px]" />
            <col className="w-[140px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[12px] text-muted-foreground font-medium">
              <th className="py-3 px-3.5">Topic / Domain</th>
              <th className="py-3 px-3.5 text-center">Evaluated Replies</th>
              <th className="py-3 px-3.5 text-center">Correct</th>
              <th className="py-3 px-3.5 text-center">Partial</th>
              <th className="py-3 px-3.5 text-center">Incorrect</th>
              <th className="py-3 px-3.5 text-right">Accuracy (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-[13px]">
            {data.map((row) => {
              const hasEvals = row.total_evaluated > 0;
              return (
                <tr
                  key={row.topic}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3.5 px-3.5">
                    <span className="font-medium text-foreground">
                      {row.topic}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-center font-mono">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11.5px] ${
                        hasEvals
                          ? "bg-muted text-foreground font-medium"
                          : "text-muted-foreground/60"
                      }`}
                    >
                      {row.total_evaluated}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-center font-mono text-emerald-500 font-medium">
                    {row.correct}
                  </td>
                  <td className="py-3.5 px-3.5 text-center font-mono text-amber-500 font-medium">
                    {row.partial}
                  </td>
                  <td className="py-3.5 px-3.5 text-center font-mono text-zinc-400 font-medium">
                    {row.incorrect}
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-mono">
                    {hasEvals ? (
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-14 h-1.5 rounded-full bg-muted overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-[#f5a623] rounded-full"
                            style={{ width: `${Math.min(row.accuracy, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-foreground">
                          {row.accuracy.toFixed(1)}%
                        </span>
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
          {totalEvaluatedAll > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border font-semibold text-[13px] bg-muted/10">
                <td className="py-3 px-3.5 text-foreground">Overall Total</td>
                <td className="py-3 px-3.5 text-center font-mono text-foreground">
                  {totalEvaluatedAll}
                </td>
                <td className="py-3 px-3.5 text-center font-mono text-emerald-500">
                  {data.reduce((sum, r) => sum + r.correct, 0)}
                </td>
                <td className="py-3 px-3.5 text-center font-mono text-amber-500">
                  {data.reduce((sum, r) => sum + r.partial, 0)}
                </td>
                <td className="py-3 px-3.5 text-center font-mono text-zinc-400">
                  {data.reduce((sum, r) => sum + r.incorrect, 0)}
                </td>
                <td className="py-3 px-3.5 text-right font-mono text-[#f5a623]">
                  {(
                    (data.reduce((sum, r) => sum + r.correct + r.partial, 0) /
                      totalEvaluatedAll) *
                    100
                  ).toFixed(1)}
                  %
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {totalEvaluatedAll === 0 && (
        <div className="py-4 text-center text-[12px] text-muted-foreground flex items-center justify-center gap-1.5 border-t border-border/50">
          <AlertCircle className="h-4 w-4 text-muted-foreground/60" />
          <span>No feedback evaluations recorded yet across topics.</span>
        </div>
      )}
    </div>
  );
};
