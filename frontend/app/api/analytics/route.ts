import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_DOMAINS = [
  "MachineLearning",
  "DeepLearning",
  "HealthcareAI",
  "PowerSystems",
  "E-commerceAI",
  "Other",
];

function resolveTopic(query: string, rawCat?: string | null): string {
  if (rawCat) {
    const clean = rawCat.replace(/\s+/g, "").toLowerCase();
    for (const d of VALID_DOMAINS) {
      if (d.toLowerCase() === clean) return d;
    }
  }
  if (!query || query.trim().length < 4) return "Other";
  const uq = query.toLowerCase();
  if (["deep learning", "deeplearning", "cnn", "rnn", "neural", "transformer", "pytorch"].some((k) => uq.includes(k))) return "DeepLearning";
  if (["health", "medical", "hospital", "patient", "clinical", "healthcare"].some((k) => uq.includes(k))) return "HealthcareAI";
  if (["power", "grid", "voltage", "energy", "solar", "battery"].some((k) => uq.includes(k))) return "PowerSystems";
  if (["e-commerce", "ecommerce", "recommend", "cart", "product", "retail"].some((k) => uq.includes(k))) return "E-commerceAI";
  if (["machine learning", "machinelearning", "regression", "classification", "clustering", "dataset", "model"].some((k) => uq.includes(k))) return "MachineLearning";
  return "Other";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id") || searchParams.get("userId");
    const sessionId = searchParams.get("session_id") || searchParams.get("chat_id") || searchParams.get("sessionId");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    const headers = {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
    };

    if (!userId) {
      return NextResponse.json(
        {
          error: "Missing user_id",
          message: "Please log in to view your personalized analytics.",
        },
        { status: 400 }
      );
    }

    const sessionFilter = sessionId && sessionId !== "all" ? `&chat_id=eq.${sessionId}` : "";
    const feedbackUrl = `${supabaseUrl}/rest/v1/feedback?select=*&user_id=eq.${userId}${sessionFilter}&order=created_at.desc`;
    const messagesUrl = `${supabaseUrl}/rest/v1/messages?select=*&user_id=eq.${userId}${sessionFilter}&order=created_at.asc`;
    const domainsUrl = `${supabaseUrl}/rest/v1/domains?select=*`;
    const chatsUrl = `${supabaseUrl}/rest/v1/chats?select=id,title,created_at,updated_at&user_id=eq.${userId}&order=created_at.desc`;
    const summariesUrl = `${supabaseUrl}/rest/v1/analytics_summary?select=*&order=created_at.desc`;

    const [fRes, mRes, dRes, cRes, sRes] = await Promise.all([
      fetch(feedbackUrl, { headers, cache: "no-store" }).catch(() => null),
      fetch(messagesUrl, { headers, cache: "no-store" }).catch(() => null),
      fetch(domainsUrl, { headers, cache: "no-store" }).catch(() => null),
      fetch(chatsUrl, { headers, cache: "no-store" }).catch(() => null),
      fetch(summariesUrl, { headers, cache: "no-store" }).catch(() => null),
    ]);

    // Check if database queries failed due to permission or server errors (e.g. 403 Forbidden, 500, network error)
    if (!fRes || !mRes || !fRes.ok || !mRes.ok) {
      let errDetails = "Database service permission or connection issue";
      try {
        if (fRes && !fRes.ok) {
          const body = await fRes.json();
          if (body?.message) errDetails = body.message;
        } else if (mRes && !mRes.ok) {
          const body = await mRes.json();
          if (body?.message) errDetails = body.message;
        }
      } catch {}

      return NextResponse.json(
        {
          error: errDetails,
          message: "Don't worry - the analytics module is currently not working. It's on our side, not yours.",
          code: 404,
          isServerError: true,
        },
        { status: 500 }
      );
    }

    let feedbackData: any[] = fRes && fRes.ok ? await fRes.json() : [];
    const messagesData: any[] = mRes && mRes.ok ? await mRes.json() : [];
    const domainsData: any[] = dRes && dRes.ok ? await dRes.json() : [];
    const chatsData: any[] = cRes && cRes.ok ? await cRes.json() : [];
    const summariesData: any[] = sRes && sRes.ok ? await sRes.json() : [];

    const chatsById: Record<string, string> = {};
    for (const c of chatsData) {
      if (c.id) chatsById[c.id] = c.title || "Chat session";
    }

    const chatDomains: Record<string, string> = {};
    for (const d of domainsData) {
      if (d.chat_id) chatDomains[d.chat_id] = d.category;
    }

    // Standard FR19 Domain Name Mapping
    const DOMAIN_MAP: Record<string, string> = {
      MachineLearning: "Machine Learning",
      DeepLearning: "Deep Learning",
      HealthcareAI: "Healthcare AI",
      PowerSystems: "Power Systems",
      "E-commerceAI": "E-commerce AI",
      Other: "Other",
      "Machine Learning": "Machine Learning",
      "Deep Learning": "Deep Learning",
      "Healthcare AI": "Healthcare AI",
      "Power Systems": "Power Systems",
      "E-commerce AI": "E-commerce AI",
    };

    const STANDARD_DOMAINS = [
      "Machine Learning",
      "Deep Learning",
      "Healthcare AI",
      "Power Systems",
      "E-commerce AI",
      "Other",
    ];

    const TOPIC_COLORS: Record<string, string> = {
      "Machine Learning": "#3b82f6",
      "Deep Learning": "#8b5cf6",
      "Healthcare AI": "#10b981",
      "Power Systems": "#f59e0b",
      "E-commerce AI": "#ec4899",
      Other: "#71717a",
    };

    const RATING_COLORS: Record<number, string> = {
      4: "#10b981",
      3: "#f5a623",
      2: "#f59e0b",
      1: "#ef4444",
    };

    const LENGTH_COLORS: Record<string, string> = {
      short: "#3b82f6",
      to_the_point: "#f5a623",
      lengthy: "#8b5cf6",
    };

    // Lookup maps for messages
    const messagesById: Record<string, any> = {};
    const messagesByChat: Record<string, any[]> = {};

    for (const m of messagesData) {
      if (m.id) messagesById[m.id] = m;
      if (m.chat_id) {
        if (!messagesByChat[m.chat_id]) messagesByChat[m.chat_id] = [];
        messagesByChat[m.chat_id].push(m);
      }
    }

    // Genuine assistant messages count in selected scope
    const assistantMessages = messagesData.filter((m: any) => m.role === "assistant");
    const assistantCount = assistantMessages.length;

    // Helper to calculate response time metrics from assistant messages
    const validTimes: number[] = assistantMessages
      .map((m: any) => m.response_time)
      .filter((t: any) => typeof t === "number" && !isNaN(t) && t > 0)
      .map((t: number) => Number(t.toFixed(3)));

    let rtMin: number | null = null;
    let rtMax: number | null = null;
    let rtAvg: number | null = null;
    let rtMedian: number | null = null;

    if (validTimes.length > 0) {
      const sortedTimes = [...validTimes].sort((a, b) => a - b);
      rtMin = sortedTimes[0];
      rtMax = sortedTimes[sortedTimes.length - 1];
      rtAvg = Number((sortedTimes.reduce((a, b) => a + b, 0) / sortedTimes.length).toFixed(2));
      const mid = Math.floor(sortedTimes.length / 2);
      rtMedian =
        sortedTimes.length % 2 === 1
          ? sortedTimes[mid]
          : Number(((sortedTimes[mid - 1] + sortedTimes[mid]) / 2).toFixed(2));
    }

    const responseTimeMetrics = [
      {
        metric: "Minimum response time",
        value: rtMin,
        formatted_value: rtMin !== null ? `${rtMin.toFixed(2)}s` : "—",
        unit: "seconds",
        sample_count: validTimes.length,
        description: "Fastest response generated by the model in current scope",
      },
      {
        metric: "Maximum response time",
        value: rtMax,
        formatted_value: rtMax !== null ? `${rtMax.toFixed(2)}s` : "—",
        unit: "seconds",
        sample_count: validTimes.length,
        description: "Longest response generation latency recorded",
      },
      {
        metric: "Average response time",
        value: rtAvg,
        formatted_value: rtAvg !== null ? `${rtAvg.toFixed(2)}s` : "—",
        unit: "seconds",
        sample_count: validTimes.length,
        description: "Arithmetic mean across all measured assistant replies",
      },
      {
        metric: "Median response time",
        value: rtMedian,
        formatted_value: rtMedian !== null ? `${rtMedian.toFixed(2)}s` : "—",
        unit: "seconds",
        sample_count: validTimes.length,
        description: "50th percentile latency (less sensitive to outlier spikes)",
      },
      {
        metric: "Total measured responses",
        value: validTimes.length,
        formatted_value: validTimes.length.toString(),
        unit: "responses",
        sample_count: validTimes.length,
        description: "Assistant messages with valid persisted latency",
      },
    ];

    const responseTimeSummary = {
      min: rtMin,
      max: rtMax,
      avg: rtAvg,
      median: rtMedian,
      count: validTimes.length,
      unit: "seconds",
      population: "All assistant messages with recorded latency in active scope",
      metrics: responseTimeMetrics,
    };

    // Build Graph 5: Response Time Trend points chronologically from valid assistant messages
    const responseTimeTrend: Array<{
      id: string;
      chat_id: string;
      session_title: string;
      timestamp: string;
      formatted_time: string;
      turn_index: number;
      response_time: number;
      topic: string;
    }> = [];

    for (const m of assistantMessages) {
      if (typeof m.response_time === "number" && !isNaN(m.response_time) && m.response_time > 0) {
        const chatMsgs = messagesByChat[m.chat_id] || [];
        const msgIdx = chatMsgs.findIndex((msg: any) => msg.id === m.id);
        const turnIdx = msgIdx >= 0 ? Math.floor(msgIdx / 2) + 1 : 1;
        const asstTime = new Date(m.created_at || 0).getTime();
        const precedingUsers = chatMsgs.filter(
          (msg: any) => msg.role === "user" && new Date(msg.created_at || 0).getTime() <= asstTime
        );
        const userQuery = precedingUsers.length > 0 ? precedingUsers[precedingUsers.length - 1].content || "" : "";
        const rawTopic = resolveTopic(userQuery, chatDomains[m.chat_id]);
        const topic = DOMAIN_MAP[rawTopic] || "Other";

        responseTimeTrend.push({
          id: m.id,
          chat_id: m.chat_id,
          session_title: chatsById[m.chat_id] || (m.chat_id ? `Session ${m.chat_id.slice(0, 8)}` : "Chat Session"),
          timestamp: m.created_at || new Date().toISOString(),
          formatted_time: m.created_at
            ? new Date(m.created_at).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Recent",
          turn_index: turnIdx,
          response_time: Number(m.response_time.toFixed(2)),
          topic,
        });
      }
    }

    function formatDuration(secs: number): string {
      if (secs <= 0) return "< 1m";
      if (secs < 60) return `${secs}s`;
      const mins = Math.floor(secs / 60);
      const remSecs = secs % 60;
      if (mins < 60) return `${mins}m ${remSecs}s`;
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins}m`;
    }

    // Build Sessions Analytics Payload (FR7, FR10, FR14, FR16, FR17, FR21, FR22)
    const summariesByChatId: Record<string, any> = {};
    for (const s of summariesData) {
      if (s.chat_id) summariesByChatId[s.chat_id] = s;
    }

    const feedbackByChat: Record<string, any[]> = {};
    for (const f of feedbackData) {
      if (f.chat_id) {
        if (!feedbackByChat[f.chat_id]) feedbackByChat[f.chat_id] = [];
        feedbackByChat[f.chat_id].push(f);
      }
    }

    const sessionRecords: any[] = [];
    let totalAssistantMsgsAll = 0;
    let totalEvaluatedAll = 0;
    let totalCorrectAll = 0;
    let totalPartialAll = 0;
    let totalDurationAll = 0;

    const sortedChats = [...chatsData].sort(
      (a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );

    for (const chat of sortedChats) {
      const cId = chat.id;
      const cMsgs = (messagesByChat[cId] || []).sort(
        (a: any, b: any) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );
      const cFeedback = feedbackByChat[cId] || [];
      const cFeedbackByMsgId: Record<string, any> = {};
      for (const f of cFeedback) {
        if (f.message_id) cFeedbackByMsgId[f.message_id] = f;
      }

      const userMsgs = cMsgs.filter((m: any) => m.role === "user");
      const asstMsgs = cMsgs.filter((m: any) => m.role === "assistant");
      totalAssistantMsgsAll += asstMsgs.length;
      totalEvaluatedAll += cFeedback.length;

      let cCorrect = 0;
      let cPartial = 0;
      let cIncorrect = 0;
      const cRatingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
      let cRatingSum = 0;
      let cRatingCount = 0;
      const cLengthCounts = { short: 0, to_the_point: 0, lengthy: 0 };

      for (const f of cFeedback) {
        const s = String(f.correctness || "").toLowerCase();
        if (s === "correct") {
          cCorrect += 1;
          totalCorrectAll += 1;
        } else if (s === "partial") {
          cPartial += 1;
          totalPartialAll += 1;
        } else if (s === "incorrect") {
          cIncorrect += 1;
        }

        const r = Number(f.rating);
        if (r >= 1 && r <= 4) {
          cRatingCounts[r] = (cRatingCounts[r] || 0) + 1;
          cRatingSum += r;
          cRatingCount += 1;
        }

        const l = String(f.length_type || "").toLowerCase();
        if (l === "short") cLengthCounts.short += 1;
        else if (l === "to_the_point") cLengthCounts.to_the_point += 1;
        else if (l === "lengthy") cLengthCounts.lengthy += 1;
      }

      const cAccuracy =
        cFeedback.length > 0
          ? Number((((cCorrect + cPartial) / cFeedback.length) * 100).toFixed(1))
          : null;

      const cAvgRating =
        cRatingCount > 0 ? Number((cRatingSum / cRatingCount).toFixed(2)) : null;

      const cTimes = asstMsgs
        .map((m: any) => m.response_time)
        .filter((t: any) => typeof t === "number" && !isNaN(t) && t > 0)
        .map((t: number) => Number(t.toFixed(2)));

      let cMin: number | null = null;
      let cMax: number | null = null;
      let cAvg: number | null = null;
      let cMed: number | null = null;

      if (cTimes.length > 0) {
        const sorted = [...cTimes].sort((a, b) => a - b);
        cMin = sorted[0];
        cMax = sorted[sorted.length - 1];
        cAvg = Number((sorted.reduce((a, b) => a + b, 0) / sorted.length).toFixed(2));
        const mid = Math.floor(sorted.length / 2);
        cMed = sorted.length % 2 === 1 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
      }

      let startTs = chat.created_at ? new Date(chat.created_at).getTime() : Date.now();
      let lastActivityTs = startTs;
      if (cMsgs.length > 0) {
        startTs = Math.min(startTs, new Date(cMsgs[0].created_at || startTs).getTime());
        lastActivityTs = new Date(cMsgs[cMsgs.length - 1].created_at || startTs).getTime();
      } else if (chat.updated_at) {
        lastActivityTs = new Date(chat.updated_at).getTime();
      }

      const durationSecs = Math.max(0, Math.floor((lastActivityTs - startTs) / 1000));
      totalDurationAll += durationSecs;

      const savedSummary = summariesByChatId[cId] || null;
      const isFinalized = Boolean(savedSummary);
      const isInactive = !isFinalized && Date.now() - lastActivityTs > 24 * 3600 * 1000 && cMsgs.length > 0;
      const status: "active" | "completed" | "inactive" = isFinalized
        ? "completed"
        : isInactive
        ? "inactive"
        : "active";

      const phaseGroups: Record<"start" | "middle" | "end", { asst: number; evalCount: number; correct: number; partial: number; incorrect: number; ratingSum: number; ratingCount: number; times: number[] }> = {
        start: { asst: 0, evalCount: 0, correct: 0, partial: 0, incorrect: 0, ratingSum: 0, ratingCount: 0, times: [] },
        middle: { asst: 0, evalCount: 0, correct: 0, partial: 0, incorrect: 0, ratingSum: 0, ratingCount: 0, times: [] },
        end: { asst: 0, evalCount: 0, correct: 0, partial: 0, incorrect: 0, ratingSum: 0, ratingCount: 0, times: [] },
      };

      asstMsgs.forEach((m: any, idx: number) => {
        const turnIdx = Math.floor(idx) + 1;
        let pKey: "start" | "middle" | "end" = (m.session_phase || "").toLowerCase();
        if (pKey !== "start" && pKey !== "middle" && pKey !== "end") {
          pKey = turnIdx <= 2 ? "start" : turnIdx <= 5 ? "middle" : "end";
        }
        phaseGroups[pKey].asst += 1;
        if (typeof m.response_time === "number" && m.response_time > 0) {
          phaseGroups[pKey].times.push(m.response_time);
        }
        const f = cFeedbackByMsgId[m.id];
        if (f) {
          phaseGroups[pKey].evalCount += 1;
          const s = String(f.correctness || "").toLowerCase();
          if (s === "correct") phaseGroups[pKey].correct += 1;
          else if (s === "partial") phaseGroups[pKey].partial += 1;
          else if (s === "incorrect") phaseGroups[pKey].incorrect += 1;

          if (f.rating && f.rating >= 1 && f.rating <= 4) {
            phaseGroups[pKey].ratingSum += Number(f.rating);
            phaseGroups[pKey].ratingCount += 1;
          }
        }
      });

      const phases = [
        {
          phase: "Start" as const,
          label: "Start",
          turns_range: "Turns 1–2",
          assistant_responses: phaseGroups.start.asst,
          evaluated_responses: phaseGroups.start.evalCount,
          correct: phaseGroups.start.correct,
          partial: phaseGroups.start.partial,
          incorrect: phaseGroups.start.incorrect,
          accuracy: phaseGroups.start.evalCount > 0 ? Number((((phaseGroups.start.correct + phaseGroups.start.partial) / phaseGroups.start.evalCount) * 100).toFixed(1)) : null,
          average_rating: phaseGroups.start.ratingCount > 0 ? Number((phaseGroups.start.ratingSum / phaseGroups.start.ratingCount).toFixed(2)) : null,
          average_response_time: phaseGroups.start.times.length > 0 ? Number((phaseGroups.start.times.reduce((a, b) => a + b, 0) / phaseGroups.start.times.length).toFixed(2)) : null,
        },
        {
          phase: "Middle" as const,
          label: "Middle",
          turns_range: "Turns 3–5",
          assistant_responses: phaseGroups.middle.asst,
          evaluated_responses: phaseGroups.middle.evalCount,
          correct: phaseGroups.middle.correct,
          partial: phaseGroups.middle.partial,
          incorrect: phaseGroups.middle.incorrect,
          accuracy: phaseGroups.middle.evalCount > 0 ? Number((((phaseGroups.middle.correct + phaseGroups.middle.partial) / phaseGroups.middle.evalCount) * 100).toFixed(1)) : null,
          average_rating: phaseGroups.middle.ratingCount > 0 ? Number((phaseGroups.middle.ratingSum / phaseGroups.middle.ratingCount).toFixed(2)) : null,
          average_response_time: phaseGroups.middle.times.length > 0 ? Number((phaseGroups.middle.times.reduce((a, b) => a + b, 0) / phaseGroups.middle.times.length).toFixed(2)) : null,
        },
        {
          phase: "End" as const,
          label: "End",
          turns_range: "Turns 6+",
          assistant_responses: phaseGroups.end.asst,
          evaluated_responses: phaseGroups.end.evalCount,
          correct: phaseGroups.end.correct,
          partial: phaseGroups.end.partial,
          incorrect: phaseGroups.end.incorrect,
          accuracy: phaseGroups.end.evalCount > 0 ? Number((((phaseGroups.end.correct + phaseGroups.end.partial) / phaseGroups.end.evalCount) * 100).toFixed(1)) : null,
          average_rating: phaseGroups.end.ratingCount > 0 ? Number((phaseGroups.end.ratingSum / phaseGroups.end.ratingCount).toFixed(2)) : null,
          average_response_time: phaseGroups.end.times.length > 0 ? Number((phaseGroups.end.times.reduce((a, b) => a + b, 0) / phaseGroups.end.times.length).toFixed(2)) : null,
        },
      ];

      let turnCounter = 0;
      const timeline = cMsgs.map((m: any) => {
        if (m.role === "assistant") turnCounter += 1;
        const f = m.role === "assistant" ? cFeedbackByMsgId[m.id] : null;
        const textContent = typeof m.content === "string" ? m.content : JSON.stringify(m.content);
        const preview = textContent.replace(/\s+/g, " ").trim();
        const shortPreview = preview.length > 110 ? preview.slice(0, 110) + "..." : preview;

        let pKey: "start" | "middle" | "end" = (m.session_phase || "").toLowerCase();
        if (pKey !== "start" && pKey !== "middle" && pKey !== "end") {
          pKey = turnCounter <= 2 ? "start" : turnCounter <= 5 ? "middle" : "end";
        }

        return {
          message_id: m.id,
          turn_index: m.role === "assistant" ? turnCounter : Math.max(1, turnCounter),
          timestamp: m.created_at || new Date().toISOString(),
          formatted_time: m.created_at
            ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "Recent",
          role: m.role,
          content: textContent,
          preview: shortPreview,
          response_time: typeof m.response_time === "number" && m.response_time > 0 ? Number(m.response_time.toFixed(2)) : null,
          session_phase: pKey,
          feedback: f
            ? {
                id: f.id,
                rating: Number(f.rating || 4),
                correctness: String(f.correctness || "correct").toLowerCase() as any,
                status: String(f.correctness || "correct").toLowerCase() === "correct" ? "Correct" : String(f.correctness || "correct").toLowerCase() === "partial" ? "Partial" : "Incorrect",
                length_type: String(f.length_type || "to_the_point").toLowerCase() as any,
                comment: f.comment,
                created_at: f.created_at,
              }
            : null,
        };
      });

      const pendingFeedbackCount = asstMsgs.filter((m: any) => !cFeedbackByMsgId[m.id]).length;

      sessionRecords.push({
        id: cId,
        title: chat.title || "Untitled conversation",
        created_at: chat.created_at || new Date().toISOString(),
        started_formatted: chat.created_at
          ? new Date(chat.created_at).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
          : "Recent",
        last_activity: new Date(lastActivityTs).toISOString(),
        last_activity_formatted: new Date(lastActivityTs).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        duration_seconds: durationSecs,
        duration_formatted: formatDuration(durationSecs),
        user_messages_count: userMsgs.length,
        assistant_responses_count: asstMsgs.length,
        evaluated_responses_count: cFeedback.length,
        accuracy: cAccuracy,
        average_rating: cAvgRating,
        average_response_time: cAvg,
        status,
        is_finalized: isFinalized,
        finalized_at: savedSummary?.created_at || savedSummary?.summary_data?.finalized_at,
        pending_feedback_count: pendingFeedbackCount,
        phases,
        performance: {
          total_assistant: asstMsgs.length,
          total_evaluated: cFeedback.length,
          correct: cCorrect,
          partial: cPartial,
          incorrect: cIncorrect,
          accuracy: cAccuracy,
          average_rating: cAvgRating,
          rating_distribution: cRatingCounts,
          length_preference: cLengthCounts,
          response_time: {
            min: cMin,
            max: cMax,
            avg: cAvg,
            median: cMed,
            count: cTimes.length,
          },
        },
        timeline,
        summary: savedSummary
          ? {
              id: savedSummary.id,
              chat_id: savedSummary.chat_id,
              created_at: savedSummary.created_at,
              summary_data: savedSummary.summary_data || {},
            }
          : null,
      });
    }

    const totalSessions = sessionRecords.length;
    const avgSessionDuration = totalSessions > 0 ? Math.floor(totalDurationAll / totalSessions) : 0;
    const avgSessionAccuracy =
      totalEvaluatedAll > 0
        ? Number((((totalCorrectAll + totalPartialAll) / totalEvaluatedAll) * 100).toFixed(1))
        : null;

    const sessionsKPIs = {
      total_sessions: totalSessions,
      total_assistant_responses: totalAssistantMsgsAll,
      total_evaluated_responses: totalEvaluatedAll,
      average_session_accuracy: avgSessionAccuracy,
      average_response_time: rtAvg,
      average_session_duration_seconds: avgSessionDuration,
      average_session_duration_formatted: formatDuration(avgSessionDuration),
    };

    const sessionInsights: any[] = [];
    if (totalEvaluatedAll > 0 && avgSessionAccuracy !== null) {
      if (avgSessionAccuracy >= 75) {
        sessionInsights.push({
          id: "high-accuracy",
          type: "success",
          title: "High Conversation Accuracy",
          description: `Overall model accuracy across evaluated turns is ${avgSessionAccuracy}%, indicating reliable assistance across multi-turn sessions.`,
          metric_label: "Accuracy",
          metric_value: `${avgSessionAccuracy}%`,
        });
      } else {
        sessionInsights.push({
          id: "accuracy-attention",
          type: "warning",
          title: "Accuracy Below Target",
          description: `Overall model accuracy is currently ${avgSessionAccuracy}%. Review incorrect responses to identify specific problem areas.`,
          metric_label: "Accuracy",
          metric_value: `${avgSessionAccuracy}%`,
        });
      }
    }

    if (rtAvg !== null) {
      sessionInsights.push({
        id: "latency-benchmark",
        type: "info",
        title: "Response Time Benchmark",
        description: `Average assistant response generation latency across sessions is ${rtAvg}s.`,
        metric_label: "Mean Latency",
        metric_value: `${rtAvg}s`,
      });
    }

    const unfinalizedCount = sessionRecords.filter((s) => !s.is_finalized && s.assistant_responses_count > 0).length;
    if (unfinalizedCount > 0) {
      sessionInsights.push({
        id: "unfinalized-sessions",
        type: "neutral",
        title: "Sessions Pending Finalization (FR22)",
        description: `${unfinalizedCount} completed chat session${unfinalizedCount === 1 ? " is" : "s are"} eligible for permanent analytics summary persistence.`,
        metric_label: "Pending",
        metric_value: `${unfinalizedCount}`,
      });
    } else if (sessionRecords.length > 0) {
      sessionInsights.push({
        id: "all-finalized",
        type: "success",
        title: "All Sessions Finalized",
        description: "All chat sessions have permanent analytics summaries recorded in the database.",
        metric_label: "Finalized",
        metric_value: "100%",
      });
    }

    const selectedSession = sessionId
      ? sessionRecords.find((s) => s.id === sessionId) || null
      : sessionRecords.length > 0
      ? sessionRecords[0]
      : null;

    const sessionsPayload = {
      kpis: sessionsKPIs,
      sessions: sessionRecords,
      selected_session: selectedSession,
      insights: sessionInsights,
    };

    // Strict rule: No synthetic feedback generation. Genuine stored data only.
    if (!feedbackData || feedbackData.length === 0) {
      const emptyTopicAccuracy = STANDARD_DOMAINS.map((dom) => ({
        topic: dom,
        total_evaluated: 0,
        correct: 0,
        partial: 0,
        incorrect: 0,
        accuracy: 0.0,
      }));

      const emptyPhaseAccuracy = [
        {
          phase: "Start" as const,
          phase_label: "Start",
          turns_range: "Turns 1–2",
          total_evaluated: 0,
          correct: 0,
          partial: 0,
          incorrect: 0,
          accuracy: 0.0,
        },
        {
          phase: "Middle" as const,
          phase_label: "Middle",
          turns_range: "Turns 3–5",
          total_evaluated: 0,
          correct: 0,
          partial: 0,
          incorrect: 0,
          accuracy: 0.0,
        },
        {
          phase: "End" as const,
          phase_label: "End",
          turns_range: "Turns 6+",
          total_evaluated: 0,
          correct: 0,
          partial: 0,
          incorrect: 0,
          accuracy: 0.0,
        },
      ];

      const emptyRatingDistribution = [
        { rating: 4, label: "Excellent", count: 0, percentage: 0.0 },
        { rating: 3, label: "Good", count: 0, percentage: 0.0 },
        { rating: 2, label: "Fair", count: 0, percentage: 0.0 },
        { rating: 1, label: "Poor", count: 0, percentage: 0.0 },
      ];

      const emptyLengthPreference = [
        { length_type: "Short" as const, raw_type: "short" as const, count: 0, percentage: 0.0, avg_rating: null },
        { length_type: "To the Point" as const, raw_type: "to_the_point" as const, count: 0, percentage: 0.0, avg_rating: null },
        { length_type: "Lengthy" as const, raw_type: "lengthy" as const, count: 0, percentage: 0.0, avg_rating: null },
      ];

      return NextResponse.json({
        summary: {
          total_feedback: 0,
          average_rating: 0.0,
          last_updated: new Date().toISOString(),
        },
        stats: {
          ratings: { "1": 0, "2": 0, "3": 0, "4": 0 },
          correctness: { correct: 0, partial: 0, incorrect: 0 },
          length_distribution: { short: 0, to_the_point: 0, lengthy: 0 },
        },
        trends: [
          { day: "Mon", total: 0, helpful: 0, accuracy: 0.0 },
          { day: "Tue", total: 0, helpful: 0, accuracy: 0.0 },
          { day: "Wed", total: 0, helpful: 0, accuracy: 0.0 },
          { day: "Thu", total: 0, helpful: 0, accuracy: 0.0 },
          { day: "Fri", total: 0, helpful: 0, accuracy: 0.0 },
          { day: "Sat", total: 0, helpful: 0, accuracy: 0.0 },
          { day: "Sun", total: 0, helpful: 0, accuracy: 0.0 },
        ],
        recent_feedback: [],
        topics: VALID_DOMAINS.map((dom, i) => ({
          cluster: i,
          name: dom,
          keywords: [dom.toLowerCase()],
          count: 0,
        })),
        raw_data_count: assistantCount,
        tables: {
          topic_accuracy: emptyTopicAccuracy,
          reply_correctness: [],
          phase_accuracy: emptyPhaseAccuracy,
          response_time_summary: responseTimeSummary,
          rating_distribution: emptyRatingDistribution,
          length_preference: emptyLengthPreference,
        },
        graphs: {
          topic_distribution: STANDARD_DOMAINS.map((dom) => ({
            topic: dom,
            count: 0,
            percentage: 0.0,
            color: TOPIC_COLORS[dom] || "#71717a",
          })),
          accuracy_by_topic: STANDARD_DOMAINS.map((dom) => ({
            topic: dom,
            accuracy: 0.0,
            total_evaluated: 0,
            correct: 0,
            partial: 0,
            incorrect: 0,
          })),
          phase_accuracy: [
            { phase: "Start" as const, label: "Start", turns_range: "Turns 1–2", accuracy: null, total_evaluated: 0, correct: 0, partial: 0, incorrect: 0 },
            { phase: "Middle" as const, label: "Middle", turns_range: "Turns 3–5", accuracy: null, total_evaluated: 0, correct: 0, partial: 0, incorrect: 0 },
            { phase: "End" as const, label: "End", turns_range: "Turns 6+", accuracy: null, total_evaluated: 0, correct: 0, partial: 0, incorrect: 0 },
          ],
          reply_correctness: [],
          response_time_trend: responseTimeTrend,
          rating_distribution: [
            { rating: 1, label: "Poor", count: 0, percentage: 0.0, color: RATING_COLORS[1] },
            { rating: 2, label: "Fair", count: 0, percentage: 0.0, color: RATING_COLORS[2] },
            { rating: 3, label: "Good", count: 0, percentage: 0.0, color: RATING_COLORS[3] },
            { rating: 4, label: "Excellent", count: 0, percentage: 0.0, color: RATING_COLORS[4] },
          ],
          length_preference: [
            { type: "Short" as const, raw_type: "short" as const, count: 0, percentage: 0.0, avg_rating: null, color: LENGTH_COLORS.short },
            { type: "To the Point" as const, raw_type: "to_the_point" as const, count: 0, percentage: 0.0, avg_rating: null, color: LENGTH_COLORS.to_the_point },
            { type: "Lengthy" as const, raw_type: "lengthy" as const, count: 0, percentage: 0.0, avg_rating: null, color: LENGTH_COLORS.lengthy },
          ],
          total_evaluations: 0,
          total_measured_responses: responseTimeTrend.length,
          average_latency: rtAvg,
        },
        sessions: sessionsPayload,
      });
    }

    // 1. Rating Distribution (1–4 Scale)
    const ratingCounts: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0 };
    let ratingSum = 0;
    let ratingTotal = 0;

    for (const f of feedbackData) {
      const r = String(f.rating || 4);
      if (ratingCounts[r] !== undefined) {
        ratingCounts[r] += 1;
        ratingSum += Number(f.rating || 4);
        ratingTotal += 1;
      }
    }
    const avgRating = ratingTotal > 0 ? Number((ratingSum / ratingTotal).toFixed(2)) : 0.0;

    // 2. Correctness Metrics (% of total)
    const correctnessCounts: Record<string, number> = { correct: 0, partial: 0, incorrect: 0 };
    for (const f of feedbackData) {
      const c = String(f.correctness || "correct").toLowerCase();
      if (correctnessCounts[c] !== undefined) {
        correctnessCounts[c] += 1;
      } else {
        correctnessCounts.correct += 1;
      }
    }
    const totalCount = feedbackData.length;
    const correctnessPct = {
      correct: Number(((correctnessCounts.correct / totalCount) * 100).toFixed(1)),
      partial: Number(((correctnessCounts.partial / totalCount) * 100).toFixed(1)),
      incorrect: Number(((correctnessCounts.incorrect / totalCount) * 100).toFixed(1)),
    };

    // 3. Length Distribution
    const lengthCounts: Record<string, number> = { short: 0, to_the_point: 0, lengthy: 0 };
    for (const f of feedbackData) {
      const l = String(f.length_type || "to_the_point").toLowerCase();
      if (lengthCounts[l] !== undefined) {
        lengthCounts[l] += 1;
      } else {
        lengthCounts.to_the_point += 1;
      }
    }

    // 4. Day Trends
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayMap: Record<string, { total: number; correct: number; partial: number }> = {};
    for (const d of dayOrder) dayMap[d] = { total: 0, correct: 0, partial: 0 };

    for (const f of feedbackData) {
      const date = new Date(f.created_at || Date.now());
      const dayStr = dayNames[date.getDay()];
      if (dayMap[dayStr]) {
        dayMap[dayStr].total += 1;
        const c = String(f.correctness || "correct").toLowerCase();
        if (c === "correct") dayMap[dayStr].correct += 1;
        else if (c === "partial") dayMap[dayStr].partial += 1;
      }
    }

    const trends = dayOrder.map((day) => {
      const item = dayMap[day];
      const helpful = item.correct + item.partial;
      const accuracy = item.total > 0 ? Number(((helpful / item.total) * 100).toFixed(1)) : 0.0;
      return {
        day,
        total: item.total,
        helpful,
        accuracy,
      };
    });

    // 5. Aggregate Topic Counts across ALL genuine feedback records
    const topicCounts: Record<string, number> = {};
    for (const d of VALID_DOMAINS) topicCounts[d] = 0;

    for (const row of feedbackData) {
      const cid = row.chat_id;
      let userQuery = "Chat prompt";
      if (cid && messagesByChat[cid]) {
        const chatMsgs = messagesByChat[cid];
        const users = chatMsgs.filter((m: any) => m.role === "user");
        if (users.length > 0) userQuery = users[0].content || userQuery;
      }
      const topic = resolveTopic(userQuery, row.category || chatDomains[cid]);
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }

    // 6. Recent Feedback Matrix (latest 10)
    const sortedFeedback = [...feedbackData].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
    );

    const recentFeedback = sortedFeedback.slice(0, 10).map((row) => {
      const cid = row.chat_id;
      const msgId = row.message_id;

      let asstMsg = messagesById[msgId];
      if (!asstMsg && cid && messagesByChat[cid]) {
        const assts = messagesByChat[cid].filter((m: any) => m.role === "assistant");
        if (assts.length > 0) asstMsg = assts[assts.length - 1];
      }

      let userMsg: any = null;
      if (cid && messagesByChat[cid]) {
        const chatMsgs = messagesByChat[cid];
        if (asstMsg && asstMsg.created_at) {
          const asstTime = new Date(asstMsg.created_at).getTime();
          // Find the user prompt asked immediately before this assistant response
          const precedingUsers = chatMsgs.filter(
            (m) => m.role === "user" && new Date(m.created_at || 0).getTime() <= asstTime
          );
          if (precedingUsers.length > 0) {
            userMsg = precedingUsers[precedingUsers.length - 1];
          }
        }
        if (!userMsg) {
          const users = chatMsgs.filter((m) => m.role === "user");
          if (users.length > 0) userMsg = users[0];
        }
      }

      const modelResponse = asstMsg?.content || row.comment || "AI response recorded";
      const userQuery = userMsg?.content || (row.category ? `Question on ${row.category}` : "Chat prompt");
      const previewText = modelResponse.trim().replace(/\s+/g, " ");
      const preview = previewText.length > 65 ? previewText.slice(0, 65) + "..." : previewText;

      const rawStatus = String(row.correctness || "correct").toLowerCase();
      const status = rawStatus === "correct" ? "Correct" : rawStatus === "partial" ? "Partial" : "Incorrect";

      const topic = resolveTopic(userQuery, row.category || chatDomains[cid]);

      return {
        id: row.id,
        time: row.created_at ? new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
        topic,
        preview,
        user_query: userQuery,
        model_response: modelResponse,
        feedback: (row.rating && row.rating >= 3 ? "up" : "down") as "up" | "down",
        status,
        rating: row.rating || 4,
        correctness: rawStatus,
        length_type: row.length_type || "to_the_point",
      };
    });

    // ==========================================
    // FR19: BUILD THE SIX ANALYTICAL TABLES
    // ==========================================

    // Table 1: Topic vs Accuracy
    const topicStats: Record<
      string,
      { total: number; correct: number; partial: number; incorrect: number }
    > = {};
    for (const dom of STANDARD_DOMAINS) {
      topicStats[dom] = { total: 0, correct: 0, partial: 0, incorrect: 0 };
    }

    // Table 3: Phase-Wise Accuracy
    const phaseStats: Record<
      "Start" | "Middle" | "End",
      { total: number; correct: number; partial: number; incorrect: number }
    > = {
      Start: { total: 0, correct: 0, partial: 0, incorrect: 0 },
      Middle: { total: 0, correct: 0, partial: 0, incorrect: 0 },
      End: { total: 0, correct: 0, partial: 0, incorrect: 0 },
    };

    // Table 6: Length Distribution with Average Rating
    const lengthStats: Record<
      "short" | "to_the_point" | "lengthy",
      { count: number; ratingSum: number; ratingCount: number }
    > = {
      short: { count: 0, ratingSum: 0, ratingCount: 0 },
      to_the_point: { count: 0, ratingSum: 0, ratingCount: 0 },
      lengthy: { count: 0, ratingSum: 0, ratingCount: 0 },
    };

    // Table 2: Full Reply Correctness List
    const allReplyCorrectness = sortedFeedback.map((row) => {
      const cid = row.chat_id;
      const msgId = row.message_id;

      let asstMsg = messagesById[msgId];
      if (!asstMsg && cid && messagesByChat[cid]) {
        const assts = messagesByChat[cid].filter((m: any) => m.role === "assistant");
        if (assts.length > 0) asstMsg = assts[assts.length - 1];
      }

      let userMsg: any = null;
      if (cid && messagesByChat[cid]) {
        const chatMsgs = messagesByChat[cid];
        if (asstMsg && asstMsg.created_at) {
          const asstTime = new Date(asstMsg.created_at).getTime();
          const precedingUsers = chatMsgs.filter(
            (m) => m.role === "user" && new Date(m.created_at || 0).getTime() <= asstTime
          );
          if (precedingUsers.length > 0) {
            userMsg = precedingUsers[precedingUsers.length - 1];
          }
        }
        if (!userMsg) {
          const users = chatMsgs.filter((m) => m.role === "user");
          if (users.length > 0) userMsg = users[0];
        }
      }

      const modelResponse = asstMsg?.content || row.comment || "AI response recorded";
      const userQuery = userMsg?.content || (row.category ? `Question on ${row.category}` : "Chat prompt");
      const previewText = modelResponse.trim().replace(/\s+/g, " ");
      const preview = previewText.length > 90 ? previewText.slice(0, 90) + "..." : previewText;

      const rawStatus = String(row.correctness || "correct").toLowerCase() as
        | "correct"
        | "partial"
        | "incorrect";
      const status =
        rawStatus === "correct"
          ? ("Correct" as const)
          : rawStatus === "partial"
          ? ("Partial" as const)
          : ("Incorrect" as const);

      const rawResolved = resolveTopic(userQuery, row.category || chatDomains[cid]);
      const topic = DOMAIN_MAP[rawResolved] || "Other";

      // Aggregate into Table 1
      if (topicStats[topic]) {
        topicStats[topic].total += 1;
        topicStats[topic][rawStatus] += 1;
      } else {
        topicStats["Other"].total += 1;
        topicStats["Other"][rawStatus] += 1;
      }

      // Determine Session Phase for Table 3
      let phaseKey: "Start" | "Middle" | "End" = "Start";
      const msgPhase = (asstMsg?.session_phase || userMsg?.session_phase || "").toLowerCase();
      if (msgPhase === "start") phaseKey = "Start";
      else if (msgPhase === "middle") phaseKey = "Middle";
      else if (msgPhase === "end") phaseKey = "End";
      else if (cid && messagesByChat[cid]) {
        const chatMsgs = messagesByChat[cid];
        const msgIdx = asstMsg ? chatMsgs.findIndex((m) => m.id === asstMsg.id) : -1;
        const turnIdx = msgIdx >= 0 ? Math.floor(msgIdx / 2) + 1 : 1;
        phaseKey = turnIdx <= 2 ? "Start" : turnIdx <= 5 ? "Middle" : "End";
      }

      phaseStats[phaseKey].total += 1;
      phaseStats[phaseKey][rawStatus] += 1;

      // Aggregate Table 6
      const rawLen = String(row.length_type || "to_the_point").toLowerCase() as
        | "short"
        | "to_the_point"
        | "lengthy";
      if (lengthStats[rawLen]) {
        lengthStats[rawLen].count += 1;
        if (row.rating && row.rating >= 1 && row.rating <= 4) {
          lengthStats[rawLen].ratingSum += Number(row.rating);
          lengthStats[rawLen].ratingCount += 1;
        }
      }

      const sessionTitle = chatsById[cid] || (cid ? `Session ${cid.slice(0, 8)}` : "Chat Session");
      const respTime =
        asstMsg && typeof asstMsg.response_time === "number" && asstMsg.response_time > 0
          ? Number(asstMsg.response_time.toFixed(2))
          : null;

      return {
        id: row.id,
        message_id: row.message_id,
        chat_id: cid,
        session_title: sessionTitle,
        timestamp: row.created_at || new Date().toISOString(),
        formatted_time: row.created_at
          ? new Date(row.created_at).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Recent",
        topic,
        user_query: userQuery,
        assistant_response: modelResponse,
        preview,
        rating: Number(row.rating || 0),
        correctness: rawStatus,
        status,
        response_time: respTime,
        feedback_status: (row.rating && row.rating >= 3 ? "up" : "down") as "up" | "down",
        length_type: rawLen,
        comment: row.comment || undefined,
      };
    });

    // Formatted Table 1 Rows
    const tableTopicAccuracy = STANDARD_DOMAINS.map((dom) => {
      const s = topicStats[dom] || { total: 0, correct: 0, partial: 0, incorrect: 0 };
      const accuracy = s.total > 0 ? Number((((s.correct + s.partial) / s.total) * 100).toFixed(1)) : 0.0;
      return {
        topic: dom,
        total_evaluated: s.total,
        correct: s.correct,
        partial: s.partial,
        incorrect: s.incorrect,
        accuracy,
      };
    });

    // Formatted Table 3 Rows
    const phaseConfig = [
      { phase: "Start" as const, label: "Start", range: "Turns 1–2" },
      { phase: "Middle" as const, label: "Middle", range: "Turns 3–5" },
      { phase: "End" as const, label: "End", range: "Turns 6+" },
    ];
    const tablePhaseAccuracy = phaseConfig.map((p) => {
      const s = phaseStats[p.phase];
      const accuracy = s.total > 0 ? Number((((s.correct + s.partial) / s.total) * 100).toFixed(1)) : 0.0;
      return {
        phase: p.phase,
        phase_label: p.label,
        turns_range: p.range,
        total_evaluated: s.total,
        correct: s.correct,
        partial: s.partial,
        incorrect: s.incorrect,
        accuracy,
      };
    });

    // Formatted Table 5 Rows (Rating Distribution)
    const ratingLabels: Record<number, string> = {
      4: "Excellent",
      3: "Good",
      2: "Fair",
      1: "Poor",
    };
    const tableRatingDistribution = [4, 3, 2, 1].map((r) => {
      const cnt = ratingCounts[String(r)] || 0;
      const pct = ratingTotal > 0 ? Number(((cnt / ratingTotal) * 100).toFixed(1)) : 0.0;
      return {
        rating: r,
        label: ratingLabels[r],
        count: cnt,
        percentage: pct,
      };
    });

    // Formatted Table 6 Rows (Length Preference)
    const lengthConfig = [
      { type: "Short" as const, raw: "short" as const },
      { type: "To the Point" as const, raw: "to_the_point" as const },
      { type: "Lengthy" as const, raw: "lengthy" as const },
    ];
    const totalLengthValid =
      lengthStats.short.count + lengthStats.to_the_point.count + lengthStats.lengthy.count;
    const tableLengthPreference = lengthConfig.map((l) => {
      const s = lengthStats[l.raw];
      const pct = totalLengthValid > 0 ? Number(((s.count / totalLengthValid) * 100).toFixed(1)) : 0.0;
      const avgRating = s.ratingCount > 0 ? Number((s.ratingSum / s.ratingCount).toFixed(2)) : null;
      return {
        length_type: l.type,
        raw_type: l.raw,
        count: s.count,
        percentage: pct,
        avg_rating: avgRating,
      };
    });

    // 7. Topics List (Overview horizontal bar chart backward compatibility)
    const topics = VALID_DOMAINS.map((dom, i) => ({
      cluster: i,
      name: dom,
      keywords: [dom.toLowerCase()],
      count: topicCounts[dom] || 0,
    }));

    // ==========================================
    // FR20: BUILD THE SEVEN ANALYTICAL GRAPHS
    // ==========================================

    // Graph 1: Topic Distribution
    const graphsTopicDistribution = STANDARD_DOMAINS.map((dom) => {
      const cnt = topicStats[dom]?.total || 0;
      const pct = totalCount > 0 ? Number(((cnt / totalCount) * 100).toFixed(1)) : 0.0;
      return {
        topic: dom,
        count: cnt,
        percentage: pct,
        color: TOPIC_COLORS[dom] || "#71717a",
      };
    });

    // Graph 2: Accuracy per Topic
    const graphsAccuracyByTopic = STANDARD_DOMAINS.map((dom) => {
      const s = topicStats[dom] || { total: 0, correct: 0, partial: 0, incorrect: 0 };
      const accuracy = s.total > 0 ? Number((((s.correct + s.partial) / s.total) * 100).toFixed(1)) : 0.0;
      return {
        topic: dom,
        accuracy,
        total_evaluated: s.total,
        correct: s.correct,
        partial: s.partial,
        incorrect: s.incorrect,
      };
    });

    // Graph 3: Accuracy vs Session Phase (Start -> Middle -> End)
    const graphsPhaseAccuracy = phaseConfig.map((p) => {
      const s = phaseStats[p.phase];
      const accuracy = s.total > 0 ? Number((((s.correct + s.partial) / s.total) * 100).toFixed(1)) : null;
      return {
        phase: p.phase,
        label: p.label,
        turns_range: p.range,
        accuracy,
        total_evaluated: s.total,
        correct: s.correct,
        partial: s.partial,
        incorrect: s.incorrect,
      };
    });

    // Graph 4: Correctness per Reply (Chronological order)
    const graphsReplyCorrectness = [...allReplyCorrectness]
      .reverse()
      .map((r, i) => ({
        id: r.id,
        index: i + 1,
        timestamp: r.timestamp,
        formatted_time: r.formatted_time,
        chat_id: r.chat_id,
        session_title: r.session_title,
        topic: r.topic,
        rating: r.rating,
        status: r.status,
        correctness: r.correctness,
        preview: r.preview,
        user_query: r.user_query,
        assistant_response: r.assistant_response,
        response_time: r.response_time,
      }));

    // Graph 6: Rating Distribution (1–4 Scale)
    const graphsRatingDistribution = [1, 2, 3, 4].map((r) => {
      const cnt = ratingCounts[String(r)] || 0;
      const pct = ratingTotal > 0 ? Number(((cnt / ratingTotal) * 100).toFixed(1)) : 0.0;
      return {
        rating: r,
        label: ratingLabels[r],
        count: cnt,
        percentage: pct,
        color: RATING_COLORS[r],
      };
    });

    // Graph 7: Length Preference
    const graphsLengthPreference = lengthConfig.map((l) => {
      const s = lengthStats[l.raw];
      const pct = totalLengthValid > 0 ? Number(((s.count / totalLengthValid) * 100).toFixed(1)) : 0.0;
      const avgRating = s.ratingCount > 0 ? Number((s.ratingSum / s.ratingCount).toFixed(2)) : null;
      return {
        type: l.type,
        raw_type: l.raw,
        count: s.count,
        percentage: pct,
        avg_rating: avgRating,
        color: LENGTH_COLORS[l.raw],
      };
    });

    const graphsPayload = {
      topic_distribution: graphsTopicDistribution,
      accuracy_by_topic: graphsAccuracyByTopic,
      phase_accuracy: graphsPhaseAccuracy,
      reply_correctness: graphsReplyCorrectness,
      response_time_trend: responseTimeTrend,
      rating_distribution: graphsRatingDistribution,
      length_preference: graphsLengthPreference,
      total_evaluations: totalCount,
      total_measured_responses: responseTimeTrend.length,
      average_latency: rtAvg,
    };

    return NextResponse.json({
      summary: {
        total_feedback: totalCount,
        average_rating: avgRating,
        last_updated: new Date().toISOString(),
      },
      stats: {
        ratings: ratingCounts,
        correctness: correctnessPct,
        length_distribution: lengthCounts,
      },
      trends,
      recent_feedback: recentFeedback,
      topics,
      raw_data_count: assistantCount,
      tables: {
        topic_accuracy: tableTopicAccuracy,
        reply_correctness: allReplyCorrectness,
        phase_accuracy: tablePhaseAccuracy,
        response_time_summary: responseTimeSummary,
        rating_distribution: tableRatingDistribution,
        length_preference: tableLengthPreference,
      },
      graphs: graphsPayload,
      sessions: sessionsPayload,
    });
  } catch (error: any) {
    console.error("Analytics API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
