import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowUpCircle,
} from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-in fade-in duration-150">
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
            <div className="w-9 h-9 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 flex items-center justify-center shrink-0">
              <UploadCloud className="w-4 h-4 text-zinc-800 dark:text-zinc-200" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Import Leads Spreadsheet
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Automatic column matching and duplicate phone deduplication
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-md text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          {/* Modern Drag & Drop Zone */}
          <div
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100/70 dark:bg-zinc-800/70 scale-[1.01] ring-2 ring-zinc-900/10 dark:ring-zinc-100/10'
                : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/50'
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

            {/* Upload Animation Graphic */}
            <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 mx-auto flex items-center justify-center mb-3 border border-zinc-200 dark:border-zinc-700 shadow-2xs group-hover:scale-105 transition-transform">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent rounded-full animate-spin" />
              ) : isDragging ? (
                <ArrowUpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-bounce" strokeWidth={1.75} />
              ) : (
                <FileSpreadsheet className="w-6 h-6 text-zinc-700 dark:text-zinc-300" strokeWidth={1.75} />
              )}
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span>Parsing and normalizing leads...</span>
                  </span>
                ) : isDragging ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    Drop spreadsheet here to begin import
                  </span>
                ) : (
                  <span>Click to browse or drag & drop</span>
                )}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Drop your prospect sheet to immediately map and score leads
              </p>
            </div>

            {/* Supported Format Badges */}
            <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-800">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                .XLSX
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                .XLS
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                .CSV
              </span>
            </div>
          </div>

          {/* Flexible Mapping Notice */}
          <div className="bg-zinc-50 dark:bg-zinc-850/80 rounded-md p-3.5 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 space-y-1.5 shadow-2xs">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} />
              <span>Smart Flexible Mapping Engine</span>
            </div>
            <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              Fields like <code className="bg-zinc-200/70 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">Business Name</code>,{' '}
              <code className="bg-zinc-200/70 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">Phone / Mobile</code>,{' '}
              <code className="bg-zinc-200/70 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">Rating</code>, and{' '}
              <code className="bg-zinc-200/70 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">Reviews Count</code> are detected automatically. Unmapped columns are safely preserved in <code className="bg-zinc-200/70 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono">rawFields</code>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-850/60 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading} className="text-xs">
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="text-xs font-semibold"
          >
            Select File
          </Button>
        </div>
      </div>
    </div>
  );
};
