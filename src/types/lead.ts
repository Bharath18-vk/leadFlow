export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Replied'
  | 'Interested'
  | 'Demo Sent'
  | 'Follow-up'
  | 'Negotiating'
  | 'Won'
  | 'Lost'
  | 'Not Interested';

export type LeadTier = 'A' | 'B' | 'C';

export interface Lead {
  id: string;
  placeId?: string;
  businessName: string;
  phone: string;
  rawPhone?: string;
  category: string;
  rating: number;
  reviews: number;
  images: number;
  city: string;
  neighborhood?: string;
  address?: string;
  leadScore: number;
  leadTier: LeadTier;
  personalizedMessage?: string;
  customMessage?: string;
  website?: string;
  googleMapsUrl?: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  importSource: string;
  notes?: string;
  followUpDate?: string; // YYYY-MM-DD format
  contactedAt?: string;
  lastContactedAt?: string;
  contactAttempts?: number;
  repliedAt?: string;
  interestedAt?: string;
  demoSentAt?: string;
  wonAt?: string;
  lostAt?: string;
  quotedAmount?: number;
  dealValue?: number;
  currency?: string;
  rawFields?: Record<string, any>;
}

export interface ImportSummary {
  totalRows: number;
  importedCount: number;
  updatedCount?: number;
  duplicatesCount: number;
  missingNameCount: number;
  sourceName: string;
  skippedRows: Array<{
    rowNumber: number;
    businessName?: string;
    reason: string;
  }>;
}

export type PhoneFilter = 'all' | 'has_phone' | 'no_phone';
export type FollowUpFilter = 'all' | 'due_today' | 'overdue' | 'has_followup' | 'no_followup';
export type ContactFilter = 'all' | 'contacted' | 'uncontacted';
export type NotesFilter = 'all' | 'has_notes' | 'no_notes';

export interface LeadFilterState {
  search: string;
  status: string;
  tier: string;
  phoneFilter: PhoneFilter;
  followUpFilter: FollowUpFilter;
  contactFilter: ContactFilter;
  notesFilter: NotesFilter;
  minRating: number;
  minReviews: number;
  city: string;
  category: string;
  sortBy: 'score' | 'rating' | 'reviews' | 'images' | 'name' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface ConversionMetrics {
  contactRate: number;  // (Contacted / Total Leads) * 100
  replyRate: number;    // (Replied / Contacted) * 100
  interestRate: number; // (Interested / Replied) * 100
  demoRate: number;     // (Demo Sent / Interested) * 100
  winRate: number;      // (Won / Demo Sent) * 100
}

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  repliedLeads: number;
  interestedLeads: number;
  demoSentLeads: number;
  followUpLeads: number;
  negotiatingLeads: number;
  wonLeads: number;
  lostLeads: number;
  notInterestedLeads: number;
  tierCounts: {
    A: number;
    B: number;
    C: number;
  };
  phoneAvailableCount: number;
  todayOutreachCount: number;
  dailyGoal: number;
  potentialLeads: number;
  responseRate: number | null;
  overdueFollowUpsCount: number;
  todayFollowUpsCount: number;
  interestedWithoutFollowUpCount: number;
  repliedWithoutFollowUpCount: number;
  conversionMetrics: ConversionMetrics;
}
