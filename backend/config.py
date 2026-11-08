"""
EmailGuard - Configuration Settings
Defines paths, upload constraints, model storage, and database configurations.
"""

import os
from pathlib import Path

# Base directories
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

# Dataset paths
DATASET_DIR = PROJECT_ROOT / "dataset"
DATASET_PATH = Path(os.getenv("EMAILGUARD_DATASET_PATH", DATASET_DIR / "spam_dataset.csv"))

# ML Artifact paths
MODELS_DIR = BACKEND_DIR / "models"
MODEL_PATH = MODELS_DIR / "spam_model.pkl"
VECTORIZER_PATH = MODELS_DIR / "vectorizer.pkl"
METADATA_PATH = MODELS_DIR / "model_metadata.json"

# Database path
DATABASE_DIR = BACKEND_DIR / "database"
DATABASE_PATH = Path(os.getenv("EMAILGUARD_DB_PATH", DATABASE_DIR / "emailguard.db"))

# Upload constraints
UPLOAD_DIR = BACKEND_DIR / "uploads"
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
ALLOWED_EXTENSIONS = {"csv", "txt"}

# Server settings
HOST = os.getenv("FLASK_HOST", "127.0.0.1")
PORT = int(os.getenv("FLASK_PORT", "5001"))
DEBUG = os.getenv("FLASK_DEBUG", "0") == "1"

# Ensure runtime directories exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
DATASET_DIR.mkdir(parents=True, exist_ok=True)
