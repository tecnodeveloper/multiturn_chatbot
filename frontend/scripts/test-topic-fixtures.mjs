import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classifyTopic, TOPIC_CODES } from "../lib/classify-topic.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturesPath = path.resolve(__dirname, "../../shared/topic-fixtures.json");
assert(fs.existsSync(fixturesPath), `Fixtures file missing at ${fixturesPath}`);

const fixtures = JSON.parse(fs.readFileSync(fixturesPath, "utf-8"));

console.log(`Running TS cross-stack topic fixtures tests (${fixtures.length} cases)...`);

for (const item of fixtures) {
  const actual = classifyTopic(item.input);
  assert.strictEqual(
    actual,
    item.expected_code,
    `Mismatch for input "${item.input}" (${item.description}): expected ${item.expected_code}, got ${actual}`
  );
}

console.log("All TS topic fixture tests PASSED!");
