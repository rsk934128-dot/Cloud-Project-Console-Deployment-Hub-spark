import React, { useState } from 'react';
import { ProjectItem } from '../types';
import { 
  Rocket, 
  ArrowLeftRight, 
  GitBranch, 
  Sliders,
  Terminal,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Github
} from 'lucide-react';
import { DeploymentComparison } from './DeploymentComparison';

interface DeploymentsViewProps {
  projects: ProjectItem[];
  onSelectProject: (p: ProjectItem) => void;
  onOpenGitHubModal?: () => void;
}

export const DeploymentsView: React.FC<DeploymentsViewProps> = ({ projects, onSelectProject, onOpenGitHubModal }) => {
  const [viewMode, setViewMode] = useState<'list' | 'comparison'>('list');
  const [comparisonProjectId, setComparisonProjectId] = useState<string>(projects[0]?.id || 'p-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterEnvironment, setFilterEnvironment] = useState<'all' | 'Production' | 'Preview'>('all');

  const filteredProjects = projects.filter(proj => {
    if (filterEnvironment !== 'all' && proj.environment !== filterEnvironment) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        proj.displayName.toLowerCase().includes(q) ||
        proj.fullDomain.toLowerCase().includes(q) ||
        proj.latestCommit.toLowerCase().includes(q) ||
        proj.branch.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenComparisonForProject = (proj: ProjectItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setComparisonProjectId(proj.id);
    setViewMode('comparison');
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Rocket className="w-4 h-4 text-blue-400" />
            Deployments & Release Pipeline
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            History of deployments, production releases, and side-by-side configuration & build log comparisons.
          </p>
        </div>

        {/* View Mode Toggle & GitHub Deploy */}
        <div className="flex items-center gap-2">
          {onOpenGitHubModal && (
            <button
              id="deployments-view-github-deploy-btn"
              onClick={onOpenGitHubModal}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Deploy from GitHub</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 p-1 rounded-lg">
            <button
              id="deployments-view-list-tab"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-neutral-800 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>All Deployments</span>
            </button>

            <button
              id="deployments-view-comparison-tab"
              onClick={() => setViewMode('comparison')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'comparison'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Deployment Comparison</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-900/60 text-blue-200 text-[10px] border border-blue-700/50">
                Diff
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode 1: Deployment Comparison View */}
      {viewMode === 'comparison' ? (
        <DeploymentComparison
          projects={projects}
          initialProjectId={comparisonProjectId}
          onBackToDeploymentsList={() => setViewMode('list')}
          onSelectProject={onSelectProject}
        />
      ) : (
        /* Mode 2: All Deployments List View */
        <div className="space-y-3">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-lg text-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
              <input
                id="deployments-search-input"
                type="text"
                placeholder="Filter by project name, commit, or branch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-[11px]">Environment:</span>
              <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-md overflow-hidden">
                <button
                  onClick={() => setFilterEnvironment('all')}
                  className={`px-2.5 py-1 text-xs ${
                    filterEnvironment === 'all' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  All ({projects.length})
                </button>
                <button
                  onClick={() => setFilterEnvironment('Production')}
                  className={`px-2.5 py-1 text-xs ${
                    filterEnvironment === 'Production' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Production
                </button>
                <button
                  onClick={() => setFilterEnvironment('Preview')}
                  className={`px-2.5 py-1 text-xs ${
                    filterEnvironment === 'Preview' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
          </div>

          {/* Deployments Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden divide-y divide-neutral-800 text-xs">
            <div className="grid grid-cols-12 px-4 py-2.5 bg-neutral-950/60 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              <div className="col-span-4">Deployment & Domain</div>
              <div className="col-span-3">Commit & Branch</div>
              <div className="col-span-2">Build Duration</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className="grid grid-cols-12 px-4 py-3 items-center hover:bg-neutral-800/60 cursor-pointer transition-colors text-neutral-300 group"
              >
                <div className="col-span-4 pr-3">
                  <div className="font-semibold text-white truncate flex items-center gap-2">
                    {proj.displayName}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                      {proj.environment}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate mt-0.5 font-mono">
                    {proj.fullDomain}
                  </div>
                </div>

                <div className="col-span-3 pr-3">
                  <div className="text-xs text-neutral-200 truncate font-mono">{proj.latestCommit}</div>
                  <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                    <GitBranch className="w-3 h-3 text-neutral-400" />
                    <span>{proj.branch}</span>
                    <span>•</span>
                    <span>{proj.commitTime}</span>
                  </div>
                </div>

                <div className="col-span-2 text-neutral-400 font-mono text-[11px]">
                  <div className="flex items-center gap-1 text-neutral-200">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>{proj.deploymentTime}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Total: {proj.totalDeployments} builds</div>
                </div>

                <div className="col-span-1 text-center">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    proj.status === 'READY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    proj.status === 'ERROR' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {proj.status}
                  </span>
                </div>

                <div className="col-span-2 text-right">
                  <button
                    id={`compare-deployments-btn-${proj.id}`}
                    onClick={(e) => handleOpenComparisonForProject(proj, e)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-blue-600 text-neutral-300 hover:text-white border border-neutral-700 hover:border-blue-500 text-xs font-medium transition-colors shadow-xs"
                    title="Compare past deployments and view side-by-side diff"
                  >
                    <ArrowLeftRight className="w-3 h-3 text-blue-400 group-hover:text-white" />
                    <span>Compare</span>
                  </button>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="p-8 text-center text-neutral-400">
                No deployments match your search filter.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
