export type CacheStatus = 'HIT' | 'MISS' | 'STALE' | 'REVALIDATED' | 'BYPASS';

export interface CdnCacheRule {
  id: string;
  name: string;
  pattern: string;
  cacheTtl: string;
  staleWhileRevalidateTtl: string;
  browserTtl: string;
  enabled: boolean;
  type: 'static' | 'dynamic' | 'bypass';
  description: string;
}

export interface CachePurgeJob {
  id: string;
  type: 'everything' | 'url' | 'tag' | 'prefix';
  target: string;
  timestamp: string;
  status: 'completed' | 'processing' | 'failed';
  durationMs: number;
  initiatedBy: string;
  popsCount: number;
}

export interface EdgePopStatus {
  code: string;
  name: string;
  country: string;
  hitRatioPercent: number;
  bandwidthServed: string;
  latencyMs: number;
  status: 'operational' | 'degraded' | 'maintenance';
}

export interface CacheStatusRatio {
  status: CacheStatus;
  percentage: number;
  count: number;
  color: string;
  description: string;
}

export interface CdnOptimizationSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'compression' | 'protocol' | 'delivery';
  badge?: string;
}
