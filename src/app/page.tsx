"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mode, TimeFormat } from "@/types";
import FlipClock from "@/components/FlipClock";
import ModeSelector from "@/components/ModeSelector";
import TimerSetup from "@/components/TimerSetup";
import TimerControls from "@/components/TimerControls";
import StopwatchControls from "@/components/StopwatchControls";
import TimeFormatToggle from "@/components/TimeFormatToggle";
import FullscreenToggle from "@/components/FullscreenToggle";
import { useTimer } from "@/hooks/useTimer";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useRealTime } from "@/hooks/useRealTime";

const HIDE_DELAY = 2500;

export default function Home() {
  const [mode, setMode] = useState<Mode>("realtime");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [autoSwitch, setAutoSwitch] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const autoSwitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timer = useTimer(timerSeconds);
  const stopwatch = useStopwatch();
  const realTime = useRealTime(timeFormat, mode === "realtime");

  // Determine if something is actively running (controls should auto-hide)
  const isActive =
    (mode === "timer" && (timer.state === "running" || timer.state === "alarm")) ||
    (mode === "stopwatch" && stopwatch.state === "running") ||
    mode === "realtime";

  // Mouse activity: show controls, then schedule hide
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (isActive) {
      hideTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, HIDE_DELAY);
    }
  }, [isActive]);

  // When active state changes, start/stop the hide timer
  useEffect(() => {
    if (isActive) {
      hideTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, HIDE_DELAY);
    } else {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setControlsVisible(true);
    }
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isActive]);

  // Listen for mouse/touch/keyboard activity on document (more reliable than window)
  useEffect(() => {
    const handler = () => showControls();
    document.addEventListener("mousemove", handler, true);
    document.addEventListener("mousedown", handler, true);
    document.addEventListener("touchstart", handler, true);
    document.addEventListener("keydown", handler, true);
    return () => {
      document.removeEventListener("mousemove", handler, true);
      document.removeEventListener("mousedown", handler, true);
      document.removeEventListener("touchstart", handler, true);
      document.removeEventListener("keydown", handler, true);
    };
  }, [showControls]);

  // Determine display time based on mode
  const displayTime =
    mode === "timer" ? timer.time : mode === "stopwatch" ? stopwatch.time : realTime.time;

  const isAlarm = mode === "timer" && timer.state === "alarm";

  // Handle timer start from setup
  const handleTimerStart = useCallback(
    (totalSeconds: number, autoSwitchEnabled: boolean) => {
      setTimerSeconds(totalSeconds);
      setAutoSwitch(autoSwitchEnabled);
      setTimeout(() => timer.start(), 50);
    },
    [timer]
  );

  // Handle alarm auto-switch to real time after 60 seconds
  useEffect(() => {
    if (isAlarm && autoSwitch) {
      autoSwitchTimeoutRef.current = setTimeout(() => {
        timer.reset();
        setMode("realtime");
      }, 60_000);
    }

    return () => {
      if (autoSwitchTimeoutRef.current) {
        clearTimeout(autoSwitchTimeoutRef.current);
        autoSwitchTimeoutRef.current = null;
      }
    };
  }, [isAlarm, autoSwitch, timer]);

  // Cleanup when switching modes
  const handleModeChange = useCallback(
    (newMode: Mode) => {
      if (mode === "timer" && timer.state === "alarm") {
        timer.reset();
      }
      if (mode === "stopwatch" && stopwatch.state === "running") {
        stopwatch.pause();
      }
      setMode(newMode);
    },
    [mode, timer, stopwatch]
  );

  // Dismiss alarm
  const handleDismiss = useCallback(() => {
    if (autoSwitchTimeoutRef.current) {
      clearTimeout(autoSwitchTimeoutRef.current);
      autoSwitchTimeoutRef.current = null;
    }
    timer.reset();
  }, [timer]);

  // Determine if we should show non-clock UI (mode selector, controls)
  // Always show when: timer is idle (setup screen), stopwatch is idle/paused, or controls are visible
  const shouldShowUI =
    controlsVisible ||
    (mode === "timer" && timer.state === "idle") ||
    (mode === "timer" && timer.state === "paused") ||
    (mode === "stopwatch" && stopwatch.state !== "running");

  return (
    <main
      className={`min-h-screen flex flex-col items-center justify-center gap-16 sm:gap-32 p-4 sm:p-8 overflow-hidden ${isAlarm ? "" : "bg-background"}`}
      style={{
        cursor: shouldShowUI ? "default" : "none",
        ...(isAlarm ? { animation: "alarmFlash 0.4s ease-in-out infinite" } : {}),
      }}
      onMouseMove={showControls}
      onMouseDown={showControls}
      onTouchStart={showControls}
      onKeyDown={showControls}
    >
      {/* Mode selector + fullscreen */}
      <div
        className="flex items-center gap-3 transition-opacity duration-500"
        style={{
          opacity: shouldShowUI ? 1 : 0,
          pointerEvents: shouldShowUI ? "auto" : "none",
        }}
      >
        <ModeSelector mode={mode} onModeChange={handleModeChange} />
        <FullscreenToggle />
      </div>

      {/* Clock display */}
      <div className="flex flex-col items-center gap-2" role="timer" aria-live="polite">
        <FlipClock
          time={displayTime}
          alarm={isAlarm}
          blinkColons={
            mode === "realtime" ||
            (mode === "timer" && timer.state === "running") ||
            (mode === "stopwatch" && stopwatch.state === "running")
          }
          period={mode === "realtime" ? realTime.period : null}
        />
      </div>

      {/* Alarm status indicator */}
      {isAlarm && (
        <p
          className="text-sm text-white/50 animate-pulse transition-opacity duration-500"
          style={{ opacity: shouldShowUI ? 1 : 0 }}
        >
          {autoSwitch ? "Switching to clock in 1 minute..." : "Time's up!"}
        </p>
      )}

      {/* Controls */}
      <div
        className="flex flex-col items-center gap-4 transition-opacity duration-500"
        style={{
          opacity: shouldShowUI ? 1 : 0,
          pointerEvents: shouldShowUI ? "auto" : "none",
        }}
      >
        {mode === "timer" && timer.state === "idle" && <TimerSetup onStart={handleTimerStart} />}

        {mode === "timer" && timer.state !== "idle" && (
          <TimerControls
            state={timer.state}
            onPause={timer.pause}
            onResume={timer.start}
            onReset={timer.reset}
            onDismiss={handleDismiss}
          />
        )}

        {mode === "stopwatch" && (
          <StopwatchControls
            state={stopwatch.state}
            onStart={stopwatch.start}
            onPause={stopwatch.pause}
            onReset={stopwatch.reset}
          />
        )}

        {mode === "realtime" && (
          <TimeFormatToggle format={timeFormat} onFormatChange={setTimeFormat} />
        )}
      </div>
    </main>
  );
}
