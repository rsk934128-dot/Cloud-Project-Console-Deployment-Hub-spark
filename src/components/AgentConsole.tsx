import React, { useState, useMemo } from 'react';
import {
  AgentAutonomyMode,
  AgentIncident,
  AgentSafetyPolicy,
  AgentActionAuditItem,
  AgentMission,
  AgentThoughtStep
} from '../types/opsAgent';
import {
  INITIAL_INCIDENTS,
  INITIAL_SAFETY_POLICIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ACTIVE_MISSION
} from '../data/opsAgentData';
import {
  Bot,
  Zap,
  Activity,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sliders,
  Terminal,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Cpu,
  Server,
  Lock,
  Eye,
  Check,
  X,
  Radio,
  FileText,
  AlertOctagon,
  ChevronRight,
  Layers,
  Search,
  ExternalLink,
  Flame
} from 'lucide-react';

export const AgentConsole: React.FC = () => {
  const [autonomyMode, setAutonomyMode] = useState<AgentAutonomyMode>('semi_autonomous');
  const [activeTab, setActiveTab] = useState<'patrol' | 'incidents' | 'policies' | 'audit'>('patrol');

  // Core State
  const [incidents, setIncidents] = useState<AgentIncident[]>(INITIAL_INCIDENTS);
  const [policies, setPolicies] = useState<AgentSafetyPolicy[]>(INITIAL_SAFETY_POLICIES);
  const [auditLogs, setAuditLogs] = useState<AgentActionAuditItem[]>(INITIAL_AUDIT_LOGS);
  const [activeMission, setActiveMission] = useState<AgentMission>(INITIAL_ACTIVE_MISSION);

  // Dispatch mission state
  const [customGoal, setCustomGoal] = useState('');
  const [isExecutingMission, setIsExecutingMission] = useState(false);
  const [isPatrolling, setIsPatrolling] = useState(false);

  // Filter for incidents
  const [incidentFilter, setIncidentFilter] = useState<'all' | 'active' | 'resolved'>('all');

  // Remediation approval state
  const [remediatingId, setRemediatingId] = useState<string | null>(null);

  // Execute approval for awaiting incident
  const handleApproveRemediation = (incidentId: string) => {
    setRemediatingId(incidentId);

    setTimeout(() => {
      setIncidents(prev =>
        prev.map(inc => {
          if (inc.id !== incidentId) return inc;
          return {
            ...inc,
            status: 'resolved',
            resolvedAt: 'Just now',
            timeToResolutionSec: 16,
            autonomousActionTaken: 'Operator-approved rolling restart executed. 4/4 pods healthy. Memory normalized to 31.8%.'
          };
        })
      );

      // Add to audit log
      const targetInc = incidents.find(i => i.id === incidentId);
      if (targetInc) {
        const newAudit: AgentActionAuditItem = {
          id: `aud-${Math.floor(5000 + Math.random() * 4000)}`,
          timestamp: 'Just now',
          incidentId: targetInc.id,
          service: targetInc.targetService,
          action: 'Zero-Downtime Rolling Pod Restart & Memory Limit Bump',
          command: `kubectl rollout restart deployment/${targetInc.targetService} -n prod && kubectl scale --memory=2048Mi`,
          executedBy: autonomyMode === 'autonomous' ? 'autonomous_gemini_ops' : 'operator_approved',
          resultStatus: 'success',
          verifiedHealth: 'Ready replicas 4/4, memory load 31.8%',
          rollbackCommand: `kubectl rollout undo deployment/${targetInc.targetService} -n prod`
        };
        setAuditLogs(prev => [newAudit, ...prev]);
      }

      setRemediatingId(null);
    }, 1800);
  };

  // Run autonomous patrol
  const handleTriggerPatrol = () => {
    setIsPatrolling(true);
    setTimeout(() => {
      setIsPatrolling(false);
    }, 2000);
  };

  // Dispatch custom or pre-set SRE mission
  const handleDispatchMission = (goalPrompt: string) => {
    if (!goalPrompt.trim()) return;

    setIsExecutingMission(true);
    const newMissionId = `mis-${Math.floor(1050 + Math.random() * 8000)}`;

    const initialSteps: AgentThoughtStep[] = [
      {
        step: 1,
        tool: 'telemetry_cluster_scout',
        thought: `Synthesizing operational goal: "${goalPrompt}". Querying system state vectors...`,
        command: `sre-agent plan --goal="${goalPrompt.replace(/"/g, '')}"`,
        output: 'Target verified: Cluster telemetry queried across 6 global regions.',
        status: 'completed',
        timestamp: 'Just now'
      }
    ];

    const mission: AgentMission = {
      id: newMissionId,
      title: goalPrompt.length > 55 ? `${goalPrompt.slice(0, 52)}...` : goalPrompt,
      prompt: goalPrompt,
      status: 'running',
      startedAt: 'Just now',
      reasoningSteps: initialSteps
    };

    setActiveMission(mission);

    // Step 2
    setTimeout(() => {
      const step2: AgentThoughtStep = {
        step: 2,
        tool: 'gemini_root_cause_engine',
        thought: 'Evaluating dependency graph and validating execution safety policies.',
        command: 'safety-guard --check-risk-tier --policy-enforcement=strict',
        output: 'Policy check APPROVED: No destructive mutations detected. Zero SLA penalty expected.',
        status: 'completed',
        timestamp: 'Just now'
      };

      setActiveMission(prev => ({
        ...prev,
        reasoningSteps: [...prev.reasoningSteps, step2]
      }));

      // Step 3
      setTimeout(() => {
        const step3: AgentThoughtStep = {
          step: 3,
          tool: 'remediation_executor',
          thought: 'Executing remediation actions with automated health probes.',
          command: 'cloudmesh-ops run-remediation --dry-run=false --verify-ssl --probe-interval=2s',
          output: 'Verification PASS: Health score 100/100. P99 latency reduced by 44ms.',
          status: 'completed',
          timestamp: 'Just now'
        };

        setActiveMission(prev => ({
          ...prev,
          status: 'completed',
          reasoningSteps: [...prev.reasoningSteps, step3],
          outcomeSummary: `Mission successfully executed. Automated verification confirmed 100% service availability.`
        }));

        setIsExecutingMission(false);
      }, 1500);
    }, 1200);

    setCustomGoal('');
  };

  // Toggle policy auto-execution
  const handleTogglePolicy = (policyId: string) => {
    setPolicies(prev =>
      prev.map(p => {
        if (p.id !== policyId) return p;
        if (p.riskTier === 'critical') return p; // Cannot enable critical
        return {
          ...p,
          autoExecutionAllowed: !p.autoExecutionAllowed
        };
      })
    );
  };

  // Active / awaiting incidents count
  const pendingIncidentsCount = useMemo(
    () => incidents.filter(i => i.status === 'awaiting_approval' || i.status === 'investigating').length,
    [incidents]
  );

  const filteredIncidents = useMemo(() => {
    if (incidentFilter === 'active') {
      return incidents.filter(i => i.status !== 'resolved');
    }
    if (incidentFilter === 'resolved') {
      return incidents.filter(i => i.status === 'resolved');
    }
    return incidents;
  }, [incidents, incidentFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" />
              Autonomous Ops Agent
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Continuous Patrol Active
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            24/7 self-healing SRE intelligence powered by Gemini 3.8 Flash. Detects anomalies, isolates root causes, and executes safe remediations.
          </p>
        </div>

        {/* Autonomy Mode Switcher & Patrol Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-1 flex items-center gap-1 text-xs">
            <button
              onClick={() => setAutonomyMode('autonomous')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                autonomyMode === 'autonomous'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              Full Auto
            </button>
            <button
              onClick={() => setAutonomyMode('semi_autonomous')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                autonomyMode === 'semi_autonomous'
                  ? 'bg-white text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              Supervised
            </button>
            <button
              onClick={() => setAutonomyMode('observer')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                autonomyMode === 'observer'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              Observer
            </button>
          </div>

          <button
            onClick={handleTriggerPatrol}
            disabled={isPatrolling}
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isPatrolling ? 'animate-spin' : ''}`} />
            {isPatrolling ? 'Patrolling...' : 'Run Patrol'}
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Mean Time to Resolution (MTTR)</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            29s
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>98.6% faster than manual SRE</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Autonomous Fixes (24h)</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            14
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            100% verification pass rate
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Active Incidents / At Risk</span>
            <AlertTriangle className={`w-4 h-4 ${pendingIncidentsCount > 0 ? 'text-amber-400' : 'text-neutral-500'}`} />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {pendingIncidentsCount}
          </div>
          <div className="text-[11px] text-amber-400 mt-1">
            {pendingIncidentsCount > 0 ? '1 awaiting operator approval' : 'All systems normal'}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Safety Policy Compliance</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            100%
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Zero unauthorized actions
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('patrol')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'patrol'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          Live Mission & Reasoning
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
            Active
          </span>
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'incidents'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Incidents & Self-Healing
          {pendingIncidentsCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {pendingIncidentsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'policies'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Safety Policies & Guardrails
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {policies.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'audit'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Immutable Audit Log
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: LIVE MISSION & REASONING */}
      {activeTab === 'patrol' && (
        <div className="space-y-6">
          {/* Mission Dispatch Input */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Dispatch Autonomous SRE Goal
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                Engine: gemini-3.8-flash (Function Calling Enabled)
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Audit checkout-api-v2 memory leak and execute safe rolling reload..."
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDispatchMission(customGoal)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={() => handleDispatchMission(customGoal)}
                disabled={isExecutingMission || !customGoal.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                {isExecutingMission ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Dispatch
                  </>
                )}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-neutral-500">Quick SRE Missions:</span>
              <button
                onClick={() => handleDispatchMission('Inspect BGP route flapping and balance traffic around fra1')}
                className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 font-mono transition-colors"
              >
                BGP Route Reroute
              </button>
              <button
                onClick={() => handleDispatchMission('Check TLS certificates expiring in under 7 days and renew')}
                className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 font-mono transition-colors"
              >
                Auto-Renew TLS
              </button>
              <button
                onClick={() => handleDispatchMission('Terminate idle DB connections exceeding 15m timeout')}
                className="px-2 py-0.5 rounded bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 font-mono transition-colors"
              >
                Drain Idle DB Conns
              </button>
            </div>
          </div>

          {/* Active Mission Reasoning Stream */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{activeMission.title}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {activeMission.status}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">{activeMission.prompt}</p>
              </div>

              <span className="text-[11px] text-neutral-500 font-mono shrink-0">
                Started {activeMission.startedAt}
              </span>
            </div>

            {/* Reasoning Steps Chain */}
            <div className="p-4 space-y-4">
              {activeMission.reasoningSteps.map((step) => (
                <div key={step.step} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-[11px]">
                      {step.step}
                    </div>
                    <div className="w-0.5 h-full bg-neutral-800 mt-1" />
                  </div>

                  <div className="flex-1 space-y-2 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-purple-400 font-semibold flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        Tool: {step.tool}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">{step.timestamp}</span>
                    </div>

                    <p className="text-neutral-300 font-sans leading-relaxed">{step.thought}</p>

                    {step.command && (
                      <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-md font-mono text-[11px] text-neutral-300 flex items-center gap-2">
                        <span className="text-emerald-400">$</span>
                        <span>{step.command}</span>
                      </div>
                    )}

                    {step.output && (
                      <div className="p-2.5 bg-neutral-950/80 border border-neutral-850 rounded-md font-mono text-[11px] text-emerald-300/90 leading-relaxed">
                        ↳ {step.output}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {activeMission.outcomeSummary && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs flex items-center gap-2.5 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{activeMission.outcomeSummary}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INCIDENTS & SELF-HEALING */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIncidentFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  incidentFilter === 'all'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All Incidents ({incidents.length})
              </button>
              <button
                onClick={() => setIncidentFilter('active')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  incidentFilter === 'active'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Needs Action ({pendingIncidentsCount})
              </button>
              <button
                onClick={() => setIncidentFilter('resolved')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  incidentFilter === 'resolved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Self-Healed ({incidents.filter(i => i.status === 'resolved').length})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredIncidents.map((incident) => {
              const isResolved = incident.status === 'resolved';
              const isAwaiting = incident.status === 'awaiting_approval';

              return (
                <div
                  key={incident.id}
                  className={`bg-neutral-900 border ${
                    isAwaiting
                      ? 'border-amber-500/40 bg-amber-500/[0.02]'
                      : 'border-neutral-800 hover:border-neutral-700'
                  } rounded-xl p-4 transition-all shadow-xs space-y-3`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{incident.title}</span>
                      <span className="px-2 py-0.2 rounded text-[11px] font-mono bg-neutral-950 text-neutral-300 border border-neutral-800">
                        {incident.targetService}
                      </span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono text-neutral-400 border border-neutral-800">
                        {incident.region}
                      </span>

                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase font-mono ${
                          incident.severity === 'critical'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {incident.severity}
                      </span>

                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-bold font-mono uppercase ${
                          isResolved
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {incident.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <span className="text-[11px] text-neutral-500 font-mono">
                      Detected {incident.detectedAt}
                    </span>
                  </div>

                  {/* Root Cause & Proposed Action */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1">
                      <div className="text-[10px] uppercase font-mono text-neutral-500">
                        Root Cause Diagnosis
                      </div>
                      <p className="text-neutral-300 leading-relaxed">{incident.rootCause}</p>
                    </div>

                    <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1">
                      <div className="text-[10px] uppercase font-mono text-emerald-400">
                        {isResolved ? 'Remediation Executed' : 'Remediation Plan'}
                      </div>
                      <p className="text-neutral-300 leading-relaxed">
                        {incident.autonomousActionTaken || incident.proposedAction}
                      </p>
                    </div>
                  </div>

                  {/* Health Delta & Action Button */}
                  <div className="pt-2 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="text-neutral-400">{incident.healthDelta.metric}:</span>
                      <span className="text-red-400 line-through">{incident.healthDelta.before}</span>
                      <ArrowRight className="w-3 h-3 text-neutral-500" />
                      <span className="text-emerald-400 font-bold">{incident.healthDelta.after}</span>
                      {incident.timeToResolutionSec && (
                        <span className="text-neutral-500 ml-2">
                          (Resolved in {incident.timeToResolutionSec}s)
                        </span>
                      )}
                    </div>

                    {isAwaiting && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveRemediation(incident.id)}
                          disabled={remediatingId === incident.id}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                        >
                          {remediatingId === incident.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Applying Fix...
                            </>
                          ) : (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Approve & Execute Fix
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY POLICIES & GUARDRAILS */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              Autonomous Action Safety Boundaries & Rate Quotas
            </h3>
            <p className="text-xs text-neutral-400">
              The Ops Agent will never exceed these guardrails. Destructive mutations (e.g. DROP TABLE) are hard-blocked by policy.
            </p>
          </div>

          <div className="space-y-3">
            {policies.map((policy) => {
              const isCritical = policy.riskTier === 'critical';

              return (
                <div
                  key={policy.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{policy.name}</span>
                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-mono uppercase font-bold ${
                          policy.riskTier === 'low'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : policy.riskTier === 'medium'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : policy.riskTier === 'high'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        Risk: {policy.riskTier}
                      </span>

                      {isCritical ? (
                        <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Hard Blocked
                        </span>
                      ) : policy.autoExecutionAllowed ? (
                        <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Auto-Execution Enabled
                        </span>
                      ) : (
                        <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700">
                          Requires Human Approval
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400">{policy.description}</p>

                    <div className="text-[11px] text-neutral-500 font-mono pt-1">
                      Daily Quota: {policy.actionsToday} / {policy.maxDailyActions} actions executed today
                    </div>
                  </div>

                  {!isCritical && (
                    <button
                      onClick={() => handleTogglePolicy(policy.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shrink-0 ${
                        policy.autoExecutionAllowed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
                      }`}
                    >
                      {policy.autoExecutionAllowed ? 'Disable Auto-Action' : 'Allow Auto-Action'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: IMMUTABLE AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-800 bg-neutral-950/40 flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Remediation Action Audit Log</span>
              <span className="text-neutral-400 font-mono text-[11px]">Cryptographic execution trail</span>
            </div>

            <div className="divide-y divide-neutral-800">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 space-y-2 hover:bg-neutral-850 transition-colors text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-neutral-400 text-[11px]">{log.timestamp}</span>
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-neutral-950 text-neutral-300 border border-neutral-800">
                        {log.service}
                      </span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-bold">
                        {log.resultStatus}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-purple-400">
                      Executed by: {log.executedBy}
                    </span>
                  </div>

                  <div className="p-2 bg-neutral-950 border border-neutral-800 rounded font-mono text-[11px] text-neutral-300">
                    <span className="text-emerald-400">$ </span>
                    {log.command}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-neutral-500 font-mono">
                    <span>Verified: <strong className="text-emerald-400 font-normal">{log.verifiedHealth}</strong></span>
                    {log.rollbackCommand && (
                      <span className="text-neutral-400">
                        Rollback Available: <code className="text-neutral-300">{log.rollbackCommand}</code>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
