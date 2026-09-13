import React from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';

interface Phase2PlaceholderProps {
  title: string;
  description: string;
  onBack: () => void;
}

export const Phase2Placeholder: React.FC<Phase2PlaceholderProps> = ({
  title,
  description,
  onBack,
}) => {
  return (
    <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          Scheduled for Phase 2
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>

      <div className="pt-2">
        <Button variant="outline" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Leads
        </Button>
      </div>
    </div>
  );
};
