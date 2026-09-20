import {
  SupportTicket,
  SystemComponentStatus,
  SystemIncident,
  KnowledgeArticle,
  DiagnosticCheckItem
} from '../types/support';

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TICK-90412',
    subject: 'Intermittent 504 Gateway Timeout on Edge Worker Anycast iad1 during traffic burst',
    description: 'Our checkout service experienced ~3.4% 504 timeout spikes from the Washington DC POP (iad1) during the 14:00 UTC flash sale. Sub-requests to Postgres connection pool timed out after 15,000ms.',
    status: 'in_progress',
    priority: 'p2_high',
    category: 'networking_dns',
    projectId: 'proj_ecommerce_storefront',
    projectName: 'ecommerce-storefront-v2',
    environment: 'production',
    createdAt: '2 hours ago',
    updatedAt: '25m ago',
    slaDueIn: '35m remaining (P2 2h SLA)',
    assignedEngineer: {
      name: 'Alex Mercier',
      role: 'Staff Edge SRE & Anycast Systems',
      email: 'alex.mercier@cloudmesh.io',
      avatarBg: 'bg-indigo-600'
    },
    diagnosticsAttached: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        authorName: 'rasadsk007@gmail.com',
        authorRole: 'Team Admin',
        timestamp: '2 hours ago',
        content: `Hi Cloudmesh Support Team,\n\nOur production project \`ecommerce-storefront-v2\` experienced a burst of 504 Gateway Timeouts starting at 14:02 UTC. Here is the trace ID from the edge log:\n\`x-cloudmesh-trace-id: 9a7b-881c-44e2-bd01\`\n\nIt appears localized to traffic routed through the North American East \`iad1\` cluster. Could you verify whether upstream BGP routing or socket pool contention occurred?`,
        attachments: [
          { name: 'edge-trace-9a7b.json', size: '14.2 KB', type: 'application/json' },
          { name: 'p99-latency-spike.png', size: '284 KB', type: 'image/png' }
        ]
      },
      {
        id: 'msg-2',
        sender: 'system',
        authorName: 'Cloudmesh Auto-Diagnostics Bot',
        timestamp: '2 hours ago',
        content: `Automated Health Diagnostic attached:\n- Edge Pop: \`iad1\` (Ashburn, VA)\n- HTTP Status: 504 Gateway Timeout (128 occurrences)\n- Upstream Target: \`vpc-connector-prod-useast1\`\n- TCP Handshake: 1.2ms (healthy)\n- Upstream Socket Wait Time: 15,012ms (exceeded timeout threshold)`
      },
      {
        id: 'msg-3',
        sender: 'support_engineer',
        authorName: 'Alex Mercier',
        authorRole: 'Staff Edge SRE & Anycast Systems',
        timestamp: '1 hour ago',
        content: `Hello Rasad,\n\nThanks for reaching out and providing the trace ID. I reviewed our edge telemetry logs for \`iad1\`. The edge POP itself was healthy, but the Connect VPC Tunnel experienced TCP socket exhaustion because the database connection pool on your backend instance reached its maximum 100-connection limit.\n\nWe have temporarily increased the keep-alive recycling rate on the VPC egress gateway. We strongly recommend enabling Prisma / pgBouncer connection pooling or bumping \`POOL_MAX_CLIENTS\` to 250 in your Environment Variables. Let me know if the error rate has cleared on your dashboard.`
      }
    ]
  },
  {
    id: 'TICK-89241',
    subject: 'Custom wildcard TLS certificate SAN validation failing on *.enterprise.acme.corp',
    description: 'ACME HTTP-01 challenge is failing for our secondary wildcard domain. The DNS TXT record _acme-challenge was verified via dig, but Cloudmesh Edge returns NXDOMAIN error during provisioning.',
    status: 'waiting_on_customer',
    priority: 'p3_normal',
    category: 'security_waf',
    projectId: 'proj_admin_console',
    projectName: 'admin-portal-internal',
    environment: 'production',
    createdAt: 'Yesterday at 16:30',
    updatedAt: '3h ago',
    slaDueIn: 'Customer response requested',
    assignedEngineer: {
      name: 'Clara Zhang',
      role: 'Cloud Security & TLS Specialist',
      email: 'clara.zhang@cloudmesh.io',
      avatarBg: 'bg-emerald-600'
    },
    diagnosticsAttached: false,
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        authorName: 'rasadsk007@gmail.com',
        authorRole: 'Team Admin',
        timestamp: 'Yesterday at 16:30',
        content: `We configured our DNS provider with the TXT record for Let's Encrypt validation, but the status has been stuck on "Validating DNS" for over 18 hours.`
      },
      {
        id: 'msg-2',
        sender: 'support_engineer',
        authorName: 'Clara Zhang',
        authorRole: 'Cloud Security & TLS Specialist',
        timestamp: 'Yesterday at 18:10',
        content: `Hi Rasad,\n\nI queried authoritative nameservers for \`enterprise.acme.corp\` and noticed a conflicting CAA record:\n\`issue "digicert.com"\`\n\nBecause your DNS has a CAA restriction allowing only DigiCert, Let's Encrypt CA is legally rejected from issuing the certificate. Please add an additional CAA record:\n\`enterprise.acme.corp. CAA 0 issue "letsencrypt.org"\`\n\nOnce added, click "Re-verify" in Domains Console and it will complete within 60 seconds.`
      }
    ]
  },
  {
    id: 'TICK-91024',
    subject: 'Production Monorepo Turborepo build cache remote hydration mismatch',
    description: 'Deployments on branch main are rebuilding all 14 packages instead of retrieving remote artifacts from Cloudmesh Build Cache bucket.',
    status: 'open',
    priority: 'p2_high',
    category: 'deployments_builds',
    projectId: 'proj_saas_dashboard',
    projectName: 'saas-analytics-core',
    environment: 'production',
    createdAt: '45m ago',
    updatedAt: '45m ago',
    slaDueIn: '1h 15m remaining (P2 2h SLA)',
    diagnosticsAttached: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        authorName: 'rasadsk007@gmail.com',
        authorRole: 'Team Admin',
        timestamp: '45m ago',
        content: `Build duration jumped from 42s to 6m 18s across all new deployments. The build logs show \`Remote Cache: Miss (Hash key invalidated)\` for every workspace package. We did not alter turbo.json.`
      }
    ]
  },
  {
    id: 'TICK-87103',
    subject: 'VPC Peering cross-region latency spike between us-east-1 and eu-west-1',
    description: 'Unusually high RTT measured across the inter-region AWS Transit Gateway bridge. Resolved following transatlantic fiber path re-route.',
    status: 'resolved',
    priority: 'p1_critical',
    category: 'networking_dns',
    projectId: 'proj_payment_orchestrator',
    projectName: 'payment-gateway-service',
    environment: 'production',
    createdAt: 'Sep 14, 2026',
    updatedAt: 'Sep 15, 2026',
    assignedEngineer: {
      name: 'Marcus Vance',
      role: 'Principal Network Architect',
      email: 'marcus.v@cloudmesh.io',
      avatarBg: 'bg-purple-600'
    },
    diagnosticsAttached: true,
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        authorName: 'rasadsk007@gmail.com',
        authorRole: 'Team Admin',
        timestamp: 'Sep 14, 2026',
        content: `Urgent: Stripe webhook synchronization latency jumped to 480ms due to transatlantic routing degradation.`
      },
      {
        id: 'msg-2',
        sender: 'support_engineer',
        authorName: 'Marcus Vance',
        authorRole: 'Principal Network Architect',
        timestamp: 'Sep 14, 2026',
        content: `Identified fiber cut on undersea cable system TAT-14. We triggered an automated failover to the Dunant subsea cable system via Equinix Ashburn to Paris. Latency returned to 64ms normal baseline.`
      }
    ]
  },
  {
    id: 'TICK-85290',
    subject: 'Token bucket limit burst request for AI Gateway Gemini 2.5 Flash endpoints',
    description: 'Requested increase from 500,000 TPM to 2,500,000 TPM for scheduled machine learning batch processing jobs.',
    status: 'resolved',
    priority: 'p4_low',
    category: 'billing_quotas',
    projectId: 'proj_ai_assistant',
    projectName: 'customer-copilot-agent',
    environment: 'production',
    createdAt: 'Sep 08, 2026',
    updatedAt: 'Sep 09, 2026',
    assignedEngineer: {
      name: 'Elena Rostova',
      role: 'Platform Operations & Quotas',
      email: 'elena.r@cloudmesh.io',
      avatarBg: 'bg-blue-600'
    },
    diagnosticsAttached: false,
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        authorName: 'rasadsk007@gmail.com',
        authorRole: 'Team Admin',
        timestamp: 'Sep 08, 2026',
        content: `We need to run bulk text vector embeddings for 50k customer support tickets this weekend. Requesting 2.5M TPM burst limit on our AI Gateway route.`
      },
      {
        id: 'msg-2',
        sender: 'support_engineer',
        authorName: 'Elena Rostova',
        authorRole: 'Platform Operations & Quotas',
        timestamp: 'Sep 09, 2026',
        content: `Your AI Gateway quota has been increased to 3,000,000 TPM with dynamic fallback failover enabled. You are all set!`
      }
    ]
  }
];

export const SYSTEM_COMPONENTS: SystemComponentStatus[] = [
  {
    id: 'comp-1',
    name: 'Global Anycast Edge Network & DNS',
    region: '320+ Global Edge POPs',
    status: 'operational',
    uptimePercent: 99.998,
    latencyMs: 8,
    incidentCount30d: 0
  },
  {
    id: 'comp-2',
    name: 'Serverless V8 Compute Isolates',
    region: 'North America, Europe, Asia-Pacific',
    status: 'operational',
    uptimePercent: 100.0,
    latencyMs: 12,
    incidentCount30d: 0
  },
  {
    id: 'comp-3',
    name: 'Cloudmesh Unified Storage & S3/KV',
    region: 'Multi-Region Replicated',
    status: 'operational',
    uptimePercent: 99.992,
    latencyMs: 16,
    incidentCount30d: 1
  },
  {
    id: 'comp-4',
    name: 'WAF & DDoS Mitigation Engine',
    region: 'Edge Layer 3/4/7 Protection',
    status: 'operational',
    uptimePercent: 100.0,
    latencyMs: 2,
    incidentCount30d: 0
  },
  {
    id: 'comp-5',
    name: 'AI Gateway & Gemini Route Proxy',
    region: 'Anycast V8 Low Latency',
    status: 'operational',
    uptimePercent: 99.985,
    latencyMs: 28,
    incidentCount30d: 0
  },
  {
    id: 'comp-6',
    name: 'CI/CD Build & Container Runner',
    region: 'Distributed Build Fleet (us-east1 / eu-west1)',
    status: 'operational',
    uptimePercent: 99.960,
    latencyMs: 380,
    incidentCount30d: 1
  },
  {
    id: 'comp-7',
    name: 'Connect VPC Peering & Dedicated IPs',
    region: 'Direct Interconnects (AWS, GCP, Azure)',
    status: 'operational',
    uptimePercent: 99.995,
    latencyMs: 11,
    incidentCount30d: 0
  }
];

export const RECENT_INCIDENTS: SystemIncident[] = [
  {
    id: 'inc-2026-09-18',
    title: 'Intermittent Edge TLS Handshake Latency in iad1 (Ashburn)',
    severity: 'minor',
    status: 'resolved',
    impactedServices: ['Global Anycast Edge Network & DNS'],
    startTime: 'Sep 18, 2026 14:02 UTC',
    resolvedTime: 'Sep 18, 2026 14:24 UTC',
    updates: [
      {
        timestamp: '14:24 UTC',
        status: 'Resolved',
        message: 'BGP Anycast routing has stabilized following automated traffic shifting to Richmond POP (ric1). Edge TLS handshake latency is back to normal baseline.'
      },
      {
        timestamp: '14:12 UTC',
        status: 'Monitoring',
        message: 'Mitigation applied: Traffic routed away from degraded upstream transit provider.'
      },
      {
        timestamp: '14:04 UTC',
        status: 'Investigating',
        message: 'Engineers are investigating elevated 504 and TLS handshake latency in the Ashburn, VA region.'
      }
    ]
  },
  {
    id: 'inc-2026-09-11',
    title: 'Scheduled Maintenance: Edge Runtime Kernel Hotpatching',
    severity: 'maintenance',
    status: 'resolved',
    impactedServices: ['Serverless V8 Compute Isolates'],
    startTime: 'Sep 11, 2026 03:00 UTC',
    resolvedTime: 'Sep 11, 2026 03:45 UTC',
    updates: [
      {
        timestamp: '03:45 UTC',
        status: 'Completed',
        message: 'Kernel hotpatching completed across all compute clusters with zero user downtime.'
      }
    ]
  }
];

export const KNOWLEDGE_BASE_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'kb-01',
    title: 'Troubleshooting 504 Gateway Timeouts & Long-running Database Queries',
    category: 'Performance & Edge',
    readTime: '4 min read',
    summary: 'Learn how to configure connection poolers like PgBouncer and optimize V8 edge function execution timeouts.',
    content: `When an edge worker returns a **504 Gateway Timeout**, it indicates the edge proxy waited longer than the configured execution ceiling (default 15s for Serverless, 60s for Background Tasks) for an upstream response.

### Common Root Causes:
1. **Unpooled Database Connections**: Direct connections to PostgreSQL or MySQL under high concurrent traffic exhaust socket limits.
2. **Cold Starts with Heavy Module Bundles**: Ensure large dependencies like Puppeteer or TensorFlow are properly externalized or containerized.
3. **Missing Indexing on Filtered Columns**: Review slow query logs in the Observability tab.

### Recommended Fix:
Enable connection pooling by setting the \`?sslmode=require&pgbouncer=true\` parameter in your database URL or deploy a Cloudmesh Connect VPC connector.`,
    helpfulCount: 342,
    tags: ['Edge', 'Postgres', '504', 'Performance']
  },
  {
    id: 'kb-02',
    title: 'Fixing Let\'s Encrypt SSL/TLS CAA Record Validation Failures',
    category: 'Security & DNS',
    readTime: '3 min read',
    summary: 'Step-by-step guide to resolving DNS CAA errors that prevent automatic TLS certificate issuance on custom domains.',
    content: `Certification Authority Authorization (CAA) records specify which Certificate Authorities are allowed to generate SSL/TLS certificates for your apex domain and subdomains.

### Resolution Steps:
1. Check your existing CAA record using the terminal:
\`\`\`bash
dig CAA yourcompany.com +short
\`\`\`
2. If you have an existing record for another provider (e.g. DigiCert or Sectigo), Let's Encrypt will be blocked. Add:
\`\`\`text
yourcompany.com.  IN  CAA  0  issue  "letsencrypt.org"
yourcompany.com.  IN  CAA  0  issuewild  "letsencrypt.org"
\`\`\`
3. Wait 5 minutes for DNS TTL propagation, then trigger a manual certificate re-check in Domains Console.`,
    helpfulCount: 289,
    tags: ['TLS', 'SSL', 'DNS', 'Domains']
  },
  {
    id: 'kb-03',
    title: 'Zero-Downtime Canary Rollouts with Cloudmesh Feature Flags',
    category: 'Deployment & CI/CD',
    readTime: '5 min read',
    summary: 'Best practices for decoupling code release from deployment using remote edge flag evaluation.',
    content: `Feature flags allow you to deploy new features to production disabled by default, and gradually roll them out to targeted segments (e.g. internal employees, beta testers, 5% of users).

### Key Implementation Pattern:
\`\`\`typescript
import { useFeatureFlag } from '@cloudmesh/flags-react';

export function CheckoutWidget() {
  const isV2Enabled = useFeatureFlag('checkout_flow_v2', { default: false });
  return isV2Enabled ? <OptimizedCheckout /> : <LegacyCheckout />;
}
\`\`\`
With sub-millisecond Anycast evaluation, flag evaluation adds less than 0.4ms to your page load time.`,
    helpfulCount: 415,
    tags: ['Flags', 'Deployments', 'Canary', 'Best Practices']
  },
  {
    id: 'kb-04',
    title: 'VPC Interconnect MTU Sizing & Subnet CIDR Peering Guidelines',
    category: 'Networking & VPC',
    readTime: '6 min read',
    summary: 'Prevent packet fragmentation and packet drops across cross-cloud AWS, GCP, and Azure private interconnects.',
    content: `When peering your internal VPC with Cloudmesh Connect, mismatched MTU (Maximum Transmission Unit) sizes can cause silent TCP stall issues.

### Guidelines:
- **Standard Ethernet MTU**: Ensure your router or transit gateway advertises **1500 bytes** (do not use 9001 Jumbo Frames across public peering links).
- **Subnet Overlap**: Verify your Cloudmesh dedicated CIDR (e.g., \`10.198.0.0/16\`) does not overlap with existing internal RFC1918 private subnets.`,
    helpfulCount: 178,
    tags: ['VPC', 'Networking', 'MTU', 'Connect']
  },
  {
    id: 'kb-05',
    title: 'Managing AI Gateway Rate Limits, Tokens, and Fallback Routing',
    category: 'AI Gateway',
    readTime: '4 min read',
    summary: 'Architecting resilient LLM pipelines with automatic provider failover and token budget circuit breakers.',
    content: `Cloudmesh AI Gateway provides unified proxying for Gemini, Anthropic, and OpenAI models with automatic caching, semantic deduplication, and budget caps.

### Circuit Breaker Configuration:
Configure fallback routes so that if your primary model hits a rate limit (HTTP 429), requests seamlessly fail over to Gemini 2.5 Flash without dropping user requests.`,
    helpfulCount: 312,
    tags: ['AI', 'Gemini', 'Gateway', 'Tokens']
  }
];

export const DEFAULT_DIAGNOSTIC_CHECKS: DiagnosticCheckItem[] = [
  {
    id: 'diag-1',
    name: 'Global Anycast DNS & Geo-Proximity Routing',
    category: 'Network',
    status: 'pending',
    details: 'Verifying NS record health and latency across 6 global POPs'
  },
  {
    id: 'diag-2',
    name: 'TLS 1.3 / ALPN HTTP/2 & HTTP/3 Handshake',
    category: 'Security',
    status: 'pending',
    details: 'Testing cipher suite negotiation and OCSP stapling validity'
  },
  {
    id: 'diag-3',
    name: 'Edge Cache Header & Stale-While-Revalidate TTL',
    category: 'CDN',
    status: 'pending',
    details: 'Validating Cache-Control, ETag generation, and Brotli compression'
  },
  {
    id: 'diag-4',
    name: 'Environment Secrets & Build Environment Health',
    category: 'Configuration',
    status: 'pending',
    details: 'Checking secret encryption keys and variable binding consistency'
  },
  {
    id: 'diag-5',
    name: 'Serverless Worker Memory & Process Exit Codes',
    category: 'Compute',
    status: 'pending',
    details: 'Scanning for OOM (Out of Memory) termination patterns and unhandled promises'
  },
  {
    id: 'diag-6',
    name: 'Upstream Connect VPC Peering & Database RTT',
    category: 'Database',
    status: 'pending',
    details: 'Benchmarking socket round-trip time to private VPC connectors'
  }
];
