"use client";

import { FC } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TemplateToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
}

export const TemplateToolbar: FC<TemplateToolbarProps> = ({
  searchQuery,
  onSearchChange,
  totalCount,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 w-full">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-11 pr-8 h-10 text-[13px] font-normal bg-card border-border rounded-xl placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-purple-500/40"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Counter */}
      <div className="text-[12.5px] font-normal text-muted-foreground shrink-0">
        <span>{totalCount} {totalCount === 1 ? "template" : "templates"}</span>
      </div>
    </div>
  );
};
