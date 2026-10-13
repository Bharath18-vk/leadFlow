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
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ChevronRight,
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans animate-in fade-in duration-300">
      {/* Top Header Controls & Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 flex items-center justify-center border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" strokeWidth={1.75} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Business Intelligence & Performance
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Commercial conversion analytics, deal tracking, and daily outreach velocity
            </p>
          </div>
        </div>

        {/* Tactile Segmented Time Range Selector */}
        <div className="flex items-center bg-zinc-100/90 dark:bg-zinc-800/90 p-1 rounded-lg border border-zinc-200/70 dark:border-zinc-700/70 shadow-xs">
          {[
            { id: 'all' as TimeRange, label: 'All Time' },
            { id: 'today' as TimeRange, label: 'Today' },
            { id: '7d' as TimeRange, label: 'Last 7 Days' },
            { id: '30d' as TimeRange, label: 'Last 30 Days' },
          ].map((r) => {
            const isActive = timeRange === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setTimeRange(r.id)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs border border-zinc-200/60 dark:border-zinc-700/80 scale-[1.02]'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: Top KPI Summary Cards (Clickable Drilldown) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Leads */}
        <div
          onClick={() => onNavigateToLeads()}
          className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 shadow-xs cursor-pointer group flex flex-col justify-between"
          title="Click to view all leads"
        >
          <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500">
            <div className="w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" strokeWidth={1.75} />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-zinc-700 dark:text-zinc-300" strokeWidth={1.75} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 block tabular-nums">
              {leads.length}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Total Leads
            </span>
          </div>
        </div>

        {/* Contacted */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Contacted' })}
          className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 shadow-xs cursor-pointer group flex flex-col justify-between"
          title="Click to view contacted leads"
        >
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200/60 dark:border-violet-800/40">
              <Send className="w-3.5 h-3.5" strokeWidth={1.75} />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-violet-600 dark:text-violet-400" strokeWidth={1.75} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 block tabular-nums">
              {funnelSteps[1].count}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Contacted
            </span>
          </div>
        </div>

        {/* Replied */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Replied' })}
          className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 shadow-xs cursor-pointer group flex flex-col justify-between"
          title="Click to view replied leads"
        >
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/60 dark:border-sky-800/40">
              <MessageSquare className="w-3.5 h-3.5" strokeWidth={1.75} />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-sky-600 dark:text-sky-400" strokeWidth={1.75} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 block tabular-nums">
              {funnelSteps[2].count}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Replies
            </span>
          </div>
        </div>

        {/* Interested */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Interested' })}
          className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 shadow-xs cursor-pointer group flex flex-col justify-between"
          title="Click to view interested prospects"
        >
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/40">
              <ThumbsUp className="w-3.5 h-3.5" strokeWidth={1.75} />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-teal-600 dark:text-teal-400" strokeWidth={1.75} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 block tabular-nums">
              {funnelSteps[3].count}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Interested
            </span>
          </div>
        </div>

        {/* Demo Sent */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Demo Sent' })}
          className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 shadow-xs cursor-pointer group flex flex-col justify-between"
          title="Click to view leads with demo sent"
        >
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-md bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200/60 dark:border-cyan-800/40">
              <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900 dark:text-zinc-100 block tabular-nums">
              {funnelSteps[4].count}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Demos
            </span>
          </div>
        </div>

        {/* Won */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Won' })}
          className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all duration-200 hover:-translate-y-0.5 shadow-xs cursor-pointer group flex flex-col justify-between"
          title="Click to view won deals"
        >
          <div className="flex items-center justify-between">
            <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/40">
              <Trophy className="w-3.5 h-3.5" strokeWidth={1.75} />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
          </div>
          <div className="mt-2.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 block tabular-nums">
              {funnelSteps[5].count}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Won Deals
            </span>
          </div>
        </div>

        {/* Won Revenue (Elevated Dark Executive Card) */}
        <div
          onClick={() => onNavigateToLeads({ status: 'Won' })}
          className="relative overflow-hidden p-3.5 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-xl border border-zinc-800/90 hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 shadow-sm cursor-pointer group flex flex-col justify-between"
          title="Click to filter won deals"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          <div className="flex items-center justify-between text-emerald-400">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5" strokeWidth={1.75} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-950/90 text-emerald-300 px-1.5 py-0.5 rounded-sm border border-emerald-800/50">
              Won
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-lg font-bold text-white block truncate font-mono tabular-nums">
              {formatCurrency(revenue.wonRevenue)}
            </span>
            <span className="text-[11px] font-medium text-zinc-400 block mt-0.5">
              Won Revenue
            </span>
          </div>
        </div>

        {/* Pipeline Value */}
        <div
          onClick={() => onNavigateToLeads()}
          className="p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 shadow-xs cursor-pointer group flex flex-col justify-between"
          title="Active pipeline value"
        >
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/40">
              <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.75} />
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded-sm">
              Active
            </span>
          </div>
          <div className="mt-2.5">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 block truncate font-mono tabular-nums">
              {formatCurrency(revenue.pipelineValue)}
            </span>
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block mt-0.5">
              Pipeline Value
            </span>
          </div>
        </div>
      </div>

      {/* Revenue Intelligence Financial Strip */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 text-white border border-zinc-800/90 rounded-xl p-5 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-blue-500/40" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800/90 border border-zinc-700/80 text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <IndianRupee className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  Commercial Revenue & Deal Intelligence
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                  INR Base
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Qualified pipeline values, closed deal tracking, and contract milestones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-right">
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block">
                Avg Won Deal
              </span>
              <span className="text-sm font-bold text-zinc-100 font-mono tabular-nums">
                {formatCurrency(revenue.avgWonDeal)}
              </span>
            </div>
            <div className="h-7 w-px bg-zinc-800" />
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 block">
                Potential Revenue
              </span>
              <span className="text-sm font-bold text-zinc-100 font-mono tabular-nums">
                {formatCurrency(revenue.potentialRevenue)}
              </span>
            </div>
            <div className="h-7 w-px bg-zinc-800" />
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-400 block">
                Closed Deals
              </span>
              <span className="text-sm font-bold text-emerald-300 font-mono tabular-nums">
                {revenue.dealsWithRevenueCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Sales Funnel & Outreach Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Funnel Visualization (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Sales Conversion Funnel
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Pipeline progression and stage-by-stage drop-off rates
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 px-3 py-1 rounded-full font-mono">
              <Trophy className="w-3 h-3" />
              Overall Win Rate: {safePercentage(funnelSteps[5].count, leads.length)}%
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {funnelSteps.map((step, idx) => {
              const gradients = [
                'bg-gradient-to-r from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-600',
                'bg-gradient-to-r from-violet-500 to-purple-500',
                'bg-gradient-to-r from-sky-500 to-blue-500',
                'bg-gradient-to-r from-teal-500 to-emerald-500',
                'bg-gradient-to-r from-cyan-500 to-blue-500',
                'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.35)]',
              ];
              const barGradient = gradients[idx] || 'bg-zinc-500';

              return (
                <div key={step.stage} className="p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono font-bold flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {step.label}
                      </span>
                      {idx > 0 && (
                        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                          (↓ {step.conversionFromPrev}% from {funnelSteps[idx - 1].stage})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {step.count}
                      </span>
                      <span className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                        ({step.percentageOfTotal}% of total)
                      </span>
                    </div>
                  </div>

                  {/* Funnel Progress Bar with Smooth Gradient Fill */}
                  <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/50 dark:border-zinc-800/80">
                    <div
                      className={`h-full rounded-full ${barGradient} transition-all duration-700 ease-out`}
                      style={{ width: `${Math.max(step.percentageOfTotal, step.count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Outreach Activity Bar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Outreach Activity
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Daily WhatsApp contact attempts logged
              </p>
            </div>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
              <button
                onClick={() => setChartDays(7)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  chartDays === 7
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs border border-zinc-200/50 dark:border-zinc-700/80'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartDays(30)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                  chartDays === 30
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold shadow-xs border border-zinc-200/50 dark:border-zinc-700/80'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                30 Days
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center py-2.5 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60">
            <div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">Today</span>
              <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                {outreach.contactsToday}
              </span>
            </div>
            <div className="border-x border-zinc-200 dark:border-zinc-700/60">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">This Week</span>
              <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                {outreach.contactsThisWeek}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">Avg / Lead</span>
              <span className="text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                {outreach.avgAttemptsPerLead}
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization with Hover Tooltips */}
          {outreach.dailyTrend.some((d) => d.attempts > 0) ? (
            <div className="pt-2">
              <div className="flex items-end justify-between gap-1.5 h-36 px-1">
                {outreach.dailyTrend.map((d) => {
                  const heightPercent = Math.round((d.attempts / maxAttempts) * 100);

                  return (
                    <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      {/* Floating Tooltip */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[10px] px-2.5 py-1 rounded-md shadow-md whitespace-nowrap z-20 font-mono font-medium">
                        {d.dayLabel}: {d.attempts} attempts
                      </div>

                      {/* Bar Track & Fill with Gradient */}
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-md h-28 flex items-end overflow-hidden p-0.5">
                        <div
                          className="w-full bg-gradient-to-t from-zinc-700 to-zinc-900 dark:from-zinc-300 dark:to-zinc-100 group-hover:from-emerald-600 group-hover:to-teal-400 rounded-t-sm transition-all duration-500"
                          style={{ height: `${Math.max(heightPercent, d.attempts > 0 ? 8 : 0)}%` }}
                        />
                      </div>

                      {/* Date Label */}
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate w-full text-center font-mono">
                        {d.dayLabel.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-36 flex flex-col items-center justify-center text-center p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <Clock className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mb-1" strokeWidth={1.5} />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                No Outreach Logged in this Window
              </p>
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
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Lead Tier Performance
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Analyze how pre-qualified tiers convert through the pipeline
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-medium uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5 font-semibold">Tier</th>
                  <th className="pb-2.5 text-center font-semibold">Leads</th>
                  <th className="pb-2.5 text-center font-semibold">Contact %</th>
                  <th className="pb-2.5 text-center font-semibold">Reply %</th>
                  <th className="pb-2.5 text-center font-semibold">Win %</th>
                  <th className="pb-2.5 text-right font-semibold">Won Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {tierPerformance.map((tp) => (
                  <tr
                    key={tp.tier}
                    onClick={() => onNavigateToLeads({ tier: tp.tier as string })}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <TierBadge tier={tp.tier as any} />
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-zinc-900 dark:text-zinc-100 transition-all" strokeWidth={1.75} />
                    </td>
                    <td className="py-3 text-center font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {tp.totalLeads}
                    </td>
                    <td className="py-3 text-center font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {tp.contactRate}%
                    </td>
                    <td className="py-3 text-center font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {tp.replyRate}%
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {tp.winRate}%
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {formatCurrency(tp.wonRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Performance Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Category Performance
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Best-performing business niches ranked by conversion
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 font-medium uppercase text-[10px] tracking-wider">
                  <th className="pb-2.5 font-semibold">Category</th>
                  <th className="pb-2.5 text-center font-semibold">Leads</th>
                  <th className="pb-2.5 text-center font-semibold">Contacted</th>
                  <th className="pb-2.5 text-center font-semibold">Replies</th>
                  <th className="pb-2.5 text-center font-semibold">Won</th>
                  <th className="pb-2.5 text-right font-semibold">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                {categoryPerformance.slice(0, 6).map((cp, idx) => (
                  <tr
                    key={cp.category}
                    onClick={() => onNavigateToLeads({ category: cp.category })}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[140px] flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded text-[10px] font-mono text-zinc-400 dark:text-zinc-500 flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="truncate">{cp.category}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-zinc-900 dark:text-zinc-100 transition-all shrink-0" strokeWidth={1.75} />
                    </td>
                    <td className="py-3 text-center font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {cp.leads}
                    </td>
                    <td className="py-3 text-center font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {cp.contacted}
                    </td>
                    <td className="py-3 text-center font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {cp.replied}
                    </td>
                    <td className="py-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {cp.won}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
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
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Follow-up Health
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Pipeline hygiene and reminder discipline
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateToFollowUps('all')}
              icon={<Calendar className="w-3.5 h-3.5" strokeWidth={1.75} />}
              className="text-xs"
            >
              Open Follow-ups →
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div
              onClick={() => onNavigateToFollowUps('overdue')}
              className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 rounded-xl cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-all hover:-translate-y-0.5 group"
            >
              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
                <span>Overdue</span>
                <AlertTriangle className="w-3 h-3" />
              </span>
              <span className="text-2xl font-bold font-mono text-rose-700 dark:text-rose-300 mt-1.5 block tabular-nums">
                {followUpHealth.overdue}
              </span>
            </div>

            <div
              onClick={() => onNavigateToFollowUps('due_today')}
              className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 rounded-xl cursor-pointer hover:border-amber-300 dark:hover:border-amber-700 transition-all hover:-translate-y-0.5 group"
            >
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
                <span>Due Today</span>
                <Clock className="w-3 h-3" />
              </span>
              <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300 mt-1.5 block tabular-nums">
                {followUpHealth.dueToday}
              </span>
            </div>

            <div
              onClick={() => onNavigateToFollowUps('upcoming')}
              className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-all hover:-translate-y-0.5 group"
            >
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                <span>Upcoming</span>
                <Calendar className="w-3 h-3" />
              </span>
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1.5 block tabular-nums">
                {followUpHealth.upcoming}
              </span>
            </div>

            <div
              onClick={() => onNavigateToLeads({ status: 'Interested' })}
              className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-all hover:-translate-y-0.5 group"
            >
              <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                <span>Needs Sched</span>
                <Flame className="w-3 h-3 text-amber-500" />
              </span>
              <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1.5 block tabular-nums">
                {followUpHealth.totalNeedsScheduling}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800/60 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            <span>
              Pipeline Notice: <strong>{followUpHealth.totalNeedsScheduling} leads</strong> have engaged without an active follow-up scheduled.
            </span>
          </div>
        </div>

        {/* Sales Velocity (6 cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-4 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Sales Velocity (Cycle Days)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Average duration spent transitioning between pipeline milestones
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Contact → Reply
              </span>
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block tabular-nums">
                {salesVelocity.contactedToRepliedDays !== null ? `${salesVelocity.contactedToRepliedDays}d` : '-'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {salesVelocity.contactedToRepliedDays !== null ? 'Avg days' : 'No data'}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Reply → Interest
              </span>
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block tabular-nums">
                {salesVelocity.repliedToInterestedDays !== null ? `${salesVelocity.repliedToInterestedDays}d` : '-'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {salesVelocity.repliedToInterestedDays !== null ? 'Avg days' : 'No data'}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Interest → Demo
              </span>
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block tabular-nums">
                {salesVelocity.interestedToDemoDays !== null ? `${salesVelocity.interestedToDemoDays}d` : '-'}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {salesVelocity.interestedToDemoDays !== null ? 'Avg days' : 'No data'}
              </span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 rounded-xl text-center">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 block">
                Demo → Won
              </span>
              <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block tabular-nums">
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
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/40">
                <Trophy className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Top Opportunities
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Highest-intent active prospects in negotiations or demos
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateToLeads()}
              className="text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <span>All Leads</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {topOpportunities.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
              {topOpportunities.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2.5 rounded-lg transition-colors cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {lead.businessName}
                      </span>
                      <TierBadge tier={lead.leadTier} score={lead.leadScore} />
                      <StatusBadge status={lead.status} />
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 truncate">
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
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <Activity className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mx-auto mb-1" strokeWidth={1.5} />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                No Active Opportunities in Late Stages
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Prospects marked as Replied, Interested, Demo Sent, or Negotiating will appear here
              </p>
            </div>
          )}
        </div>

        {/* Recent Sales Activity (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 p-5 space-y-4 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Recent Sales Activity
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Live feed of pipeline transitions and touches
            </p>
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
                  className="p-3 rounded-lg bg-zinc-50/70 dark:bg-zinc-800/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 transition-colors border border-zinc-200/70 dark:border-zinc-800/80 flex items-start justify-between gap-2.5 cursor-pointer group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {act.businessName}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                      {act.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0 mt-0.5">
                    {new Date(act.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <Clock className="w-5 h-5 text-zinc-400 dark:text-zinc-500 mx-auto mb-1" strokeWidth={1.5} />
              <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                No Recent Activity Recorded
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Outreach and milestone activities will appear here
              </p>
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
