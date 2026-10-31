import pandas as pd
import numpy as np
import requests
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load credentials from root, backend, or frontend env locations
base_dir = os.path.dirname(os.path.abspath(__file__))
workspace_root = os.path.abspath(os.path.join(base_dir, "..", "..", ".."))
env_paths = [
    os.path.join(workspace_root, "frontend", ".env.local"),
    os.path.join(workspace_root, "frontend", ".env"),
    os.path.join(workspace_root, "backend", ".env"),
    os.path.join(workspace_root, ".env"),
]
for p in env_paths:
    if os.path.exists(p):
        load_dotenv(p)
load_dotenv()


SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL") or "http://127.0.0.1:54321"
SUPABASE_KEY = (
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    or ""
)

def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def fetch_live_data(user_id=None, session_id=None):
    """Fetch live feedback, messages, and domain classifications from Supabase."""
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Warning: Missing Supabase credentials.")
        return [], [], []

    try:
        user_filter = f"&user_id=eq.{user_id}" if user_id else ""
        session_filter = f"&chat_id=eq.{session_id}" if session_id and session_id != "all" else ""

        # 1. Fetch Feedback
        f_url = f"{SUPABASE_URL}/rest/v1/feedback?select=*{user_filter}{session_filter}"
        f_res = requests.get(f_url, headers=get_supabase_headers(), timeout=5)
        feedback_list = f_res.json() if f_res.status_code == 200 and isinstance(f_res.json(), list) else []

        # 2. Fetch Messages
        m_url = f"{SUPABASE_URL}/rest/v1/messages?select=*{user_filter}{session_filter}&order=created_at.asc"
        m_res = requests.get(m_url, headers=get_supabase_headers(), timeout=5)
        messages_list = m_res.json() if m_res.status_code == 200 and isinstance(m_res.json(), list) else []

        # 3. Fetch Domains — scoped to this user's chats via the messages chat_id set
        d_res = requests.get(f"{SUPABASE_URL}/rest/v1/domains?select=*", headers=get_supabase_headers(), timeout=5)
        all_domains = d_res.json() if d_res.status_code == 200 and isinstance(d_res.json(), list) else []
        user_chat_ids = {m.get('chat_id') for m in messages_list if m.get('chat_id')}
        domains_list = [d for d in all_domains if d.get('chat_id') in user_chat_ids]

        return feedback_list, messages_list, domains_list
    except Exception as e:
        print(f"Database connection error: {e}")
        return [], [], []

try:
    from .topics import TOPIC_CODES, TOPIC_LABELS, classify_topic, resolve_topic
except ImportError:
    from analytics.scripts.topics import TOPIC_CODES, TOPIC_LABELS, classify_topic, resolve_topic

VALID_DOMAINS = TOPIC_CODES


def process_analytics(user_id=None, session_id=None):
    feedback_data, messages_data, domains_data = fetch_live_data(user_id=user_id, session_id=session_id)
    
    # Map domain categories per chat
    chat_domains = {}
    for d in domains_data:
        chat_domains[d.get('chat_id')] = d.get('category')

    # Strict rule: No synthetic feedback generation in production analytics paths. Genuine stored data only.
    if not feedback_data or len(feedback_data) == 0:
        return {
            "summary": {
                "total_feedback": 0,
                "average_rating": 0.0,
                "last_updated": datetime.now().isoformat()
            },
            "stats": {
                "ratings": {"1": 0, "2": 0, "3": 0, "4": 0},
                "correctness": {"correct": 0.0, "partial": 0.0, "incorrect": 0.0},
                "length_distribution": {"short": 0, "to_the_point": 0, "lengthy": 0}
            },
            "trends": [],
            "recent_feedback": [],
            "topics": [
                {"cluster": i, "name": d, "keywords": [d], "count": 0}
                for i, d in enumerate(VALID_DOMAINS)
            ],
            "raw_data_count": len(messages_data)
        }

    df = pd.DataFrame(feedback_data)
    df['created_at'] = pd.to_datetime(df['created_at'])

    # 1. Rating Distribution (1–4 Scale)
    rating_counts = {str(r): 0 for r in range(1, 5)}
    if 'rating' in df.columns:
        for r, count in df['rating'].value_counts().items():
            try:
                r_key = str(int(r))
                if r_key in rating_counts:
                    rating_counts[r_key] = int(count)
            except Exception:
                pass
        avg_rating = df['rating'].mean()
    else:
        avg_rating = 0.0

    # 2. Correctness Metrics
    correctness_pct = {"correct": 0.0, "partial": 0.0, "incorrect": 0.0}
    if 'correctness' in df.columns:
        total = len(df)
        c_counts = df['correctness'].value_counts().to_dict()
        for k, v in c_counts.items():
            if str(k) in correctness_pct:
                correctness_pct[str(k)] = round((v / total) * 100, 1)

    # 3. Length Type Distribution
    length_counts = {"short": 0, "to_the_point": 0, "lengthy": 0}
    if 'length_type' in df.columns:
        l_counts = df['length_type'].value_counts().to_dict()
        for k, v in l_counts.items():
            if str(k) in length_counts:
                length_counts[str(k)] = int(v)

    # 4. Day Trends
    df['day'] = df['created_at'].dt.strftime('%a')
    day_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    trends = []
    for day in day_order:
        day_df = df[df['day'] == day]
        if len(day_df) > 0:
            total_day = len(day_df)
            if 'correctness' in day_df.columns:
                correct_day = int((day_df['correctness'] == 'correct').sum())
                partial_day = int((day_df['correctness'] == 'partial').sum())
            else:
                correct_day = 0
                partial_day = 0
            accuracy = round(((correct_day + partial_day) / total_day) * 100, 1) if total_day > 0 else 0.0
            trends.append({
                "day": day,
                "total": total_day,
                "helpful": correct_day + partial_day,
                "accuracy": accuracy
            })
        else:
            trends.append({
                "day": day,
                "total": 0,
                "helpful": 0,
                "accuracy": 0.0
            })

    # Build lookup maps for messages
    messages_by_id = {m.get('id'): m for m in messages_data if m.get('id')}
    messages_by_chat = {}
    for m in messages_data:
        cid = m.get('chat_id')
        if cid:
            messages_by_chat.setdefault(cid, []).append(m)
    
    # Sort messages in each chat by created_at
    for cid in messages_by_chat:
        messages_by_chat[cid].sort(key=lambda x: x.get('created_at') or '')

    # 5. Recent Feedback Matrix
    recent_feedback = []
    df_sorted = df.sort_values('created_at', ascending=False).head(10)
    for _, row in df_sorted.iterrows():
        chat_id = row.get('chat_id')
        msg_id = row.get('message_id')
        
        assistant_msg = messages_by_id.get(msg_id)
        if not assistant_msg and chat_id and chat_id in messages_by_chat:
            # Fallback: get latest assistant message in chat
            asst_msgs = [m for m in messages_by_chat[chat_id] if m.get('role') == 'assistant']
            if asst_msgs:
                assistant_msg = asst_msgs[-1]
                
        user_msg = None
        if chat_id and chat_id in messages_by_chat:
            user_msgs = [m for m in messages_by_chat[chat_id] if m.get('role') == 'user']
            if user_msgs:
                user_msg = user_msgs[-1]

        model_response = (assistant_msg.get('content') if assistant_msg else None) or row.get('comment') or "No response recorded"
        user_query = (user_msg.get('content') if user_msg else None) or f"User inquiry on {row.get('category') or 'AI Topic'}"
        
        # Build clean snippet preview
        preview_text = model_response.strip().replace('\n', ' ')
        preview = (preview_text[:65] + '...') if len(preview_text) > 65 else preview_text

        raw_status = str(row.get('correctness', 'correct')).lower()
        status_label = 'Correct' if raw_status == 'correct' else 'Partial' if raw_status == 'partial' else 'Incorrect'

        raw_length = str(row.get('length_type', 'to_the_point')).lower()
        length_label = 'To the Point' if raw_length == 'to_the_point' else 'Short' if raw_length == 'short' else 'Lengthy'

        rating_val = int(row.get('rating', 4))
        topic_label = resolve_topic(user_query, row.get('category') or chat_domains.get(chat_id))

        recent_feedback.append({
            "id": str(row.get('id') or msg_id or ''),
            "time": row['created_at'].strftime('%Y-%m-%d %H:%M'),
            "topic": topic_label,
            "preview": preview,
            "user_query": user_query,
            "model_response": model_response,
            "feedback": 'up' if rating_val >= 3 else 'down',
            "status": status_label,
            "rating": rating_val,
            "correctness": status_label,
            "length_type": length_label
        })

    # 6. Feedback Volume by Project Domain / Topic (computed over ALL feedback rows, not just recent 10)
    domain_totals = {
        "MachineLearning": 0,
        "DeepLearning": 0,
        "HealthcareAI": 0,
        "PowerSystems": 0,
        "E-commerceAI": 0,
        "Other": 0
    }

    for _, row in df.iterrows():
        chat_id = row.get('chat_id')
        user_msg_for_topic = None
        if chat_id and chat_id in messages_by_chat:
            user_msgs = [m for m in messages_by_chat[chat_id] if m.get('role') == 'user']
            if user_msgs:
                user_msg_for_topic = user_msgs[-1].get('content')
        user_query_for_topic = user_msg_for_topic or f"User inquiry on {row.get('category') or 'AI Topic'}"
        t_name = resolve_topic(user_query_for_topic, row.get('category') or chat_domains.get(chat_id))
        if t_name in domain_totals:
            domain_totals[t_name] += 1
        else:
            domain_totals["Other"] += 1

    topics = [
        {
            "cluster": i,
            "name": domain,
            "keywords": [domain],
            "count": count
        }
        for i, (domain, count) in enumerate(domain_totals.items())
    ]

    # Return Live Analytics Output
    return {
        "summary": {
            "total_feedback": len(df),
            "average_rating": round(float(avg_rating), 2) if not np.isnan(avg_rating) else 0.0,
            "last_updated": datetime.now().isoformat()
        },
        "stats": {
            "ratings": rating_counts,
            "correctness": correctness_pct,
            "length_distribution": length_counts
        },
        "trends": trends,
        "recent_feedback": recent_feedback,
        "topics": topics,
        "raw_data_count": len(df)
    }

if __name__ == "__main__":
    print(json.dumps(process_analytics(), indent=2))
