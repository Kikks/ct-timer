"use client";

import { StopwatchState } from "@/types";

interface StopwatchControlsProps {
  state: StopwatchState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export default function StopwatchControls({
  state,
  onStart,
  onPause,
  onReset,
}: StopwatchControlsProps) {
  return (
    <div className="flex gap-3">
      {state === "idle" && (
        <button
          onClick={onStart}
          className="px-8 py-3 bg-white text-[#0a0a0a] font-semibold text-sm rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10"
        >
          Start
        </button>
      )}

      {state === "running" && (
        <button
          onClick={onPause}
          className="px-6 py-3 bg-white/10 text-white font-semibold text-sm rounded-full hover:bg-white/15 active:scale-95 transition-all border border-white/10"
        >
          Stop
        </button>
      )}

      {state === "paused" && (
        <>
          <button
            onClick={onStart}
            className="px-6 py-3 bg-white text-[#0a0a0a] font-semibold text-sm rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10"
          >
            Resume
          </button>
          <button
            onClick={onReset}
            className="px-6 py-3 bg-white/[0.05] text-white/60 font-semibold text-sm rounded-full hover:bg-white/10 hover:text-white/80 active:scale-95 transition-all border border-white/[0.06]"
          >
            Reset
          </button>
        </>
      )}
    </div>
  );
}
