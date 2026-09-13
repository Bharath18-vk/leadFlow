import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  Clock,
  CheckCircle2,
  Zap,
  Sliders,
  Trophy,
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

type RunnerStatus = 'idle' | 'running' | 'paused' | 'completed';

export const AutoBatchRunner: React.FC<AutoBatchRunnerProps> = ({
  queue,
  onMarkContacted,
  onSelectLead,
  onActiveLeadChange,
}) => {
  const [status, setStatus] = useState<RunnerStatus>('idle');
  const [delaySeconds, setDelaySeconds] = useState<number>(6);
  const [autoMark, setAutoMark] = useState<boolean>(true);
  const [randomizeVariance, setRandomizeVariance] = useState<boolean>(true);

  const [totalInBatch, setTotalInBatch] = useState<number>(0);

  const [completedCount, setCompletedCount] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Settings drawer expansion
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Refs for tracking timers across re-renders
  const countdownTimerRef = useRef<any>(null);
  const elapsedTimerRef = useRef<any>(null);
  const queueRef = useRef<Lead[]>(queue);
  queueRef.current = queue;

  // Active lead being processed
  const currentLead = useMemo(() => {
    if (status === 'idle' || status === 'completed') return null;
    return queue[0] || null;
  }, [queue, status]);

  // Sync activeLeadId to parent
  useEffect(() => {
    if (currentLead) {
      onActiveLeadChange(currentLead.id);
    } else if (status === 'completed' || status === 'idle') {
      onActiveLeadChange(null);
    }
  }, [currentLead?.id, status, onActiveLeadChange]);

  // Elapsed time tracker
  useEffect(() => {
    if (status === 'running') {
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

  // Step to process next lead
  const processNextLead = () => {
    const currentQueue = queueRef.current;
    if (currentQueue.length === 0) {
      // All leads contacted!
      setStatus('completed');
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    const nextLead = currentQueue[0];
    triggerLeadWhatsApp(nextLead);

    // Calculate actual delay with optional small randomized human variance (±1s)
    let actualDelay = delaySeconds;
    if (randomizeVariance) {
      const variance = Math.random() > 0.5 ? 1 : -1;
      actualDelay = Math.max(3, delaySeconds + (Math.random() > 0.3 ? variance : 0));
    }

    setCountdown(actualDelay);

    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);

          // Mark current lead contacted
          if (autoMark && nextLead) {
            onMarkContacted(nextLead.id);
            setCompletedCount((c) => c + 1);
          }

          // Trigger next in sequence
          setTimeout(() => {
            processNextLead();
          }, 150);

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

          if (currentLead && autoMark) {
            onMarkContacted(currentLead.id);
            setCompletedCount((c) => c + 1);
          }

          setTimeout(() => {
            processNextLead();
          }, 150);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Skip Current Lead
  const handleSkip = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    // Move to next without marking contacted
    if (queue.length > 1) {
      processNextLead();
    } else {
      setStatus('completed');
    }
  };

  // Send Now (Skip remaining countdown)
  const handleSendNow = () => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (currentLead && autoMark) {
      onMarkContacted(currentLead.id);
      setCompletedCount((c) => c + 1);
    }
    setTimeout(() => {
      processNextLead();
    }, 100);
  };

  // Stop Runner
  const handleStop = () => {
    setStatus('idle');
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    setCountdown(0);
  };

  // Reset Completed state
  const handleReset = () => {
    setStatus('idle');
    setCompletedCount(0);
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

  // Completion Screen
  if (status === 'completed') {
    return (
      <div className="bg-emerald-500/10 dark:bg-emerald-950/40 border-2 border-emerald-500/30 dark:border-emerald-500/30 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-300">
                Batch Outreach Complete! 🎉
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Successfully processed {completedCount} leads in {formatTime(elapsedTime)}. All prospects are contacted and tracked in CRM.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleReset}
            icon={<CheckCircle2 className="w-4 h-4" />}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  // Active Running / Paused Runner Card
  if (status === 'running' || status === 'paused') {
    const progressPercent = totalInBatch > 0 ? Math.min(100, Math.round((completedCount / totalInBatch) * 100)) : 0;

    return (
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4 relative overflow-hidden animate-in slide-in-from-top-3 duration-200">
        {/* Glowing background accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              {status === 'running' ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight">
                  {status === 'running' ? 'Auto-Batch Running' : 'Batch Paused'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {completedCount} / {totalInBatch} Leads ({progressPercent}%)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {status === 'running'
                  ? `Opening WhatsApp automatically • ~${formatTime(estimatedRemaining)} remaining`
                  : 'Outreach paused. Click Resume to continue countdown.'}
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
                icon={<Pause className="w-3.5 h-3.5 text-amber-400" />}
                className="text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleResume}
                icon={<Play className="w-3.5 h-3.5 text-white" />}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Resume
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSendNow}
              icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
              className="text-xs border-slate-700 hover:bg-slate-800 text-slate-200"
              title="Skip remaining timer and immediately advance to next lead"
            >
              Next Now
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              icon={<SkipForward className="w-3.5 h-3.5" />}
              className="text-xs border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Skip this lead without marking contacted"
            >
              Skip
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              icon={<Square className="w-3.5 h-3.5 text-rose-400" />}
              className="text-xs border-slate-700 hover:bg-slate-800 text-rose-300"
            >
              Stop
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1 relative z-10">
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current Active Lead Card in Runner */}
        {currentLead && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                  Current Target:
                </span>
                <span className="text-sm font-bold text-white truncate max-w-[280px]">
                  {currentLead.businessName}
                </span>
                <TierBadge tier={currentLead.leadTier} score={currentLead.leadScore} />
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                <span>{formatPhoneNumber(currentLead.phone)}</span>
                {currentLead.city && <span>• {currentLead.city}</span>}
                {currentLead.rating && <span>• {currentLead.rating}★</span>}
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="px-3.5 py-1.5 rounded-xl bg-blue-950/70 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin text-blue-400" />
                <span>Next lead in {countdown}s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Idle State: Start Banner & Configuration
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Auto-Batch Outreach Runner
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                1-Click Hands-Free Mode
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Hands-free automation that steps through all {queue.length} queue leads with safe human-paced delays ({delaySeconds}s interval).
            </p>
          </div>
        </div>

        {/* Right CTA and Settings Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            icon={<Sliders className="w-3.5 h-3.5 text-slate-500" />}
            className="text-xs text-slate-600 dark:text-slate-300"
            title="Configure interval delay and safety options"
          >
            {delaySeconds}s Delay
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleStart}
            disabled={queue.length === 0}
            icon={<Zap className="w-4 h-4 fill-current" />}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs px-4"
          >
            Start Auto-Batch ({queue.length})
          </Button>
        </div>
      </div>

      {/* Expandable Settings Bar */}
      {showSettings && (
        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Preset Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Delay Interval:
            </span>
            {[
              { val: 4, label: '4s (Fast)' },
              { val: 6, label: '6s (Recommended Safe)' },
              { val: 9, label: '9s (Extra Safe)' },
              { val: 12, label: '12s (Slow & Steady)' },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => setDelaySeconds(preset.val)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  delaySeconds === preset.val
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoMark}
                onChange={(e) => setAutoMark(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] font-medium">Auto-mark Contacted</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer" title="Adds ±1s natural variation to each lead interval">
              <input
                type="checkbox"
                checked={randomizeVariance}
                onChange={(e) => setRandomizeVariance(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-[11px] font-medium">Human-like Jitter (±1s)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
