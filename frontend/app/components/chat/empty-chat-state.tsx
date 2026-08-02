"use client";

import { FC } from "react";
import { Brand } from "@/components/ui/brand";
import { 
  MessageSquare, 
  FileText, 
  Code, 
  PenTool, 
  Briefcase, 
  Bug 
} from "lucide-react";

interface EmptyChatStateProps {
  username: string;
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  {
    label: "Summarize this document",
    icon: <FileText className="h-5 w-5 text-blue-500" />,
    text: "Can you summarize this document for me?"
  },
  {
    label: "Help me write an email",
    icon: <PenTool className="h-5 w-5 text-orange-500" />,
    text: "I need help writing a professional email regarding..."
  },
  {
    label: "Generate React component",
    icon: <Code className="h-5 w-5 text-cyan-500" />,
    text: "Create a modern React component for a..."
  },
  {
    label: "Explain this code",
    icon: <MessageSquare className="h-5 w-5 text-green-500" />,
    text: "Can you explain how this code works?"
  },
  {
    label: "Create business proposal",
    icon: <Briefcase className="h-5 w-5 text-purple-500" />,
    text: "Help me draft a business proposal for..."
  },
  {
    label: "Fix bugs in my project",
    icon: <Bug className="h-5 w-5 text-red-500" />,
    text: "I'm having an issue with my code, can you help me debug?"
  }
];

export const EmptyChatState: FC<EmptyChatStateProps> = ({
  username,
  onSuggestionClick
}) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 animate-in fade-in duration-700">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-6 transform transition-transform hover:scale-110 duration-300">
          <Brand size="xl" showText={false} />
        </div>
        
        <h1 className="mb-2 text-4xl font-bold tracking-tight sm:text-5xl">
          Hello, <span className="text-primary">{username}</span>
        </h1>
        
        <p className="text-xl text-muted-foreground">
          How can I help you today?
        </p>
      </div>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className="group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left transition-all duration-200 hover:scale-[1.02] hover:bg-muted/50 hover:shadow-lg hover:shadow-primary/5 dark:border-[#262626]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted group-hover:bg-background transition-colors">
              {suggestion.icon}
            </div>
            
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{suggestion.label}</span>
              <span className="text-sm text-muted-foreground line-clamp-2">
                Click to try this prompt
              </span>
            </div>
            
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-primary/20 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
};
