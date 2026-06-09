import { createClient } from "@/lib/supabase/server";

export interface StoredUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: string;
}

export async function createUser(
  email: string,
  password: string,
  name: string,
) {
  const supabase = await createClient();

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password (in production, use bcrypt properly)
  const passwordHash = btoa(password); // Temporary - use proper hashing in production

  // Create user
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email,
        password_hash: passwordHash,
        name,
        created_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function verifyUser(email: string, password: string) {
  const supabase = await createClient();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) {
    throw new Error("Invalid email or password");
  }

  // Verify password (temporary - use bcrypt in production)
  const passwordHash = btoa(password);
  if (user.password_hash !== passwordHash) {
    throw new Error("Invalid email or password");
  }

  return user;
}

export async function getUserById(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
