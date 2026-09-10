import { useState, useRef, useCallback, useEffect } from 'react';

export interface RestTimerState {
  /** Whether the rest countdown is currently active */
  isResting: boolean;
  /** Seconds remaining in the current rest period */
  remaining: number;
  /** Total duration of the current rest period in seconds */
  total: number;
  /** Progress from 0 (just started) to 1 (complete) */
  progress: number;
  /** Start a rest period. `durationSecs` is the total rest time. */
  start: (durationSecs: number, onComplete?: () => void) => void;
  /** Skip the rest period immediately and fire the onComplete callback */
  skip: () => void;
  /** Reset without firing onComplete */
  reset: () => void;
}

/**
 * Global rest-timer hook.
 *
 * Instantiated once in useAppState so the countdown survives navigation
 * between tabs. Components read `remaining`, `progress`, and `isResting`
 * to sync their UI; they never own the interval themselves.
 */
export function useRestTimer(): RestTimerState {
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(0);
  const [isResting, setIsResting] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const playChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      /**
       * Two-note rising chime: A5 → D6.
       * Each note uses a sine oscillator with exponential decay envelope.
       */
      const scheduleNote = (freq: number, startTime: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const t = ctx.currentTime;
      scheduleNote(880, t, 0.3);           // A5
      scheduleNote(1174.66, t + 0.18, 0.45); // D6 — rising interval

      // Release AudioContext after notes finish
      setTimeout(() => { try { ctx.close(); } catch { /* ignore */ } }, 1000);
    } catch {
      // Web Audio unavailable — silent fail
    }
  }, []);

  const start = useCallback((durationSecs: number, onComplete?: () => void) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    onCompleteRef.current = onComplete ?? null;
    setTotal(durationSecs);
    setRemaining(durationSecs);
    setIsResting(true);
  }, []);

  const skip = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsResting(false);
    setRemaining(0);
    setTotal(0);
    const cb = onCompleteRef.current;
    onCompleteRef.current = null;
    cb?.();
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsResting(false);
    setRemaining(0);
    setTotal(0);
    onCompleteRef.current = null;
  }, []);

  // Drive the countdown — runs whenever isResting flips to true
  useEffect(() => {
    if (!isResting) return;

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsResting(false);
          setTotal(0);
          // Fire chime + callback after React flushes state
          setTimeout(() => {
            playChime();
            const cb = onCompleteRef.current;
            onCompleteRef.current = null;
            cb?.();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResting]);

  const progress = total > 0 ? 1 - remaining / total : 0;

  return { isResting, remaining, total, progress, start, skip, reset };
}
