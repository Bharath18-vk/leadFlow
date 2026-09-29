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
      // All leads contacted
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

  // Completion Screen (Item 7: No emojis, Item 19: No soft 2xl corners)
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
            className="text-xs"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  // Active Running / Paused Runner Card (Item 22: No radial orbs, Item 1: No harsh gradient)
  if (status === 'running' || status === 'paused') {
    const progressPercent = totalInBatch > 0 ? Math.min(100, Math.round((completedCount / totalInBatch) * 100)) : 0;

    return (
      <div className="bg-zinc-900 text-white rounded-lg p-5 border border-zinc-800 space-y-4 relative overflow-hidden font-sans">
        {/* Top Status Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`inline-flex rounded-full h-2.5 w-2.5 ${status === 'running' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-tight">
                  {status === 'running' ? 'Auto-Batch Active' : 'Batch Paused'}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 tabular-nums">
                  {completedCount} / {totalInBatch} ({progressPercent}%)
                </span>
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
                icon={<Pause className="w-3.5 h-3.5" />}
                className="text-xs border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
              >
                Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleResume}
                icon={<Play className="w-3.5 h-3.5" />}
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
              title="Skip remaining timer and advance to next lead"
            >
              Next Now
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              icon={<SkipForward className="w-3.5 h-3.5" />}
              className="text-xs border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200"
              title="Skip this lead without marking contacted"
            >
              Skip
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleStop}
              icon={<Square className="w-3.5 h-3.5 text-rose-400" />}
              className="text-xs border-zinc-700 bg-zinc-800 text-rose-300 hover:bg-zinc-700"
            >
              Stop
            </Button>
          </div>
        </div>

        {/* High-Precision Progress Bar (Item 1: No harsh rainbow gradient) */}
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

            {/* Countdown Badge */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <div className="px-3 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs font-medium flex items-center gap-1.5 tabular-nums">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Next in {countdown}s</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Idle State: Clean Architectural Banner
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-3 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Auto-Batch Outreach Runner
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                Paced Mode
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Sequences through all {queue.length} queue leads with human-paced intervals ({delaySeconds}s delay).
            </p>
          </div>
        </div>

        {/* Right CTA and Settings Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            icon={<Sliders className="w-3.5 h-3.5 text-zinc-500" strokeWidth={1.5} />}
            className="text-xs"
            title="Configure interval delay and safety options"
          >
            {delaySeconds}s Delay
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

      {/* Expandable Settings Bar */}
      {showSettings && (
        <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Preset Chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Delay Interval:
            </span>
            {[
              { val: 4, label: '4s Fast' },
              { val: 6, label: '6s Standard' },
              { val: 9, label: '9s Safe' },
              { val: 12, label: '12s Relaxed' },
            ].map((preset) => (
              <button
                key={preset.val}
                type="button"
                onClick={() => setDelaySeconds(preset.val)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                  delaySeconds === preset.val
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-zinc-100'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Toggle Switches */}
          <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoMark}
                onChange={(e) => setAutoMark(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-zinc-900 focus:ring-zinc-500"
              />
              <span className="text-[11px] font-medium">Auto-mark Contacted</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer" title="Adds ±1s natural variation to each lead interval">
              <input
                type="checkbox"
                checked={randomizeVariance}
                onChange={(e) => setRandomizeVariance(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-zinc-900 focus:ring-zinc-500"
              />
              <span className="text-[11px] font-medium">Natural Jitter (+-1s)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
