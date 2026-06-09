"use client";

import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import { useState } from "react";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatUI } from "@/components/chat/chat-ui";
import { useDashboard } from "@/hooks/use-dashboard";
import { FeedbackModal } from "@/components/feedback-modal";
import { CreatePromptModal } from "@/components/sidebar/create-prompt-modal";
import { CreatePresetModal } from "@/components/sidebar/create-preset-modal";

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentChatId, setCurrentChatId, contentType } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);

  const {
    handleNewChat,
    handleDeleteChat,
    handleSendMessage,
    handleFileUpload,
    handleCreatePrompt,
    handleCreatePreset,
    attachedFiles,
    setAttachedFiles,
    showFeedbackModal,
    setShowFeedbackModal,
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
      <div
        className={`transition-all duration-200 ease-in-out ${sidebarOpen ? "w-[320px]" : "w-0"}`}
      >
        {sidebarOpen && (
          <Sidebar
            onNewChat={handleAction}
            onDeleteChat={handleDeleteChat}
            onSelectChat={setCurrentChatId}
          />
        )}
      </div>

      <ChatUI
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onSendMessage={handleSendMessage}
        onFileUpload={handleFileUpload}
        onNewChat={handleNewChat}
        attachedFiles={attachedFiles}
        setAttachedFiles={setAttachedFiles}
      />

      {user && currentChatId && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => setShowFeedbackModal(false)}
          chatId={currentChatId}
          userId={user.id}
        />
      )}

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
