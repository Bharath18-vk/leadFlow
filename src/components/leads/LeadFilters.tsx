import React, { useState } from 'react';
import { Search, X, RotateCcw, Filter, ChevronDown } from 'lucide-react';
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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    Boolean(filters.search) ||
    filters.status !== 'all' ||
    filters.tier !== 'all' ||
    filters.phoneFilter !== 'all' ||
    Boolean(filters.followUpFilter && filters.followUpFilter !== 'all') ||
    Boolean(filters.contactFilter && filters.contactFilter !== 'all') ||
    Boolean(filters.notesFilter && filters.notesFilter !== 'all') ||
    filters.minRating > 0 ||
    filters.minReviews > 0 ||
    filters.city !== 'all' ||
    filters.category !== 'all';

  // Active filter tags for quick removal
  const activeTags: Array<{ label: string; onClear: () => void }> = [];
  if (filters.search) {
    activeTags.push({ label: `"${filters.search}"`, onClear: () => onChange({ search: '', page: 1 }) });
  }
  if (filters.status !== 'all') {
    activeTags.push({ label: `Status: ${filters.status}`, onClear: () => onChange({ status: 'all', page: 1 }) });
  }
  if (filters.tier !== 'all') {
    activeTags.push({ label: `Tier: ${filters.tier}`, onClear: () => onChange({ tier: 'all', page: 1 }) });
  }
  if (filters.phoneFilter !== 'all') {
    activeTags.push({
      label: filters.phoneFilter === 'has_phone' ? 'With Phone' : 'No Phone',
      onClear: () => onChange({ phoneFilter: 'all', page: 1 }),
    });
  }
  if (filters.followUpFilter && filters.followUpFilter !== 'all') {
    const map: Record<string, string> = {
      due_today: 'Follow-up: Today',
      overdue: 'Follow-up: Overdue',
      has_followup: 'Follow-up: Scheduled',
      no_followup: 'Follow-up: None',
    };
    activeTags.push({
      label: map[filters.followUpFilter] || filters.followUpFilter,
      onClear: () => onChange({ followUpFilter: 'all', page: 1 }),
    });
  }
  if (filters.contactFilter && filters.contactFilter !== 'all') {
    activeTags.push({
      label: filters.contactFilter === 'contacted' ? 'Contacted' : 'Uncontacted',
      onClear: () => onChange({ contactFilter: 'all', page: 1 }),
    });
  }
  if (filters.notesFilter && filters.notesFilter !== 'all') {
    activeTags.push({
      label: filters.notesFilter === 'has_notes' ? 'With Notes' : 'No Notes',
      onClear: () => onChange({ notesFilter: 'all', page: 1 }),
    });
  }
  if (filters.minRating > 0) {
    activeTags.push({
      label: `Rating ≥ ${filters.minRating}★`,
      onClear: () => onChange({ minRating: 0, page: 1 }),
    });
  }
  if (filters.minReviews > 0) {
    activeTags.push({
      label: `Reviews ≥ ${filters.minReviews}`,
      onClear: () => onChange({ minReviews: 0, page: 1 }),
    });
  }
  if (filters.category !== 'all') {
    activeTags.push({
      label: `Cat: ${filters.category}`,
      onClear: () => onChange({ category: 'all', page: 1 }),
    });
  }
  if (filters.city !== 'all') {
    activeTags.push({
      label: `City: ${filters.city}`,
      onClear: () => onChange({ city: 'all', page: 1 }),
    });
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-xs space-y-3.5 transition-all">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input with modern styling & keyboard affordance */}
        <div className="relative flex-1 group">
          <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-zinc-700 dark:group-focus-within:text-zinc-200 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value, page: 1 })}
            placeholder="Search business, phone, category, or city..."
            className="w-full pl-10 pr-10 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 focus:border-zinc-400 dark:focus:border-zinc-600 transition-all shadow-2xs"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60 transition-all active:scale-95"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Tier Filter Pills */}
        <div className="flex items-center gap-1 bg-zinc-100/80 dark:bg-zinc-800/70 p-1 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onChange({ tier: 'all', page: 1 })}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all active:scale-95 ${
              filters.tier === 'all'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            All Tiers
          </button>
          <button
            type="button"
            onClick={() => onChange({ tier: filters.tier === 'A' ? 'all' : 'A', page: 1 })}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md inline-flex items-center gap-1.5 transition-all active:scale-95 ${
              filters.tier === 'A'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xs font-semibold'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Tier A
          </button>
          <button
            type="button"
            onClick={() => onChange({ tier: filters.tier === 'B' ? 'all' : 'B', page: 1 })}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md inline-flex items-center gap-1.5 transition-all active:scale-95 ${
              filters.tier === 'B'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xs font-semibold'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
            Tier B
          </button>
          <button
            type="button"
            onClick={() => onChange({ tier: filters.tier === 'C' ? 'all' : 'C', page: 1 })}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md inline-flex items-center gap-1.5 transition-all active:scale-95 ${
              filters.tier === 'C'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xs font-semibold'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
            Tier C
          </button>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 rounded-lg text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {totalMatches}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">leads</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all active:scale-95 ${
              showAdvanced
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-2xs'
                : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-750'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeTags.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-white text-[10px] font-mono rounded-full font-bold">
                {activeTags.length}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="group inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-zinc-200 dark:border-zinc-700/80 rounded-lg transition-all active:scale-95"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform duration-200" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Strip */}
      {activeTags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
          <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mr-1">Active:</span>
          {activeTags.map((tag, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors animate-in fade-in duration-150"
            >
              <span>{tag.label}</span>
              <button
                type="button"
                onClick={tag.onClear}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-2 ml-1"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Primary & Advanced Filter Selectors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2.5 pt-1">
        {/* Status Filter */}
        <div className="space-y-1">
          <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Status
          </label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onChange({ status: e.target.value, page: 1 })}
              className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 cursor-pointer transition-all ${
                filters.status !== 'all'
                  ? 'border-zinc-900 dark:border-zinc-300 font-semibold ring-1 ring-zinc-900/10'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="all">All Statuses</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="New">New</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="Contacted">Contacted</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="Replied">Replied</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="Demo Sent">Demo Sent</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="Interested">Interested</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="Follow-up">Follow-up</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="Negotiating">Negotiating</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="Won">Won</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="Lost">Lost</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="Not Interested">Not Interested</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Follow-up Filter */}
        <div className="space-y-1">
          <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Follow-up
          </label>
          <div className="relative">
            <select
              value={filters.followUpFilter || 'all'}
              onChange={(e) => onChange({ followUpFilter: e.target.value as FollowUpFilter, page: 1 })}
              className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 cursor-pointer transition-all ${
                filters.followUpFilter && filters.followUpFilter !== 'all'
                  ? 'border-zinc-900 dark:border-zinc-300 font-semibold ring-1 ring-zinc-900/10'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="all">All Follow-ups</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="due_today">Due Today</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="overdue">Overdue</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="has_followup">Has Date</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="no_followup">No Date</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Phone Filter */}
        <div className="space-y-1">
          <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Phone Availability
          </label>
          <div className="relative">
            <select
              value={filters.phoneFilter}
              onChange={(e) => onChange({ phoneFilter: e.target.value as PhoneFilter, page: 1 })}
              className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 cursor-pointer transition-all ${
                filters.phoneFilter !== 'all'
                  ? 'border-zinc-900 dark:border-zinc-300 font-semibold ring-1 ring-zinc-900/10'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="all">All Leads</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="has_phone">Phone Available</option>
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="no_phone">No Phone</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* City Filter */}
        <div className="space-y-1">
          <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            City
          </label>
          <div className="relative">
            <select
              value={filters.city}
              onChange={(e) => onChange({ city: e.target.value, page: 1 })}
              className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 truncate cursor-pointer transition-all ${
                filters.city !== 'all'
                  ? 'border-zinc-900 dark:border-zinc-300 font-semibold ring-1 ring-zinc-900/10'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="all">All Cities</option>
              {uniqueCities.map((city) => (
                <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-1">
          <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            Category
          </label>
          <div className="relative">
            <select
              value={filters.category}
              onChange={(e) => onChange({ category: e.target.value, page: 1 })}
              className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 truncate cursor-pointer transition-all ${
                filters.category !== 'all'
                  ? 'border-zinc-900 dark:border-zinc-300 font-semibold ring-1 ring-zinc-900/10'
                  : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
              }`}
            >
              <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Advanced Filters (Always available or smooth expand) */}
        {showAdvanced && (
          <>
            {/* Contact Status */}
            <div className="space-y-1 animate-in fade-in duration-200">
              <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Outreach History
              </label>
              <div className="relative">
                <select
                  value={filters.contactFilter || 'all'}
                  onChange={(e) => onChange({ contactFilter: e.target.value as ContactFilter, page: 1 })}
                  className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 cursor-pointer transition-all ${
                    filters.contactFilter && filters.contactFilter !== 'all'
                      ? 'border-zinc-900 dark:border-zinc-300 font-semibold ring-1 ring-zinc-900/10'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="all">All Outreach</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="contacted">Contacted</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="uncontacted">Uncontacted</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Notes Filter */}
            <div className="space-y-1 animate-in fade-in duration-200">
              <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Notes
              </label>
              <div className="relative">
                <select
                  value={filters.notesFilter || 'all'}
                  onChange={(e) => onChange({ notesFilter: e.target.value as NotesFilter, page: 1 })}
                  className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 cursor-pointer transition-all ${
                    filters.notesFilter && filters.notesFilter !== 'all'
                      ? 'border-zinc-900 dark:border-zinc-300 font-semibold ring-1 ring-zinc-900/10'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="all">All Notes</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="has_notes">Has Notes</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="no_notes">No Notes</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Min Rating */}
            <div className="space-y-1 animate-in fade-in duration-200">
              <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Min Rating
              </label>
              <div className="relative">
                <select
                  value={filters.minRating}
                  onChange={(e) => onChange({ minRating: parseFloat(e.target.value), page: 1 })}
                  className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 cursor-pointer transition-all ${
                    filters.minRating > 0
                      ? 'border-zinc-900 dark:border-zinc-300 font-semibold ring-1 ring-zinc-900/10'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value={0}>Any Rating</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value={4.8}>4.8 and Above</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value={4.5}>4.5 and Above</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value={4.0}>4.0 and Above</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value={3.5}>3.5 and Above</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Min Reviews */}
            <div className="space-y-1 animate-in fade-in duration-200">
              <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Min Reviews
              </label>
              <div className="relative">
                <select
                  value={filters.minReviews}
                  onChange={(e) => onChange({ minReviews: parseInt(e.target.value, 10), page: 1 })}
                  className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 cursor-pointer transition-all ${
                    filters.minReviews > 0
                      ? 'border-zinc-900 dark:border-zinc-300 font-semibold ring-1 ring-zinc-900/10'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value={0}>Any Reviews</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value={10}>10+ Reviews</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value={25}>25+ Reviews</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value={50}>50+ Reviews</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value={100}>100+ Reviews</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Tier Select (Synchronized with Quick Chips) */}
            <div className="space-y-1 animate-in fade-in duration-200">
              <label className="block text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Tier Dropdown
              </label>
              <div className="relative">
                <select
                  value={filters.tier}
                  onChange={(e) => onChange({ tier: e.target.value, page: 1 })}
                  className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-xs rounded-lg border bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 cursor-pointer transition-all ${
                    filters.tier !== 'all'
                      ? 'border-zinc-900 dark:border-zinc-300 font-semibold ring-1 ring-zinc-900/10'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  }`}
                >
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="all">All Tiers</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="A">Tier A: Priority</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="B">Tier B: Qualified</option>
                  <option className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" value="C">Tier C: Standard</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
