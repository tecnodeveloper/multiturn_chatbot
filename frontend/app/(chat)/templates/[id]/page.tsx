"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Template, templateService } from "@/lib/template-service";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { useDashboard } from "@/hooks/use-dashboard";
import { createChat, createMessage } from "@/db";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Copy, Edit2, Trash2, Star, CheckCircle2, Bot, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { TemplateDeleteDialog } from "@/components/templates/template-delete-dialog";
import Link from "next/link";

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.id as string;

  const { user } = useAuth();
  const {
    setSelectedProvider,
    setSelectedModel,
    setCurrentChatId,
    setChats,
    chats,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { handleNewChat, handleDeleteChat } = useDashboard();

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const data = await templateService.getTemplateById(templateId);
        setTemplate(data);
      } catch (err) {
        toast.error("Failed to load template");
      } finally {
        setLoading(false);
      }
    };
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const handleUseTemplate = async () => {
    if (!template) return;
    try {
      await templateService.incrementUsage(template.id);
      setSelectedProvider(template.provider);
      setSelectedModel(template.model);

      // Store the starter prompt as a pending auto-send message
      if (template.starterPrompt) {
        try {
          localStorage.setItem("multiturn_pending_message", template.starterPrompt);
        } catch (_) {}
      }

      // Persist active system prompt for this conversation
      if (template.systemPrompt) {
        try {
          localStorage.setItem("multiturn_system_prompt", template.systemPrompt);
        } catch (_) {}
      } else {
        try {
          localStorage.removeItem("multiturn_system_prompt");
        } catch (_) {}
      }

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
          console.error("Failed to persist initial chat", dbError);
        }
      }

      toast.success(`Template applied: "${template.name}"`);
      router.push("/dashboard");
    } catch (e: any) {
      toast.error("Failed to apply template");
    }
  };

  const handleToggleFavorite = async () => {
    if (!template) return;
    try {
      const updated = await templateService.toggleFavorite(template.id);
      setTemplate(updated);
    } catch (e: any) {
      toast.error("Failed to update favorite");
    }
  };

  const handleDuplicate = async () => {
    if (!template) return;
    try {
      const copy = await templateService.duplicateTemplate(template.id);
      toast.success(`Duplicated "${template.name}"`);
      router.push(`/templates/${copy.id}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to duplicate template");
    }
  };

  const handleDelete = async () => {
    if (!template) return;
    setIsDeleting(true);
    try {
      await templateService.deleteTemplate(template.id);
      toast.success("Template deleted");
      router.push("/templates");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete template");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        collapsed={!sidebarOpen}
        onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onSelectChat={setCurrentChatId}
      />

      <main className="relative flex min-w-0 flex-1 flex-col bg-background font-sans h-full overflow-hidden text-foreground">
        {/* Header */}
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

            <Link
              href="/templates"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-normal text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to templates</span>
            </Link>
          </div>

          {template && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                className="h-8 gap-1.5 text-[12px] font-normal rounded-xl border-border hover:border-[#f5a623]/30"
              >
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Duplicate</span>
              </Button>

              {!template.isSystemTemplate && (
                <>
                  <Link href={`/templates/${template.id}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-[12px] font-normal rounded-xl border-border hover:border-[#f5a623]/30"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="h-8 text-destructive hover:bg-destructive/10 text-[12px] font-normal rounded-xl"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}

              <Button
                onClick={handleUseTemplate}
                size="sm"
                className="h-8 px-4 gap-1.5 rounded-xl bg-[#f5a623] hover:bg-[#e09612] text-[#0f1117] text-[12.5px] font-medium transition-colors shadow-sm active:scale-95"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Use template</span>
              </Button>
            </div>
          )}
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 max-w-4xl mx-auto w-full">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading template details...</div>
          ) : !template ? (
            <div className="py-16 text-center">
              <h3 className="text-base font-medium text-foreground">Template not found</h3>
              <p className="text-xs text-muted-foreground mt-1">This template may have been deleted.</p>
              <Link href="/templates" className="mt-4 inline-block">
                <Button variant="outline" size="sm" className="rounded-xl mt-2 text-xs">
                  Return to templates
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Card Title Box */}
              <div className="p-6 rounded-2xl border border-border bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5a623]/10 text-[#f5a623] shrink-0">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[20px] font-medium text-foreground tracking-tight">
                          {template.name}
                        </h2>
                        {template.isSystemTemplate && (
                          <span className="text-[11px] font-medium text-[#b8740c] dark:text-[#f5a623] bg-[#f5a623]/10 px-2 py-0.5 rounded-full">
                            System
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[12px] font-normal text-muted-foreground">
                        <span>{template.category}</span>
                        <span>·</span>
                        <span>Used {template.usageCount || 0} times</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleFavorite}
                    aria-label={template.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        template.isFavorite
                          ? "fill-[#f5a623] text-[#f5a623]"
                          : "text-muted-foreground/40 hover:text-muted-foreground"
                      }`}
                    />
                  </button>
                </div>

                <p className="mt-4 text-[13.5px] font-normal text-foreground leading-relaxed">
                  {template.description}
                </p>

                {/* Model and Provider Details */}
                <div className="grid grid-cols-2 gap-4 mt-5 p-4 rounded-xl bg-muted/20 border border-border">
                  <div>
                    <span className="text-[11.5px] font-normal text-muted-foreground">Provider</span>
                    <p className="text-[13px] font-medium text-foreground mt-0.5">{template.provider}</p>
                  </div>
                  <div>
                    <span className="text-[11.5px] font-normal text-muted-foreground">Model</span>
                    <p className="text-[13px] font-medium text-foreground mt-0.5 truncate">{template.model}</p>
                  </div>
                </div>
              </div>

              {/* System Instructions */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-2">
                <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                  System instructions
                </span>
                <div className="p-4 rounded-xl bg-muted/30 border border-border text-[13px] font-normal text-foreground leading-relaxed whitespace-pre-wrap font-mono">
                  {template.systemPrompt}
                </div>
              </div>

              {/* Starter Prompt */}
              {template.starterPrompt && (
                <div className="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Starter prompt
                  </span>
                  <div className="p-4 rounded-xl bg-muted/20 border border-border text-[13px] font-normal text-foreground italic">
                    "{template.starterPrompt}"
                  </div>
                </div>
              )}

              {/* Evaluation Criteria */}
              <div className="p-6 rounded-2xl border border-border bg-card space-y-3">
                <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                  Evaluation criteria
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {template.evaluationCriteria?.map((criterion) => (
                    <span
                      key={criterion}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-normal bg-[#f5a623]/10 text-[#b8740c] dark:text-[#f5a623] border border-[#f5a623]/25"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#f5a623]" />
                      {criterion}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {template.tags && template.tags.length > 0 && (
                <div className="p-6 rounded-2xl border border-border bg-card space-y-2">
                  <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11.5px] font-normal px-2.5 py-1 rounded-md bg-muted/50 text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <TemplateDeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
          templateName={template?.name}
          isDeleting={isDeleting}
        />
      </main>
    </div>
  );
}
