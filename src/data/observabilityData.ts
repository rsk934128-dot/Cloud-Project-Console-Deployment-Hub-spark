import { DistributedTrace, GroupedException, ServiceSLO, EdgeNodeHealth } from '../types/observability';

export const MOCK_TRACES: DistributedTrace[] = [
  {
    id: 'tr-01',
    traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
    timestamp: '10:43:28.192',
    method: 'POST',
    endpoint: '/api/v1/deployments/trigger',
    durationMs: 412,
    statusCode: 200,
    status: 'success',
    coldStart: false,
    region: 'iad1',
    memoryMb: 128,
    spansCount: 5,
    environment: 'Production',
    projectName: 'Cloud Console Edge',
    spans: [
      { id: 'sp-1', name: 'http.request [POST]', service: 'edge-gateway', durationMs: 412, offsetMs: 0, status: 'ok', tags: { 'http.status': '200', 'client.ip': '198.51.100.44' } },
      { id: 'sp-2', name: 'auth.verifyJwt', service: 'auth-service', durationMs: 24, offsetMs: 8, status: 'ok', tags: { 'jwt.issuer': 'accounts.google.com', 'user.id': 'usr_9812' } },
      { id: 'sp-3', name: 'db.queryProjectConfig', service: 'spanner-db', durationMs: 86, offsetMs: 38, status: 'ok', tags: { 'db.system': 'postgresql', 'query.type': 'SELECT' } },
      { id: 'sp-4', name: 'github.createWebhookJob', service: 'webhook-worker', durationMs: 210, offsetMs: 130, status: 'ok', tags: { 'repo': 'org/cloud-console', 'commit': '8f12a9' } },
      { id: 'sp-5', name: 'cache.setSessionState', service: 'redis-edge', durationMs: 18, offsetMs: 350, status: 'ok', tags: { 'cache.key': 'sess:usr_9812', 'ttl': '3600' } }
    ]
  },
  {
    id: 'tr-02',
    traceId: '9fa12bc780a421e909a3910cbe24128f',
    timestamp: '10:43:22.045',
    method: 'GET',
    endpoint: '/api/v1/projects/health',
    durationMs: 54,
    statusCode: 200,
    status: 'success',
    coldStart: false,
    region: 'sfo1',
    memoryMb: 64,
    spansCount: 3,
    environment: 'Production',
    projectName: 'Cloud Console Edge',
    spans: [
      { id: 'sp-10', name: 'http.request [GET]', service: 'edge-gateway', durationMs: 54, offsetMs: 0, status: 'ok', tags: { 'http.status': '200' } },
      { id: 'sp-11', name: 'cache.getHealthStatus', service: 'redis-edge', durationMs: 8, offsetMs: 4, status: 'ok', tags: { 'hit': 'true' } },
      { id: 'sp-12', name: 'dns.resolveUpstream', service: 'dns-resolver', durationMs: 16, offsetMs: 14, status: 'ok' }
    ]
  },
  {
    id: 'tr-03',
    traceId: 'e281b94c03829410ea83b1940912cb89',
    timestamp: '10:42:58.710',
    method: 'POST',
    endpoint: '/api/v1/auth/exchange-token',
    durationMs: 890,
    statusCode: 500,
    status: 'error',
    coldStart: true,
    region: 'fra1',
    memoryMb: 256,
    spansCount: 4,
    environment: 'Production',
    projectName: 'Cloud Console Edge',
    spans: [
      { id: 'sp-20', name: 'http.request [POST]', service: 'edge-gateway', durationMs: 890, offsetMs: 0, status: 'error', tags: { 'http.status': '500' } },
      { id: 'sp-21', name: 'cold_start.bootstrap', service: 'runtime-worker', durationMs: 340, offsetMs: 2, status: 'ok', tags: { 'runtime': 'nodejs20.x' } },
      { id: 'sp-22', name: 'oauth.googleTokenValidation', service: 'oauth-client', durationMs: 510, offsetMs: 345, status: 'error', errorDetails: 'FetchError: request to https://oauth2.googleapis.com/token timed out after 500ms' },
      { id: 'sp-23', name: 'logger.recordException', service: 'telemetry-collector', durationMs: 12, offsetMs: 865, status: 'ok' }
    ]
  },
  {
    id: 'tr-04',
    traceId: '3c8290f19a421b8c0823901bcae83910',
    timestamp: '10:42:15.820',
    method: 'GET',
    endpoint: '/dashboard/overview',
    durationMs: 148,
    statusCode: 200,
    status: 'success',
    coldStart: false,
    region: 'iad1',
    memoryMb: 112,
    spansCount: 4,
    environment: 'Production',
    projectName: 'Cloud Console Edge',
    spans: [
      { id: 'sp-30', name: 'http.request [GET]', service: 'edge-gateway', durationMs: 148, offsetMs: 0, status: 'ok' },
      { id: 'sp-31', name: 'ssr.renderToReadableStream', service: 'next-runtime', durationMs: 92, offsetMs: 6, status: 'ok' },
      { id: 'sp-32', name: 'db.fetchUserProjects', service: 'spanner-db', durationMs: 34, offsetMs: 14, status: 'ok' },
      { id: 'sp-33', name: 'html.injectHeadMeta', service: 'edge-gateway', durationMs: 12, offsetMs: 102, status: 'ok' }
    ]
  },
  {
    id: 'tr-05',
    traceId: '1a93b482910cba483920194830219481',
    timestamp: '10:41:44.200',
    method: 'DELETE',
    endpoint: '/api/v1/storage/blobs/img_8921.avif',
    durationMs: 280,
    statusCode: 200,
    status: 'success',
    coldStart: false,
    region: 'sin1',
    memoryMb: 96,
    spansCount: 3,
    environment: 'Preview',
    projectName: 'Next Commerce Storefront',
    spans: [
      { id: 'sp-40', name: 'http.request [DELETE]', service: 'edge-gateway', durationMs: 280, offsetMs: 0, status: 'ok' },
      { id: 'sp-41', name: 's3.deleteObject', service: 'gcs-client', durationMs: 215, offsetMs: 12, status: 'ok' },
      { id: 'sp-42', name: 'cdn.purgeEdgeTag', service: 'cloudflare-worker', durationMs: 44, offsetMs: 232, status: 'ok' }
    ]
  },
  {
    id: 'tr-06',
    traceId: '82b93019348102934810293840192834',
    timestamp: '10:40:02.110',
    method: 'GET',
    endpoint: '/api/v1/metrics/stream',
    durationMs: 640,
    statusCode: 429,
    status: 'warning',
    coldStart: false,
    region: 'iad1',
    memoryMb: 88,
    spansCount: 2,
    environment: 'Production',
    projectName: 'Cloud Console Edge',
    spans: [
      { id: 'sp-50', name: 'http.request [GET]', service: 'edge-gateway', durationMs: 640, offsetMs: 0, status: 'error', tags: { 'rate.limit': 'exceeded', 'limit': '100/min' } },
      { id: 'sp-51', name: 'rate_limiter.tokenBucketCheck', service: 'redis-edge', durationMs: 8, offsetMs: 4, status: 'ok' }
    ]
  }
];

export const MOCK_EXCEPTIONS: GroupedException[] = [
  {
    id: 'exc-1',
    errorType: 'FetchError',
    message: 'request to https://oauth2.googleapis.com/token timed out after 500ms',
    location: 'server/services/oauthService.ts:142:12',
    occurrences: 48,
    affectedUsers: 14,
    lastSeen: '4 mins ago',
    status: 'investigating',
    severity: 'high',
    sampleTraceId: 'e281b94c03829410ea83b1940912cb89'
  },
  {
    id: 'exc-2',
    errorType: 'PrismaClientKnownRequestError',
    message: 'Unique constraint failed on the constraint: `User_email_key`',
    location: 'src/db/repositories/users.ts:89:9',
    occurrences: 12,
    affectedUsers: 8,
    lastSeen: '18 mins ago',
    status: 'unresolved',
    severity: 'medium',
    sampleTraceId: '4bf92f3577b34da6a3ce929d0e0e4736'
  },
  {
    id: 'exc-3',
    errorType: 'RedisTimeoutError',
    message: 'Connection lost to cluster node at 10.0.4.12:6379',
    location: 'src/lib/redisPool.ts:34:5',
    occurrences: 4,
    affectedUsers: 2,
    lastSeen: '1 hour ago',
    status: 'resolved',
    severity: 'critical',
    sampleTraceId: '82b93019348102934810293840192834'
  }
];

export const SERVICE_SLOS: ServiceSLO[] = [
  {
    id: 'slo-1',
    name: 'Edge API Availability (99.95%)',
    targetPercent: 99.95,
    currentPercent: 99.982,
    budgetRemainingPercent: 88.4,
    window: 'Rolling 30 Days',
    status: 'healthy'
  },
  {
    id: 'slo-2',
    name: 'p95 Latency < 250ms',
    targetPercent: 95.0,
    currentPercent: 97.4,
    budgetRemainingPercent: 92.1,
    window: 'Rolling 7 Days',
    status: 'healthy'
  },
  {
    id: 'slo-3',
    name: 'Cold Start Ratio < 2.0%',
    targetPercent: 98.0,
    currentPercent: 98.64,
    budgetRemainingPercent: 64.0,
    window: 'Rolling 24 Hours',
    status: 'healthy'
  }
];

export const EDGE_NODE_HEALTH: EdgeNodeHealth[] = [
  { region: 'iad1', locationName: 'Washington, D.C.', uptimePercent: 99.99, latencyMs: 14, activeWorkers: 142, cpuPercent: 38, memoryPercent: 44, status: 'healthy' },
  { region: 'sfo1', locationName: 'San Francisco', uptimePercent: 99.98, latencyMs: 22, activeWorkers: 84, cpuPercent: 42, memoryPercent: 49, status: 'healthy' },
  { region: 'fra1', locationName: 'Frankfurt', uptimePercent: 99.95, latencyMs: 34, activeWorkers: 56, cpuPercent: 58, memoryPercent: 62, status: 'healthy' },
  { region: 'sin1', locationName: 'Singapore', uptimePercent: 99.96, latencyMs: 42, activeWorkers: 48, cpuPercent: 32, memoryPercent: 39, status: 'healthy' },
  { region: 'hnd1', locationName: 'Tokyo', uptimePercent: 99.97, latencyMs: 38, activeWorkers: 36, cpuPercent: 29, memoryPercent: 35, status: 'healthy' },
  { region: 'syd1', locationName: 'Sydney', uptimePercent: 99.92, latencyMs: 78, activeWorkers: 24, cpuPercent: 48, memoryPercent: 52, status: 'healthy' }
];
