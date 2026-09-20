import { EnvVariableItem, SecretAuditLog } from '../types/envVars';

export const INITIAL_ENV_VARIABLES: EnvVariableItem[] = [
  {
    id: 'env-01',
    key: 'DATABASE_URL',
    value: 'postgresql://postgres:x89s93_secure_pw@ep-cool-snowflake-921.us-east-1.aws.neon.tech/neondb?sslmode=require',
    isSecret: true,
    environments: ['Production', 'Preview'],
    type: 'secret',
    updatedAt: '2 days ago',
    updatedBy: 'rasadsk007@gmail.com',
    projectId: 'all',
    projectName: 'Global Defaults',
    comment: 'Connection pooler string with SSL mandate for Neon serverless PostgreSQL'
  },
  {
    id: 'env-02',
    key: 'NEXT_PUBLIC_API_URL',
    value: 'https://api.cloudmesh.enterprise.internal/v1',
    isSecret: false,
    environments: ['Production', 'Preview', 'Development'],
    type: 'plain',
    updatedAt: '5 days ago',
    updatedBy: 'alex.dev@corp.internal',
    projectId: 'all',
    projectName: 'Global Defaults',
    comment: 'Client-accessible public API gateway endpoint'
  },
  {
    id: 'env-03',
    key: 'AUTH_SECRET',
    value: '05e94b2f15dc82894f27568019a275468538eec4cbbdcf5f66107a6d5c64c76b',
    isSecret: true,
    environments: ['Production', 'Preview'],
    type: 'secret',
    updatedAt: '1 week ago',
    updatedBy: 'rasadsk007@gmail.com',
    projectId: 'all',
    projectName: 'Global Defaults',
    comment: 'NextAuth.js / Better-Auth JWT session signature secret'
  },
  {
    id: 'env-04',
    key: 'STRIPE_WEBHOOK_SECRET',
    value: 'whsec_8ef84e8a4a2b97dc3f8510ba47e452a8b928f9a941e9c8bc8279cf1b70a',
    isSecret: true,
    environments: ['Production'],
    type: 'secret',
    updatedAt: '3 weeks ago',
    updatedBy: 'finance_ops@corp.internal',
    projectId: 'all',
    projectName: 'Global Defaults',
    comment: 'Verifies asymmetric SHA-256 HMAC billing signatures'
  },
  {
    id: 'env-05',
    key: 'REDIS_CACHE_URL',
    value: 'rediss://default:Ab3408fFkls_d81745hjsl@us1-intimate-skylark-39044.upstash.io:39044',
    isSecret: true,
    environments: ['Production', 'Preview', 'Development'],
    type: 'secret',
    updatedAt: '4 days ago',
    updatedBy: 'devops_runner@github.actions',
    projectId: 'all',
    projectName: 'Global Defaults',
    comment: 'Upstash low-latency distributed KV edge session store'
  },
  {
    id: 'env-06',
    key: 'NEXT_PUBLIC_SENTRY_DSN',
    value: 'https://8f92b7401cbb894f275@o45050.ingest.sentry.io/45089201',
    isSecret: false,
    environments: ['Production', 'Preview'],
    type: 'plain',
    updatedAt: '2 weeks ago',
    updatedBy: 'rasadsk007@gmail.com',
    projectId: 'all',
    projectName: 'Global Defaults',
    comment: 'Error telemetry and distributed performance tracing client DSN'
  },
  {
    id: 'env-07',
    key: 'AI_GATEWAY_SERVICE_KEY',
    value: 'aigw_live_09b8374a275468538eec4cbbdcf5f661',
    isSecret: true,
    environments: ['Production', 'Preview'],
    type: 'secret',
    updatedAt: 'Just now',
    updatedBy: 'rasadsk007@gmail.com',
    projectId: 'all',
    projectName: 'Global Defaults',
    comment: 'Authenticated proxy token for server-side AI model rate limits'
  },
  {
    id: 'env-08',
    key: 'VERCEL_GIT_COMMIT_SHA',
    value: '4duhlb32z6wpmvildo3auf918237',
    isSecret: false,
    environments: ['Production', 'Preview', 'Development'],
    type: 'system',
    updatedAt: 'Auto-injected',
    updatedBy: 'System Build Pipeline',
    projectId: 'all',
    projectName: 'Global Defaults',
    comment: 'System-provided immutable deployment SHA metadata'
  }
];

export const INITIAL_AUDIT_LOGS: SecretAuditLog[] = [
  {
    id: 'aud-01',
    variableKey: 'DATABASE_URL',
    action: 'revealed',
    user: 'rasadsk007@gmail.com',
    timestamp: '10:49:15',
    ip: '198.51.100.22',
    environment: 'Production'
  },
  {
    id: 'aud-02',
    variableKey: 'AI_GATEWAY_SERVICE_KEY',
    action: 'updated',
    user: 'rasadsk007@gmail.com',
    timestamp: '10:48:02',
    ip: '198.51.100.22',
    environment: 'Production'
  },
  {
    id: 'aud-03',
    variableKey: 'AUTH_SECRET',
    action: 'exported',
    user: 'rasadsk007@gmail.com',
    timestamp: '09:22:11',
    ip: '198.51.100.22',
    environment: 'Preview'
  },
  {
    id: 'aud-04',
    variableKey: 'STRIPE_WEBHOOK_SECRET',
    action: 'created',
    user: 'finance_ops@corp.internal',
    timestamp: 'Yesterday',
    ip: '194.26.29.112',
    environment: 'Production'
  }
];
