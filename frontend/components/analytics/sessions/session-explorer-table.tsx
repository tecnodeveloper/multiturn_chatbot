"use client";

import { FC, useState, useMemo } from "react";
import {
  Search,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  AlertCircle,
  FileCheck,
  Hourglass,
  Layers,
} from "lucide-react";
import { SessionRecord } from "@/types/analytics-sessions";
import { Button } from "@/components/ui/button";

interface SessionExplorerTableProps {
  sessions: SessionRecord[];
  selectedSessionId?: string | null;
  onSelectSession: (session: SessionRecord) => void;
  isLoading?: boolean;
}

type SortField = "started" | "activity" | "accuracy" | "latency" | "evaluations" | "duration";
type SortOrder = "asc" | "desc";

export const SessionExplorerTable: FC<SessionExplorerTableProps> = ({
  sessions = [],
  selectedSessionId,
  onSelectSession,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "active" | "inactive">("all");
  const [sortField, setSortField] = useState<SortField>("activity");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Search and filter logic
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchQuery, statusFilter]);

  // Sorting logic
  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      switch (sortField) {
        case "started":
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
          break;
        case "activity":
          valA = new Date(a.last_activity).getTime();
          valB = new Date(b.last_activity).getTime();
          break;
        case "accuracy":
          valA = a.accuracy !== null ? a.accuracy : -1;
          valB = b.accuracy !== null ? b.accuracy : -1;
          break;
        case "latency":
          valA = a.average_response_time !== null ? a.average_response_time : 9999;
          valB = b.average_response_time !== null ? b.average_response_time : 9999;
          break;
        case "evaluations":
          valA = a.evaluated_responses_count;
          valB = b.evaluated_responses_count;
          break;
        case "duration":
          valA = a.duration_seconds;
          valB = b.duration_seconds;
          break;
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [filteredSessions, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedSessions.length / pageSize) || 1;
  const pagedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSessions.slice(start, start + pageSize);
  }, [sortedSessions, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getStatusBadge = (status: "active" | "completed" | "inactive", isFinalized: boolean) => {
    if (isFinalized || status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
          <FileCheck className="h-3 w-3" />
          Finalized
        </span>
      );
    }
    if (status === "active") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-muted/40 text-muted-foreground border border-border">
        Inactive
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-4 animate-pulse">
        <div className="h-6 w-48 bg-muted/40 rounded" />
        <div className="h-10 w-full bg-muted/20 rounded-xl" />
        <div className="h-64 w-full bg-muted/10 rounded-xl" />
      </div>
    );
  }

  return (
    <div
      id="session-explorer-table"
      className="bg-card rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden scroll-mt-24"
    >
      {/* Header & Search Bar */}
      <div className="p-5 sm:p-6 border-b border-border flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-medium text-foreground tracking-tight">
                Session Explorer
              </h3>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Multi-turn chat conversations, turn progression, human evaluation coverage, and duration
            </p>
          </div>

          <span className="text-[11.5px] text-muted-foreground font-mono">
            {filteredSessions.length} session{filteredSessions.length === 1 ? "" : "s"} found
          </span>
        </div>

        {/* Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by chat title or session ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-muted/20 border border-border rounded-xl pl-9 pr-3 py-1.5 text-[12px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-[#f5a623]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-muted/30 border border-border rounded-xl px-2.5 py-1.5 text-[11.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-[#f5a623]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="completed">Finalized Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            {/* Page Size */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-muted/30 border border-border rounded-xl px-2.5 py-1.5 text-[11.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-[#f5a623]"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Component */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-[12px] border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-border bg-muted/15 text-muted-foreground font-medium">
              <th className="py-3 px-4">Session Title</th>
              <th
                onClick={() => handleSort("started")}
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  Started
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("activity")}
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none"
              >
                <div className="flex items-center gap-1">
                  Last Activity
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("duration")}
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  Duration
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">User / Asst</th>
              <th
                onClick={() => handleSort("evaluations")}
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  Evaluated
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort("accuracy")}
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  Accuracy
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Avg Rating</th>
              <th
                onClick={() => handleSort("latency")}
                className="py-3 px-3 cursor-pointer hover:text-foreground transition-colors select-none text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  Avg Latency
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {pagedSessions.length > 0 ? (
              pagedSessions.map((session) => {
                const isSelected = selectedSessionId === session.id;
                return (
                  <tr
                    key={session.id}
                    onClick={() => onSelectSession(session)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-[#f5a623]/10 hover:bg-[#f5a623]/15"
                        : "hover:bg-muted/20"
                    }`}
                  >
                    {/* Session Title */}
                    <td className="py-3.5 px-4 font-medium text-foreground max-w-[220px]">
                      <div className="flex flex-col">
                        <span className="truncate text-[12.5px] font-semibold text-foreground">
                          {session.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground/75 font-mono truncate">
                          {session.id.slice(0, 13)}...
                        </span>
                      </div>
                    </td>

                    {/* Started */}
                    <td className="py-3.5 px-3 text-muted-foreground text-[11px] whitespace-nowrap">
                      {session.started_formatted}
                    </td>

                    {/* Last Activity */}
                    <td className="py-3.5 px-3 text-muted-foreground text-[11px] whitespace-nowrap">
                      {session.last_activity_formatted}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-3 text-right font-mono text-[11px] text-foreground">
                      {session.duration_formatted}
                    </td>

                    {/* User / Asst Msgs */}
                    <td className="py-3.5 px-3 text-center font-mono text-[11px]">
                      <span className="text-muted-foreground">{session.user_messages_count}</span>
                      <span className="text-muted-foreground/50 mx-1">/</span>
                      <span className="text-foreground font-semibold">{session.assistant_responses_count}</span>
                    </td>

                    {/* Evaluated Replies */}
                    <td className="py-3.5 px-3 text-center font-mono text-[11px]">
                      <span className="font-semibold text-foreground">
                        {session.evaluated_responses_count}
                      </span>
                      {session.pending_feedback_count > 0 && (
                        <span className="text-[9.5px] text-amber-500 block">
                          ({session.pending_feedback_count} pending)
                        </span>
                      )}
                    </td>

                    {/* Accuracy */}
                    <td className="py-3.5 px-3 text-right font-mono text-[11px]">
                      {session.accuracy !== null ? (
                        <span
                          className={`font-bold ${
                            session.accuracy >= 75
                              ? "text-emerald-400"
                              : session.accuracy >= 50
                              ? "text-[#f5a623]"
                              : "text-amber-500"
                          }`}
                        >
                          {session.accuracy}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-3 text-center font-mono text-[11px]">
                      {session.average_rating !== null ? (
                        <span className="text-[#f5a623] font-semibold flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 fill-[#f5a623]" />
                          {session.average_rating}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>

                    {/* Avg Latency */}
                    <td className="py-3.5 px-3 text-right font-mono text-[11px] text-foreground">
                      {session.average_response_time !== null
                        ? `${session.average_response_time.toFixed(2)}s`
                        : "—"}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(session.status, session.is_finalized)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSession(session);
                        }}
                        className={`h-7 px-2.5 rounded-lg text-[11px] gap-1.5 ${
                          isSelected
                            ? "bg-[#f5a623] hover:bg-[#e09612] text-[#06080d] font-semibold shadow-sm"
                            : "border-border hover:border-[#f5a623]/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <Eye className="h-3 w-3" />
                        {isSelected ? "Inspecting" : "Inspect"}
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-6 w-6 text-muted-foreground/50" />
                    <p className="text-[13px] font-medium text-foreground">
                      No sessions matching current filter
                    </p>
                    <p className="text-[11.5px] text-muted-foreground max-w-sm">
                      {searchQuery
                        ? "Try adjusting your search query or status filter to locate your conversation."
                        : "Start a chat session with the assistant to begin recording session analytics."}
                    </p>
                    {searchQuery && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSearchQuery("")}
                        className="mt-1 h-7 text-[11px] rounded-lg border-border"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-border flex items-center justify-between text-[11.5px] text-muted-foreground">
        <span>
          Showing {sortedSessions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
          {Math.min(currentPage * pageSize, sortedSessions.length)} of {sortedSessions.length} sessions
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-7 px-2 rounded-lg text-[11px] border-border"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
            Prev
          </Button>

          <span className="font-mono text-foreground px-1">
            {currentPage} / {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-7 px-2 rounded-lg text-[11px] border-border"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
