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
  Globe,
  ArrowUpRight,
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
  onOpenLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  leadsCount,
  queueCount,
  followUpsCount,
  templatesCount,
  onOpenLegal,
  onOpenLanding,
}) => {
  interface NavItem {
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    badge?: number;
    urgent?: boolean;
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
      urgent: (followUpsCount ?? 0) > 0,
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
    <aside className="w-56 bg-zinc-50 dark:bg-[#0c0c0e] border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col h-screen shrink-0 sticky top-0 transition-colors font-sans">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center p-1.5 shrink-0 shadow-md shadow-emerald-600/25">
            <LeadFlowLogo className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-tight block leading-tight">
              LeadFlow
            </span>
            <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest block">
              CRM
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-2 pb-2 text-[9px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-2 rounded-md text-[11px] font-medium transition-all duration-150 group active:scale-[0.98]',
                item.active
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-zinc-100'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'w-3.5 h-3.5 shrink-0 transition-colors',
                    item.active
                      ? 'text-white dark:text-zinc-950'
                      : item.urgent
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'
                  )}
                  strokeWidth={1.5}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[9px] font-mono tabular-nums shrink-0',
                    item.active
                      ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-900'
                      : item.urgent
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                        : 'bg-zinc-200/80 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Landing Page Link & Legal */}
      <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-800/60 space-y-1">
        {onOpenLanding && (
          <button
            onClick={onOpenLanding}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Landing Page</span>
            </div>
            <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          </button>
        )}
        <div className="flex items-center justify-between pt-0.5">
          <button
            onClick={() => onOpenLegal && onOpenLegal('privacy')}
            className="text-[10px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Privacy
          </button>
          <span className="text-zinc-300 dark:text-zinc-700 text-[10px]">·</span>
          <button
            onClick={() => onOpenLegal && onOpenLegal('terms')}
            className="text-[10px] text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Terms
          </button>
        </div>
      </div>

      {/* Storage Footer */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-500">
          <div className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </div>
          <span className="font-medium">Local Sandbox</span>
        </div>
        <p className="text-[9px] text-zinc-400 dark:text-zinc-600 mt-0.5 font-mono flex items-center gap-1">
          <Database className="w-2.5 h-2.5 inline" strokeWidth={1.5} />
          {leadsCount} records · browser only
        </p>
      </div>
    </aside>
  );
};
