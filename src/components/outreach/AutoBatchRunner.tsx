import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Clock,
  CheckCircle,
  Sliders,
  Flame,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Coffee,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Lead } from '../../types/lead';
import { openWhatsAppChat } from '../../lib/whatsapp';
import { Button } from '../ui/Button';
import { TierBadge } from '../leads/TierBadge';
import { formatPhoneNumber } from '../../lib/utils';

interface AutoBatchRunnerProps {
  queue: Lead[];
  onMarkContacted: (leadId: string) => void;
  onSelectLead: (lead: Lead) => void;
  activeLeadId?: string | null;
  onActiveLeadChange: (leadId: string | null) => void;
}

type RunnerStatus = 'idle' | 'running' | 'paused' | 'cooldown' | 'completed';

export const AutoBatchRunner: React.FC<AutoBatchRunnerProps> = ({
  queue,
  onMarkContacted,
  onSelectLead,
  onActiveLeadChange,
}) => {
  const [status, setStatus] = useState<RunnerStatus>('idle');
  
  // Safe default: 45 seconds human-paced delay
  const [delaySeconds, setDelaySeconds] = useState<number>(45);
  const [batchLimit, setBatchLimit] = useState<number>(10);
  const [cooldownMinutes, setCooldownMinutes] = useState<number>(15);
  const [autoMark, setAutoMark] = useState<boolean>(true);
  const [randomizeVariance, setRandomizeVariance] = useState<boolean>(true);

  const [totalInBatch, setTotalInBatch] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [sessionSentCount, setSessionSentCount] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [cooldownCountdown, setCooldownCountdown] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Settings & Advisory drawer expansion
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showAdvisory, setShowAdvisory] = useState<boolean>(false);

  // Refs for tracking timers and state across asynchronous callbacks
  const countdownTimerRef = useRef<any>(null);
  const cooldownTimerRef = useRef<any>(null);
  const elapsedTimerRef = useRef<any>(null);
  const queueRef = useRef<Lead[]>(queue);
  queueRef.current = queue;

  const sessionSentCountRef = useRef<number>(sessionSentCount);
  sessionSentCountRef.current = sessionSentCount;

  const batchLimitRef = useRef<number>(batchLimit);
  batchLimitRef.current = batchLimit;

  const cooldownMinutesRef = useRef<number>(cooldownMinutes);
  cooldownMinutesRef.current = cooldownMinutes;

  const delaySecondsRef = useRef<number>(delaySeconds);
  delaySecondsRef.current = delaySeconds;

  const randomizeVarianceRef = useRef<boolean>(randomizeVariance);
  randomizeVarianceRef.current = randomizeVariance;

  const autoMarkRef = useRef<boolean>(autoMark);
  autoMarkRef.current = autoMark;

  // Active lead being processed
  const currentLead = useMemo(() => {
    if (status === 'idle' || status === 'completed' || status === 'cooldown') return null;
    return queue[0] || null;
  }, [queue, status]);

  // Sync activeLeadId to parent
  useEffect(() => {
    if (currentLead) {
      onActiveLeadChange(currentLead.id);
    } else if (status === 'completed' || status === 'idle' || status === 'cooldown') {
      onActiveLeadChange(null);
    }
  }, [currentLead?.id, status, onActiveLeadChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, []);

  // Elapsed time tracker
  useEffect(() => {
    if (status === 'running' || status === 'cooldown') {
      elapsedTimerRef.current = setInterval(() => {
        if (startTime) {
          setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }
      }, 1000);
    } else {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [status, startTime]);

  // Core trigger for opening WhatsApp for current lead
  const triggerLeadWhatsApp = (lead: Lead) => {
    const msg = lead.customMessage || lead.personalizedMessage || '';
    openWhatsAppChat(lead.phone || lead.rawPhone || '', msg);
    onSelectLead(lead);
  };

  // Trigger Cooldown Break
  const startCooldownBreak = () => {
    setStatus('cooldown');
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    
    const initialCooldownSecs = cooldownMinutesRef.current * 60;
    setCooldownCountdown(initialCooldownSecs);

    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);

    cooldownTimerRef.current = setInterval(() => {
      setCooldownCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current);
          // Reset burst count and resume batch
          setSessionSentCount(0);
          sessionSentCountRef.current = 0;
          setStatus('running');
          setTimeout(() => {
            processNextLead();
          }, 200);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step to process next lead
  const processNextLead = () => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) {
      // All leads contacted
      setStatus('completed');
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    const nextLead = currentQueue[0];
    triggerLeadWhatsApp(nextLead);

    // Calculate actual delay with natural randomized human variance (±5s to ±8s)
    let actualDelay = delaySecondsRef.current;
    if (randomizeVarianceRef.current) {
      const maxJitter = Math.min(8, Math.floor(delaySecondsRef.current * 0.15));
      const jitter = Math.floor(Math.random() * (maxJitter * 2 + 1)) - maxJitter;
      actualDelay = Math.max(20, delaySecondsRef.current + jitter);
    }

    setCountdown(actualDelay);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);

          // Mark current lead contacted
          if (autoMarkRef.current && nextLead) {
            onMarkContacted(nextLead.id);
            setCompletedCount((c) => c + 1);
            setSessionSentCount((s) => s + 1);
            sessionSentCountRef.current += 1;
          }

          // Check if batch safety cap reached and more leads remain
          const limit = batchLimitRef.current;
          if (limit > 0 && sessionSentCountRef.current >= limit && queueRef.current.length > 1) {
            startCooldownBreak();
            return 0;
          }

          // Trigger next in sequence
          setTimeout(() => {
            processNextLead();
          }, 200);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Start Auto-Batch
  const handleStart = () => {
    if (queue.length === 0) return;

    setStatus('running');
    setTotalInBatch(queue.length);
    setCompletedCount(0);
    setSessionSentCount(0);
    sessionSentCountRef.current = 0;
    setStartTime(Date.now());
    setElapsedTime(0);

    // Start with the first lead
    processNextLead();
  };

  // Pause Runner
  const handlePause = () => {
    setStatus('paused');
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
  };

  // Resume Runner
  const handleResume = () => {
    setStatus('running');
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);

          if (currentLead && autoMarkRef.current) {
            onMarkContacted(currentLead.id);
            setCompletedCount((c) => c + 1);
            setSessionSentCount((s) => s + 1);
            sessionSentCountRef.current += 1;
          }

          const limit = batchLimitRef.current;
          if (limit > 0 && sessionSentCountRef.current >= limit && queueRef.current.length > 1) {
            startCooldownBreak();
            return 0;
          }

          setTimeout(() => {
            processNextLead();
          }, 200);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Skip Cooldown early and resume next batch immediately
  const handleSkipCooldown = () => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    setSessionSentCount(0);
    sessionSentCountRef.current = 0;
    setStatus('running');
    setTimeout(() => {
      processNextLead();
    }, 150);
  };

  // Skip Current Lead
  const handleSkip = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (queue.length > 1) {
      processNextLead();
    } else {
      setStatus('completed');
    }
  };

  // Send Now (Skip remaining countdown)
  const handleSendNow = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (currentLead && autoMarkRef.current) {
      onMarkContacted(currentLead.id);
      setCompletedCount((c) => c + 1);
      setSessionSentCount((s) => s + 1);
      sessionSentCountRef.current += 1;
    }

    const limit = batchLimitRef.current;
    if (limit > 0 && sessionSentCountRef.current >= limit && queueRef.current.length > 1) {
      startCooldownBreak();
      return;
    }

    setTimeout(() => {
      processNextLead();
    }, 100);
  };

  // Stop Runner
  const handleStop = () => {
    setStatus('idle');
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    setCountdown(0);
    setCooldownCountdown(0);
  };

  // Reset Completed state
  const handleReset = () => {
    setStatus('idle');
    setCompletedCount(0);
    setSessionSentCount(0);
    setTotalInBatch(0);
    setElapsedTime(0);
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Estimated time remaining
  const estimatedRemaining = useMemo(() => {
    if (status !== 'running' && status !== 'paused') return 0;
    const remainingLeads = queue.length;
    return remainingLeads * delaySeconds;
  }, [queue.length, delaySeconds, status]);

  // Safety Risk Category based on selected delay
  const safetyRisk = useMemo(() => {
    if (delaySeconds < 30) {
      return {
        level: 'high',
        label: 'High Ban Risk',
        description: 'Delays under 30s trigger WhatsApp automated velocity filters.',
        color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
        icon: <ShieldAlert className="w-3.5 h-3.5 text-rose-500" strokeWidth={1.5} />,
      };
    }
    if (delaySeconds < 45) {
      return {
        level: 'moderate',
        label: 'Moderate Risk',
        description: 'Acceptable only for established numbers with high reply history.',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" strokeWidth={1.5} />,
      };
    }
    return {
      level: 'safe',
      label: 'Recommended Safe',
      description: 'Paced cadence (45s–90s) mirrors authentic human communication.',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />,
    };
  }, [delaySeconds]);

  // Screen 1: Safety Cooldown Active
  if (status === 'cooldown') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 text-zinc-100 space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Coffee className="w-5 h-5 text-amber-400" strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white">
                  Safety Cooldown in Progress
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Anti-Ban Guard
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                Batch limit reached ({batchLimit} leads sent). Meta anti-spam filters flag burst outreach to unsaved contacts. Taking a pause keeps your phone number safe.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <div className="px-3.5 py-1.5 rounded-md bg-zinc-950 border border-zinc-800 font-mono text-sm font-bold text-amber-400 tabular-nums flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
              <span>Resuming in {formatTime(cooldownCountdown)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
          <span className="text-zinc-500 font-mono">
            Progress: {completedCount} completed • {queue.length} remaining in queue
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipCooldown}
              className="text-xs border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              title="Skip remaining cooldown break and start the next batch immediately"
            >
              Skip Break & Resume
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              icon={<Square className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />}
              className="text-xs border-zinc-700 bg-zinc-800 text-rose-300 hover:bg-zinc-700"
            >
              Stop Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Screen 2: Completion Screen
  if (status === 'completed') {
    return (
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 text-zinc-900 dark:text-zinc-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-10 h-10 rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Batch Outreach Complete
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Successfully processed {completedCount} leads in {formatTime(elapsedTime)}. All prospects are tracked in CRM.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleReset}
            className="text-xs font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  // Screen 3: Active Running / Paused Runner Card
  if (status === 'running' || status === 'paused') {
    const progressPercent = totalInBatch > 0 ? Math.min(100, Math.round((completedCount / totalInBatch) * 100)) : 0;
    const currentBatchNum = Math.floor(completedCount / Math.max(1, batchLimit)) + 1;
    const leadsInCurrentBurst = batchLimit > 0 ? `${(completedCount % batchLimit) + 1} of ${batchLimit}` : `${completedCount + 1}`;

    return (
      <div className="bg-zinc-900 text-white rounded-lg p-5 border border-zinc-800 space-y-4 relative overflow-hidden font-sans">
        {/* Top Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`inline-flex rounded-full h-2.5 w-2.5 ${status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold tracking-tight">
                  {status === 'running' ? 'Auto-Batch Active' : 'Batch Paused'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 tabular-nums">
                  Lead {completedCount + 1} / {totalInBatch} ({progressPercent}%)
                </span>
                {batchLimit > 0 && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-amber-300 border border-zinc-700 tabular-nums">
                    Batch {currentBatchNum} ({leadsInCurrentBurst})
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {status === 'running'
                  ? `Advancing queue: approximately ${formatTime(estimatedRemaining)} remaining`
                  : 'Outreach paused. Click Resume to continue.'}
              </p>
            </div>
          </div>

          {/* Action Button Controls */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {status === 'running' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePause}
                icon={<Pause className="w-3.5 h-3.5" strokeWidth={1.5} />}
                className="text-xs border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleResume}
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
                className="text-xs"
              >
                Resume
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSendNow}
              className="text-xs border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              title="Skip remaining timer and advance to next lead immediately"
            >
              Next Now
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              icon={<SkipForward className="w-3.5 h-3.5" strokeWidth={1.5} />}
              className="text-xs border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              title="Skip this lead without marking contacted"
            >
              Skip
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              icon={<Square className="w-3.5 h-3.5 text-rose-400" strokeWidth={1.5} />}
              className="text-xs border-zinc-700 bg-zinc-800 text-rose-300 hover:bg-zinc-700"
            >
              Stop
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 relative z-10">
          <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current Target Card in Runner */}
        {currentLead && (
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-md p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                  Target:
                </span>
                <span className="text-xs font-bold text-zinc-100 truncate max-w-[280px]">
                  {currentLead.businessName}
                </span>
                <TierBadge tier={currentLead.leadTier} score={currentLead.leadScore} />
              </div>
              <div className="text-[11px] text-zinc-400 flex items-center gap-2 font-mono">
                <span>{formatPhoneNumber(currentLead.phone)}</span>
                {currentLead.city && <span>/ {currentLead.city}</span>}
                {currentLead.rating && <span>/ {currentLead.rating} Star</span>}
              </div>
            </div>

            {/* Countdown Badge with Safety Warning */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="px-3 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs font-medium flex items-center gap-1.5 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
                <span>Next in {countdown}s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Screen 4: Idle State with Safety Controls & Advisory
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-3 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left info & Risk Status */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Auto-Batch Outreach Runner
              </h3>
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold font-mono px-2 py-0.5 rounded-sm border ${safetyRisk.color}`}>
                {safetyRisk.icon}
                <span>{safetyRisk.label}</span>
              </span>
              {batchLimit > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                  Cap: {batchLimit} / batch
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Human-paced queue sequence ({delaySeconds}s delay) with automated safety cooldowns to prevent WhatsApp account restrictions.
            </p>
          </div>
        </div>

        {/* Right CTA and Settings / Advisory Toggles */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvisory(!showAdvisory)}
            icon={<Info className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />}
            className="text-xs"
            title="Read WhatsApp account protection guidelines"
          >
            Safety Tips
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            icon={<Sliders className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />}
            className="text-xs"
            title="Configure interval delay, safety cap, and break intervals"
          >
            {delaySeconds}s Delay {showSettings ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleStart}
            disabled={queue.length === 0}
            icon={<Play className="w-3.5 h-3.5 fill-current" />}
            className="text-xs font-semibold px-3.5"
          >
            Start Auto-Batch ({queue.length})
          </Button>
        </div>
      </div>

      {/* Expandable Safety Advisory Card */}
      {showAdvisory && (
        <div className="p-3.5 rounded-md bg-zinc-50 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
              <span>WhatsApp Anti-Ban Best Practices</span>
            </span>
            <button
              type="button"
              onClick={() => setShowAdvisory(false)}
              className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] leading-relaxed">
            <div className="p-2.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">1. Avoid Machine Velocity</span>
              <p className="text-zinc-500 dark:text-zinc-400">
                Sending faster than 30s to unsaved numbers is easily flagged by automated filters. Keep delays at 45s–90s with natural jitter.
              </p>
            </div>

            <div className="p-2.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">2. Small Batch Caps</span>
              <p className="text-zinc-500 dark:text-zinc-400">
                Never blast 50+ prospects in one session. Send 10 leads, take a 15-minute break, and limit daily cold volume to 25–40 total.
              </p>
            </div>

            <div className="p-2.5 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-900 dark:text-zinc-100 block">3. Prevent "Report Spam"</span>
              <p className="text-zinc-500 dark:text-zinc-400">
                If 2 users hit "Report Spam", your number is restricted. Open with conversational questions rather than direct sales pitches.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Safety Settings Bar */}
      {showSettings && (
        <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3 text-xs">
          {/* Row 1: Delay Presets & Risk Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Delay Interval:
              </span>
              {[
                { val: 30, label: '30s (Rapid - High Risk)' },
                { val: 45, label: '45s (Human Paced)' },
                { val: 60, label: '60s (Recommended Safe)' },
                { val: 90, label: '90s (Ultra-Safe)' },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setDelaySeconds(preset.val)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                    delaySeconds === preset.val
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              {safetyRisk.description}
            </span>
          </div>

          {/* Row 2: Batch Limit Cap & Break Duration */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                Batch Safety Cap:
              </span>
              {[
                { val: 5, label: '5 leads' },
                { val: 10, label: '10 leads (Recommended)' },
                { val: 15, label: '15 leads' },
                { val: 0, label: 'No Limit (High Risk)' },
              ].map((bPreset) => (
                <button
                  key={bPreset.val}
                  type="button"
                  onClick={() => setBatchLimit(bPreset.val)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                    batchLimit === bPreset.val
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {bPreset.label}
                </button>
              ))}
            </div>

            {batchLimit > 0 && (
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Cooldown Break:</span>
                {[5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setCooldownMinutes(mins)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                      cooldownMinutes === mins
                        ? 'bg-zinc-800 text-white border-zinc-700'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: Toggle Switches */}
          <div className="flex items-center gap-5 text-zinc-600 dark:text-zinc-300 pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoMark}
                onChange={(e) => setAutoMark(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-zinc-900 focus:ring-zinc-500"
              />
              <span className="text-[11px] font-medium">Auto-mark Contacted</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer" title="Adds natural ±5s variation to interval to avoid metronome detection">
              <input
                type="checkbox"
                checked={randomizeVariance}
                onChange={(e) => setRandomizeVariance(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-zinc-900 focus:ring-zinc-500"
              />
              <span className="text-[11px] font-medium">Natural Human Jitter (+-5s)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
