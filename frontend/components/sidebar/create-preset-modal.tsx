"use client";

import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AI_PROVIDERS } from "@/lib/ai-providers";

interface CreatePresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preset: any) => void;
}

export const CreatePresetModal: FC<CreatePresetModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [model, setModel] = useState("gemini-3.5-flash");
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);

  const handleSave = () => {
    if (!name || !model || !prompt) return;
    onSave({
      name,
      model,
      prompt,
      temperature,
      context_length: 4096
    });
    setName("");
    setPrompt("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-base font-medium text-foreground">Create new preset</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="preset-name" className="text-xs font-normal text-muted-foreground">Name</Label>
            <Input
              id="preset-name"
              placeholder="Preset name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-xs bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-model" className="text-xs font-normal text-muted-foreground">Model</Label>
            <select
              id="preset-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#f5a623]/40 text-foreground"
            >
              {AI_PROVIDERS.flatMap(p => p.models).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-prompt" className="text-xs font-normal text-muted-foreground">System prompt</Label>
            <Textarea
              id="preset-prompt"
              placeholder="System instructions for this preset..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="text-xs bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preset-temp" className="text-xs font-normal text-muted-foreground">Temperature: {temperature}</Label>
            <Input
              id="preset-temp"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="accent-[#f5a623]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-xs font-normal">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!name || !model || !prompt}
            className="text-xs font-medium bg-[#f5a623] hover:bg-[#e09612] text-[#0f1117] transition-colors"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
