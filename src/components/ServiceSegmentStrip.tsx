"use client";

import { useEffect, useRef } from "react";
import { ServiceSegment } from "@/types";

interface ServiceSegmentStripProps {
  segments: ServiceSegment[];
  currentIndex: number;
  onJumpTo: (index: number) => void;
}

export default function ServiceSegmentStrip({
  segments,
  currentIndex,
  onJumpTo,
}: ServiceSegmentStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to keep current segment visible
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  return (
    <div
      ref={scrollRef}
      className="flex gap-1.5 overflow-x-auto max-w-[90vw] py-1 px-1 scrollbar-none"
      style={{ scrollbarWidth: "none" }}
    >
      {segments.map((seg, i) => {
        const isCurrent = i === currentIndex;
        const isPast = i < currentIndex;

        return (
          <button
            key={seg.id}
            ref={isCurrent ? activeRef : null}
            onClick={() => onJumpTo(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
              isCurrent
                ? "bg-white text-[#0a0a0a] shadow-lg"
                : isPast
                ? "bg-white/[0.04] text-white/30 hover:text-white/50 border border-white/[0.06]"
                : "bg-white/[0.06] text-white/60 hover:text-white/80 border border-white/[0.08]"
            }`}
            title={`${seg.title} (${seg.duration}m)${seg.person ? ` - ${seg.person}` : ""}`}
          >
            <span className="truncate max-w-[120px] inline-block align-bottom">
              {seg.title}
            </span>
            <span className={isCurrent ? "text-[#0a0a0a]/60 ml-1" : "text-white/30 ml-1"}>
              {seg.duration}m
            </span>
          </button>
        );
      })}
    </div>
  );
}
