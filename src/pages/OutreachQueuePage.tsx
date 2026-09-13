import React, { useState, useMemo } from 'react';
import {
  Rocket,
  CheckCircle2,
  Phone,
  Star,
  ExternalLink,
  MessageSquare,
  Trophy,
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
    // Opens Lead Inspector so user sees confirmation and can review/mark contacted
    onSelectLead(lead);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Daily Outreach Target & Progress */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider text-blue-100">
            <Rocket className="w-3.5 h-3.5 text-amber-300" />
            <span>High-Velocity Outreach Queue</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Today's Outreach Pipeline</h1>
          <p className="text-xs text-blue-100/90 leading-relaxed">
            Prioritized by Google reputation, rating, and verified contact numbers.
            Review lead, click Open WhatsApp, and mark as contacted.
          </p>
        </div>

        {/* Progress Display & Big CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 min-w-[180px] border border-white/10">
            <div className="flex justify-between text-xs text-blue-100 font-medium mb-1">
              <span>Today's Goal</span>
              <span className="font-bold text-white">{goalPercent}%</span>
            </div>
            <div className="text-2xl font-black tabular-nums">
              {stats.todayOutreachCount}{' '}
              <span className="text-sm font-normal text-blue-200">/ {dailyGoal} completed</span>
            </div>
            <div className="h-2 w-full bg-blue-900/50 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={onOpenNextLead}
            disabled={eligibleQueue.length === 0}
            icon={<Rocket className="w-5 h-5 text-amber-300" />}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20 py-4 px-6 text-base"
            title="Open the highest-scoring uncontacted lead (Keyboard: N)"
          >
            {eligibleQueue.length > 0 ? '🚀 Open Next Lead' : 'All Contacted! 🎉'}
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Uncontacted Prospects Queue</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Showing {eligibleQueue.length} leads ready for WhatsApp outreach (sorted by Lead Score)
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-full">
            {eligibleQueue.length} in Queue
          </span>
        </div>

        {/* Table Container */}
        {eligibleQueue.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Outreach Queue Cleared!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              All eligible leads with phone numbers have been contacted. Import more leads or check back tomorrow!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="py-3 px-3.5 w-12 text-center">
                    #
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Business Name
                  </th>
                  <th scope="col" className="py-3 px-3 text-right">
                    Rating
                  </th>
                  <th scope="col" className="py-3 px-3 text-right">
                    Reviews
                  </th>
                  <th scope="col" className="py-3 px-3 text-center">
                    Score
                  </th>
                  <th scope="col" className="py-3 px-3.5">
                    Phone
                  </th>
                  <th scope="col" className="py-3 px-3.5 text-right">
                    Outreach Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {eligibleQueue.map((lead, index) => {
                  const isActive = lead.id === activeLeadId;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className={`transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-blue-100/90 dark:bg-blue-950/80 ring-2 ring-blue-500 z-10'
                          : 'hover:bg-blue-50/40 dark:hover:bg-blue-950/30'
                      }`}
                    >
                      <td className="py-3.5 px-3.5 text-center text-xs font-mono text-slate-400 dark:text-slate-500">
                        {isActive ? (
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold inline-flex items-center justify-center animate-pulse text-[10px]">
                            ▶
                          </span>
                        ) : (
                          index + 1
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5 flex-wrap">
                          <span>{lead.businessName}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white animate-pulse">
                              Active Target
                            </span>
                          )}
                          {lead.googleMapsUrl && (

                          <a
                            href={lead.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        <span>{lead.category}</span>
                        {lead.city && <span> • {lead.city}</span>}
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{lead.rating ? lead.rating.toFixed(1) : '—'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-right tabular-nums font-medium text-slate-700 dark:text-slate-300">
                      {lead.reviews ? formatNumber(lead.reviews) : 0}
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <TierBadge tier={lead.leadTier} score={lead.leadScore} showScore />
                    </td>

                    <td className="py-3.5 px-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-xs text-slate-800 dark:text-slate-200">
                        <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{formatPhoneNumber(lead.phone)}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
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
                          title="Open WhatsApp Web chat link"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-[#25D366] hover:text-white border border-emerald-200 dark:border-emerald-800 transition-all"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          <span>WhatsApp</span>
                        </button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onMarkContacted(lead.id)}
                          icon={<CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
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
