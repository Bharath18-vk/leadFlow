import React from 'react';
import type { LeadTier } from '../../types/lead';
import { cn } from '../../lib/utils';

interface TierBadgeProps {
  tier: LeadTier;
  score?: number;
  className?: string;
  showScore?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  score,
  className,
  showScore = false,
}) => {
  const getStyles = () => {
    switch (tier) {
      case 'A':
        return {
          container: 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-200',
          dot: 'bg-emerald-500',
          label: 'Tier A: Priority',
        };
      case 'B':
        return {
          container: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-300 dark:border-zinc-700',
          dot: 'bg-zinc-400 dark:bg-zinc-500',
          label: 'Tier B: Qualified',
        };
      case 'C':
      default:
        return {
          container: 'bg-zinc-50 text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800',
          dot: 'bg-zinc-300 dark:bg-zinc-600',
          label: 'Tier C: Standard',
        };
    }
  };

  const style = getStyles();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap tracking-tight font-sans',
        style.container,
        className
      )}
      title={`Lead Tier ${tier}${score !== undefined ? ` (Score: ${score})` : ''}`}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
      <span>{style.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-70 font-mono text-[10px] ml-0.5 font-normal tabular-nums">
          [{score}]
        </span>
      )}
    </span>
  );
};
