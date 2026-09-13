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
        return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20';
      case 'Contacted':
        return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20';
      case 'Replied':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
      case 'Demo Sent':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20';
      case 'Interested':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
      case 'Follow-up':
        return 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/20';
      case 'Negotiating':
        return 'bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20';
      case 'Won':
        return 'bg-green-100 text-green-800 border-green-300 font-semibold ring-green-500/20';
      case 'Lost':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
      case 'Not Interested':
        return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shadow-2xs whitespace-nowrap',
        getColors(status),
        onClick ? 'cursor-pointer hover:opacity-85' : '',
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
};
