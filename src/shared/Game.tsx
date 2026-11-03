import React from "react";
import { C, QUICKSAND } from "./theme";

// A frame-driven recreation of the course's Dino Runner (same look as style.css).
// Everything is computed from a time value, so the footage is deterministic.

export const GW = 800;
export const GH = 300;
const GROUND = 40;
const DINO_X = 60;
const DINO_W = 44;
const DINO_H = 52;
const DINO_BOTTOM = 50;
const CACTUS_W = 24;

const V0 = 380; // px per second
const V1 = 470; // after reaching 100 points
const SCORE_RATE = 9; // points per second
const SPEEDUP_AT = 100 / SCORE_RATE; // run-time when speed increases
const JUMP_V = 900;
const GRAVITY = 2880;
const AIR_TIME = (2 * JUMP_V) / GRAVITY;

// ---- The scripted cold-open run ----
export const RUN1_START = 0.7;
const RUN1_ARRIVALS = [2.1, 3.7, 5.3, 6.9, 8.6, 10.2, 12.0, 13.3, 14.6];
const RUN1_CRASH_INDEX = 8;
export const RESTART_AT = 17.6;
const RUN2_ARRIVALS = [1.25, 2.9];
const JUMP_LEAD = AIR_TIME / 2;

const distance = (t: number) => (t < SPEEDUP_AT ? V0 * t : V0 * SPEEDUP_AT + V1 * (t - SPEEDUP_AT));

const crashTime = (() => {
  const w = distance(RUN1_ARRIVALS[RUN1_CRASH_INDEX]);
  let t = RUN1_ARRIVALS[RUN1_CRASH_INDEX] - 0.6;
  while (DINO_X + (w - distance(t)) > DINO_X + DINO_W - 8) t += 1 / 600;
  return t;
})();

export const CRASH_AT = RUN1_START + crashTime;
/** The moment we freeze on: run 2, mid-jump over the first cactus */
export const FREEZE_AT = RESTART_AT + RUN2_ARRIVALS[0] - 0.02;
export const SPEEDUP_ABS = RUN1_START + SPEEDUP_AT;

/** Absolute times (seconds) when the dino starts a jump */
export const JUMP_TIMES = [
  ...RUN1_ARRIVALS.filter((_, i) => i !== RUN1_CRASH_INDEX).map((a) => RUN1_START + a - JUMP_LEAD),
  ...RUN2_ARRIVALS.map((a) => RESTART_AT + a - JUMP_LEAD),
];

export type GameState = {
  dinoY: number;
  obstacles: number[]; // screen x of each visible cactus
  score: number;
  running: boolean;
  crashed: boolean;
  gameOver: boolean;
  showStart: boolean;
  groundOffset: number;
  cloudOffset: number;
  legPhase: number;
  fast: boolean;
};

const runState = (rt: number, arrivals: number[], crashIndex: number | null): Omit<GameState, "gameOver" | "showStart" | "running"> => {
  const d = distance(rt);
  const obstacles = arrivals
    .map((a) => DINO_X + (distance(a) - d))
    .filter((x) => x > -60 && x < GW + 60);
  let dinoY = 0;
  arrivals.forEach((a, i) => {
    if (i === crashIndex) return;
    const tau = rt - (a - JUMP_LEAD);
    if (tau > 0 && tau < AIR_TIME) dinoY = JUMP_V * tau - (GRAVITY * tau * tau) / 2;
  });
  return {
    dinoY,
    obstacles,
    score: Math.floor(rt * SCORE_RATE),
    crashed: false,
    groundOffset: d % 40,
    cloudOffset: rt * 24,
    legPhase: Math.floor(rt * 10) % 2,
    fast: rt >= SPEEDUP_AT,
  };
};

export const gameStateAt = (t: number): GameState => {
  if (t < RUN1_START) {
    return {
      ...runState(0, RUN1_ARRIVALS, RUN1_CRASH_INDEX),
      running: false,
      gameOver: false,
      showStart: true,
      legPhase: 0,
    };
  }
  if (t < RESTART_AT) {
    const rt = Math.min(t - RUN1_START, crashTime);
    const crashed = t - RUN1_START >= crashTime;
    return {
      ...runState(rt, RUN1_ARRIVALS, RUN1_CRASH_INDEX),
      running: !crashed,
      crashed,
      gameOver: crashed,
      showStart: false,
      legPhase: crashed ? 0 : Math.floor((t - RUN1_START) * 10) % 2,
    };
  }
  const rt = t - RESTART_AT;
  return { ...runState(rt, RUN2_ARRIVALS, null), running: true, gameOver: false, showStart: false };
};

// ---------- Visual pieces (reused in the breakdown scene) ----------

export const Dino: React.FC<{
  crashed?: boolean;
  legPhase?: number;
  color?: string;
  showEye?: boolean;
  showLegs?: boolean;
  style?: React.CSSProperties;
}> = ({ crashed = false, legPhase = 0, color: baseColor = C.dino, showEye = true, showLegs = true, style }) => {
  const color = crashed ? C.danger : baseColor;
  const legH = legPhase === 1 ? 6 : 10;
  return (
    <div style={{ position: "relative", width: DINO_W, height: DINO_H, ...style }}>
      <div style={{ position: "absolute", inset: 0, background: color, borderRadius: "14px 18px 6px 6px" }} />
      <div
        style={{
          display: showEye ? "block" : "none",
          position: "absolute",
          top: 10,
          right: 8,
          width: 8,
          height: 8,
          background: C.ink,
          border: "3px solid white",
          borderRadius: "50%",
        }}
      />
      <div style={{ display: showLegs ? "block" : "none", position: "absolute", bottom: -legH, left: 8, width: 8, height: legH, background: color, borderRadius: "0 0 3px 3px" }} />
      <div style={{ display: showLegs ? "block" : "none", position: "absolute", bottom: -(legPhase === 1 ? 10 : 6), left: 28, width: 8, height: legPhase === 1 ? 10 : 6, background: color, borderRadius: "0 0 3px 3px" }} />
    </div>
  );
};

export const Cactus: React.FC<{ style?: React.CSSProperties; color?: string }> = ({ style, color = C.cactus }) => (
  <div style={{ position: "relative", width: CACTUS_W, height: 50, ...style }}>
    <div style={{ position: "absolute", inset: 0, background: color, borderRadius: "12px 12px 4px 4px" }} />
    <div style={{ position: "absolute", left: -10, top: 14, width: 10, height: 18, background: color, borderRadius: "6px 0 0 6px" }} />
    <div style={{ position: "absolute", right: -10, top: 8, width: 10, height: 16, background: color, borderRadius: "0 6px 6px 0" }} />
  </div>
);

export const Cloud: React.FC<{ width?: number; style?: React.CSSProperties }> = ({ width = 90, style }) => (
  <div style={{ width, height: 28, background: "white", borderRadius: 20, opacity: 0.95, ...style }} />
);

export const groundStyle = (offset: number, color: string = C.ground): React.CSSProperties => ({
  backgroundColor: color,
  backgroundImage:
    "repeating-linear-gradient(90deg, transparent 0px, transparent 30px, rgba(255,255,255,0.2) 30px, rgba(255,255,255,0.2) 40px)",
  backgroundPosition: `${-offset}px 0`,
});

export const PlayButton: React.FC<{ pressed?: boolean; style?: React.CSSProperties }> = ({ pressed = false, style }) => (
  <div
    style={{
      padding: "12px 28px",
      fontFamily: QUICKSAND,
      fontSize: 18,
      fontWeight: 700,
      color: C.ink,
      background: C.accent,
      borderRadius: 999,
      transform: pressed ? "scale(0.92)" : "none",
      display: "inline-block",
      ...style,
    }}
  >
    Play Again
  </div>
);

/** The full game, as students will build it, drawn at its real 800x300 size. */
export type Palette = { sky: string; ground: string; dino: string; cactus: string; text: string };
export const CLASSIC: Palette = { sky: C.sky, ground: C.ground, dino: C.dino, cactus: C.cactus, text: C.ink };
export const JUNGLE: Palette = { sky: "#b7e0a5", ground: "#4a3222", dino: "#e9c46a", cactus: "#6b3e26", text: "#13281c" };

export const GameView: React.FC<{
  state: GameState;
  buttonPressed?: boolean;
  showHeader?: boolean;
  palette?: Palette;
  best?: number;
  showSpeed?: boolean;
}> = ({ state, buttonPressed = false, showHeader = true, palette = CLASSIC, best, showSpeed = true }) => (
  <div style={{ width: GW, fontFamily: QUICKSAND, color: palette.text }}>
    {showHeader ? (
      <>
        <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Dino Runner</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
          <span>Score: {state.score}</span>
          {state.fast && showSpeed ? <span style={{ color: C.dino }}>Speed up!</span> : null}
          {best !== undefined ? <span>Best: {best}</span> : null}
        </div>
      </>
    ) : null}
    <div
      style={{
        position: "relative",
        height: GH,
        background: palette.sky,
        border: `3px solid ${palette.text}`,
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <Cloud style={{ position: "absolute", top: 40, left: ((620 - state.cloudOffset) % 900 + 900) % 900 - 100 }} />
      <Cloud width={60} style={{ position: "absolute", top: 90, left: ((280 - state.cloudOffset * 0.7) % 900 + 900) % 900 - 100 }} />
      <Dino
        color={palette.dino}
        crashed={state.crashed}
        legPhase={state.dinoY > 0 ? 0 : state.legPhase}
        style={{ position: "absolute", left: DINO_X, bottom: DINO_BOTTOM + state.dinoY, zIndex: 2 }}
      />
      {state.obstacles.map((x, i) => (
        <Cactus key={i} color={palette.cactus} style={{ position: "absolute", left: x, bottom: GROUND }} />
      ))}
      <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: GROUND, ...groundStyle(state.groundOffset, palette.ground) }} />
      {state.showStart ? (
        <div style={{ position: "absolute", top: "35%", width: "100%", textAlign: "center", fontSize: 22, fontWeight: 700 }}>
          Press SPACE to start
        </div>
      ) : null}
      {state.gameOver ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(255,255,255,0.75)",
            zIndex: 3,
          }}
        >
          <div style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>Game Over</div>
          <PlayButton pressed={buttonPressed} />
        </div>
      ) : null}
    </div>
  </div>
);
