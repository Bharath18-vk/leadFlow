import React from 'react';
import { Flame, CheckCircle2, AlertCircle } from 'lucide-react';

interface TierDistributionProps {
  counts: {
    A: number;
    B: number;
    C: number;
  };
  totalLeads: number;
  onSelectTier?: (tier: string) => void;
}

export const TierDistribution: React.FC<TierDistributionProps> = ({
  counts,
  totalLeads,
  onSelectTier,
}) => {
  const getPercent = (val: number) => {
    if (!totalLeads) return 0;
    return Math.round((val / totalLeads) * 100);
  };

  const tiers = [
    {
      id: 'A',
      title: 'A — Hot Leads',
      desc: 'Score ≥ 75 | High reviews, stellar rating & photos',
      count: counts.A,
      percent: getPercent(counts.A),
      icon: Flame,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      barColor: 'bg-rose-500',
      badge: '🔥 Highest Conversion',
    },
    {
      id: 'B',
      title: 'B — Good Prospects',
      desc: 'Score 50-74 | Solid presence, active business',
      count: counts.B,
      percent: getPercent(counts.B),
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      barColor: 'bg-emerald-500',
      badge: '🟢 Prime Targets',
    },
    {
      id: 'C',
      title: 'C — Low Priority',
      desc: 'Score < 50 | Fewer reviews or unverified presence',
      count: counts.C,
      percent: getPercent(counts.C),
      icon: AlertCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      barColor: 'bg-amber-500',
      badge: '🟡 Secondary Batch',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Lead Quality Distribution</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Classified by rating, review momentum, photo portfolio, and contact reach
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
          {totalLeads} Total Leads
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.id}
              onClick={() => onSelectTier && onSelectTier(tier.id)}
              className={`p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all ${
                onSelectTier ? 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-700' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-md ${tier.bgColor} ${tier.color} dark:bg-slate-800`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{tier.title}</span>
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {tier.count}
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">{tier.desc}</p>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span>Share</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{tier.percent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${tier.barColor} transition-all duration-500 rounded-full`}
                    style={{ width: `${tier.percent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
