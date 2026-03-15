"use client";

import FlipDigit from "./FlipDigit";

interface FlipGroupProps {
  value: number;
  padTo?: number;
  inverted?: boolean;
}

export default function FlipGroup({ value, padTo = 2, inverted = false }: FlipGroupProps) {
  const digits = String(value).padStart(padTo, "0").split("").map(Number);

  return (
    <div className="flex gap-[0.08em]">
      {digits.map((d, i) => (
        <FlipDigit key={i} digit={d} inverted={inverted} />
      ))}
    </div>
  );
}
