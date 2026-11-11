import React from "react";
import { C, QUICKSAND } from "../styles/theme";
import { formatTime, GameState } from "../lib/gameSim";
import { NumberCard } from "./NumberCard";

/** Page coordinates (px at 1x) of the styled page, for camera targeting. */
export const PAGE = {
  width: 1280,
  shellX: 100,
  shellW: 1080,
  topbarH: 82,
  heroTop: 82,
  panelTop: 300,
  statsTop: 410,
  progressTop: 474,
  gridTop: 504,
  cardW: 246.75,
  gap: 15,
  cardH: 246.75 / 0.78,
  gridHeight: (rows: number) => rows * (246.75 / 0.78) + (rows - 1) * 15,
  pageHeight: (rows: number) => 504 + rows * (246.75 / 0.78) + (rows - 1) * 15 + 20 + 42 + 26 + 72,
};

const label: React.CSSProperties = { letterSpacing: "0.13em", fontSize: 10, fontWeight: 700 };

export const emptyState = (totalPairs = 6): GameState => ({
  cards: [],
  moves: 0,
  matchedPairs: 0,
  totalPairs,
  seconds: 0,
  message: "Choose any card to begin!",
  progress: 0,
  winOverlay: 0,
  firstCard: null,
  secondCard: null,
  locked: false,
});

const levelName = (pairs: number) => (pairs === 4 ? "Easy · 4 pairs" : pairs === 8 ? "Challenge · 8 pairs" : "Medium · 6 pairs");

/** The finished, styled Number Match page (course-project/index.html + style.css). */
export const GamePage: React.FC<{
  state: GameState;
  /** highlight a region with a pulse ring: 0..1 */
  rings?: Partial<Record<"topbar" | "panel" | "shell" | "stats" | "moves" | "matched" | "time" | "progress" | "grid" | "message" | "toolbar" | "heading", number>>;
  cardTransform?: (index: number) => string | undefined;
  /** override colours (used for the "change --red" demos) */
  red?: string;
}> = ({ state, rings = {}, cardTransform, red = C.red }) => {
  const rows = Math.ceil(state.cards.length / 4) || 3;
  const ring = (k: keyof NonNullable<typeof rings>): React.CSSProperties =>
    rings[k] ? { outline: `${4}px solid ${C.gold}`, outlineOffset: 6, boxShadow: `0 0 0 ${10 * rings[k]!}px rgba(255,194,61,${0.35 * rings[k]!})` } : {};

  return (
    <div style={{ width: PAGE.width, minHeight: PAGE.pageHeight(rows), background: C.page, color: C.ink, fontFamily: QUICKSAND, position: "relative" }}>
      <div style={{ width: PAGE.shellW, margin: "0 auto", ...ring("shell") }}>
        {/* header */}
        <div style={{ height: PAGE.topbarH, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `2px solid ${C.mint}`, boxSizing: "border-box", ...ring("topbar") }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: C.green, fontWeight: 700, letterSpacing: "0.04em", fontSize: 15 }}>
            <span style={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 11, background: red, color: C.white, fontSize: 20, fontWeight: 700 }}>N</span>
            <span>
              NUMBER<span style={{ color: red, marginLeft: 3 }}>MATCH</span>
            </span>
          </div>
          <span style={{ ...label, color: C.muted }}>A MEMORY CHALLENGE</span>
        </div>
        {/* hero */}
        <div style={{ height: PAGE.panelTop - PAGE.heroTop, boxSizing: "border-box", textAlign: "center", padding: "42px 12px 28px" }}>
          <p style={{ ...label, color: red, margin: "0 0 10px" }}>THINK • FLIP • MATCH</p>
          <h1 style={{ margin: 0, color: C.green, fontSize: 58, lineHeight: 1.05, fontWeight: 700, letterSpacing: "-0.04em", display: "inline-block", ...ring("heading") }}>
            Ready to <span style={{ color: red }}>match?</span>
          </h1>
          <p style={{ maxWidth: 560, margin: "14px auto 0", color: C.muted, lineHeight: 1.65, fontSize: 15, fontWeight: 600 }}>
            Turn over two cards. Find the numbers that belong together. How good is your memory?
          </p>
        </div>
        {/* panel */}
        <div style={{ background: C.white, border: `2px solid ${C.mint}`, borderRadius: 24, padding: 24, ...ring("panel") }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 14, marginBottom: 20, height: 66, ...ring("toolbar") }}>
            <div style={{ display: "grid", gap: 7 }}>
              <span style={{ ...label, color: C.muted }}>CHOOSE YOUR CHALLENGE</span>
              <div style={{ minWidth: 190, padding: "11px 38px 11px 13px", border: `2px solid ${C.mint}`, borderRadius: 11, color: C.green, fontWeight: 700, fontSize: 16, position: "relative" }}>
                {levelName(state.totalPairs)}
                <span style={{ position: "absolute", right: 14, top: 10, fontSize: 14 }}>▾</span>
              </div>
            </div>
            <div style={{ borderRadius: 11, padding: "11px 16px", background: C.green, color: C.white, fontWeight: 700, fontSize: 16 }}>
              <span style={{ fontSize: 19, marginRight: 4 }}>↻</span> Restart
            </div>
          </div>
          {/* stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14, ...ring("stats") }}>
            {[
              ["MOVES", String(state.moves), "moves"],
              ["MATCHED", null, "matched"],
              ["TIME", formatTime(state.seconds), "time"],
            ].map(([name, value, key]) => (
              <div key={name} style={{ padding: "12px 15px", background: C.page, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "space-between", height: 50, boxSizing: "border-box", ...ring(key as "moves") }}>
                <span style={{ ...label, color: C.muted }}>{name}</span>
                <strong style={{ color: C.green, fontSize: 20, fontWeight: 700 }}>
                  {value ?? (
                    <>
                      {state.matchedPairs} <small style={{ fontSize: 12, color: C.muted }}>/ {state.totalPairs}</small>
                    </>
                  )}
                </strong>
              </div>
            ))}
          </div>
          {/* progress */}
          <div style={{ height: 8, background: C.mint, borderRadius: 20, overflow: "hidden", marginBottom: 22, ...ring("progress") }}>
            <div style={{ height: "100%", width: `${state.progress * 100}%`, background: red, borderRadius: 20 }} />
          </div>
          {/* grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: PAGE.gap, minHeight: state.cards.length ? undefined : 40, ...ring("grid") }}>
            {state.cards.map((c, i) => (
              <NumberCard key={i} number={c.number} width={PAGE.cardW} angle={c.angle} matched={c.matched} wrong={c.wrong} transform={cardTransform?.(i)} />
            ))}
          </div>
          {/* message */}
          <div style={{ minHeight: 42, marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, color: C.muted, fontSize: 13, fontWeight: 700, ...ring("message") }}>
            <span style={{ width: 10, height: 10, background: red, borderRadius: "50%" }} />
            <span>{state.message}</span>
          </div>
        </div>
        {/* footer */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "22px 4px 28px", color: C.muted, ...label, fontSize: 9 }}>
          <span>PAISLEY STUDIO · LEARN BY CREATING</span>
          <span>Every flip brings you closer.</span>
        </div>
      </div>
    </div>
  );
};

/** The .win-overlay celebration screen, drawn over a viewport. */
export const WinOverlay: React.FC<{ show: number; moves: number; seconds: number; scale?: number }> = ({ show, moves, seconds, scale = 1 }) => {
  if (show <= 0) return null;
  const card = 0.97 + 0.03 * show;
  return (
    <div style={{ position: "absolute", inset: 0, background: `rgba(14, 74, 63, ${0.9 * show})`, display: "grid", placeItems: "center", fontFamily: QUICKSAND }}>
      <div
        style={{
          width: 430,
          padding: 34,
          boxSizing: "border-box",
          textAlign: "center",
          background: C.white,
          border: `5px solid ${C.red}`,
          borderRadius: 25,
          opacity: show,
          transform: `scale(${scale}) translateY(${(1 - show) * 18}px) scale(${card})`,
        }}
      >
        <div style={{ width: 62, height: 62, margin: "0 auto 18px", display: "grid", placeItems: "center", borderRadius: 20, background: C.red, color: C.white, fontSize: 35 }}>✦</div>
        <p style={{ letterSpacing: "0.13em", fontSize: 10, fontWeight: 700, color: C.red, margin: "0 0 10px" }}>CHALLENGE COMPLETE</p>
        <h2 style={{ margin: 0, color: C.green, fontSize: 30, fontWeight: 700 }}>Brilliant matching!</h2>
        <p style={{ color: C.muted, lineHeight: 1.6, fontWeight: 600, fontSize: 16 }}>You found every pair. Your memory is getting stronger!</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 42, margin: "22px 0" }}>
          {[
            ["MOVES", String(moves)],
            ["TIME", formatTime(seconds)],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "grid", gap: 5 }}>
              <span style={{ color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em" }}>{k}</span>
              <strong style={{ color: C.green, fontSize: 25, fontWeight: 700 }}>{v}</strong>
            </div>
          ))}
        </div>
        <div style={{ width: "100%", padding: "14px 18px", boxSizing: "border-box", borderRadius: 12, background: C.red, color: C.white, fontWeight: 700, fontSize: 16 }}>
          Play again <span style={{ marginLeft: 8, fontSize: 18 }}>→</span>
        </div>
      </div>
    </div>
  );
};

/** A flat browser window that shows the page at `zoom`, scrolled to `scrollY` (page px). */
export const GameBrowser: React.FC<{
  width: number;
  height: number;
  zoom: number;
  scrollY?: number;
  url?: string;
  chrome?: boolean;
  state: GameState;
  rings?: React.ComponentProps<typeof GamePage>["rings"];
  red?: string;
  overlayScale?: number;
  children?: React.ReactNode;
}> = ({ width, height, zoom, scrollY = 0, url = "number-match/index.html", chrome = true, state, rings, red, overlayScale = 1, children }) => {
  const bar = chrome ? 52 : 0;
  const viewH = height - bar;
  return (
    <div style={{ width, height, borderRadius: chrome ? 18 : 0, overflow: "hidden", background: C.page, border: chrome ? `3px solid ${C.white}` : undefined, boxSizing: "border-box", position: "relative" }}>
      {chrome && (
        <div style={{ height: bar, background: C.white, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", borderBottom: `2px solid ${C.mint}`, boxSizing: "border-box" }}>
          {["#ff6058", "#ffbd2e", "#28c940"].map((c) => (
            <span key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
          ))}
          <div style={{ marginLeft: 18, flex: 1, height: 32, borderRadius: 16, background: C.page, display: "flex", alignItems: "center", padding: "0 16px", fontFamily: QUICKSAND, fontWeight: 600, fontSize: 16, color: C.muted }}>
            {url}
          </div>
        </div>
      )}
      <div style={{ position: "absolute", top: bar, left: 0, width, height: viewH, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: (width - PAGE.width * zoom) / 2, top: -scrollY * zoom, transform: `scale(${zoom})`, transformOrigin: "0 0" }}>
          <GamePage state={state} rings={rings} red={red} />
        </div>
        <WinOverlay show={state.winOverlay} moves={state.moves} seconds={state.seconds} scale={overlayScale} />
        {children}
      </div>
    </div>
  );
};
