import React, { useState } from 'react';
import {
  Star,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Phone,
  ChevronDown,
  Building2,
  ChevronRight,
} from 'lucide-react';
import type { Lead, LeadStatus } from '../../types/lead';
import { TierBadge } from './TierBadge';
import { formatNumber, formatPhoneNumber } from '../../lib/utils';

interface LeadCardListProps {
  leads: Lead[];
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onSelectLead?: (lead: Lead) => void;
}

export const LeadCardList: React.FC<LeadCardListProps> = ({
  leads,
  onStatusChange,
  onSelectLead,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPhone = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = lead.phone || lead.rawPhone || '';
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const ALL_STATUSES: LeadStatus[] = [
    'New',
    'Contacted',
    'Replied',
    'Demo Sent',
    'Interested',
    'Follow-up',
    'Negotiating',
    'Won',
    'Lost',
    'Not Interested',
  ];

  if (leads.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-8 text-center text-zinc-500 dark:text-zinc-400">
        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2 text-zinc-400 dark:text-zinc-500">
          <Building2 className="w-5 h-5 stroke-1" />
        </div>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No leads match the filters</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Try resetting or loosening filter options.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden font-sans">
      {leads.map((lead) => {
        const isCopied = copiedId === lead.id;

        return (
          <div
            key={lead.id}
            onClick={() => onSelectLead && onSelectLead(lead)}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm transition-all duration-150 space-y-3 cursor-pointer group active:scale-[0.99]"
          >
            {/* Top row: Business Name & Tier Badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 font-bold text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                  <span className="truncate">{lead.businessName}</span>
                  {lead.googleMapsUrl && (
                    <a
                      href={lead.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0 transition-colors"
                      title="Open Google Maps"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  <MapPin className="w-3 h-3 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span className="truncate">
                    {lead.neighborhood ? `${lead.neighborhood}, ${lead.city}` : lead.city || 'Unknown City'}
                  </span>
                </div>
              </div>

              <TierBadge tier={lead.leadTier} score={lead.leadScore} showScore />
            </div>

            {/* Middle metrics strip */}
            <div className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-800/60 rounded-lg p-2.5 border border-zinc-100 dark:border-zinc-750">
              <div className="flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{lead.rating ? lead.rating.toFixed(1) : '-'}</span>
                <span className="text-zinc-400 dark:text-zinc-500 font-normal text-[11px]">
                  ({lead.reviews ? formatNumber(lead.reviews) : 0})
                </span>
              </div>

              <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 tabular-nums text-[11px]">
                <ImageIcon className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                <span>{lead.images ? formatNumber(lead.images) : 0} photos</span>
              </div>

              <span className="text-zinc-500 dark:text-zinc-400 text-[11px] truncate max-w-[110px] bg-zinc-200/60 dark:bg-zinc-700/60 px-1.5 py-0.5 rounded">
                {lead.category || 'Lead'}
              </span>
            </div>

            {/* Bottom Row: Phone, Status & Tap prompt */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5 min-w-0">
                {lead.phone ? (
                  <>
                    <Phone className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                    <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 select-all font-medium truncate">
                      {formatPhoneNumber(lead.phone)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyPhone(lead, e)}
                      className={`p-1 rounded-md transition-all active:scale-95 shrink-0 ${
                        isCopied
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                      title="Copy phone"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 italic">No phone</span>
                )}
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                    className="appearance-none text-xs font-medium py-1 pl-2 pr-5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:ring-1 focus:ring-zinc-400 cursor-pointer shadow-2xs"
                  >
                    {ALL_STATUSES.map((status) => (
                      <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-zinc-400 pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
                </div>

                <div className="text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
