import { KvNamespace, KvEntry, BlobBucket, BlobObject, SqlDatabase, VectorIndex } from '../types/storage';

export const INITIAL_KV_NAMESPACES: KvNamespace[] = [
  {
    id: 'kv-ns-01',
    name: 'EDGE_AUTH_SESSIONS',
    keysCount: 14820,
    sizeMb: 84.5,
    readOps24h: 1824000,
    writeOps24h: 42100,
    region: 'Global Edge (Anycast)',
    createdDate: 'May 12, 2026'
  },
  {
    id: 'kv-ns-02',
    name: 'RATE_LIMIT_COUNTERS',
    keysCount: 65400,
    sizeMb: 14.2,
    readOps24h: 8940000,
    writeOps24h: 3120000,
    region: 'Global Edge (Anycast)',
    createdDate: 'Jun 01, 2026'
  },
  {
    id: 'kv-ns-03',
    name: 'APP_CONFIG_FLAGS',
    keysCount: 420,
    sizeMb: 1.8,
    readOps24h: 450000,
    writeOps24h: 120,
    region: 'Global Edge (Anycast)',
    createdDate: 'Jul 19, 2026'
  }
];

export const INITIAL_KV_ENTRIES: KvEntry[] = [
  {
    key: 'session:usr_99f1a0293b',
    value: JSON.stringify({ userId: 'usr_99f1a0293b', role: 'admin', ip: '76.24.11.90', issuedAt: 1790010000 }, null, 2),
    namespaceId: 'kv-ns-01',
    ttlSeconds: 86400,
    expiresAt: '23h 48m',
    sizeBytes: 138,
    lastModified: '12m ago'
  },
  {
    key: 'session:usr_42a8b9c10f',
    value: JSON.stringify({ userId: 'usr_42a8b9c10f', role: 'developer', ip: '192.0.2.45', issuedAt: 1790009400 }, null, 2),
    namespaceId: 'kv-ns-01',
    ttlSeconds: 86400,
    expiresAt: '21h 10m',
    sizeBytes: 142,
    lastModified: '2h ago'
  },
  {
    key: 'ratelimit:ip:198.51.100.22',
    value: JSON.stringify({ count: 48, max: 120, windowStart: 1790010100 }, null, 2),
    namespaceId: 'kv-ns-02',
    ttlSeconds: 60,
    expiresAt: '42s',
    sizeBytes: 64,
    lastModified: '18s ago'
  },
  {
    key: 'ratelimit:api_token:tok_prod_44a',
    value: JSON.stringify({ count: 912, max: 5000, windowStart: 1790010000 }, null, 2),
    namespaceId: 'kv-ns-02',
    ttlSeconds: 300,
    expiresAt: '2m 14s',
    sizeBytes: 78,
    lastModified: '45s ago'
  },
  {
    key: 'flag:enable_gemini_vision_v2',
    value: JSON.stringify({ enabled: true, rolloutPct: 100, minVersion: '2.4.0' }, null, 2),
    namespaceId: 'kv-ns-03',
    sizeBytes: 68,
    lastModified: 'Yesterday'
  },
  {
    key: 'flag:maintenance_mode_banner',
    value: JSON.stringify({ active: false, message: 'Scheduled maintenance at midnight UTC' }, null, 2),
    namespaceId: 'kv-ns-03',
    sizeBytes: 82,
    lastModified: '3 days ago'
  }
];

export const INITIAL_BLOB_BUCKETS: BlobBucket[] = [
  {
    id: 'bkt-01',
    name: 'prod-static-assets',
    region: 'us-east-1 (Global CDN Caching)',
    objectsCount: 4210,
    sizeGb: 148.4,
    publicAccess: true,
    corsEnabled: true,
    endpointUrl: 'https://prod-static-assets.s3.cloudmesh-storage.com',
    createdDate: 'May 04, 2026'
  },
  {
    id: 'bkt-02',
    name: 'user-uploads-encrypted',
    region: 'eu-central-1 (GDPR Compliant KMS)',
    objectsCount: 18900,
    sizeGb: 612.8,
    publicAccess: false,
    corsEnabled: true,
    endpointUrl: 'https://user-uploads-encrypted.s3.cloudmesh-storage.com',
    createdDate: 'Jun 18, 2026'
  },
  {
    id: 'bkt-03',
    name: 'database-automated-backups',
    region: 'us-west-2 (Immutable WORM Archive)',
    objectsCount: 340,
    sizeGb: 1240.0,
    publicAccess: false,
    corsEnabled: false,
    endpointUrl: 'https://database-automated-backups.s3.cloudmesh-storage.com',
    createdDate: 'Apr 22, 2026'
  }
];

export const INITIAL_BLOB_OBJECTS: BlobObject[] = [
  {
    id: 'obj-01',
    bucketId: 'bkt-01',
    key: 'branding/logo-master-dark.svg',
    contentType: 'image/svg+xml',
    sizeBytes: 14200,
    lastModified: 'Sep 14, 2026',
    etag: '"7d91a82f34b1029c"',
    storageClass: 'Standard'
  },
  {
    id: 'obj-02',
    bucketId: 'bkt-01',
    key: 'bundles/main.chunk.48f10b.js',
    contentType: 'application/javascript',
    sizeBytes: 284100,
    lastModified: 'Sep 18, 2026',
    etag: '"e42b109af37821bc"',
    storageClass: 'Standard'
  },
  {
    id: 'obj-03',
    bucketId: 'bkt-01',
    key: 'fonts/inter-tight-var.woff2',
    contentType: 'font/woff2',
    sizeBytes: 98400,
    lastModified: 'Aug 29, 2026',
    etag: '"99a41c28f00192ea"',
    storageClass: 'Standard'
  },
  {
    id: 'obj-04',
    bucketId: 'bkt-02',
    key: 'avatars/usr_99f1a0293b_pfp.webp',
    contentType: 'image/webp',
    sizeBytes: 42100,
    lastModified: 'Sep 12, 2026',
    etag: '"55f190ab7728190c"',
    storageClass: 'Standard'
  },
  {
    id: 'obj-05',
    bucketId: 'bkt-02',
    key: 'invoices/2026-08-INV-49120.pdf',
    contentType: 'application/pdf',
    sizeBytes: 184500,
    lastModified: 'Sep 01, 2026',
    etag: '"129a0f44bc819022"',
    storageClass: 'Infrequent'
  },
  {
    id: 'obj-06',
    bucketId: 'bkt-03',
    key: 'pg_dump_cloudsql_prod_2026-09-19.tar.gz',
    contentType: 'application/gzip',
    sizeBytes: 4821000000,
    lastModified: 'Yesterday',
    etag: '"a9812bc091248102"',
    storageClass: 'Cold'
  }
];

export const INITIAL_SQL_DATABASES: SqlDatabase[] = [
  {
    id: 'db-01',
    name: 'cloudmesh-production-db',
    engine: 'PostgreSQL 16',
    sizeMb: 1420.5,
    tablesCount: 14,
    rowsCount: 842100,
    region: 'us-east-1 (N. Virginia)',
    status: 'online',
    endpoint: 'ep-cool-butterfly-712891.us-east-1.aws.neon.tech',
    connectionStringMasked: 'postgresql://cloudmesh_app:••••••••••••@ep-cool-butterfly-712891.us-east-1.aws.neon.tech/neondb?sslmode=require'
  },
  {
    id: 'db-02',
    name: 'edge-session-d1',
    engine: 'SQLite Edge (D1)',
    sizeMb: 48.2,
    tablesCount: 6,
    rowsCount: 49200,
    region: 'Global Edge (Auto-Replicated)',
    status: 'online',
    endpoint: 'd1-session-mesh.cloudmesh.internal',
    connectionStringMasked: 'd1://d1-session-mesh.cloudmesh.internal?token=••••••••'
  }
];

export const INITIAL_VECTOR_INDEXES: VectorIndex[] = [
  {
    id: 'vec-01',
    name: 'kb_documentation_embeddings',
    dimensions: 1536,
    metric: 'cosine',
    vectorCount: 28400,
    namespacesCount: 3,
    lastIndexed: '22m ago'
  },
  {
    id: 'vec-02',
    name: 'user_semantic_memory_index',
    dimensions: 768,
    metric: 'dotproduct',
    vectorCount: 84900,
    namespacesCount: 12,
    lastIndexed: '4m ago'
  }
];
