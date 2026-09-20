import React, { useState, useMemo } from 'react';
import {
  SandboxInstance,
  SandboxSnapshot,
  SandboxTemplate,
  CodeExecutionResult,
  SandboxRuntime,
  SandboxStatus
} from '../types/sandboxes';
import {
  INITIAL_SANDBOXES,
  INITIAL_SNAPSHOTS,
  SANDBOX_TEMPLATES
} from '../data/sandboxesData';
import {
  Box,
  Zap,
  Cpu,
  Server,
  Play,
  Pause,
  RotateCcw,
  Terminal,
  Camera,
  Layers,
  Search,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Clock,
  HardDrive,
  Activity,
  Trash2,
  Lock,
  Flame,
  Globe,
  CornerDownLeft,
  ChevronRight,
  Shield,
  Sparkles,
  RefreshCw,
  FolderTree,
  Power
} from 'lucide-react';

export const SandboxesConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'instances' | 'terminal' | 'snapshots' | 'templates'>('instances');
  const [sandboxes, setSandboxes] = useState<SandboxInstance[]>(INITIAL_SANDBOXES);
  const [snapshots, setSnapshots] = useState<SandboxSnapshot[]>(INITIAL_SNAPSHOTS);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'hibernated'>('all');

  // Terminal Runner State
  const [selectedSandboxId, setSelectedSandboxId] = useState<string>(sandboxes[0]?.id || '');
  const [commandInput, setCommandInput] = useState('node -e "console.log(\'Cloudmesh microVM booted in 48ms.\', { memory: process.memoryUsage(), env: process.env.NODE_ENV })"');
  const [isExecutingCmd, setIsExecutingCmd] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<Array<{
    cmd: string;
    stdout: string;
    stderr?: string;
    exitCode: number;
    durationMs: number;
    timestamp: string;
  }>>([
    {
      cmd: 'uname -a && cat /etc/os-release | grep PRETTY_NAME',
      stdout: 'Linux cloudmesh-microvm-iad1 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64\nPRETTY_NAME="Ubuntu 24.04.1 LTS (Firecracker v1.9.0 Minimal)"',
      exitCode: 0,
      durationMs: 14,
      timestamp: '11:21:04'
    },
    {
      cmd: 'node -v && npm -v',
      stdout: 'v22.11.0\n10.9.0',
      exitCode: 0,
      durationMs: 18,
      timestamp: '11:21:28'
    }
  ]);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSbxForm, setNewSbxForm] = useState({
    name: '',
    description: '',
    runtime: 'nodejs22' as SandboxRuntime,
    vCpu: 2,
    memoryMb: 2048,
    diskGb: 10,
    region: 'us-east1 (Ashburn)',
    exposedPort: 3000,
    autoHibernateMinutes: 15,
    enableGpu: false
  });

  // Snapshot modal
  const [isSnapModalOpen, setIsSnapModalOpen] = useState(false);
  const [snapTargetId, setSnapTargetId] = useState('');
  const [snapName, setSnapName] = useState('');

  // Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Selected Sandbox helper
  const activeSandbox = useMemo(
    () => sandboxes.find(s => s.id === selectedSandboxId) || sandboxes[0],
    [sandboxes, selectedSandboxId]
  );

  // Toggle Sandbox Status (Hibernate / Resume)
  const handleToggleStatus = (id: string) => {
    setSandboxes(prev =>
      prev.map(sbx => {
        if (sbx.id !== id) return sbx;
        const nextStatus: SandboxStatus = sbx.status === 'running' ? 'hibernated' : 'running';
        return {
          ...sbx,
          status: nextStatus,
          uptime: nextStatus === 'running' ? '1m' : '0m (Hibernated)',
          cpuUsagePercent: nextStatus === 'running' ? 12.4 : 0,
          memoryUsagePercent: nextStatus === 'running' ? 24.1 : 0
        };
      })
    );
  };

  // Restart Sandbox
  const handleRestart = (id: string) => {
    setSandboxes(prev =>
      prev.map(sbx => (sbx.id === id ? { ...sbx, status: 'starting' } : sbx))
    );
    setTimeout(() => {
      setSandboxes(prev =>
        prev.map(sbx =>
          sbx.id === id
            ? { ...sbx, status: 'running', uptime: '1m', cpuUsagePercent: 18.0 }
            : sbx
        )
      );
    }, 800);
  };

  // Terminate Sandbox
  const handleTerminate = (id: string) => {
    setSandboxes(prev => prev.filter(s => s.id !== id));
    if (selectedSandboxId === id) {
      setSelectedSandboxId(sandboxes.find(s => s.id !== id)?.id || '');
    }
  };

  // Execute Shell Command inside Sandbox
  const handleExecuteCommand = (commandToRun?: string) => {
    const cmd = commandToRun || commandInput;
    if (!cmd.trim() || isExecutingCmd) return;

    setIsExecutingCmd(true);

    const now = new Date().toLocaleTimeString('en-US', { hour12: false });
    const duration = Math.floor(18 + Math.random() * 45);

    setTimeout(() => {
      let mockStdout = '';
      let exit = 0;

      if (cmd.includes('node -e') || cmd.includes('node -v')) {
        mockStdout = `Cloudmesh microVM booted in 48ms. {\n  memory: { rss: 34185216, heapTotal: 8388608, heapUsed: 5932112 },\n  env: 'production'\n}`;
      } else if (cmd.includes('python') || cmd.includes('numpy')) {
        mockStdout = `Python 3.12.7 (main, Oct 14 2026, 12:08:44)\nNumPy vector test completed: 1,000,000 matrix multiplications in 14.8ms.`;
      } else if (cmd.includes('nvidia') || cmd.includes('gpu')) {
        mockStdout = `+-----------------------------------------------------------------------------------------+\n| NVIDIA-SMI 550.90.07              Driver Version: 550.90.07      CUDA Version: 12.4     |\n|-----------------------------------------+------------------------+----------------------+\n| GPU  Name                 Persistence-M | Bus-Id          Disp.A | Volatile Uncorr. ECC |\n| Fan  Temp   Perf          Pwr:Usage/Cap |           Memory-Usage | GPU-Util  Compute M. |\n|=========================================+========================+======================|\n|   0  NVIDIA L4                      Off | 00000000:00:04.0   Off |                    0 |\n| N/A   42C    P0              32W /  72W |    1820MiB / 23034MiB  |     14%      Default |\n+-----------------------------------------+------------------------+----------------------+`;
      } else if (cmd.includes('ls') || cmd.includes('dir')) {
        mockStdout = `total 24\ndrwxr-xr-x 4 appuser appuser 4096 Sep 20 11:15 .\ndrwxr-xr-x 3 root    root    4096 Sep 20 11:12 ..\n-rw-r--r-- 1 appuser appuser  842 Sep 20 11:14 package.json\n-rw-r--r-- 1 appuser appuser 2810 Sep 20 11:15 server.ts\ndrwxr-xr-x 2 appuser appuser 4096 Sep 20 11:14 dist\ndrwxr-xr-x 8 appuser appuser 4096 Sep 20 11:14 node_modules`;
      } else if (cmd.includes('curl') || cmd.includes('http')) {
        mockStdout = `HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nContent-Length: 48\nDate: Sun, 20 Sep 2026 18:22:15 GMT\n\n{"status":"healthy","uptime_sec":13982,"nodes":4}`;
      } else if (cmd.includes('top') || cmd.includes('ps')) {
        mockStdout = `PID   USER     PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 142  appuser  20   0  982104 148200  48102 S   8.2   7.2   0:42.18 node\n 189  appuser  20   0   48210   8412   4100 S   0.8   0.4   0:01.04 cloudmesh-agent\n 201  appuser  20   0   12410   2100   1800 R   0.2   0.1   0:00.02 ps`;
      } else {
        mockStdout = `[stdout] Command "${cmd}" executed successfully with exit code 0.`;
      }

      setTerminalHistory(prev => [
        ...prev,
        {
          cmd,
          stdout: mockStdout,
          exitCode: exit,
          durationMs: duration,
          timestamp: now
        }
      ]);

      setIsExecutingCmd(false);
    }, duration + 100);
  };

  // Create new MicroVM
  const handleCreateSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSbxForm.name.trim()) return;

    const id = `sbx-${newSbxForm.runtime.slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`;
    const newInstance: SandboxInstance = {
      id,
      name: newSbxForm.name.trim(),
      description: newSbxForm.description.trim() || 'Ephemeral MicroVM execution sandbox',
      runtime: newSbxForm.runtime,
      status: 'running',
      vCpu: Number(newSbxForm.vCpu),
      memoryMb: Number(newSbxForm.memoryMb),
      diskGb: Number(newSbxForm.diskGb),
      region: newSbxForm.region,
      bootTimeMs: Math.floor(45 + Math.random() * 40),
      createdAt: 'Just now',
      uptime: '1m',
      lastActive: 'Just now',
      exposedPorts: [Number(newSbxForm.exposedPort)],
      publicUrl: `https://${id}.sandbox.cloudmesh.run`,
      activeProcesses: 4,
      cpuUsagePercent: 6.2,
      memoryUsagePercent: 18.5,
      networkEgressMb: 0.1,
      autoHibernateMinutes: Number(newSbxForm.autoHibernateMinutes),
      gpu: newSbxForm.enableGpu ? 'NVIDIA L4 (24GB VRAM)' : undefined,
      tags: ['Ephemeral', 'MicroVM', 'Firecracker']
    };

    setSandboxes(prev => [newInstance, ...prev]);
    setSelectedSandboxId(id);
    setIsCreateModalOpen(false);
    setNewSbxForm({
      name: '',
      description: '',
      runtime: 'nodejs22',
      vCpu: 2,
      memoryMb: 2048,
      diskGb: 10,
      region: 'us-east1 (Ashburn)',
      exposedPort: 3000,
      autoHibernateMinutes: 15,
      enableGpu: false
    });
  };

  // Launch from Template
  const handleLaunchTemplate = (tmpl: SandboxTemplate) => {
    setNewSbxForm({
      name: `${tmpl.name.split(' ')[0]} Sandbox`,
      description: tmpl.tagline,
      runtime: tmpl.id,
      vCpu: tmpl.defaultCpu,
      memoryMb: tmpl.defaultMemoryMb,
      diskGb: tmpl.id === 'pytorch_cuda' ? 50 : 10,
      region: 'us-east1 (Ashburn)',
      exposedPort: tmpl.id === 'pytorch_cuda' ? 8080 : 3000,
      autoHibernateMinutes: 15,
      enableGpu: tmpl.id === 'pytorch_cuda'
    });
    setIsCreateModalOpen(true);
  };

  // Fork Sandbox from Snapshot
  const handleForkSnapshot = (snap: SandboxSnapshot) => {
    const forkedId = `sbx-fork-${Math.floor(100 + Math.random() * 900)}`;
    const forked: SandboxInstance = {
      id: forkedId,
      name: `Fork of ${snap.name.slice(0, 24)}`,
      description: `Fast copy-on-write replica restored in ${snap.restoreDurationMs}ms from ${snap.id}`,
      runtime: 'nodejs22',
      status: 'running',
      vCpu: 2,
      memoryMb: 2048,
      diskGb: 10,
      region: 'us-east1 (Ashburn)',
      bootTimeMs: snap.restoreDurationMs,
      createdAt: 'Just now',
      uptime: '1m',
      lastActive: 'Just now',
      exposedPorts: [3000],
      publicUrl: `https://${forkedId}.sandbox.cloudmesh.run`,
      activeProcesses: 6,
      cpuUsagePercent: 8.5,
      memoryUsagePercent: 29.2,
      networkEgressMb: 1.2,
      autoHibernateMinutes: 15,
      snapshotId: snap.id,
      tags: ['Snapshot-Fork', 'CoW-Memory']
    };

    setSandboxes(prev => [forked, ...prev]);
    setSelectedSandboxId(forkedId);
    setActiveTab('instances');
  };

  // Create Snapshot Action
  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapName.trim() || !snapTargetId) return;

    const targetSbx = sandboxes.find(s => s.id === snapTargetId);
    const newSnapshot: SandboxSnapshot = {
      id: `snap-${Date.now().toString().slice(-6)}`,
      sandboxId: snapTargetId,
      sandboxName: targetSbx?.name || snapTargetId,
      name: snapName.trim(),
      sizeMb: Math.floor(80 + Math.random() * 220),
      createdAt: 'Just now',
      restoreDurationMs: Math.floor(18 + Math.random() * 25),
      memoryIncluded: true
    };

    setSnapshots(prev => [newSnapshot, ...prev]);
    setIsSnapModalOpen(false);
    setSnapName('');
  };

  // Filtered sandboxes
  const filteredSandboxes = useMemo(() => {
    return sandboxes.filter(sbx => {
      const matchesSearch =
        sbx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sbx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sbx.runtime.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sbx.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'running' && sbx.status === 'running') ||
        (statusFilter === 'hibernated' && sbx.status === 'hibernated');

      return matchesSearch && matchesStatus;
    });
  }, [sandboxes, searchQuery, statusFilter]);

  // Aggregate Metrics
  const runningCount = useMemo(() => sandboxes.filter(s => s.status === 'running').length, [sandboxes]);
  const totalAllocatedCpu = useMemo(() => sandboxes.reduce((acc, s) => acc + s.vCpu, 0), [sandboxes]);
  const totalAllocatedRamGb = useMemo(() => (sandboxes.reduce((acc, s) => acc + s.memoryMb, 0) / 1024).toFixed(1), [sandboxes]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <Box className="w-5 h-5 text-indigo-400" />
              MicroVM Sandboxes & Code Execution
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Firecracker Isolated
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Ephemeral, hardware-isolated microVMs booted in &lt;60ms for AI code evaluation, staging previews, and secure untrusted execution.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('terminal')}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Shell Terminal
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New MicroVM
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Active MicroVMs</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {runningCount} <span className="text-xs text-neutral-500 font-normal">/ {sandboxes.length} fleet</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{sandboxes.length - runningCount} hibernated (0 cost)</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Cold Boot Latency</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            58ms
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Kernel initialization & vCPU spinup
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Allocated Resources</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {totalAllocatedCpu} vCPU <span className="text-xs text-neutral-500 font-normal">/ {totalAllocatedRamGb}GB RAM</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            1 NVIDIA L4 GPU active
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Memory Snapshots</span>
            <Camera className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {snapshots.length} Available
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Sub-30ms instant CoW restore
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('instances')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'instances'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Server className="w-4 h-4" />
          MicroVM Fleet
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {sandboxes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'terminal'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Interactive Shell & Runner
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('snapshots')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'snapshots'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          Fast-Fork Snapshots
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {snapshots.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Runtime Templates
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {SANDBOX_TEMPLATES.length}
          </span>
        </button>
      </div>

      {/* TAB 1: MICROVM FLEET */}
      {activeTab === 'instances' && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by name, ID, runtime, or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                All ({sandboxes.length})
              </button>
              <button
                onClick={() => setStatusFilter('running')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === 'running'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Running ({runningCount})
              </button>
              <button
                onClick={() => setStatusFilter('hibernated')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === 'hibernated'
                    ? 'bg-neutral-800 text-neutral-300'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Hibernated ({sandboxes.length - runningCount})
              </button>
            </div>
          </div>

          {/* Sandboxes list */}
          <div className="space-y-3">
            {filteredSandboxes.map((sbx) => {
              const isRunning = sbx.status === 'running';

              return (
                <div
                  key={sbx.id}
                  className={`bg-neutral-900 border ${
                    isRunning ? 'border-neutral-800 hover:border-neutral-700' : 'border-neutral-800/60 opacity-75'
                  } rounded-xl p-4 transition-all shadow-xs space-y-3`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{sbx.name}</span>
                        <span className="px-2 py-0.2 rounded text-[11px] font-mono bg-neutral-950 text-indigo-400 border border-neutral-800">
                          {sbx.id}
                        </span>

                        <span
                          className={`px-2 py-0.2 rounded text-[10px] font-bold font-mono uppercase ${
                            isRunning
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}
                        >
                          {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                          {sbx.status}
                        </span>

                        <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-neutral-950 text-neutral-300 border border-neutral-800">
                          {sbx.vCpu} vCPU • {(sbx.memoryMb / 1024).toFixed(1)}GB
                        </span>

                        {sbx.gpu && (
                          <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-purple-400" />
                            {sbx.gpu}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-1">{sbx.description}</p>

                      <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-1 flex-wrap font-mono">
                        <span>Region: <strong className="text-neutral-300 font-normal">{sbx.region}</strong></span>
                        <span>•</span>
                        <span>Boot: <strong className="text-emerald-400 font-normal">{sbx.bootTimeMs}ms</strong></span>
                        <span>•</span>
                        <span>Uptime: <strong className="text-neutral-300 font-normal">{sbx.uptime}</strong></span>
                        {sbx.publicUrl && (
                          <>
                            <span>•</span>
                            <a
                              href={sbx.publicUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-400 hover:underline flex items-center gap-1"
                            >
                              Port {sbx.exposedPorts[0]} <ExternalLink className="w-3 h-3" />
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right: Real-time Telemetry & Actions */}
                    <div className="flex items-center gap-5 border-t lg:border-t-0 lg:border-l border-neutral-800 pt-3 lg:pt-0 lg:pl-5 shrink-0 justify-between lg:justify-end">
                      {/* Live Resource Bars */}
                      <div className="space-y-1.5 w-32 font-mono text-[10px]">
                        <div>
                          <div className="flex justify-between text-neutral-400 mb-0.5">
                            <span>CPU</span>
                            <span className="text-white">{sbx.cpuUsagePercent}%</span>
                          </div>
                          <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all"
                              style={{ width: `${sbx.cpuUsagePercent}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-neutral-400 mb-0.5">
                            <span>RAM</span>
                            <span className="text-white">{sbx.memoryUsagePercent}%</span>
                          </div>
                          <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-purple-500 h-full rounded-full transition-all"
                              style={{ width: `${sbx.memoryUsagePercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSandboxId(sbx.id);
                            setActiveTab('terminal');
                          }}
                          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          title="Open Shell Terminal"
                        >
                          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                          Shell
                        </button>

                        <button
                          onClick={() => {
                            setSnapTargetId(sbx.id);
                            setSnapName(`Snapshot of ${sbx.name}`);
                            setIsSnapModalOpen(true);
                          }}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs transition-colors"
                          title="Capture Memory Snapshot"
                        >
                          <Camera className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(sbx.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isRunning
                              ? 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white'
                              : 'border-emerald-800/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                          }`}
                          title={isRunning ? 'Hibernate MicroVM' : 'Resume MicroVM in 28ms'}
                        >
                          {isRunning ? (
                            <Pause className="w-3.5 h-3.5 text-neutral-400" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>

                        <button
                          onClick={() => handleTerminate(sbx.id)}
                          className="p-1.5 rounded-lg border border-neutral-800 text-neutral-500 hover:text-red-400 hover:border-red-900/40 hover:bg-red-500/10 transition-colors"
                          title="Terminate Sandbox"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* TAB 2: INTERACTIVE SHELL & RUNNER */}
      {activeTab === 'terminal' && (
        <div className="space-y-4">
          {/* Target Sandbox Header */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400">Target MicroVM:</span>
              <select
                value={selectedSandboxId}
                onChange={(e) => setSelectedSandboxId(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              >
                {sandboxes.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id}) — {s.status}
                  </option>
                ))}
              </select>
            </div>

            {activeSandbox && (
              <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
                <span>Kernel: <strong className="text-neutral-200 font-normal">Firecracker v1.9</strong></span>
                <span>•</span>
                <span>vCPU: <strong className="text-neutral-200 font-normal">{activeSandbox.vCpu}</strong></span>
                <span>•</span>
                <span>RAM: <strong className="text-neutral-200 font-normal">{(activeSandbox.memoryMb / 1024).toFixed(1)}GB</strong></span>
              </div>
            )}
          </div>

          {/* Interactive Shell Terminal Window */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden font-mono shadow-2xl">
            {/* Terminal Title Bar */}
            <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="text-[11px] text-neutral-300 ml-2">
                  appuser@{activeSandbox?.id || 'microvm'}: ~ (seccomp jail)
                </span>
              </div>

              <span className="text-[10px] text-neutral-500">
                Isolated Rootless MicroVM
              </span>
            </div>

            {/* Terminal Body */}
            <div className="p-4 space-y-4 text-xs max-h-[420px] overflow-y-auto">
              <div className="text-neutral-500 text-[11px] space-y-0.5">
                <div>Welcome to Cloudmesh Firecracker microVM execution environment.</div>
                <div>Hardware virtualization (KVM) active. Egress filtered via Anycast firewall.</div>
              </div>

              {terminalHistory.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span className="text-indigo-400 font-bold">$</span>
                    <span className="text-white">{item.cmd}</span>
                    <span className="text-[10px] text-neutral-500 ml-auto">{item.durationMs}ms</span>
                  </div>
                  {item.stdout && (
                    <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed text-[11px] pl-4 border-l border-neutral-800">
                      {item.stdout}
                    </pre>
                  )}
                  {item.stderr && (
                    <pre className="text-red-400 whitespace-pre-wrap leading-relaxed text-[11px] pl-4 border-l border-red-800/60">
                      {item.stderr}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            {/* Terminal Input Bar */}
            <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2 text-xs">
              <span className="text-indigo-400 font-bold pl-2">$</span>
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteCommand()}
                placeholder="Type command (e.g. node -v, python3 -c '...', nvidia-smi, curl localhost:3000)..."
                className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder-neutral-500 font-mono text-xs"
              />
              <button
                onClick={() => handleExecuteCommand()}
                disabled={isExecutingCmd || !commandInput.trim()}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isExecutingCmd ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <CornerDownLeft className="w-3 h-3" />
                    Execute
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Command Snippets */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-neutral-500 font-mono text-[11px]">Quick Tests:</span>
            <button
              onClick={() => handleExecuteCommand('node -e "console.log(process.versions)"')}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[11px] transition-colors"
            >
              Node Runtime Version
            </button>
            <button
              onClick={() => handleExecuteCommand('python3 -c "import numpy as np; print(np.__version__)"')}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[11px] transition-colors"
            >
              NumPy Benchmark
            </button>
            <button
              onClick={() => handleExecuteCommand('nvidia-smi')}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[11px] transition-colors"
            >
              NVIDIA GPU Check
            </button>
            <button
              onClick={() => handleExecuteCommand('top -b -n 1 | head -n 12')}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[11px] transition-colors"
            >
              Process Table (top)
            </button>
            <button
              onClick={() => handleExecuteCommand('curl -I http://localhost:3000/api/health')}
              className="px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-mono text-[11px] transition-colors"
            >
              HTTP Ingress Probe
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: FAST-FORK SNAPSHOTS */}
      {activeTab === 'snapshots' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              Copy-on-Write Memory Snapshots & Instant Forking
            </h3>
            <p className="text-xs text-neutral-400">
              Capture frozen memory states of your microVMs. Fork identical pre-warmed sandbox replicas in &lt;30ms with zero duplicate disk overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white line-clamp-1">{snap.name}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-neutral-950 text-blue-400 border border-neutral-800">
                      {snap.id}
                    </span>
                  </div>

                  <div className="text-[11px] text-neutral-400">
                    Source: <span className="font-mono text-neutral-300">{snap.sandboxName}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-500 pt-1">
                    <span>Size: {snap.sizeMb} MB</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">Resume in {snap.restoreDurationMs}ms</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-neutral-500 font-mono">{snap.createdAt}</span>
                  <button
                    onClick={() => handleForkSnapshot(snap)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-sm text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    Fork Instant Replica
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: RUNTIME TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Pre-Optimized Container Base Layers
            </h3>
            <p className="text-xs text-neutral-400">
              Select an optimized microVM image with system dependencies, compilers, and acceleration drivers baked in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SANDBOX_TEMPLATES.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{tmpl.name}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-neutral-950 text-purple-400 border border-neutral-800">
                      {tmpl.defaultCpu} vCPU / {(tmpl.defaultMemoryMb / 1024).toFixed(1)}GB
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400">{tmpl.tagline}</p>

                  <div className="p-2 bg-neutral-950 border border-neutral-800 rounded font-mono text-[10px] text-neutral-400">
                    {tmpl.version}
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {tmpl.popularPackages.map((pkg) => (
                      <span
                        key={pkg}
                        className="px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-300 border border-neutral-800 text-[10px] font-mono"
                      >
                        {pkg}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex justify-end">
                  <button
                    onClick={() => handleLaunchTemplate(tmpl)}
                    className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3" />
                    Launch MicroVM
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE MICROVM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Box className="w-4 h-4 text-indigo-400" />
                Configure New MicroVM Sandbox
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSandbox} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Sandbox Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Prompt Code Evaluator"
                  value={newSbxForm.name}
                  onChange={(e) => setNewSbxForm({ ...newSbxForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Base Runtime</label>
                  <select
                    value={newSbxForm.runtime}
                    onChange={(e) => setNewSbxForm({ ...newSbxForm, runtime: e.target.value as SandboxRuntime })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="nodejs22">Node.js 22 LTS</option>
                    <option value="python312">Python 3.12 (Data Science)</option>
                    <option value="pytorch_cuda">PyTorch 2.5 (NVIDIA CUDA)</option>
                    <option value="golang123">Go 1.23</option>
                    <option value="rust_wasm">Rust 1.80 + Wasm</option>
                    <option value="ubuntu_base">Ubuntu 24.04 Bare</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Region</label>
                  <select
                    value={newSbxForm.region}
                    onChange={(e) => setNewSbxForm({ ...newSbxForm, region: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="us-east1 (Ashburn)">us-east1 (Ashburn)</option>
                    <option value="us-central1 (Iowa)">us-central1 (Iowa)</option>
                    <option value="us-east4 (N. Virginia)">us-east4 (N. Virginia)</option>
                    <option value="europe-west3 (Frankfurt)">europe-west3 (Frankfurt)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">vCPUs</label>
                  <select
                    value={newSbxForm.vCpu}
                    onChange={(e) => setNewSbxForm({ ...newSbxForm, vCpu: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                  >
                    <option value={1}>1 vCPU</option>
                    <option value={2}>2 vCPU</option>
                    <option value={4}>4 vCPU</option>
                    <option value={8}>8 vCPU</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">RAM (MB)</label>
                  <select
                    value={newSbxForm.memoryMb}
                    onChange={(e) => setNewSbxForm({ ...newSbxForm, memoryMb: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                  >
                    <option value={1024}>1,024 MB (1GB)</option>
                    <option value={2048}>2,048 MB (2GB)</option>
                    <option value={4096}>4,096 MB (4GB)</option>
                    <option value={8192}>8,192 MB (8GB)</option>
                    <option value={16384}>16,384 MB (16GB)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Exposed Port</label>
                  <input
                    type="number"
                    value={newSbxForm.exposedPort}
                    onChange={(e) => setNewSbxForm({ ...newSbxForm, exposedPort: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg">
                <div>
                  <div className="text-white font-medium">Auto-Hibernate on Inactivity</div>
                  <div className="text-[10px] text-neutral-500">Freezes memory to disk after 15 min idle</div>
                </div>
                <span className="text-xs font-mono text-emerald-400">15 mins</span>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] font-mono text-neutral-400">
                  Est. Rate: <strong className="text-white font-bold">$0.018 / hr</strong>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                  >
                    Boot MicroVM (~55ms)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SNAPSHOT MODAL */}
      {isSnapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                Capture MicroVM Snapshot
              </h3>
              <button
                onClick={() => setIsSnapModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSnapshot} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Snapshot Name</label>
                <input
                  type="text"
                  required
                  value={snapName}
                  onChange={(e) => setSnapName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-400 space-y-1 text-[11px]">
                <div>• Freezes RAM state without dropping TCP connections.</div>
                <div>• Snapshot will be ready to fork in ~25ms.</div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSnapModalOpen(false)}
                  className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Capture Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
