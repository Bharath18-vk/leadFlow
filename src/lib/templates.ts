import type { Lead } from '../types/lead';
import type { MessageTemplate } from '../types/template';

export const TEMPLATES_STORAGE_KEY = 'leadflow_templates_v1';
export const DEFAULT_TEMPLATE_ID_KEY = 'leadflow_default_template_id';

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'template-website-opportunity',
    name: 'Cold Website Opportunity (Standard)',
    category: 'discovery',
    content: `Hi! 👋\n\nI came across {{business_name}} on Google and had a look at your work in {{city}}.\n\nI'm a web developer, and I noticed you don't currently have a dedicated website. For {{category}}, a clean mobile-friendly portfolio can turn project inquiries into direct WhatsApp calls and help clients easily view your past work.\n\nI actually prepared a tailored concept demo for {{business_name}}.\n\nWould you like me to send over the link? 🙂`,
    isDefault: true,
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'template-social-proof',
    name: 'High Rating & Social Proof',
    category: 'social_proof',
    content: `Hello {{business_name}} team! ⭐\n\nI was browsing top-rated {{category}} services in {{city}} and was genuinely impressed by your {{rating}}★ rating across {{reviews}} client reviews.\n\nBusinesses with your strong reputation convert significantly more leads when backed by a fast, modern portfolio website that showcases your credibility.\n\nWould it be alright if I share a 1-minute preview demo I put together for {{business_name}}?`,
    isDefault: false,
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'template-quick-direct',
    name: 'Quick & Direct Question',
    category: 'direct',
    content: `Hi {{business_name}} team, quick question — are you taking on new {{category}} projects in {{city}} right now?\n\nI noticed your Google Maps profile has great feedback ({{rating}}★), but no active website link. We help local businesses launch modern showcase websites that drive direct WhatsApp inquiries.\n\nOpen to seeing a quick concept?`,
    isDefault: false,
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'template-portfolio-photos',
    name: 'Portfolio & Photos Showcase',
    category: 'discovery',
    content: `Hey {{business_name}}! 📸\n\nI saw your {{images}} photos on Google Maps — your {{category}} work looks incredible.\n\nRight now, many potential customers look for a clean catalog or portfolio before calling. We build custom, fast-loading showcase sites that highlight your best work and make booking effortless.\n\nCan I share a live demo tailored for {{business_name}}?`,
    isDefault: false,
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'template-followup-nudge',
    name: 'Polite Follow-up Nudge',
    category: 'followup',
    content: `Hi {{business_name}} team! Just following up on my previous note regarding the custom website demo for {{business_name}}.\n\nNo pressure at all — just wanted to check if improving your online conversions is on your radar this month?\n\nHappy to share the demo link whenever you have a minute. Have a great week ahead!`,
    isDefault: false,
    isBuiltIn: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

/**
 * Renders a template string by interpolating lead properties.
 */
export function renderTemplate(templateContent: string, lead?: Partial<Lead> | null): string {
  if (!templateContent) return '';
  if (!lead) {
    // Return sample rendered text if no lead provided
    return templateContent
      .replace(/\{\{business_name\}\}/gi, 'Studio One Interiors')
      .replace(/\{\{city\}\}/gi, 'Bangalore')
      .replace(/\{\{category\}\}/gi, 'interior designer')
      .replace(/\{\{rating\}\}/gi, '4.8')
      .replace(/\{\{reviews\}\}/gi, '42')
      .replace(/\{\{images\}\}/gi, '35')
      .replace(/\{\{phone\}\}/gi, '+91 98765 43210')
      .replace(/\{\{neighborhood\}\}/gi, 'Indiranagar');
  }

  const businessName = lead.businessName?.trim() || 'your business';
  const city = lead.city?.trim() || 'your city';
  const category = (lead.category?.trim() || 'interior design').toLowerCase();
  const rating = lead.rating !== undefined && lead.rating !== null ? String(lead.rating) : '5.0';
  const reviews = lead.reviews !== undefined && lead.reviews !== null ? String(lead.reviews) : 'recent';
  const images = lead.images !== undefined && lead.images !== null ? String(lead.images) : 'project';
  const phone = lead.phone?.trim() || lead.rawPhone?.trim() || '';
  const neighborhood = lead.neighborhood?.trim() || lead.city?.trim() || 'your area';

  return templateContent
    .replace(/\{\{business_name\}\}/gi, businessName)
    .replace(/\{\{city\}\}/gi, city)
    .replace(/\{\{category\}\}/gi, category)
    .replace(/\{\{rating\}\}/gi, rating)
    .replace(/\{\{reviews\}\}/gi, reviews)
    .replace(/\{\{images\}\}/gi, images)
    .replace(/\{\{phone\}\}/gi, phone)
    .replace(/\{\{neighborhood\}\}/gi, neighborhood);
}

/**
 * Loads templates from localStorage with fallback to DEFAULT_TEMPLATES.
 */
export function loadTemplates(): MessageTemplate[] {
  if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) {
      saveTemplates(DEFAULT_TEMPLATES);
      return DEFAULT_TEMPLATES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveTemplates(DEFAULT_TEMPLATES);
      return DEFAULT_TEMPLATES;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load templates from localStorage:', err);
    return DEFAULT_TEMPLATES;
  }
}

/**
 * Saves templates to localStorage and notifies listeners.
 */
export function saveTemplates(templates: MessageTemplate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    window.dispatchEvent(new CustomEvent('leadflow_templates_updated', { detail: templates }));
  } catch (err) {
    console.error('Failed to save templates to localStorage:', err);
  }
}

/**
 * Resets templates to DEFAULT_TEMPLATES.
 */
export function resetTemplates(): MessageTemplate[] {
  saveTemplates(DEFAULT_TEMPLATES);
  return DEFAULT_TEMPLATES;
}

/**
 * Returns the active default template.
 */
export function getDefaultTemplate(): MessageTemplate {
  const templates = loadTemplates();
  const foundDefault = templates.find((t) => t.isDefault);
  return foundDefault || templates[0] || DEFAULT_TEMPLATES[0];
}

/**
 * Sets a specific template as the default.
 */
export function setDefaultTemplate(templateId: string): MessageTemplate[] {
  const templates = loadTemplates();
  const updated = templates.map((t) => ({
    ...t,
    isDefault: t.id === templateId,
  }));
  saveTemplates(updated);
  return updated;
}
