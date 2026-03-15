"use client";

import { useEffect, useRef, useState } from "react";

interface FlipDigitProps {
  digit: number;
  inverted?: boolean;
}

const FLIP_MS = 450;

// Inject keyframes once globally
let keyframesInjected = false;
function injectKeyframes() {
  if (keyframesInjected || typeof document === "undefined") return;
  keyframesInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes flapDown {
      0% { transform: rotateX(0deg); }
      100% { transform: rotateX(-90deg); }
    }
    @keyframes flapUp {
      0% { transform: rotateX(90deg); }
      100% { transform: rotateX(0deg); }
    }
    @keyframes pulsate {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.03); opacity: 0.9; }
    }
    @keyframes alarmFlash {
      0%, 100% { background-color: #0a0a0a; }
      50% { background-color: #cc0000; }
    }
    @keyframes colonBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }
  `;
  document.head.appendChild(style);
}

export default function FlipDigit({ digit, inverted = false }: FlipDigitProps) {
  const prevRef = useRef(digit);
  const [phase, setPhase] = useState<"idle" | "fold-out" | "fold-in">("idle");
  const [oldDigit, setOldDigit] = useState(digit);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timer2Ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    injectKeyframes();
  }, []);

  useEffect(() => {
    if (digit !== prevRef.current) {
      // Clear any pending timers from a previous flip
      if (timerRef.current) clearTimeout(timerRef.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);

      setOldDigit(prevRef.current);
      setPhase("fold-out");

      // At the halfway point, switch to fold-in phase
      timerRef.current = setTimeout(() => {
        setPhase("fold-in");
      }, FLIP_MS * 0.5);

      // When done, go idle
      timer2Ref.current = setTimeout(() => {
        setPhase("idle");
        prevRef.current = digit;
      }, FLIP_MS + 30);
    }
  }, [digit]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (timer2Ref.current) clearTimeout(timer2Ref.current);
    },
    []
  );

  const bgTop = inverted ? "#f5f5f5" : "#1a1a1a";
  const bgBot = inverted ? "#ebebeb" : "#141414";
  const fg = inverted ? "#0a0a0a" : "#f0f0f0";

  const half: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  };

  const isFlipping = phase !== "idle";

  // During fold-out: top flap shows OLD, folds down. Static bottom shows OLD.
  // During fold-in: bottom flap shows NEW, folds into place. Static bottom shows NEW underneath.
  const bottomDigit = phase === "fold-out" ? oldDigit : digit;

  return (
    <div
      style={{
        perspective: 400,
        position: "relative",
        width: "0.65em",
        height: "1.3em",
        borderRadius: 8,
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {/* Static top half: shows NEW digit (revealed as top flap folds away) */}
      <div
        style={{
          ...half,
          clipPath: "inset(0 0 50% 0)",
          background: bgTop,
          borderRadius: "8px 8px 0 0",
        }}
      >
        <span style={{ color: fg, lineHeight: 1 }}>{digit}</span>
      </div>

      {/* Static bottom half: shows OLD during fold-out, NEW during fold-in */}
      <div
        style={{
          ...half,
          clipPath: "inset(50% 0 0 0)",
          background: bgBot,
          borderRadius: "0 0 8px 8px",
        }}
      >
        <span style={{ color: fg, lineHeight: 1 }}>{isFlipping ? bottomDigit : digit}</span>
      </div>

      {/* Animated top flap: OLD digit's top half folding down and away */}
      {phase === "fold-out" && (
        <div
          style={{
            ...half,
            clipPath: "inset(0 0 50% 0)",
            transformOrigin: "50% 100%",
            background: bgTop,
            borderRadius: "8px 8px 0 0",
            zIndex: 5,
            backfaceVisibility: "hidden",
            animation: `flapDown ${FLIP_MS * 0.5}ms cubic-bezier(0.32, 0, 0.67, 0) forwards`,
          }}
        >
          <span style={{ color: fg, lineHeight: 1 }}>{oldDigit}</span>
        </div>
      )}

      {/* Animated bottom flap: NEW digit's bottom half folding into view */}
      {phase === "fold-in" && (
        <div
          style={{
            ...half,
            clipPath: "inset(50% 0 0 0)",
            transformOrigin: "50% 50%",
            background: bgBot,
            borderRadius: "0 0 8px 8px",
            zIndex: 5,
            backfaceVisibility: "hidden",
            animation: `flapUp ${FLIP_MS * 0.5}ms cubic-bezier(0.33, 1, 0.68, 1) forwards`,
          }}
        >
          <span style={{ color: fg, lineHeight: 1 }}>{digit}</span>
        </div>
      )}

      {/* Divider line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 2,
          background: inverted ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.4)",
          zIndex: 10,
          transform: "translateY(-1px)",
        }}
      />
    </div>
  );
}
