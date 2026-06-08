"use client";

import { FC } from "react";
import { AnalyticsHeader } from "@/components/analytics/header";
import { OverviewStats } from "@/components/analytics/overview-stats";
import { AccuracyTrendChart } from "@/components/analytics/accuracy-trend-chart";
import { FeedbackDistributionChart } from "@/components/analytics/feedback-distribution-chart";
import { TopicAccuracyChart } from "@/components/analytics/topic-accuracy-chart";
import { ResponseVolumeChart } from "@/components/analytics/response-volume-chart";
import { FeedbackTable } from "@/components/analytics/feedback-table";
import { PerformanceInsights } from "@/components/analytics/performance-insights";
import { useAnalytics } from "@/hooks/use-analytics";
import { Loader2 } from "lucide-react";

const AnalyticsPage: FC = () => {
  const { data, loading, error } = useAnalytics();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#e8ddd1]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-[#8b6f5c]" />
          <p className="text-[#8b6f5c] font-medium">Loading Analytics Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#e8ddd1]">
        <div className="rounded-xl bg-white p-8 shadow-xl text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-400">Ensure the analytics backend service is running on port 5001.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8ddd1] flex flex-col">
      <AnalyticsHeader />
      
      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col gap-6">
          {/* Stats Overview */}
          <OverviewStats data={data} />

          {/* Chart 1: Response Accuracy Trend (Full Width) */}
          <div className="w-full">
            <AccuracyTrendChart data={data} />
          </div>

          {/* Chart 2 & 3: User Feedback Distribution & Accuracy by Topic (Half Width) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeedbackDistributionChart data={data} />
            <TopicAccuracyChart data={data} />
          </div>

          {/* Chart 4: Response Volume & Quality (Full Width) */}
          <div className="w-full">
            <ResponseVolumeChart data={data} />
          </div>

          {/* Recent User Feedback Table & Performance Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FeedbackTable data={data} />
            </div>
            <div className="lg:col-span-1">
              <PerformanceInsights data={data} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
