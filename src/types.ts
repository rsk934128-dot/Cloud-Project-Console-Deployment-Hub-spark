export interface ProjectItem {
  id: string;
  name: string;
  displayName: string;
  subdomain: string;
  fullDomain: string;
  repo: string;
  latestCommit: string;
  commitTime: string;
  status: 'READY' | 'BUILDING' | 'ERROR' | 'QUEUED';
  environment: 'Production' | 'Preview';
  framework: string;
  creator: string;
  branch: string;
  deploymentTime: string;
  regions: string[];
  totalDeployments: number;
  healthScore: number;
  previewImage?: string;
  alertsCount: number;
  metrics: {
    edgeRequests24h: number;
    avgLatencyMs: number;
    errorRate: number;
    bandwidthMb: number;
  };
}

export interface UsageMetric {
  id: string;
  title: string;
  used: string;
  limit: string;
  percentage: number;
  unit: string;
  tierLimit: string;
  period: string;
  trend: string;
}

export interface GmailAlertMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject: string;
  from: string;
  date: string;
  isRead: boolean;
  severity: 'critical' | 'warning' | 'info';
  projectId?: string;
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source: string;
}
