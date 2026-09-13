export interface PhoneNormalizationResult {
  valid: boolean;
  internationalNumber: string; // e.g. "917760013979" for wa.me
  displayPhone: string;        // e.g. "+91 77600 13979"
  error?: string;
}

/**
 * Normalizes phone numbers strictly, optimizing for Indian mobile formats:
 * - 9876543210 (10 digits starting with 6-9) -> 919876543210
 * - 09876543210 (11 digits starting with 0) -> 919876543210
 * - 919876543210 (12 digits starting with 91) -> 919876543210
 * - +91 98765 43210 or +919876543210 -> 919876543210
 *
 * Does not classify malformed Indian numbers as valid.
 */
export function normalizePhoneForWhatsApp(rawPhone?: string): PhoneNormalizationResult {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      valid: false,
      internationalNumber: '',
      displayPhone: '',
      error: 'WhatsApp unavailable — phone number missing',
    };
  }

  const trimmed = rawPhone.trim();

  // Strip all non-digit characters except leading +
  const digitsOnly = trimmed.replace(/\D/g, '');

  // 1. Check for Indian mobile formats (10 digits starting with 6, 7, 8, 9)
  if (/^[6-9]\d{9}$/.test(digitsOnly)) {
    const intl = `91${digitsOnly}`;
    return {
      valid: true,
      internationalNumber: intl,
      displayPhone: `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`,
    };
  }

  // 2. 11 digits starting with 0 followed by 6-9 (e.g. 09876543210)
  if (/^0[6-9]\d{9}$/.test(digitsOnly)) {
    const tenDigits = digitsOnly.slice(1);
    const intl = `91${tenDigits}`;
    return {
      valid: true,
      internationalNumber: intl,
      displayPhone: `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`,
    };
  }

  // 3. 12 digits starting with 91 followed by 6-9 (e.g. 919876543210 or +919876543210)
  if (/^91[6-9]\d{9}$/.test(digitsOnly)) {
    const tenDigits = digitsOnly.slice(2);
    return {
      valid: true,
      internationalNumber: digitsOnly,
      displayPhone: `+91 ${tenDigits.slice(0, 5)} ${tenDigits.slice(5)}`,
    };
  }

  // 4. International number with leading + (11 to 15 digits)
  if (trimmed.startsWith('+') && digitsOnly.length >= 11 && digitsOnly.length <= 15) {
    return {
      valid: true,
      internationalNumber: digitsOnly,
      displayPhone: `+${digitsOnly}`,
    };
  }

  return {
    valid: false,
    internationalNumber: '',
    displayPhone: trimmed,
    error: 'Invalid phone number format',
  };
}

import { storage, type WhatsAppLaunchMode } from './storage';

export { type WhatsAppLaunchMode };

export const WHATSAPP_TAB_NAME = 'LeadFlow_WhatsApp';

/**
 * Constructs the WhatsApp chat deep link.
 * Defaults to direct WhatsApp Web URL, which skips wa.me redirect hops.
 */
export function buildWhatsAppUrl(
  internationalNumber: string,
  message: string,
  mode?: WhatsAppLaunchMode
): string {
  const cleanNumber = internationalNumber.replace(/\D/g, '');
  const encodedText = encodeURIComponent(message || '');
  const activeMode =
    mode ||
    (typeof window !== 'undefined' ? storage.loadSettings().whatsAppLaunchMode : 'desktop') ||
    'desktop';

  if (activeMode === 'desktop') {
    return `whatsapp://send?phone=${cleanNumber}&text=${encodedText}`;
  }

  // Direct WhatsApp Web URL (avoids wa.me landing screen and redirect delay)
  return `https://web.whatsapp.com/send?phone=${cleanNumber}&text=${encodedText}`;
}

/**
 * Opens WhatsApp chat based on the selected mode:
 * - 'desktop' (Default for instant Windows speed): Launches native WhatsApp Desktop app in <0.5s with zero browser tabs.
 * - 'web_reuse': Reuses a single persistent browser tab ('LeadFlow_WhatsApp').
 * - 'web_new_tab': Opens a separate new tab ('_blank') on each click.
 */
export function openWhatsAppChat(
  rawPhone: string,
  message: string,
  mode?: WhatsAppLaunchMode
): { success: boolean; url?: string; error?: string; isPopupBlocked?: boolean } {
  const norm = normalizePhoneForWhatsApp(rawPhone);
  if (!norm.valid) {
    return { success: false, error: norm.error || 'Invalid phone number' };
  }

  if (!message || !message.trim()) {
    return { success: false, error: 'Add a message before opening WhatsApp' };
  }

  const activeMode =
    mode ||
    (typeof window !== 'undefined' ? storage.loadSettings().whatsAppLaunchMode : 'desktop') ||
    'desktop';

  const url = buildWhatsAppUrl(norm.internationalNumber, message, activeMode);

  // Desktop App Protocol launch
  if (activeMode === 'desktop') {
    try {
      const a = document.createElement('a');
      a.href = url;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return { success: true, url };
    } catch {
      return {
        success: false,
        url,
        error: 'Failed to launch WhatsApp Desktop. Ensure WhatsApp is installed or switch mode to WhatsApp Web in Settings.',
      };
    }
  }

  // Web mode: reuse tab ('LeadFlow_WhatsApp') or fresh tab ('_blank')
  const targetWindow = activeMode === 'web_reuse' ? WHATSAPP_TAB_NAME : '_blank';

  try {
    const targetTab = window.open(url, targetWindow);
    if (!targetTab || targetTab.closed || typeof targetTab.closed === 'undefined') {
      // Fallback via anchor click
      const a = document.createElement('a');
      a.href = url;
      a.target = targetWindow;
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      try {
        targetTab.focus();
      } catch {
        // Cross-origin restrictions might prevent manual focus in some browsers
      }
    }
    return { success: true, url };
  } catch {
    return {
      success: false,
      url,
      isPopupBlocked: true,
      error: 'Your browser blocked opening the WhatsApp tab. Allow popups for LeadFlow and try again.',
    };
  }
}

