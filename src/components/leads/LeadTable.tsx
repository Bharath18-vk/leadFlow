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
    if (filters.sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 ml-1 inline" />;
    }
    return filters.sortOrder === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 ml-1 inline" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 ml-1 inline" />
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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider select-none">
            <tr>
              <th scope="col" className="py-3 px-3.5 w-12 text-center text-slate-400 dark:text-slate-500">
                #
              </th>
              <th
                scope="col"
                className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/60 transition-colors"
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
                className="py-3 px-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/60 transition-colors text-right"
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center justify-end">
                  <span>Rating</span>
                  {renderSortIcon('rating')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3 px-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/60 transition-colors text-right"
                onClick={() => handleSort('reviews')}
              >
                <div className="flex items-center justify-end">
                  <span>Reviews</span>
                  {renderSortIcon('reviews')}
                </div>
              </th>
              <th
                scope="col"
                className="py-3 px-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/60 transition-colors text-right"
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
                className="py-3 px-3 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-700/60 transition-colors"
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="max-w-sm mx-auto space-y-2">
                    <p className="text-base font-semibold text-slate-600 dark:text-slate-300">No leads found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Try adjusting your search criteria or clear current filters.
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
                    className="hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors group cursor-pointer"
                  >
                    {/* Index */}
                    <td className="py-3 px-3.5 text-center text-xs text-slate-400 dark:text-slate-500 font-mono">
                      {rowNum}
                    </td>

                    {/* Business Name & Address */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <span>{lead.businessName}</span>
                        {lead.googleMapsUrl && (
                          <a
                            href={lead.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            title="Open Google Maps link"
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-opacity"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                        {lead.city && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {lead.neighborhood ? `${lead.neighborhood}, ${lead.city}` : lead.city}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="inline-block max-w-[140px] truncate text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {lead.category || 'Interior Designer'}
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{lead.rating ? lead.rating.toFixed(1) : '—'}</span>
                      </div>
                    </td>

                    {/* Reviews */}
                    <td className="py-3 px-3 text-right tabular-nums text-slate-700 dark:text-slate-300 font-medium">
                      {lead.reviews ? formatNumber(lead.reviews) : '—'}
                    </td>

                    {/* Google Images */}
                    <td className="py-3 px-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                      {lead.images ? (
                        <div className="inline-flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          <span>{formatNumber(lead.images)}</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3.5">
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-slate-800 dark:text-slate-200 select-all">
                            {formatPhoneNumber(lead.phone)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyPhone(lead, e)}
                            title="Copy phone number"
                            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-slate-500 italic">No phone</span>
                      )}
                    </td>

                    {/* Tier */}
                    <td className="py-3 px-3">
                      <TierBadge tier={lead.leadTier} score={lead.leadScore} showScore />
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3 px-3.5" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                        className="text-xs font-medium py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
                      >
                        {ALL_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectLead && onSelectLead(lead)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition-colors"
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
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={filters.pageSize}
            onChange={(e) =>
              onFilterChange({ pageSize: parseInt(e.target.value, 10), page: 1 })
            }
            className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded text-xs focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-400 dark:text-slate-500">|</span>
          <span>
            Showing <strong className="text-slate-800 dark:text-slate-200">{totalCount > 0 ? startRow : 0}</strong> to{' '}
            <strong className="text-slate-800 dark:text-slate-200">{endRow}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong> leads
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={filters.page <= 1}
            onClick={() => onFilterChange({ page: filters.page - 1 })}
            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
            Page {filters.page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={filters.page >= totalPages}
            onClick={() => onFilterChange({ page: filters.page + 1 })}
            className="px-3 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
