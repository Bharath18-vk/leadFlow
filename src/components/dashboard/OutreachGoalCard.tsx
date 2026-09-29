import React from 'react';
import { Target, TrendingUp, Phone, ArrowUpRight } from 'lucide-react';
import type { DashboardStats } from '../../types/lead';

interface OutreachGoalCardProps {
  stats: DashboardStats;
  onNavigateToLeads?: () => void;
  onNavigateToQueue?: () => void;
}

export const OutreachGoalCard: React.FC<OutreachGoalCardProps> = ({ stats, onNavigateToLeads, onNavigateToQueue }) => {
  const goalPercent = Math.min(
    100,
    Math.round((stats.todayOutreachCount / (stats.dailyGoal || 20)) * 100)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-sans">
      {/* Today's Outreach Card (No harsh blue-indigo gradient) */}
      <div className="bg-zinc-900 text-white rounded-lg p-4 border border-zinc-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-zinc-800 text-zinc-300">
                <Target className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Today's Target
              </span>
            </div>
            {onNavigateToQueue && (
              <button
                onClick={onNavigateToQueue}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 cursor-pointer transition-colors inline-flex items-center gap-1"
              >
                <span>Queue</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono tabular-nums">{stats.todayOutreachCount}</span>
            <span className="text-zinc-400 text-sm font-mono">/ {stats.dailyGoal}</span>
            <span className="text-[11px] text-zinc-400 ml-auto">leads targeted</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-800 space-y-1.5">
          <div className="flex justify-between text-xs text-zinc-400 font-mono">
            <span>Progress</span>
            <span className="font-bold text-zinc-200 tabular-nums">{goalPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Response Rate Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Engagement Rate
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">Replied / Contacted</span>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">
              {stats.responseRate !== null ? `${stats.responseRate}%` : '--'}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              {stats.contactedLeads > 0
                ? `${stats.repliedLeads} replies from ${stats.contactedLeads} contacted leads`
                : 'Start outreach to calculate engagement rate'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-between font-mono">
          <span>Replied: <strong className="text-zinc-800 dark:text-zinc-200">{stats.repliedLeads}</strong></span>
          <span>Contacted: <strong className="text-zinc-800 dark:text-zinc-200">{stats.contactedLeads}</strong></span>
        </div>
      </div>

      {/* Prime Prospects Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                <Target className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Prime Prospects
              </span>
            </div>
            <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-sm border border-zinc-200 dark:border-zinc-700">
              Tier A & B
            </span>
          </div>

          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tabular-nums text-zinc-900 dark:text-zinc-100">{stats.potentialLeads}</div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              High-reputation prospects with established Google presence
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <Phone className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
            <span>{stats.phoneAvailableCount} verified numbers</span>
          </span>
          {onNavigateToLeads && (
            <button
              onClick={onNavigateToLeads}
              className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline inline-flex items-center gap-0.5"
            >
              <span>View</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
