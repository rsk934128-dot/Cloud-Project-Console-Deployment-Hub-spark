export type TraceStatus = 'success' | 'error' | 'warning';

export interface TraceSpan {
  id: string;
  name: string;
  service: string;
  durationMs: number;
  offsetMs: number;
  status: 'ok' | 'error';
  tags?: Record<string, string>;
  errorDetails?: string;
}

export interface DistributedTrace {
  id: string;
  traceId: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  durationMs: number;
  statusCode: number;
  status: TraceStatus;
  coldStart: boolean;
  region: string;
  memoryMb: number;
  spansCount: number;
  spans: TraceSpan[];
  environment: 'Production' | 'Preview';
  projectName: string;
}

export interface GroupedException {
  id: string;
  errorType: string;
  message: string;
  location: string;
  occurrences: number;
  affectedUsers: number;
  lastSeen: string;
  status: 'unresolved' | 'investigating' | 'resolved';
  severity: 'critical' | 'high' | 'medium';
  sampleTraceId: string;
}

export interface ServiceSLO {
  id: string;
  name: string;
  targetPercent: number;
  currentPercent: number;
  budgetRemainingPercent: number;
  window: string;
  status: 'healthy' | 'at-risk' | 'breached';
}

export interface EdgeNodeHealth {
  region: string;
  locationName: string;
  uptimePercent: number;
  latencyMs: number;
  activeWorkers: number;
  cpuPercent: number;
  memoryPercent: number;
  status: 'healthy' | 'degraded' | 'maintenance';
}
