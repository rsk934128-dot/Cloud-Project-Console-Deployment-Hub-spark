export type DeploymentStatus = 'READY' | 'ERROR' | 'QUEUED' | 'BUILDING';
export type DeploymentEnvironment = 'Production' | 'Preview' | 'Staging';

export interface DeploymentEnvVar {
  key: string;
  value: string;
  isSecret?: boolean;
  category: 'Runtime' | 'API Keys' | 'Database' | 'Features' | 'General';
}

export interface DeploymentConfig {
  nodeVersion: string;
  framework: string;
  buildCommand: string;
  installCommand: string;
  outputDirectory: string;
  regions: string[];
  memoryMb: number;
  timeoutSeconds: number;
  concurrencyLimit: number;
  envVariables: DeploymentEnvVar[];
  dependencies: Record<string, string>;
  featureFlags: Record<string, boolean>;
  securityHeaders: Record<string, string>;
}

export interface DeploymentLogEntry {
  line: number;
  timestamp: string;
  stage: 'clone' | 'install' | 'compile' | 'bundle' | 'deploy' | 'verify';
  level: 'info' | 'warn' | 'error' | 'success';
  source: string;
  message: string;
}

export interface DeploymentRecord {
  id: string;
  projectId: string;
  deploymentNumber: number;
  version: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  branch: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  deployedAt: string;
  timestamp: string;
  duration: string;
  durationSeconds: number;
  bundleSize: string;
  bundleSizeKb: number;
  cacheHitRate: number; // e.g. 92%
  fullDomain: string;
  trigger: 'git_push' | 'manual_rebuild' | 'webhook' | 'rollback_guard';
  summaryMetrics: {
    staticPagesCount: number;
    serverlessFunctionsCount: number;
    edgeMiddlewareCount: number;
    chunksCount: number;
  };
  config: DeploymentConfig;
  buildLogs: DeploymentLogEntry[];
}

export type DiffChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface EnvVarDiffItem {
  key: string;
  type: DiffChangeType;
  baseValue?: string;
  targetValue?: string;
  isSecret?: boolean;
  category: string;
}

export interface ConfigDiffItem {
  name: string;
  label: string;
  type: DiffChangeType;
  baseValue: string | number;
  targetValue: string | number;
  category: 'Runtime' | 'Resource Limits' | 'Routing & Regions' | 'Build Command';
}

export interface DependencyDiffItem {
  packageName: string;
  type: DiffChangeType;
  baseVersion?: string;
  targetVersion?: string;
}

export interface LogDiffRow {
  index: number;
  baseLog?: DeploymentLogEntry;
  targetLog?: DeploymentLogEntry;
  diffStatus: 'match' | 'diverged' | 'base_only' | 'target_only' | 'error_spike';
}
