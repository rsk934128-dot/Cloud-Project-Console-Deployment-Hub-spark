import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import {
  DeploymentRecord,
  DiffChangeType,
  LogDiffRow
} from '../types/deploymentComparison';
import {
  getDeploymentsForProject,
  calculateEnvVarDiff,
  calculateConfigDiff,
  calculateDependencyDiff,
  calculateLogDiff
} from '../data/deploymentComparisonData';
import {
  ArrowLeftRight,
  GitBranch,
  Clock,
  HardDrive,
  Zap,
  Terminal,
  Copy,
  Check,
  Search,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Shield,
  FileCode,
  Sliders,
  Cpu,
  Globe,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Split,
  Layers,
  Filter,
  Flame,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

interface DeploymentComparisonProps {
  projects: ProjectItem[];
  initialProjectId?: string;
  onBackToDeploymentsList?: () => void;
  onSelectProject?: (p: ProjectItem) => void;
}

export const DeploymentComparison: React.FC<DeploymentComparisonProps> = ({
  projects,
  initialProjectId,
  onBackToDeploymentsList,
  onSelectProject
}) => {
  // Selected Project state
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    initialProjectId || (projects[0]?.id || 'p-1')
  );

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || projects[0];
  }, [projects, selectedProjectId]);

  // Deployments for selected project
  const deployments = useMemo(() => {
    return getDeploymentsForProject(selectedProjectId, currentProject);
  }, [selectedProjectId, currentProject]);

  // Deployment A (Base / Reference - usually latest or left side)
  const [deploymentAId, setDeploymentAId] = useState<string>(() => {
    return deployments[0]?.id || '';
  });

  // Deployment B (Target / Comparison - usually previous or right side)
  const [deploymentBId, setDeploymentBId] = useState<string>(() => {
    return deployments[1]?.id || deployments[0]?.id || '';
  });

  // Keep A and B synced when project changes
  React.useEffect(() => {
    if (deployments.length > 0) {
      setDeploymentAId(deployments[0].id);
      setDeploymentBId(deployments[1]?.id || deployments[0].id);
    }
  }, [deployments]);

  const deploymentA = useMemo(() => {
    return deployments.find(d => d.id === deploymentAId) || deployments[0];
  }, [deployments, deploymentAId]);

  const deploymentB = useMemo(() => {
    return deployments.find(d => d.id === deploymentBId) || deployments[1] || deployments[0];
  }, [deployments, deploymentBId]);

  // Active comparison tab
  const [activeTab, setActiveTab] = useState<'config' | 'logs' | 'overview' | 'dependencies'>('config');

  // Config tab sub-filter
  const [configFilter, setConfigFilter] = useState<'all' | 'changed' | 'env' | 'runtime'>('changed');
  const [revealSecrets, setRevealSecrets] = useState<boolean>(false);

  // Logs filters
  const [logSearch, setLogSearch] = useState<string>('');
  const [logStageFilter, setLogStageFilter] = useState<string>('all');
  const [logLevelFilter, setLogLevelFilter] = useState<string>('all');
  const [showChangedLogsOnly, setShowChangedLogsOnly] = useState<boolean>(false);
  const [logViewMode, setLogViewMode] = useState<'split' | 'unified'>('split');

  // Copy notification state
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Rollback simulation state
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState<boolean>(false);
  const [rollbackProgress, setRollbackProgress] = useState<number>(0);
  const [rollbackStatus, setRollbackStatus] = useState<'idle' | 'in_progress' | 'completed'>('idle');

  // Computed Diffs
  const envDiff = useMemo(() => {
    if (!deploymentA || !deploymentB) return [];
    return calculateEnvVarDiff(deploymentA, deploymentB);
  }, [deploymentA, deploymentB]);

  const configDiff = useMemo(() => {
    if (!deploymentA || !deploymentB) return [];
    return calculateConfigDiff(deploymentA, deploymentB);
  }, [deploymentA, deploymentB]);

  const depDiff = useMemo(() => {
    if (!deploymentA || !deploymentB) return [];
    return calculateDependencyDiff(deploymentA, deploymentB);
  }, [deploymentA, deploymentB]);

  const logDiff = useMemo(() => {
    if (!deploymentA || !deploymentB) return [];
    return calculateLogDiff(deploymentA, deploymentB);
  }, [deploymentA, deploymentB]);

  // Summary counts
  const envChangedCount = envDiff.filter(d => d.type !== 'unchanged').length;
  const configChangedCount = configDiff.filter(d => d.type !== 'unchanged').length;
  const depChangedCount = depDiff.filter(d => d.type !== 'unchanged').length;
  const totalChangedSettings = envChangedCount + configChangedCount + depChangedCount;

  // Swap Deployments A and B
  const handleSwapDeployments = () => {
    const temp = deploymentAId;
    setDeploymentAId(deploymentBId);
    setDeploymentBId(temp);
  };

  // Quick Preset Handlers
  const handleApplyPreset = (preset: 'latest_vs_prev' | 'prod_vs_staging' | 'pass_vs_fail') => {
    if (preset === 'latest_vs_prev') {
      if (deployments.length >= 2) {
        setDeploymentAId(deployments[0].id);
        setDeploymentBId(deployments[1].id);
      }
    } else if (preset === 'prod_vs_staging') {
      const prod = deployments.find(d => d.environment === 'Production') || deployments[0];
      const staging = deployments.find(d => d.environment === 'Staging' || d.environment === 'Preview') || deployments[1] || deployments[0];
      setDeploymentAId(prod.id);
      setDeploymentBId(staging.id);
    } else if (preset === 'pass_vs_fail') {
      const errorDep = deployments.find(d => d.status === 'ERROR') || deployments[deployments.length - 1];
      const readyDep = deployments.find(d => d.status === 'READY') || deployments[0];
      setDeploymentAId(readyDep.id);
      setDeploymentBId(errorDep.id);
    }
  };

  // Copy Diff Report to Clipboard
  const handleCopyDiffReport = () => {
    if (!deploymentA || !deploymentB) return;
    const report = `
# Deployment Comparison Report
Project: ${currentProject?.displayName} (${selectedProjectId})
Base (A): #${deploymentA.deploymentNumber} ${deploymentA.version} (${deploymentA.status}) - ${deploymentA.commitHash}
Target (B): #${deploymentB.deploymentNumber} ${deploymentB.version} (${deploymentB.status}) - ${deploymentB.commitHash}

## Performance Delta
- Duration: ${deploymentA.duration} vs ${deploymentB.duration} (${deploymentA.durationSeconds - deploymentB.durationSeconds}s)
- Bundle Size: ${deploymentA.bundleSize} vs ${deploymentB.bundleSize}
- Cache Hit Rate: ${deploymentA.cacheHitRate}% vs ${deploymentB.cacheHitRate}%

## Changed Environment Variables (${envChangedCount})
${envDiff.filter(e => e.type !== 'unchanged').map(e => `[${e.type.toUpperCase()}] ${e.key}: ${e.baseValue ?? 'none'} -> ${e.targetValue ?? 'none'}`).join('\n')}

## Changed Configuration (${configChangedCount})
${configDiff.filter(c => c.type !== 'unchanged').map(c => `[MODIFIED] ${c.label}: ${c.baseValue} -> ${c.targetValue}`).join('\n')}

## Changed Dependencies (${depChangedCount})
${depDiff.filter(d => d.type !== 'unchanged').map(d => `[${d.type.toUpperCase()}] ${d.packageName}: ${d.baseVersion ?? 'none'} -> ${d.targetVersion ?? 'none'}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(report);
    setCopiedNotification('Comparison report copied to clipboard');
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  // Trigger Simulated Rollback
  const handleStartRollback = () => {
    setRollbackStatus('in_progress');
    setRollbackProgress(15);
    setTimeout(() => setRollbackProgress(45), 600);
    setTimeout(() => setRollbackProgress(80), 1300);
    setTimeout(() => {
      setRollbackProgress(100);
      setRollbackStatus('completed');
    }, 2000);
  };

  // Filtered Logs
  const filteredLogRows = useMemo(() => {
    return logDiff.filter(row => {
      if (showChangedLogsOnly && row.diffStatus === 'match') return false;

      if (logStageFilter !== 'all') {
        const baseMatch = row.baseLog?.stage === logStageFilter;
        const targetMatch = row.targetLog?.stage === logStageFilter;
        if (!baseMatch && !targetMatch) return false;
      }

      if (logLevelFilter !== 'all') {
        const baseMatch = row.baseLog?.level === logLevelFilter;
        const targetMatch = row.targetLog?.level === logLevelFilter;
        if (!baseMatch && !targetMatch) return false;
      }

      if (logSearch.trim()) {
        const query = logSearch.toLowerCase();
        const baseHas = row.baseLog?.message.toLowerCase().includes(query);
        const targetHas = row.targetLog?.message.toLowerCase().includes(query);
        if (!baseHas && !targetHas) return false;
      }

      return true;
    });
  }, [logDiff, showChangedLogsOnly, logStageFilter, logLevelFilter, logSearch]);

  if (!deploymentA || !deploymentB) {
    return (
      <div className="p-8 text-center text-neutral-400 bg-neutral-900 border border-neutral-800 rounded-xl">
        <p className="text-sm">No deployment records found to compare.</p>
      </div>
    );
  }

  // Duration delta calculation
  const durationDelta = deploymentA.durationSeconds - deploymentB.durationSeconds;
  const bundleSizeDelta = deploymentA.bundleSizeKb - deploymentB.bundleSizeKb;
  const cacheHitDelta = deploymentA.cacheHitRate - deploymentB.cacheHitRate;

  return (
    <div id="deployment-comparison-view" className="space-y-4">
      {/* Toast Notification */}
      {copiedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-emerald-500/50 text-emerald-400 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
            {onBackToDeploymentsList && (
              <button
                onClick={onBackToDeploymentsList}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <span>Deployments</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
              </button>
            )}
            <span className="text-white font-medium">Deployment Comparison & Diff</span>
          </div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-400" />
            Side-by-Side Deployment Comparison
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Inspect configuration drifts, environment variable delta, package version changes, and aligned build logs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onBackToDeploymentsList && (
            <button
              onClick={onBackToDeploymentsList}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-md text-xs font-medium border border-neutral-700 transition-colors"
            >
              Back to List
            </button>
          )}

          <button
            id="export-diff-report-btn"
            onClick={handleCopyDiffReport}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md text-xs font-medium border border-neutral-700 transition-colors flex items-center gap-1.5"
            title="Export summary of diffs"
          >
            <Copy className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export Diff</span>
          </button>

          <button
            id="open-rollback-modal-btn"
            onClick={() => {
              setIsRollbackModalOpen(true);
              setRollbackStatus('idle');
              setRollbackProgress(0);
            }}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-800/50 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate Rollback to B</span>
          </button>
        </div>
      </div>

      {/* Selectors Bar: Project & Two Deployments */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Project Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Selected Project
            </label>
            <select
              id="comparison-project-select"
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const proj = projects.find(p => p.id === e.target.value);
                if (proj && onSelectProject) {
                  onSelectProject(proj);
                }
              }}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.displayName} ({p.environment}) - {p.totalDeployments} builds
                </option>
              ))}
            </select>
          </div>

          {/* Deployment A Selector */}
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Base (Deployment A)
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">Reference</span>
            </div>
            <select
              id="comparison-deployment-a-select"
              value={deploymentAId}
              onChange={(e) => setDeploymentAId(e.target.value)}
              className="w-full bg-neutral-950 border border-blue-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            >
              {deployments.map(d => (
                <option key={d.id} value={d.id}>
                  #{d.deploymentNumber} {d.version} ({d.status}) - {d.commitHash} [{d.deployedAt}]
                </option>
              ))}
            </select>
          </div>

          {/* Swap Deployments Button */}
          <div className="flex items-end justify-center lg:pb-0.5">
            <button
              id="swap-deployments-btn"
              onClick={handleSwapDeployments}
              className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg border border-neutral-700 transition-colors"
              title="Swap Base and Target deployments"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Deployment B Selector */}
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Target (Deployment B)
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">Comparison</span>
            </div>
            <select
              id="comparison-deployment-b-select"
              value={deploymentBId}
              onChange={(e) => setDeploymentBId(e.target.value)}
              className="w-full bg-neutral-950 border border-purple-900/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            >
              {deployments.map(d => (
                <option key={d.id} value={d.id}>
                  #{d.deploymentNumber} {d.version} ({d.status}) - {d.commitHash} [{d.deployedAt}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Presets Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-neutral-800/80 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">Quick Presets:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleApplyPreset('latest_vs_prev')}
              className="px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] border border-neutral-700/60 transition-colors"
            >
              Latest vs Previous
            </button>
            <button
              onClick={() => handleApplyPreset('prod_vs_staging')}
              className="px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] border border-neutral-700/60 transition-colors"
            >
              Production vs Staging
            </button>
            <button
              onClick={() => handleApplyPreset('pass_vs_fail')}
              className="px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] border border-neutral-700/60 transition-colors"
            >
              Pass vs Failure / Incident
            </button>
          </div>
        </div>
      </div>

      {/* Deployment Metadata Strip (Header side-by-side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Base Deployment Card */}
        <div className="bg-neutral-900 border border-blue-900/40 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold uppercase">
                  Base (A)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  deploymentA.status === 'READY' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                  deploymentA.status === 'ERROR' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                  'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {deploymentA.status}
                </span>
                <span className="text-[11px] text-neutral-400">{deploymentA.environment}</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1.5 flex items-center gap-2">
                <span>#{deploymentA.deploymentNumber}</span>
                <span>{deploymentA.version}</span>
              </h3>
              <p className="text-xs text-neutral-300 font-mono mt-0.5 truncate max-w-md">
                {deploymentA.commitMessage}
              </p>
            </div>
            <div className="text-right text-[11px] text-neutral-400 font-mono">
              <div className="flex items-center justify-end gap-1 text-white">
                <GitBranch className="w-3 h-3 text-neutral-400" />
                <span>{deploymentA.branch}</span>
              </div>
              <div className="text-neutral-400 mt-0.5">SHA: {deploymentA.commitHash}</div>
              <div className="text-neutral-500 mt-0.5">{deploymentA.deployedAt}</div>
            </div>
          </div>
        </div>

        {/* Target Deployment Card */}
        <div className="bg-neutral-900 border border-purple-900/40 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase">
                  Target (B)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  deploymentB.status === 'READY' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                  deploymentB.status === 'ERROR' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                  'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {deploymentB.status}
                </span>
                <span className="text-[11px] text-neutral-400">{deploymentB.environment}</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1.5 flex items-center gap-2">
                <span>#{deploymentB.deploymentNumber}</span>
                <span>{deploymentB.version}</span>
              </h3>
              <p className="text-xs text-neutral-300 font-mono mt-0.5 truncate max-w-md">
                {deploymentB.commitMessage}
              </p>
            </div>
            <div className="text-right text-[11px] text-neutral-400 font-mono">
              <div className="flex items-center justify-end gap-1 text-white">
                <GitBranch className="w-3 h-3 text-neutral-400" />
                <span>{deploymentB.branch}</span>
              </div>
              <div className="text-neutral-400 mt-0.5">SHA: {deploymentB.commitHash}</div>
              <div className="text-neutral-500 mt-0.5">{deploymentB.deployedAt}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Impact Delta Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Duration Delta */}
        <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Build Duration
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              durationDelta < 0 ? 'bg-emerald-950 text-emerald-400' :
              durationDelta > 0 ? 'bg-amber-950 text-amber-400' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {durationDelta < 0 ? `${durationDelta}s (Faster)` : durationDelta > 0 ? `+${durationDelta}s (Slower)` : 'No change'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <span className="text-base font-bold text-blue-400">{deploymentA.duration}</span>
            <span className="text-xs text-neutral-500">vs</span>
            <span className="text-sm font-semibold text-purple-400">{deploymentB.duration}</span>
          </div>
        </div>

        {/* Bundle Size Delta */}
        <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
              Bundle Size
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              bundleSizeDelta < 0 ? 'bg-emerald-950 text-emerald-400' :
              bundleSizeDelta > 0 ? 'bg-amber-950 text-amber-400' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {bundleSizeDelta < 0 ? `${(bundleSizeDelta / 1024).toFixed(2)} MB` : bundleSizeDelta > 0 ? `+${(bundleSizeDelta / 1024).toFixed(2)} MB` : 'Identical'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <span className="text-base font-bold text-blue-400">{deploymentA.bundleSize}</span>
            <span className="text-xs text-neutral-500">vs</span>
            <span className="text-sm font-semibold text-purple-400">{deploymentB.bundleSize}</span>
          </div>
        </div>

        {/* Cache Hit Rate */}
        <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Cache Hit Ratio
            </span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
              cacheHitDelta > 0 ? 'bg-emerald-950 text-emerald-400' :
              cacheHitDelta < 0 ? 'bg-rose-950 text-rose-400' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {cacheHitDelta > 0 ? `+${cacheHitDelta}%` : cacheHitDelta < 0 ? `${cacheHitDelta}%` : 'Equal'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono">
            <span className="text-base font-bold text-blue-400">{deploymentA.cacheHitRate}%</span>
            <span className="text-xs text-neutral-500">vs</span>
            <span className="text-sm font-semibold text-purple-400">{deploymentB.cacheHitRate}%</span>
          </div>
        </div>

        {/* Configuration Changes Counter */}
        <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl">
          <div className="flex items-center justify-between text-neutral-400 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              Config Divergences
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              {totalChangedSettings} Delta
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between font-mono text-xs">
            <span className="text-white font-semibold">{envChangedCount} Env</span>
            <span className="text-neutral-500">•</span>
            <span className="text-white font-semibold">{configChangedCount} Settings</span>
            <span className="text-neutral-500">•</span>
            <span className="text-white font-semibold">{depChangedCount} Deps</span>
          </div>
        </div>
      </div>

      {/* Main Diff Tabs */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center justify-between px-4 border-b border-neutral-800 bg-neutral-950/60 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              id="tab-config-diff-btn"
              onClick={() => setActiveTab('config')}
              className={`px-3 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'config'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Configuration & Env Vars</span>
              {totalChangedSettings > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px]">
                  {totalChangedSettings}
                </span>
              )}
            </button>

            <button
              id="tab-logs-diff-btn"
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>Build Logs Diff</span>
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-400 text-[10px]">
                {deploymentA.buildLogs.length} vs {deploymentB.buildLogs.length}
              </span>
            </button>

            <button
              id="tab-deps-diff-btn"
              onClick={() => setActiveTab('dependencies')}
              className={`px-3 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'dependencies'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Package Dependencies</span>
              {depChangedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                  {depChangedCount}
                </span>
              )}
            </button>

            <button
              id="tab-overview-diff-btn"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Architecture & Edge Routing</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Configuration & Env Vars Content */}
        {activeTab === 'config' && (
          <div className="p-4 space-y-6">
            {/* Filter Sub-bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-400 text-[11px] font-semibold uppercase tracking-wider mr-1">
                  View:
                </span>
                <button
                  onClick={() => setConfigFilter('changed')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    configFilter === 'changed'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Changed Settings Only ({totalChangedSettings})
                </button>
                <button
                  onClick={() => setConfigFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    configFilter === 'all'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  All Settings
                </button>
                <button
                  onClick={() => setConfigFilter('env')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    configFilter === 'env'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Env Variables ({envDiff.length})
                </button>
                <button
                  onClick={() => setConfigFilter('runtime')}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    configFilter === 'runtime'
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Runtime & Build ({configDiff.length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="toggle-reveal-secrets-btn"
                  onClick={() => setRevealSecrets(!revealSecrets)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors text-xs"
                >
                  {revealSecrets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{revealSecrets ? 'Mask Secrets' : 'Reveal Values'}</span>
                </button>
              </div>
            </div>

            {/* Section 1: Build & Runtime Config Diff */}
            {(configFilter === 'all' || configFilter === 'changed' || configFilter === 'runtime') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    Build & Runtime Settings Diff
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    {configChangedCount} difference(s) detected
                  </span>
                </div>

                <div className="border border-neutral-800 rounded-lg overflow-hidden divide-y divide-neutral-800/80 text-xs">
                  <div className="grid grid-cols-12 px-4 py-2 bg-neutral-950 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    <div className="col-span-3">Configuration Parameter</div>
                    <div className="col-span-4 text-blue-400">Base A ({deploymentA.version})</div>
                    <div className="col-span-4 text-purple-400">Target B ({deploymentB.version})</div>
                    <div className="col-span-1 text-right">Change</div>
                  </div>

                  {configDiff
                    .filter(c => configFilter !== 'changed' || c.type !== 'unchanged')
                    .map((item, idx) => (
                      <div
                        key={idx}
                        className={`grid grid-cols-12 px-4 py-2.5 items-center transition-colors ${
                          item.type === 'modified' ? 'bg-blue-950/20 hover:bg-blue-950/30' : 'hover:bg-neutral-850'
                        }`}
                      >
                        <div className="col-span-3 pr-2 font-medium text-white flex items-center gap-2">
                          <span>{item.label}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                            {item.category}
                          </span>
                        </div>

                        <div className="col-span-4 pr-2 font-mono text-neutral-200 truncate">
                          {item.baseValue}
                        </div>

                        <div className="col-span-4 pr-2 font-mono text-neutral-200 truncate">
                          {item.targetValue}
                        </div>

                        <div className="col-span-1 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            item.type === 'modified' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            'bg-neutral-800 text-neutral-400'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Section 2: Environment Variables Diff */}
            {(configFilter === 'all' || configFilter === 'changed' || configFilter === 'env') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Environment Variables Diff
                  </h4>
                  <span className="text-[11px] text-neutral-400">
                    {envChangedCount} variable(s) changed
                  </span>
                </div>

                <div className="border border-neutral-800 rounded-lg overflow-hidden divide-y divide-neutral-800/80 text-xs">
                  <div className="grid grid-cols-12 px-4 py-2 bg-neutral-950 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    <div className="col-span-3">Variable Key & Scope</div>
                    <div className="col-span-4 text-blue-400">Base A ({deploymentA.version})</div>
                    <div className="col-span-4 text-purple-400">Target B ({deploymentB.version})</div>
                    <div className="col-span-1 text-right">Diff Type</div>
                  </div>

                  {envDiff
                    .filter(e => configFilter !== 'changed' || e.type !== 'unchanged')
                    .map((item, idx) => {
                      const displayBase = item.isSecret && !revealSecrets
                        ? '••••••••••••••••••••'
                        : item.baseValue ?? '(Not Defined)';
                      const displayTarget = item.isSecret && !revealSecrets
                        ? '••••••••••••••••••••'
                        : item.targetValue ?? '(Not Defined)';

                      return (
                        <div
                          key={idx}
                          className={`grid grid-cols-12 px-4 py-2.5 items-center transition-colors ${
                            item.type === 'added' ? 'bg-emerald-950/20 hover:bg-emerald-950/30' :
                            item.type === 'removed' ? 'bg-rose-950/20 hover:bg-rose-950/30' :
                            item.type === 'modified' ? 'bg-amber-950/20 hover:bg-amber-950/30' :
                            'hover:bg-neutral-850'
                          }`}
                        >
                          <div className="col-span-3 pr-2 font-mono text-white flex items-center gap-1.5 truncate">
                            {item.isSecret && <Shield className="w-3 h-3 text-amber-400 shrink-0" />}
                            <span className="truncate">{item.key}</span>
                            <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 shrink-0">
                              {item.category}
                            </span>
                          </div>

                          <div className="col-span-4 pr-2 font-mono text-[11px] text-neutral-300 truncate">
                            <span className={item.type === 'removed' ? 'line-through text-rose-400' : ''}>
                              {displayBase}
                            </span>
                          </div>

                          <div className="col-span-4 pr-2 font-mono text-[11px] text-neutral-300 truncate">
                            <span className={item.type === 'added' ? 'text-emerald-400 font-semibold' : ''}>
                              {displayTarget}
                            </span>
                          </div>

                          <div className="col-span-1 text-right">
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                              item.type === 'added' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              item.type === 'removed' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                              item.type === 'modified' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-neutral-800 text-neutral-400'
                            }`}>
                              {item.type}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Side-by-Side Build Logs Diff */}
        {activeTab === 'logs' && (
          <div className="p-4 space-y-4">
            {/* Logs Filter & Search Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-xs">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search logs across both deployments..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                  {logSearch && (
                    <button
                      onClick={() => setLogSearch('')}
                      className="absolute right-2.5 top-2 text-neutral-400 hover:text-white text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <select
                  value={logStageFilter}
                  onChange={(e) => setLogStageFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-md px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="all">All Stages</option>
                  <option value="clone">Clone</option>
                  <option value="install">Install / Cache</option>
                  <option value="compile">Compile</option>
                  <option value="bundle">Bundle</option>
                  <option value="deploy">Deploy</option>
                  <option value="verify">Verify</option>
                </select>

                <select
                  value={logLevelFilter}
                  onChange={(e) => setLogLevelFilter(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 rounded-md px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warn">Warnings</option>
                  <option value="error">Errors Only</option>
                  <option value="success">Success</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-neutral-400 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showChangedLogsOnly}
                    onChange={(e) => setShowChangedLogsOnly(e.target.checked)}
                    className="rounded bg-neutral-900 border-neutral-700 text-blue-600 focus:ring-0"
                  />
                  <span>Show Divergent Steps Only</span>
                </label>

                <div className="flex items-center border border-neutral-800 rounded-md overflow-hidden">
                  <button
                    onClick={() => setLogViewMode('split')}
                    className={`px-2 py-1 text-xs flex items-center gap-1 ${
                      logViewMode === 'split' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Side-by-side split"
                  >
                    <Split className="w-3.5 h-3.5" />
                    <span>Split</span>
                  </button>
                  <button
                    onClick={() => setLogViewMode('unified')}
                    className={`px-2 py-1 text-xs flex items-center gap-1 ${
                      logViewMode === 'unified' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Unified stacked rows"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Unified</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Split Side-by-Side View */}
            {logViewMode === 'split' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Left Pane: Deployment A Logs */}
                <div className="bg-black/90 border border-blue-900/40 rounded-xl overflow-hidden font-mono text-xs flex flex-col shadow-inner">
                  <div className="px-3.5 py-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-neutral-400">
                    <span className="font-semibold text-blue-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Base (A): #{deploymentA.deploymentNumber} ({deploymentA.version})
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {deploymentA.duration} • {deploymentA.status}
                    </span>
                  </div>

                  <div className="p-3 space-y-1.5 max-h-[500px] overflow-y-auto divide-y divide-neutral-900">
                    {filteredLogRows.map((row) => {
                      const log = row.baseLog;
                      if (!log) {
                        return (
                          <div key={row.index} className="py-1 text-neutral-600 text-[11px] italic bg-neutral-950/30 px-2 rounded">
                            (No corresponding line in Base A)
                          </div>
                        );
                      }

                      return (
                        <div
                          key={row.index}
                          className={`py-1.5 px-2 rounded flex items-start gap-2 ${
                            log.level === 'error' ? 'bg-rose-950/40 border border-rose-900/50' :
                            row.diffStatus === 'diverged' ? 'bg-blue-950/20' : ''
                          }`}
                        >
                          <span className="text-neutral-600 select-none w-5 text-right shrink-0 text-[10px]">
                            {log.line}
                          </span>
                          <span className="text-neutral-500 shrink-0 text-[10px]">{log.timestamp}</span>
                          <span className={`px-1 rounded text-[9px] font-bold uppercase shrink-0 ${
                            log.level === 'error' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            log.level === 'warn' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            log.level === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            'bg-neutral-800 text-neutral-400'
                          }`}>
                            {log.level}
                          </span>
                          <span className="text-neutral-500 text-[10px] shrink-0">[{log.source}]</span>
                          <span className={`break-all leading-relaxed ${
                            log.level === 'error' ? 'text-rose-400 font-semibold' :
                            log.level === 'warn' ? 'text-amber-300' :
                            log.level === 'success' ? 'text-emerald-300' : 'text-neutral-300'
                          }`}>
                            {log.message}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Pane: Deployment B Logs */}
                <div className="bg-black/90 border border-purple-900/40 rounded-xl overflow-hidden font-mono text-xs flex flex-col shadow-inner">
                  <div className="px-3.5 py-2 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-neutral-400">
                    <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Target (B): #{deploymentB.deploymentNumber} ({deploymentB.version})
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {deploymentB.duration} • {deploymentB.status}
                    </span>
                  </div>

                  <div className="p-3 space-y-1.5 max-h-[500px] overflow-y-auto divide-y divide-neutral-900">
                    {filteredLogRows.map((row) => {
                      const log = row.targetLog;
                      if (!log) {
                        return (
                          <div key={row.index} className="py-1 text-neutral-600 text-[11px] italic bg-neutral-950/30 px-2 rounded">
                            (No corresponding line in Target B)
                          </div>
                        );
                      }

                      return (
                        <div
                          key={row.index}
                          className={`py-1.5 px-2 rounded flex items-start gap-2 ${
                            log.level === 'error' ? 'bg-rose-950/40 border border-rose-900/50' :
                            row.diffStatus === 'diverged' ? 'bg-purple-950/20' : ''
                          }`}
                        >
                          <span className="text-neutral-600 select-none w-5 text-right shrink-0 text-[10px]">
                            {log.line}
                          </span>
                          <span className="text-neutral-500 shrink-0 text-[10px]">{log.timestamp}</span>
                          <span className={`px-1 rounded text-[9px] font-bold uppercase shrink-0 ${
                            log.level === 'error' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                            log.level === 'warn' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                            log.level === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            'bg-neutral-800 text-neutral-400'
                          }`}>
                            {log.level}
                          </span>
                          <span className="text-neutral-500 text-[10px] shrink-0">[{log.source}]</span>
                          <span className={`break-all leading-relaxed ${
                            log.level === 'error' ? 'text-rose-400 font-semibold' :
                            log.level === 'warn' ? 'text-amber-300' :
                            log.level === 'success' ? 'text-emerald-300' : 'text-neutral-300'
                          }`}>
                            {log.message}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Unified View */}
            {logViewMode === 'unified' && (
              <div className="bg-black/90 border border-neutral-800 rounded-xl overflow-hidden font-mono text-xs max-h-[500px] overflow-y-auto divide-y divide-neutral-900 p-3">
                {filteredLogRows.map((row) => (
                  <div key={row.index} className="py-2 space-y-1">
                    {/* Base A Line */}
                    {row.baseLog && (
                      <div className="flex items-start gap-2 text-neutral-300 bg-blue-950/20 px-2 py-1 rounded">
                        <span className="text-blue-400 text-[10px] font-bold shrink-0 w-8">A: #{deploymentA.deploymentNumber}</span>
                        <span className="text-neutral-500 text-[10px] shrink-0">{row.baseLog.timestamp}</span>
                        <span className="text-neutral-400 text-[10px] shrink-0">[{row.baseLog.source}]</span>
                        <span className="break-all">{row.baseLog.message}</span>
                      </div>
                    )}
                    {/* Target B Line */}
                    {row.targetLog && (
                      <div className="flex items-start gap-2 text-neutral-300 bg-purple-950/20 px-2 py-1 rounded">
                        <span className="text-purple-400 text-[10px] font-bold shrink-0 w-8">B: #{deploymentB.deploymentNumber}</span>
                        <span className="text-neutral-500 text-[10px] shrink-0">{row.targetLog.timestamp}</span>
                        <span className="text-neutral-400 text-[10px] shrink-0">[{row.targetLog.source}]</span>
                        <span className="break-all">{row.targetLog.message}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Package Dependencies Diff */}
        {activeTab === 'dependencies' && (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <h4 className="font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                Package.json Dependencies Drift
              </h4>
              <span className="text-neutral-400">
                {depChangedCount} modified or newly added package(s)
              </span>
            </div>

            <div className="border border-neutral-800 rounded-lg overflow-hidden divide-y divide-neutral-800/80 text-xs">
              <div className="grid grid-cols-12 px-4 py-2 bg-neutral-950 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                <div className="col-span-4">Package Name</div>
                <div className="col-span-3 text-blue-400">Base A ({deploymentA.version})</div>
                <div className="col-span-3 text-purple-400">Target B ({deploymentB.version})</div>
                <div className="col-span-2 text-right">Drift Status</div>
              </div>

              {depDiff.map((item, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-12 px-4 py-2.5 items-center transition-colors ${
                    item.type === 'added' ? 'bg-emerald-950/20' :
                    item.type === 'removed' ? 'bg-rose-950/20' :
                    item.type === 'modified' ? 'bg-amber-950/20' : 'hover:bg-neutral-850'
                  }`}
                >
                  <div className="col-span-4 font-mono text-white font-medium">
                    {item.packageName}
                  </div>

                  <div className="col-span-3 font-mono text-neutral-300">
                    {item.baseVersion ? `^${item.baseVersion}` : <span className="text-neutral-500 italic">none</span>}
                  </div>

                  <div className="col-span-3 font-mono text-neutral-300">
                    {item.targetVersion ? `^${item.targetVersion}` : <span className="text-neutral-500 italic">none</span>}
                  </div>

                  <div className="col-span-2 text-right">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.type === 'added' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      item.type === 'removed' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      item.type === 'modified' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-neutral-800 text-neutral-400'
                    }`}>
                      {item.type === 'modified' ? 'Upgraded' : item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Architecture & Edge Routing Overview */}
        {activeTab === 'overview' && (
          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Deployment A Breakdown */}
              <div className="bg-neutral-950 border border-blue-900/40 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-blue-400 flex items-center gap-2 uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5" />
                  Base A Architecture & Routing
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    <div className="text-neutral-400 text-[11px]">Static Pages Prerendered</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      {deploymentA.summaryMetrics.staticPagesCount}
                    </div>
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    <div className="text-neutral-400 text-[11px]">Serverless Endpoints</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      {deploymentA.summaryMetrics.serverlessFunctionsCount}
                    </div>
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    <div className="text-neutral-400 text-[11px]">Edge Middleware</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      {deploymentA.summaryMetrics.edgeMiddlewareCount}
                    </div>
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    <div className="text-neutral-400 text-[11px]">Client JS Chunks</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      {deploymentA.summaryMetrics.chunksCount}
                    </div>
                  </div>
                </div>
                <div className="text-xs space-y-1 pt-1">
                  <div className="text-neutral-400">Active Edge Regions:</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {deploymentA.config.regions.map(r => (
                      <span key={r} className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 font-mono text-[10px] border border-neutral-800">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Deployment B Breakdown */}
              <div className="bg-neutral-950 border border-purple-900/40 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-purple-400 flex items-center gap-2 uppercase tracking-wider">
                  <Globe className="w-3.5 h-3.5" />
                  Target B Architecture & Routing
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    <div className="text-neutral-400 text-[11px]">Static Pages Prerendered</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      {deploymentB.summaryMetrics.staticPagesCount}
                    </div>
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    <div className="text-neutral-400 text-[11px]">Serverless Endpoints</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      {deploymentB.summaryMetrics.serverlessFunctionsCount}
                    </div>
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    <div className="text-neutral-400 text-[11px]">Edge Middleware</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      {deploymentB.summaryMetrics.edgeMiddlewareCount}
                    </div>
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    <div className="text-neutral-400 text-[11px]">Client JS Chunks</div>
                    <div className="text-base font-bold text-white font-mono mt-0.5">
                      {deploymentB.summaryMetrics.chunksCount}
                    </div>
                  </div>
                </div>
                <div className="text-xs space-y-1 pt-1">
                  <div className="text-neutral-400">Active Edge Regions:</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {deploymentB.config.regions.map(r => (
                      <span key={r} className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 font-mono text-[10px] border border-neutral-800">
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rollback Simulation Modal */}
      {isRollbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-400" />
                Rollback Deployment Simulation
              </h3>
              <button
                onClick={() => setIsRollbackModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-neutral-300 space-y-3">
              <p>
                You are preparing to rollback production traffic from{' '}
                <strong className="text-blue-400">#{deploymentA.deploymentNumber} ({deploymentA.version})</strong> to{' '}
                <strong className="text-purple-400">#{deploymentB.deploymentNumber} ({deploymentB.version})</strong>.
              </p>

              <div className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 space-y-2">
                <div className="font-semibold text-white">Impact Analysis:</div>
                <ul className="list-disc pl-4 space-y-1 text-neutral-400">
                  <li>Active environment variables will revert to snapshot at {deploymentB.timestamp}.</li>
                  <li>Runtime Node version will switch to {deploymentB.config.nodeVersion}.</li>
                  <li>Edge CDN routing will re-point 100% of global DNS traffic instantly.</li>
                </ul>
              </div>

              {rollbackStatus === 'in_progress' && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-[11px] text-neutral-400">
                    <span>Reverting edge DNS and re-warming cache...</span>
                    <span>{rollbackProgress}%</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full transition-all duration-300"
                      style={{ width: `${rollbackProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {rollbackStatus === 'completed' && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-lg text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Rollback simulated successfully! Production traffic now mirrors #{deploymentB.deploymentNumber}.
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setIsRollbackModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md text-xs font-medium transition-colors"
              >
                Close
              </button>

              {rollbackStatus === 'idle' && (
                <button
                  onClick={handleStartRollback}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-rose-950"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Execute Simulated Rollback</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
