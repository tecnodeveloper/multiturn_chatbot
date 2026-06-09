import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    
    console.error("Auth callback exchange error:", {
      message: error.message,
      status: error.status,
      code: code.substring(0, 10) + "..."
    });
  } else {
    console.error("No code found in callback URL");
  }

  return NextResponse.redirect(
    new URL("/login?message=Authentication%20failed", request.url),
  );
}
