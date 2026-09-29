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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 animate-in fade-in duration-150">
      <div
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <UploadCloud className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Import Leads Spreadsheet</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Accepts .xlsx, .xls, and .csv with automatic column detection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={1.5} />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-zinc-500 bg-zinc-100/50 dark:bg-zinc-800/50'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50'
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

            <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mx-auto flex items-center justify-center mb-3 border border-zinc-200 dark:border-zinc-700">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileSpreadsheet className="w-5 h-5" strokeWidth={1.5} />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                {isLoading ? 'Parsing and normalizing leads...' : 'Click to browse or drag & drop'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Supports .xlsx, .xls, and .csv</p>
            </div>
          </div>

          {/* Flexible Mapping Notice */}
          <div className="bg-zinc-50 dark:bg-zinc-850 rounded-md p-3.5 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              Smart Flexible Mapping
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Columns like <code className="bg-zinc-200/70 dark:bg-zinc-800 px-1 rounded text-zinc-800 dark:text-zinc-200">Business Name / Name / Title</code>,{' '}
              <code className="bg-zinc-200/70 dark:bg-zinc-800 px-1 rounded text-zinc-800 dark:text-zinc-200">Phone / Mobile</code>,{' '}
              <code className="bg-zinc-200/70 dark:bg-zinc-800 px-1 rounded text-zinc-800 dark:text-zinc-200">Rating / totalScore</code>, and{' '}
              <code className="bg-zinc-200/70 dark:bg-zinc-800 px-1 rounded text-zinc-800 dark:text-zinc-200">Reviews / reviewsCount</code> are detected automatically.
              Original fields are preserved in <code className="bg-zinc-200/70 dark:bg-zinc-800 px-1 rounded text-zinc-800 dark:text-zinc-200">rawFields</code>.
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
