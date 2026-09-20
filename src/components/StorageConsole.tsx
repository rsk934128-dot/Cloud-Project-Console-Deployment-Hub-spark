import React, { useState } from 'react';
import {
  HardDrive,
  Database,
  Layers,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Copy,
  Check,
  Play,
  Clock,
  Globe,
  Lock,
  Unlock,
  Upload,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  Code2,
  Table as TableIcon
} from 'lucide-react';
import {
  StorageProductType,
  KvNamespace,
  KvEntry,
  BlobBucket,
  BlobObject,
  SqlDatabase,
  SqlQueryResult,
  VectorIndex
} from '../types/storage';
import {
  INITIAL_KV_NAMESPACES,
  INITIAL_KV_ENTRIES,
  INITIAL_BLOB_BUCKETS,
  INITIAL_BLOB_OBJECTS,
  INITIAL_SQL_DATABASES,
  INITIAL_VECTOR_INDEXES
} from '../data/storageData';

interface StorageConsoleProps {
  onNotify?: (msg: string) => void;
}

export const StorageConsole: React.FC<StorageConsoleProps> = () => {
  const [activeTab, setActiveTab] = useState<StorageProductType>('kv');

  // KV State
  const [kvNamespaces, setKvNamespaces] = useState<KvNamespace[]>(INITIAL_KV_NAMESPACES);
  const [selectedNamespaceId, setSelectedNamespaceId] = useState<string>(INITIAL_KV_NAMESPACES[0].id);
  const [kvEntries, setKvEntries] = useState<KvEntry[]>(INITIAL_KV_ENTRIES);
  const [kvSearchQuery, setKvSearchQuery] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<KvEntry | null>(INITIAL_KV_ENTRIES[0]);
  const [editingValue, setEditingValue] = useState(INITIAL_KV_ENTRIES[0]?.value || '');
  const [isNewKvModalOpen, setIsNewKvModalOpen] = useState(false);
  const [newKeyForm, setNewKeyForm] = useState({ key: '', value: '{\n  "status": "active"\n}', ttl: '86400' });

  // Blob State
  const [buckets, setBuckets] = useState<BlobBucket[]>(INITIAL_BLOB_BUCKETS);
  const [selectedBucketId, setSelectedBucketId] = useState<string>(INITIAL_BLOB_BUCKETS[0].id);
  const [objects, setObjects] = useState<BlobObject[]>(INITIAL_BLOB_OBJECTS);
  const [blobSearchQuery, setBlobSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newBlobForm, setNewBlobForm] = useState({ key: '', contentType: 'image/png', sizeKb: '124' });
  const [isNewBucketModalOpen, setIsNewBucketModalOpen] = useState(false);
  const [newBucketForm, setNewBucketForm] = useState({ name: '', region: 'us-east-1 (Global CDN)', publicAccess: true });

  // SQL State
  const [databases] = useState<SqlDatabase[]>(INITIAL_SQL_DATABASES);
  const [selectedDbId, setSelectedDbId] = useState<string>(INITIAL_SQL_DATABASES[0].id);
  const [showConnString, setShowConnString] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT id, name, status, region, updated_at FROM deployments ORDER BY updated_at DESC LIMIT 5;');
  const [isExecutingSql, setIsExecutingSql] = useState(false);
  const [sqlResult, setSqlResult] = useState<SqlQueryResult | null>({
    columns: ['id', 'name', 'status', 'region', 'updated_at'],
    rows: [
      { id: 'dep_01jk9a', name: 'main-api-service', status: 'healthy', region: 'us-east-1', updated_at: '2026-09-20 10:48:12' },
      { id: 'dep_02lk8b', name: 'edge-auth-proxy', status: 'healthy', region: 'global-anycast', updated_at: '2026-09-20 10:42:00' },
      { id: 'dep_03mk7c', name: 'billing-webhook-worker', status: 'degraded', region: 'eu-west-1', updated_at: '2026-09-20 09:30:15' },
      { id: 'dep_04nk6d', name: 'vector-indexing-daemon', status: 'healthy', region: 'us-west-2', updated_at: '2026-09-20 08:15:32' },
      { id: 'dep_05ok5e', name: 'cdn-invalidation-hook', status: 'healthy', region: 'global-anycast', updated_at: '2026-09-20 07:11:04' },
    ],
    executionTimeMs: 3.8,
    rowsAffected: 5
  });

  // Vector State
  const [vectorIndexes, setVectorIndexes] = useState<VectorIndex[]>(INITIAL_VECTOR_INDEXES);
  const [vectorSearchQuery, setVectorSearchQuery] = useState('How to configure custom TLS certificates with automated Let’s Encrypt renewal?');
  const [isSearchingVector, setIsSearchingVector] = useState(false);
  const [vectorResults, setVectorResults] = useState<{ id: string; score: number; text: string; source: string }[] | null>(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Current selections
  const currentNamespace = kvNamespaces.find(n => n.id === selectedNamespaceId) || kvNamespaces[0];
  const currentBucket = buckets.find(b => b.id === selectedBucketId) || buckets[0];
  const currentDb = databases.find(d => d.id === selectedDbId) || databases[0];

  // Filtered lists
  const filteredKvEntries = kvEntries
    .filter(e => e.namespaceId === selectedNamespaceId)
    .filter(e => e.key.toLowerCase().includes(kvSearchQuery.toLowerCase()));

  const filteredBlobObjects = objects
    .filter(o => o.bucketId === selectedBucketId)
    .filter(o => o.key.toLowerCase().includes(blobSearchQuery.toLowerCase()));

  // Handlers
  const handleSelectEntry = (entry: KvEntry) => {
    setSelectedEntry(entry);
    setEditingValue(entry.value);
  };

  const handleSaveEntry = () => {
    if (!selectedEntry) return;
    setKvEntries(prev =>
      prev.map(e => (e.key === selectedEntry.key && e.namespaceId === selectedEntry.namespaceId)
        ? { ...e, value: editingValue, sizeBytes: editingValue.length, lastModified: 'Just now' }
        : e
      )
    );
    setSelectedEntry(prev => prev ? { ...prev, value: editingValue, sizeBytes: editingValue.length, lastModified: 'Just now' } : null);
  };

  const handleDeleteEntry = (keyToDelete: string) => {
    setKvEntries(prev => prev.filter(e => !(e.key === keyToDelete && e.namespaceId === selectedNamespaceId)));
    if (selectedEntry?.key === keyToDelete) {
      const remaining = kvEntries.filter(e => e.namespaceId === selectedNamespaceId && e.key !== keyToDelete);
      setSelectedEntry(remaining[0] || null);
      setEditingValue(remaining[0]?.value || '');
    }
    // Update count in namespace
    setKvNamespaces(prev => prev.map(n => n.id === selectedNamespaceId ? { ...n, keysCount: Math.max(0, n.keysCount - 1) } : n));
  };

  const handleCreateNewKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyForm.key.trim()) return;

    const newEntry: KvEntry = {
      key: newKeyForm.key.trim(),
      value: newKeyForm.value,
      namespaceId: selectedNamespaceId,
      ttlSeconds: newKeyForm.ttl ? parseInt(newKeyForm.ttl) : undefined,
      expiresAt: newKeyForm.ttl ? `${Math.round(parseInt(newKeyForm.ttl) / 3600)}h` : undefined,
      sizeBytes: newKeyForm.value.length,
      lastModified: 'Just now'
    };

    setKvEntries(prev => [newEntry, ...prev.filter(e => !(e.key === newEntry.key && e.namespaceId === selectedNamespaceId))]);
    setSelectedEntry(newEntry);
    setEditingValue(newEntry.value);
    setIsNewKvModalOpen(false);
    setNewKeyForm({ key: '', value: '{\n  "status": "active"\n}', ttl: '86400' });
    setKvNamespaces(prev => prev.map(n => n.id === selectedNamespaceId ? { ...n, keysCount: n.keysCount + 1 } : n));
  };

  const handleDeleteBlob = (objId: string) => {
    setObjects(prev => prev.filter(o => o.id !== objId));
    setBuckets(prev => prev.map(b => b.id === selectedBucketId ? { ...b, objectsCount: Math.max(0, b.objectsCount - 1) } : b));
  };

  const handleUploadBlob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlobForm.key.trim()) return;
    const newObj: BlobObject = {
      id: `obj-${Date.now().toString(36)}`,
      bucketId: selectedBucketId,
      key: newBlobForm.key.trim(),
      contentType: newBlobForm.contentType,
      sizeBytes: parseInt(newBlobForm.sizeKb || '100') * 1024,
      lastModified: 'Just now',
      etag: `"${Math.random().toString(36).substring(2, 10)}"`,
      storageClass: 'Standard'
    };
    setObjects(prev => [newObj, ...prev]);
    setIsUploadModalOpen(false);
    setNewBlobForm({ key: '', contentType: 'image/png', sizeKb: '124' });
    setBuckets(prev => prev.map(b => b.id === selectedBucketId ? { ...b, objectsCount: b.objectsCount + 1 } : b));
  };

  const handleCreateBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketForm.name.trim()) return;
    const id = `bkt-${Date.now().toString(36)}`;
    const newB: BlobBucket = {
      id,
      name: newBucketForm.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      region: newBucketForm.region,
      objectsCount: 0,
      sizeGb: 0,
      publicAccess: newBucketForm.publicAccess,
      corsEnabled: true,
      endpointUrl: `https://${newBucketForm.name.toLowerCase()}.s3.cloudmesh-storage.com`,
      createdDate: 'Just now'
    };
    setBuckets(prev => [...prev, newB]);
    setSelectedBucketId(id);
    setIsNewBucketModalOpen(false);
    setNewBucketForm({ name: '', region: 'us-east-1 (Global CDN)', publicAccess: true });
  };

  const handleExecuteSql = () => {
    setIsExecutingSql(true);
    setTimeout(() => {
      setIsExecutingSql(false);
      const queryTrim = sqlQuery.trim().toLowerCase();
      if (queryTrim.includes('count')) {
        setSqlResult({
          columns: ['count', 'status'],
          rows: [
            { count: 18, status: 'healthy' },
            { count: 2, status: 'degraded' },
            { count: 0, status: 'failed' }
          ],
          executionTimeMs: 2.1,
          rowsAffected: 3
        });
      } else if (queryTrim.includes('users') || queryTrim.includes('user')) {
        setSqlResult({
          columns: ['id', 'email', 'tier', 'created_at', 'last_active'],
          rows: [
            { id: 'usr_84102', email: 'dev.lead@enterprise.com', tier: 'Enterprise Plan', created_at: '2026-01-14', last_active: '4m ago' },
            { id: 'usr_84103', email: 'sre-oncall@ops-shield.io', tier: 'Scale Pro', created_at: '2026-03-22', last_active: '12m ago' },
            { id: 'usr_84104', email: 'alexandra@acme-cloud.net', tier: 'Pro Tier', created_at: '2026-05-01', last_active: '1h ago' }
          ],
          executionTimeMs: 4.6,
          rowsAffected: 3
        });
      } else {
        setSqlResult({
          columns: ['id', 'name', 'status', 'region', 'latency_ms'],
          rows: [
            { id: 'srv_anycast_01', name: 'Tokyo Edge PoP', status: 'active', region: 'ap-northeast-1', latency_ms: '8.4ms' },
            { id: 'srv_anycast_02', name: 'Frankfurt Core', status: 'active', region: 'eu-central-1', latency_ms: '14.2ms' },
            { id: 'srv_anycast_03', name: 'Ashburn Primary', status: 'active', region: 'us-east-1', latency_ms: '4.1ms' },
            { id: 'srv_anycast_04', name: 'São Paulo PoP', status: 'active', region: 'sa-east-1', latency_ms: '22.8ms' }
          ],
          executionTimeMs: 3.2,
          rowsAffected: 4
        });
      }
    }, 450);
  };

  const handleSimulateVectorSearch = () => {
    if (!vectorSearchQuery.trim()) return;
    setIsSearchingVector(true);
    setTimeout(() => {
      setIsSearchingVector(false);
      setVectorResults([
        {
          id: 'chunk_doc_8841',
          score: 0.948,
          text: 'Automated SSL/TLS Certificate Provisioning: CloudMesh automatically signs Let’s Encrypt X.509 Wildcard certificates with zero-downtime SNI rotation every 60 days.',
          source: 'docs/networking/custom-domains.md'
        },
        {
          id: 'chunk_doc_9912',
          score: 0.882,
          text: 'Custom Domain DNS Verification: Add a CNAME pointing to cname.cloudmesh-edge.net or an ALIAS record for Apex root apex domains.',
          source: 'docs/security/tls-handshakes.md'
        },
        {
          id: 'chunk_doc_3301',
          score: 0.814,
          text: 'Mutual TLS (mTLS) and Client Certificates: Configure zero-trust client verification for backend VPC interconnect services.',
          source: 'docs/connect/vpc-peering.md'
        }
      ]);
    }, 600);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Architecture Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-white tracking-tight">Cloudmesh Unified Storage</h1>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Mesh
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Globally distributed serverless primitives: Edge KV, S3-compatible Object Storage, Serverless SQL, and AI Vector Embeddings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'kv' && (
            <button
              onClick={() => setIsNewKvModalOpen(true)}
              className="px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Key
            </button>
          )}
          {activeTab === 'blob' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsNewBucketModalOpen(true)}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-medium transition-colors border border-neutral-700 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                New Bucket
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Object
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Storage Fleet Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Total Stored Data</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">2.08 TB</div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-400">+14.2 GB</span> past 24h
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Edge KV Read Ops</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">11.2M <span className="text-xs font-normal text-neutral-400">/ 24h</span></div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Avg latency: <span className="text-emerald-400 font-mono">0.8ms</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">SQL Transactions</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">842,100</div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Engine: <span className="text-neutral-200">Postgres 16 + D1</span>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-xs">Vector Embeddings</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">113,300</div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Indexed: <span className="text-neutral-200">Cosine 1536d / 768d</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-neutral-800">
        <button
          onClick={() => setActiveTab('kv')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'kv'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Edge Key-Value (KV)
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {kvNamespaces.reduce((acc, curr) => acc + curr.keysCount, 0).toLocaleString()}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('blob')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'blob'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          Blob / S3 Buckets
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 font-mono">
            {buckets.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sql')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'sql'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Serverless SQL Query
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
            Online
          </span>
        </button>

        <button
          onClick={() => setActiveTab('vector')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === 'vector'
              ? 'border-white text-white'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Vector Embeddings
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
            AI / RAG
          </span>
        </button>
      </div>

      {/* TAB 1: EDGE KEY-VALUE STORE */}
      {activeTab === 'kv' && (
        <div className="space-y-4">
          {/* Namespace Selector Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {kvNamespaces.map((ns) => {
              const isSelected = ns.id === selectedNamespaceId;
              return (
                <div
                  key={ns.id}
                  onClick={() => {
                    setSelectedNamespaceId(ns.id);
                    const firstInNs = kvEntries.find(e => e.namespaceId === ns.id);
                    setSelectedEntry(firstInNs || null);
                    setEditingValue(firstInNs?.value || '');
                  }}
                  className={`cursor-pointer rounded-xl p-3.5 border transition-all ${
                    isSelected
                      ? 'bg-neutral-800/80 border-neutral-600 shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-white tracking-wide">{ns.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                      {ns.region.split(' ')[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2">
                    <span>{ns.keysCount.toLocaleString()} keys</span>
                    <span>{ns.sizeMb} MB</span>
                    <span className="text-emerald-400 font-mono">{(ns.readOps24h / 1000).toFixed(0)}k r/d</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Master-Detail KV Browser */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Keys list */}
            <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col overflow-hidden">
              <div className="p-3 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={`Search keys in ${currentNamespace.name}...`}
                    value={kvSearchQuery}
                    onChange={(e) => setKvSearchQuery(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 font-mono"
                  />
                </div>
                <button
                  onClick={() => setIsNewKvModalOpen(true)}
                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors border border-neutral-700"
                  title="Create Key"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="divide-y divide-neutral-800/60 max-h-[460px] overflow-y-auto">
                {filteredKvEntries.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    No keys found matching query in this namespace.
                  </div>
                ) : (
                  filteredKvEntries.map((entry) => {
                    const isSelected = selectedEntry?.key === entry.key;
                    return (
                      <div
                        key={entry.key}
                        onClick={() => handleSelectEntry(entry)}
                        className={`p-3 text-left cursor-pointer transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-neutral-800/80 border-l-2 border-white' : 'hover:bg-neutral-850'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-mono text-xs text-white truncate font-medium">{entry.key}</div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                            <span>{formatBytes(entry.sizeBytes)}</span>
                            {entry.expiresAt && (
                              <span className="flex items-center gap-1 text-amber-400">
                                <Clock className="w-3 h-3" />
                                {entry.expiresAt}
                              </span>
                            )}
                            <span>{entry.lastModified}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-600 flex-shrink-0" />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Key Value Inspector & Editor */}
            <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col">
              {selectedEntry ? (
                <>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
                    <div className="min-w-0">
                      <div className="text-[11px] text-neutral-400">Selected Key</div>
                      <div className="font-mono text-xs font-bold text-white truncate mt-0.5">{selectedEntry.key}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(selectedEntry.value, selectedEntry.key)}
                        className="px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded border border-neutral-700 transition-colors flex items-center gap-1"
                        title="Copy Value"
                      >
                        {copiedKey === selectedEntry.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[11px]">{copiedKey === selectedEntry.key ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(selectedEntry.key)}
                        className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-900/40 rounded border border-red-900/40 transition-colors"
                        title="Delete Key"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span>Value (JSON / Raw String)</span>
                      <span>Size: {formatBytes(editingValue.length)}</span>
                    </div>
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      rows={14}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 font-mono text-xs text-neutral-200 focus:outline-none focus:border-neutral-600 resize-none font-medium leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-neutral-800">
                    <div className="text-[11px] text-neutral-400">
                      {selectedEntry.ttlSeconds ? `TTL: ${selectedEntry.ttlSeconds}s (expires in ${selectedEntry.expiresAt})` : 'Persistent Key (No expiration)'}
                    </div>
                    <button
                      onClick={handleSaveEntry}
                      disabled={editingValue === selectedEntry.value}
                      className="px-3 py-1.5 bg-white text-neutral-900 font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center p-12 text-center text-xs text-neutral-500">
                  Select a key on the left to inspect and modify its payload.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BLOB / S3 BUCKETS */}
      {activeTab === 'blob' && (
        <div className="space-y-4">
          {/* Bucket details bar */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                <HardDrive className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedBucketId}
                    onChange={(e) => setSelectedBucketId(e.target.value)}
                    className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-white focus:outline-none"
                  >
                    {buckets.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  {currentBucket.publicAccess ? (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      <Unlock className="w-3 h-3" /> Public Read
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      <Lock className="w-3 h-3" /> Private / KMS
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-1">
                  <span>Region: <strong className="text-neutral-200">{currentBucket.region}</strong></span>
                  <span>•</span>
                  <span>{currentBucket.objectsCount.toLocaleString()} objects</span>
                  <span>•</span>
                  <span>{currentBucket.sizeGb} GB total</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(currentBucket.endpointUrl, currentBucket.id)}
                className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-mono transition-colors border border-neutral-700 flex items-center gap-1.5"
                title="Copy S3 Endpoint"
              >
                {copiedKey === currentBucket.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="text-[11px] truncate max-w-[200px]">s3://{currentBucket.name}</span>
              </button>
            </div>
          </div>

          {/* Objects Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-neutral-800 flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter objects by key or prefix..."
                  value={blobSearchQuery}
                  onChange={(e) => setBlobSearchQuery(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 font-mono"
                />
              </div>
              <div className="text-xs text-neutral-400">
                Showing {filteredBlobObjects.length} objects
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950/60 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="px-4 py-2.5">Key / Path</th>
                    <th className="px-4 py-2.5">Content Type</th>
                    <th className="px-4 py-2.5">Size</th>
                    <th className="px-4 py-2.5">Storage Class</th>
                    <th className="px-4 py-2.5">Last Modified</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {filteredBlobObjects.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                        No objects found in this bucket. Click "Upload Object" to store an asset.
                      </td>
                    </tr>
                  ) : (
                    filteredBlobObjects.map((obj) => (
                      <tr key={obj.id} className="hover:bg-neutral-800/40 transition-colors">
                        <td className="px-4 py-3 font-mono font-medium text-white flex items-center gap-2">
                          <Code2 className="w-3.5 h-3.5 text-neutral-500 flex-shrink-0" />
                          <span className="truncate max-w-md">{obj.key}</span>
                        </td>
                        <td className="px-4 py-3 text-neutral-300 font-mono text-[11px]">
                          {obj.contentType}
                        </td>
                        <td className="px-4 py-3 text-neutral-300 font-mono">
                          {formatBytes(obj.sizeBytes)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                            {obj.storageClass}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-400 text-[11px]">
                          {obj.lastModified}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleCopy(`${currentBucket.endpointUrl}/${obj.key}`, obj.id)}
                              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors"
                              title="Copy URL"
                            >
                              {copiedKey === obj.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteBlob(obj.id)}
                              className="p-1.5 text-red-400 hover:text-red-300 rounded hover:bg-red-950/30 transition-colors"
                              title="Delete object"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SERVERLESS SQL RUNNER */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          {/* Database Selector and Connection Info */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedDbId}
                      onChange={(e) => setSelectedDbId(e.target.value)}
                      className="bg-neutral-950 border border-neutral-700 rounded-lg px-2.5 py-1 text-xs font-mono font-semibold text-white focus:outline-none"
                    >
                      {databases.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.engine})</option>
                      ))}
                    </select>
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {currentDb.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1 flex items-center gap-3">
                    <span>Region: <strong className="text-neutral-200">{currentDb.region}</strong></span>
                    <span>•</span>
                    <span>{currentDb.tablesCount} tables</span>
                    <span>•</span>
                    <span>{currentDb.rowsCount.toLocaleString()} rows</span>
                    <span>•</span>
                    <span>{currentDb.sizeMb} MB</span>
                  </div>
                </div>
              </div>

              {/* Connection string snippet */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1 text-xs font-mono text-neutral-300">
                  <span>{showConnString ? currentDb.connectionStringMasked.replace('••••••••••••', 'p4ssw0rd_pr0d') : currentDb.connectionStringMasked}</span>
                  <button
                    onClick={() => setShowConnString(!showConnString)}
                    className="ml-2 text-neutral-500 hover:text-neutral-300"
                    title={showConnString ? "Hide password" : "Show password"}
                  >
                    {showConnString ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={() => handleCopy(currentDb.connectionStringMasked, currentDb.id)}
                  className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors border border-neutral-700"
                  title="Copy Connection String"
                >
                  {copiedKey === currentDb.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive SQL Editor & Executor */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
            <div className="p-3 border-b border-neutral-800 bg-neutral-950/40 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-neutral-400" /> Quick Query:
                </span>
                <button
                  onClick={() => setSqlQuery('SELECT id, name, status, region, updated_at FROM deployments ORDER BY updated_at DESC LIMIT 5;')}
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700 whitespace-nowrap"
                >
                  Deployments
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT count(*), status FROM deployments GROUP BY status;')}
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700 whitespace-nowrap"
                >
                  Status Aggregates
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT id, email, tier, created_at, last_active FROM users ORDER BY created_at DESC LIMIT 3;')}
                  className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors border border-neutral-700 whitespace-nowrap"
                >
                  Users Table
                </button>
              </div>

              <button
                onClick={handleExecuteSql}
                disabled={isExecutingSql}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isExecutingSql ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                Run Query
              </button>
            </div>

            <textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              rows={4}
              className="w-full bg-neutral-950 p-3 font-mono text-xs text-emerald-400 focus:outline-none resize-none leading-relaxed border-b border-neutral-800"
              placeholder="Enter SQL statement (e.g. SELECT * FROM users)..."
            />

            {/* Results Grid */}
            <div className="p-3 bg-neutral-900">
              <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-2">
                <span className="flex items-center gap-1.5">
                  <TableIcon className="w-3.5 h-3.5 text-neutral-400" />
                  Query Results
                </span>
                {sqlResult && (
                  <span className="font-mono text-neutral-400">
                    {sqlResult.rowsAffected} rows in <strong className="text-emerald-400">{sqlResult.executionTimeMs} ms</strong>
                  </span>
                )}
              </div>

              {sqlResult && (
                <div className="overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-950">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-neutral-900/80 text-neutral-400 border-b border-neutral-800 text-[10px]">
                      <tr>
                        {sqlResult.columns.map((col) => (
                          <th key={col} className="px-3 py-2 uppercase tracking-wider font-semibold text-neutral-300">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/80 text-neutral-300 text-[11px]">
                      {sqlResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-neutral-900/40">
                          {sqlResult.columns.map((col) => (
                            <td key={col} className="px-3 py-2 whitespace-nowrap">
                              {row[col] !== undefined ? String(row[col]) : 'NULL'}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VECTOR EMBEDDINGS (AI & RAG) */}
      {activeTab === 'vector' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vectorIndexes.map((idx) => (
              <div key={idx.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="font-mono font-semibold text-xs text-white">{idx.name}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {idx.dimensions} dims ({idx.metric})
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-neutral-800/60">
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Total Vectors</span>
                    <strong className="text-white font-mono">{idx.vectorCount.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Namespaces</span>
                    <strong className="text-white font-mono">{idx.namespacesCount}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-500 block">Last Indexed</span>
                    <strong className="text-neutral-300 text-[11px]">{idx.lastIndexed}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Nearest Neighbor Test Query Simulator */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-xs font-semibold text-white tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Semantic Vector Search Simulator (k-NN)
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Test cosine distance retrieval against indexed knowledge embeddings in real-time.
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                Top K = 3
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={vectorSearchQuery}
                onChange={(e) => setVectorSearchQuery(e.target.value)}
                placeholder="Ask or query semantic embeddings..."
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500/50"
              />
              <button
                onClick={handleSimulateVectorSearch}
                disabled={isSearchingVector}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isSearchingVector ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Vector Query
              </button>
            </div>

            {vectorResults && (
              <div className="space-y-2 pt-2">
                <div className="text-[11px] text-neutral-400 font-medium">Nearest Neighbor Matches:</div>
                {vectorResults.map((res) => (
                  <div key={res.id} className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-purple-400">{res.source}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        Cosine Similarity: {(res.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      "{res.text}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: New Key Modal */}
      {isNewKvModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Add Key to {currentNamespace.name}</h3>
              <button onClick={() => setIsNewKvModalOpen(false)} className="text-neutral-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateNewKey} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user:settings:usr_123"
                  value={newKeyForm.key}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, key: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">TTL (Seconds, optional)</label>
                <input
                  type="number"
                  placeholder="86400 (blank for never expires)"
                  value={newKeyForm.ttl}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, ttl: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Value Payload</label>
                <textarea
                  rows={5}
                  value={newKeyForm.value}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, value: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-600 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewKvModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Insert Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Bucket Modal */}
      {isNewBucketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Create S3 / Blob Bucket</h3>
              <button onClick={() => setIsNewBucketModalOpen(false)} className="text-neutral-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleCreateBucket} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Bucket Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. assets-media-vault"
                  value={newBucketForm.name}
                  onChange={(e) => setNewBucketForm({ ...newBucketForm, name: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Primary Region</label>
                <select
                  value={newBucketForm.region}
                  onChange={(e) => setNewBucketForm({ ...newBucketForm, region: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-600"
                >
                  <option value="us-east-1 (Global CDN)">us-east-1 (N. Virginia with Anycast CDN)</option>
                  <option value="eu-central-1 (GDPR Compliant)">eu-central-1 (Frankfurt GDPR KMS)</option>
                  <option value="ap-southeast-1 (Singapore)">ap-southeast-1 (Singapore Edge)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                <div>
                  <span className="text-xs font-medium text-white block">Public Read Access</span>
                  <span className="text-[10px] text-neutral-400">Allow public HTTP reads via CDN URL</span>
                </div>
                <input
                  type="checkbox"
                  checked={newBucketForm.publicAccess}
                  onChange={(e) => setNewBucketForm({ ...newBucketForm, publicAccess: e.target.checked })}
                  className="rounded border-neutral-700 text-blue-500 focus:ring-0 w-4 h-4 bg-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsNewBucketModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Provision Bucket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Object Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-semibold text-white">Upload to {currentBucket.name}</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-neutral-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleUploadBlob} className="space-y-3">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">Object Key / S3 Path</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. images/banner-hero-2026.png"
                  value={newBlobForm.key}
                  onChange={(e) => setNewBlobForm({ ...newBlobForm, key: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Content-Type</label>
                  <select
                    value={newBlobForm.contentType}
                    onChange={(e) => setNewBlobForm({ ...newBlobForm, contentType: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="image/png">image/png</option>
                    <option value="image/webp">image/webp</option>
                    <option value="application/json">application/json</option>
                    <option value="application/javascript">application/javascript</option>
                    <option value="text/html">text/html</option>
                    <option value="application/pdf">application/pdf</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">File Size (KB)</label>
                  <input
                    type="number"
                    value={newBlobForm.sizeKb}
                    onChange={(e) => setNewBlobForm({ ...newBlobForm, sizeKb: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="border-2 border-dashed border-neutral-800 hover:border-neutral-700 rounded-lg p-6 text-center cursor-pointer transition-colors bg-neutral-950/40">
                <Upload className="w-6 h-6 text-neutral-500 mx-auto mb-2" />
                <span className="text-xs text-neutral-300 font-medium block">Drag & drop asset here</span>
                <span className="text-[10px] text-neutral-500 mt-1 block">Supports up to 5GB single object S3 multipart upload</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-colors"
                >
                  Upload Object
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
