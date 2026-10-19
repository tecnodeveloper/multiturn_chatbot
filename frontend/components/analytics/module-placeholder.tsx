"use client";

import { FC } from "react";
import {
  Table2,
  LineChart,
  MessagesSquare,
  Tags,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AnalyticsTabId } from "./navigation-tabs";
import { Button } from "@/components/ui/button";

interface ModulePlaceholderProps {
  tab: AnalyticsTabId;
  onBackToOverview: () => void;
}

interface ModuleDetails {
  title: string;
  requirement: string;
  description: string;
  icon: typeof Table2;
  plannedFeatures: {
    title: string;
    description: string;
  }[];
}

const MODULE_DATA: Record<Exclude<AnalyticsTabId, "overview">, ModuleDetails> = {
  tables: {
    title: "Analytical Tables",
    requirement: "Phase 3 — FR19 Specification",
    description:
      "Comprehensive multi-dimensional tables aggregating response performance, correctness rates, and turn-by-turn latency distributions.",
    icon: Table2,
    plannedFeatures: [
      {
        title: "Topic Accuracy Table",
        description: "Accuracy rates, total evaluations, and average ratings categorized across 5 AI domains.",
      },
      {
        title: "Reply Correctness Breakdown",
        description: "Exact counts and percentages for Correct, Partial, and Incorrect assistant responses.",
      },
      {
        title: "Phase-Wise Accuracy Table",
        description: "Accuracy segmentation across conversational phases: Start (turns 1-2), Middle (turns 3-5), and End (turns 6+).",
      },
      {
        title: "Response-Time Statistics Table",
        description: "Aggregated Minimum, Maximum, Median, and Mean latency per topic and session phase.",
      },
      {
        title: "Rating Distribution Table",
        description: "Detailed count and frequency breakdown on the 1–4 point human rating scale.",
      },
      {
        title: "Response-Length Preference Table",
        description: "User feedback correlation across Short, To the Point, and Lengthy responses.",
      },
    ],
  },
  graphs: {
    title: "Advanced Visualizations & Graphs",
    requirement: "Phase 3 — FR20 Specification",
    description:
      "Dynamic charting suite visualizing conversational trajectory, latency trends over turns, and phase-wise correctness curves.",
    icon: LineChart,
    plannedFeatures: [
      {
        title: "Turn-by-Turn Correctness Curve",
        description: "Historical trajectory of response correctness as conversations deepen.",
      },
      {
        title: "Phase-Wise Accuracy Comparison",
        description: "Grouped comparative visualization of model reliability across Start, Middle, and End phases.",
      },
      {
        title: "Response Latency Trendline",
        description: "Chronological line chart showing response generation times and network latency.",
      },
      {
        title: "Rating Frequency Distribution",
        description: "Bar chart displaying the distribution of 1 to 4 star ratings across all evaluated replies.",
      },
      {
        title: "Response Length vs Quality Correlation",
        description: "Visual analysis of whether concise or verbose answers yield higher accuracy ratings.",
      },
    ],
  },
  sessions: {
    title: "Session-Level Insights",
    requirement: "Phase 3 — FR16 & FR21 Specification",
    description:
      "Deep drill-down into individual chat sessions, turn-by-turn dynamics, phase-transition metrics, and final session summary exports.",
    icon: MessagesSquare,
    plannedFeatures: [
      {
        title: "Session Metadata & Duration",
        description: "Elapsed duration, message count, assistant reply volume, and feedback coverage per session.",
      },
      {
        title: "Start, Middle & End Phase Analysis",
        description: "Evaluation of model drift and context retention as the chat progresses through conversation phases.",
      },
      {
        title: "Interactive Session Selector",
        description: "Filter individual sessions to inspect localized correctness and response duration metrics.",
      },
      {
        title: "Session Summary Persistence (FR22)",
        description: "Automated generation and database storage of final analytics summaries upon session termination.",
      },
    ],
  },
  topics: {
    title: "Topic-Based Performance",
    requirement: "Phase 3 — FR15 & FR21 Specification",
    description:
      "Domain specialization analysis across Machine Learning, Deep Learning, Healthcare AI, Power Systems, and E-commerce AI.",
    icon: Tags,
    plannedFeatures: [
      {
        title: "5-Domain Accuracy Comparison",
        description: "Side-by-side performance benchmarking across all 5 project domains.",
      },
      {
        title: "Keyword & LLM Classification Engine",
        description: "Automated categorization of user queries into domain categories with confidence scoring.",
      },
      {
        title: "Domain Latency & Length Benchmarks",
        description: "Comparative evaluation of which domains demand higher computation times or longer explanations.",
      },
      {
        title: "Topic Weak-Spot Detection",
        description: "Automated identification of specific domain areas generating partial or incorrect evaluations.",
      },
    ],
  },
};

export const ModulePlaceholder: FC<ModulePlaceholderProps> = ({
  tab,
  onBackToOverview,
}) => {
  if (tab === "overview") return null;

  const module = MODULE_DATA[tab];
  const Icon = module.icon;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25 shrink-0">
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                {module.title}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30 tracking-wide uppercase">
                Step 2 Planned
              </span>
            </div>
            <p className="text-[12.5px] font-normal text-[#f5a623]/90">
              {module.requirement}
            </p>
            <p className="text-[13px] text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              {module.description}
            </p>
          </div>
        </div>

        <Button
          onClick={onBackToOverview}
          variant="outline"
          className="gap-2 rounded-xl border-border hover:border-[#f5a623]/40 text-muted-foreground hover:text-foreground text-[12.5px] font-medium shrink-0 self-stretch sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Overview
        </Button>
      </div>

      {/* Planned Implementation Specification Card */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#f5a623]" />
            <h3 className="text-[15px] font-medium text-foreground">
              Planned Capabilities for this Module
            </h3>
          </div>
          <span className="text-[11.5px] text-muted-foreground">
            No simulated data &mdash; real analytics will load here
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {module.plannedFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-muted/20 border border-border/80 flex items-start gap-3.5 hover:border-[#f5a623]/30 transition-colors"
            >
              <div className="p-1 rounded-full bg-[#f5a623]/10 text-[#f5a623] shrink-0 mt-0.5">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-[13.5px] font-medium text-foreground">
                  {feat.title}
                </h4>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-[#f5a623]/5 border border-[#f5a623]/20 flex items-center justify-between flex-wrap gap-3">
          <p className="text-[12px] text-muted-foreground">
            This module will be implemented in the next dedicated step following review of the Overview module.
          </p>
          <Button
            onClick={onBackToOverview}
            size="sm"
            className="rounded-lg bg-[#f5a623] hover:bg-[#e09612] text-[#0f1117] font-medium text-[12px] shadow-sm"
          >
            Go to Active Overview
          </Button>
        </div>
      </div>
    </div>
  );
};
