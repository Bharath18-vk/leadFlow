import React, { useState, useRef, useMemo } from 'react';
import {
  Database,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Upload,
  HardDrive,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { exportLeadsToExcel } from '../services/excelParser';
import { createBackup, downloadBackup, readAndValidateBackupFile, type LeadFlowBackup } from '../lib/backup';
import { checkDataIntegrity, type IntegrityReport } from '../lib/dataIntegrity';
import { storage } from '../lib/storage';
import { type WhatsAppLaunchMode } from '../lib/whatsapp';
import type { Lead } from '../types/lead';

import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';

interface SettingsPageProps {
  leads: Lead[];
  dailyGoal: number;
  onUpdateDailyGoal: (goal: number) => void;
  onClearAllData: () => void;
  onRestoreLeads?: (leads: Lead[]) => void;
  onSelectLead?: (lead: Lead) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  leads,
  dailyGoal,
  onUpdateDailyGoal,
  onClearAllData,
  onRestoreLeads,
  onSelectLead,
}) => {
  const { theme, setTheme } = useTheme();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<LeadFlowBackup | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [localGoal, setLocalGoal] = useState(dailyGoal);
  const [savedNotice, setSavedNotice] = useState(false);
  const [currency, setCurrency] = useState<string>(() => storage.loadSettings().defaultCurrency || 'INR');
  const [whatsAppMode, setWhatsAppMode] = useState<WhatsAppLaunchMode>(
    () => storage.loadSettings().whatsAppLaunchMode || 'web_reuse'
  );
  const [showIntegrityDetails, setShowIntegrityDetails] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Storage size & metrics
  const storageBytes = storage.getStorageUsageBytes();
  const storageKb = (storageBytes / 1024).toFixed(1);
  const dataVersion = storage.getDataVersion();

  // Data Integrity Report
  const integrityReport: IntegrityReport = useMemo(() => {
    return checkDataIntegrity(leads);
  }, [leads]);

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDailyGoal(localGoal);
    storage.saveSettings({
      dailyOutreachGoal: localGoal,
      defaultCurrency: currency,
      whatsAppLaunchMode: whatsAppMode,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    storage.saveSettings({ defaultCurrency: newCurrency });
  };

  const handleWhatsAppModeChange = (mode: WhatsAppLaunchMode) => {
    setWhatsAppMode(mode);
    storage.saveSettings({ whatsAppLaunchMode: mode });
  };

  // Export JSON Backup
  const handleExportJson = () => {
    const backup = createBackup(leads);
    downloadBackup(backup);
  };

  // Trigger file input for JSON restore
  const handleSelectRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setRestoreError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await readAndValidateBackupFile(file);
    if (!result.valid || !result.data) {
      setRestoreError(result.error || 'Failed to validate backup file.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setPendingBackup(result.data);
    setShowRestoreConfirm(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmRestore = () => {
    if (pendingBackup && onRestoreLeads) {
      onRestoreLeads(pendingBackup.leads);
      setShowRestoreConfirm(false);
      setPendingBackup(null);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">CRM Settings & Data Management</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Local-first backup, restore, appearance preferences, pipeline targets, and data integrity diagnostics
        </p>
      </div>

      {/* SECTION 1: Appearance & Theme Mode */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Appearance & Theme</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose your preferred visual mode or sync with system settings</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs">Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="text-xs">Dark Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'system'
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Monitor className="w-5 h-5 text-slate-500" />
            <span className="text-xs">System Match</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: Daily Outreach & Currency */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Outreach Goals & Currency</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure target metrics and standard currency for quote tracking</p>
          </div>
        </div>

        <form onSubmit={handleSaveGoal} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Daily Outreach Goal (Leads/day)
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={localGoal}
              onChange={(e) => setLocalGoal(parseInt(e.target.value, 10) || 20)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Default Pipeline Currency
            </label>
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INR">Indian Rupee (₹ INR)</option>
              <option value="USD">US Dollar ($ USD)</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-1">
            <Button type="submit" size="sm" variant="primary">
              Save Preferences
            </Button>
            {savedNotice && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* SECTION 3: WhatsApp Launch & Tab Behavior */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#25D366]">
            <MessageSquare className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">WhatsApp Launch & Tab Preferences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control how WhatsApp opens to eliminate multi-tab clutter and loading delays
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Option 1: Web Reused Tab */}
          <div
            onClick={() => handleWhatsAppModeChange('web_reuse')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              whatsAppMode === 'web_reuse'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">WhatsApp Web (Reused Tab)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Uses direct <code className="text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1 py-0.5 rounded font-mono">web.whatsapp.com</code> URL and navigates the <strong>same single browser tab</strong> on each click. Skips redirect hops and prevents 20 tabs from piling up.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
              <input
                type="radio"
                name="whatsapp_mode"
                checked={whatsAppMode === 'web_reuse'}
                onChange={() => handleWhatsAppModeChange('web_reuse')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Active (Single Tab)</span>
            </div>
          </div>

          {/* Option 2: WhatsApp Desktop */}
          <div
            onClick={() => handleWhatsAppModeChange('desktop')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              whatsAppMode === 'desktop'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">WhatsApp Desktop App</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                  Fastest (Instant)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Directly triggers <code className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-1 py-0.5 rounded font-mono">whatsapp://</code> protocol. Opens or focuses the Windows desktop app in &lt;1 second with <strong>zero web loading or browser tabs</strong>.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
              <input
                type="radio"
                name="whatsapp_mode"
                checked={whatsAppMode === 'desktop'}
                onChange={() => handleWhatsAppModeChange('desktop')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Desktop Protocol</span>
            </div>
          </div>

          {/* Option 3: Separate New Tab */}
          <div
            onClick={() => handleWhatsAppModeChange('web_new_tab')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
              whatsAppMode === 'web_new_tab'
                ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">WhatsApp Web (New Tab)</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Classic
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Opens a brand-new tab (<code className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">_blank</code>) for every lead click. Useful if you want to keep previous chat tabs open side-by-side.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2">
              <input
                type="radio"
                name="whatsapp_mode"
                checked={whatsAppMode === 'web_new_tab'}
                onChange={() => handleWhatsAppModeChange('web_new_tab')}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Multi-Tab Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Data Backup & Restore System */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Backup & Disaster Recovery</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Export your complete CRM database or restore from a verified JSON backup file
            </p>
          </div>
        </div>

        {/* Restore Error Banner */}
        {restoreError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{restoreError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Export JSON Backup */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-xs">
                <FileJson className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Full JSON Backup</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Exports all {leads.length} leads with notes, follow-up dates, quoted amounts, deal values, and timestamps.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportJson}
              icon={<Download className="w-3.5 h-3.5" />}
              disabled={leads.length === 0}
              className="w-full justify-center text-xs"
            >
              Export JSON Backup
            </Button>
          </div>

          {/* Restore JSON Backup */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-xs">
                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Restore from JSON</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Restore previously exported LeadFlow data. Requires explicit confirmation before overwriting.
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleSelectRestoreFile}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                icon={<Upload className="w-3.5 h-3.5" />}
                className="w-full justify-center text-xs"
              >
                Select Backup File (.json)
              </Button>
            </div>
          </div>
        </div>

        {/* Excel Export */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Need spreadsheet format? Export anytime to Excel (.xlsx)</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportLeadsToExcel(leads)}
            icon={<Download className="w-3.5 h-3.5" />}
            disabled={leads.length === 0}
          >
            Export to Excel
          </Button>
        </div>
      </div>

      {/* SECTION 5: Data Integrity Scanner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${integrityReport.warningsCount > 0 ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'}`}>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Data Integrity & Diagnostics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scan for missing deal values, malformed dates, or reachability anomalies</p>
            </div>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              integrityReport.warningsCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {integrityReport.warningsCount === 0 ? '✓ 100% Healthy' : `${integrityReport.warningsCount} Warnings`}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Total Scanned</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{integrityReport.totalLeads} leads</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Healthy Records</span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{integrityReport.healthyCount}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Issues Flagged</span>
            <span className={`text-sm font-bold ${integrityReport.issuesCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
              {integrityReport.issuesCount}
            </span>
          </div>
        </div>

        {integrityReport.issues.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowIntegrityDetails(!showIntegrityDetails)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 inline-flex items-center gap-1"
            >
              <span>{showIntegrityDetails ? 'Hide Diagnostics' : `View ${integrityReport.issues.length} Flagged Details →`}</span>
            </button>

            {showIntegrityDetails && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-800/40">
                {integrityReport.issues.map((issue, idx) => {
                  const targetLead = leads.find((l) => l.id === issue.leadId);
                  return (
                    <div key={idx} className="py-2 px-2 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{issue.businessName}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] ml-2">({issue.field})</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{issue.message}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5">Tip: {issue.suggestion}</p>
                      </div>
                      {targetLead && onSelectLead && (
                        <button
                          onClick={() => onSelectLead(targetLead)}
                          className="shrink-0 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 flex items-center gap-1"
                          title="Inspect Lead"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 6: System Information */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Application & Storage Specs</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">100% private, sandboxed inside your local browser profile</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Version</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">v1.0.0</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Data Schema</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">v{dataVersion}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Stored Records</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{leads.length}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Storage Used</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{storageKb} KB</span>
          </div>
        </div>
      </div>

      {/* SECTION 7: Danger Zone */}
      <div className="bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900/60 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5 text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          <h2 className="text-sm font-bold">Danger Zone</h2>
        </div>
        <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
          Clearing data permanently removes all imported leads, customized notes, quoted amounts, and pipeline statuses
          from this browser. Be sure to export a JSON backup first if you want to keep your data.
        </p>
        <div className="pt-1">
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowClearConfirm(true)}
            icon={<Trash2 className="w-4 h-4" />}
            disabled={leads.length === 0}
          >
            Clear All Data
          </Button>
        </div>
      </div>

      {/* Confirmation Modal: Clear Data */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear All CRM Data?"
        message={`Are you sure you want to permanently erase all ${leads.length} leads, notes, and revenue records from this browser? This action cannot be undone.`}
        confirmLabel="Yes, Clear All Data"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={() => {
          onClearAllData();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

      {/* Confirmation Modal: Restore Backup */}
      <ConfirmModal
        isOpen={showRestoreConfirm}
        title="Restore CRM Database?"
        message={`This will restore your LeadFlow data from "${pendingBackup?.metadata?.appName || 'backup'}" (${pendingBackup?.leadCount || 0} leads) and replace the current local dataset (${leads.length} leads). Be sure to export a backup first if you want to preserve current data.`}
        confirmLabel="Yes, Restore Backup"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleConfirmRestore}
        onCancel={() => {
          setShowRestoreConfirm(false);
          setPendingBackup(null);
        }}
      />
    </div>
  );
};
