/**
 * EmailGuard - Detection History Component
 * SQLite audit log view, real-time search, filter, item modal, and deletion.
 */

import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, 
  Trash2, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Eye, 
  X, 
  RefreshCw, 
  Calendar,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { HistoryRecord } from '../types';
import { fetchPredictionHistory, deleteHistoryRecord, clearAllHistoryRecords } from '../services/api';

interface DetectionHistoryProps {
  onHistoryUpdated?: () => void;
  selectedRecordFromParent?: HistoryRecord | null;
  onClearSelectedRecord?: () => void;
}

export const DetectionHistory: React.FC<DetectionHistoryProps> = ({
  onHistoryUpdated,
  selectedRecordFromParent,
  onClearSelectedRecord,
}) => {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState<'all' | 'spam' | 'ham'>('all');
  const [search, setSearch] = useState('');
  const [activeRecord, setActiveRecord] = useState<HistoryRecord | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 15;

  useEffect(() => {
    if (selectedRecordFromParent) {
      setActiveRecord(selectedRecordFromParent);
    }
  }, [selectedRecordFromParent]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await fetchPredictionHistory({
        limit,
        offset: (page - 1) * limit,
        filter: filterClass === 'all' ? undefined : (filterClass === 'spam' ? 'spam' : 'not spam'),
        search: search.trim() || undefined,
      });
      setRecords(data.records);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page, filterClass]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadHistory();
  };

  const handleDeleteItem = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteHistoryRecord(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (activeRecord?.id === id) setActiveRecord(null);
      if (onHistoryUpdated) onHistoryUpdated();
    } catch (err) {
      console.error('Error deleting record:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllHistoryRecords();
      setRecords([]);
      setTotal(0);
      setActiveRecord(null);
      setShowClearConfirm(false);
      if (onHistoryUpdated) onHistoryUpdated();
    } catch (err) {
      console.error('Error clearing history:', err);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Prediction History & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Persisted SQLite log of all evaluated emails with confidence scores, timestamps, and triggered signals.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => loadHistory()}
            title="Refresh history"
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {records.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 border border-red-200 dark:border-red-900 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start">
          <button
            onClick={() => { setFilterClass('all'); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterClass === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Logs
          </button>
          <button
            onClick={() => { setFilterClass('spam'); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterClass === 'spam'
                ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Spam Only
          </button>
          <button
            onClick={() => { setFilterClass('ham'); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filterClass === 'ham'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Legitimate Only
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, content, triggers..."
            className="w-full text-xs pl-8 pr-16 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded text-[11px] font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading historical logs...</span>
          </div>
        ) : records.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">ID</th>
                    <th className="py-3 px-4">Subject & Excerpt</th>
                    <th className="py-3 px-4">Classification</th>
                    <th className="py-3 px-4 text-right">Confidence</th>
                    <th className="py-3 px-4">Risk Level</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                    <th className="py-3 px-4 text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {records.map((rec) => {
                    const isSpam = rec.classification === 'Spam';
                    return (
                      <tr
                        key={rec.id}
                        onClick={() => setActiveRecord(rec)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          #{rec.id}
                        </td>
                        <td className="py-3 px-4 max-w-[280px]">
                          <div className="font-semibold text-slate-900 dark:text-white truncate">
                            {rec.subject || <span className="text-slate-400 italic">No Subject</span>}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 truncate">
                            {rec.preview}
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 font-semibold ${
                            isSpam ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isSpam ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            <span>{rec.classification}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {rec.confidence.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="text-slate-600 dark:text-slate-300">
                            {rec.risk_level}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 font-mono tabular-nums whitespace-nowrap">
                          {rec.timestamp}
                        </td>
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setActiveRecord(rec)}
                              title="View details"
                              className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteItem(rec.id, e)}
                              title="Delete record"
                              className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} records
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Previous
                  </button>
                  <span className="px-2 font-mono tabular-nums">
                    {page} / {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
            No prediction logs found matching your criteria.
          </div>
        )}
      </div>

      {/* Record Details Modal */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-slate-400">Record #{activeRecord.id}</span>
                <span className="text-slate-300">·</span>
                <span className={`text-xs font-semibold ${
                  activeRecord.classification === 'Spam' ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  {activeRecord.classification} ({activeRecord.confidence}%)
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveRecord(null);
                  if (onClearSelectedRecord) onClearSelectedRecord();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Subject</label>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white">
                  {activeRecord.subject || <span className="text-slate-400 italic">No Subject provided</span>}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Content Excerpt</label>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {activeRecord.preview}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Risk Tier</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{activeRecord.risk_level}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block mb-0.5">Logged At</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{activeRecord.timestamp}</span>
                </div>
              </div>

              {activeRecord.suspicious_keywords && activeRecord.suspicious_keywords.length > 0 && (
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Detected Trigger Keywords</label>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRecord.suspicious_keywords.map((k, idx) => (
                      <span key={idx} className="bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 px-2 py-0.5 rounded-md">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => {
                  setActiveRecord(null);
                  if (onClearSelectedRecord) onClearSelectedRecord();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Clear All History?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                This will permanently delete all {total} stored prediction records from the SQLite database. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
