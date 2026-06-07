import { createRouteClient } from "@/lib/supabase/route";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const response = NextResponse.json({});
    const supabase = createRouteClient(request, response);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

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

    return finalResponse;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
