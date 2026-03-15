"use client";

import { TimeDisplay } from "@/types";
import FlipGroup from "./FlipGroup";

interface FlipClockProps {
  time: TimeDisplay;
  alarm?: boolean;
  blinkColons?: boolean;
  period?: "AM" | "PM" | null;
}

export default function FlipClock({
  time,
  alarm = false,
  blinkColons = true,
  period = null,
}: FlipClockProps) {
  const colonColor = alarm ? "#0a0a0a" : "#f0f0f0";
  const blinkStyle: React.CSSProperties =
    blinkColons && !alarm ? { animation: "colonBlink 1s step-end infinite" } : {};

  return (
    <div
      style={alarm ? { animation: "pulsate 1.5s ease-in-out infinite" } : undefined}
      className="flex items-center"
    >
      <div className="flex items-center gap-2 sm:gap-3 text-6xl sm:text-8xl lg:text-9xl xl:text-[12rem] 2xl:text-[16rem] font-bold">
        <FlipGroup value={time.hours} inverted={alarm} />

        <span
          style={{ color: colonColor, opacity: 0.8, ...blinkStyle }}
          className="font-light -mt-[0.05em]"
        >
          :
        </span>

        <FlipGroup value={time.minutes} inverted={alarm} />

        <span
          style={{ color: colonColor, opacity: 0.8, ...blinkStyle }}
          className="font-light -mt-[0.05em]"
        >
          :
        </span>

        <FlipGroup value={time.seconds} inverted={alarm} />
      </div>

      {period && (
        <span
          className="ml-3 text-lg sm:text-2xl xl:text-4xl 2xl:text-5xl font-medium self-start mt-2"
          style={{ color: alarm ? "#0a0a0a" : "rgba(255,255,255,0.5)" }}
        >
          {period}
        </span>
      )}
    </div>
  );
}
