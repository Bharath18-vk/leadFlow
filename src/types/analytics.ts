import type { Lead, LeadStatus, LeadTier } from './lead';

export type TimeRange = 'all' | 'today' | '7d' | '30d';

export interface FunnelStep {
  stage: LeadStatus | 'Total Leads';
  label: string;
  count: number;
  percentageOfTotal: number;
  conversionFromPrev: number; // percentage from previous step
}

export interface TierPerformance {
  tier: LeadTier | string;
  totalLeads: number;
  contacted: number;
  replied: number;
  interested: number;
  demoSent: number;
  won: number;
  lost: number;
  contactRate: number; // %
  replyRate: number;   // %
  winRate: number;     // %
  wonRevenue: number;
  avgDealValue: number;
}

export interface CategoryPerformance {
  category: string;
  leads: number;
  contacted: number;
  replied: number;
  interested: number;
  demoSent: number;
  won: number;
  lost: number;
  contactRate: number; // %
  replyRate: number;   // %
  winRate: number;     // %
  wonRevenue: number;
  avgDealValue: number;
}

export interface RevenueMetrics {
  wonRevenue: number;
  pipelineValue: number;
  potentialRevenue: number; // wonRevenue + pipelineValue
  avgWonDeal: number;
  dealsWithRevenueCount: number;
  currencySymbol: string;
}

export interface DailyActivity {
  dateStr: string;   // YYYY-MM-DD
  dayLabel: string;  // e.g. Mon, Tue, 10 Sep
  attempts: number;
  contacts: number;
}

export interface OutreachActivityMetrics {
  totalContacted: number;
  totalAttempts: number;
  avgAttemptsPerLead: number;
  contactsToday: number;
  contactsThisWeek: number;
  contactsThisMonth: number;
  dailyTrend: DailyActivity[];
}

export interface FollowUpHealthMetrics {
  overdue: number;
  dueToday: number;
  upcoming: number;
  completed: number;
  needsSchedulingContacted: number;
  needsSchedulingReplied: number;
  needsSchedulingInterested: number;
  totalNeedsScheduling: number;
}

export interface SalesVelocityMetrics {
  contactedToRepliedDays: number | null;
  repliedToInterestedDays: number | null;
  interestedToDemoDays: number | null;
  demoToWonDays: number | null;
  overallSalesCycleDays: number | null;
}

export interface RecentActivityItem {
  id: string;
  leadId: string;
  businessName: string;
  actionType: 'contacted' | 'replied' | 'interested' | 'demo_sent' | 'won' | 'lost' | 'followup_scheduled';
  timestamp: string;
  description: string;
  badgeColor: string;
}

export interface AnalyticsData {
  timeRange: TimeRange;
  funnelSteps: FunnelStep[];
  outreach: OutreachActivityMetrics;
  tierPerformance: TierPerformance[];
  categoryPerformance: CategoryPerformance[];
  revenue: RevenueMetrics;
  followUpHealth: FollowUpHealthMetrics;
  salesVelocity: SalesVelocityMetrics;
  topOpportunities: Lead[];
  recentActivities: RecentActivityItem[];
}
