import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { finalizeSession } from "@/lib/finalize-session";

export const dynamic = "force-dynamic";

// Guard interval: only finalize chats whose last activity was more than 60 seconds ago
const STALE_THRESHOLD_SECONDS = 60;

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

    // 1. Fetch all chats for the current user
    const { data: userChats, error: chatsError } = await supabase
      .from("chats")
      .select("id, created_at, updated_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (chatsError || !userChats || userChats.length === 0) {
      return NextResponse.json({ finalized: [], count: 0 });
    }

    const chatIds = userChats.map((c) => c.id);

    // 2. Fetch existing analytics_summary records to exclude already finalized chats
    const { data: existingSummaries } = await supabase
      .from("analytics_summary")
      .select("chat_id")
      .in("chat_id", chatIds);

    const finalizedChatIds = new Set((existingSummaries || []).map((s) => s.chat_id));
    const unfinalizedChats = userChats.filter((c) => !finalizedChatIds.has(c.id));

    if (unfinalizedChats.length === 0) {
      return NextResponse.json({ finalized: [], count: 0 });
    }

    const unfinalizedIds = unfinalizedChats.map((c) => c.id);

    // 3. Fetch assistant messages for unfinalized chats
    const { data: asstMessages } = await supabase
      .from("messages")
      .select("id, chat_id, created_at, role")
      .in("chat_id", unfinalizedIds)
      .eq("role", "assistant")
      .order("created_at", { ascending: true });

    // Group assistant messages by chat
    const asstByChat: Record<string, any[]> = {};
    for (const m of asstMessages || []) {
      if (!asstByChat[m.chat_id]) asstByChat[m.chat_id] = [];
      asstByChat[m.chat_id].push(m);
    }

    const now = Date.now();
    const finalizedResults: any[] = [];

    for (const chat of unfinalizedChats) {
      const msgs = asstByChat[chat.id];
      // Eligible criteria: >= 1 assistant message
      if (!msgs || msgs.length === 0) {
        continue;
      }

      // Check last activity older than guard threshold (60s)
      const lastAsstTime = new Date(msgs[msgs.length - 1].created_at).getTime();
      const chatUpdatedTime = chat.updated_at ? new Date(chat.updated_at).getTime() : 0;
      const lastActivityTime = Math.max(lastAsstTime, chatUpdatedTime);

      const idleSeconds = (now - lastActivityTime) / 1000;
      if (idleSeconds < STALE_THRESHOLD_SECONDS) {
        // Chat is still actively in flight or was updated within the last 60s
        continue;
      }

      // Finalize this stale session with allowPartial=true (background auto-finalization)
      const result = await finalizeSession(req, res, chat.id, { allowPartial: true });
      if (result.status === 200) {
        finalizedResults.push({
          chat_id: chat.id,
          summary: result.data.summary,
        });
      }
    }

    return NextResponse.json({
      success: true,
      count: finalizedResults.length,
      finalized: finalizedResults,
    });
  } catch (err: any) {
    console.error("Error in POST /api/analytics/sessions/finalize-stale:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
