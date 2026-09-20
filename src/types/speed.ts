export type VitalStatus = 'good' | 'needs-improvement' | 'poor';

export interface CoreWebVital {
  id: string;
  name: string;
  shortName: 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
  value: number;
  displayValue: string;
  unit: string;
  status: VitalStatus;
  thresholdGood: number;
  thresholdPoor: number;
  goodPercent: number;
  needsImprovementPercent: number;
  poorPercent: number;
  description: string;
  recommendation: string;
}

export interface RouteSpeedMetric {
  path: string;
  score: number;
  lcp: string;
  inp: string;
  cls: string;
  ttfb: string;
  status: VitalStatus;
  pageViews: number;
  deviceBias: 'desktop' | 'mobile' | 'mixed';
}

export interface SpeedAudit {
  id: string;
  title: string;
  category: 'Images' | 'JavaScript' | 'Caching' | 'Fonts' | 'Server';
  impact: 'high' | 'medium' | 'low';
  estimatedSavings: string;
  details: string;
  affectedUrl: string;
}

export interface DeviceSpeedData {
  device: 'Desktop' | 'Mobile' | 'Tablet';
  score: number;
  share: number;
  avgLcp: string;
  avgInp: string;
  avgCls: string;
}
