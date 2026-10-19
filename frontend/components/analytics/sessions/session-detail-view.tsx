"use client";

import { FC, useState } from "react";
import {
  MessageSquare,
  Bot,
  User,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Send,
  Loader2,
  Info,
} from "lucide-react";
import { SessionRecord, SessionTimelineItem } from "@/types/analytics-sessions";
import { Button } from "@/components/ui/button";
import { FeedbackDetailModal } from "../feedback-detail-modal";
import { toast } from "sonner";

interface SessionDetailViewProps {
  session: SessionRecord;
  onSessionFinalized?: () => void;
  isLoading?: boolean;
}

export const SessionDetailView: FC<SessionDetailViewProps> = ({
  session,
  onSessionFinalized,
  isLoading = false,
}) => {
  const [expandedMessageIds, setExpandedMessageIds] = useState<Set<string>>(new Set());
  const [selectedFeedbackModal, setSelectedFeedbackModal] = useState<any | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedMessageIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFinalizeSession = async (allowPartial = false) => {
    setIsFinalizing(true);
    try {
      const res = await fetch("/api/analytics/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: session.id,
          allow_partial: allowPartial,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requires_feedback) {
          toast.error(
            data.error || "Cannot finalize session: required feedback evaluation is pending."
          );
        } else {
          toast.error(data.error || "Failed to finalize session summary");
        }
        return;
      }

      toast.success(
        "Session successfully finalized! Permanent analytics summary recorded (FR22)."
      );
      setShowFinalizeConfirm(false);
      if (onSessionFinalized) {
        onSessionFinalized();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to communicate with analytics server");
    } finally {
      setIsFinalizing(false);
    }
  };

  const getCorrectnessBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "correct":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            Correct
          </span>
        );
      case "partial":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30">
            Partial
          </span>
        );
      case "incorrect":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Incorrect
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-muted-foreground bg-muted/30 border border-border">
            Pending feedback
          </span>
        );
    }
  };

  const getPhaseBadge = (phase: string) => {
    switch (phase.toLowerCase()) {
      case "start":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Start Phase (Turns 1–2)
          </span>
        );
      case "middle":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20">
            Middle Phase (Turns 3–5)
          </span>
        );
      case "end":
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            End Phase (Turns 6+)
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-64 bg-muted/40 rounded" />
        <div className="h-28 w-full bg-muted/20 rounded-xl" />
        <div className="h-44 w-full bg-muted/10 rounded-xl" />
      </div>
    );
  }

  const perf = session.performance;
  const isFinalized = session.is_finalized || session.status === "completed";

  return (
    <div
      id="session-detail-view"
      className="flex flex-col gap-8 w-full scroll-mt-24 animate-in fade-in-50 duration-200"
    >
      {/* Top Banner & Finalization Controller */}
      <div className="bg-card rounded-2xl border border-border p-6 sm:p-7 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25 shrink-0">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">
                {session.title}
              </h2>
              {isFinalized ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <FileCheck className="h-3.5 w-3.5" />
                  Finalized Session (FR22)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
                  Active Session
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-[12px] text-muted-foreground flex-wrap mt-0.5">
              <span>
                Started: <strong className="text-foreground font-mono">{session.started_formatted}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Last Activity: <strong className="text-foreground font-mono">{session.last_activity_formatted}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Duration: <strong className="text-foreground font-mono">{session.duration_formatted}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Action: Finalize Session (FR22) */}
        <div className="shrink-0 flex items-center gap-3 self-stretch sm:self-auto">
          {!isFinalized ? (
            <Button
              onClick={() => setShowFinalizeConfirm(true)}
              disabled={isFinalizing}
              className="gap-2 rounded-xl bg-[#f5a623] hover:bg-[#e09612] text-[#06080d] font-semibold text-[12.5px] shadow-sm w-full sm:w-auto"
            >
              {isFinalizing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileCheck className="h-4 w-4" />
              )}
              End & Finalize Session (FR22)
            </Button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[12px] font-medium">
              <ShieldCheck className="h-4 w-4" />
              Summary Saved to Database
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Finalization */}
      {showFinalizeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#f5a623]/15 text-[#f5a623] shrink-0">
                <FileCheck className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-[16px] font-semibold text-foreground">
                  Finalize Session Analytics (FR22)
                </h3>
                <p className="text-[12.5px] text-muted-foreground leading-relaxed">
                  This will calculate permanent performance summaries (accuracy rate, average latency, rating distribution) and record them in the database&apos;s <code className="text-[#f5a623] font-mono">analytics_summary</code> table.
                </p>
              </div>
            </div>

            {session.pending_feedback_count > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-[12px] text-amber-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <p>
                  This session has <strong>{session.pending_feedback_count} unevaluated assistant turn(s)</strong>. Mandatory feedback must be submitted on the latest turn before finalizing, or you may archive with partial evaluations.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFinalizeConfirm(false)}
                className="rounded-lg text-[12px] border-border text-muted-foreground"
              >
                Cancel
              </Button>
              {session.pending_feedback_count > 0 ? (
                <Button
                  size="sm"
                  onClick={() => handleFinalizeSession(true)}
                  disabled={isFinalizing}
                  className="rounded-lg bg-[#f5a623] hover:bg-[#e09612] text-[#06080d] font-semibold text-[12px]"
                >
                  {isFinalizing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Finalize with Partial Feedback
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleFinalizeSession(false)}
                  disabled={isFinalizing}
                  className="rounded-lg bg-[#f5a623] hover:bg-[#e09612] text-[#06080d] font-semibold text-[12px]"
                >
                  {isFinalizing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
                  Confirm & Finalize
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Section A: Session Performance Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl border border-border p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[11.5px] text-muted-foreground">Session Accuracy</span>
          <div className="my-1">
            <span
              className={`text-[24px] font-bold font-mono ${
                perf.accuracy !== null ? "text-[#f5a623]" : "text-muted-foreground"
              }`}
            >
              {perf.accuracy !== null ? `${perf.accuracy}%` : "—"}
            </span>
          </div>
          <span className="text-[10.5px] text-muted-foreground/75">
            {perf.correct} Correct &bull; {perf.partial} Partial &bull; {perf.incorrect} Incorrect
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[11.5px] text-muted-foreground">Average Human Rating</span>
          <div className="my-1">
            <span className="text-[24px] font-bold font-mono text-foreground flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-[#f5a623] text-[#f5a623]" />
              {perf.average_rating !== null ? `${perf.average_rating} / 4` : "—"}
            </span>
          </div>
          <span className="text-[10.5px] text-muted-foreground/75">
            Strict 1–4 point human rating scale
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[11.5px] text-muted-foreground">Average Generation Latency</span>
          <div className="my-1">
            <span className="text-[24px] font-bold font-mono text-foreground">
              {perf.response_time.avg !== null ? `${perf.response_time.avg}s` : "—"}
            </span>
          </div>
          <span className="text-[10.5px] text-muted-foreground/75">
            Min: {perf.response_time.min ?? "—"}s &bull; Max: {perf.response_time.max ?? "—"}s
          </span>
        </div>

        <div className="bg-card rounded-2xl border border-border p-4 flex flex-col justify-between shadow-sm">
          <span className="text-[11.5px] text-muted-foreground">Messages & Feedback</span>
          <div className="my-1">
            <span className="text-[24px] font-bold font-mono text-foreground">
              {session.timeline.length} msgs
            </span>
          </div>
          <span className="text-[10.5px] text-muted-foreground/75">
            {perf.total_evaluated} of {perf.total_assistant} assistant replies evaluated
          </span>
        </div>
      </div>

      {/* Section B: Session Phase Analysis (FR16 & FR17) */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#f5a623]" />
              <h3 className="text-[15px] font-medium text-foreground tracking-tight">
                Session Phase Analysis
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-muted/50 text-muted-foreground border border-border">
                FR16 / FR17
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Conversational progression across Start (turns 1–2), Middle (turns 3–5), and End (turns 6+)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px] border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-medium">
                <th className="py-2.5 px-3">Conversation Phase</th>
                <th className="py-2.5 px-3">Turn Range</th>
                <th className="py-2.5 px-3 text-center">Asst Responses</th>
                <th className="py-2.5 px-3 text-center">Evaluated</th>
                <th className="py-2.5 px-3 text-center">Correct</th>
                <th className="py-2.5 px-3 text-center">Partial</th>
                <th className="py-2.5 px-3 text-center">Incorrect</th>
                <th className="py-2.5 px-3 text-right">Accuracy Rate</th>
                <th className="py-2.5 px-3 text-center">Avg Rating</th>
                <th className="py-2.5 px-3 text-right">Avg Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {session.phases.map((p) => {
                const hasEvals = p.evaluated_responses > 0 && p.accuracy !== null;
                return (
                  <tr key={p.phase} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-3 font-semibold text-foreground">
                      {p.label}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-mono text-[11px]">
                      {p.turns_range}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{p.assistant_responses}</td>
                    <td className="py-3 px-3 text-center font-mono font-semibold text-foreground">
                      {p.evaluated_responses}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-400">
                      {p.correct}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-amber-400">
                      {p.partial}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-rose-400">
                      {p.incorrect}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {hasEvals ? (
                        <span className="text-[#f5a623]">{p.accuracy}%</span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {p.average_rating !== null ? (
                        <span className="text-[#f5a623] font-semibold">{p.average_rating}</span>
                      ) : (
                        <span className="text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {p.average_response_time !== null ? `${p.average_response_time}s` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section C: Conversation Timeline */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#f5a623]" />
              <h3 className="text-[15px] font-medium text-foreground tracking-tight">
                Conversation Timeline
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-muted/50 text-muted-foreground border border-border">
                {session.timeline.length} Messages
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Turn-by-turn chronological transcript, response generation latencies, and human feedback evaluations
            </p>
          </div>
        </div>

        {/* Timeline Message Cards */}
        <div className="flex flex-col gap-3">
          {session.timeline.map((msg, idx) => {
            const isUser = msg.role === "user";
            const isExpanded = expandedMessageIds.has(msg.message_id);

            return (
              <div
                key={msg.message_id || idx}
                className={`p-4 rounded-xl border transition-all ${
                  isUser
                    ? "bg-muted/15 border-border/80"
                    : "bg-[#12141c] border-border hover:border-[#f5a623]/30"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isUser
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20"
                      }`}
                    >
                      {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <span className="font-semibold text-foreground text-[12.5px]">
                      {isUser ? "User Prompt" : `Assistant Response (Turn #${msg.turn_index})`}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {msg.formatted_time}
                    </span>
                  </div>

                  {/* Metadata Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {msg.session_phase && getPhaseBadge(msg.session_phase)}

                    {!isUser && msg.response_time !== null && (
                      <span className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-medium bg-muted/40 text-foreground border border-border flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {msg.response_time}s
                      </span>
                    )}

                    {!isUser && msg.feedback && (
                      <div className="flex items-center gap-1.5">
                        {getCorrectnessBadge(msg.feedback.status)}
                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-semibold bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/25 flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 fill-[#f5a623]" />
                          {msg.feedback.rating}/4
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Content */}
                <div className="mt-2 text-[12.5px] text-foreground/90 leading-relaxed">
                  {isExpanded ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div>{msg.preview}</div>
                  )}
                </div>

                {/* Footer Controls: Expand & Feedback Details */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50 text-[11px]">
                  {msg.content.length > 110 ? (
                    <button
                      onClick={() => toggleExpand(msg.message_id)}
                      className="text-[#f5a623] hover:underline flex items-center gap-1 font-medium select-none"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3" /> Show less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" /> Show full response
                        </>
                      )}
                    </button>
                  ) : (
                    <span />
                  )}

                  {!isUser && msg.feedback && (
                    <button
                      onClick={() =>
                        setSelectedFeedbackModal({
                          id: msg.feedback?.id,
                          user_query: "Turn prompt",
                          model_response: msg.content,
                          rating: msg.feedback?.rating,
                          status: msg.feedback?.status,
                          correctness: msg.feedback?.correctness,
                          length_type: msg.feedback?.length_type,
                          time: msg.formatted_time,
                          comment: msg.feedback?.comment,
                        })
                      }
                      className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" /> View evaluation details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section D: Permanent Analytics Summary Card (FR22) */}
      {session.summary && (
        <div className="bg-[#12141c] rounded-2xl border border-emerald-500/30 shadow-lg p-5 sm:p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-[14.5px] font-semibold text-foreground">
                Permanent Analytics Summary Record (FR22)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              Finalized: {new Date(session.summary.created_at).toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px] pt-1">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[11px]">Session ID:</span>
              <span className="font-mono text-foreground truncate">{session.summary.chat_id}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[11px]">Accuracy Rate:</span>
              <span className="font-mono text-[#f5a623] font-bold">
                {session.summary.summary_data?.accuracy_rate ?? "—"}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[11px]">Average Latency:</span>
              <span className="font-mono text-foreground font-semibold">
                {session.summary.summary_data?.average_response_time ?? "—"}s
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[11px]">Evaluated Turns:</span>
              <span className="font-mono text-foreground font-semibold">
                {session.summary.summary_data?.total_evaluated_replies ?? "—"} / {session.summary.summary_data?.total_assistant_responses ?? "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Feedback Detail Modal */}
      {selectedFeedbackModal && (
        <FeedbackDetailModal
          item={selectedFeedbackModal}
          isOpen={Boolean(selectedFeedbackModal)}
          onClose={() => setSelectedFeedbackModal(null)}
        />
      )}
    </div>
  );
};
