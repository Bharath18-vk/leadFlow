import React, { useMemo } from 'react';
import type { Lead, LeadFilterState, LeadStatus } from '../types/lead';
import { LeadFilters } from '../components/leads/LeadFilters';
import { LeadTable } from '../components/leads/LeadTable';
import { LeadCardList } from '../components/leads/LeadCardList';
import { LeadDetailPanel } from '../components/leads/LeadDetailPanel';

interface LeadsPageProps {
  leads: Lead[];
  filters: LeadFilterState;
  onFilterChange: (updated: Partial<LeadFilterState>) => void;
  onResetFilters: () => void;
  onStatusChange: (leadId: string, status: LeadStatus) => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead | null) => void;
  onMarkContacted: (leadId: string) => void;
  onNextLead?: () => void;
  hasNextLead?: boolean;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({
  leads,
  filters,
  onFilterChange,
  onResetFilters,
  onStatusChange,
  onUpdateLead,
  selectedLead,
  onSelectLead,
  onMarkContacted,
  onNextLead,
  hasNextLead,
}) => {
  // Extract unique cities and categories
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.city) set.add(l.city);
    });
    return Array.from(set).sort();
  }, [leads]);

  const uniqueCategories = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      if (l.category) set.add(l.category);
    });
    return Array.from(set).sort();
  }, [leads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Search (Business name, phone, city, category, neighborhood)
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        const matchesName = lead.businessName.toLowerCase().includes(query);
        const matchesPhone =
          (lead.phone && lead.phone.toLowerCase().includes(query)) ||
          (lead.rawPhone && lead.rawPhone.toLowerCase().includes(query));
        const matchesCity = lead.city && lead.city.toLowerCase().includes(query);
        const matchesCategory = lead.category && lead.category.toLowerCase().includes(query);
        const matchesArea = lead.neighborhood && lead.neighborhood.toLowerCase().includes(query);

        if (!matchesName && !matchesPhone && !matchesCity && !matchesCategory && !matchesArea) {
          return false;
        }
      }

      // 2. Status
      if (filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      // 3. Tier
      if (filters.tier !== 'all' && lead.leadTier !== filters.tier) {
        return false;
      }

      // 4. Phone Availability (User Adjustment #5)
      if (filters.phoneFilter === 'has_phone') {
        if (!lead.phone && !lead.rawPhone) return false;
      } else if (filters.phoneFilter === 'no_phone') {
        if (lead.phone || lead.rawPhone) return false;
      }

      // 5. Follow-up Filter
      if (filters.followUpFilter && filters.followUpFilter !== 'all') {
        const today = new Date().toISOString().slice(0, 10);
        if (filters.followUpFilter === 'has_followup' && !lead.followUpDate) return false;
        if (filters.followUpFilter === 'no_followup' && lead.followUpDate) return false;
        if (filters.followUpFilter === 'due_today' && lead.followUpDate !== today) return false;
        if (filters.followUpFilter === 'overdue' && (!lead.followUpDate || lead.followUpDate >= today)) return false;
      }

      // 6. Contact Filter
      if (filters.contactFilter && filters.contactFilter !== 'all') {
        const isContacted = !!lead.contactedAt || lead.status === 'Contacted';
        if (filters.contactFilter === 'contacted' && !isContacted) return false;
        if (filters.contactFilter === 'uncontacted' && isContacted) return false;
      }

      // 7. Notes Filter
      if (filters.notesFilter && filters.notesFilter !== 'all') {
        const hasNotes = !!lead.notes && lead.notes.trim().length > 0;
        if (filters.notesFilter === 'has_notes' && !hasNotes) return false;
        if (filters.notesFilter === 'no_notes' && hasNotes) return false;
      }

      // 8. Min Rating
      if (filters.minRating > 0 && lead.rating < filters.minRating) {
        return false;
      }

      // 9. Min Reviews
      if (filters.minReviews > 0 && lead.reviews < filters.minReviews) {
        return false;
      }

      // 10. City
      if (filters.city !== 'all' && lead.city !== filters.city) {
        return false;
      }

      // 11. Category
      if (filters.category !== 'all' && lead.category !== filters.category) {
        return false;
      }

      return true;
    });
  }, [leads, filters]);

  // Sort leads
  const sortedLeads = useMemo(() => {
    const list = [...filteredLeads];
    const { sortBy, sortOrder } = filters;

    list.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'score':
          comparison = (b.leadScore || 0) - (a.leadScore || 0);
          break;
        case 'rating':
          comparison = (b.rating || 0) - (a.rating || 0);
          break;
        case 'reviews':
          comparison = (b.reviews || 0) - (a.reviews || 0);
          break;
        case 'images':
          comparison = (b.images || 0) - (a.images || 0);
          break;
        case 'name':
          comparison = a.businessName.localeCompare(b.businessName);
          break;
        case 'createdAt':
          comparison = (b.createdAt || '').localeCompare(a.createdAt || '');
          break;
        default:
          comparison = (b.leadScore || 0) - (a.leadScore || 0);
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return list;
  }, [filteredLeads, filters]);

  // Paginated slice
  const paginatedLeads = useMemo(() => {
    const start = (filters.page - 1) * filters.pageSize;
    return sortedLeads.slice(start, start + filters.pageSize);
  }, [sortedLeads, filters.page, filters.pageSize]);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Filter Toolbar */}
      <LeadFilters
        filters={filters}
        onChange={onFilterChange}
        onReset={onResetFilters}
        uniqueCities={uniqueCities}
        uniqueCategories={uniqueCategories}
        totalMatches={sortedLeads.length}
      />

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <LeadTable
          leads={paginatedLeads}
          totalCount={sortedLeads.length}
          filters={filters}
          onFilterChange={onFilterChange}
          onStatusChange={onStatusChange}
          onSelectLead={onSelectLead}
        />
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="md:hidden">
        <LeadCardList
          leads={paginatedLeads}
          onStatusChange={onStatusChange}
          onSelectLead={onSelectLead}
        />
      </div>

      {/* Slide-out Lead Detail Panel */}
      <LeadDetailPanel
        lead={selectedLead}
        onClose={() => onSelectLead(null)}
        onUpdateLead={onUpdateLead}
        onMarkContacted={onMarkContacted}
        onNextLead={onNextLead}
        hasNextLead={hasNextLead}
      />
    </div>
  );
};
