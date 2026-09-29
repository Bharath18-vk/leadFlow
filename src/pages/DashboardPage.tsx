import React from 'react';
import { UploadCloud, ArrowRight, Layers, AlertCircle } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto py-12 px-6 text-center space-y-8 animate-in fade-in duration-200 font-sans">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700">
            <Layers className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
            <span>Local-First Sales Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            LeadFlow Workspace
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Ingest spreadsheet leads from Google Maps or scrapers into an organized, local-first outreach console.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={onOpenImport}
            icon={<UploadCloud className="w-4 h-4" strokeWidth={1.5} />}
          >
            Import Excel or CSV
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onLoadDemo}
            icon={<Layers className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />}
          >
            Load Sample Dataset
          </Button>
        </div>

        {/* Asymmetrical Architectural Onboarding Grid (No 3-feature row cliche) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-6 text-left">
          <div className="md:col-span-7 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">
              Data Pipeline
            </span>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Spreadsheet Ingestion & Merge</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Upload .xlsx or .csv prospect workbooks. Re-imports preserve your notes, contact counts, deal values, and custom message revisions losslessly.
            </p>
          </div>

          <div className="md:col-span-5 p-5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 space-y-2">
            <span className="text-[11px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-semibold tracking-wider">
              Privacy Architecture
            </span>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Zero External Telemetry</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Your prospects, phone numbers, and communications remain strictly within your browser sandbox. No third-party data tracking.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const topRecentLeads = leads.slice(0, 6);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Stat Summary Grid */}
      <StatCards stats={stats} />

      {/* Needs Attention Section (No harsh gradients, no emojis) */}
      {(stats.overdueFollowUpsCount > 0 ||
        stats.todayFollowUpsCount > 0 ||
        stats.interestedWithoutFollowUpCount > 0 ||
        stats.repliedWithoutFollowUpCount > 0) && (
        <div className="bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Requires Attention</h2>
            </div>
            <button
              onClick={() => onNavigateToLeads()}
              className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline inline-flex items-center gap-1"
            >
              <span>View Pipeline</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.overdueFollowUpsCount > 0 && (
              <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-md border border-rose-200 dark:border-rose-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 block">Overdue Follow-ups</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Scheduled before today</span>
                </div>
                <span className="text-sm font-bold font-mono text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-sm bg-rose-50 dark:bg-rose-950/60 tabular-nums">
                  {stats.overdueFollowUpsCount}
                </span>
              </div>
            )}

            {stats.todayFollowUpsCount > 0 && (
              <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-md border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block">Due Today</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Follow-up scheduled today</span>
                </div>
                <span className="text-sm font-bold font-mono text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-sm bg-amber-50 dark:bg-amber-950/60 tabular-nums">
                  {stats.todayFollowUpsCount}
                </span>
              </div>
            )}

            {stats.interestedWithoutFollowUpCount > 0 && (
              <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-md border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block">Interested Prospects</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Needs follow-up date</span>
                </div>
                <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-sm bg-emerald-50 dark:bg-emerald-950/60 tabular-nums">
                  {stats.interestedWithoutFollowUpCount}
                </span>
              </div>
            )}

            {stats.repliedWithoutFollowUpCount > 0 && (
              <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-md border border-zinc-300 dark:border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">Unscheduled Replies</span>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Needs follow-up scheduling</span>
                </div>
                <span className="text-sm font-bold font-mono text-zinc-800 dark:text-zinc-200 px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 tabular-nums">
                  {stats.repliedWithoutFollowUpCount}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conversion Funnel Rates */}
      {stats.totalLeads > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Conversion Funnel</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Pipeline conversion stages from discovery to won deal</p>
            </div>
            {onNavigateToAnalytics && (
              <button
                onClick={onNavigateToAnalytics}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Full Analytics</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {(revenue.wonRevenue > 0 || revenue.pipelineValue > 0) && (
            <div className="flex flex-wrap items-center gap-4 pt-1 pb-1 text-xs border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                <IndianRupee className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Won Revenue: {formatCurrency(revenue.wonRevenue, revenue.currencySymbol)}</span>
              </div>
              <span className="text-zinc-300 dark:text-zinc-700">/</span>
              <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-semibold font-mono">
                <span>Active Pipeline: {formatCurrency(revenue.pipelineValue, revenue.currencySymbol)}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Contact Rate</span>
              <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block tabular-nums">
                {stats.conversionMetrics.contactRate}%
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Contacted / Total</span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Reply Rate</span>
              <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block tabular-nums">
                {stats.conversionMetrics.replyRate}%
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Replied / Contacted</span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Interest Rate</span>
              <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block tabular-nums">
                {stats.conversionMetrics.interestRate}%
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Interested / Replied</span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Demo Rate</span>
              <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1 block tabular-nums">
                {stats.conversionMetrics.demoRate}%
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Demo / Interested</span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-md border border-zinc-200 dark:border-zinc-800 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 block">Win Rate</span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block tabular-nums">
                {stats.conversionMetrics.winRate}%
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Won / Demo</span>
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
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Priority Prospect Spotlight</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Showing high-priority prospects ready for outreach
            </p>
          </div>
          <button
            onClick={() => onNavigateToLeads()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
          >
            <span>View All ({leads.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {topRecentLeads.map((lead, idx) => (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="py-3 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-2 rounded-md transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 w-5 text-right tabular-nums">
                  #{idx + 1}
                </span>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">
                    {lead.businessName}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    <span>{lead.category}</span>
                    <span>/</span>
                    <span>{lead.city}</span>
                    {lead.rating > 0 && (
                      <>
                        <span>/</span>
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium font-mono">{lead.rating} Stars</span>
                        <span className="text-zinc-400 dark:text-zinc-500 font-mono">({lead.reviews})</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300 block">
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
