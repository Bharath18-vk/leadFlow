import React from 'react';
import { UploadCloud, Download, Menu, Sparkles, Globe } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  onOpenImport: () => void;
  onLoadDemo: () => void;
  onExport: () => void;
  onToggleMobileMenu?: () => void;
  onOpenLanding?: () => void;
  hasLeads: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  onOpenImport,
  onLoadDemo,
  onExport,
  onToggleMobileMenu,
  onOpenLanding,
  hasLeads,
}) => {
  return (
    <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 sticky top-0 z-20 transition-colors font-sans">
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: mobile menu + title */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-4.5 h-4.5" strokeWidth={1.5} />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggle />

          {onOpenLanding && (
            <button
              onClick={onOpenLanding}
              title="View Marketing Landing Page"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-md transition-all active:scale-[0.98]"
            >
              <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden lg:inline">Landing Page</span>
            </button>
          )}

          <button
            onClick={onLoadDemo}
            title="Load 10 realistic Bangalore interior-design leads for quick UI testing"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="hidden lg:inline">Sample Data</span>
          </button>

          {hasLeads && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-md transition-all active:scale-[0.98] bg-white dark:bg-zinc-900"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          <button
            onClick={onOpenImport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-all active:scale-[0.98] shadow-sm shadow-emerald-600/20"
          >
            <UploadCloud className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Import Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
