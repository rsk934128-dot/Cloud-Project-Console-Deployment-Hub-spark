export type FlagType = 'boolean' | 'percentage' | 'multivariate' | 'json';
export type Environment = 'production' | 'staging' | 'preview';

export interface TargetingRule {
  id: string;
  attribute: string; // 'email', 'userId', 'country', 'plan', 'version'
  operator: 'equals' | 'contains' | 'in_list' | 'greater_than' | 'regex';
  values: string[];
  serveValue: any;
}

export interface FlagEnvironmentConfig {
  enabled: boolean;
  rolloutPercentage: number; // 0 - 100
  value: any;
  rules: TargetingRule[];
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  type: FlagType;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
  environments: Record<Environment, FlagEnvironmentConfig>;
  variants?: { id: string; name: string; value: any; weight: number }[];
}

export interface FlagAuditLog {
  id: string;
  flagKey: string;
  environment: Environment;
  action: string;
  user: string;
  timestamp: string;
  diffSummary: string;
}
