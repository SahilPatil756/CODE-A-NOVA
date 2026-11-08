"""
EmailGuard - Model Loader Singleton
Safely loads and caches the trained ML model, TF-IDF vectorizer, and metadata.
"""

import json
import threading
from typing import Optional, Tuple, Any, Dict
from pathlib import Path
import joblib

import sys
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config import MODEL_PATH, VECTORIZER_PATH, METADATA_PATH

_lock = threading.Lock()
_model: Optional[Any] = None
_vectorizer: Optional[Any] = None
_metadata: Optional[Dict[str, Any]] = None

def get_ml_pipeline() -> Tuple[Optional[Any], Optional[Any], Optional[Dict[str, Any]]]:
    """Returns cached (model, vectorizer, metadata) or loads them from disk."""
    global _model, _vectorizer, _metadata

    if _model is not None and _vectorizer is not None and _metadata is not None:
        return _model, _vectorizer, _metadata

    with _lock:
        # Re-check inside lock
        if _model is not None and _vectorizer is not None and _metadata is not None:
            return _model, _vectorizer, _metadata

        if not MODEL_PATH.exists() or not VECTORIZER_PATH.exists():
            print(f"[!] Warning: Model files not found ({MODEL_PATH}, {VECTORIZER_PATH})")
            return None, None, None

        try:
            print(f"[*] Loading ML artifacts into memory...")
            _model = joblib.load(MODEL_PATH)
            _vectorizer = joblib.load(VECTORIZER_PATH)
            if METADATA_PATH.exists():
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    _metadata = json.load(f)
            else:
                _metadata = {"model_name": "Trained Classifier", "model_version": "1.0.0"}
            print(f"[+] Model and vectorizer successfully loaded.")
        except Exception as e:
            print(f"[-] Error loading model artifacts: {e}")
            return None, None, None

    return _model, _vectorizer, _metadata

def reload_pipeline() -> Tuple[Optional[Any], Optional[Any], Optional[Dict[str, Any]]]:
    """Forces cache clearing and reload."""
    global _model, _vectorizer, _metadata
    with _lock:
        _model = None
        _vectorizer = None
        _metadata = None
    return get_ml_pipeline()
