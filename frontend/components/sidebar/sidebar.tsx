"use client";

import { FC, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useChat, Chat } from "@/context/chat-context";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Trash2, 
  LogOut, 
  Folder, 
  MessageSquare, 
  LayoutGrid, 
  Settings, 
  Users, 
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
  const [activeTab, setActiveTab] = useState<"projects" | "chats" | "templates" | "settings" | "teams">("chats");

  // Inline Title Editing State
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const effectiveActiveTab = pathname === "/projects" ? "projects" : activeTab;

  const handleNavClick = (id: string) => {
    setActiveTab(id as any);
    if (id === "projects") {
      router.push("/projects");
    } else if (id === "chats") {
      router.push("/dashboard");
    } else if (id === "analytics") {
      router.push("/analytics");
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
    { id: "projects", label: "My projects", icon: <Folder className="h-4 w-4 shrink-0" /> },
    { id: "chats", label: "Chats", icon: <MessageSquare className="h-4 w-4 shrink-0" /> },
    { id: "templates", label: "Templates", icon: <LayoutGrid className="h-4 w-4 shrink-0" /> },
    { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4 shrink-0" /> },
    { id: "teams", label: "Teams", icon: <Users className="h-4 w-4 shrink-0" /> },
  ];

  return (
    <div
      className={`flex h-full flex-col border-r transition-all duration-200 ease-in-out font-sans ${
        collapsed ? "w-[68px]" : "w-[280px]"
      } bg-[#f1f5f9] dark:bg-[#080c14] border-[#e2e8f0] dark:border-slate-800/60 text-[#0f172a] dark:text-foreground shrink-0`}
    >
      {/* Top Header: Brand Logo + Compose & Sidebar Toggle Icons */}
      <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-slate-800/50 px-3 py-3 h-[60px]">
        <div className="flex items-center gap-2 overflow-hidden">
          <Brand size="sm" showText={!collapsed} />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!collapsed && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 rounded-lg transition-colors"
              onClick={onNewChat}
              title="New Chat"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0]/60 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/60 rounded-lg transition-colors"
            onClick={onToggleCollapse}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Input */}
      {!collapsed ? (
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b] dark:text-slate-500" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs bg-white dark:bg-slate-900/60 border-[#cbd5e1] dark:border-slate-800 text-[#0f172a] dark:text-slate-200 placeholder:text-[#64748b] dark:placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500/50 rounded-xl"
            />
          </div>
        </div>
      ) : (
        <div className="p-3 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-[#64748b] hover:text-[#0f172a] dark:text-slate-400 dark:hover:text-white"
            title="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 5 Main Icon Navigation Items */}
      <div className="px-3 py-1 space-y-1">
        {!collapsed && (
          <div className="text-[11px] font-semibold text-[#64748b] dark:text-slate-500 uppercase tracking-wider px-2 py-1">
            Settings
          </div>
        )}
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            title={collapsed ? item.label : undefined}
            className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              collapsed ? "justify-center" : ""
            } ${
              effectiveActiveTab === item.id
                ? "bg-[#dbeafe] text-[#2563eb] font-semibold border border-[#bfdbfe] dark:bg-slate-800/80 dark:text-white dark:border-slate-700/50 shadow-sm"
                : "text-[#64748b] hover:bg-[#e2e8f0]/60 hover:text-[#0f172a] dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
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
          <div className="text-[11px] font-semibold text-[#64748b] dark:text-slate-500 uppercase tracking-wider px-2 py-1">
            Chats
          </div>
        )}
        {filteredChats.map((chat) => {
          const isSelected = currentChatId === chat.id;
          const isEditing = editingChatId === chat.id;

          if (isEditing && !collapsed) {
            return (
              <div key={chat.id} className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-blue-400">
                <Input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit(chat.id);
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                  className="h-7 text-xs bg-transparent border-0 focus-visible:ring-0 px-1 text-[#0f172a] dark:text-white"
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
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
              className={`group relative flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                collapsed ? "justify-center" : ""
              } ${
                isSelected 
                  ? "bg-[#dbeafe] text-[#2563eb] font-semibold border border-[#bfdbfe] dark:bg-slate-800/80 dark:text-white dark:border-slate-700/40" 
                  : "text-[#64748b] hover:bg-[#e2e8f0]/50 hover:text-[#0f172a] dark:text-slate-400 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-80" />
                {!collapsed && <span className="truncate">{chat.title}</span>}
              </div>
              
              {!collapsed && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-6 w-6 shrink-0 transition-opacity ${
                        isSelected ? "opacity-100 text-[#2563eb] dark:text-slate-300" : "opacity-0 group-hover:opacity-100 text-[#64748b] dark:text-slate-400"
                      } hover:text-[#0f172a] hover:bg-[#cbd5e1]/50 dark:hover:text-white dark:hover:bg-slate-700/50 rounded-md`}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 bg-white dark:bg-slate-900 border-[#e2e8f0] dark:border-slate-800 text-[#0f172a] dark:text-slate-200">
                    <DropdownMenuItem 
                      className="text-xs cursor-pointer hover:bg-[#f1f5f9] dark:hover:bg-slate-800 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(chat);
                      }}
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Edit Message</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-xs cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-300 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Chat</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
        {filteredChats.length === 0 && !collapsed && (
          <div className="p-4 text-center text-xs text-[#64748b] dark:text-slate-500 italic">
            No chats found.
          </div>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-[#e2e8f0] dark:border-slate-800/50 p-3 bg-white/50 dark:bg-slate-950/40">
        <Link href="/account" className="block">
          <div className={`flex items-center gap-3 rounded-xl p-2 hover:bg-[#e2e8f0]/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group ${collapsed ? "justify-center" : ""}`}>
            <Avatar className="h-8 w-8 border border-[#cbd5e1] dark:border-slate-700/60 shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : user?.email?.charAt(0).toUpperCase() || "S"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-xs font-bold text-[#0f172a] dark:text-slate-200 leading-tight">
                    {user?.name || "salman"}
                  </span>
                  <span className="truncate text-[10px] text-[#64748b] dark:text-slate-400 leading-tight">
                    {user?.email || "salman@gmail.com"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#64748b] dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 shrink-0"
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
