/**
 * EmailGuard - Bulk Email CSV Detection Component
 * CSV upload, batch inference, tabular review, filtering, and export.
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Download, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  Search,
  RefreshCw,
  FileDown
} from 'lucide-react';
import { BulkPredictionResponse, BulkRecordResult } from '../types';
import { uploadBulkCsv } from '../services/api';

interface BulkDetectionProps {
  onBatchProcessed?: () => void;
}

export const BulkDetection: React.FC<BulkDetectionProps> = ({ onBatchProcessed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [batchResponse, setBatchResponse] = useState<BulkPredictionResponse | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'spam' | 'ham'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setError(null);
    if (!f.name.endsWith('.csv') && !f.name.endsWith('.txt')) {
      setError('Please upload a valid CSV file (.csv).');
      return;
    }
    if (f.size > 16 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 16MB.');
      return;
    }
    setFile(f);
  };

  const handleProcessCsv = async () => {
    if (!file) {
      setError('Please select a CSV file first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await uploadBulkCsv(file);
      setBatchResponse(resp);
      setCurrentPage(1);
      if (onBatchProcessed) onBatchProcessed();
    } catch (err: any) {
      setError(err.message || 'Failed to process bulk dataset.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSampleCsv = () => {
    const csvContent = 
`subject,text
"Urgent: Verify Your PayPal Account","Dear customer, unusual activity was detected on your account. Please click http://paypal-verify-login.cc to confirm your identity or your account will be frozen within 24 hours."
"Sprint Retrospective Notes - Sprint 42","Hi all, thanks for attending yesterday's retro. Attached is the summary of action items and sprint goals for the upcoming cycle."
"YOU HAVE WON $500,000 LOTTERY JACKPOT!","Final notice! Your mobile number won the European International Lottery prize. Reply with your full name, bank details, and address to claim payout immediately."
"Quarterly Financial Review Deck","Please find attached the Q3 financial slides for tomorrow morning's executive board review. Let me know if you need any adjustments before 5 PM."
"Exclusive 80% Off Clearance Sale Ends Tonight!","Don't miss our biggest flash sale! Buy designer watches, electronics and jewelry with free overnight delivery. Click here to shop now!"
"Doctor Appointment Reminder - Dr. Smith","This is a reminder for your upcoming routine physical appointment on Thursday at 10:00 AM. Please arrive 15 minutes early with your insurance card."
"Invoice #48291 Due Notice","Greetings, attached is invoice #48291 for cloud hosting services rendered in October. Payment is due in 30 days via standard wire transfer."
"Work from Home Opportunity: Earn $5000/week","No experience needed! Make guaranteed $5,000 to $8,000 weekly from your laptop. Wire registration fee of $99 to get your starter kit today."
"Security Code for Two-Factor Verification","Your one-time authentication passcode is 839201. It is valid for 10 minutes. Do not share this code with anyone."
"CONGRATULATIONS: Free Apple iPhone 15 Pro","You were chosen as our grand prize winner! Fill out this quick survey to claim your brand new iPhone 15 Pro with free shipping."
`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_bulk_test.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportResultsCsv = () => {
    if (!batchResponse?.results) return;

    const headers = ['Index', 'Subject', 'Preview', 'Classification', 'Confidence', 'Risk_Level', 'Triggers'];
    const rows = batchResponse.results.map((r) => [
      r.index,
      `"${(r.subject || '').replace(/"/g, '""')}"`,
      `"${(r.preview || '').replace(/"/g, '""')}"`,
      r.classification,
      `${r.confidence}%`,
      r.risk_level,
      `"${(r.suspicious_keywords || []).join('; ').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `emailguard_predictions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & searched results
  const filteredResults = (batchResponse?.results || []).filter((r) => {
    if (filterType === 'spam' && !r.is_spam) return false;
    if (filterType === 'ham' && r.is_spam) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSubj = r.subject.toLowerCase().includes(q);
      const matchPrev = r.preview.toLowerCase().includes(q);
      const matchTrig = r.suspicious_keywords.some((k) => k.toLowerCase().includes(q));
      return matchSubj || matchPrev || matchTrig;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;
  const paginatedResults = filteredResults.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Bulk Email Dataset Detection
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Process multiple emails from CSV exports with auto-column mapping and export classified results.
          </p>
        </div>
        <button
          onClick={handleDownloadSampleCsv}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 shadow-2xs transition-colors self-start whitespace-nowrap"
        >
          <FileDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* Upload Dropzone Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".csv,.txt"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
            {file ? file.name : 'Click to select or drag and drop your CSV dataset'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {file 
              ? `${(file.size / 1024).toFixed(1)} KB · Ready to analyze`
              : 'Supports standard CSV with text, message, body, or subject headers (up to 16MB)'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-slate-500">
            {file && <span>Selected: <strong className="text-slate-800 dark:text-slate-200">{file.name}</strong></span>}
          </div>
          <button
            onClick={handleProcessCsv}
            disabled={!file || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Processing Batch...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Classify CSV Records</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Batch Results Section */}
      {batchResponse && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Processed Records</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                {batchResponse.total_processed}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Spam Detected</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-red-600 dark:text-red-400 mt-1">
                {batchResponse.spam_count}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Legitimate (Ham)</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
                {batchResponse.ham_count}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Spam Percentage</span>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
                {batchResponse.spam_percentage}%
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Table Controls */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <button
                  onClick={() => { setFilterType('all'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filterType === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({batchResponse.total_processed})
                </button>
                <button
                  onClick={() => { setFilterType('spam'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filterType === 'spam'
                      ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Spam ({batchResponse.spam_count})
                </button>
                <button
                  onClick={() => { setFilterType('ham'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    filterType === 'ham'
                      ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Ham ({batchResponse.ham_count})
                </button>
              </div>

              {/* Search & Export */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    placeholder="Search records or triggers..."
                    className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleExportResultsCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Subject & Preview</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4 text-right">Confidence</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4">Detected Triggers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedResults.length > 0 ? (
                    paginatedResults.map((r) => {
                      const isSpamRecord = r.is_spam;
                      return (
                        <tr key={r.index} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 text-center font-mono text-slate-400">
                            {r.index}
                          </td>
                          <td className="py-3 px-4 max-w-[320px]">
                            {r.subject && (
                              <div className="font-semibold text-slate-900 dark:text-white truncate">
                                {r.subject}
                              </div>
                            )}
                            <div className="text-slate-500 dark:text-slate-400 line-clamp-1">
                              {r.preview}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              isSpamRecord ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {isSpamRecord ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                              <span>{r.classification}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {r.confidence.toFixed(1)}%
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="text-slate-600 dark:text-slate-300">
                              {r.risk_level}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-[200px]">
                            {r.suspicious_keywords && r.suspicious_keywords.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {r.suspicious_keywords.slice(0, 2).map((k, i) => (
                                  <span key={i} className="text-[10px] bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 px-1.5 py-0.5 rounded-xs">
                                    {k}
                                  </span>
                                ))}
                                {r.suspicious_keywords.length > 2 && (
                                  <span className="text-[10px] text-slate-400">
                                    +{r.suspicious_keywords.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No records match the current filter or search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredResults.length)} of {filteredResults.length} records
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-mono tabular-nums">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
