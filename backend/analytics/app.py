from flask import Flask, jsonify
from flask_cors import CORS
from scripts.feedback_processor import process_analytics
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    try:
        data = process_analytics()
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Analytics service runs on port 5001 to avoid conflict with main backend
    app.run(debug=True, port=5001)
