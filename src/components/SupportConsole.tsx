import React, { useState, useMemo } from 'react';
import { ProjectItem } from '../types';
import {
  SupportTicket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  SystemComponentStatus,
  SystemIncident,
  KnowledgeArticle,
  DiagnosticCheckItem,
  TicketMessage
} from '../types/support';
import {
  INITIAL_TICKETS,
  SYSTEM_COMPONENTS,
  RECENT_INCIDENTS,
  KNOWLEDGE_BASE_ARTICLES,
  DEFAULT_DIAGNOSTIC_CHECKS
} from '../data/supportData';
import {
  LifeBuoy,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  Plus,
  Search,
  Filter,
  Shield,
  Server,
  Globe,
  Cpu,
  RefreshCw,
  Terminal,
  ExternalLink,
  ArrowRight,
  ChevronRight,
  Phone,
  Mail,
  FileText,
  Download,
  Check,
  Copy,
  AlertTriangle,
  X,
  Play,
  Activity,
  Users,
  User,
  ArrowUpRight,
  Sliders,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

interface SupportConsoleProps {
  projects?: ProjectItem[];
  onSelectProject?: (p: ProjectItem) => void;
}

export const SupportConsole: React.FC<SupportConsoleProps> = ({ projects = [], onSelectProject }) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'status' | 'diagnostics' | 'kb' | 'plan'>('tickets');
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [systemComponents] = useState<SystemComponentStatus[]>(SYSTEM_COMPONENTS);
  const [incidents] = useState<SystemIncident[]>(RECENT_INCIDENTS);
  const [articles] = useState<KnowledgeArticle[]>(KNOWLEDGE_BASE_ARTICLES);

  // Filters for Tickets
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TicketPriority>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TicketCategory>('all');

  // Selected Ticket Drawer Modal
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyIncludeDiagnostics, setReplyIncludeDiagnostics] = useState(false);

  // New Ticket Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: '',
    description: '',
    priority: 'p3_normal' as TicketPriority,
    category: 'deployments_builds' as TicketCategory,
    projectId: projects[0]?.id || 'proj_ecommerce_storefront',
    projectName: projects[0]?.name || 'ecommerce-storefront-v2',
    environment: 'production' as 'production' | 'staging' | 'preview',
    attachDiagnostics: true
  });

  // Selected Knowledge Article Modal
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [articleSearch, setArticleSearch] = useState('');
  const [articleFeedbackGiven, setArticleFeedbackGiven] = useState<{ [id: string]: boolean }>({});

  // Interactive Live Diagnostic State
  const [diagProject, setDiagProject] = useState<string>(projects[0]?.name || 'ecommerce-storefront-v2');
  const [diagChecks, setDiagChecks] = useState<DiagnosticCheckItem[]>(DEFAULT_DIAGNOSTIC_CHECKS);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagProgress, setDiagProgress] = useState(0);
  const [diagCompleted, setDiagCompleted] = useState(false);

  // Copy helpers
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Run live diagnostics simulation
  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true);
    setDiagCompleted(false);
    setDiagProgress(0);

    // Reset all checks to pending
    setDiagChecks(prev => prev.map(c => ({ ...c, status: 'pending', durationMs: undefined })));

    let currentIndex = 0;
    const interval = setInterval(() => {
      setDiagChecks(prev => {
        const next = [...prev];
        if (currentIndex < next.length) {
          const latencies = [6, 12, 18, 24, 32, 45];
          const hasWarning = currentIndex === 2; // e.g. cache check gives mild advisory
          next[currentIndex] = {
            ...next[currentIndex],
            status: hasWarning ? 'warning' : 'passed',
            durationMs: latencies[currentIndex] || 15,
            details: hasWarning
              ? 'Edge cache hit-ratio 78.4% (advisory: add stale-while-revalidate for static assets)'
              : 'Sub-system verified healthy with zero packet loss'
          };
        }
        return next;
      });

      currentIndex++;
      setDiagProgress(Math.round((currentIndex / DEFAULT_DIAGNOSTIC_CHECKS.length) * 100));

      if (currentIndex >= DEFAULT_DIAGNOSTIC_CHECKS.length) {
        clearInterval(interval);
        setIsRunningDiagnostics(false);
        setDiagCompleted(true);
      }
    }, 600);
  };

  // Submit reply to a ticket
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedTicket) return;

    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      authorName: 'rasadsk007@gmail.com',
      authorRole: 'Team Admin',
      timestamp: 'Just now',
      content: replyContent.trim(),
      attachments: replyIncludeDiagnostics
        ? [{ name: 'diagnostic-telemetry-snapshot.json', size: '24.1 KB', type: 'application/json' }]
        : undefined
    };

    const updatedTicket: SupportTicket = {
      ...selectedTicket,
      updatedAt: 'Just now',
      status: selectedTicket.status === 'resolved' || selectedTicket.status === 'closed' ? 'in_progress' : selectedTicket.status,
      messages: [...selectedTicket.messages, newMsg]
    };

    setTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setReplyContent('');
    setReplyIncludeDiagnostics(false);
  };

  // Change ticket status
  const handleUpdateTicketStatus = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id !== ticketId) return t;
        const updated = {
          ...t,
          status: newStatus,
          updatedAt: 'Just now'
        };
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket(updated);
        }
        return updated;
      })
    );
  };

  // Create new ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketForm.subject.trim() || !newTicketForm.description.trim()) return;

    const newId = `TICK-${Math.floor(10000 + Math.random() * 90000)}`;
    const newTicket: SupportTicket = {
      id: newId,
      subject: newTicketForm.subject.trim(),
      description: newTicketForm.description.trim(),
      status: 'open',
      priority: newTicketForm.priority,
      category: newTicketForm.category,
      projectId: newTicketForm.projectId,
      projectName: newTicketForm.projectName,
      environment: newTicketForm.environment,
      createdAt: 'Just now',
      updatedAt: 'Just now',
      slaDueIn: newTicketForm.priority === 'p1_critical' ? '15m (P1 SLA Guarantee)' : '2h (P2 SLA)',
      diagnosticsAttached: newTicketForm.attachDiagnostics,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'user',
          authorName: 'rasadsk007@gmail.com',
          authorRole: 'Team Admin',
          timestamp: 'Just now',
          content: newTicketForm.description.trim(),
          attachments: newTicketForm.attachDiagnostics
            ? [{ name: 'pre-flight-diagnostics.json', size: '18.4 KB', type: 'application/json' }]
            : undefined
        }
      ]
    };

    setTickets(prev => [newTicket, ...prev]);
    setIsCreateModalOpen(false);
    setSelectedTicket(newTicket);
    setNewTicketForm({
      subject: '',
      description: '',
      priority: 'p3_normal',
      category: 'deployments_builds',
      projectId: projects[0]?.id || 'proj_ecommerce_storefront',
      projectName: projects[0]?.name || 'ecommerce-storefront-v2',
      environment: 'production',
      attachDiagnostics: true
    });
  };

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch =
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.projectName && ticket.projectName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // Article search
  const filteredArticles = useMemo(() => {
    if (!articleSearch.trim()) return articles;
    return articles.filter(a =>
      a.title.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.summary.toLowerCase().includes(articleSearch.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(articleSearch.toLowerCase()))
    );
  }, [articles, articleSearch]);

  const openTicketsCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-white tracking-tight">Support Console & Incident Command</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Enterprise Priority SLA
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Direct 24/7 access to Cloudmesh Staff Systems Engineers, sub-15-minute P1 critical escalation, and automated pre-flight diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setActiveTab('diagnostics');
              handleRunDiagnostics();
            }}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Play className="w-3.5 h-3.5 text-purple-400" />
            Run Diagnostics
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-neutral-950 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Support Ticket
          </button>
        </div>
      </div>

      {/* SLA & Operations Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Active Tickets</span>
            <LifeBuoy className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {openTicketsCount}{' '}
            <span className="text-xs font-normal text-neutral-400">({tickets.length} total)</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">All cases within SLA</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Response SLA Guarantee</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">8.4 mins</div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Target: &lt;15m for P1 Critical (99.98% met)
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Cloud Infrastructure</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight font-mono">99.994%</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            7 of 7 systems operational
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Dedicated Lead TAM</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xs font-bold text-white tracking-tight truncate">Sarah Jenkins</div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1.5 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span>Slack Connect: #cloudmesh-enterprise</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'tickets'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          Support Tickets
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {filteredTickets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'status'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          System Status & Incidents
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
            100% Operational
          </span>
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'diagnostics'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Automated Diagnostics
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('kb')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'kb'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Knowledge Base & Runbooks
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {articles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('plan')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'plan'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          SLA & Escalation
        </button>
      </div>

      {/* TAB 1: SUPPORT TICKETS LIST */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tickets by ID, subject, or project name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-lg p-1 text-xs">
                <span className="text-neutral-500 px-1 text-[11px]">Status:</span>
                {(['all', 'open', 'in_progress', 'waiting_on_customer', 'resolved'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors capitalize ${
                      statusFilter === s ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              {/* Priority Select */}
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="p1_critical">P1 - Critical</option>
                <option value="p2_high">P2 - High</option>
                <option value="p3_normal">P3 - Normal</option>
                <option value="p4_low">P4 - Low</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            {filteredTickets.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-xs text-neutral-500">
                No support tickets found matching current criteria. Click "New Support Ticket" to submit a case.
              </div>
            ) : (
              filteredTickets.map((ticket) => {
                const isP1 = ticket.priority === 'p1_critical';
                const isP2 = ticket.priority === 'p2_high';
                const isP3 = ticket.priority === 'p3_normal';

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all rounded-xl p-4 cursor-pointer group shadow-xs"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      {/* Left: Metadata & Subject */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                            {ticket.id}
                          </span>

                          {/* Priority Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isP1
                                ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                : isP2
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : isP3
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            }`}
                          >
                            {ticket.priority.replace('_', ' ')}
                          </span>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${
                              ticket.status === 'in_progress'
                                ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                                : ticket.status === 'open'
                                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                : ticket.status === 'waiting_on_customer'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                            }`}
                          >
                            {ticket.status.replace(/_/g, ' ')}
                          </span>

                          {/* Project Tag */}
                          {ticket.projectName && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-neutral-950 text-neutral-400 border border-neutral-800">
                              {ticket.projectName}
                            </span>
                          )}

                          {ticket.diagnosticsAttached && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                              <Terminal className="w-2.5 h-2.5" />
                              Diagnostics Attached
                            </span>
                          )}
                        </div>

                        <h3 className="text-xs font-semibold text-neutral-100 group-hover:text-white transition-colors">
                          {ticket.subject}
                        </h3>

                        <p className="text-xs text-neutral-400 line-clamp-1">
                          {ticket.description}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-neutral-500 pt-1">
                          <span>Created {ticket.createdAt}</span>
                          <span>•</span>
                          <span>Updated {ticket.updatedAt}</span>
                          {ticket.slaDueIn && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {ticket.slaDueIn}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Assigned Engineer & Message count */}
                      <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-neutral-800 pt-2 md:pt-0 md:pl-4 shrink-0">
                        {ticket.assignedEngineer ? (
                          <div className="flex items-center gap-2 text-right">
                            <div className="hidden sm:block">
                              <div className="text-xs font-medium text-white">{ticket.assignedEngineer.name}</div>
                              <div className="text-[10px] text-neutral-400">{ticket.assignedEngineer.role}</div>
                            </div>
                            <div className={`w-7 h-7 rounded-full ${ticket.assignedEngineer.avatarBg} text-white text-xs font-bold flex items-center justify-center`}>
                              {ticket.assignedEngineer.name.charAt(0)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-[11px] text-neutral-500">Unassigned (Triaging)</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs text-neutral-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span className="font-mono">{ticket.messages.length}</span>
                        </div>

                        <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM STATUS & INCIDENTS */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          {/* Main Operational Banner */}
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-white">All Cloud Systems Operational</h3>
                <p className="text-xs text-emerald-300/80 mt-0.5">
                  Global edge traffic and compute clusters are running at nominal latency. Zero active major outages.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
              <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
              <span>Checked: 10s ago</span>
            </div>
          </div>

          {/* Infrastructure Sub-Systems Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-950/40 flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Cloudmesh Infrastructure Components (SLA Monitored)</span>
              <span className="text-neutral-400 font-mono text-[11px]">Target: 99.99% Global Uptime</span>
            </div>

            <div className="divide-y divide-neutral-800">
              {systemComponents.map((comp) => (
                <div key={comp.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-neutral-850 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{comp.name}</span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Operational
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400">{comp.region}</p>
                  </div>

                  <div className="flex items-center gap-6 text-xs font-mono">
                    <div>
                      <div className="text-neutral-500 text-[10px] uppercase">Latency</div>
                      <div className="text-white font-bold">{comp.latencyMs} ms</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[10px] uppercase">30d Uptime</div>
                      <div className="text-emerald-400 font-bold">{comp.uptimePercent}%</div>
                    </div>
                    <div>
                      <div className="text-neutral-500 text-[10px] uppercase">30d Incidents</div>
                      <div className="text-neutral-300">{comp.incidentCount30d}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Log & Maintenance Timeline */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-xs font-semibold text-white">Recent Incidents & Post-Mortem Updates</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">Historical incident timeline for the past 30 days.</p>
              </div>
              <span className="text-xs text-neutral-400 font-mono">All incidents resolved</span>
            </div>

            <div className="space-y-4">
              {incidents.map((inc) => (
                <div key={inc.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{inc.title}</span>
                      <span className="px-2 py-0.2 rounded text-[10px] uppercase font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {inc.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">{inc.startTime}</span>
                  </div>

                  <div className="space-y-2 border-l-2 border-neutral-800 pl-3 ml-1">
                    {inc.updates.map((update, idx) => (
                      <div key={idx} className="text-xs space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neutral-300 text-[11px]">{update.status}</span>
                          <span className="text-neutral-500 text-[10px] font-mono">({update.timestamp})</span>
                        </div>
                        <p className="text-neutral-400 text-[11px]">{update.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATED LIVE DIAGNOSTICS */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" />
                  Pre-Flight Health & Network Diagnostics
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Simulate comprehensive edge and container inspections to identify SSL, DNS, memory leak, or VPC connectivity issues before filing a ticket.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={diagProject}
                  onChange={(e) => setDiagProject(e.target.value)}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  <option value="ecommerce-storefront-v2">ecommerce-storefront-v2 (Production)</option>
                  <option value="admin-portal-internal">admin-portal-internal (Production)</option>
                  <option value="saas-analytics-core">saas-analytics-core (Production)</option>
                  <option value="payment-gateway-service">payment-gateway-service (Production)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>

                <button
                  onClick={handleRunDiagnostics}
                  disabled={isRunningDiagnostics}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isRunningDiagnostics ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Inspecting ({diagProgress}%)
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Execute Diagnostic Suite
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Bar during execution */}
            {isRunningDiagnostics && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-neutral-400 font-mono">
                  <span>Probing Anycast endpoints and VPC ingress sockets...</span>
                  <span>{diagProgress}%</span>
                </div>
                <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${diagProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Results Grid */}
            <div className="space-y-3">
              {diagChecks.map((check) => (
                <div
                  key={check.id}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {check.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : check.status === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : check.status === 'running' ? (
                        <RefreshCw className="w-4 h-4 text-purple-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-700 shrink-0" />
                      )}
                      <span className="font-semibold text-white">{check.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-800">
                        {check.category}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[11px] pl-6">{check.details}</p>
                  </div>

                  <div className="flex items-center gap-3 pl-6 sm:pl-0 font-mono text-[11px]">
                    {check.durationMs && (
                      <span className="text-neutral-400">{check.durationMs}ms</span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] ${
                        check.status === 'passed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : check.status === 'warning'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-neutral-900 text-neutral-500'
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {diagCompleted && (
              <div className="pt-3 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Diagnostic report generated successfully. 5 passed, 1 advisory warning.</span>
                </div>

                <button
                  onClick={() => {
                    setNewTicketForm({
                      ...newTicketForm,
                      subject: `Diagnostic Report findings for ${diagProject}`,
                      description: `Automated diagnostic probe ran for ${diagProject}.\nResults: 5 Passed, 1 Advisory Warning (Edge cache hit ratio).\nAttached complete telemetry trace logs for engineering review.`,
                      projectName: diagProject,
                      attachDiagnostics: true
                    });
                    setIsCreateModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  Attach to New Support Ticket
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: KNOWLEDGE BASE & RUNBOOKS */}
      {activeTab === 'kb' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search troubleshooting runbooks, code snippets, or error messages..."
                value={articleSearch}
                onChange={(e) => setArticleSearch(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
              />
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              {filteredArticles.length} guides available
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all rounded-xl p-4 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-medium">
                      {article.category}
                    </span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {article.tags.map(t => (
                      <span key={t} className="text-neutral-400 font-mono text-[10px]">#{t}</span>
                    ))}
                  </div>
                  <span className="text-neutral-400 group-hover:text-white flex items-center gap-1">
                    Read Runbook <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SLA & ESCALATION CONTACTS */}
      {activeTab === 'plan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Plan Overview Card */}
            <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Enterprise 24/7 Priority SLA Agreement
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Account PIN: <strong className="font-mono text-white">EPIN-9942-88</strong> (quote this when paging our on-call rotation)
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>

              {/* SLA Tiers Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                    <tr>
                      <th className="px-3 py-2">Severity Tier</th>
                      <th className="px-3 py-2">Response Time Target</th>
                      <th className="px-3 py-2">Coverage</th>
                      <th className="px-3 py-2">Escalation Path</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    <tr className="bg-red-500/5">
                      <td className="px-3 py-2.5 font-bold text-red-400">P1 - Critical Outage</td>
                      <td className="px-3 py-2.5 font-bold text-white">&lt; 15 Minutes</td>
                      <td className="px-3 py-2.5 text-neutral-300">24/7 / 365 Days</td>
                      <td className="px-3 py-2.5 text-neutral-400">Immediate Staff SRE Page + VP of Eng</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-amber-400">P2 - High Priority</td>
                      <td className="px-3 py-2.5 font-bold text-white">&lt; 2 Hours</td>
                      <td className="px-3 py-2.5 text-neutral-300">24/7 / 365 Days</td>
                      <td className="px-3 py-2.5 text-neutral-400">Senior Systems Specialist</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-blue-400">P3 - Normal Query</td>
                      <td className="px-3 py-2.5 font-bold text-white">&lt; 8 Hours</td>
                      <td className="px-3 py-2.5 text-neutral-300">Business Hours</td>
                      <td className="px-3 py-2.5 text-neutral-400">Solutions Engineering Team</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2.5 font-bold text-neutral-400">P4 - Low / Quota Increase</td>
                      <td className="px-3 py-2.5 text-white">&lt; 24 Hours</td>
                      <td className="px-3 py-2.5 text-neutral-300">Business Hours</td>
                      <td className="px-3 py-2.5 text-neutral-400">Operations & Billing Helpdesk</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Direct Escalation Contacts */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-white">Emergency Contacts</h3>

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Enterprise Hotline</span>
                    <button
                      onClick={() => handleCopy('+1-888-256-8367', 'phone')}
                      className="text-emerald-400 text-[11px] flex items-center gap-1 hover:underline"
                    >
                      {copiedKey === 'phone' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono text-sm font-bold text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    +1 (888) 256-8367
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Slack Connect Channel</span>
                    <span className="text-[10px] text-emerald-400">Real-time</span>
                  </div>
                  <div className="font-mono text-xs font-bold text-white flex items-center gap-2 truncate">
                    #cloudmesh-enterprise-acme
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1.5">
                  <div className="text-xs text-neutral-400">Dedicated Technical Account Manager</div>
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                      SJ
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Sarah Jenkins</div>
                      <div className="text-[10px] text-neutral-400">s.jenkins@cloudmesh.io</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full py-2 bg-white hover:bg-neutral-200 text-neutral-900 rounded-lg text-xs font-semibold transition-colors text-center"
                >
                  Create Escalation Ticket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: TICKET DETAIL & REPLY THREAD */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-start justify-between gap-4 bg-neutral-950/60">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-400">{selectedTicket.id}</span>
                  
                  {/* Status selector */}
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value as TicketStatus)}
                    className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-[11px] rounded px-2 py-0.5 capitalize focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_on_customer">Waiting on Customer</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>

                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                    {selectedTicket.priority.replace('_', ' ')}
                  </span>

                  {selectedTicket.projectName && (
                    <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-800">
                      {selectedTicket.projectName}
                    </span>
                  )}
                </div>

                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {selectedTicket.subject}
                </h2>

                <div className="text-[11px] text-neutral-400 flex items-center gap-3">
                  <span>Created {selectedTicket.createdAt}</span>
                  {selectedTicket.assignedEngineer && (
                    <>
                      <span>•</span>
                      <span>Assigned to <strong className="text-neutral-200">{selectedTicket.assignedEngineer.name}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Conversation Thread Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-neutral-900/50">
              {selectedTicket.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                const isSystem = msg.sender === 'system';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 px-1">
                      <span className="font-semibold text-neutral-300">{msg.authorName}</span>
                      {msg.authorRole && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-400 font-mono">
                          {msg.authorRole}
                        </span>
                      )}
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`p-4 rounded-xl text-xs max-w-2xl leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : isSystem
                          ? 'bg-neutral-950 border border-purple-800/40 text-neutral-300 font-mono'
                          : 'bg-neutral-850 border border-neutral-700/60 text-neutral-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>

                      {/* Attachments */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block">
                            Attachments ({msg.attachments.length})
                          </span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {msg.attachments.map((att, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/20 border border-white/10 text-[11px] font-mono"
                              >
                                <Download className="w-3 h-3 opacity-75" />
                                <span>{att.name}</span>
                                <span className="opacity-60">({att.size})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-neutral-800 bg-neutral-950 space-y-3">
              {/* Quick suggestion tags */}
              <div className="flex items-center gap-2 overflow-x-auto text-[10px] text-neutral-400">
                <span className="shrink-0">Quick suggestions:</span>
                <button
                  type="button"
                  onClick={() => setReplyContent('We have updated the environment variables and triggered a fresh build. The issue is resolving.')}
                  className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:text-white transition-colors truncate"
                >
                  "Updated environment variables..."
                </button>
                <button
                  type="button"
                  onClick={() => setReplyContent('Attached latest edge trace IDs and p99 latency logs.')}
                  className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 hover:text-white transition-colors truncate"
                >
                  "Attached edge traces..."
                </button>
              </div>

              <textarea
                rows={3}
                placeholder="Type your reply to the engineering team..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 resize-none font-sans"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeDiag"
                    checked={replyIncludeDiagnostics}
                    onChange={(e) => setReplyIncludeDiagnostics(e.target.checked)}
                    className="rounded bg-neutral-900 border-neutral-700 text-blue-500"
                  />
                  <label htmlFor="includeDiag" className="text-xs text-neutral-400 cursor-pointer">
                    Attach latest diagnostic telemetry snapshot
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateTicketStatus(selectedTicket.id, 'resolved')}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-emerald-400 transition-colors"
                  >
                    Mark Resolved
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="px-4 py-1.5 bg-white disabled:opacity-50 text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Reply
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT NEW SUPPORT TICKET */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-semibold text-white">Create New Support Case</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 502 Bad Gateway on custom domain /api/checkout endpoint"
                  value={newTicketForm.subject}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Severity Priority
                  </label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value as TicketPriority })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="p1_critical">P1 - Critical Outage (15m SLA)</option>
                    <option value="p2_high">P2 - High Priority (2h SLA)</option>
                    <option value="p3_normal">P3 - Normal (8h SLA)</option>
                    <option value="p4_low">P4 - Low / Quota Request</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value as TicketCategory })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="deployments_builds">Deployments & Builds</option>
                    <option value="networking_dns">Networking & DNS / Edge</option>
                    <option value="storage_databases">Storage & Databases</option>
                    <option value="security_waf">Security & WAF / TLS</option>
                    <option value="billing_quotas">Billing & Quota Increase</option>
                    <option value="general">General Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Affected Project
                  </label>
                  <select
                    value={newTicketForm.projectName}
                    onChange={(e) => {
                      const selected = projects.find(p => p.name === e.target.value);
                      setNewTicketForm({
                        ...newTicketForm,
                        projectName: e.target.value,
                        projectId: selected?.id || newTicketForm.projectId
                      });
                    }}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="ecommerce-storefront-v2">ecommerce-storefront-v2</option>
                    <option value="admin-portal-internal">admin-portal-internal</option>
                    <option value="saas-analytics-core">saas-analytics-core</option>
                    <option value="payment-gateway-service">payment-gateway-service</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Environment
                  </label>
                  <select
                    value={newTicketForm.environment}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, environment: e.target.value as any })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="preview">Preview</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  placeholder="Include reproduction steps, request trace IDs (x-cloudmesh-trace-id), HTTP status codes, and error messages..."
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, description: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-neutral-600 resize-none font-sans"
                  required
                />
              </div>

              <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="attachDiagModal"
                    checked={newTicketForm.attachDiagnostics}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, attachDiagnostics: e.target.checked })}
                    className="rounded bg-neutral-950 border-neutral-700 text-blue-500"
                  />
                  <label htmlFor="attachDiagModal" className="text-xs text-neutral-300">
                    Include pre-flight system diagnostics bundle
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors shadow-sm"
                  >
                    Submit Ticket
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KNOWLEDGE ARTICLE VIEWER */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-neutral-800 flex items-start justify-between gap-4 bg-neutral-950/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-medium">
                    {selectedArticle.category}
                  </span>
                  <span className="text-[11px] text-neutral-400">{selectedArticle.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-white">{selectedArticle.title}</h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-neutral-400 hover:text-white text-lg p-1 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs leading-relaxed text-neutral-300">
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 font-medium">
                {selectedArticle.summary}
              </div>

              <div className="space-y-3 whitespace-pre-wrap font-sans text-neutral-200">
                {selectedArticle.content}
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Was this runbook helpful?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setArticleFeedbackGiven({ ...articleFeedbackGiven, [selectedArticle.id]: true })}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    articleFeedbackGiven[selectedArticle.id]
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                  }`}
                >
                  {articleFeedbackGiven[selectedArticle.id] ? '✓ Thank you!' : 'Yes, helpful'}
                </button>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
