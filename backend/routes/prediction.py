"""
EmailGuard - Prediction Routes
Handles single email prediction and bulk CSV file classification.
"""

import csv
import io
import os
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

import sys
from pathlib import Path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from ml.predict import predict_single, predict_batch
from database.db import insert_prediction
from config import ALLOWED_EXTENSIONS, UPLOAD_DIR

prediction_bp = Blueprint("prediction", __name__)

def is_allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@prediction_bp.route("/api/predict", methods=["POST"])
def predict_email():
    """Classifies a single email subject and body."""
    data = request.get_json(silent=True) or {}
    subject = data.get("subject", "")
    body = data.get("body", "") or data.get("text", "") or data.get("content", "")

    if not subject.strip() and not body.strip():
        return jsonify({
            "success": False,
            "error": "Please provide an email subject or email body to analyze."
        }), 400

    result = predict_single(subject=subject, body=body)

    if not result.get("success"):
        return jsonify(result), 500

    # Store in SQLite database
    preview_text = body[:180] if body else subject[:180]
    record_id = insert_prediction(
        subject=subject,
        preview=preview_text,
        classification=result["classification"],
        confidence=result["confidence"],
        risk_level=result["risk_level"],
        suspicious_keywords=result.get("suspicious_keywords", [])
    )
    result["record_id"] = record_id

    return jsonify(result), 200

@prediction_bp.route("/api/bulk-predict", methods=["POST"])
def bulk_predict():
    """
    Classifies a batch of emails uploaded via CSV file or JSON array.
    """
    records = []

    # Handle file upload
    if "file" in request.files:
        uploaded_file = request.files["file"]
        if uploaded_file.filename == "":
            return jsonify({"success": False, "error": "No selected file."}), 400

        if not is_allowed_file(uploaded_file.filename):
            return jsonify({
                "success": False,
                "error": f"Invalid file format. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            }), 400

        try:
            content = uploaded_file.read().decode("utf-8", errors="ignore")
            csv_reader = csv.DictReader(io.StringIO(content))
            
            # Map column names flexibly
            headers = [h.strip() for h in (csv_reader.fieldnames or [])]
            text_field = None
            subject_field = None

            for h in headers:
                hl = h.lower()
                if hl in ("text", "body", "message", "content", "email", "email_text", "clean_text"):
                    text_field = h
                elif hl in ("subject", "title", "email_subject", "header"):
                    subject_field = h

            if not text_field and not subject_field:
                # If no standard headers, check if there's any non-empty column
                if headers:
                    text_field = headers[0]
                else:
                    return jsonify({"success": False, "error": "CSV file does not contain text or email columns."}), 400

            count = 0
            for row in csv_reader:
                count += 1
                if count > 500:  # safety limit for single request
                    break
                subj = row.get(subject_field, "") if subject_field else ""
                txt = row.get(text_field, "") if text_field else ""
                if str(subj).strip() or str(txt).strip():
                    records.append({"subject": str(subj).strip(), "text": str(txt).strip()})

        except Exception as e:
            return jsonify({"success": False, "error": f"Error parsing CSV file: {str(e)}"}), 400

    # Handle JSON array
    elif request.is_json:
        payload = request.get_json(silent=True) or {}
        records_raw = payload.get("records", [])
        for r in records_raw:
            subj = r.get("subject", "")
            txt = r.get("text", "") or r.get("body", "") or r.get("message", "")
            if str(subj).strip() or str(txt).strip():
                records.append({"subject": str(subj).strip(), "text": str(txt).strip()})
    else:
        return jsonify({"success": False, "error": "No CSV file uploaded or JSON records provided."}), 400

    if not records:
        return jsonify({"success": False, "error": "Uploaded file contains no readable email records."}), 400

    try:
        results = predict_batch(records)

        # Calculate statistics
        total = len(results)
        spam_count = sum(1 for r in results if r["is_spam"])
        ham_count = total - spam_count
        spam_pct = round((spam_count / total * 100), 1) if total > 0 else 0.0

        # Persist predictions in SQLite
        for r in results:
            insert_prediction(
                subject=r["subject"],
                preview=r["preview"],
                classification=r["classification"],
                confidence=r["confidence"],
                risk_level=r["risk_level"],
                suspicious_keywords=r.get("suspicious_keywords", [])
            )

        return jsonify({
            "success": True,
            "total_processed": total,
            "spam_count": spam_count,
            "ham_count": ham_count,
            "spam_percentage": spam_pct,
            "results": results
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Bulk inference error: {str(e)}"}), 500
