/**
 * EmailGuard - Email Spam Checker Component
 * Interactive text editor, preset sample loader, live inference, and explainability breakdown.
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Send, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  Link,
  DollarSign,
  AlertTriangle,
  Type,
  PhoneCall
} from 'lucide-react';
import { PredictionResult, SampleEmail } from '../types';
import { analyzeEmail } from '../services/api';

interface SpamCheckerProps {
  sampleEmails: SampleEmail[];
  onAnalysisComplete?: () => void;
}

export const SpamChecker: React.FC<SpamCheckerProps> = ({
  sampleEmails,
  onAnalysisComplete,
}) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const handleSelectSample = (sampleId: string) => {
    setSelectedPresetId(sampleId);
    const sample = sampleEmails.find((s) => s.id === sampleId);
    if (sample) {
      setSubject(sample.subject);
      setBody(sample.body);
      setResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!subject.trim() && !body.trim()) {
      setError('Please enter an email subject or email body to evaluate.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await analyzeEmail(subject, body);
      setResult(response);
      if (onAnalysisComplete) onAnalysisComplete();
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSubject('');
    setBody('');
    setResult(null);
    setError(null);
    setSelectedPresetId('');
  };

  // Helper to render text with highlighted trigger keywords
  const renderHighlightedBody = (rawText: string, keywords: string[]) => {
    if (!keywords || keywords.length === 0) return rawText;

    // Create a safe regex from keywords
    const escaped = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    if (!escaped) return rawText;

    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = rawText.split(regex);

    return parts.map((part, i) => {
      const isMatch = keywords.some(k => k.toLowerCase() === part.toLowerCase());
      if (isMatch) {
        return (
          <mark key={i} className="bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 px-1 py-0.5 rounded-xs font-semibold">
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const isSpam = result?.classification === 'Spam';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Real-Time Email Spam & Phishing Checker
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Paste incoming email headers and content to detect phishing schemes, scams, and unsolicited bulk messages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Email Input Form */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            {/* Sample Email Presets Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Test With Sample Email</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedPresetId}
                  onChange={(e) => handleSelectSample(e.target.value)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select test email scenario...</option>
                  {sampleEmails.map((sample) => (
                    <option key={sample.id} value={sample.id}>
                      [{sample.label}] {sample.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAnalyze} className="space-y-4">
              {/* Subject Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. URGENT: Your account requires immediate verification"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Body Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Email Body / Message Text
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {body.length} characters · {body.trim() ? body.trim().split(/\s+/).length : 0} words
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Paste the full text of the email message here..."
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-mono resize-y"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Form</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || (!subject.trim() && !body.trim())}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Running NLP Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Analyze Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Guidance Box */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-blue-500" />
              <span>How EmailGuard Analyzes Content</span>
            </div>
            <p className="leading-relaxed">
              The NLP engine extracts unigrams and bigrams through TF-IDF feature transformations, evaluating urgency cues, deceptive financial claims, unverified domains, and structural capitalization ratios against thousands of authenticated benchmark email records.
            </p>
          </div>
        </div>

        {/* Right Column: Prediction Results & Explanations */}
        <div className="lg:col-span-5 space-y-5">
          {result ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {/* Classification Hero Result */}
              <div className={`p-6 ${
                isSpam 
                  ? 'bg-red-50/70 dark:bg-red-950/30' 
                  : 'bg-emerald-50/70 dark:bg-emerald-950/30'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Classification Result
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    isSpam 
                      ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' 
                      : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {result.risk_level}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isSpam 
                      ? 'bg-red-600 text-white shadow-sm shadow-red-500/20' 
                      : 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  }`}>
                    {isSpam ? <ShieldAlert className="w-7 h-7" /> : <ShieldCheck className="w-7 h-7" />}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold tracking-tight ${
                      isSpam ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {result.classification}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {isSpam 
                        ? 'Flagged as unwanted, fraudulent, or promotional spam' 
                        : 'Authentic correspondence with nominal indicators'}
                    </p>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Estimated Model Confidence
                    </span>
                    <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                      {result.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${result.confidence}%` }}
                      className={`h-full transition-all duration-500 ${
                        isSpam ? 'bg-red-600' : 'bg-emerald-600'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Statistical model probability estimate based on TF-IDF features. Not a guaranteed correctness certainty.
                  </p>
                </div>
              </div>

              {/* Explainability Breakdown */}
              <div className="p-5 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Model Explanation & Rationale
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {result.explanation}
                </p>

                {/* Detected Keywords */}
                {result.suspicious_keywords && result.suspicious_keywords.length > 0 && (
                  <div>
                    <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Detected Spam / Phishing Triggers:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.suspicious_keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-md font-medium"
                        >
                          "{kw}"
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Structural Indicators Grid */}
              <div className="p-5 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Structural & Lexical Indicators
                </h3>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Link className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hyperlinks</span>
                    </span>
                    <span className={`font-semibold ${result.structural_indicators.has_url ? 'text-red-600' : 'text-slate-500'}`}>
                      {result.structural_indicators.has_url ? 'Detected' : 'None'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>Currency / Price</span>
                    </span>
                    <span className={`font-semibold ${result.structural_indicators.has_currency ? 'text-red-600' : 'text-slate-500'}`}>
                      {result.structural_indicators.has_currency ? 'Detected' : 'None'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <Type className="w-3.5 h-3.5 text-slate-400" />
                      <span>Capital Ratio</span>
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      {result.structural_indicators.caps_ratio}%
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
                      <span>Exclamations</span>
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                      {result.structural_indicators.exclamation_count}
                    </span>
                  </div>
                </div>
              </div>

              {/* Highlighted Email View */}
              {body.trim() && (
                <div className="p-5 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Inspected Email Content
                  </h3>
                  <div className="text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 max-h-40 overflow-y-auto font-mono text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {renderHighlightedBody(body, result.suspicious_keywords)}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Awaiting Email Input
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Enter an email subject and body or pick one of the sample scenarios from the preset menu above to generate real-time NLP analysis.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSelectSample('sample-phishing-1')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Try Wells Fargo Phishing Preset</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
