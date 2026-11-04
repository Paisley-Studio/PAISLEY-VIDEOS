import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, handStyle, Kicker, pop, progress, SceneFade, Sfx } from "../shared/anim";
import { Browser, CodeEditor, CodeLine, CodeMark, EndCard, Stepper, TitleCard } from "../shared/Code";
import { Dino } from "../shared/Game";
import { CssKnobs, CssStage, Fit, PlainPage, StyledPage } from "../shared/Pages";
import { Pointer, SpaceKey } from "../shared/Props";
import { createTimeline, VideoScript } from "../shared/timeline";
import { VideoShell } from "../shared/VideoShell";
import { C, QUICKSAND, SHADOW } from "../shared/theme";
import script from "./script.json";
import timings from "./vo-timings.json";

// VIDEO 3 — Make It Look Like a Game: CSS

const T = createTimeline(script as VideoScript, timings);
export const VIDEO3_FRAMES = T.TOTAL_FRAMES;

const SECTION_NAMES = ["Our colours", "The page", "The world + ground", "The player", "The obstacle", "Clouds", "Messages + button"];

/** Earlier sections collapse to one line, so the new code always fits on screen. */
const cssLines = (section: number, body: (string | CodeLine)[], at: number, perLine = 6): CodeLine[] => [
  ...SECTION_NAMES.slice(0, section).map((name, i) => ({ text: `/* ✓ ${i + 1}. ${name} */` })),
  ...(section > 0 ? [{ text: "" }] : []),
  { text: `/* ${section + 1}. ${SECTION_NAMES[section]} */`, at },
  ...body.map((l, i) => (typeof l === "string" ? { text: l, at: at + 6 + i * perLine } : l)),
];
const head = (section: number) => section + (section > 0 ? 2 : 1); // index of first body line

const ED = { left: 70, top: 160, width: 1000, height: 800 };
const BR = { left: 1110, top: 160, width: 740, height: 500 };

const ALL: CssStage = { page: true, score: true, world: true, ground: true, player: true, eye: true, legs: true, obstacle: true, clouds: true, messages: true, button: true, hidden: true };

const Layout: React.FC<{ lines: CodeLine[]; marks?: CodeMark[]; s: CssStage; k?: CssKnobs; refresh: number; codeAt: number; children?: React.ReactNode; scroll?: [number, number][] }> = ({
  lines,
  marks,
  s,
  k,
  refresh,
  codeAt,
  children,
  scroll,
}) => (
  <>
    <Appear at={0} kind="left" style={{ position: "absolute", left: ED.left, top: ED.top }}>
      <CodeEditor file="style.css" lang="css" lines={lines} marks={marks} width={ED.width} height={ED.height} fontSize={21} scroll={scroll} />
    </Appear>
    <Appear at={4} kind="right" style={{ position: "absolute", left: BR.left, top: BR.top }}>
      <Browser width={BR.width} height={BR.height} refreshAt={[refresh]}>
        <Fit width={BR.width}>
          <StyledPage s={s} k={k} />
        </Fit>
        {children}
      </Browser>
    </Appear>
    <Appear at={8} kind="up" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 30 }}>
      <Stepper steps={["CODE", "BROWSER", "RESULT"]} marks={[codeAt, refresh, refresh + 12]} color={C.css} />
    </Appear>
  </>
);

/** A labelled slider that shows a CSS value changing. */
const Knob: React.FC<{ label: string; value: string; t: number; at: number; out?: number; top?: number }> = ({ label, value, t, at, out, top = BR.top + BR.height + 110 }) => (
  <Appear at={at} out={out} kind="up" style={{ position: "absolute", left: BR.left, top, width: BR.width }}>
    <div style={{ background: "white", borderRadius: 24, padding: "18px 28px", boxShadow: SHADOW }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 28 }}>
        <span style={{ color: C.css }}>{label}</span>
        <span style={{ color: C.ink }}>{value}</span>
      </div>
      <div style={{ position: "relative", height: 10, borderRadius: 5, background: C.line, marginTop: 16 }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${t * 100}%`, borderRadius: 5, background: C.css }} />
        <div style={{ position: "absolute", left: `calc(${t * 100}% - 14px)`, top: -9, width: 28, height: 28, borderRadius: "50%", background: "white", border: `5px solid ${C.css}` }} />
      </div>
    </div>
  </Appear>
);

const Note: React.FC<{ at: number; out?: number; children: React.ReactNode; top?: number }> = ({ at, out, children, top = BR.top + BR.height + 110 }) => (
  <Appear at={at} out={out} kind="up" style={{ position: "absolute", left: BR.left, top, width: BR.width }}>
    <div style={{ background: "white", borderRadius: 24, padding: "18px 26px", boxShadow: SHADOW, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, color: C.ink, lineHeight: 1.35 }}>{children}</div>
  </Appear>
);

// ---------------- Scenes ----------------

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("intro");
  const show = cues.word("i1", "html");
  const wipe = interpolate(frame, [cues.line("i3"), cues.line("i3") + 30, cues.word("i3", "css") - 10, cues.word("i3", "css") + 14], [0.5, 0.15, 0.85, 0], { ...CLAMP, easing: EASE_IN_OUT });
  return (
    <SceneFade duration={cues.duration}>
      <TitleCard number={3} title="Make It Look Like a Game" subtitle="CSS" color={C.css} out={show - 8} />
      <Appear at={show} kind="up" style={{ position: "absolute", left: 260, top: 150 }}>
        <Browser width={1400} height={780}>
          <div style={{ position: "absolute", inset: 0 }}>
            <PlainPage parts={{ title: true, score: true, area: true, pieces: true, start: true, gameOver: true }} />
          </div>
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${wipe * 100}%)`, opacity: frame >= cues.line("i3") ? 1 : 0 }}>
            <Fit width={1400}>
              <StyledPage s={ALL} />
            </Fit>
          </div>
          {frame >= cues.line("i3") ? <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wipe * 100}%`, width: 6, background: C.css, opacity: wipe > 0.01 ? 1 : 0 }} /> : null}
        </Browser>
      </Appear>
      <Appear at={cues.word("i3", "css")} kind="pop" style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center" }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 46, color: "white", background: C.css, padding: "12px 36px", borderRadius: 999 }}>The only difference: CSS</span>
      </Appear>
      <Sfx at={show} name="whoosh" volume={0.3} />
      <Sfx at={cues.line("i3")} name="whoosh" volume={0.3} />
      <Sfx at={cues.word("i3", "css")} name="chime" volume={0.35} />
    </SceneFade>
  );
};

const Rule: React.FC = () => {
  const cues = T.cuesFor("rule");
  const mono: React.CSSProperties = { fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 90 };
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>How a CSS rule works</Kicker>
      <div style={{ position: "absolute", left: 360, top: 220 }}>
        <Appear at={cues.line("r1")} kind="up">
          <div style={mono}>
            <span style={{ color: "#c8553d" }}>#player</span> <span style={{ color: C.ink }}>{"{"}</span>
          </div>
          <div style={{ ...mono, paddingLeft: 100 }}>
            <span style={{ color: "#2f6fd0" }}>width</span>: <span style={{ color: "#c27c0e" }}>44px</span>;
          </div>
          <div style={mono}>{"}"}</div>
        </Appear>
        <Appear at={cues.word("r2", "who")} kind="left" style={{ position: "absolute", left: 500, top: 30, whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: "#c8553d" }}>← WHO: the selector</div>
        </Appear>
        <Appear at={cues.word("r3", "property")} kind="left" style={{ position: "absolute", left: 740, top: 140, whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: "#2f6fd0" }}>← WHAT: property + value</div>
        </Appear>
      </div>
      <div style={{ position: "absolute", left: 260, right: 260, top: 680, display: "flex", gap: 50 }}>
        {[
          { at: cues.line("r4"), sym: "#", css: "#player", html: 'id="player"', text: "# means id: one thing", word: "hash" },
          { at: cues.line("r5"), sym: ".", css: ".cloud", html: 'class="cloud"', text: ". means class: every one", word: "dot" },
        ].map((c) => (
          <Appear key={c.sym} at={c.at} kind="pop" style={{ flex: 1 }}>
            <div style={{ background: "white", borderRadius: 28, padding: "26px 34px", boxShadow: SHADOW }}>
              <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 36, color: C.ink }}>{c.text}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 16, fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 32 }}>
                <span style={{ color: C.css }}>{c.css}</span>
                <span style={{ color: C.inkSoft }}>↔</span>
                <span style={{ color: C.html }}>{c.html}</span>
              </div>
            </div>
          </Appear>
        ))}
      </div>
      <Sfx at={cues.word("r2", "who")} name="pop" volume={0.35} />
      <Sfx at={cues.word("r3", "property")} name="pop" volume={0.35} />
      <Sfx at={cues.line("r4")} name="thunk" volume={0.4} />
      <Sfx at={cues.line("r5")} name="thunk" volume={0.4} />
    </SceneFade>
  );
};

const Colours: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("colours");
  const at = cues.word("v1", "colours");
  const purple = frame >= cues.word("v3", "change") && frame < cues.line("v4") + 10;
  const vars: [string, string][] = [
    ["--sky", C.sky],
    ["--ground", C.ground],
    ["--player", purple ? "#9b5de5" : C.dino],
    ["--obstacle", C.cactus],
    ["--text", C.ink],
    ["--accent", C.accent],
    ["--danger", C.danger],
  ];
  const body = [":root {", ...vars.map(([n, v]) => `  ${n}: ${v};`), "}"];
  const playerLine = head(0) + 3;
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>1 · Our colours</Kicker>
      <Appear at={0} kind="left" style={{ position: "absolute", left: ED.left, top: ED.top }}>
        <CodeEditor
          file="style.css"
          lang="css"
          lines={cssLines(0, body, at)}
          width={ED.width}
          height={ED.height}
          fontSize={24}
          marks={[{ from: playerLine, to: playerLine, at: cues.word("v3", "change"), until: cues.line("v4") + 10, label: "change ONE line" }]}
        />
      </Appear>
      <div style={{ position: "absolute", left: 1150, top: 200, width: 700, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 22 }}>
        {vars.map(([n, v], i) => (
          <Appear key={n} at={at + 12 + i * 6} kind="pop">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <div style={{ width: 120, height: 120, borderRadius: 30, background: v, boxShadow: SHADOW, border: "4px solid white" }} />
              <div style={{ fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 20, color: C.ink }}>{n}</div>
            </div>
          </Appear>
        ))}
      </div>
      <Appear at={cues.line("v3")} kind="pop" style={{ position: "absolute", left: 1150, top: 620, width: 700, display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ transform: `scale(${2.6 + 0.2 * pop(frame, fps, cues.word("v3", "change"))})`, marginLeft: 70, marginRight: 50 }}>
          <Dino color={purple ? "#9b5de5" : C.dino} />
        </div>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: C.ink }}>
          Purple dino?
          <br />
          <span style={{ color: "#9b5de5" }}>One line.</span>
        </div>
      </Appear>
      <Appear at={cues.line("v4")} kind="up" style={{ position: "absolute", left: 1150, top: 880, width: 700 }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, color: "white", background: C.css, borderRadius: 22, padding: "16px 26px" }}>
          A design system: decide once, use everywhere.
        </div>
      </Appear>
      {vars.map(([n], i) => (
        <Sfx key={n} at={at + 12 + i * 6} name="tick" volume={0.3} />
      ))}
      <Sfx at={cues.word("v3", "change")} name="pop" volume={0.45} />
    </SceneFade>
  );
};

const PageStep: React.FC = () => {
  const cues = T.cuesFor("page");
  const at = cues.word("g1", "page");
  const body = [
    "body {",
    "  display: flex;",
    "  justify-content: center;",
    "  align-items: center;",
    '  font-family: "Quicksand", sans-serif;',
    "  background: var(--background);",
    "}",
    "#game {",
    "  max-width: 800px;",
    "}",
    "#score-board {",
    "  font-size: 20px;",
    "  font-weight: 700;",
    "}",
  ];
  const refresh = cues.word("g1", "font") + 6;
  const scoreAt = cues.word("g3", "bold");
  const h = head(1);
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>2 · The page</Kicker>
      <Layout
        lines={cssLines(1, body, at, 4)}
        marks={[
          { from: h + 1, to: h + 4, at: cues.word("g1", "center"), until: cues.line("g2"), label: "center everything" },
          { from: h + 8, to: h + 8, at: cues.line("g2"), until: cues.line("g3"), label: "not too wide" },
          { from: h + 11, to: h + 12, at: scoreAt },
        ]}
        s={{ page: true, score: useCurrentFrame() >= scoreAt }}
        refresh={refresh}
        codeAt={at}
      />
      <Sfx at={at} name="typing" volume={0.3} />
      <Sfx at={refresh} name="click" volume={0.45} />
      <Sfx at={scoreAt} name="pop" volume={0.4} />
    </SceneFade>
  );
};

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("world");
  const at = cues.line("w1");
  const r2 = cues.line("w2");
  const radius = interpolate(frame, [r2 + 10, r2 + 40, cues.word("w2", "big"), cues.word("w2", "very") + 10, cues.end("w2") + 10], [20, 0, 0, 150, 20], { ...CLAMP, easing: EASE_IN_OUT });
  const skyAt = [cues.word("w3", "daytime"), cues.word("w3", "sunset"), cues.word("w3", "night")];
  const sky = frame >= skyAt[2] && frame < cues.line("w4") ? "#1d2d44" : frame >= skyAt[1] && frame < cues.line("w4") ? "#ffd6a5" : C.sky;
  const groundAt = cues.line("w5");
  const body = [
    "#game-area {",
    "  position: relative;",
    "  height: 300px;",
    "  background: var(--sky);",
    "  border: 3px solid var(--text);",
    `  border-radius: ${Math.round(radius)}px;`,
    "  overflow: hidden;",
    "}",
    { text: "#ground {", at: groundAt },
    { text: "  position: absolute;", at: groundAt + 5 },
    { text: "  bottom: 0;", at: groundAt + 10 },
    { text: "  width: 100%;", at: groundAt + 15 },
    { text: "  height: 40px;", at: groundAt + 20 },
    { text: "  background-color: var(--ground);", at: groundAt + 25 },
    { text: "}", at: groundAt + 30 },
  ];
  const h = head(2);
  const map = progress(frame, cues.line("w4"), 14) * (1 - progress(frame, groundAt - 4, 10));
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>3 · The world + the ground</Kicker>
      <Layout
        lines={cssLines(2, body, at, 4)}
        marks={[
          { from: h + 5, to: h + 5, at: r2, until: cues.line("w3") },
          { from: h + 3, to: h + 3, at: cues.line("w3"), until: cues.line("w4") },
          { from: h + 1, to: h + 1, at: cues.line("w4"), until: groundAt, label: "a map for the pieces" },
        ]}
        s={{ page: true, score: true, world: true, ground: frame >= groundAt + 30 }}
        k={{ radius, sky }}
        refresh={cues.word("w1", "appears")}
        codeAt={at}
      >
        {/* map overlay */}
        <div style={{ position: "absolute", left: 38, top: 122, width: 680, height: 230, opacity: map, backgroundImage: "linear-gradient(rgba(74,143,231,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(74,143,231,0.35) 1px, transparent 1px)", backgroundSize: "34px 34px", borderRadius: 14 }}>
          <div style={{ position: "absolute", left: 6, bottom: 6, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 18, color: C.css }}>↑ bottom · left →</div>
        </div>
      </Layout>
      <Knob label="border-radius" value={`${Math.round(radius)}px`} t={radius / 150} at={r2} out={cues.line("w3") - 6} />
      <Note at={cues.line("w3")} out={cues.line("w4") - 6}>
        background: {frame >= skyAt[2] ? "night" : frame >= skyAt[1] ? "sunset" : "daytime"} → the environment changes
      </Note>
      <Note at={cues.line("w4")} out={groundAt - 6}>
        position: relative = the game area becomes a map
      </Note>
      <Note at={groundAt + 30}>The ground: 40px tall, stuck to the bottom.</Note>
      <Sfx at={at} name="typing" volume={0.3} />
      <Sfx at={cues.word("w1", "appears")} name="whoosh" volume={0.3} />
      {skyAt.map((f) => (
        <Sfx key={f} at={f} name="pop" volume={0.35} />
      ))}
      <Sfx at={groundAt + 30} name="thunk" volume={0.4} />
    </SceneFade>
  );
};

const Player: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("player");
  const at = cues.line("p1");
  const w = interpolate(frame, [cues.line("p3"), cues.word("p3", "size"), cues.end("p3") + 10, cues.line("p4") - 4], [44, 120, 120, 44], { ...CLAMP, easing: EASE_IN_OUT });
  const p4 = cues.line("p4");
  const left = interpolate(frame, [p4, p4 + 20, cues.end("p4") + 4, cues.end("p4") + 20], [60, 400, 400, 60], { ...CLAMP, easing: EASE_IN_OUT });
  const bottom = interpolate(frame, [p4 + 14, p4 + 30, cues.end("p4") + 4, cues.end("p4") + 20], [50, 200, 200, 50], { ...CLAMP, easing: EASE_IN_OUT });
  const eyeAt = cues.word("p6", "eye");
  const legAt = cues.word("p6", "leg");
  const crashAt = cues.word("p7", "red");
  const body = [
    "#player {",
    "  position: absolute;",
    `  left: ${Math.round(left)}px;`,
    `  bottom: ${Math.round(bottom)}px;`,
    `  width: ${Math.round(w)}px;`,
    "  height: 52px;",
    "  background: var(--player);",
    "  border-radius: 14px 18px 6px 6px;",
    "}",
    { text: "#player::before { /* the eye */ }", at: eyeAt },
    { text: "#player::after  { /* the legs */ }", at: legAt },
    { text: "#player.crashed {", at: cues.line("p7") },
    { text: "  background: var(--danger);", at: cues.line("p7") + 6 },
    { text: "}", at: cues.line("p7") + 12 },
  ];
  const h = head(3);
  const word = (wd: string, nth = 0) => cues.word("p2", wd, nth);
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>4 · The player</Kicker>
      <Layout
        lines={cssLines(3, body, at, 4)}
        marks={[
          { from: h + 1, to: h + 1, at: word("absolute"), until: word("sixty") },
          { from: h + 2, to: h + 2, at: word("sixty"), until: word("fifty") },
          { from: h + 3, to: h + 3, at: word("fifty"), until: word("forty") },
          { from: h + 4, to: h + 4, at: word("forty"), until: word("two") },
          { from: h + 5, to: h + 5, at: word("two"), until: word("orange") },
          { from: h + 6, to: h + 6, at: word("orange"), until: cues.line("p3") },
          { from: h + 4, to: h + 4, at: cues.line("p3"), until: p4 },
          { from: h + 2, to: h + 3, at: p4, until: cues.line("p5") },
          { from: h + 3, to: h + 3, at: cues.word("p5", "bottom"), until: cues.line("p6"), label: "JavaScript will change this!" },
        ]}
        s={{ page: true, score: true, world: true, ground: true, player: true, eye: frame >= eyeAt, legs: frame >= legAt, crashed: frame >= crashAt }}
        k={{ playerWidth: w, playerLeft: left, playerBottom: bottom }}
        refresh={cues.word("p1", "player")}
        codeAt={at}
      />
      <Knob label="width" value={`${Math.round(w)}px`} t={(w - 30) / 100} at={cues.line("p3")} out={p4 - 6} />
      <Note at={p4} out={cues.line("p5") - 6}>
        Change the position → the object <span style={{ color: C.css }}>moves</span>.
      </Note>
      <Appear at={cues.line("p5")} out={cues.line("p6") - 6} kind="drop" style={{ position: "absolute", left: BR.left + 40, top: BR.top + BR.height + 100 }}>
        <div style={{ ...handStyle(40, C.ink), background: "#fff3a8", padding: "18px 26px", borderRadius: 6, boxShadow: SHADOW, transform: "rotate(-3deg)", width: 620 }}>
          Remember: JavaScript changes <b>bottom</b> 60 times a second. That's a jump!
        </div>
      </Appear>
      <Note at={cues.line("p6")} out={cues.line("p7") - 6}>
        ::before → the eye · ::after → the legs
      </Note>
      <Note at={crashAt}>
        class="crashed" → the dino turns <span style={{ color: C.danger }}>red</span>.
      </Note>
      <Sfx at={at} name="typing" volume={0.3} />
      <Sfx at={cues.word("p1", "player")} name="pop" volume={0.45} />
      <Sfx at={eyeAt} name="pop" volume={0.35} />
      <Sfx at={legAt} name="pop" volume={0.35} />
      <Sfx at={crashAt} name="thud" volume={0.4} />
    </SceneFade>
  );
};

const Obstacle: React.FC = () => {
  const cues = T.cuesFor("obstacle");
  const at = cues.line("b1");
  const body = [
    "#obstacle {",
    "  position: absolute;",
    "  left: 600px;",
    "  bottom: 40px;",
    "  width: 24px;",
    "  height: 50px;",
    "  background: var(--obstacle);",
    "  border-radius: 12px 12px 4px 4px;",
    "}",
    "#obstacle::before { /* left arm */ }",
    "#obstacle::after  { /* right arm */ }",
  ];
  const ideas = [
    { word: "rock", label: "a rock", el: <div style={{ width: 70, height: 46, background: "#8d8579", borderRadius: "40px 46px 10px 10px" }} /> },
    { word: "puddle", label: "a puddle", el: <div style={{ width: 90, height: 22, background: "#7fb6ef", borderRadius: "50%" }} /> },
    { word: "fence", label: "a fence", el: <div style={{ width: 80, height: 50, backgroundImage: "repeating-linear-gradient(90deg, #a0703f 0 12px, transparent 12px 22px)", borderTop: "8px solid #a0703f" }} /> },
  ];
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>5 · The obstacle</Kicker>
      <Layout lines={cssLines(4, body, at, 4)} s={{ ...ALL, messages: false, button: false, hidden: false, clouds: false }} refresh={cues.word("b1", "rectangle")} codeAt={at} />
      <div style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 110, width: BR.width, display: "flex", gap: 20 }}>
        {ideas.map((i) => (
          <Appear key={i.word} at={cues.word("b2", i.word)} kind="pop" style={{ flex: 1 }}>
            <div style={{ background: "white", borderRadius: 22, boxShadow: SHADOW, height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
              {i.el}
              <div style={{ ...handStyle(34, C.ink) }}>{i.label}</div>
            </div>
          </Appear>
        ))}
      </div>
      <Sfx at={at} name="typing" volume={0.3} />
      <Sfx at={cues.word("b1", "rectangle")} name="pop" volume={0.4} />
      {ideas.map((i) => (
        <Sfx key={i.word} at={cues.word("b2", i.word)} name="pop" volume={0.35} />
      ))}
    </SceneFade>
  );
};

const Clouds: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("clouds");
  const at = cues.line("k1");
  const driftFrom = cues.line("k2");
  const shift = frame > driftFrom ? ((frame - driftFrom) * 3) % 700 : 0;
  const body = [
    ".cloud {",
    "  position: absolute;",
    "  width: 90px;",
    "  height: 28px;",
    "  background: white;",
    "  border-radius: 20px;",
    "  animation: drift 18s linear infinite;",
    "}",
    "@keyframes drift {",
    "  from { left: 100%; }",
    "  to   { left: -100px; }",
    "}",
  ];
  const h = head(5);
  const space = cues.word("k3", "press");
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>6 · Clouds + CSS animation</Kicker>
      <Layout
        lines={cssLines(5, body, at, 4)}
        marks={[
          { from: h + 8, to: h + 11, at: cues.word("k1", "keyframes"), until: cues.line("k2"), label: "from here → to there" },
          { from: h + 6, to: h + 6, at: cues.line("k2"), until: cues.line("k3"), label: "forever" },
        ]}
        s={{ ...ALL, messages: false, button: false, hidden: false }}
        k={{ cloudShift: shift }}
        refresh={cues.word("k1", "clouds")}
        codeAt={at}
      />
      <Appear at={cues.line("k3")} kind="up" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 100, width: BR.width, display: "flex", alignItems: "center", gap: 30 }}>
        <SpaceKey pressed={frame > space && frame < space + 8} scale={0.8} />
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, color: C.inkSoft }}>…nothing reacts.</div>
      </Appear>
      <Appear at={cues.word("k4", "javascript")} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 230 }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 36, color: C.ink, background: C.js, padding: "12px 30px", borderRadius: 999 }}>Behaviour needs JavaScript</span>
      </Appear>
      <Sfx at={at} name="typing" volume={0.3} />
      <Sfx at={space} name="click" volume={0.5} />
      <Sfx at={cues.word("k4", "javascript")} name="thunk" volume={0.45} />
    </SceneFade>
  );
};

const Bug: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("bug");
  const at = cues.line("d1");
  const hideAt = cues.line("d2");
  const fixAt = cues.line("d6");
  const fixed = frame >= cues.word("d6", "wins") + 6;
  const body: CodeLine[] = [
    { text: "#message {", at: at + 6 },
    { text: "  position: absolute;", at: at + 10 },
    { text: "  inset: 0;", at: at + 14 },
    { text: "  display: flex;", at: at + 18 },
    { text: "}", at: at + 22 },
    { text: "button {", at: at + 26 },
    { text: "  background: var(--accent);", at: at + 30 },
    { text: "  border-radius: 999px;", at: at + 34 },
    { text: "}", at: at + 38 },
    { text: "button:hover {", at: at + 42 },
    { text: "  transform: translateY(-3px);", at: at + 46 },
    { text: "}", at: at + 50 },
    { text: ".hidden {", at: hideAt },
    { text: "  display: none;", at: hideAt + 6, until: fixAt + 8 },
    { text: "  display: none !important;", at: fixAt + 8 },
    { text: "}", at: hideAt + 12 },
  ];
  const lines: CodeLine[] = [...cssLines(6, [], at), ...body];
  const h = head(6) - 1;
  const hover = interpolate(frame, [cues.word("d1", "hover") - 4, cues.word("d1", "hover") + 6, cues.line("d2") - 10, cues.line("d2")], [0, 3, 3, 0], CLAMP);
  const scratch = cues.word("d3", "wait");
  const fight = progress(frame, cues.line("d4"), 16) * (1 - progress(frame, cues.line("d6") - 6, 12));
  const idWins = pop(frame, fps, cues.word("d4", "wins"));
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>7 · Messages, the button + a real bug</Kicker>
      <Layout
        lines={lines}
        marks={[
          { from: h + 13, to: h + 14, at: hideAt + 8, until: scratch, label: "hide anything with class hidden" },
          { from: h + 4, to: h + 4, at: cues.line("d4"), until: fixAt, color: "rgba(214,69,69,0.18)", label: "#message says: flex" },
          { from: h + 13, to: h + 15, at: cues.line("d4"), until: fixAt, color: "rgba(214,69,69,0.18)" },
          { from: h + 14, to: h + 14, at: fixAt + 8, label: "!important = this rule wins" },
        ]}
        s={{ ...ALL, hidden: fixed }}
        k={{ buttonLift: hover }}
        scroll={[
          [hideAt - 5, 0],
          [hideAt + 10, 4],
        ]}
        refresh={cues.word("d6", "wins") + 4}
        codeAt={at}
      />
      <Pointer
        size={38}
        style={{
          position: "absolute",
          left: BR.left + 380,
          top: BR.top + 330,
          opacity: interpolate(frame, [cues.word("d1", "hover") - 8, cues.word("d1", "hover") - 2, cues.line("d2") - 6, cues.line("d2")], [0, 1, 1, 0], CLAMP),
        }}
      />
      <Appear at={scratch} out={cues.line("d4") - 4} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 110, width: BR.width }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.danger, background: "white", borderRadius: 24, padding: "16px 26px", boxShadow: SHADOW }}>Still showing?! Why?</div>
      </Appear>
      {/* the fight */}
      <div style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 100, width: BR.width, display: "flex", alignItems: "center", gap: 20, opacity: fight }}>
        <div style={{ flex: 1.4, background: C.html, color: "white", borderRadius: 22, padding: "16px 20px", fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 26, transform: `scale(${1 + 0.12 * idWins})`, boxShadow: SHADOW }}>
          #message
          <div style={{ fontFamily: QUICKSAND, fontSize: 22 }}>display: flex · an id</div>
        </div>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 36, color: C.ink }}>vs</div>
        <div style={{ flex: 1, background: "white", color: C.css, border: `3px solid ${C.css}`, borderRadius: 22, padding: "12px 18px", fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 22, transform: `scale(${1 - 0.15 * idWins})` }}>
          .hidden
          <div style={{ fontFamily: QUICKSAND, fontSize: 18 }}>display: none · a class</div>
        </div>
      </div>
      <Appear at={cues.word("d4", "wins")} out={cues.line("d6") - 6} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 230 }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, color: "white", background: C.ink, padding: "10px 26px", borderRadius: 999 }}>The id is more specific → it wins</span>
      </Appear>
      <Appear at={cues.word("d6", "disappears")} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 120, width: BR.width }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: C.good, background: "white", borderRadius: 24, padding: "16px 26px", boxShadow: SHADOW }}>Fixed! That's debugging.</div>
      </Appear>
      <Sfx at={at} name="typing" volume={0.3} />
      <Sfx at={hideAt} name="typing" volume={0.3} />
      <Sfx at={scratch} name="thud" volume={0.5} />
      <Sfx at={cues.word("d4", "wins")} name="pop" volume={0.4} />
      <Sfx at={fixAt + 8} name="typing" volume={0.3} />
      <Sfx at={cues.word("d6", "disappears")} name="chime" volume={0.4} />
    </SceneFade>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("outro");
  const wipe = interpolate(frame, [cues.line("o1"), cues.line("o1") + 40], [1, 0], { ...CLAMP, easing: EASE_IN_OUT });
  const press = cues.word("o2", "space");
  const shrink = progress(frame, cues.line("o4") - 6, 20, EASE_IN_OUT);
  const end = cues.end("o6") + 20;
  return (
    <SceneFade duration={cues.duration} fadeOut={20}>
      <Kicker at={4}>Plain structure → styled game</Kicker>
      <div style={{ position: "absolute", left: interpolate(shrink, [0, 1], [310, 110]), top: 160, transformOrigin: "top left", transform: `scale(${1 - shrink * 0.32})` }}>
        <Browser width={1300} height={720}>
          <div style={{ position: "absolute", inset: 0 }}>
            <PlainPage parts={{ title: true, score: true, area: true, pieces: true, start: true, gameOver: true }} />
          </div>
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 0 ${wipe * 100}%)` }}>
            <Fit width={1300}>
              <StyledPage s={ALL} />
            </Fit>
          </div>
        </Browser>
      </div>
      <Appear at={cues.line("o2")} out={cues.line("o4") - 6} kind="up" style={{ position: "absolute", left: 0, right: 0, top: 920, display: "flex", justifyContent: "center", alignItems: "center", gap: 30 }}>
        <SpaceKey pressed={frame > press && frame < press + 10} scale={0.8} />
        <Appear at={cues.word("o3", "nothing")} kind="fade">
          <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.inkSoft }}>…nothing happens.</span>
        </Appear>
      </Appear>
      <Appear at={cues.line("o4")} kind="right" style={{ position: "absolute", left: 1040, top: 180, width: 780 }}>
        <div style={{ background: "white", borderRadius: 30, padding: 30, boxShadow: SHADOW, display: "flex", alignItems: "center", gap: 30 }}>
          <svg width={260} height={140} viewBox="0 0 260 140">
            <path d="M 20 95 L 30 60 Q 40 40 70 40 L 160 40 Q 185 40 200 62 L 235 70 Q 250 74 250 90 L 250 100 L 20 100 Z" fill={C.css} />
            <circle cx={70} cy={104} r={22} fill={C.ink} />
            <circle cx={200} cy={104} r={22} fill={C.ink} />
            <rect x={150} y={52} width={42} height={24} rx={4} fill="white" stroke={C.danger} strokeWidth={3} strokeDasharray="5 4" />
          </svg>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 36, color: C.ink }}>
            A beautiful car… with <span style={{ color: C.danger }}>no engine</span>.
          </div>
        </div>
      </Appear>
      <Appear at={cues.line("o5")} kind="right" style={{ position: "absolute", left: 1040, top: 470, width: 780 }}>
        <div style={{ background: C.ink, color: "white", borderRadius: 30, padding: "30px 40px", boxShadow: SHADOW }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.accent }}>YOUR CHALLENGE</div>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, marginTop: 10 }}>Change the :root colours to match your paper design.</div>
          <div style={{ display: "flex", gap: 14, marginTop: 20 }}>
            {["#9b5de5", "#f15bb5", "#fee440", "#00bbf9", "#00f5d4"].map((c) => (
              <div key={c} style={{ width: 54, height: 54, borderRadius: 16, background: c }} />
            ))}
          </div>
        </div>
      </Appear>
      <EndCard at={end} done={3} next="Video 4 · Make It Come Alive: JavaScript" />
      <Sfx at={cues.line("o1")} name="whoosh" volume={0.35} />
      <Sfx at={press} name="click" volume={0.5} />
      <Sfx at={cues.line("o4")} name="pop" volume={0.35} />
      <Sfx at={end} name="chime" volume={0.45} />
    </SceneFade>
  );
};

const SCENES: Record<string, React.FC> = {
  intro: Intro,
  rule: Rule,
  colours: Colours,
  page: PageStep,
  world: World,
  player: Player,
  obstacle: Obstacle,
  clouds: Clouds,
  bug: Bug,
  outro: Outro,
};

export const Video3: React.FC = () => <VideoShell timeline={T} scenes={SCENES} voDir="video3/vo" />;
