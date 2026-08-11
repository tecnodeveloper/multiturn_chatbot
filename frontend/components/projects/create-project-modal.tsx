"use client";

import { FC, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}

export const CreateProjectModal: FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), description.trim());
    setName("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-[#0e1626] border-[#e2e8f0] dark:border-slate-800 text-[#0f172a] dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#0f172a] dark:text-white">
            Create New Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-xs font-semibold text-[#0f172a] dark:text-slate-200">
              Project Name *
            </Label>
            <Input
              id="projectName"
              placeholder="e.g. customer-support-agent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-xs bg-[#f1f5f9] dark:bg-[#0c1322] border-[#cbd5e1] dark:border-slate-800 text-[#0f172a] dark:text-slate-100 placeholder:text-[#64748b] dark:placeholder:text-slate-500 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDesc" className="text-xs font-semibold text-[#0f172a] dark:text-slate-200">
              Description
            </Label>
            <Input
              id="projectDesc"
              placeholder="Brief overview of project goals..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10 text-xs bg-[#f1f5f9] dark:bg-[#0c1322] border-[#cbd5e1] dark:border-slate-800 text-[#0f172a] dark:text-slate-100 placeholder:text-[#64748b] dark:placeholder:text-slate-500 rounded-xl"
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 text-xs rounded-xl border-[#cbd5e1] dark:border-slate-800 text-[#64748b] dark:text-slate-300 hover:bg-[#f1f5f9] dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="h-9 text-xs font-semibold rounded-xl bg-[#2563eb] hover:bg-blue-600 text-white shadow-md"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
