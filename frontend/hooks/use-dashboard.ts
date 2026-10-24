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
  deleteFolder,
  getUserFeedback
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
  const [evaluatedMessageIds, setEvaluatedMessageIds] = useState<Set<string>>(new Set());
  const [visibleFeedbackIds, setVisibleFeedbackIds] = useState<Set<string>>(new Set());
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingMessageSentRef = useRef(false);

  const currentChat = chats.find(c => c.id === currentChatId);
  const assistantMessages = currentChat?.messages.filter(m => m.role === "assistant") || [];
  const latestAssistantMsg = assistantMessages[assistantMessages.length - 1];

  // Mandatory feedback evaluation appears after every user message response.
  // The user cannot submit another message until the required evaluation is completed.
  const hasUnevaluated = assistantMessages.some(m => Boolean(m.id && !evaluatedMessageIds.has(m.id)));
  const isInputLocked = assistantMessages.length > 0 && hasUnevaluated && !isSending;

  const handleFeedbackSubmitted = (messageId?: string) => {
    const targetId = messageId || latestAssistantMsg?.id;
    if (targetId) {
      setEvaluatedMessageIds(prev => {
        const next = new Set(prev);
        next.add(targetId);
        return next;
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const [fetchedChats, fetchedPrompts, fetchedPresets, fetchedFolders, userFeedback] = await Promise.all([
          getChats(),
          getPrompts(),
          getPresets(),
          getFolders(),
          getUserFeedback(user.id),
        ]);

        const evaluatedIds = new Set<string>();
        if (userFeedback && Array.isArray(userFeedback)) {
          userFeedback.forEach((f: any) => {
            if (f.message_id) evaluatedIds.add(f.message_id);
          });
        }
        setEvaluatedMessageIds(evaluatedIds);

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

        // Pre-populate visible feedback panels for existing historical assistant responses
        const initialVisibleIds = new Set<string>();
        chatsWithMessages.forEach((c: any) => {
          c.messages.forEach((m: any) => {
            if (m.role === "assistant" && m.id) {
              initialVisibleIds.add(m.id);
            }
          });
        });
        setVisibleFeedbackIds(initialVisibleIds);

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

  // Auto-send pending template message when dashboard loads after template selection
  useEffect(() => {
    if (pendingMessageSentRef.current) return;
    if (!user || !currentChatId || isSending) return;

    try {
      const pendingMessage = localStorage.getItem("multiturn_pending_message");
      if (pendingMessage) {
        localStorage.removeItem("multiturn_pending_message");
        pendingMessageSentRef.current = true;
        // Small delay to ensure UI has rendered the new chat
        setTimeout(() => {
          handleSendMessage(pendingMessage);
        }, 300);
      }
    } catch (_) {}
  }, [user, currentChatId, isSending]);

  const handleNewChat = async () => {
    if (!user) return;
    try {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("multiturn_pending_message");
        localStorage.removeItem("multiturn_system_prompt");
      }
      pendingMessageSentRef.current = true;

      const newChat = await createChat({ title: "New Chat", user_id: user.id });
      const nextChat = {
        id: newChat.id,
        title: newChat.title,
        messages: [],
        createdAt: newChat.created_at,
      };

      setChats((prev) => [nextChat, ...prev]);
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
    if (!content.trim() || !user || isSending || isInputLocked) return;

    setIsSending(true);
    const userContent = content.trim();
    let chatId = currentChatId;
    const startTime = Date.now();
    let assistantId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    let timeoutId: NodeJS.Timeout | null = null;
    let isTimedOut = false;
    let sessionPhase: "start" | "middle" | "end" = "start";

    try {
      let activeChat = chats.find(c => c.id === chatId);

      if (!chatId) {
        const newChat = await createChat({
          title: "New Chat",
          user_id: user.id,
        });
        chatId = newChat.id;
        activeChat = {
          id: newChat.id,
          title: "New Chat",
          messages: [],
          createdAt: newChat.created_at,
        };
        setChats([activeChat, ...chats]);
        setCurrentChatId(chatId);
      }

      // FR16: Calculate session phase (start: turns 1-2, middle: turns 3-5, end: turns 6+)
      const currentMsgCount = (activeChat?.messages || []).length;
      const turnIndex = Math.floor(currentMsgCount / 2) + 1;
      sessionPhase = turnIndex <= 2 ? "start" : turnIndex <= 5 ? "middle" : "end";

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
        session_phase: sessionPhase,
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

      // FR11/FR15: If this is the first user message of the chat, persist the classified topic once
      if (currentMsgCount === 0) {
        fetch("/api/chat/topic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text: userContent,
          }),
        }).catch((err) => console.error("Failed to persist chat topic:", err));
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 20-second timeout: abort if no response or taking longer than 20s
      timeoutId = setTimeout(() => {
        isTimedOut = true;
        controller.abort("TIMEOUT_20S");
      }, 20000);

      const systemPrompt = typeof window !== "undefined" ? localStorage.getItem("multiturn_system_prompt") : null;
      // Immediately clear so it only applies to this initiated chat session and does NOT leak into new chats
      if (typeof window !== "undefined") {
        localStorage.removeItem("multiturn_system_prompt");
        localStorage.removeItem("multiturn_pending_message");
      }

      const outboundMessages: any[] = [...(activeChat?.messages || []), { ...userMessage, content: messageContent }];
      if (systemPrompt && !outboundMessages.some((m: any) => m.role === "system")) {
        outboundMessages.unshift({ role: "system", content: systemPrompt });
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: outboundMessages,
          provider: selectedProvider,
          model: selectedModel,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorMsg = "Failed to get AI response";
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || `Error ${response.status}: Failed to get AI response`;
        } catch {
          errorMsg = `Error ${response.status}: Failed to get AI response`;
        }
        throw new Error(errorMsg);
      }

      if (!response.body) throw new Error("No response body");

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

      // If fullContent is empty, the model failed during stream (e.g. 503 high demand or 404 Not Found)
      if (!fullContent || fullContent.trim().length === 0) {
        throw new Error("Error 404: Gemini API failed to return a response. The model endpoint is unavailable, experiencing high demand (503), or timed out after 20 seconds.");
      }

      // FR10: Calculate explicit response duration delta
      const endTime = Date.now();
      const responseTime = Math.round(((endTime - startTime) / 1000) * 1000) / 1000;

      const savedAssistantMsg = await createMessage({
        chat_id: chatId!,
        role: "assistant",
        content: fullContent,
        user_id: user.id,
        response_time: responseTime,
        session_phase: sessionPhase,
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

      // Specification: Feedback panel must appear exactly 2 seconds after the full response has finished
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = setTimeout(() => {
        setVisibleFeedbackIds((prev) => new Set(prev).add(savedAssistantMsg.id));
      }, 2000);

      if (activeChat?.title === "New Chat" || !activeChat?.title) {
        let conciseTitle = "";
        const titleMatch = fullContent.match(/<sidebar_title>(.*?)<\/sidebar_title>/i);
        if (titleMatch && titleMatch[1]?.trim()) {
          conciseTitle = titleMatch[1].trim();
        } else {
          const cleaned = userContent
            .trim()
            .replace(/^(can you|please|could you|help me|i want to|how do i|how to)\s+/i, "")
            .replace(/[?.!]+$/, "");
          const words = cleaned.split(/\s+/).slice(0, 7).join(" ");
          conciseTitle = words
            ? words.charAt(0).toUpperCase() + words.slice(1)
            : userContent.slice(0, 42);
        }

        await updateChat(chatId!, { title: conciseTitle });
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, title: conciseTitle } : c)),
        );
      }

    } catch (error: any) {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      const isTimeout = isTimedOut || (error?.name === "AbortError" && isTimedOut);
      const is503 =
        error?.message?.includes("503") ||
        error?.message?.toLowerCase().includes("high demand") ||
        error?.message?.toLowerCase().includes("unavailable");
      const is404 =
        isTimeout ||
        error?.message?.includes("404") ||
        error?.message?.toLowerCase().includes("not found") ||
        error?.message?.toLowerCase().includes("timed out");

      const errorMessage = isTimeout
        ? "Error 404: Gemini API request timed out after 20 seconds. The API failed to respond."
        : is503
        ? "Error 503: Gemini model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again shortly."
        : (error.message || "Error 404: Gemini API response failed.");

      toast.error(errorMessage);

      // Don't put user in an infinite waiting loop! Show the error message clearly in the chat
      const errorContent = `⚠️ **${errorMessage}**\n\n*The response could not be retrieved. Please check your Gemini API key in \`frontend/.env.local\`, verify your network connection, or try selecting another model.*`;
      const errorMsgId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);

      setChats((prev) =>
        prev.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [
                  ...c.messages.filter((m) => m.content !== "" && m.id !== assistantId),
                  {
                    id: errorMsgId,
                    role: "assistant",
                    content: errorContent,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : c
        )
      );

      // FR10 & FR16: Log the failed attempt duration and session phase
      const durationSeconds = Math.round(((Date.now() - startTime) / 1000) * 1000) / 1000;
      const savedErrorMsg = await createMessage({
        chat_id: chatId!,
        role: "assistant",
        content: errorContent,
        user_id: user.id,
        response_time: durationSeconds,
        session_phase: sessionPhase,
      }).catch(console.error);

      if (savedErrorMsg && savedErrorMsg.id) {
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === errorMsgId ? { ...m, id: savedErrorMsg.id } : m
                  ),
                }
              : c
          )
        );
      }

    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setIsSending(false);
      abortControllerRef.current = null;
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!user || isInputLocked) return;
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
    setShowFeedbackModal,
    isInputLocked,
    handleFeedbackSubmitted,
    evaluatedMessageIds,
    visibleFeedbackIds
  };
}

