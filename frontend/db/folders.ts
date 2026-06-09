import { createBrowserSupabaseClient } from "@/lib/supabase";

const supabase = createBrowserSupabaseClient();

export const getFolders = async () => {
  const { data: folders, error } = await supabase
    .from("folders")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return folders;
};

export const createFolder = async (folder: {
  name: string;
  type: string;
  user_id: string;
  description?: string;
}) => {
  const { data: createdFolder, error } = await supabase
    .from("folders")
    .insert([folder])
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return createdFolder;
};

export const updateFolder = async (
  folderId: string,
  updates: Partial<{ name: string; description: string }>
) => {
  const { data: updatedFolder, error } = await supabase
    .from("folders")
    .update(updates)
    .eq("id", folderId)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return updatedFolder;
};

export const deleteFolder = async (folderId: string) => {
  const { error } = await supabase.from("folders").delete().eq("id", folderId);
  if (error) throw new Error(error.message);
  return true;
};
