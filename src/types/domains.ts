export type DomainStatus = 'valid' | 'pending_verification' | 'invalid_config' | 'issuing_cert';
export type SslStatus = 'active' | 'issuing' | 'expired' | 'failed';
export type DnsRecordType = 'A' | 'CNAME' | 'TXT' | 'AAAA' | 'MX';
export type DnsRecordStatus = 'verified' | 'pending' | 'conflict';

export interface DnsRecord {
  id: string;
  type: DnsRecordType;
  name: string;
  value: string;
  ttl: string;
  status: DnsRecordStatus;
  comment?: string;
}

export interface CustomDomainItem {
  id: string;
  domain: string;
  projectId: string;
  projectName: string;
  environment: 'Production' | 'Preview';
  status: DomainStatus;
  isApex: boolean;
  apexRedirect?: {
    enabled: boolean;
    target: string;
    statusCode: 301 | 302 | 308;
  };
  ssl: {
    status: SslStatus;
    issuer: string;
    expiresAt: string;
    autoRenew: boolean;
    sanDomains: string[];
  };
  dnsRecords: DnsRecord[];
  createdAt: string;
  verifiedAt?: string;
  lastChecked: string;
}

export interface NameserverItem {
  ns: string;
  ipV4: string;
  ipV6: string;
  location: string;
  latencyMs: number;
}
