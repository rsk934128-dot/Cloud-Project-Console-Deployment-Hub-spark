export type FirewallAction = 'block' | 'challenge' | 'rate_limit' | 'log';
export type ThreatCategory = 'sqli' | 'xss' | 'bot' | 'rate_limit' | 'path_traversal' | 'scanner';

export interface WafRule {
  id: string;
  name: string;
  description: string;
  expression: string;
  action: FirewallAction;
  hits24h: number;
  enabled: boolean;
  priority: number;
  updatedAt: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  ip: string;
  country: string;
  countryCode: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  category: ThreatCategory;
  categoryLabel: string;
  action: FirewallAction;
  matchedRule: string;
  userAgent: string;
}

export interface IpRuleItem {
  id: string;
  ipOrCidr: string;
  type: 'allow' | 'block';
  description: string;
  addedAt: string;
}

export interface OwaspProtectionItem {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'active' | 'monitoring' | 'disabled';
  sensitivity: 'standard' | 'high' | 'paranoid';
  blockedToday: number;
}
