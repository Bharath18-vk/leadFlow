import React from 'react';
import { Target, TrendingUp, PhoneCall, Zap } from 'lucide-react';
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Today's Outreach Card */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/15 text-white">
                <Target className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
                Today's Outreach
              </span>
            </div>
            {onNavigateToQueue && (
              <button
                onClick={onNavigateToQueue}
                className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
              >
                Open Queue →
              </button>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold">{stats.todayOutreachCount}</span>
            <span className="text-blue-200 text-lg font-medium">/ {stats.dailyGoal}</span>
            <span className="text-xs text-blue-200 ml-auto">leads targeted</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/15 space-y-1.5">
          <div className="flex justify-between text-xs text-blue-100">
            <span>Progress</span>
            <span className="font-bold">{goalPercent}%</span>
          </div>
          <div className="h-2 w-full bg-blue-900/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Response Rate Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Response Rate
              </span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Replied / Contacted</span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {stats.responseRate !== null ? `${stats.responseRate}%` : '--'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.contactedLeads > 0
                ? `${stats.repliedLeads} replies from ${stats.contactedLeads} contacted leads`
                : 'Start outreach to calculate engagement rate'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Replied: <strong className="text-slate-800 dark:text-slate-200">{stats.repliedLeads}</strong></span>
          <span>Contacted: <strong className="text-slate-800 dark:text-slate-200">{stats.contactedLeads}</strong></span>
        </div>
      </div>

      {/* Potential High-Value Leads Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Prime Prospects
              </span>
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              Hot & Good
            </span>
          </div>

          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.potentialLeads}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tier A & B businesses with established Google presence and photos
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{stats.phoneAvailableCount} with phone</span>
          </span>
          {onNavigateToLeads && (
            <button
              onClick={onNavigateToLeads}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              View in Leads →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
