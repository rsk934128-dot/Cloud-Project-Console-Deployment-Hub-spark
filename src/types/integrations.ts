export type IntegrationCategory = 'all' | 'monitoring' | 'databases' | 'security' | 'cicd' | 'messaging' | 'analytics';
export type IntegrationStatus = 'installed' | 'available' | 'error' | 'syncing';

export interface IntegrationItem {
  id: string;
  name: string;
  slug: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  publisher: string;
  icon: string;
  description: string;
  installedAt?: string;
  syncedVarsCount?: number;
  syncedProjectsCount?: number;
  lastSync?: string;
  authorUrl?: string;
  docsUrl?: string;
  isOfficial: boolean;
  webhookUrl?: string;
  config: Record<string, string>;
}

export interface WebhookDeliveryLog {
  id: string;
  integrationName: string;
  event: string;
  status: 200 | 201 | 400 | 500 | 504;
  durationMs: number;
  timestamp: string;
  requestPayload: string;
  responsePayload: string;
}

export interface SlackWebhookConfig {
  webhookUrl: string;
  channel: string;
  botName: string;
  botEmoji: string;
  scopeProject: string;
  notifyOnBuildSuccess: boolean;
  notifyOnBuildFail: boolean;
  notifyOnDeployStart: boolean;
  notifyOnDDoSAlert: boolean;
  includeLivePreviewLink: boolean;
  messageFormat: 'detailed' | 'compact';
  isEnabled: boolean;
  lastTestedAt?: string;
  lastDeliveryStatus?: 'success' | 'failed' | null;
}

