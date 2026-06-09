"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { ContentType } from "@/types";

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface ChatContextType {
  chats: Chat[];
  setChats: Dispatch<SetStateAction<Chat[]>>;
  currentChatId: string | null;
  setCurrentChatId: Dispatch<SetStateAction<string | null>>;
  isSending: boolean;
  setIsSending: Dispatch<SetStateAction<boolean>>;
  selectedProvider: string;
  setSelectedProvider: Dispatch<SetStateAction<string>>;
  selectedModel: string;
  setSelectedModel: Dispatch<SetStateAction<string>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  contentType: ContentType;
  setContentType: Dispatch<SetStateAction<ContentType>>;
  userInput: string;
  setUserInput: Dispatch<SetStateAction<string>>;
  prompts: any[];
  setPrompts: Dispatch<SetStateAction<any[]>>;
  presets: any[];
  setPresets: Dispatch<SetStateAction<any[]>>;
  folders: any[];
  setFolders: Dispatch<SetStateAction<any[]>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("Groq");
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");
  const [searchTerm, setSearchTerm] = useState("");
  const [contentType, setContentType] = useState<ContentType>("chats");
  const [userInput, setUserInput] = useState("");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [presets, setPresets] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        setChats,
        currentChatId,
        setCurrentChatId,
        isSending,
        setIsSending,
        selectedProvider,
        setSelectedProvider,
        selectedModel,
        setSelectedModel,
        searchTerm,
        setSearchTerm,
        contentType,
        setContentType,
        userInput,
        setUserInput,
        prompts,
        setPrompts,
        presets,
        setPresets,
        folders,
        setFolders,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
