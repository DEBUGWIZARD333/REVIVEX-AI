import { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  ShoppingCart,
  Rocket,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Bot,
  UserCheck,
  Zap,
  Filter,
} from 'lucide-react';
import * as dashboardService from '../services/dashboardService';

const MonitoringDashboard = () => {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [agentStatus, setAgentStatus] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState('');

  // Fetch all dashboard data
  const loadDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      setRefreshing(true);

      const [statsRes, eventsRes, logsRes, statusRes] = await Promise.allSettled([
        dashboardService.fetchEventStats(),
        dashboardService.fetchEventsFeed(selectedEventType ? { eventType: selectedEventType } : {}),
        dashboardService.fetchAgentLogsFeed(),
        dashboardService.fetchMonitoringStatus(),
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data?.data || eventsRes.value.data || []);
      if (logsRes.status === 'fulfilled') setAgentLogs(logsRes.value.data?.data || logsRes.value.data || []);
      if (statusRes.status === 'fulfilled') setAgentStatus(statusRes.value.data?.data || statusRes.value.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedEventType]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Real-time auto refresh timer (every 5 seconds)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadDashboardData]);

  // Status Badge Styling Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROCESSING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RECEIVED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Event Badge Styling Helper
  const getEventBadge = (type) => {
    switch (type) {
      case 'PRODUCT_VIEWED':
        return 'bg-blue-100 text-blue-800';
      case 'ADD_TO_CART':
        return 'bg-indigo-100 text-indigo-800';
      case 'REMOVE_CART_ITEM':
        return 'bg-amber-100 text-amber-800';
      case 'CHECKOUT_STARTED':
        return 'bg-purple-100 text-purple-800';
      case 'PAYMENT_INITIATED':
        return 'bg-cyan-100 text-cyan-800';
      case 'PAYMENT_FAILED':
        return 'bg-red-100 text-red-800';
      case 'PAYMENT_SUCCESS':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Event Monitoring Dashboard
              </h1>
              <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5"></span>
                Live Polling Active
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Real-time telemetry, user intent analysis, and AI agent execution logs.
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
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Now
            </button>
          </div>
        </div>

        {/* Section 1: Event Statistics (5 Main Cards Required) */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Zap className="mr-2 text-brand-600" size={20} /> Event Statistics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* 1. Product Views Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Views</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Eye size={20} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.productViews || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">PRODUCT_VIEWED events</p>
            </div>

            {/* 2. Cart Adds Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cart Adds</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ShoppingCart size={20} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.cartAdds || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">ADD_TO_CART events</p>
            </div>

            {/* 3. Checkout Started Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checkout Started</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Rocket size={20} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.checkoutStarts || 0}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">CHECKOUT_STARTED events</p>
            </div>

            {/* 4. Payment Success Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Success</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={20} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.successfulPayments || 0}
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                Conversion Rate: {stats?.conversionRatePercentage || 0}%
              </p>
            </div>

            {/* 5. Payment Failed Card */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Failed</span>
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? <span className="animate-pulse text-slate-300">...</span> : stats?.paymentFailures || 0}
              </p>
              <p className="text-[11px] text-red-500 font-semibold mt-1">Recovery Target</p>
            </div>

          </div>
        </div>

        {/* Main 2-Column Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          
          {/* Section 2: Event Feed */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Activity size={18} className="mr-2 text-brand-600" /> Real-time Event Feed
                </h2>
                <p className="text-xs text-slate-500">Live stream of customer interactions</p>
              </div>

              {/* Event Type Filter */}
              <div className="flex items-center space-x-2">
                <Filter size={14} className="text-slate-400" />
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">All Event Types</option>
                  <option value="PRODUCT_VIEWED">Product Viewed</option>
                  <option value="ADD_TO_CART">Add To Cart</option>
                  <option value="REMOVE_CART_ITEM">Remove Cart Item</option>
                  <option value="CHECKOUT_STARTED">Checkout Started</option>
                  <option value="PAYMENT_INITIATED">Payment Initiated</option>
                  <option value="PAYMENT_FAILED">Payment Failed</option>
                  <option value="PAYMENT_SUCCESS">Payment Success</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 py-8">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-14 bg-slate-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Activity size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No events logged yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {events.map((evt) => (
                  <div
                    key={evt._id}
                    className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 transition border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${getEventBadge(evt.eventType)}`}>
                          {evt.eventType}
                        </span>
                        <span className="text-slate-400">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      
                      <p className="font-bold text-slate-800">
                        {evt.productId?.name ? `Product: ${evt.productId.name}` : `Session: ${evt.sessionId || 'Guest'}`}
                      </p>

                      {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                        <p className="text-slate-500 font-mono text-[11px] mt-0.5 line-clamp-1">
                          {JSON.stringify(evt.metadata)}
                        </p>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-slate-500 font-medium block">
                        {evt.userId?.email || 'Guest User'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {evt._id?.substr(-6)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Agent Activity Logs */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col">
            <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                  <Bot size={18} className="mr-2 text-brand-600" /> Agent Activity Logs
                </h2>
                <p className="text-xs text-slate-500">AI execution trace & rule evaluation</p>
              </div>

              {agentStatus && (
                <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
                  Session Processed: {agentStatus.processedCountInSession || 0}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3 py-8">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-14 bg-slate-100 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : agentLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bot size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium">No agent logs recorded yet</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {agentLogs.map((log) => (
                  <div
                    key={log._id}
                    className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 flex items-center">
                        <Bot size={14} className="mr-1 text-brand-600" /> {log.agentName}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${getStatusBadge(log.status)}`}>
                        {log.status}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                      {log.message}
                    </p>

                    <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                      <span>Event: {log.eventType}</span>
                      <span>{new Date(log.processedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Section 4: Recent User Activity Timeline */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
          <div className="mb-6 pb-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <UserCheck size={20} className="mr-2 text-brand-600" /> Recent User Activity Timeline
              </h2>
              <p className="text-xs text-slate-500">Intelligent session tracking and recovery action status</p>
            </div>
          </div>

          {events.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No recent user activity recorded.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.slice(0, 3).map((evt) => (
                <div key={evt._id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                        {evt.userId?.name || 'Guest Visitor'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-900 mb-1">{evt.eventType}</p>
                    <p className="text-xs text-slate-500 mb-3">
                      {evt.productId?.name ? `Product: ${evt.productId.name}` : `Session ID: ${evt.sessionId}`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
                    <span>Status: {evt.isProcessed ? 'Analyzed' : 'Pending Agent'}</span>
                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                      Active Session
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MonitoringDashboard;
