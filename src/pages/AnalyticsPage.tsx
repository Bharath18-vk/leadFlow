import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Send,
  MessageSquare,
  ThumbsUp,
  Eye,
  Trophy,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  IndianRupee,
} from 'lucide-react';
import type { Lead } from '../types/lead';
import type { TimeRange } from '../types/analytics';
import {
  computeAnalyticsData,
  formatCurrency,
  safePercentage,
} from '../lib/analytics';
import { Button } from '../components/ui/Button';
import { TierBadge } from '../components/leads/TierBadge';
import { StatusBadge } from '../components/leads/StatusBadge';
import { LeadDetailPanel } from '../components/leads/LeadDetailPanel';

interface AnalyticsPageProps {
  leads: Lead[];
  onNavigateToLeads: (filter?: { status?: string; tier?: string; category?: string }) => void;
  onNavigateToFollowUps: (filter?: string) => void;
  onSelectLead: (lead: Lead) => void;
  selectedLead: Lead | null;
  onCloseLeadInspector: () => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  onMarkContacted: (leadId: string) => void;
  hasNextLead: boolean;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  leads,
  onNavigateToLeads,
  onNavigateToFollowUps,
  onSelectLead,
  selectedLead,
  onCloseLeadInspector,
  onUpdateLead,
  onMarkContacted,
  hasNextLead,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [chartDays, setChartDays] = useState<7 | 30>(7);

  // Compute all analytics metrics (memoized for performance)
  const analytics = useMemo(() => {
    return computeAnalyticsData(leads, chartDays === 30 ? '30d' : '7d');
  }, [leads, chartDays]);

  const {
    funnelSteps,
    outreach,
    tierPerformance,
    categoryPerformance,
    revenue,
    followUpHealth,
    salesVelocity,
    topOpportunities,
    recentActivities,
  } = analytics;

  // Max attempts for chart scaling
  const maxAttempts = useMemo(() => {
    const counts = outreach.dailyTrend.map((d) => d.attempts);
    return Math.max(...counts, 1);
  }, [outreach.dailyTrend]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Header Controls & Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Business Intelligence & Performance</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time commercial analytics derived from your local pipeline</p>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {[
            { id: 'all' as TimeRange, label: 'All Time' },
            { id: 'today' as TimeRange, label: 'Today' },
            { id: '7d' as TimeRange, label: 'Last 7 Days' },
            { id: '30d' as TimeRange, label: 'Last 30 Days' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                timeRange === r.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: Top KPI Summary Cards (Clickable Drilldown) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Leads */}
        <div
          onClick={() => onNavigateToLeads()}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer group"
          title="Click to view all leads"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            <Users className="w-4 h-4" />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2 block">{leads.length}</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Leads</span>
        </div>

        {/* Contacted */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Contacted' })}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-sm transition-all cursor-pointer group"
          title="Click to view contacted leads"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400">
            <Send className="w-4 h-4" />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-black text-purple-700 dark:text-purple-400 mt-2 block">{funnelSteps[1].count}</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Contacted</span>
        </div>

        {/* Replied */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Replied' })}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm transition-all cursor-pointer group"
          title="Click to view replied leads"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 group-hover:text-amber-600 dark:group-hover:text-amber-400">
            <MessageSquare className="w-4 h-4" />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-2 block">{funnelSteps[2].count}</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Replies</span>
        </div>

        {/* Interested */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Interested' })}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-sm transition-all cursor-pointer group"
          title="Click to view interested prospects"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
            <ThumbsUp className="w-4 h-4" />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2 block">{funnelSteps[3].count}</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Interested</span>
        </div>

        {/* Demo Sent */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Demo Sent' })}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all cursor-pointer group"
          title="Click to view leads with demo sent"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            <Eye className="w-4 h-4" />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-2 block">{funnelSteps[4].count}</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Demos</span>
        </div>

        {/* Won */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Won' })}
          className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-green-400 dark:hover:border-green-500 hover:shadow-sm transition-all cursor-pointer group"
          title="Click to view won deals"
        >
          <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 group-hover:text-green-600 dark:group-hover:text-green-400">
            <Trophy className="w-4 h-4" />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-2xl font-black text-green-700 dark:text-green-400 mt-2 block">{funnelSteps[5].count}</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Won Deals</span>
        </div>

        {/* Won Revenue */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Won' })}
          className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-all cursor-pointer group"
          title="Click to filter won deals"
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <IndianRupee className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">Won</span>
          </div>
          <span className="text-xl font-black text-emerald-900 dark:text-emerald-200 mt-2 block truncate">
            {formatCurrency(revenue.wonRevenue)}
          </span>
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">Won Revenue</span>
        </div>

        {/* Pipeline Value */}
        <div
          onClick={() => onNavigateToLeads()}
          className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
          title="Active pipeline value"
        >
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded">Active</span>
          </div>
          <span className="text-xl font-black text-blue-900 dark:text-blue-200 mt-2 block truncate">
            {formatCurrency(revenue.pipelineValue)}
          </span>
          <span className="text-[11px] font-semibold text-blue-800 dark:text-blue-300">Pipeline Value</span>
        </div>
      </div>

      {/* Revenue Intelligence Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-blue-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200">Commercial Revenue & Deal Intelligence</h3>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300">Closed revenue, qualified pipeline, and expected transaction sizes</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block">Avg Won Deal</span>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100">{formatCurrency(revenue.avgWonDeal)}</span>
            </div>
            <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400 block">Potential Revenue</span>
              <span className="text-sm font-black text-slate-900 dark:text-slate-100">{formatCurrency(revenue.potentialRevenue)}</span>
            </div>
            <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
            <div>
              <span className="text-[10px] font-semibold uppercase text-emerald-700 dark:text-emerald-400 block">Closed Deals</span>
              <span className="text-sm font-black text-emerald-900 dark:text-emerald-200">{revenue.dealsWithRevenueCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Sales Funnel & Outreach Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Funnel Visualization (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Sales Conversion Funnel</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pipeline progression and stage-by-stage drop-off rates</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              Overall Win Rate: {safePercentage(funnelSteps[5].count, leads.length)}%
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {funnelSteps.map((step, idx) => {
              const colors = [
                'bg-slate-700 dark:bg-slate-600 text-white',
                'bg-purple-600 text-white',
                'bg-amber-500 text-white',
                'bg-emerald-600 text-white',
                'bg-indigo-600 text-white',
                'bg-green-600 text-white',
              ];
              const barColor = colors[idx] || 'bg-blue-600 text-white';

              return (
                <div key={step.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{step.label}</span>
                      {idx > 0 && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          (↓ {step.conversionFromPrev}% from {funnelSteps[idx - 1].stage})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{step.count}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">({step.percentageOfTotal}% of total)</span>
                    </div>
                  </div>

                  {/* Funnel Progress Bar */}
                  <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all duration-500`}
                      style={{ width: `${Math.max(step.percentageOfTotal, step.count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outreach Activity Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Outreach Activity</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily WhatsApp contact attempts logged</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setChartDays(7)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartDays === 7 ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartDays(30)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                  chartDays === 30 ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center py-1 border-y border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 block">Today</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">{outreach.contactsToday}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 block">This Week</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">{outreach.contactsThisWeek}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 dark:text-slate-500 block">Avg / Lead</span>
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">{outreach.avgAttemptsPerLead}</span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          {outreach.dailyTrend.some((d) => d.attempts > 0) ? (
            <div className="pt-3">
              <div className="flex items-end justify-between gap-1.5 h-36">
                {outreach.dailyTrend.map((d) => {
                  const heightPercent = Math.round((d.attempts / maxAttempts) * 100);

                  return (
                    <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      {/* Tooltip */}
                      <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-900 dark:bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md whitespace-nowrap z-20">
                        {d.dayLabel}: {d.attempts} attempts
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-sm h-28 flex items-end">
                        <div
                          className="w-full bg-blue-600 group-hover:bg-blue-700 dark:bg-blue-500 dark:group-hover:bg-blue-400 rounded-t-sm transition-all"
                          style={{ height: `${Math.max(heightPercent, d.attempts > 0 ? 8 : 0)}%` }}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full text-center">
                        {d.dayLabel.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <Clock className="w-6 h-6 text-slate-400 dark:text-slate-500 mb-1" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Outreach Logged in this Window</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Mark leads as contacted to visualize daily outreach velocity
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: Tier Performance & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Performance Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Lead Tier Performance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Analyze how pre-qualified tiers convert through the pipeline</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="pb-2">Tier</th>
                  <th className="pb-2 text-center">Leads</th>
                  <th className="pb-2 text-center">Contact %</th>
                  <th className="pb-2 text-center">Reply %</th>
                  <th className="pb-2 text-center">Win %</th>
                  <th className="pb-2 text-right">Won Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tierPerformance.map((tp) => (
                  <tr
                    key={tp.tier}
                    onClick={() => onNavigateToLeads({ tier: tp.tier as string })}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <TierBadge tier={tp.tier as any} />
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-600 dark:text-blue-400 transition-opacity" />
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-700 dark:text-slate-300">{tp.totalLeads}</td>
                    <td className="py-2.5 text-center font-mono font-medium text-purple-700 dark:text-purple-400">{tp.contactRate}%</td>
                    <td className="py-2.5 text-center font-mono font-medium text-amber-700 dark:text-amber-400">{tp.replyRate}%</td>
                    <td className="py-2.5 text-center font-mono font-bold text-green-700 dark:text-green-400">{tp.winRate}%</td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {formatCurrency(tp.wonRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Performance Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Category Performance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Best-performing business niches ranked by conversion</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-center">Leads</th>
                  <th className="pb-2 text-center">Contacted</th>
                  <th className="pb-2 text-center">Replies</th>
                  <th className="pb-2 text-center">Won</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categoryPerformance.slice(0, 6).map((cp) => (
                  <tr
                    key={cp.category}
                    onClick={() => onNavigateToLeads({ category: cp.category })}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px] flex items-center gap-1">
                      <span>{cp.category}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-600 dark:text-blue-400 transition-opacity shrink-0" />
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-700 dark:text-slate-300">{cp.leads}</td>
                    <td className="py-2.5 text-center font-mono text-purple-700 dark:text-purple-400">{cp.contacted}</td>
                    <td className="py-2.5 text-center font-mono text-amber-700 dark:text-amber-400">{cp.replied}</td>
                    <td className="py-2.5 text-center font-mono font-bold text-green-700 dark:text-green-400">{cp.won}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-emerald-800 dark:text-emerald-400">
                      {formatCurrency(cp.wonRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION 5: Follow-up Health & Sales Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Follow-up Health (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Follow-up Health</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pipeline hygiene and reminder discipline</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToFollowUps('all')}
              icon={<Calendar className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Open Follow-ups →
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => onNavigateToFollowUps('overdue')}
              className="p-3 bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl cursor-pointer hover:border-rose-400 dark:hover:border-rose-600 transition-all"
            >
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block">Overdue</span>
              <span className="text-2xl font-black text-rose-800 dark:text-rose-300 mt-1 block">{followUpHealth.overdue}</span>
            </div>

            <div
              onClick={() => onNavigateToFollowUps('due_today')}
              className="p-3 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl cursor-pointer hover:border-amber-400 dark:hover:border-amber-600 transition-all"
            >
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">Due Today</span>
              <span className="text-2xl font-black text-amber-800 dark:text-amber-300 mt-1 block">{followUpHealth.dueToday}</span>
            </div>

            <div
              onClick={() => onNavigateToFollowUps('upcoming')}
              className="p-3 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition-all"
            >
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block">Upcoming</span>
              <span className="text-2xl font-black text-blue-800 dark:text-blue-300 mt-1 block">{followUpHealth.upcoming}</span>
            </div>

            <div
              onClick={() => onNavigateToLeads({ status: 'Interested' })}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-all"
            >
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">Needs Schedule</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-1 block">{followUpHealth.totalNeedsScheduling}</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            💡 {followUpHealth.totalNeedsScheduling} leads have engaged (contacted/replied/interested) without an active follow-up date scheduled.
          </p>
        </div>

        {/* Sales Velocity (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Sales Velocity (Cycle Days)</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Average days spent transitioning between pipeline milestones</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Contact → Reply</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-200 mt-1 block">
                {salesVelocity.contactedToRepliedDays !== null ? `${salesVelocity.contactedToRepliedDays}d` : '—'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {salesVelocity.contactedToRepliedDays !== null ? 'Avg days' : 'Not enough data'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Reply → Interest</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-200 mt-1 block">
                {salesVelocity.repliedToInterestedDays !== null ? `${salesVelocity.repliedToInterestedDays}d` : '—'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {salesVelocity.repliedToInterestedDays !== null ? 'Avg days' : 'Not enough data'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Interest → Demo</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-200 mt-1 block">
                {salesVelocity.interestedToDemoDays !== null ? `${salesVelocity.interestedToDemoDays}d` : '—'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {salesVelocity.interestedToDemoDays !== null ? 'Avg days' : 'Not enough data'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Demo → Won</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-200 mt-1 block">
                {salesVelocity.demoToWonDays !== null ? `${salesVelocity.demoToWonDays}d` : '—'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {salesVelocity.demoToWonDays !== null ? 'Avg days' : 'Not enough data'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Calculated strictly from real CRM timestamps (`contactedAt`, `repliedAt`, `demoSentAt`, `wonAt`).
          </p>
        </div>
      </div>

      {/* SECTION 6: Top Opportunities & Recent Sales Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Opportunities (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🏆</span>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Top Opportunities</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Highest-intent active prospects in negotiations or demos</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToLeads()}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              All Leads →
            </button>
          </div>

          {topOpportunities.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topOpportunities.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {lead.businessName}
                      </span>
                      <TierBadge tier={lead.leadTier} score={lead.leadScore} />
                      <StatusBadge status={lead.status} />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {lead.category} • {lead.city}
                      {lead.dealValue ? ` • Deal Value: ${formatCurrency(lead.dealValue)}` : ''}
                      {lead.quotedAmount && !lead.dealValue ? ` • Quoted: ${formatCurrency(lead.quotedAmount)}` : ''}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLead(lead);
                    }}
                    className="text-xs shrink-0"
                  >
                    Inspect
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <Sparkles className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Active Opportunities in Late Stages</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Prospects marked as Replied, Interested, Demo Sent, or Negotiating will appear here
              </p>
            </div>
          )}
        </div>

        {/* Recent Sales Activity (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Recent Sales Activity</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Live feed of pipeline transitions and touches</p>
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => {
                    const l = leads.find((x) => x.id === act.leadId);
                    if (l) onSelectLead(l);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-2 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{act.businessName}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{act.description}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                    {new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
              <Clock className="w-6 h-6 text-slate-400 dark:text-slate-500 mx-auto mb-1" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Recent Activity Recorded</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Outreach and milestone activities will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Lead Detail Panel if opened from Analytics */}
      <LeadDetailPanel
        lead={selectedLead}
        onClose={onCloseLeadInspector}
        onUpdateLead={onUpdateLead}
        onMarkContacted={onMarkContacted}
        onNextLead={() => {}}
        hasNextLead={hasNextLead}
      />
    </div>
  );
};
