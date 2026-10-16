"use client";

import { FC } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, Clock, RotateCw, Layers, MessageSquare, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface AnalyticsHeaderProps {
  viewMode?: "this_session" | "all_sessions";
  onViewModeChange?: (mode: "this_session" | "all_sessions") => void;
  activeSessionTitle?: string;
  onRefresh?: () => void | Promise<void>;
}

export function AnalyticsHeader({
  viewMode = "all_sessions",
  onViewModeChange,
  activeSessionTitle,
  onRefresh,
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
        {/* Left Zone — Navigation */}
        <div className="flex items-center z-10 min-w-[100px] sm:min-w-[160px]">
          <Link
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-normal border border-border bg-background/50 hover:bg-muted/40 hover:border-border text-muted-foreground hover:text-foreground transition-all duration-150 active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5 text-muted-foreground group-hover:text-foreground" />
            <span className="hidden sm:inline font-normal">Back to dashboard</span>
            <span className="sm:hidden font-normal">Dashboard</span>
          </Link>
        </div>

        {/* Center Zone — Page Identity */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 flex-col items-center justify-center text-center pointer-events-none max-w-md">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-[#f5a623]/10 text-[#f5a623] shrink-0">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h1 className="text-[18px] sm:text-[20px] font-medium text-foreground tracking-tight whitespace-nowrap">
              Response analytics
            </h1>
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f5a623] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#f5a623]" />
            </span>
            <p className="text-[12px] font-normal text-muted-foreground whitespace-nowrap">
              Live performance & user feedback insights
            </p>
          </div>
        </div>

        {/* Right Zone — Session Scope Dropdown & Controls */}
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

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[12px] font-normal border border-border bg-background/50 text-muted-foreground hidden sm:inline-flex">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-normal">Live</span>
          </div>

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
