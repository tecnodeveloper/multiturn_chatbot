"""
Multi-turn LLaMA 3 Chatbot using Groq API and Supabase Persistence
FR10: Response Time Tracking & FR11: Real-time Topic Classification
"""
# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify, session, Response, stream_with_context
from flask_cors import CORS
import json
from datetime import datetime
import time
import os
import requests
from dotenv import load_dotenv

# Load credentials from .env.local file in frontend
dotenv_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', '.env.local')
load_dotenv(dotenv_path)

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY") or os.getenv("NEXT_PUBLIC_GEMINI_API_KEY") or ""
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("NEXT_PUBLIC_GROQ_API_KEY") or ""
MODEL = "gemini-3.5-flash"
FAST_MODEL = "gemini-3.5-flash"

# Supabase Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Primary Project Domains according to PDF specifications plus 'Other'
PROJECT_DOMAINS = [
    "MachineLearning",
    "DeepLearning",
    "HealthcareAI",
    "PowerSystems",
    "E-commerceAI",
    "Other"
]

# Initialize Groq client (optional fallback)
client = None
if GROQ_API_KEY:
    try:
        client = Groq(api_key=GROQ_API_KEY)
    except Exception:
        pass

# Supabase Helper functions
def supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def classify_topic(user_message):
    """FR11: Real-time Topic Classification using lightweight Gemini / Groq LLM or keyword fallback."""
    if not user_message or len(user_message.strip()) < 5:
        return "Other"

    # Fast domain keyword heuristics
    uq = user_message.lower()
    if any(k in uq for k in ["deep learning", "deeplearning", "cnn", "rnn", "transformer", "pytorch"]):
        return "DeepLearning"
    if any(k in uq for k in ["health", "medical", "hospital", "patient", "clinical", "healthcare"]):
        return "HealthcareAI"
    if any(k in uq for k in ["power", "grid", "voltage", "energy", "solar", "battery"]):
        return "PowerSystems"
    if any(k in uq for k in ["e-commerce", "ecommerce", "recommend", "cart", "product", "retail"]):
        return "E-commerceAI"
    if any(k in uq for k in ["machine learning", "machinelearning", "regression", "classification", "clustering"]):
        return "MachineLearning"

    prompt = (
        f"Classify the following user message into EXACTLY ONE of these categories:\n"
        f"1. MachineLearning\n"
        f"2. DeepLearning\n"
        f"3. HealthcareAI\n"
        f"4. PowerSystems\n"
        f"5. E-commerceAI\n"
        f"6. Other\n\n"
        f"Rules:\n"
        f"- If the message is casual, short, gibberish, or does not clearly belong to one of the 5 AI topics, respond with 'Other'.\n"
        f"- Return ONLY the exact category name from the list above, nothing else.\n\n"
        f"User Message: \"{user_message}\""
    )

    if GEMINI_API_KEY:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{FAST_MODEL}:generateContent?key={GEMINI_API_KEY}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.0, "maxOutputTokens": 20}
            }
            res = requests.post(url, json=payload, headers={"Content-Type": "application/json", "Authorization": f"Bearer {GEMINI_API_KEY}"}, timeout=5)
            if res.status_code == 200:
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                for domain in PROJECT_DOMAINS:
                    if domain.lower() in text.lower():
                        return domain
        except Exception as e:
            print(f"Gemini topic classification warning: {e}")

    if client:
        try:
            completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.0,
                max_tokens=30
            )
            res = completion.choices[0].message.content.strip().replace(" ", "")
            for domain in PROJECT_DOMAINS:
                if domain.lower() in res.lower():
                    return domain
        except Exception as e:
            print(f"Groq topic classification warning: {e}")

    return "Other"



def get_session_messages(chat_id):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return []
    url = f"{SUPABASE_URL}/rest/v1/messages?chat_id=eq.{chat_id}&order=created_at.asc"
    response = requests.get(url, headers=supabase_headers())
    if response.status_code == 200:
        messages = [{"role": m["role"], "content": m["content"]} for m in response.json()]
        return messages
    return []

def save_message(chat_id, user_id, role, content, response_time=None, topic_label=None, session_phase=None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
    url = f"{SUPABASE_URL}/rest/v1/messages"
    data = {
        "chat_id": chat_id,
        "user_id": user_id,
        "role": role,
        "content": content
    }
    if response_time is not None:
        data["response_time"] = response_time
    if session_phase is not None:
        data["session_phase"] = session_phase
    
    try:
        res = requests.post(url, headers=supabase_headers(), json=data)
        if res.status_code in (200, 201):
            msg_data = res.json()
            if topic_label and isinstance(msg_data, list) and len(msg_data) > 0:
                domain_url = f"{SUPABASE_URL}/rest/v1/domains"
                requests.post(domain_url, headers=supabase_headers(), json={
                    "chat_id": chat_id,
                    "category": topic_label
                })
            return msg_data
    except Exception as e:
        print(f"Error saving message: {e}")
    return None

def update_session_title(chat_id, title):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return
    url = f"{SUPABASE_URL}/rest/v1/chats?id=eq.{chat_id}"
    data = {
        "title": title,
        "updated_at": datetime.now().isoformat()
    }
    requests.patch(url, headers=supabase_headers(), json=data)

# Routes
@app.route('/')
def index():
    return "Multi-turn Chatbot Backend (Gemini & Analytics Enabled)"

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    try:
        from analytics.scripts.feedback_processor import process_analytics
        data = process_analytics()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/templates', methods=['GET'])
def get_templates():
    """Return the 5 project-domain template identifiers.
    Full template data (system prompts, starter prompts, etc.) lives in the
    frontend template-service.ts as the single source of truth."""
    templates = [
        {"id": "system-ml",         "name": "Machine Learning Assistant",  "category": "Machine Learning"},
        {"id": "system-dl",         "name": "Deep Learning Specialist",    "category": "Deep Learning"},
        {"id": "system-healthcare", "name": "Healthcare AI Advisor",       "category": "Healthcare AI"},
        {"id": "system-power",      "name": "Power Systems Engineer",      "category": "Power Systems"},
        {"id": "system-ecommerce",  "name": "E-commerce AI Strategist",    "category": "E-commerce AI"},
    ]
    return jsonify(templates)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id', '') # In Supabase schema, this is chat_id
    user_id = data.get('user_id', '')
    requested_model = data.get('model', MODEL)
    
    if not user_message or not session_id or not user_id:
        return jsonify({"error": "Missing message, session_id (chat_id), or user_id"}), 400

    if not GEMINI_API_KEY and not client:
        return jsonify({"error": "No AI API key found. Please set GEMINI_API_KEY environment variable."}), 500
    
    # FR10: Track exact dispatch timestamp
    start_time = time.time()
    
    # FR11: Perform real-time topic classification
    topic_label = classify_topic(user_message)

    # Get conversation history
    messages = get_session_messages(session_id)
    
    # FR16: Calculate session phase (start: turns 1-2, middle: turns 3-5, end: turns 6+)
    turn_count = (len(messages) // 2) + 1
    session_phase = "start" if turn_count <= 2 else "middle" if turn_count <= 5 else "end"

    # Save user message with session phase
    save_message(session_id, user_id, 'user', user_message, topic_label=topic_label, session_phase=session_phase)
    
    def generate():
        try:
            full_response = ""
            if GEMINI_API_KEY:
                gemini_model = requested_model if requested_model.startswith("gemini") else "gemini-1.5-flash"
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{gemini_model}:streamGenerateContent?key={GEMINI_API_KEY}&alt=sse"
                
                # Convert messages format to Gemini contents
                contents = []
                for m in messages:
                    role = "user" if m.get("role") == "user" else "model"
                    contents.append({"role": role, "parts": [{"text": m.get("content", "")}]})
                if not contents:
                    contents = [{"role": "user", "parts": [{"text": user_message}]}]

                payload = {
                    "contents": contents,
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 2048
                    }
                }
                headers = {"Content-Type": "application/json"}
                
                try:
                    with requests.post(url, json=payload, headers=headers, stream=True, timeout=20) as r:
                        if r.status_code != 200:
                            err_msg = ""
                            try:
                                err_data = r.json()
                                err_msg = err_data.get("error", {}).get("message", r.text)
                            except Exception:
                                err_msg = r.text
                            error_output = f"Error {r.status_code}: Gemini API call failed - {err_msg}"
                            yield error_output
                            save_message(session_id, user_id, 'assistant', error_output, response_time=round(time.time() - start_time, 3), topic_label=topic_label, session_phase=session_phase)
                            return

                        for line in r.iter_lines():
                            if line:
                                decoded = line.decode('utf-8')
                                if decoded.startswith("data: "):
                                    json_str = decoded[6:]
                                    try:
                                        chunk_json = json.loads(json_str)
                                        candidates = chunk_json.get("candidates", [])
                                        if candidates:
                                            parts = candidates[0].get("content", {}).get("parts", [])
                                            for p in parts:
                                                chunk_text = p.get("text", "")
                                                if chunk_text:
                                                    full_response += chunk_text
                                                    yield chunk_text
                                    except Exception:
                                        continue
                except requests.exceptions.Timeout:
                    timeout_msg = "Error 404: Gemini API request timed out after 20 seconds. No response received."
                    yield timeout_msg
                    save_message(session_id, user_id, 'assistant', timeout_msg, response_time=20.0, topic_label=topic_label, session_phase=session_phase)
                    return
                except requests.exceptions.RequestException as re:
                    err_msg = f"Error 404: Gemini API connection error - {str(re)}"
                    yield err_msg
                    save_message(session_id, user_id, 'assistant', err_msg, response_time=round(time.time() - start_time, 3), topic_label=topic_label, session_phase=session_phase)
                    return
            elif client:
                completion = client.chat.completions.create(
                    model=requested_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1024,
                    top_p=1,
                    stream=True
                )
                for chunk in completion:
                    content = chunk.choices[0].delta.content or ""
                    if content:
                        full_response += content
                        yield content

            # FR10: Calculate explicit response duration delta
            end_time = time.time()
            response_time_seconds = round(end_time - start_time, 3)

            # Save full response to Supabase after streaming finishes (FR10 & FR16)
            save_message(session_id, user_id, 'assistant', full_response, response_time=response_time_seconds, topic_label=topic_label, session_phase=session_phase)
            
            # Update chat title if needed
            if SUPABASE_URL and SUPABASE_KEY:
                url = f"{SUPABASE_URL}/rest/v1/chats?id=eq.{session_id}&select=title"
                r = requests.get(url, headers=supabase_headers())
                if r.status_code == 200 and r.json():
                    current_title = r.json()[0].get("title")
                    if current_title == "New Chat" and len(user_message) > 0:
                        title = user_message[:50] + ("..." if len(user_message) > 50 else "")
                        update_session_title(session_id, title)
                
        except Exception as e:
            err_text = f"Error 404: {str(e)}"
            yield err_text
            save_message(session_id, user_id, 'assistant', err_text, response_time=round(time.time() - start_time, 3), topic_label=topic_label, session_phase=session_phase)

    return Response(stream_with_context(generate()), mimetype='text/plain')

if __name__ == '__main__':
    app.run(debug=True, port=5000)


