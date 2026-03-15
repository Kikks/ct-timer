"use client";

import { ServicePhase } from "@/types";

interface ServiceControlsProps {
  phase: ServicePhase;
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onRestart: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const primaryBtn =
  "px-6 py-3 bg-white text-[#0a0a0a] font-semibold text-sm rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10";

const ghostBtn =
  "px-6 py-3 bg-white/10 text-white font-semibold text-sm rounded-full hover:bg-white/15 active:scale-95 transition-all border border-white/10";

const subtleBtn =
  "px-6 py-3 bg-white/[0.05] text-white/60 font-semibold text-sm rounded-full hover:bg-white/10 hover:text-white/80 active:scale-95 transition-all border border-white/[0.06]";

export default function ServiceControls({
  phase,
  onPause,
  onResume,
  onNext,
  onPrev,
  onReset,
  onRestart,
  isFirst,
  isLast,
}: ServiceControlsProps) {
  if (phase === "complete") {
    return (
      <div className="flex gap-3">
        <button onClick={onRestart} className={primaryBtn}>
          Restart
        </button>
        <button onClick={onReset} className={subtleBtn}>
          End Service
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {!isFirst && (
        <button onClick={onPrev} className={subtleBtn}>
          Prev
        </button>
      )}
      {phase === "running" ? (
        <button onClick={onPause} className={ghostBtn}>
          Pause
        </button>
      ) : (
        <button onClick={onResume} className={primaryBtn}>
          Resume
        </button>
      )}
      {!isLast ? (
        <button onClick={onNext} className={ghostBtn}>
          Next
        </button>
      ) : null}
      {phase === "paused" && (
        <button onClick={onReset} className={subtleBtn}>
          End
        </button>
      )}
    </div>
  );
}
