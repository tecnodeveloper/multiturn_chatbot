import { createClient } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
export default async function middleware(request: NextRequest) {
  let { supabase, response } = createClient(request);

  // Refresh session if it exists and return the user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/signup" ||
    request.nextUrl.pathname === "/reset" ||
    request.nextUrl.pathname === "/";

  const isDashboardPage =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/account");

  // Redirect to login if accessing protected page without user
  if (!user && isDashboardPage) {
    const redirectResponse = NextResponse.redirect(
      new URL("/login", request.url),
    );
    // Copy cookies from refreshed response to the redirect
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  // Redirect to dashboard if accessing auth page with user
  if (user && isAuthPage) {
    const redirectResponse = NextResponse.redirect(
      new URL("/dashboard", request.url),
    );
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
