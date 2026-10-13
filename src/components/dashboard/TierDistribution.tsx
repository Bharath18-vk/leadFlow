import React from 'react';
import { Target, CheckCircle2, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

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

  const percentA = getPercent(counts.A);
  const percentB = getPercent(counts.B);
  const percentC = totalLeads > 0 ? Math.max(0, 100 - percentA - percentB) : 0;

  const tiers = [
    {
      id: 'A',
      title: 'Tier A: Priority',
      scoreRange: 'Score 75–100',
      desc: 'High review density, stellar rating, and verified contact reach',
      count: counts.A,
      percent: percentA,
      icon: Target,
      badge: 'High Conversion',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      iconBoxClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
      meterGradient: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
      hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-700/60',
      topLine: 'via-emerald-500/40',
    },
    {
      id: 'B',
      title: 'Tier B: Qualified',
      scoreRange: 'Score 50–74',
      desc: 'Established local business with steady profile and active presence',
      count: counts.B,
      percent: percentB,
      icon: CheckCircle2,
      badge: 'Core Prospects',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      iconBoxClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/40',
      meterGradient: 'bg-gradient-to-r from-blue-500 via-sky-400 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
      hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700/60',
      topLine: 'via-blue-500/40',
    },
    {
      id: 'C',
      title: 'Tier C: Standard',
      scoreRange: 'Score < 50',
      desc: 'Early listings, unverified data, or lower review momentum',
      count: counts.C,
      percent: percentC,
      icon: Clock,
      badge: 'Secondary Batch',
      badgeClass: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
      iconBoxClass: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
      meterGradient: 'bg-gradient-to-r from-zinc-400 to-zinc-500 dark:from-zinc-500 dark:to-zinc-400',
      hoverBorder: 'hover:border-zinc-300 dark:hover:border-zinc-700',
      topLine: 'via-zinc-400/40',
    },
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-xs font-sans space-y-4">
      {/* Top Header & Distribution Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Lead Quality Distribution
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700/80">
              <ShieldCheck className="w-3 h-3 text-emerald-500" strokeWidth={1.75} />
              AI Qualified
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Classified by rating, review momentum, photo portfolio, and contact reach
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 rounded-md border border-zinc-200 dark:border-zinc-700/80 tabular-nums">
            <strong className="text-zinc-900 dark:text-zinc-100">{totalLeads}</strong> total leads
          </span>
        </div>
      </div>

      {/* Aggregate Multi-Segment Composite Distribution Bar */}
      {totalLeads > 0 && (
        <div className="space-y-1.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-sans">
              Pipeline Ratio
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Tier A: {percentA}%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                <span>Tier B: {percentB}%</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 inline-block" />
                <span>Tier C: {percentC}%</span>
              </span>
            </div>
          </div>

          <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700/60 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {percentA > 0 && (
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500"
                style={{ width: `${percentA}%` }}
                title={`Tier A: ${counts.A} leads (${percentA}%)`}
              />
            )}
            {percentB > 0 && (
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-500"
                style={{ width: `${percentB}%` }}
                title={`Tier B: ${counts.B} leads (${percentB}%)`}
              />
            )}
            {percentC > 0 && (
              <div
                className="h-full bg-gradient-to-r from-zinc-400 to-zinc-500 dark:from-zinc-500 dark:to-zinc-400 rounded-r-full transition-all duration-500"
                style={{ width: `${percentC}%` }}
                title={`Tier C: ${counts.C} leads (${percentC}%)`}
              />
            )}
          </div>
        </div>
      )}

      {/* Individual Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.id}
              onClick={() => onSelectTier && onSelectTier(tier.id)}
              className={`relative overflow-hidden p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-xs ${tier.hoverBorder} ${
                onSelectTier ? 'cursor-pointer active:scale-[0.99]' : ''
              }`}
            >
              {/* Subtle top accent line on hover */}
              <div
                className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${tier.topLine} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${tier.iconBoxClass}`}>
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 block">
                      {tier.title}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block">
                      {tier.scoreRange}
                    </span>
                  </div>
                </div>

                <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {tier.count}
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mb-3 mt-1">
                {tier.desc}
              </p>

              {/* Progress & Micro Meter */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tier.badgeClass}`}>
                    {tier.badge}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold tabular-nums">
                    {tier.percent}%
                  </span>
                </div>
                
                <div className="w-full bg-zinc-200/80 dark:bg-zinc-800 h-2 rounded-full overflow-hidden p-0.5 border border-zinc-200/50 dark:border-zinc-800/80">
                  <div
                    className={`h-full rounded-full ${tier.meterGradient} transition-all duration-700 ease-out`}
                    style={{ width: `${Math.max(tier.percent, tier.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>

              {onSelectTier && (
                <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                  <span className="text-[10px]">Filter leads</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
