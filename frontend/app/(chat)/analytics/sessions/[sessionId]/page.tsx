"use client";

import { use } from "react";
import AnalyticsPage from "../../page";

interface SessionIdRouteProps {
  params: Promise<{
    sessionId: string;
  }>;
}

export default function AnalyticsSessionDetailRoute({ params }: SessionIdRouteProps) {
  const resolvedParams = use(params);
  return <AnalyticsPage initialTab="sessions" initialSessionId={resolvedParams.sessionId} />;
}
