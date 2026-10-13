import React, { useState } from 'react';
import {
  Star,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Building2,
} from 'lucide-react';
import type { Lead, LeadFilterState, LeadStatus } from '../../types/lead';
import { TierBadge } from './TierBadge';
import { formatNumber, formatPhoneNumber } from '../../lib/utils';

interface LeadTableProps {
  leads: Lead[];
  totalCount: number;
  filters: LeadFilterState;
  onFilterChange: (updated: Partial<LeadFilterState>) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onSelectLead?: (lead: Lead) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  totalCount,
  filters,
  onFilterChange,
  onStatusChange,
  onSelectLead,
}) => {
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  const handleCopyPhone = (lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneToCopy = lead.phone || lead.rawPhone || '';
    if (!phoneToCopy) return;

    navigator.clipboard.writeText(phoneToCopy);
    setCopiedPhoneId(lead.id);
    setTimeout(() => {
      setCopiedPhoneId(null);
    }, 2000);
  };

  const handleSort = (field: LeadFilterState['sortBy']) => {
    if (filters.sortBy === field) {
      onFilterChange({
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    } else {
      onFilterChange({
        sortBy: field,
        sortOrder: 'desc',
        page: 1,
      });
    }
  };

  const renderSortIcon = (field: LeadFilterState['sortBy']) => {
    const isCurrent = filters.sortBy === field;
    if (!isCurrent) {
      return (
        <ArrowUpDown className="w-3.5 h-3.5 text-zinc-300 dark:text-zinc-650 opacity-0 group-hover/col:opacity-100 transition-opacity ml-1.5 shrink-0" />
      );
    }
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 ml-1.5 shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 ml-1.5 shrink-0" />
    );
  };

  // Pagination bounds
  const startRow = (filters.page - 1) * filters.pageSize + 1;
  const endRow = Math.min(filters.page * filters.pageSize, totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / filters.pageSize));

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

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden transition-all">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300 border-collapse">
          <thead>
            <tr className="bg-zinc-50/90 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider select-none">
              <th scope="col" className="py-3 px-3.5 w-12 text-center font-mono text-zinc-400 dark:text-zinc-500">
                #
              </th>
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-700/50 transition-colors group/col"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span>Business</span>
                  {renderSortIcon('name')}
                </div>
              </th>
              <th scope="col" className="py-3 px-3">
                Category
              </th>
              <th
                scope="col"
                className="py-3 px-3 cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-700/50 transition-colors text-right group/col"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center justify-end">
                  <span>Rating</span>
                  {renderSortIcon('rating')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3 px-3 cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-700/50 transition-colors text-right group/col"
                onClick={() => handleSort('reviews')}
              >
                <div className="flex items-center justify-end">
                  <span>Reviews</span>
                  {renderSortIcon('reviews')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3 px-3 cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-700/50 transition-colors text-right group/col"
                onClick={() => handleSort('images')}
              >
                <div className="flex items-center justify-end">
                  <span>Images</span>
                  {renderSortIcon('images')}
                </div>
              </th>
              <th scope="col" className="py-3 px-3.5">
                Phone
              </th>
              <th
                scope="col"
                className="py-3 px-3 cursor-pointer hover:bg-zinc-100/70 dark:hover:bg-zinc-700/50 transition-colors group/col"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center">
                  <span>Tier</span>
                  {renderSortIcon('score')}
                </div>
              </th>
              <th scope="col" className="py-3 px-3.5">
                Status
              </th>
              <th scope="col" className="py-3 px-3.5 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-zinc-400 dark:text-zinc-500">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 dark:text-zinc-500">
                      <Building2 className="w-6 h-6 stroke-1" />
                    </div>
                    <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No leads match your criteria</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
                      Try clearing search terms or resetting filters to view all imported prospects.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead, idx) => {
                const rowNum = (filters.page - 1) * filters.pageSize + idx + 1;
                const isCopied = copiedPhoneId === lead.id;

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead && onSelectLead(lead)}
                    className="hover:bg-zinc-50/90 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
                  >
                    {/* Index */}
                    <td className="py-3 px-3.5 text-center text-xs text-zinc-400 dark:text-zinc-500 font-mono tabular-nums">
                      {rowNum}
                    </td>

                    {/* Business Name & Address */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                        <span>{lead.businessName}</span>
                        {lead.googleMapsUrl && (
                          <a
                            href={lead.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Open Google Maps link"
                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
                        {lead.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0 text-zinc-400 dark:text-zinc-500" />
                            <span>{lead.neighborhood ? `${lead.neighborhood}, ${lead.city}` : lead.city}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="inline-block max-w-[140px] truncate text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100/90 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200/50 dark:border-zinc-700/50 font-medium">
                        {lead.category || 'Interior Designer'}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1 font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{lead.rating ? lead.rating.toFixed(1) : '-'}</span>
                      </div>
                    </td>

                    {/* Reviews */}
                    <td className="py-3 px-3 text-right tabular-nums text-zinc-700 dark:text-zinc-300 font-medium">
                      {lead.reviews ? formatNumber(lead.reviews) : '-'}
                    </td>

                    {/* Google Images */}
                    <td className="py-3 px-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                      {lead.images ? (
                        <div className="inline-flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                          <span>{formatNumber(lead.images)}</span>
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3.5">
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 select-all font-medium">
                            {formatPhoneNumber(lead.phone)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyPhone(lead, e)}
                            title="Copy phone number"
                            className={`p-1 rounded-md transition-all active:scale-95 ${
                              isCopied
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
                                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 italic">No phone</span>
                      )}
                    </td>

                    {/* Tier */}
                    <td className="py-3 px-3">
                      <TierBadge tier={lead.leadTier} score={lead.leadScore} showScore />
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <select
                          value={lead.status}
                          onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="appearance-none text-xs font-medium py-1 pl-2.5 pr-6 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 focus:outline-none cursor-pointer transition-colors"
                        >
                          {ALL_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-zinc-400 pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectLead && onSelectLead(lead)}
                        className="px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-white dark:hover:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-all active:scale-95 shadow-2xs"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-4 py-3 bg-zinc-50/80 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <div className="relative">
            <select
              value={filters.pageSize}
              onChange={(e) =>
                onFilterChange({ pageSize: parseInt(e.target.value, 10), page: 1 })
              }
              className="appearance-none pl-2.5 pr-6 py-1 bg-white dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md text-xs focus:ring-1 focus:ring-zinc-400 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-400 pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2" />
          </div>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          <span>
            Showing <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{totalCount > 0 ? startRow : 0}</strong> to{' '}
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{endRow}</strong> of{' '}
            <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{totalCount}</strong> leads
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => onFilterChange({ page: filters.page - 1 })}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>
          <span className="px-2 font-medium text-zinc-700 dark:text-zinc-300">
            Page {filters.page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={filters.page >= totalPages}
            onClick={() => onFilterChange({ page: filters.page + 1 })}
            className="inline-flex items-center gap-1 px-3 py-1 bg-white dark:bg-zinc-800 border border-zinc-250 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-750 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-2xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
