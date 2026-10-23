"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LayoutGrid,
  ListOrdered,
  Eye,
} from "lucide-react";
import type { AnalyticsData } from "@/hooks/use-analytics";
import { SessionsOverviewCards } from "./sessions-overview-cards";
import { SessionExplorerTable } from "./session-explorer-table";
import { SessionDetailView } from "./session-detail-view";

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
    <div className="flex flex-col gap-6 w-full animate-in fade-in-50 duration-200">
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
      <section id="sessions-kpi-cards" aria-label="Session summary metrics" className="scroll-mt-28">
        <SessionsOverviewCards kpis={sessionsData?.kpis} isLoading={isLoading} />
      </section>

      {/* 2. Session Explorer Table */}
      <section id="sessions-table-section" aria-label="Session explorer table" className="scroll-mt-28">
        <SessionExplorerTable
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSelectSession={(s) => handleSelectSession(s.id)}
          isLoading={isLoading}
        />
      </section>

      {/* 3. Deep Inspection / Detail View */}
      <section ref={detailViewRef} id="session-detail-view" aria-label="Selected session inspection" className="scroll-mt-28">
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
            <p className="text-sm">Select a session from the explorer table above to inspect its conversation timeline, Start/Middle/End phase performance, and permanent analytics summary.</p>
          </div>
        )}
      </section>
    </div>
  );
}
