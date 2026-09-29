import React, { useState, useMemo } from 'react';
import {
  Send,
  Phone,
  Star,
  ExternalLink,
  MessageSquare,
  CheckCircle,
  Inbox,
} from 'lucide-react';
import type { Lead, DashboardStats } from '../types/lead';
import { TierBadge } from '../components/leads/TierBadge';
import { Button } from '../components/ui/Button';
import { formatNumber, formatPhoneNumber } from '../lib/utils';
import { normalizePhoneForWhatsApp, openWhatsAppChat } from '../lib/whatsapp';
import { AutoBatchRunner } from '../components/outreach/AutoBatchRunner';

interface OutreachQueuePageProps {
  leads: Lead[];
  stats: DashboardStats;
  dailyGoal: number;
  onOpenNextLead: () => void;
  onSelectLead: (lead: Lead) => void;
  onMarkContacted: (leadId: string) => void;
}

export const OutreachQueuePage: React.FC<OutreachQueuePageProps> = ({
  leads,
  stats,
  dailyGoal,
  onOpenNextLead,
  onSelectLead,
  onMarkContacted,
}) => {
  // Eligible leads: status = 'New' AND valid phone, sorted by leadScore desc
  const eligibleQueue = useMemo(() => {
    return leads
      .filter((lead) => {
        if (lead.status !== 'New') return false;
        const norm = normalizePhoneForWhatsApp(lead.phone || lead.rawPhone);
        return norm.valid;
      })
      .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
  }, [leads]);

  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);

  const goalPercent = Math.min(100, Math.round((stats.todayOutreachCount / dailyGoal) * 100));

  const handleQuickWhatsApp = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = lead.customMessage || lead.personalizedMessage || '';
    openWhatsAppChat(lead.phone || lead.rawPhone || '', msg);
    onSelectLead(lead);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Banner: Restrained Executive Surface (No harsh gradients, no emojis) */}
      <div className="bg-zinc-900 text-white rounded-lg p-6 border border-zinc-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-300 border border-zinc-700">
            <Send className="w-3.5 h-3.5 text-emerald-400" strokeWidth={1.5} />
            <span>Outreach Pipeline</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Daily Queue Execution</h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Prioritized by verified phone status and reputation score. Review lead, open conversation, and track contact milestones.
          </p>
        </div>

        {/* Progress Display & Big CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          <div className="bg-zinc-950/60 rounded-lg p-3.5 min-w-[170px] border border-zinc-800">
            <div className="flex justify-between text-xs text-zinc-400 font-medium mb-1">
              <span>Today's Target</span>
              <span className="font-bold text-zinc-200 tabular-nums">{goalPercent}%</span>
            </div>
            <div className="text-xl font-bold tabular-nums text-white">
              {stats.todayOutreachCount}{' '}
              <span className="text-xs font-normal text-zinc-400">/ {dailyGoal} completed</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={onOpenNextLead}
            disabled={eligibleQueue.length === 0}
            icon={<Send className="w-4 h-4" strokeWidth={1.5} />}
            className="py-3 px-5 text-sm font-semibold"
            title="Open highest-scoring uncontacted lead"
          >
            {eligibleQueue.length > 0 ? 'Open Next Lead' : 'All Contacted'}
          </Button>
        </div>
      </div>

      {/* Auto Batch Runner */}
      <AutoBatchRunner
        queue={eligibleQueue}
        onMarkContacted={onMarkContacted}
        onSelectLead={onSelectLead}
        activeLeadId={activeLeadId}
        onActiveLeadChange={setActiveLeadId}
      />

      {/* Queue Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="px-5 py-3.5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Queue Prospects</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Showing {eligibleQueue.length} leads ready for WhatsApp outreach (sorted by Lead Score)
            </p>
          </div>

          <span className="text-xs font-mono px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-md border border-zinc-200 dark:border-zinc-700 tabular-nums">
            {eligibleQueue.length} in queue
          </span>
        </div>

        {/* Table Container */}
        {eligibleQueue.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center mx-auto">
              <Inbox className="w-5 h-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Outreach Queue Cleared</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              All eligible leads with valid numbers in this view have been contacted. Import additional lists or check scheduled follow-ups.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-2.5 px-3 w-10 text-center font-mono">
                    #
                  </th>
                  <th scope="col" className="py-2.5 px-4">
                    Business Name
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    Rating
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-right">
                    Reviews
                  </th>
                  <th scope="col" className="py-2.5 px-3 text-center">
                    Score
                  </th>
                  <th scope="col" className="py-2.5 px-3.5">
                    Phone
                  </th>
                  <th scope="col" className="py-2.5 px-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {eligibleQueue.map((lead, index) => {
                  const isActive = lead.id === activeLeadId;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`transition-colors group cursor-pointer ${
                        isActive
                          ? 'bg-zinc-100 dark:bg-zinc-800/90'
                          : 'hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40'
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-mono text-zinc-400 dark:text-zinc-500">
                        {isActive ? (
                          <span className="w-4 h-4 rounded-sm bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-bold inline-flex items-center justify-center text-[9px]">
                            •
                          </span>
                        ) : (
                          index + 1
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 flex-wrap">
                          <span>{lead.businessName}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
                              Active
                            </span>
                          )}
                          {lead.googleMapsUrl && (
                            <a
                              href={lead.googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </a>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          <span>{lead.category}</span>
                          {lead.city && <span> / {lead.city}</span>}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{lead.rating ? lead.rating.toFixed(1) : '-'}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right tabular-nums font-mono text-zinc-700 dark:text-zinc-300">
                        {lead.reviews ? formatNumber(lead.reviews) : 0}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <TierBadge tier={lead.leadTier} score={lead.leadScore} showScore />
                      </td>

                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">
                          <Phone className="w-3 h-3 text-zinc-400" strokeWidth={1.5} />
                          <span>{formatPhoneNumber(lead.phone)}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectLead(lead)}
                            className="text-xs"
                          >
                            Inspect
                          </Button>

                          <button
                            type="button"
                            onClick={(e) => handleQuickWhatsApp(lead, e)}
                            title="Open WhatsApp chat link"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-emerald-600 dark:hover:bg-emerald-500 dark:hover:text-white transition-colors"
                          >
                            <MessageSquare className="w-3 h-3 fill-current" />
                            <span>WhatsApp</span>
                          </button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onMarkContacted(lead.id)}
                            icon={<CheckCircle className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />}
                            className="text-xs"
                          >
                            Mark Contacted
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
