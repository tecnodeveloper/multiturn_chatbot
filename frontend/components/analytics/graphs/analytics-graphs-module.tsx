"use client";

import { FC } from "react";
import {
  LineChart as LineChartIcon,
  PieChart,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  Star,
  AlignLeft,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { AnalyticsData } from "@/hooks/use-analytics";
import { ChartTopicDistribution } from "./chart-topic-distribution";
import { ChartAccuracyByTopic } from "./chart-accuracy-by-topic";
import { ChartPhaseAccuracy } from "./chart-phase-accuracy";
import { ChartReplyCorrectness } from "./chart-reply-correctness";
import { ChartResponseTimeTrend } from "./chart-response-time-trend";
import { ChartRatingDistribution } from "./chart-rating-distribution";
import { ChartLengthPreference } from "./chart-length-preference";
import { Button } from "@/components/ui/button";

interface AnalyticsGraphsModuleProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
  onBackToOverview?: () => void;
}

export const AnalyticsGraphsModule: FC<AnalyticsGraphsModuleProps> = ({
  data,
  isLoading = false,
  onBackToOverview,
}) => {
  const graphs = data?.graphs;
  const totalEvaluations = graphs?.total_evaluations ?? (data?.summary.total_feedback || 0);
  const avgRating = data?.summary.average_rating || 0;
  const correctness = data?.stats.correctness || {};
  const accuracyPct =
    totalEvaluations > 0
      ? (Number(correctness.correct || 0) + Number(correctness.partial || 0)).toFixed(1)
      : "—";

  const avgLatency =
    graphs?.average_latency !== null && graphs?.average_latency !== undefined
      ? `${graphs.average_latency.toFixed(2)}s`
      : data?.tables?.response_time_summary?.avg !== null && data?.tables?.response_time_summary?.avg !== undefined
      ? `${data.tables.response_time_summary.avg}s`
      : "—";

  const scrollToGraph = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25 shrink-0">
            <LineChartIcon className="h-7 w-7" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                Graph Analytics
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30 tracking-wide uppercase">
                Phase 3 &bull; FR20
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground max-w-3xl leading-relaxed mt-0.5">
              Visual insights into chatbot accuracy, correctness, response latency, human rating distributions, and response-length preferences across conversational phases.
            </p>
          </div>
        </div>

        {onBackToOverview && (
          <Button
            onClick={onBackToOverview}
            variant="outline"
            className="gap-2 rounded-xl border-border hover:border-[#f5a623]/40 text-muted-foreground hover:text-foreground text-[12.5px] font-medium shrink-0 self-stretch sm:self-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        )}
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-1 shadow-sm">
          <span className="text-[11.5px] text-muted-foreground">Evaluated Replies</span>
          <span className="text-[22px] font-semibold text-foreground font-mono">
            {totalEvaluations}
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
            {totalEvaluations > 0 ? `${avgRating.toFixed(1)} / 4` : "—"}
          </span>
          <span className="text-[11px] text-muted-foreground/75">1–4 Point Scale</span>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 flex flex-col gap-1 shadow-sm">
          <span className="text-[11.5px] text-muted-foreground">Average Latency</span>
          <span className="text-[22px] font-semibold text-foreground font-mono">
            {avgLatency}
          </span>
          <span className="text-[11px] text-muted-foreground/75">Generation speed</span>
        </div>
      </div>

      {/* Quick Jump-to Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        <span className="text-[12px] text-muted-foreground font-medium shrink-0 flex items-center gap-1.5 mr-1">
          <Sparkles className="h-3.5 w-3.5 text-[#f5a623]" />
          Jump to Graph:
        </span>
        <button
          onClick={() => scrollToGraph("graph-topic-distribution")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          1. Topic Distribution
        </button>
        <button
          onClick={() => scrollToGraph("graph-accuracy-by-topic")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          2. Accuracy by Topic
        </button>
        <button
          onClick={() => scrollToGraph("graph-phase-accuracy")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          3. Phase Accuracy
        </button>
        <button
          onClick={() => scrollToGraph("graph-reply-correctness")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          4. Reply Correctness
        </button>
        <button
          onClick={() => scrollToGraph("graph-response-time-trend")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          5. Response Time Trend
        </button>
        <button
          onClick={() => scrollToGraph("graph-rating-distribution")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          6. Rating Distribution
        </button>
        <button
          onClick={() => scrollToGraph("graph-length-preference")}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-muted/40 hover:bg-[#f5a623]/15 hover:text-[#f5a623] border border-border/80 text-muted-foreground transition-all shrink-0"
        >
          7. Length Preference
        </button>
      </div>

      {/* Seven Analytical Visualizations (FR20) */}
      <div className="flex flex-col gap-8">
        {/* Row 1: Topic Distribution (Pie) & Accuracy by Topic (Bar) (2-col grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartTopicDistribution
            data={graphs?.topic_distribution || []}
            totalEvaluations={totalEvaluations}
            isLoading={isLoading}
          />
          <ChartAccuracyByTopic
            data={graphs?.accuracy_by_topic || []}
            isLoading={isLoading}
          />
        </div>

        {/* Row 2: Accuracy Across Session Phases (Line) & Correctness by Reply (Bar) (2-col grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartPhaseAccuracy
            data={graphs?.phase_accuracy || []}
            isLoading={isLoading}
          />
          <ChartReplyCorrectness
            data={graphs?.reply_correctness || []}
            isLoading={isLoading}
          />
        </div>

        {/* Row 3: Response Time Trend (Full Width Line Chart) */}
        <div className="w-full">
          <ChartResponseTimeTrend
            data={graphs?.response_time_trend || []}
            isLoading={isLoading}
          />
        </div>

        {/* Row 4: User Rating Distribution (Bar) & Response Length Preferences (Pie) (2-col grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartRatingDistribution
            data={graphs?.rating_distribution || []}
            isLoading={isLoading}
          />
          <ChartLengthPreference
            data={graphs?.length_preference || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
