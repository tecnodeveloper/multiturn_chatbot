import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const url = request.nextUrl.clone();
    const path = url.pathname;
    
    const isAuthPage = path === "/login" || path === "/signup" || path === "/reset" || path === "/";
    const isProtectedPage = path.startsWith("/dashboard") || path.startsWith("/account");

    if (!user && isProtectedPage) {
      url.pathname = "/login";
      const redirectResponse = NextResponse.redirect(url);
      
      // Copy all headers from the current response (including Set-Cookie)
      response.headers.forEach((value, key) => {
        redirectResponse.headers.append(key, value);
      });
      
      return redirectResponse;
    }

    if (user && isAuthPage) {
      url.pathname = "/dashboard";
      const redirectResponse = NextResponse.redirect(url);
      
      // Copy all headers from the current response (including Set-Cookie)
      response.headers.forEach((value, key) => {
        redirectResponse.headers.append(key, value);
      });
      
      return redirectResponse;
    }
  } catch (error) {
    console.error("Middleware Auth Error:", error);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|img).*)",
  ],
};
