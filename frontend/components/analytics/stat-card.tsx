"use client";

import { FC, ReactNode } from "react";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon: ReactNode;
  iconBgColor?: string;
  tooltip?: string;
  isLoading?: boolean;
}

export const StatCard: FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  tooltip,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-4 border border-border animate-pulse">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-xl bg-muted/40" />
        </div>
        <div className="space-y-2">
          <div className="w-24 h-3 rounded bg-muted/40" />
          <div className="w-32 h-8 rounded bg-muted/40" />
          <div className="w-20 h-2.5 rounded bg-muted/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm p-6 flex flex-col gap-4 border border-border transition-all hover:border-[#f5a623]/25">
      <div className="flex justify-between items-start">
        <div className="p-3 rounded-xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20">
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[12px] font-normal text-muted-foreground">
            {trend.isUp ? (
              <TrendingUp className="h-4 w-4 text-[#f5a623]" />
            ) : (
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            )}
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <p className="text-[12.5px] font-normal text-muted-foreground">{title}</p>
          {tooltip && (
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Information about ${title}`}
                    className="text-muted-foreground/60 hover:text-foreground transition-colors"
                  >
                    <Info className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs text-[11.5px] bg-card border-border text-foreground shadow-lg"
                >
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <h3 className="text-[28px] font-semibold text-foreground mt-1 leading-tight tracking-tight">
          {value}
        </h3>
        {subtitle && (
          <p className="text-[11.5px] font-normal mt-1 text-muted-foreground/85 leading-snug">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
