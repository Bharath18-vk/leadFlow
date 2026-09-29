import React from 'react';
import { UploadCloud, Download, Layers, Menu } from 'lucide-react';
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
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-20 transition-colors font-sans">
      <div className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</h1>
            {subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
          </div>
        </div>

        {/* Action Buttons & Theme Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <ThemeToggle />

          <Button
            variant="outline"
            size="sm"
            onClick={onLoadDemo}
            icon={<Layers className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />}
            title="Load 10 realistic Bangalore interior-design leads for quick UI testing"
          >
            Load Sample Dataset
          </Button>

          {hasLeads && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              icon={<Download className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />}
            >
              Export
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={onOpenImport}
            icon={<UploadCloud className="w-3.5 h-3.5" strokeWidth={1.5} />}
          >
            Import Excel
          </Button>
        </div>
      </div>
    </header>
  );
};
