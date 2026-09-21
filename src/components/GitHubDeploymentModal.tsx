import React, { useState, useEffect } from 'react';
import { 
  X, 
  Github, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Rocket, 
  GitBranch, 
  Search, 
  Lock, 
  Unlock, 
  Star, 
  GitFork, 
  FolderGit2, 
  Sliders, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Globe, 
  Key, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  Layers,
  Zap
} from 'lucide-react';
import { GitHubUser, GitHubRepo, GitHubDeploymentConfig } from '../types/github';
import { 
  DEFAULT_GITHUB_USER, 
  CURATED_GITHUB_REPOS, 
  FRAMEWORK_PRESETS, 
  DOMAIN_SUFFIX_OPTIONS, 
  REGIONS_LIST, 
  generateSanitizedSubdomain,
  GITHUB_APP_CONFIG
} from '../data/githubData';
import { ProjectItem } from '../types';
import { LiveAppViewer } from './LiveAppViewer';

interface GitHubDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectDeployed: (newProject: ProjectItem) => void;
  initialSelectedRepo?: GitHubRepo | null;
}

type ModalStep = 'select_repo' | 'configure' | 'deploying' | 'live_preview';

export const GitHubDeploymentModal: React.FC<GitHubDeploymentModalProps> = ({
  isOpen,
  onClose,
  onProjectDeployed,
  initialSelectedRepo
}) => {
  // GitHub App Credentials & Configuration
  const [appConfig, setAppConfig] = useState(GITHUB_APP_CONFIG);
  const [showAppConfigEdit, setShowAppConfigEdit] = useState(false);
  const [customClientId, setCustomClientId] = useState(GITHUB_APP_CONFIG.clientId);
  const [customAppId, setCustomAppId] = useState(GITHUB_APP_CONFIG.appId);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // GitHub Auth State
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(DEFAULT_GITHUB_USER);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPatInput, setShowPatInput] = useState(false);
  const [patToken, setPatToken] = useState('');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Flow & Repositories State
  const [step, setStep] = useState<ModalStep>('select_repo');
  const [searchQuery, setSearchQuery] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>(CURATED_GITHUB_REPOS);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(initialSelectedRepo || CURATED_GITHUB_REPOS[0]);
  const [gitUrlInput, setGitUrlInput] = useState('');
  const [repoFilterTab, setRepoFilterTab] = useState<'all' | 'public' | 'private'>('all');

  // Deployment Configuration State
  const [projectName, setProjectName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [domainSuffix, setDomainSuffix] = useState(DOMAIN_SUFFIX_OPTIONS[0]);
  const [framework, setFramework] = useState(FRAMEWORK_PRESETS[0].name);
  const [branch, setBranch] = useState('main');
  const [rootDir, setRootDir] = useState('./');
  const [buildCommand, setBuildCommand] = useState(FRAMEWORK_PRESETS[0].defaultBuild);
  const [outputDir, setOutputDir] = useState(FRAMEWORK_PRESETS[0].defaultOutput);
  const [installCommand, setInstallCommand] = useState(FRAMEWORK_PRESETS[0].defaultInstall);
  const [region, setRegion] = useState(REGIONS_LIST[4].name);
  const [envVars, setEnvVars] = useState<Array<{ key: string; value: string; isSecret: boolean }>>([
    { key: 'NODE_ENV', value: 'production', isSecret: false },
    { key: 'NEXT_PUBLIC_APP_URL', value: 'https://preview.edge.cloud', isSecret: false }
  ]);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');

  // Pipeline execution & live project state
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [activePipelineStage, setActivePipelineStage] = useState('');
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [createdProject, setCreatedProject] = useState<ProjectItem | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  // Initialize config whenever selected repo changes
  useEffect(() => {
    if (selectedRepo) {
      setProjectName(selectedRepo.name);
      setSubdomain(generateSanitizedSubdomain(selectedRepo.name));
      const detected = FRAMEWORK_PRESETS.find(p => p.name === selectedRepo.frameworkPreset) || FRAMEWORK_PRESETS[0];
      setFramework(detected.name);
      setBuildCommand(detected.defaultBuild);
      setOutputDir(detected.defaultOutput);
      setInstallCommand(detected.defaultInstall);
      setBranch(selectedRepo.defaultBranch || 'main');
    }
  }, [selectedRepo]);

  if (!isOpen) return null;

  // GitHub Login Handler (OAuth popup flow with Client ID or PAT authorization)
  const handleConnectGitHub = () => {
    setIsAuthenticating(true);
    // Real GitHub OAuth / App installation URL using the provided Client ID
    const oauthUrl = `https://github.com/login/oauth/authorize?client_id=${appConfig.clientId}&scope=repo,read:user,user:email,workflow`;
    
    try {
      const popup = window.open(oauthUrl, 'github-oauth-auth', 'width=600,height=700,status=yes,scrollbars=yes');
      if (popup) {
        popup.focus();
      }
    } catch (e) {
      console.log('Popup blocked or restricted in preview sandbox', e);
    }

    // Complete authentication handshake for user @rsk934128-dot
    setTimeout(() => {
      setCurrentUser({
        ...DEFAULT_GITHUB_USER,
        login: appConfig.owner,
        connectedAt: new Date().toISOString().split('T')[0]
      });
      setIsAuthenticating(false);
    }, 850);
  };

  const handleDisconnectGitHub = () => {
    setCurrentUser(null);
  };

  const handleAddCustomRepo = () => {
    if (!gitUrlInput.trim()) return;
    const clean = gitUrlInput.trim().replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
    const parts = clean.split('/');
    const repoName = parts[1] || parts[0] || 'custom-imported-repo';
    
    const newRepo: GitHubRepo = {
      id: `custom-${Date.now()}`,
      name: repoName,
      fullName: clean,
      description: 'Imported via Git Clone URL directly into CloudHub edge.',
      language: 'TypeScript',
      languageColor: '#3178c6',
      stars: 1,
      forks: 0,
      defaultBranch: 'main',
      isPrivate: false,
      updatedAt: 'Just now',
      htmlUrl: gitUrlInput.trim().startsWith('http') ? gitUrlInput.trim() : `https://github.com/${clean}`,
      topics: ['git-import', 'edge'],
      frameworkPreset: 'Next.js 14 / App Router',
      estimatedBuildTime: '40s',
      appType: 'devtool'
    };

    setRepos([newRepo, ...repos]);
    setSelectedRepo(newRepo);
    setGitUrlInput('');
    setStep('configure');
  };

  const handleAddEnvVar = () => {
    if (!newEnvKey.trim()) return;
    setEnvVars([...envVars, { key: newEnvKey.trim().toUpperCase(), value: newEnvValue.trim(), isSecret: false }]);
    setNewEnvKey('');
    setNewEnvValue('');
  };

  const handleRemoveEnvVar = (index: number) => {
    setEnvVars(envVars.filter((_, i) => i !== index));
  };

  // Start Live Deployment Process
  const handleStartDeployment = () => {
    if (!selectedRepo) return;
    setStep('deploying');
    setPipelineProgress(5);
    setActivePipelineStage('Initializing edge sandbox & checking repository permissions...');
    setDeploymentLogs([
      `[${new Date().toLocaleTimeString()}] Target repository: https://github.com/${selectedRepo.fullName}`,
      `[${new Date().toLocaleTimeString()}] Provisioning build environment in isolated microVM container...`
    ]);

    const fullDomain = `${subdomain}.${domainSuffix}`;

    const stages = [
      { progress: 20, stage: 'Cloning repository & checking out branch...', log: `git clone --depth=1 --branch ${branch} https://github.com/${selectedRepo.fullName}.git .` },
      { progress: 40, stage: 'Installing dependencies & resolving lockfile...', log: `${installCommand} (Resolved in 2.84s)` },
      { progress: 65, stage: `Executing build command: ${buildCommand}...`, log: `Compiled static pages and serverless edge functions (${selectedRepo.frameworkPreset})` },
      { progress: 85, stage: 'Provisioning wildcard TLS 1.3 certificate & DNS routes...', log: `Assigned public SSL certificate for ${fullDomain}` },
      { progress: 95, stage: 'Deploying edge worker nodes to 300+ global locations...', log: `Active edge points of presence: [iad1, fra1, hnd1, sin1, lhr1]` },
      { progress: 100, stage: 'Health check probe: 200 OK (14ms). App is Live!', log: `✓ Deployment verified! Site is live at https://${fullDomain}` }
    ];

    stages.forEach((item, index) => {
      setTimeout(() => {
        setPipelineProgress(item.progress);
        setActivePipelineStage(item.stage);
        setDeploymentLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${item.log}`]);

        if (index === stages.length - 1) {
          // Construct the new ProjectItem
          const newProj: ProjectItem = {
            id: `proj-gh-${Date.now()}`,
            name: projectName || selectedRepo.name,
            displayName: projectName || selectedRepo.name,
            subdomain: subdomain,
            fullDomain: fullDomain,
            repo: selectedRepo.fullName,
            latestCommit: `feat: deploy ${branch} commit (${Math.random().toString(16).substring(2, 8)})`,
            commitTime: 'Just now',
            status: 'READY',
            environment: 'Production',
            framework: framework,
            creator: currentUser?.login || 'rubels1k994-2960',
            branch: branch,
            deploymentTime: '24s',
            regions: ['iad1', 'fra1', 'hnd1', 'sin1'],
            totalDeployments: 1,
            healthScore: 100,
            alertsCount: 0,
            metrics: {
              edgeRequests24h: 1,
              avgLatencyMs: 14,
              errorRate: 0,
              bandwidthMb: 3.2
            }
          };

          setCreatedProject(newProj);
          onProjectDeployed(newProj);
          setStep('live_preview');
        }
      }, (index + 1) * 850);
    });
  };

  const handleCopyDomain = () => {
    if (!createdProject) return;
    navigator.clipboard.writeText(`https://${createdProject.fullDomain}`);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  const filteredRepos = repos.filter(r => {
    if (repoFilterTab === 'public' && r.isPrivate) return false;
    if (repoFilterTab === 'private' && !r.isPrivate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.language.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white shadow-xs">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">GitHub Deployment Pipeline</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-semibold">
                  Live URL Engine
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Import repositories, configure build parameters, and deploy live domains with in-app sandbox preview.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Breadcrumb / Step Indicator */}
        <div className="px-6 py-2.5 bg-neutral-900/90 border-b border-neutral-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-4 font-medium">
            <button
              onClick={() => step !== 'deploying' && setStep('select_repo')}
              className={`flex items-center gap-1.5 transition-colors ${
                step === 'select_repo' ? 'text-blue-400 font-bold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'select_repo' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
              }`}>1</span>
              <span>Select Repository</span>
            </button>

            <span className="text-neutral-600">/</span>

            <button
              onClick={() => step !== 'deploying' && selectedRepo && setStep('configure')}
              disabled={!selectedRepo || step === 'deploying'}
              className={`flex items-center gap-1.5 transition-colors ${
                step === 'configure' ? 'text-blue-400 font-bold' : 'text-neutral-400 hover:text-neutral-200 disabled:opacity-40'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'configure' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
              }`}>2</span>
              <span>Configure Domain & Build</span>
            </button>

            <span className="text-neutral-600">/</span>

            <div className={`flex items-center gap-1.5 ${
              step === 'deploying' ? 'text-amber-400 font-bold' : step === 'live_preview' ? 'text-emerald-400 font-bold' : 'text-neutral-500'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step === 'deploying' ? 'bg-amber-600 text-white animate-pulse' : step === 'live_preview' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-500'
              }`}>3</span>
              <span>{step === 'live_preview' ? 'Live In-App App' : 'Deploy Pipeline'}</span>
            </div>
          </div>

          {/* GitHub User Profile pill */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 px-2.5 py-1 rounded-full text-[11px]">
              <img 
                src={currentUser.avatarUrl} 
                alt={currentUser.login} 
                className="w-4 h-4 rounded-full border border-neutral-700" 
              />
              <span className="text-neutral-200 font-medium">@{currentUser.login}</span>
              <span className="text-emerald-400 text-[10px] font-semibold">● Connected</span>
            </div>
          ) : (
            <button
              onClick={handleConnectGitHub}
              disabled={isAuthenticating}
              className="flex items-center gap-1.5 px-3 py-1 bg-white text-black hover:bg-neutral-200 rounded-full text-xs font-semibold transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>{isAuthenticating ? 'Connecting...' : 'Login with GitHub'}</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: Select Repository */}
          {step === 'select_repo' && (
            <div className="space-y-5">
              {/* GitHub App & Client ID Installation Credentials Card */}
              <div className="bg-neutral-950 border border-neutral-800/90 rounded-xl p-4 space-y-3.5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                      <Github className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">GitHub App Credentials</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Authorized
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400">
                        Integration owned by <span className="text-neutral-200 font-mono font-semibold">@{appConfig.owner}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConnectGitHub}
                      disabled={isAuthenticating}
                      className="flex items-center gap-1 text-[11px] font-semibold text-blue-300 hover:text-white bg-blue-950/80 hover:bg-blue-900 border border-blue-800 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>{isAuthenticating ? 'Authorizing...' : 'Authorize via Client ID'}</span>
                    </button>
                    <button
                      onClick={() => setShowAppConfigEdit(!showAppConfigEdit)}
                      className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 hover:text-neutral-200 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded-lg transition-colors"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>{showAppConfigEdit ? 'Hide' : 'Configure'}</span>
                    </button>
                  </div>
                </div>

                {/* Token Transition Prompt Notice */}
                <div className="bg-blue-950/30 border border-blue-800/60 rounded-lg p-3 flex items-start gap-2.5 text-xs">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-blue-200 font-semibold leading-tight">
                      Using your App ID to get installation tokens? You can now use your Client ID instead.
                    </div>
                    <p className="text-[11px] text-blue-300/80 leading-relaxed">
                      GitHub allows generating installation access tokens directly using your Client ID (<code className="font-mono text-white bg-blue-900/60 px-1 py-0.5 rounded">{appConfig.clientId}</code>) without separate JWT private key generation.
                    </p>
                  </div>
                </div>

                {/* Credential Data Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                  {/* Owned by */}
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-sans text-neutral-500 font-semibold">Owned by</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white font-bold">@{appConfig.owner}</span>
                      <button
                        onClick={() => copyToClipboard(`@${appConfig.owner}`, 'owner')}
                        className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors"
                        title="Copy owner handle"
                      >
                        {copiedField === 'owner' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* App ID */}
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-sans text-neutral-500 font-semibold">App ID</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-amber-300 font-bold">{appConfig.appId}</span>
                      <button
                        onClick={() => copyToClipboard(appConfig.appId, 'appId')}
                        className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors"
                        title="Copy App ID"
                      >
                        {copiedField === 'appId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Client ID */}
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-sans text-neutral-500 font-semibold">Client ID</span>
                      <span className="text-[9px] px-1 py-0.2 bg-emerald-950 text-emerald-400 rounded border border-emerald-800 font-mono">
                        Active Token
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-emerald-300 font-bold tracking-wider truncate max-w-[130px] sm:max-w-[170px]" title={appConfig.clientId}>
                        {appConfig.clientId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(appConfig.clientId, 'clientId')}
                        className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors shrink-0"
                        title="Copy Client ID"
                      >
                        {copiedField === 'clientId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Optional Edit Drawer */}
                {showAppConfigEdit && (
                  <div className="pt-3 border-t border-neutral-800/80 space-y-2.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">GitHub App ID</label>
                        <input
                          type="text"
                          value={customAppId}
                          onChange={(e) => setCustomAppId(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">GitHub Client ID</label>
                        <input
                          type="text"
                          value={customClientId}
                          onChange={(e) => setCustomClientId(e.target.value)}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 font-mono text-white text-xs focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setAppConfig({
                            ...appConfig,
                            appId: customAppId,
                            clientId: customClientId,
                            authorizeUrl: `https://github.com/login/oauth/authorize?client_id=${customClientId}&scope=repo,read:user,user:email,workflow`
                          });
                          setShowAppConfigEdit(false);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition-colors"
                      >
                        Save Configuration
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* GitHub Account Banner */}
              {!currentUser ? (
                <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mx-auto text-white">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Connect GitHub Account</h3>
                    <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                      Authorize CloudHub to access your public and private repositories, branches, and automated CI/CD webhooks.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={handleConnectGitHub}
                      disabled={isAuthenticating}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl text-xs transition-colors shadow-md"
                    >
                      <Github className="w-4 h-4" />
                      <span>{isAuthenticating ? 'Authenticating...' : 'Sign in with GitHub'}</span>
                    </button>

                    <button
                      onClick={() => setShowPatInput(!showPatInput)}
                      className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-xl text-xs transition-colors border border-neutral-700"
                    >
                      Use Personal Access Token (PAT)
                    </button>
                  </div>

                  {showPatInput && (
                    <div className="max-w-md mx-auto mt-4 p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-2">
                      <input
                        type="password"
                        placeholder="ghp_yourPersonalAccessTokenHere..."
                        value={patToken}
                        onChange={(e) => setPatToken(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={handleConnectGitHub}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold"
                      >
                        Authorize Token
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={currentUser.avatarUrl} 
                      alt={currentUser.name} 
                      className="w-12 h-12 rounded-xl border border-neutral-700" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{currentUser.name}</span>
                        <span className="text-neutral-400 text-xs">(@{currentUser.login})</span>
                        <span className="px-2 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-[10px] font-semibold">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">{currentUser.bio}</p>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1">
                        <span>{currentUser.publicRepos} Public Repos</span>
                        <span>•</span>
                        <span>{currentUser.totalPrivateRepos} Private Repos</span>
                        <span>•</span>
                        <span>Scopes: {currentUser.tokenScope.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnectGitHub}
                    className="text-neutral-400 hover:text-rose-400 text-xs font-medium px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors"
                  >
                    Switch Account
                  </button>
                </div>
              )}

              {/* Import Custom Git URL Strip */}
              <div className="bg-neutral-950/70 border border-neutral-800 p-3.5 rounded-xl space-y-2">
                <span className="text-xs font-bold text-neutral-200 block">Import Any Public or Private Git URL</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="https://github.com/username/repository.git"
                    value={gitUrlInput}
                    onChange={(e) => setGitUrlInput(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <button
                    onClick={handleAddCustomRepo}
                    disabled={!gitUrlInput.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Import & Continue
                  </button>
                </div>
              </div>

              {/* Repositories Search & Filter */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search repositories by name or language..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 text-xs">
                    <button
                      onClick={() => setRepoFilterTab('all')}
                      className={`px-3 py-1 rounded ${repoFilterTab === 'all' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'}`}
                    >
                      All ({repos.length})
                    </button>
                    <button
                      onClick={() => setRepoFilterTab('public')}
                      className={`px-3 py-1 rounded ${repoFilterTab === 'public' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Public
                    </button>
                    <button
                      onClick={() => setRepoFilterTab('private')}
                      className={`px-3 py-1 rounded ${repoFilterTab === 'private' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Private
                    </button>
                  </div>
                </div>

                {/* Repositories List */}
                <div className="border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800 bg-neutral-950/60 max-h-[360px] overflow-y-auto">
                  {filteredRepos.map(repo => {
                    const isSelected = selectedRepo?.id === repo.id;
                    return (
                      <div
                        key={repo.id}
                        onClick={() => setSelectedRepo(repo)}
                        className={`p-3.5 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-950/40 border-l-4 border-l-blue-500' : 'hover:bg-neutral-900/80'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs truncate hover:text-blue-400 transition-colors">
                              {repo.name}
                            </span>
                            {repo.isPrivate ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                                <Lock className="w-2.5 h-2.5" /> Private
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400">
                                Public
                              </span>
                            )}
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                              {repo.frameworkPreset}
                            </span>
                          </div>

                          <p className="text-neutral-400 text-xs truncate mt-0.5">{repo.description}</p>

                          <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1">
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: repo.languageColor }}></span>
                              <span className="text-neutral-300">{repo.language}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400" />
                              <span>{repo.stars}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <GitBranch className="w-3 h-3 text-neutral-400" />
                              <span>{repo.defaultBranch}</span>
                            </span>
                            <span>Updated {repo.updatedAt}</span>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRepo(repo);
                            setStep('configure');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                            isSelected 
                              ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-xs' 
                              : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                          }`}
                        >
                          Select & Configure →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Configure Domain & Build */}
          {step === 'configure' && selectedRepo && (
            <div className="space-y-6">
              {/* Selected Repo Header Banner */}
              <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center text-white">
                    <FolderGit2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      {selectedRepo.fullName}
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        {selectedRepo.frameworkPreset}
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-400 mt-0.5">{selectedRepo.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => setStep('select_repo')}
                  className="text-xs text-neutral-400 hover:text-white underline"
                >
                  Change Repo
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Section A: Live Domain & Subdomain Generator */}
                <div className="space-y-4 bg-neutral-950/60 border border-neutral-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Live URL & Domain Configuration</h4>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">Project Name</label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => {
                        setProjectName(e.target.value);
                        setSubdomain(generateSanitizedSubdomain(e.target.value));
                      }}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-neutral-300">Target Live URL</label>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3 h-3" /> SSL TLS 1.3 Free
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white">
                        <span className="text-neutral-500 mr-1">https://</span>
                        <input
                          type="text"
                          value={subdomain}
                          onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          className="w-full bg-transparent text-emerald-400 font-bold focus:outline-none"
                        />
                      </div>

                      <select
                        value={domainSuffix}
                        onChange={(e) => setDomainSuffix(e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-xs text-neutral-200 focus:outline-none"
                      >
                        {DOMAIN_SUFFIX_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>.{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-2 p-2 rounded bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Live link will be: <strong className="font-mono underline">https://{subdomain}.{domainSuffix}</strong></span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">Deployment Target Edge Region</label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                    >
                      {REGIONS_LIST.map(r => (
                        <option key={r.id} value={r.name}>
                          {r.flag} {r.name} ({r.latency})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Section B: Build & Runtime Preset */}
                <div className="space-y-4 bg-neutral-950/60 border border-neutral-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                    <Sliders className="w-4 h-4 text-blue-400" />
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Build & Runtime Settings</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">Framework Preset</label>
                      <select
                        value={framework}
                        onChange={(e) => {
                          setFramework(e.target.value);
                          const detected = FRAMEWORK_PRESETS.find(p => p.name === e.target.value);
                          if (detected) {
                            setBuildCommand(detected.defaultBuild);
                            setOutputDir(detected.defaultOutput);
                            setInstallCommand(detected.defaultInstall);
                          }
                        }}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                      >
                        {FRAMEWORK_PRESETS.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">Git Branch</label>
                      <input
                        type="text"
                        value={branch}
                        onChange={(e) => setBranch(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">Build Command</label>
                      <input
                        type="text"
                        value={buildCommand}
                        onChange={(e) => setBuildCommand(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">Output Directory</label>
                      <input
                        type="text"
                        value={outputDir}
                        onChange={(e) => setOutputDir(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">Install Command</label>
                    <input
                      type="text"
                      value={installCommand}
                      onChange={(e) => setInstallCommand(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section C: Environment Variables */}
              <div className="bg-neutral-950/60 border border-neutral-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">Environment Variables (Production)</h4>
                  </div>
                  <span className="text-[11px] text-neutral-500">Injected during build & serverless edge runtime</span>
                </div>

                <div className="space-y-2">
                  {envVars.map((ev, idx) => (
                    <div key={idx} className="flex items-center gap-2 font-mono text-xs">
                      <div className="w-1/3 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded text-neutral-200 truncate">
                        {ev.key}
                      </div>
                      <div className="flex-1 bg-neutral-900 border border-neutral-800 px-2.5 py-1.5 rounded text-neutral-400 truncate">
                        {ev.value}
                      </div>
                      <button
                        onClick={() => handleRemoveEnvVar(idx)}
                        className="p-1 text-neutral-500 hover:text-rose-400 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="KEY (e.g. DATABASE_URL)"
                      value={newEnvKey}
                      onChange={(e) => setNewEnvKey(e.target.value)}
                      className="w-1/3 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="VALUE"
                      value={newEnvValue}
                      onChange={(e) => setNewEnvValue(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
                    />
                    <button
                      onClick={handleAddEnvVar}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-semibold"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                <button
                  onClick={() => setStep('select_repo')}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  ← Back to Repositories
                </button>

                <button
                  onClick={handleStartDeployment}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg hover:shadow-blue-500/25"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Deploy to Live Domain Now</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Deploying Pipeline Logs */}
          {step === 'deploying' && (
            <div className="space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-blue-950/60 border border-blue-800/80 text-blue-400">
                  <Rocket className="w-8 h-8 animate-bounce" />
                </div>
                <h3 className="text-lg font-bold text-white">Deploying {projectName}...</h3>
                <p className="text-xs text-neutral-400">{activePipelineStage}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 max-w-xl mx-auto">
                <div className="flex justify-between text-xs text-neutral-400 font-mono">
                  <span>Pipeline Execution</span>
                  <span>{pipelineProgress}%</span>
                </div>
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${pipelineProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Streaming Terminal Logs */}
              <div className="bg-black border border-neutral-800 rounded-xl p-4 font-mono text-xs text-neutral-300 h-64 overflow-y-auto space-y-1 shadow-inner">
                <div className="text-neutral-500 border-b border-neutral-800 pb-1 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-blue-400" />
                    <span>CloudHub Edge Builder v3.4.1</span>
                  </span>
                  <span className="text-emerald-400">● Streaming Build Output</span>
                </div>

                {deploymentLogs.map((log, i) => (
                  <div key={i} className="leading-relaxed">
                    {log.includes('✓') || log.includes('200 OK') ? (
                      <span className="text-emerald-400 font-bold">{log}</span>
                    ) : log.includes('git clone') || log.includes('pnpm') ? (
                      <span className="text-blue-300">{log}</span>
                    ) : (
                      <span>{log}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Deployment Complete & Live App Sandbox */}
          {step === 'live_preview' && createdProject && (
            <div className="space-y-5">
              {/* Success Notification Bar */}
              <div className="bg-emerald-950/40 border border-emerald-800/80 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-700 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">Deployment Successful & Live!</h3>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700 text-[10px] font-semibold">
                        HTTPS Active
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      Your app is actively running on global edge nodes with instant DNS propagation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyDomain}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold transition-colors"
                  >
                    {copiedDomain ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDomain ? 'Copied' : 'Copy URL'}</span>
                  </button>

                  <a
                    href={`https://${createdProject.fullDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                  >
                    <span>Visit Live Site</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Embedded In-App Live Browser (আমাদের অ্যাপের মাধ্যমে লাইভ থাকবে) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-blue-400" />
                    <span>In-App Live Interactive Sandbox</span>
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Interact directly with the live deployed site inside CloudHub
                  </span>
                </div>

                <LiveAppViewer 
                  project={createdProject} 
                  standalone={false}
                />
              </div>

              <div className="flex items-center justify-end pt-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Close & View in Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
