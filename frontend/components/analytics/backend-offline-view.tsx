"use client";

import { FC, useState } from "react";
import { ServerOff, RotateCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackendHealthDetails } from "@/hooks/use-analytics";

interface BackendOfflineViewProps {
  onRetry: () => Promise<void> | void;
  onRefreshStatus?: () => Promise<boolean | void> | void;
  isRetrying?: boolean;
  healthDetails?: BackendHealthDetails;
}

export const BackendOfflineView: FC<BackendOfflineViewProps> = ({
  onRetry,
  onRefreshStatus,
  isRetrying = false,
}) => {
  const [retryFailedNotice, setRetryFailedNotice] = useState<string | null>(null);
  const [localRetrying, setLocalRetrying] = useState(false);

  const retrying = isRetrying || localRetrying;

  const handleRetryClick = async () => {
    setRetryFailedNotice(null);
    setLocalRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      }
    } catch {
      setRetryFailedNotice(
        "Connection attempt failed. The analytics service is currently unreachable."
      );
    } finally {
      setLocalRetrying(false);
    }
  };

  const handleRefreshClick = async () => {
    setRetryFailedNotice(null);
    setLocalRetrying(true);
    try {
      if (onRefreshStatus) {
        const healthy = await onRefreshStatus();
        if (!healthy) {
          setRetryFailedNotice("Service status checked: analytics engine is still offline.");
        }
      } else {
        await handleRetryClick();
      }
    } catch {
      setRetryFailedNotice("Status check probe failed.");
    } finally {
      setLocalRetrying(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4 max-w-2xl mx-auto animate-in fade-in-50 duration-200">
      <div className="w-full bg-card rounded-3xl border border-border p-8 sm:p-10 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle orange accent glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-20 bg-[#f5a623]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11.5px] font-semibold tracking-wider uppercase border border-amber-500/30 bg-amber-500/10 text-amber-500 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          SERVICE TEMPORARILY UNAVAILABLE
        </div>

        {/* Service Offline Icon */}
        <div className="relative mb-5">
          <div className="p-4 rounded-2xl bg-muted/40 border border-border shadow-inner text-muted-foreground flex items-center justify-center">
            <ServerOff className="h-8 w-8 text-amber-500/90" />
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight max-w-md leading-tight">
          Analytics service is temporarily unavailable
        </h2>

        {/* Supporting Text */}
        <p className="text-[13.5px] text-muted-foreground mt-2.5 max-w-md leading-relaxed">
          Unable to establish connection with the analytics engine. Stale or synthetic metrics have been suppressed to ensure data integrity.
        </p>

        {/* Failure message if retrying did not restore connectivity */}
        {retryFailedNotice && (
          <div className="mt-4 w-full max-w-md p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[12px] flex items-center gap-2 text-left animate-in fade-in-50">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{retryFailedNotice}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-7 w-full sm:w-auto">
          <Button
            onClick={handleRetryClick}
            disabled={retrying}
            className="w-full sm:w-auto min-w-[170px] h-10 px-5 rounded-xl bg-[#f5a623] hover:bg-[#e09612] text-[#0f1117] font-semibold text-[13px] shadow-md shadow-[#f5a623]/20 transition-all duration-150 active:scale-[0.98] gap-2"
          >
            <RotateCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
            <span>{retrying ? "Checking..." : "Retry Connection"}</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleRefreshClick}
            disabled={retrying}
            className="w-full sm:w-auto h-10 px-4 rounded-xl border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground text-[13px] font-medium transition-colors"
          >
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
};
