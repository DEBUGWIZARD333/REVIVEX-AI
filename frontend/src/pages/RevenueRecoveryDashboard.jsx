import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  BrainCircuit,
  RefreshCw,
  Zap,
  Mail,
  Ticket,
  ShieldAlert,
  Send,
  PieChart as PieIcon,
  BarChart3,
  Percent,
} from 'lucide-react';
import * as dashboardService from '../services/dashboardService';

const RevenueRecoveryDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recoveryActions, setRecoveryActions] = useState([]);
  const [riskEvents, setRiskEvents] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState('actions');

  // Load Dashboard Data
  const loadDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setRefreshing(true);

      const [metricsRes, actionsRes, risksRes, couponsRes, emailsRes] = await Promise.allSettled([
        dashboardService.fetchRecoveryMetrics(),
        dashboardService.fetchRecoveryEventsFeed(),
        dashboardService.fetchRiskEvents({ limit: 10 }),
        dashboardService.fetchCouponsFeed(),
        dashboardService.fetchEmailLogsFeed(),
      ]);

      if (metricsRes.status === 'fulfilled') setMetrics(metricsRes.value.data?.data || metricsRes.value.data);
      if (actionsRes.status === 'fulfilled') setRecoveryActions(actionsRes.value.data?.data || []);
      if (risksRes.status === 'fulfilled') setRiskEvents(risksRes.value.data?.data || []);
      if (couponsRes.status === 'fulfilled') setCoupons(couponsRes.value.data?.data || []);
      if (emailsRes.status === 'fulfilled') setEmailLogs(emailsRes.value.data?.data || []);
    } catch (error) {
      console.error('Failed to load revenue recovery dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time 5-second polling interval
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboardData]);

  // Mock Decision Distribution Data for Pie Chart
  const decisionDistribution = [
    { name: 'Coupon Offer', count: 42, color: 'bg-emerald-500', barColor: '#10b981', percentage: 42 },
    { name: '1-Click Retry Link', count: 28, color: 'bg-indigo-500', barColor: '#6366f1', percentage: 28 },
    { name: 'VIP Alert Escalation', count: 18, color: 'bg-amber-500', barColor: '#f59e0b', percentage: 18 },
    { name: 'Email Reminder', count: 12, color: 'bg-purple-500', barColor: '#a855f7', percentage: 12 },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Refresh Control */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center">
                <TrendingUp className="mr-3 text-emerald-600" size={32} /> Recovery Dashboard
              </h1>
              <span className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
                Live Telemetry Active
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Autonomous AI recovery metrics, real-time risk telemetry, and agent decision analytics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <span>Auto-refresh (5s)</span>
            </label>

            <button
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Now
            </button>
          </div>
        </div>

        {/* SECTION 1: 6 Dashboard Cards Grid */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center">
            <Zap className="mr-2 text-emerald-600" size={16} /> Key Metrics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Card 1: Revenue At Risk */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revenue At Risk</span>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                    {loading ? <span className="animate-pulse text-slate-300">...</span> : `$${metrics?.revenueAtRisk || '0.00'}`}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
              </div>
              <div className="flex items-center text-xs text-amber-600 font-semibold bg-amber-50/50 px-2.5 py-1 rounded-lg w-fit">
                <AlertTriangle size={14} className="mr-1" />
                Targeted for Recovery
              </div>
            </div>

            {/* Card 2: Recovered Revenue */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recovered Revenue</span>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                    {loading ? <span className="animate-pulse text-slate-300">...</span> : `$${metrics?.recoveredRevenue || '0.00'}`}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp size={24} />
                </div>
              </div>
              <div className="flex items-center text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                <TrendingUp size={14} className="mr-1" />
                Recovered by AI Agent
              </div>
            </div>

            {/* Card 3: Failed Payments */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failed Payments</span>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                    {loading ? <span className="animate-pulse text-slate-300">...</span> : metrics?.failedPayments || 0}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
              </div>
              <div className="text-xs text-slate-500 font-medium">Payment gateway friction events</div>
            </div>

            {/* Card 4: Abandoned Carts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abandoned Carts</span>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                    {loading ? <span className="animate-pulse text-slate-300">...</span> : metrics?.abandonedCarts || 0}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <ShoppingCart size={24} />
                </div>
              </div>
              <div className="text-xs text-slate-500 font-medium">Checkout dropoffs detected</div>
            </div>

            {/* Card 5: Recovery Rate */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recovery Rate</span>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                    {loading ? <span className="animate-pulse text-slate-300">...</span> : `${metrics?.recoveryRate || 0}%`}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Percent size={24} />
                </div>
              </div>
              <div className="text-xs text-teal-600 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg w-fit">
                Success Efficiency Rate
              </div>
            </div>

            {/* Card 6: Agent Decisions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Agent Decisions</span>
                  <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                    {loading ? <span className="animate-pulse text-slate-300">...</span> : metrics?.agentDecisions || 0}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <BrainCircuit size={24} />
                </div>
              </div>
              <div className="text-xs text-cyan-600 font-semibold bg-cyan-50 px-2.5 py-1 rounded-lg w-fit">
                LangGraph Decision Engine
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: Dashboard Charts Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          
          {/* Recovery Trend Chart */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <BarChart3 className="mr-2 text-brand-600" size={20} /> Recovery Trend & Revenue Track
                </h3>
                <p className="text-xs text-slate-400">Comparing Revenue at Risk vs. Recovered Revenue over time</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Live Performance
              </span>
            </div>

            {/* Visual Simulated Bar/Trend Chart */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold border-b border-slate-100 pb-2">
                <span>Timeline Period</span>
                <span className="text-amber-600">Revenue at Risk</span>
                <span className="text-emerald-600">Recovered Revenue</span>
              </div>

              {[
                { day: 'Mon', risk: 850, recovered: 620 },
                { day: 'Tue', risk: 1200, recovered: 940 },
                { day: 'Wed', risk: 650, recovered: 510 },
                { day: 'Thu', risk: 1450, recovered: 1180 },
                { day: 'Fri', risk: 1900, recovered: 1650 },
                { day: 'Today', risk: metrics?.revenueAtRisk || 2200, recovered: metrics?.recoveredRevenue || 1850 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.day}</span>
                    <div className="space-x-3">
                      <span className="text-amber-600">${item.risk}</span>
                      <span className="text-emerald-600">${item.recovered}</span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      className="bg-amber-400 h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (item.risk / 2500) * 100)}%` }}
                    ></div>
                    <div
                      className="bg-emerald-500 h-full rounded-r-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (item.recovered / 2500) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Decision Distribution Pie Chart */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <PieIcon className="mr-2 text-indigo-600" size={20} /> Agent Decision Distribution
                </h3>
                <p className="text-xs text-slate-400">Strategy breakdown chosen by LangGraph Agent</p>
              </div>
            </div>

            <div className="space-y-5">
              {decisionDistribution.map((d, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${d.color}`}></span>
                      <span>{d.name}</span>
                    </div>
                    <span>{d.percentage}% ({d.count} decisions)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${d.color} rounded-full transition-all duration-500`}
                      style={{ width: `${d.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Primary Recovery Action:</span>
              <span className="font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Dynamic Coupon Offer (42%)
              </span>
            </div>
          </div>

        </div>

        {/* SECTION 3: Live Telemetry Feeds & Data Tables */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
          
          {/* Table Tabs */}
          <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-100 mb-6">
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'actions'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Send size={15} className="mr-2" /> 1. Recovery Actions ({recoveryActions.length})
            </button>

            <button
              onClick={() => setActiveTab('risks')}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'risks'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldAlert size={15} className="mr-2" /> 2. Recent Risk Events ({riskEvents.length})
            </button>

            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'coupons'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Ticket size={15} className="mr-2" /> 3. Coupon Usage ({coupons.length})
            </button>

            <button
              onClick={() => setActiveTab('emails')}
              className={`flex items-center px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                activeTab === 'emails'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Mail size={15} className="mr-2" /> 4. Email Deliveries ({emailLogs.length})
            </button>
          </div>

          {/* Table 1: Recovery Actions */}
          {activeTab === 'actions' && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">Executed Recovery Actions Feed</h3>
              {loading ? (
                <div className="space-y-3 py-6"><div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div></div>
              ) : recoveryActions.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No recovery actions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="pb-3 px-3">Action Type</th>
                        <th className="pb-3 px-3">Customer</th>
                        <th className="pb-3 px-3 text-right">Recovery Amount</th>
                        <th className="pb-3 px-3 text-center">Status</th>
                        <th className="pb-3 px-3 text-right">Executed At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recoveryActions.map((item) => (
                        <tr key={item._id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {item.actionType}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-slate-900">
                            {item.userId?.name || item.userId?.email || 'Guest Customer'}
                          </td>
                          <td className="py-3.5 px-3 text-right font-extrabold text-emerald-600">
                            ${(item.recoveryAmount || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right text-slate-400 font-mono">
                            {new Date(item.executedAt || item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Table 2: Recent Risk Events */}
          {activeTab === 'risks' && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">Recent Detected Risk Events</h3>
              {loading ? (
                <div className="space-y-3 py-6"><div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div></div>
              ) : riskEvents.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No risk events detected.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="pb-3 px-3">Event Type</th>
                        <th className="pb-3 px-3 text-center">Risk Score</th>
                        <th className="pb-3 px-3 text-center">Risk Level</th>
                        <th className="pb-3 px-3 text-right">Risk Amount</th>
                        <th className="pb-3 px-3 text-right">Detected At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {riskEvents.map((r) => (
                        <tr key={r._id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-3 font-bold text-slate-900">{r.eventType}</td>
                          <td className="py-3.5 px-3 text-center font-extrabold text-slate-800">{r.riskScore}</td>
                          <td className="py-3.5 px-3 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                              r.riskLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                              r.riskLevel === 'HIGH' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                              'bg-blue-100 text-blue-800 border-blue-300'
                            }`}>
                              {r.riskLevel}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right font-extrabold text-slate-900">${(r.riskAmount || 0).toFixed(2)}</td>
                          <td className="py-3.5 px-3 text-right text-slate-400 font-mono">
                            {new Date(r.detectedAt || r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Table 3: Coupon Usage */}
          {activeTab === 'coupons' && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">Generated Coupon Usage</h3>
              {loading ? (
                <div className="space-y-3 py-6"><div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div></div>
              ) : coupons.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No coupons generated yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="pb-3 px-3">Coupon Code</th>
                        <th className="pb-3 px-3 text-center">Discount</th>
                        <th className="pb-3 px-3 text-center">Risk Score</th>
                        <th className="pb-3 px-3 text-center">Usage Status</th>
                        <th className="pb-3 px-3 text-right">Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {coupons.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-3 font-mono font-extrabold text-purple-700">{c.code}</td>
                          <td className="py-3.5 px-3 text-center font-bold text-slate-900">{c.discountPercentage}%</td>
                          <td className="py-3.5 px-3 text-center text-slate-600 font-semibold">{c.riskScore}</td>
                          <td className="py-3.5 px-3 text-center">
                            {c.isUsed ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Used</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">Active</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-right text-slate-400 font-mono">
                            {new Date(c.expiryDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Table 4: Email Deliveries */}
          {activeTab === 'emails' && (
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">Recovery Email Deliveries Log</h3>
              {loading ? (
                <div className="space-y-3 py-6"><div className="h-12 bg-slate-100 rounded-xl animate-pulse"></div></div>
              ) : emailLogs.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No email delivery logs found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                        <th className="pb-3 px-3">Agent / Event</th>
                        <th className="pb-3 px-3">Log Message</th>
                        <th className="pb-3 px-3 text-center">Status</th>
                        <th className="pb-3 px-3 text-right">Dispatched At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {emailLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50 transition">
                          <td className="py-3.5 px-3 font-bold text-slate-900">{log.eventType}</td>
                          <td className="py-3.5 px-3 text-slate-600 max-w-sm font-medium">{log.message}</td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-right text-slate-400 font-mono">
                            {new Date(log.processedAt || log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default RevenueRecoveryDashboard;
