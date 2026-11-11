import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CLAMP, EASE_IN_OUT, EASE_OUT, map, progress } from "../../lib/anim";
import { simulateGame } from "../../lib/gameSim";
import { GameBrowser, PAGE } from "../../components/GamePage";
import { Cursor, CursorKey } from "../../components/Cursor";
import { Backdrop } from "../../components/Stage";
import { GameSounds, Sfx } from "../../components/Sfx";
import { C } from "../../styles/theme";
import { TL } from "./timeline";

// Medium level (6 pairs), the game's default.
export const REVEAL_DECK = [3, 1, 5, 2, 6, 4, 1, 3, 4, 6, 2, 5];

const BW = 1240; // browser on screen
const BH = 880;
const BX = (1920 - BW) / 2;
const BY = 40;
const ZOOM = 0.64;
const SCROLL = 290;

/** Screen centre of card i (screen px, relative to the browser's top-left). */
const cardCenter = (i: number) => {
  const pageX = PAGE.shellX + 26 + (i % 4) * (PAGE.cardW + PAGE.gap) + PAGE.cardW / 2;
  const pageY = PAGE.gridTop + Math.floor(i / 4) * (PAGE.cardH + PAGE.gap) + PAGE.cardH / 2;
  return { x: (BW - PAGE.width * ZOOM) / 2 + pageX * ZOOM, y: 52 + (pageY - SCROLL) * ZOOM };
};

export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("reveal");
  const t0 = 34;
  const clicks = useMemo(
    () => [
      { f: t0, i: 1 },
      { f: t0 + 22, i: 6 }, // 1 + 1 match
      { f: t0 + 52, i: 0 },
      { f: t0 + 72, i: 2 }, // 3 + 5 miss
      { f: t0 + 112, i: 7 },
      { f: t0 + 130, i: 0 }, // 3 + 3 match
      ...[2, 11, 3, 10, 4, 9, 5, 8].map((i, k) => ({ f: t0 + 170 + k * 14 + (k % 2 ? 0 : 4), i })),
    ],
    [],
  );
  const sim = useMemo(() => simulateGame(REVEAL_DECK, clicks), [clicks]);
  const state = sim.at(frame);

  // camera: browser tilts up from a 3D angle, then a slow push; push on the win
  const enter = progress(frame, 0, 34, EASE_OUT);
  const tilt = interpolate(enter, [0, 1], [24, 0]);
  const win = sim.winFrame ?? 9999;
  const zoomIn = map(frame, [win - 4, win + 30], [1, 1.05], EASE_IN_OUT);
  const scale = interpolate(enter, [0, 1], [0.86, 1]) * interpolate(frame, [0, win], [1, 1.03], CLAMP) * zoomIn;

  // rings on the stats when they change
  const pulse = (fs: number[]) => {
    let v = 0;
    for (const f of fs) v = Math.max(v, interpolate(frame, [f, f + 6, f + 26], [0, 1, 0], CLAMP));
    return v;
  };
  const moveFrames = clicks.filter((_, k) => k % 2 === 1).map((cl) => cl.f);
  const rings = {
    moves: pulse(moveFrames.slice(0, 3)),
    time: pulse([t0 + 34]),
    progress: pulse([t0 + 22, t0 + 130]),
  };

  const keys: CursorKey[] = [{ f: 0, x: BW * 0.75, y: BH * 0.95 }];
  for (const cl of clicks) {
    const p = cardCenter(cl.i);
    keys.push({ f: cl.f - 8, x: p.x + 10, y: p.y + 20 });
    keys.push({ f: cl.f, x: p.x, y: p.y, click: true });
  }

  return (
    <AbsoluteFill>
      <Backdrop count={14} seed={9} speed={0.4} />
      <div
        style={{
          position: "absolute",
          left: BX,
          top: BY,
          width: BW,
          height: BH,
          transformOrigin: "50% 60%",
          transform: `perspective(2200px) rotateX(${tilt}deg) scale(${scale})`,
          opacity: enter,
          boxShadow: `0 16px 0 ${C.night2}`,
          borderRadius: 18,
        }}
      >
        <GameBrowser width={BW} height={BH} zoom={ZOOM} scrollY={interpolate(frame, [6, 30], [120, SCROLL], { ...CLAMP, easing: EASE_IN_OUT })} state={state} rings={rings} overlayScale={1.45}>
          <div style={{ position: "absolute", left: 0, top: -52 }}>
            <Cursor keys={keys} scale={1.1} showFrom={10} hideAt={win} />
          </div>
        </GameBrowser>
      </div>
      <GameSounds sounds={sim.sounds} />
      <Sfx name="whoosh" at={0} volume={0.7} />
      <AbsoluteFill style={{ background: C.night, opacity: map(frame, [c.duration - 10, c.duration], [0, 1]) }} />
    </AbsoluteFill>
  );
};
