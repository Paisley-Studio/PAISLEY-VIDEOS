import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_FLIP, EASE_OUT, map, pop, progress } from "../../lib/anim";
import { NumberCard } from "../../components/NumberCard";
import { Backdrop } from "../../components/Stage";
import { Sfx } from "../../components/Sfx";
import { C, MONO, QUICKSAND } from "../../styles/theme";
import { TL } from "./timeline";

const TILE_W = 520;
const TILE_H = 640;

const Tile: React.FC<{ x: number; at: number; color: string; name: string; tag: string; textColor: string; children: React.ReactNode; active: number }> = ({
  x,
  at,
  color,
  name,
  tag,
  textColor,
  children,
  active,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, 13);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x - TILE_W / 2,
        top: 150,
        width: TILE_W,
        height: TILE_H,
        transform: `translateY(${(1 - s) * -160}px) scale(${(0.7 + 0.3 * s) * (1 + 0.04 * active)})`,
        opacity: Math.min(1, s * 1.6),
        borderRadius: 30,
        background: C.night2,
        border: `5px solid ${active > 0.5 ? color : C.nightLine}`,
        boxShadow: `0 12px 0 ${C.night}`,
        overflow: "hidden",
        fontFamily: QUICKSAND,
        fontWeight: 700,
      }}
    >
      <div style={{ background: color, color: textColor, padding: "26px 30px 22px" }}>
        <div style={{ fontSize: 66, letterSpacing: "0.02em", lineHeight: 1 }}>{name}</div>
        <div style={{ fontSize: 25, letterSpacing: "0.1em", marginTop: 10 }}>{tag}</div>
      </div>
      <div style={{ position: "absolute", left: 30, right: 30, top: 190, bottom: 30, background: C.page, borderRadius: 20, overflow: "hidden" }}>{children}</div>
    </div>
  );
};

/** HTML demo: wireframe boxes stack up (structure only, no style). */
const HtmlDemo: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const boxes = [
    { x: 20, y: 20, w: 420, h: 42, label: "<header>" },
    { x: 90, y: 80, w: 280, h: 50, label: "<h1>" },
    { x: 20, y: 150, w: 420, h: 220, label: "<section>" },
    { x: 40, y: 210, w: 85, h: 140, label: "" },
    { x: 140, y: 210, w: 85, h: 140, label: "" },
    { x: 240, y: 210, w: 85, h: 140, label: "" },
    { x: 340, y: 210, w: 85, h: 140, label: "" },
  ];
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {boxes.map((b, i) => {
        const p = progress(frame, at + 14 + i * 7, 12);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              border: `3px solid ${C.ink}`,
              borderRadius: 4,
              opacity: p,
              transform: `translateY(${(1 - p) * -20}px)`,
              fontFamily: MONO,
              fontSize: 20,
              color: C.html,
              padding: "4px 8px",
              boxSizing: "border-box",
            }}
          >
            {b.label}
          </div>
        );
      })}
    </div>
  );
};

/** CSS demo: a plain grey box becomes the number card. */
const CssDemo: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const r = progress(frame, at + 16, 12);
  const border = progress(frame, at + 28, 12);
  const circle = progress(frame, at + 40, 14);
  const numeral = progress(frame, at + 54, 10);
  const word = progress(frame, at + 62, 10);
  const w = 210;
  const h = w / 0.78;
  return (
    <div style={{ position: "absolute", left: "50%", top: "50%", width: w, height: h, transform: "translate(-50%, -50%)" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.white,
          borderRadius: 19 * r,
          border: `${3 + 3 * border}px solid ${border > 0 ? C.red : "#b9c4c1"}`,
          boxShadow: border > 0.5 ? `0 7px 0 ${C.cardFrontShadow}` : undefined,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: QUICKSAND,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 150 * circle,
            height: 150 * circle,
            borderRadius: `${50 * circle}%`,
            background: C.red,
            display: "grid",
            placeItems: "center",
            color: C.white,
            fontSize: 100,
            lineHeight: 1,
          }}
        >
          <span style={{ opacity: numeral, transform: `scale(${0.5 + 0.5 * numeral})` }}>1</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 30, color: C.ink, opacity: word }}>One</div>
      </div>
    </div>
  );
};

/** JS demo: the card flips back and forth by itself. */
const JsDemo: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const t = frame - at - 16;
  const cycle = 50;
  const k = Math.max(0, t) % cycle;
  const n = Math.floor(Math.max(0, t) / cycle);
  const p = EASE_FLIP(Math.min(1, k / 16));
  const angle = t < 0 ? 0 : n % 2 === 0 ? 180 * p : 180 - 180 * p;
  return (
    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
      <NumberCard number={3} width={210} angle={angle} variant="hero" />
    </div>
  );
};

export const Journey: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("journey");
  const htmlAt = c.word("j1", "html") - 4;
  const cssAt = c.word("j2", "css") - 4;
  const jsAt = c.word("j3", "javascript") - 4;
  const act = (from: number, to: number) => interpolate(frame, [from, from + 8, to - 4, to + 6], [0, 1, 1, 0], CLAMP);
  const end = c.duration;
  const out = progress(frame, end - 16, 14, EASE_OUT);

  return (
    <AbsoluteFill>
      <Backdrop count={12} seed={21} speed={0.3} />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 - out * 0.1})`, opacity: 1 - out }}>
        <Tile x={380} at={htmlAt} color={C.html} textColor={C.white} name="HTML" tag="BUILD THE STRUCTURE" active={act(htmlAt, cssAt)}>
          <HtmlDemo at={htmlAt} />
        </Tile>
        <Tile x={960} at={cssAt} color={C.css} textColor={C.white} name="CSS" tag="MAKE IT BEAUTIFUL" active={act(cssAt, jsAt)}>
          <CssDemo at={cssAt} />
        </Tile>
        <Tile x={1540} at={jsAt} color={C.js} textColor={C.ink} name="JAVASCRIPT" tag="BRING IT TO LIFE" active={act(jsAt, end + 20)}>
          <JsDemo at={jsAt} />
        </Tile>
      </div>
      <Sfx name="pop-low" at={htmlAt} />
      <Sfx name="pop" at={cssAt} />
      <Sfx name="pop-high" at={jsAt} />
      {[0, 1, 2].map((n) => (
        <Sfx key={n} name="flip" at={jsAt + 16 + n * 50} volume={0.45} />
      ))}
      <Sfx name="whoosh" at={end - 16} volume={0.6} />
      <AbsoluteFill style={{ background: C.night, opacity: map(frame, [end - 6, end], [0, 1]) }} />
    </AbsoluteFill>
  );
};
