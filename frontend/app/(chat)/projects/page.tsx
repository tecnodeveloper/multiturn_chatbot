"use client";

import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ProjectsUI } from "@/components/projects/projects-ui";
import { useDashboard } from "@/hooks/use-dashboard";
import { CreatePromptModal } from "@/components/sidebar/create-prompt-modal";
import { CreatePresetModal } from "@/components/sidebar/create-preset-modal";

export default function ProjectsPage() {
  const { user } = useAuth();
  const { setCurrentChatId, contentType } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  const {
    handleNewChat,
    handleDeleteChat,
    handleCreatePrompt,
    handleCreatePreset,
  } = useDashboard();

  const handleAction = () => {
    if (contentType === "chats") {
      handleNewChat();
    } else if (contentType === "prompts") {
      setIsPromptModalOpen(true);
    } else if (contentType === "presets") {
      setIsPresetModalOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar
        collapsed={!sidebarOpen}
        onToggleCollapse={() => setSidebarOpen((prev) => !prev)}
        onNewChat={handleAction}
        onDeleteChat={handleDeleteChat}
        onSelectChat={setCurrentChatId}
      />

      <ProjectsUI
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <CreatePromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onSave={handleCreatePrompt}
      />

      <CreatePresetModal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSave={handleCreatePreset}
      />
    </div>
  );
}
