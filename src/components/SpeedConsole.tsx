import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import { CoreWebVital, RouteSpeedMetric, SpeedAudit, VitalStatus } from '../types/speed';
import { 
  INITIAL_VITALS, 
  ROUTE_SPEED_DATA, 
  SPEED_AUDITS, 
  DEVICE_SPEED_DATA 
} from '../data/speedData';
import { 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  MousePointerClick, 
  Layout, 
  Gauge, 
  RefreshCw, 
  ChevronDown, 
  Search, 
  Laptop, 
  Smartphone, 
  Sparkles, 
  ArrowUpRight, 
  ExternalLink,
  ShieldCheck,
  Filter,
  Check
} from 'lucide-react';

interface SpeedConsoleProps {
  projects: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
}

export const SpeedConsole: React.FC<SpeedConsoleProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<'all' | 'desktop' | 'mobile'>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '28d'>('24h');
  const [routeSearch, setRouteSearch] = useState<string>('');
  const [selectedVitalId, setSelectedVitalId] = useState<string>('lcp');
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditSuccessToast, setAuditSuccessToast] = useState<string | null>(null);

  // Dynamic Vitals based on project and device filter
  const currentProject = useMemo(() => {
    if (selectedProjectId === 'all') return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  const vitals: CoreWebVital[] = useMemo(() => {
    let scoreModifier = 1.0;
    if (selectedDevice === 'mobile') scoreModifier = 1.35;
    if (selectedDevice === 'desktop') scoreModifier = 0.92;
    if (currentProject && currentProject.metrics.avgLatencyMs > 30) scoreModifier *= 1.15;

    return INITIAL_VITALS.map((vital) => {
      const adjustedVal = vital.unit === 's' 
        ? parseFloat((vital.value * (selectedDevice === 'mobile' ? 1.2 : 1.0)).toFixed(2))
        : vital.unit === 'ms'
        ? Math.round(vital.value * scoreModifier)
        : parseFloat((vital.value * (selectedDevice === 'mobile' ? 1.5 : 1.0)).toFixed(3));

      let status: VitalStatus = 'good';
      if (adjustedVal > vital.thresholdPoor) status = 'poor';
      else if (adjustedVal > vital.thresholdGood) status = 'needs-improvement';

      return {
        ...vital,
        value: adjustedVal,
        displayValue: `${adjustedVal}${vital.unit}`,
        status
      };
    });
  }, [selectedDevice, currentProject]);

  // Overall Score calculation (0 - 100)
  const overallScore = useMemo(() => {
    if (selectedDevice === 'mobile') return 89;
    if (selectedDevice === 'desktop') return 98;
    if (currentProject) {
      return Math.min(99, Math.max(78, 100 - Math.round(currentProject.metrics.avgLatencyMs * 0.4)));
    }
    return 96;
  }, [selectedDevice, currentProject]);

  // Filtered routes
  const filteredRoutes = useMemo(() => {
    return ROUTE_SPEED_DATA.filter((r) => {
      const matchesSearch = r.path.toLowerCase().includes(routeSearch.toLowerCase());
      const matchesDevice = 
        selectedDevice === 'all' 
          ? true 
          : selectedDevice === 'mobile' 
          ? r.deviceBias === 'mobile' || r.deviceBias === 'mixed'
          : r.deviceBias === 'desktop' || r.deviceBias === 'mixed';
      return matchesSearch && matchesDevice;
    });
  }, [routeSearch, selectedDevice]);

  const activeVital = useMemo(() => {
    return vitals.find((v) => v.id === selectedVitalId) || vitals[0];
  }, [vitals, selectedVitalId]);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditSuccessToast('Speed Insights benchmark re-calculated across 24,000 global synthetic edge pings.');
      setTimeout(() => setAuditSuccessToast(null), 4000);
    }, 1200);
  };

  const getStatusBadge = (status: VitalStatus) => {
    switch (status) {
      case 'good':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Good
          </span>
        );
      case 'needs-improvement':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Needs Improvement
          </span>
        );
      case 'poor':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Poor
          </span>
        );
    }
  };

  return (
    <div id="speed-console-root" className="space-y-6">
      {/* Toast Notification */}
      {auditSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-emerald-100 border border-emerald-700 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{auditSuccessToast}</span>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Speed Insights & Core Web Vitals
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-world Chrome User Experience Report (CrUX) and 75th percentile Core Web Vitals telemetry.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Project Selector */}
          <div className="relative">
            <select
              id="speed-project-filter"
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

          {/* Device Tabs */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-400">
            <button
              id="device-filter-all"
              onClick={() => setSelectedDevice('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDevice === 'all'
                  ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                  : 'hover:text-neutral-200'
              }`}
            >
              All Devices
            </button>
            <button
              id="device-filter-desktop"
              onClick={() => setSelectedDevice('desktop')}
              className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                selectedDevice === 'desktop'
                  ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                  : 'hover:text-neutral-200'
              }`}
            >
              <Laptop className="w-3 h-3" /> Desktop
            </button>
            <button
              id="device-filter-mobile"
              onClick={() => setSelectedDevice('mobile')}
              className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
                selectedDevice === 'mobile'
                  ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                  : 'hover:text-neutral-200'
              }`}
            >
              <Smartphone className="w-3 h-3" /> Mobile
            </button>
          </div>

          {/* Time Range */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-400">
            {(['24h', '7d', '28d'] as const).map((range) => (
              <button
                key={range}
                id={`speed-range-${range}`}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-md transition-colors uppercase ${
                  timeRange === range
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'hover:text-neutral-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Run Live Audit */}
          <button
            id="run-speed-audit-btn"
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Auditing...' : 'Run Audit'}</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Score Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Overall Performance Gauge & Passing Badge */}
          <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-neutral-800 pb-5 lg:pb-0 lg:pr-6">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-800 stroke-current"
                  strokeWidth="3.5"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={`${overallScore}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-white">{overallScore}</span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase">SCORE</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Check className="w-3 h-3" /> PASSING
                </span>
              </div>
              <h2 className="text-sm font-bold text-white">Core Web Vitals Assessment</h2>
              <p className="text-xs text-neutral-400 leading-snug">
                75th percentile of real visitor experiences across all 3 standard metrics meet Google search ranking criteria.
              </p>
            </div>
          </div>

          {/* Center: RUM Session Samples & Traffic Breakdown */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3 text-center border-b lg:border-b-0 lg:border-r border-neutral-800 pb-5 lg:pb-0 lg:pr-6">
            <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/80">
              <div className="text-[10px] font-mono text-neutral-400 uppercase mb-1">Total Visits (P75)</div>
              <div className="text-base font-bold text-white">248,300</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">CrUX verified</div>
            </div>

            <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/80">
              <div className="text-[10px] font-mono text-neutral-400 uppercase mb-1">Good Sessions</div>
              <div className="text-base font-bold text-emerald-400">94.8%</div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">235,400 hits</div>
            </div>

            <div className="bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/80">
              <div className="text-[10px] font-mono text-neutral-400 uppercase mb-1">Needs Imp. / Poor</div>
              <div className="text-base font-bold text-amber-400">5.2%</div>
              <div className="text-[10px] text-neutral-500 font-mono mt-0.5">12,900 hits</div>
            </div>
          </div>

          {/* Right: Recommendation / Quick Summary */}
          <div className="lg:col-span-3 space-y-2">
            <div className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Optimization Status
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Global CDN edge cache is active with 0 hydration delays detected on static server components.
            </p>
            <div className="text-[11px] font-mono text-neutral-500">
              Last updated: Today, 75th percentile
            </div>
          </div>
        </div>
      </div>

      {/* Core Web Vitals Bento Cards (5 Cards: LCP, INP, CLS, FCP, TTFB) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-400" />
            Core Web Vitals Telemetry (P75 Distribution)
          </h3>
          <span className="text-[11px] text-neutral-400">Select card to inspect recommendations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {vitals.map((vital) => {
            const isSelected = selectedVitalId === vital.id;
            return (
              <div
                key={vital.id}
                id={`vital-card-${vital.id}`}
                onClick={() => setSelectedVitalId(vital.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                  isSelected
                    ? 'border-indigo-500 bg-neutral-900 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                {/* Top: Short name & status badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-white px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                    {vital.shortName}
                  </span>
                  {getStatusBadge(vital.status)}
                </div>

                {/* Metric Value */}
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">
                    {vital.displayValue}
                  </div>
                  <div className="text-xs text-neutral-400 truncate mt-0.5" title={vital.name}>
                    {vital.name}
                  </div>
                </div>

                {/* Distribution Bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${vital.goodPercent}%` }}
                      className="bg-emerald-500 h-full"
                      title={`Good: ${vital.goodPercent}%`}
                    />
                    <div
                      style={{ width: `${vital.needsImprovementPercent}%` }}
                      className="bg-amber-500 h-full"
                      title={`Needs Improvement: ${vital.needsImprovementPercent}%`}
                    />
                    <div
                      style={{ width: `${vital.poorPercent}%` }}
                      className="bg-rose-500 h-full"
                      title={`Poor: ${vital.poorPercent}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                    <span className="text-emerald-400">{vital.goodPercent}% Good</span>
                    <span className="text-neutral-500">
                      ≤ {vital.thresholdGood}{vital.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Vital Deep Dive Banner */}
      {activeVital && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400 px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                {activeVital.shortName} Diagnostic
              </span>
              <h4 className="text-sm font-bold text-white">{activeVital.name}</h4>
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              Target Threshold: <span className="text-emerald-400 font-semibold">≤ {activeVital.thresholdGood}{activeVital.unit}</span> | Poor: &gt; {activeVital.thresholdPoor}{activeVital.unit}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="text-neutral-400 font-medium">Metric Specification:</div>
              <p className="text-neutral-300 leading-relaxed">{activeVital.description}</p>
            </div>
            <div className="space-y-1 bg-neutral-950/60 p-3 rounded-lg border border-neutral-800">
              <div className="text-indigo-400 font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Live Architecture Observation:
              </div>
              <p className="text-neutral-300 leading-relaxed">{activeVital.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Route Performance Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-neutral-400" />
              Real User Route Performance Breakdown
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Core Web Vitals segmented by individual application URL paths and real visitor pageviews.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter routes (e.g. /dashboard)..."
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead>
              <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Route Path</th>
                <th className="pb-3 text-center">Score</th>
                <th className="pb-3 text-right">LCP (p75)</th>
                <th className="pb-3 text-right">INP (p75)</th>
                <th className="pb-3 text-right">CLS (p75)</th>
                <th className="pb-3 text-right">TTFB</th>
                <th className="pb-3 text-right pr-2">Pageviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
              {filteredRoutes.map((route, idx) => (
                <tr key={idx} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 pl-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white font-mono">{route.path}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-sans font-medium uppercase border ${
                        route.deviceBias === 'mobile'
                          ? 'bg-purple-950/60 text-purple-300 border-purple-800'
                          : route.deviceBias === 'desktop'
                          ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                      }`}>
                        {route.deviceBias}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                      route.score >= 90
                        ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                        : route.score >= 80
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                    }`}>
                      {route.score}
                    </span>
                  </td>
                  <td className="py-3 text-right text-neutral-200">{route.lcp}</td>
                  <td className="py-3 text-right text-neutral-200">{route.inp}</td>
                  <td className="py-3 text-right text-neutral-200">{route.cls}</td>
                  <td className="py-3 text-right text-neutral-400">{route.ttfb}</td>
                  <td className="py-3 text-right text-neutral-400 pr-2">
                    {route.pageViews.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostics & Device Breakdown (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Performance Optimization Opportunities */}
        <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Optimization Audits & Diagnostic Opportunities
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">4 Audits Found</span>
          </div>

          <div className="space-y-3">
            {SPEED_AUDITS.map((audit) => (
              <div
                key={audit.id}
                className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800 hover:border-neutral-700 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      audit.impact === 'high'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : audit.impact === 'medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}>
                      {audit.impact} impact
                    </span>
                    <span className="text-xs font-semibold text-white">{audit.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    {audit.estimatedSavings}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">{audit.details}</p>

                <div className="text-[10px] font-mono text-neutral-500 truncate" title={audit.affectedUrl}>
                  Target: {audit.affectedUrl}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Device & Form Factor Breakdown */}
        <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-400" />
              Device Form Factor Comparison
            </h3>
            <span className="text-[11px] font-mono text-neutral-400">CrUX Verified</span>
          </div>

          <div className="space-y-4">
            {DEVICE_SPEED_DATA.map((dev) => (
              <div
                key={dev.device}
                className="p-3.5 rounded-lg bg-neutral-950/60 border border-neutral-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {dev.device === 'Desktop' ? (
                      <Laptop className="w-4 h-4 text-blue-400" />
                    ) : dev.device === 'Mobile' ? (
                      <Smartphone className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Layout className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="text-xs font-bold text-white">{dev.device}</span>
                    <span className="text-[10px] font-mono text-neutral-400">({dev.share}% of visits)</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    dev.score >= 90
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                  }`}>
                    {dev.score} / 100
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                  <div className="bg-neutral-900/80 p-1.5 rounded border border-neutral-800">
                    <div className="text-[9px] text-neutral-500">LCP</div>
                    <div className="font-bold text-white mt-0.5">{dev.avgLcp}</div>
                  </div>
                  <div className="bg-neutral-900/80 p-1.5 rounded border border-neutral-800">
                    <div className="text-[9px] text-neutral-500">INP</div>
                    <div className="font-bold text-white mt-0.5">{dev.avgInp}</div>
                  </div>
                  <div className="bg-neutral-900/80 p-1.5 rounded border border-neutral-800">
                    <div className="text-[9px] text-neutral-500">CLS</div>
                    <div className="font-bold text-white mt-0.5">{dev.avgCls}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-neutral-950/40 border border-neutral-800/80 text-xs text-neutral-400 flex items-center justify-between">
            <span>Standard Google CrUX Cadence:</span>
            <span className="font-mono text-white">28-day rolling window</span>
          </div>
        </div>
      </div>
    </div>
  );
};
