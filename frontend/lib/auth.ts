import { createBrowserSupabaseClient } from "@/lib/supabase";

const supabase = createBrowserSupabaseClient();

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/api/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to sign in with Google");
  }
}

export async function signInWithEmail(email: string, password: string) {
  console.log(`AUTH_LIB: signInWithEmail called for ${email}`);
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  console.log(`AUTH_LIB: Received response from /api/auth/login, status: ${response.status}`);
  const data = await response.json();

  if (!response.ok) {
    console.error(`AUTH_LIB: Login request failed:`, data.error);
    throw new Error(data.error || "Failed to sign in");
  }

  if (data.session?.access_token && data.session?.refresh_token) {
    console.log(`AUTH_LIB: Syncing Supabase session`);
    const { error } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    if (error) {
      console.error(`AUTH_LIB: Failed to set session:`, error.message);
      throw new Error(error.message || "Failed to sync session");
    }

    console.log(`AUTH_LIB: Setting client-side cookies`);
    // Explicitly set cookies for the proxy and Next.js middleware/server components
    // This helps resolve race conditions where the client state is stale
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `sb-access-token=${data.session.access_token}; path=/; expires=${expires}; SameSite=Lax;`;
    document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/; expires=${expires}; SameSite=Lax;`;
  }

  console.log(`AUTH_LIB: signInWithEmail successful for ${email}`);
  return data.user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  name: string,
) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to sign up");
  }

  // We don't call setSession here because we want the user to login manually
  return data.user;
}

export async function signOut() {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to sign out");
  }
}
