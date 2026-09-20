import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import { CustomDomainItem, DomainStatus, DnsRecord, NameserverItem } from '../types/domains';
import { INITIAL_DOMAINS, ANYCAST_NAMESERVERS } from '../data/domainsData';
import {
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sliders,
  Server,
  Lock,
  Layers,
  Sparkles,
  Info,
  X,
  Radio,
  FileCode
} from 'lucide-react';

interface DomainsConsoleProps {
  projects: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
}

export const DomainsConsole: React.FC<DomainsConsoleProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'domains' | 'dns' | 'ssl'>('domains');
  const [envFilter, setEnvFilter] = useState<'all' | 'Production' | 'Preview'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [domains, setDomains] = useState<CustomDomainItem[]>(INITIAL_DOMAINS);
  const [nameservers] = useState<NameserverItem[]>(ANYCAST_NAMESERVERS);

  // Expanded DNS cards
  const [expandedDomainIds, setExpandedDomainIds] = useState<Record<string, boolean>>({
    'dom-04': true // expand pending verification domain by default
  });

  // Revalidating state
  const [isCheckingDns, setIsCheckingDns] = useState<boolean>(false);

  // Security Toggles
  const [forceHttps, setForceHttps] = useState<boolean>(true);
  const [hstsPreload, setHstsPreload] = useState<boolean>(true);
  const [minTlsVersion, setMinTlsVersion] = useState<'TLS 1.2' | 'TLS 1.3'>('TLS 1.3');
  const [preferredCa, setPreferredCa] = useState<'lets_encrypt' | 'gts'>('lets_encrypt');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add Domain Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newDomainInput, setNewDomainInput] = useState<string>('');
  const [newDomainProject, setNewDomainProject] = useState<string>('all');
  const [newDomainEnv, setNewDomainEnv] = useState<'Production' | 'Preview'>('Production');
  const [newDomainRedirectWww, setNewDomainRedirectWww] = useState<boolean>(true);

  // Add Custom DNS Record Modal
  const [isAddDnsRecordModalOpen, setIsAddDnsRecordModalOpen] = useState<boolean>(false);
  const [newDnsType, setNewDnsType] = useState<'A' | 'CNAME' | 'TXT' | 'AAAA' | 'MX'>('CNAME');
  const [newDnsName, setNewDnsName] = useState<string>('');
  const [newDnsValue, setNewDnsValue] = useState<string>('');
  const [newDnsTtl, setNewDnsTtl] = useState<string>('60s');

  const toggleExpand = (id: string) => {
    setExpandedDomainIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard.`);
  };

  // Verify DNS simulation
  const handleVerifyDns = (domainItem: CustomDomainItem) => {
    setIsCheckingDns(true);
    showToast(`Querying authoritative Anycast nameservers for ${domainItem.domain}...`);

    setTimeout(() => {
      setDomains((prev) =>
        prev.map((d) => {
          if (d.id === domainItem.id) {
            return {
              ...d,
              status: 'valid',
              ssl: {
                ...d.ssl,
                status: 'active',
                issuer: "Let's Encrypt Authority X3",
                expiresAt: 'Dec 18, 2026'
              },
              dnsRecords: d.dnsRecords.map((r) => ({ ...r, status: 'verified' })),
              verifiedAt: 'Just now',
              lastChecked: 'Just now'
            };
          }
          return d;
        })
      );
      setIsCheckingDns(false);
      showToast(`DNS records successfully verified! Certificate issued for ${domainItem.domain}.`);
    }, 1200);
  };

  // Delete Domain
  const handleDeleteDomain = (id: string, domainName: string) => {
    setDomains((prev) => prev.filter((d) => d.id !== id));
    showToast(`Removed custom domain: ${domainName}`);
  };

  // Add new domain submit
  const handleAddDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!clean) return;

    const isApex = clean.split('.').length === 2;
    const projName = newDomainProject === 'all' ? 'Global Router' : (projects.find((p) => p.id === newDomainProject)?.displayName || 'Project');

    const newRecords: DnsRecord[] = isApex
      ? [
          {
            id: `rec-${Date.now()}-1`,
            type: 'A',
            name: '@',
            value: '76.76.21.21',
            ttl: '60s',
            status: 'pending',
            comment: 'Point root apex domain to Cloudmesh Anycast IP'
          },
          {
            id: `rec-${Date.now()}-2`,
            type: 'TXT',
            name: '_cloudmesh-challenge',
            value: `vc-challenge=${Math.random().toString(36).substring(2, 18)}`,
            ttl: 'Auto',
            status: 'pending',
            comment: 'Zero-configuration TLS verification token'
          }
        ]
      : [
          {
            id: `rec-${Date.now()}-1`,
            type: 'CNAME',
            name: clean.split('.')[0],
            value: 'cname.cloudmesh-edge.net',
            ttl: '60s',
            status: 'pending',
            comment: 'Canonical alias pointing to Global Edge Network'
          }
        ];

    const newDomain: CustomDomainItem = {
      id: `dom-${Date.now()}`,
      domain: clean,
      projectId: newDomainProject,
      projectName: projName,
      environment: newDomainEnv,
      status: 'pending_verification',
      isApex,
      apexRedirect: isApex && newDomainRedirectWww ? {
        enabled: true,
        target: `www.${clean}`,
        statusCode: 308
      } : undefined,
      ssl: {
        status: 'issuing',
        issuer: 'Pending DNS Validation',
        expiresAt: '--',
        autoRenew: true,
        sanDomains: [clean]
      },
      dnsRecords: newRecords,
      createdAt: 'Just now',
      lastChecked: 'Just now'
    };

    setDomains((prev) => [newDomain, ...prev]);
    setExpandedDomainIds((prev) => ({ ...prev, [newDomain.id]: true }));
    setIsAddModalOpen(false);
    setNewDomainInput('');
    showToast(`Added ${clean}. Configure your registrar DNS records to verify.`);
  };

  // Add custom DNS record submit
  const handleAddDnsRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDnsName.trim() || !newDnsValue.trim()) return;

    // Attach to primary domain (cloudmesh.dev)
    setDomains((prev) =>
      prev.map((d) => {
        if (d.domain === 'cloudmesh.dev') {
          const newRec: DnsRecord = {
            id: `rec-${Date.now()}`,
            type: newDnsType,
            name: newDnsName.trim(),
            value: newDnsValue.trim(),
            ttl: newDnsTtl,
            status: 'verified',
            comment: 'Custom authoritative record'
          };
          return {
            ...d,
            dnsRecords: [...d.dnsRecords, newRec]
          };
        }
        return d;
      })
    );

    setIsAddDnsRecordModalOpen(false);
    setNewDnsName('');
    setNewDnsValue('');
    showToast(`Added ${newDnsType} record: ${newDnsName}`);
  };

  // Filtered domains
  const filteredDomains = useMemo(() => {
    return domains.filter((d) => {
      const matchProj = selectedProjectId === 'all' || d.projectId === selectedProjectId;
      const matchEnv = envFilter === 'all' || d.environment === envFilter;
      const matchSearch =
        d.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.projectName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchProj && matchEnv && matchSearch;
    });
  }, [domains, selectedProjectId, envFilter, searchQuery]);

  // Status badge styling
  const renderStatusBadge = (status: DomainStatus) => {
    switch (status) {
      case 'valid':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Valid & Routing</span>
          </span>
        );
      case 'pending_verification':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Pending DNS</span>
          </span>
        );
      case 'issuing_cert':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-800">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>Issuing TLS</span>
          </span>
        );
      case 'invalid_config':
        return (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-800">
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Invalid Configuration</span>
          </span>
        );
    }
  };

  return (
    <div id="domains-console-root" className="space-y-6">
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
            <Globe className="w-5 h-5 text-indigo-400" />
            Domains, Anycast DNS & Edge Routing
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure custom domains, automated ACME SSL/TLS certificates, apex 308 redirects, and Anycast authoritative records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Check DNS */}
          <button
            id="btn-recheck-all-dns"
            onClick={() => {
              setIsCheckingDns(true);
              setTimeout(() => {
                setIsCheckingDns(false);
                showToast('Authoritative DNS revalidation complete. All active records routing correctly.');
              }, 1000);
            }}
            disabled={isCheckingDns}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDns ? 'animate-spin text-indigo-400' : 'text-neutral-400'}`} />
            <span>Check All DNS</span>
          </button>

          {/* Project Filter */}
          <div className="relative">
            <select
              id="domains-project-selector"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:border-neutral-700 cursor-pointer shadow-xs"
            >
              <option value="all">All Projects (Global Scope)</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.displayName} ({proj.environment})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Add Domain Button */}
          <button
            id="btn-add-custom-domain"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Domain</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Configured Domains</span>
            <Globe className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{domains.length}</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            {domains.filter((d) => d.status === 'valid').length} Routing / {domains.filter((d) => d.status === 'pending_verification').length} Pending
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Managed SSL/TLS</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">100%</div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Automated ACME Renewal</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Anycast DNS Latency</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">12 ms</div>
          <div className="text-[11px] text-cyan-400 font-mono">
            p50 across 320 Edge PoPs
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Apex 308 Redirects</span>
            <ArrowRight className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {domains.filter((d) => d.apexRedirect?.enabled).length} Active
          </div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Zero-hop edge redirect
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-px text-xs font-semibold">
        <button
          id="tab-custom-domains"
          onClick={() => setActiveTab('domains')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'domains'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          Custom Domains ({domains.length})
        </button>

        <button
          id="tab-authoritative-dns"
          onClick={() => setActiveTab('dns')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'dns'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Server className="w-4 h-4" />
          Authoritative Anycast Nameservers & Records
        </button>

        <button
          id="tab-ssl-security"
          onClick={() => setActiveTab('ssl')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ssl'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          SSL/TLS & Edge Security Policies
        </button>
      </div>

      {/* TAB 1: CUSTOM DOMAINS */}
      {activeTab === 'domains' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'Production', 'Preview'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => setEnvFilter(env)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors capitalize ${
                    envFilter === env
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                  }`}
                >
                  {env === 'all' ? 'All Environments' : `${env} Only`}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search domain or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
              />
            </div>
          </div>

          {/* Domain Cards List */}
          <div className="space-y-3">
            {filteredDomains.map((dom) => {
              const isExpanded = !!expandedDomainIds[dom.id];

              return (
                <div
                  key={dom.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden transition-all hover:border-neutral-700/80"
                >
                  {/* Top Bar Summary */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start md:items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-indigo-400 shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <a
                            href={`https://${dom.domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                          >
                            <span>{dom.domain}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                          </a>

                          {renderStatusBadge(dom.status)}

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              dom.environment === 'Production'
                                ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                                : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                            }`}
                          >
                            {dom.environment}
                          </span>

                          {dom.isApex && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                              Apex Domain
                            </span>
                          )}

                          {dom.apexRedirect?.enabled && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center gap-1">
                              <span>Redirects to {dom.apexRedirect.target}</span>
                              <span className="text-neutral-400">(308)</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-neutral-400 flex-wrap">
                          <span>Target: <strong className="text-neutral-300">{dom.projectName}</strong></span>
                          <span>•</span>
                          <span>SSL: <strong className="text-neutral-300">{dom.ssl.issuer}</strong> ({dom.ssl.expiresAt})</span>
                          <span>•</span>
                          <span>Last checked: {dom.lastChecked}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions on Card */}
                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      {dom.status === 'pending_verification' && (
                        <button
                          onClick={() => handleVerifyDns(dom)}
                          disabled={isCheckingDns}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDns ? 'animate-spin' : ''}`} />
                          <span>Verify DNS Records</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleExpand(dom.id)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <span>DNS Configuration</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleDeleteDomain(dom.id, dom.domain)}
                        className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-neutral-800"
                        title="Remove Domain"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable DNS Records Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-neutral-800 bg-neutral-950/60 p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
                          <Server className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Required DNS Records at your Registrar</span>
                        </div>
                        <span className="text-[11px] text-neutral-500 font-mono">
                          TTL recommended: 60s
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
                        <table className="w-full text-left text-xs text-neutral-300">
                          <thead>
                            <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-900/60">
                              <th className="py-2.5 pl-3">Type</th>
                              <th className="py-2.5">Name</th>
                              <th className="py-2.5">Value / Target</th>
                              <th className="py-2.5">TTL</th>
                              <th className="py-2.5">Status</th>
                              <th className="py-2.5 pr-3 text-right">Copy</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                            {dom.dnsRecords.map((rec) => (
                              <tr key={rec.id} className="hover:bg-neutral-900/40 transition-colors">
                                <td className="py-2.5 pl-3">
                                  <span className="font-bold text-white px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                                    {rec.type}
                                  </span>
                                </td>
                                <td className="py-2.5 font-bold text-indigo-300">
                                  {rec.name}
                                </td>
                                <td className="py-2.5 text-neutral-300">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate max-w-[280px]">{rec.value}</span>
                                    <button
                                      onClick={() => handleCopy(rec.value, `${rec.name} record value`)}
                                      className="text-neutral-500 hover:text-white transition-colors"
                                      title="Copy record value"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                  {rec.comment && (
                                    <div className="font-sans text-[10px] text-neutral-500 mt-0.5">
                                      {rec.comment}
                                    </div>
                                  )}
                                </td>
                                <td className="py-2.5 text-neutral-400">{rec.ttl}</td>
                                <td className="py-2.5 font-sans">
                                  {rec.status === 'verified' ? (
                                    <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Resolved</span>
                                    </span>
                                  ) : (
                                    <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                                      <Clock className="w-3 h-3" />
                                      <span>Awaiting DNS</span>
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 pr-3 text-right">
                                  <button
                                    onClick={() => handleCopy(`${rec.type} ${rec.name} ${rec.value}`, 'Full DNS Record')}
                                    className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] font-sans font-medium"
                                  >
                                    Copy Pair
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AUTHORITATIVE ANYCAST DNS */}
      {activeTab === 'dns' && (
        <div className="space-y-5">
          {/* Nameservers Card */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Cloudmesh Global Anycast Authoritative Nameservers
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Point your domain registrar NS records to Cloudmesh for sub-15ms DNS resolution and automatic edge routing.
                </p>
              </div>

              <button
                onClick={() => handleCopy(`ns1.cloudmesh-dns.com\nns2.cloudmesh-dns.com`, 'Nameservers')}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Nameservers</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nameservers.map((ns, idx) => (
                <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white text-xs">{ns.ns}</span>
                    <span className="text-[11px] font-mono text-emerald-400">{ns.latencyMs}ms p50</span>
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400 space-y-0.5">
                    <div>IPv4: <span className="text-neutral-300">{ns.ipV4}</span></div>
                    <div>IPv6: <span className="text-neutral-300">{ns.ipV6}</span></div>
                  </div>
                  <div className="text-[10px] text-neutral-500 pt-1 border-t border-neutral-800/80">
                    {ns.location}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Records Editor */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  Active Authoritative Zone Records (cloudmesh.dev)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Live DNS records actively published across global edge root servers.
                </p>
              </div>

              <button
                onClick={() => setIsAddDnsRecordModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Record</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead>
                  <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-900/60">
                    <th className="py-2.5 pl-3">Type</th>
                    <th className="py-2.5">Name</th>
                    <th className="py-2.5">Content / Target</th>
                    <th className="py-2.5">TTL</th>
                    <th className="py-2.5 pr-3 text-right">Proxy Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                  {domains[0]?.dnsRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-2.5 pl-3">
                        <span className="font-bold text-white px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700">
                          {r.type}
                        </span>
                      </td>
                      <td className="py-2.5 text-indigo-300 font-bold">{r.name}</td>
                      <td className="py-2.5 text-neutral-300">{r.value}</td>
                      <td className="py-2.5 text-neutral-400">{r.ttl}</td>
                      <td className="py-2.5 pr-3 text-right font-sans">
                        <span className="text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                          Proxied Edge
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SSL/TLS & SECURITY */}
      {activeTab === 'ssl' && (
        <div className="space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              Automated SSL/TLS Encryption & Edge Transport Policies
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Zero-configuration TLS certificate management with modern cipher suite hardening and HTTP/3 support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Force HTTPS */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Force HTTPS Redirection</span>
                </div>
                <button
                  onClick={() => {
                    setForceHttps(!forceHttps);
                    showToast(`Automatic HTTPS redirect ${!forceHttps ? 'enabled' : 'disabled'}.`);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    forceHttps ? 'bg-emerald-600' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      forceHttps ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Redirect all incoming unencrypted HTTP requests to HTTPS via edge 308 permanent redirects before touching origin servers.
              </p>
            </div>

            {/* HSTS Preload */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Strict-Transport-Security (HSTS) Preload</span>
                </div>
                <button
                  onClick={() => {
                    setHstsPreload(!hstsPreload);
                    showToast(`HSTS Preload header ${!hstsPreload ? 'enabled' : 'disabled'}.`);
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    hstsPreload ? 'bg-cyan-600' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      hstsPreload ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Sends <code className="text-neutral-300 font-mono text-[11px]">max-age=63072000; includeSubDomains; preload</code> header to prevent SSL stripping attacks.
              </p>
            </div>

            {/* Minimum TLS Version */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <Sliders className="w-4 h-4 text-purple-400" />
                  <span>Minimum TLS Transport Version</span>
                </div>
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                  {(['TLS 1.2', 'TLS 1.3'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => {
                        setMinTlsVersion(v);
                        showToast(`Enforced minimum transport cipher: ${v}`);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        minTlsVersion === v
                          ? 'bg-purple-600 text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Drop handshakes with legacy, insecure TLS 1.0/1.1 clients to guarantee forward secrecy and modern curve cryptography.
              </p>
            </div>

            {/* Preferred Certificate Authority */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Preferred Certificate Authority</span>
                </div>
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                  <button
                    onClick={() => {
                      setPreferredCa('lets_encrypt');
                      showToast("Preferred CA set to Let's Encrypt");
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      preferredCa === 'lets_encrypt'
                        ? 'bg-amber-600 text-neutral-950'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Let's Encrypt
                  </button>
                  <button
                    onClick={() => {
                      setPreferredCa('gts');
                      showToast('Preferred CA set to Google Trust Services (GTS)');
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                      preferredCa === 'gts'
                        ? 'bg-amber-600 text-neutral-950'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Google Trust
                  </button>
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Automatic fallback between Let's Encrypt and Google Trust Services ensures 100% certificate renewal uptime even during upstream ACME outages.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM DOMAIN */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                Add Custom Domain
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDomainSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Domain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. acme.com or api.acme.com"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-neutral-500">
                  Apex domains (e.g. <span className="font-mono text-neutral-400">acme.com</span>) use A records, subdomains use CNAME.
                </p>
              </div>

              {/* Project Target */}
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Route to Project</label>
                <select
                  value={newDomainProject}
                  onChange={(e) => setNewDomainProject(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Global Edge Router (All Clusters)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName} ({p.environment})
                    </option>
                  ))}
                </select>
              </div>

              {/* Environment Target */}
              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold block">Target Environment</label>
                <div className="flex items-center gap-2">
                  {(['Production', 'Preview'] as const).map((env) => (
                    <button
                      type="button"
                      key={env}
                      onClick={() => setNewDomainEnv(env)}
                      className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-semibold transition-all ${
                        newDomainEnv === env
                          ? 'bg-indigo-950/70 border-indigo-500 text-white'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-white'
                      }`}
                    >
                      {env}
                    </button>
                  ))}
                </div>
              </div>

              {/* Apex redirect option */}
              {newDomainInput.split('.').length === 2 && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer text-neutral-300 font-medium">
                    <input
                      type="checkbox"
                      checked={newDomainRedirectWww}
                      onChange={(e) => setNewDomainRedirectWww(e.target.checked)}
                      className="rounded bg-neutral-900 border-neutral-700 text-indigo-600 focus:ring-0"
                    />
                    <span>Automatically configure 308 redirect from root to www.{newDomainInput}</span>
                  </label>
                </div>
              )}

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
                  Add Custom Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DNS RECORD */}
      {isAddDnsRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Add Authoritative DNS Record
              </h3>
              <button
                onClick={() => setIsAddDnsRecordModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDnsRecordSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">Record Type</label>
                  <select
                    value={newDnsType}
                    onChange={(e) => setNewDnsType(e.target.value as any)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="A">A (IPv4)</option>
                    <option value="CNAME">CNAME (Alias)</option>
                    <option value="TXT">TXT (Text/Verification)</option>
                    <option value="AAAA">AAAA (IPv6)</option>
                    <option value="MX">MX (Mail Exchange)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-neutral-300 font-semibold">TTL</label>
                  <select
                    value={newDnsTtl}
                    onChange={(e) => setNewDnsTtl(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="60s">60 seconds (Auto)</option>
                    <option value="300s">5 minutes</option>
                    <option value="3600s">1 hour</option>
                    <option value="86400s">1 day</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Record Name (Host)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. app, @, or mail"
                  value={newDnsName}
                  onChange={(e) => setNewDnsName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Record Target Content</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. cname.cloudmesh-edge.net or 76.76.21.21"
                  value={newDnsValue}
                  onChange={(e) => setNewDnsValue(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddDnsRecordModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold"
                >
                  Publish Record to Anycast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
