import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import { 
  WafRule, 
  SecurityEvent, 
  IpRuleItem, 
  OwaspProtectionItem,
  FirewallAction,
  ThreatCategory
} from '../types/firewall';
import { 
  INITIAL_WAF_RULES, 
  MOCK_SECURITY_EVENTS, 
  INITIAL_IP_RULES, 
  OWASP_PROTECTIONS 
} from '../data/firewallData';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Flame, 
  Lock, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Globe, 
  Sliders, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Code, 
  ChevronDown, 
  ExternalLink,
  Bot,
  Zap,
  Filter,
  Check
} from 'lucide-react';

interface FirewallConsoleProps {
  projects: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
}

export const FirewallConsole: React.FC<FirewallConsoleProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'rules' | 'events' | 'owasp' | 'ipAccess'>('rules');
  const [underAttackMode, setUnderAttackMode] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [rules, setRules] = useState<WafRule[]>(INITIAL_WAF_RULES);
  const [events, setEvents] = useState<SecurityEvent[]>(MOCK_SECURITY_EVENTS);
  const [ipRules, setIpRules] = useState<IpRuleItem[]>(INITIAL_IP_RULES);
  const [owaspList, setOwaspList] = useState<OwaspProtectionItem[]>(OWASP_PROTECTIONS);

  // Filters for Events
  const [eventSearch, setEventSearch] = useState<string>('');
  const [eventActionFilter, setEventActionFilter] = useState<'all' | FirewallAction>('all');

  // Modal State for New Rule
  const [isAddRuleOpen, setIsAddRuleOpen] = useState<boolean>(false);
  const [newRuleName, setNewRuleName] = useState<string>('');
  const [newRuleDescription, setNewRuleDescription] = useState<string>('');
  const [newRuleExpression, setNewRuleExpression] = useState<string>('http.request.uri.path contains "/api/v1/"');
  const [newRuleAction, setNewRuleAction] = useState<FirewallAction>('block');

  // Modal State for New IP Rule
  const [isAddIpOpen, setIsAddIpOpen] = useState<boolean>(false);
  const [newIpAddress, setNewIpAddress] = useState<string>('');
  const [newIpType, setNewIpType] = useState<'block' | 'allow'>('block');
  const [newIpDescription, setNewIpDescription] = useState<string>('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updated = !r.enabled;
          showToast(`Rule "${r.name}" is now ${updated ? 'Active' : 'Disabled'}.`);
          return { ...r, enabled: updated };
        }
        return r;
      })
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    showToast('Firewall rule successfully deleted.');
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newRule: WafRule = {
      id: `waf-${Date.now()}`,
      name: newRuleName,
      description: newRuleDescription || 'User-defined edge firewall rule',
      expression: newRuleExpression,
      action: newRuleAction,
      hits24h: 0,
      enabled: true,
      priority: rules.length + 1,
      updatedAt: 'Just now'
    };

    setRules((prev) => [newRule, ...prev]);
    setIsAddRuleOpen(false);
    setNewRuleName('');
    setNewRuleDescription('');
    showToast(`Created custom firewall rule: "${newRule.name}"`);
  };

  const handleAddIpRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpAddress.trim()) return;

    const newRule: IpRuleItem = {
      id: `ip-${Date.now()}`,
      ipOrCidr: newIpAddress,
      type: newIpType,
      description: newIpDescription || (newIpType === 'block' ? 'Manually blocked IP' : 'Manually allowed IP'),
      addedAt: 'Just now'
    };

    setIpRules((prev) => [newRule, ...prev]);
    setIsAddIpOpen(false);
    setNewIpAddress('');
    setNewIpDescription('');
    showToast(`Added ${newIpAddress} to ${newIpType === 'block' ? 'Blocklist' : 'Allowlist'}`);
  };

  const handleDeleteIpRule = (id: string) => {
    setIpRules((prev) => prev.filter((r) => r.id !== id));
    showToast('IP access rule removed.');
  };

  const handleSimulateAttack = () => {
    const attackers = [
      { ip: '185.191.171.8', country: 'Germany', code: 'DE', path: '/api/v1/graphql', method: 'POST' as const, cat: 'sqli' as const, label: 'GraphQL Injection', act: 'block' as const, rule: 'OWASP Core Rule Set: SQLi Filter' },
      { ip: '45.143.203.11', country: 'Moldova', code: 'MD', path: '/admin/config.php', method: 'GET' as const, cat: 'scanner' as const, label: 'Configuration Scanner', act: 'block' as const, rule: 'Block Known Vulnerability Scanners' },
      { ip: '198.51.100.99', country: 'United States', code: 'US', path: '/api/v1/auth/reset', method: 'POST' as const, cat: 'rate_limit' as const, label: 'Password Spray', act: 'rate_limit' as const, rule: 'Rate Limit Auth & Token Endpoints' }
    ];
    const picked = attackers[Math.floor(Math.random() * attackers.length)];
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

    const newEvent: SecurityEvent = {
      id: `sec-${Date.now()}`,
      timestamp: timeStr,
      ip: picked.ip,
      country: picked.country,
      countryCode: picked.code,
      path: picked.path,
      method: picked.method,
      category: picked.cat,
      categoryLabel: picked.label,
      action: picked.act,
      matchedRule: picked.rule,
      userAgent: 'Automated-Threat-Simulation-Probe/1.0'
    };

    setEvents((prev) => [newEvent, ...prev]);
    showToast(`Blocked inbound threat: ${picked.label} from ${picked.ip}`);
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch = 
        ev.ip.toLowerCase().includes(eventSearch.toLowerCase()) ||
        ev.path.toLowerCase().includes(eventSearch.toLowerCase()) ||
        ev.country.toLowerCase().includes(eventSearch.toLowerCase()) ||
        ev.matchedRule.toLowerCase().includes(eventSearch.toLowerCase());

      const matchesAction = eventActionFilter === 'all' || ev.action === eventActionFilter;

      return matchesSearch && matchesAction;
    });
  }, [events, eventSearch, eventActionFilter]);

  const getActionBadge = (action: FirewallAction) => {
    switch (action) {
      case 'block':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <ShieldX className="w-3 h-3" /> Block
          </span>
        );
      case 'challenge':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Bot className="w-3 h-3" /> Managed Challenge
          </span>
        );
      case 'rate_limit':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <Zap className="w-3 h-3" /> Rate Limit
          </span>
        );
      case 'log':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
            <Code className="w-3 h-3" /> Log Only
          </span>
        );
    }
  };

  return (
    <div id="firewall-console-root" className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white border border-neutral-700 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Global Status Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Web Application Firewall & Edge Security
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time layer 7 WAF rules, DDoS mitigation scrubbing, OWASP Core Rule Sets, and IP reputation filters.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Under Attack Mode Toggle */}
          <button
            id="under-attack-mode-toggle"
            onClick={() => {
              const newState = !underAttackMode;
              setUnderAttackMode(newState);
              showToast(newState ? 'Under Attack Mode ACTIVATED: Managed challenges issued globally.' : 'Under Attack Mode deactivated.');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold rounded-lg shadow-xs transition-all ${
              underAttackMode
                ? 'bg-rose-950 border-rose-600 text-rose-200 animate-pulse'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${underAttackMode ? 'text-rose-400' : 'text-neutral-400'}`} />
            <span>{underAttackMode ? 'Under Attack: ACTIVE' : 'Under Attack Mode'}</span>
          </button>

          {/* Project Selector */}
          <div className="relative">
            <select
              id="firewall-project-filter"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:border-neutral-700 cursor-pointer shadow-xs"
            >
              <option value="all">All Projects (38 Clusters)</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.displayName} ({proj.environment})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Time Window */}
          <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-400">
            {(['24h', '7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-md transition-colors uppercase ${
                  timeRange === r
                    ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                    : 'hover:text-neutral-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Simulate Threat Trigger */}
          <button
            id="firewall-simulate-threat-btn"
            onClick={handleSimulateAttack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Threat</span>
          </button>
        </div>
      </div>

      {/* Under Attack Mode Alert Banner */}
      {underAttackMode && (
        <div className="bg-rose-950/80 border border-rose-800 p-4 rounded-xl flex items-center justify-between gap-4 text-xs text-rose-200">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Aggressive Edge Defense Activated</div>
              <p className="text-rose-300 mt-0.5">
                Every visitor must pass an automated JavaScript cryptographic proof-of-work challenge before reaching your origin servers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUnderAttackMode(false)}
            className="px-3 py-1 bg-rose-900 hover:bg-rose-800 border border-rose-700 text-white font-semibold rounded-lg text-xs shrink-0"
          >
            Deactivate
          </button>
        </div>
      )}

      {/* Hero Security KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Threats Blocked</span>
            <ShieldX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">14,820</div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <span>+18.4%</span>
            <span className="text-neutral-500">vs yesterday</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Bot Mitigations</span>
            <Bot className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">3,120</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            92.4% challenge pass rate
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Active WAF Rules</span>
            <Sliders className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {rules.filter((r) => r.enabled).length} <span className="text-sm font-normal text-neutral-500">/ {rules.length}</span>
          </div>
          <div className="text-[11px] text-indigo-400 font-mono">
            Layer 7 Inspection Active
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>DDoS Scrub Capacity</span>
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">172 Tbps</div>
          <div className="text-[11px] text-emerald-400 font-mono">
            Anycast BGP Edge Mesh
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-px text-xs font-semibold">
        <button
          id="tab-waf-rules"
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Custom WAF Rules ({rules.length})
        </button>

        <button
          id="tab-security-events"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'events'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Security Threat Feed ({events.length})
        </button>

        <button
          id="tab-owasp-crs"
          onClick={() => setActiveTab('owasp')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'owasp'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          OWASP Top 10 CRS
        </button>

        <button
          id="tab-ip-access"
          onClick={() => setActiveTab('ipAccess')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ipAccess'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          IP Access Lists ({ipRules.length})
        </button>
      </div>

      {/* TAB 1: CUSTOM WAF RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">Rule Execution Hierarchy</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Evaluated in sequential priority order at edge Anycast points of presence before reaching serverless handlers.
              </p>
            </div>

            <button
              id="btn-create-waf-rule"
              onClick={() => setIsAddRuleOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Rule</span>
            </button>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  rule.enabled
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded border border-neutral-700">
                      #{rule.priority}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-white">{rule.name}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">{rule.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getActionBadge(rule.action)}

                    {/* Enable Toggle */}
                    <button
                      id={`toggle-rule-${rule.id}`}
                      onClick={() => handleToggleRule(rule.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        rule.enabled ? 'bg-indigo-600' : 'bg-neutral-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-4.5' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-400 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Match Expression */}
                <div className="bg-neutral-950/70 p-2.5 rounded-lg border border-neutral-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-indigo-300 truncate max-w-[85%]" title={rule.expression}>
                    {rule.expression}
                  </span>
                  <span className="text-[11px] text-neutral-400 shrink-0 font-sans">
                    {rule.hits24h.toLocaleString()} hits (24h)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SECURITY EVENTS FEED */}
      {activeTab === 'events' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                Live Inbound Threat Stream
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Real-time edge log of blocked requests, brute-force anomalies, and automated scanners.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter IP, path, country..."
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                />
              </div>

              <select
                value={eventActionFilter}
                onChange={(e) => setEventActionFilter(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">All Actions</option>
                <option value="block">Blocked Only</option>
                <option value="challenge">Challenged Only</option>
                <option value="rate_limit">Rate Limited</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Time</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Threat Category</th>
                  <th className="pb-3">Origin IP / Country</th>
                  <th className="pb-3">Target URL</th>
                  <th className="pb-3 pr-2">Matched Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {filteredEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 pl-2 text-neutral-400">{ev.timestamp}</td>
                    <td className="py-3">{getActionBadge(ev.action)}</td>
                    <td className="py-3">
                      <span className="font-sans font-bold text-white text-xs">{ev.categoryLabel}</span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-neutral-200">{ev.ip}</span>
                        <span className="font-sans text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.2 rounded border border-neutral-700">
                          {ev.countryCode}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-400 font-bold">{ev.method}</span>
                        <span className="text-indigo-300 truncate max-w-[200px]" title={ev.path}>
                          {ev.path}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-2 font-sans text-neutral-400 truncate max-w-[200px]" title={ev.matchedRule}>
                      {ev.matchedRule}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OWASP TOP 10 CORE RULE SET (CRS) */}
      {activeTab === 'owasp' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                OWASP ModSecurity Core Rule Set 4.0
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Generic signature anomaly detection targeting common application-layer attack vectors.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-md">
              CRS Anomaly Score Threshold: 5 (Blocking)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {owaspList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {item.code}
                    </span>
                    <h3 className="text-xs font-bold text-white">{item.name}</h3>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> ACTIVE
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">{item.description}</p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">Paranoia Level:</span>
                    <span className="font-mono font-bold text-neutral-200 capitalize">
                      {item.sensitivity}
                    </span>
                  </div>
                  <div className="font-mono text-neutral-400">
                    <span className="text-white font-bold">{item.blockedToday}</span> blocked today
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: IP ACCESS LISTS */}
      {activeTab === 'ipAccess' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">IP & CIDR Access Control</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Bypass security controls for internal VPNs or immediately drop traffic from malicious hosts.
              </p>
            </div>

            <button
              id="btn-add-ip-rule"
              onClick={() => setIsAddIpOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors border border-neutral-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add IP Rule</span>
            </button>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-950/40">
                  <th className="py-3 pl-4">IP / CIDR Block</th>
                  <th className="py-3">Type</th>
                  <th className="py-3">Description</th>
                  <th className="py-3">Added</th>
                  <th className="py-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {ipRules.map((ip) => (
                  <tr key={ip.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 pl-4 font-bold text-white">{ip.ipOrCidr}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase ${
                        ip.type === 'block'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {ip.type}
                      </span>
                    </td>
                    <td className="py-3 font-sans text-neutral-400">{ip.description}</td>
                    <td className="py-3 text-neutral-500 font-sans">{ip.addedAt}</td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => handleDeleteIpRule(ip.id)}
                        className="text-neutral-500 hover:text-rose-400 font-sans text-[11px] transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CUSTOM WAF RULE */}
      {isAddRuleOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Create Custom WAF Rule
              </h3>
              <button
                onClick={() => setIsAddRuleOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block API Scraping"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Description</label>
                <input
                  type="text"
                  placeholder="Brief explanation of policy behavior"
                  value={newRuleDescription}
                  onChange={(e) => setNewRuleDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Action</label>
                <select
                  value={newRuleAction}
                  onChange={(e) => setNewRuleAction(e.target.value as FirewallAction)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="block">Block (HTTP 403 Forbidden)</option>
                  <option value="challenge">Managed Challenge (JS / Captcha Proof-of-Work)</option>
                  <option value="rate_limit">Rate Limit (HTTP 429 Too Many Requests)</option>
                  <option value="log">Log Only (Dry Run)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Edge Filter Expression</label>
                <textarea
                  rows={3}
                  value={newRuleExpression}
                  onChange={(e) => setNewRuleExpression(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-neutral-500">Supports Wireshark-style expressions: http.request.uri.path, ip.geoip.country, rate()</p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddRuleOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  Deploy Rule to Edge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD IP RULE */}
      {isAddIpOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                Add IP Access Rule
              </h3>
              <button
                onClick={() => setIsAddIpOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIpRule} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">IP Address or CIDR</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 192.0.2.1 or 198.51.100.0/24"
                  value={newIpAddress}
                  onChange={(e) => setNewIpAddress(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Policy Type</label>
                <select
                  value={newIpType}
                  onChange={(e) => setNewIpType(e.target.value as 'block' | 'allow')}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="block">Block (Deny all traffic from this IP)</option>
                  <option value="allow">Allow (Whitelist IP from all security checks)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Malicious credential scanner host"
                  value={newIpDescription}
                  onChange={(e) => setNewIpDescription(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddIpOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  Save IP Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
