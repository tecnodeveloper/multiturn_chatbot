"use client";

import { FC, useRef, useEffect, useState } from "react";
import { Message } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { EmptyChatState } from "./empty-chat-state";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, AlertTriangle, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FeedbackPanel } from "../feedback/feedback-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageListProps {
  messages: Message[];
  isSending: boolean;
  onNewChat: () => void;
  onSuggestionClick: (suggestion: string) => void;
  chatId?: string;
  onFeedbackSubmitted?: () => void;
}

const AssistantMessage: FC<{ content: string }> = ({ content }) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const isError = content.startsWith("⚠️") || content.includes("Error 404") || content.includes("Error 503") || content.startsWith("Error:");

  if (isError) {
    return (
      <div className="flex gap-3 justify-start group">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive/15 text-destructive text-xs font-semibold flex-shrink-0 shadow-sm border border-destructive/20">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="flex flex-col gap-1 max-w-2xl w-full">
          <div className="rounded-2xl rounded-tl-sm bg-destructive/10 dark:bg-destructive/15 border border-destructive/30 px-4 py-3.5 shadow-sm text-[14px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-destructive/20 text-destructive border border-destructive/30">
                <AlertCircle className="h-3.5 w-3.5" />
                API Error
              </span>
              <span className="text-xs text-muted-foreground font-mono">Status 404 / 503 Timeout</span>
            </div>
            <div className="text-foreground dark:text-foreground text-[14px] leading-6 space-y-2">
              <ReactMarkdown className="prose dark:prose-invert max-w-none break-words text-[14px] leading-6">
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-start group">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5a623] text-[#0f1117] text-xs font-medium flex-shrink-0 shadow-sm">
        AI
      </div>
      <div className="flex flex-col gap-1 max-w-2xl">
        <div className="relative rounded-2xl rounded-tl-sm bg-white dark:bg-[#10141e] border border-border text-foreground px-4 py-3 shadow-sm text-[14.5px] leading-6">
          <ReactMarkdown className="prose dark:prose-invert max-w-none break-words leading-6 pb-6 text-[14.5px]">
            {content}
          </ReactMarkdown>
          
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={`p-1 rounded-md transition-colors ${
                feedback === 'up' 
                  ? "text-[#f5a623] bg-[#f5a623]/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title="Helpful response"
            >
              <ThumbsUp 
                className="h-3.5 w-3.5" 
                fill={feedback === 'up' ? "#f5a623" : "none"} 
              />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={`p-1 rounded-md transition-colors ${
                feedback === 'down' 
                  ? "text-muted-foreground bg-muted" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title="Not helpful response"
            >
              <ThumbsDown 
                className="h-3.5 w-3.5" 
                fill={feedback === 'down' ? "currentColor" : "none"} 
              />
            </button>
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground rounded-lg" 
        onClick={() => {
          navigator.clipboard.writeText(content);
        }}
        title="Copy response"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};

export const MessageList: FC<MessageListProps> = ({
  messages,
  isSending,
  onNewChat,
  onSuggestionClick,
  chatId,
  onFeedbackSubmitted
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  if (messages.length === 0) {
    return (
      <EmptyChatState 
        username={user?.name || user?.email?.split('@')[0] || "there"} 
        onSuggestionClick={onSuggestionClick}
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {messages.map((item, index) => {
        const isAssistant = item.role === "assistant";
        const messageCount = index + 1;
        // Trigger mandatory feedback after every 2 turns (2 user + 2 assistant = 4 messages)
        const showFeedback = isAssistant && messageCount % 4 === 0;

        return (
          <div key={`${item.role}-${index}`} className="flex flex-col gap-4">
            {isAssistant ? (
              <AssistantMessage content={item.content} />
            ) : (
              <div className="flex gap-3 justify-end">
                <div className="max-w-2xl rounded-2xl rounded-tr-sm bg-slate-200/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 border border-slate-300/60 dark:border-slate-700/60 px-4 py-3 shadow-sm text-[14.5px] leading-6">
                  <ReactMarkdown className="prose dark:prose-invert max-w-none break-words leading-6 text-[14.5px]">
                    {item.content}
                  </ReactMarkdown>
                </div>
                <Avatar className="h-8 w-8 flex-shrink-0 border border-border shadow-sm">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            {showFeedback && chatId && (
              <FeedbackPanel 
                chatId={chatId} 
                messageId={item.id} 
                onSubmitted={onFeedbackSubmitted}
              />
            )}
          </div>
        );
      })}

      {isSending && (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f5a623] text-[#0f1117] text-xs font-medium shadow-sm">
            AI
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3 shadow-sm">
            <div className="flex gap-1.5 items-center">
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#f5a623]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#f5a623] [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[#f5a623] [animation-delay:240ms]" />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
