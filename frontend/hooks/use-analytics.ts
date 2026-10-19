"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/auth-context";

import { AnalyticsTablesPayload } from "@/types/analytics-tables";
import { AnalyticsGraphsPayload } from "@/types/analytics-graphs";
import { AnalyticsSessionsPayload } from "@/types/analytics-sessions";

export * from "@/types/analytics-tables";
export * from "@/types/analytics-graphs";
export * from "@/types/analytics-sessions";

export interface AnalyticsData {
  summary: {
    total_feedback: number;
    average_rating: number;
    last_updated: string;
  };
  stats: {
    ratings: Record<string, number>;
    correctness: Record<string, number>;
    length_distribution: Record<string, number>;
  };
  trends: Array<{
    day: string;
    total: number;
    helpful: number;
    accuracy: number;
  }>;
  recent_feedback: Array<{
    id?: string;
    time: string;
    topic: string;
    preview: string;
    user_query?: string;
    model_response?: string;
    feedback: "up" | "down" | "none";
    status: string;
    rating: number;
    correctness?: string;
    length_type?: string;
  }>;

  topics: Array<{
    cluster: number;
    name?: string;
    keywords: string[];
    count: number;
  }>;

  raw_data_count: number;
  tables?: AnalyticsTablesPayload;
  graphs?: AnalyticsGraphsPayload;
  sessions?: AnalyticsSessionsPayload;
}

export type BackendHealthStatus = "checking" | "healthy" | "unhealthy";

export interface BackendHealthDetails {
  api: boolean;
  chart_service: boolean;
  data_source: boolean;
}

export function useAnalytics(options?: {
  sessionId?: string | null;
  mode?: "this_session" | "all_sessions";
}) {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Specification: Initial state must be "checking" (unknown), never assumed true
  const [backendHealth, setBackendHealth] = useState<BackendHealthStatus>("checking");
  const [healthDetails, setHealthDetails] = useState<BackendHealthDetails>({
    api: false,
    chart_service: false,
    data_source: false,
  });

  const mode = options?.mode || "all_sessions";
  const sessionId = options?.sessionId;
  const healthRef = useRef<BackendHealthStatus>("checking");

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        setBackendHealth("unhealthy");
        healthRef.current = "unhealthy";
        setHealthDetails({ api: false, chart_service: false, data_source: false });
        return false;
      }

      const health = await response.json();
      const isHealthy =
        health.status === "healthy" &&
        health.services?.api === true &&
        health.services?.chart_service === true &&
        health.services?.data_source === true;

      const newStatus = isHealthy ? "healthy" : "unhealthy";
      setBackendHealth(newStatus);
      healthRef.current = newStatus;
      setHealthDetails({
        api: Boolean(health.services?.api),
        chart_service: Boolean(health.services?.chart_service),
        data_source: Boolean(health.services?.data_source),
      });

      return isHealthy;
    } catch {
      setBackendHealth("unhealthy");
      healthRef.current = "unhealthy";
      setHealthDetails({ api: false, chart_service: false, data_source: false });
      return false;
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (authLoading) return;
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const sessionParam = mode === "this_session" && sessionId ? `&session_id=${sessionId}` : "";
      const userQuery = `?user_id=${user.id}${sessionParam}`;
      let response = await fetch(`/api/analytics${userQuery}`);
      
      if (!response.ok) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        try {
          const pyRes = await fetch(`${apiUrl}/api/analytics${userQuery}`);
          if (pyRes.ok) {
            response = pyRes;
          }
        } catch {}
      }

      if (!response.ok) {
        let errMessage = "Don't worry - the analytics module is currently not working.";
        try {
          const errJson = await response.json();
          if (errJson?.message) errMessage = errJson.message;
          else if (errJson?.error) errMessage = errJson.error;
        } catch {}
        throw new Error(errMessage);
      }

      const result = await response.json();
      if (result?.error && !result?.summary) {
        throw new Error(result.message || result.error);
      }

      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Don't worry - the analytics module is currently not working.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.id, mode, sessionId]);

  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setBackendHealth("checking");
    healthRef.current = "checking";
    try {
      const isHealthy = await checkHealth();
      if (isHealthy) {
        await fetchData();
      }
    } finally {
      setIsRetrying(false);
    }
  }, [checkHealth, fetchData]);

  // Initial mount health check & periodic re-check while Analytics is open
  useEffect(() => {
    checkHealth();
    // Re-check health every 6 seconds
    const healthInterval = setInterval(() => {
      checkHealth();
    }, 6000);
    return () => clearInterval(healthInterval);
  }, [checkHealth]);

  // Fetch data on parameters change & live poll every 5s ONLY if backend is healthy
  useEffect(() => {
    if (authLoading) return;
    fetchData();

    // Auto-refresh polling every 5 seconds for live analytics updates
    const pollInterval = setInterval(() => {
      // Only poll live updates if backend health is verified healthy
      if (healthRef.current === "healthy") {
        fetchData();
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [authLoading, fetchData, mode, sessionId]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    backendHealth,
    healthDetails,
    checkHealth,
    handleRetry,
    isRetrying,
  };
}
