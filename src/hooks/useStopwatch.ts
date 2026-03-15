"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TimeDisplay, StopwatchState } from "@/types";

interface UseStopwatchReturn {
  time: TimeDisplay;
  state: StopwatchState;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

function msToDisplay(ms: number): TimeDisplay {
  const totalSeconds = Math.floor(ms / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function useStopwatch(): UseStopwatchReturn {
  const [state, setState] = useState<StopwatchState>("idle");
  const [display, setDisplay] = useState<TimeDisplay>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const accumulatedRef = useRef(0);
  const startTimestampRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const elapsed = accumulatedRef.current + (Date.now() - startTimestampRef.current);
    setDisplay(msToDisplay(elapsed));
  }, []);

  const start = useCallback(() => {
    startTimestampRef.current = Date.now();
    setState("running");
  }, []);

  const pause = useCallback(() => {
    accumulatedRef.current += Date.now() - startTimestampRef.current;
    clearTick();
    setState("paused");
  }, [clearTick]);

  const reset = useCallback(() => {
    clearTick();
    accumulatedRef.current = 0;
    startTimestampRef.current = 0;
    setDisplay({ hours: 0, minutes: 0, seconds: 0 });
    setState("idle");
  }, [clearTick]);

  useEffect(() => {
    if (state === "running") {
      tick();
      intervalRef.current = setInterval(tick, 100);
    }
    return clearTick;
  }, [state, tick, clearTick]);

  return { time: display, state, start, pause, reset };
}
