import React, { useState } from 'react';
import { USAGE_METRICS, USER_INFO } from '../mockData';
import { 
  BarChart3, 
  TrendingUp, 
  HardDrive, 
  Activity, 
  Zap, 
  ArrowUpRight, 
  ShieldAlert, 
  CheckCircle2, 
  Mail,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface UsageOverviewProps {
  onOpenGmailAlerts: () => void;
}

export const UsageOverview: React.FC<UsageOverviewProps> = ({ onOpenGmailAlerts }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'30d' | '7d' | 'current_cycle'>('30d');

  return (
    <div className="space-y-6">
      {/* Top Banner: Pro Trial Expired Notice matching screenshot prompt */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-indigo-950/40 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Your Pro Trial has expired</h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Would you like to upgrade to Pro? Increase limits to 10M edge requests, 1 TB transfer, and team collaboration.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button 
            onClick={onOpenGmailAlerts}
            className="px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Setup Anomaly Alert</span>
          </button>
          <button 
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold shadow-xs transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>

      {/* Usage Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            Usage & Quotas
            <span className="text-xs font-normal text-neutral-400">(Last 30 days)</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time infrastructure consumption across all 38 deployed web applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-0.5 flex text-xs">
            {(['30d', '7d', 'current_cycle'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-neutral-800 text-white font-medium shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {period === '30d' ? 'Last 30 days' : period === '7d' ? 'Last 7 days' : 'Billing Cycle'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid from the user prompt */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {USAGE_METRICS.map((metric) => (
          <div
            key={metric.id}
            id={`metric-card-${metric.id}`}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium text-neutral-300">
                  {metric.title}
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {metric.percentage}%
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg font-bold text-white font-mono">
                  {metric.used}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  / {metric.limit}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-neutral-950 rounded-full h-1.5 mt-3 overflow-hidden border border-neutral-800/80">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    metric.percentage > 80
                      ? 'bg-rose-500'
                      : metric.percentage > 50
                      ? 'bg-amber-400'
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.max(metric.percentage * 5, 4)}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
              <span className="truncate">Pro Tier: {metric.tierLimit}</span>
              <span className="text-neutral-300 font-medium">{metric.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alerts Anomaly Banner */}
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-white">Get alerted for anomalies</h4>
            <p className="text-xs text-neutral-400 mt-0.5">
              Automatically monitor your projects for anomalies and get notified in your Gmail inbox.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenGmailAlerts}
          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs transition-colors shrink-0"
        >
          Configure Alert Delivery
        </button>
      </div>
    </div>
  );
};
