import React from 'react';
import {
  Users,
  Send,
  MessageCircle,
  Eye,
  CheckCircle,
  Clock,
  Briefcase,
  XCircle,
  Layers,
} from 'lucide-react';
import type { DashboardStats } from '../../types/lead';

interface StatCardsProps {
  stats: DashboardStats;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total',
      value: stats.totalLeads,
      icon: Users,
    },
    {
      title: 'New',
      value: stats.newLeads,
      icon: Layers,
    },
    {
      title: 'Contacted',
      value: stats.contactedLeads,
      icon: Send,
    },
    {
      title: 'Replied',
      value: stats.repliedLeads,
      icon: MessageCircle,
    },
    {
      title: 'Demo Sent',
      value: stats.demoSentLeads,
      icon: Eye,
    },
    {
      title: 'Interested',
      value: stats.interestedLeads,
      icon: CheckCircle,
    },
    {
      title: 'Follow-up',
      value: stats.followUpLeads,
      icon: Clock,
    },
    {
      title: 'Won',
      value: stats.wonLeads,
      icon: Briefcase,
      highlight: true,
    },
    {
      title: 'Lost',
      value: stats.lostLeads,
      icon: XCircle,
    },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 font-sans">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-3 rounded-md border transition-colors ${
              card.highlight
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 truncate">
                {card.title}
              </span>
              <Icon
                className={`w-3 h-3 ${
                  card.highlight
                    ? 'text-emerald-400 dark:text-emerald-600'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
                strokeWidth={1.5}
              />
            </div>
            <div className="text-lg font-bold font-mono tabular-nums leading-tight tracking-tight">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
