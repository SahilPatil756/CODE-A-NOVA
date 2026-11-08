"""
EmailGuard - Standalone Model Evaluation Module
Evaluates trained models against test datasets, generates classification reports,
confusion matrices, and ROC metrics.
"""

import json
from pathlib import Path
import sys

import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score

CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config import MODEL_PATH, VECTORIZER_PATH, METADATA_PATH, DATASET_PATH
from ml.preprocessing import preprocess_text

def run_evaluation():
    if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
        print("[-] Model or vectorizer artifact not found. Please run train.py first.")
        return False

    print(f"[*] Loading model from {MODEL_PATH}...")
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)

    print(f"[*] Reading dataset from {DATASET_PATH}...")
    df = pd.read_csv(DATASET_PATH)
    label_col = "label" if "label" in df.columns else df.columns[0]
    text_col = "text" if "text" in df.columns else df.columns[1]

    df = df.dropna(subset=[label_col, text_col])
    y_true = df[label_col].map(lambda x: 1 if "spam" in str(x).lower() else 0).values

    print("[*] Preprocessing text and computing TF-IDF features...")
    cleaned_texts = df[text_col].apply(preprocess_text)
    X_tfidf = vectorizer.transform(cleaned_texts)

    y_pred = model.predict(X_tfidf)
    y_proba = model.predict_proba(X_tfidf)[:, 1] if hasattr(model, "predict_proba") else None

    print("\n" + "="*60)
    print("DETAILED CLASSIFICATION REPORT")
    print("="*60)
    print(classification_report(y_true, y_pred, target_names=["Legitimate (Ham)", "Spam"]))

    cm = confusion_matrix(y_true, y_pred)
    print("Confusion Matrix:")
    print(f"  True Negatives (Ham correctly identified):  {cm[0][0]}")
    print(f"  False Positives (Ham mistaken for Spam):    {cm[0][1]}")
    print(f"  False Negatives (Spam missed):              {cm[1][0]}")
    print(f"  True Positives (Spam correctly caught):     {cm[1][1]}")

    if y_proba is not None:
        roc_auc = roc_auc_score(y_true, y_proba)
        print(f"\nOverall ROC-AUC Score: {roc_auc:.4f}")

    return True

if __name__ == "__main__":
    run_evaluation()
