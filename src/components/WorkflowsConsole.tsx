import React, { useState, useMemo, useEffect } from 'react';
import {
  Workflow,
  WorkflowExecution,
  WorkflowTemplate,
  WorkflowStep,
  StepActionType,
  ExecutionStatus,
  WorkflowTriggerType
} from '../types/workflows';
import {
  INITIAL_WORKFLOWS,
  INITIAL_EXECUTIONS,
  WORKFLOW_TEMPLATES
} from '../data/workflowsData';
import {
  GitFork,
  Play,
  Pause,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Zap,
  Terminal,
  Layers,
  ArrowRight,
  Code2,
  Database,
  Box,
  Cpu,
  Mail,
  Hourglass,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Settings,
  Sparkles,
  Trash2,
  Activity,
  Filter,
  Eye,
  Calendar,
  Radio,
  Send,
  Sliders,
  CheckCircle
} from 'lucide-react';

export const WorkflowsConsole: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'pipelines' | 'dag_viewer' | 'live_runs' | 'templates' | 'triggers'>('pipelines');
  const [workflows, setWorkflows] = useState<Workflow[]>(INITIAL_WORKFLOWS);
  const [executions, setExecutions] = useState<WorkflowExecution[]>(INITIAL_EXECUTIONS);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(INITIAL_WORKFLOWS[0].id);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(INITIAL_EXECUTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [triggerFilter, setTriggerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected Step for DAG inspector
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Live simulation execution state
  const [isSimulatingRun, setIsSimulatingRun] = useState(false);
  const [simulatedExecution, setSimulatedExecution] = useState<WorkflowExecution | null>(null);
  const [simulatedStepIndex, setSimulatedStepIndex] = useState<number>(-1);

  // New Workflow Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfTriggerType, setNewWfTriggerType] = useState<WorkflowTriggerType>('webhook');
  const [newWfCron, setNewWfCron] = useState('0 */2 * * *');
  const [newWfWebhook, setNewWfWebhook] = useState('/api/v1/workflows/triggers/custom-task');
  const [newWfConcurrency, setNewWfConcurrency] = useState(100);

  // Quick Trigger Modal
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [triggerPayloadText, setTriggerPayloadText] = useState('{\n  "orderId": "ord_live_99481",\n  "amount": 28400,\n  "currency": "usd",\n  "customerEmail": "rasadsk007@gmail.com"\n}');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast(`Copied to clipboard: ${text.slice(0, 32)}...`);
  };

  // Selected active workflow object
  const activeWorkflow = useMemo(() => {
    return workflows.find(w => w.id === selectedWorkflowId) || workflows[0];
  }, [workflows, selectedWorkflowId]);

  // Set default selected step when active workflow changes
  useEffect(() => {
    if (activeWorkflow && activeWorkflow.steps.length > 0) {
      setSelectedStepId(activeWorkflow.steps[0].id);
    }
  }, [selectedWorkflowId]);

  // Filtered workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesTrigger = triggerFilter === 'all' || w.trigger.type === triggerFilter;
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchesSearch && matchesTrigger && matchesStatus;
    });
  }, [workflows, searchQuery, triggerFilter, statusFilter]);

  // Selected execution detail
  const activeExecution = useMemo(() => {
    if (simulatedExecution && selectedExecutionId === simulatedExecution.id) {
      return simulatedExecution;
    }
    return executions.find(e => e.id === selectedExecutionId) || executions[0];
  }, [executions, selectedExecutionId, simulatedExecution]);

  // Toggle Workflow status
  const handleToggleWorkflowStatus = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWorkflows(prev => prev.map(w => {
      if (w.id === id) {
        const nextStatus = w.status === 'active' ? 'paused' : 'active';
        showToast(`Workflow "${w.name}" status changed to ${nextStatus.toUpperCase()}`);
        return { ...w, status: nextStatus };
      }
      return w;
    }));
  };

  // Clone from template
  const handleUseTemplate = (tmpl: WorkflowTemplate) => {
    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      name: `${tmpl.workflowDef.name}-${Math.floor(100 + Math.random() * 900)}`,
      description: tmpl.workflowDef.description,
      status: 'active',
      trigger: tmpl.workflowDef.trigger,
      steps: tmpl.workflowDef.steps,
      concurrencyLimit: 100,
      timeoutSeconds: 300,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastRunAt: 'Never',
      totalRuns: 0,
      avgDurationMs: 0,
      successRate: 100,
      tags: tmpl.workflowDef.tags
    };

    setWorkflows([newWf, ...workflows]);
    setSelectedWorkflowId(newWf.id);
    setActiveSubTab('dag_viewer');
    showToast(`Template "${tmpl.title}" imported into Workflows!`);
  };

  // Run Workflow Live Simulation
  const handleTriggerRun = (wfToRun?: Workflow) => {
    const targetWf = wfToRun || activeWorkflow;
    if (!targetWf) return;

    let parsedPayload = {};
    try {
      parsedPayload = JSON.parse(triggerPayloadText);
    } catch {
      parsedPayload = { timestamp: Date.now(), trigger: 'manual' };
    }

    setIsTriggerModalOpen(false);
    setIsSimulatingRun(true);
    setActiveSubTab('live_runs');

    const newExecId = `run-${Math.floor(10000 + Math.random() * 90000)}-live`;
    const stepResultsInitial = targetWf.steps.map((st, idx) => ({
      stepId: st.id,
      stepName: st.name,
      actionType: st.actionType,
      status: (idx === 0 ? 'running' : 'pending') as ExecutionStatus,
      startedAt: new Date().toLocaleTimeString(),
      durationMs: 0,
      attempt: 1,
      logs: [`[INIT] Step queue allocated on worker node iad1-worker-0${idx + 1}`]
    }));

    const newExec: WorkflowExecution = {
      id: newExecId,
      workflowId: targetWf.id,
      workflowName: targetWf.name,
      status: 'running',
      triggerType: 'manual',
      triggeredBy: 'Manual Trigger via Console (rasadsk007@gmail.com)',
      startedAt: new Date().toISOString(),
      durationMs: 0,
      inputPayload: parsedPayload,
      stepResults: stepResultsInitial
    };

    setSimulatedExecution(newExec);
    setSelectedExecutionId(newExecId);
    setSimulatedStepIndex(0);

    // Simulate stepping through DAG steps with real timers
    let currentStep = 0;
    const totalSteps = targetWf.steps.length;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < totalSteps) {
        setSimulatedStepIndex(currentStep);
        setSimulatedExecution(prev => {
          if (!prev) return null;
          const updatedSteps = prev.stepResults.map((s, idx) => {
            if (idx === currentStep - 1) {
              const dur = Math.floor(40 + Math.random() * 180);
              return {
                ...s,
                status: 'succeeded' as ExecutionStatus,
                durationMs: dur,
                logs: [
                  ...s.logs,
                  `[EXEC] Action executed successfully with zero faults.`,
                  `[OUTPUT] Produced intermediate step payload in ${dur}ms.`
                ]
              };
            }
            if (idx === currentStep) {
              return {
                ...s,
                status: 'running' as ExecutionStatus,
                startedAt: new Date().toLocaleTimeString(),
                logs: [
                  ...s.logs,
                  `[RUNNING] Executing action: ${s.actionType} in microVM sandbox`
                ]
              };
            }
            return s;
          });
          return {
            ...prev,
            stepResults: updatedSteps
          };
        });
      } else {
        // Complete execution
        clearInterval(interval);
        const finalDuration = Math.floor(320 + Math.random() * 450);
        setSimulatedExecution(prev => {
          if (!prev) return null;
          const finalizedSteps = prev.stepResults.map((s, idx) => {
            if (idx === totalSteps - 1) {
              const stepDur = Math.floor(35 + Math.random() * 95);
              return {
                ...s,
                status: 'succeeded' as ExecutionStatus,
                durationMs: stepDur,
                logs: [
                  ...s.logs,
                  `[COMPLETE] Final step succeeded in ${stepDur}ms.`,
                  `[STATUS] Pipeline execution completed with exit code 0.`
                ]
              };
            }
            return s;
          });

          const completedExec: WorkflowExecution = {
            ...prev,
            status: 'succeeded',
            completedAt: new Date().toISOString(),
            durationMs: finalDuration,
            outputPayload: {
              pipelineStatus: 'success',
              executionId: newExecId,
              stepsExecuted: totalSteps,
              totalTimeMs: finalDuration,
              verificationHash: 'sha256_d89f0412b5...'
            },
            stepResults: finalizedSteps
          };

          // Append to persistent executions list
          setExecutions(existing => [completedExec, ...existing]);
          return completedExec;
        });

        // Update workflow last run stats
        setWorkflows(prevWfs => prevWfs.map(w => {
          if (w.id === targetWf.id) {
            return {
              ...w,
              totalRuns: w.totalRuns + 1,
              lastRunAt: 'Just now',
              lastRunStatus: 'succeeded'
            };
          }
          return w;
        }));

        setIsSimulatingRun(false);
        showToast(`Workflow "${targetWf.name}" execution completed successfully in ${finalDuration}ms!`);
      }
    }, 750);
  };

  // Create new workflow submit
  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) {
      showToast('Please enter a workflow name');
      return;
    }

    const created: Workflow = {
      id: `wf-${Date.now()}`,
      name: newWfName.toLowerCase().replace(/\s+/g, '-'),
      description: newWfDesc || 'Custom serverless orchestrator workflow',
      status: 'active',
      trigger: {
        type: newWfTriggerType,
        cronExpression: newWfTriggerType === 'cron' ? newWfCron : undefined,
        cronDescription: newWfTriggerType === 'cron' ? 'Custom cron interval' : undefined,
        webhookPath: newWfTriggerType === 'webhook' ? newWfWebhook : undefined
      },
      concurrencyLimit: newWfConcurrency,
      timeoutSeconds: 300,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastRunAt: 'Never',
      totalRuns: 0,
      avgDurationMs: 0,
      successRate: 100,
      tags: ['custom', newWfTriggerType],
      steps: [
        {
          id: `step-init-${Date.now()}`,
          name: 'validate_payload_schema',
          description: 'Ensure incoming request payload complies with schema',
          actionType: 'transform',
          config: {},
          timeoutSeconds: 15,
          maxRetries: 2,
          dependencies: []
        },
        {
          id: `step-exec-${Date.now()}`,
          name: 'execute_primary_task',
          description: 'Process workflow task inside microVM sandbox environment',
          actionType: 'microvm_exec',
          config: { runtime: 'nodejs22' },
          timeoutSeconds: 60,
          maxRetries: 2,
          dependencies: [`step-init-${Date.now()}`]
        },
        {
          id: `step-notify-${Date.now()}`,
          name: 'dispatch_completion_event',
          description: 'Send completion webhook to monitoring endpoint',
          actionType: 'http_request',
          config: { method: 'POST' },
          timeoutSeconds: 20,
          maxRetries: 3,
          dependencies: [`step-exec-${Date.now()}`]
        }
      ]
    };

    setWorkflows([created, ...workflows]);
    setSelectedWorkflowId(created.id);
    setIsCreateModalOpen(false);
    setNewWfName('');
    setNewWfDesc('');
    showToast(`Workflow "${created.name}" created successfully with 3 default steps!`);
  };

  // Helper to render action type icons
  const renderActionIcon = (type: StepActionType, className = 'w-4 h-4') => {
    switch (type) {
      case 'db_query':
        return <Database className={`${className} text-emerald-400`} />;
      case 'http_request':
        return <Zap className={`${className} text-amber-400`} />;
      case 'microvm_exec':
        return <Box className={`${className} text-blue-400`} />;
      case 'ai_inference':
        return <Cpu className={`${className} text-purple-400`} />;
      case 'email_dispatch':
        return <Mail className={`${className} text-pink-400`} />;
      case 'delay_wait':
        return <Hourglass className={`${className} text-orange-400`} />;
      case 'transform':
      default:
        return <Sliders className={`${className} text-cyan-400`} />;
    }
  };

  return (
    <div id="workflows-console-root" className="space-y-6 select-text">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-white text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Console Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-neutral-900/80 border border-neutral-800 p-5 rounded-2xl backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">Serverless Workflows</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  DAG Engine v2.4 (Active)
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Orchestrate stateful distributed tasks, microVM workloads, AI embedding pipelines, and resilient cron runbooks with automatic retries and durable execution.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-run-simulation"
            onClick={() => {
              setIsTriggerModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            title="Trigger manual execution with custom payload"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Trigger Workflow</span>
          </button>

          <button
            id="btn-new-workflow"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold rounded-lg border border-neutral-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Workflow</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Configured Pipelines</span>
            <GitFork className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {workflows.length}
            <span className="text-xs font-normal text-emerald-400 ml-2">
              ({workflows.filter(w => w.status === 'active').length} active)
            </span>
          </div>
          <p className="text-[11px] text-neutral-500">100% DAG schema validated</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>24h Executions</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            230,189
            <span className="text-xs font-normal text-indigo-400 ml-2 font-sans">+14.2%</span>
          </div>
          <p className="text-[11px] text-neutral-500">Zero queue backlog in iad1</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            99.92%
            <span className="text-xs font-normal text-emerald-400 ml-2">SLA Pass</span>
          </div>
          <p className="text-[11px] text-neutral-500">Exponential backoff active</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>P95 Step Latency</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">
            520ms
            <span className="text-xs font-normal text-neutral-400 ml-2 font-sans">Avg 462ms</span>
          </div>
          <p className="text-[11px] text-neutral-500">Warm microVM sandboxes</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-2 overflow-x-auto text-xs scrollbar-none">
        <button
          id="tab-workflows-pipelines"
          onClick={() => setActiveSubTab('pipelines')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
            activeSubTab === 'pipelines'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Pipelines ({workflows.length})</span>
        </button>

        <button
          id="tab-workflows-dag"
          onClick={() => setActiveSubTab('dag_viewer')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
            activeSubTab === 'dag_viewer'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <GitFork className="w-3.5 h-3.5 text-purple-400" />
          <span>Visual DAG & Steps</span>
          {activeWorkflow && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
              {activeWorkflow.steps.length}
            </span>
          )}
        </button>

        <button
          id="tab-workflows-runs"
          onClick={() => setActiveSubTab('live_runs')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
            activeSubTab === 'live_runs'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Executions</span>
          {isSimulatingRun ? (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          ) : (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
              {executions.length}
            </span>
          )}
        </button>

        <button
          id="tab-workflows-templates"
          onClick={() => setActiveSubTab('templates')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
            activeSubTab === 'templates'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Runbook Templates</span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {WORKFLOW_TEMPLATES.length}
          </span>
        </button>

        <button
          id="tab-workflows-triggers"
          onClick={() => setActiveSubTab('triggers')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0 ${
            activeSubTab === 'triggers'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Schedules & Webhooks</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PIPELINES LIST VIEW                                                */}
      {/* ========================================================================= */}
      {activeSubTab === 'pipelines' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search workflows, tags, triggers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg p-1 text-xs">
                <span className="text-neutral-500 text-[11px] px-1.5">Trigger:</span>
                {(['all', 'webhook', 'cron', 'event'] as const).map(trig => (
                  <button
                    key={trig}
                    onClick={() => setTriggerFilter(trig)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                      triggerFilter === trig
                        ? 'bg-neutral-800 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {trig}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-lg p-1 text-xs">
                <span className="text-neutral-500 text-[11px] px-1.5">Status:</span>
                {(['all', 'active', 'paused'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                      statusFilter === st
                        ? 'bg-neutral-800 text-white font-semibold'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Workflow Cards List */}
          <div className="space-y-3">
            {filteredWorkflows.map(wf => {
              const isSelected = selectedWorkflowId === wf.id;
              return (
                <div
                  key={wf.id}
                  id={`wf-card-${wf.id}`}
                  onClick={() => {
                    setSelectedWorkflowId(wf.id);
                  }}
                  className={`bg-neutral-900 border rounded-xl p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 ring-1 ring-indigo-500/20 bg-neutral-900/90'
                      : 'border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info & Description */}
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                          <GitFork className="w-4 h-4 text-indigo-400" />
                          {wf.name}
                        </span>

                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-semibold border ${
                          wf.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                        }`}>
                          {wf.status}
                        </span>

                        {/* Trigger pill */}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800 flex items-center gap-1">
                          {wf.trigger.type === 'cron' && <Calendar className="w-3 h-3 text-cyan-400" />}
                          {wf.trigger.type === 'webhook' && <Radio className="w-3 h-3 text-amber-400" />}
                          {wf.trigger.type === 'event' && <Zap className="w-3 h-3 text-purple-400" />}
                          <span className="uppercase font-semibold">{wf.trigger.type}</span>
                          {wf.trigger.cronExpression && `: ${wf.trigger.cronExpression}`}
                          {wf.trigger.eventTopic && `: ${wf.trigger.eventTopic}`}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-2">
                        {wf.description}
                      </p>

                      {/* Tags & Step Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-neutral-400 font-medium">Steps ({wf.steps.length}):</span>
                        {wf.steps.map(step => (
                          <span
                            key={step.id}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800 flex items-center gap-1"
                          >
                            {renderActionIcon(step.actionType, 'w-3 h-3')}
                            <span>{step.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Metrics & Actions */}
                    <div className="flex flex-wrap items-center lg:flex-col lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-neutral-800">
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase">Avg Latency</div>
                          <div className="text-xs font-mono font-bold text-white">{wf.avgDurationMs}ms</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase">Total Runs</div>
                          <div className="text-xs font-mono font-bold text-neutral-200">{wf.totalRuns.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-400 uppercase">Success Rate</div>
                          <div className="text-xs font-mono font-bold text-emerald-400">{wf.successRate}%</div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkflowId(wf.id);
                            setActiveSubTab('dag_viewer');
                          }}
                          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-medium border border-neutral-700 flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect DAG</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkflowId(wf.id);
                            handleTriggerRun(wf);
                          }}
                          className="px-2.5 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                          title="Trigger Run Now"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run Now</span>
                        </button>

                        <button
                          onClick={(e) => handleToggleWorkflowStatus(wf.id, e)}
                          className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                          title={wf.status === 'active' ? 'Pause Workflow' : 'Resume Workflow'}
                        >
                          {wf.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: VISUAL DAG & STEP INSPECTOR                                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'dag_viewer' && activeWorkflow && (
        <div className="space-y-4">
          {/* Header for Active Workflow in DAG view */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <GitFork className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-tight">{activeWorkflow.name}</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {activeWorkflow.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 line-clamp-1">{activeWorkflow.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedWorkflowId}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-hidden"
              >
                {workflows.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>

              <button
                onClick={() => handleTriggerRun(activeWorkflow)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Simulate Run</span>
              </button>
            </div>
          </div>

          {/* DAG Visual Board & Step Inspector Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Interactive DAG flowchart */}
            <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                    Pipeline Execution Flow (DAG)
                  </h3>
                </div>
                <span className="text-[11px] text-neutral-400">Click a node to inspect step telemetry</span>
              </div>

              {/* Visual Nodes Sequence */}
              <div className="space-y-4 relative py-2">
                {/* Trigger Root Node */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-xs">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">TRIGGER: {activeWorkflow.trigger.type.toUpperCase()}</span>
                      <span className="text-[10px] font-mono text-neutral-400">Entrypoint</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {activeWorkflow.trigger.cronDescription || activeWorkflow.trigger.webhookPath || activeWorkflow.trigger.eventTopic || 'Manual invocation'}
                    </p>
                  </div>
                </div>

                {/* Arrow down connector */}
                <div className="flex justify-center -my-2 pl-5">
                  <div className="w-0.5 h-6 bg-indigo-500/40"></div>
                </div>

                {/* Sequential / Branching Steps */}
                {activeWorkflow.steps.map((step, idx) => {
                  const isStepSelected = selectedStepId === step.id;
                  const isParallel = !!step.parallelWith && step.parallelWith.length > 0;

                  return (
                    <React.Fragment key={step.id}>
                      <div
                        id={`dag-node-${step.id}`}
                        onClick={() => setSelectedStepId(step.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          isStepSelected
                            ? 'bg-neutral-950 border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                          {renderActionIcon(step.actionType, 'w-5 h-5')}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white truncate">{step.name}</span>
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                                {step.actionType.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400">
                              Step {idx + 1}/{activeWorkflow.steps.length}
                            </span>
                          </div>

                          <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">{step.description}</p>

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-mono text-neutral-400">
                            <span>Timeout: {step.timeoutSeconds}s</span>
                            <span>Max Retries: {step.maxRetries}</span>
                            {isParallel && (
                              <span className="text-purple-400 font-semibold">Parallel Branch Active</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Down connector arrow if not last step */}
                      {idx < activeWorkflow.steps.length - 1 && (
                        <div className="flex justify-center -my-2 pl-5">
                          <div className="w-0.5 h-6 bg-indigo-500/40"></div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Right: Step Inspector Detail Panel */}
            <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              {(() => {
                const inspectStep = activeWorkflow.steps.find(s => s.id === selectedStepId) || activeWorkflow.steps[0];
                if (!inspectStep) return <div className="text-xs text-neutral-500">No step selected.</div>;

                return (
                  <div className="space-y-4">
                    <div className="border-b border-neutral-800 pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          {renderActionIcon(inspectStep.actionType, 'w-4 h-4')}
                          <span>Step Inspector</span>
                        </h3>
                        <span className="text-[10px] font-mono bg-neutral-950 px-2 py-0.5 rounded text-neutral-400 border border-neutral-800">
                          {inspectStep.id}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-1">{inspectStep.name}</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">{inspectStep.description}</p>
                    </div>

                    {/* Step Configuration Details */}
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-neutral-300">Action Type & Parameters</div>
                      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2 text-xs font-mono">
                        <div className="flex justify-between text-neutral-400">
                          <span>Action:</span>
                          <span className="text-white font-semibold">{inspectStep.actionType}</span>
                        </div>
                        {inspectStep.config.endpoint && (
                          <div className="space-y-1">
                            <span className="text-neutral-400">Endpoint:</span>
                            <div className="bg-neutral-900 p-1.5 rounded text-amber-300 break-all text-[11px]">
                              {inspectStep.config.method || 'POST'} {inspectStep.config.endpoint}
                            </div>
                          </div>
                        )}
                        {inspectStep.config.script && (
                          <div className="space-y-1">
                            <span className="text-neutral-400">MicroVM Script:</span>
                            <pre className="bg-neutral-900 p-2 rounded text-blue-300 text-[10px] overflow-x-auto whitespace-pre-wrap">
                              {inspectStep.config.script}
                            </pre>
                          </div>
                        )}
                        {inspectStep.config.query && (
                          <div className="space-y-1">
                            <span className="text-neutral-400">SQL Query:</span>
                            <div className="bg-neutral-900 p-1.5 rounded text-emerald-300 text-[11px]">
                              {inspectStep.config.query}
                            </div>
                          </div>
                        )}
                        {inspectStep.config.model && (
                          <div className="flex justify-between text-neutral-400">
                            <span>AI Model:</span>
                            <span className="text-purple-300">{inspectStep.config.model}</span>
                          </div>
                        )}
                      </div>

                      {/* Execution Policy */}
                      <div className="text-xs font-semibold text-neutral-300">Resilience & Retry Policy</div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg">
                          <span className="text-neutral-400 text-[10px] block">MAX RETRIES</span>
                          <span className="text-white font-bold text-sm">{inspectStep.maxRetries}</span>
                          <span className="text-neutral-500 text-[10px] block">Exp. backoff</span>
                        </div>
                        <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg">
                          <span className="text-neutral-400 text-[10px] block">HARD TIMEOUT</span>
                          <span className="text-white font-bold text-sm">{inspectStep.timeoutSeconds}s</span>
                          <span className="text-neutral-500 text-[10px] block">SIGKILL barrier</span>
                        </div>
                      </div>

                      {/* Dependencies */}
                      <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg text-xs space-y-1">
                        <span className="text-neutral-400 text-[11px]">Dependencies:</span>
                        <div className="text-neutral-200 font-mono text-[11px]">
                          {inspectStep.dependencies.length > 0 
                            ? inspectStep.dependencies.join(', ')
                            : 'None (Root Step)'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LIVE RUNS & EXECUTION HISTORY                                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'live_runs' && (
        <div className="space-y-4">
          {/* Live Run Banner if running */}
          {isSimulatingRun && simulatedExecution && (
            <div className="bg-amber-950/40 border border-amber-600/40 p-4 rounded-xl space-y-3 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></div>
                  <span className="text-xs font-bold text-amber-300">
                    LIVE EXECUTION IN PROGRESS: {simulatedExecution.id}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-amber-400">Step {simulatedStepIndex + 1} active</span>
              </div>
              <p className="text-xs text-amber-200/80">
                Executing workflow steps sequentially inside isolated microVM workers...
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Executions List */}
            <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Recent Executions</span>
                </h3>
                <span className="text-[10px] font-mono text-neutral-400">
                  {executions.length} runs logged
                </span>
              </div>

              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                {/* Simulated execution at top if exists */}
                {simulatedExecution && (
                  <div
                    onClick={() => setSelectedExecutionId(simulatedExecution.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedExecutionId === simulatedExecution.id
                        ? 'bg-neutral-950 border-amber-500 ring-1 ring-amber-500/30'
                        : 'bg-neutral-950 border-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300">{simulatedExecution.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {simulatedExecution.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-white font-medium mt-1 truncate">{simulatedExecution.workflowName}</div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2 font-mono">
                      <span>{simulatedExecution.triggerType.toUpperCase()}</span>
                      <span>Active</span>
                    </div>
                  </div>
                )}

                {executions.map(exec => {
                  const isSelected = selectedExecutionId === exec.id;
                  return (
                    <div
                      key={exec.id}
                      id={`exec-item-${exec.id}`}
                      onClick={() => setSelectedExecutionId(exec.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-neutral-950 border-indigo-500 ring-1 ring-indigo-500/30'
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-white">{exec.id}</span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold border ${
                          exec.status === 'succeeded'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {exec.status}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-200 font-medium mt-1 truncate">{exec.workflowName}</div>
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2 font-mono">
                        <span>{exec.triggerType.toUpperCase()}</span>
                        <span>{exec.durationMs}ms</span>
                        <span>{new Date(exec.startedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Execution Deep Inspection Drawer */}
            <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              {activeExecution ? (
                <div className="space-y-4">
                  {/* Execution Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white font-mono">{activeExecution.id}</h3>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold border ${
                          activeExecution.status === 'succeeded'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : activeExecution.status === 'running'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}>
                          {activeExecution.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{activeExecution.triggeredBy}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">{activeExecution.durationMs}ms total</div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        Started: {new Date(activeExecution.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  {/* Step Execution Waterfall Timeline */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                      Step Results & Timings
                    </h4>

                    <div className="space-y-2">
                      {activeExecution.stepResults.map((sr, idx) => (
                        <div key={sr.stepId || idx} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {renderActionIcon(sr.actionType, 'w-3.5 h-3.5')}
                              <span className="text-xs font-bold text-white">{sr.stepName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-neutral-400">{sr.durationMs}ms</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                                sr.status === 'succeeded'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : sr.status === 'running'
                                  ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                                  : 'bg-neutral-800 text-neutral-400'
                              }`}>
                                {sr.status}
                              </span>
                            </div>
                          </div>

                          {/* Step Logs */}
                          {sr.logs && sr.logs.length > 0 && (
                            <div className="bg-neutral-900 p-2 rounded text-[10px] font-mono text-neutral-300 space-y-0.5">
                              {sr.logs.map((log, lIdx) => (
                                <div key={lIdx} className="truncate">{log}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payloads Inspector (Input / Output) */}
                  <div className="space-y-2 pt-2 border-t border-neutral-800">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-neutral-300">Payload State Inspection</h4>
                      <button
                        onClick={() => handleCopy(JSON.stringify(activeExecution.inputPayload, null, 2), 'payload')}
                        className="text-[10px] text-neutral-400 hover:text-white flex items-center gap-1 font-mono"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy Input JSON</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-400 block mb-1">Input Payload:</span>
                        <pre className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg text-[10px] text-indigo-300 overflow-x-auto max-h-40">
                          {JSON.stringify(activeExecution.inputPayload, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 block mb-1">Output Payload:</span>
                        <pre className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-lg text-[10px] text-emerald-300 overflow-x-auto max-h-40">
                          {activeExecution.outputPayload 
                            ? JSON.stringify(activeExecution.outputPayload, null, 2)
                            : '// Running / Pending output'}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 text-center py-12">Select an execution to view details</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RUNBOOK TEMPLATES                                                  */}
      {/* ========================================================================= */}
      {activeSubTab === 'templates' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Pre-Engineered Workflow Runbooks</h3>
              <p className="text-xs text-neutral-400">
                Production-grade serverless blueprints tested across hundreds of deployments. Click &quot;Use Template&quot; to fork into your pipeline.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              Zero Cold-Start Guaranteed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WORKFLOW_TEMPLATES.map(tmpl => (
              <div
                key={tmpl.id}
                id={`template-card-${tmpl.id}`}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 hover:border-neutral-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white tracking-tight">{tmpl.title}</span>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800 uppercase font-semibold">
                      {tmpl.triggerType}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {tmpl.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {tmpl.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <div className="text-[11px] text-neutral-400 font-mono">
                    <span>{tmpl.stepCount} Steps</span> • <span>{tmpl.estimatedLatency}</span>
                  </div>

                  <button
                    id={`btn-use-template-${tmpl.id}`}
                    onClick={() => handleUseTemplate(tmpl)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Use Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SCHEDULES & WEBHOOK TRIGGERS                                       */}
      {/* ========================================================================= */}
      {activeSubTab === 'triggers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Webhook Endpoints */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Radio className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  HTTP Webhook Endpoints
                </h3>
              </div>

              <div className="space-y-3">
                {workflows.filter(w => w.trigger.type === 'webhook').map(w => (
                  <div key={w.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{w.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        POST
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-neutral-900 p-1.5 rounded text-[11px] font-mono text-amber-300 break-all">
                      <span>https://api.cloudmesh.dev{w.trigger.webhookPath}</span>
                      <button
                        onClick={() => handleCopy(`https://api.cloudmesh.dev${w.trigger.webhookPath}`, w.id)}
                        className="p-1 text-neutral-400 hover:text-white shrink-0 ml-2"
                        title="Copy Webhook URL"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Max concurrency: {w.concurrencyLimit}</span>
                      <button
                        onClick={() => handleTriggerRun(w)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                      >
                        Send Test Ping →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cron Schedules */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Scheduled Cron Jobs
                </h3>
              </div>

              <div className="space-y-3">
                {workflows.filter(w => w.trigger.type === 'cron').map(w => (
                  <div key={w.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{w.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                        {w.trigger.cronExpression}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-400">
                      {w.trigger.cronDescription || 'Standard cron interval'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1 border-t border-neutral-900 font-mono">
                      <span>Last run: {w.lastRunAt || 'Never'}</span>
                      <button
                        onClick={() => handleTriggerRun(w)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold"
                      >
                        Force Run Now →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: TRIGGER WORKFLOW WITH CUSTOM JSON PAYLOAD                          */}
      {/* ========================================================================= */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-400 fill-current" />
                <h3 className="text-sm font-bold text-white">Trigger Workflow Execution</h3>
              </div>
              <button
                onClick={() => setIsTriggerModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Target Workflow:</label>
                <select
                  value={selectedWorkflowId}
                  onChange={(e) => setSelectedWorkflowId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono"
                >
                  {workflows.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.trigger.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Input JSON Payload:</label>
                <textarea
                  rows={6}
                  value={triggerPayloadText}
                  onChange={(e) => setTriggerPayloadText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-indigo-300 font-mono focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <p className="text-[11px] text-neutral-500">
                This will trigger an execution in the sandboxed worker environment and stream live logs.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setIsTriggerModalOpen(false)}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>

              <button
                onClick={() => handleTriggerRun()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Live Run</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW WORKFLOW                                                */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateWorkflow}
            className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Create New Serverless Workflow</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Workflow Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. daily-cache-sync"
                  value={newWfName}
                  onChange={(e) => setNewWfName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Description:</label>
                <textarea
                  rows={2}
                  placeholder="Explain the orchestration pipeline purpose..."
                  value={newWfDesc}
                  onChange={(e) => setNewWfDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Trigger Type:</label>
                  <select
                    value={newWfTriggerType}
                    onChange={(e) => setNewWfTriggerType(e.target.value as WorkflowTriggerType)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                  >
                    <option value="webhook">HTTP Webhook</option>
                    <option value="cron">Cron Schedule</option>
                    <option value="event">Event Bus</option>
                    <option value="manual">Manual Trigger</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Max Concurrency:</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={newWfConcurrency}
                    onChange={(e) => setNewWfConcurrency(Number(e.target.value))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {newWfTriggerType === 'cron' && (
                <div>
                  <label className="text-neutral-400 block mb-1">Cron Expression:</label>
                  <input
                    type="text"
                    value={newWfCron}
                    onChange={(e) => setNewWfCron(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              )}

              {newWfTriggerType === 'webhook' && (
                <div>
                  <label className="text-neutral-400 block mb-1">Webhook Path:</label>
                  <input
                    type="text"
                    value={newWfWebhook}
                    onChange={(e) => setNewWfWebhook(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Create Pipeline
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
