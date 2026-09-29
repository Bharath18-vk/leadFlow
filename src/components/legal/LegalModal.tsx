import React, { useState } from 'react';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '../ui/Button';

export type LegalDocType = 'privacy' | 'terms';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialDoc = 'privacy',
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {activeDoc === 'privacy' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              ) : (
                <FileText className="w-5 h-5 text-zinc-600 dark:text-zinc-300" strokeWidth={1.5} />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                {activeDoc === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                LeadFlow local-first sales architecture
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="px-6 pt-3 flex gap-2 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            onClick={() => setActiveDoc('privacy')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors ${
              activeDoc === 'privacy'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Privacy Policy (Zero Telemetry)
          </button>
          <button
            onClick={() => setActiveDoc('terms')}
            className={`pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors ${
              activeDoc === 'terms'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Terms of Service
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-sans">
          {activeDoc === 'privacy' ? (
            <>
              <div className="p-3 rounded-md bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium">
                LeadFlow operates on a strict local-first paradigm. No prospect information, contact details, or messages are ever transmitted to an external server.
              </div>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2">1. Local Data Storage</h3>
              <p>
                All lead datasets, phone numbers, custom message drafts, follow-up dates, notes, and commercial deal values remain solely within your local web browser sandbox (via Web Storage API).
              </p>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2">2. Zero Telemetry & Tracking</h3>
              <p>
                LeadFlow does not load external analytics, trackers, pixels, cookies, or third-party monitoring scripts. There is zero telemetry collection.
              </p>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2">3. Direct WhatsApp URI Communication</h3>
              <p>
                When initiating outreach, LeadFlow generates official WhatsApp Universal Links (via api.whatsapp.com or whatsapp:// desktop protocols). LeadFlow does not intermediate, intercept, or log message delivery over external networks.
              </p>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2">4. Data Deletion & Portability</h3>
              <p>
                You retain complete sovereignty over your data. You can perform full JSON snapshots, export to Excel at any time, or permanently wipe all local records using the Clear Data tool in Settings.
              </p>
            </>
          ) : (
            <>
              <div className="p-3 rounded-md bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium">
                By operating LeadFlow, you agree to comply with WhatsApp Terms of Service and applicable telecommunications regulations.
              </div>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2">1. Authorized & Human-Directed Use</h3>
              <p>
                LeadFlow is an assistive productivity interface designed for human-reviewed sales outreach. Users agree never to use LeadFlow for automated spamming, harassment, unlawful solicitations, or deceptive communications.
              </p>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2">2. WhatsApp Policy Compliance</h3>
              <p>
                WhatsApp is a registered trademark of Meta Platforms, Inc. LeadFlow is not affiliated with, endorsed by, or sponsored by WhatsApp or Meta. You are solely responsible for ensuring your outreach adheres to WhatsApp policies and local commercial communication laws.
              </p>

              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2">3. Software Provided As-Is</h3>
              <p>
                LeadFlow is provided under open terms without warranty of any kind, express or implied. The developers are not liable for account suspensions, communication disputes, or business outcomes resulting from usage.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500 font-mono">
            Version 1.0 (Local Sandbox)
          </span>
          <Button size="sm" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
