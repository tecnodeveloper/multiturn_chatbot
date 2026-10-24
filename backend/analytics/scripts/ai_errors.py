"""
Canonical AI Error Taxonomy for Multi-Turn AI Chatbot.
Single source of truth for error classification across the Python backend.
"""
from typing import Tuple, Dict, Any, Optional

AI_ERROR_TAXONOMY: Dict[str, Dict[str, Any]] = {
    "MISCONFIG": {
        "code": 500,
        "retryable": False,
        "default_message": "AI provider configuration error or invalid API key.",
    },
    "MODEL_NOT_FOUND": {
        "code": 404,
        "retryable": False,
        "default_message": "The requested AI model was not found.",
    },
    "BAD_REQUEST": {
        "code": 400,
        "retryable": False,
        "default_message": "Invalid AI request parameters or bad payload.",
    },
    "RATE_LIMIT": {
        "code": 429,
        "retryable": True,
        "default_message": "Rate limit reached. Please wait a moment before trying again.",
    },
    "OVERLOADED": {
        "code": 503,
        "retryable": True,
        "default_message": "The AI service is currently overloaded. Please try again shortly.",
    },
    "TIMEOUT": {
        "code": 504,
        "retryable": True,
        "default_message": "The AI request timed out waiting for a response.",
    },
    "NETWORK": {
        "code": 502,
        "retryable": True,
        "default_message": "Network connection error communicating with AI provider.",
    },
    "UPSTREAM_5XX": {
        "code": 502,
        "retryable": True,
        "default_message": "Upstream AI provider encountered an internal server error.",
    },
    "UNKNOWN": {
        "code": 500,
        "retryable": False,
        "default_message": "An unexpected error occurred while generating the AI response.",
    },
}


def map_http_status_to_kind(status: int) -> str:
    """Maps an upstream HTTP status code directly to a canonical AI error kind."""
    if status in (401, 403):
        return "MISCONFIG"
    if status == 404:
        return "MODEL_NOT_FOUND"
    if status in (400, 422):
        return "BAD_REQUEST"
    if status == 429:
        return "RATE_LIMIT"
    if status in (503, 529):
        return "OVERLOADED"
    if status in (504, 408):
        return "TIMEOUT"
    if 500 <= status < 600:
        return "UPSTREAM_5XX"
    return "UNKNOWN"


def classify_exception(exc: Any, status: Optional[int] = None) -> Tuple[str, int, str, bool]:
    """
    Classifies any exception or failure state into a tuple of:
    (kind, code, message, retryable)
    """
    import requests

    if status is not None:
        kind = map_http_status_to_kind(status)
        spec = AI_ERROR_TAXONOMY[kind]
        msg = (
            "The requested AI model was not found or is unavailable."
            if kind == "MODEL_NOT_FOUND"
            else "The AI model is experiencing high demand. Please try again shortly."
            if kind == "OVERLOADED"
            else "Rate limit reached. Please wait a moment before trying again."
            if kind == "RATE_LIMIT"
            else str(exc) if exc and str(exc).strip()
            else spec["default_message"]
        )
        return kind, spec["code"], msg, spec["retryable"]

    # 1. Timeout detection
    if isinstance(exc, (requests.exceptions.Timeout, TimeoutError)):
        spec = AI_ERROR_TAXONOMY["TIMEOUT"]
        return "TIMEOUT", spec["code"], "AI request timed out after 20 seconds. Please try again.", spec["retryable"]

    # 2. Connection and network errors
    if isinstance(exc, (requests.exceptions.ConnectionError, ConnectionResetError, ConnectionRefusedError)):
        spec = AI_ERROR_TAXONOMY["NETWORK"]
        return "NETWORK", spec["code"], "Network connection error communicating with AI provider.", spec["retryable"]

    if isinstance(exc, requests.exceptions.RequestException):
        spec = AI_ERROR_TAXONOMY["NETWORK"]
        return "NETWORK", spec["code"], f"Network request error: {str(exc)}", spec["retryable"]

    # 3. String-based heuristics for message/object
    exc_str = str(exc or "").lower()
    if "api key" in exc_str or "unauthorized" in exc_str or "forbidden" in exc_str:
        spec = AI_ERROR_TAXONOMY["MISCONFIG"]
        return "MISCONFIG", spec["code"], "AI provider API key is missing or invalid.", spec["retryable"]

    if "timed out" in exc_str or "timeout" in exc_str:
        spec = AI_ERROR_TAXONOMY["TIMEOUT"]
        return "TIMEOUT", spec["code"], "AI request timed out after 20 seconds. Please try again.", spec["retryable"]

    if "connection" in exc_str or "econnrefused" in exc_str or "econnreset" in exc_str:
        spec = AI_ERROR_TAXONOMY["NETWORK"]
        return "NETWORK", spec["code"], "Network connection error communicating with AI provider.", spec["retryable"]

    if "high demand" in exc_str or "overloaded" in exc_str or "503" in exc_str:
        spec = AI_ERROR_TAXONOMY["OVERLOADED"]
        return "OVERLOADED", spec["code"], "The AI service is currently overloaded. Please try again shortly.", spec["retryable"]

    if "rate limit" in exc_str or "429" in exc_str:
        spec = AI_ERROR_TAXONOMY["RATE_LIMIT"]
        return "RATE_LIMIT", spec["code"], "Rate limit reached. Please wait a moment before trying again.", spec["retryable"]

    if "not found" in exc_str and ("model" in exc_str or "endpoint" in exc_str):
        spec = AI_ERROR_TAXONOMY["MODEL_NOT_FOUND"]
        return "MODEL_NOT_FOUND", spec["code"], "The requested AI model was not found.", spec["retryable"]

    spec = AI_ERROR_TAXONOMY["UNKNOWN"]
    msg = str(exc) if exc and str(exc).strip() else spec["default_message"]
    return "UNKNOWN", spec["code"], msg, spec["retryable"]
