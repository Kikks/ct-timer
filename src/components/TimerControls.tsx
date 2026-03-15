"use client";

import { TimerState } from "@/types";

interface TimerControlsProps {
  state: TimerState;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onDismiss: () => void;
}

export default function TimerControls({
  state,
  onPause,
  onResume,
  onReset,
  onDismiss,
}: TimerControlsProps) {
  if (state === "alarm") {
    return (
      <div className="flex gap-3">
        <button
          onClick={onDismiss}
          className="px-8 py-3 bg-white text-[#0a0a0a] font-semibold text-sm rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      {state === "running" ? (
        <button
          onClick={onPause}
          className="px-6 py-3 bg-white/10 text-white font-semibold text-sm rounded-full hover:bg-white/15 active:scale-95 transition-all border border-white/10"
        >
          Pause
        </button>
      ) : (
        <button
          onClick={onResume}
          className="px-6 py-3 bg-white text-[#0a0a0a] font-semibold text-sm rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10"
        >
          Resume
        </button>
      )}
      <button
        onClick={onReset}
        className="px-6 py-3 bg-white/[0.05] text-white/60 font-semibold text-sm rounded-full hover:bg-white/10 hover:text-white/80 active:scale-95 transition-all border border-white/[0.06]"
      >
        Reset
      </button>
    </div>
  );
}
