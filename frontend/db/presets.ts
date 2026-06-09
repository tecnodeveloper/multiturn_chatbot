import { createBrowserSupabaseClient } from "@/lib/supabase";

const supabase = createBrowserSupabaseClient();

export const getPresets = async () => {
  const { data: presets, error } = await supabase
    .from("presets")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return presets;
};

export const createPreset = async (preset: {
  name: string;
  description?: string;
  model: string;
  prompt: string;
  temperature: number;
  context_length: number;
  user_id: string;
  folder_id?: string;
}) => {
  const { data: createdPreset, error } = await supabase
    .from("presets")
    .insert([preset])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return createdPreset;
};

export const updatePreset = async (
  presetId: string,
  updates: Partial<{
    name: string;
    description: string;
    model: string;
    prompt: string;
    temperature: number;
    context_length: number;
    folder_id: string | null;
  }>
) => {
  const { data: updatedPreset, error } = await supabase
    .from("presets")
    .update(updates)
    .eq("id", presetId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return updatedPreset;
};

export const deletePreset = async (presetId: string) => {
  const { error } = await supabase.from("presets").delete().eq("id", presetId);
  if (error) throw new Error(error.message);
  return true;
};
