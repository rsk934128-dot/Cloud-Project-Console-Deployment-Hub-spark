import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import { AnalyticsTimeSeriesChart } from './AnalyticsTimeSeriesChart';
import { 
  TIME_RANGE_OPTIONS, 
  generateAnalyticsTimeSeries, 
  GLOBAL_REGIONS, 
  STATUS_CODES, 
  TOP_ENDPOINTS, 
  DEVICE_OS_BREAKDOWN 
} from '../data/analyticsData';
import { 
  BarChart3, 
  Activity, 
  Globe, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  RefreshCw, 
  Download, 
  CheckCircle2, 
  Server, 
  Zap, 
  Layers, 
  ChevronDown,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface AnalyticsConsoleProps {
  projects: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
  onOpenGmailAlerts?: () => void;
}

export const AnalyticsConsole: React.FC<AnalyticsConsoleProps> = ({
  projects,
  onSelectProject,
  onOpenGmailAlerts
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [activeMetricTab, setActiveMetricTab] = useState<'requests' | 'latency' | 'errors' | 'bandwidthKb'>('requests');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [refreshSeed, setRefreshSeed] = useState<number>(0);

  // Selected project object
  const currentProject = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  // Compute Time Series based on project selection & time range
  const timeSeriesData = useMemo(() => {
    const multiplier = currentProject ? (currentProject.metrics.edgeRequests24h > 1000 ? 1.4 : 0.6) : 2.5;
    return generateAnalyticsTimeSeries(timeRange, multiplier);
  }, [timeRange, currentProject, refreshSeed]);

  // Aggregated KPIs
  const totalRequests = useMemo(() => {
    if (currentProject) {
      return currentProject.metrics.edgeRequests24h.toLocaleString();
    }
    return projects.reduce((acc, p) => acc + (p.metrics?.edgeRequests24h || 0), 0).toLocaleString();
  }, [currentProject, projects]);

  const avgLatency = useMemo(() => {
    if (currentProject) {
      return `${currentProject.metrics.avgLatencyMs} ms`;
    }
    const sum = projects.reduce((acc, p) => acc + (p.metrics?.avgLatencyMs || 24), 0);
    return `${Math.round(sum / (projects.length || 1))} ms`;
  }, [currentProject, projects]);

  const errorRate = useMemo(() => {
    if (currentProject) {
      return `${(currentProject.metrics.errorRate * 100).toFixed(2)}%`;
    }
    return `0.14%`;
  }, [currentProject]);

  const bandwidth = useMemo(() => {
    if (currentProject) {
      return `${currentProject.metrics.bandwidthMb} MB`;
    }
    const sum = projects.reduce((acc, p) => acc + (p.metrics?.bandwidthMb || 120), 0);
    return `${(sum / 1024).toFixed(2)} GB`;
  }, [currentProject, projects]);

  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = 'Timestamp,Requests,LatencyMs,Errors,BandwidthKB\n';
      const rows = timeSeriesData
        .map((p) => `${p.timestamp},${p.requests},${p.latency},${p.errors},${p.bandwidthKb}`)
        .join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edge-analytics-${selectedProjectId}-${timeRange}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsExporting(false);
    }, 400);
  };

  return (
    <div id="analytics-console-root" className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            Edge Analytics & Telemetry Console
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time traffic telemetry, edge cache performance, latency distributions, and regional routing across 38 projects.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Selector Dropdown */}
          <div className="relative">
            <select
              id="analytics-project-filter"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:border-neutral-700 cursor-pointer shadow-xs"
            >
              <option value="all">All Projects (38 Clusters)</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.displayName} ({proj.environment})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Time Range Pills */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-400">
            {TIME_RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                id={`time-range-${opt.id}`}
                onClick={() => setTimeRange(opt.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  timeRange === opt.id
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'hover:text-neutral-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            id="analytics-refresh-btn"
            onClick={() => setRefreshSeed((prev) => prev + 1)}
            title="Refresh Realtime Telemetry"
            className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Export CSV */}
          <button
            id="analytics-export-btn"
            onClick={handleExportCSV}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1: Edge Requests */}
        <div
          onClick={() => setActiveMetricTab('requests')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMetricTab === 'requests'
              ? 'border-indigo-500/80 bg-neutral-900/90 shadow-sm ring-1 ring-indigo-500/20'
              : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Edge Requests
            </span>
            <span className="text-emerald-400 flex items-center text-[10px] font-bold">
              <ArrowUpRight className="w-3 h-3" /> +8.4%
            </span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{totalRequests}</div>
          <div className="text-[11px] text-neutral-500 mt-1">94.8% edge cache hit ratio</div>
        </div>

        {/* KPI 2: Avg Response Time */}
        <div
          onClick={() => setActiveMetricTab('latency')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMetricTab === 'latency'
              ? 'border-indigo-500/80 bg-neutral-900/90 shadow-sm ring-1 ring-indigo-500/20'
              : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Median Latency
            </span>
            <span className="text-emerald-400 flex items-center text-[10px] font-bold">
              <ArrowDownRight className="w-3 h-3" /> -3.2ms
            </span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{avgLatency}</div>
          <div className="text-[11px] text-neutral-500 mt-1">p95: 58ms across all PoPs</div>
        </div>

        {/* KPI 3: Error Rate */}
        <div
          onClick={() => setActiveMetricTab('errors')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMetricTab === 'errors'
              ? 'border-indigo-500/80 bg-neutral-900/90 shadow-sm ring-1 ring-indigo-500/20'
              : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Error Rate
            </span>
            <span className="text-emerald-400 flex items-center text-[10px] font-bold">
              Stable
            </span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{errorRate}</div>
          <div className="text-[11px] text-neutral-500 mt-1">4xx: 0.12% | 5xx: 0.02%</div>
        </div>

        {/* KPI 4: Bandwidth */}
        <div
          onClick={() => setActiveMetricTab('bandwidthKb')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            activeMetricTab === 'bandwidthKb'
              ? 'border-indigo-500/80 bg-neutral-900/90 shadow-sm ring-1 ring-indigo-500/20'
              : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 hover:border-neutral-700'
          }`}
        >
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span className="font-medium flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Fast Data Transfer
            </span>
            <span className="text-neutral-400 text-[10px] font-mono">Tier: Pro</span>
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{bandwidth}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Outbound data cached at edge</div>
        </div>
      </div>

      {/* Main Interactive Chart Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              <button
                onClick={() => setActiveMetricTab('requests')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeMetricTab === 'requests'
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Requests Volume
              </button>
              <button
                onClick={() => setActiveMetricTab('latency')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeMetricTab === 'latency'
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Latency (ms)
              </button>
              <button
                onClick={() => setActiveMetricTab('errors')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeMetricTab === 'errors'
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Error Occurrences
              </button>
              <button
                onClick={() => setActiveMetricTab('bandwidthKb')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  activeMetricTab === 'bandwidthKb'
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Bandwidth
              </button>
            </div>
          </div>

          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live edge streaming active (iad1 PoP)</span>
          </div>
        </div>

        {/* Render Chart */}
        <AnalyticsTimeSeriesChart
          data={timeSeriesData}
          metricKey={activeMetricTab}
          metricLabel={
            activeMetricTab === 'requests'
              ? 'Edge Invocations'
              : activeMetricTab === 'latency'
              ? 'Roundtrip Response Time'
              : activeMetricTab === 'errors'
              ? 'HTTP Errors'
              : 'Bandwidth Throughput'
          }
          unit={
            activeMetricTab === 'requests'
              ? 'req'
              : activeMetricTab === 'latency'
              ? 'ms'
              : activeMetricTab === 'errors'
              ? 'errors'
              : 'KB'
          }
          color={
            activeMetricTab === 'requests'
              ? '#6366f1'
              : activeMetricTab === 'latency'
              ? '#06b6d4'
              : activeMetricTab === 'errors'
              ? '#f43f5e'
              : '#10b981'
          }
          height={200}
        />
      </div>

      {/* Two Column Layout: Top Endpoints & Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Endpoints Table */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-400" />
              Top Request Paths & Edge Routes
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">Sorted by frequency</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-2.5">Endpoint Path</th>
                  <th className="pb-2.5 text-right">Invocations</th>
                  <th className="pb-2.5 text-right">Avg Latency</th>
                  <th className="pb-2.5 text-right">Cache Hit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {TOP_ENDPOINTS.map((ep, idx) => (
                  <tr key={idx} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ep.method === 'GET'
                            ? 'bg-blue-950/70 text-blue-400 border border-blue-800'
                            : 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="truncate max-w-[200px] text-white" title={ep.path}>
                          {ep.path}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-medium text-neutral-200">
                      {ep.requests.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right text-neutral-300">
                      {ep.avgLatencyMs}ms
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                        ep.cachedPercentage > 80
                          ? 'text-emerald-400 bg-emerald-950/50'
                          : ep.cachedPercentage > 0
                          ? 'text-amber-400 bg-amber-950/50'
                          : 'text-neutral-400 bg-neutral-800'
                      }`}>
                        {ep.cachedPercentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Global Regions & PoP Traffic */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Regional Edge Point of Presence
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">6 Global PoPs</span>
          </div>

          <div className="space-y-3">
            {GLOBAL_REGIONS.map((reg) => (
              <div key={reg.code} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-neutral-200">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold">
                      {reg.code}
                    </span>
                    <span className="text-white text-xs">{reg.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-neutral-400">{reg.latencyMs}ms</span>
                    <span className="font-bold text-white">{reg.percentage}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${reg.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Primary Datacenter Ingress:</span>
            <span className="font-mono text-white font-semibold">iad1 (Washington, D.C.)</span>
          </div>
        </div>
      </div>

      {/* Secondary Row: HTTP Status Codes & OS / Device Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Codes Breakdown */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-neutral-400" />
            HTTP Response Status Codes
          </h3>

          <div className="space-y-2.5">
            {STATUS_CODES.map((sc) => (
              <div key={sc.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: sc.color }}
                    ></span>
                    <span className="text-white font-medium">{sc.status}</span>
                  </div>
                  <div className="font-mono text-[11px] text-neutral-400">
                    <span className="text-white font-semibold">{sc.count.toLocaleString()}</span> ({sc.percentage}%)
                  </div>
                </div>
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${sc.percentage}%`, backgroundColor: sc.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Platform & Devices */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Laptop className="w-4 h-4 text-neutral-400" />
            Client Platform & Device Operating Systems
          </h3>

          <div className="space-y-2.5">
            {DEVICE_OS_BREAKDOWN.map((dev, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-200">{dev.name}</span>
                  <div className="font-mono text-[11px] text-neutral-400">
                    <span className="text-white font-semibold">{dev.percentage}%</span> ({dev.count.toLocaleString()})
                  </div>
                </div>
                <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${dev.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
