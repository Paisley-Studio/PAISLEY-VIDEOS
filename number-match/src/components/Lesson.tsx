import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_IN_OUT, EASE_OUT, map, pop, progress } from "../lib/anim";
import { C, IDE, MONO, QUICKSAND } from "../styles/theme";
import { Lang, Line, tokenize } from "./highlight";
import { FileIcon, PaisleyIDE, Rect } from "./PaisleyIDE";
import { NumberMatchLogo, PaisleyBadge } from "./Brand";
import { NumberCard } from "./NumberCard";
import { Backdrop } from "./Stage";
import { Sfx } from "./Sfx";

export const LANG_COLOR: Record<string, string> = { HTML: C.html, CSS: C.css, JAVASCRIPT: C.js, "GAME LOGIC": C.red, FINALE: C.gold };

/** Fades the scene in from / out to the stage colour. */
export const SceneFade: React.FC<{ duration: number; inFrames?: number; outFrames?: number }> = ({ duration, inFrames = 8, outFrames = 8 }) => {
  const frame = useCurrentFrame();
  const o = Math.max(interpolate(frame, [0, inFrames], [1, 0], CLAMP), interpolate(frame, [duration - outFrames, duration], [0, 1], CLAMP));
  return <AbsoluteFill style={{ background: C.night, opacity: o, pointerEvents: "none" }} />;
};

/** "LESSON N · LANG" opener card. */
export const makeOpener = (lesson: number, lang: string, title: string, subtitle: string): React.FC => {
  const Opener: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const color = LANG_COLOR[lang];
    const tile = pop(frame, fps, 4, 12);
    const t = progress(frame, 14, 18);
    const s = progress(frame, 26, 18);
    const out = map(frame, [durationInFrames - 12, durationInFrames], [0, 1]);
    return (
      <AbsoluteFill>
        <Backdrop count={14} seed={lesson * 13} speed={0.4} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: QUICKSAND, fontWeight: 700 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, transform: `scale(${tile})` }}>
            <div style={{ background: C.white, color: C.ink, borderRadius: 16, padding: "12px 26px", fontSize: 38, letterSpacing: "0.1em" }}>LESSON {lesson}</div>
            <div style={{ background: color, color: color === C.gold ? C.ink : C.white, borderRadius: 16, padding: "12px 26px", fontSize: 38, letterSpacing: "0.1em", boxShadow: `0 6px 0 ${C.night2}` }}>
              {lang}
            </div>
          </div>
          <div style={{ marginTop: 40, color: C.white, fontSize: 96, letterSpacing: "-0.01em", opacity: t, transform: `translateY(${(1 - t) * 30}px)` }}>{title}</div>
          <div style={{ marginTop: 14, color: C.mint, fontSize: 42, opacity: s, transform: `translateY(${(1 - s) * 20}px)` }}>{subtitle}</div>
        </div>
        <div style={{ position: "absolute", left: 60, bottom: 50, opacity: s }}>
          <NumberMatchLogo size={0.42} />
        </div>
        <Sfx name="sting" at={2} volume={0.7} />
        <Sfx name="whoosh" at={12} volume={0.6} />
        <AbsoluteFill style={{ background: C.night, opacity: out }} />
      </AbsoluteFill>
    );
  };
  return Opener;
};

/** Closing card used under the outro narration. */
export const EndCard: React.FC<{ at: number; next: string; nextColor?: string; final?: boolean }> = ({ at, next, nextColor = C.gold, final = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at, 13);
  const n = progress(frame, at + 16, 16);
  if (frame < at) return null;
  return (
    <AbsoluteFill style={{ fontFamily: QUICKSAND, fontWeight: 700 }}>
      <AbsoluteFill style={{ background: C.night, opacity: Math.min(1, (frame - at) / 8) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", transform: `scale(${0.6 + 0.4 * p})`, opacity: Math.min(1, p * 1.5) }}>
        <NumberMatchLogo size={0.9} />
      </div>
      {!final && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 520, display: "flex", justifyContent: "center", alignItems: "center", gap: 18, opacity: n, transform: `translateY(${(1 - n) * 20}px)` }}>
          <span style={{ background: nextColor, color: nextColor === C.gold ? C.ink : C.white, borderRadius: 12, padding: "8px 18px", fontSize: 28, letterSpacing: "0.08em" }}>NEXT</span>
          <span style={{ color: C.white, fontSize: 42 }}>{next}</span>
        </div>
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: 650, display: "flex", justifyContent: "center", opacity: n }}>
        <PaisleyBadge size={170} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- IDE stage with a camera ----------

export const IDE_SCALE = 0.86;
export const IDE_X = (1920 - 1920 * IDE_SCALE) / 2;
export const IDE_Y = 22;
const FOCUS = { x: 960, y: 470 };

export type CamKey = { f: number; z: number; x?: number; y?: number }; // x,y = native IDE coords of the point to centre
const toScreen = (x: number, y: number) => ({ x: IDE_X + x * IDE_SCALE, y: IDE_Y + y * IDE_SCALE });

/** Interpolated camera at `frame`. Identity when z = 1. */
export const camAt = (keys: CamKey[], frame: number) => {
  const norm = keys.map((k) => {
    const c = k.x !== undefined && k.y !== undefined ? toScreen(k.x, k.y) : FOCUS;
    return { f: k.f, z: k.z, cx: k.z === 1 ? FOCUS.x : c.x, cy: k.z === 1 ? FOCUS.y : c.y };
  });
  if (!norm.length) return { z: 1, cx: FOCUS.x, cy: FOCUS.y };
  if (frame <= norm[0].f) return norm[0];
  for (let i = 0; i < norm.length - 1; i++) {
    const a = norm[i];
    const b = norm[i + 1];
    if (frame <= b.f) {
      const p = interpolate(frame, [a.f, b.f], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
      return { z: a.z + (b.z - a.z) * p, cx: a.cx + (b.cx - a.cx) * p, cy: a.cy + (b.cy - a.cy) * p };
    }
  }
  return norm[norm.length - 1];
};

/** Rect helper for focusing on a native rect. */
export const centre = (r: Rect) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/** The Paisley IDE on the stage, with camera and an overlay layer in native IDE coordinates. */
export const IdeStage: React.FC<{
  ide: React.ComponentProps<typeof PaisleyIDE>;
  cam?: CamKey[];
  overlay?: React.ReactNode; // drawn in native IDE coordinates (cursor, callouts)
  enter?: boolean;
  children?: React.ReactNode; // drawn in screen coordinates on top
}> = ({ ide, cam = [], overlay, enter = false, children }) => {
  const frame = useCurrentFrame();
  const c = camAt(cam, frame);
  const e = enter ? progress(frame, 0, 22, EASE_OUT) : 1;
  return (
    <AbsoluteFill>
      <Backdrop count={10} seed={77} speed={0.25} />
      <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `translate(${FOCUS.x - c.z * c.cx}px, ${FOCUS.y - c.z * c.cy}px) scale(${c.z})` }}>
        <div
          style={{
            position: "absolute",
            left: IDE_X,
            top: IDE_Y,
            width: 1920,
            height: 1080,
            transformOrigin: "0 0",
            transform: `translateY(${(1 - e) * 100}px) scale(${IDE_SCALE})`,
            opacity: e,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: `0 14px 0 ${C.night2}`,
          }}
        >
          <PaisleyIDE {...ide} />
          {overlay}
        </div>
      </div>
      {children}
    </AbsoluteFill>
  );
};

// ---------- big code card for teaching ----------

export type Mark = { from: number; to: number; at: number; until?: number; color?: string };

export const CodeCard: React.FC<{
  file?: string;
  lang: Lang;
  lines: string[];
  fontSize?: number;
  width: number;
  chars?: number;
  marks?: Mark[];
  tag?: string; // e.g. "TEACHING EXAMPLE"
  dim?: boolean; // dim un-marked lines while a mark is active
  scroll?: number; // lines
  maxLines?: number;
  lineNumbers?: boolean;
  startLine?: number;
}> = ({ file, lang, lines, fontSize = 30, width, chars = Infinity, marks = [], tag, dim = true, scroll = 0, maxLines, lineNumbers = true, startLine = 1 }) => {
  const frame = useCurrentFrame();
  const toks = tokenize(lines, lang);
  const lineH = Math.round(fontSize * 1.55);
  let budget = chars;
  const visible = lines.map((l) => {
    const v = Math.max(0, Math.min(l.length, budget));
    budget -= l.length + 1;
    return v;
  });
  const active = marks.filter((m) => frame >= m.at && (m.until === undefined || frame < m.until));
  const shown = maxLines ?? lines.length;
  const icon = lang === "js" ? "js" : lang;
  return (
    <div style={{ width, background: C.white, borderRadius: 22, overflow: "hidden", boxShadow: `0 10px 0 ${C.night2}`, fontFamily: QUICKSAND }}>
      {(file || tag) && (
        <div style={{ height: 58, background: IDE.topbar, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", borderBottom: `2px solid ${IDE.topbarLine}` }}>
          {file && <FileIcon kind={icon} size={26} />}
          {file && <span style={{ fontSize: 26, fontWeight: 700, color: IDE.pathText }}>{file}</span>}
          {tag && <span style={{ marginLeft: "auto", background: C.gold, color: C.ink, borderRadius: 8, padding: "4px 12px", fontSize: 18, fontWeight: 700, letterSpacing: "0.08em" }}>{tag}</span>}
        </div>
      )}
      <div style={{ position: "relative", height: shown * lineH + 28, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 14 - scroll * lineH }}>
          {lines.map((_, i) => {
            const n = i + 1;
            const mark = active.find((m) => n >= m.from && n <= m.to);
            const p = mark ? Math.min(1, (frame - mark.at) / 6) : 0;
            const faded = dim && active.length > 0 && !mark;
            return (
              <div key={i} style={{ height: lineH, display: "flex", alignItems: "center", background: mark ? (mark.color ?? `rgba(255,194,61,${0.32 * p})`) : "transparent", opacity: faded ? 0.38 : 1 }}>
                {lineNumbers && <div style={{ width: fontSize * 2.2, flexShrink: 0, textAlign: "right", paddingRight: 16, color: IDE.gutterText, fontFamily: MONO, fontSize: fontSize * 0.8 }}>{startLine + i}</div>}
                <div style={{ fontFamily: MONO, fontSize, whiteSpace: "pre", paddingLeft: lineNumbers ? 0 : 24 }}>
                  <Line toks={toks[i]} chars={visible[i]} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Gold label chip. */
export const Chip: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = C.gold, size = 28, style }) => (
  <div
    style={{
      display: "inline-block",
      background: color,
      color: color === C.gold || color === C.mint || color === C.white ? C.ink : C.white,
      fontFamily: QUICKSAND,
      fontWeight: 700,
      fontSize: size,
      padding: `${size * 0.3}px ${size * 0.65}px`,
      borderRadius: size * 0.45,
      boxShadow: `0 5px 0 rgba(0,0,0,0.22)`,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Positioned chip that pops in at `at` (and optionally out). */
export const Label: React.FC<{ at: number; out?: number; x: number; y: number; color?: string; size?: number; children: React.ReactNode; anchor?: "left" | "center" | "right" }> = ({
  at,
  out,
  x,
  y,
  color,
  size,
  children,
  anchor = "left",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || (out !== undefined && frame > out + 8)) return null;
  const s = pop(frame, fps, at, 13);
  const o = out === undefined ? 1 : interpolate(frame, [out, out + 8], [1, 0], CLAMP);
  const tx = anchor === "center" ? "-50%" : anchor === "right" ? "-100%" : "0";
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${tx}) scale(${0.6 + 0.4 * s})`, transformOrigin: "0 50%", opacity: Math.min(1, s * 1.5) * o }}>
      <Chip color={color} size={size}>
        {children}
      </Chip>
    </div>
  );
};

/** Big heading shown on concept stages. */
export const StageTitle: React.FC<{ at: number; children: React.ReactNode; color?: string; y?: number }> = ({ at, children, color = C.white, y = 60 }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 16);
  return (
    <div style={{ position: "absolute", left: 80, top: y, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 64, color, opacity: p, transform: `translateY(${(1 - p) * 20}px)` }}>{children}</div>
  );
};

/** A pulse value 0..1..0 around [from, to]. */
export const ring = (frame: number, from: number, to: number) => interpolate(frame, [from, from + 8, to - 6, to], [0, 1, 1, 0], CLAMP);

/** Typed characters between two frames for a block of lines. */
export const typedChars = (lines: string[], frame: number, from: number, to: number) =>
  Math.floor(interpolate(frame, [from, to], [0, lines.join("\n").length], CLAMP));

/** A single number card floating on the stage. */
export const StageCard: React.FC<{ n: number; x: number; y: number; w: number; angle?: number; matched?: boolean; at?: number }> = ({ n, x, y, w, angle = 180, matched, at = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, 13);
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - w / 0.78 / 2, transform: `scale(${s})` }}>
      <NumberCard number={n} width={w} angle={angle} variant="hero" matched={matched} />
    </div>
  );
};
