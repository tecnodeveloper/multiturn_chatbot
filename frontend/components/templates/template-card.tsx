"use client";

import { FC } from "react";
import { Template } from "@/lib/template-service";
import { Star, MoreHorizontal, ArrowRight, Play, Eye, Edit2, Trash2, Bot, Sparkles, Brain, Cpu, MessageSquare, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TemplateCardProps {
  template: Template;
  onUse: (template: Template) => void;
  onView: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDuplicate: (template: Template) => void;
  onDelete: (template: Template) => void;
  onToggleFavorite: (id: string) => void;
}

// Map template names or themes to distinct, stylish logo icons
function getTemplateLogoIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("deep") || n.includes("neural") || n.includes("brain")) {
    return <Brain className="h-9 w-9 text-purple-300" />;
  }
  if (n.includes("power") || n.includes("energy") || n.includes("grid")) {
    return <Zap className="h-9 w-9 text-amber-300" />;
  }
  if (n.includes("health") || n.includes("medical")) {
    return <Sparkles className="h-9 w-9 text-cyan-300" />;
  }
  if (n.includes("machine") || n.includes("code") || n.includes("engineer")) {
    return <Cpu className="h-9 w-9 text-pink-300" />;
  }
  if (n.includes("commerce") || n.includes("retail")) {
    return <MessageSquare className="h-9 w-9 text-emerald-300" />;
  }
  return <Bot className="h-9 w-9 text-purple-200" />;
}

export const TemplateCard: FC<TemplateCardProps> = ({
  template,
  onUse,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}) => {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-sm hover:shadow-xl hover:border-purple-500/40 transition-all duration-300 group relative">
      {/* Top Floating Actions: Favorite & More Options */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(template.id);
          }}
          aria-label={template.isFavorite ? "Remove from favorites" : "Add to favorites"}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <Star
            className={`h-4 w-4 transition-colors ${
              template.isFavorite
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/50 hover:text-muted-foreground"
            }`}
          />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="More options"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
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
              className="text-xs cursor-pointer flex items-center gap-2"
            >
              <Play className="h-3.5 w-3.5 text-purple-500" />
              <span>Use template</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onEdit(template)}
              className="text-xs cursor-pointer flex items-center gap-2"
            >
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(template)}
              className="text-xs cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Card Body */}
      <div className="flex flex-col items-center text-center pt-2">
        {/* Template Image Logo Banner */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-500 shadow-lg shadow-purple-500/25 flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 border border-purple-400/20">
          {getTemplateLogoIcon(template.name)}
        </div>

        {/* Centered Title with Horizontal Divider Lines (matching CARD - ONE screenshot) */}
        <div className="w-full border-y border-purple-200/80 dark:border-purple-900/50 py-2.5 my-2">
          <h3 className="text-[15px] font-bold tracking-wider text-foreground uppercase truncate px-2">
            {template.name}
          </h3>
        </div>

        {/* Centered Description */}
        <p className="mt-3 text-[13px] font-normal text-muted-foreground line-clamp-3 leading-relaxed px-2">
          {template.description || "An AI conversation template configured to assist with specialized queries."}
        </p>
      </div>

      {/* Bottom Action Section: Purple 'KNOW MORE!' Button + Quick Use */}
      <div className="mt-6 pt-3 flex items-center gap-2">
        <button
          onClick={() => onView(template)}
          className="flex-1 h-11 px-4 rounded-xl bg-[#9333ea] hover:bg-[#7e22ce] text-white font-semibold text-[13px] tracking-wide uppercase flex items-center justify-center gap-2 shadow-md hover:shadow-purple-500/25 transition-all duration-200 active:scale-98"
        >
          <ArrowRight className="h-4 w-4" />
          <span>Know More!</span>
        </button>

        <button
          onClick={() => onUse(template)}
          title="Use template immediately"
          className="h-11 w-11 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 font-medium flex items-center justify-center transition-colors border border-purple-300/40 dark:border-purple-800/40 shrink-0 active:scale-98"
        >
          <Play className="h-4 w-4 fill-current" />
        </button>
      </div>
    </div>
  );
};
