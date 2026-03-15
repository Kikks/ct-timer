export type Mode = "timer" | "stopwatch" | "realtime";

export type TimeDisplay = {
  hours: number;
  minutes: number;
  seconds: number;
};

export type TimerState = "idle" | "running" | "paused" | "alarm";

export type StopwatchState = "idle" | "running" | "paused";

export type TimeFormat = "12h" | "24h";
