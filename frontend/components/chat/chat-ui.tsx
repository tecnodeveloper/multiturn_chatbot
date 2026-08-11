"use client";

import { FC } from "react";
import { useChat } from "@/context/chat-context";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface ChatUIProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onSendMessage: (content: string) => void;
  onFileUpload: (file: File) => void;
  onNewChat: () => void;
  attachedFiles: any[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<any[]>>;
  isInputLocked?: boolean;
  onFeedbackSubmitted?: () => void;
}

export const ChatUI: FC<ChatUIProps> = ({
  sidebarOpen,
  setSidebarOpen,
  onSendMessage,
  onFileUpload,
  onNewChat,
  attachedFiles,
  setAttachedFiles,
  isInputLocked = false,
  onFeedbackSubmitted
}) => {
  const {
    chats,
    currentChatId,
    isSending,
    setUserInput
  } = useChat();

  const currentChat = chats.find(c => c.id === currentChatId);

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
  };

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-[#f8fafc] dark:bg-[#070a12] font-sans h-full overflow-hidden text-[#0f172a] dark:text-foreground">
      {/* Sidebar Toggle Floating Button (when sidebar collapsed) */}
      {!sidebarOpen && (
        <Button
          className="absolute left-[8px] top-[14px] z-50 size-[32px] cursor-pointer rounded-full border border-[#cbd5e1] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md transition-all duration-200 hover:scale-110 hover:bg-[#f1f5f9] dark:hover:bg-slate-800"
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
        >
          <ChevronRight size={24} className="text-[#0f172a] dark:text-slate-300" />
        </Button>
      )}

      {/* Header: Centered New Chat Title & Top Right Corner Theme Toggle */}
      <header className="flex max-h-[60px] min-h-[60px] w-full items-center justify-between border-b border-[#e2e8f0] dark:border-slate-800/60 px-6 relative bg-white dark:bg-[#070a12] shrink-0">
        <div className="w-[80px]" />

        <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-bold text-[#0f172a] dark:text-slate-100 text-center">
          {currentChat?.title || "New Chat"}
        </h1>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-[#070a12] custom-scrollbar min-h-0">
        <div className="mx-auto max-w-5xl w-full py-6 px-4">
          <MessageList
            messages={currentChat?.messages || []}
            isSending={isSending}
            onNewChat={onNewChat}
            onSuggestionClick={handleSuggestionClick}
            chatId={currentChatId || undefined}
            onFeedbackSubmitted={onFeedbackSubmitted}
          />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={onSendMessage}
        onFileUpload={onFileUpload}
        attachedFiles={attachedFiles}
        setAttachedFiles={setAttachedFiles}
        isLocked={isInputLocked}
      />
    </main>
  );
};

