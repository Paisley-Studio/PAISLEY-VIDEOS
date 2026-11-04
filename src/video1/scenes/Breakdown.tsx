import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, Kicker, pop, progress, SceneFade, Sfx } from "../../shared/anim";
import { Cactus, Cloud, Dino, groundStyle, PlayButton } from "../../shared/Game";
import { SpaceKey } from "../../shared/Props";
import { cuesFor } from "../timeline";
import { C, QUICKSAND, SHADOW } from "../../shared/theme";

// The finished game breaks apart into its eight pieces.

const FRAME = { left: 360, top: 300, scale: 1.5 }; // assembled game: 800x300 at 1.5x
const toScreen = (x: number, y: number): [number, number] => [FRAME.left + x * FRAME.scale, FRAME.top + y * FRAME.scale];

// 4 x 2 grid of cards
const CARD_W = 380;
const CARD_H = 300;
const GRID_LEFT = 140;
const GRID_TOP = 200;
const GAP = 40;
const cardCenter = (i: number): [number, number] => [
  GRID_LEFT + (i % 4) * (CARD_W + GAP) + CARD_W / 2,
  GRID_TOP + Math.floor(i / 4) * (CARD_H + GAP) + CARD_H / 2 - 20,
];

type Piece = {
  label: string;
  word: string;
  nth?: number;
  from?: [number, number]; // centre in the assembled game (game coordinates)
  fromScale?: number;
  scale: number;
  render: () => React.ReactNode;
};

const PIECES: Piece[] = [
  { label: "PLAYER", word: "player", from: [82, 224], fromScale: 1.5, scale: 2.6, render: () => <Dino /> },
  {
    label: "WORLD",
    word: "world",
    from: [400, 150],
    fromScale: 1.5,
    scale: 0.36,
    render: () => (
      <div style={{ position: "relative", width: 800, height: 300, background: C.sky, borderRadius: 20, overflow: "hidden", border: `3px solid ${C.ink}` }}>
        <Cloud style={{ position: "absolute", top: 40, left: 520 }} />
        <Cloud width={60} style={{ position: "absolute", top: 90, left: 200 }} />
        <div style={{ position: "absolute", bottom: 0, width: "100%", height: 40, ...groundStyle(0) }} />
      </div>
    ),
  },
  { label: "OBSTACLES", word: "obstacles", from: [532, 235], fromScale: 1.5, scale: 2.6, render: () => <Cactus /> },
  { label: "CONTROLS", word: "controls", scale: 0.85, render: () => <SpaceKey /> },
  {
    label: "SCORE",
    word: "score",
    from: [75, 30],
    fromScale: 1.5,
    scale: 2.2,
    render: () => <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 22, color: C.ink, whiteSpace: "nowrap" }}>Score: 128</div>,
  },
  {
    label: "RULES",
    word: "rules",
    scale: 1,
    render: () => (
      <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, color: C.ink, textAlign: "center", lineHeight: 1.35 }}>
        Jump to survive.
        <br />
        <span style={{ color: C.danger }}>Hit = Game Over.</span>
      </div>
    ),
  },
  {
    label: "GAME OVER",
    word: "game",
    nth: 0,
    scale: 1,
    render: () => (
      <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.ink, padding: "16px 26px", background: "rgba(255,255,255,0.8)", borderRadius: 16, border: `3px solid ${C.ink}` }}>
        Game Over
      </div>
    ),
  },
  { label: "RESTART", word: "restart", scale: 1.7, render: () => <PlayButton /> },
];

export const Breakdown: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = cuesFor("breakdown");

  const explodeAt = cues.word("b3", "smaller");
  const explode = progress(frame, explodeAt, 26, EASE_IN_OUT);
  const gameIn = progress(frame, 0, 20);
  const complicated = progress(frame, cues.word("b2", "complicated"), 30);
  const eight = cues.word("b5", "eight");

  // labels pop one by one as they're spoken
  const labelAt = PIECES.map((piece) => cues.word("b4", piece.word, piece.nth ?? 0));

  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={6}>See the end first</Kicker>

      {/* Assembled game frame (sky + ground), fades as pieces fly out */}
      <div
        style={{
          position: "absolute",
          left: FRAME.left,
          top: FRAME.top,
          width: 800 * FRAME.scale,
          height: 300 * FRAME.scale,
          borderRadius: 20 * FRAME.scale,
          border: `${3 * FRAME.scale}px solid ${C.ink}`,
          background: C.sky,
          overflow: "hidden",
          opacity: gameIn * (1 - explode),
          transform: `scale(${1 + complicated * 0.04 - explode * 0.2})`,
          boxShadow: SHADOW,
        }}
      >
        <div style={{ position: "absolute", bottom: 0, width: "100%", height: 40 * FRAME.scale, ...groundStyle(0) }} />
        <Cloud style={{ position: "absolute", top: 60, left: 760, transform: "scale(1.5)" }} />
        <Cloud width={60} style={{ position: "absolute", top: 135, left: 300, transform: "scale(1.5)" }} />
      </div>

      {/* Card backgrounds */}
      {PIECES.map((piece, i) => {
        const [cx, cy] = cardCenter(i);
        const s = pop(frame, fps, explodeAt + 10 + i * 2, 15);
        return (
          <div
            key={piece.label}
            style={{
              position: "absolute",
              left: cx - CARD_W / 2,
              top: cy - CARD_H / 2 + 20,
              width: CARD_W,
              height: CARD_H,
              borderRadius: 28,
              background: "white",
              boxShadow: SHADOW,
              opacity: Math.min(1, s * 1.5),
              transform: `scale(${0.85 + 0.15 * s})`,
            }}
          />
        );
      })}

      {/* The pieces */}
      {PIECES.map((piece, i) => {
        const [cx, cy] = cardCenter(i);
        const [sx, sy] = piece.from ? toScreen(...piece.from) : [cx, cy];
        const x = interpolate(explode, [0, 1], [sx, cx]);
        const y = interpolate(explode, [0, 1], [sy, cy - 10]);
        const scale = piece.from ? interpolate(explode, [0, 1], [piece.fromScale ?? 1, piece.scale]) : piece.scale * pop(frame, fps, explodeAt + 16 + i * 3);
        const visible = piece.from ? gameIn : 1;
        const pulse = 1 + 0.06 * Math.max(0, Math.sin(Math.max(0, frame - eight) / 4)) * (frame > eight && frame < eight + 26 ? 1 : 0);
        return (
          <div
            key={piece.label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${scale * pulse})`,
              opacity: visible,
            }}
          >
            {piece.render()}
          </div>
        );
      })}

      {/* Labels */}
      {PIECES.map((piece, i) => {
        const [cx, cy] = cardCenter(i);
        return (
          <Appear key={piece.label} at={labelAt[i]} kind="pop" style={{ position: "absolute", left: cx - 150, width: 300, top: cy + 95, textAlign: "center" }}>
            <span
              style={{
                fontFamily: QUICKSAND,
                fontWeight: 700,
                fontSize: 30,
                letterSpacing: 3,
                color: "white",
                background: i % 2 === 0 ? C.dino : C.cactus,
                padding: "8px 22px",
                borderRadius: 999,
              }}
            >
              {piece.label}
            </span>
          </Appear>
        );
      })}

      {/* "8 pieces" badge */}
      <Appear at={eight} kind="pop" style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center" }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 52, color: C.ink }}>
          8 pieces. <span style={{ color: C.inkSoft, fontWeight: 600 }}>That's the whole game.</span>
        </span>
      </Appear>

      {/* Subtle caption while the game is still whole */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 860,
          textAlign: "center",
          fontFamily: QUICKSAND,
          fontWeight: 700,
          fontSize: 56,
          color: C.ink,
          opacity: interpolate(frame, [cues.line("b2"), cues.line("b2") + 12, explodeAt - 6, explodeAt + 4], [0, 1, 1, 0], CLAMP),
        }}
      >
        Looks complicated...
      </div>

      <Sfx at={explodeAt} name="whoosh" volume={0.45} />
      {labelAt.map((at, i) => (
        <Sfx key={i} at={at} name="pop" volume={0.35} />
      ))}
      <Sfx at={eight} name="chime" volume={0.3} />
    </SceneFade>
  );
};
