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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">Import Complete</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs">{summary.sourceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Stat metrics summary */}
          <div className={`grid ${summary.updatedCount !== undefined && summary.updatedCount > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'} gap-3 text-center`}>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <span className="text-xl font-semibold font-mono text-emerald-600 dark:text-emerald-400 block">
                {summary.importedCount}
              </span>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">New Leads</span>
            </div>

            {summary.updatedCount !== undefined && summary.updatedCount > 0 && (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                <span className="text-xl font-semibold font-mono text-zinc-900 dark:text-zinc-100 block">
                  {summary.updatedCount}
                </span>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Refreshed</span>
              </div>
            )}

            <div className="p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <span className="text-xl font-semibold font-mono text-amber-600 dark:text-amber-400 block">
                {summary.duplicatesCount}
              </span>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">File Duplicates</span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <span className="text-xl font-semibold font-mono text-zinc-700 dark:text-zinc-300 block">
                {summary.missingNameCount}
              </span>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Missing Names</span>
            </div>
          </div>

          {/* Skipped Details Log */}
          {summary.skippedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" strokeWidth={1.5} />
                  Skipped Rows Detail ({summary.skippedRows.length})
                </span>
                <span className="text-[11px] font-normal text-zinc-400 dark:text-zinc-500">Not discarded silently</span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-lg divide-y divide-zinc-100 dark:divide-zinc-800 bg-zinc-50 dark:bg-zinc-850 text-xs">
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
