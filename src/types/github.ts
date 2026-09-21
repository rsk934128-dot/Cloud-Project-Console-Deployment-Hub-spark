export interface GitHubUser {
  id: string;
  login: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio: string;
  company?: string;
  location?: string;
  publicRepos: number;
  totalPrivateRepos: number;
  followers: number;
  following: number;
  connectedAt: string;
  tokenScope: string[];
  authMethod: 'oauth' | 'pat' | 'simulated';
}

export interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  language: string;
  languageColor: string;
  stars: number;
  forks: number;
  defaultBranch: string;
  isPrivate: boolean;
  updatedAt: string;
  htmlUrl: string;
  topics: string[];
  frameworkPreset: string;
  estimatedBuildTime: string;
  appType: 'fintech' | 'ai' | 'ecommerce' | 'saas' | 'devtool' | 'static';
}

export interface GitHubDeploymentConfig {
  repo: GitHubRepo;
  projectName: string;
  subdomain: string;
  domainSuffix: string;
  fullDomain: string;
  framework: string;
  branch: string;
  rootDir: string;
  buildCommand: string;
  outputDir: string;
  installCommand: string;
  envVars: Array<{ key: string; value: string; isSecret: boolean }>;
  region: string;
}

export interface DeploymentPipelineStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: string;
  logs: string[];
}

export interface GitHubAppConfig {
  owner: string;
  ownerHandle: string;
  appId: string;
  clientId: string;
  installationUrl?: string;
  authorizeUrl?: string;
  appName?: string;
  usesClientIdForTokens: boolean;
}

