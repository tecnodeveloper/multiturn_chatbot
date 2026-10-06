"use client";

import { FC } from "react";
import { Template } from "@/lib/template-service";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Copy, Edit2, Trash2, Star, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface TemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  onUse: (template: Template) => void;
  onEdit: (template: Template) => void;
  onDuplicate: (template: Template) => void;
  onDelete: (template: Template) => void;
  onToggleFavorite: (id: string) => void;
}

export const TemplateDetailModal: FC<TemplateDetailModalProps> = ({
  isOpen,
  onClose,
  template,
  onUse,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleFavorite,
}) => {
  if (!template) return null;

  const handleCopySystemPrompt = () => {
    navigator.clipboard.writeText(template.systemPrompt);
    toast.success("System instructions copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-card border-border max-h-[85vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-border bg-muted/20 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-500/20 shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-[17px] font-semibold text-foreground tracking-tight">
                {template.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-[11.5px] font-normal text-muted-foreground">
                <span>Used {template.usageCount || 0} times</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onToggleFavorite(template.id)}
            aria-label={template.isFavorite ? "Remove from favorites" : "Add to favorites"}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors mr-6"
          >
            <Star
              className={`h-4.5 w-4.5 transition-colors ${
                template.isFavorite
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40 hover:text-muted-foreground"
              }`}
            />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-4.5 flex-1 custom-scrollbar">
          {/* Description */}
          {template.description && (
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Description
              </span>
              <p className="mt-1 text-[13px] font-normal text-foreground leading-relaxed">
                {template.description}
              </p>
            </div>
          )}

          {/* System Instructions */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                System instructions
              </span>
              <button
                onClick={handleCopySystemPrompt}
                className="text-[11.5px] font-normal text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </button>
            </div>
            <div className="mt-1.5 p-3.5 rounded-xl bg-muted/30 border border-border text-[12.5px] font-normal text-foreground leading-relaxed whitespace-pre-wrap font-mono">
              {template.systemPrompt}
            </div>
          </div>

          {/* Starter Prompt */}
          {template.starterPrompt && (
            <div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Starter prompt
              </span>
              <div className="mt-1.5 p-3 rounded-xl bg-muted/20 border border-border text-[12.5px] font-normal text-foreground italic">
                "{template.starterPrompt}"
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onDuplicate(template);
              }}
              className="h-8.5 gap-1.5 text-[12px] font-normal rounded-xl border-border"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onEdit(template);
              }}
              className="h-8.5 gap-1.5 text-[12px] font-normal rounded-xl border-border"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
                onDelete(template);
              }}
              className="h-8.5 text-destructive hover:bg-destructive/10 text-[12px] font-normal rounded-xl"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            size="sm"
            onClick={() => {
              onClose();
              onUse(template);
            }}
            className="h-8.5 px-4 gap-1.5 rounded-xl bg-[#9333ea] hover:bg-[#7e22ce] text-white text-[12.5px] font-medium transition-colors shadow-sm"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Use template</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
