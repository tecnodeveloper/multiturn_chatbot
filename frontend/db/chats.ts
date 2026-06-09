import { createBrowserSupabaseClient } from "@/lib/supabase";

const supabase = createBrowserSupabaseClient();

// --- Chat DB Functions ---

export const getChats = async () => {
  const { data: chats, error } = await supabase
    .from("chats")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return chats;
};

export const createChat = async (chat: { title: string; user_id: string }) => {
  const { data: createdChat, error } = await supabase
    .from("chats")
    .insert([chat])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return createdChat;
};

export const deleteChat = async (chatId: string) => {
  const { error } = await supabase.from("chats").delete().eq("id", chatId);
  if (error) throw new Error(error.message);
  return true;
};

export const updateChat = async (chatId: string, updates: { title: string }) => {
  const { data: updatedChat, error } = await supabase
    .from("chats")
    .update(updates)
    .eq("id", chatId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return updatedChat;
};

// --- Message DB Functions ---

export const getMessagesByChatId = async (chatId: string) => {
  const { data: messages, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return messages;
};

export const createMessage = async (message: {
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  user_id: string;
}) => {
  const { data: createdMessage, error } = await supabase
    .from("messages")
    .insert([message])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return createdMessage;
};

// --- Feedback DB Functions ---

export const submitFeedback = async (feedback: {
  chat_id: string;
  user_id: string;
  rating: number;
  correctness?: string;
  length_type?: string;
  comment?: string;
  category?: string;
}) => {
  const { data, error } = await supabase
    .from("feedback")
    .insert([
      {
        chat_id: feedback.chat_id,
        user_id: feedback.user_id,
        rating: feedback.rating,
        correctness: feedback.correctness || "none",
        length_type: feedback.length_type || "none",
        comment: feedback.comment,
        category: feedback.category,
      },
    ])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};
