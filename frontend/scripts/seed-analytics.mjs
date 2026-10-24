/**
 * Dev-only seed script: realistic analytics dummy data
 * Target user: recluzedev@gmail.com (0e62b6c3-c794-42cb-a139-bd5bd48cdad8)
 * Run from: frontend/  ->  node scripts/seed-analytics.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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
  } catch { console.warn("Could not load .env.local"); }
}
loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const USER_ID      = "0e62b6c3-c794-42cb-a139-bd5bd48cdad8";

if (!SERVICE_KEY) { console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY not found."); process.exit(1); }

const HEADERS = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

async function sb(path, opts = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, { ...opts, headers: { ...HEADERS, ...(opts.headers || {}) } });
  if (!res.ok) { const t = await res.text(); throw new Error(`${opts.method||"GET"} ${path} => ${res.status}: ${t}`); }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("json") ? res.json() : [];
}

// Canonical DB enum labels (spaced = domain_category_type)
const SCENARIOS = [
  {
    dbLabel: "Machine Learning", title: "ML Regression & Clustering Session",
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
    dbLabel: "Deep Learning", title: "CNN & Transformer Architecture Review",
    msgs: [
      "how does a CNN transformer work in deep learning architectures",
      "explain backpropagation through a deep neural network with RNN layers",
      "what is the attention mechanism in a transformer model and how does it work",
      "compare LSTM and GRU for sequence modelling in deep learning",
      "how is PyTorch used to train a convolutional neural network on image data",
    ],
  },
  {
    dbLabel: "Healthcare AI", title: "Healthcare AI Patient Data Analysis",
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
    dbLabel: "Power Systems", title: "Power Grid Voltage & Solar Storage",
    msgs: [
      "explain how power grid voltage stability is maintained using AI",
      "how does solar battery storage interact with the smart grid",
      "what machine learning techniques are used for energy demand forecasting",
      "explain optimal power flow problems in power systems engineering",
      "how does AI help manage renewable energy integration into the grid",
    ],
  },
  {
    dbLabel: "E-commerce AI", title: "E-commerce Recommendation Systems",
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
    dbLabel: "Machine Learning", title: "Feature Engineering & Model Selection",
    msgs: [
      "what is feature engineering and why is it critical in machine learning pipelines",
      "compare random forests and gradient boosting for classification tasks",
      "explain the bias-variance tradeoff in ML model selection",
      "how do ensemble methods improve predictive accuracy in datasets",
    ],
  },
];

const CORRECTNESS  = ["correct","correct","correct","partial","partial","incorrect"];
const LENGTH_TYPES = ["to_the_point","to_the_point","short","lengthy","to_the_point","short"];
const RATINGS      = [4,4,3,4,3,2,4,3,2,4,3,4];

function pick(arr, idx) { return arr[idx % arr.length]; }

function daysAgo(n, h = 0) {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(10 + h, 0, 0, 0);
  return d.toISOString();
}
function minutesAfter(iso, mins) {
  return new Date(new Date(iso).getTime() + mins * 60000).toISOString();
}
const ASST = (topic, q) =>
  `Explanation on "${q.slice(0,60)}": In ${topic}, the key aspects are: ` +
  `[1] Foundational concepts are established in literature. ` +
  `[2] Practical implementations vary by domain. ` +
  `[3] Evaluation metrics must reflect the business goal. ` +
  `This covers the primary dimensions of your ${topic} question.`;

async function seed() {
  console.log("\n🌱 Seeding analytics for user:", USER_ID);

  // Idempotent cleanup
  const oldChats = await sb(`/chats?user_id=eq.${USER_ID}&select=id`);
  for (const c of oldChats) await sb(`/chats?id=eq.${c.id}`, { method: "DELETE" });
  console.log(`🧹 Deleted ${oldChats.length} prior chats (cascade).`);

  let totalChats = 0, totalMsgs = 0, totalFb = 0, totalDom = 0;

  for (let di = 0; di < SCENARIOS.length; di++) {
    const sc = SCENARIOS[di];
    const chatCreatedAt = daysAgo(21 - di * 3);

    const [chat] = await sb("/chats", {
      method: "POST",
      body: JSON.stringify({ user_id: USER_ID, title: sc.title, created_at: chatCreatedAt, updated_at: chatCreatedAt }),
    });
    totalChats++;

    await sb("/domains", {
      method: "POST",
      body: JSON.stringify({ chat_id: chat.id, category: sc.dbLabel, created_at: chatCreatedAt }),
    });
    totalDom++;

    let fbIdx = (di * 7) % RATINGS.length;
    for (let ti = 0; ti < sc.msgs.length; ti++) {
      const userText = sc.msgs[ti];
      const turnIndex = ti + 1;
      const phase = turnIndex <= 2 ? "start" : turnIndex <= 5 ? "middle" : "end";
      const userTime = minutesAfter(chatCreatedAt, ti * 8);
      const asstTime = minutesAfter(userTime, 1.5);
      const rt = parseFloat((0.4 + Math.random() * 11.6).toFixed(3));

      await sb("/messages", {
        method: "POST",
        body: JSON.stringify({ chat_id: chat.id, user_id: USER_ID, role: "user", content: userText, session_phase: phase, created_at: userTime }),
      });
      totalMsgs++;

      const [asstMsg] = await sb("/messages", {
        method: "POST",
        body: JSON.stringify({ chat_id: chat.id, user_id: USER_ID, role: "assistant", content: ASST(sc.dbLabel, userText), response_time: rt, session_phase: phase, created_at: asstTime }),
      });
      totalMsgs++;

      await sb("/feedback", {
        method: "POST",
        body: JSON.stringify({
          chat_id: chat.id, user_id: USER_ID, message_id: asstMsg.id,
          rating: pick(RATINGS, fbIdx), correctness: pick(CORRECTNESS, fbIdx),
          length_type: pick(LENGTH_TYPES, fbIdx), category: sc.dbLabel,
          comment: `Turn ${turnIndex} feedback`,
          created_at: minutesAfter(asstTime, 1),
        }),
      });
      totalFb++;
      fbIdx++;
    }
    console.log(`   ✓ [${di+1}/6] "${sc.title}" — ${sc.msgs.length} turns, ${sc.msgs.length} feedback rows`);
  }

  console.log(`\n✅ Seeded: ${totalChats} chats, ${totalMsgs} messages, ${totalFb} feedback rows, ${totalDom} domains`);

  // API verification
  console.log("\n🔍 Verifying via Next.js API…");
  try {
    const res = await fetch(`http://localhost:3000/api/analytics?user_id=${USER_ID}`);
    if (!res.ok) { console.warn(`   API returned ${res.status} — is 'npm run dev' running?`); return; }
    const data = await res.json();
    const s = data.summary || {}, st = data.stats || {};
    console.log(`   total_feedback:        ${s.total_feedback}`);
    console.log(`   average_rating:        ${s.average_rating}`);
    console.log(`   ratings:               ${JSON.stringify(st.ratings)}`);
    console.log(`   correctness:           ${JSON.stringify(st.correctness)}`);
    console.log(`   length_distribution:   ${JSON.stringify(st.length_distribution)}`);
    console.log(`   topics count:          ${data.topics?.length}`);
    console.log(`   sessions total:        ${data.sessions?.kpis?.total_sessions}`);
    const sess = data.sessions?.sessions || [];
    const withPhases = sess.filter(s => s.phases?.some(p => p.assistant_responses > 0));
    console.log(`   sessions with phases:  ${withPhases.length}/${sess.length}`);
    const g = data.graphs?.topic_distribution;
    if (g) console.log(`   topic_distribution:    ${g.filter(t=>t.count>0).map(t=>`${t.topic}=${t.count}`).join(", ")}`);
    console.log("\n✅ Verification complete.");
  } catch(e) { console.warn(`   Skipped: ${e.message}`); }
}

seed().catch(err => { console.error("\n❌ Seed failed:", err.message); process.exit(1); });
