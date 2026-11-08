"""
Unit Tests - Text Preprocessing and NLP Cleaning Pipeline
"""

import unittest
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from ml.preprocessing import preprocess_text, extract_email_features, simple_stem

class TestPreprocessing(unittest.TestCase):
    def test_lowercase_conversion(self):
        text = "URGENT NOTICE For You"
        cleaned = preprocess_text(text)
        self.assertNotIn("URGENT", cleaned)
        self.assertIn("urgent", cleaned)

    def test_html_tag_removal(self):
        html_input = "<html><body><h1>Special Offer</h1><p>Click <a href='http://evil.com'>here</a></p></body></html>"
        cleaned = preprocess_text(html_input)
        self.assertNotIn("<html>", cleaned)
        self.assertNotIn("<h1>", cleaned)
        self.assertNotIn("</a>", cleaned)

    def test_url_tokenization(self):
        text = "Visit our portal at https://secure-bank.com/login for details"
        cleaned = preprocess_text(text)
        self.assertIn("httpurltoken", cleaned)

    def test_email_tokenization(self):
        text = "Contact support at billing@company.org immediately"
        cleaned = preprocess_text(text)
        self.assertIn("emailtoken", cleaned)

    def test_currency_and_punct_signals(self):
        text = "WIN $5000 CASH NOW!!!!"
        features = extract_email_features(text)
        self.assertTrue(features["has_currency"])
        self.assertGreaterEqual(features["exclamation_count"], 4)
        self.assertGreaterEqual(features["caps_ratio"], 50.0)

    def test_suspicious_keyword_extraction(self):
        text = "Urgent: Your account is suspended, confirm your identity and claim your prize"
        features = extract_email_features(text)
        self.assertIn("urgent", features["suspicious_keywords"])
        self.assertIn("claim your prize", features["suspicious_keywords"])

    def test_empty_input(self):
        self.assertEqual(preprocess_text(""), "")
        self.assertEqual(preprocess_text(None), "")
        features = extract_email_features("")
        self.assertEqual(features["word_count"], 0)

if __name__ == "__main__":
    unittest.main()
