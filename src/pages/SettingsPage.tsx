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
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
  Minus,
  Plus,
  Check,
  Target,
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

interface SettingsPageProps {
  leads: Lead[];
  dailyGoal: number;
  onUpdateDailyGoal: (goal: number) => void;
  onClearAllData: () => void;
  onRestoreLeads?: (leads: Lead[]) => void;
  onSelectLead?: (lead: Lead) => void;
  onOpenLegal?: (tab: 'privacy' | 'terms') => void;
}

// Modern iOS/Zinc Toggle Switch component
interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      {(label || description) && (
        <div className="space-y-0.5">
          {label && (
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
              {label}
            </span>
          )}
          {description && (
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked
            ? 'bg-zinc-900 dark:bg-zinc-100'
            : 'bg-zinc-200 dark:bg-zinc-700'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white dark:bg-zinc-900 transition-transform duration-200 ease-in-out shadow-xs ${
            checked ? 'translate-x-4.5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};

export const SettingsPage: React.FC<SettingsPageProps> = ({
  leads,
  dailyGoal,
  onUpdateDailyGoal,
  onClearAllData,
  onRestoreLeads,
  onSelectLead,
  onOpenLegal,
}) => {
  const { theme, setTheme } = useTheme();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<LeadFlowBackup | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [localGoal, setLocalGoal] = useState<number>(dailyGoal);
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

  const handleAdjustGoal = (delta: number) => {
    setLocalGoal((prev) => Math.max(1, Math.min(500, prev + delta)));
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
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          System & Pipeline Settings
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Configure outreach goals, appearance modes, WhatsApp behavior, and local backup disaster recovery.
        </p>
      </div>

      {/* SECTION 1: Appearance & Theme Mode */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sun className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
            Appearance & Theme
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Select your preferred visual mode or harmonize automatically with system preferences
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-lg border flex flex-col items-center gap-2 transition-all active:scale-[0.98] ${
              theme === 'light'
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
            <span className="text-xs">Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-lg border flex flex-col items-center gap-2 transition-all active:scale-[0.98] ${
              theme === 'dark'
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" strokeWidth={1.75} />
            <span className="text-xs">Dark Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-lg border flex flex-col items-center gap-2 transition-all active:scale-[0.98] ${
              theme === 'system'
                ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-semibold shadow-xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Monitor className="w-5 h-5 text-zinc-500" strokeWidth={1.75} />
            <span className="text-xs">System Match</span>
          </button>
        </div>
      </div>

      {/* SECTION 2: Daily Outreach Goals & Currency */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
            Outreach Goals & Currency
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Calibrate daily outreach velocity targets and standard currency formatting
          </p>
        </div>

        <form onSubmit={handleSaveGoal} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Outreach Stepper Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Daily Outreach Goal (Leads / Day)
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleAdjustGoal(-5)}
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-95"
                    title="Decrease by 5"
                  >
                    <Minus className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>

                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={localGoal}
                    onChange={(e) => setLocalGoal(Math.max(1, Math.min(500, parseInt(e.target.value, 10) || 1)))}
                    className="w-20 text-center font-mono font-bold text-xs bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none py-1.5"
                  />

                  <button
                    type="button"
                    onClick={() => handleAdjustGoal(5)}
                    className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors active:scale-95"
                    title="Increase by 5"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {[10, 25, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLocalGoal(preset)}
                      className={`px-2 py-1 rounded text-[10px] font-mono border transition-colors ${
                        localGoal === preset
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border-zinc-900 dark:border-zinc-100'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                Paced velocity metric tracked on the Daily Progress Bar
              </p>
            </div>

            {/* Currency Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Default Pipeline Currency
              </label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 cursor-pointer shadow-2xs"
              >
                <option value="INR" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">Indian Rupee (₹ INR)</option>
                <option value="USD" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">US Dollar ($ USD)</option>
                <option value="EUR" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">Euro (€ EUR)</option>
                <option value="GBP" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">British Pound (£ GBP)</option>
                <option value="AED" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">UAE Dirham (AED)</option>
              </select>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                Applied to deal valuations, quote records, and projected revenue
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="submit" size="sm" variant="primary" icon={<Check className="w-3.5 h-3.5" />}>
              Save Target Preferences
            </Button>
            {savedNotice && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Settings saved successfully
              </span>
            )}
          </div>
        </form>
      </div>

      {/* SECTION 3: WhatsApp Launch & Tab Behavior */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
              WhatsApp Launch & Tab Preferences
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Control browser tab reuse behavior to eliminate tab sprawl and prevent lag during outreach
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Option 1: Web Reused Tab */}
          <div
            onClick={() => handleWhatsAppModeChange('web_reuse')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
              whatsAppMode === 'web_reuse'
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 ring-1 ring-zinc-900 dark:ring-zinc-100 shadow-2xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Reused Single Tab</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Recommended
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Direct <code className="text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">web.whatsapp.com</code> URL routing into a single window. Prevents 20 duplicate tabs from opening.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Active Mode</span>
              <ToggleSwitch
                checked={whatsAppMode === 'web_reuse'}
                onChange={() => handleWhatsAppModeChange('web_reuse')}
              />
            </div>
          </div>

          {/* Option 2: WhatsApp Desktop Protocol */}
          <div
            onClick={() => handleWhatsAppModeChange('desktop')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
              whatsAppMode === 'desktop'
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 ring-1 ring-zinc-900 dark:ring-zinc-100 shadow-2xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Desktop App Protocol</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  Instant
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Triggers <code className="text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">whatsapp://</code> directly to launch or focus the installed Windows WhatsApp app in &lt;1 second.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Active Mode</span>
              <ToggleSwitch
                checked={whatsAppMode === 'desktop'}
                onChange={() => handleWhatsAppModeChange('desktop')}
              />
            </div>
          </div>

          {/* Option 3: Separate New Tab */}
          <div
            onClick={() => handleWhatsAppModeChange('web_new_tab')}
            className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
              whatsAppMode === 'web_new_tab'
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/80 ring-1 ring-zinc-900 dark:ring-zinc-100 shadow-2xs'
                : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-850'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Separate New Tab</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Classic
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Opens a standard new browser tab (<code className="text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded font-mono">_blank</code>) for every individual lead outreach click.
              </p>
            </div>
            <div className="pt-3 mt-2 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
              <span className="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">Active Mode</span>
              <ToggleSwitch
                checked={whatsAppMode === 'web_new_tab'}
                onChange={() => handleWhatsAppModeChange('web_new_tab')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Clear Backup & Disaster Recovery System */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
              Backup & Disaster Recovery
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Full offline database snapshots, JSON file restoration with validation, and Excel data export
            </p>
          </div>
        </div>

        {/* Restore Error Banner */}
        {restoreError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-md text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{restoreError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Export JSON Backup */}
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-xs">
                <FileJson className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
                <span>Full CRM JSON Snapshot</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Exports all {leads.length} leads with customized notes, quoted amounts, timestamps, and stage records in structured JSON format.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportJson}
              icon={<Download className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />}
              disabled={leads.length === 0}
              className="w-full justify-center text-xs"
            >
              Export JSON Backup ({leads.length} Leads)
            </Button>
          </div>

          {/* Restore JSON Backup */}
          <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold text-xs">
                <Upload className="w-4 h-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.75} />
                <span>Restore from JSON Backup</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Safely rehydrate CRM leads from an existing LeadFlow backup file with structural verification and safety modal confirmation.
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
                icon={<Upload className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />}
                className="w-full justify-center text-xs"
              >
                Select Backup File (.json)
              </Button>
            </div>
          </div>
        </div>

        {/* Excel Export Row */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
            <span>Need spreadsheet format? Export clean lead data to Excel (.xlsx)</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => exportLeadsToExcel(leads)}
            icon={<Download className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />}
            disabled={leads.length === 0}
            className="text-xs"
          >
            Export to Excel
          </Button>
        </div>
      </div>

      {/* SECTION 5: Data Integrity Scanner */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-md ${integrityReport.warningsCount > 0 ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400' : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'}`}>
              <CheckCircle2 className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Data Integrity & Diagnostics</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Continuous sanity scanner for malformed phone formats, quote outliers, and invalid dates</p>
            </div>
          </div>

          <span
            className={`text-xs font-mono font-medium px-2.5 py-1 rounded-sm border ${
              integrityReport.warningsCount > 0
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {integrityReport.warningsCount === 0 ? '100% Healthy' : `${integrityReport.warningsCount} Warnings`}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-mono">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block font-sans">Total Scanned</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{integrityReport.totalLeads} leads</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block font-sans">Healthy Records</span>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{integrityReport.healthyCount}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block font-sans">Issues Flagged</span>
            <span className={`text-sm font-bold tabular-nums ${integrityReport.issuesCount > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
              {integrityReport.issuesCount}
            </span>
          </div>
        </div>

        {integrityReport.issues.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setShowIntegrityDetails(!showIntegrityDetails)}
              className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white inline-flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span>{showIntegrityDetails ? 'Hide Diagnostics' : `View ${integrityReport.issues.length} Flagged Details ->`}</span>
            </button>

            {showIntegrityDetails && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 bg-zinc-50/50 dark:bg-zinc-800/40">
                {integrityReport.issues.map((issue, idx) => {
                  const targetLead = leads.find((l) => l.id === issue.leadId);
                  return (
                    <div key={idx} className="py-2 px-2 flex items-start justify-between gap-3 text-xs">
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{issue.businessName}</span>
                        <span className="text-zinc-400 dark:text-zinc-500 text-[10px] ml-2 font-mono">({issue.field})</span>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">{issue.message}</p>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 italic mt-0.5">Tip: {issue.suggestion}</p>
                      </div>
                      {targetLead && onSelectLead && (
                        <button
                          onClick={() => onSelectLead(targetLead)}
                          className="shrink-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white p-1 flex items-center gap-1 active:scale-[0.98]"
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

      {/* SECTION 6: Storage Telemetry Specs */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            <Database className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Application & Storage Specs</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">100% private, sandboxed offline storage in your local browser profile</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-mono">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block font-sans">App Version</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">v1.2.0</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block font-sans">Schema Version</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">v{dataVersion}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block font-sans">Stored Leads</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{leads.length}</span>
          </div>
          <div>
            <span className="text-zinc-500 dark:text-zinc-400 block font-sans">Storage Usage</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">{storageKb} KB</span>
          </div>
        </div>
      </div>

      {/* SECTION 7: Compliance & Legal Policies */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
            <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Compliance & Legal Guarantees</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Strict local-first zero-telemetry guarantee and software license documentation</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenLegal && onOpenLegal('terms')}
            className="text-xs"
          >
            Terms of Service
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onOpenLegal && onOpenLegal('privacy')}
            className="text-xs"
          >
            Privacy Policy
          </Button>
        </div>
      </div>

      {/* SECTION 8: Danger Zone */}
      <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-900/60 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold">Danger Zone</h2>
        </div>
        <p className="text-xs text-rose-700 dark:text-rose-400 leading-relaxed">
          Clearing data permanently purges all imported leads, personalized templates, notes, and pipeline metrics from local browser storage.
        </p>
        <div className="pt-1">
          <Button
            size="sm"
            variant="danger"
            onClick={() => setShowClearConfirm(true)}
            icon={<Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />}
            disabled={leads.length === 0}
            className="text-xs"
          >
            Clear All CRM Data
          </Button>
        </div>
      </div>

      {/* Confirmation Modal: Clear Data */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear All CRM Data?"
        message={`Are you sure you want to permanently erase all ${leads.length} leads, custom notes, and pipeline records from this browser? This action cannot be undone.`}
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
