import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquare,
  Users,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Star,
  Shield,
  Clock,
  Target,
  TrendingUp,
  Send,
  ChevronRight,
} from 'lucide-react';
import { LeadFlowLogo } from '../components/common/LeadFlowLogo';

interface LandingPageProps {
  onEnter: () => void;
}

/* ---- Reusable animated counter ---- */
function AnimatedCounter({ target, suffix = '', duration = 1800 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ---- Reveal on scroll ---- */
function RevealOnScroll({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '60px' }
    );
    if (ref.current) observer.observe(ref.current);

    // Safety fallback: ensure visibility if observer is throttled or delayed
    const timer = setTimeout(() => {
      setVisible(true);
    }, 1000 + delay);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(22px)',
        transition: `opacity 0.55s ease ${delay}ms, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ---- Feature card data ---- */
const FEATURES = [
  {
    icon: Users,
    color: 'emerald',
    title: 'Smart Lead Scoring',
    desc: 'AI-ranked leads based on rating, reviews, and outreach history. Always know who to contact next.',
  },
  {
    icon: MessageSquare,
    color: 'green',
    title: 'WhatsApp Integration',
    desc: 'One-click message dispatch with custom templates. Auto-batch scheduling keeps your account safe.',
  },
  {
    icon: Clock,
    color: 'teal',
    title: 'Follow-up Reminders',
    desc: 'Never lose a lead. Automatic follow-up scheduling with urgency indicators for overdue contacts.',
  },
  {
    icon: BarChart3,
    color: 'cyan',
    title: 'Outreach Analytics',
    desc: 'Conversion funnels, daily goal tracking, and trend charts to optimize your outreach strategy.',
  },
  {
    icon: Shield,
    color: 'emerald',
    title: 'Privacy First',
    desc: 'All data stored locally in your browser. Zero servers, zero subscriptions, zero data breaches.',
  },
  {
    icon: Zap,
    color: 'green',
    title: 'Excel Import',
    desc: 'Drag-and-drop your existing lead sheets. Smart deduplication handles the rest automatically.',
  },
];

const STATS = [
  { value: 10, suffix: 'x', label: 'Faster outreach', desc: 'vs manual WhatsApp' },
  { value: 500, suffix: '+', label: 'Leads managed', desc: 'per workspace' },
  { value: 100, suffix: '%', label: 'Privacy', desc: 'no cloud storage' },
  { value: 0, suffix: '$', label: 'Monthly cost', desc: 'forever free' },
];

const TESTIMONIALS = [
  {
    name: 'Priya M.',
    role: 'Interior Designer, Bangalore',
    quote: 'LeadFlow cut my morning outreach from 90 minutes to under 15. The queue system is a game changer.',
    stars: 5,
  },
  {
    name: 'Rahul K.',
    role: 'B2B Sales Lead',
    quote: 'The auto-batch feature means I never worry about WhatsApp bans anymore. Finally a tool that just works.',
    stars: 5,
  },
  {
    name: 'Sneha T.',
    role: 'Freelance Consultant',
    quote: 'Love that my data stays on my machine. No SaaS fees, no vendor lock-in. This is how tools should work.',
    stars: 5,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-x-hidden font-sans">

      {/* ======= NAVBAR ======= */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/60 shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center p-1.5 shrink-0 shadow-lg shadow-emerald-500/30">
              <LeadFlowLogo className="w-full h-full text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight block leading-tight">LeadFlow</span>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Outreach CRM</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Why LeadFlow</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Reviews</a>
          </nav>

          <button
            onClick={onEnter}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-md transition-all duration-200 active:scale-[0.97] shadow-lg shadow-emerald-500/25"
          >
            Launch App
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ======= HERO ======= */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
        {/* Background orbs */}
        <div className="lp-orb w-[600px] h-[600px] bg-emerald-500/10 -top-40 -left-40" />
        <div className="lp-orb w-[500px] h-[500px] bg-teal-500/8 top-1/2 -right-60" />
        <div className="lp-orb w-[300px] h-[300px] bg-cyan-500/6 bottom-20 left-1/4" />

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />

        {/* Noise overlay */}
        <div className="absolute inset-0 noise-overlay pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="animate-fade-up inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-700/60 rounded-full px-3.5 py-1.5 mb-8 text-xs text-zinc-400 backdrop-blur-sm"
            style={{ animationDelay: '100ms' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            100% local-first - your data never leaves your device
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
            style={{ animationDelay: '200ms' }}
          >
            Your WhatsApp outreach,
            <br />
            <span className="gradient-text">on autopilot</span>
          </h1>

          {/* Sub */}
          <p
            className="animate-fade-up text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ animationDelay: '350ms' }}
          >
            Import leads from Excel, score them automatically, and send personalized WhatsApp messages in bulk -
            all from a single, beautifully designed CRM that lives in your browser.
          </p>

          {/* CTA group */}
          <div
            className="animate-fade-up flex flex-col sm:flex-row gap-3 justify-center items-center"
            style={{ animationDelay: '500ms' }}
          >
            <button
              onClick={onEnter}
              className="btn-glow group flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-7 py-3.5 rounded-lg text-base transition-all duration-200 active:scale-[0.97] shadow-2xl shadow-emerald-500/30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Start for Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onEnter}
              className="flex items-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium px-6 py-3.5 rounded-lg text-base transition-all duration-200 active:scale-[0.97] cursor-pointer"
            >
              View Demo Data
            </button>
          </div>

          {/* Trust badges */}
          <div
            className="animate-fade-up mt-10 flex flex-wrap justify-center gap-5 text-xs text-zinc-500"
            style={{ animationDelay: '650ms' }}
          >
            {['No sign-up required', 'No cloud storage', 'No monthly fees', 'Works offline'].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2} />
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Hero app mockup - decorative */}
        <div
          className="animate-fade-up relative z-10 mt-16 w-full max-w-4xl mx-auto"
          style={{ animationDelay: '800ms' }}
        >
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl shadow-black/50 backdrop-blur-sm">
            {/* Fake window chrome */}
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800/60 bg-zinc-950/50">
              <div className="w-3 h-3 rounded-full bg-rose-500/70" />
              <div className="w-3 h-3 rounded-full bg-amber-500/70" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
              <div className="flex-1 mx-4">
                <div className="h-5 bg-zinc-800/80 rounded-md w-48 mx-auto flex items-center justify-center">
                  <span className="text-[9px] text-zinc-500 font-mono">leadflow.local</span>
                </div>
              </div>
            </div>

            {/* Fake dashboard preview */}
            <div className="p-4 grid grid-cols-4 gap-3">
              {[
                { label: 'Total Leads', val: '248', icon: Users, color: 'text-emerald-400' },
                { label: 'Outreach Queue', val: '42', icon: Send, color: 'text-teal-400' },
                { label: 'Follow-ups', val: '7', icon: Clock, color: 'text-amber-400' },
                { label: 'Won Deals', val: '18', icon: Target, color: 'text-cyan-400' },
              ].map(({ label, val, icon: Icon, color }) => (
                <div key={label} className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/40">
                  <Icon className={`w-4 h-4 ${color} mb-1.5`} strokeWidth={1.5} />
                  <div className="text-xl font-bold text-white font-mono">{val}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="px-4 pb-4 grid grid-cols-3 gap-2">
              {/* Fake lead rows */}
              {[
                { name: 'Kapoor Interior Studio', score: 94, status: 'New' },
                { name: 'Design Lab Bangalore', score: 88, status: 'Contacted' },
                { name: 'Modern Home Solutions', score: 81, status: 'New' },
                { name: 'Elite Interiors Pvt.', score: 77, status: 'Replied' },
                { name: 'Prestige Design Co.', score: 72, status: 'New' },
                { name: 'Urban Space Creators', score: 65, status: 'New' },
              ].map((lead) => (
                <div key={lead.name} className="bg-zinc-800/40 rounded-md p-2.5 border border-zinc-700/30 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <span className="text-[9px] text-emerald-400 font-bold">{lead.score}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-300 font-medium truncate">{lead.name}</p>
                    <p className="text-[9px] text-zinc-500">{lead.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient fade bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#09090b] to-transparent pointer-events-none" />
        </div>
      </section>

      {/* ======= STATS SECTION ======= */}
      <section id="stats" className="py-24 border-y border-zinc-800/60 bg-zinc-950/40">
        <div className="max-w-5xl mx-auto px-6">
          <RevealOnScroll className="text-center mb-14">
            <p className="text-xs font-mono uppercase tracking-widest text-emerald-500 mb-3">By the numbers</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Built for real outreach volume</h2>
          </RevealOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <RevealOnScroll key={s.label} delay={i * 80} className="text-center">
                <div className="text-5xl font-bold font-mono mb-1 stat-shimmer">
                  {s.suffix === '$' ? (
                    <>
                      <AnimatedCounter target={s.value} />
                      {s.suffix}
                    </>
                  ) : (
                    <>
                      <AnimatedCounter target={s.value} />
                      {s.suffix}
                    </>
                  )}
                </div>
                <div className="text-sm font-semibold text-white mb-0.5">{s.label}</div>
                <div className="text-xs text-zinc-500">{s.desc}</div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ======= FEATURES SECTION ======= */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll className="text-center mb-14">
            <p className="text-xs font-mono uppercase tracking-widest text-emerald-500 mb-3">Everything you need</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              A CRM that actually speeds you up
            </h2>
            <p className="text-zinc-400 text-base max-w-xl mx-auto">
              LeadFlow combines intelligent scoring, safe auto-batching, and clean analytics into one distraction-free workspace.
            </p>
          </RevealOnScroll>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <RevealOnScroll key={f.title} delay={i * 60}>
                  <div className="feature-card bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 h-full">
                    <div className={`w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4`}>
                      <Icon className="w-4.5 h-4.5 text-emerald-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======= HOW IT WORKS ======= */}
      <section className="py-24 px-6 bg-zinc-950/40 border-y border-zinc-800/60">
        <div className="max-w-4xl mx-auto">
          <RevealOnScroll className="text-center mb-14">
            <p className="text-xs font-mono uppercase tracking-widest text-emerald-500 mb-3">Simple workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">From Excel to WhatsApp in minutes</h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: TrendingUp,
                title: 'Import your leads',
                desc: 'Drop your Excel file. LeadFlow parses names, phones, ratings, and reviews automatically.',
              },
              {
                step: '02',
                icon: Target,
                title: 'Review the queue',
                desc: 'Leads are ranked by lead score. Click any row to inspect details before reaching out.',
              },
              {
                step: '03',
                icon: Send,
                title: 'Send in batches',
                desc: 'Auto-batch sends WhatsApp messages with safe delays to keep your account healthy.',
              },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <RevealOnScroll key={s.step} delay={i * 100}>
                  <div className="relative">
                    <div className="text-6xl font-bold font-mono text-zinc-800 mb-4 leading-none">{s.step}</div>
                    <div className="w-8 h-8 rounded-md bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-2">{s.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======= TESTIMONIALS ======= */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <RevealOnScroll className="text-center mb-14">
            <p className="text-xs font-mono uppercase tracking-widest text-emerald-500 mb-3">What people say</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Loved by outreach teams</h2>
          </RevealOnScroll>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <RevealOnScroll key={t.name} delay={i * 80}>
                <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 h-full flex flex-col">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed flex-1 mb-4">"{t.quote}"</p>
                  <div>
                    <div className="text-xs font-semibold text-white">{t.name}</div>
                    <div className="text-[11px] text-zinc-500">{t.role}</div>
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ======= FINAL CTA ======= */}
      <section className="py-24 px-6">
        <RevealOnScroll className="max-w-2xl mx-auto text-center">
          <div className="relative bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-12 overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            <div className="lp-orb w-64 h-64 bg-emerald-500/8 -bottom-20 -right-20 blur-3xl" />

            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <Zap className="w-6 h-6 text-emerald-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Ready to supercharge your outreach?</h2>
              <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                No sign-up, no credit card, no cloud. Just drag in your leads and start sending.
              </p>
              <button
                onClick={onEnter}
                className="group inline-flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-8 py-4 rounded-lg text-base transition-all duration-200 active:scale-[0.97] shadow-2xl shadow-emerald-500/30"
              >
                <Send className="w-4 h-4" />
                Launch LeadFlow - Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      {/* ======= FOOTER ======= */}
      <footer className="border-t border-zinc-800/60 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
              <LeadFlowLogo className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs text-zinc-500 font-mono">LeadFlow CRM - 100% local, always free</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-600">
            <span>Built with</span>
            <span className="text-emerald-500">React + TypeScript</span>
            <span>- runs entirely in your browser</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
