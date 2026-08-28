import { useState, useEffect, useCallback } from 'react';
import {
  BrainCircuit,
  Ticket,
  CreditCard,
  AlertOctagon,
  Mail,
  RefreshCw,
  Zap,
  CheckCircle2,
  Filter,
  User,
  ShieldAlert,
  Percent,
} from 'lucide-react';
import * as dashboardService from '../services/dashboardService';

const DecisionDashboard = () => {
  const [stats, setStats] = useState(null);
  const [decisions, setDecisions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedDecisionType, setSelectedDecisionType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch Decision Dashboard Data
  const loadDecisionData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setRefreshing(true);

      const params = {};
      if (selectedDecisionType) params.decisionType = selectedDecisionType;
      if (selectedStatus) params.status = selectedStatus;

      const [statsRes, feedRes] = await Promise.allSettled([
        dashboardService.fetchDecisionStats(),
        dashboardService.fetchDecisionsFeed(params),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data?.data || statsRes.value.data);
      if (feedRes.status === 'fulfilled') setDecisions(feedRes.value.data?.data || []);
    } catch (error) {
      console.error('Failed to load decision dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDecisionType, selectedStatus]);

  useEffect(() => {
    loadDecisionData();
  }, [loadDecisionData]);

  // Real-time auto-refresh timer (5s interval)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadDecisionData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadDecisionData]);

  // Decision Badge Styling Helper
  const getDecisionBadge = (type) => {
    switch (type) {
      case 'COUPON':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'RETRY_PAYMENT':
        return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'ESCALATION':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      case 'REMINDER':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  // Status Badge Styling Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'EXECUTED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROCESSING':
      case 'RECEIVED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const byType = stats?.decisionsByType || {
    COUPON: 0,
    RETRY_PAYMENT: 0,
    ESCALATION: 0,
    REMINDER: 0,
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center">
                <BrainCircuit className="mr-3 text-purple-600" size={32} /> Decision Agent Dashboard
              </h1>
              <span className="flex items-center text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping mr-1.5"></span>
                LangGraph AI Workflow Active
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Autonomous LangGraph AI decisioning, automated recovery action execution, and confidence scoring telemetry.
            </p>
          </div>

          {/* Action Bar */}
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
              onClick={() => loadDecisionData()}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Now
            </button>
          </div>
        </div>

        {/* Section 1: Summary Metric Cards (5 Required Cards) */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Zap className="mr-2 text-purple-600" size={20} /> Decision Telemetry & Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* 1. Total Decisions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Decisions</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <BrainCircuit size={20} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.totalDecisions || 0}
              </p>
              <p className="text-[11px] text-purple-600 font-semibold mt-1">
                Success Rate: {stats?.executionSuccessRate || 100}%
              </p>
            </div>

            {/* 2. Coupons Issued */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Coupons Issued</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Ticket size={20} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : byType.COUPON || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Discounts generated</p>
            </div>

            {/* 3. Payment Retries */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Retries</span>
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : byType.RETRY_PAYMENT || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">1-Click retry flows</p>
            </div>

            {/* 4. Escalations */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escalations</span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertOctagon size={20} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : byType.ESCALATION || 0}
              </p>
              <p className="text-[11px] text-rose-500 font-semibold mt-1">VIP Priority Recovery</p>
            </div>

            {/* 5. Reminders Sent */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reminders Sent</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Mail size={20} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : byType.REMINDER || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Email / SMS reminders</p>
            </div>

          </div>
        </div>

        {/* Section 2: Main Decision Stream Table (Required Display Fields: Customer, Risk Reason, Decision, Confidence Score, Action Status) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <BrainCircuit size={22} className="mr-2 text-purple-600" /> Decision Execution Stream
              </h2>
              <p className="text-xs text-slate-500">
                Real-time feed of LangGraph AI decisions and executed recovery actions
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              
              {/* Decision Type Filter */}
              <select
                value={selectedDecisionType}
                onChange={(e) => setSelectedDecisionType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Decisions</option>
                <option value="REMINDER">Reminder</option>
                <option value="COUPON">Coupon</option>
                <option value="RETRY_PAYMENT">Retry Payment</option>
                <option value="ESCALATION">Escalation</option>
              </select>

              {/* Action Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Statuses</option>
                <option value="EXECUTED">Executed</option>
                <option value="COMPLETED">Completed</option>
                <option value="PROCESSING">Processing</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 py-8">
              {[1, 2, 3, 4, 5].map((n) => (
                <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : decisions.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <BrainCircuit size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-base font-semibold text-slate-700">No decisions recorded yet</p>
              <p className="text-xs text-slate-400 mt-1">Decision agent will automatically populate actions when risk events trigger.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 px-3">Customer</th>
                    <th className="pb-3 px-3">Risk Reason</th>
                    <th className="pb-3 px-3">Decision</th>
                    <th className="pb-3 px-3 text-center">Confidence Score</th>
                    <th className="pb-3 px-3 text-right">Action Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {decisions.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition">
                      
                      {/* 1. Customer */}
                      <td className="py-4 px-3 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                            <User size={14} />
                          </div>
                          <div>
                            <span className="block text-slate-900 font-bold">
                              {item.userId?.name || item.userId?.email || 'Guest Customer'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.userId?.email || 'guest@session'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Risk Reason */}
                      <td className="py-4 px-3 text-slate-600 max-w-xs">
                        <p className="font-medium text-slate-700 line-clamp-2">
                          {item.riskReason || 'High risk event trigger'}
                        </p>
                        {item.cartValue > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Cart Value: ${item.cartValue.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* 3. Decision Type */}
                      <td className="py-4 px-3">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getDecisionBadge(item.decisionType)}`}>
                          {item.decisionType}
                        </span>
                      </td>

                      {/* 4. Confidence Score */}
                      <td className="py-4 px-3 text-center">
                        <div className="inline-flex items-center space-x-1 font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                          <span>{((item.confidenceScore || 0.85) * 100).toFixed(0)}%</span>
                        </div>
                      </td>

                      {/* 5. Action Status */}
                      <td className="py-4 px-3 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadge(item.workflowStatus)}`}>
                          {item.workflowStatus}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default DecisionDashboard;
