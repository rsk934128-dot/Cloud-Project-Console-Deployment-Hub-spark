import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import { EnvVariableItem, TargetEnvironment, VariableType, SecretAuditLog } from '../types/envVars';
import { INITIAL_ENV_VARIABLES, INITIAL_AUDIT_LOGS } from '../data/envVarsData';
import { 
  Variable, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  ShieldCheck, 
  Key, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ChevronDown,
  Layers,
  FileText,
  Sliders,
  Sparkles,
  Info
} from 'lucide-react';

interface EnvVarsConsoleProps {
  projects: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
}

export const EnvVarsConsole: React.FC<EnvVarsConsoleProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'variables' | 'audit' | 'encryption'>('variables');
  const [activeEnvFilter, setActiveEnvFilter] = useState<'All' | TargetEnvironment>('All');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | VariableType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [variables, setVariables] = useState<EnvVariableItem[]>(INITIAL_ENV_VARIABLES);
  const [auditLogs, setAuditLogs] = useState<SecretAuditLog[]>(INITIAL_AUDIT_LOGS);

  // Set of revealed secret IDs
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formKey, setFormKey] = useState<string>('');
  const [formValue, setFormValue] = useState<string>('');
  const [formIsSecret, setFormIsSecret] = useState<boolean>(true);
  const [formEnvironments, setFormEnvironments] = useState<TargetEnvironment[]>(['Production', 'Preview', 'Development']);
  const [formComment, setFormComment] = useState<string>('');

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importTargetEnvs, setImportTargetEnvs] = useState<TargetEnvironment[]>(['Production', 'Preview']);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard.`);
  };

  // Toggle reveal
  const handleToggleReveal = (id: string, keyName: string) => {
    const isNowRevealed = !revealedIds[id];
    setRevealedIds((prev) => ({ ...prev, [id]: isNowRevealed }));

    if (isNowRevealed) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      const newAudit: SecretAuditLog = {
        id: `aud-${Date.now()}`,
        variableKey: keyName,
        action: 'revealed',
        user: 'rasadsk007@gmail.com',
        timestamp: timeStr,
        ip: '198.51.100.22',
        environment: activeEnvFilter === 'All' ? 'Production' : activeEnvFilter
      };

      setAuditLogs((prev) => [newAudit, ...prev]);
    }
  };

  // Delete variable
  const handleDelete = (id: string, keyName: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));
    showToast(`Removed environment variable: ${keyName}`);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newAudit: SecretAuditLog = {
      id: `aud-${Date.now()}`,
      variableKey: keyName,
      action: 'deleted',
      user: 'rasadsk007@gmail.com',
      timestamp: timeStr,
      ip: '198.51.100.22',
      environment: 'Production'
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  // Open modal for add
  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormKey('');
    setFormValue('');
    setFormIsSecret(true);
    setFormEnvironments(['Production', 'Preview', 'Development']);
    setFormComment('');
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEditModal = (v: EnvVariableItem) => {
    setEditingId(v.id);
    setFormKey(v.key);
    setFormValue(v.value);
    setFormIsSecret(v.isSecret);
    setFormEnvironments(v.environments);
    setFormComment(v.comment || '');
    setIsModalOpen(true);
  };

  // Save add/edit
  const handleSaveVariable = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = formKey.trim().toUpperCase().replace(/\s+/g, '_');
    if (!cleanKey) return;

    if (editingId) {
      setVariables((prev) =>
        prev.map((v) =>
          v.id === editingId
            ? {
                ...v,
                key: cleanKey,
                value: formValue,
                isSecret: formIsSecret,
                environments: formEnvironments,
                type: formIsSecret ? 'secret' : 'plain',
                updatedAt: 'Just now',
                comment: formComment
              }
            : v
        )
      );
      showToast(`Updated variable: ${cleanKey}`);
    } else {
      const newVar: EnvVariableItem = {
        id: `env-${Date.now()}`,
        key: cleanKey,
        value: formValue,
        isSecret: formIsSecret,
        environments: formEnvironments.length > 0 ? formEnvironments : ['Production'],
        type: formIsSecret ? 'secret' : 'plain',
        updatedAt: 'Just now',
        updatedBy: 'rasadsk007@gmail.com',
        projectId: selectedProjectId,
        projectName: selectedProjectId === 'all' ? 'Global' : 'Project Specific',
        comment: formComment
      };
      setVariables((prev) => [newVar, ...prev]);
      showToast(`Added environment variable: ${cleanKey}`);

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const newAudit: SecretAuditLog = {
        id: `aud-${Date.now()}`,
        variableKey: cleanKey,
        action: 'created',
        user: 'rasadsk007@gmail.com',
        timestamp: timeStr,
        ip: '198.51.100.22',
        environment: formEnvironments[0] || 'Production'
      };
      setAuditLogs((prev) => [newAudit, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Toggle an environment in form
  const toggleFormEnvironment = (env: TargetEnvironment) => {
    if (formEnvironments.includes(env)) {
      if (formEnvironments.length > 1) {
        setFormEnvironments(formEnvironments.filter((e) => e !== env));
      }
    } else {
      setFormEnvironments([...formEnvironments, env]);
    }
  };

  // Import raw .env format
  const handleImportEnv = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const lines = importText.split('\n');
    const newItems: EnvVariableItem[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        let key = trimmed.slice(0, eqIndex).trim().toUpperCase();
        let val = trimmed.slice(eqIndex + 1).trim();

        // Strip quotes if wrapped
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }

        const isSecret = !key.startsWith('NEXT_PUBLIC_') && !key.startsWith('VITE_');

        newItems.push({
          id: `env-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          key,
          value: val,
          isSecret,
          environments: importTargetEnvs,
          type: isSecret ? 'secret' : 'plain',
          updatedAt: 'Just now',
          updatedBy: 'rasadsk007@gmail.com',
          projectId: selectedProjectId,
          projectName: 'Imported .env',
          comment: 'Imported via .env parser'
        });
      }
    });

    if (newItems.length > 0) {
      setVariables((prev) => [...newItems, ...prev]);
      showToast(`Imported ${newItems.length} environment variables.`);
      setIsImportModalOpen(false);
      setImportText('');
    } else {
      showToast('No valid KEY=VALUE pairs found in text.');
    }
  };

  // Export as .env file
  const handleExportEnv = () => {
    const lines = filteredVariables.map((v) => {
      return `# ${v.comment || v.key} (${v.environments.join(', ')})\n${v.key}="${v.value}"`;
    });
    const text = lines.join('\n\n');
    handleCopy(text, '.env formatted variables');
  };

  // Filtered variables
  const filteredVariables = useMemo(() => {
    return variables.filter((v) => {
      const matchesEnv = activeEnvFilter === 'All' || v.environments.includes(activeEnvFilter);
      const matchesType = activeTypeFilter === 'all' || v.type === activeTypeFilter;
      const matchesSearch =
        v.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.comment && v.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (revealedIds[v.id] && v.value.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesEnv && matchesType && matchesSearch;
    });
  }, [variables, activeEnvFilter, activeTypeFilter, searchQuery, revealedIds]);

  return (
    <div id="env-vars-console-root" className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white border border-neutral-700 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Global Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Variable className="w-5 h-5 text-indigo-400" />
            Environment Variables & Secrets Store
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Encrypted configuration values injected at build and edge runtime. Encrypted at rest via AES-256-GCM.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Import .env */}
          <button
            id="env-vars-import-btn"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-neutral-400" />
            <span>Import .env</span>
          </button>

          {/* Export .env */}
          <button
            id="env-vars-export-btn"
            onClick={handleExportEnv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export .env</span>
          </button>

          {/* Project Selector */}
          <div className="relative">
            <select
              id="env-vars-project-filter"
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

          {/* Add Variable Button */}
          <button
            id="btn-add-env-variable"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variable</span>
          </button>
        </div>
      </div>

      {/* Hero Security & Configuration KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Configured Variables</span>
            <Variable className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{variables.length}</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            {variables.filter((v) => v.environments.includes('Production')).length} in Production
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Encrypted Secrets</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {variables.filter((v) => v.isSecret).length}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Masked by default</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>KMS Key Status</span>
            <Key className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">AES-256</div>
          <div className="text-[11px] text-cyan-400 font-mono">
            Hardware HSM Active
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Secret Access Audits</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{auditLogs.length}</div>
          <div className="text-[11px] text-neutral-400 font-mono">
            Full compliance tracing
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-neutral-800 pb-px text-xs font-semibold">
        <button
          id="tab-env-variables"
          onClick={() => setActiveTab('variables')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'variables'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Variable className="w-4 h-4" />
          Environment Variables ({variables.length})
        </button>

        <button
          id="tab-env-audit"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Access Audit Trail ({auditLogs.length})
        </button>

        <button
          id="tab-env-encryption"
          onClick={() => setActiveTab('encryption')}
          className={`px-4 py-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'encryption'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Encryption & Security Architecture
        </button>
      </div>

      {/* TAB 1: VARIABLES LIST */}
      {activeTab === 'variables' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-xl">
            {/* Environment Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['All', 'Production', 'Preview', 'Development'] as const).map((env) => (
                <button
                  key={env}
                  onClick={() => setActiveEnvFilter(env)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    activeEnvFilter === env
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
                  }`}
                >
                  {env}
                </button>
              ))}

              <div className="h-4 w-px bg-neutral-800 mx-1 hidden sm:block"></div>

              {/* Type Filter */}
              <select
                value={activeTypeFilter}
                onChange={(e) => setActiveTypeFilter(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="secret">Secrets Only</option>
                <option value="plain">Plaintext Only</option>
                <option value="system">System Injected</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by key, comment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
              />
            </div>
          </div>

          {/* Variables Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider bg-neutral-950/40">
                  <th className="py-3 pl-4">Variable Key</th>
                  <th className="py-3">Value</th>
                  <th className="py-3">Environments</th>
                  <th className="py-3">Updated</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {filteredVariables.map((v) => {
                  const isRevealed = revealedIds[v.id];

                  return (
                    <tr key={v.id} className="hover:bg-neutral-800/40 transition-colors group">
                      {/* Key */}
                      <td className="py-3.5 pl-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(v.key, v.key)}
                            className="font-bold text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                            title="Click to copy key"
                          >
                            <span>{v.key}</span>
                            <Copy className="w-3 h-3 text-neutral-600 group-hover:text-neutral-400" />
                          </button>

                          {v.isSecret && (
                            <span className="p-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800" title="Encrypted Secret">
                              <Lock className="w-2.5 h-2.5" />
                            </span>
                          )}

                          {v.type === 'system' && (
                            <span className="text-[9px] font-sans font-semibold uppercase px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                              System
                            </span>
                          )}
                        </div>

                        {v.comment && (
                          <div className="font-sans text-[11px] text-neutral-500 mt-0.5">
                            {v.comment}
                          </div>
                        )}
                      </td>

                      {/* Value with Mask / Unmask */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2 max-w-[320px]">
                          <div className="truncate text-neutral-300 font-mono bg-neutral-950/60 px-2 py-1 rounded border border-neutral-800/80 w-full flex items-center justify-between">
                            <span className="truncate">
                              {v.isSecret && !isRevealed
                                ? '••••••••••••••••••••••••••••••••'
                                : v.value}
                            </span>

                            {v.isSecret && (
                              <button
                                onClick={() => handleToggleReveal(v.id, v.key)}
                                className="ml-2 text-neutral-400 hover:text-white shrink-0"
                                title={isRevealed ? 'Hide secret' : 'Reveal secret'}
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>

                          <button
                            onClick={() => handleCopy(v.value, `${v.key} value`)}
                            className="p-1 text-neutral-500 hover:text-white shrink-0 transition-colors"
                            title="Copy Value"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Environments */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap font-sans">
                          {v.environments.map((env) => (
                            <span
                              key={env}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                env === 'Production'
                                  ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                                  : env === 'Preview'
                                  ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                              }`}
                            >
                              {env}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Updated */}
                      <td className="py-3.5 text-neutral-400 font-sans text-[11px]">
                        <div>{v.updatedAt}</div>
                        <div className="text-[10px] text-neutral-500 truncate max-w-[140px]">{v.updatedBy}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {v.type !== 'system' && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(v)}
                                className="p-1 text-neutral-400 hover:text-white transition-colors"
                                title="Edit Variable"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(v.id, v.key)}
                                className="p-1 text-neutral-400 hover:text-rose-400 transition-colors"
                                title="Delete Variable"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Secret Access & Decryption Audit Trail
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Cryptographically signed audit log recording every secret decryption, export, creation, or modification.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead>
                <tr className="border-b border-neutral-800 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  <th className="pb-3 pl-3">Timestamp</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Variable Key</th>
                  <th className="pb-3">User Identity</th>
                  <th className="pb-3">IP Address</th>
                  <th className="pb-3 pr-3 text-right">Target Env</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="py-3 pl-3 text-neutral-400">{log.timestamp}</td>
                    <td className="py-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.action === 'revealed'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : log.action === 'created'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : log.action === 'deleted'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-white">{log.variableKey}</td>
                    <td className="py-3 text-neutral-300 font-sans">{log.user}</td>
                    <td className="py-3 text-neutral-400">{log.ip}</td>
                    <td className="py-3 pr-3 text-right font-sans">
                      <span className="text-neutral-400">{log.environment}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ENCRYPTION ARCHITECTURE */}
      {activeTab === 'encryption' && (
        <div className="space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Cryptographic Key Management & Storage Architecture
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              How environment variables and sensitive credentials are encrypted, partitioned, and injected into deployments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Key className="w-4 h-4 text-cyan-400" />
                Envelope Encryption (AES-256-GCM)
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Every secret value is encrypted using a unique, dedicated Data Encryption Key (DEK). The DEK is subsequently encrypted under a root Key Encryption Key (KEK) protected inside dedicated Cloud Hardware Security Modules (FIPS 140-2 Level 3).
              </p>
              <div className="pt-2 border-t border-neutral-800 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero unencrypted secrets stored on disk</span>
              </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-xs">
                <Layers className="w-4 h-4 text-purple-400" />
                Environment Scoping & Branch Isolation
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Variables assigned strictly to <span className="text-white font-semibold">Production</span> can never be accessed or leaked by pull request preview branches or local development runs. Production secrets are quarantined exclusively to verified build pipelines and production runtime containers.
              </p>
              <div className="pt-2 border-t border-neutral-800 text-[11px] font-mono text-purple-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Runtime role-based access control enabled</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT VARIABLE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Variable className="w-4 h-4 text-indigo-400" />
                {editingId ? 'Edit Environment Variable' : 'Add Environment Variable'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveVariable} className="space-y-4 text-xs">
              {/* Key */}
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Variable Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STRIPE_API_KEY"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>

              {/* Value */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-300 font-semibold">Value</label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-400">
                    <input
                      type="checkbox"
                      checked={formIsSecret}
                      onChange={(e) => setFormIsSecret(e.target.checked)}
                      className="rounded bg-neutral-950 border-neutral-700 text-indigo-600 focus:ring-0"
                    />
                    <span>Masked Secret</span>
                  </label>
                </div>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter variable or secret payload..."
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Environments */}
              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold block">Target Environments</label>
                <div className="flex items-center gap-2">
                  {(['Production', 'Preview', 'Development'] as const).map((env) => {
                    const isSelected = formEnvironments.includes(env);

                    return (
                      <button
                        type="button"
                        key={env}
                        onClick={() => toggleFormEnvironment(env)}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-950/70 border-indigo-500 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-white'
                        }`}
                      >
                        {env}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description / Comment */}
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Comment / Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Master Stripe billing API private secret"
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                >
                  {editingId ? 'Update Variable' : 'Save Variable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT .ENV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Import .env File
              </h3>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleImportEnv} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-neutral-300 font-semibold">Paste .env Content</label>
                <textarea
                  rows={8}
                  required
                  placeholder={`DATABASE_URL="postgres://..."\nNEXT_PUBLIC_API_URL="https://..."\nSTRIPE_SECRET="whsec_..."`}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-indigo-300 font-mono focus:outline-none focus:border-cyan-500 text-[11px]"
                />
                <p className="text-[10px] text-neutral-500">Supports standard KEY="value" and KEY=value lines with # comments.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-semibold block">Target Environments for Imported Variables</label>
                <div className="flex items-center gap-2">
                  {(['Production', 'Preview', 'Development'] as const).map((env) => {
                    const isSelected = importTargetEnvs.includes(env);

                    return (
                      <button
                        type="button"
                        key={env}
                        onClick={() => {
                          if (isSelected) {
                            if (importTargetEnvs.length > 1) {
                              setImportTargetEnvs(importTargetEnvs.filter((e) => e !== env));
                            }
                          } else {
                            setImportTargetEnvs([...importTargetEnvs, env]);
                          }
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-semibold transition-all ${
                          isSelected
                            ? 'bg-cyan-950/70 border-cyan-500 text-white'
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-white'
                        }`}
                      >
                        {env}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold"
                >
                  Parse & Import Variables
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
