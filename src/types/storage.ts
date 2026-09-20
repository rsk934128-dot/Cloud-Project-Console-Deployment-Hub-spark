export type StorageProductType = 'kv' | 'blob' | 'sql' | 'vector';

export interface KvNamespace {
  id: string;
  name: string;
  keysCount: number;
  sizeMb: number;
  readOps24h: number;
  writeOps24h: number;
  region: string;
  createdDate: string;
}

export interface KvEntry {
  key: string;
  value: string;
  namespaceId: string;
  ttlSeconds?: number;
  expiresAt?: string;
  sizeBytes: number;
  lastModified: string;
}

export interface BlobBucket {
  id: string;
  name: string;
  region: string;
  objectsCount: number;
  sizeGb: number;
  publicAccess: boolean;
  corsEnabled: boolean;
  endpointUrl: string;
  createdDate: string;
}

export interface BlobObject {
  id: string;
  bucketId: string;
  key: string;
  contentType: string;
  sizeBytes: number;
  lastModified: string;
  etag: string;
  storageClass: 'Standard' | 'Infrequent' | 'Cold';
}

export interface SqlDatabase {
  id: string;
  name: string;
  engine: 'PostgreSQL 16' | 'SQLite Edge (D1)';
  sizeMb: number;
  tablesCount: number;
  rowsCount: number;
  region: string;
  status: 'online' | 'optimizing' | 'snapshotting';
  endpoint: string;
  connectionStringMasked: string;
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowsAffected: number;
}

export interface VectorIndex {
  id: string;
  name: string;
  dimensions: number;
  metric: 'cosine' | 'dotproduct' | 'euclidean';
  vectorCount: number;
  namespacesCount: number;
  lastIndexed: string;
}
