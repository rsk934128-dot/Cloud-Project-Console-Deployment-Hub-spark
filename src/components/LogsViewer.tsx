import React, { useState } from 'react';
import { ProjectItem, DeploymentLog } from '../types';
import { Terminal, Filter, RefreshCw, Download, Search, CheckCircle2, AlertOctagon, AlertTriangle } from 'lucide-react';
import { MOCK_PROJECT_LOGS } from '../mockData';

interface LogsViewerProps {
  projects: ProjectItem[];
}

export const LogsViewer: React.FC<LogsViewerProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'p-1');
  const [filterLevel, setFilterLevel] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [logSearch, setLogSearch] = useState('');

  const currentProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const logs: DeploymentLog[] = MOCK_PROJECT_LOGS[selectedProjectId] || [
    { id: 'def-1', timestamp: '10:21:00', level: 'info', message: `Initializing runtime proxy for ${currentProject.displayName}`, source: 'system' },
    { id: 'def-2', timestamp: '10:21:04', level: 'success', message: 'Ready on port 3000 (0.0.0.0). Ingress healthy.', source: 'router' },
    { id: 'def-3', timestamp: '10:21:18', level: 'info', message: 'Traffic routed to edge datacenter Washington, D.C. (iad1)', source: 'dns' }
  ];

  const filteredLogs = logs.filter((l) => {
    if (filterLevel !== 'all' && l.level !== filterLevel) return false;
    if (logSearch && !l.message.toLowerCase().includes(logSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-neutral-400" />
            Real-time Deployment & Ingress Logs
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Streaming deployment logs, build pipelines, and runtime errors across clusters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-md px-3 py-1.5 text-xs text-white outline-none focus:border-neutral-700 font-mono"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            value={logSearch}
            onChange={(e) => setLogSearch(e.target.value)}
            placeholder="Filter logs by keyword..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1 text-xs text-white placeholder-neutral-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'error', 'warn', 'info'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2 py-1 rounded capitalize text-[11px] font-medium transition-colors ${
                filterLevel === lvl
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Console output window */}
      <div className="bg-black border border-neutral-800 rounded-lg p-4 font-mono text-xs text-neutral-300 min-h-[360px] max-h-[550px] overflow-y-auto space-y-2">
        <div className="text-neutral-400 text-[11px] pb-2 border-b border-neutral-800/80 flex items-center justify-between">
          <span>Target: {currentProject.fullDomain}</span>
          <span>Region: {currentProject.regions.join(', ')}</span>
        </div>

        {filteredLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 hover:bg-neutral-900/60 p-1 rounded">
            <span className="text-neutral-400 text-[11px] shrink-0">{log.timestamp}</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase shrink-0 ${
              log.level === 'error' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
              log.level === 'warn' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
              log.level === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
              'bg-neutral-900 text-neutral-400'
            }`}>
              {log.level}
            </span>
            <span className="text-neutral-400 text-[11px] shrink-0 font-mono">[{log.source}]</span>
            <span className={`break-all ${
              log.level === 'error' ? 'text-rose-400 font-semibold' :
              log.level === 'warn' ? 'text-amber-300' :
              log.level === 'success' ? 'text-emerald-300' : 'text-neutral-200'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
