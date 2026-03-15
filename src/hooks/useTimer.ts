"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TimeDisplay, TimerState } from "@/types";

interface UseTimerReturn {
  time: TimeDisplay;
  state: TimerState;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setInitialSeconds: (s: number) => void;
}

function msToDisplay(ms: number): TimeDisplay {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function useTimer(initialSeconds: number): UseTimerReturn {
  const [state, setState] = useState<TimerState>("idle");
  const [display, setDisplay] = useState<TimeDisplay>(msToDisplay(initialSeconds * 1000));

  const initialMsRef = useRef(initialSeconds * 1000);
  const remainingMsRef = useRef(initialSeconds * 1000);
  const startTimestampRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startTimestampRef.current;
    const remaining = remainingMsRef.current - elapsed;

    if (remaining <= 0) {
      clearTick();
      setDisplay({ hours: 0, minutes: 0, seconds: 0 });
      setState("alarm");
    } else {
      setDisplay(msToDisplay(remaining));
    }
  }, [clearTick]);

  const start = useCallback(() => {
    if (remainingMsRef.current <= 0) return;
    startTimestampRef.current = Date.now();
    setState("running");
  }, []);

  const pause = useCallback(() => {
    const elapsed = Date.now() - startTimestampRef.current;
    remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
    clearTick();
    setState("paused");
  }, [clearTick]);

  const reset = useCallback(() => {
    clearTick();
    remainingMsRef.current = initialMsRef.current;
    setDisplay(msToDisplay(initialMsRef.current));
    setState("idle");
  }, [clearTick]);

  const setInitialSeconds = useCallback((s: number) => {
    const ms = s * 1000;
    initialMsRef.current = ms;
    remainingMsRef.current = ms;
    setDisplay(msToDisplay(ms));
    setState("idle");
  }, []);

  useEffect(() => {
    if (state === "running") {
      tick();
      intervalRef.current = setInterval(tick, 100);
    }
    return clearTick;
  }, [state, tick, clearTick]);

  // Sync initial seconds from prop
  useEffect(() => {
    if (state === "idle") {
      const ms = initialSeconds * 1000;
      initialMsRef.current = ms;
      remainingMsRef.current = ms;
      setDisplay(msToDisplay(ms));
    }
  }, [initialSeconds, state]);

  return { time: display, state, start, pause, reset, setInitialSeconds };
}
