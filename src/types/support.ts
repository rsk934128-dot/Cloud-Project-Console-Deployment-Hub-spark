export type TicketPriority = 'p1_critical' | 'p2_high' | 'p3_normal' | 'p4_low';

export type TicketStatus = 'open' | 'in_progress' | 'waiting_on_customer' | 'resolved' | 'closed';

export type TicketCategory = 
  | 'deployments_builds' 
  | 'networking_dns' 
  | 'storage_databases' 
  | 'security_waf' 
  | 'billing_quotas' 
  | 'general';

export interface TicketMessage {
  id: string;
  sender: 'user' | 'support_engineer' | 'system';
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  timestamp: string;
  content: string;
  attachments?: {
    name: string;
    size: string;
    type: string;
  }[];
}

export interface SupportTicket {
  id: string; // e.g. TICK-90412
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  projectId?: string;
  projectName?: string;
  environment: 'production' | 'staging' | 'preview' | 'global';
  createdAt: string;
  updatedAt: string;
  assignedEngineer?: {
    name: string;
    role: string;
    email: string;
    avatarBg: string;
  };
  slaDueIn?: string;
  messages: TicketMessage[];
  diagnosticsAttached?: boolean;
}

export interface SystemComponentStatus {
  id: string;
  name: string;
  region: string;
  status: 'operational' | 'degraded_performance' | 'partial_outage' | 'maintenance';
  uptimePercent: number;
  latencyMs: number;
  incidentCount30d: number;
}

export interface SystemIncident {
  id: string;
  title: string;
  severity: 'minor' | 'major' | 'maintenance';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impactedServices: string[];
  startTime: string;
  resolvedTime?: string;
  updates: {
    timestamp: string;
    status: string;
    message: string;
  }[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string;
  helpfulCount: number;
  tags: string[];
}

export interface DiagnosticCheckItem {
  id: string;
  name: string;
  category: string;
  status: 'pending' | 'running' | 'passed' | 'warning' | 'failed';
  durationMs?: number;
  details?: string;
  rawOutput?: string;
}
