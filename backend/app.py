"""
EmailGuard - Main Flask Application
Registers REST API blueprints, CORS headers, health status, and model metadata.
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from config import HOST, PORT, DEBUG, MAX_CONTENT_LENGTH, METADATA_PATH, MODEL_PATH, VECTORIZER_PATH
from database.db import init_db
from ml.model_loader import get_ml_pipeline
from routes.prediction import prediction_bp
from routes.dashboard import dashboard_bp
from routes.history import history_bp

def create_app() -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
    
    # Enable CORS for all routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize database
    init_db(seed_sample_history=True)

    # Preload ML pipeline
    model, vectorizer, metadata = get_ml_pipeline()

    # Register blueprints
    app.register_blueprint(prediction_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(history_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        """Checks backend health and ML model availability."""
        m, v, meta = get_ml_pipeline()
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "model_loaded": m is not None and v is not None,
            "database_ready": True,
            "version": "1.0.0",
            "model_name": meta.get("model_name", "Linear Support Vector Machine") if meta else "None"
        }), 200

    @app.route("/api/model-info", methods=["GET"])
    def model_info():
        """Returns model architecture, genuine evaluation metrics, and dataset specs."""
        if METADATA_PATH.exists():
            try:
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    metadata_content = json.load(f)
                return jsonify({
                    "success": True,
                    "metadata": metadata_content
                }), 200
            except Exception as e:
                return jsonify({"success": False, "error": f"Failed reading metadata: {str(e)}"}), 500
        else:
            return jsonify({
                "success": False,
                "error": "Model metadata not found. Please train model."
            }), 404

    @app.route("/api/sample-emails", methods=["GET"])
    def get_sample_emails():
        """Provides realistic preset emails for instant testing."""
        samples = [
            {
                "id": "sample-phishing-1",
                "category": "Spam (Phishing)",
                "label": "Spam",
                "subject": "URGENT: Your Wells Fargo Account Has Been Suspended",
                "body": "Dear customer, we detected unusual login activity from an unauthorized IP address. To restore full access and prevent permanent suspension, please verify your credentials immediately at http://secure-wellsfargo-verify.cc/login within 24 hours. Failure to respond will result in complete account lock."
            },
            {
                "id": "sample-lottery-2",
                "category": "Spam (Lottery Scam)",
                "label": "Spam",
                "subject": "CONGRATULATIONS! You Won $1,500,000 In The Global Mega Draw",
                "body": "Official notification! Your email was selected as the lucky winner of $1,500,000.00 USD cash prize! Text CLAIM to 88202 with your full name, banking information, and passport number to process your wire transfer immediately. Act now, prize expires in 48 hours!"
            },
            {
                "id": "sample-promotional-3",
                "category": "Spam (Unsolicited Marketing)",
                "label": "Spam",
                "subject": "Exclusive Flash Sale: 90% Off Luxury Rolex & Cartier Watches",
                "body": "Final clearance notice! Get 90% discount on 100% genuine replica luxury watches, jewelry and designer bags. Free worldwide overnight shipping on all orders. Click here to claim your coupon code before midnight!"
            },
            {
                "id": "sample-legit-work-4",
                "category": "Legitimate (Work Meeting)",
                "label": "Not Spam",
                "subject": "Updated Architecture Review & Sprint 14 Backlog Notes",
                "body": "Hi team, thanks everyone for joining today's sync. I have uploaded the updated data pipeline architecture diagram to Google Drive. Please review the ticket assignments and feel free to comment before tomorrow morning's standup."
            },
            {
                "id": "sample-legit-receipt-5",
                "category": "Legitimate (Service Invoice)",
                "label": "Not Spam",
                "subject": "Your Monthly Cloud Hosting Receipt - Invoice #84910",
                "body": "Hello, thank you for your payment of $49.00 for your monthly subscription. Attached is PDF invoice #84910 for your accounting records. If you have any billing questions, reach out to support@cloudplatform.io."
            },
            {
                "id": "sample-legit-personal-6",
                "category": "Legitimate (Appointment)",
                "label": "Not Spam",
                "subject": "Appointment Confirmation: Dental Cleaning with Dr. Evans",
                "body": "This is a reminder for your upcoming routine dental examination and teeth cleaning scheduled for Friday at 2:30 PM. Please arrive 10 minutes early. Reply 'C' to confirm or call our front desk if you need to reschedule."
            }
        ]
        return jsonify({"success": True, "samples": samples}), 200

    @app.errorhandler(413)
    def file_too_large(e):
        return jsonify({"success": False, "error": "Uploaded file exceeds maximum limit of 16MB."}), 413

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "error": "Endpoint not found."}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"success": False, "error": "Internal server error occurred."}), 500

    return app

app = create_app()

if __name__ == "__main__":
    print(f"[*] Starting EmailGuard Flask Backend on http://{HOST}:{PORT}")
    app.run(host=HOST, port=PORT, debug=DEBUG)
