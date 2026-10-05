"use client";

import { FC, useState, useEffect } from "react";
import {
  Template,
  TemplateCategory,
  EvaluationCriterion,
  CreateTemplateInput,
  TEMPLATE_CATEGORIES,
  ALL_EVALUATION_CRITERIA,
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
import { AI_PROVIDERS } from "@/lib/ai-providers";
import { Check, CheckCircle2 } from "lucide-react";
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
  const [category, setCategory] = useState<TemplateCategory>("Machine Learning");
  const [provider, setProvider] = useState("Gemini");
  const [model, setModel] = useState("gemini-3.5-flash");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [starterPrompt, setStarterPrompt] = useState("");
  const [selectedCriteria, setSelectedCriteria] = useState<EvaluationCriterion[]>([
    "Accuracy",
    "Helpfulness",
  ]);
  const [tagsInput, setTagsInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setDescription(initialTemplate.description);
      setCategory(initialTemplate.category);
      setProvider(initialTemplate.provider);
      setModel(initialTemplate.model);
      setSystemPrompt(initialTemplate.systemPrompt);
      setStarterPrompt(initialTemplate.starterPrompt || "");
      setSelectedCriteria(initialTemplate.evaluationCriteria || []);
      setTagsInput(initialTemplate.tags ? initialTemplate.tags.join(", ") : "");
    } else {
      setName("");
      setDescription("");
      setCategory("Machine Learning");
      setProvider("Gemini");
      setModel("gemini-3.5-flash");
      setSystemPrompt("");
      setStarterPrompt("");
      setSelectedCriteria(["Accuracy", "Helpfulness"]);
      setTagsInput("");
    }
  }, [initialTemplate, isOpen]);

  // Update model when provider changes
  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    const providerObj = AI_PROVIDERS.find((p) => p.id === newProvider);
    if (providerObj && providerObj.models.length > 0) {
      setModel(providerObj.models[0].id);
    }
  };

  const toggleCriterion = (criterion: EvaluationCriterion) => {
    setSelectedCriteria((prev) =>
      prev.includes(criterion) ? prev.filter((c) => c !== criterion) : [...prev, criterion]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean);

    const input: CreateTemplateInput = {
      name: name.trim(),
      description: description.trim(),
      category,
      provider,
      model,
      systemPrompt: systemPrompt.trim(),
      starterPrompt: starterPrompt.trim() || undefined,
      evaluationCriteria: selectedCriteria,
      tags,
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

  const availableModels = AI_PROVIDERS.find((p) => p.id === provider)?.models || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4.5 border-b border-border bg-muted/20 text-left">
          <DialogTitle className="text-[17px] font-medium text-foreground tracking-tight">
            {isEditing ? "Edit template" : "Create template"}
          </DialogTitle>
          <DialogDescription className="text-[12.5px] font-normal text-muted-foreground mt-0.5">
            {isEditing
              ? "Update your reusable AI conversation and evaluation setup."
              : "Build a reusable AI conversation and evaluation setup."}
          </DialogDescription>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6 custom-scrollbar">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h4 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              Basic information
            </h4>

            <div className="space-y-1.5">
              <Label htmlFor="template-name" className="text-[12.5px] font-medium text-foreground">
                Template name *
              </Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Machine Learning Assistant"
                className="h-9 text-[12.5px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#f5a623]/40 rounded-xl"
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
                placeholder="Short summary of what this template configures..."
                className="h-9 text-[12.5px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#f5a623]/40 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="template-category" className="text-[12.5px] font-normal text-foreground">
                  Category
                </Label>
                <select
                  id="template-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TemplateCategory)}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-[12.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-[#f5a623]/40"
                >
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="template-tags" className="text-[12.5px] font-normal text-foreground">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="template-tags"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="support, ecommerce, quality"
                  className="h-9 text-[12.5px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#f5a623]/40 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Section 2: AI Configuration */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h4 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
              AI configuration
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="template-provider" className="text-[12.5px] font-normal text-foreground">
                  Provider
                </Label>
                <select
                  id="template-provider"
                  value={provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-[12.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-[#f5a623]/40"
                >
                  {AI_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="template-model" className="text-[12.5px] font-normal text-foreground">
                  Model
                </Label>
                <select
                  id="template-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full h-9 rounded-xl border border-border bg-background px-3 text-[12.5px] text-foreground focus:outline-none focus:ring-1 focus:ring-[#f5a623]/40"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="template-system-prompt" className="text-[12.5px] font-medium text-foreground">
                  System instructions
                </Label>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Define how the AI should behave
                </span>
              </div>
              <Textarea
                id="template-system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful customer support assistant. Provide accurate, concise, and empathetic responses."
                rows={4}
                className="text-[12.5px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#f5a623]/40 rounded-xl leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="template-starter-prompt" className="text-[12.5px] font-normal text-foreground">
                  Starter prompt (optional)
                </Label>
                <span className="text-[11px] font-normal text-muted-foreground">
                  Pre-fills the conversation input
                </span>
              </div>
              <Input
                id="template-starter-prompt"
                value={starterPrompt}
                onChange={(e) => setStarterPrompt(e.target.value)}
                placeholder="A customer says their order arrived damaged. How should you respond?"
                className="h-9 text-[12.5px] bg-background border-border text-foreground focus-visible:ring-1 focus-visible:ring-[#f5a623]/40 rounded-xl"
              />
            </div>
          </div>

          {/* Section 3: Evaluation Configuration */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div>
              <h4 className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                Evaluation configuration
              </h4>
              <p className="text-[11.5px] font-normal text-muted-foreground mt-0.5">
                Select target criteria to benchmark and rate in this scenario
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {ALL_EVALUATION_CRITERIA.map((criterion) => {
                const isSelected = selectedCriteria.includes(criterion);
                return (
                  <button
                    key={criterion}
                    type="button"
                    onClick={() => toggleCriterion(criterion)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] transition-all border ${
                      isSelected
                        ? "bg-[#f5a623]/15 text-[#b8740c] dark:text-[#f5a623] border-[#f5a623]/40 font-medium"
                        : "bg-background border-border text-muted-foreground hover:border-[#f5a623]/30 font-normal"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-3.5 w-3.5 transition-opacity ${
                        isSelected ? "text-[#f5a623] opacity-100" : "opacity-30"
                      }`}
                    />
                    <span>{criterion}</span>
                  </button>
                );
              })}
            </div>
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
              className="h-9 px-5 rounded-xl bg-[#f5a623] hover:bg-[#e09612] text-[#0f1117] text-[12.5px] font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
