"""
EmailGuard - Dashboard Analytics Route
Aggregates summary statistics, spam/ham distribution, and detection trends.
"""

from flask import Blueprint, jsonify
from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database.db import get_dashboard_analytics

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/api/dashboard", methods=["GET"])
def get_dashboard_data():
    """Returns analytics data for dashboard KPIs and charts."""
    try:
        data = get_dashboard_analytics()
        return jsonify({
            "success": True,
            "data": data
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Failed to retrieve dashboard analytics: {str(e)}"
        }), 500
