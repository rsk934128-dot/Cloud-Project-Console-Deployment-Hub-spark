import { TimeSeriesPoint, RegionTraffic, StatusCodeBreakdown, TopEndpoint, DeviceOsStat } from '../types/analytics';

export const TIME_RANGE_OPTIONS = [
  { id: '1h', label: 'Last 1 Hour', points: 12 },
  { id: '24h', label: 'Last 24 Hours', points: 24 },
  { id: '7d', label: 'Last 7 Days', points: 14 },
  { id: '30d', label: 'Last 30 Days', points: 30 }
];

export const generateAnalyticsTimeSeries = (timeRange: string, projectMultiplier: number = 1): TimeSeriesPoint[] => {
  const pointsCount = timeRange === '1h' ? 12 : timeRange === '24h' ? 24 : timeRange === '7d' ? 14 : 30;
  const list: TimeSeriesPoint[] = [];

  for (let i = 0; i < pointsCount; i++) {
    let label = '';
    if (timeRange === '1h') {
      const minsAgo = (pointsCount - 1 - i) * 5;
      label = minsAgo === 0 ? 'Now' : `-${minsAgo}m`;
    } else if (timeRange === '24h') {
      const hour = (24 - pointsCount + i + 12) % 24;
      label = `${hour.toString().padStart(2, '0')}:00`;
    } else if (timeRange === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - (pointsCount - 1 - i) / 2);
      label = `${d.getMonth() + 1}/${d.getDate()}`;
    } else {
      label = `Day ${i + 1}`;
    }

    const baseReq = Math.floor((320 + Math.sin(i * 0.7) * 160 + (i % 3 === 0 ? 80 : 0)) * projectMultiplier);
    const latency = Math.round(22 + Math.cos(i * 0.9) * 9 + (i === 7 ? 35 : 0));
    const errors = Math.max(0, Math.floor((Math.sin(i * 1.3) * 4 + (i === 11 ? 14 : 1)) * (projectMultiplier > 1 ? 1.5 : 1)));
    const bandwidth = Math.round(baseReq * 14.8);

    list.push({
      timestamp: label,
      requests: Math.max(15, baseReq),
      latency: Math.max(12, latency),
      errors,
      bandwidthKb: bandwidth
    });
  }

  return list;
};

export const GLOBAL_REGIONS: RegionTraffic[] = [
  { code: 'iad1', name: 'Washington, D.C. (US East)', requests: 148200, percentage: 41.2, latencyMs: 18, status: 'optimal' },
  { code: 'sfo1', name: 'San Francisco (US West)', requests: 88400, percentage: 24.6, latencyMs: 24, status: 'optimal' },
  { code: 'fra1', name: 'Frankfurt (Europe Central)', requests: 52100, percentage: 14.5, latencyMs: 32, status: 'optimal' },
  { code: 'sin1', name: 'Singapore (Asia Southeast)', requests: 39500, percentage: 11.0, latencyMs: 44, status: 'optimal' },
  { code: 'hnd1', name: 'Tokyo (Asia Northeast)', requests: 21800, percentage: 6.1, latencyMs: 38, status: 'optimal' },
  { code: 'syd1', name: 'Sydney (Oceania)', requests: 9400, percentage: 2.6, latencyMs: 82, status: 'warning' }
];

export const STATUS_CODES: StatusCodeBreakdown[] = [
  { status: '200 OK', code: 200, count: 341800, percentage: 95.1, color: '#10b981' },
  { status: '304 Not Modified', code: 304, count: 11400, percentage: 3.2, color: '#3b82f6' },
  { status: '404 Not Found', code: 404, count: 4200, percentage: 1.2, color: '#f59e0b' },
  { status: '500 Server Error', code: 500, count: 1450, percentage: 0.4, color: '#ef4444' },
  { status: '429 Rate Limited', code: 429, count: 550, percentage: 0.1, color: '#ec4899' }
];

export const TOP_ENDPOINTS: TopEndpoint[] = [
  { path: '/api/v1/auth/session', method: 'GET', requests: 94200, avgLatencyMs: 14, p95LatencyMs: 28, errorRate: 0.02, cachedPercentage: 88 },
  { path: '/dashboard/overview', method: 'GET', requests: 78100, avgLatencyMs: 24, p95LatencyMs: 46, errorRate: 0.05, cachedPercentage: 92 },
  { path: '/api/trpc/projects.list', method: 'POST', requests: 46300, avgLatencyMs: 38, p95LatencyMs: 72, errorRate: 0.18, cachedPercentage: 45 },
  { path: '/api/telemetry/stream', method: 'POST', requests: 31200, avgLatencyMs: 19, p95LatencyMs: 34, errorRate: 0.01, cachedPercentage: 0 },
  { path: '/_next/static/chunks/main.js', method: 'GET', requests: 28900, avgLatencyMs: 8, p95LatencyMs: 14, errorRate: 0.0, cachedPercentage: 99 },
  { path: '/api/v1/deployments/webhook', method: 'POST', requests: 12400, avgLatencyMs: 52, p95LatencyMs: 118, errorRate: 1.2, cachedPercentage: 0 },
  { path: '/favicon.ico', method: 'GET', requests: 9800, avgLatencyMs: 6, p95LatencyMs: 11, errorRate: 0.0, cachedPercentage: 100 }
];

export const DEVICE_OS_BREAKDOWN: DeviceOsStat[] = [
  { name: 'macOS (Darwin)', percentage: 48.2, count: 173200 },
  { name: 'Windows 11', percentage: 29.5, count: 106000 },
  { name: 'Linux x86_64', percentage: 14.1, count: 50700 },
  { name: 'iOS Safari', percentage: 5.4, count: 19400 },
  { name: 'Android Chrome', percentage: 2.8, count: 10100 }
];
