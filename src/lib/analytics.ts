import type { Lead } from '../types/lead';
import type {
  TimeRange,
  FunnelStep,
  TierPerformance,
  CategoryPerformance,
  RevenueMetrics,
  OutreachActivityMetrics,
  FollowUpHealthMetrics,
  SalesVelocityMetrics,
  RecentActivityItem,
  AnalyticsData,
  DailyActivity,
} from '../types/analytics';
import { getTodayLocalDateString, addDaysToLocalDate, getFollowUpUrgency } from './dateUtils';

// Helper: safe percentage calculation
export function safePercentage(numerator: number, denominator: number, precision = 1): number {
  if (!denominator || denominator <= 0 || !numerator || numerator < 0) return 0;
  const val = (numerator / denominator) * 100;
  return Number(val.toFixed(precision));
}

// Helper: safe average calculation (supports sum & count OR array of numbers)
export function safeAverage(sumOrItems: number | number[], countOrPrecision?: number, precision = 1): number {
  if (Array.isArray(sumOrItems)) {
    if (sumOrItems.length === 0) return 0;
    const prec = countOrPrecision ?? 1;
    const sum = sumOrItems.reduce((acc, val) => acc + (val || 0), 0);
    return Number((sum / sumOrItems.length).toFixed(prec));
  }
  const count = countOrPrecision ?? 0;
  if (!count || count <= 0) return 0;
  return Number((sumOrItems / count).toFixed(precision));
}

// Helper: format currency
export function formatCurrency(amount: number, currency = '₹'): string {
  const symbol = currency === 'USD' || currency === '$' ? '$' : '₹';
  if (!amount || isNaN(amount)) return `${symbol}0`;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

// 1. Conversion Metrics
export function getConversionMetrics(leads: Lead[]) {
  const total = leads.length;
  let contacted = 0;
  let replied = 0;
  let interested = 0;
  let demoSent = 0;
  let won = 0;

  leads.forEach((l) => {
    const s = (l.status || '').trim().toLowerCase();
    const isNew = s === 'new' && !l.contactedAt && (!l.contactAttempts || l.contactAttempts === 0);
    const isContacted = !isNew;
    const isReplied = ['replied', 'interested', 'demo sent', 'follow-up', 'negotiating', 'won'].includes(s) || !!l.repliedAt;
    const isInterested = ['interested', 'demo sent', 'follow-up', 'negotiating', 'won'].includes(s) || !!l.interestedAt;
    const isDemoSent = ['demo sent', 'negotiating', 'won'].includes(s) || !!l.demoSentAt;
    const isWon = s === 'won' || !!l.wonAt;

    if (isContacted) contacted++;
    if (isReplied) replied++;
    if (isInterested) interested++;
    if (isDemoSent) demoSent++;
    if (isWon) won++;
  });

  return {
    total,
    contacted,
    replied,
    interested,
    demoSent,
    won,
    contactRate: safePercentage(contacted, total),
    replyRate: safePercentage(replied, contacted),
    interestRate: safePercentage(interested, replied),
    demoRate: safePercentage(demoSent, interested),
    winRate: safePercentage(won, demoSent),
    overallConversionRate: safePercentage(won, total),
  };
}

// 2. Funnel Steps
export function getFunnelSteps(leads: Lead[]): FunnelStep[] {
  const m = getConversionMetrics(leads);

  return [
    {
      stage: 'Total Leads',
      label: 'Prospects Discovered',
      count: m.total,
      percentageOfTotal: m.total > 0 ? 100 : 0,
      conversionFromPrev: m.total > 0 ? 100 : 0,
    },
    {
      stage: 'Contacted',
      label: 'Contacted via WhatsApp',
      count: m.contacted,
      percentageOfTotal: safePercentage(m.contacted, m.total),
      conversionFromPrev: safePercentage(m.contacted, m.total),
    },
    {
      stage: 'Replied',
      label: 'Replied to Outreach',
      count: m.replied,
      percentageOfTotal: safePercentage(m.replied, m.total),
      conversionFromPrev: safePercentage(m.replied, m.contacted),
    },
    {
      stage: 'Interested',
      label: 'Expressed Interest',
      count: m.interested,
      percentageOfTotal: safePercentage(m.interested, m.total),
      conversionFromPrev: safePercentage(m.interested, m.replied),
    },
    {
      stage: 'Demo Sent',
      label: 'Website Demo Delivered',
      count: m.demoSent,
      percentageOfTotal: safePercentage(m.demoSent, m.total),
      conversionFromPrev: safePercentage(m.demoSent, m.interested),
    },
    {
      stage: 'Won',
      label: 'Deals Won',
      count: m.won,
      percentageOfTotal: safePercentage(m.won, m.total),
      conversionFromPrev: safePercentage(m.won, m.demoSent),
    },
  ];
}

// 3. Outreach Activity & Daily Chart
export function getOutreachActivityMetrics(leads: Lead[], daysWindow: 7 | 30 = 7): OutreachActivityMetrics {
  const todayStr = getTodayLocalDateString();
  const todayDate = new Date(todayStr);

  // Generate date bins for the window
  const dailyMap = new Map<string, { attempts: number; contacts: number; dayLabel: string }>();
  for (let i = daysWindow - 1; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    dailyMap.set(dateStr, { attempts: 0, contacts: 0, dayLabel });
  }

  let totalContacted = 0;
  let totalAttempts = 0;
  let contactsToday = 0;
  let contactsThisWeek = 0;
  let contactsThisMonth = 0;

  const sevenDaysAgoStr = addDaysToLocalDate(-7);
  const thirtyDaysAgoStr = addDaysToLocalDate(-30);

  leads.forEach((l) => {
    const attempts = l.contactAttempts ?? (l.status === 'Contacted' ? 1 : 0);
    const isContacted = l.status !== 'New' || !!l.contactedAt || attempts > 0;

    if (isContacted) {
      totalContacted++;
      totalAttempts += Math.max(1, attempts);
    }

    // Inspect timestamps
    const contactDate = l.contactedAt ? l.contactedAt.slice(0, 10) : undefined;
    const lastDate = l.lastContactedAt ? l.lastContactedAt.slice(0, 10) : contactDate;

    if (lastDate) {
      if (lastDate === todayStr) {
        contactsToday++;
      }
      if (lastDate >= sevenDaysAgoStr) {
        contactsThisWeek++;
      }
      if (lastDate >= thirtyDaysAgoStr) {
        contactsThisMonth++;
      }

      if (dailyMap.has(lastDate)) {
        const bin = dailyMap.get(lastDate)!;
        bin.contacts += 1;
        bin.attempts += Math.max(1, attempts);
      }
    }
  });

  const dailyTrend: DailyActivity[] = Array.from(dailyMap.entries()).map(([dateStr, data]) => ({
    dateStr,
    dayLabel: data.dayLabel,
    attempts: data.attempts,
    contacts: data.contacts,
  }));

  const avgAttemptsPerLead = safeAverage(totalAttempts, totalContacted);

  return {
    totalContacted,
    totalAttempts,
    avgAttemptsPerLead,
    contactsToday,
    contactsThisWeek,
    contactsThisMonth,
    dailyTrend,
  };
}

// 4. Tier Performance
export function getTierPerformance(leads: Lead[]): TierPerformance[] {
  const tiers = Array.from(new Set(leads.map((l) => l.leadTier || 'Unassigned')));

  // Sort tiers: A, B, C first, then others
  tiers.sort((a, b) => {
    const order: Record<string, number> = { A: 1, B: 2, C: 3 };
    const orderA = order[a] ?? 99;
    const orderB = order[b] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });

  return tiers.map((tier) => {
    const tierLeads = leads.filter((l) => (l.leadTier || 'Unassigned') === tier);
    const totalLeads = tierLeads.length;

    let contacted = 0;
    let replied = 0;
    let interested = 0;
    let demoSent = 0;
    let won = 0;
    let lost = 0;
    let wonRevenue = 0;
    let dealsCount = 0;

    tierLeads.forEach((l) => {
      const s = (l.status || '').trim().toLowerCase();
      const isNew = s === 'new' && !l.contactedAt && (!l.contactAttempts || l.contactAttempts === 0);
      const isContacted = !isNew;
      const isReplied = ['replied', 'interested', 'demo sent', 'follow-up', 'negotiating', 'won'].includes(s) || !!l.repliedAt;
      const isInterested = ['interested', 'demo sent', 'follow-up', 'negotiating', 'won'].includes(s) || !!l.interestedAt;
      const isDemoSent = ['demo sent', 'negotiating', 'won'].includes(s) || !!l.demoSentAt;
      const isWon = s === 'won' || !!l.wonAt;
      const isLost = s === 'lost' || s === 'not interested';

      if (isContacted) contacted++;
      if (isReplied) replied++;
      if (isInterested) interested++;
      if (isDemoSent) demoSent++;
      if (isWon) {
        won++;
        const deal = l.dealValue ?? l.quotedAmount ?? 0;
        if (deal > 0) {
          wonRevenue += deal;
          dealsCount++;
        }
      }
      if (isLost) lost++;
    });

    return {
      tier,
      totalLeads,
      contacted,
      replied,
      interested,
      demoSent,
      won,
      lost,
      contactRate: safePercentage(contacted, totalLeads),
      replyRate: safePercentage(replied, contacted),
      winRate: safePercentage(won, demoSent > 0 ? demoSent : contacted),
      wonRevenue,
      avgDealValue: safeAverage(wonRevenue, dealsCount, 0),
    };
  });
}

// 5. Category Performance
export function getCategoryPerformance(leads: Lead[]): CategoryPerformance[] {
  const categories = Array.from(new Set(leads.map((l) => l.category || 'General')));

  const list = categories.map((category) => {
    const catLeads = leads.filter((l) => (l.category || 'General') === category);
    const totalLeads = catLeads.length;

    let contacted = 0;
    let replied = 0;
    let interested = 0;
    let demoSent = 0;
    let won = 0;
    let lost = 0;
    let wonRevenue = 0;
    let dealsCount = 0;

    catLeads.forEach((l) => {
      const s = (l.status || '').trim().toLowerCase();
      const isNew = s === 'new' && !l.contactedAt && (!l.contactAttempts || l.contactAttempts === 0);
      const isContacted = !isNew;
      const isReplied = ['replied', 'interested', 'demo sent', 'follow-up', 'negotiating', 'won'].includes(s) || !!l.repliedAt;
      const isInterested = ['interested', 'demo sent', 'follow-up', 'negotiating', 'won'].includes(s) || !!l.interestedAt;
      const isDemoSent = ['demo sent', 'negotiating', 'won'].includes(s) || !!l.demoSentAt;
      const isWon = s === 'won' || !!l.wonAt;
      const isLost = s === 'lost' || s === 'not interested';

      if (isContacted) contacted++;
      if (isReplied) replied++;
      if (isInterested) interested++;
      if (isDemoSent) demoSent++;
      if (isWon) {
        won++;
        const deal = l.dealValue ?? l.quotedAmount ?? 0;
        if (deal > 0) {
          wonRevenue += deal;
          dealsCount++;
        }
      }
      if (isLost) lost++;
    });

    return {
      category,
      leads: totalLeads,
      contacted,
      replied,
      interested,
      demoSent,
      won,
      lost,
      contactRate: safePercentage(contacted, totalLeads),
      replyRate: safePercentage(replied, contacted),
      winRate: safePercentage(won, demoSent > 0 ? demoSent : contacted),
      wonRevenue,
      avgDealValue: safeAverage(wonRevenue, dealsCount, 0),
    };
  });

  // Sort: won DESC, then interested DESC, then leads DESC
  list.sort((a, b) => {
    if (b.won !== a.won) return b.won - a.won;
    if (b.interested !== a.interested) return b.interested - a.interested;
    return b.leads - a.leads;
  });

  return list;
}

// 6. Revenue Metrics
export function getRevenueMetrics(leads: Lead[]): RevenueMetrics {
  let wonRevenue = 0;
  let pipelineValue = 0;
  let wonDealsCount = 0;

  leads.forEach((l) => {
    const s = (l.status || '').trim().toLowerCase();
    const deal = l.dealValue ?? l.quotedAmount ?? 0;
    const val = l.dealValue ?? (l.quotedAmount && l.quotedAmount > 0 ? l.quotedAmount : 0);

    if (s === 'won' || !!l.wonAt) {
      if (deal > 0) {
        wonRevenue += deal;
        wonDealsCount++;
      }
    } else if (['interested', 'demo sent', 'follow-up', 'negotiating'].includes(s)) {
      if (val > 0) {
        pipelineValue += val;
      }
    }
  });

  return {
    wonRevenue,
    pipelineValue,
    potentialRevenue: wonRevenue + pipelineValue,
    avgWonDeal: safeAverage(wonRevenue, wonDealsCount, 0),
    dealsWithRevenueCount: wonDealsCount,
    currencySymbol: '₹',
  };
}

// 7. Follow-up Health Metrics
export function getFollowUpHealthMetrics(leads: Lead[]): FollowUpHealthMetrics {
  let overdue = 0;
  let dueToday = 0;
  let upcoming = 0;
  let completed = 0;
  let needsSchedulingContacted = 0;
  let needsSchedulingReplied = 0;
  let needsSchedulingInterested = 0;

  leads.forEach((l) => {
    if (l.followUpDate) {
      const urgency = getFollowUpUrgency(l.followUpDate);
      if (urgency === 'overdue') overdue++;
      else if (urgency === 'today') dueToday++;
      else upcoming++;
    } else {
      if (l.status === 'Contacted') needsSchedulingContacted++;
      else if (l.status === 'Replied') needsSchedulingReplied++;
      else if (l.status === 'Interested') needsSchedulingInterested++;
    }

    // Completed follow-ups check
    if (l.status === 'Won' || (l.contactAttempts && l.contactAttempts > 1)) {
      completed++;
    }
  });

  return {
    overdue,
    dueToday,
    upcoming,
    completed,
    needsSchedulingContacted,
    needsSchedulingReplied,
    needsSchedulingInterested,
    totalNeedsScheduling: needsSchedulingContacted + needsSchedulingReplied + needsSchedulingInterested,
  };
}

// 8. Sales Velocity
export function getSalesVelocity(leads: Lead[]): SalesVelocityMetrics {
  let contactedToRepliedDiffs: number[] = [];
  let repliedToInterestedDiffs: number[] = [];
  let interestedToDemoDiffs: number[] = [];
  let demoToWonDiffs: number[] = [];
  let overallCycleDiffs: number[] = [];

  const msInDay = 1000 * 60 * 60 * 24;

  leads.forEach((l) => {
    const tContacted = l.contactedAt ? new Date(l.contactedAt).getTime() : null;
    const tReplied = l.repliedAt ? new Date(l.repliedAt).getTime() : null;
    const tInterested = l.interestedAt ? new Date(l.interestedAt).getTime() : null;
    const tDemo = l.demoSentAt ? new Date(l.demoSentAt).getTime() : null;
    const tWon = l.wonAt ? new Date(l.wonAt).getTime() : null;

    if (tContacted && tReplied && tReplied >= tContacted) {
      contactedToRepliedDiffs.push((tReplied - tContacted) / msInDay);
    }
    if (tReplied && tInterested && tInterested >= tReplied) {
      repliedToInterestedDiffs.push((tInterested - tReplied) / msInDay);
    }
    if (tInterested && tDemo && tDemo >= tInterested) {
      interestedToDemoDiffs.push((tDemo - tInterested) / msInDay);
    }
    if (tDemo && tWon && tWon >= tDemo) {
      demoToWonDiffs.push((tWon - tDemo) / msInDay);
    }
    if (tContacted && tWon && tWon >= tContacted) {
      overallCycleDiffs.push((tWon - tContacted) / msInDay);
    }
  });

  const calcMean = (arr: number[]) => (arr.length > 0 ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : null);

  return {
    contactedToRepliedDays: calcMean(contactedToRepliedDiffs),
    repliedToInterestedDays: calcMean(repliedToInterestedDiffs),
    interestedToDemoDays: calcMean(interestedToDemoDiffs),
    demoToWonDays: calcMean(demoToWonDiffs),
    overallSalesCycleDays: calcMean(overallCycleDiffs),
  };
}

// 9. Top Opportunities (High Value Active Prospects)
export function getTopOpportunities(leads: Lead[], limit = 6): Lead[] {
  const activeStatuses = ['negotiating', 'demo sent', 'interested', 'replied', 'contacted'];
  const activeLeads = leads.filter((l) => activeStatuses.includes((l.status || '').toLowerCase()));

  // Stage weight for sorting
  const stageWeights: Record<string, number> = {
    negotiating: 100,
    'demo sent': 80,
    interested: 60,
    replied: 40,
    contacted: 20,
  };

  return [...activeLeads]
    .sort((a, b) => {
      const sA = (a.status || '').toLowerCase();
      const sB = (b.status || '').toLowerCase();
      const weightA = (stageWeights[sA] || 0) + (a.leadScore || 0) + (a.dealValue || a.quotedAmount ? 20 : 0);
      const weightB = (stageWeights[sB] || 0) + (b.leadScore || 0) + (b.dealValue || b.quotedAmount ? 20 : 0);
      return weightB - weightA;
    })
    .slice(0, limit);
}

// 10. Recent Sales Activity Timeline (Derived from stored timestamps)
export function getRecentActivities(leads: Lead[], limit = 10): RecentActivityItem[] {
  const activities: RecentActivityItem[] = [];

  leads.forEach((l) => {
    if (l.wonAt) {
      activities.push({
        id: `won_${l.id}`,
        leadId: l.id,
        businessName: l.businessName,
        actionType: 'won',
        timestamp: l.wonAt,
        description: `Deal Won! ${l.dealValue ? `(${formatCurrency(l.dealValue)})` : ''}`,
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      });
    }
    if (l.demoSentAt) {
      activities.push({
        id: `demo_${l.id}`,
        leadId: l.id,
        businessName: l.businessName,
        actionType: 'demo_sent',
        timestamp: l.demoSentAt,
        description: 'Website demo sent to client',
        badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      });
    }
    if (l.interestedAt) {
      activities.push({
        id: `int_${l.id}`,
        leadId: l.id,
        businessName: l.businessName,
        actionType: 'interested',
        timestamp: l.interestedAt,
        description: 'Client expressed interest in web design',
        badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      });
    }
    if (l.repliedAt) {
      activities.push({
        id: `rep_${l.id}`,
        leadId: l.id,
        businessName: l.businessName,
        actionType: 'replied',
        timestamp: l.repliedAt,
        description: 'Prospect replied on WhatsApp',
        badgeColor: 'text-amber-700 bg-amber-50 border-amber-200',
      });
    }
    if (l.lastContactedAt) {
      activities.push({
        id: `contact_${l.id}`,
        leadId: l.id,
        businessName: l.businessName,
        actionType: 'contacted',
        timestamp: l.lastContactedAt,
        description: `Outreach completed (Attempt #${l.contactAttempts || 1})`,
        badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
      });
    }
  });

  // Sort newest timestamp first
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return activities.slice(0, limit);
}

// 11. Consolidated Analytics Snapshot
export function computeAnalyticsData(leads: Lead[], timeRange: TimeRange = 'all'): AnalyticsData {
  const daysWindow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 7;

  return {
    timeRange,
    funnelSteps: getFunnelSteps(leads),
    outreach: getOutreachActivityMetrics(leads, daysWindow),
    tierPerformance: getTierPerformance(leads),
    categoryPerformance: getCategoryPerformance(leads),
    revenue: getRevenueMetrics(leads),
    followUpHealth: getFollowUpHealthMetrics(leads),
    salesVelocity: getSalesVelocity(leads),
    topOpportunities: getTopOpportunities(leads),
    recentActivities: getRecentActivities(leads),
  };
}
