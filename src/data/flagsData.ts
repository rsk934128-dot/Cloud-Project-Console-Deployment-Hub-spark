import { FeatureFlag, FlagAuditLog } from '../types/flags';

export const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: 'flag-01',
    key: 'enable_gemini_agent_chat',
    name: 'Gemini Autonomous Ops Agent',
    description: 'Enables interactive Gemini 2.5 Flash agent assistant in sidebar and terminal console.',
    type: 'percentage',
    tags: ['AI', 'Agent', 'Core'],
    status: 'active',
    createdAt: 'Sep 01, 2026',
    updatedAt: '12m ago',
    updatedBy: 'sarah.ops@cloudmesh.io',
    environments: {
      production: {
        enabled: true,
        rolloutPercentage: 50,
        value: true,
        rules: [
          {
            id: 'rule-prod-1',
            attribute: 'plan',
            operator: 'in_list',
            values: ['enterprise', 'scale_pro'],
            serveValue: true
          }
        ]
      },
      staging: {
        enabled: true,
        rolloutPercentage: 100,
        value: true,
        rules: []
      },
      preview: {
        enabled: true,
        rolloutPercentage: 100,
        value: true,
        rules: []
      }
    }
  },
  {
    id: 'flag-02',
    key: 'streaming_log_aggregator_v2',
    name: 'Real-time WebSocket Logs v2',
    description: 'Upgrades legacy SSE deployment logs to bidirectional multiplexed WebSocket streams with sub-10ms latency.',
    type: 'boolean',
    tags: ['Performance', 'Backend', 'Logs'],
    status: 'active',
    createdAt: 'Aug 14, 2026',
    updatedAt: '2h ago',
    updatedBy: 'alex.dev@cloudmesh.io',
    environments: {
      production: {
        enabled: true,
        rolloutPercentage: 100,
        value: true,
        rules: []
      },
      staging: {
        enabled: true,
        rolloutPercentage: 100,
        value: true,
        rules: []
      },
      preview: {
        enabled: true,
        rolloutPercentage: 100,
        value: true,
        rules: []
      }
    }
  },
  {
    id: 'flag-03',
    key: 'waf_adaptive_rate_limiting',
    name: 'Adaptive ML WAF Rate Limiting',
    description: 'Enables heuristic token-bucket anomaly rate limiting for incoming HTTP traffic spikes.',
    type: 'percentage',
    tags: ['Security', 'WAF', 'Networking'],
    status: 'active',
    createdAt: 'Sep 10, 2026',
    updatedAt: 'Yesterday',
    updatedBy: 'secops-lead@cloudmesh.io',
    environments: {
      production: {
        enabled: true,
        rolloutPercentage: 25,
        value: true,
        rules: [
          {
            id: 'rule-waf-1',
            attribute: 'country',
            operator: 'in_list',
            values: ['US', 'CA', 'DE', 'GB'],
            serveValue: true
          }
        ]
      },
      staging: {
        enabled: true,
        rolloutPercentage: 100,
        value: true,
        rules: []
      },
      preview: {
        enabled: false,
        rolloutPercentage: 0,
        value: false,
        rules: []
      }
    }
  },
  {
    id: 'flag-04',
    key: 'checkout_flow_multivariate_test',
    name: 'Checkout Flow v3 Optimization',
    description: 'A/B/C multivariate testing for checkout checkout layout and annual pre-pay discount badge display.',
    type: 'multivariate',
    tags: ['Growth', 'Billing', 'UI/UX'],
    status: 'active',
    createdAt: 'Sep 05, 2026',
    updatedAt: 'Sep 18, 2026',
    updatedBy: 'growth-pm@cloudmesh.io',
    variants: [
      { id: 'var_a', name: 'Control (Monthly Default)', value: 'control', weight: 34 },
      { id: 'var_b', name: 'Annual 20% Off Highlighted', value: 'annual_highlight', weight: 33 },
      { id: 'var_c', name: 'Single-Click Stripe Link', value: 'one_click_link', weight: 33 }
    ],
    environments: {
      production: {
        enabled: true,
        rolloutPercentage: 100,
        value: 'annual_highlight',
        rules: []
      },
      staging: {
        enabled: true,
        rolloutPercentage: 100,
        value: 'annual_highlight',
        rules: []
      },
      preview: {
        enabled: true,
        rolloutPercentage: 100,
        value: 'control',
        rules: []
      }
    }
  },
  {
    id: 'flag-05',
    key: 'edge_cache_ttl_config_json',
    name: 'Dynamic Edge Cache Hierarchy (JSON)',
    description: 'Remote JSON payload dictating Cloudflare and Fastly edge cache TTL rules by URL path regex.',
    type: 'json',
    tags: ['Networking', 'CDN', 'Config'],
    status: 'active',
    createdAt: 'Jul 28, 2026',
    updatedAt: 'Sep 12, 2026',
    updatedBy: 'alex.dev@cloudmesh.io',
    environments: {
      production: {
        enabled: true,
        rolloutPercentage: 100,
        value: JSON.stringify({
          staticAssetsTtlSec: 31536000,
          apiBypassPaths: ['/api/v1/auth', '/api/v1/checkout', '/api/v1/webhook'],
          staleWhileRevalidateSec: 86400,
          geoHeaderEnabled: true
        }, null, 2),
        rules: []
      },
      staging: {
        enabled: true,
        rolloutPercentage: 100,
        value: JSON.stringify({
          staticAssetsTtlSec: 60,
          apiBypassPaths: ['/api/*'],
          staleWhileRevalidateSec: 0,
          geoHeaderEnabled: true
        }, null, 2),
        rules: []
      },
      preview: {
        enabled: true,
        rolloutPercentage: 100,
        value: JSON.stringify({
          staticAssetsTtlSec: 0,
          apiBypassPaths: ['*'],
          staleWhileRevalidateSec: 0,
          geoHeaderEnabled: false
        }, null, 2),
        rules: []
      }
    }
  },
  {
    id: 'flag-06',
    key: 'dark_theme_oled_pure_black',
    name: 'OLED Pure Black High Contrast Theme',
    description: 'Experimental #000000 theme optimized for mobile OLED screens and high accessibility contrast standards.',
    type: 'boolean',
    tags: ['UI/UX', 'Mobile'],
    status: 'draft',
    createdAt: 'Sep 19, 2026',
    updatedAt: 'Yesterday',
    updatedBy: 'designer.dan@cloudmesh.io',
    environments: {
      production: {
        enabled: false,
        rolloutPercentage: 0,
        value: false,
        rules: []
      },
      staging: {
        enabled: true,
        rolloutPercentage: 100,
        value: true,
        rules: []
      },
      preview: {
        enabled: true,
        rolloutPercentage: 100,
        value: true,
        rules: []
      }
    }
  }
];

export const INITIAL_FLAG_AUDIT_LOGS: FlagAuditLog[] = [
  {
    id: 'log-01',
    flagKey: 'enable_gemini_agent_chat',
    environment: 'production',
    action: 'Updated Rollout Percentage',
    user: 'sarah.ops@cloudmesh.io',
    timestamp: '12m ago',
    diffSummary: 'Increased rollout from 25% to 50% for all users'
  },
  {
    id: 'log-02',
    flagKey: 'streaming_log_aggregator_v2',
    environment: 'production',
    action: 'Enabled Flag',
    user: 'alex.dev@cloudmesh.io',
    timestamp: '2h ago',
    diffSummary: 'Toggled state from OFF to ON across 100% production users'
  },
  {
    id: 'log-03',
    flagKey: 'waf_adaptive_rate_limiting',
    environment: 'production',
    action: 'Added Targeting Rule',
    user: 'secops-lead@cloudmesh.io',
    timestamp: 'Yesterday',
    diffSummary: 'Added geo rule for country IN [US, CA, DE, GB]'
  },
  {
    id: 'log-04',
    flagKey: 'edge_cache_ttl_config_json',
    environment: 'staging',
    action: 'Updated JSON Value',
    user: 'alex.dev@cloudmesh.io',
    timestamp: 'Sep 12, 2026',
    diffSummary: 'Updated staleWhileRevalidateSec to 86400 in config payload'
  }
];
