"""
EmailGuard - History Routes
Provides paginated history retrieval, search, filter, and deletion options.
"""

from flask import Blueprint, request, jsonify
from pathlib import Path
import sys

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from database.db import get_history, delete_prediction, clear_all_history

history_bp = Blueprint("history", __name__)

@history_bp.route("/api/history", methods=["GET"])
def list_history():
    """Retrieves paginated prediction history with optional filter & search."""
    try:
        limit = min(int(request.args.get("limit", 50)), 200)
        offset = max(int(request.args.get("offset", 0)), 0)
        filter_class = request.args.get("filter", None)
        search = request.args.get("search", None)

        data = get_history(limit=limit, offset=offset, filter_class=filter_class, search=search)
        return jsonify({
            "success": True,
            "data": data
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@history_bp.route("/api/history/<int:record_id>", methods=["DELETE"])
def remove_history_item(record_id: int):
    """Deletes a specific history record."""
    try:
        deleted = delete_prediction(record_id)
        if deleted:
            return jsonify({"success": True, "message": f"Record {record_id} deleted."}), 200
        return jsonify({"success": False, "error": "Record not found."}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@history_bp.route("/api/history", methods=["DELETE"])
def clear_history():
    """Clears all records from history."""
    try:
        count = clear_all_history()
        return jsonify({"success": True, "message": f"Cleared {count} history records."}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
