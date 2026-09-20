import { 
  CdnCacheRule, 
  CachePurgeJob, 
  EdgePopStatus, 
  CacheStatusRatio, 
  CdnOptimizationSetting 
} from '../types/cdn';

export const INITIAL_CACHE_RULES: CdnCacheRule[] = [
  {
    id: 'rule-static-assets',
    name: 'Immutable Build Artifacts',
    pattern: '/_next/static/**, /assets/**',
    cacheTtl: '365 days (31536000s)',
    staleWhileRevalidateTtl: 'N/A (Immutable)',
    browserTtl: '365 days',
    enabled: true,
    type: 'static',
    description: 'Hashed static assets cached permanently at edge and browser.'
  },
  {
    id: 'rule-images',
    name: 'Optimized Web Images',
    pattern: '/_next/image*, /images/**, *.avif, *.webp',
    cacheTtl: '30 days (2592000s)',
    staleWhileRevalidateTtl: '7 days',
    browserTtl: '1 day',
    enabled: true,
    type: 'static',
    description: 'AVIF, WebP, and transformed dynamic image thumbnails.'
  },
  {
    id: 'rule-api-stale',
    name: 'Catalog & Public API Feeds',
    pattern: '/api/v1/products*, /api/v1/projects/public*',
    cacheTtl: '60 seconds',
    staleWhileRevalidateTtl: '86400 seconds (24h)',
    browserTtl: '0 seconds (Must revalidate)',
    enabled: true,
    type: 'dynamic',
    description: 'Stale-while-revalidate enabled for instant global API lookups with async origin warming.'
  },
  {
    id: 'rule-html-pages',
    name: 'Incremental Static Regeneration (ISR)',
    pattern: '/* (HTML Document Pages)',
    cacheTtl: '10 minutes',
    staleWhileRevalidateTtl: '1 hour',
    browserTtl: '0 seconds',
    enabled: true,
    type: 'dynamic',
    description: 'Server-rendered pages with background edge revalidation.'
  },
  {
    id: 'rule-auth-bypass',
    name: 'Auth, Billing & Webhook Bypass',
    pattern: '/api/v1/auth/**, /api/v1/billing/**, /api/webhooks/**',
    cacheTtl: '0 seconds (No Cache)',
    staleWhileRevalidateTtl: '0 seconds',
    browserTtl: 'no-store, private',
    enabled: true,
    type: 'bypass',
    description: 'Completely bypasses edge cache and streams straight to origin serverless runtime.'
  }
];

export const INITIAL_PURGE_JOBS: CachePurgeJob[] = [
  {
    id: 'prg-901',
    type: 'tag',
    target: 'tag:product-inventory',
    timestamp: '10:46:12',
    status: 'completed',
    durationMs: 84,
    initiatedBy: 'rasadsk007@gmail.com',
    popsCount: 320
  },
  {
    id: 'prg-902',
    type: 'url',
    target: 'https://ais-dev-4duhlb32z6wpmvildo3auf.asia-east1.run.app/assets/hero.avif',
    timestamp: '10:38:05',
    status: 'completed',
    durationMs: 62,
    initiatedBy: 'deploy_webhook_bot',
    popsCount: 320
  },
  {
    id: 'prg-903',
    type: 'prefix',
    target: '/_next/static/chunks/*',
    timestamp: '09:12:44',
    status: 'completed',
    durationMs: 142,
    initiatedBy: 'rasadsk007@gmail.com',
    popsCount: 320
  }
];

export const EDGE_POPS: EdgePopStatus[] = [
  { code: 'iad1', name: 'Washington, D.C.', country: 'United States', hitRatioPercent: 97.4, bandwidthServed: '1.42 TB', latencyMs: 12, status: 'operational' },
  { code: 'sfo1', name: 'San Francisco', country: 'United States', hitRatioPercent: 96.8, bandwidthServed: '890 GB', latencyMs: 14, status: 'operational' },
  { code: 'lhr1', name: 'London Heathrow', country: 'United Kingdom', hitRatioPercent: 96.1, bandwidthServed: '760 GB', latencyMs: 18, status: 'operational' },
  { code: 'fra1', name: 'Frankfurt am Main', country: 'Germany', hitRatioPercent: 95.9, bandwidthServed: '640 GB', latencyMs: 20, status: 'operational' },
  { code: 'sin1', name: 'Singapore Changi', country: 'Singapore', hitRatioPercent: 94.8, bandwidthServed: '520 GB', latencyMs: 24, status: 'operational' },
  { code: 'hnd1', name: 'Tokyo Haneda', country: 'Japan', hitRatioPercent: 97.2, bandwidthServed: '480 GB', latencyMs: 16, status: 'operational' },
  { code: 'syd1', name: 'Sydney Kingsford', country: 'Australia', hitRatioPercent: 94.2, bandwidthServed: '290 GB', latencyMs: 38, status: 'operational' },
  { code: 'gru1', name: 'São Paulo Guarulhos', country: 'Brazil', hitRatioPercent: 93.6, bandwidthServed: '210 GB', latencyMs: 44, status: 'operational' }
];

export const CACHE_STATUS_RATIOS: CacheStatusRatio[] = [
  { status: 'HIT', percentage: 84.6, count: 194820, color: 'bg-emerald-500', description: 'Served immediately from Edge NVMe RAM cache' },
  { status: 'STALE', percentage: 8.2, count: 18880, color: 'bg-indigo-500', description: 'Served stale while asynchronously revalidating origin in background' },
  { status: 'REVALIDATED', percentage: 3.4, count: 7830, color: 'bg-cyan-500', description: 'Edge verified 304 Not Modified with origin' },
  { status: 'MISS', percentage: 2.6, count: 5990, color: 'bg-amber-500', description: 'First request fetched from origin and saved to edge' },
  { status: 'BYPASS', percentage: 1.2, count: 2760, color: 'bg-rose-500', description: 'Explicit Cache-Control: private or no-store route' }
];

export const CDN_OPTIMIZATIONS: CdnOptimizationSetting[] = [
  {
    id: 'opt-brotli',
    name: 'Brotli Compression Level 11',
    description: 'Compresses HTML, CSS, JavaScript, and JSON payloads with up to 26% smaller file sizes than standard Gzip.',
    enabled: true,
    category: 'compression',
    badge: '26% Savings'
  },
  {
    id: 'opt-http3',
    name: 'HTTP/3 with QUIC & 0-RTT',
    description: 'Enables UDP-based transport protocol to eliminate head-of-line blocking and achieve near-zero connection establishment.',
    enabled: true,
    category: 'protocol',
    badge: 'Zero RTT'
  },
  {
    id: 'opt-early-hints',
    name: 'HTTP 103 Early Hints',
    description: 'Sends preliminary headers while the server prepares response so browsers start fetching fonts, stylesheets, and scripts early.',
    enabled: true,
    category: 'delivery',
    badge: 'CWV Booster'
  },
  {
    id: 'opt-minify',
    name: 'Edge HTML & Asset Minification',
    description: 'Strips comments, redundant whitespace, and duplicate declarations on the fly before egress transmission.',
    enabled: true,
    category: 'compression'
  },
  {
    id: 'opt-keepalive',
    name: 'TCP Fast Open & Origin Keepalive',
    description: 'Maintains warm multiplexed connections between edge PoPs and Cloud Run origin servers to reduce TLS negotiation overhead.',
    enabled: true,
    category: 'protocol'
  },
  {
    id: 'opt-stale-if-error',
    name: 'Stale-If-Error Origin Shield',
    description: 'If your origin experiences 5xx errors or network drops, edge PoPs immediately serve cached copies rather than an error page.',
    enabled: true,
    category: 'delivery',
    badge: 'Resilience'
  }
];
