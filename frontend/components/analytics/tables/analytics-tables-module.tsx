"use client";

import { FC } from "react";
import {
  Tag,
  MessageSquare,
  Layers,
  Clock,
  Star,
  AlignLeft,
  Target,
  Sparkles,
} from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";
import { TableTopicAccuracy } from "./table-topic-accuracy";
import { TableReplyCorrectness } from "./table-reply-correctness";
import { TablePhaseAccuracy } from "./table-phase-accuracy";
import { TableResponseTime } from "./table-response-time";
import { TableRatingDistribution } from "./table-rating-distribution";
import { TableLengthPreference } from "./table-length-preference";

interface AnalyticsTablesModuleProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
  onBackToOverview?: () => void;
}

export const AnalyticsTablesModule: FC<AnalyticsTablesModuleProps> = ({
  data,
  isLoading = false,
  onBackToOverview,
}) => {
  const tables = data?.tables;

  const totalFeedback = data?.summary.total_feedback || 0;
  const avgRating = data?.summary.average_rating || 0;
  const correctness = data?.stats.correctness || {};
  const accuracyPct =
    totalFeedback > 0
      ? (Number(correctness.correct || 0) + Number(correctness.partial || 0)).toFixed(1)
      : "—";
  const medianLatency =
    tables?.response_time_summary?.median !== null && tables?.response_time_summary?.median !== undefined
      ? `${tables.response_time_summary.median}s`
      : "—";

  const scrollToTable = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-50 duration-200">
      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-1 shadow-sm">
          <span className="text-[11.5px] text-muted-foreground">Evaluated Replies</span>
          <span className="text-[22px] font-semibold text-foreground font-mono">
            {totalFeedback}
          </span>
          <span className="text-[11px] text-muted-foreground/75">Human evaluations</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-1 shadow-sm">
          <span className="text-[11.5px] text-muted-foreground">Overall Accuracy</span>
          <span className="text-[22px] font-semibold text-[#f5a623] font-mono">
            {accuracyPct}{accuracyPct !== "—" ? "%" : ""}
          </span>
          <span className="text-[11px] text-muted-foreground/75">Correct + Partial</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-1 shadow-sm">
          <span className="text-[11.5px] text-muted-foreground">Average Rating</span>
          <span className="text-[22px] font-semibold text-foreground font-mono">
            {totalFeedback > 0 ? `${avgRating.toFixed(1)} / 4` : "—"}
          </span>
          <span className="text-[11px] text-muted-foreground/75">1–4 Point Scale</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-1 shadow-sm">
          <span className="text-[11.5px] text-muted-foreground">Median Latency</span>
          <span className="text-[22px] font-semibold text-foreground font-mono">
            {medianLatency}
          </span>
          <span className="text-[11px] text-muted-foreground/75">Generation speed</span>
        </div>
      </div>

      {/* Quick Jump-to Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-[12px] text-muted-foreground font-medium shrink-0 flex items-center gap-1.5 mr-1">
          <Sparkles className="h-3.5 w-3.5 text-[#f5a623]" />
          Jump to Table:
        </span>
        <button
          onClick={() => scrollToTable("table-topic-accuracy")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          1. Topic vs Accuracy
        </button>
        <button
          onClick={() => scrollToTable("table-reply-correctness")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          2. Reply Correctness
        </button>
        <button
          onClick={() => scrollToTable("table-phase-accuracy")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          3. Phase Accuracy
        </button>
        <button
          onClick={() => scrollToTable("table-response-time")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          4. Response Time
        </button>
        <button
          onClick={() => scrollToTable("table-rating-distribution")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          5. Rating Distribution
        </button>
        <button
          onClick={() => scrollToTable("table-length-preference")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          6. Length Preference
        </button>
      </div>

      {/* Six Analytical Tables */}
      <div className="flex flex-col gap-8">
        {/* Table 1: Topic vs Accuracy */}
        <TableTopicAccuracy
          data={tables?.topic_accuracy || []}
          isLoading={isLoading}
        />

        {/* Table 2: Reply Correctness */}
        <TableReplyCorrectness
          data={tables?.reply_correctness || []}
          isLoading={isLoading}
        />

        {/* Table 3: Phase-Wise Accuracy */}
        <TablePhaseAccuracy
          data={tables?.phase_accuracy || []}
          isLoading={isLoading}
        />

        {/* Tables 4 & 5 in Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Table 4: Response-Time Summary */}
          <TableResponseTime
            data={tables?.response_time_summary}
            isLoading={isLoading}
          />

          {/* Table 5: Rating Distribution */}
          <TableRatingDistribution
            data={tables?.rating_distribution || []}
            isLoading={isLoading}
          />
        </div>

        {/* Table 6: Response-Length Preference */}
        <TableLengthPreference
          data={tables?.length_preference || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
