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

const AnalyticsPage: FC = () => {
  return (
    <div className="min-h-screen bg-[#e8ddd1] flex flex-col">
      <AnalyticsHeader />
      
      <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col gap-6">
          {/* Stats Overview */}
          <OverviewStats />

          {/* Chart 1: Response Accuracy Trend (Full Width) */}
          <div className="w-full">
            <AccuracyTrendChart />
          </div>

          {/* Chart 2 & 3: User Feedback Distribution & Accuracy by Topic (Half Width) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeedbackDistributionChart />
            <TopicAccuracyChart />
          </div>

          {/* Chart 4: Response Volume & Quality (Full Width) */}
          <div className="w-full">
            <ResponseVolumeChart />
          </div>

          {/* Recent User Feedback Table & Performance Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FeedbackTable />
            </div>
            <div className="lg:col-span-1">
              <PerformanceInsights />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage;
