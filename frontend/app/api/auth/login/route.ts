import { createRouteClient } from "@/lib/supabase/route";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("API/AUTH/LOGIN: Received login request");
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      console.warn("API/AUTH/LOGIN: Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const response = NextResponse.json({});
    const supabase = createRouteClient(request, response);

    console.log(`API/AUTH/LOGIN: Attempting signInWithPassword for ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error(`API/AUTH/LOGIN: Error for ${email}:`, error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log(`API/AUTH/LOGIN: Successfully authenticated ${email}`);
    const finalResponse = NextResponse.json(
      { user: data.user, session: data.session },
      { status: 200 },
    );

    // Merge headers safely
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        // Handle multiple set-cookie headers
        const cookies = response.headers.getSetCookie();
        cookies.forEach(cookie => {
          finalResponse.headers.append("set-cookie", cookie);
        });
      } else {
        finalResponse.headers.set(key, value);
      }
    });

    // Explicitly set sb-access-token and sb-refresh-token for proxy/middleware sync
    if (data.session) {
      console.log(`API/AUTH/LOGIN: Setting session cookies for ${email}`);
      const isLocal = request.nextUrl.hostname === 'localhost' || request.nextUrl.hostname === '127.0.0.1';
      const cookieOptions = {
        path: "/",
        httpOnly: false, // Must be false for client-side proxy to read if needed
        secure: !isLocal,
        sameSite: 'lax' as const,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      };

      finalResponse.cookies.set("sb-access-token", data.session.access_token, cookieOptions);
      finalResponse.cookies.set("sb-refresh-token", data.session.refresh_token, cookieOptions);
    }

    console.log(`API/AUTH/LOGIN: Returning successful response for ${email}`);
    return finalResponse;
  } catch (err: any) {
    console.error("API/AUTH/LOGIN: Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
