import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, handStyle, Kicker, pop, progress, SceneFade, Sfx } from "../../shared/anim";
import { FULL_SKETCH, PaperSketch } from "../../shared/PaperSketch";
import { cuesFor } from "../timeline";
import { C, QUICKSAND, SHADOW } from "../../shared/theme";

// ---------------- Ask questions about the product ----------------

const QA: { q: string; a: string; focus: [number, number, number] }[] = [
  { q: "What are we making?", a: "A Dino Runner game", focus: [650, 95, 300] },
  { q: "Who is using it?", a: "The player", focus: [330, 490, 130] },
  { q: "What can the player do?", a: "Jump and avoid obstacles", focus: [560, 300, 260] },
  { q: "What happens in the game?", a: "Obstacles move toward the player", focus: [980, 530, 200] },
  { q: "How does the player know they're doing well?", a: "The score goes up", focus: [1040, 270, 170] },
  { q: "What happens when the dino hits an obstacle?", a: "Game Over", focus: [400, 725, 230] },
  { q: "What happens next?", a: "The player can restart", focus: [1050, 730, 190] },
];

const SK_W = 860; // sketch width on screen
const SK_LEFT = 70;
const SK_TOP = 230;

export const Questions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = cuesFor("questions");
  const k = SK_W / 1300;
  const outro = progress(frame, cues.line("qx1") - 6, 18, EASE_IN_OUT);

  // which question is currently being discussed
  const current = QA.reduce((acc, _, i) => (frame >= cues.line(`qa${i + 1}q`) - 4 ? i : acc), -1);
  const ring = current >= 0 ? QA[current].focus : null;
  const ringPop = current >= 0 ? pop(frame, fps, cues.line(`qa${current + 1}q`) - 4, 14) : 0;

  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Ask questions about the product</Kicker>

      <div style={{ opacity: 1 - outro * 0.85, transform: `translateY(${outro * 30}px)` }}>
        {/* The finished paper plan on the left */}
        <Appear at={2} kind="left" style={{ position: "absolute", left: SK_LEFT, top: SK_TOP }}>
          <PaperSketch p={FULL_SKETCH} width={SK_W} />
          {ring ? (
            <div
              style={{
                position: "absolute",
                left: ring[0] * k - (ring[2] * k) / 2 - 10,
                top: ring[1] * k - (ring[2] * k) / 2.6 - 10,
                width: ring[2] * k + 20,
                height: (ring[2] * k) / 1.3 + 20,
                border: `5px solid ${C.accent}`,
                borderRadius: "50%",
                transform: `scale(${0.6 + 0.4 * ringPop}) rotate(-4deg)`,
                opacity: ringPop,
              }}
            />
          ) : null}
        </Appear>

        {/* Questions + answers on the right */}
        <div style={{ position: "absolute", left: 1000, top: 150, width: 860 }}>
          {QA.map((item, i) => {
            const qAt = cues.line(`qa${i + 1}q`);
            const aAt = cues.line(`qa${i + 1}a`);
            const isCurrent = i === current;
            return (
              <Appear key={item.q} at={qAt - 4} kind="right" style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    alignItems: "flex-start",
                    padding: "10px 22px",
                    borderRadius: 22,
                    background: isCurrent ? "white" : "rgba(255,255,255,0.55)",
                    boxShadow: isCurrent ? SHADOW : "none",
                  }}
                >
                  <div
                    style={{
                      minWidth: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: isCurrent ? C.dino : C.line,
                      color: isCurrent ? "white" : C.inkSoft,
                      fontFamily: QUICKSAND,
                      fontWeight: 700,
                      fontSize: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 29, color: C.ink }}>{item.q}</div>
                    <Appear at={aAt} kind="fade" dur={8}>
                      <div style={{ ...handStyle(37, C.dino), marginTop: 2 }}>{item.a}</div>
                    </Appear>
                  </div>
                </div>
              </Appear>
            );
          })}
        </div>
      </div>

      {/* Outro statement */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Appear at={cues.line("qx1")} kind="pop">
          <div style={{ background: "white", borderRadius: 36, padding: "50px 80px", boxShadow: SHADOW, textAlign: "center" }}>
            <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 84, color: C.ink }}>
              Questions come <span style={{ color: C.dino }}>before</span> code.
            </div>
            <Appear at={cues.word("qx2", "okay")} style={{ fontFamily: QUICKSAND, fontWeight: 600, fontSize: 44, color: C.inkSoft, marginTop: 20 }}>
              Can't answer them yet? Keep thinking.
            </Appear>
          </div>
        </Appear>
      </AbsoluteFill>

      {QA.map((_, i) => (
        <React.Fragment key={i}>
          <Sfx at={cues.line(`qa${i + 1}q`) - 4} name="tick" volume={0.35} />
          <Sfx at={cues.line(`qa${i + 1}a`)} name="pencil" volume={0.25} />
        </React.Fragment>
      ))}
      <Sfx at={cues.line("qx1")} name="pop" volume={0.45} />
    </SceneFade>
  );
};

// ---------------- Three building blocks ----------------

const COLUMNS = [
  {
    q: "What exists?",
    title: "WHAT EXISTS",
    items: ["player", "obstacles", "ground", "score", "buttons", "game area"],
    lang: "HTML",
    job: "creates the structure",
    color: C.html,
    line: "bb2",
    langLine: "bb6",
  },
  {
    q: "What does it look like?",
    title: "WHAT IT LOOKS LIKE",
    items: ["colours", "sizes", "positions", "shapes", "spacing", "layout"],
    lang: "CSS",
    job: "controls how it looks",
    color: C.css,
    line: "bb3",
    langLine: "bb7",
  },
  {
    q: "What does it do?",
    title: "WHAT IT DOES",
    items: ["jumps", "moves", "detects collision", "increases score", "ends the game", "restarts"],
    lang: "JavaScript",
    job: "controls behaviour",
    color: C.js,
    line: "bb4",
    langLine: "bb8",
  },
];

export const Blocks: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = cuesFor("blocks");
  const shift = progress(frame, cues.line("bb5"), 24, EASE_IN_OUT);

  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Break it into building blocks</Kicker>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 170,
          textAlign: "center",
          fontFamily: QUICKSAND,
          fontWeight: 700,
          fontSize: 60,
          color: C.ink,
          opacity: interpolate(frame, [cues.line("bb1"), cues.line("bb1") + 12, cues.line("bb5") - 4, cues.line("bb5") + 8], [0, 1, 1, 0], CLAMP),
        }}
      >
        Every product = three questions
      </div>

      <div style={{ position: "absolute", left: 130, right: 130, top: 290 + shift * 40, display: "flex", gap: 50 }}>
        {COLUMNS.map((col) => {
          const at = cues.line(col.line);
          const itemsAt = cues.end(col.line) - 6;
          const langAt = cues.line(col.langLine);
          const lit = frame >= langAt;
          return (
            <Appear key={col.title} at={at - 4} kind="up" style={{ flex: 1, position: "relative" }}>
              {/* Language tag that slides on top */}
              <div style={{ position: "absolute", top: -110, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                <Appear at={langAt} kind="drop">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      background: col.color,
                      color: col.lang === "JavaScript" ? C.ink : "white",
                      borderRadius: 22,
                      padding: "10px 34px",
                      boxShadow: SHADOW,
                    }}
                  >
                    <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 46 }}>{col.lang}</span>
                    <span style={{ fontFamily: QUICKSAND, fontWeight: 600, fontSize: 24 }}>{col.job}</span>
                  </div>
                </Appear>
              </div>
              <div
                style={{
                  background: "white",
                  borderRadius: 30,
                  padding: "34px 34px 26px",
                  minHeight: 560,
                  boxShadow: SHADOW,
                  borderTop: `10px solid ${lit ? col.color : C.line}`,
                }}
              >
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.inkSoft }}>{col.title}</div>
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.ink, margin: "8px 0 24px" }}>{col.q}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                  {col.items.map((item, i) => (
                    <Appear key={item} at={itemsAt + i * 5} kind="pop">
                      <div
                        style={{
                          fontFamily: QUICKSAND,
                          fontWeight: 700,
                          fontSize: 30,
                          padding: "10px 22px",
                          borderRadius: 999,
                          background: lit ? `${col.color}22` : C.canvas,
                          border: `2px solid ${lit ? col.color : C.line}`,
                          color: C.ink,
                        }}
                      >
                        {item}
                      </div>
                    </Appear>
                  ))}
                </div>
              </div>
            </Appear>
          );
        })}
      </div>

      {COLUMNS.map((col) => (
        <React.Fragment key={col.title}>
          <Sfx at={cues.line(col.line) - 4} name="whoosh" volume={0.2} />
          {col.items.map((_, i) => (
            <Sfx key={i} at={cues.end(col.line) - 6 + i * 5} name="tick" volume={0.25} />
          ))}
          <Sfx at={cues.line(col.langLine)} name="thunk" volume={0.5} />
        </React.Fragment>
      ))}
    </SceneFade>
  );
};

// ---------------- The house analogy ----------------

export const House: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = cuesFor("house");
  const build = progress(frame, cues.word("h2", "walls") - 6, 30, EASE_IN_OUT);
  const paint = progress(frame, cues.word("h3", "paint"), 24, EASE_IN_OUT);
  const furniture = progress(frame, cues.word("h3", "furniture"), 18);
  const power = progress(frame, cues.word("h4", "electricity"), 8);
  const door = progress(frame, cues.word("h4", "happen"), 16, EASE_IN_OUT);
  const dash = (p: number) => ({ pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - p });
  const outline = { stroke: C.ink, strokeWidth: 7, fill: "none", strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const glow = power * (0.85 + 0.15 * Math.sin(frame / 6));

  const label = (at: number, color: string, lang: string, text: string, dark = false) => (
    <Appear at={at} kind="left" style={{ marginBottom: 34 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ background: color, color: dark ? C.ink : "white", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, padding: "10px 26px", borderRadius: 18, minWidth: 220, textAlign: "center" }}>
          {lang}
        </div>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.ink }}>{text}</div>
      </div>
    </Appear>
  );

  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Think of a house</Kicker>

      <div style={{ position: "absolute", left: 150, top: 330 }}>
        {label(cues.line("h2"), C.html, "HTML", "the walls")}
        {label(cues.line("h3"), C.css, "CSS", "paint + furniture")}
        {label(cues.line("h4"), C.js, "JavaScript", "the electricity", true)}
      </div>

      <svg width={760} height={700} viewBox="0 0 760 700" style={{ position: "absolute", right: 140, top: 210 }}>
        {/* light glow */}
        <circle cx={380} cy={420} r={330} fill={C.accent} opacity={glow * 0.18} />
        {/* walls + roof fill (CSS) */}
        <rect x={130} y={300} width={500} height={340} fill="#fbe3cf" opacity={paint} />
        <path d="M 100 310 L 380 90 L 660 310 Z" fill={C.dino} opacity={paint} />
        {/* windows */}
        <rect x={190} y={380} width={120} height={110} rx={8} fill={power > 0 ? "#ffe08a" : C.sky} opacity={paint || build} />
        <rect x={450} y={380} width={120} height={110} rx={8} fill={power > 0 ? "#ffe08a" : C.sky} opacity={paint || build} />
        {/* door, opening */}
        <rect x={335} y={500} width={90} height={140} rx={6} fill={C.cactus} opacity={paint} transform={`translate(${335} 0) scale(${1 - door * 0.7} 1) translate(${-335} 0)`} />
        {/* furniture: a sofa and a lamp through the windows */}
        <g opacity={furniture}>
          <rect x={205} y={448} width={90} height={30} rx={10} fill={C.css} />
          <rect x={210} y={432} width={80} height={22} rx={8} fill={C.css} opacity={0.75} />
          <line x1={540} y1={480} x2={540} y2={420} stroke={C.ink} strokeWidth={5} />
          <path d="M 516 420 L 564 420 L 552 396 L 528 396 Z" fill={power > 0 ? C.accent : "#e8d9c3"} />
        </g>
        {/* the structure (HTML) */}
        <path d="M 130 640 L 130 300 L 630 300 L 630 640 Z" {...outline} {...dash(build)} />
        <path d="M 100 310 L 380 90 L 660 310" {...outline} {...dash(progress(frame, cues.word("h2", "walls") + 10, 20))} />
        <rect x={190} y={380} width={120} height={110} rx={8} {...outline} {...dash(progress(frame, cues.word("h2", "walls") + 14, 16))} />
        <rect x={450} y={380} width={120} height={110} rx={8} {...outline} {...dash(progress(frame, cues.word("h2", "walls") + 18, 16))} />
        <rect x={335} y={500} width={90} height={140} rx={6} {...outline} {...dash(progress(frame, cues.word("h2", "walls") + 22, 16))} />
        <line x1={60} y1={640} x2={700} y2={640} {...outline} />
        {/* light rays */}
        {power > 0
          ? [0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1={380 + Math.cos(-Math.PI / 2 + (i - 2) * 0.45) * 60}
                y1={40 + Math.sin(-Math.PI / 2 + (i - 2) * 0.45) * 60 + 60}
                x2={380 + Math.cos(-Math.PI / 2 + (i - 2) * 0.45) * 90}
                y2={40 + Math.sin(-Math.PI / 2 + (i - 2) * 0.45) * 90 + 60}
                stroke={C.accent}
                strokeWidth={7}
                strokeLinecap="round"
                opacity={glow}
              />
            ))
          : null}
      </svg>

      <Appear at={cues.line("h5")} kind="up" style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center" }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 50, color: C.ink, background: "white", padding: "18px 40px", borderRadius: 999, boxShadow: SHADOW }}>
          No code yet. Just remember the <span style={{ color: C.dino }}>three jobs</span>.
        </span>
      </Appear>

      <Sfx at={cues.word("h2", "walls") - 6} name="pencil" volume={0.35} />
      <Sfx at={cues.line("h2")} name="thunk" volume={0.4} />
      <Sfx at={cues.line("h3")} name="thunk" volume={0.4} />
      <Sfx at={cues.word("h3", "furniture")} name="pop" volume={0.4} />
      <Sfx at={cues.line("h4")} name="thunk" volume={0.4} />
      <Sfx at={cues.word("h4", "electricity")} name="click" volume={0.6} />
      <Sfx at={cues.word("h4", "electricity") + 2} name="chime" volume={0.25} />
    </SceneFade>
  );
};
