import React from 'react';
import type { LeadStatus } from '../../types/lead';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
  onClick?: () => void;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, onClick }) => {
  const getColors = (s: LeadStatus) => {
    switch (s) {
      case 'New':
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 dot-blue-500';
      case 'Contacted':
        return 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 dot-zinc-400';
      case 'Replied':
        return 'bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800/80 dot-amber-500';
      case 'Demo Sent':
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 dot-cyan-500';
      case 'Interested':
        return 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 dot-emerald-500 font-semibold';
      case 'Follow-up':
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700 dot-amber-500';
      case 'Negotiating':
        return 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-200 dot-emerald-400 font-semibold';
      case 'Won':
        return 'bg-emerald-600 text-white border-emerald-700 dark:border-emerald-500 font-bold dot-white';
      case 'Lost':
        return 'bg-zinc-100/60 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 dot-zinc-400';
      case 'Not Interested':
        return 'bg-zinc-100/60 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 dot-zinc-400';
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 dot-zinc-400';
    }
  };

  const colorMeta = getColors(status);
  const dotColor = colorMeta.includes('dot-blue-500')
    ? 'bg-blue-500'
    : colorMeta.includes('dot-emerald-500')
    ? 'bg-emerald-500'
    : colorMeta.includes('dot-amber-500')
    ? 'bg-amber-500'
    : colorMeta.includes('dot-cyan-500')
    ? 'bg-cyan-500'
    : colorMeta.includes('dot-white')
    ? 'bg-white'
    : 'bg-zinc-400 dark:bg-zinc-500';

  const cleanClasses = colorMeta.replace(/dot-[a-z0-9-]+/g, '').trim();

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border whitespace-nowrap tracking-tight font-sans transition-colors',
        cleanClasses,
        onClick ? 'cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600' : '',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />
      <span>{status}</span>
    </span>
  );
};
