import React from 'react';
import {
  Users,
  Sparkles,
  Send,
  MessageCircle,
  Eye,
  ThumbsUp,
  Clock,
  Trophy,
  XCircle,
} from 'lucide-react';
import type { DashboardStats } from '../../types/lead';

interface StatCardsProps {
  stats: DashboardStats;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'New',
      value: stats.newLeads,
      icon: Sparkles,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-100',
    },
    {
      title: 'Contacted',
      value: stats.contactedLeads,
      icon: Send,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
    {
      title: 'Replied',
      value: stats.repliedLeads,
      icon: MessageCircle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
    {
      title: 'Demo Sent',
      value: stats.demoSentLeads,
      icon: Eye,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Interested',
      value: stats.interestedLeads,
      icon: ThumbsUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
    {
      title: 'Follow-up',
      value: stats.followUpLeads,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
    },
    {
      title: 'Won',
      value: stats.wonLeads,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
    },
    {
      title: 'Lost',
      value: stats.lostLeads,
      icon: XCircle,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-3.5 rounded-xl bg-white dark:bg-slate-900 border ${card.borderColor} dark:border-slate-800 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{card.title}</span>
              <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.color} dark:bg-slate-800`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};
