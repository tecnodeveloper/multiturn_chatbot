from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from groq import Groq
import time
import os
import requests
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("NEXT_PUBLIC_GROQ_API_KEY") or ""
MODEL = "llama-3.3-70b-versatile"
FAST_MODEL = "llama-3.1-8b-instant"

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

PROJECT_DOMAINS = [
    "MachineLearning",
    "DeepLearning",
    "HealthcareAI",
    "PowerSystems",
    "E-commerceAI",
    "Other"
]

client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)

def supabase_headers():
    return {
        "apikey": SUPABASE_KEY or "",
        "Authorization": f"Bearer {SUPABASE_KEY or ''}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def classify_topic(user_message):
    if not user_message or len(user_message.strip()) < 5 or not client:
        return "Other"
    try:
        prompt = (
            f"Classify the following user message into EXACTLY ONE of these categories:\n"
            f"1. MachineLearning\n2. DeepLearning\n3. HealthcareAI\n4. PowerSystems\n5. E-commerceAI\n6. Other\n\n"
            f"Rules:\n- If the message is casual, short, gibberish, or does not clearly belong to one of the 5 AI topics, respond with 'Other'.\n"
            f"- Return ONLY the exact category name from the list above, nothing else.\n\n"
            f"User Message: \"{user_message}\""
        )
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=FAST_MODEL,
            temperature=0.0,
            max_tokens=30
        )
        res = completion.choices[0].message.content.strip().replace(" ", "")
        for domain in PROJECT_DOMAINS:
            if domain.lower() in res.lower():
                return domain
        return "Other"
    except Exception:
        return "Other"

def get_session_messages(chat_id):
    if not SUPABASE_URL or not SUPABASE_KEY:
        return []
    url = f"{SUPABASE_URL}/rest/v1/messages?chat_id=eq.{chat_id}&order=created_at.asc"
    response = requests.get(url, headers=supabase_headers())
    if response.status_code == 200:
        return [{"role": m["role"], "content": m["content"]} for m in response.json()]
    return []

def save_message(chat_id, user_id, role, content, response_time=None, topic_label=None):
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

@app.route('/api/py/chat', methods=['POST'])
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json or {}
    user_message = data.get('message', '')
    session_id = data.get('session_id', '')
    user_id = data.get('user_id', '')
    requested_model = data.get('model', MODEL)

    if not user_message or not session_id or not user_id:
        return jsonify({"error": "Missing message, session_id (chat_id), or user_id"}), 400

    global client
    if not client:
        groq_key = os.getenv("GROQ_API_KEY") or os.getenv("NEXT_PUBLIC_GROQ_API_KEY")
        if groq_key:
            client = Groq(api_key=groq_key)
        else:
            return jsonify({"error": "Groq API key not found."}), 500

    start_time = time.time()
    topic_label = classify_topic(user_message)
    save_message(session_id, user_id, 'user', user_message, topic_label=topic_label)
    messages = get_session_messages(session_id)

    def generate():
        try:
            completion = client.chat.completions.create(
                model=requested_model,
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
                top_p=1,
                stream=True
            )
            full_response = ""
            for chunk in completion:
                content = chunk.choices[0].delta.content or ""
                if content:
                    full_response += content
                    yield content

            end_time = time.time()
            response_time_seconds = round(end_time - start_time, 3)
            save_message(session_id, user_id, 'assistant', full_response, response_time=response_time_seconds, topic_label=topic_label)
        except Exception as e:
            yield f"Error: {str(e)}"

    return Response(stream_with_context(generate()), mimetype='text/plain')

@app.route('/api/py/analytics', methods=['GET'])
@app.route('/api/analytics', methods=['GET'])
def analytics():
    if not SUPABASE_URL or not SUPABASE_KEY:
        return jsonify({"error": "Supabase credentials missing"}), 500
    try:
        feedback_res = requests.get(f"{SUPABASE_URL}/rest/v1/feedback?select=*", headers=supabase_headers())
        messages_res = requests.get(f"{SUPABASE_URL}/rest/v1/messages?select=*", headers=supabase_headers())
        domains_res = requests.get(f"{SUPABASE_URL}/rest/v1/domains?select=*", headers=supabase_headers())
        
        feedback_data = feedback_res.json() if feedback_res.status_code == 200 else []
        messages_data = messages_res.json() if messages_res.status_code == 200 else []
        domains_data = domains_res.json() if domains_res.status_code == 200 else []
        
        return jsonify({
            "status": "success",
            "feedback_count": len(feedback_data),
            "messages_count": len(messages_data),
            "domains_count": len(domains_data),
            "feedback": feedback_data,
            "domains": domains_data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Vercel entrypoint
handler = app
