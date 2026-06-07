"use client";

import { FC, useState } from "react";
import { useChat } from "@/context/chat-context";
import { SidebarSwitcher } from "./sidebar-switcher";
import { Button } from "@/components/ui/button";
import { Plus, Search, Trash2 } from "lucide-react";
import { 
  IconMessage, 
  IconPencil, 
  IconAdjustmentsHorizontal 
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brand } from "@/components/ui/brand";
import Link from "next/link";

interface SidebarProps {
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
}

export const Sidebar: FC<SidebarProps> = ({
  onNewChat,
  onDeleteChat,
  onSelectChat
}) => {
  const {
    chats,
    currentChatId,
    searchTerm,
    setSearchTerm,
    contentType,
    setContentType,
    prompts,
    presets,
    folders
  } = useChat();
  const { user } = useAuth();

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPrompts = prompts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPresets = presets.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    switch (contentType) {
      case "chats":
        return (
          <div className="space-y-2">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`group relative flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  currentChatId === chat.id 
                    ? "bg-secondary font-medium" 
                    : "hover:bg-muted/70"
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <IconMessage size={18} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </div>
                <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredChats.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground italic">
                No chats found.
              </div>
            )}
          </div>
        );
      case "prompts":
        return (
          <div className="space-y-2">
            {filteredPrompts.map((prompt) => (
              <div
                key={prompt.id}
                className="group relative flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all hover:bg-muted/70"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <IconPencil size={18} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{prompt.name}</span>
                </div>
                <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredPrompts.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground italic">
                No prompts found.
              </div>
            )}
          </div>
        );
      case "presets":
        return (
          <div className="space-y-2">
            {filteredPresets.map((preset) => (
              <div
                key={preset.id}
                className="group relative flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all hover:bg-muted/70"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <IconAdjustmentsHorizontal size={18} className="text-muted-foreground shrink-0" />
                  <span className="truncate">{preset.name}</span>
                </div>
                <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredPresets.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground italic">
                No presets found.
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground italic">
            {contentType.charAt(0).toUpperCase() + contentType.slice(1)} items coming soon...
          </div>
        );
    }
  };

  return (
    <div className="flex h-full border-r border-border bg-background">
      <SidebarSwitcher
        contentType={contentType}
        onContentTypeChange={setContentType}
      />

      <div className="flex w-[280px] flex-col overflow-hidden">
        {/* Workspace/Brand Header */}
        <div className="flex items-center justify-between border-b border-border p-3 h-[60px]">
          <div className="flex items-center gap-2 font-bold">
            <Brand size="sm" showText={false} />
            <span className="text-sm">MultiTurn AI</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <IconAdjustmentsHorizontal size={20} />
          </Button>
        </div>

        {/* Action Buttons & Search */}
        <div className="p-4 space-y-3">
          <Button 
            className="w-full justify-start gap-3 bg-primary/10 text-primary hover:bg-primary/20 border-none shadow-none font-medium h-11" 
            onClick={onNewChat}
          >
            <Plus className="h-5 w-5" />
            {contentType === "chats" ? "New chat" : 
             contentType === "prompts" ? "New prompt" : 
             contentType === "presets" ? "New preset" : "New item"}
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${contentType}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-sm bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
          {renderContent()}
        </div>

        {/* User Profile Section */}
        <div className="border-t border-border p-3 bg-muted/10">
          <div className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors cursor-pointer group">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col overflow-hidden text-xs">
              <span className="truncate font-semibold text-foreground">{user?.name || "User"}</span>
              <span className="truncate text-muted-foreground/80">{user?.email}</span>
            </div>
            <IconAdjustmentsHorizontal size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
};
