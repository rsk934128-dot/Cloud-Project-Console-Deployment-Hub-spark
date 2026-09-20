export type ImageFormat = 'auto' | 'avif' | 'webp' | 'jpeg' | 'png';
export type ImageFit = 'cover' | 'contain' | 'fill' | 'inside' | 'outside';

export interface ImagePipelinePreset {
  id: string;
  name: string;
  description: string;
  format: ImageFormat;
  quality: number;
  width?: number;
  height?: number;
  fit: ImageFit;
  stripMetadata: boolean;
  smartCropFace: boolean;
  sharpness: number;
  blur?: number;
  maxAgeDays: number;
  pattern: string;
}

export interface ImageTransformLog {
  id: string;
  sourceUrl: string;
  originalFormat: string;
  optimizedFormat: string;
  originalBytes: number;
  optimizedBytes: number;
  reductionPercentage: number;
  latencyMs: number;
  edgeLocation: string;
  cacheStatus: 'HIT' | 'MISS' | 'REVALIDATED';
  timestamp: string;
  dimensions: string;
}

export interface PipelineMetrics {
  totalTranscodes24h: number;
  bandwidthSavedGb: number;
  averageCompressionRate: number;
  cacheHitRatio: number;
  p95LatencyMs: number;
  monthlyCostAvoidanceUsd: number;
}
