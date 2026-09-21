import React, { useState } from 'react';
import { 
  Globe, 
  Lock, 
  RotateCw, 
  ExternalLink, 
  Copy, 
  Check, 
  Monitor, 
  Tablet, 
  Smartphone, 
  Activity, 
  Server, 
  ShieldCheck, 
  Terminal, 
  Sparkles,
  TrendingUp,
  Wallet,
  ArrowRight,
  Code,
  ShoppingCart,
  Send,
  CheckCircle2,
  Zap,
  Info
} from 'lucide-react';
import { ProjectItem } from '../types';

interface LiveAppViewerProps {
  project: ProjectItem;
  onClose?: () => void;
  standalone?: boolean;
}

export const LiveAppViewer: React.FC<LiveAppViewerProps> = ({ 
  project, 
  onClose,
  standalone = false 
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'preview' | 'headers' | 'metrics' | 'dns'>('preview');
  const [copied, setCopied] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [appTheme, setAppTheme] = useState<'dark' | 'light'>('dark');

  // Interactive state for preview apps
  const [ethBalance, setEthBalance] = useState(14.85);
  const [gasPrice, setGasPrice] = useState(18);
  const [promptText, setPromptText] = useState('Optimize React re-render cycle using useMemo and memo');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cartCount, setCartCount] = useState(2);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(`https://${project.fullDomain}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    setIsReloading(true);
    setTimeout(() => setIsReloading(false), 600);
  };

  const handleRunAiAudit = () => {
    setIsAnalyzing(true);
    setAiResponse(null);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiResponse(`✓ Analysis Complete: No unnecessary reconciliations found.\n⚡ Performance Score: 98/100 (Edge hydration: 14ms)\n💡 Recommendation: Keep memoizing pure presentational components.`);
    }, 900);
  };

  const viewportWidthClass = 
    viewport === 'mobile' ? 'max-w-[390px]' : 
    viewport === 'tablet' ? 'max-w-[768px]' : 
    'w-full';

  return (
    <div className={`flex flex-col bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl ${standalone ? 'h-full min-h-[600px]' : 'h-[750px]'}`}>
      {/* Top Browser Chrome Bar */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Navigation buttons & Window Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          </div>

          <button
            onClick={handleReload}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
            title="Reload Live App"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isReloading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 max-w-xl mx-auto flex items-center bg-neutral-950 border border-neutral-700/70 rounded-lg px-3 py-1 text-xs shadow-inner">
          <div className="flex items-center gap-1.5 text-emerald-400 mr-2 shrink-0 font-medium">
            <Lock className="w-3 h-3" />
            <span className="text-[11px]">https://</span>
          </div>
          
          <input
            readOnly
            value={project.fullDomain}
            className="w-full bg-transparent text-white font-mono text-xs focus:outline-none select-all truncate"
          />

          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            <span className="px-1.5 py-0.2 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-full text-[10px] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live
            </span>

            <button
              onClick={handleCopyUrl}
              className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
              title="Copy Live URL"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Viewport switcher & external action */}
        <div className="flex items-center gap-2">
          {/* Viewport Toggles */}
          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-md p-0.5">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded transition-colors ${viewport === 'desktop' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              title="Desktop View (1440px)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded transition-colors ${viewport === 'tablet' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded transition-colors ${viewport === 'mobile' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            href={`https://${project.fullDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
            title="Open in new window"
          >
            <span>Open</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Sub-bar: Preview Tabs & Diagnostics */}
      <div className="bg-neutral-900/60 border-b border-neutral-800 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('preview')}
            className={`font-medium transition-colors pb-0.5 border-b-2 ${
              activeTab === 'preview' ? 'border-blue-500 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Interactive Live App
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`font-medium transition-colors pb-0.5 border-b-2 ${
              activeTab === 'headers' ? 'border-blue-500 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            HTTP Headers & SSL
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`font-medium transition-colors pb-0.5 border-b-2 ${
              activeTab === 'metrics' ? 'border-blue-500 text-white' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Edge Latency & PoP
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            Latency: 14ms (Tokyo hnd1)
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            TLS 1.3 256-bit
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-neutral-950 overflow-y-auto p-4 flex justify-center items-start">
        {activeTab === 'preview' && (
          <div className={`${viewportWidthClass} transition-all duration-300 w-full`}>
            {/* Live Interactive Application Canvas */}
            <div className={`border border-neutral-800 rounded-xl overflow-hidden shadow-xl ${
              appTheme === 'dark' ? 'bg-[#0f172a] text-slate-100' : 'bg-white text-slate-900'
            }`}>
              {/* App Navbar */}
              <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
                appTheme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-slate-50'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    ▲
                  </div>
                  <div>
                    <h1 className="font-bold text-sm leading-tight tracking-tight">
                      {project.displayName}
                    </h1>
                    <span className="text-[10px] text-emerald-500 font-medium">● Production Live v1.0.4</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setAppTheme(t => t === 'dark' ? 'light' : 'dark')}
                    className={`px-2 py-1 rounded text-[11px] font-medium border ${
                      appTheme === 'dark' 
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {appTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                  </button>
                  <span className="px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded text-[11px] font-mono">
                    {project.framework}
                  </span>
                </div>
              </div>

              {/* Dynamic Interactive App Body depending on repo archetype */}
              {project.name.toLowerCase().includes('fintech') || project.repo.toLowerCase().includes('fintech') ? (
                /* Archetype 1: FinTech & Web3 Dashboard */
                <div className="p-6 space-y-6">
                  {/* KPI Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-lg border ${appTheme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-xs text-slate-400 block font-medium">Portfolio Balance</span>
                      <div className="text-2xl font-bold mt-1 tracking-tight">
                        ${(ethBalance * 3420.5).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" /> +8.4% today
                      </span>
                    </div>

                    <div className={`p-4 rounded-lg border ${appTheme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-xs text-slate-400 block font-medium">Connected Wallet</span>
                      <div className="text-sm font-mono mt-1 font-semibold flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-blue-400" />
                        0x71C...4E89
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">Network: Ethereum Mainnet</span>
                    </div>

                    <div className={`p-4 rounded-lg border ${appTheme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <span className="text-xs text-slate-400 block font-medium">Fast Gas Oracle</span>
                      <div className="text-2xl font-bold mt-1 text-amber-400">{gasPrice} Gwei</div>
                      <span className="text-xs text-slate-400 mt-1 block">Confirmation: &lt;15 seconds</span>
                    </div>
                  </div>

                  {/* Interactive Swap / Action Card */}
                  <div className={`p-5 rounded-xl border ${appTheme === 'dark' ? 'bg-slate-900/70 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                    <h3 className="text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Instant Decentralized Swap Simulator
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={`p-3 rounded-lg border ${appTheme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'}`}>
                        <span className="text-[11px] text-slate-400">You Pay</span>
                        <div className="flex items-center justify-between mt-1">
                          <input
                            type="number"
                            defaultValue="1.5"
                            className="bg-transparent font-bold text-lg focus:outline-none w-24"
                          />
                          <span className="px-2 py-1 rounded bg-blue-600/20 text-blue-400 text-xs font-semibold">ETH</span>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg border ${appTheme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'}`}>
                        <span className="text-[11px] text-slate-400">You Receive</span>
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-lg">5,130.75</span>
                          <span className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 text-xs font-semibold">USDC</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEthBalance(b => +(b + 0.5).toFixed(2));
                        setGasPrice(g => Math.floor(Math.random() * 8) + 16);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      Execute Micro-Transaction (Simulated On-Chain)
                    </button>
                  </div>
                </div>
              ) : project.name.toLowerCase().includes('ai') || project.repo.toLowerCase().includes('ai') || project.repo.toLowerCase().includes('gemini') ? (
                /* Archetype 2: AI Code Companion */
                <div className="p-6 space-y-5">
                  <div className={`p-4 rounded-xl border ${appTheme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <h3 className="text-sm font-bold flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-purple-400" />
                      AI Live Code & AST Performance Auditor
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Powered by Gemini 2.5 API with real-time AST analysis at edge runtime.
                    </p>

                    <div className="space-y-3">
                      <textarea
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        rows={3}
                        className={`w-full p-3 rounded-lg text-xs font-mono border focus:outline-none focus:border-purple-500 ${
                          appTheme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
                        }`}
                        placeholder="Enter snippet or optimization prompt..."
                      />

                      <button
                        onClick={handleRunAiAudit}
                        disabled={isAnalyzing}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
                      >
                        {isAnalyzing ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        <span>{isAnalyzing ? 'Auditing with Gemini 2.5...' : 'Run Live Edge Audit'}</span>
                      </button>
                    </div>

                    {aiResponse && (
                      <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/80 text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                        {aiResponse}
                      </div>
                    )}
                  </div>
                </div>
              ) : project.name.toLowerCase().includes('ecommerce') || project.repo.toLowerCase().includes('ecommerce') ? (
                /* Archetype 3: E-Commerce Storefront */
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold">Featured Products</h2>
                      <p className="text-xs text-slate-400">Headless Next.js edge storefront with real-time inventory</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white">
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Cart ({cartCount})</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={`p-4 rounded-xl border ${appTheme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                      <div className="w-full h-28 bg-gradient-to-tr from-slate-800 to-slate-700 rounded-lg flex items-center justify-center text-3xl">
                        🎧
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs">Acoustic Pro Noise-Cancelling</h4>
                          <span className="text-xs font-semibold text-emerald-400">$299.00</span>
                        </div>
                        <button
                          onClick={() => setCartCount(c => c + 1)}
                          className="px-2.5 py-1 bg-white text-black font-semibold text-xs rounded hover:bg-slate-200"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${appTheme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                      <div className="w-full h-28 bg-gradient-to-tr from-indigo-900 to-slate-800 rounded-lg flex items-center justify-center text-3xl">
                        ⌨️
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-xs">Mechanical Wireless Studio</h4>
                          <span className="text-xs font-semibold text-emerald-400">$189.00</span>
                        </div>
                        <button
                          onClick={() => setCartCount(c => c + 1)}
                          className="px-2.5 py-1 bg-white text-black font-semibold text-xs rounded hover:bg-slate-200"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Generic Live Application Archetype */
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-xl">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {project.displayName} is Running Live!
                  </h2>
                  <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                    Deployed straight from GitHub repository <span className="font-mono text-blue-400">{project.repo}</span>. Active across global edge routing nodes with SSL encryption.
                  </p>

                  <div className="inline-flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2 rounded-lg text-xs font-mono">
                    <span className="text-emerald-400 font-semibold">GET /</span>
                    <span className="text-slate-300">200 OK</span>
                    <span className="text-slate-500">12ms TTFB</span>
                  </div>
                </div>
              )}

              {/* App Footer */}
              <div className={`px-5 py-3 border-t text-[11px] flex items-center justify-between ${
                appTheme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}>
                <span>Deployed with CloudHub Engine</span>
                <span className="font-mono">https://{project.fullDomain}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: HTTP Headers */}
        {activeTab === 'headers' && (
          <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 text-xs font-mono">
            <h3 className="text-white font-bold text-sm font-sans flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              Live Edge HTTP Response Headers
            </h3>

            <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 space-y-2 text-neutral-300">
              <div className="text-emerald-400 font-bold">HTTP/2 200 OK</div>
              <div><span className="text-neutral-500">content-type:</span> text/html; charset=utf-8</div>
              <div><span className="text-neutral-500">server:</span> CloudHub-Edge-Router/2.8</div>
              <div><span className="text-neutral-500">x-edge-cache:</span> HIT (Edge Cache S-Maxage=31536000)</div>
              <div><span className="text-neutral-500">strict-transport-security:</span> max-age=63072000; includeSubDomains; preload</div>
              <div><span className="text-neutral-500">x-framework:</span> {project.framework}</div>
              <div><span className="text-neutral-500">x-deployment-id:</span> {project.id}</div>
              <div><span className="text-neutral-500">access-control-allow-origin:</span> *</div>
              <div><span className="text-neutral-500">alt-svc:</span> h3=":443"; ma=86400</div>
            </div>
          </div>
        )}

        {/* Tab 3: Edge Latency */}
        {activeTab === 'metrics' && (
          <div className="w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 text-xs">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Global Edge PoP Routing Latency
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { location: 'Ashburn, VA (iad1)', latency: '9ms', status: 'Optimal', load: '14%' },
                { location: 'Frankfurt, DE (fra1)', latency: '19ms', status: 'Optimal', load: '22%' },
                { location: 'Tokyo, JP (hnd1)', latency: '14ms', status: 'Optimal', load: '18%' },
                { location: 'Singapore (sin1)', latency: '26ms', status: 'Optimal', load: '11%' },
                { location: 'London, UK (lhr1)', latency: '16ms', status: 'Optimal', load: '29%' },
                { location: 'Sydney, AU (syd1)', latency: '42ms', status: 'Optimal', load: '9%' }
              ].map((pop, idx) => (
                <div key={idx} className="bg-neutral-950 border border-neutral-800 p-3 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">{pop.location}</span>
                    <span className="text-[11px] text-neutral-400">Load: {pop.load}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-mono font-bold">{pop.latency}</span>
                    <span className="text-[10px] text-emerald-500 block">● {pop.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
