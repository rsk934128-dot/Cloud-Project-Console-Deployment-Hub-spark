import { CustomDomainItem, NameserverItem } from '../types/domains';

export const INITIAL_DOMAINS: CustomDomainItem[] = [
  {
    id: 'dom-01',
    domain: 'cloudmesh.dev',
    projectId: 'all',
    projectName: 'Global Edge Router',
    environment: 'Production',
    status: 'valid',
    isApex: true,
    apexRedirect: {
      enabled: false,
      target: '',
      statusCode: 308
    },
    ssl: {
      status: 'active',
      issuer: 'Let’s Encrypt Authority X3',
      expiresAt: 'Dec 18, 2026',
      autoRenew: true,
      sanDomains: ['cloudmesh.dev', '*.cloudmesh.dev']
    },
    dnsRecords: [
      {
        id: 'rec-01',
        type: 'A',
        name: '@',
        value: '76.76.21.21',
        ttl: '60s',
        status: 'verified',
        comment: 'Global Anycast IP routing directly to nearest Edge PoP'
      },
      {
        id: 'rec-02',
        type: 'TXT',
        name: '_cloudmesh-challenge',
        value: 'vc-challenge=a89f275468538eec4cbbdcf5f66107a6',
        ttl: 'Auto',
        status: 'verified',
        comment: 'Automated ACME domain ownership cryptographic proof'
      }
    ],
    createdAt: '2 months ago',
    verifiedAt: '2 months ago',
    lastChecked: '2 mins ago'
  },
  {
    id: 'dom-02',
    domain: 'www.cloudmesh.dev',
    projectId: 'all',
    projectName: 'Global Edge Router',
    environment: 'Production',
    status: 'valid',
    isApex: false,
    apexRedirect: {
      enabled: true,
      target: 'cloudmesh.dev',
      statusCode: 308
    },
    ssl: {
      status: 'active',
      issuer: 'Let’s Encrypt Authority X3',
      expiresAt: 'Dec 18, 2026',
      autoRenew: true,
      sanDomains: ['www.cloudmesh.dev']
    },
    dnsRecords: [
      {
        id: 'rec-03',
        type: 'CNAME',
        name: 'www',
        value: 'cname.cloudmesh-edge.net',
        ttl: '60s',
        status: 'verified',
        comment: 'Canonical name pointing to edge distribution cluster'
      }
    ],
    createdAt: '2 months ago',
    verifiedAt: '2 months ago',
    lastChecked: '4 mins ago'
  },
  {
    id: 'dom-03',
    domain: 'api.cloudmesh.dev',
    projectId: 'proj-01',
    projectName: 'Core Gateway Service',
    environment: 'Production',
    status: 'valid',
    isApex: false,
    ssl: {
      status: 'active',
      issuer: 'Google Trust Services (GTS)',
      expiresAt: 'Jan 22, 2027',
      autoRenew: true,
      sanDomains: ['api.cloudmesh.dev']
    },
    dnsRecords: [
      {
        id: 'rec-04',
        type: 'CNAME',
        name: 'api',
        value: 'cname.cloudmesh-edge.net',
        ttl: '60s',
        status: 'verified',
        comment: 'REST & GraphQL edge gateway ingress target'
      }
    ],
    createdAt: '3 weeks ago',
    verifiedAt: '3 weeks ago',
    lastChecked: 'Just now'
  },
  {
    id: 'dom-04',
    domain: 'staging.cloudmesh.io',
    projectId: 'proj-02',
    projectName: 'Auth & SSO Hub',
    environment: 'Preview',
    status: 'pending_verification',
    isApex: false,
    ssl: {
      status: 'issuing',
      issuer: 'Pending Validation',
      expiresAt: '--',
      autoRenew: true,
      sanDomains: ['staging.cloudmesh.io']
    },
    dnsRecords: [
      {
        id: 'rec-05',
        type: 'CNAME',
        name: 'staging',
        value: 'cname.cloudmesh-edge.net',
        ttl: '60s',
        status: 'pending',
        comment: 'Awaiting CNAME record resolution at domain registrar'
      },
      {
        id: 'rec-06',
        type: 'TXT',
        name: '_cloudmesh-challenge.staging',
        value: 'vc-challenge=8ef84e8a4a2b97dc3f8510ba47e452a8',
        ttl: 'Auto',
        status: 'pending',
        comment: 'ACME HTTP-01 / DNS-01 pre-issuance certificate token'
      }
    ],
    createdAt: '2 hours ago',
    lastChecked: '1 min ago'
  },
  {
    id: 'dom-05',
    domain: 'docs.cloudmesh.dev',
    projectId: 'all',
    projectName: 'Documentation Engine',
    environment: 'Production',
    status: 'valid',
    isApex: false,
    ssl: {
      status: 'active',
      issuer: 'Let’s Encrypt Authority X3',
      expiresAt: 'Feb 14, 2027',
      autoRenew: true,
      sanDomains: ['docs.cloudmesh.dev']
    },
    dnsRecords: [
      {
        id: 'rec-07',
        type: 'CNAME',
        name: 'docs',
        value: 'cname.cloudmesh-edge.net',
        ttl: '60s',
        status: 'verified',
        comment: 'Edge CDN cached static markdown documentation hub'
      }
    ],
    createdAt: '1 month ago',
    verifiedAt: '1 month ago',
    lastChecked: '12 mins ago'
  }
];

export const ANYCAST_NAMESERVERS: NameserverItem[] = [
  {
    ns: 'ns1.cloudmesh-dns.com',
    ipV4: '198.51.100.1',
    ipV6: '2606:4700:50::adf5:3a5c',
    location: 'Global Anycast (North America, Europe, Asia)',
    latencyMs: 11
  },
  {
    ns: 'ns2.cloudmesh-dns.com',
    ipV4: '198.51.100.2',
    ipV6: '2606:4700:58::adf5:3b6d',
    location: 'Global Anycast (South America, Oceania, Africa)',
    latencyMs: 14
  }
];
