export type SandboxRuntime = 
  | 'nodejs22' 
  | 'python312' 
  | 'pytorch_cuda' 
  | 'golang123' 
  | 'rust_wasm' 
  | 'ubuntu_base';

export type SandboxStatus = 'running' | 'hibernated' | 'starting' | 'stopped';

export interface SandboxInstance {
  id: string;
  name: string;
  description: string;
  runtime: SandboxRuntime;
  status: SandboxStatus;
  vCpu: number;
  memoryMb: number;
  gpu?: string;
  diskGb: number;
  region: string;
  bootTimeMs: number;
  createdAt: string;
  uptime: string;
  lastActive: string;
  exposedPorts: number[];
  publicUrl?: string;
  activeProcesses: number;
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  networkEgressMb: number;
  snapshotId?: string;
  autoHibernateMinutes: number;
  tags: string[];
}

export interface SandboxSnapshot {
  id: string;
  sandboxId: string;
  sandboxName: string;
  name: string;
  sizeMb: number;
  createdAt: string;
  restoreDurationMs: number;
  memoryIncluded: boolean;
}

export interface CodeExecutionResult {
  stdout: string;
  stderr?: string;
  exitCode: number;
  durationMs: number;
  memoryPeakMb: number;
  executedAt: string;
}

export interface SandboxTemplate {
  id: SandboxRuntime;
  name: string;
  tagline: string;
  version: string;
  iconType: string;
  defaultCpu: number;
  defaultMemoryMb: number;
  popularPackages: string[];
}
