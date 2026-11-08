"""
EmailGuard - SQLite Database Management Module
Provides thread-safe persistence for email spam prediction records,
historical queries, audit logs, and dashboard analytics aggregation.
"""

import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from pathlib import Path

import sys
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config import DATABASE_PATH

def get_db_connection() -> sqlite3.Connection:
    """Creates a connection with Row factory enabled."""
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DATABASE_PATH), timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(seed_sample_history: bool = True):
    """Initializes the SQLite schema and optional initial history."""
    conn = get_db_connection()
    try:
        with conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS prediction_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    subject TEXT,
                    preview TEXT,
                    classification TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    risk_level TEXT NOT NULL,
                    suspicious_keywords TEXT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_pred_time ON prediction_history (timestamp DESC);")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_pred_class ON prediction_history (classification);")

            # Check if empty, optionally populate sample records for realistic initial dashboard view
            cur = conn.execute("SELECT COUNT(*) AS cnt FROM prediction_history;")
            count = cur.fetchone()["cnt"]

            if count == 0 and seed_sample_history:
                now = datetime.utcnow()
                sample_rows = [
                    (
                        "URGENT: Suspended Account Notice",
                        "Your bank access was restricted due to unauthorized login attempts. Click here to verify your identity immediately.",
                        "Spam", 99.4, "Severe Risk",
                        json.dumps(["urgent", "unauthorized login", "verify your account"]),
                        (now - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")
                    ),
                    (
                        "Weekly Engineering Sync Agenda",
                        "Hi team, attached is the architectural outline for the upcoming sprint. Please review PR #142 before tomorrow's meeting.",
                        "Not Spam", 96.2, "Minimal Risk",
                        json.dumps([]),
                        (now - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M:%S")
                    ),
                    (
                        "WINNER: $1,000 Walmart Gift Card",
                        "Congratulations! You were selected for a $1,000 cash voucher. Reply to claim before funds expire.",
                        "Spam", 98.7, "High Risk",
                        json.dumps(["winner", "congratulations", "gift card"]),
                        (now - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
                    ),
                    (
                        "Project status and client feedback",
                        "The client approved the revised dashboard prototypes. We will schedule deployment for Thursday afternoon.",
                        "Not Spam", 94.8, "Minimal Risk",
                        json.dumps([]),
                        (now - timedelta(days=1, hours=3)).strftime("%Y-%m-%d %H:%M:%S")
                    ),
                    (
                        "Exclusive 85% Flash Sale Today Only",
                        "Huge luxury watch discounts! Limited time promo. Order replica luxury products with free express shipping.",
                        "Spam", 91.5, "Moderate Risk",
                        json.dumps(["exclusive deal", "limited time offer", "replica"]),
                        (now - timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
                    ),
                    (
                        "Doctor Appointment Confirmation",
                        "Your annual dental examination has been scheduled with Dr. Davis for Friday at 11:00 AM.",
                        "Not Spam", 97.9, "Minimal Risk",
                        json.dumps([]),
                        (now - timedelta(days=3)).strftime("%Y-%m-%d %H:%M:%S")
                    )
                ]
                conn.executemany("""
                    INSERT INTO prediction_history (subject, preview, classification, confidence, risk_level, suspicious_keywords, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?);
                """, sample_rows)
    finally:
        conn.close()

def insert_prediction(
    subject: str,
    preview: str,
    classification: str,
    confidence: float,
    risk_level: str,
    suspicious_keywords: List[str]
) -> int:
    """Inserts an analyzed email prediction record."""
    conn = get_db_connection()
    try:
        with conn:
            cur = conn.execute("""
                INSERT INTO prediction_history (subject, preview, classification, confidence, risk_level, suspicious_keywords, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
            """, (
                subject or "",
                preview or "",
                classification,
                confidence,
                risk_level,
                json.dumps(suspicious_keywords or [])
            ))
            return cur.lastrowid
    finally:
        conn.close()

def get_history(
    limit: int = 50,
    offset: int = 0,
    filter_class: Optional[str] = None,
    search: Optional[str] = None
) -> Dict[str, Any]:
    """Retrieves paginated, filtered prediction history records."""
    conn = get_db_connection()
    try:
        query = "SELECT * FROM prediction_history WHERE 1=1"
        params: List[Any] = []

        if filter_class and filter_class.lower() in ("spam", "not spam", "ham"):
            target_cls = "Spam" if filter_class.lower() == "spam" else "Not Spam"
            query += " AND classification = ?"
            params.append(target_cls)

        if search:
            query += " AND (subject LIKE ? OR preview LIKE ? OR suspicious_keywords LIKE ?)"
            term = f"%{search}%"
            params.extend([term, term, term])

        # Count total matching
        count_query = query.replace("SELECT *", "SELECT COUNT(*) as total", 1)
        cur = conn.execute(count_query, params)
        total = cur.fetchone()["total"]

        # Fetch page
        query += " ORDER BY id DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])

        rows = conn.execute(query, params).fetchall()

        records = []
        for r in rows:
            try:
                keywords = json.loads(r["suspicious_keywords"]) if r["suspicious_keywords"] else []
            except Exception:
                keywords = []

            records.append({
                "id": r["id"],
                "subject": r["subject"],
                "preview": r["preview"],
                "classification": r["classification"],
                "confidence": round(float(r["confidence"]), 1),
                "risk_level": r["risk_level"],
                "suspicious_keywords": keywords,
                "timestamp": r["timestamp"]
            })

        return {
            "records": records,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    finally:
        conn.close()

def delete_prediction(record_id: int) -> bool:
    """Deletes a single prediction record by ID."""
    conn = get_db_connection()
    try:
        with conn:
            cur = conn.execute("DELETE FROM prediction_history WHERE id = ?;", (record_id,))
            return cur.rowcount > 0
    finally:
        conn.close()

def clear_all_history() -> int:
    """Clears all prediction records."""
    conn = get_db_connection()
    try:
        with conn:
            cur = conn.execute("DELETE FROM prediction_history;")
            return cur.rowcount
    finally:
        conn.close()

def get_dashboard_analytics() -> Dict[str, Any]:
    """Aggregates metrics for the analytics dashboard."""
    conn = get_db_connection()
    try:
        # Total counts
        cur = conn.execute("""
            SELECT 
                COUNT(*) AS total_count,
                SUM(CASE WHEN classification = 'Spam' THEN 1 ELSE 0 END) AS spam_count,
                SUM(CASE WHEN classification = 'Not Spam' THEN 1 ELSE 0 END) AS ham_count,
                AVG(confidence) AS avg_confidence
            FROM prediction_history;
        """)
        summary = cur.fetchone()

        total = summary["total_count"] or 0
        spam = summary["spam_count"] or 0
        ham = summary["ham_count"] or 0
        avg_conf = round(summary["avg_confidence"] or 0.0, 1)
        spam_pct = round((spam / total * 100), 1) if total > 0 else 0.0

        # Risk distribution
        risk_rows = conn.execute("""
            SELECT risk_level, COUNT(*) AS count
            FROM prediction_history
            GROUP BY risk_level;
        """).fetchall()
        risk_dist = {r["risk_level"]: r["count"] for r in risk_rows}

        # Daily trend (last 7 days)
        trend_rows = conn.execute("""
            SELECT 
                strftime('%Y-%m-%d', timestamp) AS day,
                SUM(CASE WHEN classification = 'Spam' THEN 1 ELSE 0 END) AS spam,
                SUM(CASE WHEN classification = 'Not Spam' THEN 1 ELSE 0 END) AS ham,
                COUNT(*) AS total
            FROM prediction_history
            WHERE timestamp >= datetime('now', '-7 days')
            GROUP BY strftime('%Y-%m-%d', timestamp)
            ORDER BY day ASC;
        """).fetchall()

        trends = [
            {"date": r["day"], "spam": r["spam"], "ham": r["ham"], "total": r["total"]}
            for r in trend_rows
        ]

        # Recent 5 items
        recent = get_history(limit=5, offset=0)["records"]

        return {
            "total_analyzed": total,
            "total_spam": spam,
            "total_legitimate": ham,
            "spam_percentage": spam_pct,
            "average_confidence": avg_conf,
            "risk_distribution": risk_dist,
            "trends": trends,
            "recent_predictions": recent
        }
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    print("[+] Database initialized successfully.")
    stats = get_dashboard_analytics()
    print(f"[*] Initial analytics: {stats['total_analyzed']} records, {stats['total_spam']} spam, {stats['total_legitimate']} ham.")
