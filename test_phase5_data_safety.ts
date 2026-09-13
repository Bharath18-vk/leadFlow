import assert from 'node:assert/strict';
import { createBackup, validateBackup, CURRENT_BACKUP_VERSION } from './src/lib/backup';
import { checkDataIntegrity } from './src/lib/dataIntegrity';
import { CURRENT_DATA_VERSION } from './src/lib/storage';
import type { Lead } from './src/types/lead';

console.log('===============================================================');
console.log('  STARTING PHASE 5 AUTOMATED TESTS: DATA SAFETY & POLISH');
console.log('===============================================================\n');

function createMockLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead-test-' + Math.random().toString(36).slice(2, 9),
    businessName: 'Modern Spaces Interiors',
    category: 'Interior Designer',
    phone: '+91 98765 43210',
    address: '45 Brigade Road',
    city: 'Bengaluru',
    rating: 4.9,
    reviews: 84,
    images: 30,
    leadScore: 92,
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
// TEST 1: Backup Creation and JSON Structure
// -------------------------------------------------------------
console.log('Test 1: Backup Creation and Schema Validation...');
const sampleLeads: Lead[] = [
  createMockLead({
    id: 'lead-1',
    businessName: 'Lead One',
    status: 'Won',
    dealValue: 25000,
    quotedAmount: 30000,
    notes: 'Agreed on 5-page website',
    followUpDate: '2026-09-15',
    contactAttempts: 2,
    contactedAt: '2026-09-01T10:00:00Z',
    wonAt: '2026-09-05T10:00:00Z',
  }),
  createMockLead({
    id: 'lead-2',
    businessName: 'Lead Two',
    status: 'Interested',
    quotedAmount: 18000,
  }),
];

const backup = createBackup(sampleLeads);
assert.equal(backup.app, 'LeadFlow');
assert.equal(backup.version, CURRENT_BACKUP_VERSION);
assert.equal(backup.leadCount, 2);
assert.equal(backup.leads.length, 2);
assert.equal(backup.metadata?.wonRevenue, 25000);
assert.ok(backup.exportedAt);

const validation = validateBackup(backup);
assert.equal(validation.valid, true, 'Valid backup must pass validateBackup');
assert.equal(validation.leadCount, 2);
console.log('✓ Test 1 passed.\n');

// -------------------------------------------------------------
// TEST 2: Rejection of Corrupt / Malformed Backup Files
// -------------------------------------------------------------
console.log('Test 2: Rejection of Corrupt / Malformed Backups...');
// Missing app header
assert.equal(validateBackup({ version: 1, leads: [] }).valid, false);
// Invalid version
assert.equal(validateBackup({ app: 'LeadFlow', version: 0, leads: [] }).valid, false);
// Missing leads array
assert.equal(validateBackup({ app: 'LeadFlow', version: 1 }).valid, false);
// Corrupted lead record (missing id)
assert.equal(
  validateBackup({
    app: 'LeadFlow',
    version: 1,
    leads: [{ businessName: 'No ID Co' }],
  }).valid,
  false,
  'Lead missing id must be rejected'
);
// Corrupted lead record (missing businessName)
assert.equal(
  validateBackup({
    app: 'LeadFlow',
    version: 1,
    leads: [{ id: '123' }],
  }).valid,
  false,
  'Lead missing businessName must be rejected'
);
console.log('✓ Test 2 passed.\n');

// -------------------------------------------------------------
// TEST 3: Data Integrity Scanner Diagnostics
// -------------------------------------------------------------
console.log('Test 3: Data Integrity Scanner Diagnostics...');
const problematicLeads: Lead[] = [
  // 1. Won lead with no deal value or quote
  createMockLead({ id: 'bad-1', businessName: 'No Deal Won', status: 'Won', dealValue: undefined, quotedAmount: undefined }),
  // 2. Negative deal value
  createMockLead({ id: 'bad-2', businessName: 'Negative Deal', status: 'Won', dealValue: -5000 }),
  // 3. Malformed follow-up date
  createMockLead({ id: 'bad-3', businessName: 'Malformed Date', followUpDate: '15/09/2026' }),
  // 4. Invalid phone (too short)
  createMockLead({ id: 'bad-4', businessName: 'Short Phone', phone: '123' }),
  // 5. Duplicate ID
  createMockLead({ id: 'bad-1', businessName: 'Duplicate ID Co' }),
  // 6. Healthy lead
  createMockLead({
    id: 'good-1',
    businessName: 'Perfect Lead',
    status: 'Contacted',
    contactAttempts: 1,
    contactedAt: '2026-09-08T10:00:00Z',
    phone: '+91 98765 43210',
    followUpDate: '2026-09-12',
  }),
];

const report = checkDataIntegrity(problematicLeads);
assert.ok(report.issuesCount >= 5, 'Must detect at least 5 integrity issues');
assert.ok(report.warningsCount >= 3, 'Must flag critical warnings');

const wonIssue = report.issues.find((i) => i.leadId === 'bad-1' && i.field === 'dealValue');
assert.ok(wonIssue, 'Must flag Won without deal value');

const negIssue = report.issues.find((i) => i.leadId === 'bad-2' && i.field === 'dealValue');
assert.ok(negIssue, 'Must flag negative deal value');

const dateIssue = report.issues.find((i) => i.leadId === 'bad-3' && i.field === 'followUpDate');
assert.ok(dateIssue, 'Must flag malformed date');

const phoneIssue = report.issues.find((i) => i.leadId === 'bad-4' && i.field === 'phone');
assert.ok(phoneIssue, 'Must flag invalid phone');

const dupIssue = report.issues.find((i) => i.leadId === 'bad-1' && i.field === 'id');
assert.ok(dupIssue, 'Must flag duplicate lead ID');
console.log('✓ Test 3 passed.\n');

// -------------------------------------------------------------
// TEST 4: Clean Leads Report (No False Positives)
// -------------------------------------------------------------
console.log('Test 4: Clean Leads Produce 0 Critical Warnings...');
const cleanLeads: Lead[] = [
  createMockLead({
    id: 'clean-1',
    businessName: 'Clean Co',
    status: 'Won',
    dealValue: 50000,
    phone: '+91 98765 11111',
    contactAttempts: 1,
    contactedAt: '2026-09-01T10:00:00Z',
    wonAt: '2026-09-05T10:00:00Z',
  }),
  createMockLead({
    id: 'clean-2',
    businessName: 'Clean Pipeline',
    status: 'Interested',
    quotedAmount: 25000,
    phone: '+91 98765 22222',
    followUpDate: '2026-09-15',
    contactAttempts: 1,
    contactedAt: '2026-09-02T10:00:00Z',
  }),
];

const cleanReport = checkDataIntegrity(cleanLeads);
assert.equal(cleanReport.warningsCount, 0, 'Clean leads must produce 0 warnings');
assert.equal(cleanReport.healthyCount, 2, 'Both clean leads must be marked healthy');
console.log('✓ Test 4 passed.\n');

// -------------------------------------------------------------
// TEST 5: Data Version Constant and Schema Safeguard
// -------------------------------------------------------------
console.log('Test 5: Storage Data Versioning & Schema Constants...');
assert.equal(CURRENT_DATA_VERSION, 1, 'Data version must be positive integer');
assert.equal(CURRENT_BACKUP_VERSION, 1, 'Backup version must be positive integer');
console.log('✓ Test 5 passed.\n');

console.log('===============================================================');
console.log('  ALL PHASE 5 DATA SAFETY TESTS PASSED! 🎉');
console.log('===============================================================\n');
