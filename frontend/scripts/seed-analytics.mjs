/**
 * Dev-only seed script: realistic analytics dummy data
 * Target user: recluzedev@gmail.com (0e62b6c3-c794-42cb-a139-bd5bd48cdad8)
 * Run from: frontend/  ->  node scripts/seed-analytics.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, "../.env.local");
  try {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim();
      process.env[key] = process.env[key] ?? val;
    }
  } catch {
    console.warn("Could not load .env.local");
  }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TARGET_EMAIL = "recluzedev@gmail.com";

if (!SERVICE_KEY) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY not found.");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Canonical codes (Phase 1 single source of truth)
const SCENARIOS = [
  {
    canonicalCode: "MachineLearning",
    title: "ML Regression & Clustering Session",
    msgs: [
      "explain supervised machine learning regression and clustering algorithms",
      "what is the difference between SVM and logistic regression for classification",
      "how does k-means clustering work with unlabeled datasets",
      "describe overfitting and regularization in machine learning models",
      "what is cross-validation and how does it help evaluate a model",
      "explain gradient descent optimization for training ML models",
    ],
  },
  {
    canonicalCode: "DeepLearning",
    title: "CNN & Transformer Architecture Review",
    msgs: [
      "how does a CNN transformer work in deep learning architectures",
      "explain backpropagation through a deep neural network with RNN layers",
      "what is the attention mechanism in a transformer model and how does it work",
      "compare LSTM and GRU for sequence modelling in deep learning",
      "how is PyTorch used to train a convolutional neural network on image data",
    ],
  },
  {
    canonicalCode: "HealthcareAI",
    title: "Healthcare AI Patient Data Analysis",
    msgs: [
      "how is patient data used in healthcare hospitals for AI diagnostics",
      "explain the role of machine learning in medical imaging and radiology",
      "what are the privacy challenges of using clinical data for AI models",
      "how does AI assist in predicting hospital readmission rates",
      "explain AI-driven drug discovery pipelines used in healthcare",
      "what is federated learning and why is it important for medical AI",
    ],
  },
  {
    canonicalCode: "PowerSystems",
    title: "Power Grid Voltage & Solar Storage",
    msgs: [
      "explain how power grid voltage stability is maintained using AI",
      "how does solar battery storage interact with the smart grid",
      "what machine learning techniques are used for energy demand forecasting",
      "explain optimal power flow problems in power systems engineering",
      "how does AI help manage renewable energy integration into the grid",
    ],
  },
  {
    canonicalCode: "E-commerceAI",
    title: "E-commerce Recommendation Systems",
    msgs: [
      "how do e-commerce product recommendation systems work using collaborative filtering",
      "explain cart abandonment prediction using machine learning in retail",
      "what is a knowledge graph and how does it improve product search",
      "how are A/B tests used to optimize recommendation algorithms in ecommerce",
      "explain dynamic pricing models used by e-commerce AI platforms",
      "how does customer segmentation improve personalization in retail AI",
    ],
  },
  {
    canonicalCode: "MachineLearning",
    title: "Feature Engineering & Model Selection",
    msgs: [
      "what is feature engineering and why is it critical in machine learning pipelines",
      "compare random forests and gradient boosting for classification tasks",
      "explain the bias-variance tradeoff in ML model selection",
      "how do ensemble methods improve predictive accuracy in datasets",
    ],
  },
];

const CORRECTNESS = ["correct", "correct", "correct", "partial", "partial", "incorrect"];
const LENGTH_TYPES = ["to_the_point", "to_the_point", "short", "lengthy", "to_the_point", "short"];
const RATINGS = [4, 4, 3, 4, 3, 2, 4, 3, 2, 4, 3, 4];

function pick(arr, idx) {
  return arr[idx % arr.length];
}

function daysAgo(n, h = 0) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + h, 0, 0, 0);
  return d.toISOString();
}

function minutesAfter(iso, mins) {
  return new Date(new Date(iso).getTime() + mins * 60000).toISOString();
}

const ASST = (code, q) =>
  `Explanation on "${q.slice(0, 60)}": In ${code}, the key aspects are: ` +
  `[1] Foundational concepts are established in literature. ` +
  `[2] Practical implementations vary by domain. ` +
  `[3] Evaluation metrics must reflect the business goal. ` +
  `This covers the primary dimensions of your ${code} question.`;

async function seed() {
  console.log("\n🌱 Resolving target user:", TARGET_EMAIL);

  // 1. Resolve user id dynamically
  const { data: usersData, error: userErr } = await supabaseAdmin.auth.admin.listUsers();
  if (userErr) throw userErr;

  const targetUser = usersData.users.find((u) => u.email === TARGET_EMAIL);
  if (!targetUser) {
    throw new Error(`User ${TARGET_EMAIL} not found in Supabase Auth`);
  }

  const userId = targetUser.id;
  console.log(`✓ Resolved user_id: ${userId}`);

  // 2. Reset that user's prior chats (cascade) for idempotency
  const { data: oldChats, error: listChatErr } = await supabaseAdmin
    .from("chats")
    .select("id")
    .eq("user_id", userId);

  if (listChatErr) throw listChatErr;

  if (oldChats && oldChats.length > 0) {
    for (const c of oldChats) {
      await supabaseAdmin.from("chats").delete().eq("id", c.id);
    }
    console.log(`🧹 Deleted ${oldChats.length} prior chats (cascade).`);
  }

  let totalChats = 0,
    totalMsgs = 0,
    totalFb = 0,
    totalDom = 0;

  for (let di = 0; di < SCENARIOS.length; di++) {
    const sc = SCENARIOS[di];
    // Spread created_at over ~3 weeks (21 days down to 6 days ago)
    const chatCreatedAt = daysAgo(21 - di * 3);

    const { data: chat, error: chatErr } = await supabaseAdmin
      .from("chats")
      .insert({
        user_id: userId,
        title: sc.title,
        created_at: chatCreatedAt,
        updated_at: chatCreatedAt,
      })
      .select("*")
      .single();

    if (chatErr) throw chatErr;
    totalChats++;

    // Insert ONE domains row per chat with canonical code
    const { error: domErr } = await supabaseAdmin.from("domains").insert({
      chat_id: chat.id,
      category: sc.canonicalCode,
      created_at: chatCreatedAt,
    });

    if (domErr) throw domErr;
    totalDom++;

    let fbIdx = (di * 7) % RATINGS.length;
    for (let ti = 0; ti < sc.msgs.length; ti++) {
      const userText = sc.msgs[ti];
      const turnIndex = ti + 1;
      const phase = turnIndex <= 2 ? "start" : turnIndex <= 5 ? "middle" : "end";
      const userTime = minutesAfter(chatCreatedAt, ti * 8);
      const asstTime = minutesAfter(userTime, 1.5);
      const rt = parseFloat((0.4 + Math.random() * 11.6).toFixed(3));

      // User message
      const { error: uMsgErr } = await supabaseAdmin.from("messages").insert({
        chat_id: chat.id,
        user_id: userId,
        role: "user",
        content: userText,
        session_phase: phase,
        created_at: userTime,
      });
      if (uMsgErr) throw uMsgErr;
      totalMsgs++;

      // Assistant message with response_time and session_phase
      const { data: asstMsg, error: aMsgErr } = await supabaseAdmin
        .from("messages")
        .insert({
          chat_id: chat.id,
          user_id: userId,
          role: "assistant",
          content: ASST(sc.canonicalCode, userText),
          response_time: rt,
          session_phase: phase,
          created_at: asstTime,
        })
        .select("*")
        .single();
      if (aMsgErr) throw aMsgErr;
      totalMsgs++;

      // Feedback row for each assistant message
      const { error: fbErr } = await supabaseAdmin.from("feedback").insert({
        chat_id: chat.id,
        user_id: userId,
        message_id: asstMsg.id,
        rating: pick(RATINGS, fbIdx),
        correctness: pick(CORRECTNESS, fbIdx),
        length_type: pick(LENGTH_TYPES, fbIdx),
        category: sc.canonicalCode,
        comment: `Turn ${turnIndex} feedback`,
        created_at: minutesAfter(asstTime, 1),
      });
      if (fbErr) throw fbErr;
      totalFb++;
      fbIdx++;
    }
    console.log(
      `   ✓ [${di + 1}/6] "${sc.title}" — ${sc.msgs.length} turns, ${sc.msgs.length} feedback rows, code=${sc.canonicalCode}`
    );
  }

  console.log(
    `\n✅ Seeded successfully:\n - ${totalChats} chats\n - ${totalMsgs} messages\n - ${totalFb} feedback rows (> 10)\n - ${totalDom} domains rows with canonical codes`
  );
}

seed().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
