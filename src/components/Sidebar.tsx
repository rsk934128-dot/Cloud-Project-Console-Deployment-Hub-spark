import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { 
  FolderGit2, 
  Rocket, 
  Terminal, 
  BarChart3, 
  Activity, 
  ShieldCheck, 
  Globe, 
  Variable, 
  Layers, 
  Radio, 
  HardDrive, 
  Flag, 
  Bot, 
  Cpu, 
  Box, 
  GitFork, 
  Image as ImageIcon, 
  PieChart, 
  HelpCircle, 
  Settings, 
  Bell, 
  Mail,
  Zap,
  ExternalLink,
  LifeBuoy
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadAlertsCount: number;
  gmailConnected: boolean;
  onOpenGmailModal: () => void;
  onOpenLandingPage?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  unreadAlertsCount,
  gmailConnected,
  onOpenGmailModal,
  onOpenLandingPage
}) => {
  const mainNavigation = [
    { id: 'projects', label: 'Projects', icon: FolderGit2, badge: '38' },
    { id: 'deployments', label: 'Deployments', icon: Rocket },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'Live' },
    { id: 'speed', label: 'Speed Insights', icon: Zap, badge: '96' },
    { id: 'observability', label: 'Observability', icon: Activity, badge: 'Traces' },
    { id: 'firewall', label: 'Firewall', icon: ShieldCheck, badge: 'WAF' },
    { id: 'cdn', label: 'CDN', icon: Globe, badge: 'Edge' },
    { id: 'env_vars', label: 'Environment Variables', icon: Variable, badge: 'Secrets' },
    { id: 'domains', label: 'Domains', icon: Globe, badge: 'DNS' },
    { id: 'connect', label: 'Connect', icon: Layers, badge: 'VPC' },
    { id: 'integrations', label: 'Integrations', icon: Radio, badge: 'Hub' },
    { id: 'storage', label: 'Storage', icon: HardDrive, badge: 'S3/KV' },
    { id: 'flags', label: 'Flags', icon: Flag, badge: 'Edge' },
    { id: 'support', label: 'Support', icon: LifeBuoy, badge: '24/7' },
    { id: 'agent', label: 'Agent', icon: Bot, isNew: true },
    { id: 'ai_gateway', label: 'AI Gateway', icon: Cpu, badge: 'Edge' },
    { id: 'sandboxes', label: 'Sandboxes', icon: Box, badge: 'MicroVM' },
    { id: 'workflows', label: 'Workflows', icon: GitFork },
    { id: 'images', label: 'Images', icon: ImageIcon, badge: 'Pipeline' },
    { id: 'usage', label: 'Usage', icon: PieChart },
    { id: 'gmail_alerts', label: 'Gmail Alerts', icon: Mail, badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : undefined, highlight: true }
  ];

  return (
    <aside id="main-sidebar" className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen shrink-0 sticky top-0 select-none">
      {/* Brand & Team Switcher Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-black border border-neutral-700 flex items-center justify-center font-bold text-white shadow-xs">
            ▲
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-neutral-200 tracking-tight flex items-center gap-1.5">
              rubels1k994-2960
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">Hobby</span>
            </span>
            <span className="text-[11px] text-neutral-400 truncate max-w-[130px]">rasadsk007@gmail.com</span>
          </div>
        </div>
      </div>

      {/* Gmail Integration Status Banner in Sidebar */}
      <div className="px-3 pt-3">
        <button
          id="sidebar-gmail-status-btn"
          onClick={onOpenGmailModal}
          className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs flex items-center justify-between ${
            gmailConnected 
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/50' 
              : 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300 hover:bg-indigo-900/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${gmailConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="font-medium">{gmailConnected ? 'Gmail Alerts Active' : 'Connect Gmail Alerts'}</span>
          </div>
          <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded font-mono border border-white/10">OAuth</span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 text-xs text-neutral-400 scrollbar-thin scrollbar-thumb-neutral-800">
        <div className="px-2 pb-1.5 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Navigation</div>
        {mainNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors font-medium text-left ${
                isActive 
                  ? 'bg-neutral-800 text-white font-semibold' 
                  : item.highlight && unreadAlertsCount > 0
                  ? 'text-amber-300 hover:bg-neutral-800/60'
                  : 'hover:bg-neutral-800/60 hover:text-neutral-200'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-neutral-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {item.isNew && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">NEW</span>
                )}
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                    item.highlight ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom utilities */}
      <div className="p-3 border-t border-neutral-800 space-y-1.5">
        <ThemeToggle id="sidebar-theme-toggle" variant="expanded" />

        <button 
          id="sidebar-help-btn"
          onClick={() => setActiveTab('support')}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
            activeTab === 'support' 
              ? 'bg-neutral-800 text-white font-medium shadow-xs' 
              : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
          }`}
        >
          <HelpCircle className={`w-4 h-4 ${activeTab === 'support' ? 'text-white' : 'text-neutral-400'}`} />
          <span>Support & Docs</span>
        </button>
        <button 
          id="sidebar-settings-btn"
          onClick={() => setActiveTab('settings')}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60"
        >
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>
    </aside>
  );
};
