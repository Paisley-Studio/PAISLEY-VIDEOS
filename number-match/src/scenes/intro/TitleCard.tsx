import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_OUT, map, pop, progress } from "../../lib/anim";
import { NumberMatchLogo, PaisleyBadge } from "../../components/Brand";
import { NumberCard } from "../../components/NumberCard";
import { Backdrop } from "../../components/Stage";
import { Sfx } from "../../components/Sfx";
import { C, QUICKSAND } from "../../styles/theme";
import { TL } from "./timeline";

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("title");
  const logo = pop(frame, fps, 6, 12);
  const wipe = progress(frame, 12, 22, EASE_OUT);
  const tag = progress(frame, 36, 16);
  const badge = pop(frame, fps, 52, 14);
  const next = progress(frame, 70, 16);
  const fadeOut = map(frame, [c.duration - 14, c.duration], [0, 1]);

  return (
    <AbsoluteFill>
      <Backdrop count={14} seed={47} speed={0.25} />
      {/* fan of cards behind the logo */}
      {[1, 2, 3, 4, 5, 6].map((n, i) => {
        const s = pop(frame, fps, 2 + i * 3, 14);
        const a = (i - 2.5) * 17;
        return (
          <div
            key={n}
            style={{
              position: "absolute",
              left: 960 - 95,
              top: 350,
              transformOrigin: "50% 240%",
              transform: `rotate(${a * s}deg) translateY(${(1 - s) * 200 - 70}px)`,
              opacity: Math.min(1, s * 1.4),
            }}
          >
            <NumberCard number={n} width={190} angle={180} variant="hero" />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 585, display: "flex", justifyContent: "center" }}>
        <div style={{ background: C.night, padding: "26px 44px", borderRadius: 34, border: `4px solid ${C.nightLine}`, transform: `scale(${0.6 + 0.4 * logo})`, opacity: Math.min(1, logo * 1.5) }}>
          <NumberMatchLogo size={0.9} reveal={wipe} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 46, color: C.mint, letterSpacing: "0.04em", opacity: tag, transform: `translateY(${(1 - tag) * 16}px)` }}>
        Imagine it. Build it. <span style={{ color: C.gold }}>Play it.</span>
      </div>
      <div style={{ position: "absolute", left: 70, bottom: 60, display: "flex", alignItems: "center", gap: 20, transform: `scale(${badge})`, transformOrigin: "0 100%" }}>
        <PaisleyBadge size={150} />
      </div>
      <div
        style={{
          position: "absolute",
          right: 70,
          bottom: 90,
          fontFamily: QUICKSAND,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: next,
          transform: `translateX(${(1 - next) * 40}px)`,
        }}
      >
        <span style={{ background: C.gold, color: C.ink, borderRadius: 10, padding: "8px 16px", fontSize: 24, letterSpacing: "0.08em" }}>NEXT</span>
        <span style={{ color: C.white, fontSize: 32 }}>
          Lesson 2 · <span style={{ color: C.html }}>HTML</span>: Building the Foundation
        </span>
      </div>
      <Sfx name="sting" at={4} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut * interpolate(frame, [0, 1], [1, 1], CLAMP) }} />
    </AbsoluteFill>
  );
};
