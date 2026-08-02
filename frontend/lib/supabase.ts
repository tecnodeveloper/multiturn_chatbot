import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

declare global {
  // eslint-disable-next-line no-var
  var __supabaseBrowserClient: SupabaseClient | undefined;
}

export function createBrowserSupabaseClient() {
  if (!globalThis.__supabaseBrowserClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
    globalThis.__supabaseBrowserClient = createBrowserClient(
      supabaseUrl,
      supabaseKey,
    );
  }

  return globalThis.__supabaseBrowserClient;
}
