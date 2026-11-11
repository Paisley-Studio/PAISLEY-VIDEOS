import React from "react";
import { Img, staticFile } from "remotion";
import { C, QUICKSAND } from "../styles/theme";

/** The Number Match logotype (from the game header: red N tile + NUMBERMATCH). */
export const NumberMatchLogo: React.FC<{ size?: number; dark?: boolean; reveal?: number }> = ({ size = 1, dark = true, reveal = 1 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 26 * size, fontFamily: QUICKSAND, fontWeight: 700 }}>
    <div
      style={{
        width: 120 * size,
        height: 120 * size,
        borderRadius: 34 * size,
        background: C.red,
        color: C.white,
        display: "grid",
        placeItems: "center",
        fontSize: 78 * size,
        boxShadow: `0 ${10 * size}px 0 ${C.redDark}`,
        transform: `scale(${reveal})`,
      }}
    >
      N
    </div>
    <div style={{ fontSize: 104 * size, letterSpacing: "0.03em", lineHeight: 1, color: dark ? C.white : C.green, clipPath: `inset(-20% ${(1 - reveal) * 100}% -20% 0)` }}>
      NUMBER<span style={{ color: C.red, marginLeft: 10 * size }}>MATCH</span>
    </div>
  </div>
);

/** The Paisley Studio badge (cropped from the supplied wooden badge logo). */
export const PaisleyBadge: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img src={staticFile("branding/paisley-badge.png")} style={{ width: size, height: size, ...style }} />
);

/** Small lower-corner bug used during lessons. */
export const LessonBug: React.FC<{ lesson: number; title: string; color: string }> = ({ lesson, title, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: QUICKSAND, fontWeight: 700 }}>
    <div style={{ background: color, color: color === C.gold ? C.ink : C.white, borderRadius: 10, padding: "6px 14px", fontSize: 22 }}>LESSON {lesson}</div>
    <div style={{ color: C.white, fontSize: 24 }}>{title}</div>
  </div>
);
