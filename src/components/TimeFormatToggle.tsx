"use client";

import { TimeFormat } from "@/types";

interface TimeFormatToggleProps {
  format: TimeFormat;
  onFormatChange: (format: TimeFormat) => void;
}

export default function TimeFormatToggle({ format, onFormatChange }: TimeFormatToggleProps) {
  return (
    <div className="flex gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
      <button
        onClick={() => onFormatChange("12h")}
        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
          format === "12h" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
        }`}
      >
        12H
      </button>
      <button
        onClick={() => onFormatChange("24h")}
        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
          format === "24h" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"
        }`}
      >
        24H
      </button>
    </div>
  );
}
