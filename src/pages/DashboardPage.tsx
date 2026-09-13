import React from 'react';
import { Sparkles, UploadCloud, ArrowRight } from 'lucide-react';
import type { Lead, DashboardStats, LeadStatus } from '../types/lead';
import { StatCards } from '../components/dashboard/StatCards';
import { TierDistribution } from '../components/dashboard/TierDistribution';
import { OutreachGoalCard } from '../components/dashboard/OutreachGoalCard';
import { Button } from '../components/ui/Button';
import { TierBadge } from '../components/leads/TierBadge';
import { StatusBadge } from '../components/leads/StatusBadge';
import { LeadDetailPanel } from '../components/leads/LeadDetailPanel';
import { formatPhoneNumber } from '../lib/utils';
import { getRevenueMetrics, formatCurrency } from '../lib/analytics';
import { BarChart3, IndianRupee } from 'lucide-react';

interface DashboardPageProps {
  leads: Lead[];
  stats: DashboardStats;
  onOpenImport: () => void;
  onLoadDemo: () => void;
  onNavigateToLeads: (filterTier?: string) => void;
  onNavigateToQueue: () => void;
  onNavigateToAnalytics?: () => void;
  onOpenNextLead: () => void;
  onSelectLead: (lead: Lead) => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onMarkContacted: (leadId: string) => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  selectedLead: Lead | null;
  onCloseLeadInspector: () => void;
  hasNextLead: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  leads,
  stats,
  onOpenImport,
  onLoadDemo,
  onNavigateToLeads,
  onNavigateToQueue,
  onNavigateToAnalytics,
  onOpenNextLead,
  onSelectLead,
  onMarkContacted,
  onUpdateLead,
  selectedLead,
  onCloseLeadInspector,
  hasNextLead,
}) => {
  const revenue = getRevenueMetrics(leads);
  if (leads.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 text-center space-y-8 animate-in fade-in duration-300">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-100 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Local-First Outreach CRM
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome to LeadFlow 👋
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Turn your lead spreadsheets from Google Maps into an organized, high-efficiency
            outreach command center.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Button
            size="lg"
            variant="primary"
            onClick={onOpenImport}
            icon={<UploadCloud className="w-5 h-5" />}
          >
            Import Excel / CSV Leads
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onLoadDemo}
            icon={<Sparkles className="w-5 h-5 text-amber-500" />}
          >
            Try Demo Data (10 Leads)
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Flexible Spreadsheet Import</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Upload .xlsx, .xls, or .csv files. Handles custom column names, preserves all raw fields,
              and flags duplicate records.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Intelligent Lead Scoring</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Identifies hot leads (🔥 Tier A) using Google rating, review counts, photo counts, and
              verified contact details.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">100% Local & Private</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your business contacts and phone numbers remain strictly inside your browser's local storage.
              No cloud leaks, no tracking.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const topRecentLeads = leads.slice(0, 6);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Stat Summary Grid */}
      <StatCards stats={stats} />

      {/* Needs Attention Section (all 4 conditions: overdue, today, interested without follow-up, replied without follow-up) */}
      {(stats.overdueFollowUpsCount > 0 ||
        stats.todayFollowUpsCount > 0 ||
        stats.interestedWithoutFollowUpCount > 0 ||
        stats.repliedWithoutFollowUpCount > 0) && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-rose-500/10 border-2 border-amber-300/80 dark:border-amber-700/60 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔥</span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Needs Attention</h2>
            </div>
            <button
              onClick={() => onNavigateToLeads()}
              className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
            >
              Open Pipeline →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.overdueFollowUpsCount > 0 && (
              <div className="bg-white/90 dark:bg-slate-800/90 p-3.5 rounded-lg border border-rose-200 dark:border-rose-800/80 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">⚠️ Overdue Follow-ups</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">Scheduled before today</span>
                </div>
                <span className="text-base font-extrabold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2.5 py-1 rounded-full">
                  {stats.overdueFollowUpsCount}
                </span>
              </div>
            )}

            {stats.todayFollowUpsCount > 0 && (
              <div className="bg-white/90 dark:bg-slate-800/90 p-3.5 rounded-lg border border-amber-200 dark:border-amber-800/80 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">⏰ Due Today</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">Follow-up due today</span>
                </div>
                <span className="text-base font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full">
                  {stats.todayFollowUpsCount}
                </span>
              </div>
            )}

            {stats.interestedWithoutFollowUpCount > 0 && (
              <div className="bg-white/90 dark:bg-slate-800/90 p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">⭐ Interested (No Date)</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">Needs follow-up date</span>
                </div>
                <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">
                  {stats.interestedWithoutFollowUpCount}
                </span>
              </div>
            )}

            {stats.repliedWithoutFollowUpCount > 0 && (
              <div className="bg-white/90 dark:bg-slate-800/90 p-3.5 rounded-lg border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 block">💬 Replied (No Date)</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300">Needs follow-up date</span>
                </div>
                <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
                  {stats.repliedWithoutFollowUpCount}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversion Funnel Rates */}
      {stats.totalLeads > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Conversion Funnel & Performance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Pipeline conversion stages from discovery to won deal</p>
            </div>
            {onNavigateToAnalytics && (
              <button
                onClick={onNavigateToAnalytics}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>View Full Analytics →</span>
              </button>
            )}
          </div>

          {(revenue.wonRevenue > 0 || revenue.pipelineValue > 0) && (
            <div className="flex flex-wrap items-center gap-4 pt-1 pb-1 text-xs border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Won Revenue: {formatCurrency(revenue.wonRevenue, revenue.currencySymbol)}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold">
                <span>Active Pipeline: {formatCurrency(revenue.pipelineValue, revenue.currencySymbol)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 text-center">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Contact Rate</span>
              <span className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 block">
                {stats.conversionMetrics.contactRate}%
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Contacted / Total</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 text-center">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Reply Rate</span>
              <span className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-1 block">
                {stats.conversionMetrics.replyRate}%
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Replied / Contacted</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 text-center">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Interest Rate</span>
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 block">
                {stats.conversionMetrics.interestRate}%
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Interested / Replied</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 text-center">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Demo Rate</span>
              <span className="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1 block">
                {stats.conversionMetrics.demoRate}%
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Demo Sent / Interested</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 text-center col-span-2 sm:col-span-1">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">Win Rate</span>
              <span className="text-xl font-bold text-green-700 dark:text-green-400 mt-1 block">
                {stats.conversionMetrics.winRate}%
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Won / Demo Sent</span>
            </div>
          </div>
        </div>
      )}

      {/* Outreach Goals & Response Rate */}
      <OutreachGoalCard
        stats={stats}
        onNavigateToLeads={() => onNavigateToLeads()}
        onNavigateToQueue={onNavigateToQueue}
      />

      {/* Tier Distribution Bar & Cards */}
      <TierDistribution
        counts={stats.tierCounts}
        totalLeads={stats.totalLeads}
        onSelectTier={(tier) => onNavigateToLeads(tier)}
      />

      {/* Quick Recent Leads Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Priority Prospect Spotlight</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing high-priority prospects ready for outreach
            </p>
          </div>
          <button
            onClick={() => onNavigateToLeads()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            <span>View All ({leads.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {topRecentLeads.map((lead, idx) => (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500 w-5 text-right">
                  #{idx + 1}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                    {lead.businessName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{lead.category}</span>
                    <span>•</span>
                    <span>{lead.city}</span>
                    {lead.rating > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">⭐ {lead.rating}</span>
                        <span className="text-slate-400 dark:text-slate-500">({lead.reviews})</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300 block">
                    {formatPhoneNumber(lead.phone)}
                  </span>
                </div>
                <TierBadge tier={lead.leadTier} score={lead.leadScore} showScore />
                <StatusBadge status={lead.status} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-out Lead Detail Panel */}
      <LeadDetailPanel
        lead={selectedLead}
        onClose={onCloseLeadInspector}
        onUpdateLead={onUpdateLead}
        onMarkContacted={onMarkContacted}
        onNextLead={onOpenNextLead}
        hasNextLead={hasNextLead}
      />
    </div>
  );
};
