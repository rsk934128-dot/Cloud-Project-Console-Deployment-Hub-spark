export type ConnectionProvider = 'aws_privatelink' | 'gcp_psc' | 'azure_privatelink' | 'wireguard' | 'ipsec_vpn';
export type ConnectionStatus = 'active' | 'degraded' | 'provisioning' | 'offline';

export interface SecureConnectorItem {
  id: string;
  name: string;
  provider: ConnectionProvider;
  status: ConnectionStatus;
  targetVpc: string;
  remoteEndpoint: string;
  region: string;
  latencyMs: number;
  dataTransferGb: number;
  connectedBackends: string[];
  protocol: 'TCP/TLS' | 'IPSec/IKEv2' | 'WireGuard (Noise)' | 'HTTP/2 mTLS';
  mtu: number;
  uptimePct: number;
  lastHandshake: string;
  description: string;
}

export interface EgressIpItem {
  ip: string;
  cidr: string;
  zone: string;
  providerAsn: string;
  status: 'active' | 'standby';
  lastHealthCheck: string;
}

export interface MtlsCertificateItem {
  id: string;
  name: string;
  commonName: string;
  issuer: string;
  fingerprintSha256: string;
  expiresAt: string;
  daysRemaining: number;
  status: 'valid' | 'expiring_soon' | 'revoked';
  attachedConnectors: string[];
}

export interface ConnectionEventLog {
  id: string;
  timestamp: string;
  connectorName: string;
  eventType: 'handshake' | 'failover' | 'rekey' | 'healthcheck' | 'warning';
  message: string;
  latencyMs?: number;
}
