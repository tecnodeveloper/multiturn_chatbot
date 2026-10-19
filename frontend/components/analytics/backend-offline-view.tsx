"use client";

import { FC, useState } from "react";
import {
  ServerOff,
  RotateCw,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
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
  healthDetails,
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
        "Connection attempt completed, but backend services remain unreachable. Please verify server status below."
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
          setRetryFailedNotice(
            "Health check re-probed: Python backend at http://localhost:5000 is still offline."
          );
        }
      } else {
        await handleRetryClick();
      }
    } catch {
      setRetryFailedNotice("Health check probe failed.");
    } finally {
      setLocalRetrying(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center py-12 px-4 max-w-4xl mx-auto animate-in fade-in-50 duration-200">
      <div className="w-full bg-card rounded-3xl border border-border p-8 sm:p-12 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle orange accent glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-[#f5a623]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11.5px] font-semibold tracking-wider uppercase border border-red-500/30 bg-red-500/10 text-red-500 mb-6">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          BACKEND OFFLINE
        </div>

        {/* Service Offline Icon */}
        <div className="relative mb-6">
          <div className="p-5 rounded-3xl bg-muted/40 border border-border shadow-inner text-muted-foreground flex items-center justify-center">
            <ServerOff className="h-10 w-10 text-amber-500/90" />
          </div>
          <span className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-card border border-border text-red-500 shadow-sm">
            <AlertTriangle className="h-4 w-4" />
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight max-w-xl leading-tight">
          Analytics services are currently unavailable
        </h2>

        {/* Supporting Text */}
        <p className="text-[14px] text-muted-foreground mt-3 max-w-lg leading-relaxed">
          The backend analytics service is not responding and metrics cannot currently be refreshed. Stale or synthetic data has been suppressed to prevent misleading information.
        </p>

        {/* Failure message if retrying did not restore connectivity */}
        {retryFailedNotice && (
          <div className="mt-5 w-full max-w-lg p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[12.5px] flex items-center gap-2 text-left animate-in fade-in-50">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{retryFailedNotice}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full sm:w-auto">
          <Button
            onClick={handleRetryClick}
            disabled={retrying}
            className="w-full sm:w-auto min-w-[180px] h-11 px-6 rounded-xl bg-[#f5a623] hover:bg-[#e09612] text-[#0f1117] font-semibold text-[13px] shadow-md shadow-[#f5a623]/20 transition-all duration-150 active:scale-[0.98] gap-2"
          >
            <RotateCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
            <span>{retrying ? "Checking connectivity..." : "Retry Connection"}</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleRefreshClick}
            disabled={retrying}
            className="w-full sm:w-auto h-11 px-5 rounded-xl border-border hover:bg-muted/40 text-muted-foreground hover:text-foreground text-[13px] font-medium transition-colors"
          >
            Refresh Status
          </Button>
        </div>

        {/* Service Subsystem Health Diagnostic Matrix */}
        {healthDetails && (
          <div className="mt-8 w-full max-w-md pt-6 border-t border-border">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Subsystem Verification
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border flex flex-col items-center gap-1">
                <span className="text-[11px] text-muted-foreground">API Server</span>
                {healthDetails.api ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border flex flex-col items-center gap-1">
                <span className="text-[11px] text-muted-foreground">Chart Engine</span>
                {healthDetails.chart_service ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border flex flex-col items-center gap-1">
                <span className="text-[11px] text-muted-foreground">Database</span>
                {healthDetails.data_source ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Troubleshooting Hint Box */}
        <div className="mt-8 w-full max-w-lg p-4 rounded-2xl bg-muted/20 border border-border text-left">
          <div className="flex items-center gap-2 mb-2 text-foreground font-medium text-[12.5px]">
            <HelpCircle className="h-4 w-4 text-[#f5a623]" />
            <span>Troubleshooting hints</span>
          </div>
          <ul className="text-[12px] text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>
              Ensure the Python backend server is running in <code className="text-[#f5a623] bg-muted/40 px-1 py-0.5 rounded font-mono text-[11px]">backend/</code> with: <code className="text-foreground font-mono text-[11px]">uv run python app.py</code>
            </li>
            <li>
              Verify port 5000 is open and reachable at <code className="text-foreground font-mono text-[11px]">http://localhost:5000/health</code>
            </li>
            <li>
              Confirm Supabase local instance is running (<code className="text-foreground font-mono text-[11px]">127.0.0.1:54321</code>) for database queries.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
