import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, Kicker, Marker, pop, progress, SceneFade, Strike } from "../../shared/anim";
import { gameStateAt, GameView } from "../../shared/Game";
import { C, HAND, QUICKSAND, SHADOW, SHADOW_SOFT } from "../../shared/theme";
import { T6 } from "../timeline";
import { FoodArt, MealCard, SchoolCrest } from "../apps";
import { Camera, FilmFinish, Headline, Icon, Tap, V6, Sfx } from "../kit";

// ---------------- Scene: what is coding? ----------------

/** A dot that follows instructions on a grid, one step at a time. */
const GRID = 92;
const MOVES: [number, number][] = [[1, 0], [1, 0], [0, -1], [0, -1], [1, 0], [1, 0]];
const ARROWS: Record<string, string> = { "1,0": "→", "0,-1": "↑" };

const StepRunner: React.FC<{ at: number; per: number }> = ({ at, per }) => {
  const frame = useCurrentFrame();
  const t = Math.max(0, (frame - at) / per);
  const step = Math.min(MOVES.length, Math.floor(t));
  const k = Math.min(1, t - step);
  const pos = MOVES.slice(0, step).reduce(([x, y], [dx, dy]) => [x + dx, y + dy], [0, 3]);
  const next = step < MOVES.length ? MOVES[step] : [0, 0];
  const ease = interpolate(k, [0, 0.6], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const x = pos[0] + next[0] * ease;
  const y = pos[1] + next[1] * ease;
  const done = step >= MOVES.length;
  return (
    <div style={{ display: "flex", gap: 50, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {MOVES.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "8px 20px",
              borderRadius: 14,
              fontFamily: QUICKSAND,
              fontWeight: 700,
              fontSize: 26,
              background: i === step && !done ? C.ink : i < step ? "#e7f3ec" : "white",
              color: i === step && !done ? "white" : C.ink,
              boxShadow: SHADOW_SOFT,
            }}
          >
            <span style={{ color: i === step && !done ? C.accent : C.inkSoft, width: 30 }}>{i + 1}</span>
            Move {ARROWS[m.join(",")]}
          </div>
        ))}
      </div>
      <div style={{ position: "relative", width: GRID * 5, height: GRID * 4, borderRadius: 24, background: "white", boxShadow: SHADOW }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: (i % 5) * GRID + GRID / 2 - 4, top: Math.floor(i / 5) * GRID + GRID / 2 - 4, width: 8, height: 8, borderRadius: 4, background: "#e6ddcf" }} />
        ))}
        <div style={{ position: "absolute", left: 4 * GRID + GRID / 2 - 26, top: 1 * GRID + GRID / 2 - 26, transform: `scale(${done ? 1.25 : 1})` }}>
          <Icon name="star" size={52} color={C.accent} fill={done ? C.accent : "none"} stroke={2.4} />
        </div>
        <div style={{ position: "absolute", left: x * GRID + GRID / 2 - 24, top: y * GRID + GRID / 2 - 24, width: 48, height: 48, borderRadius: 16, background: C.dino, boxShadow: "0 8px 16px rgba(240,138,75,0.4)" }} />
      </div>
    </div>
  );
};

export const WhatIsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const q = T6.cuesFor("whatis");
  const defAt = q.line("w2");
  const instrAt = q.word("w2", "instructions");
  const fastAt = q.word("w3", "fast");
  const guessAt = q.word("w3", "guess");
  const stepAt = q.word("w3", "step");
  const ideaAt = q.line("w4");
  const stepsAt = q.word("w4", "steps");
  const followAt = q.word("w4", "follow");
  const respondsAt = q.word("w5", "responds");

  const phase1 = 1 - progress(frame, ideaAt - 12, 16); // definition + step runner
  const phase2 = progress(frame, ideaAt - 6, 18);

  const plain = [
    { t: "Listen for a tap on Add", code: 'addButton.addEventListener("click", () => {' },
    { t: "Put the meal in the cart", code: "  cart.push(meal);" },
    { t: "Show the new total", code: "  showTotal(cart);" },
  ];
  const morphAt = followAt + 6;

  return (
    <SceneFade duration={q.duration}>
      <Kicker at={4}>What is coding?</Kicker>
      <AbsoluteFill style={{ opacity: phase1 }}>
        <Appear at={q.line("w1")} kind="up" out={defAt - 8} style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center" }}>
          <Headline text="So, what actually is coding?" at={q.line("w1")} size={110} />
        </Appear>
        <Appear at={defAt} kind="up" style={{ position: "absolute", left: 0, right: 0, top: 420 - 250 * progress(frame, fastAt - 10, 20, EASE_IN_OUT), textAlign: "center" }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 70, color: C.ink }}>
            Coding is writing <Marker at={instrAt}>instructions</Marker> for a computer.
          </div>
        </Appear>
        <Appear at={fastAt - 4} kind="up" style={{ position: "absolute", left: 0, right: 0, top: 320 }}>
          <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>
            <div style={{ padding: "12px 26px", borderRadius: 999, background: "white", boxShadow: SHADOW_SOFT, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, color: C.good }}>Incredibly fast</div>
            {frame >= guessAt ? (
              <div style={{ padding: "12px 26px", borderRadius: 999, background: "white", boxShadow: SHADOW_SOFT, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, color: C.danger }}>
                <Strike at={guessAt + 8} thickness={5}>
                  Can guess what you mean
                </Strike>
              </div>
            ) : null}
          </div>
        </Appear>
        <Appear at={stepAt - 16} kind="up" style={{ position: "absolute", left: 0, right: 0, top: 425, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: "scale(1.12)", transformOrigin: "top center" }}>
            <StepRunner at={stepAt} per={11} />
          </div>
        </Appear>
      </AbsoluteFill>

      {phase2 > 0 ? (
        <AbsoluteFill style={{ opacity: phase2 }}>
          {/* the idea, in plain words */}
          <Appear at={ideaAt} kind="drop" style={{ position: "absolute", left: 140, top: 150 }}>
            <div style={{ position: "relative", padding: "26px 36px", background: "#fff8e8", border: "3px solid #f6dfa5", borderRadius: 30, maxWidth: 820 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: C.inkSoft }}>
                <Icon name="bulb" size={30} color={C.accent} stroke={2.4} /> THE IDEA
              </div>
              <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 60, color: C.ink, marginTop: 6, lineHeight: 1.05 }}>When someone taps Add, put the meal in the cart.</div>
            </div>
          </Appear>
          {/* plain steps that turn into code */}
          <div style={{ position: "absolute", left: 140, top: 450, width: 860 }}>
            {plain.map((p, i) => {
              const at = stepsAt + i * 8;
              const m = progress(frame, morphAt + i * 6, 14, EASE_IN_OUT);
              return (
                <Appear key={i} at={at} kind="left" style={{ marginBottom: 16 }}>
                  <div style={{ position: "relative", height: 64 }}>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 18, padding: "0 24px", borderRadius: 18, background: "white", boxShadow: SHADOW_SOFT, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, color: C.ink, opacity: 1 - m, transform: `rotateX(${m * 90}deg)` }}>
                      <span style={{ width: 40, height: 40, borderRadius: 12, background: C.ink, color: "white", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                      {p.t}
                    </div>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 24px", borderRadius: 18, background: "#1f2430", fontFamily: V6.mono, fontSize: 25, color: "#f7d36a", whiteSpace: "pre", opacity: m, transform: `rotateX(${(1 - m) * -90}deg)` }}>
                      {p.code}
                    </div>
                  </div>
                </Appear>
              );
            })}
            {frame >= morphAt + 18 ? (
              <Appear at={morphAt + 18} kind="left">
                <div style={{ height: 56, display: "flex", alignItems: "center", padding: "0 24px", borderRadius: 18, background: "#1f2430", fontFamily: V6.mono, fontSize: 25, color: "#f7d36a" }}>{"});"}</div>
              </Appear>
            ) : null}
          </div>
          {/* the product responds */}
          <Appear at={ideaAt + 24} kind="right" style={{ position: "absolute", left: 1170, top: 260, transform: "scale(0.95)", transformOrigin: "top left" }}>
            <MealCard s={{ parts: 5, style: 1, count: frame >= respondsAt ? 1 : 0, pressAt: respondsAt, live: true }} />
          </Appear>
          <Tap at={respondsAt} x={1170 + 247} y={260 + 404} />
        </AbsoluteFill>
      ) : null}
      <FilmFinish vignette={0.16} grain={0.03} />

      <Sfx at={defAt} name="pop" volume={0.3} />
      <Sfx at={guessAt + 8} name="scribble" volume={0.3} />
      {MOVES.map((_, i) => (
        <Sfx key={i} at={stepAt + i * 11} name="tick" volume={0.3} />
      ))}
      <Sfx at={stepAt + MOVES.length * 11} name="levelup" volume={0.25} />
      <Sfx at={ideaAt} name="thunk" volume={0.3} />
      {plain.map((_, i) => (
        <Sfx key={i} at={stepsAt + i * 8} name="pop" volume={0.22} />
      ))}
      <Sfx at={morphAt} name="whoosh" volume={0.3} />
      <Sfx at={respondsAt} name="click" volume={0.45} />
      <Sfx at={respondsAt + 4} name="chime" volume={0.3} />
    </SceneFade>
  );
};

// ---------------- Scene: what you can build ----------------

const Tile: React.FC<{ label: string; icon: string; color: string; children: React.ReactNode; litAt: number }> = ({ label, icon, color, children, litAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lit = pop(frame, fps, litAt, 12);
  return (
    <div style={{ width: 480, height: 300, borderRadius: 30, background: "white", boxShadow: SHADOW, overflow: "hidden", position: "relative", outline: `${5 * lit}px solid ${color}`, transform: `scale(${1 + 0.04 * lit * (1 - progress(frame, litAt + 30, 20))})` }}>
      <div style={{ position: "absolute", inset: "0 0 64px 0", background: `${color}14`, overflow: "hidden" }}>{children}</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, display: "flex", alignItems: "center", gap: 12, padding: "0 22px", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, color: C.ink }}>
        <Icon name={icon} size={30} color={color} stroke={2.4} />
        {label}
      </div>
    </div>
  );
};

export const BuildScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = T6.cuesFor("build");
  const b2 = (w: string) => q.word("b2", w);
  const collapseAt = q.word("b3", "screen") - 6;
  const blocksAt = collapseAt + 14;
  const collapse = progress(frame, collapseAt, 22, EASE_IN_OUT);
  const game = gameStateAt(Math.max(0, (frame - b2("games")) / fps + 1.2));

  const tiles = [
    {
      label: "Websites", icon: "globe", color: V6.plum, at: b2("websites"),
      body: (
        <div style={{ padding: 18 }}>
          <div style={{ height: 22, width: "60%", borderRadius: 6, background: V6.plum, opacity: 0.8 }} />
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ flex: 1, height: 120, borderRadius: 14, background: "white", boxShadow: SHADOW_SOFT }} />
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "Mobile apps", icon: "cart", color: C.dino, at: b2("mobile"),
      body: (
        <div style={{ display: "flex", justifyContent: "center", gap: 18, paddingTop: 18 }}>
          <div style={{ width: 96, height: 190, borderRadius: 20, border: "5px solid #2b2b2b", background: "#fde3c8", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FoodArt kind="pizza" size={64} spin={frame * 0.4} />
          </div>
          <div style={{ width: 96, height: 190, borderRadius: 20, border: "5px solid #2b2b2b", background: "#eaf0e4", position: "relative", overflow: "hidden" }}>
            <svg width={86} height={180}>
              <path d="M14 150 V96 H60 V30" fill="none" stroke={C.dino} strokeWidth={5} strokeLinecap="round" strokeDasharray="2 9" />
              <circle cx={60} cy={30} r={8} fill={C.good} />
            </svg>
          </div>
        </div>
      ),
    },
    {
      label: "School systems", icon: "calendar", color: C.css, at: b2("school"),
      body: (
        <div style={{ display: "flex", gap: 16, padding: 20, alignItems: "flex-start" }}>
          <SchoolCrest size={64} />
          <div style={{ flex: 1 }}>
            {[88, 72, 94].map((w, i) => (
              <div key={i} style={{ height: 14, borderRadius: 7, background: "#e4ecf7", marginTop: i ? 22 : 8 }}>
                <div style={{ width: `${w}%`, height: "100%", borderRadius: 7, background: C.css }} />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      label: "Games", icon: "game", color: C.good, at: b2("games"),
      body: (
        <div style={{ transform: "scale(0.56)", transformOrigin: "top left", position: "absolute", left: 16, top: 12 }}>
          <GameView state={game} showHeader={false} />
        </div>
      ),
    },
    {
      label: "Digital tools", icon: "check", color: C.cactus, at: b2("tools"),
      body: (
        <div style={{ padding: "20px 26px" }}>
          {["Revise for science quiz", "Club meeting · 4pm", "Finish art project"].map((t, i) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: i ? 14 : 0, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 21, color: C.ink }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, border: `3px solid ${C.cactus}`, background: i === 0 ? C.cactus : "white" }} />
              {t}
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "Business systems", icon: "chart", color: C.js, at: b2("businesses"),
      body: (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 200, padding: "0 30px 20px", boxSizing: "border-box" }}>
          {[0.4, 0.55, 0.5, 0.72, 0.68, 0.9].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h * 100 * progress(frame, b2("businesses") + i * 3, 20)}%`, borderRadius: "10px 10px 4px 4px", background: i === 5 ? C.js : "#f6e3a8" }} />
          ))}
        </div>
      ),
    },
  ];

  const blocks = [
    { label: "HTML", sub: "structure", color: C.html },
    { label: "CSS", sub: "appearance", color: C.css },
    { label: "JavaScript", sub: "behavior", color: C.js },
  ];

  return (
    <SceneFade duration={q.duration}>
      <Kicker at={4} style={{ top: 50 }}>What you can build</Kicker>
      <Camera shots={[{ f: 0, scale: 1.04 }, { f: q.line("b3"), scale: 1 }, { f: q.duration, scale: 1.03 }]} perspective={1800}>
        <div style={{ position: "absolute", left: 200, top: 130, width: 1520, display: "flex", flexWrap: "wrap", gap: 40, transformStyle: "preserve-3d" }}>
          {tiles.map((t, i) => {
            const s = pop(frame, fps, 8 + i * 4, 14);
            const z = interpolate(s, [0, 1], [-900, 0]);
            const out = collapse;
            return (
              <div key={t.label} style={{ transform: `translateZ(${z - out * 600}px) translateY(${out * (i < 3 ? -60 : 60)}px) rotateX(${(1 - s) * 30}deg)`, opacity: Math.min(1, s * 1.4) * (1 - out) }}>
                <Tile label={t.label} icon={t.icon} color={t.color} litAt={t.at}>
                  {t.body}
                </Tile>
              </div>
            );
          })}
        </div>
        {collapse > 0 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 260, display: "flex", justifyContent: "center", gap: 60 }}>
            {blocks.map((b, i) => {
              const s = pop(frame, fps, blocksAt + i * 6, 11);
              return (
                <div key={b.label} style={{ transform: `translateY(${(1 - s) * 200}px) scale(${s})`, opacity: Math.min(1, s * 1.5) }}>
                  <div style={{ width: 380, height: 300, borderRadius: 40, background: b.color, boxShadow: `0 30px 60px ${b.color}55, inset 0 -14px 0 rgba(0,0,0,0.12)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: QUICKSAND, color: b.color === C.js ? C.ink : "white" }}>
                    <div style={{ fontSize: 66, fontWeight: 700 }}>{b.label}</div>
                    <div style={{ fontSize: 32, fontWeight: 600, opacity: 0.9 }}>{b.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </Camera>
      <FilmFinish vignette={0.16} grain={0.03} />
      {tiles.map((t, i) => (
        <Sfx key={i} at={t.at} name="pop" volume={0.25} />
      ))}
      <Sfx at={collapseAt} name="whoosh" volume={0.3} />
      {blocks.map((_, i) => (
        <Sfx key={i} at={blocksAt + i * 6} name="thunk" volume={0.35} />
      ))}
    </SceneFade>
  );
};
