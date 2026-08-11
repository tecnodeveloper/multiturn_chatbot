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
    <div className="p-4 bg-[#f8fafc] dark:bg-[#070a12] font-sans border-t border-[#e2e8f0] dark:border-slate-800/60">
      <div className="mx-auto max-w-4xl">
        {isLocked && (
          <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2 animate-pulse">
            <Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Chat is locked. Please complete the mandatory 4-scale evaluation panel above to continue.</span>
          </div>
        )}

        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((item) => (
              <div
                key={item.record.id}
                className="flex items-center gap-2 rounded-lg bg-white dark:bg-slate-900 px-3 py-1.5 text-xs border border-[#cbd5e1] dark:border-slate-800 text-[#0f172a] dark:text-slate-300 shadow-sm"
              >
                <FileText className="h-3.5 w-3.5 text-[#2563eb]" />
                <span className="max-w-[150px] truncate">{item.record.name}</span>
                <button
                  onClick={() =>
                    setAttachedFiles((prev) =>
                      prev.filter((f) => f.record.id !== item.record.id)
                    )
                  }
                  className="text-[#64748b] dark:text-slate-500 hover:text-[#0f172a] dark:hover:text-slate-300"
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
              className="h-14 pl-12 pr-4 text-sm rounded-2xl border-[#e2e8f0] dark:border-slate-800/80 bg-white dark:bg-[#0c1322] text-[#0f172a] dark:text-slate-100 placeholder:text-[#64748b] dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500/50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSending || isLocked}
            />
            <div className="absolute left-3 flex items-center">
              <label className={`rounded-xl p-1.5 transition-colors ${isLocked ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-[#e2e8f0]/60 dark:hover:bg-slate-800/60"}`}>
                <Paperclip className="h-5 w-5 text-[#64748b] dark:text-slate-400" />
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
            className="h-12 w-12 rounded-full bg-[#2563eb] hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 shrink-0 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed" 
            disabled={!message.trim() || isSending || isLocked}
          >
            <Send className="h-5 w-5 fill-current" />
          </Button>
        </form>
        <p className="mt-3 text-center text-[11px] text-[#64748b] dark:text-slate-500 font-normal">
          MultiTurn AI enforces evaluation quality checks every 2 chat turns.
        </p>
      </div>
    </div>
  );
};

