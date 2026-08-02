import { createBrowserSupabaseClient } from "@/lib/supabase";

const supabase = createBrowserSupabaseClient();

export const getDomainsByChatId = async (chatId: string) => {
  const { data, error } = await supabase
    .from("domains")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

export const createDomain = async (domain: {
  chat_id: string;
  category: "Machine Learning" | "Deep Learning" | "Healthcare AI" | "Power Systems" | "E-commerce AI";
  feedback_id?: string;
}) => {
  const { data, error } = await supabase
    .from("domains")
    .insert([domain])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const getAnalyticsSummary = async (chatId: string) => {
  const { data, error } = await supabase
    .from("analytics_summary")
    .select("*")
    .eq("chat_id", chatId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

export const saveAnalyticsSummary = async (summary: {
  chat_id: string;
  domain_id?: string;
  feedback_id?: string;
  summary_data: Record<string, any>;
}) => {
  const { data, error } = await supabase
    .from("analytics_summary")
    .upsert([summary], { onConflict: "chat_id" })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
};
