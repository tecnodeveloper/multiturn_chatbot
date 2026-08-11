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
        print("Supabase credentials missing. Returning mock data aligned with 1-4 rating scale & PDF domains.")
        now = datetime.now()
        mock_data = []
        topics_and_comments = [
            ("Machine Learning", "The explanation of transformers was mathematically sound.", 4, "correct", "to_the_point"),
            ("Deep Learning", "Convolutional layer output shape formula was very accurate.", 4, "correct", "to_the_point"),
            ("Healthcare AI", "Provided comprehensive advice on medical imaging data processing.", 3, "partial", "lengthy"),
            ("Power Systems", "Grid stabilization algorithm explanation was clear.", 4, "correct", "short"),
            ("E-commerce AI", "Recommendation engine design suggestions were good.", 3, "partial", "to_the_point"),
            ("Healthcare AI", "Very clear breakdown of diagnostic NLP models.", 4, "correct", "to_the_point"),
            ("Machine Learning", "Linear regression assumptions were well detailed.", 3, "correct", "lengthy"),
            ("Deep Learning", "Neural net loss function code had a small typo.", 2, "incorrect", "to_the_point"),
            ("Power Systems", "Voltage drop calculation in distribution network.", 4, "correct", "to_the_point"),
            ("E-commerce AI", "Dynamic pricing strategy response had minor gaps.", 2, "incorrect", "short"),
            ("Machine Learning", "Supervised vs unsupervised classification overview.", 4, "correct", "to_the_point"),
            ("Deep Learning", "GAN architecture summary was accurate.", 3, "correct", "to_the_point"),
        ]
        
        for i, (topic, comment, rating, correctness, length) in enumerate(topics_and_comments):
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
                "ratings": {"1": 0, "2": 0, "3": 0, "4": 0},
                "correctness": {"correct": 0, "partial": 0, "incorrect": 0},
                "length_distribution": {"short": 0, "to_the_point": 0, "lengthy": 0}
            },
            "trends": [],
            "recent_feedback": [],
            "topics": [],
            "raw_data_count": 0
        }

    df = pd.DataFrame(data)
    df['created_at'] = pd.to_datetime(df['created_at'])

    # 1. Rating Distribution (1–4 scale)
    rating_counts = {str(r): 0 for r in range(1, 5)}
    for r, count in df['rating'].value_counts().items():
        rating_counts[str(int(r))] = int(count)
    avg_rating = df['rating'].mean()

    # 2. Correctness Metrics
    correctness_counts = df['correctness'].value_counts().to_dict()
    total = len(df)
    correctness_pct = {str(k): round((v / total) * 100, 1) for k, v in correctness_counts.items()}

    # 3. Length Type Analysis (short, to_the_point, lengthy)
    length_counts = df['length_type'].value_counts().to_dict()
    length_counts = {str(k): int(v) for k, v in length_counts.items()}

    # 4. Trends (by Day)
    df['day'] = df['created_at'].dt.strftime('%a')
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
    df_sorted = df.sort_values('created_at', ascending=False).head(10)
    for _, row in df_sorted.iterrows():
        recent_feedback.append({
            "time": row['created_at'].strftime('%Y-%m-%d %H:%M'),
            "topic": row.get('category', 'General'),
            "preview": (row['comment'][:50] + '...') if row.get('comment') and len(row['comment']) > 50 else (row.get('comment') or 'Mandatory Evaluation'),
            "feedback": 'up' if row['rating'] >= 3 else 'down',
            "status": 'Correct' if row['correctness'] == 'correct' else 'Incorrect' if row['correctness'] == 'incorrect' else 'Partial',
            "rating": int(row['rating'])
        })

    # 6. Topic Clustering
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
