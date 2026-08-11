import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return response;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        const isLocal = request.nextUrl.hostname === "localhost" || request.nextUrl.hostname === "127.0.0.1";
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, {
            ...options,
            path: "/", 
            secure: isLocal ? false : options.secure,
            sameSite: "lax",
          })
        );
      },
    },
  });

  try {
    let user = null;
    let accessToken = undefined;

    // Find auth cookies (handles chunked cookies or single token)
    const allCookies = request.cookies.getAll();
    const sbAccessTokenCookie = allCookies.find(c => c.name === 'sb-access-token');
    const authCookie = allCookies.find(c => c.name.startsWith('sb-') && c.name.includes('-auth-token'));
    
    if (sbAccessTokenCookie && sbAccessTokenCookie.value) {
      accessToken = sbAccessTokenCookie.value;
    } else if (authCookie && authCookie.value) {
      try {
        const parsed = JSON.parse(authCookie.value);
        if (parsed.access_token) {
          accessToken = parsed.access_token;
        } else if (Array.isArray(parsed)) {
          accessToken = parsed[0];
        }
      } catch {
        accessToken = authCookie.value;
      }
    }

    if (accessToken) {
      const { data } = await supabase.auth.getUser(accessToken);
      user = data?.user;
    } else {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    }


    const url = request.nextUrl.clone();
    const path = url.pathname;
    const isAuthPage = path === "/login" || path === "/signup" || path === "/reset" || path === "/";
    const isProtectedPage = path.startsWith("/dashboard") || path.startsWith("/account");

    if (!user && isProtectedPage) {
      url.pathname = "/login";
      const redirectResponse = NextResponse.redirect(url);
      response.headers.forEach((value, key) => redirectResponse.headers.append(key, value));
      return redirectResponse;
    }

    if (user && isAuthPage) {
      url.pathname = "/dashboard";
      const redirectResponse = NextResponse.redirect(url);
      response.headers.forEach((value, key) => redirectResponse.headers.append(key, value));
      return redirectResponse;
    }
  } catch (error) {
    console.error("Proxy Auth Error:", error);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|img).*)"],
};
