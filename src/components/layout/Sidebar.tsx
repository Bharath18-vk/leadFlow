import React from 'react';
import {
  LayoutDashboard,
  Users,
  Send,
  CalendarClock,
  FileText,
  BarChart3,
  Settings,
  Database,
} from 'lucide-react';
import { cn } from '../../lib/utils';

import { LeadFlowLogo } from '../common/LeadFlowLogo';

export type NavTab =
  | 'dashboard'
  | 'leads'
  | 'queue'
  | 'followups'
  | 'templates'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  leadsCount: number;
  queueCount?: number;
  followUpsCount?: number;
  templatesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  leadsCount,
  queueCount,
  followUpsCount,
  templatesCount,
}) => {
  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    tag?: string;
    active: boolean;
  }

  const navItems: NavItem[] = [

    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      active: currentTab === 'dashboard',
    },
    {
      id: 'leads' as NavTab,
      label: 'Leads',
      icon: Users,
      badge: leadsCount > 0 ? leadsCount : undefined,
      active: currentTab === 'leads',
    },
    {
      id: 'queue' as NavTab,
      label: 'Outreach Queue',
      icon: Send,
      badge: queueCount !== undefined && queueCount > 0 ? queueCount : undefined,
      active: currentTab === 'queue',
    },
    {
      id: 'followups' as NavTab,
      label: 'Follow-ups',
      icon: CalendarClock,
      badge: followUpsCount !== undefined && followUpsCount > 0 ? followUpsCount : undefined,
      active: currentTab === 'followups',
    },
    {
      id: 'templates' as NavTab,
      label: 'Templates',
      icon: FileText,
      badge: templatesCount !== undefined && templatesCount > 0 ? templatesCount : undefined,
      active: currentTab === 'templates',
    },

    {
      id: 'analytics' as NavTab,
      label: 'Analytics',
      icon: BarChart3,
      active: currentTab === 'analytics',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      active: currentTab === 'settings',
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 sticky top-0 transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800/90 border border-slate-700/60 flex items-center justify-center p-2 shadow-md shadow-emerald-500/10 shrink-0">
            <LeadFlowLogo className="w-full h-full drop-shadow-sm" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-lg tracking-tight block leading-tight">
              LeadFlow
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Outreach CRM
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                item.active
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-semibold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    item.active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums',
                    item.active
                      ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {item.badge}
                </span>
              )}
              {item.tag && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Storage & Local-first Footer Badge */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-950/50">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1">
          <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-medium">Local-First Storage</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          {leadsCount} leads stored securely in browser storage.
        </p>
      </div>
    </aside>
  );
};
