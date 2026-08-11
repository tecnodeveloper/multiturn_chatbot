import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect_to") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.session) {
      const response = NextResponse.redirect(new URL(redirectTo, request.url));
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      response.cookies.set("sb-access-token", data.session.access_token, {
        path: "/",
        expires,
        sameSite: "lax",
        httpOnly: false,
      });
      response.cookies.set("sb-refresh-token", data.session.refresh_token, {
        path: "/",
        expires,
        sameSite: "lax",
        httpOnly: false,
      });
      return response;
    }
    
    const errorMessage = error?.message || "Authentication failed";
    console.error("Auth callback exchange error details:", {
      message: error?.message,
      name: error?.name,
      status: error?.status,
      code: code ? code.substring(0, 10) + "..." : null
    });

    return NextResponse.redirect(
      new URL(`/login?message=${encodeURIComponent(errorMessage)}`, request.url),
    );
  } else {
    console.error("No code found in callback URL");
  }

  return NextResponse.redirect(
    new URL("/login?message=No%20authorization%20code%20received", request.url),
  );
}


