/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Overview } from './components/Overview';
import { SpamChecker } from './components/SpamChecker';
import { BulkDetection } from './components/BulkDetection';
import { DetectionHistory } from './components/DetectionHistory';
import { Analytics } from './components/Analytics';
import { ModelInformation } from './components/ModelInformation';
import { DocumentationModal } from './components/DocumentationModal';
import { 
  ActiveTab, 
  DashboardData, 
  ModelMetadata, 
  SampleEmail, 
  HistoryRecord 
} from './types';
import { 
  fetchDashboardData, 
  fetchModelMetadata, 
  fetchSampleEmails, 
  checkBackendHealth 
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [modelMetadata, setModelMetadata] = useState<ModelMetadata | null>(null);
  const [sampleEmails, setSampleEmails] = useState<SampleEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [backendStatus, setBackendStatus] = useState<string>('checking');

  const refreshDashboard = async () => {
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.warn('Dashboard fetch warning:', err);
    }
  };

  useEffect(() => {
    const initializeAppData = async () => {
      setLoading(true);
      try {
        const [health, dash, meta, samples] = await Promise.allSettled([
          checkBackendHealth(),
          fetchDashboardData(),
          fetchModelMetadata(),
          fetchSampleEmails(),
        ]);

        if (health.status === 'fulfilled') {
          setBackendStatus(health.value.status);
        }
        if (dash.status === 'fulfilled') {
          setDashboardData(dash.value);
        }
        if (meta.status === 'fulfilled') {
          setModelMetadata(meta.value);
        }
        if (samples.status === 'fulfilled') {
          setSampleEmails(samples.value);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAppData();
  }, []);

  const handleSelectRecordFromOverview = (rec: HistoryRecord) => {
    setSelectedRecord(rec);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-500 selection:text-white">
      {/* Top Bar Contract (Wordmark - Links - Primary Action) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickScan={() => setActiveTab('checker')}
        onOpenDocs={() => setShowDocsModal(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <Overview
            dashboardData={dashboardData}
            modelMetadata={modelMetadata}
            loading={loading}
            setActiveTab={setActiveTab}
            onSelectRecord={handleSelectRecordFromOverview}
          />
        )}

        {activeTab === 'checker' && (
          <SpamChecker
            sampleEmails={sampleEmails}
            onAnalysisComplete={refreshDashboard}
          />
        )}

        {activeTab === 'bulk' && (
          <BulkDetection
            onBatchProcessed={refreshDashboard}
          />
        )}

        {activeTab === 'history' && (
          <DetectionHistory
            onHistoryUpdated={refreshDashboard}
            selectedRecordFromParent={selectedRecord}
            onClearSelectedRecord={() => setSelectedRecord(null)}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            dashboardData={dashboardData}
            modelMetadata={modelMetadata}
          />
        )}

        {activeTab === 'model-info' && (
          <ModelInformation
            metadata={modelMetadata}
            loading={loading}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-200">EmailGuard</span>
            <span>·</span>
            <span>AI-Powered Email Spam Detection System</span>
            <span>·</span>
            <span className="font-mono text-[11px]">TF-IDF & LinearSVC Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDocsModal(true)}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              API Reference
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('model-info')}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Model Metrics
            </button>
            <span>·</span>
            <span>SQLite Audit Storage</span>
          </div>
        </div>
      </footer>

      {/* Documentation & Architecture Modal */}
      <DocumentationModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
      />
    </div>
  );
}
