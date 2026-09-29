import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import type { LeadFilterState, PhoneFilter, FollowUpFilter, ContactFilter, NotesFilter } from '../../types/lead';

interface LeadFiltersProps {
  filters: LeadFilterState;
  onChange: (updated: Partial<LeadFilterState>) => void;
  onReset: () => void;
  uniqueCities: string[];
  uniqueCategories: string[];
  totalMatches: number;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  filters,
  onChange,
  onReset,
  uniqueCities,
  uniqueCategories,
  totalMatches,
}) => {
  const hasActiveFilters =
    filters.search ||
    filters.status !== 'all' ||
    filters.tier !== 'all' ||
    filters.phoneFilter !== 'all' ||
    (filters.followUpFilter && filters.followUpFilter !== 'all') ||
    (filters.contactFilter && filters.contactFilter !== 'all') ||
    (filters.notesFilter && filters.notesFilter !== 'all') ||
    filters.minRating > 0 ||
    filters.minReviews > 0 ||
    filters.city !== 'all' ||
    filters.category !== 'all';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5 transition-colors">
      {/* Search and Top Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            placeholder="Search by business name, phone number, category, or city..."
            className="w-full pl-10 pr-9 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all placeholder:text-slate-400 text-slate-900 dark:text-slate-100"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
            {totalMatches} matching leads
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Filter Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-2 pt-1">
        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value, page: 1 })}
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Replied">Replied</option>
            <option value="Demo Sent">Demo Sent</option>
            <option value="Interested">Interested</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Negotiating">Negotiating</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
            <option value="Not Interested">Not Interested</option>
          </select>
        </div>

        {/* Follow-up Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Follow-up
          </label>
          <select
            value={filters.followUpFilter || 'all'}
            onChange={(e) => onChange({ followUpFilter: e.target.value as FollowUpFilter, page: 1 })}
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Dates</option>
            <option value="due_today">Due Today</option>
            <option value="overdue">Overdue</option>
            <option value="has_followup">Has Date</option>
            <option value="no_followup">No Date</option>
          </select>
        </div>

        {/* Contact Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Contacted?
          </label>
          <select
            value={filters.contactFilter || 'all'}
            onChange={(e) => onChange({ contactFilter: e.target.value as ContactFilter, page: 1 })}
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Contact</option>
            <option value="contacted">Contacted</option>
            <option value="uncontacted">Uncontacted</option>
          </select>
        </div>

        {/* Notes Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Notes
          </label>
          <select
            value={filters.notesFilter || 'all'}
            onChange={(e) => onChange({ notesFilter: e.target.value as NotesFilter, page: 1 })}
            className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Notes</option>
            <option value="has_notes">Has Notes</option>
            <option value="no_notes">No Notes</option>
          </select>
        </div>

        {/* Tier Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Lead Tier
          </label>
          <select
            value={filters.tier}
            onChange={(e) => onChange({ tier: e.target.value, page: 1 })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="A">Tier A: Priority</option>
            <option value="B">Tier B: Qualified</option>
            <option value="C">Tier C: Standard</option>
          </select>
        </div>

        {/* Phone Availability Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Phone
          </label>
          <select
            value={filters.phoneFilter}
            onChange={(e) => onChange({ phoneFilter: e.target.value as PhoneFilter, page: 1 })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Phone</option>
            <option value="has_phone">Phone Available</option>
            <option value="no_phone">No Phone</option>
          </select>
        </div>

        {/* Min Rating Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Min Rating
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => onChange({ minRating: parseFloat(e.target.value), page: 1 })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value={0}>Any Rating</option>
            <option value={4.8}>4.8 and Above</option>
            <option value={4.5}>4.5 and Above</option>
            <option value={4.0}>4.0 and Above</option>
            <option value={3.5}>3.5 and Above</option>
          </select>
        </div>

        {/* Min Reviews Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Min Reviews
          </label>
          <select
            value={filters.minReviews}
            onChange={(e) => onChange({ minReviews: parseInt(e.target.value, 10), page: 1 })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value={0}>Any Reviews</option>
            <option value={10}>10+ Reviews</option>
            <option value={25}>25+ Reviews</option>
            <option value={50}>50+ Reviews</option>
            <option value={100}>100+ Reviews</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => onChange({ category: e.target.value, page: 1 })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none truncate"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
            City
          </label>
          <select
            value={filters.city}
            onChange={(e) => onChange({ city: e.target.value, page: 1 })}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none truncate"
          >
            <option value="all">All Cities</option>
            {uniqueCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
