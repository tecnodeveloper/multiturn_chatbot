"use client";

import React, { FC, useState, useMemo } from "react";
import {
  Table2,
  Search,
  ArrowUpDown,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
} from "lucide-react";
import type { TopicMetricsRecord } from "@/types/analytics-topics";
import { Input } from "@/components/ui/input";

interface TopicPerformanceTableProps {
  topics: TopicMetricsRecord[];
  isLoading?: boolean;
}

type SortField =
  | "topic"
  | "total_ai"
  | "evaluated"
  | "strict_accuracy"
  | "helpfulness"
  | "rating"
  | "coverage";
type SortOrder = "asc" | "desc";

export const TopicPerformanceTable: FC<TopicPerformanceTableProps> = ({
  topics = [],
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("total_ai");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [filterCoverageOnly, setFilterCoverageOnly] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const filteredTopics = useMemo(() => {
    let result = [...topics];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((t) => t.topic.toLowerCase().includes(q));
    }

    if (filterCoverageOnly) {
      result = result.filter((t) => t.evaluated_responses > 0);
    }

    result.sort((a, b) => {
      let aVal: any = 0;
      let bVal: any = 0;

      switch (sortField) {
        case "topic":
          return sortOrder === "asc"
            ? a.topic.localeCompare(b.topic)
            : b.topic.localeCompare(a.topic);
        case "total_ai":
          aVal = a.total_ai_responses;
          bVal = b.total_ai_responses;
          break;
        case "evaluated":
          aVal = a.evaluated_responses;
          bVal = b.evaluated_responses;
          break;
        case "strict_accuracy":
          aVal = a.strict_accuracy ?? -1;
          bVal = b.strict_accuracy ?? -1;
          break;
        case "helpfulness":
          aVal = a.helpfulness ?? -1;
          bVal = b.helpfulness ?? -1;
          break;
        case "rating":
          aVal = a.average_rating ?? -1;
          bVal = b.average_rating ?? -1;
          break;
        case "coverage":
          aVal = a.feedback_coverage;
          bVal = b.feedback_coverage;
          break;
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [topics, searchTerm, sortField, sortOrder, filterCoverageOnly]);

  return (
    <div className="bg-[#161821] rounded-2xl border border-[#1f2937] p-6 shadow-sm">
      {/* Table Header and Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/25">
              <Table2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              Topic Performance Breakdown (FR15)
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Comprehensive evaluation metrics across all 5 supported domains and unclassified conversations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-xs bg-[#06080d] border-[#1f2937] text-white focus-visible:ring-[#f5a623]"
            />
          </div>

          {/* Evaluated Only Filter */}
          <button
            onClick={() => setFilterCoverageOnly((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterCoverageOnly
                ? "bg-[#f5a623]/15 text-[#f5a623] border-[#f5a623]/30"
                : "bg-[#06080d] text-gray-400 border-[#1f2937] hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" /> Evaluated Only
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto rounded-xl border border-[#1f2937]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1f2937] bg-[#06080d]/80 text-gray-400 uppercase font-semibold text-[11px] tracking-wider select-none">
              <th className="py-3 px-4">
                <button
                  onClick={() => handleSort("topic")}
                  className="flex items-center gap-1 hover:text-white"
                >
                  Topic Domain
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort("total_ai")}
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  AI Responses
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort("evaluated")}
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  Evaluated
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-center">Correct / Partial / Incorrect</th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort("strict_accuracy")}
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  Strict Accuracy
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort("helpfulness")}
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  Helpfulness
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-3 text-right">
                <button
                  onClick={() => handleSort("rating")}
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  Avg Rating
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort("coverage")}
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  Coverage
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937] text-gray-300">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={8} className="py-4 px-4">
                    <div className="h-4 bg-gray-700/30 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : filteredTopics.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-gray-400">
                  No matching topic records found.
                </td>
              </tr>
            ) : (
              filteredTopics.map((row, idx) => {
                const hasEvals = row.evaluated_responses > 0;

                return (
                  <tr
                    key={idx}
                    className="hover:bg-[#06080d]/40 transition-colors"
                  >
                    {/* Topic Domain */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: row.color }}
                        />
                        <span className="font-medium text-white">{row.topic}</span>
                      </div>
                    </td>

                    {/* Total AI Responses */}
                    <td className="py-3.5 px-3 text-right font-mono text-gray-200">
                      {row.total_ai_responses}
                    </td>

                    {/* Evaluated Responses */}
                    <td className="py-3.5 px-3 text-right font-mono text-gray-200">
                      {row.evaluated_responses}
                    </td>

                    {/* Correct / Partial / Incorrect Badge Strip */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
                        <span
                          className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                          title="Correct responses"
                        >
                          {row.correct}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25"
                          title="Partially correct responses"
                        >
                          {row.partial}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/25"
                          title="Incorrect responses"
                        >
                          {row.incorrect}
                        </span>
                      </div>
                    </td>

                    {/* Strict Accuracy */}
                    <td className="py-3.5 px-3 text-right font-mono font-medium">
                      {hasEvals && row.strict_accuracy !== null ? (
                        <span
                          className={
                            row.strict_accuracy >= 70
                              ? "text-emerald-400"
                              : row.strict_accuracy >= 40
                              ? "text-amber-400"
                              : "text-rose-400"
                          }
                        >
                          {row.strict_accuracy}%
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">N/A</span>
                      )}
                    </td>

                    {/* Helpfulness */}
                    <td className="py-3.5 px-3 text-right font-mono font-medium">
                      {hasEvals && row.helpfulness !== null ? (
                        <span className="text-teal-400">{row.helpfulness}%</span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">N/A</span>
                      )}
                    </td>

                    {/* Average Rating */}
                    <td className="py-3.5 px-3 text-right font-mono">
                      {row.average_rating !== null ? (
                        <span className="inline-flex items-center gap-1 text-[#f5a623]">
                          <Star className="w-3 h-3 fill-[#f5a623]" />
                          {row.average_rating.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">N/A</span>
                      )}
                    </td>

                    {/* Feedback Coverage */}
                    <td className="py-3.5 px-4 text-right font-mono">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="w-12 bg-[#06080d] rounded-full h-1.5 overflow-hidden border border-[#1f2937]">
                          <div
                            className="bg-[#f5a623] h-full rounded-full"
                            style={{ width: `${Math.min(row.feedback_coverage, 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-300 text-[11px] w-9 text-right">
                          {row.feedback_coverage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mt-4 text-[11px] text-gray-500">
        <span>Strict Accuracy = Correct / Evaluated × 100 · Helpfulness = (Correct + Partial) / Evaluated × 100</span>
        <span>Coverage = Evaluated / Total AI responses × 100</span>
      </div>
    </div>
  );
};
