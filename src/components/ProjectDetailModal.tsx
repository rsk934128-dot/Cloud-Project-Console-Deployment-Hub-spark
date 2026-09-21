import React, { useState } from 'react';
import { 
  ProjectItem, 
  DeploymentLog 
} from '../types';
import { 
  X, 
  ExternalLink, 
  GitBranch, 
  Globe, 
  Terminal, 
  Server, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertOctagon, 
  Send, 
  RefreshCw,
  Copy,
  Clock,
  Zap,
  Lock,
  ArrowLeftRight
} from 'lucide-react';
import { LiveAppViewer } from './LiveAppViewer';

interface ProjectDetailModalProps {
  project: ProjectItem;
  logs: DeploymentLog[];
  onClose: () => void;
  onSendAlert: (project: ProjectItem) => void;
  onRebuild: (projectId: string) => void;
  onOpenCompare?: (project: ProjectItem) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  logs,
  onClose,
  onSendAlert,
  onRebuild,
  onOpenCompare
}) => {
  const [modalView, setModalView] = useState<'details' | 'live'>('details');
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="project-detail-modal"
        className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${
              project.status === 'READY' ? 'bg-emerald-400' :
              project.status === 'ERROR' ? 'bg-rose-500' : 'bg-amber-400'
            }`} />
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {project.displayName}
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-normal border border-neutral-700">
                  {project.environment}
                </span>
              </h2>
              <a 
                href={`https://${project.fullDomain}`} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-neutral-400 hover:text-blue-400 flex items-center gap-1 mt-0.5"
              >
                <Globe className="w-3 h-3" />
                {project.fullDomain}
                <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="modal-toggle-live-view-btn"
              onClick={() => setModalView(v => v === 'live' ? 'details' : 'live')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors border ${
                modalView === 'live'
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              }`}
              title="Open interactive in-app live browser for this project"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{modalView === 'live' ? 'Back to Metrics' : 'Live In-App App'}</span>
            </button>

            {onOpenCompare && (
              <button
                id="modal-compare-deployments-btn"
                onClick={() => onOpenCompare(project)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md text-xs font-medium border border-neutral-700 transition-colors"
                title="Compare past deployments and inspect diffs"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
                <span>Compare</span>
              </button>
            )}
            <button
              onClick={() => onSendAlert(project)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md text-xs font-medium border border-neutral-700 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>Email Alert</span>
            </button>
            <button
              onClick={() => onRebuild(project.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-neutral-200 rounded-md text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Redeploy</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {modalView === 'live' ? (
          <div className="flex-1 overflow-hidden p-3 bg-neutral-950">
            <LiveAppViewer project={project} standalone={true} />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-lg">
              <span className="text-[11px] text-neutral-400 block">24h Edge Requests</span>
              <span className="text-lg font-bold text-white font-mono mt-1 block">
                {project.metrics.edgeRequests24h.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <Zap className="w-2.5 h-2.5" /> Global CDN Cached
              </span>
            </div>
            <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-lg">
              <span className="text-[11px] text-neutral-400 block">Average Latency</span>
              <span className="text-lg font-bold text-white font-mono mt-1 block">
                {project.metrics.avgLatencyMs} ms
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                Target &lt; 50ms
              </span>
            </div>
            <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-lg">
              <span className="text-[11px] text-neutral-400 block">Error Rate</span>
              <span className={`text-lg font-bold font-mono mt-1 block ${
                project.metrics.errorRate > 1 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {project.metrics.errorRate}%
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                {project.status === 'ERROR' ? 'High error spike' : 'Optimal threshold'}
              </span>
            </div>
            <div className="bg-neutral-950/70 border border-neutral-800 p-3 rounded-lg">
              <span className="text-[11px] text-neutral-400 block">Regions & Health</span>
              <span className="text-lg font-bold text-white font-mono mt-1 block">
                {project.healthScore}/100
              </span>
              <span className="text-[10px] text-neutral-400 mt-0.5 block truncate">
                {project.regions.join(', ')} (East / Asia)
              </span>
            </div>
          </div>

          {/* Deployment Details Grid */}
          <div className="bg-neutral-950/50 border border-neutral-800 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-neutral-400 block font-medium">Git Repository & Branch</span>
              <div className="flex items-center gap-2 mt-1 text-white font-mono">
                <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
                <span>{project.repo}</span>
                <span className="text-neutral-400">({project.branch})</span>
              </div>
            </div>

            <div>
              <span className="text-neutral-400 block font-medium">Latest Commit</span>
              <p className="mt-1 text-neutral-200 font-mono text-[11px] bg-neutral-900 p-2 rounded border border-neutral-800">
                {project.latestCommit}
              </p>
            </div>

            <div>
              <span className="text-neutral-400 block font-medium">Build Framework</span>
              <span className="mt-1 text-neutral-200 font-mono block">
                {project.framework}
              </span>
            </div>

            <div>
              <span className="text-neutral-400 block font-medium">Deployment Duration</span>
              <span className="mt-1 text-neutral-200 font-mono block">
                {project.deploymentTime} (Total Deployments: {project.totalDeployments})
              </span>
            </div>
          </div>

          {/* Build and Runtime Console Logs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-neutral-400" />
                <span>Deployment & Runtime Build Logs</span>
              </div>
              <span className="text-[11px] font-mono text-neutral-400">
                Live stream (Washington, D.C., USA iad1)
              </span>
            </div>

            <div className="bg-black/90 border border-neutral-800 rounded-lg p-3.5 font-mono text-xs space-y-1.5 max-h-56 overflow-y-auto text-neutral-300">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5">
                    <span className="text-neutral-400 shrink-0 text-[11px]">{log.timestamp}</span>
                    <span className={`px-1 rounded text-[10px] uppercase font-bold shrink-0 ${
                      log.level === 'error' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                      log.level === 'warn' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      log.level === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      'bg-neutral-800 text-neutral-400'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-neutral-400 shrink-0 text-[10px]">[{log.source}]</span>
                    <span className={`break-all ${
                      log.level === 'error' ? 'text-rose-400' :
                      log.level === 'warn' ? 'text-amber-300' :
                      log.level === 'success' ? 'text-emerald-300' : 'text-neutral-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-neutral-400 text-center py-4">No recent runtime errors reported for this project.</div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <span>Project ID: <code className="font-mono text-neutral-300">{project.id}</code></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
