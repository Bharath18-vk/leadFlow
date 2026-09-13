import type { Lead } from '../types/lead';
import type { MessageTemplate } from '../types/template';
import {
  loadTemplates,
  saveTemplates,
  resetTemplates,
  getDefaultTemplate,
  setDefaultTemplate,
} from './templates';

const STORAGE_KEY = 'leadflow_leads_v1';
const SETTINGS_KEY = 'leadflow_settings_v1';
const VERSION_KEY = 'leadflow_data_version';

export const CURRENT_DATA_VERSION = 1;

export type WhatsAppLaunchMode = 'web_reuse' | 'web_new_tab' | 'desktop';

export interface AppSettings {
  dailyOutreachGoal: number;
  defaultTemplateId?: string;
  autoMarkContacted: boolean;
  defaultCurrency?: string;
  whatsAppLaunchMode?: WhatsAppLaunchMode;
}

const DEFAULT_SETTINGS: AppSettings = {
  dailyOutreachGoal: 20,
  autoMarkContacted: false,
  defaultCurrency: 'INR',
  whatsAppLaunchMode: 'desktop',
};

export const storage = {
  loadLeads(): Lead[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];

      // Safe migration for Phase 3 & 4 CRM & Revenue fields
      return parsed.map((l: any) => ({
        ...l,
        contactAttempts: l.contactAttempts ?? (l.status === 'Contacted' ? 1 : 0),
        notes: l.notes ?? '',
        followUpDate: l.followUpDate ?? undefined,
        quotedAmount: l.quotedAmount !== undefined && l.quotedAmount !== null ? Number(l.quotedAmount) : undefined,
        dealValue: l.dealValue !== undefined && l.dealValue !== null ? Number(l.dealValue) : undefined,
        currency: l.currency || 'INR',
        interestedAt: l.interestedAt ?? undefined,
        rawFields: l.rawFields ?? {},
      }));
    } catch (err) {
      console.error('Failed to load leads from localStorage:', err);
      return [];
    }
  },

  saveLeads(leads: Lead[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
      // Dispatch storage event so tabs/components can react
      window.dispatchEvent(new CustomEvent('leadflow_leads_updated', { detail: leads }));
      return true;
    } catch (err) {
      console.error('Failed to save leads to localStorage:', err);
      return false;
    }
  },

  appendLeads(newLeads: Lead[]): { added: number; total: number } {
    const existing = this.loadLeads();
    const existingMap = new Map(existing.map((l) => [l.id, l]));

    // Preserve existing CRM data if re-importing leads with existing IDs
    const mergedLeads = newLeads.map((nl) => {
      const existingLead = existingMap.get(nl.id);
      if (existingLead) {
        return {
          ...nl,
          status: existingLead.status || nl.status,
          contactAttempts: existingLead.contactAttempts ?? nl.contactAttempts ?? 0,
          contactedAt: existingLead.contactedAt || nl.contactedAt,
          lastContactedAt: existingLead.lastContactedAt || nl.lastContactedAt,
          repliedAt: existingLead.repliedAt || nl.repliedAt,
          interestedAt: existingLead.interestedAt || nl.interestedAt,
          demoSentAt: existingLead.demoSentAt || nl.demoSentAt,
          wonAt: existingLead.wonAt || nl.wonAt,
          lostAt: existingLead.lostAt || nl.lostAt,
          followUpDate: existingLead.followUpDate || nl.followUpDate,
          notes: existingLead.notes || nl.notes || '',
          customMessage: existingLead.customMessage || nl.customMessage,
          quotedAmount: existingLead.quotedAmount ?? nl.quotedAmount,
          dealValue: existingLead.dealValue ?? nl.dealValue,
          currency: existingLead.currency || nl.currency || 'INR',
        };
      }
      return nl;
    });

    const combined = [...existing, ...mergedLeads.filter((nl) => !existingMap.has(nl.id))];
    this.saveLeads(combined);
    return {
      added: combined.length - existing.length,
      total: combined.length,
    };
  },

  updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const leads = this.loadLeads();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) return null;

    const current = leads[index];
    const updatedLead: Lead = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    leads[index] = updatedLead;
    this.saveLeads(leads);
    return updatedLead;
  },

  deleteLead(id: string): boolean {
    const leads = this.loadLeads();
    const filtered = leads.filter((l) => l.id !== id);
    if (filtered.length !== leads.length) {
      this.saveLeads(filtered);
      return true;
    }
    return false;
  },

  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('leadflow_leads_updated', { detail: [] }));
    } catch (err) {
      console.error('Failed to clear storage:', err);
    }
  },

  loadSettings(): AppSettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: Partial<AppSettings>): void {
    try {
      const current = this.loadSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  },

  getDataVersion(): number {
    try {
      const v = localStorage.getItem(VERSION_KEY);
      return v ? parseInt(v, 10) : CURRENT_DATA_VERSION;
    } catch {
      return CURRENT_DATA_VERSION;
    }
  },

  getStorageUsageBytes(): number {
    try {
      const leadsStr = localStorage.getItem(STORAGE_KEY) || '';
      const settingsStr = localStorage.getItem(SETTINGS_KEY) || '';
      const templatesStr = localStorage.getItem('leadflow_templates_v1') || '';
      return new Blob([leadsStr + settingsStr + templatesStr]).size;
    } catch {
      return 0;
    }
  },

  loadTemplates() {
    return loadTemplates();
  },

  saveTemplates(templates: MessageTemplate[]) {
    return saveTemplates(templates);
  },

  resetTemplates() {
    return resetTemplates();
  },

  getDefaultTemplate() {
    return getDefaultTemplate();
  },

  setDefaultTemplate(id: string) {
    return setDefaultTemplate(id);
  },
};

