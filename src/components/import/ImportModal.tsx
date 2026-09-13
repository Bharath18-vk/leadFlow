import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { parseLeadFile } from '../../services/excelParser';
import type { Lead, ImportSummary } from '../../types/lead';
import { Button } from '../ui/Button';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingLeads: Lead[];
  onImportSuccess: (leads: Lead[], summary: ImportSummary) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  existingLeads,
  onImportSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setError(null);
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setError('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    try {
      setIsLoading(true);
      const { leads, summary } = await parseLeadFile(file, existingLeads);
      setIsLoading(false);
      onImportSuccess(leads, summary);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Failed to process spreadsheet');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Import Leads Spreadsheet</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Accepts .xlsx, .xls, and .csv with automatic column detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileSpreadsheet className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {isLoading ? 'Parsing and normalizing leads...' : 'Click to browse or drag & drop'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Supports .xlsx, .xls, and .csv</p>
            </div>
          </div>

          {/* Flexible Mapping Notice */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Smart Flexible Mapping
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
              Columns like <code className="bg-slate-200/70 dark:bg-slate-700 px-1 rounded text-slate-800 dark:text-slate-200">Business Name / Name / Title</code>,{' '}
              <code className="bg-slate-200/70 dark:bg-slate-700 px-1 rounded text-slate-800 dark:text-slate-200">Phone / Mobile</code>,{' '}
              <code className="bg-slate-200/70 dark:bg-slate-700 px-1 rounded text-slate-800 dark:text-slate-200">Rating / totalScore</code>, and{' '}
              <code className="bg-slate-200/70 dark:bg-slate-700 px-1 rounded text-slate-800 dark:text-slate-200">Reviews / reviewsCount</code> are detected automatically.
              Original fields are preserved in <code className="bg-slate-200/70 dark:bg-slate-700 px-1 rounded text-slate-800 dark:text-slate-200">rawFields</code>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            Select File
          </Button>
        </div>
      </div>
    </div>
  );
};
