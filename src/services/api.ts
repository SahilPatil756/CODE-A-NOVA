/**
 * EmailGuard - API Client Service
 */

import {
  PredictionResult,
  BulkPredictionResponse,
  DashboardData,
  HistoryRecord,
  ModelMetadata,
  SampleEmail,
} from '../types';

const BASE_URL = '/api';

export async function checkBackendHealth(): Promise<{ status: string; model_loaded: boolean; version: string }> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    return await res.json();
  } catch (err: any) {
    console.warn('[API] Health check failed:', err.message);
    return { status: 'offline', model_loaded: false, version: '1.0.0' };
  }
}

export async function analyzeEmail(subject: string, body: string): Promise<PredictionResult> {
  const res = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, body }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to analyze email content.');
  }
  return data;
}

export async function uploadBulkCsv(file: File): Promise<BulkPredictionResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/bulk-predict`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to process CSV file.');
  }
  return data;
}

export async function uploadBulkJson(records: Array<{ subject?: string; text: string }>): Promise<BulkPredictionResponse> {
  const res = await fetch(`${BASE_URL}/bulk-predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ records }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to process bulk records.');
  }
  return data;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const res = await fetch(`${BASE_URL}/dashboard`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch dashboard statistics.');
  }
  return data.data;
}

export async function fetchPredictionHistory(params?: {
  limit?: number;
  offset?: number;
  filter?: string;
  search?: string;
}): Promise<{ records: HistoryRecord[]; total: number; limit: number; offset: number }> {
  const query = new URLSearchParams();
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.offset) query.set('offset', String(params.offset));
  if (params?.filter && params.filter !== 'all') query.set('filter', params.filter);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${BASE_URL}/history?${query.toString()}`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch prediction history.');
  }
  return data.data;
}

export async function deleteHistoryRecord(id: number): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/history/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete record.');
  }
  return data.success;
}

export async function clearAllHistoryRecords(): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/history`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to clear history.');
  }
  return data.success;
}

export async function fetchModelMetadata(): Promise<ModelMetadata> {
  const res = await fetch(`${BASE_URL}/model-info`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch model information.');
  }
  return data.metadata;
}

export async function fetchSampleEmails(): Promise<SampleEmail[]> {
  const res = await fetch(`${BASE_URL}/sample-emails`);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch preset sample emails.');
  }
  return data.samples;
}
