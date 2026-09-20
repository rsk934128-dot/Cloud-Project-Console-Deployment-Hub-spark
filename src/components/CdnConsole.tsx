import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import { 
  CdnCacheRule, 
  CachePurgeJob, 
  EdgePopStatus, 
  CacheStatusRatio, 
  CdnOptimizationSetting 
} from '../types/cdn';
import { 
  INITIAL_CACHE_RULES, 
  INITIAL_PURGE_JOBS, 
  EDGE_POPS, 
  CACHE_STATUS_RATIOS, 
  CDN_OPTIMIZATIONS 
} from '../data/cdnData';
import { 
  Globe, 
  Zap, 
  RefreshCw, 
  Trash2, 
  Plus, 
  Search, 
  Sliders, 
  ShieldCheck, 
  Server, 
  Layers, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  X, 
  ChevronDown, 
  Flame, 
  Cpu, 
  ArrowUpRight,
  Database,
  ExternalLink,
  Check
} from 'lucide-react';

interface CdnConsoleProps {
  projects: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
}

export const CdnConsole: React.FC<CdnConsoleProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [activeTab, setActiveTab] = useState<'rules' | 'pops' | 'purges' | 'optimizations'>('rules');

  // State collections
  const [rules, setRules] = useState<CdnCacheRule[]>(INITIAL_CACHE_RULES);
  const [purgeJobs, setPurgeJobs] = useState<CachePurgeJob[]>(INITIAL_PURGE_JOBS);
  const [optimizations, setOptimizations] = useState<CdnOptimizationSetting[]>(CDN_OPTIMIZATIONS);
  const [edgePops, setEdgePops] = useState<EdgePopStatus[]>(EDGE_POPS);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Purge Modal State
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState<boolean>(false);
  const [purgeType, setPurgeType] = useState<'url' | 'tag' | 'everything' | 'prefix'>('url');
  const [purgeTarget, setPurgeTarget] = useState<string>('https://ais-dev-4duhlb32z6wpmvildo3auf.asia-east1.run.app/assets/hero.avif');
  const [isPurging, setIsPurging] = useState<boolean>(false);

  // Add Rule Modal State
  const [isAddRuleOpen, setIsAddRuleOpen] = useState<boolean>(false);
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRulePattern, setNewRulePattern] = useState<string>('/api/v2/catalog/**');
  const [newRuleType, setNewRuleType] = useState<'static' | 'dynamic' | 'bypass'>('dynamic');
  const [newRuleTtl, setNewRuleTtl] = useState<string>('300 seconds');
  const [newRuleSwr, setNewRuleSwr] = useState<string>('86400 seconds');
  const [newRuleDescription, setNewRuleDescription] = useState<string>('');

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Toggle cache rule active state
  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = !r.enabled;
          showToast(`Cache rule "${r.name}" is now ${updated ? 'Active' : 'Disabled'}.`);
          return { ...r, enabled: updated };
        }
        return r;
      })
    );
  };

  // Delete cache rule
  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    showToast('Cache routing rule removed.');
  };

  // Toggle CDN Optimization switch
  const handleToggleOptimization = (id: string) => {
    setOptimizations((prev) =>
      prev.map((opt) => {
        if (opt.id === id) {
          const updated = !opt.enabled;
          showToast(`Feature "${opt.name}" is now ${updated ? 'Enabled' : 'Disabled'} across all 320 PoPs.`);
          return { ...opt, enabled: updated };
        }
        return opt;
      })
    );
  };

  // Trigger Purge execution
  const handleExecutePurge = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPurging(true);

    setTimeout(() => {
      setIsPurging(false);
      setIsPurgeModalOpen(false);

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

      const newJob: CachePurgeJob = {
        id: `prg-${Date.now()}`,
        type: purgeType,
        target: purgeType === 'everything' ? 'All Cached Assets (*)' : purgeTarget,
        timestamp: timeStr,
        status: 'completed',
        durationMs: Math.floor(Math.random() * 60) + 45,
        initiatedBy: 'rasadsk007@gmail.com',
        popsCount: 320
      };

      setPurgeJobs((prev) => [newJob, ...prev]);
      showToast(`Purged successfully across 320 Edge PoPs in ${newJob.durationMs}ms!`);
    }, 900);
  };

  // Create new rule
  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: CdnCacheRule = {
      id: `rule-${Date.now()}`,
      name: newRuleName,
      pattern: newRulePattern,
      cacheTtl: newRuleTtl,
      staleWhileRevalidateTtl: newRuleSwr,
      browserTtl: newRuleType === 'static' ? '30 days' : '0 seconds',
      enabled: true,
      type: newRuleType,
      description: newRuleDescription || 'User-defined edge cache policy'
    };

    setRules((prev) => [newRule, ...prev]);
    setIsAddRuleOpen(false);
    setNewRuleName('');
    setNewRuleDescription('');
    showToast(`Deployed edge cache rule: "${newRule.name}"`);
  };

  // Filtered Rules
  const filteredRules = useMemo(() => {
    return rules.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.pattern.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rules, searchQuery]);

  return (
    <div id="cdn-console-root" className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white border border-neutral-700 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Global Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            Edge CDN & Global Cache Routing
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Distributed Anycast CDN with 320 Points of Presence, Stale-While-Revalidate caching, and sub-150ms cache invalidation.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Purge Cache Action Button */}
          <button
            id="cdn-open-purge-modal-btn"
            onClick={() => setIsPurgeModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-rose-300 border border-neutral-700 hover:border-rose-600/50 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Purge Cache</span>
          </button>

          {/* Project Selector */}
          <div className="relative">
            <select
              id="cdn-project-filter"
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

          {/* Time Window */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-400">
            {(['24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md transition-colors uppercase ${
                  timeRange === r
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'hover:text-neutral-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Instant Warm Simulation */}
          <button
            id="cdn-warm-edge-btn"
            onClick={() => showToast('Dispatched edge warming crawlers to top 20 metropolitan PoPs.')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Warm Cache</span>
          </button>
        </div>
      </div>

      {/* Key CDN Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Cache Hit Ratio</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">96.2%</div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <span>+1.4%</span>
            <span className="text-neutral-500">improvement</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Edge Bandwidth Out</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">5.21 TB</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Across 320 Anycast PoPs
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Origin Egress Saved</span>
            <Database className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">5.01 TB</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            96.1% origin offload
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Edge Median TTFB</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">14ms</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Origin p50: 180ms
          </div>
        </div>
      </div>

      {/* Cache Status Distribution Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Cache Status Breakdown</span>
            <span className="text-xs text-neutral-400 font-mono">(230,280 Edge Requests)</span>
          </div>
          <span className="text-xs text-emerald-400 font-semibold font-mono">92.8% Instant Response (Hit + Stale)</span>
        </div>

        {/* Segmented Color Bar */}
        <div className="h-3 w-full bg-neutral-950 rounded-full overflow-hidden flex shadow-inner">
          {CACHE_STATUS_RATIOS.map((item) => (
            <div
              key={item.status}
              style={{ width: `${item.percentage}%` }}
              className={`${item.color} h-full transition-all`}
              title={`${item.status}: ${item.percentage}% (${item.count.toLocaleString()} requests)`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 text-xs">
          {CACHE_STATUS_RATIOS.map((item) => (
            <div key={item.status} className="bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold font-mono">
                  <span className={`w-2.5 h-2.5 rounded-sm ${item.color}`}></span>
                  <span className="text-white text-[11px]">{item.status}</span>
                </div>
                <span className="text-white font-mono font-bold text-xs">{item.percentage}%</span>
              </div>
              <div className="text-[10px] text-neutral-400 leading-tight">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-px text-xs font-semibold">
        <button
          id="tab-cdn-rules"
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'border-cyan-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Cache Routing Rules ({rules.length})
        </button>

        <button
          id="tab-cdn-pops"
          onClick={() => setActiveTab('pops')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pops'
              ? 'border-cyan-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Edge PoPs Network ({edgePops.length})
        </button>

        <button
          id="tab-cdn-purges"
          onClick={() => setActiveTab('purges')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'purges'
              ? 'border-cyan-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Purge History ({purgeJobs.length})
        </button>

        <button
          id="tab-cdn-optimizations"
          onClick={() => setActiveTab('optimizations')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'optimizations'
              ? 'border-cyan-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Delivery Optimizations
        </button>
      </div>

      {/* TAB 1: CACHE ROUTING RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">Edge Caching Policies</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Defines HTTP headers, edge NVMe RAM persistence, and background stale-while-revalidate behaviors.
              </p>
            </div>

            <button
              id="btn-create-cdn-rule"
              onClick={() => setIsAddRuleOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Cache Rule</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  rule.enabled
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                      rule.type === 'static'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : rule.type === 'dynamic'
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {rule.type}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-white">{rule.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{rule.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Toggle */}
                    <button
                      id={`toggle-cdn-rule-${rule.id}`}
                      onClick={() => handleToggleRule(rule.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        rule.enabled ? 'bg-cyan-600' : 'bg-neutral-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Pattern & TTLs */}
                <div className="bg-neutral-950/70 p-3 rounded-lg border border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block font-sans">URL Pattern</span>
                    <span className="text-cyan-300 truncate block" title={rule.pattern}>{rule.pattern}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block font-sans">Edge Max-Age</span>
                    <span className="text-neutral-200">{rule.cacheTtl}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block font-sans">Stale While Revalidate</span>
                    <span className="text-indigo-400">{rule.staleWhileRevalidateTtl}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: GLOBAL EDGE POPS TABLE */}
      {activeTab === 'pops' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Edge Point of Presence Telemetry
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Regional metrics for cache hit ratio, outbound bandwidth, and client response latency.
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-400">All 320 Anycast PoPs Operational</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3">PoP Code</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Hit Ratio</th>
                  <th className="pb-3">Bandwidth Served</th>
                  <th className="pb-3">Median Latency</th>
                  <th className="pb-3 pr-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {edgePops.map((pop) => (
                  <tr key={pop.code} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 pl-3">
                      <span className="font-bold text-white bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
                        {pop.code}
                      </span>
                    </td>
                    <td className="py-3 font-sans">
                      <span className="font-semibold text-white">{pop.name}</span>
                      <span className="text-neutral-500 text-[10px] ml-1.5">({pop.country})</span>
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-emerald-400">{pop.hitRatioPercent}%</span>
                    </td>
                    <td className="py-3 text-neutral-200">{pop.bandwidthServed}</td>
                    <td className="py-3">
                      <span className="text-neutral-300">{pop.latencyMs}ms</span>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-sans px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PURGE HISTORY */}
      {activeTab === 'purges' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-rose-400" />
                Cache Invalidation Audit Log
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Globally synchronized cache flushes executed across all 320 Anycast edge nodes.
              </p>
            </div>

            <button
              onClick={() => setIsPurgeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors border border-neutral-700"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>New Purge</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3">Purge Target</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Initiator</th>
                  <th className="pb-3 pr-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {purgeJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 pl-3 text-cyan-300 font-semibold truncate max-w-[280px]" title={job.target}>
                      {job.target}
                    </td>
                    <td className="py-3">
                      <span className="uppercase text-[10px] font-sans font-bold px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {job.type}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-400">{job.timestamp}</td>
                    <td className="py-3 text-neutral-300">{job.durationMs}ms</td>
                    <td className="py-3 text-neutral-400 font-sans text-[11px]">{job.initiatedBy}</td>
                    <td className="py-3 pr-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: DELIVERY OPTIMIZATIONS */}
      {activeTab === 'optimizations' && (
        <div className="space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Edge Delivery Acceleration Features
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Protocol, transport, and compression features applied globally across edge points of presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optimizations.map((opt) => (
              <div
                key={opt.id}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">{opt.name}</h3>
                      {opt.badge && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {opt.badge}
                        </span>
                      )}
                    </div>

                    {/* Toggle */}
                    <button
                      id={`toggle-opt-${opt.id}`}
                      onClick={() => handleToggleOptimization(opt.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        opt.enabled ? 'bg-cyan-600' : 'bg-neutral-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          opt.enabled ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{opt.description}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-neutral-800/80 font-mono text-neutral-500">
                  <span className="capitalize">Category: {opt.category}</span>
                  <span className={opt.enabled ? 'text-emerald-400 font-bold' : 'text-neutral-500'}>
                    {opt.enabled ? 'ACTIVE' : 'DISABLED'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: PURGE CACHE DIALOG */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                Purge Edge Cache
              </h3>
              <button
                onClick={() => setIsPurgeModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecutePurge} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="text-neutral-300 font-semibold block">Purge Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPurgeType('url');
                      setPurgeTarget('https://ais-dev-4duhlb32z6wpmvildo3auf.asia-east1.run.app/assets/hero.avif');
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                      purgeType === 'url'
                        ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Exact URL
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPurgeType('tag');
                      setPurgeTarget('tag:catalog-products');
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                      purgeType === 'tag'
                        ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Cache-Tag
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPurgeType('everything');
                      setPurgeTarget('*');
                    }}
                    className={`py-2 px-3 rounded-lg border text-center font-semibold transition-all ${
                      purgeType === 'everything'
                        ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    Purge All
                  </button>
                </div>
              </div>

              {purgeType !== 'everything' ? (
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">
                    {purgeType === 'url' ? 'URL to Purge' : 'Surrogate Cache-Tag'}
                  </label>
                  <input
                    type="text"
                    required
                    value={purgeTarget}
                    onChange={(e) => setPurgeTarget(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                  <p className="text-[10px] text-neutral-500">
                    {purgeType === 'url' ? 'Flushes the exact cached response from all PoP RAM.' : 'Purges all entries tagged with this x-cache-tag header.'}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Warning: Global Origin Load
                  </div>
                  <p className="text-[11px] text-rose-300">
                    Purging all cached assets will invalidate everything across all 320 edge nodes. Next requests will hit origin servers until repopulated.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsPurgeModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPurging}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
                  <span>{isPurging ? 'Broadcasting...' : 'Execute Instant Purge'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CACHE RULE */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Create Edge Cache Rule
              </h3>
              <button
                onClick={() => setIsAddRuleOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Products API Stale While Revalidate"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">URL Path Pattern</label>
                <input
                  type="text"
                  required
                  value={newRulePattern}
                  onChange={(e) => setNewRulePattern(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Cache Strategy</label>
                  <select
                    value={newRuleType}
                    onChange={(e) => setNewRuleType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="dynamic">Dynamic (Stale-While-Revalidate)</option>
                    <option value="static">Static / Immutable</option>
                    <option value="bypass">Bypass Cache (Pass Through)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Edge Max-Age</label>
                  <input
                    type="text"
                    value={newRuleTtl}
                    onChange={(e) => setNewRuleTtl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Stale-While-Revalidate Window</label>
                <input
                  type="text"
                  value={newRuleSwr}
                  onChange={(e) => setNewRuleSwr(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Description</label>
                <input
                  type="text"
                  placeholder="Optional notes about cache behavior"
                  value={newRuleDescription}
                  onChange={(e) => setNewRuleDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold"
                >
                  Deploy Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
