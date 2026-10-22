"use client";

import { FC } from "react";
import { Template } from "@/lib/template-service";
import {
  Code2,
  Cpu,
  Brain,
  Stethoscope,
  Zap,
  ShoppingBag,
  Bot,
  Play,
  Eye,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
  onView: (template: Template) => void;
}

// Select a crisp, purpose-specific icon for each template
export function getTemplateIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("code") || n.includes("guru") || n.includes("developer") || n.includes("program")) {
    return <Code2 className="h-6 w-6 text-[#f5a623]" />;
  }
  if (n.includes("deep") || n.includes("neural") || n.includes("brain")) {
    return <Brain className="h-6 w-6 text-[#f5a623]" />;
  }
  if (n.includes("power") || n.includes("energy") || n.includes("grid")) {
    return <Zap className="h-6 w-6 text-[#f5a623]" />;
  }
  if (n.includes("health") || n.includes("medical") || n.includes("clinical")) {
    return <Stethoscope className="h-6 w-6 text-[#f5a623]" />;
  }
  if (n.includes("machine") || n.includes("learning") || n.includes("engineer")) {
    return <Cpu className="h-6 w-6 text-[#f5a623]" />;
  }
  if (n.includes("commerce") || n.includes("retail") || n.includes("shop")) {
    return <ShoppingBag className="h-6 w-6 text-[#f5a623]" />;
  }
  return <Bot className="h-6 w-6 text-[#f5a623]" />;
}

export const TemplateCard: FC<TemplateCardProps> = ({
  template,
  onUse,
  onView,
}) => {
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm hover:border-[#f5a623]/40 hover:shadow-md transition-all duration-200 h-full">
      {/* Interactive hover ring matching dashboard cards */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-[#f5a623]/20 transition-all pointer-events-none" />

      {/* Top Section: Icon, Badge, Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          {/* 48px consistent icon container */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20 shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0">
            {getTemplateIcon(template.name)}
          </div>

          {/* Top Actions: Menu */}
          <div className="flex items-center gap-1 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="More options"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 bg-card border-border text-foreground">
                <DropdownMenuItem
                  onClick={() => onView(template)}
                  className="text-xs cursor-pointer flex items-center gap-2"
                >
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>View details</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onUse(template)}
                  className="text-xs cursor-pointer flex items-center gap-2 text-[#f5a623] font-medium"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Use assistant</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title, Category & Description */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[16px] font-semibold text-foreground tracking-tight group-hover:text-[#f5a623] transition-colors line-clamp-1">
              {template.name}
            </h3>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/20 w-fit">
            <Sparkles className="h-3 w-3" />
            {template.category}
          </span>

          <p className="mt-1 text-[13px] font-normal text-muted-foreground leading-relaxed line-clamp-3">
            {template.description || "An AI conversation template configured to assist with specialized queries."}
          </p>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="mt-5 pt-4 border-t border-border/60 flex items-center gap-2.5 z-10">
        <button
          onClick={() => onUse(template)}
          className="flex-1 h-9.5 px-4 rounded-xl bg-[#f5a623] hover:bg-[#e09612] text-[#06080d] font-semibold text-[13px] tracking-wide flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.98]"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>Use Assistant</span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onView(template)}
          className="h-9.5 px-3 rounded-xl border-border hover:border-[#f5a623]/40 hover:bg-muted/40 text-muted-foreground hover:text-foreground text-[12.5px] font-medium transition-colors"
          title="View full prompt and details"
        >
          <Eye className="h-3.5 w-3.5 mr-1" />
          <span>Details</span>
        </Button>
      </div>
    </div>
  );
};
