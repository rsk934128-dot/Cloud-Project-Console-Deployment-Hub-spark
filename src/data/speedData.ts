import { CoreWebVital, RouteSpeedMetric, SpeedAudit, DeviceSpeedData } from '../types/speed';

export const INITIAL_VITALS: CoreWebVital[] = [
  {
    id: 'lcp',
    name: 'Largest Contentful Paint',
    shortName: 'LCP',
    value: 1.18,
    displayValue: '1.18s',
    unit: 's',
    status: 'good',
    thresholdGood: 2.5,
    thresholdPoor: 4.0,
    goodPercent: 92,
    needsImprovementPercent: 6,
    poorPercent: 2,
    description: 'Measures perceived loading speed and marks the point when the main content of the page has likely loaded.',
    recommendation: 'Hero images are properly preloaded with fetchpriority="high" and optimized through edge CDN caching.'
  },
  {
    id: 'inp',
    name: 'Interaction to Next Paint',
    shortName: 'INP',
    value: 48,
    displayValue: '48ms',
    unit: 'ms',
    status: 'good',
    thresholdGood: 200,
    thresholdPoor: 500,
    goodPercent: 96,
    needsImprovementPercent: 3,
    poorPercent: 1,
    description: 'Assesses overall responsiveness to user interactions like clicks, taps, and keypresses on the page.',
    recommendation: 'Main thread long tasks are split with scheduler.yield() or requestIdleCallback.'
  },
  {
    id: 'cls',
    name: 'Cumulative Layout Shift',
    shortName: 'CLS',
    value: 0.02,
    displayValue: '0.02',
    unit: '',
    status: 'good',
    thresholdGood: 0.1,
    thresholdPoor: 0.25,
    goodPercent: 98,
    needsImprovementPercent: 2,
    poorPercent: 0,
    description: 'Measures visual stability to prevent unexpected page layout shifts while content downloads.',
    recommendation: 'All dynamic media and ad containers reserve static aspect-ratio dimensions in CSS.'
  },
  {
    id: 'fcp',
    name: 'First Contentful Paint',
    shortName: 'FCP',
    value: 0.74,
    displayValue: '0.74s',
    unit: 's',
    status: 'good',
    thresholdGood: 1.8,
    thresholdPoor: 3.0,
    goodPercent: 94,
    needsImprovementPercent: 5,
    poorPercent: 1,
    description: 'Marks the time at which the first text or image is rendered on the screen by the browser.',
    recommendation: 'Critical CSS is inlined and server rendering is edge-cached.'
  },
  {
    id: 'ttfb',
    name: 'Time to First Byte',
    shortName: 'TTFB',
    value: 112,
    displayValue: '112ms',
    unit: 'ms',
    status: 'good',
    thresholdGood: 800,
    thresholdPoor: 1800,
    goodPercent: 91,
    needsImprovementPercent: 7,
    poorPercent: 2,
    description: 'Measures how long the browser has to wait before receiving the first byte of response data from the server.',
    recommendation: 'Global edge network cache serves HTML with stale-while-revalidate headers.'
  }
];

export const ROUTE_SPEED_DATA: RouteSpeedMetric[] = [
  {
    path: '/',
    score: 98,
    lcp: '1.04s',
    inp: '38ms',
    cls: '0.01',
    ttfb: '94ms',
    status: 'good',
    pageViews: 142500,
    deviceBias: 'desktop'
  },
  {
    path: '/dashboard',
    score: 95,
    lcp: '1.24s',
    inp: '52ms',
    cls: '0.03',
    ttfb: '128ms',
    status: 'good',
    pageViews: 89300,
    deviceBias: 'desktop'
  },
  {
    path: '/deployments',
    score: 92,
    lcp: '1.45s',
    inp: '64ms',
    cls: '0.04',
    ttfb: '142ms',
    status: 'good',
    pageViews: 38200,
    deviceBias: 'mixed'
  },
  {
    path: '/analytics',
    score: 91,
    lcp: '1.58s',
    inp: '78ms',
    cls: '0.05',
    ttfb: '135ms',
    status: 'good',
    pageViews: 24100,
    deviceBias: 'desktop'
  },
  {
    path: '/docs/api-reference',
    score: 97,
    lcp: '0.98s',
    inp: '32ms',
    cls: '0.01',
    ttfb: '82ms',
    status: 'good',
    pageViews: 19800,
    deviceBias: 'desktop'
  },
  {
    path: '/settings/security',
    score: 84,
    lcp: '2.10s',
    inp: '115ms',
    cls: '0.08',
    ttfb: '210ms',
    status: 'needs-improvement',
    pageViews: 11400,
    deviceBias: 'mixed'
  },
  {
    path: '/checkout/subscription',
    score: 79,
    lcp: '2.62s',
    inp: '148ms',
    cls: '0.12',
    ttfb: '264ms',
    status: 'needs-improvement',
    pageViews: 8900,
    deviceBias: 'mobile'
  }
];

export const SPEED_AUDITS: SpeedAudit[] = [
  {
    id: 'audit-1',
    title: 'Modern Image Formats (AVIF / WebP)',
    category: 'Images',
    impact: 'medium',
    estimatedSavings: '140 KB (-32%)',
    details: 'Serving images in next-gen formats like AVIF or WebP yields better compression than PNG or JPEG with equivalent fidelity.',
    affectedUrl: '/_next/image?url=%2Fassets%2Fhero-console.png'
  },
  {
    id: 'audit-2',
    title: 'Eliminate Unused JavaScript in Vendor Chunk',
    category: 'JavaScript',
    impact: 'medium',
    estimatedSavings: '84 KB (gzip)',
    details: 'Reduce unused rules from legacy polyfills and lodash imports by adopting tree-shaking native ES modules.',
    affectedUrl: '/static/chunks/vendor-bundle.c289f.js'
  },
  {
    id: 'audit-3',
    title: 'Preload Critical Web Fonts',
    category: 'Fonts',
    impact: 'low',
    estimatedSavings: '60ms LCP reduction',
    details: 'Use <link rel="preload" as="font"> to prioritize font binary downloads before style parsing completes.',
    affectedUrl: '/fonts/inter-latin-var.woff2'
  },
  {
    id: 'audit-4',
    title: 'Leverage Edge Stale-While-Revalidate Headers',
    category: 'Caching',
    impact: 'high',
    estimatedSavings: '180ms TTFB reduction',
    details: 'Configure s-maxage=3600, stale-while-revalidate=86400 on static JSON API responses to serve instant cached payloads.',
    affectedUrl: '/api/v1/projects/metadata'
  }
];

export const DEVICE_SPEED_DATA: DeviceSpeedData[] = [
  {
    device: 'Desktop',
    score: 97,
    share: 68,
    avgLcp: '1.08s',
    avgInp: '42ms',
    avgCls: '0.01'
  },
  {
    device: 'Mobile',
    score: 89,
    share: 27,
    avgLcp: '1.82s',
    avgInp: '86ms',
    avgCls: '0.04'
  },
  {
    device: 'Tablet',
    score: 93,
    share: 5,
    avgLcp: '1.34s',
    avgInp: '62ms',
    avgCls: '0.02'
  }
];
