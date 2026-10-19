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
    const userId = searchParams.get("user_id");
    const sessionId = searchParams.get("session_id") || searchParams.get("chat_id");

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
    const chatsUrl = `${supabaseUrl}/rest/v1/chats?select=id,title,created_at&user_id=eq.${userId}`;

    const [fRes, mRes, dRes, cRes] = await Promise.all([
      fetch(feedbackUrl, { headers, cache: "no-store" }).catch(() => null),
      fetch(messagesUrl, { headers, cache: "no-store" }).catch(() => null),
      fetch(domainsUrl, { headers, cache: "no-store" }).catch(() => null),
      fetch(chatsUrl, { headers, cache: "no-store" }).catch(() => null),
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
    });
  } catch (error: any) {
    console.error("Analytics API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
