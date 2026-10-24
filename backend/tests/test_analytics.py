"""
Backend Unit and Integration Tests for Phase 3 Analytics
Multi-Turn AI Chatbot Analytics (FR14-FR22)
"""
import unittest
import os
import sys
import json

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app, classify_topic
from analytics.scripts.feedback_processor import resolve_topic, process_analytics, VALID_DOMAINS


class TestTopicClassification(unittest.TestCase):
    """Test FR11/FR15 topic classification and normalization."""

    def test_empty_or_short_message(self):
        self.assertEqual(classify_topic(""), "Other")
        self.assertEqual(classify_topic("hi"), "Other")
        self.assertEqual(classify_topic("   "), "Other")

    def test_keyword_heuristics(self):
        self.assertEqual(classify_topic("what is deep learning and cnn architectures"), "DeepLearning")
        self.assertEqual(classify_topic("how does healthcare hospital patient data work"), "HealthcareAI")
        self.assertEqual(classify_topic("explain electric power grid and voltage solar"), "PowerSystems")
        self.assertEqual(classify_topic("recommend products in e-commerce cart"), "E-commerceAI")
        self.assertEqual(classify_topic("supervised machine learning linear regression"), "MachineLearning")

    def test_topic_normalization(self):
        self.assertEqual(resolve_topic("", "MachineLearning"), "MachineLearning")
        self.assertEqual(resolve_topic("", "Deep Learning"), "DeepLearning")
        self.assertEqual(resolve_topic("", "HealthcareAI"), "HealthcareAI")
        self.assertEqual(resolve_topic("", "Power Systems"), "PowerSystems")
        self.assertEqual(resolve_topic("", "E-commerceAI"), "E-commerceAI")
        self.assertEqual(resolve_topic("", "UnknownCategory"), "Other")

    def test_shared_topic_fixtures(self):
        """Cross-stack topic fixtures test against shared/topic-fixtures.json."""
        fixtures_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "shared", "topic-fixtures.json")
        )
        self.assertTrue(os.path.exists(fixtures_path), f"Fixtures file not found at {fixtures_path}")
        with open(fixtures_path, "r", encoding="utf-8") as f:
            fixtures = json.load(f)

        for item in fixtures:
            inp = item["input"]
            expected = item["expected_code"]
            desc = item.get("description", "")
            actual = classify_topic(inp)
            self.assertEqual(
                actual,
                expected,
                f"classify_topic('{inp}') [{desc}] expected {expected}, got {actual}"
            )


class TestAnalyticsCalculationsEdgeCases(unittest.TestCase):
    """Test calculation edge cases: empty datasets, zero divisions, extreme ratings."""

    def test_empty_dataset_handling(self):
        """Empty feedback must return zero metrics without division by zero, NaN, or exceptions."""
        res = process_analytics(user_id="non_existent_user_00000000")
        self.assertIn("summary", res)
        self.assertEqual(res["summary"]["total_feedback"], 0)
        self.assertEqual(res["summary"]["average_rating"], 0.0)
        self.assertEqual(res["stats"]["correctness"]["correct"], 0.0)
        self.assertEqual(res["stats"]["correctness"]["partial"], 0.0)
        self.assertEqual(res["stats"]["correctness"]["incorrect"], 0.0)
        self.assertEqual(len(res["topics"]), len(VALID_DOMAINS))

    def test_valid_domains_integrity(self):
        """All 5 required project domains + Other must be present."""
        expected = ["MachineLearning", "DeepLearning", "HealthcareAI", "PowerSystems", "E-commerceAI", "Other"]
        self.assertEqual(VALID_DOMAINS, expected)


class TestBackendAPIEndpoints(unittest.TestCase):
    """Test Flask HTTP endpoints for health and analytics."""

    def setUp(self):
        self.client = app.test_client()

    def test_health_check_endpoint(self):
        """Health check must report status and service breakdown."""
        response = self.client.get("/health")
        self.assertIn(response.status_code, [200, 503])
        data = response.get_json()
        self.assertIn("status", data)
        self.assertIn("services", data)
        self.assertIn("api", data["services"])
        self.assertIn("chart_service", data["services"])
        self.assertIn("data_source", data["services"])

    def test_analytics_missing_user(self):
        """Analytics query with empty user returns clean fallback or empty set."""
        response = self.client.get("/api/analytics")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("summary", data)
        self.assertIn("stats", data)

    def test_analytics_with_valid_user(self):
        """Analytics query with valid user retrieves structured analytics."""
        response = self.client.get("/api/analytics?user_id=0e62b6c3-c794-42cb-a139-bd5bd48cdad8")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("summary", data)
        self.assertIn("stats", data)
        self.assertIn("recent_feedback", data)
        self.assertIn("topics", data)


if __name__ == "__main__":
    unittest.main()
