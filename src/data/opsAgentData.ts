import {
  AgentIncident,
  AgentSafetyPolicy,
  AgentActionAuditItem,
  AgentMission
} from '../types/opsAgent';

export const INITIAL_INCIDENTS: AgentIncident[] = [
  {
    id: 'inc-9082',
    title: 'Heap Allocation Surge (OOM Risk Detected)',
    targetService: 'checkout-api-v2',
    region: 'us-east1 (Ashburn)',
    severity: 'critical',
    status: 'awaiting_approval',
    detectedAt: '3m ago',
    rootCause: 'Unbounded payload buffer in gRPC streaming client during checkout peak.',
    proposedAction: 'Graceful zero-downtime rolling restart with container memory ceiling raised to 2048MB + traffic drained over 15s.',
    healthDelta: {
      metric: 'Memory Usage',
      before: '94.2% (1884MB / 2000MB)',
      after: 'Target: ~32.0% (640MB)'
    }
  },
  {
    id: 'inc-9081',
    title: 'Frankfurt POP BGP Route Flapping & 504 Spike',
    targetService: 'edge-anycast-proxy',
    region: 'fra1 (Frankfurt)',
    severity: 'high',
    status: 'resolved',
    detectedAt: '18m ago',
    resolvedAt: '17m ago',
    timeToResolutionSec: 28,
    rootCause: 'Upstream transit AS1299 packet loss (12.4%) causing Edge TCP retransmissions.',
    proposedAction: 'Shift European Anycast ingress to Amsterdam (ams1) & Paris (cdg1) via BGP community route weighting.',
    autonomousActionTaken: 'Autonomously shifted BGP weights to ams1 (weight 200) and cdg1 (weight 180). Zero user drops.',
    healthDelta: {
      metric: 'Edge P99 Latency',
      before: '482ms',
      after: '31ms'
    }
  },
  {
    id: 'inc-9080',
    title: 'PgBouncer Upstream Connection Pool Saturation',
    targetService: 'core-database-pool',
    region: 'us-central1',
    severity: 'high',
    status: 'resolved',
    detectedAt: '42m ago',
    resolvedAt: '41m ago',
    timeToResolutionSec: 45,
    rootCause: 'Long-running orphaned read transaction held by analytics ETL cron job.',
    proposedAction: 'Terminate idle-in-transaction PID 44102 and scale max client connections from 100 to 200.',
    autonomousActionTaken: 'Executed pg_terminate_backend(44102) & scaled PgBouncer client pool size. Latency normalized.',
    healthDelta: {
      metric: 'DB Wait Queue',
      before: '84 blocked conns',
      after: '0 blocked'
    }
  },
  {
    id: 'inc-9079',
    title: 'TLS Certificate Expiring within 48 Hours',
    targetService: 'api.cloudmesh.io',
    region: 'Global Edge',
    severity: 'medium',
    status: 'resolved',
    detectedAt: '2h ago',
    resolvedAt: '2h ago',
    timeToResolutionSec: 14,
    rootCause: 'Automated ACME renew challenge pending DNS propagation check.',
    proposedAction: 'Issue RFC 8555 Let\'s Encrypt certificate renewal via Cloudflare DNS-01 API challenge.',
    autonomousActionTaken: 'Certificate renewed successfully. Expiry extended to 90 days. Deployed across 32 edge clusters.',
    healthDelta: {
      metric: 'TLS Expiry',
      before: '1.8 days left',
      after: '89.9 days left'
    }
  }
];

export const INITIAL_SAFETY_POLICIES: AgentSafetyPolicy[] = [
  {
    id: 'pol-restart',
    name: 'Rolling Container Restarts',
    description: 'Automatically restart unhealthy or memory-leaking pods one-by-one with readiness probe verification.',
    riskTier: 'low',
    autoExecutionAllowed: true,
    maxDailyActions: 20,
    actionsToday: 3,
    requireHumanApproval: false
  },
  {
    id: 'pol-traffic',
    name: 'Anycast Traffic Rerouting & Edge Shedding',
    description: 'Reroute incoming edge transit around congested points-of-presence (POPs) during upstream BGP issues.',
    riskTier: 'medium',
    autoExecutionAllowed: true,
    maxDailyActions: 10,
    actionsToday: 1,
    requireHumanApproval: false
  },
  {
    id: 'pol-canary',
    name: 'Automated Canary Rollback on Error Spike',
    description: 'Instantly revert new deployment versions if HTTP 5xx error rate exceeds 1.5% during canary window.',
    riskTier: 'medium',
    autoExecutionAllowed: true,
    maxDailyActions: 5,
    actionsToday: 0,
    requireHumanApproval: false
  },
  {
    id: 'pol-scale',
    name: 'Auto-Scaling Pods Beyond Hard Quotas',
    description: 'Provisioning additional serverless replicas when CPU saturation hits >85% for 3 consecutive intervals.',
    riskTier: 'high',
    autoExecutionAllowed: false,
    maxDailyActions: 5,
    actionsToday: 0,
    requireHumanApproval: true
  },
  {
    id: 'pol-db-write',
    name: 'Database Destructive Mutations',
    description: 'Any schema mutation, table drop, or truncate commands. Hard-blocked by autonomous agent core.',
    riskTier: 'critical',
    autoExecutionAllowed: false,
    maxDailyActions: 0,
    actionsToday: 0,
    requireHumanApproval: true
  }
];

export const INITIAL_AUDIT_LOGS: AgentActionAuditItem[] = [
  {
    id: 'aud-4901',
    timestamp: '17m ago',
    incidentId: 'inc-9081',
    service: 'edge-anycast-proxy',
    action: 'BGP Route Rebalance to ams1 / cdg1',
    command: 'cloudmesh-edge route-weight set --pop=fra1 --weight=20 --fallback=ams1,cdg1',
    executedBy: 'autonomous_gemini_ops',
    resultStatus: 'success',
    verifiedHealth: 'Edge packet loss 0.0%, P99 31ms',
    rollbackCommand: 'cloudmesh-edge route-weight reset --pop=fra1'
  },
  {
    id: 'aud-4900',
    timestamp: '41m ago',
    incidentId: 'inc-9080',
    service: 'core-database-pool',
    action: 'Terminate Idle-in-Transaction Query & Scale PgBouncer Pool',
    command: 'psql -c "SELECT pg_terminate_backend(44102);" && pgbouncer-ctrl RELOAD',
    executedBy: 'autonomous_gemini_ops',
    resultStatus: 'success',
    verifiedHealth: '0 blocked connections, pool capacity at 22%',
    rollbackCommand: 'pgbouncer-ctrl SET default_pool_size=100'
  },
  {
    id: 'aud-4899',
    timestamp: '2h ago',
    incidentId: 'inc-9079',
    service: 'api.cloudmesh.io',
    action: 'ACME Let\'s Encrypt Automated TLS Renewal',
    command: 'cert-manager renew --domain=api.cloudmesh.io --provider=cloudflare-dns01',
    executedBy: 'scheduled_sre_cron',
    resultStatus: 'success',
    verifiedHealth: 'SSL handshake verified on 32 global edge clusters',
    rollbackCommand: 'cert-manager restore-backup --domain=api.cloudmesh.io'
  }
];

export const INITIAL_ACTIVE_MISSION: AgentMission = {
  id: 'mis-1049',
  title: 'Autonomous System Health & Threat Audit',
  prompt: 'Continuously patrol container memory distributions, TLS expiration dates, and edge route error rates.',
  status: 'running',
  startedAt: 'Just now',
  reasoningSteps: [
    {
      step: 1,
      tool: 'telemetry_metrics_analyzer',
      thought: 'Querying real-time Prometheus scrapers for services with memory usage exceeding 85% threshold.',
      command: 'promql --query="container_memory_usage_bytes / container_spec_memory_limit_bytes > 0.85"',
      output: 'Flagged 1 container: checkout-api-v2 at 94.2% memory capacity in us-east1.',
      status: 'completed',
      timestamp: '3m ago'
    },
    {
      step: 2,
      tool: 'log_parser_gemini',
      thought: 'Parsing recent 1,000 log lines from checkout-api-v2 to isolate root cause of heap accumulation.',
      command: 'loki-query --service=checkout-api-v2 --limit=1000 | gemini-analyze-logs',
      output: 'Identified unclosed gRPC streaming channels during cart reconciliation calls.',
      status: 'completed',
      timestamp: '2m ago'
    },
    {
      step: 3,
      tool: 'remediation_planner',
      thought: 'Evaluating safety policy: Memory ceiling resize + rolling reload has low risk tier and preserves active traffic.',
      command: 'policy-check --action=rolling_restart --service=checkout-api-v2',
      output: 'Policy check PASS. Generated remediation plan and awaiting operator approval.',
      status: 'completed',
      timestamp: '1m ago'
    }
  ],
  outcomeSummary: 'Detected critical memory leak in checkout-api-v2. Prepared rolling restart remediation plan with 0 downtime.'
};
