"use client";

import { FC, useState, useEffect } from "react";
import {
  Template,
  CreateTemplateInput,
} from "@/lib/template-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface TemplateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: CreateTemplateInput, templateId?: string) => Promise<void>;
  initialTemplate?: Template | null;
}

export const TemplateFormModal: FC<TemplateFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTemplate,
}) => {
  const isEditing = Boolean(initialTemplate);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [starterPrompt, setStarterPrompt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setDescription(initialTemplate.description);
      setSystemPrompt(initialTemplate.systemPrompt);
      setStarterPrompt(initialTemplate.starterPrompt || "");
    } else {
      setName("");
      setDescription("");
      setSystemPrompt("");
      setStarterPrompt("");
    }
  }, [initialTemplate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!systemPrompt.trim()) {
      toast.error("System instructions are required");
      return;
    }

    const input: CreateTemplateInput = {
      name: name.trim(),
      description: description.trim(),
      category: initialTemplate?.category || "Machine Learning",
      provider: "Gemini",
      model: "gemini-3.5-flash",
      systemPrompt: systemPrompt.trim(),
      starterPrompt: starterPrompt.trim() || undefined,
      evaluationCriteria: [],
      tags: [],
      isFavorite: initialTemplate?.isFavorite || false,
    };

    setIsSubmitting(true);
    try {
      await onSave(input, initialTemplate?.id);
      toast.success(isEditing ? "Template updated successfully" : "Template created successfully");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-card border-border max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4.5 border-b border-border bg-muted/20 text-left">
          <DialogTitle className="text-[17px] font-semibold text-foreground tracking-tight">
            {isEditing ? "Edit template" : "Create template"}
          </DialogTitle>
          <DialogDescription className="text-[12.5px] font-normal text-muted-foreground mt-0.5">
            {isEditing
              ? "Update your custom AI conversation template."
              : "Set up a new AI assistant template."}
          </DialogDescription>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4.5 custom-scrollbar">
          <div className="space-y-1.5">
            <Label htmlFor="template-name" className="text-[12.5px] font-medium text-foreground">
              Template name *
            </Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Code Reviewer, Python Tutor"
              className="h-9.5 text-[13px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-purple-500/40 rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="template-description" className="text-[12.5px] font-normal text-foreground">
              Description
            </Label>
            <Input
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of what this template does..."
              className="h-9.5 text-[13px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-purple-500/40 rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="template-system-prompt" className="text-[12.5px] font-medium text-foreground">
                System instructions *
              </Label>
              <span className="text-[11px] font-normal text-muted-foreground">
                Define the persona and behavior
              </span>
            </div>
            <Textarea
              id="template-system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are an expert AI assistant. Provide concise, clear, and actionable answers..."
              rows={5}
              className="text-[12.5px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-purple-500/40 rounded-xl leading-relaxed"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="template-starter-prompt" className="text-[12.5px] font-normal text-foreground">
                Starter prompt (optional)
              </Label>
              <span className="text-[11px] font-normal text-muted-foreground">
                Initial question or topic
              </span>
            </div>
            <Input
              id="template-starter-prompt"
              value={starterPrompt}
              onChange={(e) => setStarterPrompt(e.target.value)}
              placeholder="Can you explain how this works?"
              className="h-9.5 text-[13px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-purple-500/40 rounded-xl"
            />
          </div>

          {/* Footer Actions */}
          <DialogFooter className="pt-4 border-t border-border gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-[12.5px] font-normal text-muted-foreground hover:text-foreground rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="h-9.5 px-5 rounded-xl bg-[#9333ea] hover:bg-[#7e22ce] text-white text-[12.5px] font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
