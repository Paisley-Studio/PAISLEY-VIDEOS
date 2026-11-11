import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP, EASE_IN_OUT } from "../lib/anim";
import { C } from "../styles/theme";

export type CursorKey = { f: number; x: number; y: number; click?: boolean };

/** Where the cursor is at `frame`, eased between keyframes. */
export const cursorAt = (keys: CursorKey[], frame: number) => {
  if (frame <= keys[0].f) return { x: keys[0].x, y: keys[0].y };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame <= b.f) {
      const p = interpolate(frame, [a.f, b.f], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
      return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p };
    }
  }
  const last = keys[keys.length - 1];
  return { x: last.x, y: last.y };
};

/** A friendly arrow pointer with a click ripple. Coordinates are in the parent's px. */
export const Cursor: React.FC<{ keys: CursorKey[]; scale?: number; showFrom?: number; hideAt?: number }> = ({ keys, scale = 1, showFrom, hideAt }) => {
  const frame = useCurrentFrame();
  const start = showFrom ?? keys[0].f;
  if (frame < start - 8 || (hideAt !== undefined && frame > hideAt + 8)) return null;
  const fadeIn = interpolate(frame, [start - 8, start], [0, 1], CLAMP);
  const fadeOut = hideAt === undefined ? 1 : interpolate(frame, [hideAt, hideAt + 8], [1, 0], CLAMP);
  const { x, y } = cursorAt(keys, frame);
  const lastClick = [...keys].reverse().find((k) => k.click && k.f <= frame);
  const since = lastClick ? frame - lastClick.f : 99;
  const press = since < 6 ? 1 - Math.abs(since - 3) / 3 : 0;
  const ripple = since < 16 ? since / 16 : 1;

  return (
    <div style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: fadeIn * fadeOut }}>
      {since < 16 && (
        <div
          style={{
            position: "absolute",
            left: x - 34 * scale,
            top: y - 34 * scale,
            width: 68 * scale,
            height: 68 * scale,
            borderRadius: "50%",
            border: `${5 * scale}px solid ${C.gold}`,
            transform: `scale(${0.3 + ripple})`,
            opacity: 1 - ripple,
            boxSizing: "border-box",
          }}
        />
      )}
      <svg
        width={44 * scale}
        height={52 * scale}
        viewBox="0 0 22 26"
        style={{ position: "absolute", left: x - 3 * scale, top: y - 2 * scale, transform: `scale(${1 - press * 0.15})`, transformOrigin: "3px 2px" }}
      >
        <path d="M2 2 L2 20 L7 15.5 L10.5 23.5 L14 22 L10.5 14 L17.5 14 Z" fill={C.ink} stroke={C.white} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
