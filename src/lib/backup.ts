import type { Lead } from '../types/lead';

export interface LeadFlowBackup {
  app: 'LeadFlow';
  version: number;
  exportedAt: string;
  leadCount: number;
  leads: Lead[];
  metadata?: {
    totalLeads: number;
    wonRevenue: number;
    appName: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: LeadFlowBackup;
  leadCount?: number;
}

export const CURRENT_BACKUP_VERSION = 1;

/**
 * Creates a structured JSON backup object from the current CRM state
 */
export function createBackup(leads: Lead[]): LeadFlowBackup {
  const wonRevenue = leads
    .filter((l) => l.status === 'Won')
    .reduce((sum, l) => sum + (l.dealValue ?? l.quotedAmount ?? 0), 0);

  return {
    app: 'LeadFlow',
    version: CURRENT_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    leadCount: leads.length,
    leads,
    metadata: {
      totalLeads: leads.length,
      wonRevenue,
      appName: 'LeadFlow - WhatsApp Outreach CRM',
    },
  };
}

/**
 * Downloads a LeadFlowBackup as a formatted .json file in the browser
 */
export function downloadBackup(backup: LeadFlowBackup, filename?: string) {
  const dateStr = new Date().toISOString().slice(0, 10);
  const name = filename || `leadflow_backup_${dateStr}_${backup.leadCount}_leads.json`;
  const jsonContent = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates any raw parsed object to confirm it is a safe, authentic LeadFlow backup
 */
export function validateBackup(parsed: any): ValidationResult {
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, error: 'Backup file is empty or is not a valid JSON object.' };
  }

  if (parsed.app !== 'LeadFlow') {
    return {
      valid: false,
      error: 'Invalid backup file: header does not match LeadFlow format.',
    };
  }

  if (typeof parsed.version !== 'number' || parsed.version < 1) {
    return { valid: false, error: 'Invalid or missing data version number in backup file.' };
  }

  if (!Array.isArray(parsed.leads)) {
    return { valid: false, error: 'Missing or malformed "leads" array in backup file.' };
  }

  // Validate leads inside the array
  for (let i = 0; i < parsed.leads.length; i++) {
    const l = parsed.leads[i];
    if (!l || typeof l !== 'object') {
      return { valid: false, error: `Corrupted lead record at index #${i}.` };
    }
    if (!l.id || typeof l.id !== 'string') {
      return { valid: false, error: `Lead at index #${i} is missing a unique "id".` };
    }
    if (!l.businessName || typeof l.businessName !== 'string') {
      return { valid: false, error: `Lead at index #${i} is missing "businessName".` };
    }
  }

  return {
    valid: true,
    data: parsed as LeadFlowBackup,
    leadCount: parsed.leads.length,
  };
}

/**
 * Reads an uploaded File from an HTML file input and validates its content
 */
export async function readAndValidateBackupFile(file: File): Promise<ValidationResult> {
  if (!file.name.toLowerCase().endsWith('.json')) {
    return { valid: false, error: 'Please select a valid LeadFlow .json backup file.' };
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    return validateBackup(parsed);
  } catch (err: any) {
    return {
      valid: false,
      error: `Failed to read JSON backup file: ${err.message || 'Malformed JSON syntax'}`,
    };
  }
}
