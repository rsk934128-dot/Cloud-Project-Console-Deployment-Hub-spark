import {
  ImagePipelinePreset,
  ImageTransformLog,
  PipelineMetrics
} from '../types/imagePipeline';

export const INITIAL_PIPELINE_PRESETS: ImagePipelinePreset[] = [
  {
    id: 'preset-hero-banners',
    name: 'High-Res Hero Banners',
    description: 'AVIF edge transcode with responsive DPR scaling and automated sharp contrast for top-of-fold banners.',
    format: 'avif',
    quality: 82,
    width: 1920,
    height: 1080,
    fit: 'cover',
    stripMetadata: true,
    smartCropFace: true,
    sharpness: 10,
    maxAgeDays: 365,
    pattern: '/assets/heroes/*'
  },
  {
    id: 'preset-user-avatars',
    name: 'Circular User Avatars',
    description: 'AI face-centric square crop, WebP/AVIF fallback, and metadata stripping for privacy compliance.',
    format: 'webp',
    quality: 85,
    width: 256,
    height: 256,
    fit: 'cover',
    stripMetadata: true,
    smartCropFace: true,
    sharpness: 5,
    maxAgeDays: 90,
    pattern: '/users/*/avatar'
  },
  {
    id: 'preset-product-catalog',
    name: 'E-Commerce Product Thumbnails',
    description: 'Contain fit with white background preservation and progressive loading blur placeholder generation.',
    format: 'avif',
    quality: 78,
    width: 600,
    height: 600,
    fit: 'contain',
    stripMetadata: true,
    smartCropFace: false,
    sharpness: 15,
    maxAgeDays: 180,
    pattern: '/products/*/card'
  },
  {
    id: 'preset-lqip-placeholder',
    name: 'Low-Quality Image Placeholder (LQIP)',
    description: 'Ultra-small 32px WebP blurred inline data string for zero-layout-shift (CLS) hydration.',
    format: 'webp',
    quality: 20,
    width: 32,
    height: 32,
    fit: 'cover',
    blur: 12,
    stripMetadata: true,
    smartCropFace: false,
    sharpness: 0,
    maxAgeDays: 365,
    pattern: '/*?lqip=true'
  }
];

export const INITIAL_TRANSFORM_LOGS: ImageTransformLog[] = [
  {
    id: 'tx-891024',
    sourceUrl: '/assets/heroes/cyberpunk-datacenter-4k.jpg',
    originalFormat: 'JPEG',
    optimizedFormat: 'AVIF',
    originalBytes: 4280192,
    optimizedBytes: 284102,
    reductionPercentage: 93.4,
    latencyMs: 18,
    edgeLocation: 'iad1 (Ashburn, US)',
    cacheStatus: 'HIT',
    timestamp: '11:24:41',
    dimensions: '1920×1080'
  },
  {
    id: 'tx-891023',
    sourceUrl: '/users/usr-alicia/avatar_raw.png',
    originalFormat: 'PNG',
    optimizedFormat: 'WebP',
    originalBytes: 1840291,
    optimizedBytes: 31200,
    reductionPercentage: 98.3,
    latencyMs: 12,
    edgeLocation: 'fra1 (Frankfurt, EU)',
    cacheStatus: 'HIT',
    timestamp: '11:24:28',
    dimensions: '256×256'
  },
  {
    id: 'tx-891022',
    sourceUrl: '/products/nordic-chair-lifestyle.png',
    originalFormat: 'PNG',
    optimizedFormat: 'AVIF',
    originalBytes: 3145728,
    optimizedBytes: 319200,
    reductionPercentage: 89.8,
    latencyMs: 34,
    edgeLocation: 'nrt1 (Tokyo, JP)',
    cacheStatus: 'MISS',
    timestamp: '11:24:02',
    dimensions: '600×600'
  },
  {
    id: 'tx-891021',
    sourceUrl: '/catalog/smartwatch-black-titanium.jpg',
    originalFormat: 'JPEG',
    optimizedFormat: 'AVIF',
    originalBytes: 1548200,
    optimizedBytes: 142090,
    reductionPercentage: 90.8,
    latencyMs: 14,
    edgeLocation: 'sjc1 (San Jose, US)',
    cacheStatus: 'HIT',
    timestamp: '11:23:44',
    dimensions: '800×800'
  },
  {
    id: 'tx-891020',
    sourceUrl: '/blog/covers/serverless-architecture-diagram.png',
    originalFormat: 'PNG',
    optimizedFormat: 'WebP',
    originalBytes: 2410880,
    optimizedBytes: 218400,
    reductionPercentage: 90.9,
    latencyMs: 22,
    edgeLocation: 'lhr1 (London, UK)',
    cacheStatus: 'REVALIDATED',
    timestamp: '11:23:15',
    dimensions: '1200×630'
  }
];

export const INITIAL_PIPELINE_METRICS: PipelineMetrics = {
  totalTranscodes24h: 142850,
  bandwidthSavedGb: 489.4,
  averageCompressionRate: 91.6,
  cacheHitRatio: 98.2,
  p95LatencyMs: 16.4,
  monthlyCostAvoidanceUsd: 1420.80
};

export const PLAYGROUND_SAMPLE_IMAGES = [
  {
    id: 'sample-datacenter',
    name: 'Cloud Infrastructure Rack',
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=85',
    originalBytes: 2190000,
    originalFormat: 'JPEG',
    originalDimensions: '1200×800'
  },
  {
    id: 'sample-portrait',
    name: 'Team Member Avatar',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85',
    originalBytes: 1420000,
    originalFormat: 'JPEG',
    originalDimensions: '800×1000'
  },
  {
    id: 'sample-product',
    name: 'Minimalist Industrial Hardware',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',
    originalBytes: 1850000,
    originalFormat: 'JPEG',
    originalDimensions: '1000×667'
  }
];
