"use client";

import { FC } from "react";
import { useChat } from "@/context/chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, X, FileText, Lock } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onFileUpload: (file: File) => void;
  attachedFiles: any[];
  setAttachedFiles: React.Dispatch<React.SetStateAction<any[]>>;
  isLocked?: boolean;
}

export const ChatInput: FC<ChatInputProps> = ({
  onSendMessage,
  onFileUpload,
  attachedFiles,
  setAttachedFiles,
  isLocked = false
}) => {
  const { isSending, userInput: message, setUserInput: setMessage } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending || isLocked) return;
    onSendMessage(message);
    setMessage("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !isLocked) {
      onFileUpload(file);
    }
  };

  return (
    <div className="p-4 bg-background border-t border-border font-sans">
      <div className="mx-auto max-w-4xl">
        {isLocked && (
          <div className="mb-3 p-3 rounded-xl bg-[#f5a623]/10 border border-[#f5a623]/30 text-[#f5a623] text-xs font-medium flex items-center gap-2">
            <Lock className="h-4 w-4 shrink-0 text-[#f5a623]" />
            <span>Chat is locked. Please complete the mandatory evaluation panel above to continue.</span>
          </div>
        )}

        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((item) => (
              <div
                key={item.record.id}
                className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 text-xs border border-border text-foreground shadow-sm"
              >
                <FileText className="h-3.5 w-3.5 text-[#f5a623]" />
                <span className="max-w-[150px] truncate">{item.record.name}</span>
                <button
                  onClick={() =>
                    setAttachedFiles((prev) =>
                      prev.filter((f) => f.record.id !== item.record.id)
                    )
                  }
                  className="text-muted-foreground hover:text-foreground"
                  disabled={isLocked}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex w-full items-center gap-3">
          <div className="relative flex flex-1 items-center">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isLocked ? "Chat locked until mandatory feedback is submitted..." : "Message MultiTurn AI..."}
              className="h-14 pl-12 pr-4 text-sm rounded-2xl border-border bg-card text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-[#f5a623]/40 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSending || isLocked}
            />
            <div className="absolute left-3 flex items-center">
              <label className={`rounded-xl p-1.5 transition-colors ${isLocked ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-muted/60"}`}>
                <Paperclip className="h-5 w-5 text-muted-foreground" />
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSending || isLocked}
                />
              </label>
            </div>
          </div>
          <Button 
            type="submit" 
            className="h-12 w-12 rounded-full bg-[#f5a623] hover:bg-[#e09612] text-[#0f1117] shadow-md shadow-[#f5a623]/15 shrink-0 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed" 
            disabled={!message.trim() || isSending || isLocked}
          >
            <Send className="h-5 w-5 fill-current" />
          </Button>
        </form>
      </div>
    </div>
  );
};
