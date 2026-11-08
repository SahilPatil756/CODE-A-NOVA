/**
 * EmailGuard - Analytics & Visual Insights Component
 * Interactive charts using Recharts for distributions, trends, risk tiers, and feature weights.
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  CartesianGrid, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, ShieldAlert, Cpu, Sparkles } from 'lucide-react';
import { DashboardData, ModelMetadata } from '../types';

interface AnalyticsProps {
  dashboardData: DashboardData | null;
  modelMetadata: ModelMetadata | null;
}

const COLORS = {
  ham: '#10B981',      // Emerald
  spam: '#EF4444',     // Crimson Red
  blue: '#3B82F6',     // Blue
  amber: '#F59E0B',    // Amber
  indigo: '#6366F1',   // Indigo
};

export const Analytics: React.FC<AnalyticsProps> = ({ dashboardData, modelMetadata }) => {
  const total = dashboardData?.total_analyzed || 0;
  const spam = dashboardData?.total_spam || 0;
  const ham = dashboardData?.total_legitimate || 0;

  // Donut data
  const pieData = [
    { name: 'Legitimate (Ham)', value: ham, color: COLORS.ham },
    { name: 'Spam Intercepted', value: spam, color: COLORS.spam },
  ];

  // Daily Trends data
  const trendData = dashboardData?.trends && dashboardData.trends.length > 0 
    ? dashboardData.trends 
    : [
        { date: 'Day 1', spam: 1, ham: 2, total: 3 },
        { date: 'Day 2', spam: 2, ham: 3, total: 5 },
        { date: 'Day 3', spam: 1, ham: 4, total: 5 },
        { date: 'Day 4', spam: 3, ham: 4, total: 7 },
        { date: 'Day 5', spam: 2, ham: 5, total: 7 },
        { date: 'Today', spam: spam, ham: ham, total: total },
      ];

  // Risk distribution data
  const riskDist = dashboardData?.risk_distribution || {};
  const riskData = [
    { name: 'Minimal Risk', count: riskDist['Minimal Risk'] || 0, color: '#10B981' },
    { name: 'Low Risk', count: riskDist['Low Risk'] || 0, color: '#3B82F6' },
    { name: 'Moderate Risk', count: riskDist['Moderate Risk'] || 0, color: '#F59E0B' },
    { name: 'High Risk', count: riskDist['High Risk'] || 0, color: '#F97316' },
    { name: 'Severe Risk', count: riskDist['Severe Risk'] || 0, color: '#EF4444' },
  ];

  // Top Spam vocabulary weights
  const topKeywords = modelMetadata?.top_spam_keywords || [
    { word: 'claim', weight: 4.82 },
    { word: 'prize', weight: 4.41 },
    { word: 'won', weight: 3.95 },
    { word: 'cash', weight: 3.78 },
    { word: 'urgent', weight: 3.52 },
    { word: 'reply', weight: 3.12 },
    { word: 'free', weight: 3.01 },
    { word: 'txt', weight: 2.89 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Detection Analytics & Statistical Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Quantitative telemetry covering spam distribution, temporal trends, risk stratification, and NLP feature importance.
        </p>
      </div>

      {/* Top 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Donut Distribution */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-blue-500" />
                <span>Spam vs Ham Ratio</span>
              </h2>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {total} Total Emails
              </span>
            </div>
            
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <div className="text-slate-500 dark:text-slate-400">Legitimate</div>
                <div className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                  {ham} ({total > 0 ? ((ham / total) * 100).toFixed(1) : 0}%)
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <div>
                <div className="text-slate-500 dark:text-slate-400">Spam Intercepted</div>
                <div className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                  {spam} ({total > 0 ? ((spam / total) * 100).toFixed(1) : 0}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Temporal Trends */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <span>Detection Volume Over Time</span>
              </h2>
              <span className="text-xs text-slate-500">7-Day Trajectory</span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorSpam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHam" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="ham" name="Legitimate" stroke="#10B981" fillOpacity={1} fill="url(#colorHam)" />
                  <Area type="monotone" dataKey="spam" name="Spam" stroke="#EF4444" fillOpacity={1} fill="url(#colorSpam)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Legitimate Traffic</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Spam Influx</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bottom 2 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 3: Risk Stratification */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>Risk Stratification Distribution</span>
            </h2>
            <span className="text-xs text-slate-500">All Assessed Records</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Evaluated Emails" radius={[4, 4, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top Spam Vocabulary Weights */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-violet-500" />
              <span>Informative Spam Keywords (TF-IDF Weight)</span>
            </h2>
            <span className="text-xs text-slate-500">Model Feature Coefficients</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topKeywords.slice(0, 8)} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="word" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="weight" name="TF-IDF Weight" fill="#6366F1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
