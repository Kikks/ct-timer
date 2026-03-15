"use client";

import { ServiceSegment } from "@/types";

interface ServiceInfoProps {
  segment: ServiceSegment;
  currentIndex: number;
  totalSegments: number;
}

export default function ServiceInfo({
  segment,
  currentIndex,
  totalSegments,
}: ServiceInfoProps) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="text-xs sm:text-sm text-white/30 font-medium tracking-wider uppercase">
        {currentIndex + 1} of {totalSegments}
      </p>
      <h2 className="text-lg sm:text-2xl xl:text-3xl font-semibold text-white/80">
        {segment.title}
      </h2>
      {segment.person && (
        <p className="text-sm sm:text-lg text-white/40">{segment.person}</p>
      )}
    </div>
  );
}
