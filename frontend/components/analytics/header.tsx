"use client";

import { BarChart3, RotateCw, Layers, MessageSquare, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BackendHealthStatus } from "@/hooks/use-analytics";

export interface AnalyticsHeaderProps {
  viewMode?: "this_session" | "all_sessions";
  onViewModeChange?: (mode: "this_session" | "all_sessions") => void;
  activeSessionTitle?: string;
  onRefresh?: () => void | Promise<void>;
  backendHealth?: BackendHealthStatus;
  onRetryHealth?: () => void | Promise<void>;
}

export function AnalyticsHeader({
  viewMode = "all_sessions",
  onViewModeChange,
  activeSessionTitle,
  onRefresh,
  backendHealth = "checking",
  onRetryHealth,
}: AnalyticsHeaderProps) {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      return;
    }
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="relative flex items-center justify-between px-4 sm:px-8 py-3.5 max-w-[1600px] mx-auto w-full min-h-[64px]">
        {/* Left Zone — Page Identity */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="p-1.5 rounded-xl bg-[#f5a623]/10 text-[#f5a623] shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[17px] sm:text-[19px] font-medium text-foreground tracking-tight whitespace-nowrap">
              Response analytics
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f5a623] opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f5a623]" />
              </span>
              <p className="text-[12px] font-normal text-muted-foreground hidden sm:block whitespace-nowrap">
                Live performance & user feedback insights
              </p>
            </div>
          </div>
        </div>

        {/* Right Zone — Session Scope Dropdown & Live Mode Controls */}
        <div className="flex items-center justify-end gap-2.5 z-10">
          {onViewModeChange && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 rounded-xl border-border bg-background/60 hover:bg-muted/50 hover:border-[#f5a623]/40 px-3 text-[12.5px] font-medium text-foreground shadow-sm transition-all"
                >
                  {viewMode === "this_session" ? (
                    <MessageSquare className="h-3.5 w-3.5 text-[#f5a623]" />
                  ) : (
                    <Layers className="h-3.5 w-3.5 text-[#f5a623]" />
                  )}
                  <span className="font-medium whitespace-nowrap">
                    {viewMode === "this_session" ? "This Session" : "All Sessions"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-0.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 bg-card border-border text-foreground p-1.5 shadow-xl">
                <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Analytics Scope
                </DropdownMenuLabel>
                
                <DropdownMenuItem
                  onClick={() => onViewModeChange("this_session")}
                  className={`flex items-start justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    viewMode === "this_session"
                      ? "bg-[#f5a623]/15 text-[#f5a623] font-medium"
                      : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-medium flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-[#f5a623]" />
                      This Session
                    </span>
                    <span className="text-[11px] text-muted-foreground max-w-[180px] truncate">
                      {activeSessionTitle ? `Active: ${activeSessionTitle}` : "Active chat session"}
                    </span>
                  </div>
                  {viewMode === "this_session" && (
                    <Check className="h-4 w-4 text-[#f5a623] shrink-0 mt-0.5" />
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onViewModeChange("all_sessions")}
                  className={`flex items-start justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors mt-1 ${
                    viewMode === "all_sessions"
                      ? "bg-[#f5a623]/15 text-[#f5a623] font-medium"
                      : "text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-medium flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-[#f5a623]" />
                      All Sessions
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Aggregated user analytics
                    </span>
                  </div>
                  {viewMode === "all_sessions" && (
                    <Check className="h-4 w-4 text-[#f5a623] shrink-0 mt-0.5" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Backend Health / Live Mode Status Indicator */}
          {backendHealth === "checking" && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[12px] font-medium border border-amber-500/30 bg-amber-500/10 text-amber-500"
              title="Checking Python backend and chart services..."
            >
              <RotateCw className="h-3 w-3 animate-spin text-amber-500" />
              <span className="font-semibold tracking-wide">CHECKING</span>
            </div>
          )}

          {backendHealth === "healthy" && (
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[12px] font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              title="Backend and chart services operational — Live Mode ON"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold tracking-wide">LIVE ON</span>
            </div>
          )}

          {backendHealth === "unhealthy" && (
            <div className="inline-flex items-center gap-2">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[12px] font-medium border border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                title="Python backend or chart service offline — Live Mode OFF"
              >
                <span className="h-2 w-2 rounded-full bg-zinc-400" />
                <span className="font-semibold tracking-wide">LIVE OFF</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onRetryHealth || handleRefresh}
                className="h-8 gap-1.5 px-2.5 rounded-xl border-border text-xs text-muted-foreground hover:text-foreground shadow-sm"
                title="Retry backend health check"
              >
                <RotateCw className="h-3 w-3" />
                <span>Retry</span>
              </Button>
            </div>
          )}

          <button
            onClick={handleRefresh}
            title="Refresh analytics data"
            aria-label="Refresh analytics data"
            className="p-2 rounded-xl border border-border bg-background/50 hover:bg-muted/40 hover:text-foreground text-muted-foreground transition-all duration-150 active:scale-[0.98]"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
