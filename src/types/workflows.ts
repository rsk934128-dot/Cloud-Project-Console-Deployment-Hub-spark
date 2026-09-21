export type WorkflowTriggerType = 'cron' | 'webhook' | 'event' | 'manual' | 'deployment';

export type StepActionType = 
  | 'http_request' 
  | 'microvm_exec' 
  | 'ai_inference' 
  | 'db_query' 
  | 'email_dispatch' 
  | 'delay_wait' 
  | 'transform';

export type WorkflowStatus = 'active' | 'paused' | 'draft';

export type ExecutionStatus = 'succeeded' | 'running' | 'failed' | 'cancelled' | 'pending';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  actionType: StepActionType;
  config: {
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    runtime?: string;
    script?: string;
    model?: string;
    prompt?: string;
    query?: string;
    recipient?: string;
    delaySeconds?: number;
    transformFn?: string;
    headers?: Record<string, string>;
  };
  timeoutSeconds: number;
  maxRetries: number;
  dependencies: string[]; // step IDs that must finish before this step runs
  parallelWith?: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: {
    type: WorkflowTriggerType;
    cronExpression?: string;
    cronDescription?: string;
    webhookPath?: string;
    eventTopic?: string;
  };
  steps: WorkflowStep[];
  concurrencyLimit: number;
  timeoutSeconds: number;
  createdAt: string;
  updatedAt: string;
  lastRunAt?: string;
  lastRunStatus?: ExecutionStatus;
  totalRuns: number;
  avgDurationMs: number;
  successRate: number; // e.g. 99.4
  tags: string[];
}

export interface StepExecutionResult {
  stepId: string;
  stepName: string;
  actionType: StepActionType;
  status: ExecutionStatus;
  startedAt: string;
  durationMs: number;
  attempt: number;
  inputPayload?: any;
  outputPayload?: any;
  error?: string;
  logs: string[];
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: ExecutionStatus;
  triggerType: WorkflowTriggerType;
  triggeredBy: string;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  inputPayload: Record<string, any>;
  outputPayload?: Record<string, any>;
  error?: string;
  stepResults: StepExecutionResult[];
}

export interface WorkflowTemplate {
  id: string;
  title: string;
  category: 'automation' | 'ai_pipeline' | 'ecommerce' | 'devops' | 'database';
  description: string;
  icon: string;
  triggerType: WorkflowTriggerType;
  stepCount: number;
  estimatedLatency: string;
  tags: string[];
  workflowDef: {
    name: string;
    description: string;
    trigger: {
      type: WorkflowTriggerType;
      cronExpression?: string;
      cronDescription?: string;
      webhookPath?: string;
      eventTopic?: string;
    };
    steps: WorkflowStep[];
    tags: string[];
  };
}
