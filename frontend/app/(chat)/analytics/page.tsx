"use client";

import { FC, useState } from "react";
import { AnalyticsHeader } from "@/components/analytics/header";
import { OverviewStats } from "@/components/analytics/overview-stats";
import { AccuracyTrendChart } from "@/components/analytics/accuracy-trend-chart";
import { FeedbackDistributionChart } from "@/components/analytics/feedback-distribution-chart";
import { TopicAccuracyChart } from "@/components/analytics/topic-accuracy-chart";
import { ResponseVolumeChart } from "@/components/analytics/response-volume-chart";
import { FeedbackTable } from "@/components/analytics/feedback-table";
import { PerformanceInsights } from "@/components/analytics/performance-insights";
import { useAnalytics } from "@/hooks/use-analytics";
import { AnalyticsErrorView } from "@/components/analytics/analytics-error-view";
import { Loader2, Layers, MessageSquare } from "lucide-react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useChat } from "@/context/chat-context";
import { useDashboard } from "@/hooks/use-dashboard";

const AnalyticsPage: FC = () => {
  const [viewMode, setViewMode] = useState<"this_session" | "all_sessions">("all_sessions");
  const { chats, currentChatId, setCurrentChatId } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { handleNewChat, handleDeleteChat } = useDashboard();

  const activeChat = chats.find((c) => c.id === currentChatId) || (chats.length > 0 ? chats[0] : null);
  const activeSessionId = currentChatId || (activeChat ? activeChat.id : null);

  const { data, loading, error, refetch } = useAnalytics({
    mode: viewMode,
    sessionId: activeSessionId,
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar
          collapsed={!sidebarOpen}
          onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onSelectChat={setCurrentChatId}
        />
        <div className="flex flex-1 items-center justify-center bg-[#06080d]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#14b8a6]" />
            <p className="text-[#14b8a6] text-[13px] font-medium">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar
          collapsed={!sidebarOpen}
          onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          onSelectChat={setCurrentChatId}
        />
        <div className="flex-1 overflow-y-auto">
          <AnalyticsErrorView
            error={error}
            errorCode="404"
            onRetry={refetch}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={!sidebarOpen}
        onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onSelectChat={setCurrentChatId}
      />

      <div className="flex-1 flex flex-col overflow-y-auto min-h-0">
        <AnalyticsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeSessionTitle={activeChat?.title}
          onRefresh={refetch}
        />
        
        <main className="flex-1 p-4 sm:p-8 pb-32 max-w-[1600px] mx-auto w-full">
          <div className="flex flex-col gap-6">
            {/* Active Scope Context Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#f5a623]/10 text-[#f5a623] shrink-0">
                  {viewMode === "this_session" ? (
                    <MessageSquare className="h-5 w-5" />
                  ) : (
                    <Layers className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-foreground">
                      {viewMode === "this_session" ? "This Session Analytics" : "All Sessions Aggregated Analytics"}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30">
                      {viewMode === "this_session" ? "Active Session" : "All Sessions"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {viewMode === "this_session"
                      ? (activeChat ? `Scoped to active session: "${activeChat.title}"` : "Scoped to active chat session")
                      : "Displaying aggregated feedback metrics and performance across all sessions"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-background/80 border border-border self-stretch sm:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("this_session")}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === "this_session"
                      ? "bg-[#f5a623] text-[#0f1117] font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  This Session
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("all_sessions")}
                  className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    viewMode === "all_sessions"
                      ? "bg-[#f5a623] text-[#0f1117] font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  All Sessions
                </button>
              </div>
            </div>

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
    </div>
  );
};

export default AnalyticsPage;
