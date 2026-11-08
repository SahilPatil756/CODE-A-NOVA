# EmailGuard Dataset Documentation

## Overview
This repository uses the real, publicly available benchmark **SMS and Email Spam Collection Dataset** originally curated from the UCI Machine Learning Repository and standard NLP research corpora.

## Files
- `spam_dataset.csv`: Cleaned, deduplicated training and evaluation dataset (5,153 samples).
- `sample_bulk_test.csv`: 10 realistic email samples (5 ham, 5 spam) for instant testing of the Bulk Email Detection feature.
- `prepare_dataset.py`: Reproducible Python script to download, inspect, clean missing records, remove duplicates, and export standard CSVs.

## Dataset Schema
| Column | Type | Description |
|---|---|---|
| `label` | string | Target class: `ham` (legitimate email) or `spam` (unwanted/fraudulent) |
| `text` | string | Email content including headers, body, or subject |

## Data Preprocessing Applied
1. Dropped null or malformed records.
2. Stripped whitespace and normalized casing to lowercase.
3. Removed 407 exact duplicate messages to prevent data leakage between train and test splits.
4. Stratified 80/20 train-test split applied during ML training with fixed random seed (42) for reproducibility.

## Custom Dataset Configuration
To train or evaluate on your own dataset (e.g. Enron or custom corporate email export), set the environment variable:
```bash
export EMAILGUARD_DATASET_PATH=/path/to/your/custom_dataset.csv
```
The file must contain either `(label, text)` or `(label, message)` columns.
