import pandas as pd
import numpy as np
import requests
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans

# Load credentials
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

def get_supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }

def fetch_feedback_data():
    """Fetch all feedback and associated message content for analysis."""
    if not SUPABASE_URL or not SUPABASE_KEY or SUPABASE_URL == "None":
        print("Supabase credentials missing. Returning mock data for demonstration.")
        now = datetime.now()
        mock_data = []
        topics_and_comments = [
            ("Machine Learning", "The explanation of transformers was very clear and mathematically sound.", 5, "correct", "perfect"),
            ("Coding Help", "Helped me refactor my React components efficiently.", 5, "correct", "perfect"),
            ("EMail writing", "The tone was a bit too formal, but the structure was good.", 4, "partial", "long"),
            ("fix the bug", "Identified the race condition in my Python script immediately. Life saver!", 5, "correct", "short"),
            ("Tip for day", "Nice productivity tip, but I already knew most of it.", 3, "partial", "medium"),
            ("Emotional challenges", "Very empathetic response, helped me calm down during a stressful moment.", 5, "correct", "medium"),
            ("Exam help", "The summary of organic chemistry reactions was exactly what I needed for my test.", 5, "correct", "long"),
            ("Machine Learning", "The code for the neural network had a minor syntax error in the loss function.", 2, "incorrect", "medium"),
            ("Coding Help", "Found a better way to implement the API calls.", 4, "correct", "perfect"),
            ("fix the bug", "It suggested a fix that didn't work for my specific environment.", 2, "incorrect", "short"),
            ("EMail writing", "The draft for the outreach email was persuasive and well-structured.", 5, "correct", "perfect"),
            ("Exam help", "Helped me understand the difference between mitosis and meiosis clearly.", 4, "correct", "medium"),
        ]
        
        for i, (topic, comment, rating, correctness, length) in enumerate(topics_and_comments):
            # Stagger dates over the last 3 days to ensure multi-day trends
            date = now - timedelta(days=i % 4, hours=i * 3, minutes=i * 10)
            mock_data.append({
                "created_at": date.isoformat(),
                "rating": rating,
                "correctness": correctness,
                "length_type": length,
                "comment": comment,
                "category": topic
            })
        return mock_data

    # Fetch feedback
    feedback_url = f"{SUPABASE_URL}/rest/v1/feedback?select=*,chats(title)"
    try:
        response = requests.get(feedback_url, headers=get_supabase_headers(), timeout=5)
        if response.status_code != 200:
            print(f"Error fetching feedback: {response.text}")
            return None
        return response.json()
    except Exception as e:
        print(f"Connection error: {e}")
        return None

def process_analytics():
    data = fetch_feedback_data()
    if not data or len(data) == 0:
        return {
            "summary": {
                "total_feedback": 0,
                "average_rating": 0,
                "last_updated": datetime.now().isoformat()
            },
            "stats": {
                "ratings": {},
                "correctness": {},
                "length_distribution": {}
            },
            "trends": [],
            "recent_feedback": [],
            "topics": [],
            "raw_data_count": 0
        }

    df = pd.DataFrame(data)
    df['created_at'] = pd.to_datetime(df['created_at'])

    # 1. Rating Distribution
    rating_counts = df['rating'].value_counts().sort_index().to_dict()
    # Convert keys to strings for JSON
    rating_counts = {str(k): int(v) for k, v in rating_counts.items()}
    avg_rating = df['rating'].mean()

    # 2. Correctness Metrics
    correctness_counts = df['correctness'].value_counts().to_dict()
    total = len(df)
    correctness_pct = {str(k): round((v / total) * 100, 1) for k, v in correctness_counts.items()}

    # 3. Length Type Analysis
    length_counts = df['length_type'].value_counts().to_dict()
    length_counts = {str(k): int(v) for k, v in length_counts.items()}

    # 4. Trends (by Day)
    df['day'] = df['created_at'].dt.strftime('%a')
    # Order days correctly
    day_order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    
    trends = []
    for day in day_order:
        day_df = df[df['day'] == day]
        if len(day_df) > 0:
            total_day = len(day_df)
            correct_day = len(day_df[day_df['correctness'] == 'correct'])
            partial_day = len(day_df[day_df['correctness'] == 'partial'])
            accuracy = round(((correct_day + partial_day) / total_day) * 100, 1)
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
                "accuracy": 0
            })

    # 5. Recent Feedback
    recent_feedback = []
    # Sort by created_at descending
    df_sorted = df.sort_values('created_at', ascending=False).head(10)
    for _, row in df_sorted.iterrows():
        recent_feedback.append({
            "time": row['created_at'].strftime('%Y-%m-%d %H:%M'),
            "topic": row.get('category', 'General'),
            "preview": (row['comment'][:50] + '...') if row['comment'] and len(row['comment']) > 50 else (row['comment'] or 'No comment'),
            "feedback": 'up' if row['rating'] >= 4 else 'down' if row['rating'] <= 2 else 'none',
            "status": 'Helpful' if row['correctness'] == 'correct' else 'Not Helpful' if row['correctness'] == 'incorrect' else 'Partially Helpful' if row['correctness'] == 'partial' else 'No Feedback',
            "rating": int(row['rating'])
        })

    # 6. Simple Topic Classification (using scikit-learn)
    comments = df[df['comment'].notna()]['comment'].tolist()
    topics = []
    if len(comments) >= 3:
        try:
            vectorizer = TfidfVectorizer(stop_words='english')
            X = vectorizer.fit_transform(comments)
            
            num_clusters = min(3, len(comments))
            kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init='auto')
            kmeans.fit(X)
            
            order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]
            terms = vectorizer.get_feature_names_out()
            
            for i in range(num_clusters):
                top_terms = [terms[ind] for ind in order_centroids[i, :3]]
                topics.append({
                    "cluster": i,
                    "keywords": top_terms,
                    "count": int(np.sum(kmeans.labels_ == i))
                })
        except Exception as e:
            print(f"Clustering error: {e}")

    # Prepare JSON structure for Frontend
    analytics_output = {
        "summary": {
            "total_feedback": total,
            "average_rating": round(float(avg_rating), 2),
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

    return analytics_output

if __name__ == "__main__":
    # Test execution
    print(json.dumps(process_analytics(), indent=2))
