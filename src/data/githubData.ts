import { GitHubUser, GitHubRepo, GitHubAppConfig } from '../types/github';

export const GITHUB_APP_CONFIG: GitHubAppConfig = {
  owner: 'rsk934128-dot',
  ownerHandle: '@rsk934128-dot',
  appId: '5019732',
  clientId: 'Iv23lid9y3Nvy06uq3AA',
  appName: 'CloudHub Edge Deployment Suite',
  authorizeUrl: 'https://github.com/login/oauth/authorize?client_id=Iv23lid9y3Nvy06uq3AA&scope=repo,read:user,user:email,workflow',
  installationUrl: 'https://github.com/settings/apps',
  usesClientIdForTokens: true
};

export const DEFAULT_GITHUB_USER: GitHubUser = {
  id: 'gh-934128',
  login: 'rsk934128-dot',
  name: 'Rubel S.',
  email: 'rasadsk007@gmail.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
  bio: 'Full Stack Cloud Architect & Web3 Developer. Building high-availability edge microservices.',
  company: 'CloudHub Systems',
  location: 'Dhaka, Bangladesh',
  publicRepos: 18,
  totalPrivateRepos: 6,
  followers: 142,
  following: 89,
  connectedAt: '2026-09-15',
  tokenScope: ['repo', 'read:user', 'workflow', 'admin:repo_hook'],
  authMethod: 'oauth'
};

export const DOMAIN_SUFFIX_OPTIONS = [
  'cloudhub.app',
  'vercel.app',
  'edgecloud.live',
  'deploy.sh'
];

export const FRAMEWORK_PRESETS = [
  { id: 'nextjs', name: 'Next.js 14 / App Router', defaultBuild: 'next build', defaultOutput: '.next', defaultInstall: 'pnpm install' },
  { id: 'react_vite', name: 'React + Vite', defaultBuild: 'vite build', defaultOutput: 'dist', defaultInstall: 'npm install' },
  { id: 'astro', name: 'Astro 4.x', defaultBuild: 'astro build', defaultOutput: 'dist', defaultInstall: 'npm install' },
  { id: 'remix', name: 'Remix Run', defaultBuild: 'remix build', defaultOutput: 'build', defaultInstall: 'npm install' },
  { id: 'sveltekit', name: 'SvelteKit 2', defaultBuild: 'vite build', defaultOutput: '.svelte-kit/output', defaultInstall: 'npm install' },
  { id: 'static_html', name: 'Static HTML / Vanilla', defaultBuild: 'echo "Ready"', defaultOutput: '.', defaultInstall: 'echo "No deps"' }
];

export const REGIONS_LIST = [
  { id: 'iad1', name: 'US East (N. Virginia - iad1)', flag: '🇺🇸', latency: '12ms' },
  { id: 'fra1', name: 'Europe (Frankfurt - fra1)', flag: '🇩🇪', latency: '24ms' },
  { id: 'hnd1', name: 'Asia East (Tokyo - hnd1)', flag: '🇯🇵', latency: '18ms' },
  { id: 'sin1', name: 'Asia South (Singapore - sin1)', flag: '🇸🇬', latency: '28ms' },
  { id: 'global', name: 'Global Anycast Edge Network (300+ PoPs)', flag: '🌐', latency: '<15ms' }
];

export const CURATED_GITHUB_REPOS: GitHubRepo[] = [
  {
    id: 'repo-1',
    name: 'FinTech-Web3-Developer-Hub',
    fullName: 'rsk934128-dot/FinTech-Web3-Developer-Hub',
    description: 'Decentralized cryptocurrency portfolio tracker, automated DEX swap aggregator & institutional treasury dashboard.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 84,
    forks: 19,
    defaultBranch: 'main',
    isPrivate: false,
    updatedAt: '35 mins ago',
    htmlUrl: 'https://github.com/rsk934128-dot/FinTech-Web3-Developer-Hub',
    topics: ['web3', 'fintech', 'nextjs', 'tailwind', 'ethereum'],
    frameworkPreset: 'Next.js 14 / App Router',
    estimatedBuildTime: '42s',
    appType: 'fintech'
  },
  {
    id: 'repo-2',
    name: 'gemini-ai-code-companion',
    fullName: 'rsk934128-dot/gemini-ai-code-companion',
    description: 'Real-time AI automated code reviewer, AST vulnerability scanner and test generator powered by Gemini 2.5 Pro.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 126,
    forks: 34,
    defaultBranch: 'main',
    isPrivate: false,
    updatedAt: '2 hours ago',
    htmlUrl: 'https://github.com/rsk934128-dot/gemini-ai-code-companion',
    topics: ['gemini-api', 'ai-companion', 'react', 'developer-tools'],
    frameworkPreset: 'React + Vite',
    estimatedBuildTime: '38s',
    appType: 'ai'
  },
  {
    id: 'repo-3',
    name: 'ecommerce-ultra-storefront',
    fullName: 'rsk934128-dot/ecommerce-ultra-storefront',
    description: 'Ultra-fast headless commerce template with ISR static caching, Stripe checkout, and localized currency converter.',
    language: 'JavaScript',
    languageColor: '#f1e05a',
    stars: 62,
    forks: 14,
    defaultBranch: 'main',
    isPrivate: false,
    updatedAt: 'Yesterday',
    htmlUrl: 'https://github.com/rsk934128-dot/ecommerce-ultra-storefront',
    topics: ['ecommerce', 'stripe', 'headless', 'tailwind'],
    frameworkPreset: 'Next.js 14 / App Router',
    estimatedBuildTime: '48s',
    appType: 'ecommerce'
  },
  {
    id: 'repo-4',
    name: 'bangla-nlp-voice-studio',
    fullName: 'rsk934128-dot/bangla-nlp-voice-studio',
    description: 'বাংলা প্রাকৃতিক ভাষা প্রক্রিয়াকরণ ও ভয়েস স্টুডিও - Real-time Bengali speech recognition & generative TTS engine.',
    language: 'Python',
    languageColor: '#3572A5',
    stars: 215,
    forks: 48,
    defaultBranch: 'main',
    isPrivate: false,
    updatedAt: '3 days ago',
    htmlUrl: 'https://github.com/rsk934128-dot/bangla-nlp-voice-studio',
    topics: ['bangla-nlp', 'whisper', 'fastapi', 'tts'],
    frameworkPreset: 'React + Vite',
    estimatedBuildTime: '55s',
    appType: 'ai'
  },
  {
    id: 'repo-5',
    name: 'saas-cloud-analytics-dash',
    fullName: 'rsk934128-dot/saas-cloud-analytics-dash',
    description: 'High-throughput time-series telemetry charts, edge latency analytics, and automated conversion attribution.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 93,
    forks: 21,
    defaultBranch: 'main',
    isPrivate: true,
    updatedAt: '5 days ago',
    htmlUrl: 'https://github.com/rsk934128-dot/saas-cloud-analytics-dash',
    topics: ['analytics', 'recharts', 'observability', 'saas'],
    frameworkPreset: 'Astro 4.x',
    estimatedBuildTime: '32s',
    appType: 'saas'
  },
  {
    id: 'repo-6',
    name: 'edge-serverless-api-gateway',
    fullName: 'rsk934128-dot/edge-serverless-api-gateway',
    description: 'Sub-millisecond API proxy with JWT validation, distributed rate-limiting, and geo-ip routing.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 45,
    forks: 8,
    defaultBranch: 'main',
    isPrivate: true,
    updatedAt: '1 week ago',
    htmlUrl: 'https://github.com/rsk934128-dot/edge-serverless-api-gateway',
    topics: ['serverless', 'edge-gateway', 'rate-limiter'],
    frameworkPreset: 'Remix Run',
    estimatedBuildTime: '36s',
    appType: 'devtool'
  }
];

export function generateSanitizedSubdomain(repoName: string): string {
  const clean = repoName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 24);
  const hash = Math.random().toString(36).substring(2, 6);
  return `${clean}-${hash}`;
}
