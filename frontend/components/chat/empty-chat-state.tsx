"use client";

import { FC } from "react";
import { 
  FileText, 
  Pencil, 
  Laptop, 
  MessageSquare, 
  Briefcase, 
  PhoneCall 
} from "lucide-react";

interface EmptyChatStateProps {
  username: string;
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  {
    label: "Summarize this document",
    icon: <FileText className="h-5 w-5 text-[#2563eb] dark:text-slate-300" />,
    text: "Can you summarize this document for me?"
  },
  {
    label: "Help me write an email",
    icon: <Pencil className="h-5 w-5 text-[#2563eb] dark:text-blue-400" />,
    text: "I need help writing a professional email regarding..."
  },
  {
    label: "Generate React component",
    icon: <Laptop className="h-5 w-5 text-[#2563eb] dark:text-slate-300" />,
    text: "Create a modern React component for a..."
  },
  {
    label: "Explain this code",
    icon: <MessageSquare className="h-5 w-5 text-[#2563eb] dark:text-slate-300" />,
    text: "Can you explain how this code works?"
  },
  {
    label: "Create business proposal",
    icon: <Briefcase className="h-5 w-5 text-amber-500" />,
    text: "Help me draft a business proposal for..."
  },
  {
    label: "Fix bugs in my project",
    icon: <PhoneCall className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />,
    text: "I'm having an issue with my code, can you help me debug?"
  }
];

export const EmptyChatState: FC<EmptyChatStateProps> = ({
  username,
  onSuggestionClick
}) => {
  const displayUser = username || "salman";

  return (
    <div className="flex flex-col items-center justify-end w-full animate-in fade-in duration-500 font-sans pt-16 pb-4">
      <div className="mb-8 flex flex-col items-center text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl text-[#0f172a] dark:text-white">
          Hello, <span className="text-[#2563eb] dark:text-[#3b82f6]">{displayUser}</span>
        </h1>
        
        <p className="text-lg text-[#64748b] dark:text-slate-400 font-normal">
          How can I help you today?
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group relative flex flex-col gap-3 rounded-2xl border border-[#e2e8f0] dark:border-slate-800/80 bg-white dark:bg-[#0e1626]/80 p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:bg-[#f8fafc] dark:hover:bg-[#152138] hover:border-[#cbd5e1] dark:hover:border-slate-700 shadow-md dark:shadow-xl shadow-slate-200/50 dark:shadow-blue-500/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f5f9] dark:bg-slate-800/80 transition-colors">
              {suggestion.icon}
            </div>
            
            <div className="flex flex-col">
              <span className="font-semibold text-[#0f172a] dark:text-slate-100 text-sm">{suggestion.label}</span>
              <span className="text-xs text-[#64748b] dark:text-slate-400 mt-1">
                Click to try this prompt
              </span>
            </div>
            
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-blue-500/20 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};
