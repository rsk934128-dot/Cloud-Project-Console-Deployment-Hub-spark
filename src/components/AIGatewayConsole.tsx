import React, { useState, useMemo } from 'react';
import {
  AIEndpointRoute,
  AIGatewayLog,
  PromptTemplate,
  GuardrailRule,
  AIProvider
} from '../types/aiGateway';
import {
  INITIAL_AI_ROUTES,
  INITIAL_GATEWAY_LOGS,
  INITIAL_GUARDRAILS,
  INITIAL_PROMPT_TEMPLATES
} from '../data/aiGatewayData';
import {
  Cpu,
  Zap,
  Activity,
  Shield,
  Layers,
  Sparkles,
  Server,
  Play,
  RotateCcw,
  Copy,
  Check,
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Clock,
  Code2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ChevronRight,
  Lock,
  RefreshCw,
  Terminal,
  FileText,
  CornerDownRight,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Database
} from 'lucide-react';

export const AIGatewayConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routes' | 'playground' | 'logs' | 'guardrails' | 'templates'>('routes');
  const [routes, setRoutes] = useState<AIEndpointRoute[]>(INITIAL_AI_ROUTES);
  const [logs, setLogs] = useState<AIGatewayLog[]>(INITIAL_GATEWAY_LOGS);
  const [guardrails, setGuardrails] = useState<GuardrailRule[]>(INITIAL_GUARDRAILS);
  const [templates, setTemplates] = useState<PromptTemplate[]>(INITIAL_PROMPT_TEMPLATES);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<AIEndpointRoute | null>(null);

  // Create Route Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRouteForm, setNewRouteForm] = useState({
    name: '',
    slug: '',
    description: '',
    primaryModel: 'gemini-3.8-flash',
    fallbackModel: 'gemini-3.1-flash-lite',
    cachingEnabled: true,
    cacheTtlSeconds: 3600,
    rateLimitRpm: 600,
    tokenBucketMax: 1500000
  });

  // Playground state
  const [playModel, setPlayModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.8-flash');
  const [playPrompt, setPlayPrompt] = useState('Analyze the root cause of an HTTP 504 Gateway Timeout spike during peak traffic on Anycast edge nodes.');
  const [playSystemInstruction, setPlaySystemInstruction] = useState('You are an expert Cloud & AI SRE. Provide a concise, actionable 3-point diagnostic checklist with code fixes.');
  const [playTemperature, setPlayTemperature] = useState(0.7);
  const [playStreaming, setPlayStreaming] = useState(true);
  const [playCaching, setPlayCaching] = useState(true);
  const [isPlaygroundRunning, setIsPlaygroundRunning] = useState(false);
  const [playResponse, setPlayResponse] = useState<string | null>(null);
  const [playMetrics, setPlayMetrics] = useState<{
    latencyMs: number;
    promptTokens: number;
    completionTokens: number;
    cached: boolean;
    cost: number;
    provider: string;
  } | null>(null);

  // Copy helper
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run Playground Test Simulation / Live proxy
  const handleRunPlayground = () => {
    setIsPlaygroundRunning(true);
    setPlayResponse('');
    setPlayMetrics(null);

    // Simulate high-speed AI Gateway Edge Proxy
    const isCachedRequest = playCaching && playPrompt.toLowerCase().includes('504');
    const latency = isCachedRequest ? 18 : Math.floor(220 + Math.random() * 180);

    setTimeout(() => {
      const generatedAnswer = `### Cloudmesh Edge AI Diagnostic Checklist

1. **VPC Ingress Socket Depletion (Root Cause #1)**:
   - When requests spike beyond concurrency limits, upstream database connection pools queue connections until the 15,000ms threshold fails.
   - **Fix**: Mount PgBouncer connection pooling or scale \`POOL_MAX_CLIENTS=250\` in Environment Variables.

2. **Anycast POP Transit Congestion**:
   - Verify BGP failover health across the Ashburn (\`iad1\`) and Richmond (\`ric1\`) transit providers using the Network Command CLI:
   \`\`\`bash
   curl -I https://api.cloudmesh.io/v1/health/iad1 -H "x-cloudmesh-trace-id: 9a7b-881c"
   \`\`\`

3. **Circuit Breaker Fallback**:
   - The AI Gateway automatically redirected 3.4% of overflow inference to Gemini 3.1 Flash Lite with sub-30ms TTL cache activation.`;

      setPlayResponse(generatedAnswer);
      const promptToks = Math.round(playPrompt.length / 3.5);
      const compToks = Math.round(generatedAnswer.length / 3.8);

      const newLog: AIGatewayLog = {
        id: `log-${Math.floor(10000 + Math.random() * 90000)}`,
        timestamp: 'Just now',
        routeId: 'route_gemini_prod',
        routeSlug: '/v1/ai/generate',
        model: playModel,
        provider: 'google_gemini',
        status: isCachedRequest ? 'cached' : '200_ok',
        promptTokens: promptToks,
        completionTokens: compToks,
        totalTokens: promptToks + compToks,
        latencyMs: latency,
        cost: isCachedRequest ? 0 : 0.000045,
        clientIp: '198.51.100.22',
        cached: isCachedRequest
      };

      setLogs(prev => [newLog, ...prev]);
      setPlayMetrics({
        latencyMs: latency,
        promptTokens: promptToks,
        completionTokens: compToks,
        cached: isCachedRequest,
        cost: isCachedRequest ? 0 : 0.000045,
        provider: 'Google Gemini (Anycast V8 Proxy)'
      });
      setIsPlaygroundRunning(false);
    }, latency);
  };

  // Toggle Route status
  const handleToggleRoute = (routeId: string) => {
    setRoutes(prev =>
      prev.map(r => {
        if (r.id !== routeId) return r;
        const nextStatus = r.status === 'active' ? 'paused' : 'active';
        return { ...r, status: nextStatus };
      })
    );
  };

  // Toggle Guardrail
  const handleToggleGuardrail = (guardId: string) => {
    setGuardrails(prev =>
      prev.map(g => (g.id === guardId ? { ...g, enabled: !g.enabled } : g))
    );
  };

  // Create new route
  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteForm.name.trim() || !newRouteForm.slug.trim()) return;

    let slug = newRouteForm.slug.trim();
    if (!slug.startsWith('/')) slug = `/${slug}`;

    const newRoute: AIEndpointRoute = {
      id: `route_${Date.now()}`,
      name: newRouteForm.name.trim(),
      slug,
      description: newRouteForm.description.trim() || 'Custom AI endpoint route proxy',
      primaryProvider: 'google_gemini',
      primaryModel: newRouteForm.primaryModel,
      fallbackProvider: 'google_gemini',
      fallbackModel: newRouteForm.fallbackModel,
      status: 'active',
      cachingEnabled: newRouteForm.cachingEnabled,
      cacheTtlSeconds: Number(newRouteForm.cacheTtlSeconds),
      rateLimitRpm: Number(newRouteForm.rateLimitRpm),
      tokenBucketMax: Number(newRouteForm.tokenBucketMax),
      tokensConsumed24h: 0,
      requests24h: 0,
      cacheHitRatio: 0,
      avgLatencyMs: 290,
      costEstimate24h: 0.0,
      timeoutMs: 15000,
      retryCount: 2
    };

    setRoutes(prev => [newRoute, ...prev]);
    setIsCreateModalOpen(false);
    setNewRouteForm({
      name: '',
      slug: '',
      description: '',
      primaryModel: 'gemini-3.8-flash',
      fallbackModel: 'gemini-3.1-flash-lite',
      cachingEnabled: true,
      cacheTtlSeconds: 3600,
      rateLimitRpm: 600,
      tokenBucketMax: 1500000
    });
  };

  // Metrics summary
  const totalRequests24h = useMemo(() => routes.reduce((acc, r) => acc + r.requests24h, 0), [routes]);
  const totalTokens24h = useMemo(() => routes.reduce((acc, r) => acc + r.tokensConsumed24h, 0), [routes]);
  const avgHitRatio = useMemo(() => {
    const activeWithRatio = routes.filter(r => r.cachingEnabled);
    if (!activeWithRatio.length) return 0;
    return (activeWithRatio.reduce((acc, r) => acc + r.cacheHitRatio, 0) / activeWithRatio.length).toFixed(1);
  }, [routes]);
  const totalSpend24h = useMemo(() => routes.reduce((acc, r) => acc + r.costEstimate24h, 0).toFixed(2), [routes]);

  // Filter routes
  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return routes;
    return routes.filter(
      r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.primaryModel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [routes, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              AI Gateway & Inference Mesh
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Anycast V8 Low Latency
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Enterprise unified proxy for Google Gemini & LLMs with semantic edge caching, automatic token circuit breakers, and rate limiting.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setActiveTab('playground')}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-purple-400" />
            Live Playground
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New AI Route
          </button>
        </div>
      </div>

      {/* KPI Metric Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">24h Inferences</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {totalRequests24h.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs yesterday</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Edge Semantic Cache Hit</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {avgHitRatio}%
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Sub-20ms instant cache responses
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Tokens Processed</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            {(totalTokens24h / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Gemini 3.8 Flash + Pro models
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">24h Estimated Cost</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">
            ${totalSpend24h}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            <span>Saved ~$4.30 via caching</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('routes')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'routes'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Endpoint Routes
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {routes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('playground')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'playground'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Play className="w-4 h-4" />
          Gateway Playground
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Live Request Logs
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {logs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('guardrails')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'guardrails'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          Safety & Guardrails
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {guardrails.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Prompt Registry
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {templates.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ENDPOINT ROUTES */}
      {activeTab === 'routes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search endpoints by route name, slug, or target model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <span>{filteredRoutes.length} Active Proxies</span>
            </div>
          </div>

          <div className="space-y-3">
            {filteredRoutes.map((route) => {
              const isPaused = route.status === 'paused';
              return (
                <div
                  key={route.id}
                  className={`bg-neutral-900 border ${
                    isPaused ? 'border-neutral-800 opacity-60' : 'border-neutral-800 hover:border-neutral-700'
                  } transition-all rounded-xl p-4 shadow-xs`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{route.name}</span>
                        <span className="px-2 py-0.2 rounded text-[11px] font-mono bg-neutral-950 text-purple-400 border border-neutral-800">
                          {route.slug}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                            route.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}
                        >
                          {route.status}
                        </span>

                        {route.cachingEnabled && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5" />
                            Cache: {route.cacheHitRatio}% Hit
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-neutral-400 line-clamp-1">{route.description}</p>

                      <div className="flex items-center gap-4 text-[11px] text-neutral-500 pt-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-400">Primary:</span>
                          <span className="font-mono text-neutral-200 font-semibold">{route.primaryModel}</span>
                        </div>

                        {route.fallbackModel && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-neutral-500">Fallback:</span>
                            <span className="font-mono text-neutral-400">{route.fallbackModel}</span>
                          </div>
                        )}

                        <span>•</span>
                        <span>Avg Latency: <strong className="font-mono text-white">{route.avgLatencyMs}ms</strong></span>
                        <span>•</span>
                        <span>Rate Limit: <strong className="font-mono text-neutral-300">{route.rateLimitRpm} RPM</strong></span>
                      </div>
                    </div>

                    {/* Right: Metrics & Actions */}
                    <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-neutral-800 pt-3 lg:pt-0 lg:pl-5 shrink-0 justify-between lg:justify-end">
                      <div className="grid grid-cols-2 gap-3 text-right text-xs font-mono">
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase">24h Calls</div>
                          <div className="text-white font-bold">{route.requests24h.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-neutral-500 uppercase">Est. Spend</div>
                          <div className="text-emerald-400 font-bold">${route.costEstimate24h.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPlayModel(route.primaryModel as any);
                            setActiveTab('playground');
                          }}
                          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 text-purple-400" />
                          Test
                        </button>

                        <button
                          onClick={() => handleToggleRoute(route.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            route.status === 'active'
                              ? 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                              : 'border-emerald-800/40 text-emerald-400 bg-emerald-500/10'
                          }`}
                          title={route.status === 'active' ? 'Pause Route' : 'Activate Route'}
                        >
                          {route.status === 'active' ? (
                            <ToggleRight className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-neutral-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Integration Code Snippet */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-purple-400" />
                Using Cloudmesh AI Gateway in your Code
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    `import { GoogleGenAI } from "@google/genai";\n\n// Point through the unified edge AI Gateway with automatic retry\nconst ai = new GoogleGenAI({\n  apiKey: process.env.GEMINI_API_KEY,\n  httpOptions: {\n    baseUrl: "https://gateway.cloudmesh.io/v1/ai",\n    headers: { "x-cloudmesh-route": "route_gemini_prod" }\n  }\n});`,
                    'snippet'
                  )
                }
                className="text-purple-400 hover:text-purple-300 font-mono text-[11px] flex items-center gap-1"
              >
                {copiedKey === 'snippet' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy SDK Code
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-[11px] font-mono text-neutral-300 overflow-x-auto leading-relaxed">
              <code>{`import { GoogleGenAI } from "@google/genai";

// Connect via Cloudmesh Anycast AI Gateway for semantic caching and fallbacks:
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    baseUrl: "https://gateway.cloudmesh.io/v1/ai",
    headers: { 
      "x-cloudmesh-route": "route_gemini_prod",
      "x-cloudmesh-cache": "true"
    }
  }
});`}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE PLAYGROUND */}
      {activeTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input & Config (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-xs font-semibold text-white flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-purple-400" />
                  Edge Inference Simulator
                </h3>
                <span className="text-[11px] font-mono text-neutral-400">
                  Target: /v1/ai/generate
                </span>
              </div>

              {/* Model Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400">Target Gemini Model</label>
                <select
                  value={playModel}
                  onChange={(e) => setPlayModel(e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                >
                  <option value="gemini-3.8-flash">gemini-3.8-flash (General, High-Speed & Low Latency)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Cost Optimized, Ultra-lightweight)</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex Reasoning & STEM)</option>
                </select>
              </div>

              {/* System Instruction */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400">System Instruction</label>
                <textarea
                  rows={2}
                  value={playSystemInstruction}
                  onChange={(e) => setPlaySystemInstruction(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                />
              </div>

              {/* User Prompt */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-neutral-400">User Prompt</label>
                <textarea
                  rows={4}
                  value={playPrompt}
                  onChange={(e) => setPlayPrompt(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                />
              </div>

              {/* Switches */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
                  <div>
                    <div className="text-white font-medium">Semantic Caching</div>
                    <div className="text-[10px] text-neutral-500">Sub-20ms edge hits</div>
                  </div>
                  <button
                    onClick={() => setPlayCaching(!playCaching)}
                    className="text-neutral-400 hover:text-white"
                  >
                    {playCaching ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-neutral-600" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs">
                  <div>
                    <div className="text-white font-medium">Auto-Failover</div>
                    <div className="text-[10px] text-neutral-500">Route on 429 spike</div>
                  </div>
                  <ToggleRight className="w-5 h-5 text-purple-400" />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-neutral-500 font-mono">
                  Prompt: ~{Math.round(playPrompt.length / 3.5)} tokens
                </span>

                <button
                  onClick={handleRunPlayground}
                  disabled={isPlaygroundRunning || !playPrompt.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isPlaygroundRunning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Routing Request...
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Send to AI Gateway
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Response Output & Telemetry (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-4 min-h-[460px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <h3 className="text-xs font-semibold text-white">Inference Response Output</h3>
                  {playMetrics && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        playMetrics.cached
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {playMetrics.cached ? '⚡ EDGE CACHE HIT' : '🚀 200 OK'}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="pt-3">
                  {playResponse ? (
                    <div className="text-xs text-neutral-200 leading-relaxed space-y-2 font-sans bg-neutral-950 p-3.5 rounded-lg border border-neutral-800 max-h-[320px] overflow-y-auto">
                      <div className="whitespace-pre-wrap">{playResponse}</div>
                    </div>
                  ) : (
                    <div className="py-20 text-center text-xs text-neutral-500 space-y-2">
                      <Cpu className="w-8 h-8 mx-auto text-neutral-700" />
                      <p>Send a prompt from the left panel to test latency, edge caching, and token metering.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Telemetry Card */}
              {playMetrics && (
                <div className="pt-3 border-t border-neutral-800 bg-neutral-950/60 p-3 rounded-lg border border-neutral-850 space-y-2 text-xs font-mono">
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Gateway Telemetry</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-neutral-500 text-[10px]">Latency</div>
                      <div className="text-white font-bold">{playMetrics.latencyMs} ms</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[10px]">Tokens</div>
                      <div className="text-white font-bold">{playMetrics.promptTokens + playMetrics.completionTokens}</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[10px]">Cost</div>
                      <div className="text-emerald-400 font-bold">${playMetrics.cost.toFixed(6)}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate pt-1 border-t border-neutral-800/60">
                    Upstream: {playMetrics.provider}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE GATEWAY LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950/40 flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Live AI Edge Gateway Requests</span>
              <span className="text-neutral-400 font-mono text-[11px]">Real-time audit stream</span>
            </div>

            <div className="divide-y divide-neutral-800">
              {logs.map((log) => (
                <div key={log.id} className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-neutral-850 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-neutral-400 text-[11px]">{log.timestamp}</span>
                      <span className="font-mono font-bold text-white">{log.routeSlug}</span>

                      <span
                        className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                          log.status === 'cached'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.status === '200_ok'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {log.status.replace(/_/g, ' ')}
                      </span>

                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-neutral-950 text-neutral-400 border border-neutral-800">
                        {log.model}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-neutral-500 font-mono">
                      <span>IP: {log.clientIp}</span>
                      <span>•</span>
                      <span>Prompt: {log.promptTokens} tok</span>
                      <span>•</span>
                      <span>Completion: {log.completionTokens} tok</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 font-mono text-xs text-right">
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase">Duration</div>
                      <div className={`font-bold ${log.cached ? 'text-emerald-400' : 'text-white'}`}>
                        {log.latencyMs} ms
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase">Billed</div>
                      <div className="text-neutral-300">
                        {log.cost === 0 ? 'Free (Cached)' : `$${log.cost.toFixed(6)}`}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SAFETY & GUARDRAILS */}
      {activeTab === 'guardrails' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Automated AI Guardrails & Circuit Breakers
            </h3>
            <p className="text-xs text-neutral-400">
              Inspect user inputs and LLM outputs at edge layer before forwarding to model providers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guardrails.map((rule) => (
              <div
                key={rule.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{rule.name}</span>
                    <button
                      onClick={() => handleToggleGuardrail(rule.id)}
                      className="text-neutral-400 hover:text-white"
                    >
                      {rule.enabled ? (
                        <ToggleRight className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-neutral-600" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800 uppercase">
                      Action: {rule.action}
                    </span>
                    <span className="text-neutral-500">Sensitivity: {rule.sensitivity}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Interceptions (24h):</span>
                  <span className="text-amber-400 font-bold">{rule.blockedCount24h} threats neutralized</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PROMPT REGISTRY */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
            <h3 className="text-xs font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              Versioned Prompt Registry & System Instructions
            </h3>
            <p className="text-xs text-neutral-400">
              Decouple prompt engineering from application code. Version and update system instructions with zero downtime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{tmpl.title}</span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-neutral-950 text-purple-400 border border-neutral-800">
                      {tmpl.version}
                    </span>
                  </div>

                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 leading-relaxed">
                    {tmpl.systemInstruction}
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                  <span>Target: <strong className="font-mono text-neutral-300">{tmpl.modelTarget}</strong></span>
                  <button
                    onClick={() => {
                      setPlaySystemInstruction(tmpl.systemInstruction);
                      setPlayModel(tmpl.modelTarget as any);
                      setActiveTab('playground');
                    }}
                    className="text-purple-400 hover:underline flex items-center gap-1"
                  >
                    Open in Playground <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE ROUTE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Configure New AI Gateway Route
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoute} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Route Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Storefront Customer Search Proxy"
                  value={newRouteForm.name}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-medium">Endpoint URL Slug</label>
                <input
                  type="text"
                  required
                  placeholder="/v1/ai/storefront-search"
                  value={newRouteForm.slug}
                  onChange={(e) => setNewRouteForm({ ...newRouteForm, slug: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Primary Model</label>
                  <select
                    value={newRouteForm.primaryModel}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, primaryModel: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="gemini-3.8-flash">gemini-3.8-flash</option>
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                    <option value="gemini-3.1-flash-lite-image">gemini-3.1-flash-lite-image</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Fallback Model (Circuit Breaker)</label>
                  <select
                    value={newRouteForm.fallbackModel}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, fallbackModel: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none"
                  >
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                    <option value="gemini-3.8-flash">gemini-3.8-flash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Rate Limit (RPM)</label>
                  <input
                    type="number"
                    value={newRouteForm.rateLimitRpm}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, rateLimitRpm: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-medium">Cache TTL (Seconds)</label>
                  <input
                    type="number"
                    value={newRouteForm.cacheTtlSeconds}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, cacheTtlSeconds: Number(e.target.value) })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold"
                >
                  Deploy AI Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
