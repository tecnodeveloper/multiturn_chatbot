"""
Multi-turn LLaMA 3 Chatbot using Groq API and Supabase Persistence
FR10: Response Time Tracking & FR11: Real-time Topic Classification
"""
from flask import Flask, render_template, request, jsonify, session, Response, stream_with_context
from flask_cors import CORS
from groq import Groq
import json
from datetime import datetime
import time
import os
import requests
from dotenv import load_dotenv

# Load credentials from .env file
load_dotenv()

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

# Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("NEXT_PUBLIC_GROQ_API_KEY") or ""
MODEL = "llama-3.3-70b-versatile"
FAST_MODEL = "llama-3.1-8b-instant"

# Supabase Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# Primary Project Domains according to PDF specifications plus 'Other' for general/test messages
PROJECT_DOMAINS = [
    "Machine Learning",
    "Deep Learning",
    "Healthcare AI",
    "Power Systems",
    "E-commerce AI",
    "Other"
]

# Initialize Groq client
client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)

# Supabase Helper functions
def supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

def classify_topic(user_message):
    """FR11: Real-time Topic Classification using lightweight Groq LLM or keyword fallback."""
    if not user_message or len(user_message.strip()) < 5:
        return "Other"

    if not client:
        return "Other"

    try:
        prompt = (
            f"Classify the following user message into EXACTLY ONE of these categories:\n"
            f"1. Machine Learning\n"
            f"2. Deep Learning\n"
            f"3. Healthcare AI\n"
            f"4. Power Systems\n"
            f"5. E-commerce AI\n"
            f"6. Other\n\n"
            f"Rules:\n"
            f"- If the message is casual, short, gibberish (e.g. 'afas', 'test', 'hi'), or does not clearly belong to one of the 5 AI topics, respond with 'Other'.\n"
            f"- Return ONLY the category name from the list above, nothing else.\n\n"
            f"User Message: \"{user_message}\""
        )
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=FAST_MODEL,
            temperature=0.0,
            max_tokens=30
        )
        res = completion.choices[0].message.content.strip()
        for domain in PROJECT_DOMAINS:
            if domain.lower() in res.lower():
                return domain
        return "Other"
    except Exception as e:
        print(f"Topic classification warning: {e}")
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
            # If topic label provided and we have created message, optionally log domain
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
    return "Multi-turn LLaMA 3 Chatbot Backend (Groq & Analytics Enabled)"

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id', '') # In Supabase schema, this is chat_id
    user_id = data.get('user_id', '')
    requested_model = data.get('model', MODEL)
    
    if not user_message or not session_id or not user_id:
        return jsonify({"error": "Missing message, session_id (chat_id), or user_id"}), 400

    if not client:
        return jsonify({"error": "Groq API key not found. Please set GROQ_API_KEY environment variable."}), 500
    
    # FR10: Track exact dispatch timestamp
    start_time = time.time()
    
    # FR11: Perform real-time topic classification
    topic_label = classify_topic(user_message)

    # Save user message
    save_message(session_id, user_id, 'user', user_message, topic_label=topic_label)
    
    # Get conversation history
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
            
            # FR10: Calculate explicit response duration delta
            end_time = time.time()
            response_time_seconds = round(end_time - start_time, 3)

            # Save full response to Supabase after streaming finishes
            save_message(session_id, user_id, 'assistant', full_response, response_time=response_time_seconds, topic_label=topic_label)
            
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
            yield f"Error: {str(e)}"

    return Response(stream_with_context(generate()), mimetype='text/plain')

if __name__ == '__main__':
    app.run(debug=True, port=5000)


