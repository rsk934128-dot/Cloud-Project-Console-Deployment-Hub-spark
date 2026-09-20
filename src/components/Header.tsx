import React from 'react';
import { Search, Bell, Sparkles, Terminal, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenGmailModal: () => void;
  onOpenNotificationCenter: () => void;
  unreadAlertsCount: number;
  gmailConnected: boolean;
  onQuickSimulateAlert: () => void;
  onThemeSwitched?: (theme: 'dark' | 'light') => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onRefresh,
  isRefreshing,
  onOpenGmailModal,
  onOpenNotificationCenter,
  unreadAlertsCount,
  gmailConnected,
  onQuickSimulateAlert,
  onThemeSwitched
}) => {
  return (
    <header id="app-header" className="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 38 projects, deployments, domains, or logs... (Press '/' to focus)"
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-neutral-700 text-xs text-neutral-200 placeholder-neutral-400 rounded-md pl-9 pr-10 py-2 outline-none focus:ring-1 focus:ring-neutral-700 transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 rounded">
            /
          </kbd>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        <button
          id="btn-header-refresh"
          onClick={onRefresh}
          title="Refresh metrics & sync"
          className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
        </button>

        <button
          id="btn-header-test-alert"
          onClick={onQuickSimulateAlert}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-md text-xs font-medium border border-neutral-700 transition-colors"
          title="Dispatch automated test alert to verified Gmail"
        >
          <Send className="w-3.5 h-3.5 text-amber-400" />
          <span>Send Test Alert</span>
        </button>

        <button
          id="btn-header-gmail-manage"
          onClick={onOpenGmailModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
            gmailConnected
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
              : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${gmailConnected ? 'text-emerald-400' : 'text-neutral-400'}`} />
          <span className="hidden sm:inline">{gmailConnected ? 'Gmail Synced' : 'Sync Gmail'}</span>
        </button>

        {/* Notifications Icon Button */}
        <button
          id="btn-header-notifications"
          onClick={onOpenNotificationCenter}
          className="relative p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-md transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
          )}
          {unreadAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
          )}
        </button>

        {/* Global Theme Toggle */}
        <ThemeToggle
          id="btn-header-theme-toggle"
          variant="compact"
          onThemeChange={onThemeSwitched}
        />

        {/* User avatar badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-xs">
            R
          </div>
        </div>
      </div>
    </header>
  );
};
