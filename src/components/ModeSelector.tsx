"use client";

import { Mode } from "@/types";

interface ModeSelectorProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

const modes: { value: Mode; label: string }[] = [
  { value: "timer", label: "Timer" },
  { value: "stopwatch", label: "Stopwatch" },
  { value: "realtime", label: "Clock" },
];

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-1 p-1 rounded-full bg-white/[0.06] border border-white/[0.08]">
      {modes.map((m) => (
        <button
          key={m.value}
          onClick={() => onModeChange(m.value)}
          className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
            mode === m.value
              ? "bg-white text-[#0a0a0a] shadow-lg"
              : "text-white/60 hover:text-white/90 hover:bg-white/[0.06]"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
