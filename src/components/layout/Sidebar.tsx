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
  onOpenLegal?: (doc: 'privacy' | 'terms') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  leadsCount,
  queueCount,
  followUpsCount,
  templatesCount,
  onOpenLegal,
}) => {
  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
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
    <aside className="w-60 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-screen shrink-0 sticky top-0 transition-colors font-sans">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-5 border-b border-zinc-200 dark:border-zinc-800 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center p-1.5 shrink-0">
            <LeadFlowLogo className="w-full h-full text-white dark:text-zinc-950" />
          </div>
          <div>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight block leading-tight">
              LeadFlow
            </span>
            <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              Outreach CRM
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <div className="px-2.5 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors group',
                item.active
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'w-3.5 h-3.5 transition-colors',
                    item.active
                      ? 'text-white dark:text-zinc-950'
                      : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                  )}
                  strokeWidth={1.5}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-sm text-[10px] font-mono tabular-nums',
                    item.active
                      ? 'bg-zinc-700 text-zinc-200 dark:bg-zinc-200 dark:text-zinc-800'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Legal & Privacy Links (Items 26 and 27) */}
      <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
        <button
          onClick={() => onOpenLegal && onOpenLegal('privacy')}
          className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          Privacy Policy
        </button>
        <span>•</span>
        <button
          onClick={() => onOpenLegal && onOpenLegal('terms')}
          className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          Terms of Service
        </button>
      </div>

      {/* Storage Footer Badge */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40">
        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
          <Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          <span className="font-medium text-[11px]">Local Sandbox Active</span>
        </div>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-mono">
          {leadsCount} records stored in browser
        </p>
      </div>
    </aside>
  );
};
