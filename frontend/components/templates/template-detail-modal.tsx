"use client";

import { FC } from "react";
import { Template } from "@/lib/template-service";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Copy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getTemplateIcon } from "./template-card";

interface TemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  onUse: (template: Template) => void;
}

export const TemplateDetailModal: FC<TemplateDetailModalProps> = ({
  isOpen,
  onClose,
  template,
  onUse,
}) => {
  if (!template) return null;

  const handleCopySystemPrompt = () => {
    navigator.clipboard.writeText(template.systemPrompt);
    toast.success("System instructions copied to clipboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-card border-border max-h-[85vh] flex flex-col p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-border bg-muted/20 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5a623]/10 text-[#f5a623] border border-[#f5a623]/25 shadow-sm shrink-0">
              {getTemplateIcon(template.name)}
            </div>
            <div>
              <DialogTitle className="text-[17px] font-semibold text-foreground tracking-tight">
                {template.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-[11.5px] font-normal text-muted-foreground">
                <span className="inline-flex items-center gap-1 text-[#f5a623] font-medium">
                  <Sparkles className="h-3 w-3" />
                  {template.category}
                </span>
                <span>&bull;</span>
                <span>Used {template.usageCount || 0} times</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-6 py-5 overflow-y-auto space-y-4.5 flex-1 custom-scrollbar">
          {/* Description */}
          {template.description && (
            <div>
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                System instructions
              </span>
              <button
                onClick={handleCopySystemPrompt}
                className="text-[11.5px] font-medium text-[#f5a623] hover:underline flex items-center gap-1"
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
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-[12.5px] font-normal rounded-xl border-border"
          >
            Close
          </Button>

          <Button
            size="sm"
            onClick={() => {
              onClose();
              onUse(template);
            }}
            className="h-9 px-5 gap-1.5 rounded-xl bg-[#f5a623] hover:bg-[#e09612] text-[#06080d] font-semibold text-[13px] transition-colors shadow-sm active:scale-98"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Use Assistant</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
