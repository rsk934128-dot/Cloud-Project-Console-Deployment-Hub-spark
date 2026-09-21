import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import { 
  IntegrationItem, 
  IntegrationCategory, 
  IntegrationStatus, 
  WebhookDeliveryLog,
  SlackWebhookConfig
} from '../types/integrations';
import { 
  INITIAL_INTEGRATIONS, 
  INITIAL_WEBHOOK_LOGS 
} from '../data/integrationsData';
import { SlackWebhookConfigPanel } from './SlackWebhookConfigPanel';
import {
  Radio,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  ExternalLink,
  Settings,
  Trash2,
  Zap,
  Activity,
  Database,
  Key,
  GitBranch,
  MessageSquare,
  ShieldCheck,
  Bell,
  FileText,
  Share2,
  Flag,
  Lock,
  ArrowUpRight,
  Send,
  X,
  Code,
  Check,
  Sliders,
  ChevronRight,
  Terminal,
  Layers
} from 'lucide-react';

interface IntegrationsConsoleProps {
  projects: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
}

export const IntegrationsConsole: React.FC<IntegrationsConsoleProps> = ({ projects }) => {
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace' | 'slack_webhook' | 'webhooks' | 'custom_webhook'>('installed');
  const [categoryFilter, setCategoryFilter] = useState<IntegrationCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [integrations, setIntegrations] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);
  const [webhookLogs, setWebhookLogs] = useState<WebhookDeliveryLog[]>(INITIAL_WEBHOOK_LOGS);

  // Selected Integration for configuration modal
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationItem | null>(null);
  
  // Install Modal State
  const [installingIntegration, setInstallingIntegration] = useState<IntegrationItem | null>(null);
  const [installScope, setInstallScope] = useState<'all' | string>('all');
  const [installApiKey, setInstallApiKey] = useState<string>('');
  const [installAutoSync, setInstallAutoSync] = useState<boolean>(true);

  // Custom Webhook Form
  const [customWebhookUrl, setCustomWebhookUrl] = useState<string>('https://hooks.slack.com/services/T0000/B0000/custom');
  const [customWebhookSecret, setCustomWebhookSecret] = useState<string>('whsec_98f12a4b89dc1278');
  const [customWebhookEvents, setCustomWebhookEvents] = useState<string[]>([
    'deployment.succeeded',
    'deployment.failed',
    'waf.blocked_ip'
  ]);

  // Webhook Test Runner
  const [testingWebhook, setTestingWebhook] = useState<boolean>(false);
  const [testPayloadResult, setTestPayloadResult] = useState<WebhookDeliveryLog | null>(null);

  // Syncing state
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard.`);
  };

  // Sync single integration
  const handleSyncIntegration = (intItem: IntegrationItem) => {
    setSyncingId(intItem.id);
    showToast(`Triggering configuration & variable sync with ${intItem.name}...`);

    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.id === intItem.id
            ? { ...i, lastSync: 'Just now', status: 'installed' }
            : i
        )
      );
      setSyncingId(null);
      showToast(`Synchronized with ${intItem.name} successfully.`);
    }, 1200);
  };

  // Sync all integrations
  const handleSyncAll = () => {
    setIsSyncingAll(true);
    showToast('Executing global synchronization across all active integrations...');

    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((i) =>
          i.status === 'installed' ? { ...i, lastSync: 'Just now' } : i
        )
      );
      setIsSyncingAll(false);
      showToast('All installed integrations and environment secrets are fully in sync.');
    }, 1500);
  };

  // Install Integration
  const handleInstallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!installingIntegration) return;

    const target = installingIntegration;
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === target.id
          ? {
              ...item,
              status: 'installed',
              installedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              lastSync: 'Just now',
              syncedVarsCount: 2,
              syncedProjectsCount: installScope === 'all' ? 4 : 1,
              config: {
                ...item.config,
                configuredScope: installScope,
                apiKeyConfigured: 'true'
              }
            }
          : item
      )
    );

    const newLog: WebhookDeliveryLog = {
      id: `wh-${Date.now()}`,
      integrationName: target.name,
      event: 'integration.installed',
      status: 200,
      durationMs: 94,
      timestamp: new Date().toLocaleTimeString(),
      requestPayload: JSON.stringify({
        event: 'integration.installed',
        publisher: target.publisher,
        scope: installScope,
        autoSync: installAutoSync
      }, null, 2),
      responsePayload: '{"status": "authorized", "connection": "ready"}'
    };
    setWebhookLogs((prev) => [newLog, ...prev]);

    setInstallingIntegration(null);
    setInstallApiKey('');
    showToast(`Installed ${target.name} successfully! Environment variables synced.`);
  };

  // Disconnect Integration
  const handleDisconnect = (id: string, name: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'available',
              installedAt: undefined,
              syncedVarsCount: undefined,
              lastSync: undefined
            }
          : item
      )
    );
    if (selectedIntegration?.id === id) {
      setSelectedIntegration(null);
    }
    showToast(`Disconnected ${name}. Related synced tokens purged.`);
  };

  // Trigger test webhook
  const handleTestWebhookDispatch = (integrationName: string = 'Custom Edge Webhook') => {
    setTestingWebhook(true);
    showToast(`Dispatching synthetic deployment webhook to ${integrationName}...`);

    setTimeout(() => {
      const simulatedLog: WebhookDeliveryLog = {
        id: `wh-${Date.now()}`,
        integrationName,
        event: 'deployment.preview_ready',
        status: 200,
        durationMs: 124,
        timestamp: new Date().toLocaleTimeString(),
        requestPayload: JSON.stringify({
          event: 'deployment.preview_ready',
          project: 'cloudmesh-production',
          branch: 'feat/enterprise-connect',
          previewUrl: 'https://preview-48f10bc.cloudmesh.dev',
          triggeredBy: 'git-push',
          timestamp: new Date().toISOString()
        }, null, 2),
        responsePayload: '{"success": true, "acknowledged": true, "receipt": "rec_09f12ac"}'
      };

      setWebhookLogs((prev) => [simulatedLog, ...prev]);
      setTestPayloadResult(simulatedLog);
      setTestingWebhook(false);
      showToast('Webhook delivered with HTTP 200 OK (124ms).');
    }, 1100);
  };

  // Filtered lists
  const installedIntegrations = useMemo(() => {
    return integrations.filter((i) => i.status === 'installed');
  }, [integrations]);

  const marketplaceIntegrations = useMemo(() => {
    return integrations.filter((i) => {
      const matchCat = categoryFilter === 'all' || i.category === categoryFilter;
      const matchSearch =
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.publisher.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [integrations, categoryFilter, searchQuery]);

  // Icon mapper
  const renderCategoryIcon = (cat: IntegrationCategory) => {
    switch (cat) {
      case 'monitoring':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'databases':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'security':
        return <Key className="w-4 h-4 text-amber-400" />;
      case 'cicd':
        return <GitBranch className="w-4 h-4 text-indigo-400" />;
      case 'messaging':
        return <MessageSquare className="w-4 h-4 text-rose-400" />;
      case 'analytics':
        return <Share2 className="w-4 h-4 text-purple-400" />;
      default:
        return <Radio className="w-4 h-4 text-neutral-400" />;
    }
  };

  const totalSyncedVars = installedIntegrations.reduce((acc, curr) => acc + (curr.syncedVarsCount || 0), 0);

  return (
    <div id="integrations-console-root" className="space-y-6">
      {/* Toast Notification */}
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
            <Radio className="w-5 h-5 text-indigo-400" />
            Integrations & Webhook Dispatch Console
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Connect first-party telemetry, database branching, secret stores, and automated incident response channels to your edge deployments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Global Resync */}
          <button
            id="btn-sync-all-integrations"
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin text-indigo-400' : 'text-neutral-400'}`} />
            <span>{isSyncingAll ? 'Syncing Vaults...' : 'Sync Variables'}</span>
          </button>

          {/* Slack Build Notifications CTA */}
          <button
            id="btn-open-slack-webhook"
            onClick={() => setActiveTab('slack_webhook')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Slack Build Webhook</span>
          </button>

          {/* Test Webhook */}
          <button
            id="btn-test-webhook-dispatch"
            onClick={() => handleTestWebhookDispatch('Slack Incident Channel Bot')}
            disabled={testingWebhook}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${testingWebhook ? 'animate-bounce text-indigo-400' : 'text-neutral-400'}`} />
            <span>Test Webhook Dispatch</span>
          </button>

          {/* Browse Catalog CTA */}
          <button
            id="btn-browse-catalog"
            onClick={() => setActiveTab('marketplace')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Install Integration</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Installed Integrations</span>
            <Radio className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{installedIntegrations.length} Active</div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>All healthy & responding</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Synced Secrets & Configs</span>
            <Key className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalSyncedVars} Variables</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Doppler & DB Vaults
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Webhook Delivery Reliability</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">99.98%</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Avg ACK duration 115ms
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Marketplace Catalog</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{integrations.length} Available</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Verified Cloudmesh Partners
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-px text-xs font-semibold overflow-x-auto">
        <button
          id="tab-installed-integrations"
          onClick={() => setActiveTab('installed')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'installed'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Installed ({installedIntegrations.length})
        </button>

        <button
          id="tab-slack-notifications"
          onClick={() => setActiveTab('slack_webhook')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'slack_webhook'
              ? 'border-emerald-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Slack Build Notifications</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800 font-mono">
            Webhook
          </span>
        </button>

        <button
          id="tab-marketplace-catalog"
          onClick={() => setActiveTab('marketplace')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'marketplace'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Catalog & Marketplace ({integrations.length})
        </button>

        <button
          id="tab-webhook-deliveries"
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'webhooks'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Webhook Deliveries ({webhookLogs.length})
        </button>

        <button
          id="tab-custom-webhook"
          onClick={() => setActiveTab('custom_webhook')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'custom_webhook'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Custom Outgoing Webhook
        </button>
      </div>

      {/* TAB 1: INSTALLED INTEGRATIONS */}
      {activeTab === 'installed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {installedIntegrations.map((item) => {
              const isSyncing = syncingId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-neutral-700/80 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0">
                          {renderCategoryIcon(item.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{item.name}</h3>
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>Synced</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-400">{item.publisher}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSyncIntegration(item)}
                          disabled={isSyncing}
                          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
                          title="Trigger manual sync"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
                        </button>
                        <button
                          onClick={() => setSelectedIntegration(item)}
                          className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                          title="Integration settings"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 bg-neutral-950/80 border border-neutral-800/80 rounded-lg p-2.5 text-xs font-mono">
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase font-sans">Synced Variables</div>
                        <div className="text-amber-300 font-bold mt-0.5">{item.syncedVarsCount || 0} keys</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-neutral-500 uppercase font-sans">Last Synchronized</div>
                        <div className="text-neutral-300 mt-0.5">{item.lastSync || 'Just now'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-mono text-[11px]">
                      Installed {item.installedAt}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.slug === 'slack' && (
                        <button
                          onClick={() => setActiveTab('slack_webhook')}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors text-[11px] font-semibold flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded shadow-2xs"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Configure Webhook</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDisconnect(item.id, item.name)}
                        className="text-neutral-500 hover:text-rose-400 transition-colors text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: SLACK BUILD NOTIFICATIONS & WEBHOOK CONFIGURATION */}
      {activeTab === 'slack_webhook' && (
        <SlackWebhookConfigPanel
          projects={projects}
          onTestWebhookLog={(newLog) => {
            setWebhookLogs((prev) => [newLog, ...prev]);
          }}
          onConfigSaved={(cfg) => {
            setIntegrations((prev) =>
              prev.map((i) =>
                i.slug === 'slack'
                  ? {
                      ...i,
                      webhookUrl: cfg.webhookUrl,
                      lastSync: 'Just now',
                      config: {
                        ...i.config,
                        channel: cfg.channel,
                        notifyOnDeploy: cfg.notifyOnBuildSuccess ? 'true' : 'false',
                        notifyOnFail: cfg.notifyOnBuildFail ? 'true' : 'false'
                      }
                    }
                  : i
              )
            );
          }}
          showToast={showToast}
        />
      )}

      {/* TAB 2: MARKETPLACE / CATALOG */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          {/* Controls & Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['all', 'monitoring', 'databases', 'security', 'cicd', 'messaging', 'analytics'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors capitalize ${
                    categoryFilter === cat
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                  }`}
                >
                  {cat === 'cicd' ? 'CI / CD' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search integrations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
              />
            </div>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketplaceIntegrations.map((item) => {
              const isInstalled = item.status === 'installed';

              return (
                <div
                  key={item.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-neutral-700/80 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 shrink-0">
                          {renderCategoryIcon(item.category)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{item.name}</h3>
                          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                            <span>{item.publisher}</span>
                            {item.isOfficial && (
                              <span className="text-[10px] text-indigo-400 font-semibold">• Official</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isInstalled ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Installed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-400">
                          Available
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedIntegration(item)}
                      className="text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      Details & Docs
                    </button>

                    {isInstalled ? (
                      <button
                        onClick={() => setSelectedIntegration(item)}
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg flex items-center gap-1.5"
                      >
                        <Settings className="w-3 h-3" />
                        <span>Configure</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setInstallingIntegration(item)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Install</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: WEBHOOK DELIVERIES LOG */}
      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  Real-time Outbound Webhook Deliveries
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Audit log of HTTP POST event notifications dispatched to Datadog, Slack, Sentry, and custom endpoints.
                </p>
              </div>

              <button
                onClick={() => handleTestWebhookDispatch()}
                disabled={testingWebhook}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulate Event Webhook</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-neutral-300">
                <thead>
                  <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                    <th className="pb-3 pl-3">Timestamp</th>
                    <th className="pb-3">Integration</th>
                    <th className="pb-3">Event Topic</th>
                    <th className="pb-3">HTTP Status</th>
                    <th className="pb-3">Duration</th>
                    <th className="pb-3 pr-3 text-right">Payload Inspection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                  {webhookLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 pl-3 text-neutral-400">{log.timestamp}</td>
                      <td className="py-3 font-bold text-white font-sans">{log.integrationName}</td>
                      <td className="py-3 text-indigo-300">{log.event}</td>
                      <td className="py-3 font-bold">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {log.status} OK
                        </span>
                      </td>
                      <td className="py-3 text-neutral-400">{log.durationMs}ms</td>
                      <td className="py-3 pr-3 text-right">
                        <button
                          onClick={() => setTestPayloadResult(log)}
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-sans text-[11px] transition-colors"
                        >
                          View Payloads
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payload Inspector Modal / Inline Box */}
          {testPayloadResult && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white">
                    Webhook Request & Response Inspector: {testPayloadResult.event}
                  </h3>
                </div>
                <button
                  onClick={() => setTestPayloadResult(null)}
                  className="text-neutral-400 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <div className="text-[10px] text-neutral-400 font-sans uppercase font-bold flex items-center justify-between">
                    <span>Dispatched Request Body (POST JSON)</span>
                    <button
                      onClick={() => handleCopy(testPayloadResult.requestPayload, 'Request JSON')}
                      className="text-neutral-500 hover:text-white"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <pre className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-[11px] text-emerald-300 overflow-x-auto max-h-48">
                    {testPayloadResult.requestPayload}
                  </pre>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-neutral-400 font-sans uppercase font-bold">
                    Target Server Response (HTTP {testPayloadResult.status})
                  </div>
                  <pre className="bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-[11px] text-cyan-300 overflow-x-auto max-h-48">
                    {testPayloadResult.responsePayload}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CUSTOM OUTGOING WEBHOOK */}
      {activeTab === 'custom_webhook' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-5">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Configure Custom Edge Outgoing Webhook
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Transmit signed JSON payloads for CI/CD events, security incidents, or deployment lifecycle changes to your custom microservice.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl text-xs">
            <div className="space-y-1">
              <label className="text-neutral-300 font-semibold">Destination HTTP/HTTPS Endpoint</label>
              <input
                type="url"
                value={customWebhookUrl}
                onChange={(e) => setCustomWebhookUrl(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-neutral-300 font-semibold">HMAC-SHA256 Signing Secret</label>
                <button
                  onClick={() => handleCopy(customWebhookSecret, 'Webhook Signing Secret')}
                  className="text-neutral-500 hover:text-white flex items-center gap-1 font-mono text-[10px]"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Secret</span>
                </button>
              </div>
              <input
                type="text"
                readOnly
                value={customWebhookSecret}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-amber-300 font-mono focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500">
                Payloads include an <code className="text-neutral-400">X-CloudMesh-Signature-256</code> header to verify origin authenticity.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-neutral-300 font-semibold">Subscribed Event Triggers</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'deployment.succeeded', label: 'deployment.succeeded' },
                  { id: 'deployment.failed', label: 'deployment.failed' },
                  { id: 'waf.blocked_ip', label: 'waf.blocked_ip (DDoS spike)' },
                  { id: 'secrets.updated', label: 'secrets.updated' },
                  { id: 'domains.ssl_renewed', label: 'domains.ssl_renewed' },
                  { id: 'connect.handshake_failed', label: 'connect.handshake_failed' }
                ].map((item) => {
                  const isChecked = customWebhookEvents.includes(item.id);
                  return (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setCustomWebhookEvents((prev) =>
                            isChecked
                              ? prev.filter((x) => x !== item.id)
                              : [...prev, item.id]
                          );
                        }}
                        className="rounded border-neutral-700 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-mono text-[11px] text-neutral-300">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => showToast('Custom edge webhook subscription saved.')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
              >
                Save Webhook Configuration
              </button>
              <button
                onClick={() => handleTestWebhookDispatch('Custom HTTP Endpoint')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold rounded-lg flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-neutral-400" />
                <span>Send Test Ping</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSTALL INTEGRATION */}
      {installingIntegration && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg">
                  {renderCategoryIcon(installingIntegration.category)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Install {installingIntegration.name}</h3>
                  <p className="text-[11px] text-neutral-400">{installingIntegration.publisher}</p>
                </div>
              </div>
              <button
                onClick={() => setInstallingIntegration(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInstallSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Scope Target</label>
                <select
                  value={installScope}
                  onChange={(e) => setInstallScope(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Projects & Preview Branches (Global)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">API Key / Token</label>
                <input
                  type="password"
                  required
                  placeholder={`Enter ${installingIntegration.name} Access Key`}
                  value={installApiKey}
                  onChange={(e) => setInstallApiKey(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2 p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                <div className="font-semibold text-neutral-300">Requested Permissions</div>
                <div className="space-y-1.5 text-neutral-400 text-[11px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Read edge deployment logs and HTTP traces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Inject project environment secrets automatically</span>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={installAutoSync}
                  onChange={(e) => setInstallAutoSync(e.target.checked)}
                  className="rounded border-neutral-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-neutral-300">Automatically synchronize configuration changes</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setInstallingIntegration(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  Authorize & Install
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INTEGRATION CONFIGURATION & DETAILS */}
      {selectedIntegration && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg">
                  {renderCategoryIcon(selectedIntegration.category)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedIntegration.name}</h3>
                  <p className="text-[11px] text-neutral-400">{selectedIntegration.publisher}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedIntegration(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-neutral-300 leading-relaxed">
                {selectedIntegration.description}
              </p>

              {/* Status details */}
              <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-2 font-mono text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 font-sans">Status</span>
                  <span className="text-emerald-400 font-bold capitalize">{selectedIntegration.status}</span>
                </div>
                {selectedIntegration.installedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-sans">Installed On</span>
                    <span className="text-neutral-300">{selectedIntegration.installedAt}</span>
                  </div>
                )}
                {selectedIntegration.lastSync && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-sans">Last Synchronization</span>
                    <span className="text-neutral-300">{selectedIntegration.lastSync}</span>
                  </div>
                )}
                {selectedIntegration.syncedVarsCount !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-sans">Synced Variables</span>
                    <span className="text-amber-300 font-bold">{selectedIntegration.syncedVarsCount} keys</span>
                  </div>
                )}
              </div>

              {/* Config parameters */}
              {Object.keys(selectedIntegration.config).length > 0 && (
                <div className="space-y-1.5">
                  <div className="font-semibold text-neutral-300">Active Parameters</div>
                  <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-3 space-y-1.5 font-mono text-[11px]">
                    {Object.entries(selectedIntegration.config).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-neutral-500">{key}:</span>
                        <span className="text-neutral-200">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                {selectedIntegration.status === 'installed' ? (
                  <button
                    onClick={() => handleDisconnect(selectedIntegration.id, selectedIntegration.name)}
                    className="text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Uninstall</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  {selectedIntegration.slug === 'slack' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIntegration(null);
                        setActiveTab('slack_webhook');
                      }}
                      className="px-3 py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded-lg font-semibold text-xs flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Configure Webhook</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedIntegration(null)}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                  >
                    Close
                  </button>
                  {selectedIntegration.status === 'installed' ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleSyncIntegration(selectedIntegration);
                        setSelectedIntegration(null);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync Now</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIntegration(null);
                        setInstallingIntegration(selectedIntegration);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                    >
                      Install
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
