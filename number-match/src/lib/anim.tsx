import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
/** The game's own card-flip curve: cubic-bezier(.2,.75,.25,1) over .55s */
export const EASE_FLIP = Easing.bezier(0.2, 0.75, 0.25, 1);
export const FLIP_FRAMES = Math.round(0.55 * 30);

/** 0 → 1 between `start` and `start + dur` frames. */
export const progress = (frame: number, start: number, dur = 18, easing = EASE_OUT) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing });

/** Bouncy 0 → 1 spring starting at `start`. */
export const pop = (frame: number, fps: number, start: number, damping = 12) =>
  frame < start ? 0 : spring({ frame: frame - start, fps, config: { damping, stiffness: 170, mass: 0.7 } });

/** Linear map with clamping. */
export const map = (frame: number, input: number[], output: number[], easing = EASE_IN_OUT) =>
  interpolate(frame, input, output, { ...CLAMP, easing });

type AppearProps = {
  at: number;
  kind?: "pop" | "up" | "fade" | "left" | "right" | "down" | "drop";
  dur?: number;
  out?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/** Entrance (and optional exit) animation wrapper. */
export const Appear: React.FC<AppearProps> = ({ at, kind = "up", dur = 16, out, style, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = progress(frame, at, dur);
  const s = pop(frame, fps, at);
  const exit = out === undefined ? 1 : 1 - progress(frame, out, 10, EASE_IN_OUT);
  let transform = "";
  let opacity = p;
  if (kind === "pop") {
    transform = `scale(${0.4 + 0.6 * s})`;
    opacity = Math.min(1, s * 1.6);
  } else if (kind === "up") transform = `translateY(${(1 - p) * 40}px)`;
  else if (kind === "down") transform = `translateY(${(p - 1) * 40}px)`;
  else if (kind === "left") transform = `translateX(${(1 - p) * -80}px)`;
  else if (kind === "right") transform = `translateX(${(1 - p) * 80}px)`;
  else if (kind === "drop") {
    transform = `translateY(${(1 - s) * -70}px) rotate(${(1 - s) * -5}deg)`;
    opacity = Math.min(1, s * 2);
  }
  if (frame < at) return null;
  return <div style={{ ...style, opacity: opacity * exit, transform: `${style?.transform ?? ""} ${transform}` }}>{children}</div>;
};

/** Types text on one character at a time. Returns the visible substring. */
export const typed = (text: string, frame: number, at: number, cps = 18, fps = 30) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor(((frame - at) / fps) * cps))));

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
