"use client";

import { FC, KeyboardEvent } from "react";
import {
  LayoutDashboard,
  Table2,
  LineChart,
  MessagesSquare,
  LucideIcon,
} from "lucide-react";

export type AnalyticsTabId = "overview" | "tables" | "graphs" | "sessions";

export interface AnalyticsTabItem {
  id: AnalyticsTabId;
  label: string;
  icon: LucideIcon;
  description: string;
}

export const ANALYTICS_TABS: AnalyticsTabItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    description: "System summary, key metrics, and performance charts",
  },
  {
    id: "tables",
    label: "Tables",
    icon: Table2,
    description: "Detailed performance, correctness, and latency tables",
  },
  {
    id: "graphs",
    label: "Graphs",
    icon: LineChart,
    description: "Visual analysis of accuracy trends, phase dynamics, and response metrics",
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: MessagesSquare,
    description: "Turn-by-turn session insights and phase-wise analysis",
  },
];

interface NavigationTabsProps {
  activeTab: AnalyticsTabId;
  onTabChange: (tab: AnalyticsTabId) => void;
  disabled?: boolean;
}

export const NavigationTabs: FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  disabled = false,
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentId: AnalyticsTabId) => {
    const currentIndex = ANALYTICS_TABS.findIndex((t) => t.id === currentId);
    if (currentIndex === -1) return;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % ANALYTICS_TABS.length;
      onTabChange(ANALYTICS_TABS[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + ANALYTICS_TABS.length) % ANALYTICS_TABS.length;
      onTabChange(ANALYTICS_TABS[prevIndex].id);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <nav
          role="tablist"
          aria-label="Analytics navigation"
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2"
        >
          {ANALYTICS_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                id={`analytics-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`analytics-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                disabled={disabled}
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, tab.id)}
                title={tab.description}
                className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 shrink-0 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#f5a623] focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? "bg-[#f5a623]/15 text-[#f5a623] shadow-sm font-semibold border border-[#f5a623]/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform duration-150 ${
                    isActive
                      ? "text-[#f5a623] scale-105"
                      : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
                  }`}
                />
                <span className="whitespace-nowrap tracking-tight">{tab.label}</span>

                {/* Subtle active pill indicator on bottom */}
                {isActive && (
                  <span className="absolute -bottom-2 left-3 right-3 h-[2px] bg-[#f5a623] rounded-full shadow-[0_0_8px_rgba(245,166,35,0.6)]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
