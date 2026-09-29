import React from 'react';
import { Target, CheckCircle, Clock } from 'lucide-react';

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
      title: 'Tier A: Priority',
      desc: 'Score 75+ / High review density and verified presence',
      count: counts.A,
      percent: getPercent(counts.A),
      icon: Target,
      badge: 'High Conversion Potential',
      barColor: 'bg-emerald-500',
    },
    {
      id: 'B',
      title: 'Tier B: Qualified',
      desc: 'Score 50-74 / Established local business with steady profile',
      count: counts.B,
      percent: getPercent(counts.B),
      icon: CheckCircle,
      badge: 'Core Prospects',
      barColor: 'bg-zinc-500',
    },
    {
      id: 'C',
      title: 'Tier C: Standard',
      desc: 'Score below 50 / Unverified or early listing',
      count: counts.C,
      percent: getPercent(counts.C),
      icon: Clock,
      badge: 'Secondary Batch',
      barColor: 'bg-zinc-400 dark:bg-zinc-600',
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Lead Quality Distribution</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Classified by rating, review momentum, photo portfolio, and contact reach
          </p>
        </div>
        <span className="text-xs font-mono px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md border border-zinc-200 dark:border-zinc-700 tabular-nums">
          {totalLeads} total leads
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.id}
              onClick={() => onSelectTier && onSelectTier(tier.id)}
              className={`p-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors ${
                onSelectTier ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </div>
                  <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">{tier.title}</span>
                </div>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {tier.count}
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-3">{tier.desc}</p>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  <span>{tier.badge}</span>
                  <span className="font-semibold tabular-nums">{tier.percent}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${tier.barColor} transition-all duration-300`}
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
