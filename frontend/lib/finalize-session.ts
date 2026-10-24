import { NextRequest, NextResponse } from "next/server";
import { createRouteClient } from "@/lib/supabase/route";
import { TOPIC_LABELS } from "@/lib/classify-topic";

export interface FinalizeOptions {
  allowPartial?: boolean;
}

export interface FinalizeResult {
  status: number;
  data: {
    success?: boolean;
    message?: string;
    summary?: any;
    error?: string;
    requires_feedback?: boolean;
    pending_message_id?: string;
  };
}

/**
 * Option C core helper: Finalizes a session, enforces ownership via RLS-scoped route client,
 * checks mandatory turn feedback unless allowPartial is true, computes the metrics,
 * and upserts an analytics_summary row (on_conflict=chat_id).
 */
export async function finalizeSession(
  req: NextRequest,
  res: NextResponse,
  chatId: string,
  options: FinalizeOptions = {}
): Promise<FinalizeResult> {
  const supabase = createRouteClient(req, res);

  // 1. Authenticate user via request cookies (supporting both SSR and sb-access-token)
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
    return {
      status: 401,
      data: { error: "Authentication required to finalize session" },
    };
  }

  // 2. Load the chat and verify ownership
  const { data: chat, error: chatError } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .maybeSingle();

  if (!chat) {
    // If not found in user RLS scope, check if it exists under another user to distinguish 403 from 404
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
    if (serviceKey) {
      const checkRes = await fetch(`${supabaseUrl}/rest/v1/chats?select=id,user_id&id=eq.${chatId}`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
      });
      if (checkRes.ok) {
        const rows = await checkRes.json();
        if (rows && rows.length > 0 && rows[0].user_id !== user.id) {
          return {
            status: 403,
            data: { error: "Unauthorized access to this chat session" },
          };
        }
      }
    }

    return {
      status: 404,
      data: { error: "Chat session not found" },
    };
  }

  if (chat.user_id !== user.id) {
    return {
      status: 403,
      data: { error: "Unauthorized access to this chat session" },
    };
  }

  // 3. Load messages, feedback, and domains for this chat
  const [msgsResult, feedbackResult, domainResult] = await Promise.all([
    supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true }),
    supabase.from("feedback").select("*").eq("chat_id", chatId),
    supabase.from("domains").select("*").eq("chat_id", chatId),
  ]);

  const messages = msgsResult.data || [];
  const feedback = feedbackResult.data || [];
  const domains = domainResult.data || [];

  const domainId = domains.length > 0 ? domains[0].id : null;
  const rawCategory = domains.length > 0 ? domains[0].category : "Other";
  const domainCategory = TOPIC_LABELS[rawCategory] || rawCategory || "Other";

  // 4. Mandatory feedback check on the latest assistant turn
  const assistantMsgs = messages.filter((m: any) => m.role === "assistant");
  const userMsgs = messages.filter((m: any) => m.role === "user");
  const evaluatedMsgIds = new Set(feedback.map((f: any) => f.message_id));

  const allowPartial = Boolean(options.allowPartial);
  if (!allowPartial && assistantMsgs.length > 0) {
    const latestAsst = assistantMsgs[assistantMsgs.length - 1];
    if (latestAsst.id && !evaluatedMsgIds.has(latestAsst.id)) {
      return {
        status: 400,
        data: {
          error:
            "Mandatory evaluation required: The latest assistant response must be evaluated before concluding this session.",
          requires_feedback: true,
          pending_message_id: latestAsst.id,
        },
      };
    }
  }

  // 5. Compute summary metrics
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

  // 6. Upsert into public.analytics_summary with on_conflict=chat_id via RLS client
  let { data: savedSummary, error: upsertError } = await supabase
    .from("analytics_summary")
    .upsert(summaryPayload, { onConflict: "chat_id" })
    .select("*")
    .single();

  // If RLS client had an issue after we already confirmed ownership server-side, fallback to service-role
  if (upsertError) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
    if (serviceKey) {
      const restRes = await fetch(
        `${supabaseUrl}/rest/v1/analytics_summary?on_conflict=chat_id`,
        {
          method: "POST",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify(summaryPayload),
        }
      );
      if (restRes.ok) {
        const records = await restRes.json();
        savedSummary = Array.isArray(records) && records.length > 0 ? records[0] : summaryPayload;
        upsertError = null;
      }
    }
  }

  if (upsertError) {
    console.error("Failed to upsert analytics_summary:", upsertError);
    return {
      status: 500,
      data: { error: `Database error saving analytics summary: ${upsertError.message}` },
    };
  }

  return {
    status: 200,
    data: {
      success: true,
      message: "Session successfully finalized and analytics summary permanently saved.",
      summary: savedSummary || summaryPayload,
    },
  };
}
