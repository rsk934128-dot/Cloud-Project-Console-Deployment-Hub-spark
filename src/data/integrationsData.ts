import { IntegrationItem, WebhookDeliveryLog } from '../types/integrations';

export const INITIAL_INTEGRATIONS: IntegrationItem[] = [
  {
    id: 'int-01',
    name: 'Datadog APM & Logs',
    slug: 'datadog',
    category: 'monitoring',
    status: 'installed',
    publisher: 'Datadog Inc.',
    icon: 'Activity',
    description: 'Stream edge invocation traces, p99 function execution latencies, and distributed telemetry into Datadog.',
    installedAt: 'Aug 14, 2026',
    syncedVarsCount: 3,
    syncedProjectsCount: 4,
    lastSync: '4m ago',
    isOfficial: true,
    webhookUrl: 'https://http-intake.logs.datadoghq.com/api/v2/logs',
    config: {
      site: 'datadoghq.com',
      serviceName: 'cloudmesh-edge',
      env: 'production',
      sampleRate: '1.0'
    }
  },
  {
    id: 'int-02',
    name: 'Sentry Error Tracking',
    slug: 'sentry',
    category: 'monitoring',
    status: 'installed',
    publisher: 'Sentry.io',
    icon: 'AlertTriangle',
    description: 'Real-time stack traces, edge worker unhandled promise rejections, and sourcemap symbolication.',
    installedAt: 'Sep 02, 2026',
    syncedVarsCount: 2,
    syncedProjectsCount: 4,
    lastSync: '12m ago',
    isOfficial: true,
    webhookUrl: 'https://o450123.ingest.sentry.io/api/450123/envelope/',
    config: {
      org: 'enterprise-cloudmesh',
      project: 'edge-runtime',
      tracesSampleRate: '0.2'
    }
  },
  {
    id: 'int-03',
    name: 'Neon Serverless Postgres',
    slug: 'neon',
    category: 'databases',
    status: 'installed',
    publisher: 'Neon Inc.',
    icon: 'Database',
    description: 'Automated database branching on pull requests, connection pooling, and autoscaling Postgres instances.',
    installedAt: 'Sep 08, 2026',
    syncedVarsCount: 4,
    syncedProjectsCount: 2,
    lastSync: '1h ago',
    isOfficial: true,
    config: {
      projectId: 'ep-cool-butterfly-712891',
      region: 'aws-us-east-1',
      branch: 'main'
    }
  },
  {
    id: 'int-04',
    name: 'Slack Incident Channel Bot',
    slug: 'slack',
    category: 'messaging',
    status: 'installed',
    publisher: 'Slack Technologies',
    icon: 'MessageSquare',
    description: 'Instant notification dispatch for deployments, WAF anomaly spikes, SSL certificate renewals, and edge alerts.',
    installedAt: 'Jul 21, 2026',
    syncedVarsCount: 1,
    syncedProjectsCount: 4,
    lastSync: '30s ago',
    isOfficial: true,
    webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',
    config: {
      channel: '#ops-cloudmesh-alerts',
      notifyOnDeploy: 'true',
      notifyOnDDoS: 'true'
    }
  },
  {
    id: 'int-05',
    name: 'GitHub CI/CD Sync',
    slug: 'github',
    category: 'cicd',
    status: 'installed',
    publisher: 'GitHub Inc.',
    icon: 'GitBranch',
    description: 'Automatic preview deployments on PR open, commit status checks, and environment URL commentary.',
    installedAt: 'Jun 10, 2026',
    syncedVarsCount: 2,
    syncedProjectsCount: 4,
    lastSync: 'Just now',
    isOfficial: true,
    config: {
      appId: '891241',
      org: 'enterprise-core',
      commentOnPR: 'true'
    }
  },
  {
    id: 'int-06',
    name: 'Doppler Secret Ops',
    slug: 'doppler',
    category: 'security',
    status: 'installed',
    publisher: 'Doppler',
    icon: 'Key',
    description: 'Bi-directional environment variable synchronization between Doppler vaults and CloudMesh runtime secrets.',
    installedAt: 'Sep 15, 2026',
    syncedVarsCount: 18,
    syncedProjectsCount: 3,
    lastSync: '6m ago',
    isOfficial: true,
    config: {
      project: 'cloudmesh-production',
      configName: 'prd_aws',
      autoRedeployOnChange: 'true'
    }
  },
  {
    id: 'int-07',
    name: 'Upstash Serverless Redis & Kafka',
    slug: 'upstash',
    category: 'databases',
    status: 'available',
    publisher: 'Upstash Inc.',
    icon: 'Zap',
    description: 'Low-latency serverless key-value caching, global rate-limiting counters, and event streaming.',
    isOfficial: true,
    config: {}
  },
  {
    id: 'int-08',
    name: 'LaunchDarkly Feature Flags',
    slug: 'launchdarkly',
    category: 'analytics',
    status: 'available',
    publisher: 'LaunchDarkly',
    icon: 'Flag',
    description: 'Edge-evaluated boolean feature flags, progressive rollouts, and kill-switches with zero latency penalty.',
    isOfficial: true,
    config: {}
  },
  {
    id: 'int-09',
    name: 'PagerDuty On-Call Orchestrator',
    slug: 'pagerduty',
    category: 'messaging',
    status: 'available',
    publisher: 'PagerDuty',
    icon: 'Bell',
    description: 'Escalate critical edge 5xx error rate spikes directly to on-call engineering rotations.',
    isOfficial: true,
    config: {}
  },
  {
    id: 'int-10',
    name: 'Axiom High-Volume Logging',
    slug: 'axiom',
    category: 'monitoring',
    status: 'available',
    publisher: 'Axiom.co',
    icon: 'FileText',
    description: 'Serverless log aggregation with sub-second queries across petabytes of CDN and WAF edge records.',
    isOfficial: true,
    config: {}
  },
  {
    id: 'int-11',
    name: 'Supabase Postgres & Auth',
    slug: 'supabase',
    category: 'databases',
    status: 'available',
    publisher: 'Supabase Inc.',
    icon: 'Database',
    description: 'Open source Firebase alternative with auto-generated REST and GraphQL APIs on PostgreSQL.',
    isOfficial: true,
    config: {}
  },
  {
    id: 'int-12',
    name: 'Segment Customer Data Platform',
    slug: 'segment',
    category: 'analytics',
    status: 'available',
    publisher: 'Twilio Segment',
    icon: 'Share2',
    description: 'Collect, clean, and activate edge analytics events across marketing and data warehouse destinations.',
    isOfficial: true,
    config: {}
  }
];

export const INITIAL_WEBHOOK_LOGS: WebhookDeliveryLog[] = [
  {
    id: 'wh-01',
    integrationName: 'Slack Incident Channel Bot',
    event: 'deployment.succeeded',
    status: 200,
    durationMs: 142,
    timestamp: '11:00:14',
    requestPayload: JSON.stringify({
      event: 'deployment.succeeded',
      project: 'cloudmesh-production',
      branch: 'main',
      commit: '48f10bc',
      url: 'https://cloudmesh.dev',
      durationSeconds: 38
    }, null, 2),
    responsePayload: '{"ok": true}'
  },
  {
    id: 'wh-02',
    integrationName: 'Datadog APM & Logs',
    event: 'telemetry.metric_batch',
    status: 200,
    durationMs: 88,
    timestamp: '10:59:30',
    requestPayload: JSON.stringify({
      series: [
        { metric: 'cloudmesh.edge.invocations', points: [[1790010000, 4820]], tags: ['env:prod', 'region:iad'] },
        { metric: 'cloudmesh.edge.latency.p99', points: [[1790010000, 18.4]], tags: ['env:prod', 'region:iad'] }
      ]
    }, null, 2),
    responsePayload: '{"status": "ok"}'
  },
  {
    id: 'wh-03',
    integrationName: 'Doppler Secret Ops',
    event: 'secrets.sync_applied',
    status: 200,
    durationMs: 310,
    timestamp: '10:55:42',
    requestPayload: JSON.stringify({
      event: 'secrets.sync_applied',
      syncedKeys: ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'AUTH_SECRET'],
      project: 'cloudmesh-production'
    }, null, 2),
    responsePayload: '{"success": true, "version": 42}'
  },
  {
    id: 'wh-04',
    integrationName: 'Sentry Error Tracking',
    event: 'alert.edge_exception',
    status: 200,
    durationMs: 115,
    timestamp: '10:48:02',
    requestPayload: JSON.stringify({
      exception: {
        values: [{ type: 'TypeError', value: 'Cannot read properties of undefined' }]
      },
      tags: { runtime: 'workerd', PoP: 'fra1' }
    }, null, 2),
    responsePayload: '{"id": "a98df23bc01923"}'
  }
];
