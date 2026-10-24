import { NextRequest, NextResponse } from "next/server";
import { finalizeSession } from "@/lib/finalize-session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get("chat_id");

    if (!chatId) {
      return NextResponse.json({ error: "Missing chat_id parameter" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/analytics_summary?select=*&chat_id=eq.${chatId}`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch analytics summary" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ summary: data.length > 0 ? data[0] : null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const chatId = body.chat_id;
    const allowPartial = Boolean(body.allow_partial);

    if (!chatId) {
      return NextResponse.json({ error: "Missing required chat_id in request body" }, { status: 400 });
    }

    const res = new NextResponse();
    const result = await finalizeSession(req, res, chatId, { allowPartial });

    return NextResponse.json(result.data, { status: result.status });
  } catch (err: any) {
    console.error("Error in POST /api/analytics/summary:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
