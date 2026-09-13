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
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: 'A — Hot',
          icon: '🔥',
        };
      case 'B':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'B — Good',
          icon: '🟢',
        };
      case 'C':
      default:
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          label: 'C — Low',
          icon: '🟡',
        };
    }
  };

  const style = getStyles();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold border shadow-2xs whitespace-nowrap',
        style.bg,
        className
      )}
      title={`Lead Tier ${tier}${score !== undefined ? ` (Score: ${score})` : ''}`}
    >
      <span>{style.icon}</span>
      <span>{style.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-75 font-mono text-[10px] ml-0.5 font-normal">
          ({score})
        </span>
      )}
    </span>
  );
};
