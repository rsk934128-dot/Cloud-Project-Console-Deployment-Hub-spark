import React, { useState } from 'react';
import {
  Flag,
  Search,
  Plus,
  Sliders,
  Check,
  Copy,
  Code2,
  History,
  Shield,
  Trash2,
  Settings,
  Sparkles,
  Users,
  ChevronRight,
  RefreshCw,
  Terminal,
  ExternalLink,
  Layers,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { FeatureFlag, Environment, FlagType, TargetingRule, FlagAuditLog } from '../types/flags';
import { INITIAL_FLAGS, INITIAL_FLAG_AUDIT_LOGS } from '../data/flagsData';

interface FlagsConsoleProps {
  onNotify?: (msg: string) => void;
}

export const FlagsConsole: React.FC<FlagsConsoleProps> = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [auditLogs, setAuditLogs] = useState<FlagAuditLog[]>(INITIAL_FLAG_AUDIT_LOGS);
  const [currentEnv, setCurrentEnv] = useState<Environment>('production');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Active view mode
  const [viewMode, setViewMode] = useState<'flags' | 'simulator' | 'audit'>('flags');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedFlagForRules, setSelectedFlagForRules] = useState<FeatureFlag | null>(null);
  const [selectedFlagForSdk, setSelectedFlagForSdk] = useState<FeatureFlag | null>(null);
  const [selectedFlagForJson, setSelectedFlagForJson] = useState<FeatureFlag | null>(null);
  const [jsonEditingValue, setJsonEditingValue] = useState<string>('');

  // Copy state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Evaluation Simulator state
  const [simContext, setSimContext] = useState({
    userId: 'usr_enterprise_99a',
    email: 'dev.lead@enterprise.com',
    plan: 'enterprise',
    country: 'US',
    appVersion: '2.5.0'
  });

  // New Flag form state
  const [newFlagForm, setNewFlagForm] = useState({
    key: '',
    name: '',
    description: '',
    type: 'boolean' as FlagType,
    tags: 'UI/UX',
    initialEnabled: true,
    initialRollout: 100
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle flag in current environment
  const handleToggleFlag = (flagId: string) => {
    setFlags(prev =>
      prev.map(flag => {
        if (flag.id !== flagId) return flag;
        const currentConfig = flag.environments[currentEnv];
        const newEnabled = !currentConfig.enabled;

        // Log audit event
        const newAudit: FlagAuditLog = {
          id: `log-${Date.now()}`,
          flagKey: flag.key,
          environment: currentEnv,
          action: newEnabled ? 'Flag Enabled' : 'Flag Disabled',
          user: 'you (Console Operator)',
          timestamp: 'Just now',
          diffSummary: `Toggled state to ${newEnabled ? 'ENABLED' : 'DISABLED'}`
        };
        setAuditLogs(logs => [newAudit, ...logs]);

        return {
          ...flag,
          updatedAt: 'Just now',
          environments: {
            ...flag.environments,
            [currentEnv]: {
              ...currentConfig,
              enabled: newEnabled
            }
          }
        };
      })
    );
  };

  // Adjust rollout percentage
  const handleRolloutChange = (flagId: string, percentage: number) => {
    setFlags(prev =>
      prev.map(flag => {
        if (flag.id !== flagId) return flag;
        const currentConfig = flag.environments[currentEnv];
        return {
          ...flag,
          updatedAt: 'Just now',
          environments: {
            ...flag.environments,
            [currentEnv]: {
              ...currentConfig,
              rolloutPercentage: percentage,
              enabled: percentage > 0
            }
          }
        };
      })
    );
  };

  // Create new flag
  const handleCreateFlag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagForm.key.trim() || !newFlagForm.name.trim()) return;

    const cleanKey = newFlagForm.key.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    const tagsArray = newFlagForm.tags.split(',').map(t => t.trim()).filter(Boolean);

    const newFlag: FeatureFlag = {
      id: `flag-${Date.now().toString(36)}`,
      key: cleanKey,
      name: newFlagForm.name.trim(),
      description: newFlagForm.description.trim() || 'No description provided.',
      type: newFlagForm.type,
      tags: tagsArray.length > 0 ? tagsArray : ['Custom'],
      status: 'active',
      createdAt: 'Just now',
      updatedAt: 'Just now',
      updatedBy: 'you (Console Operator)',
      environments: {
        production: {
          enabled: newFlagForm.initialEnabled,
          rolloutPercentage: newFlagForm.initialRollout,
          value: newFlagForm.type === 'json' ? '{\n  "version": 1\n}' : true,
          rules: []
        },
        staging: {
          enabled: true,
          rolloutPercentage: 100,
          value: newFlagForm.type === 'json' ? '{\n  "version": 1\n}' : true,
          rules: []
        },
        preview: {
          enabled: true,
          rolloutPercentage: 100,
          value: newFlagForm.type === 'json' ? '{\n  "version": 1\n}' : true,
          rules: []
        }
      }
    };

    setFlags(prev => [newFlag, ...prev]);

    // Add audit log
    const audit: FlagAuditLog = {
      id: `log-${Date.now()}`,
      flagKey: cleanKey,
      environment: currentEnv,
      action: 'Flag Created',
      user: 'you (Console Operator)',
      timestamp: 'Just now',
      diffSummary: `Created new ${newFlagForm.type} flag with ${newFlagForm.initialRollout}% rollout in ${currentEnv}`
    };
    setAuditLogs(prev => [audit, ...prev]);

    setIsCreateModalOpen(false);
    setNewFlagForm({
      key: '',
      name: '',
      description: '',
      type: 'boolean',
      tags: 'UI/UX',
      initialEnabled: true,
      initialRollout: 100
    });
  };

  // Delete flag
  const handleDeleteFlag = (flagId: string, flagKey: string) => {
    if (!window.confirm(`Are you sure you want to delete feature flag "${flagKey}"?`)) return;
    setFlags(prev => prev.filter(f => f.id !== flagId));
    setAuditLogs(prev => [
      {
        id: `log-${Date.now()}`,
        flagKey,
        environment: currentEnv,
        action: 'Flag Deleted',
        user: 'you (Console Operator)',
        timestamp: 'Just now',
        diffSummary: `Deleted feature flag from all environments`
      },
      ...prev
    ]);
  };

  // Save JSON config
  const handleSaveJsonConfig = () => {
    if (!selectedFlagForJson) return;
    try {
      JSON.parse(jsonEditingValue);
    } catch (e) {
      alert('Invalid JSON payload. Please ensure syntax is valid.');
      return;
    }

    setFlags(prev =>
      prev.map(flag => {
        if (flag.id !== selectedFlagForJson.id) return flag;
        return {
          ...flag,
          updatedAt: 'Just now',
          environments: {
            ...flag.environments,
            [currentEnv]: {
              ...flag.environments[currentEnv],
              value: jsonEditingValue
            }
          }
        };
      })
    );

    setSelectedFlagForJson(null);
  };

  // Evaluation logic for simulator
  const evaluateFlag = (flag: FeatureFlag) => {
    const config = flag.environments[currentEnv];
    if (!config.enabled) {
      return { evaluatedValue: false, reason: 'Flag is OFF in current environment', matchedRule: null };
    }

    // Check targeting rules
    for (const rule of config.rules) {
      let matched = false;
      const attrVal = (simContext as any)[rule.attribute];
      if (rule.operator === 'in_list' && rule.values.includes(attrVal)) {
        matched = true;
      } else if (rule.operator === 'equals' && rule.values[0] === attrVal) {
        matched = true;
      }
      if (matched) {
        return {
          evaluatedValue: rule.serveValue,
          reason: `Targeting Rule match: ${rule.attribute} IN [${rule.values.join(', ')}]`,
          matchedRule: rule
        };
      }
    }

    // Percentage rollout simulation based on hash of userId + flagKey
    if (flag.type === 'percentage') {
      const pseudoHash = Math.abs(
        (simContext.userId + flag.key)
          .split('')
          .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100
      );
      const isIncluded = pseudoHash < config.rolloutPercentage;
      return {
        evaluatedValue: isIncluded,
        reason: isIncluded
          ? `User hash bucket ${pseudoHash}% is within ${config.rolloutPercentage}% rollout range`
          : `User hash bucket ${pseudoHash}% is outside ${config.rolloutPercentage}% rollout range`,
        matchedRule: null
      };
    }

    if (flag.type === 'multivariate') {
      return {
        evaluatedValue: config.value,
        reason: `Serving variant "${config.value}" to target segment`,
        matchedRule: null
      };
    }

    if (flag.type === 'json') {
      return {
        evaluatedValue: 'JSON Config Payload',
        reason: 'Serving active remote JSON config',
        matchedRule: null
      };
    }

    return {
      evaluatedValue: config.value ?? true,
      reason: 'Standard 100% rollout default',
      matchedRule: null
    };
  };

  // Tag extraction
  const allTags = Array.from(new Set(flags.flatMap(f => f.tags)));

  // Filtered flags
  const filteredFlags = flags.filter(flag => {
    const matchesSearch =
      flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || flag.tags.includes(selectedTag);
    const matchesStatus = selectedStatus === 'all' || flag.status === selectedStatus;
    return matchesSearch && matchesTag && matchesStatus;
  });

  const enabledCount = flags.filter(f => f.environments[currentEnv].enabled).length;

  return (
    <div className="space-y-6">
      {/* Top Header & Environment Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">Feature Flags & Remote Config</h1>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Edge Evaluated (0.4ms)
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Safely decouple deployment from release. Toggle feature gates, execute canary rollouts, and deliver dynamic JSON configurations without redeploying code.
          </p>
        </div>

        {/* Environment Switcher Pills & Action */}
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-1 flex items-center gap-1">
            {(['production', 'staging', 'preview'] as Environment[]).map((env) => {
              const isSelected = currentEnv === env;
              return (
                <button
                  key={env}
                  onClick={() => setCurrentEnv(env)}
                  className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-colors flex items-center gap-1.5 ${
                    isSelected
                      ? env === 'production'
                        ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                        : 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      env === 'production'
                        ? 'bg-emerald-400'
                        : env === 'staging'
                        ? 'bg-amber-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  {env}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Flag
          </button>
        </div>
      </div>

      {/* Global Telemetry Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Active Flags</span>
            <Flag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{flags.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">
            <span className="text-emerald-400 font-semibold">{enabledCount} enabled</span> in {currentEnv}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Canary / Percentage</span>
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {flags.filter(f => f.type === 'percentage').length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Gradual rollouts active
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Edge Latency</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">0.38 ms</div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Evaluated in Anycast V8 worker
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Audit Changes</span>
            <History className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">{auditLogs.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Latest: {auditLogs[0]?.timestamp || 'Never'}
          </div>
        </div>
      </div>

      {/* Main View Tabs (Flags Browser, Simulator Sandbox, Audit Logs) */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setViewMode('flags')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            viewMode === 'flags'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Flag className="w-4 h-4" />
          Flag Catalog
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {filteredFlags.length}
          </span>
        </button>

        <button
          onClick={() => setViewMode('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            viewMode === 'simulator'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Evaluation Sandbox (Simulator)
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
            Live Testing
          </span>
        </button>

        <button
          onClick={() => setViewMode('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            viewMode === 'audit'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <History className="w-4 h-4" />
          Audit & Change Log
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* VIEW MODE 1: FLAGS CATALOG */}
      {viewMode === 'flags' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search flags by key, name, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg p-1 text-xs">
                <span className="text-neutral-500 px-1 text-[11px]">Tag:</span>
                <button
                  onClick={() => setSelectedTag('all')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    selectedTag === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      selectedTag === tag ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Flags List */}
          <div className="space-y-3">
            {filteredFlags.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-xs text-neutral-500">
                No feature flags found matching query. Click "Create Flag" to register a new toggle.
              </div>
            ) : (
              filteredFlags.map((flag) => {
                const envConfig = flag.environments[currentEnv];
                const isEnabled = envConfig.enabled;

                return (
                  <div
                    key={flag.id}
                    className={`bg-neutral-900 border transition-all rounded-xl p-4.5 ${
                      isEnabled ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-850 opacity-80'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Info & Key */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleCopy(flag.key, flag.id)}
                            className="font-mono text-xs font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-1.5 group"
                            title="Click to copy flag key"
                          >
                            <span>{flag.key}</span>
                            {copiedKey === flag.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-neutral-600 group-hover:text-neutral-300" />
                            )}
                          </button>

                          {/* Type Pill */}
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium capitalize bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {flag.type}
                          </span>

                          {/* Tags */}
                          {flag.tags.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-neutral-950 text-neutral-400 border border-neutral-800"
                            >
                              {t}
                            </span>
                          ))}

                          {/* Status */}
                          {flag.status === 'draft' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              Draft
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-medium text-neutral-200">{flag.name}</div>
                        <p className="text-xs text-neutral-400 line-clamp-1 max-w-2xl">{flag.description}</p>

                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-1">
                          <span>Updated {flag.updatedAt} by <strong className="text-neutral-400">{flag.updatedBy}</strong></span>
                          {envConfig.rules.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-blue-400 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {envConfig.rules.length} custom targeting rule{envConfig.rules.length > 1 ? 's' : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Rollout Controls & State Toggle */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:border-l lg:border-neutral-800 lg:pl-5">
                        {/* Percentage Slider if type === percentage */}
                        {flag.type === 'percentage' && (
                          <div className="flex flex-col gap-1 w-full sm:w-36">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-neutral-400">Canary Rollout</span>
                              <span className="font-mono font-bold text-white">{envConfig.rolloutPercentage}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="5"
                              value={envConfig.rolloutPercentage}
                              onChange={(e) => handleRolloutChange(flag.id, parseInt(e.target.value))}
                              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                          </div>
                        )}

                        {/* JSON Payload Preview Button */}
                        {flag.type === 'json' && (
                          <button
                            onClick={() => {
                              setSelectedFlagForJson(flag);
                              setJsonEditingValue(envConfig.value);
                            }}
                            className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-mono transition-colors border border-neutral-700 flex items-center gap-1.5"
                          >
                            <Code2 className="w-3.5 h-3.5 text-blue-400" />
                            View JSON ({envConfig.value.length} B)
                          </button>
                        )}

                        {/* Master Toggle Button */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleFlag(flag.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              isEnabled ? 'bg-emerald-500' : 'bg-neutral-750'
                            }`}
                            title={`Toggle flag in ${currentEnv}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isEnabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-semibold uppercase tracking-wide ${isEnabled ? 'text-emerald-400' : 'text-neutral-500'}`}>
                            {isEnabled ? 'ON' : 'OFF'}
                          </span>
                        </div>

                        {/* Dropdown / Action options */}
                        <div className="flex items-center gap-1 border-l border-neutral-800 pl-3">
                          <button
                            onClick={() => setSelectedFlagForRules(flag)}
                            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                            title="Targeting Rules & Segments"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedFlagForSdk(flag)}
                            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                            title="Code SDK Snippet"
                          >
                            <Code2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFlag(flag.id, flag.key)}
                            className="p-1.5 text-neutral-500 hover:text-red-400 rounded hover:bg-red-950/20 transition-colors"
                            title="Delete Flag"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: EVALUATION SIMULATOR / SANDBOX */}
      {viewMode === 'simulator' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div>
              <h2 className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-purple-400" />
                Live Flag Evaluation Sandbox ({currentEnv})
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Simulate how Cloudmesh Edge evaluates targeting rules, percentage hash buckets, and multivariate assignments for any user context.
              </p>
            </div>

            {/* Input Attributes */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">User ID</label>
                <input
                  type="text"
                  value={simContext.userId}
                  onChange={(e) => setSimContext({ ...simContext, userId: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">Email</label>
                <input
                  type="text"
                  value={simContext.email}
                  onChange={(e) => setSimContext({ ...simContext, email: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">Plan / Tier</label>
                <select
                  value={simContext.plan}
                  onChange={(e) => setSimContext({ ...simContext, plan: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
                >
                  <option value="enterprise">enterprise</option>
                  <option value="scale_pro">scale_pro</option>
                  <option value="pro">pro</option>
                  <option value="free">free</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">Country</label>
                <select
                  value={simContext.country}
                  onChange={(e) => setSimContext({ ...simContext, country: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
                >
                  <option value="US">US (United States)</option>
                  <option value="CA">CA (Canada)</option>
                  <option value="DE">DE (Germany)</option>
                  <option value="GB">GB (United Kingdom)</option>
                  <option value="JP">JP (Japan)</option>
                  <option value="BR">BR (Brazil)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-neutral-400 uppercase font-mono block mb-1">App Version</label>
                <input
                  type="text"
                  value={simContext.appVersion}
                  onChange={(e) => setSimContext({ ...simContext, appVersion: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>
          </div>

          {/* Evaluated Output Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-neutral-800 bg-neutral-950/50 text-xs font-semibold text-neutral-300">
              Evaluated Flags for User Context
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-950/80 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="px-4 py-2.5">Flag Key</th>
                    <th className="px-4 py-2.5">Evaluated Value</th>
                    <th className="px-4 py-2.5">Evaluation Reason</th>
                    <th className="px-4 py-2.5 text-right">Edge Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {flags.map((flag) => {
                    const evalResult = evaluateFlag(flag);
                    const isValTrue = evalResult.evaluatedValue === true || (typeof evalResult.evaluatedValue === 'string' && evalResult.evaluatedValue !== 'false');

                    return (
                      <tr key={flag.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="px-4 py-3 text-white font-semibold flex items-center gap-2">
                          <Flag className="w-3.5 h-3.5 text-neutral-500" />
                          <span>{flag.key}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              isValTrue
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {String(evalResult.evaluatedValue)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-300 text-[11px]">
                          {evalResult.reason}
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-400 font-mono text-[11px]">
                          0.3ms
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: AUDIT & CHANGE LOG */}
      {viewMode === 'audit' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-neutral-800 bg-neutral-950/40 flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Audit & Compliance Log</span>
            <span className="text-neutral-400">All administrative mutations are signed & immutable</span>
          </div>

          <div className="divide-y divide-neutral-800">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-neutral-850 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-white">{log.flagKey}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                      {log.environment}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-neutral-300 text-[11px]">{log.diffSummary}</p>
                </div>

                <div className="text-right text-[11px] text-neutral-400">
                  <div>by <strong className="text-neutral-200">{log.user}</strong></div>
                  <div className="text-neutral-500 mt-0.5">{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE NEW FEATURE FLAG */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-semibold text-white">Create Feature Flag</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFlag} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Flag Key (Unique Identifier) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. enable_v2_checkout_flow"
                  value={newFlagForm.key}
                  onChange={(e) => setNewFlagForm({ ...newFlagForm, key: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-neutral-600"
                  required
                />
                <p className="text-[11px] text-neutral-500 mt-1">Lowercase letters, numbers, and underscores.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Optimized Checkout v2"
                  value={newFlagForm.name}
                  onChange={(e) => setNewFlagForm({ ...newFlagForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why this flag exists and what behavior it controls..."
                  value={newFlagForm.description}
                  onChange={(e) => setNewFlagForm({ ...newFlagForm, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Flag Type
                  </label>
                  <select
                    value={newFlagForm.type}
                    onChange={(e) => setNewFlagForm({ ...newFlagForm, type: e.target.value as FlagType })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="boolean">Boolean (On/Off)</option>
                    <option value="percentage">Percentage Rollout</option>
                    <option value="multivariate">Multivariate (A/B/C)</option>
                    <option value="json">JSON Remote Config</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={newFlagForm.tags}
                    onChange={(e) => setNewFlagForm({ ...newFlagForm, tags: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="initEnabled"
                    checked={newFlagForm.initialEnabled}
                    onChange={(e) => setNewFlagForm({ ...newFlagForm, initialEnabled: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-700 text-emerald-500 focus:ring-0"
                  />
                  <label htmlFor="initEnabled" className="text-xs text-neutral-300">
                    Enable immediately in {currentEnv}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors shadow-sm"
                  >
                    Create Flag
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SDK CODE SNIPPETS */}
      {selectedFlagForSdk && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-400" />
                  Code SDK Integration
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedFlagForSdk.key}</p>
              </div>
              <button
                onClick={() => setSelectedFlagForSdk(null)}
                className="text-neutral-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* React Snippet */}
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                  <span className="font-semibold text-white">React / Next.js Hook</span>
                  <button
                    onClick={() => handleCopy(`import { useFeatureFlag } from '@cloudmesh/flags-react';

export function FeatureGate() {
  const isEnabled = useFeatureFlag('${selectedFlagForSdk.key}', { default: false });

  if (!isEnabled) return null;
  return <NewExperienceComponent />;
}`, 'sdk-react')}
                    className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1"
                  >
                    {copiedKey === 'sdk-react' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-[11px] text-neutral-300 overflow-x-auto">
{`import { useFeatureFlag } from '@cloudmesh/flags-react';

export function FeatureGate() {
  const isEnabled = useFeatureFlag('${selectedFlagForSdk.key}', { default: false });

  if (!isEnabled) return null;
  return <NewExperienceComponent />;
}`}
                </pre>
              </div>

              {/* Node / Edge / Cloudflare Worker */}
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                  <span className="font-semibold text-white">Edge Middleware / Node.js</span>
                  <button
                    onClick={() => handleCopy(`import { evaluateFlag } from '@cloudmesh/flags-edge';

const { isEnabled, value } = await evaluateFlag('${selectedFlagForSdk.key}', {
  userId: req.user.id,
  country: req.geo.country
});`, 'sdk-edge')}
                    className="text-blue-400 hover:text-blue-300 text-[11px] flex items-center gap-1"
                  >
                    {copiedKey === 'sdk-edge' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                </div>
                <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg font-mono text-[11px] text-neutral-300 overflow-x-auto">
{`import { evaluateFlag } from '@cloudmesh/flags-edge';

const { isEnabled, value } = await evaluateFlag('${selectedFlagForSdk.key}', {
  userId: req.user.id,
  country: req.geo.country
});`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: TARGETING RULES MODAL */}
      {selectedFlagForRules && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Targeting Rules ({currentEnv})
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedFlagForRules.key}</p>
              </div>
              <button
                onClick={() => setSelectedFlagForRules(null)}
                className="text-neutral-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-neutral-400">
                Custom segments and targeting conditions evaluated in top-to-bottom order prior to percentage hash fallback.
              </p>

              {selectedFlagForRules.environments[currentEnv].rules.length === 0 ? (
                <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-xl text-center text-xs text-neutral-500">
                  No targeting rules defined for this flag in {currentEnv}. Flag evaluates using default percentage and environment toggle state.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedFlagForRules.environments[currentEnv].rules.map((rule, idx) => (
                    <div key={rule.id} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between text-xs">
                      <div className="font-mono">
                        <span className="text-neutral-500 mr-2 font-sans font-bold">Rule {idx + 1}:</span>
                        <span className="text-purple-400 font-semibold">{rule.attribute}</span>{' '}
                        <span className="text-neutral-400">{rule.operator}</span>{' '}
                        <span className="text-emerald-400 font-bold">[{rule.values.join(', ')}]</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                        SERVE: {String(rule.serveValue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-neutral-800 flex justify-end">
                <button
                  onClick={() => setSelectedFlagForRules(null)}
                  className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: JSON CONFIG MODAL */}
      {selectedFlagForJson && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-400" />
                  Remote JSON Configuration Payload ({currentEnv})
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">{selectedFlagForJson.key}</p>
              </div>
              <button
                onClick={() => setSelectedFlagForJson(null)}
                className="text-neutral-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <textarea
                value={jsonEditingValue}
                onChange={(e) => setJsonEditingValue(e.target.value)}
                rows={12}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 font-mono text-xs text-emerald-400 focus:outline-none focus:border-neutral-600 resize-none font-medium leading-relaxed"
              />

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 font-mono">
                  Payload size: {jsonEditingValue.length} bytes
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedFlagForJson(null)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveJsonConfig}
                    className="px-4 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors shadow-sm"
                  >
                    Save Payload
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
