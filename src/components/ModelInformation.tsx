/**
 * EmailGuard - Model Information & Evaluation Metrics
 * Displays genuine model architecture, evaluation reports, confusion matrices, and comparisons.
 */

import React from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Database, 
  FileCheck, 
  Calendar, 
  Layers, 
  Award,
  Sparkles,
  Info
} from 'lucide-react';
import { ModelMetadata } from '../types';

interface ModelInformationProps {
  metadata: ModelMetadata | null;
  loading: boolean;
}

export const ModelInformation: React.FC<ModelInformationProps> = ({ metadata, loading }) => {
  if (loading || !metadata) {
    return (
      <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading model specifications and evaluation metadata...</span>
      </div>
    );
  }

  const metrics = metadata.selected_metrics;
  const cm = metrics.confusion_matrix;
  const comparisons = metadata.all_models_comparison || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Machine Learning Architecture & Evaluation Metrics
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Authentic metrics, confusion matrices, and empirical benchmarks from the NLP training pipeline.
        </p>
      </div>

      {/* Champion Model Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                <span>Selected Champion Classifier</span>
                <span>·</span>
                <span>Production v{metadata.model_version}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {metadata.model_name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Trained on the cleaned benchmark dataset with TF-IDF sublinear n-gram feature weighting, probability calibration, and balanced class compensation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
            <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Training Date</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {metadata.training_timestamp.split('T')[0]}
              </span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-slate-400 block text-[10px] uppercase font-sans">Vocabulary</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {metadata.vocabulary_size.toLocaleString()} Features
              </span>
            </div>
          </div>
        </div>

        {/* 6 Key Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-6">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Test Accuracy</span>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {(metrics.accuracy * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Overall Correctness</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Precision</span>
            <div className="text-xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400 mt-1">
              {(metrics.precision * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Spam Precision</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Recall (Sensitivity)</span>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {(metrics.recall * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Spam Interception</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">F1-Score</span>
            <div className="text-xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400 mt-1">
              {(metrics.f1_score * 100).toFixed(2)}%
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Harmonic Mean</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">ROC-AUC Score</span>
            <div className="text-xl font-bold font-mono tabular-nums text-violet-600 dark:text-violet-400 mt-1">
              {metrics.roc_auc.toFixed(4)}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Discriminative Power</span>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">5-Fold CV F1</span>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200 mt-1">
              {(metrics.cv_f1_mean * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">±{(metrics.cv_f1_std * 100).toFixed(2)}% std</span>
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Dataset Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix Visualizer */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Empirical Confusion Matrix
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              N = {metadata.test_records} Held-out Samples
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Performance matrix on the unseen 20% test partition, contrasting ground truth against model classifications.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* True Negative */}
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  True Negatives (TN)
                </span>
                <span className="text-xs text-emerald-700/80 dark:text-emerald-400">
                  Legitimate correctly kept safe
                </span>
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-300 mt-3">
                {cm.true_negative.toLocaleString()}
              </div>
            </div>

            {/* False Positive */}
            <div className="p-4 bg-amber-50/70 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                  False Positives (FP)
                </span>
                <span className="text-xs text-amber-700/80 dark:text-amber-400">
                  Legitimate mistaken for Spam
                </span>
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-amber-700 dark:text-amber-300 mt-3">
                {cm.false_positive.toLocaleString()}
              </div>
            </div>

            {/* False Negative */}
            <div className="p-4 bg-orange-50/70 dark:bg-orange-950/40 rounded-xl border border-orange-200 dark:border-orange-800/60 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-orange-800 dark:text-orange-300 uppercase tracking-wider block">
                  False Negatives (FN)
                </span>
                <span className="text-xs text-orange-700/80 dark:text-orange-400">
                  Spam slipped past filter
                </span>
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-orange-700 dark:text-orange-300 mt-3">
                {cm.false_negative.toLocaleString()}
              </div>
            </div>

            {/* True Positive */}
            <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800/60 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">
                  True Positives (TP)
                </span>
                <span className="text-xs text-blue-700/80 dark:text-blue-400">
                  Spam correctly caught & blocked
                </span>
              </div>
              <div className="text-3xl font-bold font-mono tabular-nums text-blue-700 dark:text-blue-300 mt-3">
                {cm.true_positive.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Dataset & Feature Pipeline Specs */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-500" />
                <span>Dataset & Partitioning Specifications</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reproducible data engineering and stratified distribution details.
            </p>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs mt-3">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Benchmark Source</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {metadata.dataset_name}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Total Deduplicated Samples</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {metadata.total_records.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Train / Test Partition Split</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {metadata.train_records.toLocaleString()} train (80%) · {metadata.test_records.toLocaleString()} test (20%)
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">Class Balance</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {metadata.ham_count} Legitimate : {metadata.spam_count} Spam ({metadata.class_imbalance_ratio})
                </span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-slate-500">TF-IDF N-Gram Strategy</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  Unigrams & Bigrams (1, 2)
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>Class imbalance handled automatically through balanced sample weights and stratified cross-validation folds.</span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Comparative Benchmark of All Trained Candidate Models
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Empirical validation results comparing Multinomial Naive Bayes, Logistic Regression, and Linear Support Vector Machine on the same held-out test split.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4 text-right">Accuracy</th>
                <th className="py-3 px-4 text-right">Precision</th>
                <th className="py-3 px-4 text-right">Recall (Spam)</th>
                <th className="py-3 px-4 text-right">F1-Score</th>
                <th className="py-3 px-4 text-right">ROC-AUC</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {Object.keys(comparisons).map((algoName) => {
                const item = comparisons[algoName];
                const isSelected = algoName === metadata.model_name;
                return (
                  <tr 
                    key={algoName} 
                    className={`transition-colors ${
                      isSelected 
                        ? 'bg-blue-50/50 dark:bg-blue-950/20 font-semibold text-blue-950 dark:text-blue-200' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-4 flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{algoName}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-blue-600 text-white font-medium px-2 py-0.5 rounded-full">
                          Champion
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {(item.accuracy * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {(item.precision * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {(item.recall * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                      {(item.f1_score * 100).toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {item.roc_auc.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isSelected ? (
                        <span className="text-blue-600 dark:text-blue-400 text-xs font-semibold">Active in Engine</span>
                      ) : (
                        <span className="text-slate-400">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
