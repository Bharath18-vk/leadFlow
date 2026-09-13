import React from 'react';
import { UploadCloud, Download, Sparkles, Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../ui/ThemeToggle';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  onOpenImport: () => void;
  onLoadDemo: () => void;
  onExport: () => void;
  onToggleMobileMenu?: () => void;
  hasLeads: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  onOpenImport,
  onLoadDemo,
  onExport,
  onToggleMobileMenu,
  hasLeads,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors">
      <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        {/* Action Buttons & Theme Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            onClick={onLoadDemo}
            icon={<Sparkles className="w-4 h-4 text-amber-500" />}
            title="Load 10 realistic Bangalore interior-design leads for quick UI testing"
          >
            Load Demo Data
          </Button>

          {hasLeads && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              icon={<Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />}
            >
              Export Leads
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenImport}
            icon={<UploadCloud className="w-4 h-4" />}
          >
            Import Excel / CSV
          </Button>
        </div>
      </div>
    </header>
  );
};
