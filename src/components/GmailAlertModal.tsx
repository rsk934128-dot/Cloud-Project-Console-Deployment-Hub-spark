import React, { useState } from 'react';
import { GmailAlertMessage, ProjectItem } from '../types';
import { 
  X, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  RefreshCw, 
  Inbox, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Key
} from 'lucide-react';
import { 
  sendDeploymentAlertEmail, 
  fetchDeploymentAlerts, 
  requestGmailAccess 
} from '../services/gmailService';

interface GmailAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: GmailAlertMessage[];
  setAlerts: React.Dispatch<React.SetStateAction<GmailAlertMessage[]>>;
  projects: ProjectItem[];
  preselectedProject?: ProjectItem | null;
  userEmail: string;
  gmailToken: string | null;
  onTokenUpdate: (token: string) => void;
}

export const GmailAlertModal: React.FC<GmailAlertModalProps> = ({
  isOpen,
  onClose,
  alerts,
  setAlerts,
  projects,
  preselectedProject,
  userEmail,
  gmailToken,
  onTokenUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose' | 'settings'>('inbox');
  const [targetEmail, setTargetEmail] = useState(userEmail || 'rasadsk007@gmail.com');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    preselectedProject ? preselectedProject.id : projects[0]?.id || ''
  );
  const [alertType, setAlertType] = useState<'critical_failure' | 'anomaly' | 'budget_warning'>('critical_failure');
  const [customSubject, setCustomSubject] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ success?: boolean; msg?: string } | null>(null);
  const [isFetchingAlerts, setIsFetchingAlerts] = useState(false);

  if (!isOpen) return null;

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];

  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setSendStatus(null);

    const subject = customSubject || `[Alert] Deployment Status for ${activeProject.displayName}: ${
      alertType === 'critical_failure' ? 'Build Failed (Exit Code 1)' :
      alertType === 'anomaly' ? 'High Latency / Edge Error Spike' : 'Fast Transfer Budget Notification'
    }`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; color: #111827;">
        <h2 style="color: #111827; margin-top: 0;">Deployment Alert: ${activeProject.displayName}</h2>
        <p style="color: #4b5563; font-size: 14px;">This notification was dispatched automatically by Cloud Project Console & Deployment Hub.</p>
        
        <div style="background-color: #f9fafb; border-radius: 6px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
          <table style="width: 100%; font-size: 13px;">
            <tr>
              <td style="color: #6b7280; padding: 4px 0;"><strong>Project:</strong></td>
              <td style="color: #111827; font-weight: 600;">${activeProject.displayName}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 4px 0;"><strong>Production URL:</strong></td>
              <td><a href="https://${activeProject.fullDomain}" style="color: #2563eb;">https://${activeProject.fullDomain}</a></td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 4px 0;"><strong>Repository:</strong></td>
              <td style="font-family: monospace;">${activeProject.repo} (${activeProject.branch})</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 4px 0;"><strong>Status:</strong></td>
              <td><span style="color: ${activeProject.status === 'READY' ? '#059669' : '#dc2626'}; font-weight: bold;">${activeProject.status}</span></td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 4px 0;"><strong>Latest Commit:</strong></td>
              <td style="font-family: monospace;">${activeProject.latestCommit}</td>
            </tr>
          </table>
        </div>

        ${customNote ? `<div style="background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 12px; margin-bottom: 16px; font-size: 13px; color: #92400e;"><strong>Engineer Note:</strong> ${customNote}</div>` : ''}

        <p style="font-size: 12px; color: #9ca3af; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
          Cloud Project Console • Verified Gmail OAuth Integration • Project ID: gen-lang-client-0712496286
        </p>
      </div>
    `;

    const result = await sendDeploymentAlertEmail(
      gmailToken || 'mock_token',
      targetEmail,
      subject,
      bodyHtml
    );

    setIsSending(false);
    if (result.success) {
      setSendStatus({ success: true, msg: `Alert dispatched successfully to ${targetEmail}!` });
      // Prepend to alerts list
      const newAlert: GmailAlertMessage = {
        id: 'new-' + Date.now(),
        threadId: 'th-' + Date.now(),
        subject,
        from: `Me <${userEmail}>`,
        date: 'Just now',
        snippet: customNote || `Alert sent for ${activeProject.displayName}`,
        isRead: true,
        severity: alertType === 'critical_failure' ? 'critical' : alertType === 'anomaly' ? 'warning' : 'info',
        projectId: activeProject.id
      };
      setAlerts((prev) => [newAlert, ...prev]);
      setTimeout(() => {
        setActiveTab('inbox');
        setSendStatus(null);
      }, 1500);
    } else {
      setSendStatus({ success: false, msg: result.error || 'Failed to send alert via Gmail API' });
    }
  };

  const handleRefreshAlerts = async () => {
    setIsFetchingAlerts(true);
    const newItems = await fetchDeploymentAlerts(gmailToken || 'mock_token');
    setAlerts(newItems);
    setIsFetchingAlerts(false);
  };

  const handleConnectGmail = () => {
    requestGmailAccess((token) => {
      onTokenUpdate(token);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        id="gmail-alert-modal"
        className="bg-neutral-900 border border-neutral-800 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Gmail Project Alerts & Notifications
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                  OAuth Active
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Connected inbox: <span className="text-neutral-200 font-medium">{userEmail}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/40 px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'inbox'
                ? 'border-red-500 text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Alert Inbox</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-neutral-800 text-[10px]">
              {alerts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('compose')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'compose'
                ? 'border-red-500 text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Alert</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-red-500 text-white font-semibold'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>OAuth & Triggers</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'inbox' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 pb-1">
                <span>Recent deployment notices and anomaly alerts synced from Gmail</span>
                <button
                  onClick={handleRefreshAlerts}
                  className="flex items-center gap-1 text-neutral-300 hover:text-white"
                >
                  <RefreshCw className={`w-3 h-3 ${isFetchingAlerts ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  No alerts currently found in inbox.
                </div>
              ) : (
                <div className="divide-y divide-neutral-800 border border-neutral-800 rounded-lg overflow-hidden bg-neutral-950/60">
                  {alerts.map((al) => (
                    <div key={al.id} className="p-3.5 hover:bg-neutral-900 transition-colors text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            al.severity === 'critical' ? 'bg-rose-500' :
                            al.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                          }`} />
                          <span className="font-semibold text-white truncate max-w-sm">
                            {al.subject}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-400 shrink-0">{al.date}</span>
                      </div>
                      <div className="text-neutral-400 mt-1 pl-4 text-[11px] line-clamp-2">
                        {al.snippet}
                      </div>
                      <div className="mt-2 pl-4 flex items-center justify-between text-[10px] text-neutral-400">
                        <span className="truncate">From: {al.from}</span>
                        {al.projectId && (
                          <span className="font-mono text-neutral-400 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">
                            Project ID: {al.projectId}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'compose' && (
            <form onSubmit={handleSendAlert} className="space-y-4 text-xs">
              {sendStatus && (
                <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  sendStatus.success ? 'bg-emerald-950/80 border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border-rose-800 text-rose-300'
                }`}>
                  {sendStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertOctagon className="w-4 h-4 shrink-0" />}
                  <span>{sendStatus.msg}</span>
                </div>
              )}

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:border-neutral-600 font-mono"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.displayName} ({p.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Alert Trigger Category</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAlertType('critical_failure')}
                    className={`p-2 rounded border text-left transition-colors ${
                      alertType === 'critical_failure'
                        ? 'border-rose-600 bg-rose-950/40 text-rose-300 font-semibold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="font-semibold">Build Failure</div>
                    <div className="text-[10px] opacity-75">Exit code 1, syntax error</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('anomaly')}
                    className={`p-2 rounded border text-left transition-colors ${
                      alertType === 'anomaly'
                        ? 'border-amber-600 bg-amber-950/40 text-amber-300 font-semibold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="font-semibold">Runtime Spike</div>
                    <div className="text-[10px] opacity-75">Latency &gt; 100ms or 5xx</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertType('budget_warning')}
                    className={`p-2 rounded border text-left transition-colors ${
                      alertType === 'budget_warning'
                        ? 'border-blue-600 bg-blue-950/40 text-blue-300 font-semibold'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="font-semibold">Budget / Limit</div>
                    <div className="text-[10px] opacity-75">Data transfer &gt; 90%</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">Recipient Email Address</label>
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:border-neutral-600 font-mono"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Custom Subject Line (optional)
                </label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder={`[Alert] Deployment status for ${activeProject.displayName}`}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium mb-1">
                  Engineer Diagnostics Note (optional)
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Investigation underway for failing WebRTC buttons. Rolling back to commit c49f1a."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-white outline-none focus:border-neutral-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isSending ? 'animate-spin' : ''}`} />
                  <span>{isSending ? 'Dispatching via Gmail API...' : 'Send Alert Email'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Google Workspace OAuth Configuration
                </h3>
                <p className="text-neutral-400 mt-1 leading-relaxed">
                  Gmail read and send scopes are enabled for this project deployment hub:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 font-mono text-[11px] text-neutral-300">
                  <li>https://www.googleapis.com/auth/gmail.readonly</li>
                  <li>https://www.googleapis.com/auth/gmail.send</li>
                </ul>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">OAuth Access Token</h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Session token allows background polling of deployment messages.
                    </p>
                  </div>
                  <button
                    onClick={handleConnectGmail}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs border border-neutral-700 transition-colors"
                  >
                    Re-Authenticate
                  </button>
                </div>
              </div>

              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
                <h4 className="font-semibold text-white">Automated Anomaly Rules</h4>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded bg-neutral-800 border-neutral-700" />
                  <span>Automatically dispatch email when build step fails</span>
                </label>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded bg-neutral-800 border-neutral-700" />
                  <span>Notify when 24h Fast Data Transfer exceeds 90%</span>
                </label>
                <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded bg-neutral-800 border-neutral-700" />
                  <span>Weekly digest of 38 deployed projects and error rates</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
