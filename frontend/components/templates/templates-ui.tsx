"use client";

import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Template,
  templateService,
} from "@/lib/template-service";
import { TemplateCard } from "./template-card";
import { TemplateEmptyState } from "./template-empty-state";
import { TemplateDetailModal } from "./template-detail-modal";
import { Button } from "@/components/ui/button";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { createChat } from "@/db";
import { toast } from "sonner";

interface TemplatesUIProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

export const TemplatesUI: FC<TemplatesUIProps> = ({
  sidebarOpen,
  setSidebarOpen,
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

  // Viewing detail modal state
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);

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

  // The Core Flow: Template -> Chat Execution on Dashboard
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
    <main className="relative flex min-w-0 flex-1 flex-col bg-[#f8fafc] dark:bg-[#070a12] font-sans h-full overflow-hidden text-foreground">
      {/* Top Header - Exact match to Dashboard / Analytics header */}
      <header className="flex max-h-[60px] min-h-[60px] w-full items-center justify-between border-b border-border px-4 sm:px-6 relative bg-card/80 backdrop-blur-md shrink-0 sticky top-0 z-20">
        {/* Left Zone: Sidebar toggle, Page Icon & Titles */}
        <div className="flex items-center gap-3 z-10">
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

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-[#f5a623]/10 text-[#f5a623] shrink-0">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[17px] sm:text-[19px] font-medium text-foreground tracking-tight whitespace-nowrap">
                Templates
              </h1>
              <p className="text-[12px] font-normal text-muted-foreground hidden sm:block whitespace-nowrap">
                AI-powered conversation assistants for specialized workflows
              </p>
            </div>
          </div>
        </div>

        {/* Right Zone: Theme Toggle */}
        <div className="flex items-center justify-end gap-2.5 z-10">
          <div className="flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Content State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[280px] rounded-2xl border border-border bg-card/60 animate-pulse"
                />
              ))}
            </div>
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUse={handleUseTemplate}
                  onView={setViewingTemplate}
                />
              ))}
            </div>
          ) : (
            <TemplateEmptyState />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <TemplateDetailModal
        isOpen={Boolean(viewingTemplate)}
        onClose={() => setViewingTemplate(null)}
        template={viewingTemplate}
        onUse={handleUseTemplate}
      />
    </main>
  );
};
