"use client";

import { FC } from "react";
import { useChat } from "@/context/chat-context";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import { Button } from "@/components/ui/button";
import { IconChevronCompactRight, IconAdjustmentsHorizontal } from "@tabler/icons-react";

interface ChatUIProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onSendMessage: (content: string) => void;
  onFileUpload: (file: File) => void;
  onNewChat: () => void;
  attachedFiles: any[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<any[]>>;
}

export const ChatUI: FC<ChatUIProps> = ({
  sidebarOpen,
  setSidebarOpen,
  onSendMessage,
  onFileUpload,
  onNewChat,
  attachedFiles,
  setAttachedFiles
}) => {
  const {
    chats,
    currentChatId,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    isSending,
    setUserInput
  } = useChat();

  const currentChat = chats.find(c => c.id === currentChatId);

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
  };

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider && provider.models.length > 0) {
      setSelectedModel(provider.models[0].id);
    }
  };

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-background">
      {/* Sidebar Toggle Button */}
      <Button
        className="absolute left-[4px] top-[50%] z-50 size-[32px] cursor-pointer rounded-full border border-border bg-background shadow-md transition-all duration-200 hover:scale-110 hover:bg-muted"
        style={{
          transform: `translateY(-50%) rotate(${sidebarOpen ? "180deg" : "0deg"})`,
        }}
        variant="ghost"
        size="icon"
        onClick={() => setSidebarOpen(prev => !prev)}
      >
        <IconChevronCompactRight size={24} />
      </Button>

      {/* Header */}
      <header className="flex max-h-[60px] min-h-[60px] w-full items-center justify-between border-b border-border px-4 md:px-8">
        <div className="flex-1 overflow-hidden">
          <h1 className="text-sm font-bold truncate text-center md:text-base">
            {currentChat?.title || "MultiTurn AI Chat"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProvider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="hidden h-9 md:block rounded-md border border-border bg-muted/30 px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
          >
            {AI_PROVIDERS.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="h-9 rounded-md border border-border bg-muted/30 px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
          >
            {AI_PROVIDERS.find((p) => p.id === selectedProvider)?.models.map(
              (model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ),
            )}
          </select>
          
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
             <IconAdjustmentsHorizontal size={20} />
          </Button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-muted/5 custom-scrollbar">
        <div className="mx-auto max-w-5xl py-8 px-4">
          <MessageList
            messages={currentChat?.messages || []}
            isSending={isSending}
            onNewChat={onNewChat}
            onSuggestionClick={handleSuggestionClick}
          />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background py-4 px-4 md:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl">
          <ChatInput
            onSendMessage={onSendMessage}
            onFileUpload={onFileUpload}
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
          />
          <p className="mt-3 text-center text-[10px] text-muted-foreground/60 md:text-xs">
            MultiTurn AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </main>
  );
};
