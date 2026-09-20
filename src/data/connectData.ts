import { SecureConnectorItem, EgressIpItem, MtlsCertificateItem, ConnectionEventLog } from '../types/connect';

export const INITIAL_CONNECTORS: SecureConnectorItem[] = [
  {
    id: 'conn-01',
    name: 'AWS US-East-1 VPC PrivateLink',
    provider: 'aws_privatelink',
    status: 'active',
    targetVpc: 'vpc-08912df49021',
    remoteEndpoint: 'vpce-0b73c4e97a221f92a.us-east-1.vpce.amazonaws.com',
    region: 'us-east-1 (N. Virginia)',
    latencyMs: 1.8,
    dataTransferGb: 1420.5,
    connectedBackends: ['Aurora PostgreSQL Cluster (prod-db-cluster)', 'Redis ElastiCache VPC Subnet'],
    protocol: 'TCP/TLS',
    mtu: 9001,
    uptimePct: 99.999,
    lastHandshake: '14s ago',
    description: 'Direct high-bandwidth AWS PrivateLink endpoint service bypassing the public internet.'
  },
  {
    id: 'conn-02',
    name: 'GCP Asia-East1 Private Service Connect',
    provider: 'gcp_psc',
    status: 'active',
    targetVpc: 'vpc-prod-asia-cluster',
    remoteEndpoint: 'psc-cloudsql-prod.asia-east1.p.googleapis.com',
    region: 'asia-east1 (Taiwan)',
    latencyMs: 2.4,
    dataTransferGb: 874.2,
    connectedBackends: ['Cloud SQL Enterprise (taiwan-replica-01)', 'Private Spanner Instance'],
    protocol: 'TCP/TLS',
    mtu: 8896,
    uptimePct: 99.995,
    lastHandshake: '22s ago',
    description: 'Zero-trust private peering gateway connecting edge workers directly to Google Cloud SQL.'
  },
  {
    id: 'conn-03',
    name: 'Frankfurt Datacenter WireGuard Mesh',
    provider: 'wireguard',
    status: 'active',
    targetVpc: 'onprem-fra-dc4',
    remoteEndpoint: 'vpn-fra4.internal.enterprise-net.de:51820',
    region: 'eu-central-1 (Frankfurt)',
    latencyMs: 14.1,
    dataTransferGb: 432.8,
    connectedBackends: ['Core Banking Settlement API (ISO 20022)', 'On-Premises LDAP & SAP ERP'],
    protocol: 'WireGuard (Noise)',
    mtu: 1420,
    uptimePct: 99.98,
    lastHandshake: '8s ago',
    description: 'Hardware-accelerated ChaCha20-Poly1305 encrypted VPN tunnel directly to Frankfurt colocation.'
  },
  {
    id: 'conn-04',
    name: 'Azure West-US-2 Private Endpoint',
    provider: 'azure_privatelink',
    status: 'active',
    targetVpc: 'vnet-prod-westus2',
    remoteEndpoint: 'privatelink.documents.azure.com (pe-cosmos-9821)',
    region: 'westus2 (Washington)',
    latencyMs: 3.2,
    dataTransferGb: 310.6,
    connectedBackends: ['Cosmos DB Multi-Region Write Container'],
    protocol: 'TCP/TLS',
    mtu: 1500,
    uptimePct: 100.0,
    lastHandshake: '18s ago',
    description: 'Managed Microsoft Azure backbone connectivity for global transactional state storage.'
  },
  {
    id: 'conn-05',
    name: 'Dublin Backup IPsec IKEv2 Tunnel',
    provider: 'ipsec_vpn',
    status: 'active',
    targetVpc: 'dublin-dc-legacy',
    remoteEndpoint: 'gw-dub1.enterprise-corp.eu:4500',
    region: 'eu-west-1 (Dublin)',
    latencyMs: 18.6,
    dataTransferGb: 78.4,
    connectedBackends: ['Cold Archive SAN & Financial Ledger'],
    protocol: 'IPSec/IKEv2',
    mtu: 1350,
    uptimePct: 99.94,
    lastHandshake: '45s ago',
    description: 'BGP dual-tunnel fallback gateway with automatic dead peer detection.'
  }
];

export const DEDICATED_EGRESS_IPS: EgressIpItem[] = [
  {
    ip: '198.51.100.40',
    cidr: '198.51.100.40/32',
    zone: 'us-east-1a (Primary NAT)',
    providerAsn: 'AS15169 (Global Mesh)',
    status: 'active',
    lastHealthCheck: 'Healthy (1s ago)'
  },
  {
    ip: '198.51.100.41',
    cidr: '198.51.100.41/32',
    zone: 'us-east-1b (Secondary Failover)',
    providerAsn: 'AS15169 (Global Mesh)',
    status: 'active',
    lastHealthCheck: 'Healthy (1s ago)'
  },
  {
    ip: '203.0.113.88',
    cidr: '203.0.113.88/32',
    zone: 'eu-central-1a (Europe Egress)',
    providerAsn: 'AS15169 (Global Mesh)',
    status: 'active',
    lastHealthCheck: 'Healthy (3s ago)'
  },
  {
    ip: '203.0.113.89',
    cidr: '203.0.113.89/32',
    zone: 'asia-east1-a (APAC Egress)',
    providerAsn: 'AS15169 (Global Mesh)',
    status: 'active',
    lastHealthCheck: 'Healthy (2s ago)'
  }
];

export const MTLS_CERTIFICATES: MtlsCertificateItem[] = [
  {
    id: 'cert-01',
    name: 'Enterprise Core Banking mTLS Client Cert',
    commonName: 'edge-client.cloudmesh.enterprise.internal',
    issuer: 'DigiCert Private Enterprise Sub-CA 2',
    fingerprintSha256: '9f:28:b7:40:1c:bb:89:4f:27:56:80:19:a2:75:46:85:38:ee:c4:cb',
    expiresAt: 'Dec 14, 2026',
    daysRemaining: 85,
    status: 'valid',
    attachedConnectors: ['Frankfurt Datacenter WireGuard Mesh']
  },
  {
    id: 'cert-02',
    name: 'Aurora PostgreSQL Mutual Auth Certificate',
    commonName: 'db-applet-worker.internal',
    issuer: 'Amazon Private Certificate Authority',
    fingerprintSha256: 'a4:b2:75:46:85:38:ee:c4:cb:bd:cf:5f:66:10:7a:6d:5c:64:c7:6b',
    expiresAt: 'Mar 30, 2027',
    daysRemaining: 191,
    status: 'valid',
    attachedConnectors: ['AWS US-East-1 VPC PrivateLink']
  }
];

export const INITIAL_CONNECTION_EVENTS: ConnectionEventLog[] = [
  {
    id: 'evt-01',
    timestamp: '10:56:42',
    connectorName: 'AWS US-East-1 VPC PrivateLink',
    eventType: 'handshake',
    message: 'BGP session established with VPC router; 0 packet loss',
    latencyMs: 1.8
  },
  {
    id: 'evt-02',
    timestamp: '10:55:10',
    connectorName: 'Frankfurt Datacenter WireGuard Mesh',
    eventType: 'rekey',
    message: 'WireGuard cryptographic session re-key completed using Curve25519',
    latencyMs: 14.2
  },
  {
    id: 'evt-03',
    timestamp: '10:52:33',
    connectorName: 'GCP Asia-East1 Private Service Connect',
    eventType: 'healthcheck',
    message: 'Active synthetic probe succeeded against psc-cloudsql-prod',
    latencyMs: 2.3
  },
  {
    id: 'evt-04',
    timestamp: '10:48:19',
    connectorName: 'Dublin Backup IPsec IKEv2 Tunnel',
    eventType: 'healthcheck',
    message: 'Dead Peer Detection (DPD) keep-alive ACK received in 18ms',
    latencyMs: 18.6
  }
];
