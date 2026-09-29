import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Star,
  Send,
  Search,
  CheckCheck,
  User,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import type { Lead } from '../types/lead';
import {
  type MessageTemplate,
  type TemplateCategory,
  TEMPLATE_VARIABLES,
} from '../types/template';
import {
  loadTemplates,
  saveTemplates,
  resetTemplates,
  renderTemplate,
  setDefaultTemplate,
} from '../lib/templates';
import { openWhatsAppChat } from '../lib/whatsapp';
import { Button } from '../components/ui/Button';

interface TemplatesPageProps {
  leads: Lead[];
  onSelectLead?: (lead: Lead) => void;
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  discovery: 'Cold Discovery',
  social_proof: 'Social Proof',
  direct: 'Quick & Direct',
  followup: 'Follow-up',
  custom: 'Custom',
};

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  discovery: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
  social_proof: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
  direct: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
  followup: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
  custom: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700',
};

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ leads }) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => loadTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(() => {
    const list = loadTemplates();
    const def = list.find((t) => t.isDefault);
    return def ? def.id : list[0]?.id || '';
  });

  // Editor states
  const [editingName, setEditingName] = useState('');
  const [editingCategory, setEditingCategory] = useState<TemplateCategory>('custom');
  const [editingContent, setEditingContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | TemplateCategory>('all');

  // Preview lead selection
  const [previewLeadId, setPreviewLeadId] = useState<string>(() => leads[0]?.id || 'sample');
  const [copiedPreview, setCopiedPreview] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize editor whenever selectedTemplateId changes
  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    if (activeTemplate) {
      setEditingName(activeTemplate.name);
      setEditingCategory(activeTemplate.category);
      setEditingContent(activeTemplate.content);
      setIsDirty(false);
    }
  }, [activeTemplate?.id]);

  // Lead for preview
  const previewLead = useMemo(() => {
    if (previewLeadId === 'sample' || !leads.length) {
      return {
        id: 'sample',
        businessName: 'Studio One Interiors',
        city: 'Bangalore',
        category: 'Interior Designer',
        rating: 4.8,
        reviews: 42,
        images: 35,
        phone: '+91 98765 43210',
        rawPhone: '9876543210',
        neighborhood: 'Indiranagar',
        status: 'New' as const,
        leadScore: 85,
        leadTier: 'A' as const,
        importSource: 'Sample',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return leads.find((l) => l.id === previewLeadId) || leads[0];
  }, [leads, previewLeadId]);

  // Live rendered message preview
  const renderedMessage = useMemo(() => {
    return renderTemplate(editingContent, previewLead);
  }, [editingContent, previewLead]);

  // Flash feedback helper
  const showFeedback = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => setStatusFeedback(null), 3000);
  };

  // Variable chip inserter
  const handleInsertVariable = (varKey: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setEditingContent((prev) => prev + varKey);
      setIsDirty(true);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editingContent;
    const before = text.substring(0, start);
    const after = text.substring(end);

    const newContent = before + varKey + after;
    setEditingContent(newContent);
    setIsDirty(true);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + varKey.length, start + varKey.length);
    }, 0);
  };

  // Save template
  const handleSaveTemplate = () => {
    if (!editingName.trim()) {
      showFeedback('Template name is required!');
      return;
    }

    const updated = templates.map((t) => {
      if (t.id === selectedTemplateId) {
        return {
          ...t,
          name: editingName.trim(),
          category: editingCategory,
          content: editingContent,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });

    setTemplates(updated);
    saveTemplates(updated);
    setIsDirty(false);
    showFeedback('Template saved successfully!');
  };

  // Set active default
  const handleSetDefault = (id: string) => {
    const updated = setDefaultTemplate(id);
    setTemplates(updated);
    showFeedback('Set as active default outreach template!');
  };

  // Create new template
  const handleCreateNew = () => {
    const newId = 'template-custom-' + Date.now();
    const newTemplate: MessageTemplate = {
      id: newId,
      name: 'New Custom Template',
      category: 'custom',
      content: 'Hi {{business_name}},\n\nI came across your work in {{city}} and wanted to reach out regarding a website concept demo.\n\nWould you be open to reviewing a quick concept?',
      isDefault: false,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    saveTemplates(updated);
    setSelectedTemplateId(newId);
    showFeedback('New template created! Customize it in the editor.');
  };

  // Duplicate template
  const handleDuplicate = (template: MessageTemplate) => {
    const newId = 'template-custom-' + Date.now();
    const duplicated: MessageTemplate = {
      ...template,
      id: newId,
      name: `${template.name} (Copy)`,
      isDefault: false,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [duplicated, ...templates];
    setTemplates(updated);
    saveTemplates(updated);
    setSelectedTemplateId(newId);
    showFeedback(`Duplicated "${template.name}"`);
  };

  // Delete template
  const handleDeleteTemplate = (id: string, name: string) => {
    if (templates.length <= 1) {
      showFeedback('You must keep at least one template.');
      return;
    }

    const filtered = templates.filter((t) => t.id !== id);
    if (filtered.length > 0 && !filtered.some((t) => t.isDefault)) {
      filtered[0].isDefault = true;
    }

    setTemplates(filtered);
    saveTemplates(filtered);
    if (selectedTemplateId === id) {
      setSelectedTemplateId(filtered[0]?.id || '');
    }
    showFeedback(`Deleted "${name}"`);
  };

  // Reset all to defaults
  const handleResetDefaults = () => {
    if (window.confirm('Reset all templates to factory defaults? Any custom templates will be overwritten.')) {
      const defs = resetTemplates();
      setTemplates(defs);
      setSelectedTemplateId(defs[0]?.id || '');
      showFeedback('Reset to default templates!');
    }
  };

  // Copy preview
  const handleCopyPreview = () => {
    navigator.clipboard.writeText(renderedMessage);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2000);
    showFeedback('Message copied to clipboard!');
  };

  // WhatsApp launcher test
  const handleTestWhatsApp = () => {
    if (!previewLead.phone && !previewLead.rawPhone) {
      showFeedback('Selected lead does not have a phone number.');
      return;
    }
    const res = openWhatsAppChat(previewLead.phone || previewLead.rawPhone || '', renderedMessage);
    if (!res.success) {
      showFeedback(res.error || 'Failed to open WhatsApp');
    }
  };

  // Filtered template list
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      const matchCategory = activeCategoryFilter === 'all' || t.category === activeCategoryFilter;
      const matchSearch =
        !searchQuery.trim() ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [templates, activeCategoryFilter, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-900 dark:text-zinc-100">
              <FileText className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                  Message Templates Studio
                </h1>
                <span className="px-2 py-0.5 rounded-sm text-xs font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {templates.length} Active
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Design and test outreach messages with dynamic lead variables like{' '}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">
                  {'{{business_name}}'}
                </code>{' '}
                and{' '}
                <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200 font-mono text-[11px]">
                  {'{{rating}}'}
                </code>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            icon={<RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />}
            className="text-xs"
            title="Reset built-in templates to default"
          >
            Reset Defaults
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreateNew}
            icon={<Plus className="w-4 h-4" strokeWidth={1.5} />}
            className="text-xs font-medium"
          >
            New Template
          </Button>
        </div>
      </div>

      {/* Floating Status Toast Feedback */}
      {statusFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-3.5 py-2 rounded-md shadow-lg border border-zinc-800 dark:border-zinc-200 text-xs font-medium flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" strokeWidth={1.5} />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* 3-Column Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================================= */}
        {/* COLUMN 1: TEMPLATES LIBRARY (4 cols on lg) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
              Template Library
            </h2>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {filteredTemplates.length} of {templates.length}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {(['all', 'discovery', 'social_proof', 'direct', 'followup', 'custom'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategoryFilter === cat
                    ? 'bg-slate-900 dark:bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'All' : CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Templates Cards List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-0.5">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                No templates found matching your search.
              </div>
            ) : (
              filteredTemplates.map((t) => {
                const isSelected = t.id === selectedTemplateId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplateId(t.id)}
                    className={`group relative p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}

                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                            {t.name}
                          </span>
                          {t.isDefault && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                              CATEGORY_COLORS[t.category]
                            }`}
                          >
                            {CATEGORY_LABELS[t.category] || t.category}
                          </span>
                          {t.isBuiltIn && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              Built-in
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick action buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        {!t.isDefault && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(t.id);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Set as Default Template"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(t);
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Duplicate Template"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {!t.isBuiltIn && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTemplate(t.id, t.name);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Delete Template"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Snippet */}
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 font-mono leading-relaxed">
                      {t.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 2: TEMPLATE EDITOR (4 cols on lg) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-zinc-900 dark:text-zinc-100" strokeWidth={1.5} />
              Template Editor
            </h2>
            {isDirty && (
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-sm border border-amber-200 dark:border-amber-800">
                Unsaved changes
              </span>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Template Name */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Template Name
              </label>
              <input
                type="text"
                value={editingName}
                onChange={(e) => {
                  setEditingName(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="e.g. Interior Design Direct Pitch"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Category Select */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={editingCategory}
                onChange={(e) => {
                  setEditingCategory(e.target.value as TemplateCategory);
                  setIsDirty(true);
                }}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="discovery">Cold Discovery</option>
                <option value="social_proof">Social Proof & Reviews</option>
                <option value="direct">Quick & Direct</option>
                <option value="followup">Follow-up Nudge</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {/* Variable Insertion Pills */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  Insert Dynamic Variables (Click to Add)
                </label>
              </div>
              <div className="flex flex-wrap gap-1">
                {TEMPLATE_VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => handleInsertVariable(v.key)}
                    className="text-[10px] px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-slate-700 transition-colors font-mono"
                    title={`Inserts ${v.key} (${v.description})`}
                  >
                    + {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Message Body
              </label>
              <textarea
                ref={textareaRef}
                rows={11}
                value={editingContent}
                onChange={(e) => {
                  setEditingContent(e.target.value);
                  setIsDirty(true);
                }}
                placeholder="Write your template copy here... Use {{business_name}} and {{city}} to personalize."
                className="w-full p-3 text-xs leading-relaxed font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1">
                <span>{editingContent.length} chars • {editingContent.split(/\s+/).filter(Boolean).length} words</span>
                <span>Supports WhatsApp formatting (*bold*, _italic_)</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveTemplate}
                  icon={<Check className="w-3.5 h-3.5" />}
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Template
                </Button>
                {activeTemplate && !activeTemplate.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(activeTemplate.id)}
                    icon={<Star className="w-3.5 h-3.5 text-amber-500" />}
                    className="text-xs text-slate-700 dark:text-slate-300"
                    title="Make this the default template for all new outreach"
                  >
                    Set Default
                  </Button>
                )}
              </div>

              {isDirty && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (activeTemplate) {
                      setEditingName(activeTemplate.name);
                      setEditingCategory(activeTemplate.category);
                      setEditingContent(activeTemplate.content);
                      setIsDirty(false);
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  Discard
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUMN 3: LIVE WHATSAPP SIMULATOR & TESTER (4 cols on lg) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
              Live WhatsApp Simulator
            </h2>
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-sm border border-emerald-200 dark:border-emerald-800">
              Interactive Preview
            </span>
          </div>

          {/* Lead Selector for testing */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />
              <span>Preview Against Lead</span>
            </label>
            <select
              value={previewLeadId}
              onChange={(e) => setPreviewLeadId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 truncate"
            >
              <option value="sample">Sample Lead: Studio One Interiors (Rating: 4.8, Bangalore)</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.businessName} {l.city ? `(${l.city})` : ''} - {l.rating ? `Rating: ${l.rating}` : 'No rating'}
                </option>
              ))}
            </select>
          </div>

          {/* WhatsApp Chat Simulator Screen */}
          <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {/* WhatsApp App Bar */}
            <div className="bg-[#075e54] dark:bg-[#004d40] text-white px-3.5 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white">
                  {previewLead.businessName?.charAt(0) || 'L'}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold truncate max-w-[170px]">
                    {previewLead.businessName}
                  </div>
                  <div className="text-[10px] text-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>online</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded text-emerald-100 font-mono">
                {previewLead.phone || previewLead.rawPhone || 'No Phone'}
              </div>
            </div>

            {/* Chat Wallpaper Area */}
            <div className="bg-[#efeae2] dark:bg-[#0b141a] p-3.5 min-h-[320px] max-h-[380px] overflow-y-auto flex flex-col justify-end transition-colors">
              <div className="text-center my-2">
                <span className="text-[10px] bg-white/80 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded shadow-2xs font-mono">
                  TODAY
                </span>
              </div>

              {/* Chat Bubble (Outgoing) */}
              <div
                data-testid="whatsapp-chat-bubble"
                className="self-end max-w-[92%] bg-[#d9fdd3] dark:bg-[#005c4b] text-zinc-900 dark:text-zinc-100 rounded-lg rounded-tr-xs p-3 text-xs whitespace-pre-wrap leading-relaxed transition-colors"
              >
                <p className="font-sans break-words">{renderedMessage || '(No message content)'}</p>

                <div className="flex items-center justify-end gap-1 mt-1.5 text-[10px] text-zinc-500 dark:text-emerald-200/70">
                  <span>10:42 AM</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-300" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* Chat Bottom Bar */}
            <div className="bg-zinc-100 dark:bg-zinc-800 px-3 py-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Rendered with live lead attributes
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                Ready to send
              </span>
            </div>
          </div>

          {/* Test Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPreview}
              icon={copiedPreview ? <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
              className="text-xs"
            >
              {copiedPreview ? 'Copied' : 'Copy Message'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTestWhatsApp}
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Test WhatsApp
            </Button>
          </div>

          <div className="p-2.5 rounded-md bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-mono">
            <strong className="text-zinc-700 dark:text-zinc-300 font-sans">Pro Tip:</strong> When you set a template as Default, new leads and outreach queue items will automatically pre-populate with that template.
          </div>
        </div>
      </div>
    </div>
  );
};
