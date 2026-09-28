"use client";

import { FC, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChat, Chat } from "@/context/chat-context";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Trash2, 
  LogOut, 
  MessageSquare, 
  LayoutGrid, 
  Settings, 
  BarChart3, 
  Edit,
  PanelLeft,
  MoreHorizontal,
  Check,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Brand } from "@/components/ui/brand";
import { updateChat } from "@/db";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: FC<SidebarProps> = ({
  onNewChat,
  onDeleteChat,
  onSelectChat,
  collapsed = false,
  onToggleCollapse
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const {
    chats,
    setChats,
    currentChatId,
    searchTerm,
    setSearchTerm,
  } = useChat();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"chats" | "templates" | "settings" | "analytics">("chats");

  // Inline Title Editing State
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const effectiveActiveTab = pathname === "/analytics"
    ? "analytics"
    : pathname === "/account"
    ? "settings"
    : pathname.startsWith("/templates")
    ? "templates"
    : activeTab;

  const handleNavClick = (id: string) => {
    setActiveTab(id as any);
    if (id === "chats") {
      router.push("/dashboard");
    } else if (id === "analytics") {
      router.push("/analytics");
    } else if (id === "templates") {
      router.push("/templates");
    } else if (id === "settings") {
      router.push("/account");
    }
  };

  const handleStartEdit = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const handleSaveEdit = async (chatId: string) => {
    if (!editingTitle.trim()) return;
    const finalTitle = editingTitle.trim();
    try {
      await updateChat(chatId, { title: finalTitle });
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title: finalTitle } : c))
      );
    } catch (e) {
      console.error("Failed to update chat title", e);
    } finally {
      setEditingChatId(null);
      setEditingTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const NAV_ITEMS = [
    { id: "chats", label: "Chats", icon: <MessageSquare className="h-4 w-4 shrink-0" /> },
    { id: "templates", label: "Templates", icon: <LayoutGrid className="h-4 w-4 shrink-0" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4 shrink-0" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4 shrink-0" /> },
  ];

  return (
    <div
      className={`flex h-full flex-col border-r transition-all duration-200 ease-in-out font-sans ${
        collapsed ? "w-[68px]" : "w-[280px]"
      } bg-[#f8fafc] dark:bg-[#070a12] border-border text-foreground shrink-0`}
    >
      {/* Top Header: Brand Logo + Compose & Sidebar Toggle Icons */}
      <div className="flex items-center justify-between border-b border-border px-3 py-3 h-[60px]">
        <div className="flex items-center gap-2 overflow-hidden">
          <Brand size="sm" showText={!collapsed} />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!collapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
              onClick={onNewChat}
              title="New chat"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      {!collapsed ? (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-background dark:bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-[#f5a623]/40 rounded-xl"
            />
          </div>
        </div>
      ) : (
        <div className="p-3 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 5 Main Icon Navigation Items */}
      <div className="px-3 py-1 space-y-1">
        {!collapsed && (
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            Navigation
          </div>
        )}
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            title={collapsed ? item.label : undefined}
            className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] transition-all ${
              collapsed ? "justify-center" : ""
            } ${
              effectiveActiveTab === item.id
                ? "bg-[#f5a623]/12 text-[#b8740c] dark:bg-[#f5a623]/15 dark:text-[#f5a623] font-medium border border-[#f5a623]/25 dark:border-[#f5a623]/30 shadow-sm"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-normal"
            }`}
          >
            {item.icon}
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      {/* Chats Section / History */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        {!collapsed && (
          <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider px-2 py-1.5">
            Chats
          </div>
        )}
        {filteredChats.map((chat) => {
          const isSelected = currentChatId === chat.id;
          const isEditing = editingChatId === chat.id;

          if (isEditing && !collapsed) {
            return (
              <div key={chat.id} className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-background border border-[#f5a623]/50">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(chat.id);
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="h-7 text-xs bg-transparent border-0 focus-visible:ring-0 px-1 text-foreground"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(chat.id)}
                  className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                  title="Save"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-muted-foreground hover:text-foreground"
                  title="Cancel"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              title={collapsed ? chat.title : undefined}
              className={`group relative flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-[12.5px] transition-all ${
                collapsed ? "justify-center" : ""
              } ${
                isSelected 
                  ? "bg-[#f5a623]/12 text-[#b8740c] dark:bg-[#f5a623]/15 dark:text-[#f5a623] font-medium border border-[#f5a623]/25 dark:border-[#f5a623]/30" 
                  : "text-muted-foreground hover:bg-muted/40 hover:text-foreground font-normal"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70" />
                {!collapsed && <span className="truncate">{chat.title}</span>}
              </div>
              
              {!collapsed && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 shrink-0 transition-opacity ${
                        isSelected ? "opacity-100 text-[#b8740c] dark:text-[#f5a623]" : "opacity-0 group-hover:opacity-100 text-muted-foreground"
                      } hover:text-foreground hover:bg-muted/60 rounded-md`}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 bg-card border-border text-foreground">
                    <DropdownMenuItem 
                      className="text-xs cursor-pointer hover:bg-muted flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(chat);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit message</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-xs cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete chat</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
        {filteredChats.length === 0 && !collapsed && (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No chats found.
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-border p-3 bg-background/50 dark:bg-card/40">
        <Link href="/account" className="block">
          <div className={`flex items-center gap-2.5 rounded-xl p-2 hover:bg-muted/50 transition-colors cursor-pointer group ${collapsed ? "justify-center" : ""}`}>
            <Avatar className="h-8 w-8 border border-border shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[#f5a623]/15 text-[#f5a623] text-xs font-medium">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-[12.5px] font-medium text-foreground leading-tight">
                    {user?.name || "salman"}
                  </span>
                  <span className="truncate text-[11px] font-normal text-muted-foreground leading-tight">
                    {user?.email || "salman@gmail.com"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    logout();
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};
