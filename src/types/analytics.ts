export interface TimeSeriesPoint {
  timestamp: string;
  requests: number;
  latency: number;
  errors: number;
  bandwidthKb: number;
}

export interface RegionTraffic {
  code: string;
  name: string;
  requests: number;
  percentage: number;
  latencyMs: number;
  status: 'optimal' | 'warning' | 'degraded';
}

export interface StatusCodeBreakdown {
  status: string;
  code: number;
  count: number;
  percentage: number;
  color: string;
}

export interface TopEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  requests: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  cachedPercentage: number;
}

export interface DeviceOsStat {
  name: string;
  percentage: number;
  count: number;
}
