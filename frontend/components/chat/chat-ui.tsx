"use client";

import { FC } from "react";
import { useChat } from "@/context/chat-context";
import { MessageList } from "./message-list";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles, ChevronDown, Check, MessageSquare, Plus } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AI_PROVIDERS } from "@/lib/ai-providers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatUIProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onSendMessage: (content: string) => void;
  onFileUpload: (file: File) => void;
  onNewChat: () => void;
  attachedFiles: any[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<any[]>>;
  isInputLocked?: boolean;
  onFeedbackSubmitted?: (messageId?: string) => void;
  evaluatedMessageIds?: Set<string>;
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
  onFeedbackSubmitted,
  evaluatedMessageIds
}) => {
  const {
    chats,
    currentChatId,
    isSending,
    setUserInput,
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
  } = useChat();

  const currentChat = chats.find(c => c.id === currentChatId);
  const currentProviderObj = AI_PROVIDERS.find(p => p.id === selectedProvider);
  const currentModelObj = currentProviderObj?.models.find(m => m.id === selectedModel);
  const currentModelDisplayName = currentModelObj?.name || selectedModel;

  const handleSuggestionClick = (suggestion: string) => {
    setUserInput(suggestion);
  };

  return (
    <main className="relative flex min-w-0 flex-1 flex-col bg-[#f8fafc] dark:bg-[#070a12] font-sans h-full overflow-hidden text-foreground">
      {/* Three-Zone Header: Left (Model selector), Center (Chat title anchor), Right (Control cluster) */}
      <header className="flex max-h-[60px] min-h-[60px] w-full items-center justify-between border-b border-border px-4 sm:px-6 relative bg-card/80 backdrop-blur-md shrink-0">
        {/* Left Zone — Model selector & navigation */}
        <div className="flex items-center gap-2 z-10 min-w-[120px] sm:min-w-[180px]">
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 rounded-xl border-border bg-background/60 hover:bg-muted/50 hover:border-[#f5a623]/30 px-3 text-[12.5px] font-normal text-foreground shadow-sm transition-all duration-150"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#f5a623]" />
                <span className="font-medium text-[#f5a623]">{selectedProvider}:</span>
                <span className="max-w-[120px] sm:max-w-[160px] truncate">{currentModelDisplayName}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72 max-h-[420px] overflow-y-auto bg-card border-border text-foreground">
              {AI_PROVIDERS.map((provider) => (
                <div key={provider.id}>
                  <DropdownMenuLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1">
                    {provider.name}
                  </DropdownMenuLabel>
                  {provider.models.map((model) => {
                    const isSelected = selectedProvider === provider.id && selectedModel === model.id;
                    return (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => {
                          setSelectedProvider(provider.id);
                          setSelectedModel(model.id);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-[#f5a623]/12 text-[#b8740c] dark:bg-[#f5a623]/15 dark:text-[#f5a623] font-medium"
                            : "text-foreground hover:bg-muted/60"
                        }`}
                      >
                        <span className="truncate">{model.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-[#f5a623] shrink-0 ml-1.5" />}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center Zone — Current chat title anchor */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 text-center pointer-events-none max-w-[45%] truncate">
          <div className="p-1 rounded-md bg-[#f5a623]/10 text-[#f5a623] shrink-0 hidden sm:flex">
            <MessageSquare className="h-3.5 w-3.5" />
          </div>
          <h1 className="text-[14px] sm:text-[15px] font-medium text-foreground tracking-tight truncate">
            {currentChat?.title || "New chat"}
          </h1>
        </div>

        {/* Right Zone — Control cluster */}
        <div className="flex items-center justify-end gap-1.5 z-10 min-w-[120px] sm:min-w-[180px]">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl border border-border bg-background/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
            onClick={onNewChat}
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <div className="flex items-center">
            <ThemeToggle />
          </div>
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
            evaluatedMessageIds={evaluatedMessageIds}
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
