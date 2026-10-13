import React from 'react';
import { Target, TrendingUp, Phone, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { DashboardStats } from '../../types/lead';

interface OutreachGoalCardProps {
  stats: DashboardStats;
  onNavigateToLeads?: () => void;
  onNavigateToQueue?: () => void;
}

export const OutreachGoalCard: React.FC<OutreachGoalCardProps> = ({ stats, onNavigateToLeads, onNavigateToQueue }) => {
  const dailyGoal = stats.dailyGoal || 20;
  const goalPercent = Math.min(
    100,
    Math.round((stats.todayOutreachCount / dailyGoal) * 100)
  );
  const remaining = Math.max(0, dailyGoal - stats.todayOutreachCount);
  const isGoalReached = stats.todayOutreachCount >= dailyGoal;

  const primePercent = stats.totalLeads > 0
    ? Math.min(100, Math.round((stats.potentialLeads / stats.totalLeads) * 100))
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
      {/* 1. Today's Outreach Target Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-xl p-5 border border-zinc-800/90 shadow-sm flex flex-col justify-between group transition-all duration-300 hover:border-zinc-700/90">
        {/* Subtle accent highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        {/* Ambient radial glow */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/15 transition-all duration-500" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Target className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Today's Target
              </span>
            </div>
            {onNavigateToQueue && (
              <button
                onClick={onNavigateToQueue}
                className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-zinc-800/90 hover:bg-zinc-700/90 text-zinc-200 hover:text-white border border-zinc-700/60 hover:border-zinc-600 transition-all duration-150 active:scale-95 inline-flex items-center gap-1 cursor-pointer"
                title="Open outreach queue"
              >
                <span>Queue</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-white tabular-nums">
              {stats.todayOutreachCount}
            </span>
            <span className="text-zinc-400 text-sm font-mono font-medium">/ {dailyGoal}</span>
            <span className="text-[11px] text-zinc-400 ml-auto font-medium">
              {isGoalReached ? (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Target Met
                </span>
              ) : (
                `${remaining} remaining`
              )}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-zinc-800/90 space-y-2">
          <div className="flex justify-between items-center text-xs text-zinc-400 font-mono">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-sans font-medium">Pacing</span>
            <span className="font-bold text-zinc-200 tabular-nums">{goalPercent}%</span>
          </div>
          {/* Progress bar with subtle glow */}
          <div className="h-2 w-full bg-zinc-800/90 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                isGoalReached
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
              }`}
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Response Rate Card */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-xs flex flex-col justify-between transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5 group">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Engagement Rate
              </span>
            </div>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/40 font-mono">
              Replied / Contacted
            </span>
          </div>

          <div className="mt-2">
            <div className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">
              {stats.responseRate !== null ? `${stats.responseRate}%` : '--'}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
              {stats.contactedLeads > 0
                ? `${stats.repliedLeads} replies from ${stats.contactedLeads} outreach attempts`
                : 'Log outreach to calculate engagement rate'}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
          {/* Visual conversion meter */}
          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, stats.responseRate ?? 0)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
            <span>Replied: <strong className="text-zinc-900 dark:text-zinc-100">{stats.repliedLeads}</strong></span>
            <span>Contacted: <strong className="text-zinc-900 dark:text-zinc-100">{stats.contactedLeads}</strong></span>
          </div>
        </div>
      </div>

      {/* 3. Prime Prospects Card */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 shadow-xs flex flex-col justify-between transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:-translate-y-0.5 group">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Prime Prospects
              </span>
            </div>
            <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700 font-mono">
              Tier A & B ({primePercent}%)
            </span>
          </div>

          <div className="mt-2">
            <div className="text-3xl font-extrabold font-mono tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100">
              {stats.potentialLeads}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
              High-reputation prospects with established presence
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
          {/* Visual distribution meter */}
          <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${primePercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
            <span className="flex items-center gap-1.5 font-mono text-[11px]">
              <Phone className="w-3 h-3 text-zinc-400" strokeWidth={1.75} />
              <span>{stats.phoneAvailableCount} verified numbers</span>
            </span>
            {onNavigateToLeads && (
              <button
                onClick={onNavigateToLeads}
                className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 inline-flex items-center gap-0.5 transition-colors group/btn"
              >
                <span>View</span>
                <ArrowUpRight className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
