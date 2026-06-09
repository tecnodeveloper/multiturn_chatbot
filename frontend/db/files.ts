import { createBrowserSupabaseClient } from "@/lib/supabase";

const supabase = createBrowserSupabaseClient();

export const uploadFile = async (
  file: File,
  chatId: string,
  userId: string
) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${chatId}/${Date.now()}.${fileExt}`;
  const filePath = fileName;

  const { error: uploadError } = await supabase.storage
    .from("chat_files")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  const { data: fileRecord, error: dbError } = await supabase
    .from("files")
    .insert([
      {
        name: file.name,
        path: filePath,
        user_id: userId,
        chat_id: chatId,
        type: file.type,
        size: file.size,
      },
    ])
    .select("*")
    .single();

  if (dbError) {
    console.error("Database file record error:", dbError);
    throw new Error(`Failed to save file record: ${dbError.message}`);
  }

  return fileRecord;
};

export const getFileSignedUrl = async (path: string) => {
  const { data, error } = await supabase.storage
    .from("chat_files")
    .createSignedUrl(path, 3600); // 1 hour

  if (error) throw new Error(error.message);
  return data.signedUrl;
};

export const getFileUrl = (path: string) => {
  const { data } = supabase.storage.from("chat_files").getPublicUrl(path);
  return data.publicUrl;
};

export const getFilesByChatId = async (chatId: string) => {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};
