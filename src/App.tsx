import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar, type NavTab } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { OutreachQueuePage } from './pages/OutreachQueuePage';
import { FollowUpsPage } from './pages/FollowUpsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ImportModal } from './components/import/ImportModal';
import { ImportSummaryDialog } from './components/import/ImportSummaryDialog';
import { LegalModal, type LegalDocType } from './components/legal/LegalModal';
import { storage } from './lib/storage';
import type { Lead, LeadFilterState, LeadStatus, DashboardStats, ImportSummary } from './types/lead';
import { DEMO_LEADS } from './data/demoLeads';
import { isDuplicate } from './services/duplicateDetector';
import { exportLeadsToExcel } from './services/excelParser';
import { normalizePhoneForWhatsApp, openWhatsAppChat } from './lib/whatsapp';
import { getTodayLocalDateString, getFollowUpUrgency } from './lib/dateUtils';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const DEFAULT_FILTERS: LeadFilterState = {
  search: '',
  status: 'all',
  tier: 'all',
  phoneFilter: 'all',
  followUpFilter: 'all',
  contactFilter: 'all',
  notesFilter: 'all',
  minRating: 0,
  minReviews: 0,
  city: 'all',
  category: 'all',
  sortBy: 'score',
  sortOrder: 'desc',
  page: 1,
  pageSize: 25,
};

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function App() {
  useTheme();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filters, setFilters] = useState<LeadFilterState>(DEFAULT_FILTERS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Modals, dialogs & toasts
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalDocType, setLegalDocType] = useState<LegalDocType>('privacy');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const handleOpenLegal = (doc: LegalDocType) => {
    setLegalDocType(doc);
    setLegalModalOpen(true);
  };

  // Settings & Templates
  const [dailyGoal, setDailyGoal] = useState<number>(20);
  const [templatesCount, setTemplatesCount] = useState<number>(() => storage.loadTemplates().length);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  // Load initial data from localStorage on mount
  useEffect(() => {
    const loaded = storage.loadLeads();
    setLeads(loaded);

    const settings = storage.loadSettings();
    setDailyGoal(settings.dailyOutreachGoal || 20);

    const handleStorageUpdate = (e: any) => {
      if (e.detail) {
        setLeads(e.detail);
      }
    };

    const handleTemplatesUpdate = () => {
      setTemplatesCount(storage.loadTemplates().length);
    };

    window.addEventListener('leadflow_leads_updated', handleStorageUpdate);
    window.addEventListener('leadflow_templates_updated', handleTemplatesUpdate);
    return () => {
      window.removeEventListener('leadflow_leads_updated', handleStorageUpdate);
      window.removeEventListener('leadflow_templates_updated', handleTemplatesUpdate);
    };
  }, []);


  // Eligible leads for Outreach Queue (User Adjustment #2: Contacted leads disappear from pool)
  const eligibleQueueLeads = useMemo(() => {
    return leads
      .filter((l) => l.status === 'New' && normalizePhoneForWhatsApp(l.phone || l.rawPhone).valid)
      .sort((a, b) => (b.leadScore || 0) - (a.leadScore || 0));
  }, [leads]);

  // Compute dynamic stats from currently active dataset
  const stats: DashboardStats = useMemo(() => {
    let newLeads = 0;
    let contactedLeads = 0;
    let repliedLeads = 0;
    let demoSentLeads = 0;
    let interestedLeads = 0;
    let followUpLeads = 0;
    let negotiatingLeads = 0;
    let wonLeads = 0;
    let lostLeads = 0;
    let notInterestedLeads = 0;
    let phoneAvailableCount = 0;
    let tierA = 0;
    let tierB = 0;
    let tierC = 0;
    let overdueFollowUpsCount = 0;
    let todayFollowUpsCount = 0;
    let interestedWithoutFollowUpCount = 0;
    let repliedWithoutFollowUpCount = 0;

    const todayStr = getTodayLocalDateString();
    let todayOutreach = 0;

    leads.forEach((l) => {
      switch (l.status) {
        case 'New':
          newLeads++;
          break;
        case 'Contacted':
          contactedLeads++;
          break;
        case 'Replied':
          repliedLeads++;
          if (!l.followUpDate) repliedWithoutFollowUpCount++;
          break;
        case 'Demo Sent':
          demoSentLeads++;
          break;
        case 'Interested':
          interestedLeads++;
          if (!l.followUpDate) interestedWithoutFollowUpCount++;
          break;
        case 'Follow-up':
          followUpLeads++;
          break;
        case 'Negotiating':
          negotiatingLeads++;
          break;
        case 'Won':
          wonLeads++;
          break;
        case 'Lost':
          lostLeads++;
          break;
        case 'Not Interested':
          notInterestedLeads++;
          break;
      }

      if (l.leadTier === 'A') tierA++;
      else if (l.leadTier === 'B') tierB++;
      else tierC++;

      if (l.phone || l.rawPhone) {
        phoneAvailableCount++;
      }

      // Check contactedAt timestamp matching today
      if (l.contactedAt && l.contactedAt.slice(0, 10) === todayStr) {
        todayOutreach++;
      }

      // Follow-up urgencies
      if (l.followUpDate) {
        const urgency = getFollowUpUrgency(l.followUpDate);
        if (urgency === 'overdue') overdueFollowUpsCount++;
        else if (urgency === 'today') todayFollowUpsCount++;
      }
    });

    const total = leads.length;
    // Conversion funnel metrics
    const contactRate = total > 0 ? Math.round((contactedLeads / total) * 100) : 0;
    const replyRate = contactedLeads > 0 ? Math.round((repliedLeads / contactedLeads) * 100) : 0;
    const interestRate = repliedLeads > 0 ? Math.round((interestedLeads / repliedLeads) * 100) : 0;
    const demoRate = interestedLeads > 0 ? Math.round((demoSentLeads / interestedLeads) * 100) : 0;
    const winRate = demoSentLeads > 0 ? Math.round((wonLeads / demoSentLeads) * 100) : 0;

    const responseRate = contactedLeads > 0 ? replyRate : null;

    return {
      totalLeads: total,
      newLeads,
      contactedLeads,
      repliedLeads,
      demoSentLeads,
      interestedLeads,
      followUpLeads,
      negotiatingLeads,
      wonLeads,
      lostLeads,
      notInterestedLeads,
      tierCounts: { A: tierA, B: tierB, C: tierC },
      phoneAvailableCount,
      todayOutreachCount: todayOutreach,
      dailyGoal,
      potentialLeads: tierA + tierB,
      responseRate,
      overdueFollowUpsCount,
      todayFollowUpsCount,
      interestedWithoutFollowUpCount,
      repliedWithoutFollowUpCount,
      conversionMetrics: {
        contactRate,
        replyRate,
        interestRate,
        demoRate,
        winRate,
      },
    };
  }, [leads, dailyGoal]);

  // Lead Actions
  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    const targetLead = leads.find((l) => l.id === leadId);
    const now = new Date().toISOString();
    const updates: Partial<Lead> = { status: newStatus };

    // Record milestone timestamps if not previously set
    if (newStatus === 'Contacted' && !targetLead?.contactedAt) {
      updates.contactedAt = now;
      updates.lastContactedAt = now;
    } else if (newStatus === 'Replied' && !targetLead?.repliedAt) {
      updates.repliedAt = now;
    } else if (newStatus === 'Interested' && !targetLead?.interestedAt) {
      updates.interestedAt = now;
    } else if (newStatus === 'Demo Sent' && !targetLead?.demoSentAt) {
      updates.demoSentAt = now;
    } else if (newStatus === 'Won' && !targetLead?.wonAt) {
      updates.wonAt = now;
    } else if (newStatus === 'Lost' && !targetLead?.lostAt) {
      updates.lostAt = now;
    }

    const updated = storage.updateLead(leadId, updates);
    if (updated) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) {
        setSelectedLead(updated);
      }
      showToast(`Status updated to ${newStatus}`, 'info');
    }
  };

  // Mark Contacted (explicit outreach action)
  const handleMarkContacted = (leadId: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    const now = new Date().toISOString();
    const currentAttempts = targetLead?.contactAttempts ?? (targetLead?.status === 'Contacted' ? 1 : 0);

    const updates: Partial<Lead> = {
      status: 'Contacted',
      contactedAt: targetLead?.contactedAt || now,
      lastContactedAt: now,
      contactAttempts: currentAttempts + 1,
    };

    const updated = storage.updateLead(leadId, updates);
    if (updated) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) {
        setSelectedLead(updated);
      }
      showToast(`${updated.businessName} marked as Contacted (Attempt #${updates.contactAttempts})`, 'success');
    }
  };

  const handleUpdateLead = (leadId: string, updates: Partial<Lead>) => {
    const targetLead = leads.find((l) => l.id === leadId);
    const now = new Date().toISOString();
    const finalUpdates: Partial<Lead> = { ...updates };

    // Record milestone timestamps if status is updated via handleUpdateLead
    if (updates.status) {
      if (updates.status === 'Contacted' && !targetLead?.contactedAt) {
        finalUpdates.contactedAt = now;
        finalUpdates.lastContactedAt = now;
      } else if (updates.status === 'Replied' && !targetLead?.repliedAt) {
        finalUpdates.repliedAt = now;
      } else if (updates.status === 'Interested' && !targetLead?.interestedAt) {
        finalUpdates.interestedAt = now;
      } else if (updates.status === 'Demo Sent' && !targetLead?.demoSentAt) {
        finalUpdates.demoSentAt = now;
      } else if (updates.status === 'Won' && !targetLead?.wonAt) {
        finalUpdates.wonAt = now;
      } else if (updates.status === 'Lost' && !targetLead?.lostAt) {
        finalUpdates.lostAt = now;
      }
    }

    const updated = storage.updateLead(leadId, finalUpdates);
    if (updated) {
      setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) {
        setSelectedLead(updated);
      }
    }
  };

  const handleFilterChange = (updated: Partial<LeadFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // Open Next Lead (Primary Workflow)
  const handleOpenNextLead = useCallback(() => {
    if (eligibleQueueLeads.length === 0) {
      showToast('All eligible leads in queue contacted', 'info');
      return;
    }

    // If a lead is currently selected, pick the next one that is not this lead
    if (selectedLead) {
      const remaining = eligibleQueueLeads.filter((l) => l.id !== selectedLead.id);
      if (remaining.length > 0) {
        setSelectedLead(remaining[0]);
        showToast(`Next Lead: ${remaining[0].businessName}`, 'info');
        return;
      }
    }

    // Otherwise select the top eligible lead
    setSelectedLead(eligibleQueueLeads[0]);
    showToast(`Lead: ${eligibleQueueLeads[0].businessName}`, 'info');
  }, [eligibleQueueLeads, selectedLead, showToast]);

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onNextLead: () => {
      handleOpenNextLead();
    },
    onOpenWhatsApp: () => {
      if (selectedLead) {
        const msg = selectedLead.customMessage || selectedLead.personalizedMessage || '';
        const res = openWhatsAppChat(selectedLead.phone || selectedLead.rawPhone || '', msg);
        if (!res.success) {
          showToast(res.error || 'Failed to open WhatsApp', 'error');
        }
      }
    },
    onCopyMessage: () => {
      if (selectedLead) {
        const msg = selectedLead.customMessage || selectedLead.personalizedMessage || '';
        if (msg) {
          navigator.clipboard.writeText(msg);
          showToast('Message copied to clipboard!', 'success');
        }
      }
    },
    onMarkContacted: () => {
      if (selectedLead && selectedLead.status !== 'Contacted') {
        handleMarkContacted(selectedLead.id);
      }
    },
    onCloseInspector: () => {
      if (selectedLead) {
        setSelectedLead(null);
      }
    },
  });

  // Load Demo Data with duplicate protection
  const handleLoadDemo = () => {
    const currentLeads = [...leads];
    const newDemoLeads: Lead[] = [];
    let dups = 0;

    DEMO_LEADS.forEach((demoLead) => {
      const dupCheck = isDuplicate(demoLead, [...currentLeads, ...newDemoLeads]);
      if (dupCheck.duplicate) {
        dups++;
      } else {
        newDemoLeads.push(demoLead);
      }
    });

    if (newDemoLeads.length > 0) {
      const updatedList = [...currentLeads, ...newDemoLeads];
      storage.saveLeads(updatedList);
      setLeads(updatedList);
    }

    setImportSummary({
      totalRows: DEMO_LEADS.length,
      importedCount: newDemoLeads.length,
      duplicatesCount: dups,
      missingNameCount: 0,
      sourceName: 'Sample Demo Leads (Bangalore Interior Design)',
      skippedRows: [],
    });
  };

  // Import Successful callback
  const handleImportSuccess = (importedLeads: Lead[], summary: ImportSummary) => {
    if (importedLeads.length > 0) {
      const importedMap = new Map(importedLeads.map((l) => [l.id, l]));
      // Update existing leads in place if present in importedLeads
      const updatedExisting = leads.map((l) => importedMap.get(l.id) || l);
      // Append any brand new leads
      const brandNew = importedLeads.filter((l) => !leads.some((ex) => ex.id === l.id));
      const updatedList = [...updatedExisting, ...brandNew];
      storage.saveLeads(updatedList);
      setLeads(updatedList);
      if (selectedLead) {
        const refreshed = updatedList.find((l) => l.id === selectedLead.id);
        if (refreshed) setSelectedLead(refreshed);
      }
    }
    setImportSummary(summary);
  };

  // Clear all data
  const handleClearAllData = () => {
    storage.clearAllData();
    setLeads([]);
    setSelectedLead(null);
    showToast('All local CRM data cleared', 'info');
  };

  // Export leads
  const handleExportLeads = () => {
    if (leads.length === 0) return;
    exportLeadsToExcel(leads, `leadflow_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('Leads exported successfully', 'success');
  };

  // Page title and subtitle
  const getHeaderMeta = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Outreach Command Center',
          subtitle: `${leads.length} leads in pipeline • ${stats.potentialLeads} prime prospects`,
        };
      case 'queue':
        return {
          title: "Today's Outreach Queue",
          subtitle: `${eligibleQueueLeads.length} leads ready for WhatsApp contact`,
        };
      case 'leads':
        return {
          title: 'Lead Database',
          subtitle: `Showing verified contacts, Google ratings, and portfolio metrics`,
        };
      case 'followups':
        return {
          title: 'Follow-up Pipeline',
          subtitle: `${stats.overdueFollowUpsCount + stats.todayFollowUpsCount} follow-ups requiring attention today`,
        };
      case 'analytics':
        return {
          title: 'Business Intelligence & Analytics',
          subtitle: `Commercial conversion metrics across ${leads.length} leads in your pipeline`,
        };
      case 'templates':
        return {
          title: 'Message Templates Studio',
          subtitle: 'Craft, personalize, and test high-converting WhatsApp outreach templates',
        };
      case 'settings':
        return {
          title: 'CRM Settings',
          subtitle: 'Manage local storage, daily goals, and exports',
        };
      default:
        return {
          title: String(currentTab).toUpperCase(),
          subtitle: 'LeadFlow CRM',
        };

    }
  };

  const handleNavigateToLeadsWithFilters = (appliedFilters?: { status?: string; tier?: string; category?: string }) => {
    if (appliedFilters) {
      setFilters((prev) => ({
        ...prev,
        status: appliedFilters.status || 'all',
        tier: appliedFilters.tier || 'all',
        category: appliedFilters.category || 'all',
        page: 1,
      }));
    }
    setCurrentTab('leads');
  };

  const handleNavigateToFollowUpsWithFilter = (_followUpFilter?: string) => {
    setCurrentTab('followups');
  };

  const handleRestoreLeads = (restoredLeads: Lead[]) => {
    storage.saveLeads(restoredLeads);
    setLeads(restoredLeads);
    setSelectedLead(null);
    showToast(`Successfully restored ${restoredLeads.length} leads from backup!`, 'success');
  };

  const headerMeta = getHeaderMeta();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          leadsCount={leads.length}
          queueCount={eligibleQueueLeads.length}
          followUpsCount={stats.overdueFollowUpsCount + stats.todayFollowUpsCount}
          templatesCount={templatesCount}
          onOpenLegal={handleOpenLegal}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-zinc-950/70"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 bg-white dark:bg-zinc-900 shadow-xl">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setIsMobileMenuOpen(false);
              }}
              leadsCount={leads.length}
              queueCount={eligibleQueueLeads.length}
              followUpsCount={stats.overdueFollowUpsCount + stats.todayFollowUpsCount}
              templatesCount={templatesCount}
              onOpenLegal={handleOpenLegal}
            />
          </div>
        </div>
      )}


      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          title={headerMeta.title}
          subtitle={headerMeta.subtitle}
          onOpenImport={() => setIsImportModalOpen(true)}
          onLoadDemo={handleLoadDemo}
          onExport={handleExportLeads}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          hasLeads={leads.length > 0}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              leads={leads}
              stats={stats}
              onOpenImport={() => setIsImportModalOpen(true)}
              onLoadDemo={handleLoadDemo}
              onNavigateToLeads={(tier) => {
                if (tier) {
                  setFilters({ ...DEFAULT_FILTERS, tier });
                }
                setCurrentTab('leads');
              }}
              onNavigateToQueue={() => setCurrentTab('queue')}
              onNavigateToAnalytics={() => setCurrentTab('analytics')}
              onOpenNextLead={handleOpenNextLead}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onStatusChange={handleStatusChange}
              onMarkContacted={handleMarkContacted}
              onUpdateLead={handleUpdateLead}
              selectedLead={selectedLead}
              onCloseLeadInspector={() => setSelectedLead(null)}
              hasNextLead={eligibleQueueLeads.length > 0}
            />
          )}

          {currentTab === 'queue' && (
            <OutreachQueuePage
              leads={leads}
              stats={stats}
              dailyGoal={dailyGoal}
              onOpenNextLead={handleOpenNextLead}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onMarkContacted={handleMarkContacted}
            />
          )}

          {currentTab === 'leads' && (
            <LeadsPage
              leads={leads}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onStatusChange={handleStatusChange}
              onUpdateLead={handleUpdateLead}
              selectedLead={selectedLead}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onMarkContacted={handleMarkContacted}
              onNextLead={handleOpenNextLead}
              hasNextLead={eligibleQueueLeads.length > 0}
            />
          )}

          {currentTab === 'followups' && (
            <FollowUpsPage
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              selectedLead={selectedLead}
              onCloseLeadInspector={() => setSelectedLead(null)}
              onUpdateLead={handleUpdateLead}
              onMarkContacted={handleMarkContacted}
              onNavigateToLeads={() => setCurrentTab('leads')}
            />
          )}

          {currentTab === 'templates' && (
            <TemplatesPage
              leads={leads}
              onSelectLead={(lead) => setSelectedLead(lead)}
            />
          )}


          {currentTab === 'analytics' && (
            <AnalyticsPage
              leads={leads}
              onNavigateToLeads={handleNavigateToLeadsWithFilters}
              onNavigateToFollowUps={handleNavigateToFollowUpsWithFilter}
              onSelectLead={(lead) => setSelectedLead(lead)}
              selectedLead={selectedLead}
              onCloseLeadInspector={() => setSelectedLead(null)}
              onUpdateLead={handleUpdateLead}
              onMarkContacted={handleMarkContacted}
              hasNextLead={eligibleQueueLeads.length > 0}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              leads={leads}
              dailyGoal={dailyGoal}
              onUpdateDailyGoal={(g) => {
                setDailyGoal(g);
                storage.saveSettings({ dailyOutreachGoal: g });
                showToast('Daily goal saved', 'success');
              }}
              onClearAllData={handleClearAllData}
              onRestoreLeads={handleRestoreLeads}
              onSelectLead={(lead) => setSelectedLead(lead)}
              onOpenLegal={handleOpenLegal}
            />
          )}
        </main>
      </div>

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-2 rounded-md shadow-lg border text-xs font-medium animate-in slide-in-from-bottom-2 duration-150 ${
              toast.type === 'success'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-800 dark:border-zinc-200'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-100 border-rose-800'
                : 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 border-zinc-800 dark:border-zinc-700'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" strokeWidth={1.5} />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" strokeWidth={1.5} />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingLeads={leads}
        onImportSuccess={handleImportSuccess}
      />

      {/* Import Summary Dialog */}
      <ImportSummaryDialog
        summary={importSummary}
        onClose={() => setImportSummary(null)}
        onViewLeads={() => {
          setImportSummary(null);
          setCurrentTab('leads');
        }}
      />

      {/* Legal & Compliance Modal (Items 26 and 27) */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialDoc={legalDocType}
      />
    </div>
  );
}

export default App;
