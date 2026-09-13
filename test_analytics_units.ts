import assert from 'node:assert/strict';
import type { Lead } from './src/types/lead';
import {
  safePercentage,
  safeAverage,
  formatCurrency,
  getConversionMetrics,
  getFunnelSteps,
  getRevenueMetrics,
  getSalesVelocity,
  getTierPerformance,
  getCategoryPerformance,
  getTopOpportunities,
  computeAnalyticsData,
} from './src/lib/analytics';

console.log('===============================================================');
console.log('  STARTING UNIT TESTS: ANALYTICS & BI CALCULATION LAYER');
console.log('===============================================================\n');

function createSampleLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead-test-' + Math.random().toString(36).slice(2, 9),
    businessName: 'Apex Studio',
    category: 'Interior Design',
    phone: '+91 98765 43210',
    address: '123 MG Road',
    city: 'Bengaluru',
    rating: 4.8,
    reviews: 120,
    images: 25,
    leadScore: 85,
    leadTier: 'A',
    status: 'New',
    contactAttempts: 0,
    tags: ['Interior'],
    notes: '',
    rawFields: {},
    importSource: 'test.xlsx',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

// -------------------------------------------------------------
// TEST 1: Safe Math Helpers (Division by Zero, Negatives, Formatting)
// -------------------------------------------------------------
console.log('Test 1: Safe math helpers (safePercentage, safeAverage, formatCurrency)...');
assert.equal(safePercentage(0, 0), 0, '0/0 should return 0');
assert.equal(safePercentage(10, 0), 0, '10/0 should return 0 (no Infinity)');
assert.equal(safePercentage(0, 50), 0, '0/50 should return 0');
assert.equal(safePercentage(-5, 50), 0, 'Negative numerator should return 0');
assert.equal(safePercentage(1, 3, 1), 33.3, '1/3 to 1 precision should be 33.3');
assert.equal(safePercentage(1, 4, 1), 25, '1/4 should be 25');

assert.equal(safeAverage([], 1), 0, 'Average of empty list is 0');
assert.equal(safeAverage([10, 20, 30], 1), 20, 'Average of [10, 20, 30] is 20');
assert.equal(safeAverage(60, 3), 20, 'safeAverage(60, 3) is 20');
assert.equal(safeAverage(0, 0), 0, 'safeAverage(0, 0) is 0');
assert.equal(formatCurrency(12500, '₹'), '₹12,500', 'formatCurrency formats Indian Rupee with commas');
assert.equal(formatCurrency(0, '₹'), '₹0', 'formatCurrency handles 0');
console.log('✓ Test 1 passed.\n');

// -------------------------------------------------------------
// TEST 2: Zero Leads State Resilience
// -------------------------------------------------------------
console.log('Test 2: Zero leads state resilience...');
const emptyLeads: Lead[] = [];
const emptyMetrics = getConversionMetrics(emptyLeads);
assert.equal(emptyMetrics.contactRate, 0);
assert.equal(emptyMetrics.replyRate, 0);
assert.equal(emptyMetrics.interestRate, 0);
assert.equal(emptyMetrics.demoRate, 0);
assert.equal(emptyMetrics.winRate, 0);

const emptyFunnel = getFunnelSteps(emptyLeads);
assert.equal(emptyFunnel.length, 6);
emptyFunnel.forEach((step) => {
  assert.equal(step.count, 0);
  assert.equal(step.percentageOfTotal, 0);
  assert.equal(step.conversionFromPrev, 0);
});

const emptyRevenue = getRevenueMetrics(emptyLeads);
assert.equal(emptyRevenue.wonRevenue, 0);
assert.equal(emptyRevenue.pipelineValue, 0);
assert.equal(emptyRevenue.potentialRevenue, 0);
assert.equal(emptyRevenue.avgWonDeal, 0);

const emptyVelocity = getSalesVelocity(emptyLeads);
assert.equal(emptyVelocity.contactedToRepliedDays, null);
assert.equal(emptyVelocity.overallSalesCycleDays, null);

const emptyAnalytics = computeAnalyticsData(emptyLeads, 'all');
assert.equal(emptyAnalytics.timeRange, 'all');
assert.equal(emptyAnalytics.funnelSteps.length, 6);
assert.equal(emptyAnalytics.topOpportunities.length, 0);
assert.equal(emptyAnalytics.recentActivities.length, 0);
console.log('✓ Test 2 passed.\n');

// -------------------------------------------------------------
// TEST 3: Zero Denominators in Intermediate Conversion Rates
// -------------------------------------------------------------
console.log('Test 3: Zero denominators in intermediate conversion rates...');
// 10 leads, none contacted
const leadsUncontacted = Array.from({ length: 10 }, () => createSampleLead({ status: 'New' }));
const uncontactedMetrics = getConversionMetrics(leadsUncontacted);
assert.equal(uncontactedMetrics.contactRate, 0);
assert.equal(uncontactedMetrics.replyRate, 0);
assert.equal(uncontactedMetrics.interestRate, 0);
assert.equal(uncontactedMetrics.demoRate, 0);
assert.equal(uncontactedMetrics.winRate, 0);

// 10 leads, 5 contacted, 0 replied
const leadsContacted = [
  ...Array.from({ length: 5 }, () => createSampleLead({ status: 'Contacted', contactAttempts: 1 })),
  ...Array.from({ length: 5 }, () => createSampleLead({ status: 'New' })),
];
const contactedMetrics = getConversionMetrics(leadsContacted);
assert.equal(contactedMetrics.contactRate, 50);
assert.equal(contactedMetrics.replyRate, 0);
assert.equal(contactedMetrics.interestRate, 0);
assert.equal(contactedMetrics.demoRate, 0);
assert.equal(contactedMetrics.winRate, 0);

// 2 replied, 0 interested
const leadsReplied = [
  ...Array.from({ length: 2 }, () => createSampleLead({ status: 'Replied', contactAttempts: 1 })),
  ...Array.from({ length: 8 }, () => createSampleLead({ status: 'New' })),
];
const repliedMetrics = getConversionMetrics(leadsReplied);
assert.equal(repliedMetrics.contactRate, 20);
assert.equal(repliedMetrics.replyRate, 100);
assert.equal(repliedMetrics.interestRate, 0);
assert.equal(repliedMetrics.demoRate, 0);
assert.equal(repliedMetrics.winRate, 0);
console.log('✓ Test 3 passed.\n');

// -------------------------------------------------------------
// TEST 4: Revenue Metrics (Quoted, Deal Value, Pipeline, Fallbacks)
// -------------------------------------------------------------
console.log('Test 4: Revenue & Deal Tracking...');
const revenueLeads: Lead[] = [
  // Won lead with dealValue
  createSampleLead({
    status: 'Won',
    quotedAmount: 15000,
    dealValue: 12000,
  }),
  // Won lead with quotedAmount only (dealValue fallback)
  createSampleLead({
    status: 'Won',
    quotedAmount: 20000,
    dealValue: undefined,
  }),
  // Interested lead with quotedAmount (active pipeline)
  createSampleLead({
    status: 'Interested',
    quotedAmount: 25000,
  }),
  // Demo Sent lead with quotedAmount (active pipeline)
  createSampleLead({
    status: 'Demo Sent',
    quotedAmount: 30000,
  }),
  // Lost lead with quotedAmount (must NOT count in pipeline or won)
  createSampleLead({
    status: 'Lost',
    quotedAmount: 50000,
    dealValue: 40000,
  }),
  // New lead with quotedAmount (not in active pipeline until contacted)
  createSampleLead({
    status: 'New',
    quotedAmount: 10000,
  }),
];

const revMetrics = getRevenueMetrics(revenueLeads);
// wonRevenue = 12,000 + 20,000 = 32,000
assert.equal(revMetrics.wonRevenue, 32000, 'Won revenue should sum dealValue with quotedAmount fallback');
// pipelineValue = interested(25,000) + demo_sent(30,000) = 55,000
assert.equal(revMetrics.pipelineValue, 55000, 'Pipeline value should sum quoted amounts of active opportunities');
// potentialRevenue = won + pipeline = 32,000 + 55,000 = 87,000
assert.equal(revMetrics.potentialRevenue, 87000, 'Potential revenue should equal wonRevenue + pipelineValue');
// avgWonDeal = 32,000 / 2 = 16,000
assert.equal(revMetrics.avgWonDeal, 16000, 'Average won deal value should be 16,000');
assert.equal(revMetrics.dealsWithRevenueCount, 2, 'Two deals have won revenue');
console.log('✓ Test 4 passed.\n');

// -------------------------------------------------------------
// TEST 5: Sales Velocity Calculations & Sparse Data Guard
// -------------------------------------------------------------
console.log('Test 5: Sales velocity cycle days and sparse data guards...');
// Missing / sparse timestamps -> returns null (never fabricated 0 days)
const sparseLead = createSampleLead({
  status: 'Won',
  contactedAt: '2026-09-01T10:00:00Z',
  // missing intermediate timestamps
  wonAt: '2026-09-10T10:00:00Z',
});
const velocitySparse = getSalesVelocity([sparseLead]);
assert.equal(velocitySparse.contactedToRepliedDays, null, 'Sparse repliedAt should yield null');
assert.equal(velocitySparse.repliedToInterestedDays, null, 'Sparse interestedAt should yield null');
assert.equal(velocitySparse.overallSalesCycleDays, 9.0, 'Overall cycle from contactedAt to wonAt should be 9 days');

// Complete timestamps
const completeLead = createSampleLead({
  status: 'Won',
  contactedAt: '2026-09-01T10:00:00Z',
  repliedAt: '2026-09-03T10:00:00Z',    // 2 days
  interestedAt: '2026-09-06T10:00:00Z', // 3 days
  demoSentAt: '2026-09-08T10:00:00Z',   // 2 days
  wonAt: '2026-09-11T10:00:00Z',        // 3 days
});
const velocityComplete = getSalesVelocity([completeLead]);
assert.equal(velocityComplete.contactedToRepliedDays, 2.0);
assert.equal(velocityComplete.repliedToInterestedDays, 3.0);
assert.equal(velocityComplete.interestedToDemoDays, 2.0);
assert.equal(velocityComplete.demoToWonDays, 3.0);
assert.equal(velocityComplete.overallSalesCycleDays, 10.0);
console.log('✓ Test 5 passed.\n');

// -------------------------------------------------------------
// TEST 6: Tier & Category Performance Groupings
// -------------------------------------------------------------
console.log('Test 6: Tier & Category Performance Groupings...');
const groupedLeads: Lead[] = [
  createSampleLead({ leadTier: 'A', status: 'Won', dealValue: 50000, category: 'Interior' }),
  createSampleLead({ leadTier: 'A', status: 'Contacted', category: 'Interior' }),
  createSampleLead({ leadTier: 'B', status: 'Replied', category: 'Architect' }),
  createSampleLead({ leadTier: 'C', status: 'New', category: 'Modular Kitchen' }),
];

const tierPerf = getTierPerformance(groupedLeads);
assert.equal(tierPerf.length, 3, 'All 3 tiers (A, B, C) should be represented');
const tierA = tierPerf.find((t) => t.tier === 'A');
assert.ok(tierA);
assert.equal(tierA.totalLeads, 2);
assert.equal(tierA.won, 1);
assert.equal(tierA.wonRevenue, 50000);
assert.equal(tierA.winRate, 100.0, 'Win rate is won / demoSent = 1/1 = 100%');

const catPerf = getCategoryPerformance(groupedLeads);
assert.equal(catPerf.length, 3, 'Should have 3 distinct categories');
const interiorCat = catPerf.find((c) => c.category === 'Interior');
assert.ok(interiorCat);
assert.equal(interiorCat.leads, 2);
assert.equal(interiorCat.won, 1);
assert.equal(interiorCat.wonRevenue, 50000);
console.log('✓ Test 6 passed.\n');

// -------------------------------------------------------------
// TEST 7: Top Opportunities Sorting & Limits
// -------------------------------------------------------------
console.log('Test 7: Top opportunities priority ranking...');
const oppLeads: Lead[] = [
  createSampleLead({ businessName: 'Lead C-Low', leadTier: 'C', leadScore: 40, status: 'New' }),
  createSampleLead({ businessName: 'Lead A-High', leadTier: 'A', leadScore: 95, status: 'Interested', quotedAmount: 80000 }),
  createSampleLead({ businessName: 'Lead A-Mid', leadTier: 'A', leadScore: 80, status: 'Contacted' }),
  createSampleLead({ businessName: 'Lead B-High', leadTier: 'B', leadScore: 70, status: 'Replied' }),
  createSampleLead({ businessName: 'Lead Won', leadTier: 'A', leadScore: 99, status: 'Won' }), // Already closed won
  createSampleLead({ businessName: 'Lead Lost', leadTier: 'A', leadScore: 99, status: 'Lost' }), // Closed lost
];

const topOpps = getTopOpportunities(oppLeads, 3);
assert.equal(topOpps.length, 3, 'Should limit to top 3 opportunities');
// Closed leads (won/lost) must not appear in top unclosed opportunities
assert.ok(!topOpps.some((l) => l.status === 'Won' || l.status === 'Lost'));
assert.equal(topOpps[0].businessName, 'Lead A-High', 'Highest Tier A lead with score 95 and quote should rank #1');
assert.equal(topOpps[1].businessName, 'Lead B-High', 'Replied lead should rank ahead of unreplied contacted lead');
assert.equal(topOpps[2].businessName, 'Lead A-Mid', 'Contacted lead should rank #3');
console.log('✓ Test 7 passed.\n');

// -------------------------------------------------------------
// TEST 8: Immutability - Leads Array & Objects are Never Mutated
// -------------------------------------------------------------
console.log('Test 8: Lead array immutability...');
const immutableLeads: Lead[] = [
  Object.freeze(createSampleLead({ leadTier: 'A', status: 'New' })),
  Object.freeze(createSampleLead({ leadTier: 'B', status: 'Contacted', contactAttempts: 1 })),
  Object.freeze(createSampleLead({ leadTier: 'A', status: 'Won', dealValue: 25000 })),
];
Object.freeze(immutableLeads);

// Calling computeAnalyticsData on frozen leads array must NOT throw any mutation error
assert.doesNotThrow(() => {
  const result = computeAnalyticsData(immutableLeads, 'all');
  assert.equal(result.funnelSteps[0].count, 3);
  assert.equal(result.revenue.wonRevenue, 25000);
}, 'computeAnalyticsData must preserve pure immutability of leads array');
console.log('✓ Test 8 passed.\n');

console.log('===============================================================');
console.log('  ALL 8 ANALYTICS UNIT TESTS PASSED SUCCESSFULLY! 🎉');
console.log('===============================================================\n');
