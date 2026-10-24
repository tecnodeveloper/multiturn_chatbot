"""
Canonical Topic Model and Classifier for Multi-Turn AI Chatbot.
FR11 / FR15 / FR22: Single source of truth for topic codes, labels, and classification heuristics.
"""

TOPIC_CODES = [
    "MachineLearning",
    "DeepLearning",
    "HealthcareAI",
    "PowerSystems",
    "E-commerceAI",
    "Other"
]

TOPIC_LABELS = {
    "MachineLearning": "Machine Learning",
    "DeepLearning": "Deep Learning",
    "HealthcareAI": "Healthcare AI",
    "PowerSystems": "Power Systems",
    "E-commerceAI": "E-commerce AI",
    "Other": "Other",
    # Legacy alias support
    "Machine Learning": "Machine Learning",
    "Deep Learning": "Deep Learning",
    "Healthcare AI": "Healthcare AI",
    "Power Systems": "Power Systems",
    "E-commerce AI": "E-commerce AI",
}

# Keyword rules for heuristic classification
# Ordered strategically: DeepLearning before MachineLearning to prevent generic matches
KEYWORD_RULES = [
    (
        "DeepLearning",
        ["deep learning", "deeplearning", "cnn", "rnn", "neural", "transformer", "pytorch"]
    ),
    (
        "HealthcareAI",
        ["health", "medical", "hospital", "patient", "clinical", "healthcareai", "healthcare"]
    ),
    (
        "PowerSystems",
        ["power", "grid", "voltage", "energy", "solar", "battery", "powersystems"]
    ),
    (
        "E-commerceAI",
        ["e-commerce", "ecommerce", "recommend", "cart", "product", "retail", "e-commerceai"]
    ),
    (
        "MachineLearning",
        ["machine learning", "machinelearning", "regression", "classification", "clustering", "svm", "dataset", "model"]
    ),
]


def classify_topic(text: str) -> str:
    """
    Classify user message text into a canonical topic code using deterministic heuristics.
    Threshold: text length >= 6.
    """
    if not text or len(text.strip()) < 6:
        return "Other"

    lower_text = text.lower()
    for topic, keywords in KEYWORD_RULES:
        if any(keyword in lower_text for keyword in keywords):
            return topic

    return "Other"


def resolve_topic(query: str, raw_cat: str = None) -> str:
    """
    Resolves a canonical topic code from either an existing category label or query text fallback.
    """
    if raw_cat:
        cat_clean = raw_cat.replace(" ", "").lower()
        for code in TOPIC_CODES:
            if code.lower() == cat_clean:
                return code

    return classify_topic(query)
