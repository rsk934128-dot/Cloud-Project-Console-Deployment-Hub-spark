import React, { useState } from 'react';
import { 
  ProjectItem 
} from '../types';
import { 
  ExternalLink, 
  GitBranch, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  MoreVertical, 
  Copy, 
  Globe, 
  Terminal, 
  RotateCw,
  Mail,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Server
} from 'lucide-react';

interface ProjectGridProps {
  projects: ProjectItem[];
  viewMode: 'grid' | 'list';
  onSelectProject: (project: ProjectItem) => void;
  onSendAlertForProject: (project: ProjectItem) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  viewMode,
  onSelectProject,
  onSendAlertForProject
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getStatusBadge = (status: ProjectItem['status']) => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Ready
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-950/60 border border-rose-800/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Error
          </span>
        );
      case 'BUILDING':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            Building
          </span>
        );
      case 'QUEUED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded-full">
            Queued
          </span>
        );
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden divide-y divide-neutral-800">
        <div className="grid grid-cols-12 px-4 py-2.5 bg-neutral-950/50 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          <div className="col-span-4">Project & Domain</div>
          <div className="col-span-3">Latest Commit / Deployment</div>
          <div className="col-span-2">Framework & Region</div>
          <div className="col-span-2">Status & Health</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>

        {projects.map((proj) => (
          <div
            key={proj.id}
            id={`project-row-${proj.id}`}
            onClick={() => onSelectProject(proj)}
            className="grid grid-cols-12 px-4 py-3 items-center hover:bg-neutral-800/50 cursor-pointer transition-colors text-xs text-neutral-300 group"
          >
            {/* Project Title & Link */}
            <div className="col-span-4 pr-3">
              <div className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                {proj.displayName}
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mt-0.5 truncate">
                <Globe className="w-3 h-3 text-neutral-400 shrink-0" />
                <span className="truncate">{proj.fullDomain}</span>
                <button
                  onClick={(e) => handleCopy(e, `https://${proj.fullDomain}`, proj.id)}
                  title="Copy URL"
                  className="hover:text-white"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Commit and Time */}
            <div className="col-span-3 pr-3">
              <div className="truncate text-neutral-200 text-xs font-mono">{proj.latestCommit}</div>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
                <GitBranch className="w-3 h-3 text-neutral-400" />
                <span>{proj.branch}</span>
                <span>•</span>
                <span>{proj.commitTime}</span>
              </div>
            </div>

            {/* Framework & Region */}
            <div className="col-span-2 pr-2">
              <div className="text-neutral-200 text-xs truncate">{proj.framework}</div>
              <div className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1 font-mono">
                <Server className="w-3 h-3 text-neutral-400" />
                {proj.regions.join(', ')}
              </div>
            </div>

            {/* Status & Health */}
            <div className="col-span-2 flex items-center gap-2">
              {getStatusBadge(proj.status)}
              {proj.alertsCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-mono">
                  <ShieldAlert className="w-3 h-3" />
                  {proj.alertsCount}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="col-span-1 text-right flex items-center justify-end gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendAlertForProject(proj);
                }}
                title="Send Gmail alert for this project"
                className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>
              <a
                href={`https://${proj.fullDomain}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Open deployed URL"
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((proj) => (
        <div
          key={proj.id}
          id={`project-card-${proj.id}`}
          onClick={() => onSelectProject(proj)}
          className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg flex flex-col justify-between group"
        >
          {/* Card Top: Header & Status */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="truncate">
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                  {proj.displayName}
                </h3>
                <a
                  href={`https://${proj.fullDomain}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 mt-0.5 truncate max-w-full"
                >
                  <Globe className="w-3 h-3 shrink-0" />
                  <span className="truncate">{proj.fullDomain}</span>
                  <ArrowUpRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
              <div className="shrink-0">{getStatusBadge(proj.status)}</div>
            </div>

            {/* Commit Message Box */}
            <div className="mt-3 p-2.5 rounded bg-neutral-950/70 border border-neutral-800/80 text-xs">
              <div className="font-mono text-neutral-300 truncate text-[11px]">
                {proj.latestCommit}
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-1.5">
                <span className="truncate max-w-[170px] flex items-center gap-1">
                  <GitBranch className="w-3 h-3 shrink-0 text-neutral-400" />
                  {proj.repo.split('/')[1] || proj.repo}
                </span>
                <span className="text-[10px] shrink-0 font-mono text-neutral-400">{proj.commitTime}</span>
              </div>
            </div>
          </div>

          {/* Card Bottom: Metadata & Metrics */}
          <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-1.5 py-0.5 bg-neutral-800 rounded text-neutral-300">
                {proj.framework.split(' ')[0]}
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                {proj.metrics.edgeRequests24h.toLocaleString()} reqs
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendAlertForProject(proj);
                }}
                title="Send alert notification via Gmail"
                className="p-1.5 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 rounded transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => handleCopy(e, `https://${proj.fullDomain}`, proj.id)}
                title="Copy deployment domain"
                className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
