import React, { useState } from 'react';
import {
  Send,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronRight,
  Database,
  BarChart3,
  Check,
  FileSpreadsheet,
} from 'lucide-react';
import { LeadFlowLogo } from '../components/common/LeadFlowLogo';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [activeTab, setActiveTab] = useState<'import' | 'score' | 'queue' | 'pipeline'>('queue');
  const [demoLeadName, setDemoLeadName] = useState('Studio One Interiors');
  const [demoCategory, setDemoCategory] = useState<'cold' | 'followup' | 'proof'>('cold');
  const [copiedDemo, setCopiedDemo] = useState(false);

  // Template demo text generation
  const demoMessage = React.useMemo(() => {
    switch (demoCategory) {
      case 'cold':
        return `Hi ${demoLeadName}! Noticed your stellar 4.8★ rating in Bangalore. We build high-converting client galleries for premium interior studios. Would you be open to a quick 2-min preview?`;
      case 'followup':
        return `Hey ${demoLeadName}, following up on my previous note. Thought you might find our local Bangalore case study interesting. Let me know if you'd like a quick link!`;
      case 'proof':
        return `Hello ${demoLeadName}! We recently helped 3 design studios in Bangalore boost their direct inquiries by 35% through streamlined WhatsApp follow-ups. Here is our 1-page overview:`;
    }
  }, [demoLeadName, demoCategory]);

  const handleCopy = () => {
    navigator.clipboard.writeText(demoMessage);
    setCopiedDemo(true);
    setTimeout(() => setCopiedDemo(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* ======= TOP NAVIGATION BAR ======= */}
      <header className="sticky top-0 z-50 bg-[#09090b]/85 backdrop-blur-md border-b border-zinc-800/70">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center p-1.5 shadow-sm shadow-emerald-500/20">
              <LeadFlowLogo className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight block leading-tight">
                LeadFlow
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">
                Sales Console
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-zinc-400">
            <a href="#workflow" className="hover:text-white transition-colors">
              Workflow
            </a>
            <a href="#safety" className="hover:text-white transition-colors">
              Anti-Ban Protocol
            </a>
            <a href="#playground" className="hover:text-white transition-colors">
              Template Engine
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Local Architecture
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnter}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-all duration-150 active:scale-[0.98] shadow-sm shadow-emerald-600/30 cursor-pointer"
            >
              <span>Launch App</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ======= HERO SECTION ======= */}
      <section className="relative px-6 pt-16 pb-20 border-b border-zinc-800/60 overflow-hidden">
        {/* Subtle background architectural grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Signal Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-zinc-400">Local-First CRM</span>
            <span className="text-zinc-600">/</span>
            <span className="text-emerald-400 font-medium">Zero Telemetry</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.1] max-w-3xl mx-auto">
            High-volume WhatsApp outreach, <br />
            <span className="text-emerald-400">without the spam bans.</span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Ingest spreadsheet leads from scrapers or Google Maps, prioritize high-reputation prospects, and dispatch personalized WhatsApp messages at safe human intervals. All stored directly in your browser.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnter}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Launch Outreach Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#workflow"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium border border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 text-zinc-300 hover:text-white transition-all duration-150 active:scale-[0.98]"
            >
              <span>Explore System Flow</span>
            </a>
          </div>

          {/* Guarantee Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-[11px] font-mono text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
              <span>No Cloud Database</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
              <span>Offline-First Sandbox</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
              <span>Paced Jitter Scheduling</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
              <span>Always Free & Open</span>
            </div>
          </div>
        </div>

        {/* ======= INTERACTIVE WORKFLOW PREVIEW SANDBOX ======= */}
        <div id="workflow" className="relative z-10 max-w-5xl mx-auto mt-14">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl shadow-black/80">
            {/* Window Chrome Header */}
            <div className="px-4 py-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <span className="text-[11px] font-mono text-zinc-400 ml-2">leadflow.local / live console</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Paced Interval Engine: Active</span>
              </div>
            </div>

            {/* Stage Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-zinc-800 bg-zinc-950/40 text-xs font-medium">
              {[
                { id: 'import', label: '01 Ingest Excel/CSV', icon: FileSpreadsheet },
                { id: 'score', label: '02 AI Lead Scoring', icon: Sparkles },
                { id: 'queue', label: '03 Paced Dispatch', icon: Send },
                { id: 'pipeline', label: '04 Stage Funnel', icon: BarChart3 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`px-4 py-3 text-left flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
                    activeTab === id
                      ? 'border-emerald-500 text-white bg-zinc-800/40'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/20'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${activeTab === id ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>

            {/* Dynamic Stage Content Preview */}
            <div className="p-6">
              {activeTab === 'import' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-white">Lossless Spreadsheet Ingestion</h2>
                      <p className="text-xs text-zinc-400">
                        Map messy columns to structured contact schemas with automatic E.164 phone normalization.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      .XLSX, .CSV, .ODS
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 pt-2">
                    <div className="bg-zinc-950/70 border border-zinc-800 rounded-lg p-3 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Step 1</span>
                      <p className="text-xs font-semibold text-zinc-200">Phone Sanitize</p>
                      <p className="text-[11px] text-zinc-400">Strips parentheses, spaces & validates country code prefix.</p>
                    </div>
                    <div className="bg-zinc-950/70 border border-zinc-800 rounded-lg p-3 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Step 2</span>
                      <p className="text-xs font-semibold text-zinc-200">Deduplication</p>
                      <p className="text-[11px] text-zinc-400">Identifies existing entries by phone and business name to preserve notes.</p>
                    </div>
                    <div className="bg-zinc-950/70 border border-zinc-800 rounded-lg p-3 space-y-1">
                      <span className="text-[10px] font-mono uppercase text-zinc-400">Step 3</span>
                      <p className="text-xs font-semibold text-zinc-200">Instant Sandbox Load</p>
                      <p className="text-[11px] text-zinc-400">Zero backend upload required; data streams straight into browser state.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'score' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-white">Multivariate Reputation Scoring</h2>
                      <p className="text-xs text-zinc-400">
                        Weights rating quality, review velocity, and verification state into Tier A, B, and C pools.
                      </p>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-400 border border-emerald-800/80">
                      Score: 0 to 100
                    </span>
                  </div>
                  <div className="space-y-2 pt-2">
                    {[
                      { name: 'Studio One Interiors', rating: '4.9★ (124 reviews)', score: 96, tier: 'Tier A', reason: 'High reviews, pristine rating, mobile phone verified' },
                      { name: 'Zenith Architecture Group', rating: '4.6★ (88 reviews)', score: 88, tier: 'Tier A', reason: 'Established profile, primary WhatsApp match' },
                      { name: 'Urban Craft Living', rating: '4.2★ (14 reviews)', score: 71, tier: 'Tier B', reason: 'Emerging business, good secondary prospect' },
                    ].map((row) => (
                      <div key={row.name} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-zinc-200">{row.name}</p>
                          <p className="text-[11px] text-zinc-400">{row.rating} · <span className="text-zinc-500">{row.reason}</span></p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-emerald-400">{row.score}/100</span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {row.tier}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'queue' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-white">Anti-Ban Paced Dispatch Queue</h2>
                      <p className="text-xs text-zinc-400">
                        Sends at randomized human intervals (e.g. 25s–40s + jitter) to protect your WhatsApp account.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-zinc-400">Next send in:</span>
                      <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800">
                        00:28s
                      </span>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-zinc-950/80 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Next in queue: Studio One Interiors</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800">Score 96</span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">Template: Cold Discovery (Bangalore) · Target: +91 98450 12345</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={onEnter}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-all active:scale-[0.98] shadow-sm shadow-emerald-600/30 cursor-pointer"
                      >
                        Dispatch via WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pipeline' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold text-white">End-to-End Sales Pipeline Tracking</h2>
                      <p className="text-xs text-zinc-400">
                        Tracks conversion drop-offs from Contacted to Replied, Interested, Demo Sent, and Won Deals.
                      </p>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">Stage Velocity Metrics</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2 pt-2 text-center">
                    {[
                      { stage: 'Contacted', count: 48, rate: '100%' },
                      { stage: 'Replied', count: 24, rate: '50.0%' },
                      { stage: 'Interested', count: 14, rate: '58.3%' },
                      { stage: 'Demo Sent', count: 9, rate: '64.2%' },
                      { stage: 'Won Deals', count: 5, rate: '55.5%' },
                    ].map((step) => (
                      <div key={step.stage} className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-1">
                        <span className="text-[10px] font-mono uppercase text-zinc-400">{step.stage}</span>
                        <div className="text-lg font-bold font-mono text-white">{step.count}</div>
                        <div className="text-[10px] font-mono text-emerald-400 font-medium">{step.rate} conv</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======= ANTI-BAN PROTOCOL SECTION ======= */}
      <section id="safety" className="py-20 px-6 border-b border-zinc-800/60 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Operational Safety
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Why manual outreach & spam bots fail.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Bulk WhatsApp automation scripts frequently trigger Meta's anti-abuse algorithms. LeadFlow was engineered specifically around legitimate 1-on-1 human pacing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* The Risky Way */}
            <div className="p-6 rounded-xl border border-rose-900/40 bg-rose-950/10 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <Shield className="w-4 h-4 text-rose-500" />
                <span>The Risky Automation Way</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Shoots 100 messages within seconds using headless browser scripts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Uniform delays without human micro-jitter trigger automated spam heuristics.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Stores your leads and client data on obscure third-party cloud servers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span>Permanent WhatsApp business phone number bans with zero recourse.</span>
                </li>
              </ul>
            </div>

            {/* The LeadFlow Way */}
            <div className="p-6 rounded-xl border border-emerald-800/50 bg-emerald-950/10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>The Engineered LeadFlow Way</span>
              </div>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Dispatches via official WhatsApp Web protocol links with 1-click human confirmation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Paced countdown timers with ±15% randomized human jitter between sends.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Zero cloud exposure: prospect records never leave your local browser sandbox.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Automatic milestone logging: tracks contact attempts, timestamps, and follow-ups.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ======= INTERACTIVE TEMPLATE PLAYGROUND ======= */}
      <section id="playground" className="py-20 px-6 border-b border-zinc-800/60">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Live Interactive Simulator
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Test dynamic variable syntax in real time.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Customize variables like {'{{businessName}}'}, {'{{rating}}'}, and {'{{city}}'} to verify how your pitch appears inside native WhatsApp bubbles before firing.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* Control Panel */}
            <div className="md:col-span-6 bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Target Business Name Variable</label>
                <input
                  type="text"
                  value={demoLeadName}
                  onChange={(e) => setDemoLeadName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-md bg-zinc-950 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  placeholder="e.g. Studio One Interiors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Outreach Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cold', label: 'Cold Discovery' },
                    { id: 'followup', label: 'Follow-Up Nudge' },
                    { id: 'proof', label: 'Social Proof' },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setDemoCategory(id as any)}
                      className={`px-2.5 py-1.5 text-[11px] font-medium rounded-md border text-center transition-all cursor-pointer ${
                        demoCategory === id
                          ? 'bg-zinc-800 text-white border-zinc-600'
                          : 'bg-zinc-950/50 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-400 space-y-2">
                <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Syntax Variables Available</span>
                <div className="flex flex-wrap gap-1.5">
                  {['{{businessName}}', '{{rating}}', '{{reviews}}', '{{city}}', '{{category}}'].map((tag) => (
                    <span key={tag} className="font-mono text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCopy}
                className="w-full py-2.5 px-3 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
              >
                {copiedDemo ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5" />}
                <span>{copiedDemo ? 'Copied to Clipboard!' : 'Copy Rendered Message'}</span>
              </button>
            </div>

            {/* Realistic WhatsApp Chat Bubble Preview */}
            <div className="md:col-span-6 bg-[#0b141a] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              {/* WhatsApp App Header */}
              <div className="bg-[#1f2c34] text-white px-4 py-3 flex items-center justify-between border-b border-black/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white">
                    {demoLeadName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-100">{demoLeadName}</h3>
                    <p className="text-[10px] text-emerald-400">verified business · online</p>
                  </div>
                </div>
                <div className="text-[10px] font-mono text-zinc-400">WhatsApp Web</div>
              </div>

              {/* Chat Viewport */}
              <div className="p-5 min-h-[220px] bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] flex flex-col justify-end">
                <div className="max-w-[85%] ml-auto bg-[#005c4b] text-white p-3 rounded-lg rounded-tr-none shadow-sm space-y-1 relative">
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{demoMessage}</p>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-zinc-300 pt-0.5">
                    <span>10:42 AM</span>
                    <span className="text-cyan-300 font-bold">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======= LOCAL ARCHITECTURE SECTION ======= */}
      <section id="architecture" className="py-20 px-6 border-b border-zinc-800/60 bg-zinc-950/40">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Data Sovereignty
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Your prospects stay strictly on your machine.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Unlike SaaS CRMs that store, monetize, or expose your private client databases to remote cloud breaches, LeadFlow operates entirely client-side.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Browser Local Storage</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Leads, stage progression, and custom templates reside inside your browser's persistent key-value store. No API key required.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Zero Cloud Ingestion</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When you drag in an Excel sheet with 500 contacts, zero bytes are transmitted across the network. Full privacy by default.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Instant Excel Backup</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Export your updated pipeline at any moment back to formatted .xlsx with timestamps, contact statuses, and notes intact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======= FINAL LAUNCH CTA ======= */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
            <LeadFlowLogo className="w-7 h-7 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to streamline your outreach workflow?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              No sign-up, no monthly fees, and zero software installation. Launch the console in your browser and start in seconds.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onEnter}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/25 transition-all duration-150 active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enter LeadFlow CRM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ======= FOOTER ======= */}
      <footer className="border-t border-zinc-800/60 py-6 px-6 text-xs text-zinc-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-emerald-600 flex items-center justify-center">
              <LeadFlowLogo className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-zinc-200">LeadFlow CRM</span>
            <span className="text-zinc-400">· Offline Local Console</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-400">
            <span>Client-side Execution</span>
            <span>·</span>
            <span>WCAG 2.2 AA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
