import React, { useMemo, useState } from 'react';
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  MessageSquare,
  Search,
} from 'lucide-react';
import type { Lead } from '../types/lead';
import { StatusBadge } from '../components/leads/StatusBadge';
import { TierBadge } from '../components/leads/TierBadge';
import { LeadDetailPanel } from '../components/leads/LeadDetailPanel';
import { Button } from '../components/ui/Button';
import { formatPhoneNumber } from '../lib/utils';
import { openWhatsAppChat } from '../lib/whatsapp';
import {
  getTodayLocalDateString,
  addDaysToLocalDate,
  formatFollowUpDisplay,
} from '../lib/dateUtils';

interface FollowUpsPageProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  selectedLead: Lead | null;
  onCloseLeadInspector: () => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  onMarkContacted: (id: string) => void;
  onNavigateToLeads: () => void;
}

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({
  leads,
  onSelectLead,
  selectedLead,
  onCloseLeadInspector,
  onUpdateLead,
  onMarkContacted,
  onNavigateToLeads,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const today = getTodayLocalDateString();

  // Categorize leads with followUpDate into Overdue, Today, and Upcoming
  const { overdue, dueToday, upcoming } = useMemo(() => {
    const overdueList: Lead[] = [];
    const dueTodayList: Lead[] = [];
    const upcomingList: Lead[] = [];

    leads.forEach((l) => {
      if (!l.followUpDate) return;
      const cleanDate = l.followUpDate.slice(0, 10);

      // Search filter if typed
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = l.businessName.toLowerCase().includes(q);
        const matchesPhone = (l.phone || l.rawPhone || '').includes(q);
        const matchesNotes = (l.notes || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesNotes) return;
      }

      if (cleanDate < today) {
        overdueList.push(l);
      } else if (cleanDate === today) {
        dueTodayList.push(l);
      } else {
        upcomingList.push(l);
      }
    });

    // Sort overdue by oldest first (highest urgency)
    overdueList.sort((a, b) => (a.followUpDate || '').localeCompare(b.followUpDate || ''));
    // Sort upcoming by closest first
    upcomingList.sort((a, b) => (a.followUpDate || '').localeCompare(b.followUpDate || ''));

    return {
      overdue: overdueList,
      dueToday: dueTodayList,
      upcoming: upcomingList,
    };
  }, [leads, today, searchQuery]);

  const totalFollowUps = overdue.length + dueToday.length + upcoming.length;

  // Reschedule helper
  const handleReschedule = (leadId: string, daysAhead: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateLead(leadId, { followUpDate: addDaysToLocalDate(daysAhead) });
  };

  // Mark follow-up completed: clears followUpDate, keeps current status intact
  const handleMarkDone = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateLead(leadId, { followUpDate: undefined });
  };

  // Quick WhatsApp trigger
  const handleQuickWhatsApp = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = lead.customMessage || lead.personalizedMessage || '';
    openWhatsAppChat(lead.phone || lead.rawPhone || '', msg);
  };

  const renderFollowUpCard = (lead: Lead, type: 'overdue' | 'today' | 'upcoming') => {
    const cardBorder =
      type === 'overdue'
        ? 'border-rose-200 dark:border-rose-900/60 hover:border-rose-300 dark:hover:border-rose-700'
        : type === 'today'
        ? 'border-amber-200 dark:border-amber-900/60 hover:border-amber-300 dark:hover:border-amber-700'
        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700';

    const badgeStyle =
      type === 'overdue'
        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
        : type === 'today'
        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';

    return (
      <div
        key={lead.id}
        onClick={() => onSelectLead(lead)}
        className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-3 ${cardBorder}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {lead.businessName}
              </h3>
              <TierBadge tier={lead.leadTier} score={lead.leadScore} showScore={false} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lead.category} • {lead.city}</p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <StatusBadge status={lead.status} />
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeStyle}`}>
              {formatFollowUpDisplay(lead.followUpDate)}
            </span>
          </div>
        </div>

        {/* Contact info & Notes preview */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {formatPhoneNumber(lead.phone)}
          </span>
          {(lead.contactAttempts ?? 0) > 0 && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {lead.contactAttempts} attempt{(lead.contactAttempts ?? 0) > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {lead.notes && (
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 italic line-clamp-2">
            "{lead.notes}"
          </div>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleQuickWhatsApp(lead, e)}
              icon={<MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />}
              className="text-xs py-1 px-2.5"
              title="Open WhatsApp chat in new tab"
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => handleMarkDone(lead.id, e)}
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              className="text-xs py-1 px-2.5"
              title="Complete this follow-up (clears date, retains status)"
            >
              ✓ Done
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => handleReschedule(lead.id, 1, e)}
              className="text-[11px] px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-medium transition-colors"
              title="Reschedule to Tomorrow"
            >
              +1d
            </button>
            <button
              type="button"
              onClick={(e) => handleReschedule(lead.id, 3, e)}
              className="text-[11px] px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-medium transition-colors"
              title="Reschedule in 3 days"
            >
              +3d
            </button>
            <button
              type="button"
              onClick={(e) => handleReschedule(lead.id, 7, e)}
              className="text-[11px] px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-medium transition-colors"
              title="Reschedule in 7 days"
            >
              +7d
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Follow-up Pipeline</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {totalFollowUps} Scheduled
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Never lose track of interested prospects. Keep deals moving toward a demo and close.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search follow-ups..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {totalFollowUps === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">No Follow-ups Scheduled</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Open any prospect in the Leads table or Outreach Queue, then set a follow-up date for tomorrow, in 3 days, or next week.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={onNavigateToLeads}>
            Browse All Leads
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. OVERDUE SECTION */}
          {overdue.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <h2 className="text-sm font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                    Overdue ({overdue.length})
                  </h2>
                </div>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Needs immediate action</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {overdue.map((l) => renderFollowUpCard(l, 'overdue'))}
              </div>
            </div>
          )}

          {/* 2. DUE TODAY SECTION */}
          {dueToday.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <h2 className="text-sm font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                    Due Today ({dueToday.length})
                  </h2>
                </div>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Schedule for today</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {dueToday.map((l) => renderFollowUpCard(l, 'today'))}
              </div>
            </div>
          )}

          {/* 3. UPCOMING SECTION */}
          {upcoming.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Upcoming ({upcoming.length})
                  </h2>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Future scheduled contacts</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {upcoming.map((l) => renderFollowUpCard(l, 'upcoming'))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lead Detail Panel Drawer */}
      <LeadDetailPanel
        lead={selectedLead}
        onClose={onCloseLeadInspector}
        onUpdateLead={onUpdateLead}
        onMarkContacted={onMarkContacted}
      />
    </div>
  );
};
