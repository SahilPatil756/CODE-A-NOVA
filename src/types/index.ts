/**
 * EmailGuard TypeScript Type Definitions
 */

export type ClassificationType = 'Spam' | 'Not Spam';

export type RiskLevel = 
  | 'Minimal Risk'
  | 'Low Risk'
  | 'Moderate Risk'
  | 'High Risk'
  | 'Severe Risk';

export interface StructuralIndicators {
  has_url: boolean;
  has_currency: boolean;
  has_phone: boolean;
  caps_ratio: number;
  exclamation_count: number;
  word_count: number;
}

export interface PredictionResult {
  success: boolean;
  classification: ClassificationType;
  is_spam: boolean;
  confidence: number;
  probabilities?: {
    spam: number;
    ham: number;
  };
  risk_level: RiskLevel;
  suspicious_keywords: string[];
  structural_indicators: StructuralIndicators;
  matched_vocab?: string[];
  explanation: string;
  model_used: string;
  record_id?: number;
  error?: string;
}

export interface BulkRecordResult {
  index: number;
  subject: string;
  preview: string;
  classification: ClassificationType;
  is_spam: boolean;
  confidence: number;
  risk_level: RiskLevel;
  suspicious_keywords: string[];
}

export interface BulkPredictionResponse {
  success: boolean;
  total_processed: number;
  spam_count: number;
  ham_count: number;
  spam_percentage: number;
  results: BulkRecordResult[];
  error?: string;
}

export interface HistoryRecord {
  id: number;
  subject: string;
  preview: string;
  classification: ClassificationType;
  confidence: number;
  risk_level: RiskLevel;
  suspicious_keywords: string[];
  timestamp: string;
}

export interface DashboardData {
  total_analyzed: number;
  total_spam: number;
  total_legitimate: number;
  spam_percentage: number;
  average_confidence: number;
  risk_distribution: Record<string, number>;
  trends: Array<{
    date: string;
    spam: number;
    ham: number;
    total: number;
  }>;
  recent_predictions: HistoryRecord[];
}

export interface ConfusionMatrix {
  true_negative: number;
  false_positive: number;
  false_negative: number;
  true_positive: number;
}

export interface ModelMetricDetails {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  cv_f1_mean: number;
  cv_f1_std: number;
  confusion_matrix: ConfusionMatrix;
}

export interface ModelMetadata {
  model_name: string;
  model_version: string;
  training_timestamp: string;
  dataset_name: string;
  total_records: number;
  train_records: number;
  test_records: number;
  ham_count: number;
  spam_count: number;
  class_imbalance_ratio: string;
  vocabulary_size: number;
  selected_metrics: ModelMetricDetails;
  all_models_comparison: Record<string, ModelMetricDetails>;
  top_spam_keywords: Array<{ word: string; weight: number }>;
  feature_extraction: {
    method: string;
    ngram_range: [number, number];
    max_features: number;
    min_df: number;
    max_df: number;
  };
}

export interface SampleEmail {
  id: string;
  category: string;
  label: string;
  subject: string;
  body: string;
}

export type ActiveTab = 
  | 'overview' 
  | 'checker' 
  | 'bulk' 
  | 'history' 
  | 'analytics' 
  | 'model-info' 
  | 'docs';
