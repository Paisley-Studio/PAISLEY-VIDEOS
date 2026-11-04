import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_IN_OUT, EASE_OUT, pop, progress } from "../shared/anim";
import { C, QUICKSAND, SHADOW } from "../shared/theme";

// Building blocks used across the scenes of video 6.

export const V6 = {
  night: "#1f2a3a",
  dusk: "#2c3e57",
  dawn1: "#f7c9a3",
  dawn2: "#fbe6cf",
  sky: "#cfe7f2",
  teal: "#2a9d8f",
  plum: "#6c5a8e",
  ai: "#c4693f", // warm terracotta for the AI helper
  appBg: "#fbf7f1",
  mono: "'JetBrains Mono', Consolas, monospace",
};

// ---------------- Camera ----------------

export type Shot = { f: number; x?: number; y?: number; scale?: number; rotate?: number; rx?: number; ry?: number };

/** Moves everything inside it like a camera: pan, push-in, tilt, eased between keyframes. */
export const Camera: React.FC<{ shots: Shot[]; children: React.ReactNode; perspective?: number; style?: React.CSSProperties }> = ({
  shots,
  children,
  perspective = 2400,
  style,
}) => {
  const frame = useCurrentFrame();
  const frames = shots.map((s) => s.f);
  const val = (key: keyof Shot, fallback: number) => {
    const values = shots.map((s) => (s[key] as number | undefined) ?? fallback);
    return frames.length < 2 ? values[0] : interpolate(frame, frames, values, { ...CLAMP, easing: EASE_IN_OUT });
  };
  const x = val("x", 0);
  const y = val("y", 0);
  const scale = val("scale", 1);
  const rotate = val("rotate", 0);
  const rx = val("rx", 0);
  const ry = val("ry", 0);
  return (
    <AbsoluteFill style={{ perspective, overflow: "hidden", ...style }}>
      <AbsoluteFill
        style={{
          transformStyle: "preserve-3d",
          transform: `translate(${-x}px, ${-y}px) scale(${scale}) rotate(${rotate}deg) rotateX(${rx}deg) rotateY(${ry}deg)`,
          transformOrigin: "50% 50%",
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A layer that drifts with time to create parallax depth. */
export const Parallax: React.FC<{ depth: number; drift?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  depth,
  drift = 26,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ transform: `translateX(${-frame * depth * drift * 0.03}px)`, ...style }}>{children}</AbsoluteFill>;
};

// ---------------- Finishing ----------------

/** Gentle vignette + film grain so flat graphics feel photographed. */
export const FilmFinish: React.FC<{ vignette?: number; grain?: number }> = ({ vignette = 0.32, grain = 0.06 }) => {
  const frame = useCurrentFrame();
  const seed = frame % 6;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 90 }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(30,20,10,${vignette}) 100%)` }} />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: grain, mixBlendMode: "multiply" }}>
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Soft warm light sweeping across the frame (used on transitions). */
export const LightSweep: React.FC<{ at: number; dur?: number }> = ({ at, dur = 26 }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + dur], [-0.4, 1.4], CLAMP);
  const o = interpolate(frame, [at, at + dur * 0.3, at + dur * 0.7, at + dur], [0, 0.7, 0.7, 0], CLAMP);
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        zIndex: 80,
        opacity: o,
        background: `linear-gradient(105deg, transparent ${p * 100 - 18}%, rgba(255,236,205,0.55) ${p * 100}%, transparent ${p * 100 + 18}%)`,
      }}
    />
  );
};

// ---------------- Devices ----------------

export const PHONE_W = 400;
export const PHONE_H = 820;

/** A modern phone. Children render inside the 400 × 820 screen. */
export const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; glow?: number }> = ({ children, style, glow = 0 }) => (
  <div
    style={{
      position: "absolute",
      width: PHONE_W + 28,
      height: PHONE_H + 28,
      borderRadius: 70,
      background: "linear-gradient(145deg, #3b3f46, #15171b)",
      padding: 14,
      boxShadow: `0 50px 90px rgba(40,25,10,0.35), 0 12px 24px rgba(40,25,10,0.25), inset 0 0 0 2px #50555e${glow > 0 ? `, 0 0 ${80 * glow}px rgba(255,200,140,${0.5 * glow})` : ""}`,
      ...style,
    }}
  >
    <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, borderRadius: 56, overflow: "hidden", background: V6.appBg }}>
      {children}
      <div style={{ position: "absolute", top: 12, left: "50%", width: 120, height: 34, marginLeft: -60, borderRadius: 20, background: "#0d0e10", zIndex: 50 }} />
      <AbsoluteFill style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, transparent 30%)", pointerEvents: "none", zIndex: 49 }} />
    </div>
  </div>
);

/** Phone status bar (time, signal, battery). */
export const StatusBar: React.FC<{ dark?: boolean; time?: string }> = ({ dark = false, time = "7:42" }) => (
  <div
    style={{
      height: 58,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      padding: "0 34px 6px",
      fontFamily: QUICKSAND,
      fontWeight: 700,
      fontSize: 17,
      color: dark ? "white" : C.ink,
    }}
  >
    <span>{time}</span>
    <span style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
      {[6, 9, 12, 15].map((h) => (
        <span key={h} style={{ width: 4, height: h, borderRadius: 2, background: dark ? "white" : C.ink }} />
      ))}
      <span style={{ marginLeft: 6, width: 26, height: 13, borderRadius: 4, border: `2px solid ${dark ? "white" : C.ink}`, position: "relative" }}>
        <span style={{ position: "absolute", left: 1, top: 1, bottom: 1, width: 16, borderRadius: 2, background: dark ? "white" : C.ink }} />
      </span>
    </span>
  </div>
);

/** A laptop with a screen area of `width` × `width * 0.625`. */
export const LaptopFrame: React.FC<{ width: number; children: React.ReactNode; style?: React.CSSProperties; address?: string }> = ({
  width,
  children,
  style,
  address,
}) => {
  const h = width * 0.625;
  return (
    <div style={{ position: "absolute", width: width + 40, ...style }}>
      <div style={{ background: "#1d2026", borderRadius: "26px 26px 8px 8px", padding: 20, boxShadow: SHADOW }}>
        <div style={{ width, height: h, background: "white", borderRadius: 8, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column" }}>
          {address !== undefined ? (
            <div style={{ height: 44, background: "#f1ece4", display: "flex", alignItems: "center", gap: 9, padding: "0 16px", flexShrink: 0 }}>
              {["#ee6a5f", "#f5bd4f", "#61c454"].map((c) => (
                <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
              ))}
              <div style={{ marginLeft: 14, flex: 1, height: 26, borderRadius: 999, background: "white", display: "flex", alignItems: "center", gap: 8, padding: "0 14px", fontFamily: QUICKSAND, fontWeight: 600, fontSize: 14, color: C.inkSoft }}>
                <Icon name="lock" size={13} color={C.good} />
                {address}
              </div>
            </div>
          ) : null}
          <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>{children}</div>
        </div>
      </div>
      <div style={{ height: 22, margin: "0 -60px", background: "linear-gradient(#d9d4cc, #b9b2a8)", borderRadius: "0 0 26px 26px", boxShadow: "0 24px 40px rgba(40,25,10,0.25)" }}>
        <div style={{ width: 160, height: 8, margin: "0 auto", background: "#a49c91", borderRadius: "0 0 10px 10px" }} />
      </div>
    </div>
  );
};

// ---------------- Icons ----------------

const ICONS: Record<string, string> = {
  home: "M4 11 L12 4 L20 11 V20 H14 V14 H10 V20 H4 Z",
  search: "M10.5 4 a6.5 6.5 0 1 0 0.01 0 M15.5 15.5 L20 20",
  cart: "M3 4 H6 L8.5 15 H18 L20 7 H7 M9.5 19.5 a1 1 0 1 0 0.01 0 M16.5 19.5 a1 1 0 1 0 0.01 0",
  bell: "M6 16 V11 a6 6 0 0 1 12 0 V16 L20 18 H4 Z M10 20 a2 2 0 0 0 4 0",
  pin: "M12 21 C12 21 5 14 5 9.5 a7 7 0 0 1 14 0 C19 14 12 21 12 21 Z M12 7 a2.5 2.5 0 1 0 0.01 0",
  star: "M12 3.5 L14.6 9 L20.5 9.6 L16 13.6 L17.3 19.5 L12 16.5 L6.7 19.5 L8 13.6 L3.5 9.6 L9.4 9 Z",
  lock: "M6 11 H18 V20 H6 Z M8.5 11 V8 a3.5 3.5 0 0 1 7 0 V11",
  check: "M5 12.5 L10 17 L19 7",
  bus: "M6 4 H18 a2 2 0 0 1 2 2 V17 H4 V6 a2 2 0 0 1 2 -2 Z M4 11 H20 M7.5 20 V17 M16.5 20 V17 M7.5 14 h0.01 M16.5 14 h0.01",
  music: "M9 18 V6 L19 4 V16 M9 18 a2.5 2.5 0 1 1 -0.01 0 M19 16 a2.5 2.5 0 1 1 -0.01 0",
  chat: "M4 5 H20 V16 H10 L5 20 V16 H4 Z",
  bike: "M6 17 a3.5 3.5 0 1 0 0.01 0 M18 17 a3.5 3.5 0 1 0 0.01 0 M6 17 L10 9 H15 L18 17 M9 6 H12 M15 9 L13 5 H16",
  clock: "M12 4 a8 8 0 1 0 0.01 0 M12 8 V12 L15 14",
  user: "M12 4 a4 4 0 1 0 0.01 0 M4 20 a8 6 0 0 1 16 0",
  spark: "M12 3 L13.8 10.2 L21 12 L13.8 13.8 L12 21 L10.2 13.8 L3 12 L10.2 10.2 Z",
  heart: "M12 20 C5 15 3 12 3 8.5 a4.5 4.5 0 0 1 9 -1 a4.5 4.5 0 0 1 9 1 C21 12 19 15 12 20 Z",
  chart: "M4 20 V4 M4 20 H20 M8 16 V11 M12 16 V7 M16 16 V13",
  grid: "M4 4 H10 V10 H4 Z M14 4 H20 V10 H14 Z M4 14 H10 V20 H4 Z M14 14 H20 V20 H14 Z",
  calendar: "M4 6 H20 V20 H4 Z M4 10 H20 M8 3 V7 M16 3 V7",
  globe: "M12 3 a9 9 0 1 0 0.01 0 M3 12 H21 M12 3 C8 7 8 17 12 21 M12 3 C16 7 16 17 12 21",
  game: "M6 8 H18 a3 3 0 0 1 3 3 V14 a3 3 0 0 1 -3 3 H6 a3 3 0 0 1 -3 -3 V11 a3 3 0 0 1 3 -3 Z M8 11 V14 M6.5 12.5 H9.5 M15.5 12 h0.01 M17.5 13.5 h0.01",
  bulb: "M9 18 H15 M10 21 H14 M12 3 a6 6 0 0 1 3.5 10.9 V16 H8.5 V13.9 A6 6 0 0 1 12 3 Z",
};

export const Icon: React.FC<{ name: keyof typeof ICONS | string; size?: number; color?: string; stroke?: number; fill?: string; style?: React.CSSProperties }> = ({
  name,
  size = 24,
  color = C.ink,
  stroke = 2,
  fill = "none",
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, ...style }}>
    <path d={ICONS[name]} fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ---------------- Interaction ----------------

/** A finger tap: a soft dot that presses down and ripples out. */
export const Tap: React.FC<{ at: number; x: number; y: number; color?: string }> = ({ at, x, y, color = "rgba(43,43,43,0.35)" }) => {
  const frame = useCurrentFrame();
  if (frame < at - 10 || frame > at + 24) return null;
  const approach = interpolate(frame, [at - 10, at], [0, 1], CLAMP);
  const ripple = interpolate(frame, [at, at + 20], [0, 1], { ...CLAMP, easing: EASE_OUT });
  const fade = interpolate(frame, [at + 8, at + 24], [1, 0], CLAMP);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, zIndex: 40, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: -28, top: -28, width: 56, height: 56, borderRadius: "50%", background: color, opacity: approach * fade, transform: `scale(${frame < at ? 1.3 - 0.3 * approach : 0.9})` }} />
      <div style={{ position: "absolute", left: -28, top: -28, width: 56, height: 56, borderRadius: "50%", border: `3px solid ${color}`, opacity: (1 - ripple) * (frame >= at ? 1 : 0), transform: `scale(${1 + ripple * 1.6})` }} />
    </div>
  );
};

/** A press-in scale for buttons that are tapped at `at`. */
export const pressScale = (frame: number, at: number) => interpolate(frame, [at - 2, at, at + 6], [1, 0.94, 1], CLAMP);

// ---------------- People ----------------

export type PersonLook = { skin: string; hair: string; top: string; hairStyle?: "short" | "long" | "curly" | "bun"; glasses?: boolean };

export const LOOKS: Record<string, PersonLook> = {
  maya: { skin: "#8d5a3b", hair: "#1e1410", top: "#4a8fe7", hairStyle: "curly" },
  parent: { skin: "#c68b62", hair: "#2a1b14", top: "#2a9d8f", hairStyle: "bun" },
  leo: { skin: "#f0c7a6", hair: "#5b3a24", top: "#f08a4b", hairStyle: "short", glasses: true },
  sam: { skin: "#5e3a26", hair: "#120c09", top: "#ffb703", hairStyle: "short" },
  ana: { skin: "#e6b48e", hair: "#3a2416", top: "#6c5a8e", hairStyle: "long" },
};

/**
 * A softly shaded illustrated person, seen from the waist up.
 * 360 × 420 at scale 1. `look` sets skin, hair and clothing; `blink` and `nod` add life.
 */
export const Person: React.FC<{ look: PersonLook; scale?: number; style?: React.CSSProperties; arm?: "down" | "phone" | "type" | "wave"; lookAt?: number }> = ({
  look,
  scale = 1,
  style,
  arm = "down",
  lookAt = 0,
}) => {
  const frame = useCurrentFrame();
  const blink = frame % 110 > 104 ? 0.15 : 1;
  const breathe = Math.sin(frame / 22) * 2;
  const typing = arm === "type" ? Math.sin(frame / 2.2) * 3 : 0;
  const wave = arm === "wave" ? Math.sin(frame / 5) * 14 : 0;
  const shade = "rgba(40,20,10,0.16)";
  const eyeX = lookAt * 4;
  return (
    <svg width={360 * scale} height={420 * scale} viewBox="0 0 360 420" style={{ position: "absolute", overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={`top-${look.top}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={look.top} />
          <stop offset="1" stopColor={look.top} stopOpacity={0.78} />
        </linearGradient>
      </defs>
      <g transform={`translate(0 ${breathe})`}>
        {/* long hair behind */}
        {look.hairStyle === "long" ? <path d="M112 120 Q105 230 135 270 L225 270 Q255 230 248 120 Z" fill={look.hair} /> : null}
        {/* body */}
        <path d="M70 420 Q70 300 130 285 Q180 272 230 285 Q290 300 290 420 Z" fill={`url(#top-${look.top})`} />
        <path d="M150 282 Q180 305 210 282 L205 272 Q180 285 155 272 Z" fill={look.skin} />
        {/* neck */}
        <rect x="160" y="230" width="40" height="52" rx="16" fill={look.skin} />
        <rect x="160" y="250" width="40" height="18" fill={shade} />
        {/* head */}
        <ellipse cx="180" cy="168" rx="66" ry="76" fill={look.skin} />
        <ellipse cx="114" cy="175" rx="11" ry="17" fill={look.skin} />
        <ellipse cx="246" cy="175" rx="11" ry="17" fill={look.skin} />
        <path d="M120 200 Q180 262 240 200 Q232 244 180 246 Q128 244 120 200 Z" fill={shade} opacity={0.5} />
        {/* hair */}
        {look.hairStyle === "curly" ? (
          <g fill={look.hair}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <circle key={i} cx={112 + i * 17} cy={112 - Math.sin((i / 8) * Math.PI) * 30} r={26} />
            ))}
            <circle cx="112" cy="140" r="20" />
            <circle cx="248" cy="140" r="20" />
          </g>
        ) : look.hairStyle === "bun" ? (
          <g fill={look.hair}>
            <circle cx="180" cy="74" r="28" />
            <path d="M112 160 Q108 92 180 88 Q252 92 248 160 Q236 118 180 116 Q124 118 112 160 Z" />
          </g>
        ) : look.hairStyle === "long" ? (
          <path d="M110 170 Q104 90 180 88 Q256 90 250 170 Q240 118 196 114 Q150 128 110 170 Z" fill={look.hair} />
        ) : (
          <path d="M114 150 Q110 92 180 90 Q252 92 246 150 Q232 116 180 120 Q130 116 114 150 Z" fill={look.hair} />
        )}
        {/* face */}
        <g transform={`translate(${eyeX} 0)`}>
          <ellipse cx="156" cy="172" rx="6.5" ry={8 * blink} fill="#2b1d16" />
          <ellipse cx="204" cy="172" rx="6.5" ry={8 * blink} fill="#2b1d16" />
          <circle cx="158" cy="169" r="2" fill="white" opacity={blink} />
          <circle cx="206" cy="169" r="2" fill="white" opacity={blink} />
          <path d="M144 152 Q156 146 168 151" stroke={look.hair} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M192 151 Q204 146 216 152" stroke={look.hair} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M176 182 Q180 196 186 194" stroke={shade} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M162 210 Q180 224 198 210" stroke="#7a3b2e" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="142" cy="198" rx="12" ry="7" fill="#e88a7a" opacity={0.25} />
          <ellipse cx="218" cy="198" rx="12" ry="7" fill="#e88a7a" opacity={0.25} />
          {look.glasses ? (
            <g stroke="#2b2b2b" strokeWidth="4" fill="rgba(255,255,255,0.15)">
              <rect x="136" y="156" width="40" height="32" rx="12" />
              <rect x="184" y="156" width="40" height="32" rx="12" />
              <path d="M176 170 H184" />
            </g>
          ) : null}
        </g>
        {/* arms */}
        {arm === "phone" ? (
          <g>
            <path d="M260 330 Q300 300 262 250" stroke={look.top} strokeWidth="46" fill="none" strokeLinecap="round" />
            <circle cx="258" cy="246" r="24" fill={look.skin} />
            <rect x="232" y="196" width="50" height="86" rx="10" fill="#1d2026" transform="rotate(-8 257 239)" />
            <rect x="237" y="203" width="40" height="70" rx="6" fill="#ffd9b0" opacity={0.9} transform="rotate(-8 257 239)" />
          </g>
        ) : arm === "type" ? (
          <g>
            <path d={`M100 330 Q110 ${388 + typing} 160 ${400 + typing}`} stroke={look.top} strokeWidth="44" fill="none" strokeLinecap="round" />
            <path d={`M260 330 Q250 ${388 - typing} 200 ${400 - typing}`} stroke={look.top} strokeWidth="44" fill="none" strokeLinecap="round" />
          </g>
        ) : arm === "wave" ? (
          <g transform={`rotate(${wave} 270 300)`}>
            <path d="M262 320 Q320 280 300 200" stroke={look.top} strokeWidth="44" fill="none" strokeLinecap="round" />
            <circle cx="300" cy="186" r="24" fill={look.skin} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};

// ---------------- Typography ----------------

/** Big headline that rises in word by word with a blur-to-sharp focus pull. */
export const Headline: React.FC<{ text: string; at: number; size?: number; color?: string; stagger?: number; style?: React.CSSProperties; weight?: number }> = ({
  text,
  at,
  size = 96,
  color = C.ink,
  stagger = 4,
  style,
  weight = 700,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ fontFamily: QUICKSAND, fontWeight: weight, fontSize: size, color, lineHeight: 1.1, letterSpacing: -1, ...style }}>
      {text.split(" ").map((word, i) => {
        const s = pop(frame, fps, at + i * stagger, 16);
        const blur = interpolate(s, [0, 1], [12, 0], CLAMP);
        return (
          <span key={i} style={{ display: "inline-block", marginRight: size * 0.26, opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * size * 0.5}px)`, filter: `blur(${blur}px)` }}>
            {word}
          </span>
        );
      })}
    </div>
  );
};

/** Counts a number up between two frames. */
export const useCount = (from: number, to: number, at: number, dur: number) => {
  const frame = useCurrentFrame();
  return Math.round(from + (to - from) * progress(frame, at, dur, EASE_OUT));
};
