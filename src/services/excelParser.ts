import * as XLSX from 'xlsx';
import type { Lead, ImportSummary } from '../types/lead';
import { normalizeRawRow } from './leadNormalizer';
import { isDuplicate } from './duplicateDetector';

const NAME_KEYWORDS = [
  'business', 'businessname', 'name', 'company', 'companyname',
  'title', 'shop', 'shopname', 'store', 'storename', 'lead', 'place'
];
const CONTACT_KEYWORDS = ['phone', 'mobile', 'contact', 'tel', 'cell', 'telephone', 'whatsapp'];
const OTHER_HEADER_KEYWORDS = [
  'rating', 'reviews', 'category', 'area', 'city', 'address', 'location',
  'status', 'notes', 'tier', 'maps', 'website', 'photos', 'images', 'rank'
];

function cleanHeaderKey(key: any): string {
  return String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function extractLocationFromText(text: any): string | undefined {
  if (!text) return undefined;
  const str = String(text).toLowerCase();
  const knownCities = [
    { pattern: 'avadi', name: 'Avadi, Chennai' },
    { pattern: 'chennai', name: 'Chennai' },
    { pattern: 'bengaluru', name: 'Bengaluru' },
    { pattern: 'bangalore', name: 'Bengaluru' },
    { pattern: 'mumbai', name: 'Mumbai' },
    { pattern: 'delhi', name: 'Delhi' },
    { pattern: 'hyderabad', name: 'Hyderabad' },
    { pattern: 'kolkata', name: 'Kolkata' },
    { pattern: 'pune', name: 'Pune' },
    { pattern: 'ahmedabad', name: 'Ahmedabad' },
    { pattern: 'jaipur', name: 'Jaipur' },
    { pattern: 'coimbatore', name: 'Coimbatore' },
    { pattern: 'kochi', name: 'Kochi' },
    { pattern: 'surat', name: 'Surat' },
    { pattern: 'lucknow', name: 'Lucknow' },
    { pattern: 'chandigarh', name: 'Chandigarh' },
    { pattern: 'noida', name: 'Noida' },
    { pattern: 'gurgaon', name: 'Gurugram' },
    { pattern: 'gurugram', name: 'Gurugram' },
  ];
  for (const { pattern, name } of knownCities) {
    if (str.includes(pattern)) {
      return name;
    }
  }
  return undefined;
}

function detectHeaderRowAndContext(
  grid: any[][],
  fileName = ''
): { headerRowIndex: number; locationHint?: string; score: number } {
  let bestRowIndex = 0;
  let maxScore = -1;
  let locationHint = extractLocationFromText(fileName);

  const maxScan = Math.min(grid.length, 35);
  for (let r = 0; r < maxScan; r++) {
    const row = grid[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    let score = 0;
    let hasName = false;
    let hasContact = false;

    if (!locationHint) {
      for (const cell of row) {
        const found = extractLocationFromText(cell);
        if (found) {
          locationHint = found;
          break;
        }
      }
    }

    for (const cell of row) {
      const cleaned = cleanHeaderKey(cell);
      if (!cleaned) continue;

      if (NAME_KEYWORDS.includes(cleaned)) {
        score += 4;
        hasName = true;
      } else if (CONTACT_KEYWORDS.includes(cleaned)) {
        score += 3;
        hasContact = true;
      } else if (OTHER_HEADER_KEYWORDS.some((k) => cleaned === k || cleaned.includes(k))) {
        score += 1;
      }
    }

    if (hasName) score += 3;
    if (hasContact) score += 3;

    if (score > maxScore) {
      maxScore = score;
      bestRowIndex = r;
    }
  }

  if (maxScore < 3) {
    bestRowIndex = 0;
  }

  return { headerRowIndex: bestRowIndex, locationHint, score: maxScore };
}

const SUMMARY_PATTERNS = [
  'summary',
  'total leads',
  'average rating',
  'average reviews',
  'contacted or beyond',
  'replied',
  'meetings booked',
  'won',
  'confirmed no website',
  'how to use',
  'yellow cells',
  'example row',
  'review tier',
  'caveat',
  'excluded',
  'data source',
];

function isSummaryOrFooterRow(rowObj: Record<string, any>, rowValues: any[]): boolean {
  const nonBlank = rowValues.filter(
    (v) => v !== null && v !== undefined && String(v).trim() !== ''
  );
  if (nonBlank.length === 0) return true;

  const firstVal = cleanHeaderKey(nonBlank[0]);
  for (const pat of SUMMARY_PATTERNS) {
    const cleanPat = cleanHeaderKey(pat);
    if (firstVal === cleanPat || firstVal.startsWith(cleanPat)) {
      return true;
    }
  }

  const nameKeys = ['business', 'business name', 'name', 'company', 'title'];
  for (const k of Object.keys(rowObj)) {
    const cleanedK = cleanHeaderKey(k);
    if (nameKeys.some((nk) => cleanHeaderKey(nk) === cleanedK)) {
      const nameVal = cleanHeaderKey(rowObj[k]);
      if (
        SUMMARY_PATTERNS.some(
          (pat) => cleanHeaderKey(pat) === nameVal || nameVal.startsWith(cleanHeaderKey(pat))
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

export async function parseLeadFile(
  file: File,
  existingLeads: Lead[] = []
): Promise<{ leads: Lead[]; summary: ImportSummary }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('The uploaded file has no sheets.');
        }

        // Scan sheets in workbook to pick the best sheet with actual leads
        let bestGrid: any[][] = [];
        let bestHeaderInfo: { headerRowIndex: number; locationHint?: string; score: number } = {
          headerRowIndex: 0,
          locationHint: undefined,
          score: -1,
        };

        for (const sheetName of workbook.SheetNames) {
          const ws = workbook.Sheets[sheetName];
          const testGrid = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });
          if (!testGrid || testGrid.length === 0) continue;

          const headerInfo = detectHeaderRowAndContext(testGrid, file.name);
          const isLeadsSheet = /leads|prospects|contacts|businesses|data/i.test(sheetName);
          const sheetBoost = isLeadsSheet ? 5 : 0;
          if (headerInfo.score + sheetBoost > bestHeaderInfo.score) {
            bestHeaderInfo = { ...headerInfo, score: headerInfo.score + sheetBoost };
            bestGrid = testGrid;
          }
        }

        const grid = bestGrid.length > 0 ? bestGrid : XLSX.utils.sheet_to_json<any[]>(workbook.Sheets[workbook.SheetNames[0]], { header: 1, defval: '' });

        if (!grid || grid.length === 0) {
          resolve({
            leads: [],
            summary: {
              totalRows: 0,
              importedCount: 0,
              duplicatesCount: 0,
              missingNameCount: 0,
              sourceName: file.name,
              skippedRows: [],
            },
          });
          return;
        }

        // Detect header row index & location hint
        const { headerRowIndex, locationHint } = bestHeaderInfo.score >= 0
          ? bestHeaderInfo
          : detectHeaderRowAndContext(grid, file.name);
        const headerRow = (grid[headerRowIndex] || []).map((c) => String(c ?? '').trim());

        // Extract and filter valid data rows
        interface PreparedRow {
          obj: Record<string, any>;
          rowIndex: number;
        }
        const dataRows: PreparedRow[] = [];

        for (let r = headerRowIndex + 1; r < grid.length; r++) {
          const rowValues = grid[r] || [];
          const hasContent = rowValues.some(
            (v) => v !== null && v !== undefined && String(v).trim() !== ''
          );
          if (!hasContent) continue;

          const rowObj: Record<string, any> = {};
          headerRow.forEach((colName, cIdx) => {
            const key = colName || `__EMPTY_${cIdx}`;
            rowObj[key] = rowValues[cIdx] !== undefined ? rowValues[cIdx] : '';
          });

          if (isSummaryOrFooterRow(rowObj, rowValues)) {
            continue; // Gracefully ignore notes, summary tables, and guide rows
          }

          dataRows.push({ obj: rowObj, rowIndex: r });
        }

        if (dataRows.length === 0) {
          resolve({
            leads: [],
            summary: {
              totalRows: 0,
              importedCount: 0,
              duplicatesCount: 0,
              missingNameCount: 0,
              sourceName: file.name,
              skippedRows: [],
            },
          });
          return;
        }

        const importedLeads: Lead[] = [];
        const processedInBatch: Lead[] = [];
        let duplicatesCount = 0;
        let missingNameCount = 0;
        let updatedCount = 0;
        let newLeadsCount = 0;
        const skippedRows: ImportSummary['skippedRows'] = [];

        const importSource = `import:${file.name}`;

        dataRows.forEach(({ obj: row, rowIndex }) => {
          const { lead, error } = normalizeRawRow(row, importSource, rowIndex, locationHint);

          if (!lead) {
            missingNameCount++;
            skippedRows.push({
              rowNumber: rowIndex + 1,
              businessName: 'N/A',
              reason: error || 'Missing business name',
            });
            return;
          }

          // 1. Intra-batch duplicate check (within the spreadsheet file itself)
          const batchDupCheck = isDuplicate(lead, processedInBatch);
          if (batchDupCheck.duplicate) {
            duplicatesCount++;
            skippedRows.push({
              rowNumber: rowIndex + 1,
              businessName: lead.businessName,
              reason: batchDupCheck.reason || 'Duplicate record within spreadsheet',
            });
            return;
          }

          // 2. Check if lead already exists in CRM (existingLeads)
          const existingMatch = isDuplicate(lead, existingLeads);
          if (existingMatch.duplicate && existingMatch.matchedLead) {
            const ex = existingMatch.matchedLead;
            const mergedLead: Lead = {
              ...lead,
              id: ex.id,
              placeId: ex.placeId || lead.placeId,
              // CRITICAL: Preserve all sales history and CRM fields without wiping
              status: ex.status || lead.status,
              contactAttempts: ex.contactAttempts ?? (ex.status === 'Contacted' ? 1 : 0),
              contactedAt: ex.contactedAt || lead.contactedAt,
              lastContactedAt: ex.lastContactedAt || lead.lastContactedAt,
              repliedAt: ex.repliedAt || lead.repliedAt,
              interestedAt: ex.interestedAt || lead.interestedAt,
              demoSentAt: ex.demoSentAt || lead.demoSentAt,
              wonAt: ex.wonAt || lead.wonAt,
              lostAt: ex.lostAt || lead.lostAt,
              followUpDate: ex.followUpDate || lead.followUpDate,
              notes: ex.notes || lead.notes || '',
              customMessage: ex.customMessage, // preserve custom edited message
              quotedAmount: ex.quotedAmount ?? lead.quotedAmount,
              dealValue: ex.dealValue ?? lead.dealValue,
              currency: ex.currency || lead.currency || 'INR',
              createdAt: ex.createdAt || lead.createdAt,
              updatedAt: new Date().toISOString(),
            };
            importedLeads.push(mergedLead);
            processedInBatch.push(mergedLead);
            updatedCount++;
            return;
          }

          // 3. Valid brand new lead
          importedLeads.push(lead);
          processedInBatch.push(lead);
          newLeadsCount++;
        });

        const summary: ImportSummary = {
          totalRows: dataRows.length,
          importedCount: newLeadsCount,
          updatedCount,
          duplicatesCount,
          missingNameCount,
          sourceName: file.name,
          skippedRows,
        };

        resolve({ leads: importedLeads, summary });
      } catch (err: any) {
        reject(new Error(`Failed to parse file: ${err.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file from disk.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export function exportLeadsToExcel(leads: Lead[], filename = 'leadflow_leads.xlsx'): void {
  const exportData = leads.map((l, index) => ({
    '#': index + 1,
    'Business Name': l.businessName,
    'Category': l.category,
    'Address': l.address || '',
    'Phone': l.phone || l.rawPhone || '',
    'Website': l.website || '',
    'Rating': l.rating,
    'Reviews': l.reviews,
    'Google Images': l.images,
    'Lead Score': l.leadScore,
    'Tier': `Tier ${l.leadTier}`,
    'Status': l.status,
    'Contact Attempts': l.contactAttempts ?? (l.status === 'Contacted' ? 1 : 0),
    'Contacted Date': l.contactedAt || '',
    'Last Contacted Date': l.lastContactedAt || '',
    'Replied Date': l.repliedAt || '',
    'Interested Date': l.interestedAt || '',
    'Demo Sent Date': l.demoSentAt || '',
    'Won Date': l.wonAt || '',
    'Lost Date': l.lostAt || '',
    'Follow-up Date': l.followUpDate || '',
    'Notes': l.notes || '',
    'Custom Message': l.customMessage || '',
    'Personalized WhatsApp Message': l.personalizedMessage || '',
    'Quoted Amount': l.quotedAmount ?? '',
    'Deal Value': l.dealValue ?? '',
    'Currency': l.currency || 'INR',
    'City': l.city,
    'Neighborhood': l.neighborhood || '',
    'Google Maps URL': l.googleMapsUrl || '',
    'placeId': l.placeId || '',
    'Import Source': l.importSource || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

  XLSX.writeFile(workbook, filename);
}
