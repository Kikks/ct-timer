"use client";

import { useState, useEffect, useRef, useCallback, Fragment } from "react";
import { Mode, TimeFormat } from "@/types";
import FlipClock from "@/components/FlipClock";
import ModeSelector from "@/components/ModeSelector";
import TimerSetup from "@/components/TimerSetup";
import TimerControls from "@/components/TimerControls";
import StopwatchControls from "@/components/StopwatchControls";
import TimeFormatToggle from "@/components/TimeFormatToggle";
import FullscreenToggle from "@/components/FullscreenToggle";
import ServiceSetup from "@/components/ServiceSetup";
import ServiceInfo from "@/components/ServiceInfo";
import ServiceControls from "@/components/ServiceControls";
import ServiceSegmentStrip from "@/components/ServiceSegmentStrip";
import { useTimer } from "@/hooks/useTimer";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useRealTime } from "@/hooks/useRealTime";
import { useServiceMode } from "@/hooks/useServiceMode";

const HIDE_DELAY = 2500;

export default function Home() {
  const [mode, setMode] = useState<Mode>("realtime");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("24h");
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [autoSwitch, setAutoSwitch] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [serviceSetupOpen, setServiceSetupOpen] = useState(false);
  const autoSwitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const timer = useTimer(timerSeconds);
  const stopwatch = useStopwatch();
  const realTime = useRealTime(timeFormat, mode === "realtime");
  const service = useServiceMode();

  // Determine if something is actively running (controls should auto-hide)
  const isActive =
    (mode === "timer" && (timer.state === "running" || timer.state === "alarm")) ||
    (mode === "stopwatch" && stopwatch.state === "running") ||
    (mode === "service" && service.phase === "running") ||
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
    mode === "timer"
      ? timer.time
      : mode === "stopwatch"
        ? stopwatch.time
        : mode === "service"
          ? service.time
          : realTime.time;

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
      if (mode === "service" && (service.phase === "running" || service.phase === "paused")) {
        service.pause();
      }
      setMode(newMode);
    },
    [mode, timer, stopwatch, service]
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
  const shouldShowUI =
    controlsVisible ||
    (mode === "timer" && timer.state === "idle") ||
    (mode === "timer" && timer.state === "paused") ||
    (mode === "stopwatch" && stopwatch.state !== "running") ||
    (mode === "service" && service.phase === "setup") ||
    (mode === "service" && service.phase === "paused") ||
    (mode === "service" && service.phase === "complete");

  // Service mode: whether the service is actively playing (not setup)
  const serviceIsPlaying = mode === "service" && service.phase !== "setup";

  return (
    <Fragment>
      <main
        className={`min-h-screen flex flex-col items-center justify-center gap-8 sm:gap-16 p-4 sm:p-8 overflow-hidden ${isAlarm ? "" : "bg-background"}`}
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

        {/* Service info: segment title + speaker (always visible during playback) */}
        {serviceIsPlaying && service.currentSegment && (
          <ServiceInfo
            segment={service.currentSegment}
            currentIndex={service.currentIndex}
            totalSegments={service.segments.length}
          />
        )}

        {/* Clock display */}
        <div className="flex flex-col items-center gap-2" role="timer" aria-live="polite">
          <FlipClock
            time={displayTime}
            alarm={isAlarm}
            blinkColons={
              mode === "realtime" ||
              (mode === "timer" && timer.state === "running") ||
              (mode === "stopwatch" && stopwatch.state === "running") ||
              (mode === "service" && service.phase === "running")
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

        {/* Service complete message */}
        {mode === "service" && service.phase === "complete" && (
          <p className="text-sm text-white/50 animate-pulse">Service Complete</p>
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

          {mode === "service" && service.phase === "setup" && (
            <button
              onClick={() => setServiceSetupOpen(true)}
              className="px-8 py-3 bg-white text-[#0a0a0a] font-semibold text-sm rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10"
            >
              Configure Service
            </button>
          )}

          {mode === "service" && service.phase !== "setup" && (
            <ServiceControls
              phase={service.phase}
              onPause={service.pause}
              onResume={service.resume}
              onNext={service.next}
              onPrev={service.prev}
              onReset={service.reset}
              onRestart={service.startService}
              isFirst={service.currentIndex === 0}
              isLast={service.currentIndex === service.segments.length - 1}
            />
          )}
        </div>

        {/* Service segment strip */}
        {serviceIsPlaying && (
          <div
            className="transition-opacity duration-500"
            style={{
              opacity: shouldShowUI ? 1 : 0,
              pointerEvents: shouldShowUI ? "auto" : "none",
            }}
          >
            <ServiceSegmentStrip
              segments={service.segments}
              currentIndex={service.currentIndex}
              onJumpTo={service.jumpTo}
            />
          </div>
        )}
      </main>

      {/* Service setup modal — outside main to avoid overflow:hidden clipping */}
      {serviceSetupOpen && (
        <ServiceSetup
          segments={service.segments}
          onAddSegment={service.addSegment}
          onRemoveSegment={service.removeSegment}
          onUpdateSegment={service.updateSegment}
          onReorderSegments={service.reorderSegments}
          onSetSegments={service.setSegments}
          onStart={service.startService}
          onClose={() => setServiceSetupOpen(false)}
          totalDuration={service.totalDuration}
        />
      )}
    </Fragment>
  );
}
