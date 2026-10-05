"use client";

import { FC, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Template,
  TemplateCategory,
  CreateTemplateInput,
  templateService,
} from "@/lib/template-service";
import { TemplateCard } from "./template-card";
import { TemplateToolbar, ScopeFilter } from "./template-toolbar";
import { TemplateEmptyState } from "./template-empty-state";
import { TemplateFormModal } from "./template-form-modal";
import { TemplateDetailModal } from "./template-detail-modal";
import { TemplateDeleteDialog } from "./template-delete-dialog";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Layers } from "lucide-react";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { createChat, createMessage } from "@/db";
import { toast } from "sonner";

interface TemplatesUIProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  initialAction?: "create";
}

export const TemplatesUI: FC<TemplatesUIProps> = ({
  sidebarOpen,
  setSidebarOpen,
  initialAction,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    setSelectedProvider,
    setSelectedModel,
    setCurrentChatId,
    setChats,
    chats,
  } = useChat();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScope, setSelectedScope] = useState<ScopeFilter>("All");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(initialAction === "create");
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateService.getTemplates();
      setTemplates(data);
    } catch (e) {
      console.error("Failed to load templates", e);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // 1. Scope Filter
      if (selectedScope === "My templates" && template.isSystemTemplate) return false;
      if (selectedScope === "System templates" && !template.isSystemTemplate) return false;
      if (selectedScope === "Favorites" && !template.isFavorite) return false;

      // 2. Category Filter
      if (selectedCategory && template.category !== selectedCategory) return false;

      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = template.name.toLowerCase().includes(q);
        const matchesDesc = template.description.toLowerCase().includes(q);
        const matchesCat = template.category.toLowerCase().includes(q);
        const matchesTag = template.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesCat && !matchesTag) return false;
      }

      return true;
    });
  }, [templates, selectedScope, selectedCategory, searchQuery]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (template: Template) => {
    setEditingTemplate(template);
    setIsFormModalOpen(true);
  };

  const handleSaveTemplate = async (input: CreateTemplateInput, templateId?: string) => {
    if (templateId) {
      const updated = await templateService.updateTemplate(templateId, input);
      setTemplates((prev) => prev.map((t) => (t.id === templateId ? updated : t)));
    } else {
      const created = await templateService.createTemplate(input);
      setTemplates((prev) => [created, ...prev]);
    }
  };

  const handleDuplicateTemplate = async (template: Template) => {
    try {
      const copy = await templateService.duplicateTemplate(template.id);
      setTemplates((prev) => [copy, ...prev]);
      toast.success(`Duplicated "${template.name}"`);
    } catch (e: any) {
      toast.error(e.message || "Failed to duplicate template");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const updated = await templateService.toggleFavorite(id);
      setTemplates((prev) => prev.map((t) => (t.id === id ? updated : t)));
      if (viewingTemplate && viewingTemplate.id === id) {
        setViewingTemplate(updated);
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update favorite");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTemplate) return;
    setIsDeleting(true);
    try {
      await templateService.deleteTemplate(deletingTemplate.id);
      setTemplates((prev) => prev.filter((t) => t.id !== deletingTemplate.id));
      toast.success("Template deleted");
      setDeletingTemplate(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to delete template");
    } finally {
      setIsDeleting(false);
    }
  };

  // The Core Flow: Template -> Chat Execution
  const handleUseTemplate = async (template: Template) => {
    try {
      // 1. Increment template usage
      await templateService.incrementUsage(template.id);
      setTemplates((prev) =>
        prev.map((t) => (t.id === template.id ? { ...t, usageCount: (t.usageCount || 0) + 1 } : t))
      );

      // 2. Configure model & provider
      setSelectedProvider(template.provider);
      setSelectedModel(template.model);

      // 3. Store the starter prompt as a pending auto-send message
      // The dashboard will detect this and send it to the AI automatically
      if (template.starterPrompt) {
        try {
          localStorage.setItem("multiturn_pending_message", template.starterPrompt);
        } catch (_) {}
      }

      // 4. Persist active system prompt for this conversation
      if (template.systemPrompt) {
        try {
          localStorage.setItem("multiturn_system_prompt", template.systemPrompt);
        } catch (_) {}
      } else {
        try {
          localStorage.removeItem("multiturn_system_prompt");
        } catch (_) {}
      }

      // 5. Create new chat session if user is logged in
      if (user) {
        try {
          const newChat = await createChat({
            title: template.name,
            user_id: user.id,
          });

          const nextChat = {
            id: newChat.id,
            title: newChat.title,
            messages: [],
            createdAt: newChat.created_at,
          };

          setChats([nextChat, ...chats]);
          setCurrentChatId(newChat.id);
        } catch (dbError) {
          console.error("Failed to persist initial chat, proceeding with active session", dbError);
        }
      }

      toast.success(`Template applied: "${template.name}"`);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error using template:", err);
      toast.error("Failed to apply template");
    }
  };

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-background font-sans h-full overflow-hidden text-foreground">
      {/* Top Header */}
      <header className="flex max-h-[64px] min-h-[64px] w-full items-center justify-between border-b border-border px-6 sm:px-8 bg-card/80 backdrop-blur-md shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-xl border border-border bg-card hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all shrink-0"
              onClick={() => setSidebarOpen(true)}
              title="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          <div>
            <h1 className="text-[20px] sm:text-[22px] font-medium text-foreground tracking-tight">
              Templates
            </h1>
            <p className="text-[12.5px] font-normal text-muted-foreground hidden sm:block">
              Create, manage, and reuse AI conversation templates.
            </p>
          </div>
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="h-9 px-4 gap-1.5 rounded-xl bg-[#f5a623] hover:bg-[#e09612] text-[#0f1117] text-[12.5px] font-medium transition-colors shadow-sm active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create template</span>
        </Button>
      </header>

      {/* Main Content Body - full-width scroll container so scrollbar sits flush against viewport edge */}
      <div className="flex-1 w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 py-6 sm:py-8 space-y-6">
          {/* Search & Filter Toolbar */}
          <TemplateToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            totalCount={filteredTemplates.length}
          />

          {/* Content State */}
          {loading ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 pt-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[220px] rounded-2xl border border-border bg-card/60 animate-pulse p-5"
                />
              ))}
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 pt-1">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                  onView={setViewingTemplate}
                  onEdit={handleOpenEdit}
                  onDuplicate={handleDuplicateTemplate}
                  onDelete={setDeletingTemplate}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          ) : templates.length === 0 ? (
            <TemplateEmptyState type="empty" onCreateNew={handleOpenCreate} />
          ) : (
            <TemplateEmptyState
              type="search"
              onClearFilters={() => {
                setSearchQuery("");
                setSelectedScope("All");
                setSelectedCategory(null);
              }}
            />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <TemplateDetailModal
        isOpen={Boolean(viewingTemplate)}
        onClose={() => setViewingTemplate(null)}
        template={viewingTemplate}
        onUse={handleUseTemplate}
        onEdit={(t) => {
          setViewingTemplate(null);
          handleOpenEdit(t);
        }}
        onDuplicate={handleDuplicateTemplate}
        onDelete={(t) => {
          setViewingTemplate(null);
          setDeletingTemplate(t);
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Create / Edit Form Modal */}
      <TemplateFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        initialTemplate={editingTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <TemplateDeleteDialog
        isOpen={Boolean(deletingTemplate)}
        onClose={() => setDeletingTemplate(null)}
        onConfirm={handleConfirmDelete}
        templateName={deletingTemplate?.name}
        isDeleting={isDeleting}
      />
    </main>
  );
};
