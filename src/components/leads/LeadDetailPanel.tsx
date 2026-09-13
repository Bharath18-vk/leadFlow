import { useState, useEffect } from 'react';
import {
  X,
  Star,
  Image as ImageIcon,
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Phone,
  MessageSquare,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Send,
  AlertTriangle,
  Keyboard,
  Clock,
  FileText,
  History,
  CheckCircle2,
  Trash2,
  CalendarDays,
  IndianRupee,
} from 'lucide-react';
import type { Lead, LeadStatus } from '../../types/lead';
import { TierBadge } from './TierBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from '../ui/Button';
import { formatNumber } from '../../lib/utils';
import { normalizePhoneForWhatsApp, openWhatsAppChat } from '../../lib/whatsapp';
import {
  getTodayLocalDateString,
  addDaysToLocalDate,
  getFollowUpUrgency,
  formatFollowUpDisplay,
} from '../../lib/dateUtils';
import { loadTemplates, renderTemplate } from '../../lib/templates';
import type { MessageTemplate } from '../../types/template';


interface LeadDetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateLead: (id: string, updates: Partial<Lead>) => void;
  onMarkContacted: (id: string) => void;
  onNextLead?: () => void;
  hasNextLead?: boolean;
}

export const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({
  lead,
  onClose,
  onUpdateLead,
  onMarkContacted,
  onNextLead,
  hasNextLead = false,
}) => {
  // Active message is customMessage if edited, otherwise personalizedMessage
  const [currentMessage, setCurrentMessage] = useState(
    lead?.customMessage || lead?.personalizedMessage || ''
  );
  const [notes, setNotes] = useState(lead?.notes || '');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [whatsAppOpenedBanner, setWhatsAppOpenedBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Template management
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => loadTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  useEffect(() => {
    const handleTemplatesUpdated = (e: any) => {
      if (e.detail) {
        setTemplates(e.detail);
      } else {
        setTemplates(loadTemplates());
      }
    };
    window.addEventListener('leadflow_templates_updated', handleTemplatesUpdated);
    return () => window.removeEventListener('leadflow_templates_updated', handleTemplatesUpdated);
  }, []);

  // Sync state whenever lead changes
  useEffect(() => {
    if (!lead) return;
    setCurrentMessage(lead.customMessage || lead.personalizedMessage || '');
    setNotes(lead.notes || '');
    setCopiedPhone(false);
    setCopiedMessage(false);
    setWhatsAppOpenedBanner(false);
    setErrorMessage(null);
    setSelectedTemplateId('');
  }, [lead?.id, lead?.customMessage, lead?.personalizedMessage, lead?.notes]);


  if (!lead) return null;

  // Phone validation
  const phoneValidation = normalizePhoneForWhatsApp(lead.phone || lead.rawPhone);

  // Copy current phone
  const handleCopyPhone = () => {
    const raw = lead.phone || lead.rawPhone || '';
    if (!raw) return;
    navigator.clipboard.writeText(raw);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Copy current textarea message
  const handleCopyMessage = () => {
    if (!currentMessage) return;
    navigator.clipboard.writeText(currentMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  // Handle message changes & auto-persist
  const handleMessageChange = (val: string) => {
    setCurrentMessage(val);
    onUpdateLead(lead.id, {
      customMessage: val,
      personalizedMessage: val,
    });
  };

  // Apply template to current message
  const handleApplyTemplate = (tId: string) => {
    if (!tId) return;
    const target = templates.find((t) => t.id === tId);
    if (!target) return;
    setSelectedTemplateId(tId);
    const rendered = renderTemplate(target.content, lead);
    handleMessageChange(rendered);
  };


  // Handle notes changes & auto-persist
  const handleNotesChange = (val: string) => {
    setNotes(val);
    onUpdateLead(lead.id, { notes: val });
  };

  // Set follow-up date
  const handleSetFollowUp = (dateStr: string | undefined) => {
    onUpdateLead(lead.id, { followUpDate: dateStr });
  };

  // Open WhatsApp
  const handleOpenWhatsApp = () => {
    setErrorMessage(null);
    const result = openWhatsAppChat(lead.phone || lead.rawPhone || '', currentMessage);

    if (result.success) {
      setWhatsAppOpenedBanner(true);
    } else {
      setErrorMessage(result.error || 'Failed to open WhatsApp');
    }
  };

  // Mark Contacted confirmation
  const handleConfirmContacted = () => {
    onMarkContacted(lead.id);
    setWhatsAppOpenedBanner(false);
  };

  // Urgency badge for follow-up date
  const followUpUrgency = getFollowUpUrgency(lead.followUpDate);
  const contactAttempts = lead.contactAttempts ?? (lead.status === 'Contacted' ? 1 : 0);

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar with Navigation & Actions */}
      <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-900/90">
        <div className="flex items-center gap-2">
          <TierBadge tier={lead.leadTier} score={lead.leadScore} showScore />
          <StatusBadge status={lead.status} />
          {lead.followUpDate && (
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                followUpUrgency === 'overdue'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : followUpUrgency === 'today'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>{formatFollowUpDisplay(lead.followUpDate)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onNextLead && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNextLead}
              disabled={!hasNextLead}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              title="Jump to the next highest-scoring uncontacted lead (Keyboard: N)"
              className="text-xs"
            >
              Next Lead
            </Button>
          )}

          <button
            onClick={onClose}
            aria-label="Close panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Close Inspector (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Drawer Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* SECTION 1: Business Information */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {lead.businessName}
            </h2>
            {lead.googleMapsUrl && (
              <a
                href={lead.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                title="Open in Google Maps"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">{lead.category}</p>

          {lead.address && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{lead.address}</span>
            </p>
          )}

          {/* Reputation Summary Grid */}
          <div className="grid grid-cols-3 gap-3 mt-3.5">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
              <div className="flex items-center justify-center gap-1 font-bold text-slate-800 dark:text-slate-100 text-base">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{lead.rating ? lead.rating.toFixed(1) : '—'}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Rating</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
              <div className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {lead.reviews ? formatNumber(lead.reviews) : 0}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Reviews</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center">
              <div className="flex items-center justify-center gap-1 font-bold text-slate-800 dark:text-slate-100 text-base">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                <span>{lead.images ? formatNumber(lead.images) : 0}</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Photos</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Contact & Communication */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Contact Phone
            </span>

            {phoneValidation.valid ? (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                WhatsApp Ready
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-2 py-0.5 rounded-full">
                Invalid / Missing
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-base font-bold text-slate-900 dark:text-slate-100">
              {phoneValidation.valid ? phoneValidation.displayPhone : lead.phone || 'No phone number'}
            </span>

            {lead.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPhone}
                icon={copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                className="text-xs"
              >
                {copiedPhone ? 'Copied ✓' : 'Copy Phone'}
              </Button>
            )}
          </div>

          {!phoneValidation.valid && (
            <p className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{phoneValidation.error || 'Phone number format cannot be used for WhatsApp'}</span>
            </p>
          )}
        </div>

        {/* SECTION 3: Pipeline Status & Quick Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Pipeline Stage & Follow-Up
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {contactAttempts > 0 ? `${contactAttempts} contact attempt${contactAttempts > 1 ? 's' : ''}` : 'No outreach yet'}
            </span>
          </div>

          {/* Quick Status Selection & Stage Controls */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Pipeline Stage
              </label>
              <select
                value={lead.status}
                onChange={(e) => onUpdateLead(lead.id, { status: e.target.value as LeadStatus })}
                aria-label="Change lead status"
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Replied">Replied</option>
                <option value="Interested">Interested</option>
                <option value="Demo Sent">Demo Sent</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Negotiating">Negotiating</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {[
                { s: 'Contacted' as LeadStatus, label: '✓ Contacted', color: 'hover:bg-purple-100 dark:hover:bg-purple-950/60 hover:text-purple-800 dark:hover:text-purple-300' },
                { s: 'Replied' as LeadStatus, label: '💬 Replied', color: 'hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-800 dark:hover:text-amber-300' },
                { s: 'Interested' as LeadStatus, label: '⭐ Interested', color: 'hover:bg-emerald-100 dark:hover:bg-emerald-950/60 hover:text-emerald-800 dark:hover:text-emerald-300' },
                { s: 'Demo Sent' as LeadStatus, label: '🚀 Demo Sent', color: 'hover:bg-indigo-100 dark:hover:bg-indigo-950/60 hover:text-indigo-800 dark:hover:text-indigo-300' },
                { s: 'Follow-up' as LeadStatus, label: '⏰ Follow-up', color: 'hover:bg-orange-100 dark:hover:bg-orange-950/60 hover:text-orange-800 dark:hover:text-orange-300' },
                { s: 'Negotiating' as LeadStatus, label: '🤝 Negotiating', color: 'hover:bg-teal-100 dark:hover:bg-teal-950/60 hover:text-teal-800 dark:hover:text-teal-300' },
                { s: 'Won' as LeadStatus, label: '🏆 Won', color: 'hover:bg-green-100 dark:hover:bg-green-950/60 hover:text-green-800 dark:hover:text-green-300' },
                { s: 'Lost' as LeadStatus, label: '❌ Lost', color: 'hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:text-rose-800 dark:hover:text-rose-300' },
                { s: 'Not Interested' as LeadStatus, label: '🚫 Not Interested', color: 'hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200' },
              ].map(({ s, label, color }) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdateLead(lead.id, { status: s })}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-all ${
                    lead.status === s
                      ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 shadow-2xs'
                      : `bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 ${color}`
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Follow-up Scheduling Controls */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Schedule Follow-up
              </label>
              {lead.followUpDate && (
                <button
                  type="button"
                  onClick={() => handleSetFollowUp(undefined)}
                  className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-800 flex items-center gap-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear Date
                </button>
              )}
            </div>

            {/* Quick date chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleSetFollowUp(addDaysToLocalDate(1))}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  lead.followUpDate === addDaysToLocalDate(1)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleSetFollowUp(addDaysToLocalDate(3))}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  lead.followUpDate === addDaysToLocalDate(3)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                In 3 days
              </button>
              <button
                type="button"
                onClick={() => handleSetFollowUp(addDaysToLocalDate(7))}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                  lead.followUpDate === addDaysToLocalDate(7)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                In 7 days
              </button>

              {/* Custom Date Input */}
              <div className="relative inline-flex items-center">
                <input
                  type="date"
                  value={lead.followUpDate || ''}
                  min={getTodayLocalDateString()}
                  onChange={(e) => handleSetFollowUp(e.target.value || undefined)}
                  className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Revenue & Deal Tracking */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                Revenue & Deal Tracking
              </label>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Optional</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Quoted Amount */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">Quoted Amount</label>
                <div className="relative rounded-lg">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-400 dark:text-slate-500 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={lead.quotedAmount ?? ''}
                    placeholder="e.g. 15000"
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      onUpdateLead(lead.id, { quotedAmount: val, currency: 'INR' });
                    }}
                    className="w-full pl-6 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Deal Value */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">
                  {lead.status === 'Won' ? '🎉 Final Deal Value' : 'Deal Value'}
                </label>
                <div className="relative rounded-lg">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={lead.dealValue ?? ''}
                    placeholder="e.g. 12000"
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      onUpdateLead(lead.id, { dealValue: val, currency: 'INR' });
                    }}
                    className={`w-full pl-6 pr-2.5 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 ${
                      lead.status === 'Won'
                        ? 'border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Lightweight Outreach Confirmation Banner */}
        {whatsAppOpenedBanner && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-300 dark:border-blue-700 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200 font-bold text-sm">
              <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>WhatsApp conversation opened</span>
            </div>
            <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
              Once you have reviewed and clicked Send inside WhatsApp, mark this lead as contacted:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmContacted}
                icon={<Check className="w-4 h-4" />}
                className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold"
              >
                ✓ Mark as Contacted
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWhatsAppOpenedBanner(false)}
                className="text-xs"
              >
                Not Yet
              </Button>
            </div>
          </div>
        )}

        {/* SECTION 4: Message Workspace */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Personalized WhatsApp Message</span>
            </label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMessage}
              icon={copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              className="text-xs"
              title="Copy current message to clipboard (Keyboard: C)"
            >
              {copiedMessage ? 'Copied ✓' : '📋 Copy Message'}
            </Button>
          </div>

          {/* Template Selection Bar */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 shrink-0 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              Template:
            </span>
            <select
              data-testid="lead-template-select"
              value={selectedTemplateId}
              onChange={(e) => handleApplyTemplate(e.target.value)}
              className="flex-1 text-xs py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
            >

              <option value="">Choose a template to apply...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isDefault ? '★ (Default)' : ''}
                </option>
              ))}
            </select>
            {selectedTemplateId && (
              <button
                type="button"
                onClick={() => handleApplyTemplate(selectedTemplateId)}
                className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shrink-0"
                title="Re-apply this template"
              >
                Re-apply
              </button>
            )}
          </div>

          <textarea

            rows={7}
            value={currentMessage}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="Type or edit personalized message..."
            className="w-full p-3.5 text-xs leading-relaxed font-mono bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-2xs"
          />

          <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
            <span>{currentMessage.length} characters • {currentMessage.split(/\s+/).filter(Boolean).length} words</span>
            <span>Edits are saved automatically</span>
          </div>
        </div>

        {/* SECTION 5: Activity & Notes */}
        <div className="space-y-3.5 pt-2 border-t border-slate-200 dark:border-slate-800">
          {/* Notes Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Client Notes</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Add client follow-up notes, objections, quote details, or discussion summary..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 shadow-2xs"
            />
          </div>

          {/* Activity Timeline */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Activity History</span>
            </label>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs space-y-2 font-mono">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Created / Imported</span>
                <span>{new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              {lead.contactedAt && (
                <div className="flex items-center justify-between text-purple-700 dark:text-purple-300">
                  <span>First Contacted ({contactAttempts} attempts)</span>
                  <span>{new Date(lead.contactedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              {lead.lastContactedAt && lead.lastContactedAt !== lead.contactedAt && (
                <div className="flex items-center justify-between text-purple-700 dark:text-purple-300">
                  <span>Last Contacted</span>
                  <span>{new Date(lead.lastContactedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}

              {lead.repliedAt && (
                <div className="flex items-center justify-between text-amber-700 dark:text-amber-300">
                  <span>Replied</span>
                  <span>{new Date(lead.repliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              {lead.demoSentAt && (
                <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300">
                  <span>Demo Sent</span>
                  <span>{new Date(lead.demoSentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              {lead.wonAt && (
                <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>Deal Won 🎉</span>
                  <span>{new Date(lead.wonAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              {lead.lostAt && (
                <div className="flex items-center justify-between text-rose-700 dark:text-rose-400">
                  <span>Closed Lost</span>
                  <span>{new Date(lead.lostAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              )}

              {lead.followUpDate && (
                <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 font-bold">
                  <span>Follow-up Scheduled</span>
                  <span>{formatFollowUpDisplay(lead.followUpDate)} ({lead.followUpDate})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Primary Open WhatsApp CTA */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-3">
          {/* Main Open WhatsApp CTA */}
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            disabled={!phoneValidation.valid || !currentMessage.trim()}
            title={phoneValidation.valid ? 'Open WhatsApp Web in new tab (Keyboard: O)' : phoneValidation.error}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2 transition-all select-none active:scale-[0.99] ${
              phoneValidation.valid && currentMessage.trim()
                ? 'bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-emerald-600/20 cursor-pointer'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed shadow-none'
            }`}
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>💬 Open WhatsApp</span>
          </button>

          {/* Quick Mark Contacted Button */}
          {lead.status !== 'Contacted' ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => onMarkContacted(lead.id)}
              icon={<Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              className="py-3 px-3 text-xs"
              title="Mark as contacted without opening WhatsApp (Keyboard: M)"
            >
              Mark Contacted
            </Button>
          ) : (
            <Button
              variant="outline"
              size="md"
              onClick={() => onMarkContacted(lead.id)}
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
              className="py-3 px-3 text-xs text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/40"
              title="Log another contact attempt"
            >
              Attempt #{contactAttempts + 1}
            </Button>
          )}
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 px-1">
          <span className="flex items-center gap-1">
            <Keyboard className="w-3 h-3" />
            <span>Shortcuts: <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">O</kbd> WhatsApp • <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">C</kbd> Copy • <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">M</kbd> Contacted • <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">N</kbd> Next</span>
          </span>
          <span>Never sends automatically</span>
        </div>
      </div>
    </div>
  );
};
