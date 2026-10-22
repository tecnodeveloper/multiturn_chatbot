"use client";

import { FC } from "react";
import { LayoutGrid } from "lucide-react";

export const TemplateEmptyState: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-2xl border border-dashed border-border bg-card/40 my-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5a623]/10 text-[#f5a623] mb-3.5">
        <LayoutGrid className="h-5 w-5" />
      </div>
      <h3 className="text-[16px] font-medium text-foreground tracking-tight">
        No templates available
      </h3>
      <p className="mt-1 text-[12.5px] font-normal text-muted-foreground max-w-md">
        Pre-configured AI assistant templates will appear here.
      </p>
    </div>
  );
};
