# EmailGuard – AI-Powered Email Spam Detection System

EmailGuard is an enterprise-grade, Natural Language Processing (NLP) and Machine Learning (ML) spam and phishing detection system. It analyzes email headers, text semantics, structural indicators, and deceptive triggers to accurately distinguish between legitimate correspondence (Ham) and unwanted or fraudulent emails (Spam).

---

## Table of Contents
1. [Project Introduction](#1-project-introduction)
2. [Problem Statement](#2-problem-statement)
3. [Project Objectives](#3-project-objectives)
4. [Key Features](#4-key-features)
5. [Technology Stack](#5-technology-stack)
6. [Dataset Information & Provenance](#6-dataset-information--provenance)
7. [Machine Learning Algorithms & NLP Pipeline](#7-machine-learning-algorithms--nlp-pipeline)
8. [Model Training & Evaluation Results](#8-model-training--evaluation-results)
9. [Project Architecture & Directory Structure](#9-project-architecture--directory-structure)
10. [Installation & Setup Instructions](#10-installation--setup-instructions)
11. [Running the Application](#11-running-the-application)
12. [REST API Documentation](#12-rest-api-documentation)
13. [Testing Instructions](#13-testing-instructions)
14. [Security & Privacy Principles](#14-security--privacy-principles)
15. [Future Enhancements](#15-future-enhancements)

---

## 1. Project Introduction
Email communication remains the backbone of personal and enterprise workflows. However, inboxes are continuously flooded with spam, phishing alerts, lottery scams, credential harvest attacks, and unsolicited commercial advertisements. EmailGuard provides a privacy-preserving, transparent, and accurate machine learning platform that classifies emails in real time, provides human-understandable explanations for why a message was flagged, processes bulk CSV archives, and logs prediction telemetry in a SQLite database.

## 2. Problem Statement
Traditional spam filters often rely on brittle heuristic keyword blacklists that fail when scammers change vocabulary slightly or misclassify legitimate critical work emails (False Positives). Meanwhile, cloud AI APIs can be cost-prohibitive and introduce privacy concerns by transmitting sensitive corporate emails across third-party networks. 

EmailGuard solves this by deploying a local NLP pipeline leveraging **TF-IDF sublinear vectorization** combined with **calibrated Linear Support Vector Machines** and **Multinomial Naive Bayes**, achieving **99.03% test accuracy** and **96.03% F1-score** with only 3 false positives out of 903 tested legitimate messages.

## 3. Project Objectives
- Build an end-to-end, reproducible NLP classification engine trained on public benchmark data.
- Train, evaluate, and benchmark candidate algorithms (**Multinomial Naive Bayes**, **Logistic Regression**, and **Linear Support Vector Machine**).
- Deliver calibrated confidence scores and human-readable explanations instead of opaque black-box classifications.
- Enable single-email scanning and bulk batch CSV processing.
- Maintain persistent prediction history and audit logs via SQLite.
- Provide a responsive dashboard with distribution donuts, 7-day temporal trends, risk tiers, and TF-IDF feature weight visualizations.

---

## 4. Key Features

### A. Real-Time Spam Checker
- Accepts email subject and body.
- One-click sample scenario loader (Wells Fargo phishing, Lottery jackpot, Rolex discounts, Team sprint sync, Cloud hosting invoice, Dental appointment).
- Returns classification: **Spam** or **Not Spam (Ham)**.
- Outputs estimated model confidence score (with explicit non-guarantee probabilistic disclaimer).
- Assesses **Risk Level**: *Minimal Risk*, *Low Risk*, *Moderate Risk*, *High Risk*, *Severe Risk*.
- Highlights detected trigger keywords in the email text.
- Extracts structural indicators: URL presence, currency references, uppercase letter ratio, exclamation count, and word count.

### B. Bulk Dataset Classification
- Drag-and-drop CSV upload with size limit validation (up to 16MB).
- Flexible auto-column mapping (`text`, `message`, `body`, `subject`, `content`).
- Batch progress indicators and summary statistics.
- Paginated results table with real-time client-side search and filters.
- **Export Results as CSV**: Download processed dataset with classification, confidence, risk tier, and triggers.

### C. Analytics Dashboard
- Total emails analyzed, spam detected count, legitimate ham count, and spam ratio.
- Recharts visualizations:
  - Spam vs. Ham distribution donut chart.
  - 7-Day detection volume trajectory area chart.
  - Risk stratification bar chart.
  - Top informative spam keywords horizontal bar chart.

### D. SQLite Prediction History
- Persistent storage of all scanned emails in SQLite (`backend/database/emailguard.db`).
- Searchable by subject, content excerpt, or triggered keywords.
- Filter by Spam Only or Legitimate Only.
- View record details modal and delete individual records.
- "Clear History" confirmation modal for privacy compliance.

### E. Model Information & Evaluation
- Displays active champion model metadata.
- Real empirical **Confusion Matrix** on held-out test data.
- Benchmark comparison table comparing all 3 candidate algorithms across Accuracy, Precision, Recall, F1, and ROC-AUC.
- TF-IDF feature extraction parameters and vocabulary metrics.

---

## 5. Technology Stack

### Machine Learning & NLP
- **Python 3.10+**
- **Scikit-learn**: TF-IDF Vectorizer, MultinomialNB, LogisticRegression, LinearSVC, CalibratedClassifierCV, cross_val_score
- **Pandas & NumPy**: Data cleaning, deduplication, matrix manipulation
- **Joblib**: Model and vectorizer serialization

### Backend & API
- **Flask**: Modular REST API with Blueprints
- **Flask-CORS**: Cross-Origin Resource Sharing handling
- **SQLite 3**: Embedded database engine for prediction history

### Full-Stack Server & Dev Environment
- **Node.js & Express**: Full-stack API proxy and static file serving on port 3000
- **tsx**: TypeScript runtime

### Frontend
- **React 19 & TypeScript**
- **Tailwind CSS v4**: Responsive layout, anti-slop typography, dark mode variant
- **Lucide React**: Clean, accessible iconography
- **Recharts**: Responsive data visualization charts

---

## 6. Dataset Information & Provenance
The model is trained on the benchmark **SMS & Email Spam Collection Dataset** derived from standard NLP research repositories:
- **Total Clean Deduplicated Records**: 5,153 samples
- **Legitimate (Ham)**: 4,511 samples (87.5%)
- **Spam**: 642 samples (12.5%)
- **Class Imbalance Ratio**: 1 : 7.0
- **Partitioning**: 80% Train (4,122 samples) / 20% Test (1,031 samples) using stratified sampling with fixed seed (`random_state=42`).
- **Reproducibility**: Run `python dataset/prepare_dataset.py` to re-fetch and re-clean the dataset.

---

## 7. Machine Learning Algorithms & NLP Pipeline

```
Raw Email Input (Subject + Body)
               │
               ▼
   [ Text Preprocessing ]
   ├── HTML Tag Stripping (<[^>]+>)
   ├── URL Normalization ('httpurltoken')
   ├── Email Address Normalization ('emailtoken')
   ├── Currency Normalization ('currencysymbol')
   ├── Lowercase & Punctuation Cleanup
   ├── Stopword Removal (Custom Curated List)
   └── Suffix Stemming
               │
               ▼
   [ Feature Extraction ]
   ├── TF-IDF Vectorizer (Unigrams + Bigrams)
   ├── Sublinear TF Scaling
   └── Vocabulary: 5,000 Top Features
               │
               ▼
   [ Model Classification ]
   ├── Linear Support Vector Machine (LinearSVC)
   ├── Probability Calibration (CalibratedClassifierCV)
   └── Class Weight: Balanced
               │
               ▼
   [ Inference & Explainability Output ]
   ├── Prediction: Spam / Not Spam
   ├── Confidence: e.g. 99.4%
   ├── Risk Tier: Minimal / Low / Moderate / High / Severe
   ├── Trigger Extraction: 'urgent', 'claim prize', 'verify'
   └── Structural Signals: URL, Currency, Caps %, Exclamations
```

---

## 8. Model Training & Evaluation Results
All candidate models were trained on the same 80% training partition and evaluated on the same 20% held-out test split (1,031 samples: 903 Ham, 128 Spam):

| Algorithm | Test Accuracy | Precision (Spam) | Recall (Spam) | F1-Score | ROC-AUC | 5-Fold CV F1 |
|---|---|---|---|---|---|---|
| **Linear Support Vector Machine (Champion)** | **99.03%** | **97.58%** | **94.53%** | **96.03%** | **0.9941** | **94.49% ± 0.91%** |
| **Multinomial Naive Bayes** | 98.84% | 97.54% | 92.97% | 95.20% | 0.9901 | 94.30% ± 1.31% |
| **Logistic Regression** | 98.25% | 91.04% | 95.31% | 93.13% | 0.9944 | 93.50% ± 1.48% |

### Champion Confusion Matrix (Test Split N = 1,031):
- **True Negatives (Legitimate Correctly Preserved)**: 900
- **False Positives (Legitimate Mistaken for Spam)**: 3 (0.33% error rate)
- **False Negatives (Spam Slipped Past)**: 7
- **True Positives (Spam Correctly Intercepted)**: 121

---

## 9. Project Architecture & Directory Structure

```
EmailGuard/
├── backend/
│   ├── app.py                     # Main Flask application & routes registration
│   ├── config.py                  # Configurable paths, limits, and server settings
│   ├── requirements.txt           # Python dependencies
│   ├── routes/
│   │   ├── prediction.py          # /api/predict & /api/bulk-predict
│   │   ├── dashboard.py           # /api/dashboard
│   │   └── history.py             # /api/history (GET, DELETE)
│   ├── ml/
│   │   ├── preprocessing.py       # NLP text normalization & explainability features
│   │   ├── train.py               # Comparative ML training & artifact exporter
│   │   ├── predict.py             # Inference engine, confidence, & explanations
│   │   ├── evaluate.py            # Standalone evaluation & classification report
│   │   └── model_loader.py        # Thread-safe cached singleton loader
│   ├── models/
│   │   ├── spam_model.pkl         # Serialized champion classifier
│   │   ├── vectorizer.pkl         # Serialized TF-IDF vectorizer
│   │   └── model_metadata.json    # Genuine metrics, benchmarks, & vocabulary
│   ├── database/
│   │   ├── db.py                  # SQLite database manager & queries
│   │   └── emailguard.db          # Embedded SQLite database file
│   └── uploads/                   # Temporary upload directory
│
├── dataset/
│   ├── prepare_dataset.py         # Reproducible dataset download & cleaning script
│   ├── spam_dataset.csv           # Cleaned canonical dataset (5,153 samples)
│   ├── sample_bulk_test.csv       # 10 realistic email samples for bulk testing
│   └── README.md                  # Dataset schema and documentation
│
├── notebooks/
│   └── spam_detection_analysis.ipynb  # Interactive EDA, modeling, & ROC analysis
│
├── tests/
│   ├── test_preprocessing.py      # NLP cleaning unit tests
│   ├── test_prediction.py         # Spam, ham, empty input, & batch unit tests
│   └── test_api.py                # REST API endpoints & SQLite CRUD tests
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # 3-zone top navigation bar
│   │   ├── Overview.tsx           # Dashboard KPIs, launch cards, recent list
│   │   ├── SpamChecker.tsx        # Interactive scanner, presets, & highlighter
│   │   ├── BulkDetection.tsx      # CSV upload, progress, & CSV exporter
│   │   ├── DetectionHistory.tsx   # Searchable SQLite audit log table
│   │   ├── Analytics.tsx          # Recharts donuts, line trends, & feature weights
│   │   ├── ModelInformation.tsx   # Confusion matrix visualizer & comparisons
│   │   └── DocumentationModal.tsx # In-app guide and API documentation
│   ├── services/
│   │   └── api.ts                 # Typed fetch client
│   ├── types/
│   │   └── index.ts               # TypeScript data models
│   ├── App.tsx                    # Root layout & state controller
│   ├── index.css                  # Tailwind styles & theme variables
│   └── main.tsx                   # React DOM entry point
│
├── server.ts                      # Full-stack Node/Express server on port 3000
├── package.json                   # NPM dependencies and scripts
├── requirements.txt               # Root Python requirements
├── metadata.json                  # AI Studio application metadata
└── README.md                      # Comprehensive documentation
```

---

## 10. Installation & Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js 18+ and npm

### 1. Clone & Navigate
```bash
git clone https://github.com/your-username/EmailGuard.git
cd EmailGuard
```

### 2. Python Environment Setup
```bash
# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python ML & backend requirements
pip install -r requirements.txt
```

### 3. Node.js Frontend Setup
```bash
npm install
```

---

## 11. Running the Application

### Option A: Complete Full-Stack Server (Recommended)
This launches the Node.js/Express server on **port 3000**, which automatically spawns the Python/Flask ML backend on port 5001 and mounts the React frontend:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option B: Standalone Python Flask Backend
If you want to run or test the Flask backend independently:
```bash
python backend/app.py
```
The Flask API will run on [http://127.0.0.1:5001](http://127.0.0.1:5001).

---

## 12. REST API Documentation

### 1. `POST /api/predict`
Classifies a single email message.

**Request Body (JSON):**
```json
{
  "subject": "URGENT: Suspended Account Notice",
  "body": "Your account has been locked. Verify immediately at http://secure-login.cc"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "classification": "Spam",
  "is_spam": true,
  "confidence": 99.4,
  "risk_level": "Severe Risk",
  "suspicious_keywords": ["urgent", "account suspended", "verify your account"],
  "structural_indicators": {
    "has_url": true,
    "has_currency": false,
    "has_phone": false,
    "caps_ratio": 24.5,
    "exclamation_count": 1,
    "word_count": 14
  },
  "explanation": "Classified as Spam with 99.4% estimated model confidence. Detected known spam/phishing triggers: 'urgent', 'account suspended'. Contains unverified hyperlinks.",
  "record_id": 8
}
```

### 2. `POST /api/bulk-predict`
Classifies multiple emails via CSV file upload (`multipart/form-data`) or JSON array.

**Response (200 OK):**
```json
{
  "success": true,
  "total_processed": 10,
  "spam_count": 5,
  "ham_count": 5,
  "spam_percentage": 50.0,
  "results": [...]
}
```

### 3. `GET /api/dashboard`
Returns aggregated telemetry for the dashboard:
- `total_analyzed`
- `total_spam`
- `total_legitimate`
- `spam_percentage`
- `risk_distribution`
- `trends` (last 7 days)
- `recent_predictions` (last 5 records)

### 4. `GET /api/history`
Returns paginated prediction history with support for query parameters:
- `limit` (default: 50)
- `offset` (default: 0)
- `filter` (`spam`, `not spam`, or `all`)
- `search` (keyword query)

### 5. `DELETE /api/history/:id`
Deletes an individual history record by ID.

### 6. `DELETE /api/history`
Purges all prediction logs from the SQLite database.

### 7. `GET /api/model-info`
Returns genuine model metadata, accuracy, precision, recall, F1, ROC-AUC, confusion matrix, and feature extraction settings.

### 8. `GET /api/health`
Returns backend and ML pipeline readiness status:
```json
{
  "database_ready": true,
  "model_loaded": true,
  "model_name": "Linear Support Vector Machine",
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## 13. Testing Instructions

The codebase includes an automated unit testing suite covering NLP preprocessing, spam/ham classification, empty inputs, bulk processing, and API routes.

Run the unit tests:
```bash
python3 -m unittest discover -s tests -p "test_*.py"
```

All 20 test cases will execute:
- `test_preprocessing.py`: Lowercase conversion, HTML removal, URL normalization, email tokenization, currency signals, trigger extraction, empty string safety.
- `test_prediction.py`: Spam detection, legitimate ham detection, empty input validation, batch predictions.
- `test_api.py`: `/api/health`, `/api/model-info`, `/api/predict`, `/api/bulk-predict`, `/api/dashboard`, `/api/history`, SQLite insert and delete operations.

---

## 14. Security & Privacy Principles
- **No Third-Party AI APIs**: EmailGuard performs all inferences locally without sending sensitive user correspondence to cloud LLMs or external servers.
- **Upload Restrictions**: Maximum file upload capped at 16MB; only `.csv` and `.txt` extensions permitted.
- **Memory Streaming**: Bulk CSVs are processed in memory and never executed as server-side scripts.
- **Audit Control**: Users have full sovereignty to search, view, export, or permanently delete prediction records at any time.

---

## 15. Future Enhancements
- Support for DKIM / SPF / DMARC header authentication inspection.
- OCR image text extraction for image-based spam flyers.
- Multilingual support for non-English spam filtering.
- Lightweight ONNX WebAssembly model export for client-side edge inference in browsers.
