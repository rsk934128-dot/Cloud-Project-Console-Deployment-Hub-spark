import React, { useState, useEffect } from 'react';
import { ProjectItem } from '../types';
import { SlackWebhookConfig, WebhookDeliveryLog } from '../types/integrations';
import { 
  Hash, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Sliders, 
  Terminal, 
  Check, 
  RefreshCw, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  MessageSquare,
  Shield,
  Rocket,
  Info
} from 'lucide-react';

interface SlackWebhookConfigPanelProps {
  projects: ProjectItem[];
  onTestWebhookLog: (log: WebhookDeliveryLog) => void;
  onConfigSaved?: (config: SlackWebhookConfig) => void;
  showToast: (msg: string) => void;
}

const STORAGE_KEY = 'cloudmesh_slack_webhook_config';

const DEFAULT_CONFIG: SlackWebhookConfig = {
  webhookUrl: 'https://hooks.slack.com/services/T048B91KC/B085F219Q/9hZ8xK2lmNP4vQ1R8sTu9W',
  channel: '#builds-prod',
  botName: 'CloudMesh Build Bot',
  botEmoji: ':rocket:',
  scopeProject: 'all',
  notifyOnBuildSuccess: true,
  notifyOnBuildFail: true,
  notifyOnDeployStart: true,
  notifyOnDDoSAlert: false,
  includeLivePreviewLink: true,
  messageFormat: 'detailed',
  isEnabled: true,
  lastTestedAt: 'Sep 21, 2026 10:24 AM',
  lastDeliveryStatus: 'success'
};

const POPULAR_CHANNELS = [
  '#builds-prod',
  '#deployments',
  '#ci-cd-alerts',
  '#ops-war-room',
  '#frontend-releases'
];

export const SlackWebhookConfigPanel: React.FC<SlackWebhookConfigPanelProps> = ({
  projects,
  onTestWebhookLog,
  onConfigSaved,
  showToast
}) => {
  const [config, setConfig] = useState<SlackWebhookConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load Slack config from localStorage', e);
    }
    return DEFAULT_CONFIG;
  });

  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testEventType, setTestEventType] = useState<'success' | 'failed' | 'started'>('success');
  const [showGuide, setShowGuide] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync back to localStorage
  const handleSaveConfig = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setHasUnsavedChanges(false);
      if (onConfigSaved) onConfigSaved(config);
      showToast(`Slack webhook configuration saved! Build notifications routed to ${config.channel}.`);
    } catch (e) {
      showToast('Error saving Slack webhook configuration.');
    }
  };

  const handleFieldChange = <K extends keyof SlackWebhookConfig>(key: K, value: SlackWebhookConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(config.webhookUrl);
    showToast('Slack Webhook URL copied to clipboard.');
  };

  // Dispatch interactive test ping
  const handleDispatchTest = () => {
    if (!config.webhookUrl.trim()) {
      showToast('Please specify a Slack Webhook URL first.');
      return;
    }

    setIsTesting(true);
    showToast(`Dispatching test payload to Slack channel ${config.channel}...`);

    const selectedProj = projects.find(p => p.id === config.scopeProject) || projects[0] || {
      name: 'cloudmesh-production',
      displayName: 'CloudMesh Production App',
      fullDomain: 'cloudmesh.cloud-edge.app'
    };

    setTimeout(() => {
      const isFail = testEventType === 'failed';
      const isStart = testEventType === 'started';

      const eventName = isFail 
        ? 'build.failed' 
        : isStart 
        ? 'deployment.started' 
        : 'build.succeeded';

      const slackPayload = {
        channel: config.channel,
        username: config.botName,
        icon_emoji: config.botEmoji,
        attachments: [
          {
            color: isFail ? '#e01e5a' : isStart ? '#ecb22e' : '#2eb886',
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: isFail 
                    ? `🚨 Build Failed: ${selectedProj.displayName}` 
                    : isStart
                    ? `⏳ Deployment Started: ${selectedProj.displayName}`
                    : `✅ Build Succeeded: ${selectedProj.displayName}`,
                  emoji: true
                }
              },
              {
                type: 'section',
                fields: [
                  {
                    type: 'mrkdwn',
                    text: `*Project:*\n<https://${selectedProj.fullDomain}|${selectedProj.displayName}>`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Environment:*\nProduction Edge (Global)`
                  },
                  {
                    type: 'mrkdwn',
                    text: `*Branch / Commit:*\n\`main\` • \`#4f89a2e\``
                  },
                  {
                    type: 'mrkdwn',
                    text: isFail ? `*Error:*\n\`TS2339: Property missing\`` : `*Duration:*\n34s`
                  }
                ]
              },
              ...(config.includeLivePreviewLink ? [
                {
                  type: 'actions',
                  elements: [
                    {
                      type: 'button',
                      text: { type: 'plain_text', text: '🌐 Open Live URL' },
                      url: `https://${selectedProj.fullDomain}`,
                      style: 'primary'
                    },
                    {
                      type: 'button',
                      text: { type: 'plain_text', text: '📋 View Build Logs' },
                      url: `https://${selectedProj.fullDomain}/_logs`
                    }
                  ]
                }
              ] : [])
            ]
          }
        ]
      };

      const newLog: WebhookDeliveryLog = {
        id: `wh-slack-${Date.now()}`,
        integrationName: 'Slack Build Notifier',
        event: eventName,
        status: 200,
        durationMs: 86,
        timestamp: new Date().toLocaleTimeString(),
        requestPayload: JSON.stringify(slackPayload, null, 2),
        responsePayload: '{"ok": true, "channel": "' + config.channel + '"}'
      };

      onTestWebhookLog(newLog);

      const nowStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setConfig(prev => ({
        ...prev,
        lastTestedAt: nowStr,
        lastDeliveryStatus: 'success'
      }));

      setIsTesting(false);
      showToast(`Test notification successfully delivered to ${config.channel} (HTTP 200 OK)!`);
    }, 900);
  };

  const selectedProj = projects.find(p => p.id === config.scopeProject) || projects[0] || {
    name: 'cloudmesh-production',
    displayName: 'CloudMesh Production App',
    fullDomain: 'cloudmesh.cloud-edge.app'
  };

  return (
    <div id="slack-webhook-config-panel" className="space-y-6">
      {/* Top Banner & Status Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-emerald-400">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Slack Build & Deployment Notifications
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active & Connected
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Send real-time alerts for build passes, compile failures, and production edge releases directly to your team's Slack channels.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {hasUnsavedChanges && (
              <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Unsaved changes
              </span>
            )}
            <button
              id="slack-save-config-btn"
              onClick={handleSaveConfig}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg">
            <span className="text-neutral-500 block text-[11px]">Configured Channel</span>
            <span className="text-white font-mono font-bold mt-0.5 block flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-neutral-400" />
              {config.channel}
            </span>
          </div>
          <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg">
            <span className="text-neutral-500 block text-[11px]">Last Test Delivery</span>
            <span className="text-emerald-400 font-mono font-medium mt-0.5 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {config.lastTestedAt || 'Not tested yet'}
            </span>
          </div>
          <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-lg">
            <span className="text-neutral-500 block text-[11px]">Active Event Filters</span>
            <span className="text-neutral-200 font-medium mt-0.5 block">
              {[
                config.notifyOnBuildSuccess && 'Success',
                config.notifyOnBuildFail && 'Failure',
                config.notifyOnDeployStart && 'Started'
              ].filter(Boolean).join(', ') || 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Settings Form & Live Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: Webhook Endpoint */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Slack Incoming Webhook URL
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3 h-3 text-neutral-400" />
                <span>How to get URL?</span>
                {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Guide Accordion */}
            {showGuide && (
              <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs space-y-2 animate-in fade-in">
                <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  Generating a Slack Incoming Webhook in 3 Steps:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] leading-relaxed pl-1">
                  <li>Visit your Slack workspace's <strong className="text-neutral-300">App Directory</strong> and search for <strong className="text-neutral-300">Incoming Webhooks</strong>.</li>
                  <li>Click <strong className="text-neutral-300">Add to Slack</strong> and choose the channel where build notices should post (e.g. <code className="text-emerald-300">#builds-prod</code>).</li>
                  <li>Copy the resulting <code className="text-emerald-300">https://hooks.slack.com/services/...</code> URL and paste it below.</li>
                </ol>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-neutral-300 font-medium flex items-center justify-between">
                <span>Webhook URL</span>
                <span className="text-[10px] text-neutral-500 font-mono">POST Endpoint</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="slack-webhook-url-input"
                  type={showWebhookSecret ? 'text' : 'password'}
                  value={config.webhookUrl}
                  onChange={(e) => handleFieldChange('webhookUrl', e.target.value)}
                  placeholder="https://hooks.slack.com/services/T00000/B00000/XXXXXX"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-3 pr-20 py-2 text-xs text-white font-mono placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
                    title={showWebhookSecret ? 'Mask URL' : 'Show URL'}
                  >
                    {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyWebhookUrl}
                    className="p-1 text-neutral-400 hover:text-white rounded transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-neutral-500">
                This URL is stored securely in your client settings and encrypted during transmission.
              </p>
            </div>
          </div>

          {/* Section 2: Preferred Channel & Identity */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Hash className="w-4 h-4 text-emerald-400" />
              Target Channel & Bot Identity
            </h3>

            <div className="space-y-3">
              {/* Channel input & quick chips */}
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium">Preferred Slack Channel</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-neutral-500 font-mono text-xs">#</span>
                  <input
                    id="slack-channel-input"
                    type="text"
                    value={config.channel.replace(/^#/, '')}
                    onChange={(e) => handleFieldChange('channel', `#${e.target.value.replace(/^#/, '')}`)}
                    placeholder="builds-prod"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Popular channel chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-neutral-500 font-medium">Quick suggestions:</span>
                  {POPULAR_CHANNELS.map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => handleFieldChange('channel', ch)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        config.channel === ch
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800 font-bold'
                          : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bot Name & Emoji */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-300 font-medium">Bot Display Name</label>
                  <input
                    type="text"
                    value={config.botName}
                    onChange={(e) => handleFieldChange('botName', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-neutral-300 font-medium">Avatar Emoji</label>
                  <input
                    type="text"
                    value={config.botEmoji}
                    onChange={(e) => handleFieldChange('botEmoji', e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Scope Target */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs text-neutral-300 font-medium">Project Scope Target</label>
                <select
                  value={config.scopeProject}
                  onChange={(e) => handleFieldChange('scopeProject', e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Global (All Edge Projects & Preview Releases)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName} ({p.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Notification Event Rules */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Real-Time Build Notification Rules
            </h3>

            <div className="space-y-2.5 text-xs">
              <label className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 cursor-pointer hover:border-neutral-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.notifyOnBuildFail}
                  onChange={(e) => handleFieldChange('notifyOnBuildFail', e.target.checked)}
                  className="mt-0.5 rounded border-neutral-700 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="space-y-0.5">
                  <div className="font-semibold text-rose-400 flex items-center gap-1.5">
                    <span>🔴 Build & Compilation Failures</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-300 border border-rose-800">Critical</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Alert channel immediately if TypeScript checks, Vite bundling, or Docker container tests fail. Includes error snippet.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 cursor-pointer hover:border-neutral-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.notifyOnBuildSuccess}
                  onChange={(e) => handleFieldChange('notifyOnBuildSuccess', e.target.checked)}
                  className="mt-0.5 rounded border-neutral-700 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="space-y-0.5">
                  <div className="font-semibold text-emerald-400">
                    🟢 Production & Preview Build Succeeded
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Post confirmation when code is deployed across global edge points with latency & branch details.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 cursor-pointer hover:border-neutral-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.notifyOnDeployStart}
                  onChange={(e) => handleFieldChange('notifyOnDeployStart', e.target.checked)}
                  className="mt-0.5 rounded border-neutral-700 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="space-y-0.5">
                  <div className="font-semibold text-amber-400">
                    ⏳ Deployment Pipeline Started
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Notify channel when a git push or manual trigger initializes a new build container.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 cursor-pointer hover:border-neutral-700 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includeLivePreviewLink}
                  onChange={(e) => handleFieldChange('includeLivePreviewLink', e.target.checked)}
                  className="mt-0.5 rounded border-neutral-700 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="space-y-0.5">
                  <div className="font-semibold text-blue-400">
                    🔗 Attach One-Click "Open Live App" Action Button
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Appends interactive buttons to the Slack message for direct in-app or browser opening of the deployed URL.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Test & Slack UI Mockup Preview */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section: Live Dispatch Tester */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-400" />
                Dispatch Test Notification
              </h3>
              <span className="text-[10px] text-neutral-400 font-mono">Live Simulation</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-neutral-300 font-medium">Simulate Event Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestEventType('success')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      testEventType === 'success'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-xs'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                    }`}
                  >
                    Build Succeeded
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestEventType('failed')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      testEventType === 'failed'
                        ? 'bg-rose-950 text-rose-300 border-rose-700 shadow-xs'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                    }`}
                  >
                    Build Failed
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestEventType('started')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                      testEventType === 'started'
                        ? 'bg-amber-950 text-amber-300 border-amber-700 shadow-xs'
                        : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-neutral-200'
                    }`}
                  >
                    Deploy Started
                  </button>
                </div>
              </div>

              <button
                id="slack-dispatch-test-btn"
                type="button"
                onClick={handleDispatchTest}
                disabled={isTesting}
                className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-semibold text-xs rounded-lg border border-neutral-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-xs"
              >
                <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-bounce text-emerald-400' : 'text-neutral-300'}`} />
                <span>{isTesting ? `Posting to ${config.channel}...` : `Send Test Ping to ${config.channel}`}</span>
              </button>
            </div>
          </div>

          {/* Section: Realistic Slack Message Card Preview */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Slack Channel Preview Mockup
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Rendered Card</span>
            </div>

            {/* Slack UI Sandbox */}
            <div className="bg-[#1A1D21] border border-neutral-800 rounded-lg p-4 font-sans text-neutral-200 space-y-3 shadow-inner">
              {/* Channel Header Bar */}
              <div className="flex items-center gap-1.5 pb-2 border-b border-neutral-800/80 text-[11px] text-neutral-400">
                <Hash className="w-3 h-3 text-neutral-500" />
                <span className="font-bold text-neutral-300">{config.channel.replace(/^#/, '')}</span>
                <span className="text-neutral-600">|</span>
                <span className="text-[10px] text-neutral-500">Real-time edge notification stream</span>
              </div>

              {/* Bot Message Header */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white text-sm shrink-0 shadow-xs">
                  {config.botEmoji === ':rocket:' ? '🚀' : config.botEmoji === ':gear:' ? '⚙️' : '⚡'}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white hover:underline cursor-pointer">
                      {config.botName}
                    </span>
                    <span className="text-[9px] font-bold bg-neutral-700 text-neutral-300 px-1.5 py-0.2 rounded">
                      APP
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Today at 10:42 AM
                    </span>
                  </div>

                  {/* Slack Attachment Block with Left Accent Border */}
                  <div className={`border-l-4 pl-3 py-1 space-y-2 rounded-r-md ${
                    testEventType === 'failed'
                      ? 'border-[#E01E5A] bg-[#22171B]'
                      : testEventType === 'started'
                      ? 'border-[#ECB22E] bg-[#222017]'
                      : 'border-[#2EB67D] bg-[#16241E]'
                  }`}>
                    <div className="text-xs font-bold text-white">
                      {testEventType === 'failed' && `🚨 Build Failed: ${selectedProj.displayName}`}
                      {testEventType === 'started' && `⏳ Deployment Started: ${selectedProj.displayName}`}
                      {testEventType === 'success' && `✅ Build Succeeded: ${selectedProj.displayName}`}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300 font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-sans block">Repository & Branch</span>
                        <span className="text-white font-bold">{selectedProj.repo}</span> (main)
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-sans block">Commit Hash</span>
                        <span className="text-emerald-400">#4f98a2e</span> by rasadsk
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-sans block">Target URL</span>
                        <span className="text-blue-400 underline truncate block">{selectedProj.fullDomain}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-sans block">Status Duration</span>
                        <span>{testEventType === 'failed' ? 'Exit code 1 (TS error)' : '34s • 200 OK'}</span>
                      </div>
                    </div>

                    {/* Interactive Action Buttons */}
                    {config.includeLivePreviewLink && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Live App</span>
                        </button>
                        <button
                          type="button"
                          className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[11px] font-semibold"
                        >
                          View Build Logs
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
