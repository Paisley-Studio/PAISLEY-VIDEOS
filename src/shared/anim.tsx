import React from "react";
import { Audio } from "@remotion/media";
import {
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, HAND, QUICKSAND, SHADOW_SOFT } from "./theme";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

/** 0 → 1 progress between `start` and `start + dur` frames */
export const progress = (frame: number, start: number, dur = 18, easing = EASE_OUT) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing });

/** Bouncy 0 → 1 spring starting at `start` */
export const pop = (frame: number, fps: number, start: number, damping = 12) =>
  frame < start ? 0 : spring({ frame: frame - start, fps, config: { damping, stiffness: 170, mass: 0.7 } });

type AppearProps = {
  at: number;
  kind?: "pop" | "up" | "fade" | "left" | "right" | "down" | "drop";
  dur?: number;
  out?: number; // frame to disappear
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/** Wraps children in an entrance (and optional exit) animation. */
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
    transform = `translateY(${(1 - s) * -60}px) rotate(${(1 - s) * -6}deg)`;
    opacity = Math.min(1, s * 2);
  }
  return <div style={{ ...style, opacity: opacity * exit, transform: `${style?.transform ?? ""} ${transform}` }}>{children}</div>;
};

/** Reveals children left-to-right, like handwriting. */
export const WriteOn: React.FC<{ at: number; dur?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  at,
  dur = 20,
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, dur, Easing.linear);
  return <div style={{ ...style, clipPath: `inset(-20% ${(1 - p) * 100}% -20% -5%)` }}>{children}</div>;
};

/** Types text on, one character at a time, with a blinking caret. */
export const TypeOn: React.FC<{ text: string; at: number; cps?: number; caret?: boolean; style?: React.CSSProperties }> = ({
  text,
  at,
  cps = 22,
  caret = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.max(0, Math.min(text.length, Math.floor(((frame - at) / fps) * cps)));
  const typing = count < text.length;
  const showCaret = caret && frame >= at && (typing || Math.floor(frame / 15) % 2 === 0);
  return (
    <span style={style}>
      {text.slice(0, count)}
      <span style={{ opacity: showCaret ? 1 : 0, color: C.dino }}>|</span>
    </span>
  );
};

/** Draws a line through its children. */
export const Strike: React.FC<{ at: number; color?: string; thickness?: number; children: React.ReactNode }> = ({
  at,
  color = C.danger,
  thickness = 8,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 10, Easing.out(Easing.quad));
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      <span
        style={{
          position: "absolute",
          left: "-4%",
          top: "52%",
          height: thickness,
          width: `${p * 108}%`,
          background: color,
          borderRadius: thickness,
          transform: "rotate(-3deg)",
        }}
      />
    </span>
  );
};

/** A highlighter-marker sweep behind text. */
export const Marker: React.FC<{ at: number; color?: string; children: React.ReactNode }> = ({ at, color = C.accent, children }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 14);
  return (
    <span style={{ position: "relative", display: "inline-block", zIndex: 0 }}>
      <span
        style={{
          position: "absolute",
          left: "-3%",
          bottom: "8%",
          height: "42%",
          width: `${p * 106}%`,
          background: color,
          opacity: 0.55,
          borderRadius: 8,
          zIndex: -1,
        }}
      />
      {children}
    </span>
  );
};

/** A sound effect at a given frame (relative to the parent sequence). */
export const Sfx: React.FC<{ at: number; name: string; volume?: number }> = ({ at, name, volume = 0.5 }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={90} layout="none" name={`sfx: ${name}`}>
    <Audio src={staticFile(`audio/${name}.wav`)} volume={volume} />
  </Sequence>
);

/** Fades a whole scene in and out so cuts feel smooth. */
export const SceneFade: React.FC<{ duration: number; children: React.ReactNode; fadeIn?: number; fadeOut?: number }> = ({
  duration,
  children,
  fadeIn = 12,
  fadeOut = 12,
}) => {
  const frame = useCurrentFrame();
  const fadeInOpacity = fadeIn > 0 ? interpolate(frame, [0, fadeIn], [0, 1], CLAMP) : 1;
  const fadeOutOpacity = fadeOut > 0 ? interpolate(frame, [duration - fadeOut, duration], [1, 0], CLAMP) : 1;
  const opacity = fadeInOpacity * fadeOutOpacity;
  const scale = fadeIn > 0 ? interpolate(frame, [0, fadeIn * 1.5], [1.015, 1], { ...CLAMP, easing: EASE_OUT }) : 1;
  return <div style={{ position: "absolute", inset: 0, opacity, transform: `scale(${scale})` }}>{children}</div>;
};

export const Pill: React.FC<{ color?: string; textColor?: string; size?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({
  color = C.ink,
  textColor = "white",
  size = 30,
  style,
  children,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: `${size * 0.4}px ${size * 0.9}px`,
      borderRadius: 999,
      background: color,
      color: textColor,
      fontFamily: QUICKSAND,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: 1,
      boxShadow: SHADOW_SOFT,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Small uppercase section label used at the top of scenes. */
export const Kicker: React.FC<{ at: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, children, style }) => (
  <Appear at={at} kind="down" style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", ...style }}>
    <span
      style={{
        fontFamily: QUICKSAND,
        fontWeight: 700,
        fontSize: 26,
        letterSpacing: 6,
        color: C.inkSoft,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  </Appear>
);

export const handStyle = (size: number, color: string = C.pencil): React.CSSProperties => ({
  fontFamily: HAND,
  fontWeight: 700,
  fontSize: size,
  color,
  lineHeight: 1,
});
