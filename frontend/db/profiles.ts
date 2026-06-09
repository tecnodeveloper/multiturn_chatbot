import { createBrowserSupabaseClient } from "@/lib/supabase";

const supabase = createBrowserSupabaseClient();

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Supabase error fetching profile:", error.message);
    return null;
  }

  // If profile doesn't exist, create it (handles users created before trigger)
  if (!data) {
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert([{ id: userId }])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError.message);
      return null;
    }
    return newProfile;
  }

  return data;
}

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function uploadAvatar(file: File, userId: string) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Math.random()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  return data.publicUrl;
}
