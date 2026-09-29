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
  Activity,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <BarChart3 className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Business Intelligence & Performance</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Real-time commercial analytics derived from your local pipeline</p>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-md">
          {[
            { id: 'all' as TimeRange, label: 'All Time' },
            { id: 'today' as TimeRange, label: 'Today' },
            { id: '7d' as TimeRange, label: 'Last 7 Days' },
            { id: '30d' as TimeRange, label: 'Last 30 Days' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setTimeRange(r.id)}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-all ${
                timeRange === r.id
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
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
          className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer group"
          title="Click to view all leads"
        >
          <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
            <Users className="w-4 h-4" strokeWidth={1.5} />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-2 block font-mono">{leads.length}</span>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Leads</span>
        </div>

        {/* Contacted */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Contacted' })}
          className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer group"
          title="Click to view contacted leads"
        >
          <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
            <Send className="w-4 h-4" strokeWidth={1.5} />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-2 block font-mono">{funnelSteps[1].count}</span>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Contacted</span>
        </div>

        {/* Replied */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Replied' })}
          className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer group"
          title="Click to view replied leads"
        >
          <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
            <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-2 block font-mono">{funnelSteps[2].count}</span>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Replies</span>
        </div>

        {/* Interested */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Interested' })}
          className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer group"
          title="Click to view interested prospects"
        >
          <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
            <ThumbsUp className="w-4 h-4" strokeWidth={1.5} />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-2 block font-mono">{funnelSteps[3].count}</span>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Interested</span>
        </div>

        {/* Demo Sent */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Demo Sent' })}
          className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer group"
          title="Click to view leads with demo sent"
        >
          <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
            <Eye className="w-4 h-4" strokeWidth={1.5} />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-2 block font-mono">{funnelSteps[4].count}</span>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Demos</span>
        </div>

        {/* Won */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Won' })}
          className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer group"
          title="Click to view won deals"
        >
          <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
            <Trophy className="w-4 h-4" strokeWidth={1.5} />
            <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mt-2 block font-mono">{funnelSteps[5].count}</span>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Won Deals</span>
        </div>

        {/* Won Revenue */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Won' })}
          className="p-3 bg-zinc-900 dark:bg-zinc-800 text-white rounded-lg border border-zinc-800 dark:border-zinc-700 hover:border-zinc-600 transition-colors cursor-pointer group"
          title="Click to filter won deals"
        >
          <div className="flex items-center justify-between text-emerald-400">
            <IndianRupee className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded-sm">Won</span>
          </div>
          <span className="text-lg font-semibold text-white mt-2 block truncate font-mono">
            {formatCurrency(revenue.wonRevenue)}
          </span>
          <span className="text-[11px] font-medium text-zinc-400">Won Revenue</span>
        </div>

        {/* Pipeline Value */}
        <div
          onClick={() => onNavigateToLeads()}
          className="p-3 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors cursor-pointer group"
          title="Active pipeline value"
        >
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <TrendingUp className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded-sm">Active</span>
          </div>
          <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-2 block truncate font-mono">
            {formatCurrency(revenue.pipelineValue)}
          </span>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Pipeline Value</span>
        </div>
      </div>

      {/* Revenue Intelligence Banner */}
      <div className="bg-zinc-900 text-white dark:bg-zinc-900 border border-zinc-800 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-zinc-800 text-zinc-100 flex items-center justify-center font-bold">
              <IndianRupee className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Commercial Revenue & Deal Intelligence</h3>
              <p className="text-[11px] text-zinc-400">Closed revenue, qualified pipeline, and expected transaction sizes</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block">Avg Won Deal</span>
              <span className="text-sm font-semibold text-zinc-100 font-mono">{formatCurrency(revenue.avgWonDeal)}</span>
            </div>
            <div className="h-7 w-px bg-zinc-800" />
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block">Potential Revenue</span>
              <span className="text-sm font-semibold text-zinc-100 font-mono">{formatCurrency(revenue.potentialRevenue)}</span>
            </div>
            <div className="h-7 w-px bg-zinc-800" />
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400 block">Closed Deals</span>
              <span className="text-sm font-semibold text-emerald-300 font-mono">{revenue.dealsWithRevenueCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Sales Funnel & Outreach Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Funnel Visualization (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Sales Conversion Funnel</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Pipeline progression and stage-by-stage drop-off rates</p>
            </div>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md font-mono">
              Overall Win Rate: {safePercentage(funnelSteps[5].count, leads.length)}%
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {funnelSteps.map((step, idx) => {
              const colors = [
                'bg-zinc-300 dark:bg-zinc-700',
                'bg-zinc-400 dark:bg-zinc-600',
                'bg-zinc-500 dark:bg-zinc-500',
                'bg-zinc-600 dark:bg-zinc-400',
                'bg-zinc-700 dark:bg-zinc-300',
                'bg-emerald-600 dark:bg-emerald-500',
              ];
              const barColor = colors[idx] || 'bg-zinc-500';

              return (
                <div key={step.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{step.label}</span>
                      {idx > 0 && (
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                          (↓ {step.conversionFromPrev}% from {funnelSteps[idx - 1].stage})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{step.count}</span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">({step.percentageOfTotal}% of total)</span>
                    </div>
                  </div>

                  {/* Funnel Progress Bar */}
                  <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-xs overflow-hidden">
                    <div
                      className={`h-full rounded-xs ${barColor} transition-all duration-300`}
                      style={{ width: `${Math.max(step.percentageOfTotal, step.count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outreach Activity Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Outreach Activity</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Daily WhatsApp contact attempts logged</p>
            </div>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md">
              <button
                onClick={() => setChartDays(7)}
                className={`text-xs px-2.5 py-1 rounded-sm font-medium transition-all ${
                  chartDays === 7 ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartDays(30)}
                className={`text-xs px-2.5 py-1 rounded-sm font-medium transition-all ${
                  chartDays === 30 ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 block">Today</span>
              <span className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100">{outreach.contactsToday}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 block">This Week</span>
              <span className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100">{outreach.contactsThisWeek}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 block">Avg / Lead</span>
              <span className="text-base font-semibold font-mono text-zinc-900 dark:text-zinc-100">{outreach.avgAttemptsPerLead}</span>
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
                      <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-zinc-900 text-zinc-100 text-[10px] px-2 py-1 rounded shadow-xs whitespace-nowrap z-20">
                        {d.dayLabel}: {d.attempts} attempts
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-xs h-28 flex items-end">
                        <div
                          className="w-full bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 rounded-t-xs transition-all"
                          style={{ height: `${Math.max(heightPercent, d.attempts > 0 ? 8 : 0)}%` }}
                        />
                      </div>

                      {/* Label */}
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate w-full text-center font-mono">
                        {d.dayLabel.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center text-center p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <Clock className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mb-1" strokeWidth={1.5} />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No Outreach Logged in this Window</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Mark leads as contacted to visualize daily outreach velocity
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: Tier Performance & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tier Performance Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Lead Tier Performance</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Analyze how pre-qualified tiers convert through the pipeline</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-medium uppercase text-[10px] tracking-wider">
                  <th className="pb-2">Tier</th>
                  <th className="pb-2 text-center">Leads</th>
                  <th className="pb-2 text-center">Contact %</th>
                  <th className="pb-2 text-center">Reply %</th>
                  <th className="pb-2 text-center">Win %</th>
                  <th className="pb-2 text-right">Won Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {tierPerformance.map((tp) => (
                  <tr
                    key={tp.tier}
                    onClick={() => onNavigateToLeads({ tier: tp.tier as string })}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <TierBadge tier={tp.tier as any} />
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-900 dark:text-zinc-100 transition-opacity" strokeWidth={1.5} />
                    </td>
                    <td className="py-2.5 text-center font-mono text-zinc-700 dark:text-zinc-300">{tp.totalLeads}</td>
                    <td className="py-2.5 text-center font-mono text-zinc-700 dark:text-zinc-300">{tp.contactRate}%</td>
                    <td className="py-2.5 text-center font-mono text-zinc-700 dark:text-zinc-300">{tp.replyRate}%</td>
                    <td className="py-2.5 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">{tp.winRate}%</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(tp.wonRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Performance Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Category Performance</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Best-performing business niches ranked by conversion</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-medium uppercase text-[10px] tracking-wider">
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-center">Leads</th>
                  <th className="pb-2 text-center">Contacted</th>
                  <th className="pb-2 text-center">Replies</th>
                  <th className="pb-2 text-center">Won</th>
                  <th className="pb-2 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {categoryPerformance.slice(0, 6).map((cp) => (
                  <tr
                    key={cp.category}
                    onClick={() => onNavigateToLeads({ category: cp.category })}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-2.5 font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[140px] flex items-center gap-1">
                      <span>{cp.category}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-zinc-900 dark:text-zinc-100 transition-opacity shrink-0" strokeWidth={1.5} />
                    </td>
                    <td className="py-2.5 text-center font-mono text-zinc-700 dark:text-zinc-300">{cp.leads}</td>
                    <td className="py-2.5 text-center font-mono text-zinc-700 dark:text-zinc-300">{cp.contacted}</td>
                    <td className="py-2.5 text-center font-mono text-zinc-700 dark:text-zinc-300">{cp.replied}</td>
                    <td className="py-2.5 text-center font-mono font-semibold text-emerald-600 dark:text-emerald-400">{cp.won}</td>
                    <td className="py-2.5 text-right font-mono font-semibold text-zinc-900 dark:text-zinc-100">
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
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Follow-up Health</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Pipeline hygiene and reminder discipline</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToFollowUps('all')}
              icon={<Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />}
              className="text-xs"
            >
              Open Follow-ups →
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => onNavigateToFollowUps('overdue')}
              className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
            >
              <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 block">Overdue</span>
              <span className="text-xl font-semibold font-mono text-rose-700 dark:text-rose-300 mt-1 block">{followUpHealth.overdue}</span>
            </div>

            <div
              onClick={() => onNavigateToFollowUps('due_today')}
              className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
            >
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 block">Due Today</span>
              <span className="text-xl font-semibold font-mono text-amber-700 dark:text-amber-300 mt-1 block">{followUpHealth.dueToday}</span>
            </div>

            <div
              onClick={() => onNavigateToFollowUps('upcoming')}
              className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
            >
              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block">Upcoming</span>
              <span className="text-xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">{followUpHealth.upcoming}</span>
            </div>

            <div
              onClick={() => onNavigateToLeads({ status: 'Interested' })}
              className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
            >
              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 block">Needs Schedule</span>
              <span className="text-xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">{followUpHealth.totalNeedsScheduling}</span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Pipeline Notice: {followUpHealth.totalNeedsScheduling} leads have engaged (contacted/replied/interested) without an active follow-up date scheduled.
          </p>
        </div>

        {/* Sales Velocity (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Sales Velocity (Cycle Days)</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Average days spent transitioning between pipeline milestones</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center">
              <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-400 dark:text-zinc-500 block">Contact → Reply</span>
              <span className="text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
                {salesVelocity.contactedToRepliedDays !== null ? `${salesVelocity.contactedToRepliedDays}d` : '-'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {salesVelocity.contactedToRepliedDays !== null ? 'Avg days' : 'No data'}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center">
              <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-400 dark:text-zinc-500 block">Reply → Interest</span>
              <span className="text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
                {salesVelocity.repliedToInterestedDays !== null ? `${salesVelocity.repliedToInterestedDays}d` : '-'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {salesVelocity.repliedToInterestedDays !== null ? 'Avg days' : 'No data'}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center">
              <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-400 dark:text-zinc-500 block">Interest → Demo</span>
              <span className="text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
                {salesVelocity.interestedToDemoDays !== null ? `${salesVelocity.interestedToDemoDays}d` : '-'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {salesVelocity.interestedToDemoDays !== null ? 'Avg days' : 'No data'}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center">
              <span className="text-[10px] uppercase font-medium tracking-wider text-zinc-400 dark:text-zinc-500 block">Demo → Won</span>
              <span className="text-lg font-semibold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block">
                {salesVelocity.demoToWonDays !== null ? `${salesVelocity.demoToWonDays}d` : '-'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {salesVelocity.demoToWonDays !== null ? 'Avg days' : 'No data'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            Calculated strictly from real CRM timestamps (contactedAt, repliedAt, demoSentAt, wonAt).
          </p>
        </div>
      </div>

      {/* SECTION 6: Top Opportunities & Recent Sales Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Opportunities (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-zinc-900 dark:text-zinc-100" strokeWidth={1.5} />
              <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Top Opportunities</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Highest-intent active prospects in negotiations or demos</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToLeads()}
              className="text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            >
              All Leads →
            </button>
          </div>

          {topOpportunities.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {topOpportunities.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 rounded-md transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        {lead.businessName}
                      </span>
                      <TierBadge tier={lead.leadTier} score={lead.leadScore} />
                      <StatusBadge status={lead.status} />
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
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
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <Activity className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mx-auto mb-1" strokeWidth={1.5} />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No Active Opportunities in Late Stages</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Prospects marked as Replied, Interested, Demo Sent, or Negotiating will appear here
              </p>
            </div>
          )}
        </div>

        {/* Recent Sales Activity (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 space-y-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Recent Sales Activity</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Live feed of pipeline transitions and touches</p>
          </div>

          {recentActivities.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  onClick={() => {
                    const l = leads.find((x) => x.id === act.leadId);
                    if (l) onSelectLead(l);
                  }}
                  className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200/80 dark:border-zinc-800 flex items-start justify-between gap-2 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{act.businessName}</span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">{act.description}</p>
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0">
                    {new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
              <Clock className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mx-auto mb-1" strokeWidth={1.5} />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No Recent Activity Recorded</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Outreach and milestone activities will appear here</p>
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
