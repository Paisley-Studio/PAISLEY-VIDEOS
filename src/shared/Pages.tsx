import React from "react";
import { Cactus, Cloud, Dino, groundStyle } from "./Game";
import { C, QUICKSAND } from "./theme";

// What the student's page looks like in the browser at each stage of the build.

// ---------------- Video 2: the plain HTML page ----------------

export type PlainParts = {
  title?: boolean;
  score?: boolean;
  area?: boolean;
  pieces?: boolean;
  start?: boolean;
  gameOver?: boolean;
};

/** Unstyled HTML, as the browser shows it before any CSS. */
export const PlainPage: React.FC<{ parts: PlainParts; inspect?: number; outline?: number }> = ({ parts, inspect = 0, outline = 0 }) => (
  <div style={{ padding: 14, fontFamily: QUICKSAND, color: "black", transformOrigin: "top left", transform: "scale(1.55)", width: 400 }}>
    {parts.title ? <div style={{ fontSize: 32, fontWeight: 700, margin: "0 0 18px" }}>Dino Runner</div> : null}
    {parts.score ? <div style={{ fontSize: 16, margin: "0 0 4px" }}>Score: 0</div> : null}
    {parts.area ? (
      <div style={{ position: "relative", minHeight: 8, outline: outline > 0 ? `2px dashed rgba(240,138,75,${outline})` : "none", outlineOffset: 4 }}>
        {parts.pieces ? (
          <div style={{ position: "relative", height: 0 }}>
            {inspect > 0 ? (
              <>
                <div style={{ position: "absolute", left: 0, right: 0, top: -2, height: 4, background: `rgba(74,143,231,${0.8 * inspect})` }} />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    background: "#2b2b2b",
                    color: "white",
                    padding: "3px 8px",
                    borderRadius: 5,
                    opacity: inspect,
                    whiteSpace: "nowrap",
                    zIndex: 5,
                  }}
                >
                  <span style={{ color: "#f4a3d0" }}>div</span>
                  <span style={{ color: "#f5bd4f" }}>#player</span> · 400 × 0
                </div>
              </>
            ) : null}
          </div>
        ) : null}
        {parts.start ? <div style={{ fontSize: 16, margin: "16px 0" }}>Press SPACE to start</div> : null}
        {parts.gameOver ? (
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, margin: "20px 0" }}>Game Over</div>
            <div
              style={{
                display: "inline-block",
                fontFamily: "Arial, sans-serif",
                fontSize: 13,
                padding: "2px 7px",
                border: "1px solid #767676",
                borderRadius: 3,
                background: "#efefef",
              }}
            >
              Play Again
            </div>
          </div>
        ) : null}
      </div>
    ) : null}
  </div>
);

// ---------------- Video 3: the page as CSS is added ----------------

// clouds drift left and come back on the right
const wrap = (x: number) => (((x + 100) % 1000) + 1000) % 1000 - 100;

export type CssStage = {
  page?: boolean; // body + container + h1
  score?: boolean;
  world?: boolean; // game area box
  ground?: boolean;
  player?: boolean;
  eye?: boolean;
  legs?: boolean;
  crashed?: boolean;
  obstacle?: boolean;
  clouds?: boolean;
  messages?: boolean;
  button?: boolean;
  hidden?: boolean; // .hidden works (with !important)
};

export type CssKnobs = {
  sky?: string;
  radius?: number;
  playerWidth?: number;
  playerLeft?: number;
  playerBottom?: number;
  playerColor?: string;
  cloudShift?: number;
  buttonLift?: number;
  groundShift?: number;
};

/** The full page at 900 px wide, drawn with whichever CSS sections exist so far. */
export const StyledPage: React.FC<{ s: CssStage; k?: CssKnobs }> = ({ s, k = {} }) => {
  const sky = k.sky ?? C.sky;
  const radius = k.radius ?? 20;
  const playerColor = k.playerColor ?? C.dino;
  const showGameOver = !s.hidden;
  return (
    <div
      style={{
        width: 900,
        minHeight: 560,
        padding: s.page ? "40px 50px" : 10,
        boxSizing: "border-box",
        background: s.page ? C.canvas : "white",
        fontFamily: QUICKSAND,
        color: s.page ? C.ink : "black",
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 700, margin: s.page ? "0 0 8px" : "0 0 18px" }}>Dino Runner</div>
      <div style={{ fontSize: s.score ? 20 : 16, fontWeight: s.score ? 700 : 400, margin: s.score ? "0 0 12px" : "0 0 4px" }}>Score: 0</div>

      <div
        style={
          s.world
            ? { position: "relative", height: 300, background: sky, border: `3px solid ${C.ink}`, borderRadius: radius, overflow: "hidden" }
            : { position: "relative" }
        }
      >
        {s.clouds ? (
          <>
            <Cloud style={{ position: "absolute", top: 40, left: wrap(520 - (k.cloudShift ?? 0)) }} />
            <Cloud width={60} style={{ position: "absolute", top: 90, left: wrap(220 - (k.cloudShift ?? 0) * 0.7) }} />
          </>
        ) : null}
        {s.player ? (
          s.eye || s.legs ? (
            <Dino
              color={s.crashed ? C.danger : playerColor}
              showEye={!!s.eye}
              showLegs={!!s.legs}
              style={{ position: "absolute", left: k.playerLeft ?? 60, bottom: k.playerBottom ?? 50, width: k.playerWidth ?? 44, zIndex: 2 }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                left: k.playerLeft ?? 60,
                bottom: k.playerBottom ?? 50,
                width: k.playerWidth ?? 44,
                height: 52,
                background: playerColor,
                borderRadius: "14px 18px 6px 6px",
              }}
            />
          )
        ) : null}
        {s.obstacle ? <Cactus style={{ position: "absolute", left: 600, bottom: 40 }} /> : null}
        {s.ground ? <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 40, ...groundStyle(k.groundShift ?? 0) }} /> : null}

        {s.messages ? (
          <>
            <div style={{ position: "absolute", top: "35%", width: "100%", textAlign: "center", fontSize: 22, fontWeight: 700 }}>Press SPACE to start</div>
            {showGameOver ? (
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
                <PageButton styled={!!s.button} lift={k.buttonLift ?? 0} />
              </div>
            ) : null}
          </>
        ) : (
          <div style={{ position: "relative", padding: s.world ? 10 : 0 }}>
            <div style={{ fontSize: 16, margin: "16px 0" }}>Press SPACE to start</div>
            {showGameOver ? (
              <>
                <div style={{ fontSize: 24, fontWeight: 700, margin: "20px 0" }}>Game Over</div>
                <PageButton styled={!!s.button} lift={k.buttonLift ?? 0} />
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

const PageButton: React.FC<{ styled: boolean; lift: number }> = ({ styled, lift }) =>
  styled ? (
    <div
      style={{
        display: "inline-block",
        padding: "12px 28px",
        fontSize: 18,
        fontWeight: 700,
        color: C.ink,
        background: C.accent,
        borderRadius: 999,
        transform: `translateY(${-lift}px)`,
        boxShadow: lift > 0 ? "0 6px 12px rgba(0,0,0,0.12)" : "none",
      }}
    >
      Play Again
    </div>
  ) : (
    <div
      style={{
        display: "inline-block",
        fontFamily: "Arial, sans-serif",
        fontSize: 13,
        padding: "2px 7px",
        border: "1px solid #767676",
        borderRadius: 3,
        background: "#efefef",
        color: "black",
      }}
    >
      Play Again
    </div>
  );

/** Scales a fixed-size page into a box. */
export const Fit: React.FC<{ width: number; pageWidth?: number; children: React.ReactNode }> = ({ width, pageWidth = 900, children }) => (
  <div style={{ width: pageWidth, transformOrigin: "top left", transform: `scale(${width / pageWidth})` }}>{children}</div>
);
