"use client";

import { useCallback, useEffect, useState } from "react";
import { TimeDisplay, TimeFormat } from "@/types";

interface UseRealTimeReturn {
  time: TimeDisplay;
  period: "AM" | "PM" | null;
}

export function useRealTime(format: TimeFormat, enabled = true): UseRealTimeReturn {
  const getTime = useCallback((): UseRealTimeReturn => {
    const now = new Date();
    let hours = now.getHours();
    let period: "AM" | "PM" | null = null;

    if (format === "12h") {
      period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
    }

    return {
      time: {
        hours,
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      },
      period,
    };
  }, [format]);

  const [state, setState] = useState<UseRealTimeReturn>(getTime);

  useEffect(() => {
    if (!enabled) return;

    setState(getTime());

    const interval = setInterval(() => {
      setState(getTime());
    }, 200);

    return () => clearInterval(interval);
  }, [enabled, getTime]);

  return state;
}
