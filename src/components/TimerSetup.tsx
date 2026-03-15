"use client";

import { useState } from "react";

interface TimerSetupProps {
  onStart: (totalSeconds: number, autoSwitch: boolean) => void;
}

export default function TimerSetup({ onStart }: TimerSetupProps) {
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("5");
  const [seconds, setSeconds] = useState("0");
  const [autoSwitch, setAutoSwitch] = useState(false);

  const normalize = () => {
    const h = Math.max(0, parseInt(hours) || 0);
    const m = Math.max(0, parseInt(minutes) || 0);
    const s = Math.max(0, parseInt(seconds) || 0);
    const total = h * 3600 + m * 60 + s;
    // Cap at 99:59:59
    const capped = Math.min(total, 99 * 3600 + 59 * 60 + 59);
    const nh = Math.floor(capped / 3600);
    const nm = Math.floor((capped % 3600) / 60);
    const ns = capped % 60;
    return { hours: nh, minutes: nm, seconds: ns, total: capped };
  };

  const handleBlur = () => {
    const { hours: nh, minutes: nm, seconds: ns } = normalize();
    setHours(String(nh));
    setMinutes(String(nm));
    setSeconds(String(ns));
  };

  const handleStart = () => {
    const { total } = normalize();
    if (total > 0) {
      onStart(total, autoSwitch);
    }
  };

  const inputClass =
    "w-16 sm:w-20 bg-transparent text-center text-3xl sm:text-4xl font-bold text-white border-b-2 border-white/20 focus:border-white/60 outline-none transition-colors py-2 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-end gap-2 sm:gap-3">
        <div className="flex flex-col items-center gap-1">
          <label className="text-[10px] uppercase tracking-widest text-white/40">Hours</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            onBlur={handleBlur}
            onFocus={(e) => e.target.select()}
            min={0}
            className={inputClass}
          />
        </div>
        <span className="text-3xl sm:text-4xl text-white/30 font-light pb-2">:</span>
        <div className="flex flex-col items-center gap-1">
          <label className="text-[10px] uppercase tracking-widest text-white/40">Min</label>
          <input
            type="number"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            onBlur={handleBlur}
            onFocus={(e) => e.target.select()}
            min={0}
            className={inputClass}
          />
        </div>
        <span className="text-3xl sm:text-4xl text-white/30 font-light pb-2">:</span>
        <div className="flex flex-col items-center gap-1">
          <label className="text-[10px] uppercase tracking-widest text-white/40">Sec</label>
          <input
            type="number"
            value={seconds}
            onChange={(e) => setSeconds(e.target.value)}
            onBlur={handleBlur}
            onFocus={(e) => e.target.select()}
            min={0}
            className={inputClass}
          />
        </div>
      </div>

      {/* Auto-switch toggle */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={autoSwitch}
            onChange={(e) => setAutoSwitch(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-white/30 transition-colors" />
          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white/50 rounded-full peer-checked:translate-x-5 peer-checked:bg-white transition-all duration-200" />
        </div>
        <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
          Switch to clock when done
        </span>
      </label>

      <button
        onClick={handleStart}
        className="px-8 py-3 bg-white text-[#0a0a0a] font-semibold text-sm rounded-full hover:bg-white/90 active:scale-95 transition-all shadow-lg shadow-white/10"
      >
        Start Timer
      </button>
    </div>
  );
}
