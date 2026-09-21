import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProjectGrid } from './components/ProjectGrid';
import { UsageOverview } from './components/UsageOverview';
import { LogsViewer } from './components/LogsViewer';
import { DeploymentsView } from './components/DeploymentsView';
import { AnalyticsConsole } from './components/AnalyticsConsole';
import { SpeedConsole } from './components/SpeedConsole';
import { ObservabilityConsole } from './components/ObservabilityConsole';
import { FirewallConsole } from './components/FirewallConsole';
import { CdnConsole } from './components/CdnConsole';
import { EnvVarsConsole } from './components/EnvVarsConsole';
import { DomainsConsole } from './components/DomainsConsole';
import { ConnectConsole } from './components/ConnectConsole';
import { IntegrationsConsole } from './components/IntegrationsConsole';
import { StorageConsole } from './components/StorageConsole';
import { FlagsConsole } from './components/FlagsConsole';
import { SupportConsole } from './components/SupportConsole';
import { AIGatewayConsole } from './components/AIGatewayConsole';
import { AgentConsole } from './components/AgentConsole';
import { SandboxesConsole } from './components/SandboxesConsole';
import { ImagePipelineConsole } from './components/ImagePipelineConsole';
import { WorkflowsConsole } from './components/WorkflowsConsole';
import { SecuritySettings } from './components/SecuritySettings';
import { LandingPage } from './components/LandingPage';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { GmailAlertModal } from './components/GmailAlertModal';
import { GitHubDeploymentModal } from './components/GitHubDeploymentModal';
import { ThemeToggle } from './components/ThemeToggle';
import { ThemeProvider, useTheme, THEME_STORAGE_KEY } from './context/ThemeContext';
import { ProjectItem, GmailAlertMessage } from './types';
import { INITIAL_PROJECTS, MOCK_PROJECT_LOGS, USER_INFO } from './mockData';
import { getGmailToken, setGmailToken, getSyntheticDeploymentAlerts } from './services/gmailService';
import { 
  FolderGit2, 
  LayoutGrid, 
  List, 
  Filter, 
  Plus, 
  ExternalLink, 
  AlertTriangle,
  Mail,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sun,
  Moon,
  Shield,
  ShieldCheck,
  Settings as SettingsIcon,
  Monitor,
  RotateCcw,
  Github
} from 'lucide-react';

function AppContent() {
  const { 
    theme, 
    setTheme, 
    toggleTheme, 
    resetToSystemTheme, 
    isSystemTheme, 
    systemTheme, 
    isDark 
  } = useTheme();
  const [currentView, setCurrentView] = useState<'landing' | 'console'>('landing');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('app_is_logged_in') === 'true';
  });
  const [currentUserEmail, setCurrentUserEmail] = useState<string>(() => {
    return localStorage.getItem('app_user_email') || USER_INFO.email;
  });

  const [activeTab, setActiveTab] = useState<string>('projects');
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  
  // GitHub Deployment Pipeline Modal State
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  // Gmail Integration State
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  const [gmailAlerts, setGmailAlerts] = useState<GmailAlertMessage[]>([]);
  const [gmailToken, setGmailTokenState] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [settingsSection, setSettingsSection] = useState<'all' | 'security' | 'appearance' | 'account'>('all');

  const handleLogin = (email: string) => {
    setIsLoggedIn(true);
    setCurrentUserEmail(email);
    localStorage.setItem('app_is_logged_in', 'true');
    localStorage.setItem('app_user_email', email);
    showToast(`স্বাগতম! ${email} হিসেবে সফলভাবে লগইন হয়েছে।`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('app_is_logged_in');
    setCurrentView('landing');
    showToast('সফলভাবে লগআউট করা হয়েছে।');
  };

  // Initialize Gmail tokens and alerts on mount
  useEffect(() => {
    const existingToken = getGmailToken();
    if (existingToken) {
      setGmailTokenState(existingToken);
    }
    // Load initial alerts from memory or synthetic storage
    setGmailAlerts(getSyntheticDeploymentAlerts());
  }, []);

  // Keyboard shortcut: '/' to focus global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input') as HTMLInputElement | null;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Projects and metrics synced with cloud edge network.');
    }, 700);
  };

  const handleTokenUpdate = (token: string) => {
    setGmailToken(token);
    setGmailTokenState(token);
    showToast('Gmail OAuth verified successfully! Alerts will stream directly.');
  };

  const handleRebuild = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === projectId) {
          return {
            ...p,
            status: 'READY',
            latestCommit: 'fix: hotfix patch applied & build succeeded',
            commitTime: 'Just now',
            healthScore: 99,
            alertsCount: 0
          };
        }
        return p;
      })
    );
    showToast(`Build triggered successfully for ${projectId}`);
    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) => prev ? { ...prev, status: 'READY', healthScore: 99, alertsCount: 0 } : null);
    }
  };

  const handleQuickSimulateAlert = () => {
    setIsGmailModalOpen(true);
  };

  const handleThemeSwitched = (newTheme: 'dark' | 'light') => {
    showToast(
      newTheme === 'dark' 
        ? 'Switched to Dark Theme (Saved in LocalStorage)' 
        : 'Switched to High-Contrast Light Theme (Saved in LocalStorage)'
    );
  };

  const handleResetToSystemTheme = () => {
    resetToSystemTheme();
    const osScheme = systemTheme === 'dark' ? 'Dark' : 'High-Contrast Light';
    showToast(`Reset to System Default: Reverted to OS color scheme (${osScheme}). Local storage preference cleared.`);
  };

  // Filter projects by search and status
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = 
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fullDomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.latestCommit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ERROR' && p.status === 'ERROR') ||
      (statusFilter === 'READY' && p.status === 'READY') ||
      (statusFilter === 'BUILDING' && p.status === 'BUILDING');

    return matchesSearch && matchesStatus;
  });

  const unreadAlertsCount = gmailAlerts.filter((a) => !a.isRead).length;

  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <LandingPage
          onEnterConsole={() => setCurrentView('console')}
          onLogin={handleLogin}
          isLoggedIn={isLoggedIn}
          userEmail={currentUserEmail}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100 font-sans overflow-hidden select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-neutral-700 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertsCount={unreadAlertsCount}
        gmailConnected={!!gmailToken}
        onOpenGmailModal={() => setIsGmailModalOpen(true)}
        onOpenLandingPage={() => setCurrentView('landing')}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onOpenGmailModal={() => setIsGmailModalOpen(true)}
          onOpenNotificationCenter={() => setIsGmailModalOpen(true)}
          unreadAlertsCount={unreadAlertsCount}
          gmailConnected={!!gmailToken}
          onQuickSimulateAlert={handleQuickSimulateAlert}
          onThemeSwitched={handleThemeSwitched}
          onOpenLandingPage={() => setCurrentView('landing')}
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
          onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-800">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* View Tab: Projects */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                {/* Search & Action bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      Projects
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                        {filteredProjects.length}
                      </span>
                    </h1>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status filter dropdown */}
                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 text-xs text-neutral-400">
                      {(['ALL', 'READY', 'ERROR'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatusFilter(st)}
                          className={`px-2.5 py-1 rounded-md transition-colors ${
                            statusFilter === st
                              ? 'bg-neutral-800 text-white font-medium shadow-xs'
                              : 'hover:text-neutral-200'
                          }`}
                        >
                          {st === 'ALL' ? 'All' : st === 'READY' ? 'Ready' : 'Failed (4)'}
                        </button>
                      ))}
                    </div>

                    {/* View Switcher: Grid vs List */}
                    <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-0.5">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-colors ${
                          viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-colors ${
                          viewMode === 'list' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
                        }`}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Deploy from GitHub & Add new project action */}
                    <button
                      id="projects-github-deploy-btn"
                      onClick={() => setIsGitHubModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Deploy from GitHub</span>
                    </button>

                    <button
                      id="projects-add-new-btn"
                      onClick={() => setIsGitHubModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-lg shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New...</span>
                    </button>
                  </div>
                </div>

                {/* Project List / Grid */}
                <ProjectGrid
                  projects={filteredProjects}
                  viewMode={viewMode}
                  onSelectProject={(p) => setSelectedProject(p)}
                  onSendAlertForProject={(p) => {
                    setSelectedProject(p);
                    setIsGmailModalOpen(true);
                  }}
                />
              </div>
            )}

            {/* View Tab: Deployments */}
            {activeTab === 'deployments' && (
              <DeploymentsView
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
                onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
              />
            )}

            {/* View Tab: Usage */}
            {activeTab === 'usage' && (
              <UsageOverview onOpenGmailAlerts={() => setIsGmailModalOpen(true)} />
            )}

            {/* View Tab: Logs */}
            {activeTab === 'logs' && (
              <LogsViewer projects={projects} />
            )}

            {/* View Tab: Analytics Console */}
            {activeTab === 'analytics' && (
              <AnalyticsConsole
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
                onOpenGmailAlerts={() => setIsGmailModalOpen(true)}
              />
            )}

            {/* View Tab: Speed Insights Console */}
            {activeTab === 'speed' && (
              <SpeedConsole
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            )}

            {/* View Tab: Observability Console */}
            {activeTab === 'observability' && (
              <ObservabilityConsole
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            )}

            {/* View Tab: Firewall & Edge Security Console */}
            {activeTab === 'firewall' && (
              <FirewallConsole
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            )}

            {/* View Tab: Edge CDN & Global Cache Routing */}
            {activeTab === 'cdn' && (
              <CdnConsole
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            )}

            {/* View Tab: Environment Variables & Secrets Store */}
            {activeTab === 'env_vars' && (
              <EnvVarsConsole
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            )}

            {/* View Tab: Domains & Anycast DNS Console */}
            {activeTab === 'domains' && (
              <DomainsConsole
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            )}

            {/* View Tab: Connect (Secure VPC & PrivateLink Interconnect) */}
            {activeTab === 'connect' && (
              <ConnectConsole
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            )}

            {/* View Tab: Integrations & Webhook Dispatch Console */}
            {activeTab === 'integrations' && (
              <IntegrationsConsole
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            )}

            {/* View Tab: Unified Storage Console */}
            {activeTab === 'storage' && (
              <StorageConsole />
            )}

            {/* View Tab: Feature Flags & Remote Config Console */}
            {activeTab === 'flags' && (
              <FlagsConsole />
            )}

            {/* View Tab: Support Console & Incident Command */}
            {activeTab === 'support' && (
              <SupportConsole
                projects={projects}
                onSelectProject={(p) => setSelectedProject(p)}
              />
            )}

            {/* View Tab: Gmail Alerts Dedicated Tab */}
            {activeTab === 'gmail_alerts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-red-400" />
                      Gmail Integration & Alert Hub
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Automated deployment warnings, build errors, and quota thresholds delivered to {USER_INFO.email}.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsGmailModalOpen(true)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Open Alert Dispatcher</span>
                  </button>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                  <h3 className="text-sm font-semibold text-white mb-2">Connected Scopes</h3>
                  <div className="space-y-2 text-xs font-mono text-neutral-300">
                    <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-between">
                      <span>https://www.googleapis.com/auth/gmail.readonly</span>
                      <span className="text-emerald-400 text-[10px] font-bold">AUTHORIZED</span>
                    </div>
                    <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 flex items-center justify-between">
                      <span>https://www.googleapis.com/auth/gmail.send</span>
                      <span className="text-emerald-400 text-[10px] font-bold">AUTHORIZED</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                    <h4 className="text-xs font-semibold text-white mb-1">Target Recipient</h4>
                    <p className="text-xs text-neutral-400">{USER_INFO.email}</p>
                    <div className="mt-3 text-[11px] text-neutral-400">
                      Dispatches instant notifications whenever a deployment build fails or critical latency spikes above 100ms.
                    </div>
                  </div>

                  <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                    <h4 className="text-xs font-semibold text-white mb-1">Recent Anomaly Activity</h4>
                    <p className="text-xs text-amber-400">{unreadAlertsCount} unread incident reports</p>
                    <div className="mt-3 text-[11px] text-neutral-400">
                      Sync interval: Real-time via Google Identity OAuth2 access token.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View Tab: Settings with Theme Preferences & Security */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="border-b border-neutral-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <SettingsIcon className="w-4 h-4 text-neutral-400" />
                      Account & Workspace Settings
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Configure console appearance, security credentials, two-factor authentication, and persistent preferences.
                    </p>
                  </div>

                  {/* Subsections Nav Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-lg shrink-0">
                    <button
                      id="tab-settings-all"
                      type="button"
                      onClick={() => setSettingsSection('all')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        settingsSection === 'all'
                          ? 'bg-neutral-800 text-white shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      id="tab-settings-security"
                      type="button"
                      onClick={() => setSettingsSection('security')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        settingsSection === 'security'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Security & 2FA
                    </button>
                    <button
                      id="tab-settings-appearance"
                      type="button"
                      onClick={() => setSettingsSection('appearance')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        settingsSection === 'appearance'
                          ? 'bg-neutral-800 text-white shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Appearance
                    </button>
                    <button
                      id="tab-settings-account"
                      type="button"
                      onClick={() => setSettingsSection('account')}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        settingsSection === 'account'
                          ? 'bg-neutral-800 text-white shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Account
                    </button>
                  </div>
                </div>

                {/* Security Subsection: Password Update & 2FA Simulation */}
                {(settingsSection === 'all' || settingsSection === 'security') && (
                  <SecuritySettings />
                )}

                {/* Appearance Section */}
                {(settingsSection === 'all' || settingsSection === 'appearance') && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-indigo-400" />
                        Global Appearance & Theme
                      </h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Select your preferred interface contrast mode. Persists automatically in browser local storage.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isSystemTheme ? (
                        <span 
                          id="badge-theme-system-status"
                          className="text-[11px] font-medium text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-800/60 flex items-center gap-1.5"
                          title="Currently adhering to the OS system color scheme"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>OS System Default ({systemTheme.toUpperCase()})</span>
                        </span>
                      ) : (
                        <span 
                          id="badge-theme-custom-status"
                          className="text-[11px] font-medium text-amber-300 bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-800/60 flex items-center gap-1.5"
                          title="Custom theme preference stored in browser local storage"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                          <span>Custom Override ({theme.toUpperCase()})</span>
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-neutral-400 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
                        key: {THEME_STORAGE_KEY}
                      </span>
                    </div>
                  </div>

                  {/* Theme Option Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Dark Theme Card */}
                    <div
                      id="theme-card-dark"
                      onClick={() => {
                        setTheme('dark');
                        handleThemeSwitched('dark');
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isDark && !isSystemTheme
                          ? 'border-indigo-500 bg-neutral-950/80 ring-2 ring-indigo-500/20'
                          : isDark && isSystemTheme
                          ? 'border-indigo-500/70 bg-neutral-950/60 ring-1 ring-indigo-500/10'
                          : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400">
                            <Moon className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">Dark Theme</div>
                            <div className="text-[11px] text-neutral-400">Default Developer Dark</div>
                          </div>
                        </div>
                        {isDark && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {isSystemTheme ? 'ACTIVE (SYSTEM)' : 'ACTIVE'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Deep neutral background (#0a0a0a) optimized for extended low-light operations and battery conservation.
                      </p>
                    </div>

                    {/* High-Contrast Light Theme Card */}
                    <div
                      id="theme-card-light"
                      onClick={() => {
                        setTheme('light');
                        handleThemeSwitched('light');
                      }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        !isDark && !isSystemTheme
                          ? 'border-indigo-500 bg-neutral-950/80 ring-2 ring-indigo-500/20'
                          : !isDark && isSystemTheme
                          ? 'border-indigo-500/70 bg-neutral-950/60 ring-1 ring-indigo-500/10'
                          : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-500">
                            <Sun className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">High-Contrast Light</div>
                            <div className="text-[11px] text-neutral-400">WCAG AAA Ratio (15:1)</div>
                          </div>
                        </div>
                        {!isDark && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {isSystemTheme ? 'ACTIVE (SYSTEM)' : 'ACTIVE'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Crisp white canvas (#ffffff) with deep black typography (#09090b) and defined borders for sunlight or high-glare environments.
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar with 'Reset to System Default' Button and Quick Toggle */}
                  <div className="pt-3 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        id="btn-reset-to-system-default"
                        onClick={handleResetToSystemTheme}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          isSystemTheme
                            ? 'bg-neutral-800/60 border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800'
                            : 'bg-indigo-950/50 border-indigo-700/80 text-indigo-200 hover:bg-indigo-900/70 hover:text-white shadow-xs'
                        }`}
                        title="Clear localStorage theme preference and revert to OS-determined color scheme"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isSystemTheme ? 'text-neutral-400' : 'text-indigo-400'}`} />
                        <span>Reset to System Default</span>
                        {isSystemTheme && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                            ACTIVE
                          </span>
                        )}
                      </button>

                      <span className="text-[11px] text-neutral-400">
                        {isSystemTheme ? (
                          <span className="text-emerald-400/90">
                            Local storage cleared. Automatically syncing with OS preference ({systemTheme.toUpperCase()}).
                          </span>
                        ) : (
                          <span>
                            Local storage preference set. Click to clear and revert to OS scheme ({systemTheme.toUpperCase()}).
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      <span className="text-xs text-neutral-400">Quick Toggle:</span>
                      <ThemeToggle id="settings-theme-pill" variant="pill" onThemeChange={handleThemeSwitched} />
                    </div>
                  </div>
                </div>
                )}

                {/* Account Details */}
                {(settingsSection === 'all' || settingsSection === 'account') && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-white">Account Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <div className="text-neutral-400">User Email</div>
                        <div className="font-mono text-white mt-1">{USER_INFO.email}</div>
                      </div>
                      <div>
                        <div className="text-neutral-400">Active Deployment Projects</div>
                        <div className="font-mono text-white mt-1">38 Production Clusters</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View Tab: AI Gateway Console */}
            {activeTab === 'ai_gateway' && (
              <AIGatewayConsole />
            )}

            {/* View Tab: Autonomous Ops Agent Console */}
            {activeTab === 'agent' && (
              <AgentConsole />
            )}

            {/* View Tab: MicroVM Sandboxes & Code Execution */}
            {activeTab === 'sandboxes' && (
              <SandboxesConsole />
            )}

            {/* View Tab: Edge Image Optimization Pipeline */}
            {activeTab === 'images' && (
              <ImagePipelineConsole />
            )}

            {/* View Tab: Serverless Workflows & DAG Pipelines */}
            {activeTab === 'workflows' && (
              <WorkflowsConsole />
            )}
          </div>
        </main>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          logs={MOCK_PROJECT_LOGS[selectedProject.id] || []}
          onClose={() => setSelectedProject(null)}
          onSendAlert={(p) => {
            setIsGmailModalOpen(true);
          }}
          onRebuild={handleRebuild}
          onOpenCompare={(p) => {
            setSelectedProject(null);
            setActiveTab('deployments');
          }}
        />
      )}

      {/* Gmail Alert Modal */}
      <GmailAlertModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
        alerts={gmailAlerts}
        setAlerts={setGmailAlerts}
        projects={projects}
        preselectedProject={selectedProject}
        userEmail={USER_INFO.email}
        gmailToken={gmailToken}
        onTokenUpdate={handleTokenUpdate}
      />

      {/* GitHub Deployment Pipeline & Live App Viewer Modal */}
      <GitHubDeploymentModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        onProjectDeployed={(newProject) => {
          setProjects(prev => [newProject, ...prev]);
          MOCK_PROJECT_LOGS[newProject.id] = [
            {
              id: `log-${Date.now()}-1`,
              timestamp: 'Just now',
              level: 'info',
              message: `Build container initialized for GitHub repo ${newProject.repo}`,
              source: 'builder'
            },
            {
              id: `log-${Date.now()}-2`,
              timestamp: 'Just now',
              level: 'success',
              message: `Static bundle generated and deployed to edge: https://${newProject.fullDomain}`,
              source: 'edge'
            }
          ];
          showToast(`🎉 Deployed ${newProject.displayName} to https://${newProject.fullDomain}!`);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
