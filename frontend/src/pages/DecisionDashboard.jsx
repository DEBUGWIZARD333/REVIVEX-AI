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
  ChevronRight,
  X,
  FileText,
  Activity,
  Layers,
} from 'lucide-react';
import * as dashboardService from '../services/dashboardService';

const DecisionDashboard = () => {
  const [stats, setStats] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [testReport, setTestReport] = useState(null);
  const [testingRunning, setTestingRunning] = useState(false);

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

  const handleRunAccuracyTest = async () => {
    try {
      setTestingRunning(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/decisions/validate-accuracy', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setTestReport(data.data);
        loadDecisionData(true);
      }
    } catch (err) {
      console.error('Decision accuracy test failed:', err);
    } finally {
      setTestingRunning(false);
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center">
                <BrainCircuit className="mr-2 text-purple-600" size={32} /> Decision AI Dashboard
              </h1>
              <span className="flex items-center text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping mr-1.5"></span>
                LangGraph Decision Engine Active
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Analyzes risk score, customer LTV history, and cart value to select explainable recovery strategies.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunAccuracyTest}
              disabled={testingRunning}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              <Zap size={14} className={`mr-1.5 ${testingRunning ? 'animate-spin' : ''}`} />
              {testingRunning ? 'Testing AI Graph...' : 'Run Decision AI Test'}
            </button>

            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
              <span>Auto-refresh (5s)</span>
            </label>

            <button
              onClick={() => loadDecisionData()}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Test Report Feedback Banner */}
        {testReport && (
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-purple-900 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 text-purple-300 text-xs font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Decision AI Explainability & Strategy Validation Report</span>
              </div>
              <h3 className="text-xl font-bold">Validated {testReport.totalProfiles} Synthetic Customer Profiles</h3>
              <p className="text-xs text-purple-200 mt-1">
                Verified risk score analysis, customer history scoring, cart value weighting, and explainable decision reasoning strings.
              </p>
            </div>

            <div className="flex items-center space-x-4 bg-white/10 p-4 rounded-2xl border border-white/10 flex-shrink-0">
              <div className="text-center">
                <span className="text-[10px] text-purple-200 uppercase font-bold">Accuracy Score</span>
                <div className="text-3xl font-extrabold text-emerald-400">{testReport.accuracyRate}%</div>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="text-center">
                <span className="text-[10px] text-purple-200 uppercase font-bold">Passed / Total</span>
                <div className="text-3xl font-extrabold text-white">{testReport.passedCount}/{testReport.totalProfiles}</div>
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Decision Strategy Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Reminders</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Mail size={20} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{loading ? '...' : byType.REMINDER}</p>
            <p className="text-[11px] text-slate-400 mt-1">REMINDER Strategy</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Discount Coupons</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Ticket size={20} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{loading ? '...' : byType.COUPON}</p>
            <p className="text-[11px] text-slate-400 mt-1">COUPON Strategy</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1-Click Retry Links</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <CreditCard size={20} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{loading ? '...' : byType.RETRY_PAYMENT}</p>
            <p className="text-[11px] text-slate-400 mt-1">RETRY_PAYMENT Strategy</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">VIP Escalations</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertOctagon size={20} />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{loading ? '...' : byType.ESCALATION}</p>
            <p className="text-[11px] text-slate-400 mt-1">ESCALATION Strategy</p>
          </div>

        </div>

        {/* Section 2: Decision Log Stream & Explainability Details */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center">
                <BrainCircuit size={20} className="mr-2 text-purple-600" /> Executed Decisions & Explainable Reasoning
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                LangGraph Decision AI strategy outcomes with factor analysis details.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center space-x-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedDecisionType}
                onChange={(e) => setSelectedDecisionType(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                <option value="">All Strategies</option>
                <option value="REMINDER">Reminder</option>
                <option value="COUPON">Coupon</option>
                <option value="RETRY_PAYMENT">Retry Payment</option>
                <option value="ESCALATION">Escalation</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : decisions.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <BrainCircuit size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-600">No decision events logged yet</p>
              <p className="text-xs mt-1">Run Decision AI Test to evaluate mock customer profiles.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Strategy Selected</th>
                    <th className="px-6 py-4">Confidence</th>
                    <th className="px-6 py-4">Cart Value</th>
                    <th className="px-6 py-4">Risk Reason / Trigger</th>
                    <th className="px-6 py-4 text-right">Explainability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {decisions.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => setSelectedDecision(item)}
                      className="hover:bg-purple-50/50 cursor-pointer transition"
                    >
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs border font-extrabold ${getDecisionBadge(item.decisionType)}`}>
                          {item.decisionType}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                          {(item.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                        ${(item.cartValue || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                        {item.riskReason || item.actionTaken}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDecision(item);
                          }}
                          className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs transition inline-flex items-center space-x-1"
                        >
                          <span>Explain Reasoning</span>
                          <ChevronRight size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Decision Explainability Drawer / Modal */}
      {selectedDecision && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  Decision ID: {selectedDecision._id}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2 flex items-center space-x-2">
                  <span>Strategy: {selectedDecision.decisionType}</span>
                </h3>
              </div>

              <button
                onClick={() => setSelectedDecision(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Factors Breakdown Card */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Cart Value Evaluated:</span>
                  <span className="block font-extrabold text-slate-900 text-base mt-0.5">
                    ${(selectedDecision.cartValue || 0).toFixed(2)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Confidence Score:</span>
                  <span className="block font-extrabold text-purple-600 text-base mt-0.5">
                    {((selectedDecision.confidenceScore || 0.85) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Transparent Reasoning Box */}
              <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-5 space-y-2">
                <h4 className="text-xs font-extrabold text-purple-900 uppercase tracking-wider flex items-center space-x-1.5">
                  <BrainCircuit size={16} className="text-purple-600" />
                  <span>Explainable AI Decision Reasoning</span>
                </h4>
                <p className="text-xs text-purple-950 font-medium leading-relaxed">
                  {selectedDecision.actionTaken || selectedDecision.riskReason}
                </p>
              </div>

              {/* Customer History Analysis Factors */}
              {selectedDecision.customerHistory && Object.keys(selectedDecision.customerHistory).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Customer History Factors Analyzed
                  </h4>
                  <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-xs space-y-1">
                    <pre className="overflow-x-auto">
                      {JSON.stringify(selectedDecision.customerHistory, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setSelectedDecision(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DecisionDashboard;
