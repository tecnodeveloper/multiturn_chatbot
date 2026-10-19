import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const chatId = body.chat_id;
    const userId = body.user_id;

    if (!chatId) {
      return NextResponse.json({ error: "Missing required chat_id in request body" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    // 1. Verify chat exists and verify user ownership if userId provided
    const chatRes = await fetch(`${supabaseUrl}/rest/v1/chats?select=*&id=eq.${chatId}`, {
      headers,
      cache: "no-store",
    });

    if (!chatRes.ok) {
      return NextResponse.json({ error: "Failed to query chat session" }, { status: 500 });
    }

    const chats = await chatRes.json();
    if (!chats || chats.length === 0) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    const chat = chats[0];
    if (userId && chat.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized access to this chat session" }, { status: 403 });
    }

    // 2. Fetch messages, feedback, and domain for this chat
    const [msgsRes, feedbackRes, domainRes] = await Promise.all([
      fetch(`${supabaseUrl}/rest/v1/messages?select=*&chat_id=eq.${chatId}&order=created_at.asc`, {
        headers,
        cache: "no-store",
      }),
      fetch(`${supabaseUrl}/rest/v1/feedback?select=*&chat_id=eq.${chatId}`, {
        headers,
        cache: "no-store",
      }),
      fetch(`${supabaseUrl}/rest/v1/domains?select=*&chat_id=eq.${chatId}`, {
        headers,
        cache: "no-store",
      }),
    ]);

    const messages = msgsRes.ok ? await msgsRes.json() : [];
    const feedback = feedbackRes.ok ? await feedbackRes.json() : [];
    const domains = domainRes.ok ? await domainRes.json() : [];

    const domainId = domains.length > 0 ? domains[0].id : null;
    const domainCategory = domains.length > 0 ? domains[0].category : "General AI";

    // 3. Mandatory Feedback Verification: Check if latest assistant message is evaluated
    const assistantMsgs = messages.filter((m: any) => m.role === "assistant");
    const userMsgs = messages.filter((m: any) => m.role === "user");
    const evaluatedMsgIds = new Set(feedback.map((f: any) => f.message_id));

    const allowPartial = Boolean(body.allow_partial);
    if (!allowPartial && assistantMsgs.length > 0) {
      const latestAsst = assistantMsgs[assistantMsgs.length - 1];
      if (latestAsst.id && !evaluatedMsgIds.has(latestAsst.id)) {
        return NextResponse.json(
          {
            error: "Cannot end session: mandatory feedback evaluation is required for the latest response before finalization.",
            requires_feedback: true,
            pending_message_id: latestAsst.id,
          },
          { status: 400 }
        );
      }
    }

    // 4. Calculate final analytics summary metrics
    let correct = 0;
    let partial = 0;
    let incorrect = 0;
    let ratingSum = 0;
    let ratingCount = 0;

    for (const f of feedback) {
      const s = String(f.correctness || "").toLowerCase();
      if (s === "correct") correct += 1;
      else if (s === "partial") partial += 1;
      else if (s === "incorrect") incorrect += 1;

      if (f.rating && f.rating >= 1 && f.rating <= 4) {
        ratingSum += Number(f.rating);
        ratingCount += 1;
      }
    }

    const accuracyRate =
      feedback.length > 0
        ? Number((((correct + partial) / feedback.length) * 100).toFixed(1))
        : 0.0;

    const avgRating = ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0.0;

    const latencies = assistantMsgs
      .map((m: any) => m.response_time)
      .filter((t: any) => typeof t === "number" && !isNaN(t) && t > 0);

    const avgResponseTime =
      latencies.length > 0
        ? Number((latencies.reduce((a: number, b: number) => a + b, 0) / latencies.length).toFixed(2))
        : 0.0;

    // Calculate duration
    let startTs = chat.created_at ? new Date(chat.created_at).getTime() : Date.now();
    let endTs = startTs;
    if (messages.length > 0) {
      startTs = Math.min(startTs, new Date(messages[0].created_at || startTs).getTime());
      endTs = new Date(messages[messages.length - 1].created_at || startTs).getTime();
    }
    const durationSeconds = Math.max(0, Math.floor((endTs - startTs) / 1000));

    const summaryPayload = {
      chat_id: chatId,
      domain_id: domainId,
      feedback_id: feedback.length > 0 ? feedback[0].id : null,
      summary_data: {
        chat_title: chat.title || "Chat session",
        domain: domainCategory,
        total_messages: messages.length,
        total_user_messages: userMsgs.length,
        total_assistant_responses: assistantMsgs.length,
        total_evaluated_replies: feedback.length,
        correct_replies: correct,
        partial_replies: partial,
        incorrect_replies: incorrect,
        accuracy_rate: accuracyRate,
        average_rating: avgRating,
        average_response_time: avgResponseTime,
        duration_seconds: durationSeconds,
        finalized_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    };

    // 5. Upsert into public.analytics_summary (idempotent on conflict chat_id)
    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/analytics_summary?on_conflict=chat_id`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(summaryPayload),
    });

    if (!upsertRes.ok) {
      const errText = await upsertRes.text();
      console.error("Failed to upsert analytics_summary:", errText);
      return NextResponse.json(
        { error: `Database error saving analytics summary: ${errText}` },
        { status: 500 }
      );
    }

    const savedRecords = await upsertRes.json();
    const saved = Array.isArray(savedRecords) && savedRecords.length > 0 ? savedRecords[0] : summaryPayload;

    return NextResponse.json({
      success: true,
      message: "Session successfully finalized and analytics summary permanently saved.",
      summary: saved,
    });
  } catch (err: any) {
    console.error("Error in POST /api/analytics/summary:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
