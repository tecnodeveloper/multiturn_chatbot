"use client";

import { FC, useRef, useEffect, useState } from "react";
import { Message } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { EmptyChatState } from "./empty-chat-state";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { FeedbackPanel } from "../feedback/feedback-panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MessageListProps {
  messages: Message[];
  isSending: boolean;
  onNewChat: () => void;
  onSuggestionClick: (suggestion: string) => void;
  chatId?: string;
}

const AssistantMessage: FC<{ content: string }> = ({ content }) => {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  return (
    <div className="flex gap-3 justify-start group">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0 shadow-sm">
        AI
      </div>
      <div className="flex flex-col gap-1 max-w-2xl">
        <div className="relative rounded-2xl rounded-bl-md bg-background border border-border px-4 py-3 shadow-sm text-sm">
          <ReactMarkdown className="prose dark:prose-invert max-w-none break-words leading-6 pb-6">
            {content}
          </ReactMarkdown>
          
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
              className={`p-1 rounded-md transition-colors ${
                feedback === 'up' 
                  ? "text-[#a8c686] bg-[#a8c686]/10" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ThumbsUp 
                className="h-4 w-4" 
                fill={feedback === 'up' ? "#a8c686" : "none"} 
              />
            </button>
            <button
              onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
              className={`p-1 rounded-md transition-colors ${
                feedback === 'down' 
                  ? "text-[#e57373] bg-[#e57373]/10" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              }`}
            >
              <ThumbsDown 
                className="h-4 w-4" 
                fill={feedback === 'down' ? "#e57373" : "none"} 
              />
            </button>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
        navigator.clipboard.writeText(content);
      }}>
        <Copy className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const MessageList: FC<MessageListProps> = ({
  messages,
  isSending,
  onNewChat,
  onSuggestionClick,
  chatId
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
        const showFeedback = messageCount % 4 === 0;

        return (
          <div key={`${item.role}-${index}`} className="flex flex-col gap-4">
            {isAssistant ? (
              <AssistantMessage content={item.content} />
            ) : (
              <div className="flex gap-3 justify-end">
                <div className="max-w-2xl rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-3 shadow-sm text-sm">
                  <ReactMarkdown className="prose prose-invert max-w-none break-words leading-6">
                    {item.content}
                  </ReactMarkdown>
                </div>
                <Avatar className="h-9 w-9 flex-shrink-0 border border-primary/20 shadow-sm">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
            
            {showFeedback && chatId && (
              <FeedbackPanel chatId={chatId} />
            )}
          </div>
        );
      })}

      {isSending && (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            AI
          </div>
          <div className="rounded-2xl rounded-bl-md bg-background border border-border px-4 py-3 shadow-sm">
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:120ms]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:240ms]" />
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
