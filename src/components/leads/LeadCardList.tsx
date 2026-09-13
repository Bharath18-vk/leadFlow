import React, { useState } from 'react';
import {
  Star,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  Phone,
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
    'Negotiating',
    'Won',
    'Lost',
    'Not Interested',
  ];

  if (leads.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500 dark:text-slate-400">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No leads match the filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      {leads.map((lead) => {
        const isCopied = copiedId === lead.id;

        return (
          <div
            key={lead.id}
            onClick={() => onSelectLead && onSelectLead(lead)}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-3 cursor-pointer"
          >
            {/* Top row: Business Name, Tier */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100 text-sm">
                  <span>{lead.businessName}</span>
                  {lead.googleMapsUrl && (
                    <a
                      href={lead.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate">
                    {lead.neighborhood ? `${lead.neighborhood}, ${lead.city}` : lead.city}
                  </span>
                </div>
              </div>

              <TierBadge tier={lead.leadTier} score={lead.leadScore} showScore />
            </div>

            {/* Middle metrics row */}
            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/60 rounded-lg p-2.5">
              <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{lead.rating ? lead.rating.toFixed(1) : '—'}</span>
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  ({lead.reviews ? formatNumber(lead.reviews) : 0})
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{lead.images ? formatNumber(lead.images) : 0} photos</span>
              </div>

              <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-[100px]">
                {lead.category}
              </span>
            </div>

            {/* Bottom Row: Phone & Status */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                {lead.phone ? (
                  <>
                    <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-mono text-xs text-slate-800 dark:text-slate-200">
                      {formatPhoneNumber(lead.phone)}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopyPhone(lead, e)}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Copy phone"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic">No phone</span>
                )}
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <select
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                  className="text-xs font-medium py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  {ALL_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
