/**
 * TypeScript Definitions for Phase 3 Sessions Analytics Module
 * Multi-Turn AI Chatbot Analytics (FR7, FR10, FR14, FR16, FR17, FR21, FR22)
 */

export interface SessionPhaseMetrics {
  phase: "Start" | "Middle" | "End";
  label: string;
  turns_range: string;
  assistant_responses: number;
  evaluated_responses: number;
  correct: number;
  partial: number;
  incorrect: number;
  accuracy: number | null; // null if 0 evaluations
  average_rating: number | null;
  average_response_time: number | null;
}

export interface SessionTimelineFeedback {
  id: string;
  rating: number; // 1 to 4
  correctness: "correct" | "partial" | "incorrect";
  status: "Correct" | "Partial" | "Incorrect";
  length_type: "short" | "to_the_point" | "lengthy";
  comment?: string;
  created_at: string;
}

export interface SessionTimelineItem {
  message_id: string;
  turn_index: number;
  timestamp: string;
  formatted_time: string;
  role: "user" | "assistant";
  content: string;
  preview: string;
  response_time: number | null; // in seconds
  session_phase: "start" | "middle" | "end";
  feedback?: SessionTimelineFeedback | null;
}

export interface SessionPerformanceSummary {
  total_assistant: number;
  total_evaluated: number;
  correct: number;
  partial: number;
  incorrect: number;
  accuracy: number | null;
  average_rating: number | null;
  rating_distribution: Record<number, number>; // 1: n, 2: n, 3: n, 4: n
  length_preference: {
    short: number;
    to_the_point: number;
    lengthy: number;
  };
  response_time: {
    min: number | null;
    max: number | null;
    avg: number | null;
    median: number | null;
    count: number;
  };
}

export interface PermanentAnalyticsSummaryRecord {
  id: string;
  chat_id: string;
  created_at: string;
  summary_data: {
    total_messages?: number;
    total_user_messages?: number;
    total_assistant_responses?: number;
    total_evaluated_replies?: number;
    accuracy_rate?: number;
    average_rating?: number;
    average_response_time?: number;
    duration_seconds?: number;
    duration_formatted?: string;
    finalized_at?: string;
    [key: string]: any;
  };
}

export interface SessionRecord {
  id: string; // chat_id
  session_id?: string; // alias for id
  title: string;
  created_at: string;
  started_formatted: string;
  last_activity: string;
  last_activity_formatted: string;
  duration_seconds: number;
  duration_formatted: string;
  user_messages_count: number;
  assistant_responses_count: number;
  evaluated_responses_count: number;
  accuracy: number | null;
  average_rating: number | null;
  average_response_time: number | null;
  status: "active" | "completed" | "inactive";
  is_finalized: boolean;
  finalized_at?: string;
  pending_feedback_count: number;
  phases: SessionPhaseMetrics[];
  performance: SessionPerformanceSummary;
  timeline: SessionTimelineItem[];
  summary?: PermanentAnalyticsSummaryRecord | null;
}

export interface SessionsOverviewKPIs {
  total_sessions: number;
  total_assistant_responses: number;
  total_evaluated_responses: number;
  average_session_accuracy: number | null; // weighted across evaluated replies
  average_response_time: number | null; // in seconds
  average_session_duration_seconds: number;
  average_session_duration_formatted: string;
}

export interface SessionInsight {
  id: string;
  type: "success" | "warning" | "info" | "neutral" | "danger";
  title: string;
  description: string;
  metric?: string;
  metric_label?: string;
  metric_value?: string;
}

export interface AnalyticsSessionsPayload {
  kpis: SessionsOverviewKPIs;
  sessions: SessionRecord[];
  selected_session?: SessionRecord | null;
  insights: SessionInsight[];
}
