import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import { 
  SecureConnectorItem, 
  EgressIpItem, 
  MtlsCertificateItem, 
  ConnectionEventLog, 
  ConnectionProvider 
} from '../types/connect';
import { 
  INITIAL_CONNECTORS, 
  DEDICATED_EGRESS_IPS, 
  MTLS_CERTIFICATES, 
  INITIAL_CONNECTION_EVENTS 
} from '../data/connectData';
import {
  Layers,
  ShieldCheck,
  Server,
  Network,
  Activity,
  Plus,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  Lock,
  Radio,
  ArrowUpRight,
  Sliders,
  Sparkles,
  Info,
  Clock,
  Terminal,
  X,
  ChevronDown,
  Check,
  Trash2,
  FileCode
} from 'lucide-react';

interface ConnectConsoleProps {
  projects: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
}

export const ConnectConsole: React.FC<ConnectConsoleProps> = ({ projects }) => {
  const [activeTab, setActiveTab] = useState<'connectors' | 'egress_ips' | 'mtls' | 'events'>('connectors');
  const [providerFilter, setProviderFilter] = useState<'all' | ConnectionProvider>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [connectors, setConnectors] = useState<SecureConnectorItem[]>(INITIAL_CONNECTORS);
  const [egressIps] = useState<EgressIpItem[]>(DEDICATED_EGRESS_IPS);
  const [certificates, setCertificates] = useState<MtlsCertificateItem[]>(MTLS_CERTIFICATES);
  const [events, setEvents] = useState<ConnectionEventLog[]>(INITIAL_CONNECTION_EVENTS);

  // Ping simulation state
  const [pingingId, setPingingId] = useState<string | null>(null);

  // Probe tool state
  const [probeHost, setProbeHost] = useState<string>('10.0.4.18:5432');
  const [probing, setProbing] = useState<boolean>(false);
  const [probeResult, setProbeResult] = useState<{
    success: boolean;
    egressIp: string;
    rttMs: number;
    handshake: string;
    timestamp: string;
  } | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Connector Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>('');
  const [formProvider, setFormProvider] = useState<ConnectionProvider>('aws_privatelink');
  const [formTargetVpc, setFormTargetVpc] = useState<string>('');
  const [formEndpoint, setFormEndpoint] = useState<string>('');
  const [formRegion, setFormRegion] = useState<string>('us-east-1 (N. Virginia)');
  const [formBackends, setFormBackends] = useState<string>('');

  // Add Certificate Modal
  const [isAddCertModalOpen, setIsAddCertModalOpen] = useState<boolean>(false);
  const [certName, setCertName] = useState<string>('');
  const [certCn, setCertCn] = useState<string>('');
  const [certIssuer, setCertIssuer] = useState<string>('');

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard.`);
  };

  // Ping connector simulation
  const handlePingConnector = (conn: SecureConnectorItem) => {
    setPingingId(conn.id);
    showToast(`Dispatching synthetic packet probe across ${conn.name}...`);

    setTimeout(() => {
      const simulatedLatency = Number((conn.latencyMs * (0.9 + Math.random() * 0.2)).toFixed(1));
      
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === conn.id
            ? { ...c, latencyMs: simulatedLatency, lastHandshake: 'Just now' }
            : c
        )
      );

      const newEvt: ConnectionEventLog = {
        id: `evt-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        connectorName: conn.name,
        eventType: 'healthcheck',
        message: `Synthetic probe successful. Round-trip latency: ${simulatedLatency}ms. MTU verified (${conn.mtu} bytes).`,
        latencyMs: simulatedLatency
      };
      setEvents((prev) => [newEvt, ...prev]);

      setPingingId(null);
      showToast(`Handshake ACK confirmed: ${simulatedLatency}ms latency.`);
    }, 1000);
  };

  // Socket probe simulation
  const handleRunProbe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!probeHost.trim()) return;

    setProbing(true);
    setProbeResult(null);

    setTimeout(() => {
      setProbing(false);
      setProbeResult({
        success: true,
        egressIp: egressIps[0].ip,
        rttMs: 2.1,
        handshake: 'TCP SYN-ACK verified; TLS 1.3 ALPN renegotiated',
        timestamp: new Date().toLocaleTimeString()
      });
      showToast(`Outbound probe to ${probeHost} verified.`);
    }, 1100);
  };

  // Add Connector Submit
  const handleAddConnectorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEndpoint.trim()) return;

    const backends = formBackends
      .split(',')
      .map((b) => b.trim())
      .filter(Boolean);

    const newConnector: SecureConnectorItem = {
      id: `conn-${Date.now()}`,
      name: formName.trim(),
      provider: formProvider,
      status: 'active',
      targetVpc: formTargetVpc.trim() || 'vpc-default-custom',
      remoteEndpoint: formEndpoint.trim(),
      region: formRegion,
      latencyMs: 2.5,
      dataTransferGb: 0.1,
      connectedBackends: backends.length > 0 ? backends : ['Private Backend Resource'],
      protocol: formProvider === 'wireguard' ? 'WireGuard (Noise)' : formProvider === 'ipsec_vpn' ? 'IPSec/IKEv2' : 'TCP/TLS',
      mtu: formProvider === 'wireguard' ? 1420 : 9001,
      uptimePct: 100.0,
      lastHandshake: 'Just now',
      description: `Managed private interconnect linked via ${formProvider.toUpperCase().replace('_', ' ')}.`
    };

    setConnectors((prev) => [newConnector, ...prev]);
    setIsAddModalOpen(false);
    setFormName('');
    setFormEndpoint('');
    setFormTargetVpc('');
    setFormBackends('');
    showToast(`Successfully created ${newConnector.name}. Routing active.`);
  };

  // Add Certificate Submit
  const handleAddCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certCn.trim()) return;

    const newCert: MtlsCertificateItem = {
      id: `cert-${Date.now()}`,
      name: certName.trim(),
      commonName: certCn.trim(),
      issuer: certIssuer.trim() || 'Enterprise Internal Root CA',
      fingerprintSha256: Array.from({ length: 20 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join(':'),
      expiresAt: 'Sep 20, 2027',
      daysRemaining: 365,
      status: 'valid',
      attachedConnectors: ['AWS US-East-1 VPC PrivateLink']
    };

    setCertificates((prev) => [newCert, ...prev]);
    setIsAddCertModalOpen(false);
    setCertName('');
    setCertCn('');
    setCertIssuer('');
    showToast(`Registered mTLS client certificate: ${newCert.name}`);
  };

  // Delete connector
  const handleDeleteConnector = (id: string, name: string) => {
    setConnectors((prev) => prev.filter((c) => c.id !== id));
    showToast(`Removed connector: ${name}`);
  };

  // Filtered connectors
  const filteredConnectors = useMemo(() => {
    return connectors.filter((c) => {
      const matchProvider = providerFilter === 'all' || c.provider === providerFilter;
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.remoteEndpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.targetVpc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.connectedBackends.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchProvider && matchSearch;
    });
  }, [connectors, providerFilter, searchQuery]);

  // Provider badge renderer
  const renderProviderBadge = (provider: ConnectionProvider) => {
    switch (provider) {
      case 'aws_privatelink':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
            AWS PrivateLink
          </span>
        );
      case 'gcp_psc':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950/80 text-blue-300 border border-blue-800">
            GCP Private Service Connect
          </span>
        );
      case 'azure_privatelink':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
            Azure Private Link
          </span>
        );
      case 'wireguard':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-300 border border-rose-800">
            WireGuard Mesh
          </span>
        );
      case 'ipsec_vpn':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-800">
            IPsec IKEv2
          </span>
        );
    }
  };

  return (
    <div id="connect-console-root" className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white border border-neutral-700 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Global Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Connect: Secure VPC & On-Premises Interconnect
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Zero-trust private networking linking serverless edge functions to private cloud VPCs, on-prem databases, and dedicated egress IP pools.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Copy All Egress IPs */}
          <button
            id="btn-copy-egress-cidrs"
            onClick={() => handleCopy(egressIps.map((ip) => ip.cidr).join('\n'), 'Egress CIDR pool')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-neutral-400" />
            <span>Copy Outbound CIDRs</span>
          </button>

          {/* Add Secure Connection */}
          <button
            id="btn-create-secure-connector"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Private Connector</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Active Private Connectors</span>
            <Network className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{connectors.length}</div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>100% Tunnel Uptime</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Dedicated Static Egress IPs</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{egressIps.length} IPs</div>
          <div className="text-[11px] text-cyan-400 font-mono">
            Dual-AZ NAT Redundancy
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Median Interconnect Latency</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">2.4 ms</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Sub-3ms private VPC routing
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Private Routed Traffic</span>
            <ArrowUpRight className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">3.12 TB</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Encrypted in-transit
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-px text-xs font-semibold">
        <button
          id="tab-connectors"
          onClick={() => setActiveTab('connectors')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'connectors'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Network className="w-4 h-4" />
          Secure Connectors ({connectors.length})
        </button>

        <button
          id="tab-egress-ips"
          onClick={() => setActiveTab('egress_ips')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'egress_ips'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Server className="w-4 h-4" />
          Static Outbound Egress IPs ({egressIps.length})
        </button>

        <button
          id="tab-mtls-certs"
          onClick={() => setActiveTab('mtls')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'mtls'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          mTLS Client Certificates ({certificates.length})
        </button>

        <button
          id="tab-connection-events"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'events'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Tunnel Diagnostics & Events ({events.length})
        </button>
      </div>

      {/* TAB 1: SECURE CONNECTORS */}
      {activeTab === 'connectors' && (
        <div className="space-y-4">
          {/* Controls & Filtering */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'aws_privatelink', 'gcp_psc', 'azure_privatelink', 'wireguard', 'ipsec_vpn'] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => setProviderFilter(prov)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    providerFilter === prov
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                  }`}
                >
                  {prov === 'all'
                    ? 'All Providers'
                    : prov === 'aws_privatelink'
                    ? 'AWS'
                    : prov === 'gcp_psc'
                    ? 'GCP'
                    : prov === 'azure_privatelink'
                    ? 'Azure'
                    : prov === 'wireguard'
                    ? 'WireGuard'
                    : 'IPSec'}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search VPC, endpoint, backend..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
              />
            </div>
          </div>

          {/* Connectors List */}
          <div className="space-y-3">
            {filteredConnectors.map((conn) => {
              const isPinging = pingingId === conn.id;

              return (
                <div
                  key={conn.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 hover:border-neutral-700/80 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start md:items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-indigo-400 shrink-0">
                        <Network className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-sm font-bold text-white">{conn.name}</h3>
                          {renderProviderBadge(conn.provider)}
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                          <span className="text-[10px] font-mono text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                            MTU {conn.mtu}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">{conn.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {/* Diagnostic Ping Probe Button */}
                      <button
                        onClick={() => handlePingConnector(conn)}
                        disabled={isPinging}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        title="Execute synthetic latency probe"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-indigo-400' : 'text-neutral-400'}`} />
                        <span>{isPinging ? 'Probing...' : 'Test Handshake'}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteConnector(conn.id, conn.name)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-neutral-800"
                        title="Disconnect"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-950/80 border border-neutral-800/80 rounded-lg p-3 text-xs font-mono">
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-sans">Remote Endpoint</div>
                      <div className="text-neutral-300 truncate mt-0.5 flex items-center gap-1" title={conn.remoteEndpoint}>
                        <span className="truncate">{conn.remoteEndpoint}</span>
                        <button
                          onClick={() => handleCopy(conn.remoteEndpoint, 'Remote Endpoint')}
                          className="text-neutral-500 hover:text-white shrink-0"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-sans">Target VPC</div>
                      <div className="text-indigo-300 mt-0.5">{conn.targetVpc}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-sans">RTT Latency / Region</div>
                      <div className="text-emerald-400 mt-0.5 font-bold flex items-center gap-1">
                        <span>{conn.latencyMs} ms</span>
                        <span className="text-neutral-500 font-normal">({conn.region.split(' ')[0]})</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-sans">Routed Data / Uptime</div>
                      <div className="text-neutral-300 mt-0.5">
                        {conn.dataTransferGb.toLocaleString()} GB <span className="text-neutral-500">({conn.uptimePct}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Connected Internal Backends */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Connected Private Backends & Services</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {conn.connectedBackends.map((b, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 flex items-center gap-1.5"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>{b}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: DEDICATED STATIC EGRESS IPS */}
      {activeTab === 'egress_ips' && (
        <div className="space-y-5">
          {/* Egress Pool Summary */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Reserved Static Outbound Egress IP Pool
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Whitelist these dedicated IP ranges in your enterprise firewall, AWS Security Groups, or database IP access lists.
                </p>
              </div>

              <button
                onClick={() => handleCopy(egressIps.map((ip) => ip.cidr).join('\n'), 'CIDR List')}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy All CIDRs</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {egressIps.map((ip, idx) => (
                <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{ip.cidr}</span>
                      <button
                        onClick={() => handleCopy(ip.ip, 'IP address')}
                        className="text-neutral-500 hover:text-white"
                        title="Copy IP"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{ip.status}</span>
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 space-y-0.5">
                    <div>Zone: <span className="text-neutral-300">{ip.zone}</span></div>
                    <div>Routing ASN: <span className="text-neutral-300">{ip.providerAsn}</span></div>
                  </div>

                  <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/80">
                    Health: {ip.lastHealthCheck}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Socket Connectivity Tester */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Egress Socket Connectivity & Whitelist Tester
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Simulate an outbound TCP SYN handshake directly from our dedicated egress IP pool to verify your firewall rules.
              </p>
            </div>

            <form onSubmit={handleRunProbe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                required
                placeholder="e.g. 10.0.4.18:5432 or db.mycompany.internal:3306"
                value={probeHost}
                onChange={(e) => setProbeHost(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={probing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${probing ? 'animate-spin' : ''}`} />
                <span>{probing ? 'Probing Handshake...' : 'Run Outbound Socket Test'}</span>
              </button>
            </form>

            {probeResult && (
              <div className="bg-neutral-950 border border-emerald-900/60 rounded-lg p-4 space-y-2 text-xs font-mono animate-in fade-in">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Socket Handshake Established (HTTP/TCP Verified)</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-normal">{probeResult.timestamp}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-neutral-300 pt-1 border-t border-neutral-800/80">
                  <div>Source Egress IP: <strong className="text-white">{probeResult.egressIp}</strong></div>
                  <div>Round-Trip Time: <strong className="text-emerald-400">{probeResult.rttMs} ms</strong></div>
                  <div className="sm:col-span-1 truncate">Status: <span className="text-neutral-400">{probeResult.handshake}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: mTLS CLIENT CERTIFICATES */}
      {activeTab === 'mtls' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Mutual TLS (mTLS) Client Identity Certificates
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Cryptographic client certificates presented during TLS handshakes when accessing regulated core banking or private databases.
              </p>
            </div>

            <button
              onClick={() => setIsAddCertModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Client Certificate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-white">{cert.name}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {cert.daysRemaining} days remaining
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Subject CN: <span className="font-mono text-neutral-300">{cert.commonName}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-400 font-mono">
                    Issuer: <span className="text-neutral-300">{cert.issuer}</span>
                  </div>
                </div>

                <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-[11px] font-mono text-neutral-400 flex items-center justify-between">
                  <div className="truncate">SHA-256 Fingerprint: <span className="text-neutral-300">{cert.fingerprintSha256}</span></div>
                  <button
                    onClick={() => handleCopy(cert.fingerprintSha256, 'Certificate Fingerprint')}
                    className="text-neutral-500 hover:text-white shrink-0 ml-2"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span>Attached to:</span>
                  {cert.attachedConnectors.map((c, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded text-[11px] font-mono">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TUNNEL DIAGNOSTICS & EVENTS */}
      {activeTab === 'events' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Live Interconnect Telemetry & BGP Handshake Logs
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Real-time audit log of BGP state changes, WireGuard re-keys, dead peer detections, and synthetic probes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3">Timestamp</th>
                  <th className="pb-3">Connector</th>
                  <th className="pb-3">Event Type</th>
                  <th className="pb-3">Diagnostic Message</th>
                  <th className="pb-3 pr-3 text-right">RTT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 pl-3 text-neutral-400">{evt.timestamp}</td>
                    <td className="py-3 font-bold text-white font-sans">{evt.connectorName}</td>
                    <td className="py-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.eventType === 'handshake'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : evt.eventType === 'rekey'
                          ? 'bg-purple-950 text-purple-300 border border-purple-800'
                          : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      }`}>
                        {evt.eventType}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-300">{evt.message}</td>
                    <td className="py-3 pr-3 text-right text-emerald-400">
                      {evt.latencyMs ? `${evt.latencyMs}ms` : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRIVATE CONNECTOR */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-400" />
                Create Private Interconnect Connector
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddConnectorSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Connector Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS US-West RDS PrivateLink"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Interconnect Provider</label>
                  <select
                    value={formProvider}
                    onChange={(e) => setFormProvider(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="aws_privatelink">AWS PrivateLink</option>
                    <option value="gcp_psc">GCP Private Service Connect</option>
                    <option value="azure_privatelink">Azure Private Link</option>
                    <option value="wireguard">WireGuard VPN Mesh</option>
                    <option value="ipsec_vpn">IPsec IKEv2 Tunnel</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Region</label>
                  <select
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="us-east-1 (N. Virginia)">us-east-1 (N. Virginia)</option>
                    <option value="us-west-2 (Oregon)">us-west-2 (Oregon)</option>
                    <option value="eu-central-1 (Frankfurt)">eu-central-1 (Frankfurt)</option>
                    <option value="asia-east1 (Taiwan)">asia-east1 (Taiwan)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Remote Endpoint DNS / IP</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vpce-0b73c4e97a.us-east-1.vpce.amazonaws.com"
                  value={formEndpoint}
                  onChange={(e) => setFormEndpoint(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Target VPC ID / Subnet</label>
                <input
                  type="text"
                  placeholder="e.g. vpc-08912df49021"
                  value={formTargetVpc}
                  onChange={(e) => setFormTargetVpc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Connected Backends (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. PostgreSQL Cluster, Redis Subnet"
                  value={formBackends}
                  onChange={(e) => setFormBackends(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  Provision Connector
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD CLIENT CERT */}
      {isAddCertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                Register mTLS Client Certificate
              </h3>
              <button
                onClick={() => setIsAddCertModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCertSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Certificate Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Payment Core mTLS"
                  value={certName}
                  onChange={(e) => setCertName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Subject Common Name (CN)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. client-worker.bank.internal"
                  value={certCn}
                  onChange={(e) => setCertCn(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Certificate Authority (Issuer)</label>
                <input
                  type="text"
                  placeholder="e.g. DigiCert Private Enterprise CA"
                  value={certIssuer}
                  onChange={(e) => setCertIssuer(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddCertModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
                >
                  Register Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
