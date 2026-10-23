"use client";

import { FC, useState, useMemo } from "react";
import {
  MessageSquare,
  Search,
  Filter,
  ArrowUpDown,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Clock,
  Inbox,
  Star,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { ReplyCorrectnessRecord } from "@/types/analytics-tables";
import {
  FeedbackDetailModal,
  FeedbackModalItem,
} from "../feedback-detail-modal";
import { Button } from "@/components/ui/button";

interface TableReplyCorrectnessProps {
  data: ReplyCorrectnessRecord[];
  isLoading?: boolean;
}

export const TableReplyCorrectness: FC<TableReplyCorrectnessProps> = ({
  data = [],
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [correctnessFilter, setCorrectnessFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"time_desc" | "time_asc" | "rating_desc" | "rating_asc" | "latency_asc" | "latency_desc">("time_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedItem, setSelectedItem] = useState<FeedbackModalItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter & Search Logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Correctness filter
      if (correctnessFilter !== "all") {
        if (item.correctness !== correctnessFilter) return false;
      }
      // Topic filter
      if (topicFilter !== "all") {
        if (item.topic !== topicFilter) return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesPreview = item.preview.toLowerCase().includes(query);
        const matchesPrompt = (item.user_query || "").toLowerCase().includes(query);
        const matchesTopic = item.topic.toLowerCase().includes(query);
        const matchesSession = item.session_title.toLowerCase().includes(query);
        if (!matchesPreview && !matchesPrompt && !matchesTopic && !matchesSession) {
          return false;
        }
      }
      return true;
    });
  }, [data, correctnessFilter, topicFilter, searchTerm]);

  // Sort Logic
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortBy === "time_desc") {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === "time_asc") {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortBy === "rating_desc") {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === "rating_asc") {
        return (a.rating || 0) - (b.rating || 0);
      }
      if (sortBy === "latency_asc") {
        return (a.response_time ?? 999) - (b.response_time ?? 999);
      }
      if (sortBy === "latency_desc") {
        return (b.response_time ?? -1) - (a.response_time ?? -1);
      }
      return 0;
    });
  }, [filteredData, sortBy]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, safeCurrentPage, pageSize]);

  // Handle row click
  const handleRowClick = (record: ReplyCorrectnessRecord) => {
    setSelectedItem({
      id: record.id,
      time: record.formatted_time,
      topic: record.topic,
      preview: record.preview,
      user_query: record.user_query,
      model_response: record.assistant_response,
      feedback: record.feedback_status,
      status: record.status,
      rating: record.rating,
      correctness: record.correctness,
      length_type: record.length_type,
    });
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCorrectnessFilter("all");
    setTopicFilter("all");
    setSortBy("time_desc");
    setCurrentPage(1);
  };

  const renderCorrectnessBadge = (status: string) => {
    switch (status) {
      case "Correct":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25">
            Correct
          </span>
        );
      case "Partial":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f5a623]/5 text-[#d48812] dark:text-[#f5a623]/80 border border-[#f5a623]/15">
            Partial
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50">
            Incorrect
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-4 border border-border animate-pulse">
        <div className="w-56 h-5 rounded bg-muted/40" />
        <div className="w-80 h-3 rounded bg-muted/30" />
        <div className="h-10 w-full rounded-xl bg-muted/20" />
        <div className="space-y-2 mt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 w-full rounded-lg bg-muted/20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id="table-reply-correctness"
      className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-5 w-full border border-border overflow-hidden scroll-mt-28"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20 shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-foreground tracking-tight">
              Reply Correctness
            </h3>
          </div>
        </div>

        <div className="text-[11.5px] text-muted-foreground flex items-center gap-1.5 self-start sm:self-auto">
          <span>{sortedData.length} records in scope</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search response text, prompt, session, topic..."
            className="w-full pl-9 pr-3 py-2 text-[12.5px] rounded-xl border border-border bg-background/60 hover:border-[#f5a623]/40 focus:border-[#f5a623] focus:outline-none focus:ring-1 focus:ring-[#f5a623] text-foreground placeholder:text-muted-foreground transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Correctness filter */}
          <select
            value={correctnessFilter}
            onChange={(e) => {
              setCorrectnessFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by correctness"
            className="px-3 py-2 text-[12px] rounded-xl border border-border bg-background/60 text-foreground hover:border-[#f5a623]/40 focus:border-[#f5a623] focus:outline-none cursor-pointer"
          >
            <option value="all">All Correctness</option>
            <option value="correct">Correct</option>
            <option value="partial">Partial</option>
            <option value="incorrect">Incorrect</option>
          </select>

          {/* Topic filter */}
          <select
            value={topicFilter}
            onChange={(e) => {
              setTopicFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by topic"
            className="px-3 py-2 text-[12px] rounded-xl border border-border bg-background/60 text-foreground hover:border-[#f5a623]/40 focus:border-[#f5a623] focus:outline-none cursor-pointer"
          >
            <option value="all">All Topics</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Deep Learning">Deep Learning</option>
            <option value="Healthcare AI">Healthcare AI</option>
            <option value="Power Systems">Power Systems</option>
            <option value="E-commerce AI">E-commerce AI</option>
            <option value="Other">Other</option>
          </select>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort replies"
            className="px-3 py-2 text-[12px] rounded-xl border border-border bg-background/60 text-foreground hover:border-[#f5a623]/40 focus:border-[#f5a623] focus:outline-none cursor-pointer"
          >
            <option value="time_desc">Time: Newest</option>
            <option value="time_asc">Time: Oldest</option>
            <option value="rating_desc">Rating: High to Low</option>
            <option value="rating_asc">Rating: Low to High</option>
            <option value="latency_asc">Latency: Fastest</option>
            <option value="latency_desc">Latency: Slowest</option>
          </select>

          {(searchTerm || correctnessFilter !== "all" || topicFilter !== "all" || sortBy !== "time_desc") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-8 px-2 text-[11.5px] text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse table-fixed min-w-[960px]">
          <colgroup>
            <col className="w-[130px]" />
            <col className="w-[140px]" />
            <col className="w-[140px]" />
            <col className="w-auto" />
            <col className="w-[90px]" />
            <col className="w-[100px]" />
            <col className="w-[105px]" />
            <col className="w-[85px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-muted/20 text-[12px] text-muted-foreground font-medium">
              <th className="py-3 px-3">Timestamp</th>
              <th className="py-3 px-3">Session</th>
              <th className="py-3 px-3">Topic</th>
              <th className="py-3 px-3">Assistant Response Preview</th>
              <th className="py-3 px-3 text-center">Rating</th>
              <th className="py-3 px-3 text-center">Correctness</th>
              <th className="py-3 px-3 text-right">Latency</th>
              <th className="py-3 px-3 text-center">Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-[12.5px]">
            {paginatedData.length > 0 ? (
              paginatedData.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => handleRowClick(record)}
                  className="hover:bg-[#f5a623]/5 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  title="Click to view full prompt, model response, and evaluation details"
                >
                  <td className="py-3 px-3 text-[11.5px] text-muted-foreground font-mono whitespace-nowrap">
                    {record.formatted_time}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-medium truncate" title={record.session_title}>
                    {record.session_title}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20 text-[11px] font-medium">
                      {record.topic}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground group-hover:text-foreground transition-colors">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="truncate">&ldquo;{record.preview}&rdquo;</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-[#f5a623]" />
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono">
                    <div className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-[#f5a623] text-[#f5a623]" />
                      <span className="font-semibold text-foreground">{record.rating}</span>
                      <span className="text-[10px] text-muted-foreground">/4</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {renderCorrectnessBadge(record.status)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-[12px] text-muted-foreground">
                    {record.response_time !== null ? `${record.response_time}s` : "—"}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {record.feedback_status === "up" ? (
                      <ThumbsUp className="h-3.5 w-3.5 text-[#f5a623] inline-block" />
                    ) : record.feedback_status === "down" ? (
                      <ThumbsDown className="h-3.5 w-3.5 text-zinc-400 inline-block" />
                    ) : (
                      <span className="text-muted-foreground/40">&mdash;</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-10 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="h-7 w-7 text-muted-foreground/40" />
                    <p className="text-[13px] font-medium text-foreground">
                      No matching reply records found
                    </p>
                    <p className="text-[12px] text-muted-foreground max-w-sm">
                      {searchTerm || correctnessFilter !== "all" || topicFilter !== "all"
                        ? "Try adjusting your filters or search terms."
                        : "Assistant replies that receive human feedback will populate this table."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border/60 text-[12px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Rows per page"
              className="px-2 py-1 rounded-lg border border-border bg-background/60 text-foreground text-[12px] cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>
              Showing {(safeCurrentPage - 1) * pageSize + 1} &ndash;{" "}
              {Math.min(safeCurrentPage * pageSize, sortedData.length)} of {sortedData.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 p-0 rounded-lg border-border"
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-foreground font-mono">
              {safeCurrentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 p-0 rounded-lg border-border"
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Detail Modal */}
      <FeedbackDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
};
