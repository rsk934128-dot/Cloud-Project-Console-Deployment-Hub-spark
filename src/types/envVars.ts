export type TargetEnvironment = 'Production' | 'Preview' | 'Development';
export type VariableType = 'secret' | 'plain' | 'system';

export interface EnvVariableItem {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
  environments: TargetEnvironment[];
  type: VariableType;
  updatedAt: string;
  updatedBy: string;
  projectId: string;
  projectName: string;
  comment?: string;
}

export interface SecretAuditLog {
  id: string;
  variableKey: string;
  action: 'revealed' | 'updated' | 'created' | 'deleted' | 'exported';
  user: string;
  timestamp: string;
  ip: string;
  environment: TargetEnvironment;
}
