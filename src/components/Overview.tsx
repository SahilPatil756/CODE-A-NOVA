/**
 * EmailGuard - Overview & Dashboard Landing View
 */

import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Mail, 
  FileSpreadsheet, 
  Cpu, 
  ArrowRight, 
  Clock, 
  ExternalLink,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { DashboardData, ModelMetadata, ActiveTab, HistoryRecord } from '../types';

interface OverviewProps {
  dashboardData: DashboardData | null;
  modelMetadata: ModelMetadata | null;
  loading: boolean;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectRecord?: (record: HistoryRecord) => void;
}

export const Overview: React.FC<OverviewProps> = ({
  dashboardData,
  modelMetadata,
  loading,
  setActiveTab,
  onSelectRecord,
}) => {
  const total = dashboardData?.total_analyzed || 0;
  const spam = dashboardData?.total_spam || 0;
  const ham = dashboardData?.total_legitimate || 0;
  const spamPct = dashboardData?.spam_percentage || 0;
  const hamPct = total > 0 ? (100 - spamPct).toFixed(1) : '0.0';

  const accuracy = modelMetadata?.selected_metrics?.accuracy 
    ? (modelMetadata.selected_metrics.accuracy * 100).toFixed(1) 
    : '99.0';
  const f1Score = modelMetadata?.selected_metrics?.f1_score 
    ? (modelMetadata.selected_metrics.f1_score * 100).toFixed(1) 
    : '96.0';
  const modelName = modelMetadata?.model_name || 'Linear Support Vector Machine';

  return (
    <div className="space-y-8">
      {/* Top Banner: System Readiness */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300 mb-2">
            <span>Machine Learning Email Protection</span>
            <span>·</span>
            <span>TF-IDF NLP Pipeline Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Protect your inboxes with AI-powered spam & phishing intelligence.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            EmailGuard analyzes email semantics, suspicious hyperlinks, urgent phrasing, and financial triggers using statistical NLP classification to separate threats from legitimate correspondence.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('checker')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
            >
              <Mail className="w-4 h-4" />
              <span>Scan An Email</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-medium border border-slate-700 transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Upload CSV Dataset</span>
            </button>
          </div>
        </div>
        <div className="absolute right-6 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <ShieldAlert className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyzed */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-medium">Total Emails Analyzed</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {loading ? '...' : total.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span>Persistent SQLite audit history</span>
            </p>
          </div>
        </div>

        {/* Spam Identified */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-medium">Spam Intercepted</span>
            <div className="p-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400">
              {loading ? '...' : spam.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="font-semibold text-red-600 dark:text-red-400">{spamPct}%</span>
              <span>of analyzed volume</span>
            </p>
          </div>
        </div>

        {/* Legitimate Emails */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-medium">Legitimate (Ham)</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {loading ? '...' : ham.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{hamPct}%</span>
              <span>safe correspondence</span>
            </p>
          </div>
        </div>

        {/* Model Accuracy & F1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-medium">Benchmark F1-Score</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
              {f1Score}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Accuracy: {accuracy}%</span>
              <span>·</span>
              <span className="truncate max-w-[120px]" title={modelName}>{modelName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Visual Distribution Ratio Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-slate-900 dark:text-white">Classification Volume Ratio</span>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
              <span>Ham: {ham} ({hamPct}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <span className="w-2.5 h-2.5 rounded-xs bg-red-500 inline-block" />
              <span>Spam: {spam} ({spamPct}%)</span>
            </span>
          </div>
        </div>
        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${hamPct}%` }} 
            className="h-full bg-emerald-500 transition-all duration-500" 
            title={`Legitimate: ${hamPct}%`} 
          />
          <div 
            style={{ width: `${spamPct}%` }} 
            className="h-full bg-red-500 transition-all duration-500" 
            title={`Spam: ${spamPct}%`} 
          />
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div 
          onClick={() => setActiveTab('checker')}
          className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
              Instant Email Checker
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Paste email subject and body or pick from realistic preset emails (banking phishing, lottery scam, meeting notes) for real-time analysis.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
            <span>Analyze Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('bulk')}
          className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
              Bulk CSV Batch Analysis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Upload customer feedback or email archives via CSV. Process hundreds of messages with auto-detected columns and download categorized results.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
            <span>Upload Dataset</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('model-info')}
          className="group bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">
              Model Evaluation & Specs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Inspect genuine confusion matrices, accuracy, precision, recall, and benchmark comparisons between Naive Bayes, Logistic Regression, and LinearSVC.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
            <span>View Architecture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Email Detections</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live entries audited by the machine learning pipeline and stored in SQLite
            </p>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {dashboardData?.recent_predictions && dashboardData.recent_predictions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Preview</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                  <th className="py-3 px-4">Risk Tier</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dashboardData.recent_predictions.map((rec) => {
                  const isSpam = rec.classification === 'Spam';
                  return (
                    <tr 
                      key={rec.id} 
                      onClick={() => onSelectRecord && onSelectRecord(rec)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">
                        {rec.subject || <span className="text-slate-400 italic">No subject</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[280px] truncate">
                        {rec.preview}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 font-semibold ${
                          isSpam ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {isSpam ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          <span>{rec.classification}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                        {rec.confidence.toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-600 dark:text-slate-300">
                          {rec.risk_level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono tabular-nums whitespace-nowrap">
                        {rec.timestamp ? rec.timestamp.split(' ')[0] : 'Just now'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No emails analyzed yet. Run an email scan or load sample emails to begin.
          </div>
        )}
      </div>
    </div>
  );
};
