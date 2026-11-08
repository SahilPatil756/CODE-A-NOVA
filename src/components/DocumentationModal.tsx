/**
 * EmailGuard - In-App Documentation & API Reference Modal
 */

import React, { useState } from 'react';
import { X, BookOpen, Code, Server, Shield, Layers, Copy, Check } from 'lucide-react';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                EmailGuard System Documentation & API
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Architecture, NLP Pipeline, REST APIs, and Local Execution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          {/* Section 1: Architecture */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-500" />
              <span>1. Machine Learning & NLP Pipeline Architecture</span>
            </h3>
            <p className="leading-relaxed text-xs text-slate-600 dark:text-slate-400">
              EmailGuard implements an NLP classification pipeline without requiring external proprietary APIs. The pipeline includes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li><strong>Text Preprocessing:</strong> Lowercase normalization, HTML tag stripping, URL/email/phone regex tokenization, currency symbol preservation, stopword filtering, and light suffix stemming.</li>
              <li><strong>Feature Extraction:</strong> TF-IDF Vectorizer with sublinear term-frequency scaling across unigrams and bigrams (1, 2) capped at 5,000 maximum vocabulary features.</li>
              <li><strong>Candidate Classifiers Evaluated:</strong> Multinomial Naive Bayes, Logistic Regression, and Linear Support Vector Machine (LinearSVC with calibrated probabilities).</li>
              <li><strong>Champion Selection:</strong> Linear Support Vector Machine achieved 99.03% test accuracy and 96.03% F1-score with only 3 false positives out of 903 legitimate messages.</li>
            </ul>
          </div>

          {/* Section 2: REST API Reference */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-500" />
              <span>2. REST API Endpoints</span>
            </h3>

            {/* Endpoint 1 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  POST /api/predict
                </span>
                <span className="text-[11px] text-slate-400">Classify Single Email</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accepts JSON payload containing subject and body, returns prediction, confidence, risk level, and triggers.
              </p>
              <pre className="p-2.5 bg-slate-900 text-slate-200 rounded text-[11px] font-mono overflow-x-auto">
{`{
  "subject": "URGENT: Verify your account",
  "body": "Click here to claim your $5,000 reward immediately."
}`}
              </pre>
            </div>

            {/* Endpoint 2 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  POST /api/bulk-predict
                </span>
                <span className="text-[11px] text-slate-400">Batch CSV Upload</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accepts multipart/form-data CSV upload (max 16MB) or JSON array of email records.
              </p>
            </div>

            {/* Endpoint 3 */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-violet-600 dark:text-violet-400">
                  GET /api/dashboard & GET /api/model-info
                </span>
                <span className="text-[11px] text-slate-400">Telemetry & Model Specs</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Returns live dashboard metrics, distribution aggregates, confusion matrix, and candidate benchmark comparison tables.
              </p>
            </div>
          </div>

          {/* Section 3: Local Execution */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-500" />
              <span>3. Local Development & Setup</span>
            </h3>
            <div className="p-3.5 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono space-y-2">
              <div className="text-slate-400"># 1. Install Python dependencies</div>
              <div>pip install -r requirements.txt</div>
              <div className="text-slate-400 pt-1"># 2. Train or evaluate models</div>
              <div>python backend/ml/train.py</div>
              <div className="text-slate-400 pt-1"># 3. Run unit tests</div>
              <div>python -m unittest discover -s tests -p "test_*.py"</div>
              <div className="text-slate-400 pt-1"># 4. Start web application</div>
              <div>npm run dev</div>
            </div>
          </div>

          {/* Section 4: Security & Privacy */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span>4. Security & Privacy Safeguards</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              EmailGuard runs on local or private container infrastructure. Uploaded CSVs are parsed in memory without saving raw files to disk, emails are checked for size constraints (16MB cap), input is sanitized, and prediction history stored in SQLite can be purged on demand via the "Clear History" action.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
