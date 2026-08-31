import { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Terminal,
  Activity,
  RefreshCw,
  Trash2,
  Zap,
  ShoppingBag,
  CreditCard,
  Tag,
  TrendingUp,
  Cpu,
  Layers,
  ChevronRight,
  X,
  ShieldAlert,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/testing';

const SCENARIO_CARDS = [
  {
    id: 'MOCK_CUSTOMER_EVENTS',
    title: 'Mock Customer Events',
    description: 'Generates telemetry events (Page View, Add to Cart, Checkout)',
    icon: ShoppingBag,
    color: 'border-blue-500 bg-blue-50 text-blue-700',
    buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  {
    id: 'CART_ABANDONMENT',
    title: 'Simulate Cart Abandonment',
    description: 'Seeds idle cart, runs detector, generates risk event & decision',
    icon: Clock,
    color: 'border-amber-500 bg-amber-50 text-amber-700',
    buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  {
    id: 'PAYMENT_FAILURE',
    title: 'Simulate Payment Failure',
    description: 'Injects payment decline, triggers failure detector & retry link',
    icon: CreditCard,
    color: 'border-rose-500 bg-rose-50 text-rose-700',
    buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  {
    id: 'RISK_DETECTION_TESTING',
    title: 'Risk Detection Agent Testing',
    description: 'Validates risk scores (0-100), reasons, and recovery opportunities',
    icon: ShieldAlert,
    color: 'border-red-500 bg-red-50 text-red-700',
    buttonColor: 'bg-red-600 hover:bg-red-700 text-white',
  },
  {
    id: 'COUPON_RECOVERY',
    title: 'Simulate Coupon Recovery',
    description: 'Evaluates high-risk event, issues coupon & discount workflow',
    icon: Tag,
    color: 'border-purple-500 bg-purple-50 text-purple-700',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  {
    id: 'REVENUE_RECOVERY',
    title: 'Simulate Revenue Recovery',
    description: 'Simulates customer payment completion & measures recovered revenue',
    icon: TrendingUp,
    color: 'border-emerald-500 bg-emerald-50 text-emerald-700',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  {
    id: 'ALL_AGENT_WORKFLOWS',
    title: 'All Agent Workflows',
    description: 'Executes full E2E pipeline across all 5 ReviveX agent modules',
    icon: Cpu,
    color: 'border-indigo-500 bg-indigo-50 text-indigo-700',
    buttonColor: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  },
];

const TestingDashboard = () => {
  const [results, setResults] = useState([]);
  const [metrics, setMetrics] = useState({
    totalTests: 0,
    successCount: 0,
    failedCount: 0,
    runningCount: 0,
    successRate: 100,
    avgExecutionTimeMs: 0,
  });
  const [loading, setLoading] = useState(false);
  const [runningScenario, setRunningScenario] = useState(null);
  const [retryingId, setRetryingId] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchResults = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`${API_BASE}/results?limit=50`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data || []);
        if (data.metrics) setMetrics(data.metrics);
      } else {
        setErrorMsg(data.message || 'Failed to fetch test results');
      }
    } catch (err) {
      setErrorMsg(`Error fetching results: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleRunScenario = async (scenarioId) => {
    try {
      setRunningScenario(scenarioId);
      setErrorMsg('');
      const res = await fetch(`${API_BASE}/run-scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId }),
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message || 'Scenario execution failed');
      }
      await fetchResults();
    } catch (err) {
      setErrorMsg(`Failed to run scenario: ${err.message}`);
    } finally {
      setRunningScenario(null);
    }
  };

  const handleRetry = async (testResultId, e) => {
    e.stopPropagation();
    try {
      setRetryingId(testResultId);
      setErrorMsg('');
      const res = await fetch(`${API_BASE}/retry/${testResultId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.message || 'Retry failed');
      }
      await fetchResults();
      if (selectedResult && selectedResult._id === testResultId && data.data) {
        setSelectedResult(data.data);
      }
    } catch (err) {
      setErrorMsg(`Retry error: ${err.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear all test execution history?')) return;
    try {
      setLoading(true);
      await fetch(`${API_BASE}/results`, { method: 'DELETE' });
      await fetchResults();
    } catch (err) {
      setErrorMsg(`Failed to clear history: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((r) => {
    if (activeFilter === 'ALL') return true;
    return r.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl">
                <Terminal size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  ReviveX Testing Framework
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Simulate customer behavior, validate AI agents end-to-end, and debug scenario failures.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleRunScenario('ALL')}
              disabled={!!runningScenario}
              className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition"
            >
              {runningScenario === 'ALL' ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Zap size={18} />
              )}
              <span>Run All Scenarios</span>
            </button>

            <button
              onClick={fetchResults}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition"
              title="Refresh Test Results"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>

            {results.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                title="Clear Test History"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-medium flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700">
              <X size={18} />
            </button>
          </div>
        )}

        {/* Metrics Overview Banner */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tests</span>
            <span className="text-3xl font-extrabold text-slate-900 mt-2">{metrics.totalTests}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
            <span className="text-3xl font-extrabold text-emerald-600 mt-2">{metrics.successRate}%</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Passed</span>
            <span className="text-3xl font-extrabold text-emerald-500 mt-2">{metrics.successCount}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Failed</span>
            <span className="text-3xl font-extrabold text-rose-500 mt-2">{metrics.failedCount}</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col col-span-2 md:col-span-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Runtime</span>
            <span className="text-3xl font-extrabold text-blue-600 mt-2">{metrics.avgExecutionTimeMs} ms</span>
          </div>
        </div>

        {/* Scenario Trigger Cards Grid */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <Layers size={20} className="text-brand-600" />
            <span>Scenario Execution Panel</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SCENARIO_CARDS.map((card) => {
              const IconComponent = card.icon;
              const isRunning = runningScenario === card.id;

              return (
                <div
                  key={card.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm transition hover:shadow-md flex flex-col justify-between space-y-4`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl border ${card.color}`}>
                        <IconComponent size={22} />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                        {card.id}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{card.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{card.description}</p>
                  </div>

                  <button
                    onClick={() => handleRunScenario(card.id)}
                    disabled={!!runningScenario}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition ${card.buttonColor} disabled:opacity-50`}
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        <span>Simulating Scenario...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>Run Scenario</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Test Results Table & Log Drawer */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Execution History & Logs</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Stored test scenario executions in MongoDB with step-by-step telemetry logs.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
              {['ALL', 'SUCCESS', 'FAILED', 'RUNNING'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeFilter === filter
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Activity size={40} className="mx-auto mb-3 text-slate-300 animate-pulse" />
              <p className="font-semibold text-slate-600">No test results found</p>
              <p className="text-xs mt-1">Run a scenario above to generate MongoDB test logs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Scenario Name</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Execution Time</th>
                    <th className="px-6 py-4">Retries</th>
                    <th className="px-6 py-4">Executed At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredResults.map((item) => {
                    const isRetrying = retryingId === item._id;

                    return (
                      <tr
                        key={item._id}
                        onClick={() => setSelectedResult(item)}
                        className="hover:bg-slate-50 cursor-pointer transition"
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{item.scenarioName}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{item.suiteRunId}</div>
                        </td>

                        <td className="px-6 py-4">
                          {item.status === 'SUCCESS' && (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold rounded-full">
                              <CheckCircle size={14} />
                              <span>SUCCESS</span>
                            </span>
                          )}

                          {item.status === 'FAILED' && (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold rounded-full">
                              <XCircle size={14} />
                              <span>FAILED</span>
                            </span>
                          )}

                          {(item.status === 'RUNNING' || item.status === 'PENDING') && (
                            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-extrabold rounded-full">
                              <RefreshCw size={14} className="animate-spin" />
                              <span>{item.status}</span>
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-slate-700 font-mono text-xs">
                          {item.executionTimeMs} ms
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                            #{item.retryCount}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(item.startedAt || item.createdAt).toLocaleString()}
                        </td>

                        <td className="px-6 py-4 text-right space-x-2">
                          {item.status === 'FAILED' && (
                            <button
                              onClick={(e) => handleRetry(item._id, e)}
                              disabled={isRetrying}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition inline-flex items-center space-x-1 shadow-sm"
                            >
                              <RotateCcw size={14} className={isRetrying ? 'animate-spin' : ''} />
                              <span>{isRetrying ? 'Retrying...' : 'Retry Scenario'}</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResult(item);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition inline-flex items-center space-x-1"
                          >
                            <span>Logs</span>
                            <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Log Details Modal Drawer */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end transition-opacity">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {selectedResult.suiteRunId}
                  </span>
                  {selectedResult.status === 'SUCCESS' ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      SUCCESS
                    </span>
                  ) : (
                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      FAILED
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  {selectedResult.scenarioName}
                </h3>
              </div>

              <button
                onClick={() => setSelectedResult(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Summary details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Scenario ID:</span>
                  <span className="block font-bold text-slate-800 mt-0.5">{selectedResult.scenarioId}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Execution Duration:</span>
                  <span className="block font-bold text-slate-800 mt-0.5">{selectedResult.executionTimeMs} ms</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Retry Attempts:</span>
                  <span className="block font-bold text-slate-800 mt-0.5">#{selectedResult.retryCount}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Completed At:</span>
                  <span className="block font-bold text-slate-800 mt-0.5">
                    {selectedResult.completedAt
                      ? new Date(selectedResult.completedAt).toLocaleTimeString()
                      : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Error Box if FAILED */}
              {selectedResult.errorDetails?.message && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
                    <XCircle size={18} />
                    <span>Scenario Execution Error</span>
                  </div>
                  <p className="text-xs font-mono text-rose-800 bg-rose-100 p-3 rounded-lg overflow-x-auto">
                    {selectedResult.errorDetails.message}
                  </p>
                </div>
              )}

              {/* Step Logs */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                  <Terminal size={16} className="text-slate-500" />
                  <span>Step-by-Step Scenario Logs</span>
                </h4>

                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs space-y-3 max-h-96 overflow-y-auto">
                  {selectedResult.logs?.map((log, index) => (
                    <div key={index} className="border-b border-slate-800 pb-2.5 last:border-b-0">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span
                          className={`font-bold ${
                            log.level === 'SUCCESS'
                              ? 'text-emerald-400'
                              : log.level === 'ERROR'
                              ? 'text-rose-400'
                              : log.level === 'WARN'
                              ? 'text-amber-400'
                              : 'text-blue-400'
                          }`}
                        >
                          {log.level}
                        </span>
                      </div>
                      <div className="text-slate-100 font-semibold">{log.message}</div>
                      {log.details && (
                        <pre className="mt-1.5 p-2 bg-slate-950 text-slate-300 rounded text-[11px] overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Payload details */}
              {selectedResult.payload && Object.keys(selectedResult.payload).length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center space-x-2">
                    <FileText size={16} className="text-slate-500" />
                    <span>Payload & Created Entities</span>
                  </h4>
                  <pre className="bg-slate-100 text-slate-800 p-4 rounded-xl text-xs font-mono overflow-x-auto">
                    {JSON.stringify(selectedResult.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              {selectedResult.status === 'FAILED' ? (
                <button
                  onClick={(e) => handleRetry(selectedResult._id, e)}
                  disabled={retryingId === selectedResult._id}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2"
                >
                  <RotateCcw size={16} className={retryingId === selectedResult._id ? 'animate-spin' : ''} />
                  <span>Retry This Failed Scenario</span>
                </button>
              ) : (
                <button
                  onClick={() => setSelectedResult(null)}
                  className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Close Log View
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestingDashboard;
