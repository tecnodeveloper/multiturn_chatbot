"use client";

import React, { FC, useState, useMemo } from "react";
import {
  Tags,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  LayoutGrid,
  PieChart as PieIcon,
  Table2,
  Lightbulb,
  Filter,
} from "lucide-react";
import type { AnalyticsData } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { TopicsOverviewCards } from "./topics-overview-cards";
import { TopicDistributionChart } from "./topic-distribution-chart";
import { TopicAccuracyChart } from "./topic-accuracy-chart";
import { TopicPerformanceTable } from "./topic-performance-table";
import { TopicInsightsPanel } from "./topic-insights-panel";

interface AnalyticsTopicsModuleProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
  onBackToOverview?: () => void;
  onRefresh?: () => void;
}

export const AnalyticsTopicsModule: FC<AnalyticsTopicsModuleProps> = ({
  data,
  isLoading = false,
  onBackToOverview,
  onRefresh,
}) => {
  const topicsData = data?.topics_module;
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>("all");

  const allTopicsList = topicsData?.topics || [];

  // Filter topics data if an individual topic is selected
  const filteredTopics = useMemo(() => {
    if (selectedTopicFilter === "all") return allTopicsList;
    return allTopicsList.filter((t) => t.topic === selectedTopicFilter);
  }, [allTopicsList, selectedTopicFilter]);

  const filteredDistribution = useMemo(() => {
    if (!topicsData?.distribution) return [];
    if (selectedTopicFilter === "all") return topicsData.distribution;
    return topicsData.distribution.filter((d) => d.topic === selectedTopicFilter);
  }, [topicsData?.distribution, selectedTopicFilter]);

  const filteredAccuracyComparison = useMemo(() => {
    if (!topicsData?.accuracy_comparison) return [];
    if (selectedTopicFilter === "all") return topicsData.accuracy_comparison;
    return topicsData.accuracy_comparison.filter((a) => a.topic === selectedTopicFilter);
  }, [topicsData?.accuracy_comparison, selectedTopicFilter]);

  // Recalculate KPIs if filtered by single topic
  const currentKpis = useMemo(() => {
    if (!topicsData?.kpis) return null;
    if (selectedTopicFilter === "all") return topicsData.kpis;

    const single = allTopicsList.find((t) => t.topic === selectedTopicFilter);
    if (!single) return topicsData.kpis;

    return {
      topics_identified: single.total_ai_responses > 0 ? 1 : 0,
      total_ai_responses: single.total_ai_responses,
      total_evaluated_responses: single.evaluated_responses,
      overall_strict_accuracy: single.strict_accuracy,
      overall_helpfulness: single.helpfulness,
      overall_average_rating: single.average_rating,
      overall_feedback_coverage: single.feedback_coverage,
    };
  }, [topicsData?.kpis, allTopicsList, selectedTopicFilter]);

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="bg-[#161821] rounded-2xl border border-[#1f2937] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#f5a623]/15 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623] shrink-0 mt-0.5">
            <Tags className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Topics & Domain Analytics
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30">
                <Sparkles className="h-3 w-3" /> FR15 · FR17 · FR20 · FR21
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Explore model performance across Machine Learning, Deep Learning, Healthcare AI, Power Systems, E-commerce AI, and general inquiries. Analyze domain distribution, strict accuracy, helpfulness, and user rating trends.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="border-[#1f2937] hover:border-[#f5a623]/50 text-gray-300 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          )}
          {onBackToOverview && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToOverview}
              className="border-[#1f2937] hover:border-[#f5a623]/50 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Overview
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Quick Jump Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        {/* Quick Jump Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => document.getElementById("topics-kpis-section")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-[#161821] hover:bg-[#1f2937] border border-[#1f2937] transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#f5a623]" /> Overview KPIs
          </button>
          <button
            onClick={() => document.getElementById("topics-charts-section")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-[#161821] hover:bg-[#1f2937] border border-[#1f2937] transition-colors"
          >
            <PieIcon className="w-3.5 h-3.5 text-blue-400" /> Visual Charts
          </button>
          <button
            onClick={() => document.getElementById("topics-table-section")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-[#161821] hover:bg-[#1f2937] border border-[#1f2937] transition-colors"
          >
            <Table2 className="w-3.5 h-3.5 text-emerald-400" /> Comparison Table
          </button>
          <button
            onClick={() => document.getElementById("topics-insights-section")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-[#161821] hover:bg-[#1f2937] border border-[#1f2937] transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Insights
          </button>
        </div>

        {/* Domain Filter Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-400">Filter Topic:</span>
          <select
            value={selectedTopicFilter}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="bg-[#161821] border border-[#1f2937] text-white text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[#f5a623] cursor-pointer"
          >
            <option value="all">All Topics (Full System)</option>
            {allTopicsList.map((t) => (
              <option key={t.topic} value={t.topic}>
                {t.topic} ({t.total_ai_responses} replies)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Summary Overview Cards */}
      <section id="topics-kpis-section" aria-label="Topic summary metrics">
        <TopicsOverviewCards kpis={currentKpis} isLoading={isLoading} />
      </section>

      {/* 2. Side-by-Side Visualizations (Distribution & Accuracy) */}
      <section id="topics-charts-section" aria-label="Topic visualizations" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopicDistributionChart
          data={filteredDistribution}
          totalAiResponses={currentKpis?.total_ai_responses || 0}
          isLoading={isLoading}
        />
        <TopicAccuracyChart
          data={filteredAccuracyComparison}
          isLoading={isLoading}
        />
      </section>

      {/* 3. Topic Performance Comparison Table */}
      <section id="topics-table-section" aria-label="Topic performance table">
        <TopicPerformanceTable
          topics={filteredTopics}
          isLoading={isLoading}
        />
      </section>

      {/* 4. Topic-Level Insights */}
      {topicsData?.insights && topicsData.insights.length > 0 && (
        <section id="topics-insights-section" aria-label="Topic performance insights">
          <TopicInsightsPanel insights={topicsData.insights} />
        </section>
      )}
    </div>
  );
};
