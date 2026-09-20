import { WafRule, SecurityEvent, IpRuleItem, OwaspProtectionItem } from '../types/firewall';

export const INITIAL_WAF_RULES: WafRule[] = [
  {
    id: 'waf-01',
    name: 'Rate Limit Auth & Token Endpoints',
    description: 'Throttle rapid credential submissions to prevent brute force attacks',
    expression: 'http.request.uri.path in {"/api/v1/auth/login", "/api/v1/auth/exchange-token"} && rate(ip) > 10 req/10s',
    action: 'rate_limit',
    hits24h: 4290,
    enabled: true,
    priority: 1,
    updatedAt: '2 days ago'
  },
  {
    id: 'waf-02',
    name: 'Block Known Vulnerability Scanners & Probes',
    description: 'Reject requests targeting WordPress, phpMyAdmin, and .env files on Node runtimes',
    expression: 'http.request.uri.path contains "wp-admin" || http.request.uri.path contains ".env" || http.request.uri.path contains "phpmyadmin"',
    action: 'block',
    hits24h: 6814,
    enabled: true,
    priority: 2,
    updatedAt: '1 week ago'
  },
  {
    id: 'waf-03',
    name: 'Managed Challenge for Unverified Automated Bots',
    description: 'Present JS/Captcha challenge to AI scraping bots and headless browsers',
    expression: 'cf.client.bot == true && not cf.bot_management.verified_bot',
    action: 'challenge',
    hits24h: 3120,
    enabled: true,
    priority: 3,
    updatedAt: '3 days ago'
  },
  {
    id: 'waf-04',
    name: 'Block Malicious ASN / TOR Exit Relays',
    description: 'Prevent traffic from high-risk anonymity networks and bulletproof hosters',
    expression: 'ip.geoip.asnum in {14061, 9009, 396982}',
    action: 'block',
    hits24h: 940,
    enabled: true,
    priority: 4,
    updatedAt: '5 days ago'
  },
  {
    id: 'waf-05',
    name: 'Log GraphQL Deep Nesting Query Depth',
    description: 'Monitor potentially abusive nested GraphQL queries for denial-of-service profiling',
    expression: 'http.request.uri.path == "/graphql" && http.request.body.query_depth > 6',
    action: 'log',
    hits24h: 218,
    enabled: false,
    priority: 5,
    updatedAt: '2 weeks ago'
  }
];

export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  {
    id: 'sec-101',
    timestamp: '10:45:12.440',
    ip: '194.26.29.112',
    country: 'Netherlands',
    countryCode: 'NL',
    path: '/.env',
    method: 'GET',
    category: 'scanner',
    categoryLabel: 'Environment Probe',
    action: 'block',
    matchedRule: 'Block Known Vulnerability Scanners & Probes',
    userAgent: 'Mozilla/5.0 zgrab/0.x'
  },
  {
    id: 'sec-102',
    timestamp: '10:44:50.812',
    ip: '185.191.171.4',
    country: 'Germany',
    countryCode: 'DE',
    path: '/api/v1/auth/exchange-token',
    method: 'POST',
    category: 'rate_limit',
    categoryLabel: 'Brute Force Attempt',
    action: 'rate_limit',
    matchedRule: 'Rate Limit Auth & Token Endpoints',
    userAgent: 'python-requests/2.31.0'
  },
  {
    id: 'sec-103',
    timestamp: '10:44:02.190',
    ip: '45.154.255.89',
    country: 'Russia',
    countryCode: 'RU',
    path: '/api/v1/users?id=1%27%20OR%201=1--',
    method: 'GET',
    category: 'sqli',
    categoryLabel: 'SQL Injection',
    action: 'block',
    matchedRule: 'OWASP Core Rule Set: SQLi Filter',
    userAgent: 'sqlmap/1.7#stable'
  },
  {
    id: 'sec-104',
    timestamp: '10:43:21.002',
    ip: '103.145.75.12',
    country: 'Singapore',
    countryCode: 'SG',
    path: '/dashboard/overview',
    method: 'GET',
    category: 'bot',
    categoryLabel: 'Scraper Bot',
    action: 'challenge',
    matchedRule: 'Managed Challenge for Unverified Automated Bots',
    userAgent: 'HeadlessChrome/120.0.6099.109'
  },
  {
    id: 'sec-105',
    timestamp: '10:42:18.950',
    ip: '198.51.100.22',
    country: 'United States',
    countryCode: 'US',
    path: '/static/../../etc/passwd',
    method: 'GET',
    category: 'path_traversal',
    categoryLabel: 'Path Traversal (LFI)',
    action: 'block',
    matchedRule: 'OWASP Core Rule Set: Directory Traversal',
    userAgent: 'curl/8.4.0'
  },
  {
    id: 'sec-106',
    timestamp: '10:41:05.110',
    ip: '185.220.101.5',
    country: 'Germany',
    countryCode: 'DE',
    path: '/wp-login.php',
    method: 'POST',
    category: 'scanner',
    categoryLabel: 'WordPress Scanner',
    action: 'block',
    matchedRule: 'Block Known Vulnerability Scanners & Probes',
    userAgent: 'WPScan v3.8.22'
  }
];

export const INITIAL_IP_RULES: IpRuleItem[] = [
  { id: 'ip-1', ipOrCidr: '198.51.100.0/24', type: 'allow', description: 'HQ Office & Developer VPN subnet', addedAt: '3 months ago' },
  { id: 'ip-2', ipOrCidr: '52.14.0.0/16', type: 'allow', description: 'GitHub Actions CI/CD runner CIDR', addedAt: '1 month ago' },
  { id: 'ip-3', ipOrCidr: '185.220.101.0/24', type: 'block', description: 'TOR exit relay network block', addedAt: '2 weeks ago' },
  { id: 'ip-4', ipOrCidr: '194.26.29.112', type: 'block', description: 'Targeted probe scanner host', addedAt: 'Today' }
];

export const OWASP_PROTECTIONS: OwaspProtectionItem[] = [
  {
    id: 'owasp-sqli',
    name: 'SQL Injection (SQLi) Defense',
    code: 'CRS-942',
    description: 'Inspects query strings, JSON payloads, and form submissions for SQL dialect syntax',
    status: 'active',
    sensitivity: 'high',
    blockedToday: 184
  },
  {
    id: 'owasp-xss',
    name: 'Cross-Site Scripting (XSS)',
    code: 'CRS-941',
    description: 'Detects script tags, SVG onload triggers, and malicious JavaScript vector execution',
    status: 'active',
    sensitivity: 'standard',
    blockedToday: 92
  },
  {
    id: 'owasp-rce',
    name: 'Remote Code Execution & Shell Injection',
    code: 'CRS-932',
    description: 'Blocks unix pipes, bash escapes, eval statements, and reverse shell triggers',
    status: 'active',
    sensitivity: 'paranoid',
    blockedToday: 41
  },
  {
    id: 'owasp-lfi',
    name: 'Directory Traversal & LFI',
    code: 'CRS-930',
    description: 'Stops dot-dot-slash (../) directory climbing and local file inclusion attempts',
    status: 'active',
    sensitivity: 'high',
    blockedToday: 126
  }
];
