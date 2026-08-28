import { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  RefreshCw,
  Clock,
  CheckCircle,
  Filter,
  ShoppingCart,
  CreditCard,
  XCircle,
  Zap,
} from 'lucide-react';
import * as dashboardService from '../services/dashboardService';

const RiskMonitoringDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentRiskEvents, setRecentRiskEvents] = useState([]);
  const [highRiskEvents, setHighRiskEvents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('');

  // Load Risk Dashboard Data
  const loadRiskData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setRefreshing(true);

      const params = {};
      if (selectedEventType) params.eventType = selectedEventType;
      if (selectedRiskLevel) params.riskLevel = selectedRiskLevel;

      const [statsRes, recentRes, highRiskRes] = await Promise.allSettled([
        dashboardService.fetchRiskStats(),
        dashboardService.fetchRiskEvents(params),
        dashboardService.fetchHighRiskEvents(selectedEventType ? { eventType: selectedEventType } : {}),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (recentRes.status === 'fulfilled') setRecentRiskEvents(recentRes.value.data?.data || []);
      if (highRiskRes.status === 'fulfilled') setHighRiskEvents(highRiskRes.value.data?.data || []);
    } catch (error) {
      console.error('Failed to load risk dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedEventType, selectedRiskLevel]);

  useEffect(() => {
    loadRiskData();
  }, [loadRiskData]);

  // Real-time auto-refresh timer (5s interval)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadRiskData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadRiskData]);

  // Handle Risk Event Status Toggle (e.g. OPEN -> REVIEWED -> RESOLVED)
  const handleStatusChange = async (eventId, currentStatus) => {
    const nextStatus = currentStatus === 'OPEN' ? 'REVIEWED' : currentStatus === 'REVIEWED' ? 'RESOLVED' : 'OPEN';
    try {
      await dashboardService.updateRiskEventStatus(eventId, nextStatus);
      loadRiskData(true);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Helper for Risk Level Badge
  const getRiskLevelBadge = (level) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-300 font-semibold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-medium';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-medium';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Helper for Event Type Badge
  const getEventTypeBadge = (type) => {
    switch (type) {
      case 'CART_ABANDONED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'PAYMENT_FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'ORDER_CANCELLED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const leakage = stats?.revenueLeakageSummary || {
    abandonedCartValue: 0,
    failedPaymentValue: 0,
    cancelledOrderValue: 0,
    totalRevenueLeakage: 0,
  };

  const totalLeakage = leakage.totalRevenueLeakage || 1;
  const abandonedPct = Math.round((leakage.abandonedCartValue / totalLeakage) * 100) || 0;
  const failedPct = Math.round((leakage.failedPaymentValue / totalLeakage) * 100) || 0;
  const cancelledPct = Math.round((leakage.cancelledOrderValue / totalLeakage) * 100) || 0;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Action Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center">
                <ShieldAlert className="mr-2 text-rose-600" size={32} /> Risk Monitoring Dashboard
              </h1>
              <span className="flex items-center text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping mr-1.5"></span>
                Live Detection Active
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Real-time revenue risk scoring, leakage tracking, and automated loss prevention telemetry.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
              />
              <span>Auto-refresh (5s)</span>
            </label>

            <button
              onClick={() => loadRiskData()}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Now
            </button>
          </div>
        </div>

        {/* Section 1: Risk Summary Cards (4 Main Metric Cards) */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Zap className="mr-2 text-brand-600" size={20} /> Risk Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Total Risk Events */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Risk Events</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldAlert size={22} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.totalRiskEvents || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Detections recorded</p>
            </div>

            {/* Total Risk Amount */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Risk Amount</span>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <DollarSign size={22} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? (
                  <span className="animate-pulse text-slate-300">...</span>
                ) : (
                  `$${(stats?.totalRiskAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                )}
              </p>
              <p className="text-[11px] text-rose-500 font-semibold mt-1">Cumulative value at risk</p>
            </div>

            {/* High Risk Events */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Risk Events</span>
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <AlertTriangle size={22} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.highRiskEvents || 0}
              </p>
              <p className="text-[11px] text-orange-600 font-semibold mt-1">Score: 66 - 85</p>
            </div>

            {/* Critical Risk Events */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Risk Events</span>
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <XCircle size={22} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.criticalRiskEvents || 0}
              </p>
              <p className="text-[11px] text-red-600 font-extrabold mt-1">Score: 86 - 100</p>
            </div>

          </div>
        </div>

        {/* Section 2: Revenue Leakage Report */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <TrendingDown className="mr-2 text-rose-600" size={22} /> Revenue Leakage Report
              </h2>
              <p className="text-xs text-slate-500">
                Monetary impact analysis across cart abandonment, failed payments, and order cancellations
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Total Leakage Impact</span>
              <span className="text-2xl font-black text-slate-900">
                ${leakage.totalRevenueLeakage.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Abandoned Cart Value */}
            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-indigo-700 flex items-center">
                  <ShoppingCart size={16} className="mr-1.5" /> Cart Abandonment
                </span>
                <span className="text-xs font-extrabold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                  {abandonedPct}%
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-2">
                ${leakage.abandonedCartValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="w-full bg-indigo-200/60 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${abandonedPct}%` }}></div>
              </div>
            </div>

            {/* Failed Payment Value */}
            <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-red-700 flex items-center">
                  <CreditCard size={16} className="mr-1.5" /> Failed Payments
                </span>
                <span className="text-xs font-extrabold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                  {failedPct}%
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-2">
                ${leakage.failedPaymentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="w-full bg-red-200/60 rounded-full h-2 overflow-hidden">
                <div className="bg-red-600 h-2 rounded-full transition-all duration-500" style={{ width: `${failedPct}%` }}></div>
              </div>
            </div>

            {/* Cancelled Order Value */}
            <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-amber-700 flex items-center">
                  <XCircle size={16} className="mr-1.5" /> Cancelled Orders
                </span>
                <span className="text-xs font-extrabold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  {cancelledPct}%
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-2">
                ${leakage.cancelledOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                <div className="bg-amber-600 h-2 rounded-full transition-all duration-500" style={{ width: `${cancelledPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout for High Risk Events & Recent Detections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          
          {/* Section 3: High Risk Events */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <AlertTriangle size={18} className="mr-2 text-rose-600" /> High & Critical Risk Events
                </h2>
                <p className="text-xs text-slate-500">Score &ge; 66 requiring recovery intervention</p>
              </div>
              <span className="text-xs font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                {highRiskEvents.length} Action Needed
              </span>
            </div>

            {loading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : highRiskEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400" />
                <p className="text-sm font-medium text-slate-600">No critical risk events pending!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {highRiskEvents.map((evt) => (
                  <div
                    key={evt._id}
                    className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 transition flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getRiskLevelBadge(evt.riskLevel)}`}>
                        {evt.riskLevel || 'HIGH'} ({evt.riskScore})
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        ${(evt.riskAmount || 0).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium line-clamp-2">
                      {evt.riskReason || `${evt.eventType} detected`}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>User: {evt.userId?.email || 'Guest'}</span>
                      <button
                        onClick={() => handleStatusChange(evt._id, evt.status)}
                        className="text-[10px] font-bold text-brand-600 hover:text-brand-800 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200"
                      >
                        Status: {evt.status} &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Recent Risk Detections Feed */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Clock size={18} className="mr-2 text-brand-600" /> Recent Risk Detections
                </h2>
                <p className="text-xs text-slate-500">Live stream of detected risk incidents</p>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center space-x-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Types</option>
                  <option value="CART_ABANDONED">Cart Abandoned</option>
                  <option value="PAYMENT_FAILED">Payment Failed</option>
                  <option value="ORDER_CANCELLED">Order Cancelled</option>
                </select>

                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Levels</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 py-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : recentRiskEvents.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <ShieldAlert size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No risk events match current filters</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {recentRiskEvents.map((evt) => (
                  <div
                    key={evt._id}
                    className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 border border-slate-100 transition text-xs flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${getEventTypeBadge(evt.eventType)}`}>
                          {evt.eventType}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold border ${getRiskLevelBadge(evt.riskLevel)}`}>
                          {evt.riskLevel || 'LOW'} (Score: {evt.riskScore})
                        </span>
                      </div>

                      <span className="font-extrabold text-sm text-slate-900">
                        ${(evt.riskAmount || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Risk Reason Display */}
                    <p className="text-slate-800 font-semibold bg-white p-2.5 rounded-xl border border-slate-200/70">
                      {evt.riskReason}
                    </p>

                    {/* Detection Time & Controls */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {new Date(evt.detectedAt).toLocaleString()}
                      </span>

                      <button
                        onClick={() => handleStatusChange(evt._id, evt.status)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition ${
                          evt.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : evt.status === 'REVIEWED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        Status: {evt.status}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default RiskMonitoringDashboard;
