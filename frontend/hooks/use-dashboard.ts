"use client";

import { useAuth } from "@/context/auth-context";
import { useChat, Message } from "@/context/chat-context";
import { 
  createChat, 
  createMessage, 
  deleteChat, 
  getChats, 
  getMessagesByChatId, 
  updateChat, 
  uploadFile,
  getFileSignedUrl,
  getPrompts,
  getPresets,
  getFolders,
  createPrompt,
  updatePrompt,
  deletePrompt,
  createPreset,
  updatePreset,
  deletePreset,
  createFolder,
  updateFolder,
  deleteFolder
} from "@/db";
import { consumeReadableStream } from "@/lib/consume-stream";
import { convertFileToBase64 } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useDashboard() {
  const { user } = useAuth();
  const { 
    chats, setChats, 
    currentChatId, setCurrentChatId, 
    isSending, setIsSending,
    selectedProvider, selectedModel,
    setPrompts, setPresets, setFolders
  } = useChat();
  
  const [attachedFiles, setAttachedFiles] = useState<{record: any, file: File}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const [fetchedChats, fetchedPrompts, fetchedPresets, fetchedFolders] = await Promise.all([
          getChats(),
          getPrompts(),
          getPresets(),
          getFolders()
        ]);

        const chatsWithMessages = await Promise.all(
          fetchedChats.map(async (chat: any) => {
            const messages = await getMessagesByChatId(chat.id);
            return {
              id: chat.id,
              title: chat.title,
              createdAt: chat.created_at,
              messages: messages.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: m.created_at,
              })),
            };
          }),
        );
        setChats(chatsWithMessages);
        setPrompts(fetchedPrompts);
        setPresets(fetchedPresets);
        setFolders(fetchedFolders);

        if (chatsWithMessages.length > 0 && !currentChatId) {
          setCurrentChatId(chatsWithMessages[0].id);
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        toast.error("Failed to load your data");
      }
    };

    loadData();
  }, [user]);

  const handleNewChat = async () => {
    if (!user) return;
    try {
      const newChat = await createChat({ title: "New Chat", user_id: user.id });
      const nextChat = {
        id: newChat.id,
        title: newChat.title,
        messages: [],
        createdAt: newChat.created_at,
      };

      setChats([nextChat, ...chats]);
      setCurrentChatId(newChat.id);
    } catch (error) {
      toast.error("Failed to create new chat");
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      const updated = chats.filter((chat) => chat.id !== chatId);
      setChats(updated);

      if (currentChatId === chatId) {
        setCurrentChatId(updated[0]?.id ?? null);
      }
      toast.success("Chat deleted");
    } catch (error) {
      toast.error("Failed to delete chat");
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user || isSending) return;

    setIsSending(true);
    const userContent = content.trim();

    try {
      let chatId = currentChatId;
      let activeChat = chats.find(c => c.id === chatId);

      if (!chatId) {
        const newChat = await createChat({
          title: userContent.slice(0, 42),
          user_id: user.id,
        });
        chatId = newChat.id;
        activeChat = {
          id: newChat.id,
          title: newChat.title,
          messages: [],
          createdAt: newChat.created_at,
        };
        setChats([activeChat, ...chats]);
        setCurrentChatId(chatId);
      }

      // Convert attached images to base64 for the AI
      const imageAttachments = attachedFiles.filter(af => af.file.type.startsWith("image/"));
      const base64Images = await Promise.all(
        imageAttachments.map(af => convertFileToBase64(af.file))
      );

      // Create a complex content if images are present
      let messageContent: any = userContent;
      let displayContent = userContent;

      if (imageAttachments.length > 0) {
        messageContent = [
          { type: "text", text: userContent },
          ...base64Images.map(b64 => ({ type: "image", image: b64 }))
        ];
        
        // Append markdown images for display and persistence
        const imageUrls = await Promise.all(
          imageAttachments.map(af => getFileSignedUrl(af.record.path))
        );
        displayContent += "\n\n" + imageUrls.map(url => `![image](${url})`).join("\n");
      }

      const userMsg = await createMessage({
        chat_id: chatId!,
        role: "user",
        content: displayContent, 
        user_id: user.id,
      });

      const userMessage: Message = {
        id: userMsg.id,
        role: "user",
        content: displayContent,
        timestamp: userMsg.created_at,
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId ? { ...c, messages: [...c.messages, userMessage] } : c,
        ),
      );

      const controller = new AbortController();
      abortControllerRef.current = controller;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...(activeChat?.messages || []), { ...userMessage, content: messageContent }],
          provider: selectedProvider,
          model: selectedModel,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get AI response");
      }

      if (!response.body) throw new Error("No response body");

      const assistantId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? { ...c, messages: [...c.messages, assistantMessage] }
            : c,
        ),
      );

      let fullContent = "";

      await consumeReadableStream(
        response.body,
        (chunk) => {
          fullContent += chunk;
          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === assistantId ? { ...m, content: fullContent } : m,
                    ),
                  }
                : c,
            ),
          );
        },
        controller.signal,
      );

      const savedAssistantMsg = await createMessage({
        chat_id: chatId!,
        role: "assistant",
        content: fullContent,
        user_id: user.id,
      });

      setAttachedFiles([]);

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        id: savedAssistantMsg.id,
                        timestamp: savedAssistantMsg.created_at,
                      }
                    : m,
                ),
              }
            : c,
        ),
      );

      if (activeChat?.title === "New Chat") {
        const newTitle = userContent.slice(0, 42);
        await updateChat(chatId!, { title: newTitle });
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c)),
        );
      }

      const userMessageCount = [
        ...(activeChat?.messages || []),
        userMessage,
      ].filter((m) => m.role === "user").length;
      
      if (userMessageCount === 6) {
        setShowFeedbackModal(true);
      }

    } catch (error: any) {
      if (error.name !== "AbortError") {
        toast.error(error.message || "Failed to send message");
      }
    } finally {
      setIsSending(false);
      abortControllerRef.current = null;
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user) return;
    setIsUploading(true);
    try {
      let chatId = currentChatId;
      if (!chatId) {
        const newChat = await createChat({
          title: file.name.slice(0, 42),
          user_id: user.id,
        });
        chatId = newChat.id;
        setCurrentChatId(chatId);
        setChats([{
          id: newChat.id,
          title: newChat.title,
          messages: [],
          createdAt: newChat.created_at
        }, ...chats]);
      }

      const uploaded = await uploadFile(file, chatId!, user.id);
      setAttachedFiles(prev => [...prev, { record: uploaded, file: file }]);
      toast.success(`Uploaded ${file.name}`);
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreatePrompt = async (name: string, content: string) => {
    if (!user) return;
    try {
      const newPrompt = await createPrompt({
        name,
        content,
        user_id: user.id
      });
      setPrompts(prev => [newPrompt, ...prev]);
      toast.success("Prompt created");
    } catch (error) {
      toast.error("Failed to create prompt");
    }
  };

  const handleCreatePreset = async (presetData: any) => {
    if (!user) return;
    try {
      const newPreset = await createPreset({
        ...presetData,
        user_id: user.id
      });
      setPresets(prev => [newPreset, ...prev]);
      toast.success("Preset created");
    } catch (error) {
      toast.error("Failed to create preset");
    }
  };

  return {
    handleNewChat,
    handleDeleteChat,
    handleSendMessage,
    handleFileUpload,
    handleCreatePrompt,
    handleCreatePreset,
    attachedFiles,
    setAttachedFiles,
    isUploading,
    showFeedbackModal,
    setShowFeedbackModal
  };
}
