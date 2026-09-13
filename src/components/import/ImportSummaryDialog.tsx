import React from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';
import type { ImportSummary } from '../../types/lead';
import { Button } from '../ui/Button';

interface ImportSummaryDialogProps {
  summary: ImportSummary | null;
  onClose: () => void;
  onViewLeads: () => void;
}

export const ImportSummaryDialog: React.FC<ImportSummaryDialogProps> = ({
  summary,
  onClose,
  onViewLeads,
}) => {
  if (!summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Import Complete</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">{summary.sourceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Stat metrics summary */}
          <div className={`grid ${summary.updatedCount !== undefined && summary.updatedCount > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-3 text-center`}>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 block">
                {summary.importedCount}
              </span>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">New Leads</span>
            </div>

            {summary.updatedCount !== undefined && summary.updatedCount > 0 && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 block">
                  {summary.updatedCount}
                </span>
                <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">Refreshed</span>
              </div>
            )}

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
              <span className="text-2xl font-bold text-amber-700 dark:text-amber-400 block">
                {summary.duplicatesCount}
              </span>
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">File Duplicates</span>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
              <span className="text-2xl font-bold text-slate-700 dark:text-slate-300 block">
                {summary.missingNameCount}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-300">Missing Names</span>
            </div>
          </div>

          {/* Skipped Details Log */}
          {summary.skippedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  Skipped Rows Detail ({summary.skippedRows.length})
                </span>
                <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Not discarded silently</span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs">
                {summary.skippedRows.map((item, i) => (
                  <div key={i} className="p-2.5 flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 mr-2">
                        Row #{item.rowNumber}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.businessName}</span>
                    </div>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium shrink-0">
                      {item.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {summary.importedCount} leads are now saved in your browser's persistent storage.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onViewLeads();
            }}
          >
            View in Leads Table →
          </Button>
        </div>
      </div>
    </div>
  );
};
