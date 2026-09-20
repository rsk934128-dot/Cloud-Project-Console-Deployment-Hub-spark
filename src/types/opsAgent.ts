export type AgentAutonomyMode = 'autonomous' | 'semi_autonomous' | 'observer';

export type AgentOperationalState = 'monitoring' | 'investigating' | 'remediating' | 'awaiting_approval';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface AgentIncident {
  id: string;
  title: string;
  targetService: string;
  region: string;
  severity: IncidentSeverity;
  status: 'investigating' | 'remediating' | 'resolved' | 'awaiting_approval';
  detectedAt: string;
  rootCause: string;
  proposedAction: string;
  autonomousActionTaken?: string;
  resolvedAt?: string;
  timeToResolutionSec?: number;
  healthDelta: {
    metric: string;
    before: string;
    after: string;
  };
}

export interface AgentThoughtStep {
  step: number;
  tool: string;
  thought: string;
  command?: string;
  output?: string;
  status: 'completed' | 'executing' | 'pending';
  timestamp: string;
}

export interface AgentMission {
  id: string;
  title: string;
  prompt: string;
  status: 'running' | 'completed' | 'awaiting_approval' | 'failed';
  startedAt: string;
  durationMs?: number;
  reasoningSteps: AgentThoughtStep[];
  outcomeSummary?: string;
  impactReport?: {
    latencyReduction?: string;
    memoryRecovered?: string;
    errorRateDrop?: string;
    costImpact?: string;
  };
}

export interface AgentSafetyPolicy {
  id: string;
  name: string;
  description: string;
  riskTier: 'low' | 'medium' | 'high' | 'critical';
  autoExecutionAllowed: boolean;
  maxDailyActions: number;
  actionsToday: number;
  requireHumanApproval: boolean;
}

export interface AgentActionAuditItem {
  id: string;
  timestamp: string;
  incidentId?: string;
  service: string;
  action: string;
  command: string;
  executedBy: 'autonomous_gemini_ops' | 'operator_approved' | 'scheduled_sre_cron';
  resultStatus: 'success' | 'reverted' | 'failed';
  verifiedHealth: string;
  rollbackCommand?: string;
}
