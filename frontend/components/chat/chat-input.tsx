"use client";

import { FC, useRef, useState } from "react";
import { useChat } from "@/context/chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, X, FileText } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onFileUpload: (file: File) => void;
  attachedFiles: any[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<any[]>>;
}

export const ChatInput: FC<ChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  attachedFiles,
  setAttachedFiles
}) => {
  const { isSending, userInput: message, setUserInput: setMessage } = useChat();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;
    onSendMessage(message);
    setMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="mx-auto max-w-4xl">
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((item) => (
              <div
                key={item.record.id}
                className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs border border-border"
              >
                <FileText className="h-3.5 w-3.5" />
                <span className="max-w-[150px] truncate">{item.record.name}</span>
                <button
                  onClick={() =>
                    setAttachedFiles((prev) =>
                      prev.filter((f) => f.record.id !== item.record.id)
                    )
                  }
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex w-full gap-3">
          <div className="relative flex flex-1 items-center">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message MultiTurn AI..."
              className="h-12 pl-12 rounded-xl border-border bg-background focus:ring-1 focus:ring-primary"
              disabled={isSending}
            />
            <div className="absolute left-2 flex items-center">
              <label className="cursor-pointer rounded-full p-2 hover:bg-muted transition-colors">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSending}
                />
              </label>
            </div>
          </div>
          <Button type="submit" className="h-12 w-12 rounded-xl" disabled={!message.trim() || isSending}>
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
