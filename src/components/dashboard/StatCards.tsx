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
    { title: 'Total', value: stats.totalLeads, icon: Users, color: 'text-zinc-400 dark:text-zinc-500' },
    { title: 'New', value: stats.newLeads, icon: Layers, color: 'text-blue-500 dark:text-blue-400' },
    { title: 'Contacted', value: stats.contactedLeads, icon: Send, color: 'text-violet-500 dark:text-violet-400' },
    { title: 'Replied', value: stats.repliedLeads, icon: MessageCircle, color: 'text-sky-500 dark:text-sky-400' },
    { title: 'Demo Sent', value: stats.demoSentLeads, icon: Eye, color: 'text-cyan-500 dark:text-cyan-400' },
    { title: 'Interested', value: stats.interestedLeads, icon: CheckCircle, color: 'text-teal-500 dark:text-teal-400' },
    { title: 'Follow-up', value: stats.followUpLeads, icon: Clock, color: 'text-amber-500 dark:text-amber-400' },
    {
      title: 'Won',
      value: stats.wonLeads,
      icon: Briefcase,
      color: 'text-emerald-500 dark:text-emerald-400',
      highlight: true,
    },
    { title: 'Lost', value: stats.lostLeads, icon: XCircle, color: 'text-rose-500 dark:text-rose-400' },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2 font-sans">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`group relative p-3 rounded-lg border transition-all duration-200 cursor-default overflow-hidden ${
              card.highlight
                ? 'bg-emerald-950/30 dark:bg-emerald-950/40 border-emerald-800/40 dark:border-emerald-700/30'
                : 'bg-white dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {card.highlight && (
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
            )}
            <div className="flex items-start justify-between gap-1 mb-1.5">
              <span className={`text-[10px] font-medium truncate ${card.highlight ? 'text-emerald-400/80' : 'text-zinc-500 dark:text-zinc-500'}`}>
                {card.title}
              </span>
              <Icon className={`w-3 h-3 shrink-0 ${card.color}`} strokeWidth={1.5} />
            </div>
            <div className={`text-xl font-bold font-mono tabular-nums leading-none tracking-tight ${card.highlight ? 'text-emerald-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
