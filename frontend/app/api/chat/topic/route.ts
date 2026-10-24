import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { classifyTopic, TOPIC_CODES } from "@/lib/classify-topic";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const res = new NextResponse();
    const supabase = createRouteClient(req, res);

    let {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user) {
      const sbAccessToken = req.cookies.get("sb-access-token")?.value;
      if (sbAccessToken) {
        const tokenResult = await supabase.auth.getUser(sbAccessToken);
        if (tokenResult.data?.user) {
          user = tokenResult.data.user;
          authError = null;
        }
      }
    }

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { chat_id: chatId, text } = body;

    if (!chatId) {
      return NextResponse.json({ error: "Missing chat_id parameter" }, { status: 400 });
    }

    // Verify chat ownership
    const { data: chat, error: chatError } = await supabase
      .from("chats")
      .select("id, user_id")
      .eq("id", chatId)
      .maybeSingle();

    if (chatError || !chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chat.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized access to this chat session" }, { status: 403 });
    }

    // Determine category: if text provided classify it, otherwise default to "Other"
    const category = text ? classifyTopic(text) : "Other";

    // Upsert the single domains row for this chat
    const { data: savedDomain, error: domainError } = await supabase
      .from("domains")
      .upsert(
        {
          chat_id: chatId,
          category,
        },
        { onConflict: "chat_id" }
      )
      .select("*")
      .single();

    if (domainError) {
      console.error("Failed to upsert domain:", domainError);
      return NextResponse.json({ error: domainError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      domain: savedDomain,
    });
  } catch (err: any) {
    console.error("Error in POST /api/chat/topic:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
