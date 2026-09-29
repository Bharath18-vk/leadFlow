import React from 'react';
import { Clock, ArrowLeft } from 'lucide-react';
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
      <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center mx-auto border border-zinc-200 dark:border-zinc-700">
        <Clock className="w-6 h-6" strokeWidth={1.5} />
      </div>

      <div className="space-y-2">
        <span className="inline-block px-2 py-0.5 rounded-sm text-[11px] font-mono tracking-wider uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          Phase 2 Deployment
        </span>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">{description}</p>
      </div>

      <div className="pt-2">
        <Button variant="outline" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" strokeWidth={1.5} />}>
          Back to Leads
        </Button>
      </div>
    </div>
  );
};
