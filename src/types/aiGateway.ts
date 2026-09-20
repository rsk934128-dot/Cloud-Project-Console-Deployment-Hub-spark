export type AIProvider = 'google_gemini' | 'anthropic' | 'openai' | 'groq' | 'mistral';

export type AIModelTier = 'production' | 'preview' | 'flash' | 'thinking' | 'custom';

export interface AIEndpointRoute {
  id: string;
  name: string;
  slug: string;
  description: string;
  primaryProvider: AIProvider;
  primaryModel: string;
  fallbackProvider?: AIProvider;
  fallbackModel?: string;
  status: 'active' | 'degraded' | 'paused';
  cachingEnabled: boolean;
  cacheTtlSeconds: number;
  rateLimitRpm: number;
  tokenBucketMax: number;
  tokensConsumed24h: number;
  requests24h: number;
  cacheHitRatio: number;
  avgLatencyMs: number;
  costEstimate24h: number;
  timeoutMs: number;
  retryCount: number;
}

export interface AIGatewayLog {
  id: string;
  timestamp: string;
  routeId: string;
  routeSlug: string;
  model: string;
  provider: AIProvider;
  status: '200_ok' | '429_rate_limit' | 'cached' | 'fallback_triggered' | '500_error';
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  cost: number;
  clientIp: string;
  cached: boolean;
}

export interface PromptTemplate {
  id: string;
  title: string;
  version: string;
  modelTarget: string;
  systemInstruction: string;
  defaultTemperature: number;
  tags: string[];
  lastUpdated: string;
}

export interface GuardrailRule {
  id: string;
  name: string;
  type: 'pii_masking' | 'toxic_language' | 'budget_ceiling' | 'semantic_injection';
  action: 'block' | 'sanitize' | 'alert';
  enabled: boolean;
  blockedCount24h: number;
  sensitivity: 'low' | 'medium' | 'strict';
}
