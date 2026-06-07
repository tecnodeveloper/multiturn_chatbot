import { createRouteClient } from "@/lib/supabase/route";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password, name } = (await request.json()) as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 },
    );
  }

  const response = NextResponse.json({});
  const supabase = createRouteClient(request, response);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const finalResponse = NextResponse.json(
    { user: data.user, session: data.session },
    { status: 200 },
  );

  // Copy headers from the Supabase-managed response to the final response
  response.headers.forEach((value, key) => {
    finalResponse.headers.append(key, value);
  });

  return finalResponse;
}
