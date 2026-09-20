import React, { useState, useMemo } from 'react';
import {
  ImagePipelinePreset,
  ImageTransformLog,
  PipelineMetrics,
  ImageFormat,
  ImageFit
} from '../types/imagePipeline';
import {
  INITIAL_PIPELINE_PRESETS,
  INITIAL_TRANSFORM_LOGS,
  INITIAL_PIPELINE_METRICS,
  PLAYGROUND_SAMPLE_IMAGES
} from '../data/imagePipelineData';
import {
  ImageIcon,
  Zap,
  Sliders,
  Layers,
  Activity,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  HardDrive,
  Filter,
  Plus,
  Trash2,
  Globe,
  SlidersHorizontal,
  Eye,
  Code2,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const ImagePipelineConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'studio' | 'presets' | 'logs' | 'responsive'>('studio');
  const [presets, setPresets] = useState<ImagePipelinePreset[]>(INITIAL_PIPELINE_PRESETS);
  const [logs, setLogs] = useState<ImageTransformLog[]>(INITIAL_TRANSFORM_LOGS);
  const [metrics, setMetrics] = useState<PipelineMetrics>(INITIAL_PIPELINE_METRICS);

  // Playground Studio State
  const [selectedSample, setSelectedSample] = useState(PLAYGROUND_SAMPLE_IMAGES[0]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [format, setFormat] = useState<ImageFormat>('avif');
  const [quality, setQuality] = useState<number>(80);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(0); // 0 means auto
  const [fit, setFit] = useState<ImageFit>('cover');
  const [stripMetadata, setStripMetadata] = useState<boolean>(true);
  const [smartCropFace, setSmartCropFace] = useState<boolean>(false);
  const [sharpness, setSharpness] = useState<number>(10);
  const [blurAmount, setBlurAmount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'optimized-only' | 'original-only'>('side-by-side');

  // Copy helper
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Cache purge state
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  // Add Preset modal state
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [newPresetForm, setNewPresetForm] = useState({
    name: '',
    description: '',
    pattern: '/assets/*',
    format: 'avif' as ImageFormat,
    quality: 80,
    width: 1200,
    height: 800,
    fit: 'cover' as ImageFit,
    stripMetadata: true,
    smartCropFace: false,
    sharpness: 10,
    maxAgeDays: 365
  });

  // Logs Filter
  const [logFilter, setLogFilter] = useState<'ALL' | 'HIT' | 'MISS' | 'REVALIDATED'>('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Active Source Image URL
  const activeImageUrl = customImageUrl.trim() || selectedSample.url;

  // Calculate simulated optimized payload based on format and quality
  const calculatedOptimized = useMemo(() => {
    const originalBytes = selectedSample.originalBytes;
    let factor = 0.15; // default for avif
    if (format === 'avif') factor = 0.09 + (quality / 100) * 0.10;
    else if (format === 'webp') factor = 0.14 + (quality / 100) * 0.12;
    else if (format === 'jpeg') factor = 0.35 + (quality / 100) * 0.30;
    else if (format === 'png') factor = 0.65;
    else factor = 0.11; // auto chooses avif/webp

    if (width > 0 && width < 1200) {
      factor *= (width / 1200);
    }

    if (blurAmount > 0) {
      factor *= 0.2; // LQIP placeholder is tiny
    }

    const estimatedBytes = Math.max(1200, Math.round(originalBytes * factor));
    const reductionPercent = Math.max(1, Math.min(99.4, ((originalBytes - estimatedBytes) / originalBytes) * 100));

    return {
      originalBytes,
      estimatedBytes,
      reductionPercent: reductionPercent.toFixed(1),
      latencyMs: Math.round(12 + Math.random() * 8)
    };
  }, [selectedSample, format, quality, width, blurAmount]);

  // Generated Edge Transformation URL
  const generatedCdnUrl = useMemo(() => {
    const params: string[] = [];
    params.push(`format=${format}`);
    params.push(`q=${quality}`);
    if (width > 0) params.push(`w=${width}`);
    if (height > 0) params.push(`h=${height}`);
    params.push(`fit=${fit}`);
    if (stripMetadata) params.push('metadata=none');
    if (smartCropFace) params.push('crop=face');
    if (sharpness > 0) params.push(`sharpen=${sharpness}`);
    if (blurAmount > 0) params.push(`blur=${blurAmount}`);

    return `https://assets.cloudmesh.run/cdn-cgi/image/${params.join(',')}/${encodeURIComponent(activeImageUrl)}`;
  }, [format, quality, width, height, fit, stripMetadata, smartCropFace, sharpness, blurAmount, activeImageUrl]);

  // Generated Picture Tag for Responsive Delivery
  const generatedPictureSnippet = useMemo(() => {
    const baseUrl = 'https://assets.cloudmesh.run/cdn-cgi/image';
    return `<picture>
  <!-- Modern AVIF with Next-Gen Compression -->
  <source type="image/avif" srcset="${baseUrl}/format=avif,w=640,q=${quality}/photo.jpg 640w, ${baseUrl}/format=avif,w=1280,q=${quality}/photo.jpg 1280w, ${baseUrl}/format=avif,w=1920,q=${quality}/photo.jpg 1920w" sizes="(max-width: 768px) 100vw, 1280px" />
  
  <!-- Universal WebP Fallback -->
  <source type="image/webp" srcset="${baseUrl}/format=webp,w=640,q=${quality}/photo.jpg 640w, ${baseUrl}/format=webp,w=1280,q=${quality}/photo.jpg 1280w" sizes="(max-width: 768px) 100vw, 1280px" />
  
  <!-- Legacy JPEG Fallback -->
  <img src="${baseUrl}/format=jpeg,w=1280,q=85/photo.jpg" alt="${selectedSample.name}" loading="lazy" decoding="async" width="${width || 1200}" height="${height || 800}" />
</picture>`;
  }, [quality, selectedSample.name, width, height]);

  // Handle Purge Cache
  const handlePurgeAllCache = () => {
    setIsPurging(true);
    setTimeout(() => {
      setIsPurging(false);
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    }, 1000);
  };

  // Handle Create Preset
  const handleCreatePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetForm.name.trim()) return;

    const newPreset: ImagePipelinePreset = {
      id: `preset-${Date.now().toString().slice(-6)}`,
      name: newPresetForm.name.trim(),
      description: newPresetForm.description.trim() || 'Custom CDN Edge Transformation Rule',
      pattern: newPresetForm.pattern.trim(),
      format: newPresetForm.format,
      quality: Number(newPresetForm.quality),
      width: Number(newPresetForm.width),
      height: Number(newPresetForm.height),
      fit: newPresetForm.fit,
      stripMetadata: newPresetForm.stripMetadata,
      smartCropFace: newPresetForm.smartCropFace,
      sharpness: Number(newPresetForm.sharpness),
      maxAgeDays: Number(newPresetForm.maxAgeDays)
    };

    setPresets(prev => [newPreset, ...prev]);
    setIsPresetModalOpen(false);
    setNewPresetForm({
      name: '',
      description: '',
      pattern: '/assets/*',
      format: 'avif',
      quality: 80,
      width: 1200,
      height: 800,
      fit: 'cover',
      stripMetadata: true,
      smartCropFace: false,
      sharpness: 10,
      maxAgeDays: 365
    });
  };

  // Delete preset
  const handleDeletePreset = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesFilter = logFilter === 'ALL' || log.cacheStatus === logFilter;
      const matchesSearch =
        log.sourceUrl.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.edgeLocation.toLowerCase().includes(logSearch.toLowerCase()) ||
        log.optimizedFormat.toLowerCase().includes(logSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [logs, logFilter, logSearch]);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${bytes} B`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" />
              Image Optimization Pipeline
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Edge Transcoding Active
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Global on-the-fly image transformation, AVIF/WebP next-gen compression, AI smart cropping, and responsive delivery at the edge.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handlePurgeAllCache}
            disabled={isPurging}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isPurging ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            ) : purgeSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
            )}
            {purgeSuccess ? 'Purged Edge Cache' : 'Purge Edge Cache'}
          </button>

          <button
            onClick={() => setIsPresetModalOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Transform Preset
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">24h Edge Transcodes</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {metrics.totalTranscodes24h.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>P95 Latency: {metrics.p95LatencyMs}ms</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Bandwidth Saved</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {metrics.bandwidthSavedGb} GB
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Average reduction: <strong className="text-emerald-400 font-normal">{metrics.averageCompressionRate}%</strong>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Edge Cache Hit Ratio</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {metrics.cacheHitRatio}%
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Tier-1 POP edge shielding
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Monthly Cost Avoidance</span>
            <HardDrive className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            ${metrics.monthlyCostAvoidanceUsd.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Reduced egress bandwidth spend
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('studio')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'studio'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Interactive Transform Studio
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'presets'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Routing Presets & Edge Rules
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {presets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('responsive')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'responsive'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          Responsive Breakpoints & &lt;picture&gt;
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Live Delivery Logs
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
            {logs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE TRANSFORM STUDIO */}
      {activeTab === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls Column (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Sample Asset Picker */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                  Source Asset
                </label>
                <span className="text-[10px] text-neutral-400 font-mono">Sample or Custom</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {PLAYGROUND_SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => {
                      setSelectedSample(sample);
                      setCustomImageUrl('');
                    }}
                    className={`relative rounded-lg overflow-hidden border text-left aspect-video transition-all ${
                      selectedSample.id === sample.id && !customImageUrl
                        ? 'border-indigo-500 ring-1 ring-indigo-500'
                        : 'border-neutral-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-white px-1 py-0.5 truncate text-center">
                      {sample.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-1">
                <span className="text-[11px] text-neutral-400">Or Paste Image URL</span>
                <input
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Edge Transform Parameters */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                  Transformation Parameters
                </span>
                <button
                  onClick={() => {
                    setFormat('avif');
                    setQuality(80);
                    setWidth(800);
                    setHeight(0);
                    setFit('cover');
                    setBlurAmount(0);
                    setSharpness(10);
                    setStripMetadata(true);
                    setSmartCropFace(false);
                  }}
                  className="text-[10px] text-neutral-400 hover:text-white transition-colors"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Output Format */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-300">Target Encoding</span>
                  <span className="font-mono text-indigo-400 uppercase text-[11px] font-bold">
                    {format === 'auto' ? 'Auto (AVIF > WebP)' : format}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {(['auto', 'avif', 'webp', 'jpeg', 'png'] as ImageFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setFormat(fmt)}
                      className={`py-1 rounded text-[10px] font-mono font-semibold uppercase transition-all ${
                        format === fmt
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-300">Compression Quality</span>
                  <span className="font-mono text-white text-[11px] font-bold">{quality}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-neutral-950 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                  <span>20% (Aggressive)</span>
                  <span>80% (Sweet Spot)</span>
                  <span>100% (Lossless)</span>
                </div>
              </div>

              {/* Width & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-300">Width (px)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-neutral-300">Height (0 = auto)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-1.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Fit Mode */}
              <div className="space-y-1.5">
                <label className="text-[11px] text-neutral-300">Resize Fit Strategy</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['cover', 'contain', 'inside'] as ImageFit[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFit(mode)}
                      className={`py-1 rounded text-[10px] font-mono capitalize transition-all ${
                        fit === mode
                          ? 'bg-neutral-800 text-white border border-neutral-700 font-semibold'
                          : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* LQIP Blur */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-300">Placeholder Blur (LQIP)</span>
                  <span className="font-mono text-neutral-400 text-[11px]">{blurAmount}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={blurAmount}
                  onChange={(e) => setBlurAmount(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-neutral-950 rounded-lg"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-neutral-800 text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-neutral-300">Strip EXIF / Privacy Metadata</span>
                  <input
                    type="checkbox"
                    checked={stripMetadata}
                    onChange={(e) => setStripMetadata(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-800 text-indigo-600 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-neutral-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Smart Crop (Face Detection)
                  </span>
                  <input
                    type="checkbox"
                    checked={smartCropFace}
                    onChange={(e) => setSmartCropFace(e.target.checked)}
                    className="rounded bg-neutral-950 border-neutral-800 text-indigo-600 focus:ring-0"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Preview & Live Analytics Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* View Mode & Live Delta Bar */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-neutral-400">View:</span>
                <div className="flex rounded-lg bg-neutral-950 p-0.5 border border-neutral-800 text-xs">
                  <button
                    onClick={() => setViewMode('side-by-side')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      viewMode === 'side-by-side' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    onClick={() => setViewMode('optimized-only')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      viewMode === 'optimized-only' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Optimized Only
                  </button>
                  <button
                    onClick={() => setViewMode('original-only')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      viewMode === 'original-only' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Original Only
                  </button>
                </div>
              </div>

              {/* Compression Delta Badge */}
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-neutral-400">{formatBytes(calculatedOptimized.originalBytes)}</span>
                <span className="text-neutral-500">→</span>
                <span className="text-white font-bold">{formatBytes(calculatedOptimized.estimatedBytes)}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  -{calculatedOptimized.reductionPercent}%
                </span>
                <span className="text-[10px] text-neutral-500">({calculatedOptimized.latencyMs}ms)</span>
              </div>
            </div>

            {/* Visual Canvas Comparison */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden p-4">
              {viewMode === 'side-by-side' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Image Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 font-medium">Original Asset (Uncompressed)</span>
                      <span className="font-mono text-[11px] text-neutral-500">{formatBytes(calculatedOptimized.originalBytes)}</span>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 aspect-video flex items-center justify-center">
                      <img
                        src={activeImageUrl}
                        alt="Original"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                        {selectedSample.originalFormat} • Original
                      </span>
                    </div>
                  </div>

                  {/* Optimized Image Box */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5" />
                        Edge Optimized
                      </span>
                      <span className="font-mono text-[11px] text-emerald-400 font-bold">
                        {formatBytes(calculatedOptimized.estimatedBytes)} (-{calculatedOptimized.reductionPercent}%)
                      </span>
                    </div>
                    <div className="relative rounded-lg overflow-hidden border border-emerald-500/30 bg-neutral-900 aspect-video flex items-center justify-center">
                      <img
                        src={activeImageUrl}
                        alt="Optimized"
                        style={{
                          filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
                          objectFit: fit === 'contain' ? 'contain' : 'cover'
                        }}
                        className="w-full h-full"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-emerald-950/80 text-[10px] font-mono text-emerald-300 border border-emerald-700/60 uppercase">
                        {format === 'auto' ? 'AVIF' : format} • Q={quality}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'optimized-only' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-medium">Edge Optimized Result</span>
                    <span className="font-mono text-[11px] text-emerald-400">{formatBytes(calculatedOptimized.estimatedBytes)}</span>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 max-h-[480px] flex items-center justify-center">
                    <img
                      src={activeImageUrl}
                      alt="Optimized Large"
                      style={{
                        filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined,
                        objectFit: fit === 'contain' ? 'contain' : 'cover'
                      }}
                      className="w-full h-full max-h-[480px] object-cover"
                    />
                  </div>
                </div>
              )}

              {viewMode === 'original-only' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium">Original Asset</span>
                    <span className="font-mono text-[11px] text-neutral-400">{formatBytes(calculatedOptimized.originalBytes)}</span>
                  </div>
                  <div className="rounded-lg overflow-hidden border border-neutral-800 bg-neutral-900 max-h-[480px] flex items-center justify-center">
                    <img
                      src={activeImageUrl}
                      alt="Original Large"
                      className="w-full h-full max-h-[480px] object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Generated CDN Transformation URL */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5 font-sans">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  Dynamic CDN Edge Transformation URL
                </span>
                <button
                  onClick={() => handleCopy(generatedCdnUrl, 'cdn-url')}
                  className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 font-sans bg-neutral-800 px-2.5 py-1 rounded border border-neutral-700 transition-colors"
                >
                  {copiedId === 'cdn-url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedId === 'cdn-url' ? 'Copied' : 'Copy URL'}
                </button>
              </div>

              <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-indigo-300 break-all select-all">
                {generatedCdnUrl}
              </div>

              <p className="text-[11px] text-neutral-400 font-sans">
                Requests through this URL are transcoded at edge POPs, automatically cached across 300+ global data centers, and served with <code className="text-neutral-300">Cache-Control: public, max-age=31536000, immutable</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROUTING PRESETS & EDGE RULES */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                Active Edge Transcoding Rules & Presets
              </h3>
              <p className="text-xs text-neutral-400">
                Pattern-matched routing paths automatically apply format negotiation, quality compression, and CDN cache headers.
              </p>
            </div>

            <button
              onClick={() => setIsPresetModalOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              New Preset Rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all shadow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{preset.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-950 text-indigo-400 border border-neutral-800">
                      {preset.format} (Q={preset.quality})
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400">{preset.description}</p>

                  <div className="p-2 bg-neutral-950 border border-neutral-800 rounded font-mono text-[11px] text-neutral-300 flex items-center justify-between">
                    <span>Pattern: <strong>{preset.pattern}</strong></span>
                    <span className="text-neutral-500">TTL: {preset.maxAgeDays}d</span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-neutral-400 pt-1">
                    <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">
                      Fit: {preset.fit}
                    </span>
                    {preset.width && (
                      <span className="px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800">
                        Max: {preset.width}×{preset.height || 'auto'}
                      </span>
                    )}
                    {preset.stripMetadata && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Strip Metadata
                      </span>
                    )}
                    {preset.smartCropFace && (
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        AI Face Crop
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-neutral-500 font-mono">ID: {preset.id}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFormat(preset.format);
                        setQuality(preset.quality);
                        if (preset.width) setWidth(preset.width);
                        if (preset.height) setHeight(preset.height);
                        setFit(preset.fit);
                        setStripMetadata(preset.stripMetadata);
                        setSmartCropFace(preset.smartCropFace);
                        setActiveTab('studio');
                      }}
                      className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Test in Studio
                    </button>
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Delete Preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RESPONSIVE BREAKPOINTS & PICTURE SNIPPET */}
      {activeTab === 'responsive' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-emerald-400" />
              Automated Modern Responsive &lt;picture&gt; Markup
            </h3>
            <p className="text-xs text-neutral-400">
              Copy and paste ready HTML responsive image elements with fallback cascades (AVIF → WebP → JPEG) and width breakpoints for Core Web Vitals (LCP & CLS).
            </p>
          </div>

          <div className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden font-mono shadow-2xl">
            <div className="px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>ResponsivePictureSnippet.html</span>
              </div>
              <button
                onClick={() => handleCopy(generatedPictureSnippet, 'picture-code')}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors flex items-center gap-1.5 font-sans"
              >
                {copiedId === 'picture-code' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedId === 'picture-code' ? 'Copied HTML' : 'Copy HTML Snippet'}
              </button>
            </div>

            <pre className="p-4 text-xs text-emerald-300 leading-relaxed overflow-x-auto">
              {generatedPictureSnippet}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1">
              <span className="text-xs font-semibold text-white">Device Pixel Ratio (DPR)</span>
              <p className="text-[11px] text-neutral-400">
                Supports <code className="text-indigo-300">dpr=1</code>, <code className="text-indigo-300">dpr=2</code> (Retina), and <code className="text-indigo-300">dpr=3</code> query params automatically.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1">
              <span className="text-xs font-semibold text-white">Save-Data Header Aware</span>
              <p className="text-[11px] text-neutral-400">
                When client sends <code className="text-indigo-300">Save-Data: on</code>, edge automatically reduces quality by 30% and forces AVIF.
              </p>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3.5 space-y-1">
              <span className="text-xs font-semibold text-white">Zero Cumulative Layout Shift (CLS)</span>
              <p className="text-[11px] text-neutral-400">
                Explicit width/height bounding attributes prevent layout reflow during edge image hydration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REAL-TIME DELIVERY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
            <input
              type="text"
              placeholder="Search by asset URL or edge POP location..."
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 font-mono flex-1"
            />

            <div className="flex items-center gap-2">
              {(['ALL', 'HIT', 'MISS', 'REVALIDATED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setLogFilter(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-colors ${
                    logFilter === status
                      ? 'bg-neutral-800 text-white border border-neutral-700'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-950 border-b border-neutral-800 text-neutral-400 text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5">Time</th>
                    <th className="px-4 py-2.5">Asset URL</th>
                    <th className="px-4 py-2.5">Format</th>
                    <th className="px-4 py-2.5">Dimensions</th>
                    <th className="px-4 py-2.5">Payload Delta</th>
                    <th className="px-4 py-2.5">Edge POP</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="px-4 py-2.5 text-neutral-400">{log.timestamp}</td>
                      <td className="px-4 py-2.5 text-neutral-200 max-w-[260px] truncate font-medium">
                        {log.sourceUrl}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="text-neutral-500">{log.originalFormat}</span>
                        <span className="text-neutral-600 mx-1">→</span>
                        <span className="text-indigo-400 font-bold">{log.optimizedFormat}</span>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-400">{log.dimensions}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-400">{formatBytes(log.optimizedBytes)}</span>
                          <span className="text-[10px] text-emerald-400 font-bold">(-{log.reductionPercentage}%)</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-300">{log.edgeLocation}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.cacheStatus === 'HIT'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : log.cacheStatus === 'MISS'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {log.cacheStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-neutral-400">{log.latencyMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PRESET MODAL */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Configure Edge Transcode Rule
              </h3>
              <button
                onClick={() => setIsPresetModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePreset} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Preset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gallery High-Def Showcase"
                  value={newPresetForm.name}
                  onChange={(e) => setNewPresetForm({ ...newPresetForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">URL Matching Pattern</label>
                <input
                  type="text"
                  required
                  placeholder="/gallery/* or /media/banners/*"
                  value={newPresetForm.pattern}
                  onChange={(e) => setNewPresetForm({ ...newPresetForm, pattern: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Target Format</label>
                  <select
                    value={newPresetForm.format}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, format: e.target.value as ImageFormat })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="auto">Auto (AVIF &gt; WebP)</option>
                    <option value="avif">AVIF (Maximum Compression)</option>
                    <option value="webp">WebP (Broad Compatibility)</option>
                    <option value="jpeg">JPEG</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Quality ({newPresetForm.quality}%)</label>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={newPresetForm.quality}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, quality: Number(e.target.value) })}
                    className="w-full accent-indigo-500 mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Width (px)</label>
                  <input
                    type="number"
                    value={newPresetForm.width}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, width: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Height (px)</label>
                  <input
                    type="number"
                    value={newPresetForm.height}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, height: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Cache TTL (Days)</label>
                  <input
                    type="number"
                    value={newPresetForm.maxAgeDays}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, maxAgeDays: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPresetForm.stripMetadata}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, stripMetadata: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-800 text-indigo-600"
                  />
                  <span className="text-neutral-300">Strip EXIF and location metadata</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPresetForm.smartCropFace}
                    onChange={(e) => setNewPresetForm({ ...newPresetForm, smartCropFace: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-800 text-indigo-600"
                  />
                  <span className="text-neutral-300">Enable Smart AI Face Cropping</span>
                </label>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPresetModalOpen(false)}
                  className="px-3 py-1.5 text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-lg"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
