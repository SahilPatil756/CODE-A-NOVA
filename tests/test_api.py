"""
Unit Tests - Flask REST API Endpoints and Database Persistence
"""

import io
import json
import unittest
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from app import app
from database.db import get_history, delete_prediction, insert_prediction

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertTrue(data["model_loaded"])

    def test_model_info_endpoint(self):
        res = self.client.get("/api/model-info")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("accuracy", data["metadata"]["selected_metrics"])

    def test_predict_endpoint_valid(self):
        payload = {
            "subject": "Account suspended",
            "body": "Your bank account has been suspended. Verify immediately at http://fake-login.cc"
        }
        res = self.client.post("/api/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["classification"], "Spam")
        self.assertIn("record_id", data)

    def test_predict_endpoint_empty(self):
        res = self.client.post("/api/predict", json={"subject": "", "body": ""})
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])

    def test_bulk_predict_json(self):
        payload = {
            "records": [
                {"subject": "Free iPhone", "text": "Claim your free iPhone today!"},
                {"subject": "Flight confirmation", "text": "Your flight AA1234 has been confirmed."}
            ]
        }
        res = self.client.post("/api/bulk-predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["total_processed"], 2)

    def test_bulk_predict_csv_upload(self):
        csv_content = "subject,text\nWin Cash,Claim $1000 cash prize\nTeam Meeting,Review slide deck tomorrow"
        data = {
            "file": (io.BytesIO(csv_content.encode("utf-8")), "test_emails.csv")
        }
        res = self.client.post("/api/bulk-predict", data=data, content_type="multipart/form-data")
        self.assertEqual(res.status_code, 200)
        resp_data = res.get_json()
        self.assertTrue(resp_data["success"])
        self.assertEqual(resp_data["total_processed"], 2)

    def test_bulk_predict_invalid_extension(self):
        data = {
            "file": (io.BytesIO(b"binary"), "test.exe")
        }
        res = self.client.post("/api/bulk-predict", data=data, content_type="multipart/form-data")
        self.assertEqual(res.status_code, 400)

    def test_dashboard_endpoint(self):
        res = self.client.get("/api/dashboard")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("total_analyzed", data["data"])

    def test_history_crud(self):
        # Insert
        rec_id = insert_prediction("Test Subj", "Test Body", "Not Spam", 95.0, "Low Risk", [])
        self.assertIsInstance(rec_id, int)

        # Retrieve
        res = self.client.get("/api/history")
        self.assertEqual(res.status_code, 200)
        history_data = res.get_json()["data"]["records"]
        self.assertTrue(any(r["id"] == rec_id for r in history_data))

        # Delete
        del_res = self.client.delete(f"/api/history/{rec_id}")
        self.assertEqual(del_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
