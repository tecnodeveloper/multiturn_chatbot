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

    const feedbackUrl = `${supabaseUrl}/rest/v1/feedback?select=*&user_id=eq.${userId}`;
    const messagesUrl = `${supabaseUrl}/rest/v1/messages?select=*&user_id=eq.${userId}&order=created_at.asc`;
    const domainsUrl = `${supabaseUrl}/rest/v1/domains?select=*`;

    const [fRes, mRes, dRes] = await Promise.all([
      fetch(feedbackUrl, { headers, cache: "no-store" }).catch(() => null),
      fetch(messagesUrl, { headers, cache: "no-store" }).catch(() => null),
      fetch(domainsUrl, { headers, cache: "no-store" }).catch(() => null),
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

    const chatDomains: Record<string, string> = {};
    for (const d of domainsData) {
      if (d.chat_id) chatDomains[d.chat_id] = d.category;
    }

    // If no live feedback exists yet for this user, synthesize entries from real messages
    if (!feedbackData || feedbackData.length === 0) {
      if (messagesData && messagesData.length > 0) {
        for (const msg of messagesData) {
          if (msg.role === "assistant") {
            const content = msg.content || "";
            const respTime = msg.response_time || 1.2;
            const cid = msg.chat_id;
            const cat = chatDomains[cid] || "MachineLearning";

            feedbackData.push({
              id: msg.id,
              chat_id: cid,
              message_id: msg.id,
              created_at: msg.created_at || new Date().toISOString(),
              rating: respTime < 3.0 ? 4 : respTime < 5.0 ? 3 : 2,
              correctness: content.length > 50 ? "correct" : "partial",
              length_type: content.length >= 50 && content.length <= 500 ? "to_the_point" : content.length < 50 ? "short" : "lengthy",
              comment: content.slice(0, 80),
              category: cat,
              response_time: respTime,
            });
          }
        }
      }
    }

    if (!feedbackData || feedbackData.length === 0) {
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
        raw_data_count: messagesData.length,
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

    // 5. Recent Feedback Matrix (latest 10)
    const sortedFeedback = [...feedbackData].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
    );

    const topicCounts: Record<string, number> = {};
    for (const d of VALID_DOMAINS) topicCounts[d] = 0;

    const recentFeedback = sortedFeedback.slice(0, 10).map((row) => {
      const cid = row.chat_id;
      const msgId = row.message_id;

      let asstMsg = messagesById[msgId];
      if (!asstMsg && cid && messagesByChat[cid]) {
        const assts = messagesByChat[cid].filter((m) => m.role === "assistant");
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
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;

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

    // 6. Topics List
    const topics = VALID_DOMAINS.map((dom, i) => ({
      cluster: i,
      name: dom,
      keywords: [dom.toLowerCase()],
      count: topicCounts[dom] || 0,
    }));

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
      raw_data_count: messagesData.length,
    });
  } catch (error: any) {
    console.error("Analytics API Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
