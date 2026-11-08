"""
EmailGuard - Machine Learning Model Training & Evaluation Pipeline
Trains and evaluates:
1. Multinomial Naive Bayes
2. Logistic Regression
3. Linear Support Vector Machine (LinearSVC with CalibratedClassifierCV)

Computes real accuracy, precision, recall, F1, ROC-AUC, cross-validation scores,
and confusion matrices. Saves the champion model, TF-IDF vectorizer, and metadata.
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import LinearSVC

import sys
# Ensure backend directory is in path
CURRENT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = CURRENT_DIR.parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from config import DATASET_PATH, MODEL_PATH, VECTORIZER_PATH, METADATA_PATH, MODELS_DIR
from ml.preprocessing import preprocess_text

def load_and_preprocess_dataset(dataset_path: Path) -> Tuple[pd.Series, pd.Series, pd.DataFrame]:
    """Loads CSV, cleans missing/duplicates, and executes NLP preprocessing."""
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset file not found at: {dataset_path}")

    print(f"[*] Reading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    # Detect text and label columns
    label_col = "label" if "label" in df.columns else ("Category" if "Category" in df.columns else df.columns[0])
    text_col = "text" if "text" in df.columns else ("message" if "message" in df.columns else ("Message" if "Message" in df.columns else df.columns[1]))

    df = df.dropna(subset=[label_col, text_col])
    df[label_col] = df[label_col].astype(str).str.strip().str.lower()
    df["target"] = df[label_col].map(lambda x: 1 if "spam" in x else 0)

    # Remove duplicates
    df = df.drop_duplicates(subset=[text_col]).reset_index(drop=True)

    print(f"[*] Processing {len(df)} samples through NLP cleaning pipeline...")
    start_time = time.time()
    df["cleaned_text"] = df[text_col].apply(preprocess_text)
    elapsed = time.time() - start_time
    print(f"[+] Text preprocessing completed in {elapsed:.2f}s")

    return df["cleaned_text"], df["target"], df

def extract_top_features(vectorizer: TfidfVectorizer, model: Any, top_n: int = 25) -> list:
    """Extracts top indicative spam words based on model coefficients or feature log probs."""
    feature_names = np.array(vectorizer.get_feature_names_out())
    try:
        # Logistic Regression
        if hasattr(model, "coef_"):
            coef = model.coef_[0]
            top_indices = np.argsort(coef)[-top_n:][::-1]
            return [
                {"word": feature_names[i], "weight": round(float(coef[i]), 4)}
                for i in top_indices if not feature_names[i].endswith("token")
            ][:15]
        # MultinomialNB
        elif hasattr(model, "feature_log_prob_"):
            log_prob_diff = model.feature_log_prob_[1] - model.feature_log_prob_[0]
            top_indices = np.argsort(log_prob_diff)[-top_n:][::-1]
            return [
                {"word": feature_names[i], "weight": round(float(log_prob_diff[i]), 4)}
                for i in top_indices if not feature_names[i].endswith("token")
            ][:15]
        # CalibratedClassifierCV wrapping LinearSVC
        elif hasattr(model, "calibrated_classifiers_"):
            base = model.calibrated_classifiers_[0].estimator
            if hasattr(base, "coef_"):
                coef = base.coef_[0]
                top_indices = np.argsort(coef)[-top_n:][::-1]
                return [
                    {"word": feature_names[i], "weight": round(float(coef[i]), 4)}
                    for i in top_indices if not feature_names[i].endswith("token")
                ][:15]
    except Exception as e:
        print(f"[!] Note: Could not extract feature weights ({e})")
    return []

def train_and_evaluate_all():
    """Executes feature extraction, comparative training, evaluation, and artifact export."""
    X_text, y, full_df = load_and_preprocess_dataset(DATASET_PATH)

    # Stratified Train-Test Split (80% Train, 20% Test)
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X_text, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"[*] Train set size: {len(X_train_raw)} (Spam: {sum(y_train)}, Ham: {len(y_train) - sum(y_train)})")
    print(f"[*] Test set size:  {len(X_test_raw)} (Spam: {sum(y_test)}, Ham: {len(y_test) - sum(y_test)})")

    # Step 2: TF-IDF Feature Extraction
    print("[*] Fitting TF-IDF Vectorizer (unigrams + bigrams, max_features=5000)...")
    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        min_df=2,
        max_df=0.95,
        sublinear_tf=True
    )
    X_train_tfidf = vectorizer.fit_transform(X_train_raw)
    X_test_tfidf = vectorizer.transform(X_test_raw)
    print(f"[+] TF-IDF Vocabulary size: {len(vectorizer.vocabulary_)} features")

    # Step 3: Candidate Models
    models = {
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.1),
        "Logistic Regression": LogisticRegression(C=1.0, max_iter=1000, class_weight="balanced", random_state=42),
        "Linear Support Vector Machine": CalibratedClassifierCV(
            estimator=LinearSVC(C=1.0, max_iter=3000, class_weight="balanced", random_state=42),
            cv=3
        )
    }

    results = {}
    cv_strategy = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print("\n" + "="*80)
    print("MODEL BENCHMARKING & EVALUATION RESULTS")
    print("="*80)

    best_model_name = None
    best_f1 = -1.0
    trained_estimators = {}

    for name, clf in models.items():
        print(f"\n---> Training: {name}")
        # 5-fold cross-validation F1 score on training set
        cv_scores = cross_val_score(clf, X_train_tfidf, y_train, cv=cv_strategy, scoring="f1")
        cv_mean = float(np.mean(cv_scores))
        cv_std = float(np.std(cv_scores))

        # Train on full train set
        clf.fit(X_train_tfidf, y_train)
        trained_estimators[name] = clf

        # Predictions on held-out test set
        y_pred = clf.predict(X_test_tfidf)
        
        # Probability for ROC-AUC
        if hasattr(clf, "predict_proba"):
            y_proba = clf.predict_proba(X_test_tfidf)[:, 1]
            auc_val = float(roc_auc_score(y_test, y_proba))
        else:
            auc_val = 0.0

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        cm = confusion_matrix(y_test, y_pred).tolist()  # [[TN, FP], [FN, TP]]

        print(f"     Accuracy:        {acc * 100:.2f}%")
        print(f"     Precision:       {prec * 100:.2f}%")
        print(f"     Recall (Spam):   {rec * 100:.2f}%")
        print(f"     F1-Score:        {f1 * 100:.2f}%")
        print(f"     ROC-AUC:         {auc_val:.4f}")
        print(f"     5-Fold CV F1:    {cv_mean * 100:.2f}% (+/- {cv_std * 100:.2f}%)")
        print(f"     Confusion Matrix: TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")

        results[name] = {
            "name": name,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc_val, 4),
            "cv_f1_mean": round(cv_mean, 4),
            "cv_f1_std": round(cv_std, 4),
            "confusion_matrix": {
                "true_negative": cm[0][0],
                "false_positive": cm[0][1],
                "false_negative": cm[1][0],
                "true_positive": cm[1][1]
            }
        }

        # Selection criterion: Highest F1 score with high recall
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name

    print("\n" + "="*80)
    print(f"CHAMPION MODEL SELECTED: {best_model_name} (F1-Score: {best_f1*100:.2f}%)")
    print("="*80)

    champion_model = trained_estimators[best_model_name]

    # Extract top informative spam terms
    top_spam_keywords = extract_top_features(vectorizer, champion_model)

    # Save artifacts
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(champion_model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)
    print(f"[+] Champion model serialized to: {MODEL_PATH}")
    print(f"[+] TF-IDF vectorizer serialized to: {VECTORIZER_PATH}")

    metadata = {
        "model_name": best_model_name,
        "model_version": "1.0.0",
        "training_timestamp": datetime.utcnow().isoformat() + "Z",
        "dataset_name": "UCI SMS & Email Spam Collection Benchmark",
        "total_records": len(full_df),
        "train_records": len(X_train_raw),
        "test_records": len(X_test_raw),
        "ham_count": int(sum(full_df["target"] == 0)),
        "spam_count": int(sum(full_df["target"] == 1)),
        "class_imbalance_ratio": f"1:{round((sum(full_df['target'] == 0) / max(1, sum(full_df['target'] == 1))), 1)}",
        "vocabulary_size": len(vectorizer.vocabulary_),
        "selected_metrics": results[best_model_name],
        "all_models_comparison": results,
        "top_spam_keywords": top_spam_keywords,
        "feature_extraction": {
            "method": "TF-IDF (Term Frequency-Inverse Document Frequency)",
            "ngram_range": [1, 2],
            "max_features": 5000,
            "min_df": 2,
            "max_df": 0.95
        }
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"[+] Model metadata successfully exported to: {METADATA_PATH}")

    return metadata

if __name__ == "__main__":
    train_and_evaluate_all()
