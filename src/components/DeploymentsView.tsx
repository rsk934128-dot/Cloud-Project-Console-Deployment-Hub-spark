import React from 'react';
import { ProjectItem } from '../types';
import { 
  Rocket, 
  ExternalLink, 
  Clock, 
  GitBranch, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RotateCw,
  Server
} from 'lucide-react';

interface DeploymentsViewProps {
  projects: ProjectItem[];
  onSelectProject: (p: ProjectItem) => void;
}

export const DeploymentsView: React.FC<DeploymentsViewProps> = ({ projects, onSelectProject }) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Rocket className="w-4 h-4 text-neutral-400" />
          Recent Deployments & Production Builds
        </h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          History of deployments across production, preview branches, and staging targets.
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden divide-y divide-neutral-800 text-xs">
        <div className="grid grid-cols-12 px-4 py-2.5 bg-neutral-950/60 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
          <div className="col-span-5">Deployment & Domain</div>
          <div className="col-span-4">Commit & Branch</div>
          <div className="col-span-2">Build Time</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        {projects.map((proj) => (
          <div
            key={proj.id}
            onClick={() => onSelectProject(proj)}
            className="grid grid-cols-12 px-4 py-3 items-center hover:bg-neutral-800/60 cursor-pointer transition-colors text-neutral-300"
          >
            <div className="col-span-5 pr-3">
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

            <div className="col-span-4 pr-3">
              <div className="text-xs text-neutral-200 truncate font-mono">{proj.latestCommit}</div>
              <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                <GitBranch className="w-3 h-3 text-neutral-400" />
                <span>{proj.branch}</span>
                <span>•</span>
                <span>{proj.commitTime}</span>
              </div>
            </div>

            <div className="col-span-2 text-neutral-400 font-mono text-[11px]">
              <div>{proj.deploymentTime}</div>
              <div className="text-[10px] text-neutral-400">Total: {proj.totalDeployments} builds</div>
            </div>

            <div className="col-span-1 text-right">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                proj.status === 'READY' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                proj.status === 'ERROR' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                'bg-amber-950 text-amber-300 border border-amber-800'
              }`}>
                {proj.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
