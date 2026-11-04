import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, EASE_OUT, pop, progress } from "./anim";
import { C, QUICKSAND, SHADOW } from "./theme";

// ---------------- Syntax highlighting ----------------

export type Lang = "html" | "css" | "js";

const COL = {
  tag: "#c8553d",
  attr: "#2f6fd0",
  string: "#2a8a57",
  comment: "#a39a8e",
  keyword: "#9b4dca",
  number: "#c27c0e",
  selector: "#c8553d",
  property: "#2f6fd0",
  plain: C.ink,
};

type Rule = [RegExp, string];

const RULES: Record<Lang, Rule[]> = {
  html: [
    [/<!--.*?(-->|$)/y, COL.comment],
    [/<\/?[a-zA-Z0-9!]+/y, COL.tag],
    [/\/?>/y, COL.tag],
    [/[a-zA-Z-]+(?==)/y, COL.attr],
    [/"[^"]*"/y, COL.string],
  ],
  css: [
    [/\/\*.*?(\*\/|$)/y, COL.comment],
    [/@[a-z-]+/y, COL.keyword],
    [/[a-z-]+(?=\s*:)/y, COL.property],
    [/var\(--[a-z-]+\)/y, COL.string],
    [/--[a-z-]+/y, COL.attr],
    [/#[0-9a-fA-F]{3,6}\b/y, COL.number],
    [/-?\d+(\.\d+)?(px|%|s|deg|vh)?/y, COL.number],
    [/"[^"]*"/y, COL.string],
    [/!important/y, COL.keyword],
  ],
  js: [
    [/\/\/.*$/y, COL.comment],
    [/\/\*.*?(\*\/|$)/y, COL.comment],
    [/"[^"]*"/y, COL.string],
    [/\b(const|let|function|if|return|else|true|false|null)\b/y, COL.keyword],
    [/\b\d+(\.\d+)?\b/y, COL.number],
  ],
};

const highlight = (text: string, lang: Lang): { t: string; c: string }[] => {
  const out: { t: string; c: string }[] = [];
  // CSS selectors: a line that opens a block
  if (lang === "css" && /^\S[^:]*\{\s*$/.test(text)) {
    const i = text.indexOf("{");
    return [
      { t: text.slice(0, i), c: COL.selector },
      { t: text.slice(i), c: COL.plain },
    ];
  }
  // JS comment-only lines
  let plain = "";
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const [re, color] of RULES[lang]) {
      re.lastIndex = i;
      const m = re.exec(text);
      if (m && m[0].length > 0) {
        if (plain) out.push({ t: plain, c: COL.plain });
        plain = "";
        out.push({ t: m[0], c: color });
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      plain += text[i];
      i += 1;
    }
  }
  if (plain) out.push({ t: plain, c: COL.plain });
  return out;
};

const HighlightedText: React.FC<{ text: string; lang: Lang; chars: number }> = ({ text, lang, chars }) => {
  const tokens = highlight(text, lang);
  let left = chars;
  return (
    <>
      {tokens.map((tok, i) => {
        if (left <= 0) return null;
        const piece = tok.t.slice(0, left);
        left -= tok.t.length;
        return (
          <span key={i} style={{ color: tok.c, fontStyle: tok.c === COL.comment ? "italic" : "normal" }}>
            {piece}
          </span>
        );
      })}
    </>
  );
};

// ---------------- Code editor ----------------

export type CodeLine = {
  text: string;
  /** frame when the line starts typing; undefined = already there */
  at?: number;
  /** hide again from this frame (lines that get replaced) */
  until?: number;
};

export type CodeMark = { from: number; to: number; at: number; until?: number; color?: string; label?: string };

/** Stagger a block of lines so they type in one after another. */
export const typeBlock = (texts: string[], at: number, perLine = 7): CodeLine[] =>
  texts.map((text, i) => ({ text, at: at + i * perLine }));

export const LANG_COLOR: Record<Lang, string> = { html: C.html, css: C.css, js: C.js };

export const CodeEditor: React.FC<{
  file: string;
  lang: Lang;
  lines: CodeLine[];
  width: number;
  height: number;
  fontSize?: number;
  /** [frame, firstVisibleLine] keyframes for scrolling */
  scroll?: [number, number][];
  marks?: CodeMark[];
  style?: React.CSSProperties;
  newFlash?: boolean;
}> = ({ file, lang, lines, width, height, fontSize = 22, scroll, marks = [], style, newFlash = true }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lh = Math.round(fontSize * 1.5);
  const visible = lines.filter((l) => (l.at === undefined || frame >= l.at) && (l.until === undefined || frame < l.until));
  const scrollLine =
    scroll && scroll.length > 1
      ? interpolate(frame, scroll.map((s) => s[0]), scroll.map((s) => s[1]), { ...CLAMP, easing: EASE_IN_OUT })
      : scroll?.[0]?.[1] ?? 0;
  const accent = LANG_COLOR[lang];

  return (
    <div style={{ width, height, background: "#fbfaf7", borderRadius: 24, boxShadow: SHADOW, overflow: "hidden", display: "flex", flexDirection: "column", ...style }}>
      <div style={{ height: 54, background: "#efe9df", display: "flex", alignItems: "center", gap: 10, padding: "0 20px", flexShrink: 0 }}>
        {["#ee6a5f", "#f5bd4f", "#61c454"].map((c) => (
          <div key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
        ))}
        <div
          style={{
            marginLeft: 18,
            padding: "8px 20px",
            background: "#fbfaf7",
            borderRadius: "10px 10px 0 0",
            fontFamily: QUICKSAND,
            fontWeight: 700,
            fontSize: 20,
            color: C.ink,
            alignSelf: "flex-end",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div style={{ width: 12, height: 15, borderRadius: 3, background: accent }} />
          {file}
        </div>
      </div>
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 18 - scrollLine * lh }}>
          {/* marks (highlight bands) */}
          {marks.map((m, i) => {
            const on = progress(frame, m.at, 10) * (m.until === undefined ? 1 : 1 - progress(frame, m.until, 10));
            if (on <= 0) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 70,
                  right: 16,
                  top: m.from * lh - 2,
                  height: (m.to - m.from + 1) * lh + 4,
                  borderRadius: 10,
                  background: m.color ?? "rgba(255,183,3,0.28)",
                  border: `3px solid ${m.color ? "transparent" : "rgba(255,183,3,0.8)"}`,
                  opacity: on,
                }}
              >
                {m.label ? (
                  <div
                    style={{
                      position: "absolute",
                      right: 12,
                      top: -16,
                      fontFamily: QUICKSAND,
                      fontWeight: 700,
                      fontSize: 18,
                      color: "white",
                      background: C.ink,
                      padding: "4px 12px",
                      borderRadius: 999,
                    }}
                  >
                    {m.label}
                  </div>
                ) : null}
              </div>
            );
          })}
          {visible.map((line, i) => {
            const typed = line.at === undefined ? line.text.length : Math.floor(((frame - line.at) / fps) * 55);
            const fresh = newFlash && line.at !== undefined ? 1 - progress(frame, line.at + 40, 30) : 0;
            const enter = line.at === undefined ? 1 : progress(frame, line.at, 8, EASE_OUT);
            return (
              <div
                key={`${i}-${line.text}`}
                style={{
                  position: "relative",
                  height: lh,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: "'JetBrains Mono', Consolas, monospace",
                  fontSize,
                  whiteSpace: "pre",
                  opacity: enter,
                }}
              >
                {fresh > 0 ? <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, background: accent, opacity: 0.16 * fresh }} /> : null}
                <div style={{ width: 62, textAlign: "right", paddingRight: 18, color: "#c2b9ad", flexShrink: 0, position: "relative" }}>{i + 1}</div>
                <div style={{ position: "relative" }}>
                  <HighlightedText text={line.text} lang={lang} chars={typed} />
                  {line.at !== undefined && typed < line.text.length && typed >= 0 ? <span style={{ color: accent }}>▍</span> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Index of a line within the currently visible lines (for marks). */
export const visibleIndex = (lines: CodeLine[], frame: number, text: string) =>
  lines.filter((l) => (l.at === undefined || frame >= l.at) && (l.until === undefined || frame < l.until)).findIndex((l) => l.text.includes(text));

// ---------------- Browser window ----------------

export const Browser: React.FC<{
  width: number;
  height: number;
  file?: string;
  /** text in the address bar (defaults to the dino-game file path) */
  address?: string;
  refreshAt?: number[];
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width, height, file = "index.html", address, refreshAt = [], children, style }) => {
  const frame = useCurrentFrame();
  const flash = refreshAt.reduce((acc, at) => Math.max(acc, interpolate(frame, [at, at + 3, at + 12], [0, 1, 0], CLAMP)), 0);
  const spin = refreshAt.reduce((acc, at) => (frame >= at && frame < at + 12 ? (frame - at) * 30 : acc), 0);
  return (
    <div style={{ width, height, background: "white", borderRadius: 24, boxShadow: SHADOW, overflow: "hidden", display: "flex", flexDirection: "column", ...style }}>
      <div style={{ height: 54, background: "#efe9df", display: "flex", alignItems: "center", gap: 12, padding: "0 18px", flexShrink: 0 }}>
        <svg width={26} height={26} viewBox="0 0 26 26" style={{ transform: `rotate(${spin}deg)` }}>
          <path d="M 21 13 A 8 8 0 1 1 18 6.5" stroke={C.inkSoft} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          <path d="M 18 2 L 18.5 7 L 13.5 7.5" stroke={C.inkSoft} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ flex: 1, height: 32, borderRadius: 999, background: "white", display: "flex", alignItems: "center", padding: "0 16px", fontFamily: QUICKSAND, fontWeight: 600, fontSize: 17, color: C.inkSoft }}>
          {address ?? `dino-game / ${file}`}
        </div>
      </div>
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {children}
        <AbsoluteFill style={{ background: "white", opacity: flash * 0.8, pointerEvents: "none" }} />
      </div>
    </div>
  );
};

// ---------------- CODE → BROWSER → RESULT strip ----------------

export const Stepper: React.FC<{ steps: string[]; marks: number[]; style?: React.CSSProperties; color?: string }> = ({ steps, marks, style, color = C.dino }) => {
  const frame = useCurrentFrame();
  const active = marks.reduce((acc, at, i) => (frame >= at ? i : acc), -1);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, ...style }}>
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div
            style={{
              fontFamily: QUICKSAND,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 3,
              padding: "10px 22px",
              borderRadius: 999,
              background: i <= active ? color : "white",
              color: i <= active ? (color === C.js ? C.ink : "white") : C.inkSoft,
              boxShadow: i === active ? SHADOW : "none",
              transform: `scale(${i === active ? 1.06 : 1})`,
            }}
          >
            {s}
          </div>
          {i < steps.length - 1 ? <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, color: C.inkSoft }}>→</div> : null}
        </React.Fragment>
      ))}
    </div>
  );
};

// ---------------- Title + end cards ----------------

export const TitleCard: React.FC<{ number: number; title: string; subtitle: string; color: string; out: number }> = ({ number, title, subtitle, color, out }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const exit = progress(frame, out, 14, EASE_IN_OUT);
  const s = pop(frame, fps, 4, 14);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - exit, transform: `translateY(${exit * -40}px)` }}>
      <Appear at={0} kind="down">
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, letterSpacing: 8, color: C.inkSoft, textAlign: "center" }}>
          PAISLEY TECH STUDIO · DINO RUNNER BUILD SERIES
        </div>
      </Appear>
      <div
        style={{
          marginTop: 40,
          width: 150,
          height: 150,
          borderRadius: 44,
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: QUICKSAND,
          fontWeight: 700,
          fontSize: 96,
          color: color === C.js ? C.ink : "white",
          transform: `scale(${s}) rotate(${(1 - s) * -20}deg)`,
          boxShadow: SHADOW,
        }}
      >
        {number}
      </div>
      <Appear at={10} kind="up" style={{ marginTop: 40, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 110, color: C.ink, textAlign: "center" }}>
        {title}
      </Appear>
      <Appear at={18} kind="up" style={{ marginTop: 10, fontFamily: QUICKSAND, fontWeight: 600, fontSize: 50, color }}>
        {subtitle}
      </Appear>
    </AbsoluteFill>
  );
};

const SERIES: [string, string, string][] = [
  ["1", "Think like a creator", C.ink],
  ["2", "HTML", C.html],
  ["3", "CSS", C.css],
  ["4", "JavaScript", C.js],
  ["5", "AI", C.dino],
];

export const EndCard: React.FC<{ at: number; done: number; next?: string }> = ({ at, done, next }) => {
  const frame = useCurrentFrame();
  const opacity = progress(frame, at, 16);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity, background: C.canvas }}>
      <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: C.inkSoft }}>PAISLEY TECH STUDIO</div>
      <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 96, color: C.ink, marginTop: 20, textAlign: "center" }}>Dino Runner Build Series</div>
      <div style={{ display: "flex", gap: 20, marginTop: 50 }}>
        {SERIES.map(([n, label, color], i) => {
          const isDone = i < done;
          return (
            <div
              key={n}
              style={{
                fontFamily: QUICKSAND,
                fontWeight: 700,
                fontSize: 28,
                padding: "14px 28px",
                borderRadius: 999,
                background: isDone ? C.good : "white",
                color: isDone ? "white" : C.ink,
                border: `3px solid ${isDone ? C.good : color}`,
                opacity: interpolate(frame, [at + i * 4, at + i * 4 + 10], [0, 1], CLAMP),
              }}
            >
              {isDone ? "✓ " : ""}
              {n}. {label}
            </div>
          );
        })}
      </div>
      {next ? (
        <Appear at={at + 30} kind="up" style={{ marginTop: 60, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.ink }}>
          Next: {next}
        </Appear>
      ) : null}
    </AbsoluteFill>
  );
};

/** Simple "Save → Refresh" loop badge */
export const SaveRefresh: React.FC<{ at: number; style?: React.CSSProperties }> = ({ at, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at);
  const spin = Math.max(0, frame - at) * 4;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, transform: `scale(${s})`, opacity: Math.min(1, s * 2), ...style }}>
      <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, background: C.ink, color: "white", padding: "12px 26px", borderRadius: 999 }}>Save</div>
      <svg width={54} height={54} viewBox="0 0 26 26" style={{ transform: `rotate(${spin}deg)` }}>
        <path d="M 21 13 A 8 8 0 1 1 18 6.5" stroke={C.dino} strokeWidth={2.6} fill="none" strokeLinecap="round" />
        <path d="M 18 2 L 18.5 7 L 13.5 7.5" stroke={C.dino} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, background: C.dino, color: "white", padding: "12px 26px", borderRadius: 999 }}>Refresh</div>
    </div>
  );
};
