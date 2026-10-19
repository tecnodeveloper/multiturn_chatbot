"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessagesSquare,
  ArrowLeft,
  Sparkles,
  LayoutGrid,
  ListOrdered,
  Eye,
  RefreshCw,
} from "lucide-react";
import type { AnalyticsData } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { SessionsOverviewCards } from "./sessions-overview-cards";
import { SessionExplorerTable } from "./session-explorer-table";
import { SessionDetailView } from "./session-detail-view";
import { SessionInsightsPanel } from "./session-insights-panel";

interface AnalyticsSessionsModuleProps {
  data: AnalyticsData | null;
  isLoading?: boolean;
  onBackToOverview?: () => void;
  onRefresh?: () => void;
  initialSessionId?: string | null;
}

export function AnalyticsSessionsModule({
  data,
  isLoading = false,
  onBackToOverview,
  onRefresh,
  initialSessionId,
}: AnalyticsSessionsModuleProps) {
  const sessionsData = data?.sessions;
  const sessions = sessionsData?.sessions || [];
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    initialSessionId || (sessions.length > 0 ? sessions[0].id : null)
  );

  const detailViewRef = useRef<HTMLDivElement>(null);

  // If initialSessionId is provided or sessions change, select first if none selected
  useEffect(() => {
    if (initialSessionId) {
      setSelectedSessionId(initialSessionId);
    } else if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [initialSessionId, sessions, selectedSessionId]);

  const handleSelectSession = (id: string) => {
    setSelectedSessionId(id);
    setTimeout(() => {
      detailViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || null;

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in-50 duration-200">
      {/* Top Banner */}
      <div className="bg-[#161821] rounded-2xl border border-[#1f2937] p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#f5a623]/15 border border-[#f5a623]/30 flex items-center justify-center text-[#f5a623] shrink-0 mt-0.5">
            <MessagesSquare className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Sessions Analytics
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30">
                <Sparkles className="h-3 w-3" /> FR7 · FR16 · FR21 · FR22
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Explore individual chat sessions, track turn progression across Start, Middle, and End phases, inspect response latency and user feedback, and finalize permanent session summaries into the database.
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

      {/* Quick Jump Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => document.getElementById("sessions-kpi-cards")?.scrollIntoView({ behavior: "smooth" })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-[#161821] hover:bg-[#1f2937] border border-[#1f2937] transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#f5a623]" /> Overview KPIs
        </button>
        <button
          onClick={() => document.getElementById("sessions-table-section")?.scrollIntoView({ behavior: "smooth" })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 bg-[#161821] hover:bg-[#1f2937] border border-[#1f2937] transition-colors"
        >
          <ListOrdered className="w-3.5 h-3.5 text-blue-400" /> Session Explorer
        </button>
        {selectedSession && (
          <button
            onClick={() => detailViewRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#f5a623] bg-[#f5a623]/10 border border-[#f5a623]/30 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Inspecting: {selectedSession.title}
          </button>
        )}
      </div>

      {/* 1. Session Overview Cards */}
      <section id="sessions-kpi-cards" aria-label="Session summary metrics">
        <SessionsOverviewCards kpis={sessionsData?.kpis} isLoading={isLoading} />
      </section>

      {/* 2. Session Insights Panel */}
      {sessionsData?.insights && sessionsData.insights.length > 0 && (
        <section aria-label="Session performance insights">
          <SessionInsightsPanel insights={sessionsData.insights} />
        </section>
      )}

      {/* 3. Session Explorer Table */}
      <section id="sessions-table-section" aria-label="Session explorer table">
        <SessionExplorerTable
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSelectSession={(s) => handleSelectSession(s.id)}
          isLoading={isLoading}
        />
      </section>

      {/* 4. Deep Inspection / Detail View */}
      <section ref={detailViewRef} id="session-detail-view" aria-label="Selected session inspection">
        {selectedSession ? (
          <SessionDetailView
            session={selectedSession}
            onSessionFinalized={() => {
              if (onRefresh) onRefresh();
            }}
            isLoading={isLoading}
          />
        ) : (
          <div className="bg-[#161821] border border-[#1f2937] rounded-xl p-8 text-center text-gray-400">
            <Eye className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#f5a623]" />
            <p className="text-sm">Select a session from the explorer table above to inspect its conversation timeline, Start/Middle/End phase performance, and FR22 permanent analytics summary.</p>
          </div>
        )}
      </section>
    </div>
  );
}
