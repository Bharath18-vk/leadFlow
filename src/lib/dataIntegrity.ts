import type { Lead } from '../types/lead';

export interface IntegrityIssue {
  leadId: string;
  businessName: string;
  field: string;
  severity: 'warning' | 'info';
  message: string;
  suggestion: string;
}

export interface IntegrityReport {
  totalLeads: number;
  issuesCount: number;
  warningsCount: number;
  healthyCount: number;
  issues: IntegrityIssue[];
}

/**
 * Diagnostic integrity scanner for local-first CRM leads.
 * Flags anomalies without modifying any records.
 */
export function checkDataIntegrity(leads: Lead[]): IntegrityReport {
  const issues: IntegrityIssue[] = [];
  const seenIds = new Set<string>();
  const seenPlaceIds = new Set<string>();

  leads.forEach((l, index) => {
    const leadName = l.businessName || `Lead #${index + 1}`;

    // 1. Duplicate IDs
    if (l.id) {
      if (seenIds.has(l.id)) {
        issues.push({
          leadId: l.id,
          businessName: leadName,
          field: 'id',
          severity: 'warning',
          message: `Duplicate lead ID detected: "${l.id}"`,
          suggestion: 'Ensure unique IDs across imported records.',
        });
      } else {
        seenIds.add(l.id);
      }
    }

    // 2. Duplicate Google Maps Place IDs
    if (l.placeId && l.placeId.trim() !== '') {
      if (seenPlaceIds.has(l.placeId)) {
        issues.push({
          leadId: l.id,
          businessName: leadName,
          field: 'placeId',
          severity: 'info',
          message: `Duplicate Google Maps placeId detected: "${l.placeId}"`,
          suggestion: 'Check if this business appears multiple times in your source spreadsheets.',
        });
      } else {
        seenPlaceIds.add(l.placeId);
      }
    }

    // 3. Won deal without revenue
    if (l.status === 'Won') {
      const rev = l.dealValue ?? l.quotedAmount ?? 0;
      if (!rev || rev <= 0) {
        issues.push({
          leadId: l.id,
          businessName: leadName,
          field: 'dealValue',
          severity: 'warning',
          message: 'Lead marked as "Won" but has no final deal value or quoted amount.',
          suggestion: 'Open the lead inspector and enter the agreed project fee in Deal Value.',
        });
      }
    }

    // 4. Negative revenue values
    if (l.dealValue !== undefined && l.dealValue < 0) {
      issues.push({
        leadId: l.id,
        businessName: leadName,
        field: 'dealValue',
        severity: 'warning',
        message: `Negative deal value (₹${l.dealValue}) entered.`,
        suggestion: 'Enter a positive numeric amount for the deal value.',
      });
    }
    if (l.quotedAmount !== undefined && l.quotedAmount < 0) {
      issues.push({
        leadId: l.id,
        businessName: leadName,
        field: 'quotedAmount',
        severity: 'warning',
        message: `Negative quoted amount (₹${l.quotedAmount}) entered.`,
        suggestion: 'Enter a positive numeric amount for the quote.',
      });
    }

    // 5. Malformed follow-up dates
    if (l.followUpDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(l.followUpDate) || isNaN(new Date(l.followUpDate).getTime())) {
        issues.push({
          leadId: l.id,
          businessName: leadName,
          field: 'followUpDate',
          severity: 'warning',
          message: `Malformed follow-up date format: "${l.followUpDate}"`,
          suggestion: 'Dates must follow YYYY-MM-DD local format.',
        });
      }
    }

    // 6. Phone number format checks
    if (!l.phone || l.phone.trim() === '') {
      issues.push({
        leadId: l.id,
        businessName: leadName,
        field: 'phone',
        severity: 'info',
        message: 'No phone number available for WhatsApp outreach.',
        suggestion: 'Add a verified phone number or research contact details.',
      });
    } else {
      const digits = l.phone.replace(/\D/g, '');
      if (digits.length < 7) {
        issues.push({
          leadId: l.id,
          businessName: leadName,
          field: 'phone',
          severity: 'warning',
          message: `Phone number "${l.phone}" has fewer than 7 digits and cannot be reached on WhatsApp.`,
          suggestion: 'Update with a complete 10-digit mobile number.',
        });
      }
    }

    // 7. Contacted status without timestamp
    if (l.status !== 'New' && !l.contactedAt && (!l.contactAttempts || l.contactAttempts === 0)) {
      issues.push({
        leadId: l.id,
        businessName: leadName,
        field: 'status',
        severity: 'info',
        message: `Lead has status "${l.status}" but no recorded contact timestamp or attempts.`,
        suggestion: 'Ensure status transitions are logged via Mark Contacted.',
      });
    }
  });

  const warningsCount = issues.filter((i) => i.severity === 'warning').length;
  const healthyCount = leads.length - new Set(issues.map((i) => i.leadId)).size;

  return {
    totalLeads: leads.length,
    issuesCount: issues.length,
    warningsCount,
    healthyCount: Math.max(0, healthyCount),
    issues,
  };
}
