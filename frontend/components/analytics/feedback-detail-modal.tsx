"use client";

import { FC } from "react";
import { X, User, Bot, Star, Clock, Tag, CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export interface FeedbackModalItem {
  id?: string;
  time: string;
  topic: string;
  preview: string;
  user_query?: string;
  model_response?: string;
  feedback: "up" | "down" | "none";
  status: string;
  rating: number;
  correctness?: string;
  length_type?: string;
}

interface FeedbackDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FeedbackModalItem | null;
}

export const FeedbackDetailModal: FC<FeedbackDetailModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  if (!isOpen || !item) return null;

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Correct":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
          </span>
        );
      case "Partial":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <HelpCircle className="w-3.5 h-3.5" /> Partial
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Incorrect
          </span>
        );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              {item.topic}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {item.time}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Rating & Evaluation Badges Summary */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">User Rating</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= item.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-300 dark:text-zinc-700"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {item.rating}/4
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Correctness</span>
              <div>{renderStatusBadge(item.status)}</div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Length Category</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 w-fit">
                {item.length_type || "To the Point"}
              </span>
            </div>
          </div>

          {/* User Query Block */}
          {item.user_query && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <User className="w-4 h-4 text-blue-500" />
                <span>User Prompt / Question</span>
              </div>
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-sm text-zinc-800 dark:text-zinc-200">
                {item.user_query}
              </div>
            </div>
          )}

          {/* Full AI Model Response Block */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <Bot className="w-4 h-4 text-purple-500" />
              <span>AI Model Response</span>
            </div>
            <div className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-800 dark:text-zinc-200 prose dark:prose-invert max-w-none">
              <ReactMarkdown>
                {item.model_response || item.preview || "No detailed model response recorded for this item."}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
          >
            Close Read-Only View
          </button>
        </div>
      </div>
    </div>
  );
};
