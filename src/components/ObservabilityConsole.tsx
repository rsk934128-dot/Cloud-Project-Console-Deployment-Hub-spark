import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import { DistributedTrace, GroupedException, ServiceSLO, EdgeNodeHealth } from '../types/observability';
import { 
  MOCK_TRACES, 
  MOCK_EXCEPTIONS, 
  SERVICE_SLOS, 
  EDGE_NODE_HEALTH 
} from '../data/observabilityData';
import { 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ChevronRight, 
  Server, 
  Cpu, 
  Database, 
  Zap, 
  ShieldCheck, 
  Layers, 
  ExternalLink,
  ChevronDown,
  Sparkles,
  Terminal,
  Radio
} from 'lucide-react';

interface ObservabilityConsoleProps {
  projects: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
}

export const ObservabilityConsole: React.FC<ObservabilityConsoleProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [envFilter, setEnvFilter] = useState<'all' | 'Production' | 'Preview'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'errors' | 'coldStarts' | 'slow'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTraceId, setSelectedTraceId] = useState<string>(MOCK_TRACES[0].id);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [exceptions, setExceptions] = useState<GroupedException[]>(MOCK_EXCEPTIONS);
  const [traces, setTraces] = useState<DistributedTrace[]>(MOCK_TRACES);

  // Filter traces
  const filteredTraces = useMemo(() => {
    return traces.filter((t) => {
      const matchesSearch = 
        t.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.traceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.method.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEnv = envFilter === 'all' || t.environment === envFilter;

      let matchesStatus = true;
      if (statusFilter === 'errors') matchesStatus = t.status === 'error' || t.statusCode >= 400;
      if (statusFilter === 'coldStarts') matchesStatus = t.coldStart;
      if (statusFilter === 'slow') matchesStatus = t.durationMs >= 300;

      return matchesSearch && matchesEnv && matchesStatus;
    });
  }, [traces, searchQuery, envFilter, statusFilter]);

  // Active selected trace for waterfall
  const activeTrace = useMemo(() => {
    return traces.find((t) => t.id === selectedTraceId) || traces[0];
  }, [traces, selectedTraceId]);

  const handleSimulateNewTrace = () => {
    const methods: ('GET' | 'POST' | 'PUT')[] = ['GET', 'POST', 'GET'];
    const endpoints = ['/api/v1/auth/session', '/api/v1/billing/usage', '/api/telemetry/events'];
    const randomMethod = methods[Math.floor(Math.random() * methods.length)];
    const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const dur = Math.floor(Math.random() * 180) + 22;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    const newTrace: DistributedTrace = {
      id: `tr-${Date.now()}`,
      traceId: Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
      timestamp: timeStr,
      method: randomMethod,
      endpoint: randomEndpoint,
      durationMs: dur,
      statusCode: 200,
      status: 'success',
      coldStart: false,
      region: 'iad1',
      memoryMb: 96,
      spansCount: 3,
      environment: 'Production',
      projectName: 'Cloud Console Edge',
      spans: [
        { id: `sp-new-1`, name: `http.request [${randomMethod}]`, service: 'edge-gateway', durationMs: dur, offsetMs: 0, status: 'ok' },
        { id: `sp-new-2`, name: 'cache.getFastKey', service: 'redis-edge', durationMs: 6, offsetMs: 2, status: 'ok' },
        { id: `sp-new-3`, name: 'db.readRow', service: 'spanner-db', durationMs: Math.round(dur * 0.6), offsetMs: 8, status: 'ok' }
      ]
    };

    setTraces((prev) => [newTrace, ...prev.slice(0, 15)]);
    setSelectedTraceId(newTrace.id);
  };

  const handleResolveException = (id: string) => {
    setExceptions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'resolved' } : e))
    );
  };

  return (
    <div id="observability-console-root" className="space-y-6">
      {/* Top Header & Quick Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Distributed Observability & Traces
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            End-to-end request spans, serverless edge function execution telemetry, error budgets, and health probes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Selector */}
          <div className="relative">
            <select
              id="observability-project-filter"
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

          {/* Environment Filter */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-400">
            {(['all', 'Production', 'Preview'] as const).map((env) => (
              <button
                key={env}
                onClick={() => setEnvFilter(env)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  envFilter === env
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'hover:text-neutral-200'
                }`}
              >
                {env === 'all' ? 'All Envs' : env}
              </button>
            ))}
          </div>

          {/* Live Ingestion Toggle */}
          <button
            id="observability-stream-toggle"
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-semibold rounded-lg shadow-xs transition-colors ${
              isStreaming
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`}></span>
            <span>{isStreaming ? 'Live Stream' : 'Paused'}</span>
          </button>

          {/* Ingest Simulated Trace */}
          <button
            id="observability-simulate-btn"
            onClick={handleSimulateNewTrace}
            title="Ingest Real-time Trace"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Emit Trace</span>
          </button>
        </div>
      </div>

      {/* SLO and Error Budget Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SERVICE_SLOS.map((slo) => (
          <div key={slo.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white truncate max-w-[200px]" title={slo.name}>
                {slo.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Healthy
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-white">{slo.currentPercent}%</span>
                <span className="text-xs text-neutral-500 ml-1">/ {slo.targetPercent}% target</span>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-emerald-400">{slo.budgetRemainingPercent}%</div>
                <div className="text-[10px] text-neutral-500">Error Budget</div>
              </div>
            </div>

            <div className="h-1.5 w-full bg-neutral-950 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${slo.budgetRemainingPercent}%` }}
              ></div>
            </div>

            <div className="text-[11px] text-neutral-400 flex items-center justify-between">
              <span>Window: {slo.window}</span>
              <span className="text-neutral-500 font-mono">Burn Rate: 0.12x</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Section: Trace Explorer & Waterfall Inspector (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trace List */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 flex flex-col h-[560px]">
          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by trace ID or endpoint..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
              />
            </div>

            {/* Quick Filter Tags */}
            <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-1">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All ({traces.length})
              </button>
              <button
                onClick={() => setStatusFilter('errors')}
                className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap flex items-center gap-1 ${
                  statusFilter === 'errors'
                    ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-800'
                    : 'text-neutral-400 hover:text-rose-400'
                }`}
              >
                Errors Only
              </button>
              <button
                onClick={() => setStatusFilter('coldStarts')}
                className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                  statusFilter === 'coldStarts'
                    ? 'bg-amber-950/80 text-amber-300 font-semibold border border-amber-800'
                    : 'text-neutral-400 hover:text-amber-400'
                }`}
              >
                Cold Starts
              </button>
              <button
                onClick={() => setStatusFilter('slow')}
                className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                  statusFilter === 'slow'
                    ? 'bg-indigo-950/80 text-indigo-300 font-semibold border border-indigo-800'
                    : 'text-neutral-400 hover:text-indigo-400'
                }`}
              >
                &gt;300ms
              </button>
            </div>
          </div>

          {/* Trace Cards Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-neutral-800/40">
            {filteredTraces.map((trace) => {
              const isSelected = selectedTraceId === trace.id;
              return (
                <div
                  key={trace.id}
                  id={`trace-card-${trace.id}`}
                  onClick={() => setSelectedTraceId(trace.id)}
                  className={`pt-2 p-2.5 rounded-lg cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-neutral-800/80 border-indigo-500/80 ring-1 ring-indigo-500/30'
                      : 'border-transparent hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        trace.statusCode >= 500
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : trace.statusCode === 429
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {trace.statusCode}
                      </span>
                      <span className="font-bold text-white text-[11px]">{trace.method}</span>
                      <span className="font-mono text-[11px] text-neutral-300 truncate max-w-[140px]" title={trace.endpoint}>
                        {trace.endpoint}
                      </span>
                    </div>

                    <span className="font-mono text-[11px] font-bold text-white">
                      {trace.durationMs}ms
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span>{trace.region}</span>
                      {trace.coldStart && (
                        <span className="text-amber-400 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/60">
                          COLD
                        </span>
                      )}
                      <span>{trace.spansCount} spans</span>
                    </div>
                    <span>{trace.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Distributed Span Waterfall Visualizer */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 flex flex-col h-[560px]">
          {activeTrace ? (
            <>
              {/* Header Info */}
              <div className="border-b border-neutral-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      activeTrace.statusCode >= 500
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}>
                      {activeTrace.statusCode} {activeTrace.status.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-white font-mono">{activeTrace.method} {activeTrace.endpoint}</h3>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center gap-3">
                    <span>traceId: <span className="text-indigo-400">{activeTrace.traceId.slice(0, 16)}...</span></span>
                    <span>Region: {activeTrace.region}</span>
                    <span>Memory: {activeTrace.memoryMb}MB</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-base font-black text-white">{activeTrace.durationMs}ms</div>
                  <div className="text-[10px] text-neutral-400">{activeTrace.spans.length} execution spans</div>
                </div>
              </div>

              {/* Waterfall Timeline Graphic */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Span Execution Timeline</span>
                  <span>Duration / Offset</span>
                </div>

                {activeTrace.spans.map((span) => {
                  const maxDuration = Math.max(activeTrace.durationMs, 1);
                  const leftPercent = (span.offsetMs / maxDuration) * 100;
                  const widthPercent = Math.max((span.durationMs / maxDuration) * 100, 3);

                  return (
                    <div key={span.id} className="space-y-1 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300">
                            {span.service}
                          </span>
                          <span className="font-mono text-white text-[11px]">{span.name}</span>
                          {span.status === 'error' && (
                            <span className="text-[9px] font-bold text-rose-400 bg-rose-950/80 px-1 py-0.2 rounded border border-rose-800">
                              FAIL
                            </span>
                          )}
                        </div>

                        <div className="font-mono text-[11px] text-neutral-300">
                          {span.durationMs}ms <span className="text-neutral-500">(+{span.offsetMs}ms)</span>
                        </div>
                      </div>

                      {/* Visual Timeline Bar */}
                      <div className="h-2 w-full bg-neutral-900 rounded-full relative overflow-hidden">
                        <div
                          className={`h-full rounded-full absolute transition-all ${
                            span.status === 'error' ? 'bg-rose-500' : 'bg-indigo-500'
                          }`}
                          style={{
                            left: `${Math.min(leftPercent, 95)}%`,
                            width: `${Math.min(widthPercent, 100 - leftPercent)}%`
                          }}
                        ></div>
                      </div>

                      {/* Optional Error / Tag Details */}
                      {span.errorDetails && (
                        <div className="mt-1.5 p-2 bg-rose-950/40 border border-rose-800/60 rounded text-[11px] font-mono text-rose-300">
                          {span.errorDetails}
                        </div>
                      )}

                      {span.tags && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(span.tags).map(([k, v]) => (
                            <span key={k} className="text-[10px] font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.2 rounded border border-neutral-800">
                              {k}: <span className="text-neutral-200">{v}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-neutral-500">
              Select a trace from the left panel to inspect its distributed waterfall.
            </div>
          )}
        </div>
      </div>

      {/* Secondary Row: Exceptions Grouping & Global Node Probes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Grouped Serverless Exceptions */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              Grouped Runtime Exceptions & Stack Anomaly
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">{exceptions.length} tracked issues</span>
          </div>

          <div className="space-y-3">
            {exceptions.map((exc) => (
              <div
                key={exc.id}
                className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      exc.severity === 'critical'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : exc.severity === 'high'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-blue-950 text-blue-400 border border-blue-800'
                    }`}>
                      {exc.severity}
                    </span>
                    <span className="font-mono text-xs font-bold text-white">{exc.errorType}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-neutral-400">{exc.lastSeen}</span>
                    {exc.status !== 'resolved' ? (
                      <button
                        onClick={() => handleResolveException(exc.id)}
                        className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-neutral-300 font-mono leading-relaxed">{exc.message}</p>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800/80 pt-2">
                  <span className="font-mono text-[10px] text-neutral-500 truncate max-w-[280px]">
                    at {exc.location}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>{exc.occurrences} hits</span>
                    <span>{exc.affectedUsers} users affected</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Edge Node Health Probes */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              Edge Point of Presence Probes
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">6 Clusters</span>
          </div>

          <div className="space-y-3">
            {EDGE_NODE_HEALTH.map((node) => (
              <div
                key={node.region}
                className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 font-bold">
                      {node.region}
                    </span>
                    <span className="text-white font-semibold">{node.locationName}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-neutral-400">{node.latencyMs}ms</span>
                    <span className="text-emerald-400 font-bold">{node.uptimePercent}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="bg-neutral-900/80 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">CPU</div>
                    <div className="font-bold text-white mt-0.5">{node.cpuPercent}%</div>
                  </div>
                  <div className="bg-neutral-900/80 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">MEMORY</div>
                    <div className="font-bold text-white mt-0.5">{node.memoryPercent}%</div>
                  </div>
                  <div className="bg-neutral-900/80 p-1.5 rounded border border-neutral-800">
                    <div className="text-neutral-500">WORKERS</div>
                    <div className="font-bold text-white mt-0.5">{node.activeWorkers}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-neutral-500 text-center">
            Pinging all regional load balancers via HTTP/3 QUIC probes
          </div>
        </div>
      </div>
    </div>
  );
};
