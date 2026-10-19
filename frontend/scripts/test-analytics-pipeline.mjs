/**
 * Comprehensive Analytics Pipeline End-to-End Test Suite
 * Multi-Turn AI Chatbot Analytics (Phase 3: FR14-FR22)
 * Run with: node scripts/test-analytics-pipeline.mjs
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const TEST_USER_ID = "0e62b6c3-c794-42cb-a139-bd5bd48cdad8";
const KNOWN_CHAT_ID = "a0f189f7-d4cb-439f-a59b-bc89ab2fbf0b";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  RUNNING COMPLETE ANALYTICS END-TO-END AUDIT SUITE");
  console.log("========================================================\n");

  // ----------------------------------------------------
  // Test Suite 1: Backend Health Check Integration
  // ----------------------------------------------------
  console.log("Suite 1: Health Check Integration (/api/health)");
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert(res.status === 200, `Health endpoint returns 200 OK (got ${res.status})`);
    const data = await res.json();
    assert(data.status === "healthy", `Status is "healthy" (got ${data.status})`);
    assert(data.services?.api === true, "Service: api is true");
    assert(data.services?.chart_service === true, "Service: chart_service is true");
    assert(data.services?.data_source === true, "Service: data_source is true");
  } catch (err) {
    assert(false, `Health check request failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Suite 2: Analytics API Security & Authorization
  // ----------------------------------------------------
  console.log("\nSuite 2: Security & Authorization (/api/analytics)");
  try {
    // Missing user_id should return 400 Bad Request
    const resNoUser = await fetch(`${BASE_URL}/api/analytics`);
    assert(resNoUser.status === 400, `Request without user_id returns 400 Bad Request (got ${resNoUser.status})`);
    const noUserData = await resNoUser.json();
    assert(noUserData.error === "Missing user_id", "Error message identifies missing user_id");

    // Valid authenticated user query
    const resAuth = await fetch(`${BASE_URL}/api/analytics?user_id=${TEST_USER_ID}`);
    assert(resAuth.status === 200, `Authenticated request returns 200 OK (got ${resAuth.status})`);
    const analytics = await resAuth.json();
    assert(analytics.summary !== undefined, "Payload contains 'summary'");
    assert(analytics.stats !== undefined, "Payload contains 'stats'");
    assert(analytics.tables !== undefined, "Payload contains 'tables'");
    assert(analytics.graphs !== undefined, "Payload contains 'graphs'");
    assert(analytics.sessions !== undefined, "Payload contains 'sessions'");
    assert(analytics.topics_module !== undefined, "Payload contains 'topics_module'");
  } catch (err) {
    assert(false, `Authorization tests failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Suite 3: Overview Module Metric Integrity
  // ----------------------------------------------------
  console.log("\nSuite 3: Overview Module Metric Integrity");
  try {
    const res = await fetch(`${BASE_URL}/api/analytics?user_id=${TEST_USER_ID}`);
    const data = await res.json();
    const { summary, stats } = data;

    assert(typeof summary.total_feedback === "number", `Total feedback is a number (${summary.total_feedback})`);
    assert(typeof summary.average_rating === "number", `Average rating is a number (${summary.average_rating})`);
    if (summary.total_feedback > 0) {
      assert(summary.average_rating >= 1.0 && summary.average_rating <= 4.0, `Rating is in 1-4 scale (${summary.average_rating})`);
    }

    const correctness = stats.correctness;
    const totalPct = (correctness.correct || 0) + (correctness.partial || 0) + (correctness.incorrect || 0);
    assert(Math.abs(totalPct - 100.0) < 0.5 || summary.total_feedback === 0, `Correctness percentages sum to ~100% (${totalPct}%)`);
  } catch (err) {
    assert(false, `Overview verification failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Suite 4: Tables Module (FR19 - All 6 Tables)
  // ----------------------------------------------------
  console.log("\nSuite 4: Tables Module (FR19 - 6 Analytical Tables)");
  try {
    const res = await fetch(`${BASE_URL}/api/analytics?user_id=${TEST_USER_ID}`);
    const data = await res.json();
    const tables = data.tables;

    // Table 1: Topic vs Accuracy
    assert(Array.isArray(tables.topic_accuracy), "Table 1 (topic_accuracy) is an array");
    assert(tables.topic_accuracy.length === 6, `Table 1 contains 6 domains (got ${tables.topic_accuracy.length})`);

    // Table 2: Reply Correctness
    assert(Array.isArray(tables.reply_correctness), "Table 2 (reply_correctness) is an array");

    // Table 3: Phase-Wise Accuracy (Start -> Middle -> End)
    assert(Array.isArray(tables.phase_accuracy), "Table 3 (phase_accuracy) is an array");
    assert(tables.phase_accuracy.length === 3, "Table 3 contains exactly 3 phases");
    const phaseOrder = tables.phase_accuracy.map((p) => p.phase).join(" -> ");
    assert(phaseOrder === "Start -> Middle -> End", `Phases are ordered Start -> Middle -> End (got ${phaseOrder})`);

    // Table 4: Response Time Summary
    assert(tables.response_time_summary !== undefined, "Table 4 (response_time_summary) is present");
    assert(typeof tables.response_time_summary.min === "number" || tables.response_time_summary.min === null, "Min latency is number or null");
    assert(typeof tables.response_time_summary.max === "number" || tables.response_time_summary.max === null, "Max latency is number or null");
    assert(typeof tables.response_time_summary.avg === "number" || tables.response_time_summary.avg === null, "Avg latency is number or null");

    // Table 5: Rating Distribution
    assert(Array.isArray(tables.rating_distribution), "Table 5 (rating_distribution) is an array");
    assert(tables.rating_distribution.length === 4, "Table 5 covers 4 rating tiers (4, 3, 2, 1)");

    // Table 6: Length Preference
    assert(Array.isArray(tables.length_preference), "Table 6 (length_preference) is an array");
    assert(tables.length_preference.length === 3, "Table 6 covers 3 categories (Short, To the Point, Lengthy)");
  } catch (err) {
    assert(false, `Tables verification failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Suite 5: Graphs Module (FR20 - All 7 Visualizations)
  // ----------------------------------------------------
  console.log("\nSuite 5: Graphs Module (FR20 - 7 Visualizations)");
  try {
    const res = await fetch(`${BASE_URL}/api/analytics?user_id=${TEST_USER_ID}`);
    const data = await res.json();
    const graphs = data.graphs;

    assert(Array.isArray(graphs.topic_distribution), "Graph 1 (topic_distribution) is an array");
    assert(Array.isArray(graphs.accuracy_by_topic), "Graph 2 (accuracy_by_topic) is an array");
    assert(Array.isArray(graphs.phase_accuracy), "Graph 3 (phase_accuracy) is an array");
    assert(Array.isArray(graphs.reply_correctness), "Graph 4 (reply_correctness) is an array");
    assert(Array.isArray(graphs.response_time_trend), "Graph 5 (response_time_trend) is an array");
    assert(Array.isArray(graphs.rating_distribution), "Graph 6 (rating_distribution) is an array");
    assert(Array.isArray(graphs.length_preference), "Graph 7 (length_preference) is an array");
  } catch (err) {
    assert(false, `Graphs verification failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Suite 6: Sessions Module (FR7, FR16, FR21, FR22)
  // ----------------------------------------------------
  console.log("\nSuite 6: Sessions Module & Lifecycle (FR7, FR16, FR21, FR22)");
  try {
    const res = await fetch(`${BASE_URL}/api/analytics?user_id=${TEST_USER_ID}`);
    const data = await res.json();
    const sessions = data.sessions;

    assert(sessions.kpis !== undefined, "Sessions KPIs object is present");
    assert(typeof sessions.kpis.total_sessions === "number", `Total sessions: ${sessions.kpis.total_sessions}`);
    assert(Array.isArray(sessions.sessions), "Sessions list is an array");
    assert(sessions.sessions.length > 0, `User has ${sessions.sessions.length} chat sessions`);

    const sample = sessions.sessions[0];
    assert(sample.id !== undefined, "Session has unique 'id'");
    assert(typeof sample.duration_seconds === "number", `Session duration: ${sample.duration_seconds}s`);
    assert(sample.duration_seconds >= 0, "Session duration is not negative");
    assert(Array.isArray(sample.phases), "Session has phases breakdown");
    assert(Array.isArray(sample.timeline), "Session has chronological timeline");

    // Session Detail / Dynamic route
    const resRoute = await fetch(`${BASE_URL}/analytics/sessions/${sample.id}`);
    assert(resRoute.status === 200, `Direct route /analytics/sessions/[id] returns 200 OK`);
  } catch (err) {
    assert(false, `Sessions verification failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Suite 7: Permanent Analytics Summary Persistence (FR22)
  // ----------------------------------------------------
  console.log("\nSuite 7: Permanent Summary API & Idempotency (FR22)");
  try {
    // GET summary for known chat
    const getRes = await fetch(`${BASE_URL}/api/analytics/summary?chat_id=${KNOWN_CHAT_ID}`);
    assert(getRes.status === 200, `GET /api/analytics/summary returns 200 OK`);
    const summaryData = await getRes.json();
    assert(summaryData.summary?.chat_id === KNOWN_CHAT_ID, `Summary chat_id matches (${summaryData.summary?.chat_id})`);

    // POST summary idempotency test (repeat call must succeed without duplicate key error)
    const postRes1 = await fetch(`${BASE_URL}/api/analytics/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: KNOWN_CHAT_ID, user_id: TEST_USER_ID, allow_partial: true }),
    });
    assert(postRes1.status === 200, `POST /api/analytics/summary returns 200 OK (got ${postRes1.status})`);

    const postRes2 = await fetch(`${BASE_URL}/api/analytics/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: KNOWN_CHAT_ID, user_id: TEST_USER_ID, allow_partial: true }),
    });
    assert(postRes2.status === 200, `Idempotent repeat POST returns 200 OK (no duplicate row error)`);

    // Cross-user authorization check (foreign user trying to finalize chat)
    const foreignRes = await fetch(`${BASE_URL}/api/analytics/summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: KNOWN_CHAT_ID, user_id: "unauthorized_user_9999" }),
    });
    assert(foreignRes.status === 403, `Unauthorized user cannot finalize foreign chat (got HTTP ${foreignRes.status})`);
  } catch (err) {
    assert(false, `Summary API tests failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Suite 8: Topics Module (FR15, FR17, FR20, FR21)
  // ----------------------------------------------------
  console.log("\nSuite 8: Topics Module (FR15, FR17, FR20, FR21)");
  try {
    const res = await fetch(`${BASE_URL}/api/analytics?user_id=${TEST_USER_ID}`);
    const data = await res.json();
    const topicsModule = data.topics_module;

    assert(topicsModule !== undefined, "topics_module payload is present");
    assert(topicsModule.kpis !== undefined, "topics_module.kpis is present");
    assert(Array.isArray(topicsModule.topics), "topics_module.topics is an array");
    assert(topicsModule.topics.length === 6, `Topics list contains all 6 required domains (got ${topicsModule.topics.length})`);

    // Verify 5 required domains + Other
    const requiredDomains = ["Machine Learning", "Deep Learning", "Healthcare AI", "Power Systems", "E-commerce AI", "Other"];
    const foundDomains = topicsModule.topics.map((t) => t.topic);
    for (const dom of requiredDomains) {
      assert(foundDomains.includes(dom), `Supported domain present: ${dom}`);
    }

    // Verify strict accuracy excludes partial
    for (const t of topicsModule.topics) {
      if (t.evaluated_responses > 0) {
        const expectedStrict = Number(((t.correct / t.evaluated_responses) * 100).toFixed(1));
        assert(t.strict_accuracy === expectedStrict, `${t.topic}: strict accuracy strictly equals Correct / Evaluated (${t.strict_accuracy}% == ${expectedStrict}%)`);
      } else {
        assert(t.strict_accuracy === null, `${t.topic}: unevaluated topic has null accuracy (not misleading 0%)`);
      }
    }
  } catch (err) {
    assert(false, `Topics module verification failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Suite 9: Date Filtering (Week, Month, Year, All)
  // ----------------------------------------------------
  console.log("\nSuite 9: Date Range Filtering (time_range parameter)");
  try {
    const resAll = await fetch(`${BASE_URL}/api/analytics?user_id=${TEST_USER_ID}&time_range=all`);
    const dataAll = await resAll.json();
    const resWeek = await fetch(`${BASE_URL}/api/analytics?user_id=${TEST_USER_ID}&time_range=week`);
    const dataWeek = await resWeek.json();

    assert(resAll.status === 200, "Query with time_range=all returns 200 OK");
    assert(resWeek.status === 200, "Query with time_range=week returns 200 OK");
    assert(dataWeek.summary.total_feedback <= dataAll.summary.total_feedback, "Weekly feedback count is subset of all-time feedback");
  } catch (err) {
    assert(false, `Date filtering tests failed: ${err.message}`);
  }

  // ----------------------------------------------------
  // Test Summary
  // ----------------------------------------------------
  console.log("\n========================================================");
  console.log(`  AUDIT RESULTS: ${passed} passed, ${failed} failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
