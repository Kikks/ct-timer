"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ServiceSegment, ServicePhase, TimeDisplay } from "@/types";

function msToDisplay(ms: number): TimeDisplay {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const ZERO: TimeDisplay = { hours: 0, minutes: 0, seconds: 0 };

export interface UseServiceModeReturn {
  // State
  segments: ServiceSegment[];
  currentIndex: number;
  phase: ServicePhase;
  time: TimeDisplay;
  currentSegment: ServiceSegment | null;
  totalDuration: number; // total minutes

  // Setup actions
  setSegments: (s: ServiceSegment[]) => void;
  addSegment: (s: Omit<ServiceSegment, "id">) => void;
  removeSegment: (id: string) => void;
  updateSegment: (id: string, updates: Partial<Omit<ServiceSegment, "id">>) => void;
  reorderSegments: (segments: ServiceSegment[]) => void;

  // Playback actions
  startService: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

export function useServiceMode(): UseServiceModeReturn {
  const [segments, setSegmentsState] = useState<ServiceSegment[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<ServicePhase>("setup");
  const [display, setDisplay] = useState<TimeDisplay>(ZERO);

  // Countdown refs (same pattern as useTimer)
  const remainingMsRef = useRef(0);
  const startTimestampRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const segmentsRef = useRef(segments);
  const currentIndexRef = useRef(currentIndex);

  // Keep refs in sync
  segmentsRef.current = segments;
  currentIndexRef.current = currentIndex;

  const clearTick = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startCountdownForSegment = useCallback(
    (index: number) => {
      const seg = segmentsRef.current[index];
      if (!seg) return;
      const ms = seg.duration * 60 * 1000;
      remainingMsRef.current = ms;
      startTimestampRef.current = Date.now();
      setDisplay(msToDisplay(ms));
      setCurrentIndex(index);
      setPhase("running");
    },
    []
  );

  const advanceToNext = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < segmentsRef.current.length) {
      startCountdownForSegment(nextIdx);
    } else {
      clearTick();
      setDisplay(ZERO);
      setPhase("complete");
    }
  }, [clearTick, startCountdownForSegment]);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startTimestampRef.current;
    const remaining = remainingMsRef.current - elapsed;

    if (remaining <= 0) {
      clearTick();
      // Auto-advance immediately
      advanceToNext();
    } else {
      setDisplay(msToDisplay(remaining));
    }
  }, [clearTick, advanceToNext]);

  // Start/stop interval when phase changes
  useEffect(() => {
    if (phase === "running") {
      tick();
      intervalRef.current = setInterval(tick, 100);
    }
    return clearTick;
  }, [phase, tick, clearTick]);

  // Cleanup on unmount
  useEffect(() => () => clearTick(), [clearTick]);

  // --- Setup actions ---
  const setSegments = useCallback((s: ServiceSegment[]) => {
    setSegmentsState(s);
  }, []);

  const addSegment = useCallback((s: Omit<ServiceSegment, "id">) => {
    const newSeg: ServiceSegment = { ...s, id: `seg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    setSegmentsState((prev) => [...prev, newSeg]);
  }, []);

  const removeSegment = useCallback((id: string) => {
    setSegmentsState((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateSegment = useCallback(
    (id: string, updates: Partial<Omit<ServiceSegment, "id">>) => {
      setSegmentsState((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
    },
    []
  );

  const reorderSegments = useCallback((newSegments: ServiceSegment[]) => {
    setSegmentsState(newSegments);
  }, []);

  // --- Playback actions ---
  const startService = useCallback(() => {
    if (segmentsRef.current.length === 0) return;
    startCountdownForSegment(0);
  }, [startCountdownForSegment]);

  const pause = useCallback(() => {
    if (phase !== "running") return;
    const elapsed = Date.now() - startTimestampRef.current;
    remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
    clearTick();
    setPhase("paused");
  }, [phase, clearTick]);

  const resume = useCallback(() => {
    if (phase !== "paused") return;
    if (remainingMsRef.current <= 0) {
      advanceToNext();
      return;
    }
    startTimestampRef.current = Date.now();
    setPhase("running");
  }, [phase, advanceToNext]);

  const next = useCallback(() => {
    clearTick();
    const nextIdx = currentIndexRef.current + 1;
    if (nextIdx < segmentsRef.current.length) {
      startCountdownForSegment(nextIdx);
    } else {
      setDisplay(ZERO);
      setPhase("complete");
    }
  }, [clearTick, startCountdownForSegment]);

  const prev = useCallback(() => {
    clearTick();
    const prevIdx = Math.max(0, currentIndexRef.current - 1);
    startCountdownForSegment(prevIdx);
  }, [clearTick, startCountdownForSegment]);

  const jumpTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= segmentsRef.current.length) return;
      clearTick();
      startCountdownForSegment(index);
    },
    [clearTick, startCountdownForSegment]
  );

  const reset = useCallback(() => {
    clearTick();
    setCurrentIndex(0);
    setDisplay(ZERO);
    setPhase("setup");
  }, [clearTick]);

  const currentSegment =
    phase !== "setup" && segments[currentIndex] ? segments[currentIndex] : null;

  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

  return {
    segments,
    currentIndex,
    phase,
    time: display,
    currentSegment,
    totalDuration,
    setSegments,
    addSegment,
    removeSegment,
    updateSegment,
    reorderSegments,
    startService,
    pause,
    resume,
    next,
    prev,
    jumpTo,
    reset,
  };
}
