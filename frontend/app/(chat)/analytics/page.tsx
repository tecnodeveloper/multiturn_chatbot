"use client";

import { FC, useState, useEffect, useCallback } from "react";
import { AnalyticsHeader } from "@/components/analytics/header";
import { NavigationTabs, AnalyticsTabId, ANALYTICS_TABS } from "@/components/analytics/navigation-tabs";
import { OverviewStats } from "@/components/analytics/overview-stats";
import { AccuracyTrendChart } from "@/components/analytics/accuracy-trend-chart";
import { FeedbackDistributionChart } from "@/components/analytics/feedback-distribution-chart";
import { TopicAccuracyChart } from "@/components/analytics/topic-accuracy-chart";
import { ResponseVolumeChart } from "@/components/analytics/response-volume-chart";
import { FeedbackTable } from "@/components/analytics/feedback-table";
import { PerformanceInsights } from "@/components/analytics/performance-insights";
import { AnalyticsTablesModule } from "@/components/analytics/tables/analytics-tables-module";
import { AnalyticsGraphsModule } from "@/components/analytics/graphs/analytics-graphs-module";
import { AnalyticsSessionsModule } from "@/components/analytics/sessions/analytics-sessions-module";
import { AnalyticsTopicsModule } from "@/components/analytics/topics/analytics-topics-module";
import { ModulePlaceholder } from "@/components/analytics/module-placeholder";
import { BackendOfflineView } from "@/components/analytics/backend-offline-view";
import { AnalyticsErrorView } from "@/components/analytics/analytics-error-view";
import { useAnalytics } from "@/hooks/use-analytics";
import { Sidebar } from "@/components/sidebar/sidebar";
import { useChat } from "@/context/chat-context";
import { useDashboard } from "@/hooks/use-dashboard";

interface AnalyticsPageProps {
  initialTab?: AnalyticsTabId;
  initialSessionId?: string | null;
}

const AnalyticsPage: FC<AnalyticsPageProps> = ({ initialTab, initialSessionId }) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTabId>(() => {
    if (initialTab) return initialTab;
    if (typeof window !== "undefined") {
      const param = new URLSearchParams(window.location.search).get("tab") as AnalyticsTabId;
      if (param && ANALYTICS_TABS.some((t) => t.id === param)) return param;
    }
    return "overview";
  });

  const [viewMode, setViewMode] = useState<"this_session" | "all_sessions">("all_sessions");
  const { chats, currentChatId, setCurrentChatId } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { handleNewChat, handleDeleteChat } = useDashboard();

  const activeChat =
    chats.find((c) => c.id === currentChatId) || (chats.length > 0 ? chats[0] : null);
  const activeSessionId = currentChatId || (activeChat ? activeChat.id : null);

  const {
    data,
    loading,
    error,
    refetch,
    backendHealth,
    healthDetails,
    checkHealth,
    handleRetry,
    isRetrying,
  } = useAnalytics({
    mode: viewMode,
    sessionId: activeSessionId,
  });

  // URL synchronization & browser history handling (back / forward / direct navigation)
  const handleTabChange = useCallback((tab: AnalyticsTabId) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = tab === "overview" ? "/analytics" : `/analytics/${tab}`;
      window.history.pushState(null, "", url);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPopState = () => {
      const pathname = window.location.pathname;
      if (pathname.includes("/analytics/topics")) {
        setActiveTab("topics");
        return;
      }
      if (pathname.includes("/analytics/sessions")) {
        setActiveTab("sessions");
        return;
      }
      if (pathname.includes("/analytics/tables")) {
        setActiveTab("tables");
        return;
      }
      if (pathname.includes("/analytics/graphs")) {
        setActiveTab("graphs");
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as AnalyticsTabId;
      if (tabParam && ANALYTICS_TABS.some((t) => t.id === tabParam)) {
        setActiveTab(tabParam);
      } else {
        setActiveTab(initialTab || "overview");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [initialTab]);

  const isBackendOffline = backendHealth === "unhealthy";
  const isInitialLoading = loading && !data && !isBackendOffline;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        collapsed={!sidebarOpen}
        onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onSelectChat={setCurrentChatId}
      />

      <div className="flex-1 flex flex-col overflow-y-auto min-h-0 bg-[#06080d]">
        {/* Sticky Page Header */}
        <AnalyticsHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          activeSessionTitle={activeChat?.title}
          onRefresh={refetch}
          backendHealth={backendHealth}
          onRetryHealth={handleRetry}
        />

        {/* Horizontal Navigation Shell (5 tabs: Overview, Tables, Graphs, Sessions, Topics) */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          disabled={isBackendOffline}
        />

        {/* Main Analytics Container */}
        <main className="flex-1 p-4 sm:p-8 pb-32 max-w-[1600px] mx-auto w-full">
          {/* Critical Requirement: Service Offline State suppresses all stale analytics */}
          {isBackendOffline ? (
            <BackendOfflineView
              onRetry={handleRetry}
              onRefreshStatus={checkHealth}
              isRetrying={isRetrying}
              healthDetails={healthDetails}
            />
          ) : error && !data ? (
            <AnalyticsErrorView
              error={error}
              errorCode="500"
              onRetry={refetch}
            />
          ) : activeTab === "tables" ? (
            /* Tables Module (Phase 3 — FR19) */
            <AnalyticsTablesModule
              data={data}
              isLoading={isInitialLoading}
              onBackToOverview={() => handleTabChange("overview")}
            />
          ) : activeTab === "graphs" ? (
            /* Graphs Module (Phase 3 — FR20) */
            <AnalyticsGraphsModule
              data={data}
              isLoading={isInitialLoading}
              onBackToOverview={() => handleTabChange("overview")}
            />
          ) : activeTab === "sessions" ? (
            /* Sessions Module (Phase 3 — FR7, FR16, FR21, FR22) */
            <AnalyticsSessionsModule
              data={data}
              isLoading={isInitialLoading}
              onBackToOverview={() => handleTabChange("overview")}
              onRefresh={refetch}
              initialSessionId={initialSessionId}
            />
          ) : activeTab === "topics" ? (
            /* Topics Module (Phase 3 — FR15, FR17, FR20, FR21) */
            <AnalyticsTopicsModule
              data={data}
              isLoading={isInitialLoading}
              onBackToOverview={() => handleTabChange("overview")}
              onRefresh={refetch}
            />
          ) : activeTab !== "overview" ? (
            /* Polished Placeholder for Upcoming Modules */
            <ModulePlaceholder
              tab={activeTab}
              onBackToOverview={() => handleTabChange("overview")}
            />
          ) : (
            /* Overview Tab: Fully Functional with Verified Real Data Only */
            <div
              id="analytics-panel-overview"
              role="tabpanel"
              aria-labelledby="analytics-tab-overview"
              className="flex flex-col gap-6 animate-in fade-in-50 duration-150"
            >
              {/* Summary Metric Cards */}
              <OverviewStats
                data={data}
                isLoading={isInitialLoading}
                viewMode={viewMode}
              />

              {/* Chart 1: Response Accuracy Trend (Full Width) */}
              <div className="w-full">
                <AccuracyTrendChart
                  data={data}
                  isLoading={isInitialLoading}
                />
              </div>

              {/* Charts 2 & 3: Correctness Distribution & Feedback Volume by Topic (2-col grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FeedbackDistributionChart
                  data={data}
                  isLoading={isInitialLoading}
                />
                <TopicAccuracyChart
                  data={data}
                  isLoading={isInitialLoading}
                />
              </div>

              {/* Chart 4: Response Volume & Quality (Full Width) */}
              <div className="w-full">
                <ResponseVolumeChart
                  data={data}
                  isLoading={isInitialLoading}
                />
              </div>

              {/* Recent User Feedback Table & Performance Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <FeedbackTable
                    data={data}
                    isLoading={isInitialLoading}
                  />
                </div>
                <div className="lg:col-span-1">
                  <PerformanceInsights
                    data={data}
                    isLoading={isInitialLoading}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AnalyticsPage;
