import { createBrowserSupabaseClient } from "@/lib/supabase";

const supabase = createBrowserSupabaseClient();

export const getPrompts = async () => {
  const { data: prompts, error } = await supabase
    .from("prompts")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return prompts;
};

export const createPrompt = async (prompt: {
  name: string;
  content: string;
  user_id: string;
  folder_id?: string;
}) => {
  const { data: createdPrompt, error } = await supabase
    .from("prompts")
    .insert([prompt])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return createdPrompt;
};

export const updatePrompt = async (
  promptId: string,
  updates: Partial<{ name: string; content: string; folder_id: string | null }>
) => {
  const { data: updatedPrompt, error } = await supabase
    .from("prompts")
    .update(updates)
    .eq("id", promptId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return updatedPrompt;
};

export const deletePrompt = async (promptId: string) => {
  const { error } = await supabase.from("prompts").delete().eq("id", promptId);
  if (error) throw new Error(error.message);
  return true;
};
