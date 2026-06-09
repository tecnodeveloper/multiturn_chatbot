"""
Multi-turn LLaMA 3 Chatbot using Groq API and Supabase Persistence
"""
from flask import Flask, render_template, request, jsonify, session, Response, stream_with_context
from flask_cors import CORS
from groq import Groq
import json
from datetime import datetime
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

# Supabase Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

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

def get_session_messages(chat_id):
    url = f"{SUPABASE_URL}/rest/v1/messages?chat_id=eq.{chat_id}&order=created_at.asc"
    response = requests.get(url, headers=supabase_headers())
    if response.status_code == 200:
        messages = [{"role": m["role"], "content": m["content"]} for m in response.json()]
        return messages
    return []

def save_message(chat_id, user_id, role, content):
    url = f"{SUPABASE_URL}/rest/v1/messages"
    data = {
        "chat_id": chat_id,
        "user_id": user_id,
        "role": role,
        "content": content
    }
    requests.post(url, headers=supabase_headers(), json=data)

def update_session_title(chat_id, title):
    url = f"{SUPABASE_URL}/rest/v1/chats?id=eq.{chat_id}"
    data = {
        "title": title,
        "updated_at": datetime.now().isoformat()
    }
    requests.patch(url, headers=supabase_headers(), json=data)

# Routes
@app.route('/')
def index():
    return "Multi-turn LLaMA 3 Chatbot Backend"

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
    
    # Save user message
    save_message(session_id, user_id, 'user', user_message)
    
    # Get conversation history
    messages = get_session_messages(session_id)
    
    def generate():
        try:
            completion = client.chat.completions.create(
                model=requested_model,
                messages=messages,
                temperature=1,
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
            
            # Save the full response to Supabase after streaming finishes
            save_message(session_id, user_id, 'assistant', full_response)
            
            # Update chat title if needed
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

