"""
Unit Tests - Model Inference and Prediction Engine
"""

import unittest
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from ml.predict import predict_single, predict_batch

class TestPrediction(unittest.TestCase):
    def test_spam_detection(self):
        subject = "URGENT: Claim $500,000 cash prize now!"
        body = "You have won a free lottery jackpot! Click http://claim-prize.cc to claim your money immediately."
        res = predict_single(subject, body)
        self.assertTrue(res["success"])
        self.assertEqual(res["classification"], "Spam")
        self.assertTrue(res["is_spam"])
        self.assertGreaterEqual(res["confidence"], 70.0)
        self.assertIn(res["risk_level"], ["High Risk", "Severe Risk"])
        self.assertIn("explanation", res)

    def test_ham_detection(self):
        subject = "Weekly team sync notes"
        body = "Hi Sarah, can you please review the attached slides before tomorrow's 10am product meeting? Thanks!"
        res = predict_single(subject, body)
        self.assertTrue(res["success"])
        self.assertEqual(res["classification"], "Not Spam")
        self.assertFalse(res["is_spam"])
        self.assertIn(res["risk_level"], ["Minimal Risk", "Low Risk"])

    def test_empty_input_handling(self):
        res = predict_single("", "")
        self.assertFalse(res["success"])
        self.assertIn("error", res)

    def test_batch_prediction(self):
        samples = [
            {"subject": "Free gift card", "text": "Win a $500 Amazon gift card now by clicking here!"},
            {"subject": "Lunch today?", "text": "Hey Mike, want to grab lunch around 12:30?"}
        ]
        results = predict_batch(samples)
        self.assertEqual(len(results), 2)
        self.assertEqual(results[0]["classification"], "Spam")
        self.assertEqual(results[1]["classification"], "Not Spam")

if __name__ == "__main__":
    unittest.main()
