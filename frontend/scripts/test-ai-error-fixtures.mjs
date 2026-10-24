import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classifyAIError, mapHttpStatusToErrorKind, AI_ERROR_TAXONOMY } from "../lib/ai-errors.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturesPath = path.resolve(__dirname, "../../shared/ai-error-fixtures.json");
assert(fs.existsSync(fixturesPath), `Fixtures file missing at ${fixturesPath}`);

const fixtures = JSON.parse(fs.readFileSync(fixturesPath, "utf-8"));

console.log(`Running TS cross-stack AI error taxonomy tests (${fixtures.length} cases)...`);

for (const item of fixtures) {
  let errorObj;
  if (item.status) {
    errorObj = { status: item.status, message: item.error_message };
  } else {
    errorObj = new Error(item.error_message);
  }

  const result = classifyAIError(errorObj);

  assert.strictEqual(
    result.kind,
    item.expected_kind,
    `Scenario "${item.scenario}" kind mismatch: expected ${item.expected_kind}, got ${result.kind}`
  );
  assert.strictEqual(
    result.code,
    item.expected_code,
    `Scenario "${item.scenario}" HTTP code mismatch: expected ${item.expected_code}, got ${result.code}`
  );
  assert.strictEqual(
    result.retryable,
    item.expected_retryable,
    `Scenario "${item.scenario}" retryable mismatch: expected ${item.expected_retryable}, got ${result.retryable}`
  );
}

console.log("All TS AI error taxonomy fixture tests PASSED!");
