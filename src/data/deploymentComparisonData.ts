import {
  DeploymentRecord,
  EnvVarDiffItem,
  ConfigDiffItem,
  DependencyDiffItem,
  LogDiffRow
} from '../types/deploymentComparison';
import { ProjectItem } from '../types';

export const CURATED_PROJECT_DEPLOYMENTS: Record<string, DeploymentRecord[]> = {
  'p-1': [
    {
      id: 'dep-p1-142',
      projectId: 'p-1',
      deploymentNumber: 142,
      version: 'v2.14.0',
      commitHash: '7a4c9e1',
      commitMessage: 'feat(api): implement distributed edge cache and HMAC webhooks',
      author: 'rubels1k994-2960',
      branch: 'main',
      environment: 'Production',
      status: 'READY',
      deployedAt: '1h ago',
      timestamp: '2026-09-21 02:14:12 UTC',
      duration: '42s',
      durationSeconds: 42,
      bundleSize: '2.14 MB',
      bundleSizeKb: 2140,
      cacheHitRate: 98,
      fullDomain: 'fin-tech-web3-developer-hub-mq76.vercel.app',
      trigger: 'git_push',
      summaryMetrics: {
        staticPagesCount: 44,
        serverlessFunctionsCount: 12,
        edgeMiddlewareCount: 3,
        chunksCount: 86
      },
      config: {
        nodeVersion: 'Node.js 20.12.0',
        framework: 'Next.js 14.2.3',
        buildCommand: 'next build --experimental-build-mode=compile',
        installCommand: 'npm ci --prefer-offline',
        outputDirectory: '.next',
        regions: ['iad1', 'hnd1', 'fra1'],
        memoryMb: 2048,
        timeoutSeconds: 30,
        concurrencyLimit: 500,
        envVariables: [
          { key: 'NODE_ENV', value: 'production', category: 'Runtime' },
          { key: 'DATABASE_URL', value: 'postgres://edge_pool:enc_99a@us-east.aws.neon.tech/neondb?sslmode=require', isSecret: true, category: 'Database' },
          { key: 'CACHE_MAX_AGE', value: '86400', category: 'Features' },
          { key: 'EDGE_HMAC_SECRET', value: 'hmac_sha256_9180f9a2e8c04918230b', isSecret: true, category: 'API Keys' },
          { key: 'AI_GATEWAY_TOKEN', value: 'aig_prod_9941a80c99', isSecret: true, category: 'API Keys' },
          { key: 'WEB3_RPC_PROVIDER', value: 'https://eth-mainnet.alchemyapi.io/v2/live_proxy', category: 'General' },
          { key: 'STRICT_CSP_HEADERS', value: 'true', category: 'Features' },
          { key: 'COMPRESSION_BROTLI', value: 'enabled', category: 'Runtime' }
        ],
        dependencies: {
          'next': '14.2.3',
          'react': '18.3.1',
          'react-dom': '18.3.1',
          '@google/genai': '0.1.2',
          '@tanstack/react-query': '5.28.4',
          'lucide-react': '0.344.0',
          'ethers': '6.11.1',
          'zod': '3.22.4',
          'tailwindcss': '3.4.1'
        },
        featureFlags: {
          'enableEdgeStreaming': true,
          'experimentalCompiler': true,
          'wafRateLimiting': true,
          'automaticImageOptimization': true
        },
        securityHeaders: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
        }
      },
      buildLogs: [
        { line: 1, timestamp: '10:20:01', stage: 'clone', level: 'info', source: 'git', message: 'Cloning repository rsk934128-dot/FinTech-Web3-Developer-Hub (branch: main, commit: 7a4c9e1)' },
        { line: 2, timestamp: '10:20:04', stage: 'clone', level: 'info', source: 'git', message: 'HEAD is now at 7a4c9e1 feat(api): implement distributed edge cache and HMAC webhooks' },
        { line: 3, timestamp: '10:20:06', stage: 'install', level: 'info', source: 'cache', message: 'Restoring build cache from global edge CDN (cache-key: node20-linux-x64-3941)...' },
        { line: 4, timestamp: '10:20:08', stage: 'install', level: 'success', source: 'cache', message: 'Cache restored in 1.48s (184 MB saved, 98% hit rate)' },
        { line: 5, timestamp: '10:20:10', stage: 'install', level: 'info', source: 'npm', message: 'Running: npm ci --prefer-offline' },
        { line: 6, timestamp: '10:20:13', stage: 'install', level: 'success', source: 'npm', message: 'Audited 428 packages in 2.8s. 0 vulnerabilities found.' },
        { line: 7, timestamp: '10:20:15', stage: 'compile', level: 'info', source: 'next', message: 'Next.js 14.2.3 compilation started with Turbopack acceleration' },
        { line: 8, timestamp: '10:20:20', stage: 'compile', level: 'info', source: 'next', message: 'Creating an optimized production build...' },
        { line: 9, timestamp: '10:20:26', stage: 'bundle', level: 'success', source: 'next', message: 'Compiled successfully in 6.4s (86 client chunks, 12 serverless functions)' },
        { line: 10, timestamp: '10:20:29', stage: 'bundle', level: 'info', source: 'ssg', message: 'Prerendering static routes: / (index), /dashboard, /pricing, /docs [44/44]' },
        { line: 11, timestamp: '10:20:34', stage: 'bundle', level: 'info', source: 'opt', message: 'Brotli compression applied: Bundle size reduced from 3.8 MB to 2.14 MB (-43.6%)' },
        { line: 12, timestamp: '10:20:37', stage: 'deploy', level: 'info', source: 'edge-router', message: 'Deploying edge worker bundle to regions: Washington (iad1), Tokyo (hnd1), Frankfurt (fra1)' },
        { line: 13, timestamp: '10:20:40', stage: 'verify', level: 'success', source: 'healthcheck', message: 'Edge health probe passed across 3 regions. HTTP 200 OK (latency: 38ms)' },
        { line: 14, timestamp: '10:20:42', stage: 'verify', level: 'success', source: 'deployer', message: 'Deployment #142 finalized and routed to fin-tech-web3-developer-hub-mq76.vercel.app' }
      ]
    },
    {
      id: 'dep-p1-141',
      projectId: 'p-1',
      deploymentNumber: 141,
      version: 'v2.13.4',
      commitHash: 'e94d03c',
      commitMessage: 'fix(auth): correct token refresh expiration race condition',
      author: 'rubels1k994-2960',
      branch: 'main',
      environment: 'Production',
      status: 'READY',
      deployedAt: '18h ago',
      timestamp: '2026-09-20 08:11:30 UTC',
      duration: '1m 18s',
      durationSeconds: 78,
      bundleSize: '2.89 MB',
      bundleSizeKb: 2890,
      cacheHitRate: 64,
      fullDomain: 'fin-tech-web3-developer-hub-mq76-e94d03c.vercel.app',
      trigger: 'git_push',
      summaryMetrics: {
        staticPagesCount: 38,
        serverlessFunctionsCount: 10,
        edgeMiddlewareCount: 2,
        chunksCount: 94
      },
      config: {
        nodeVersion: 'Node.js 18.19.0',
        framework: 'Next.js 14.1.0',
        buildCommand: 'next build',
        installCommand: 'npm install',
        outputDirectory: '.next',
        regions: ['iad1'],
        memoryMb: 1024,
        timeoutSeconds: 15,
        concurrencyLimit: 250,
        envVariables: [
          { key: 'NODE_ENV', value: 'production', category: 'Runtime' },
          { key: 'DATABASE_URL', value: 'postgres://legacy_user:old_pass@db-aws.internal:5432/main', isSecret: true, category: 'Database' },
          { key: 'CACHE_MAX_AGE', value: '3600', category: 'Features' },
          { key: 'AI_GATEWAY_TOKEN', value: 'aig_staging_old_token_44', isSecret: true, category: 'API Keys' },
          { key: 'WEB3_RPC_PROVIDER', value: 'https://mainnet.infura.io/v3/legacy_key', category: 'General' },
          { key: 'LEGACY_POLL_INTERVAL', value: '5000', category: 'Runtime' }
        ],
        dependencies: {
          'next': '14.1.0',
          'react': '18.2.0',
          'react-dom': '18.2.0',
          '@google/genai': '0.1.0',
          '@tanstack/react-query': '5.17.1',
          'lucide-react': '0.312.0',
          'ethers': '5.7.2',
          'zod': '3.21.0',
          'tailwindcss': '3.3.5'
        },
        featureFlags: {
          'enableEdgeStreaming': false,
          'experimentalCompiler': false,
          'wafRateLimiting': false,
          'automaticImageOptimization': true
        },
        securityHeaders: {
          'X-Frame-Options': 'SAMEORIGIN'
        }
      },
      buildLogs: [
        { line: 1, timestamp: '08:10:01', stage: 'clone', level: 'info', source: 'git', message: 'Cloning repository rsk934128-dot/FinTech-Web3-Developer-Hub (branch: main, commit: e94d03c)' },
        { line: 2, timestamp: '08:10:05', stage: 'clone', level: 'info', source: 'git', message: 'HEAD is now at e94d03c fix(auth): correct token refresh expiration race condition' },
        { line: 3, timestamp: '08:10:09', stage: 'install', level: 'warn', source: 'cache', message: 'Build cache miss on node_modules. Rebuilding dependency graph from scratch...' },
        { line: 4, timestamp: '08:10:20', stage: 'install', level: 'info', source: 'npm', message: 'Running npm install --legacy-peer-deps (resolved 412 packages)' },
        { line: 5, timestamp: '08:10:35', stage: 'install', level: 'success', source: 'npm', message: 'Packages installed in 26.2s' },
        { line: 6, timestamp: '08:10:40', stage: 'compile', level: 'info', source: 'next', message: 'Compiling with standard Next.js Webpack engine (Node 18.19.0)' },
        { line: 7, timestamp: '08:10:52', stage: 'compile', level: 'warn', source: 'next', message: 'Warning: ethers v5 bundle contains large unminified bignumber dependencies (912 KB)' },
        { line: 8, timestamp: '08:11:05', stage: 'bundle', level: 'info', source: 'ssg', message: 'Prerendering 38 static pages without edge streaming' },
        { line: 9, timestamp: '08:11:15', stage: 'bundle', level: 'info', source: 'opt', message: 'Standard Gzip compression applied (output bundle: 2.89 MB)' },
        { line: 10, timestamp: '08:11:22', stage: 'deploy', level: 'info', source: 'edge-router', message: 'Deploying serverless endpoints to single region: Washington (iad1)' },
        { line: 11, timestamp: '08:11:28', stage: 'verify', level: 'success', source: 'healthcheck', message: 'Healthcheck 200 OK (latency: 74ms)' },
        { line: 12, timestamp: '08:11:30', stage: 'verify', level: 'success', source: 'deployer', message: 'Deployment #141 published successfully.' }
      ]
    },
    {
      id: 'dep-p1-140',
      projectId: 'p-1',
      deploymentNumber: 140,
      version: 'v2.13.0-preview.2',
      commitHash: '3f18a29',
      commitMessage: 'refactor: migrate database pooling to serverless connection router',
      author: 'rubels1k994-2960',
      branch: 'staging',
      environment: 'Staging',
      status: 'READY',
      deployedAt: '2 days ago',
      timestamp: '2026-09-19 14:22:04 UTC',
      duration: '1m 04s',
      durationSeconds: 64,
      bundleSize: '2.75 MB',
      bundleSizeKb: 2750,
      cacheHitRate: 85,
      fullDomain: 'fin-tech-web3-staging.vercel.app',
      trigger: 'git_push',
      summaryMetrics: {
        staticPagesCount: 38,
        serverlessFunctionsCount: 10,
        edgeMiddlewareCount: 2,
        chunksCount: 90
      },
      config: {
        nodeVersion: 'Node.js 20.12.0',
        framework: 'Next.js 14.1.0',
        buildCommand: 'next build',
        installCommand: 'npm ci',
        outputDirectory: '.next',
        regions: ['iad1', 'fra1'],
        memoryMb: 1536,
        timeoutSeconds: 20,
        concurrencyLimit: 300,
        envVariables: [
          { key: 'NODE_ENV', value: 'staging', category: 'Runtime' },
          { key: 'DATABASE_URL', value: 'postgres://staging_pool:enc_pass@stage.aws.neon.tech/main', isSecret: true, category: 'Database' },
          { key: 'CACHE_MAX_AGE', value: '3600', category: 'Features' },
          { key: 'AI_GATEWAY_TOKEN', value: 'aig_staging_old_token_44', isSecret: true, category: 'API Keys' }
        ],
        dependencies: {
          'next': '14.1.0',
          'react': '18.2.0',
          'react-dom': '18.2.0',
          '@google/genai': '0.1.0',
          'tailwindcss': '3.4.0'
        },
        featureFlags: {
          'enableEdgeStreaming': true,
          'experimentalCompiler': false,
          'wafRateLimiting': false,
          'automaticImageOptimization': true
        },
        securityHeaders: {
          'X-Frame-Options': 'DENY'
        }
      },
      buildLogs: [
        { line: 1, timestamp: '14:21:01', stage: 'clone', level: 'info', source: 'git', message: 'Cloning repository rsk934128-dot/FinTech-Web3-Developer-Hub (branch: staging)' },
        { line: 2, timestamp: '14:21:10', stage: 'install', level: 'info', source: 'npm', message: 'npm ci completed' },
        { line: 3, timestamp: '14:21:40', stage: 'compile', level: 'info', source: 'next', message: 'Building staging assets...' },
        { line: 4, timestamp: '14:22:04', stage: 'deploy', level: 'success', source: 'deployer', message: 'Deployment #140 staged to fin-tech-web3-staging.vercel.app' }
      ]
    },
    {
      id: 'dep-p1-139',
      projectId: 'p-1',
      deploymentNumber: 139,
      version: 'v2.12.9',
      commitHash: 'a018bc4',
      commitMessage: 'feat(web3): add multi-chain contract listener',
      author: 'rubels1k994-2960',
      branch: 'feature/contract-listener',
      environment: 'Preview',
      status: 'ERROR',
      deployedAt: '3 days ago',
      timestamp: '2026-09-18 11:04:15 UTC',
      duration: '54s',
      durationSeconds: 54,
      bundleSize: '0 MB',
      bundleSizeKb: 0,
      cacheHitRate: 30,
      fullDomain: 'fin-tech-web3-git-feature-contract.vercel.app',
      trigger: 'git_push',
      summaryMetrics: {
        staticPagesCount: 0,
        serverlessFunctionsCount: 0,
        edgeMiddlewareCount: 0,
        chunksCount: 0
      },
      config: {
        nodeVersion: 'Node.js 18.19.0',
        framework: 'Next.js 14.1.0',
        buildCommand: 'next build',
        installCommand: 'npm ci',
        outputDirectory: '.next',
        regions: ['iad1'],
        memoryMb: 1024,
        timeoutSeconds: 15,
        concurrencyLimit: 250,
        envVariables: [
          { key: 'NODE_ENV', value: 'production', category: 'Runtime' },
          { key: 'DATABASE_URL', value: 'postgres://legacy_user:pass@db.internal/main', isSecret: true, category: 'Database' }
        ],
        dependencies: {
          'next': '14.1.0',
          'ethers': '6.0.0',
          'react': '18.2.0'
        },
        featureFlags: {
          'enableEdgeStreaming': false,
          'experimentalCompiler': false,
          'wafRateLimiting': false,
          'automaticImageOptimization': false
        },
        securityHeaders: {}
      },
      buildLogs: [
        { line: 1, timestamp: '11:03:20', stage: 'clone', level: 'info', source: 'git', message: 'Cloning repository rsk934128-dot/FinTech-Web3-Developer-Hub (branch: feature/contract-listener)' },
        { line: 2, timestamp: '11:03:32', stage: 'install', level: 'info', source: 'npm', message: 'Dependencies restored from lockfile' },
        { line: 3, timestamp: '11:03:45', stage: 'compile', level: 'info', source: 'next', message: 'Executing TypeScript compiler: tsc --noEmit' },
        { line: 4, timestamp: '11:04:02', stage: 'compile', level: 'error', source: 'typescript', message: 'src/lib/contracts/listener.ts(42,18): error TS2339: Property \'subscribeEventStream\' does not exist on type \'ContractProvider\'.' },
        { line: 5, timestamp: '11:04:05', stage: 'compile', level: 'error', source: 'typescript', message: 'src/pages/api/webhook.ts(88,24): error TS2532: Object is possibly \'undefined\'.' },
        { line: 6, timestamp: '11:04:14', stage: 'compile', level: 'error', source: 'builder', message: 'Error: Command "next build" exited with code 1. Build aborted.' }
      ]
    }
  ],
  'p-2': [
    {
      id: 'dep-p2-34',
      projectId: 'p-2',
      deploymentNumber: 34,
      version: 'v1.8.2',
      commitHash: 'b8a1c90',
      commitMessage: 'feat: integrate Firebase and DNS lookup features',
      author: 'rubels1k994-2960',
      branch: 'main',
      environment: 'Production',
      status: 'READY',
      deployedAt: '3h ago',
      timestamp: '2026-09-21 00:15:00 UTC',
      duration: '1m 12s',
      durationSeconds: 72,
      bundleSize: '1.45 MB',
      bundleSizeKb: 1450,
      cacheHitRate: 94,
      fullDomain: 'no-ip-dns-remote-access.vercel.app',
      trigger: 'git_push',
      summaryMetrics: {
        staticPagesCount: 18,
        serverlessFunctionsCount: 6,
        edgeMiddlewareCount: 1,
        chunksCount: 42
      },
      config: {
        nodeVersion: 'Node.js 20.12.0',
        framework: 'React / Node.js (Vite)',
        buildCommand: 'vite build',
        installCommand: 'npm ci',
        outputDirectory: 'dist',
        regions: ['iad1', 'sfo1'],
        memoryMb: 1024,
        timeoutSeconds: 30,
        concurrencyLimit: 250,
        envVariables: [
          { key: 'VITE_FIREBASE_API_KEY', value: 'AIzaSyA89410d8f02941bca90', isSecret: true, category: 'API Keys' },
          { key: 'VITE_DNS_TIMEOUT_MS', value: '3500', category: 'Features' },
          { key: 'ENABLE_GEO_LOOKUP', value: 'true', category: 'Features' },
          { key: 'DNS_CACHE_TTL', value: '600', category: 'Runtime' }
        ],
        dependencies: {
          'react': '18.3.1',
          'vite': '5.2.8',
          'firebase': '10.11.0',
          'lucide-react': '0.344.0'
        },
        featureFlags: {
          'enableEdgeStreaming': true,
          'experimentalCompiler': true,
          'wafRateLimiting': true,
          'automaticImageOptimization': true
        },
        securityHeaders: {
          'X-Frame-Options': 'DENY'
        }
      },
      buildLogs: [
        { line: 1, timestamp: '00:14:01', stage: 'clone', level: 'info', source: 'git', message: 'Cloning rsk934128-dot/No-IP-DNS-Remote-Access' },
        { line: 2, timestamp: '00:14:15', stage: 'install', level: 'info', source: 'npm', message: 'npm ci finished in 8.4s' },
        { line: 3, timestamp: '00:14:45', stage: 'compile', level: 'info', source: 'vite', message: 'vite v5.2.8 building for production...' },
        { line: 4, timestamp: '00:15:02', stage: 'bundle', level: 'success', source: 'vite', message: 'dist/index.html 0.84 kB | dist/assets/index.js 1,450.12 kB' },
        { line: 5, timestamp: '00:15:12', stage: 'deploy', level: 'success', source: 'deployer', message: 'Deployment #34 finalized and live globally.' }
      ]
    },
    {
      id: 'dep-p2-33',
      projectId: 'p-2',
      deploymentNumber: 33,
      version: 'v1.7.9',
      commitHash: '54e12fa',
      commitMessage: 'perf: cache DNS resolver queries on edge',
      author: 'rubels1k994-2960',
      branch: 'main',
      environment: 'Production',
      status: 'READY',
      deployedAt: '4 days ago',
      timestamp: '2026-09-17 19:40:12 UTC',
      duration: '1m 45s',
      durationSeconds: 105,
      bundleSize: '1.92 MB',
      bundleSizeKb: 1920,
      cacheHitRate: 60,
      fullDomain: 'no-ip-dns-remote-access-old.vercel.app',
      trigger: 'git_push',
      summaryMetrics: {
        staticPagesCount: 14,
        serverlessFunctionsCount: 4,
        edgeMiddlewareCount: 0,
        chunksCount: 38
      },
      config: {
        nodeVersion: 'Node.js 18.18.0',
        framework: 'React / Node.js (Vite)',
        buildCommand: 'vite build',
        installCommand: 'npm install',
        outputDirectory: 'dist',
        regions: ['iad1'],
        memoryMb: 512,
        timeoutSeconds: 15,
        concurrencyLimit: 150,
        envVariables: [
          { key: 'VITE_DNS_TIMEOUT_MS', value: '5000', category: 'Features' },
          { key: 'ENABLE_GEO_LOOKUP', value: 'false', category: 'Features' }
        ],
        dependencies: {
          'react': '18.2.0',
          'vite': '4.5.0',
          'lucide-react': '0.290.0'
        },
        featureFlags: {
          'enableEdgeStreaming': false,
          'experimentalCompiler': false,
          'wafRateLimiting': false,
          'automaticImageOptimization': false
        },
        securityHeaders: {}
      },
      buildLogs: [
        { line: 1, timestamp: '19:38:40', stage: 'clone', level: 'info', source: 'git', message: 'Cloning rsk934128-dot/No-IP-DNS-Remote-Access' },
        { line: 2, timestamp: '19:39:10', stage: 'install', level: 'warn', source: 'npm', message: 'npm install without lockfile takes 28s' },
        { line: 3, timestamp: '19:40:02', stage: 'compile', level: 'info', source: 'vite', message: 'Vite 4 bundle generated (1.92 MB)' },
        { line: 4, timestamp: '19:40:25', stage: 'deploy', level: 'success', source: 'deployer', message: 'Deployment #33 published.' }
      ]
    }
  ],
  'p-9': [
    {
      id: 'dep-p9-48',
      projectId: 'p-9',
      deploymentNumber: 48,
      version: 'v3.1.2',
      commitHash: 'c712e09',
      commitMessage: 'fix: restore missing call buttons header props & typing',
      author: 'rubels1k994-2960',
      branch: 'main',
      environment: 'Production',
      status: 'READY',
      deployedAt: '5h ago',
      timestamp: '2026-09-20 22:15:00 UTC',
      duration: '38s',
      durationSeconds: 38,
      bundleSize: '1.82 MB',
      bundleSizeKb: 1820,
      cacheHitRate: 96,
      fullDomain: 'shurukkha-hub.vercel.app',
      trigger: 'manual_rebuild',
      summaryMetrics: {
        staticPagesCount: 22,
        serverlessFunctionsCount: 8,
        edgeMiddlewareCount: 2,
        chunksCount: 52
      },
      config: {
        nodeVersion: 'Node.js 20.12.0',
        framework: 'Next.js 14',
        buildCommand: 'npm run build',
        installCommand: 'npm ci',
        outputDirectory: '.next',
        regions: ['iad1', 'sin1'],
        memoryMb: 1536,
        timeoutSeconds: 25,
        concurrencyLimit: 350,
        envVariables: [
          { key: 'NODE_ENV', value: 'production', category: 'Runtime' },
          { key: 'WEBRTC_ICE_SERVERS', value: 'turn:turn.prod.shurukkha.io:3478', isSecret: true, category: 'API Keys' },
          { key: 'EMERGENCY_DISPATCH_TIMEOUT', value: '2500', category: 'Features' }
        ],
        dependencies: {
          'next': '14.2.0',
          'react': '18.3.1',
          'simple-peer': '9.11.1'
        },
        featureFlags: {
          'enableEdgeStreaming': true,
          'experimentalCompiler': true,
          'wafRateLimiting': true,
          'automaticImageOptimization': true
        },
        securityHeaders: {
          'X-Frame-Options': 'DENY'
        }
      },
      buildLogs: [
        { line: 1, timestamp: '22:14:20', stage: 'clone', level: 'info', source: 'git', message: 'Cloning repository rsk934128-dot/Shurukkha-Hub' },
        { line: 2, timestamp: '22:14:32', stage: 'install', level: 'info', source: 'npm', message: 'npm ci complete' },
        { line: 3, timestamp: '22:14:48', stage: 'compile', level: 'info', source: 'next', message: 'Compiled successfully in 4.2s without TypeScript errors' },
        { line: 4, timestamp: '22:14:58', stage: 'deploy', level: 'success', source: 'deployer', message: 'Deployment #48 live.' }
      ]
    },
    {
      id: 'dep-p9-47',
      projectId: 'p-9',
      deploymentNumber: 47,
      version: 'v3.1.1',
      commitHash: '91a7bf2',
      commitMessage: 'feat: implement WebRTC multi-line emergency dialing',
      author: 'rubels1k994-2960',
      branch: 'bugfix/call-buttons',
      environment: 'Preview',
      status: 'ERROR',
      deployedAt: '8h ago',
      timestamp: '2026-09-20 19:10:00 UTC',
      duration: '45s',
      durationSeconds: 45,
      bundleSize: '0 MB',
      bundleSizeKb: 0,
      cacheHitRate: 40,
      fullDomain: 'shurukkha-hub-preview.vercel.app',
      trigger: 'git_push',
      summaryMetrics: {
        staticPagesCount: 0,
        serverlessFunctionsCount: 0,
        edgeMiddlewareCount: 0,
        chunksCount: 0
      },
      config: {
        nodeVersion: 'Node.js 20.12.0',
        framework: 'Next.js 14',
        buildCommand: 'npm run build',
        installCommand: 'npm ci',
        outputDirectory: '.next',
        regions: ['iad1'],
        memoryMb: 1024,
        timeoutSeconds: 15,
        concurrencyLimit: 200,
        envVariables: [
          { key: 'NODE_ENV', value: 'production', category: 'Runtime' }
        ],
        dependencies: {
          'next': '14.1.0',
          'react': '18.2.0'
        },
        featureFlags: {
          'enableEdgeStreaming': false,
          'experimentalCompiler': false,
          'wafRateLimiting': false,
          'automaticImageOptimization': false
        },
        securityHeaders: {}
      },
      buildLogs: [
        { line: 1, timestamp: '14:22:01', stage: 'clone', level: 'info', source: 'git', message: 'Cloning repository rsk934128-dot/Shurukkha-Hub (branch: bugfix/call-buttons)' },
        { line: 2, timestamp: '14:22:15', stage: 'install', level: 'info', source: 'builder', message: 'Running npm run build with NODE_ENV=production' },
        { line: 3, timestamp: '14:22:45', stage: 'compile', level: 'error', source: 'typescript', message: 'Type error: Property "callButtons" does not exist on type CallHeaderProps' },
        { line: 4, timestamp: '14:23:41', stage: 'compile', level: 'error', source: 'builder', message: 'Build failed with exit code 1. Deployment canceled.' }
      ]
    }
  ]
};

/**
 * Returns past deployments for any project. If the project does not have curated entries,
 * dynamically generates 3 consistent past deployments based on project metadata.
 */
export function getDeploymentsForProject(projectId: string, project?: ProjectItem): DeploymentRecord[] {
  if (CURATED_PROJECT_DEPLOYMENTS[projectId]) {
    return CURATED_PROJECT_DEPLOYMENTS[projectId];
  }

  const projName = project?.displayName || 'cloud-app';
  const total = project?.totalDeployments || 28;
  const branch = project?.branch || 'main';
  const framework = project?.framework || 'Next.js 14';

  return [
    {
      id: `dep-${projectId}-${total}`,
      projectId,
      deploymentNumber: total,
      version: `v1.${Math.floor(total / 10)}.${total % 10}`,
      commitHash: '8f2c19a',
      commitMessage: project?.latestCommit || 'feat: deploy latest edge enhancements',
      author: project?.creator || 'rubels1k994-2960',
      branch,
      environment: project?.environment || 'Production',
      status: project?.status || 'READY',
      deployedAt: project?.commitTime || '2h ago',
      timestamp: '2026-09-21 01:00:00 UTC',
      duration: project?.deploymentTime || '45s',
      durationSeconds: 45,
      bundleSize: '2.34 MB',
      bundleSizeKb: 2340,
      cacheHitRate: 95,
      fullDomain: project?.fullDomain || `${projName}.vercel.app`,
      trigger: 'git_push',
      summaryMetrics: {
        staticPagesCount: 32,
        serverlessFunctionsCount: 8,
        edgeMiddlewareCount: 2,
        chunksCount: 68
      },
      config: {
        nodeVersion: 'Node.js 20.12.0',
        framework,
        buildCommand: 'npm run build',
        installCommand: 'npm ci',
        outputDirectory: framework.includes('Vite') ? 'dist' : '.next',
        regions: project?.regions || ['iad1', 'hnd1'],
        memoryMb: 1536,
        timeoutSeconds: 30,
        concurrencyLimit: 400,
        envVariables: [
          { key: 'NODE_ENV', value: 'production', category: 'Runtime' },
          { key: 'API_ENDPOINT_URL', value: `https://${projName}.api.internal/v1`, category: 'General' },
          { key: 'SECRET_ENCRYPTION_KEY', value: 'enc_sec_994812a01f', isSecret: true, category: 'API Keys' },
          { key: 'EDGE_CACHE_CONTROL', value: 's-maxage=3600, stale-while-revalidate', category: 'Features' }
        ],
        dependencies: {
          'react': '18.3.1',
          'lucide-react': '0.344.0',
          'tailwindcss': '3.4.1'
        },
        featureFlags: {
          'enableEdgeStreaming': true,
          'experimentalCompiler': true,
          'wafRateLimiting': true,
          'automaticImageOptimization': true
        },
        securityHeaders: {
          'X-Frame-Options': 'DENY'
        }
      },
      buildLogs: [
        { line: 1, timestamp: '01:00:01', stage: 'clone', level: 'info', source: 'git', message: `Cloning ${project?.repo || 'repository'} (branch: ${branch})` },
        { line: 2, timestamp: '01:00:10', stage: 'install', level: 'info', source: 'npm', message: 'Restored cached node_modules in 2.1s' },
        { line: 3, timestamp: '01:00:25', stage: 'compile', level: 'info', source: 'builder', message: `Building with ${framework} production preset...` },
        { line: 4, timestamp: '01:00:40', stage: 'bundle', level: 'success', source: 'builder', message: 'Optimized production bundle created: 2.34 MB' },
        { line: 5, timestamp: '01:00:45', stage: 'deploy', level: 'success', source: 'deployer', message: `Deployed to ${project?.fullDomain || projName}` }
      ]
    },
    {
      id: `dep-${projectId}-${total - 1}`,
      projectId,
      deploymentNumber: total - 1,
      version: `v1.${Math.floor((total - 1) / 10)}.${(total - 1) % 10}`,
      commitHash: '3e91d04',
      commitMessage: 'chore(config): optimize memory limits and edge routing rules',
      author: project?.creator || 'rubels1k994-2960',
      branch,
      environment: 'Production',
      status: 'READY',
      deployedAt: '1 day ago',
      timestamp: '2026-09-20 04:30:00 UTC',
      duration: '1m 15s',
      durationSeconds: 75,
      bundleSize: '2.80 MB',
      bundleSizeKb: 2800,
      cacheHitRate: 70,
      fullDomain: `${projName}-prev.vercel.app`,
      trigger: 'manual_rebuild',
      summaryMetrics: {
        staticPagesCount: 28,
        serverlessFunctionsCount: 6,
        edgeMiddlewareCount: 1,
        chunksCount: 74
      },
      config: {
        nodeVersion: 'Node.js 18.19.0',
        framework,
        buildCommand: 'npm run build',
        installCommand: 'npm install',
        outputDirectory: framework.includes('Vite') ? 'dist' : '.next',
        regions: ['iad1'],
        memoryMb: 1024,
        timeoutSeconds: 15,
        concurrencyLimit: 200,
        envVariables: [
          { key: 'NODE_ENV', value: 'production', category: 'Runtime' },
          { key: 'API_ENDPOINT_URL', value: `https://${projName}.api.legacy/v1`, category: 'General' },
          { key: 'SECRET_ENCRYPTION_KEY', value: 'enc_sec_old_key_88', isSecret: true, category: 'API Keys' }
        ],
        dependencies: {
          'react': '18.2.0',
          'lucide-react': '0.300.0',
          'tailwindcss': '3.3.0'
        },
        featureFlags: {
          'enableEdgeStreaming': false,
          'experimentalCompiler': false,
          'wafRateLimiting': false,
          'automaticImageOptimization': true
        },
        securityHeaders: {
          'X-Frame-Options': 'SAMEORIGIN'
        }
      },
      buildLogs: [
        { line: 1, timestamp: '04:29:01', stage: 'clone', level: 'info', source: 'git', message: `Cloning ${project?.repo || 'repository'}` },
        { line: 2, timestamp: '04:29:18', stage: 'install', level: 'warn', source: 'npm', message: 'Cache miss on packages. Running full npm install...' },
        { line: 3, timestamp: '04:29:50', stage: 'compile', level: 'info', source: 'builder', message: 'Building production assets' },
        { line: 4, timestamp: '04:30:15', stage: 'deploy', level: 'success', source: 'deployer', message: 'Deployment published.' }
      ]
    },
    {
      id: `dep-${projectId}-${total - 2}`,
      projectId,
      deploymentNumber: total - 2,
      version: `v1.${Math.floor((total - 2) / 10)}.${(total - 2) % 10}`,
      commitHash: '1a90c4e',
      commitMessage: 'fix(edge): patch memory leak in analytics logging loop',
      author: project?.creator || 'rubels1k994-2960',
      branch: 'preview/memory-fix',
      environment: 'Preview',
      status: 'READY',
      deployedAt: '3 days ago',
      timestamp: '2026-09-18 10:15:00 UTC',
      duration: '1m 28s',
      durationSeconds: 88,
      bundleSize: '2.95 MB',
      bundleSizeKb: 2950,
      cacheHitRate: 65,
      fullDomain: `${projName}-preview.vercel.app`,
      trigger: 'git_push',
      summaryMetrics: {
        staticPagesCount: 26,
        serverlessFunctionsCount: 6,
        edgeMiddlewareCount: 1,
        chunksCount: 80
      },
      config: {
        nodeVersion: 'Node.js 18.19.0',
        framework,
        buildCommand: 'npm run build',
        installCommand: 'npm install',
        outputDirectory: framework.includes('Vite') ? 'dist' : '.next',
        regions: ['iad1'],
        memoryMb: 1024,
        timeoutSeconds: 15,
        concurrencyLimit: 200,
        envVariables: [
          { key: 'NODE_ENV', value: 'development', category: 'Runtime' },
          { key: 'API_ENDPOINT_URL', value: `https://${projName}.api.legacy/v1`, category: 'General' }
        ],
        dependencies: {
          'react': '18.2.0',
          'lucide-react': '0.300.0'
        },
        featureFlags: {
          'enableEdgeStreaming': false,
          'experimentalCompiler': false,
          'wafRateLimiting': false,
          'automaticImageOptimization': false
        },
        securityHeaders: {}
      },
      buildLogs: [
        { line: 1, timestamp: '10:14:01', stage: 'clone', level: 'info', source: 'git', message: 'Cloning preview branch' },
        { line: 2, timestamp: '10:14:30', stage: 'install', level: 'info', source: 'npm', message: 'Dependencies installed' },
        { line: 3, timestamp: '10:15:28', stage: 'deploy', level: 'success', source: 'deployer', message: 'Preview deployment ready' }
      ]
    }
  ];
}

/**
 * Calculates differences between two deployment environment variable lists.
 */
export function calculateEnvVarDiff(base: DeploymentRecord, target: DeploymentRecord): EnvVarDiffItem[] {
  const baseMap = new Map(base.config.envVariables.map(v => [v.key, v]));
  const targetMap = new Map(target.config.envVariables.map(v => [v.key, v]));
  const allKeys = Array.from(new Set([...baseMap.keys(), ...targetMap.keys()])).sort();

  return allKeys.map(key => {
    const baseVar = baseMap.get(key);
    const targetVar = targetMap.get(key);

    if (baseVar && !targetVar) {
      return {
        key,
        type: 'removed',
        baseValue: baseVar.value,
        isSecret: baseVar.isSecret,
        category: baseVar.category
      };
    } else if (!baseVar && targetVar) {
      return {
        key,
        type: 'added',
        targetValue: targetVar.value,
        isSecret: targetVar.isSecret,
        category: targetVar.category
      };
    } else if (baseVar && targetVar) {
      const isModified = baseVar.value !== targetVar.value;
      return {
        key,
        type: isModified ? 'modified' : 'unchanged',
        baseValue: baseVar.value,
        targetValue: targetVar.value,
        isSecret: baseVar.isSecret || targetVar.isSecret,
        category: targetVar.category || baseVar.category
      };
    }
    return {
      key,
      type: 'unchanged',
      category: 'General'
    };
  });
}

/**
 * Calculates configuration and build setting differences between two deployments.
 */
export function calculateConfigDiff(base: DeploymentRecord, target: DeploymentRecord): ConfigDiffItem[] {
  const items: ConfigDiffItem[] = [
    {
      name: 'nodeVersion',
      label: 'Node.js Runtime',
      type: base.config.nodeVersion !== target.config.nodeVersion ? 'modified' : 'unchanged',
      baseValue: base.config.nodeVersion,
      targetValue: target.config.nodeVersion,
      category: 'Runtime'
    },
    {
      name: 'framework',
      label: 'Framework Preset',
      type: base.config.framework !== target.config.framework ? 'modified' : 'unchanged',
      baseValue: base.config.framework,
      targetValue: target.config.framework,
      category: 'Runtime'
    },
    {
      name: 'buildCommand',
      label: 'Build Command',
      type: base.config.buildCommand !== target.config.buildCommand ? 'modified' : 'unchanged',
      baseValue: base.config.buildCommand,
      targetValue: target.config.buildCommand,
      category: 'Build Command'
    },
    {
      name: 'installCommand',
      label: 'Install Command',
      type: base.config.installCommand !== target.config.installCommand ? 'modified' : 'unchanged',
      baseValue: base.config.installCommand,
      targetValue: target.config.installCommand,
      category: 'Build Command'
    },
    {
      name: 'outputDirectory',
      label: 'Output Directory',
      type: base.config.outputDirectory !== target.config.outputDirectory ? 'modified' : 'unchanged',
      baseValue: base.config.outputDirectory,
      targetValue: target.config.outputDirectory,
      category: 'Build Command'
    },
    {
      name: 'regions',
      label: 'Active Routing Regions',
      type: JSON.stringify(base.config.regions) !== JSON.stringify(target.config.regions) ? 'modified' : 'unchanged',
      baseValue: base.config.regions.join(', '),
      targetValue: target.config.regions.join(', '),
      category: 'Routing & Regions'
    },
    {
      name: 'memoryMb',
      label: 'Serverless Function Memory',
      type: base.config.memoryMb !== target.config.memoryMb ? 'modified' : 'unchanged',
      baseValue: `${base.config.memoryMb} MB`,
      targetValue: `${target.config.memoryMb} MB`,
      category: 'Resource Limits'
    },
    {
      name: 'timeoutSeconds',
      label: 'Execution Max Timeout',
      type: base.config.timeoutSeconds !== target.config.timeoutSeconds ? 'modified' : 'unchanged',
      baseValue: `${base.config.timeoutSeconds}s`,
      targetValue: `${target.config.timeoutSeconds}s`,
      category: 'Resource Limits'
    },
    {
      name: 'concurrencyLimit',
      label: 'Max Edge Concurrency',
      type: base.config.concurrencyLimit !== target.config.concurrencyLimit ? 'modified' : 'unchanged',
      baseValue: `${base.config.concurrencyLimit} req/sec`,
      targetValue: `${target.config.concurrencyLimit} req/sec`,
      category: 'Resource Limits'
    }
  ];

  return items;
}

/**
 * Calculates dependency differences from package.json snapshot.
 */
export function calculateDependencyDiff(base: DeploymentRecord, target: DeploymentRecord): DependencyDiffItem[] {
  const baseDeps = base.config.dependencies || {};
  const targetDeps = target.config.dependencies || {};
  const allDeps = Array.from(new Set([...Object.keys(baseDeps), ...Object.keys(targetDeps)])).sort();

  return allDeps.map(packageName => {
    const baseVer = baseDeps[packageName];
    const targetVer = targetDeps[packageName];

    if (baseVer && !targetVer) {
      return { packageName, type: 'removed', baseVersion: baseVer };
    } else if (!baseVer && targetVer) {
      return { packageName, type: 'added', targetVersion: targetVer };
    } else if (baseVer && targetVer) {
      return {
        packageName,
        type: baseVer !== targetVer ? 'modified' : 'unchanged',
        baseVersion: baseVer,
        targetVersion: targetVer
      };
    }
    return { packageName, type: 'unchanged' };
  });
}

/**
 * Generates side-by-side aligned build log rows for diffing.
 */
export function calculateLogDiff(base: DeploymentRecord, target: DeploymentRecord): LogDiffRow[] {
  const baseLogs = base.buildLogs;
  const targetLogs = target.buildLogs;
  const maxLines = Math.max(baseLogs.length, targetLogs.length);
  const rows: LogDiffRow[] = [];

  for (let i = 0; i < maxLines; i++) {
    const b = baseLogs[i];
    const t = targetLogs[i];

    let diffStatus: LogDiffRow['diffStatus'] = 'match';
    if (!b && t) {
      diffStatus = 'target_only';
    } else if (b && !t) {
      diffStatus = 'base_only';
    } else if (b && t) {
      if (b.level === 'error' || t.level === 'error') {
        diffStatus = 'error_spike';
      } else if (b.message !== t.message || b.stage !== t.stage) {
        diffStatus = 'diverged';
      } else {
        diffStatus = 'match';
      }
    }

    rows.push({
      index: i + 1,
      baseLog: b,
      targetLog: t,
      diffStatus
    });
  }

  return rows;
}
