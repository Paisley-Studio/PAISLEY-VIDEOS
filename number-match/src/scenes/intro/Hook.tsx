import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_FLIP, EASE_IN_OUT, EASE_OUT, map, pop, progress } from "../../lib/anim";
import { NumberCard } from "../../components/NumberCard";
import { Backdrop, Sparks } from "../../components/Stage";
import { Sfx } from "../../components/Sfx";
import { C, QUICKSAND } from "../../styles/theme";
import { TL } from "./timeline";

const W = 300; // hero card width
const H = W / 0.78;

/** Card flip angle that starts at `at` and lasts `dur` frames. */
const flipAngle = (frame: number, at: number, dur = 22) => 180 * EASE_FLIP(Math.max(0, Math.min(1, (frame - at) / dur)));

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("hook");

  // --- timing, all keyed to the narration
  const aIn = 8;
  const aFlip = 64;
  const matchF = c.word("h1", "match");
  const bIn = c.word("h1", "think") - 6;
  const bFlip = matchF - 20;
  const gridAt = c.word("h2", "build");
  const h3 = c.line("h3");
  const creator = c.word("h3", "game");

  // --- camera: slow push-in over the whole scene
  const push = interpolate(frame, [0, c.duration], [1, 1.08], CLAMP);

  // --- the hero pair
  const aAppear = progress(frame, aIn, 50, EASE_OUT);
  const bAppear = progress(frame, bIn, 26, EASE_OUT);
  const together = progress(frame, matchF + 4, 18, EASE_IN_OUT);
  const matched = frame >= matchF + 2;
  const gap = interpolate(together, [0, 1], [230, 168]);
  const pairUp = progress(frame, gridAt - 18, 30, EASE_IN_OUT); // pair joins the grid
  const backAway = progress(frame, h3 - 6, 26, EASE_IN_OUT);

  // grid of 8 (2 rows x 4): the pair takes slots 1 and 2 in the top row
  const slotW = 190;
  const slotH = slotW / 0.78;
  const slot = (i: number) => ({ x: (i % 4) * (slotW + 26) - 1.5 * (slotW + 26), y: Math.floor(i / 4) * (slotH + 26) - 0.5 * (slotH + 26) });
  const pairScale = interpolate(pairUp, [0, 1], [1, slotW / W]);
  const ax = interpolate(pairUp, [0, 1], [-gap, slot(1).x]);
  const bx = interpolate(pairUp, [0, 1], [gap, slot(2).x]);
  const pairY = interpolate(pairUp, [0, 1], [0, slot(1).y]);

  const others = [0, 3, 4, 5, 6, 7];
  const otherNumbers: Record<number, number> = { 0: 4, 3: 2, 4: 3, 5: 6, 6: 2, 7: 5 };
  const otherFlips: Record<number, number> = { 3: 26, 6: 44 }; // two of them show a 2-2 match

  const groupScale = interpolate(backAway, [0, 1], [1, 0.5]);
  const groupY = interpolate(backAway, [0, 1], [0, 250]);

  // --- kinetic text
  const t1 = progress(frame, h3 + 34, 16);
  const t2 = pop(frame, fps, creator, 11);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${push})` }}>
        <Backdrop count={20} seed={4} speed={0.6} opacity={interpolate(frame, [0, 45], [0, 1], CLAMP)} />

        <div style={{ position: "absolute", left: 960, top: 470, transform: `translateY(${groupY}px) scale(${groupScale})` }}>
          {/* the rest of the grid deals in */}
          {others.map((i, k) => {
            const at = gridAt + k * 4;
            const s = pop(frame, fps, at, 13);
            if (frame < at) return null;
            const fl = otherFlips[i] !== undefined ? flipAngle(frame, gridAt + otherFlips[i]) : 0;
            const p = slot(i);
            return (
              <div key={i} style={{ position: "absolute", left: p.x - slotW / 2, top: p.y - slotH / 2, transform: `translateY(${(1 - s) * 80}px) scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 1.5) }}>
                <NumberCard number={otherNumbers[i]} width={slotW} angle={fl} variant="hero" matched={frame >= gridAt + 44 + 20 && fl > 0} />
              </div>
            );
          })}

          {/* card A */}
          <div
            style={{
              position: "absolute",
              left: ax - W / 2,
              top: pairY - H / 2,
              opacity: aAppear,
              transform: `translateZ(0) scale(${(0.35 + 0.65 * aAppear) * pairScale}) rotate(${(1 - aAppear) * -14}deg)`,
            }}
          >
            <NumberCard number={1} width={W} angle={flipAngle(frame, aFlip, 26) + (1 - aAppear) * -40} variant="hero" matched={matched} />
          </div>
          {/* card B */}
          {frame >= bIn && (
            <div
              style={{
                position: "absolute",
                left: bx - W / 2 + (1 - bAppear) * 700,
                top: pairY - H / 2,
                opacity: bAppear,
                transform: `scale(${pairScale}) rotate(${(1 - bAppear) * 12}deg)`,
              }}
            >
              <NumberCard number={1} width={W} angle={flipAngle(frame, bFlip, 22)} variant="hero" matched={matched} />
            </div>
          )}
          <Sparks x={0} y={0} t={frame - matchF} count={18} spread={330} />
        </div>

        {/* kinetic type */}
        {frame >= h3 + 34 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700 }}>
            <div style={{ color: C.mint, fontSize: 46, letterSpacing: "0.12em", opacity: t1, transform: `translateY(${(1 - t1) * 20}px)` }}>YOU ARE ABOUT TO BECOME A</div>
            <div
              style={{
                marginTop: 6,
                color: C.gold,
                fontSize: 150,
                lineHeight: 1.05,
                letterSpacing: "0.02em",
                transform: `scale(${0.5 + 0.5 * t2})`,
                opacity: Math.min(1, t2 * 1.5),
                textShadow: `0 8px 0 ${C.goldDark}`,
              }}
            >
              GAME CREATOR
            </div>
          </div>
        )}
      </div>

      {/* sound */}
      <Sfx name="ambient" at={0} />
      <Sfx name="whoosh" at={aIn + 4} volume={0.8} />
      <Sfx name="flip" at={aFlip} />
      <Sfx name="whoosh-short" at={bIn} />
      <Sfx name="flip" at={bFlip} />
      <Sfx name="match" at={matchF} />
      <Sfx name="sparkle" at={matchF + 2} />
      {others.map((i, k) => (
        <Sfx key={i} name="pop" at={gridAt + k * 4} volume={0.5} />
      ))}
      <Sfx name="flip" at={gridAt + 26} volume={0.7} />
      <Sfx name="flip" at={gridAt + 44} volume={0.7} />
      <Sfx name="match" at={gridAt + 64} volume={0.6} />
      <Sfx name="whoosh" at={h3 - 6} volume={0.6} />
      <Sfx name="pop-high" at={creator} />
      <Sfx name="sparkle" at={creator + 4} />
      {/* fade to the next scene */}
      <AbsoluteFill style={{ background: C.night, opacity: map(frame, [c.duration - 10, c.duration], [0, 1]) }} />
    </AbsoluteFill>
  );
};


