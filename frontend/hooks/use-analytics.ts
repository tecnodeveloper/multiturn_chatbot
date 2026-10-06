"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";

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
}

export function useAnalytics() {
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (authLoading) return;
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const userQuery = `?user_id=${user.id}`;
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
  };

  useEffect(() => {
    if (authLoading) return;
    fetchData();
    // Live auto-refresh polling every 5 seconds for real-time analytics updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [user?.id, authLoading]);

  return { data, loading, error, refetch: fetchData };
}

