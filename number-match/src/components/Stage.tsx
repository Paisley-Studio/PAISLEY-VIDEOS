import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { rnd } from "../lib/anim";
import { C } from "../styles/theme";

/**
 * Deep forest-green stage with flat card silhouettes drifting on three
 * parallax layers. Depth comes from scale and speed, not blur or gradients.
 */
export const Backdrop: React.FC<{ count?: number; seed?: number; speed?: number; push?: number; opacity?: number }> = ({
  count = 18,
  seed = 1,
  speed = 1,
  push = 0,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.night, overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => {
        const layer = i % 3; // 0 far, 1 mid, 2 near
        const scale = [0.32, 0.5, 0.72][layer] * (1 + push * (layer + 1) * 0.08);
        const w = 247 * scale;
        const h = w / 0.78;
        const x0 = rnd(seed * 100 + i) * 2200 - 140;
        const y0 = rnd(seed * 200 + i) * 1300 - 110;
        const drift = (frame * speed * [0.15, 0.3, 0.5][layer]) % 2400;
        const x = ((x0 - drift + 2600) % 2400) - 240;
        const y = y0 + Math.sin(frame / 70 + i) * 10 * (layer + 1);
        const rot = (rnd(seed * 300 + i) - 0.5) * 30 + Math.sin(frame / 90 + i) * 3;
        const fill = [C.night2, C.night2, C.night3][layer];
        const line = [C.night3, C.nightLine, C.nightLine][layer];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: 19 * scale,
              background: fill,
              border: `${Math.max(2, 5 * scale)}px solid ${line}`,
              transform: `rotate(${rot}deg)`,
              display: "grid",
              placeItems: "center",
              opacity,
            }}
          >
            <div style={{ width: 55 * scale, height: 55 * scale, borderRadius: "50%", border: `${Math.max(2, 3 * scale)}px solid ${line}` }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Flat confetti/sparks bursting from a point. `t` = frames since the burst. */
export const Sparks: React.FC<{ x: number; y: number; t: number; count?: number; spread?: number; seed?: number }> = ({ x, y, t, count = 16, spread = 260, seed = 3 }) => {
  if (t < 0 || t > 40) return null;
  const p = t / 40;
  const ease = 1 - Math.pow(1 - p, 3);
  const colors = [C.gold, C.red, C.mint, C.white];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2 + rnd(seed + i) * 0.4;
        const d = spread * (0.6 + rnd(seed * 7 + i) * 0.5) * ease;
        const size = (10 + rnd(seed * 11 + i) * 12) * (1 - p);
        const diamond = i % 2 === 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * d - size / 2,
              top: y + Math.sin(a) * d - size / 2 + 60 * p * p,
              width: size,
              height: size,
              background: colors[i % colors.length],
              borderRadius: diamond ? 3 : "50%",
              transform: diamond ? `rotate(${45 + t * 6}deg)` : undefined,
            }}
          />
        );
      })}
    </>
  );
};
