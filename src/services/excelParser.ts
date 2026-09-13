import * as XLSX from 'xlsx';
import type { Lead, ImportSummary } from '../types/lead';
import { normalizeRawRow } from './leadNormalizer';
import { isDuplicate } from './duplicateDetector';

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

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: '',
        });

        if (rawRows.length === 0) {
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

        rawRows.forEach((row, index) => {
          const { lead, error } = normalizeRawRow(row, importSource, index);

          if (!lead) {
            missingNameCount++;
            skippedRows.push({
              rowNumber: index + 1,
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
              rowNumber: index + 1,
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
          totalRows: rawRows.length,
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
