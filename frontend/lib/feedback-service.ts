import { createBrowserSupabaseClient } from "@/lib/supabase";

export interface FeedbackData {
  chat_id: string;
  user_id: string;
  message_id?: string;
  rating: number;
  correctness?: string;
  length_type?: string;
  comment?: string;
  category?: string;
}

export async function submitFeedback(feedback: FeedbackData) {
  const supabase = createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("feedback")
    .insert([
      {
        chat_id: feedback.chat_id,
        user_id: feedback.user_id,
        message_id: feedback.message_id,
        rating: feedback.rating,
        correctness: feedback.correctness || "none",
        length_type: feedback.length_type || "none",
        comment: feedback.comment,
        category: feedback.category,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

