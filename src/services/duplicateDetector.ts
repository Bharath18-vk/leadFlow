import type { Lead } from '../types/lead';

function cleanText(str?: string): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function cleanDigits(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // If starts with 91 and has 12 digits, return last 10
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  // If starts with 0 and has 11 digits, return last 10
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function isDuplicate(
  candidate: Lead,
  existingLeads: Lead[]
): { duplicate: boolean; matchedLead?: Lead; reason?: string } {
  for (const existing of existingLeads) {
    // 1. Priority 1: placeId
    if (candidate.placeId && existing.placeId) {
      if (candidate.placeId.trim() === existing.placeId.trim()) {
        return {
          duplicate: true,
          matchedLead: existing,
          reason: `Matched Place ID: ${candidate.placeId}`,
        };
      }
    }

    // 2. Priority 2: normalized phone
    const candidatePhoneDigits = cleanDigits(candidate.phone || candidate.rawPhone);
    const existingPhoneDigits = cleanDigits(existing.phone || existing.rawPhone);

    if (
      candidatePhoneDigits &&
      existingPhoneDigits &&
      candidatePhoneDigits.length >= 10 &&
      candidatePhoneDigits === existingPhoneDigits
    ) {
      return {
        duplicate: true,
        matchedLead: existing,
        reason: `Matched Phone Number: ${candidate.phone}`,
      };
    }

    // 3. Priority 3: business name + address
    const candidateNameClean = cleanText(candidate.businessName);
    const existingNameClean = cleanText(existing.businessName);

    if (candidateNameClean && candidateNameClean === existingNameClean) {
      const candidateAddrClean = cleanText(candidate.address || candidate.neighborhood || '');
      const existingAddrClean = cleanText(existing.address || existing.neighborhood || '');

      // If both have address info and they match
      if (candidateAddrClean && existingAddrClean) {
        if (
          candidateAddrClean.includes(existingAddrClean) ||
          existingAddrClean.includes(candidateAddrClean)
        ) {
          return {
            duplicate: true,
            matchedLead: existing,
            reason: `Matched Name & Address: "${candidate.businessName}"`,
          };
        }
      } else {
        // If neither has address, an identical business name is treated as duplicate
        return {
          duplicate: true,
          matchedLead: existing,
          reason: `Matched Business Name: "${candidate.businessName}"`,
        };
      }
    }
  }

  return { duplicate: false };
}
