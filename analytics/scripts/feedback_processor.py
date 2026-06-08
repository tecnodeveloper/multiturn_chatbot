import pandas as pd
import numpy as np
import requests
import os
import json
from datetime import datetime
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
    # Fetch feedback
    feedback_url = f"{SUPABASE_URL}/rest/v1/feedback?select=*,chats(title)"
    response = requests.get(feedback_url, headers=get_supabase_headers())
    if response.status_code != 200:
        print(f"Error fetching feedback: {response.text}")
        return None
    
    return response.json()

def process_analytics():
    data = fetch_feedback_data()
    if not data or len(data) == 0:
        return {
            "summary": {"total_feedback": 0},
            "charts": {},
            "status": "no_data"
        }

    df = pd.DataFrame(data)

    # 1. Rating Distribution
    rating_counts = df['rating'].value_counts().sort_index().to_dict()
    avg_rating = df['rating'].mean()

    # 2. Correctness Metrics
    correctness_counts = df['correctness'].value_counts().to_dict()
    total = len(df)
    correctness_pct = {k: (v / total) * 100 for k, v in correctness_counts.items()}

    # 3. Length Type Analysis
    length_counts = df['length_type'].value_counts().to_dict()

    # 4. Simple Topic Classification (using scikit-learn)
    # Combine comments for clustering if they exist
    comments = df[df['comment'].notna()]['comment'].tolist()
    topics = []
    if len(comments) >= 3: # Need minimum samples for clustering
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(comments)
        
        # Simple KMeans to find 3 main feedback themes
        num_clusters = min(3, len(comments))
        kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init='auto')
        kmeans.fit(X)
        
        # Get top words for each cluster
        order_centroids = kmeans.cluster_centers_.argsort()[:, ::-1]
        terms = vectorizer.get_feature_names_out()
        
        for i in range(num_clusters):
            top_terms = [terms[ind] for ind in order_centroids[i, :3]]
            topics.append({
                "cluster": i,
                "keywords": top_terms,
                "count": int(np.sum(kmeans.labels_ == i))
            })

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
        "topics": topics,
        "raw_data_count": len(df)
    }

    return analytics_output

if __name__ == "__main__":
    # Test execution
    print(json.dumps(process_analytics(), indent=2))
