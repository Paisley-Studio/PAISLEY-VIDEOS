import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, handStyle, Kicker, Marker, pop, progress, SceneFade, Sfx } from "../shared/anim";
import { Browser, CodeEditor, CodeLine, CodeMark, EndCard, SaveRefresh, Stepper, TitleCard } from "../shared/Code";
import { FULL_SKETCH, PaperSketch } from "../shared/PaperSketch";
import { Fit, PlainPage, PlainParts, StyledPage } from "../shared/Pages";
import { Pointer } from "../shared/Props";
import { createTimeline, VideoScript } from "../shared/timeline";
import { VideoShell } from "../shared/VideoShell";
import { C, QUICKSAND, SHADOW } from "../shared/theme";
import script from "./script.json";
import timings from "./vo-timings.json";

// VIDEO 2 — Build the Structure: HTML

const T = createTimeline(script as VideoScript, timings);
export const VIDEO2_FRAMES = T.TOTAL_FRAMES;

// ---------- The <body> as it grows, step by step ----------
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const BODY: { t: string; s: Step }[] = [
  { t: '<main id="game">', s: 0 },
  { t: "  <!-- 1. The title -->", s: 1 },
  { t: "  <h1>Dino Runner</h1>", s: 1 },
  { t: "  <!-- 2. The score -->", s: 2 },
  { t: '  <div id="score-board">', s: 2 },
  { t: '    <span>Score: <span id="score">0</span></span>', s: 2 },
  { t: "  </div>", s: 2 },
  { t: "  <!-- 3. The game area -->", s: 3 },
  { t: '  <div id="game-area">', s: 3 },
  { t: '    <div class="cloud cloud-one"></div>', s: 4 },
  { t: '    <div class="cloud cloud-two"></div>', s: 4 },
  { t: '    <div id="player"></div>', s: 4 },
  { t: '    <div id="obstacle"></div>', s: 4 },
  { t: '    <div id="ground"></div>', s: 4 },
  { t: '    <p id="start-text">Press SPACE to start</p>', s: 5 },
  { t: '    <div id="message" class="hidden">', s: 6 },
  { t: "      <h2>Game Over</h2>", s: 6 },
  { t: '      <button id="restart-button">Play Again</button>', s: 6 },
  { t: "    </div>", s: 6 },
  { t: "  </div>", s: 3 },
  { t: "</main>", s: 0 },
];

/** Lines up to `step`; the lines of `step` itself type in at the given frames. */
const bodyLines = (step: Step, ats: number[] | ((i: number) => number)): CodeLine[] => {
  let k = 0;
  return BODY.filter((l) => l.s <= step).map((l) => {
    if (l.s !== step) return { text: l.t };
    const at = typeof ats === "function" ? ats(k) : ats[Math.min(k, ats.length - 1)] + (k >= ats.length ? (k - ats.length + 1) * 6 : 0);
    k += 1;
    return { text: l.t, at };
  });
};

const lineIndex = (step: Step, text: string) => BODY.filter((l) => l.s <= step).findIndex((l) => l.t.includes(text));

const ED = { left: 70, top: 160, width: 1060, height: 800 };
const BR = { left: 1170, top: 160, width: 680, height: 560 };

/** Editor + browser + stepper layout used by every build step. */
const BuildLayout: React.FC<{
  step: Step;
  lines: CodeLine[];
  marks?: CodeMark[];
  parts: PlainParts;
  refresh: number;
  codeAt: number;
  resultAt: number;
  inspect?: number;
  outline?: number;
  browserExtra?: React.ReactNode;
}> = ({ lines, marks, parts, refresh, codeAt, resultAt, inspect, outline, browserExtra }) => (
  <>
    <Appear at={0} kind="left" style={{ position: "absolute", left: ED.left, top: ED.top }}>
      <CodeEditor file="index.html" lang="html" lines={lines} marks={marks} width={ED.width} height={ED.height} fontSize={20} />
    </Appear>
    <Appear at={4} kind="right" style={{ position: "absolute", left: BR.left, top: BR.top }}>
      <Browser width={BR.width} height={BR.height} refreshAt={[refresh]}>
        <PlainPage parts={parts} inspect={inspect} outline={outline} />
        {browserExtra}
      </Browser>
    </Appear>
    <Appear at={8} kind="up" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 40 }}>
      <Stepper steps={["CODE", "BROWSER", "RESULT"]} marks={[codeAt, refresh, resultAt]} color={C.html} />
    </Appear>
  </>
);

const Caption: React.FC<{ at: number; out?: number; children: React.ReactNode; color?: string }> = ({ at, out, children, color = C.ink }) => (
  <Appear at={at} out={out} kind="up" style={{ position: "absolute", left: BR.left, width: BR.width, top: BR.top + BR.height + 120 }}>
    <div style={{ background: "white", borderRadius: 24, padding: "18px 26px", boxShadow: SHADOW, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, color }}>{children}</div>
  </Appear>
);

// ---------------- Scenes ----------------

const Intro: React.FC = () => {
  const cues = T.cuesFor("intro");
  const items = ["player", "obstacles", "ground", "score", "buttons", "game area"];
  return (
    <SceneFade duration={cues.duration}>
      <TitleCard number={2} title="Build the Structure" subtitle="HTML" color={C.html} out={cues.word("i1", "planned") - 6} />
      <Appear at={cues.word("i1", "planned")} kind="left" style={{ position: "absolute", left: 90, top: 200 }}>
        <PaperSketch p={FULL_SKETCH} width={900} />
      </Appear>
      <Appear at={cues.word("i3", "exists")} kind="right" style={{ position: "absolute", left: 1080, top: 230, width: 750 }}>
        <div style={{ background: "white", borderRadius: 30, padding: "36px 40px", boxShadow: SHADOW, borderTop: `10px solid ${C.html}` }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.inkSoft }}>QUESTION 1</div>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 60, color: C.ink, margin: "6px 0 24px" }}>What exists?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {items.map((it, i) => (
              <Appear key={it} at={cues.word("i3", "exists") + 10 + i * 5} kind="pop">
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, padding: "10px 24px", borderRadius: 999, background: `${C.html}22`, border: `2px solid ${C.html}` }}>{it}</div>
              </Appear>
            ))}
          </div>
        </div>
      </Appear>
      <Appear at={cues.word("i4", "html")} kind="pop" style={{ position: "absolute", left: 1080, top: 640, width: 750, textAlign: "center" }}>
        <div style={{ background: C.html, color: "white", borderRadius: 26, padding: "22px 30px", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, boxShadow: SHADOW }}>
          HTML creates the things that exist
        </div>
      </Appear>
      <Sfx at={cues.word("i1", "planned")} name="whoosh" volume={0.3} />
      {items.map((it, i) => (
        <Sfx key={it} at={cues.word("i3", "exists") + 10 + i * 5} name="tick" volume={0.3} />
      ))}
      <Sfx at={cues.word("i4", "html")} name="thunk" volume={0.5} />
    </SceneFade>
  );
};

const Files: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("files");
  const slide = progress(frame, cues.line("f4") - 4, 22, EASE_IN_OUT);
  const rows = [
    { name: "index.html", job: "the things that EXIST", color: C.html, word: "pieces" },
    { name: "style.css", job: "how they LOOK", color: C.css, word: "good" },
    { name: "script.js", job: "what they DO", color: C.js, word: "things" },
  ];
  const dbl = cues.word("f4", "double");
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Open the project</Kicker>
      <div style={{ position: "absolute", left: interpolate(slide, [0, 1], [460, 90]), top: 270, width: 1000 }}>
        <Appear at={cues.line("f1")} kind="pop">
          <div style={{ background: "white", borderRadius: 30, padding: "40px 50px", boxShadow: SHADOW }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.ink, marginBottom: 26 }}>
              <svg width={56} height={46} viewBox="0 0 56 46">
                <path d="M 2 8 Q 2 2 8 2 L 22 2 L 28 9 L 48 9 Q 54 9 54 15 L 54 40 Q 54 44 50 44 L 6 44 Q 2 44 2 40 Z" fill={C.accent} />
              </svg>
              dino-game/
            </div>
            {rows.map((r, i) => (
              <Appear key={r.name} at={cues.line("f1") + 10 + i * 6} kind="left" style={{ display: "flex", alignItems: "center", gap: 22, marginLeft: 40, marginBottom: 20 }}>
                <div style={{ width: 26, height: 32, borderRadius: 6, background: r.color }} />
                <div style={{ fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 40, color: C.ink, width: 300 }}>{r.name}</div>
                <Appear at={cues.word("f3", r.word)} kind="pop">
                  <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, color: r.color === C.js ? C.ink : "white", background: r.color, padding: "8px 22px", borderRadius: 999 }}>
                    ← {r.job}
                  </div>
                </Appear>
              </Appear>
            ))}
          </div>
        </Appear>
      </div>
      <Pointer
        size={46}
        style={{
          position: "absolute",
          left: interpolate(frame, [dbl - 20, dbl - 4], [700, 330], { ...CLAMP, easing: EASE_IN_OUT }),
          top: interpolate(frame, [dbl - 20, dbl - 4], [900, 430], { ...CLAMP, easing: EASE_IN_OUT }),
          opacity: interpolate(frame, [dbl - 22, dbl - 16, dbl + 20, dbl + 28], [0, 1, 1, 0], CLAMP),
          transform: (frame > dbl && frame < dbl + 4) || (frame > dbl + 7 && frame < dbl + 11) ? "scale(0.88)" : "none",
        }}
      />
      <Appear at={dbl + 10} kind="right" style={{ position: "absolute", left: 1150, top: 230 }}>
        <Browser width={700} height={520} refreshAt={[dbl + 10]}>
          <div />
        </Browser>
      </Appear>
      <Appear at={cues.word("f5", "blank")} kind="pop" style={{ position: "absolute", left: 1150, top: 780, width: 700, textAlign: "center" }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.ink }}>
          A blank page. <Marker at={cues.word("f5", "fix")}>Let's fix that.</Marker>
        </span>
      </Appear>
      {rows.map((r) => (
        <Sfx key={r.name} at={cues.word("f3", r.word)} name="pop" volume={0.35} />
      ))}
      <Sfx at={dbl} name="click" volume={0.5} />
      <Sfx at={dbl + 8} name="click" volume={0.5} />
      <Sfx at={dbl + 10} name="whoosh" volume={0.3} />
    </SceneFade>
  );
};

const STARTER: string[] = [
  "<!DOCTYPE html>",
  '<html lang="en">',
  "<head>",
  '  <meta charset="UTF-8">',
  '  <meta name="viewport" content="width=device-width">',
  "  <title>Dino Runner</title>",
  "",
  "  <!-- The Quicksand font from Google Fonts -->",
  '  <link rel="stylesheet" href="https://fonts.googleapis.com/...">',
  "",
  "  <!-- Connect our CSS file (how things LOOK) -->",
  '  <link rel="stylesheet" href="style.css">',
  "</head>",
  "<body>",
  "",
  "  <!-- THE GAME: everything lives inside this box -->",
  '  <main id="game">',
  "",
  "    <!-- VIDEO 2: We build the pieces of our game here.",
  "         Look at your paper plan. What needs to EXIST?",
  "",
  "         1. The title",
  "         2. The score",
  "         3. The game area (the world)",
  "              - clouds, the player, the obstacle, the ground",
  "              - the start message",
  "              - the Game Over message + restart button",
  "    -->",
  "",
  "  </main>",
  "",
  "  <!-- Connect our JavaScript file (what things DO) -->",
  '  <script src="script.js"></script>',
  "</body>",
  "</html>",
];

const Tour: React.FC = () => {
  const cues = T.cuesFor("tour");
  const toBody = cues.line("u3");
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Tour the starter file</Kicker>
      <Appear at={cues.line("u1")} kind="up" style={{ position: "absolute", left: 210, top: 150 }}>
        <CodeEditor
          file="index.html"
          lang="html"
          lines={STARTER.map((text) => ({ text }))}
          width={1500}
          height={840}
          fontSize={22}
          scroll={[
            [toBody - 6, 0],
            [toBody + 18, 11],
          ]}
          marks={[
            { from: 2, to: 12, at: cues.word("u2", "head"), until: toBody - 4, label: "the HEAD: information about the page" },
            { from: 13, to: 13, at: toBody + 18, until: cues.line("u4"), label: "the BODY: what you see" },
            { from: 16, to: 16, at: cues.line("u4"), until: cues.line("u5"), label: "one empty box called game" },
            { from: 29, to: 29, at: cues.line("u4"), until: cues.line("u5") },
            { from: 18, to: 27, at: cues.word("u5", "comment"), label: "a comment: a note for us" },
          ]}
        />
      </Appear>
      <Appear at={cues.word("u6", "plan")} kind="pop" style={{ position: "absolute", right: 120, top: 560 }}>
        <div style={{ ...handStyle(52, C.dino), background: "white", padding: "16px 28px", borderRadius: 22, boxShadow: SHADOW, transform: "rotate(-4deg)" }}>
          ← our paper plan, as a to-do list!
        </div>
      </Appear>
      <Sfx at={cues.word("u2", "head")} name="tick" volume={0.4} />
      <Sfx at={toBody} name="whoosh" volume={0.25} />
      <Sfx at={cues.line("u4")} name="tick" volume={0.4} />
      <Sfx at={cues.word("u5", "comment")} name="tick" volume={0.4} />
      <Sfx at={cues.word("u6", "plan")} name="pop" volume={0.4} />
    </SceneFade>
  );
};

const Tags: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("tags");
  const parts = [
    { text: "<h1>", color: C.html, label: "opening tag", word: "opening" },
    { text: "Dino Runner", color: C.ink, label: "content", word: "content" },
    { text: "</h1>", color: C.html, label: "closing tag (with a slash)", word: "closing" },
  ];
  const boxAt = cues.word("g3", "boxes");
  const toBox = progress(frame, boxAt - 6, 20, EASE_IN_OUT);
  const lid = pop(frame, fps, boxAt + 10, 12);
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>HTML is made of tags</Kicker>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - toBox, transform: `translateY(${toBox * -60}px)` }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          {parts.map((p) => (
            <div key={p.text} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Appear at={p.word === "opening" ? cues.line("g1") : cues.word("g2", p.word)} kind="pop">
                <div style={{ fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 110, color: p.color }}>{p.text}</div>
              </Appear>
              <Appear at={cues.word("g2", p.word)} kind="up" style={{ marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: "100%", minWidth: 200, height: 18, borderBottom: `5px solid ${p.color}`, borderLeft: `5px solid ${p.color}`, borderRight: `5px solid ${p.color}`, borderRadius: "0 0 12px 12px" }} />
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 36, color: p.color, marginTop: 14 }}>{p.label}</div>
              </Appear>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: toBox }}>
        <div style={{ position: "relative", width: 620, height: 380, marginTop: 80 }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: "#e8c79a", borderRadius: 24, boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 62, color: C.ink, opacity: 1 - lid * 0.3 }}>Dino Runner</div>
          </div>
          <div
            style={{
              position: "absolute",
              left: -20,
              right: -20,
              top: 30,
              height: 70,
              background: "#d9b07c",
              borderRadius: 18,
              transformOrigin: "left bottom",
              transform: `translateY(${-lid * 60}px) rotate(${-lid * 12}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 44, color: "white", background: C.html, padding: "2px 20px", borderRadius: 10 }}>h1</div>
          </div>
        </div>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 50, color: C.ink, marginTop: 40 }}>
          A tag is a <Marker at={boxAt}>labelled box</Marker>.
        </div>
      </AbsoluteFill>
      {parts.map((p) => (
        <Sfx key={p.word} at={cues.word("g2", p.word)} name="pop" volume={0.35} />
      ))}
      <Sfx at={boxAt + 10} name="thunk" volume={0.45} />
    </SceneFade>
  );
};

const TitleStep: React.FC = () => {
  const cues = T.cuesFor("title");
  const codeAt = cues.word("t1", "title");
  const refresh = cues.word("t3", "refresh");
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Step 1 · The title</Kicker>
      <BuildLayout
        step={1}
        lines={bodyLines(1, [codeAt])}
        marks={[{ from: lineIndex(1, "<h1>"), to: lineIndex(1, "<h1>"), at: cues.word("t2", "h1"), until: refresh, label: "h1 = heading number one" }]}
        parts={{}}
        refresh={refresh}
        codeAt={codeAt}
        resultAt={refresh + 12}
        browserExtra={<RevealPage at={refresh} parts={{ title: true }} />}
      />
      <Caption at={refresh + 12} out={cues.line("t4") - 6}>
        We have now created the <span style={{ color: C.html }}>title</span>.
      </Caption>
      <Appear at={cues.line("t4")} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 125 }}>
        <SaveRefresh at={cues.line("t4")} />
      </Appear>
      <Sfx at={codeAt} name="typing" volume={0.3} />
      <Sfx at={refresh} name="click" volume={0.5} />
      <Sfx at={refresh + 6} name="pop" volume={0.45} />
    </SceneFade>
  );
};

/** Shows page parts only after the browser has been refreshed. */
const RevealPage: React.FC<{ at: number; parts: PlainParts; inspect?: number; outline?: number }> = ({ at, parts, inspect, outline }) => {
  const frame = useCurrentFrame();
  if (frame < at + 4) return null;
  return (
    <AbsoluteFill style={{ background: "white" }}>
      <PlainPage parts={parts} inspect={inspect} outline={outline} />
    </AbsoluteFill>
  );
};

const ScoreStep: React.FC = () => {
  const cues = T.cuesFor("score");
  const codeAt = cues.word("s1", "score");
  const refresh = cues.line("s2") - 6;
  const idLine = lineIndex(2, 'id="score"');
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Step 2 · The score</Kicker>
      <BuildLayout
        step={2}
        lines={bodyLines(2, [codeAt])}
        marks={[
          { from: lineIndex(2, "score-board"), to: lineIndex(2, "score-board"), at: cues.word("s2", "div"), until: cues.word("s2", "span"), label: "div = a box" },
          { from: idLine, to: idLine, at: cues.word("s2", "span"), until: cues.line("s3"), label: "span = a small box for text" },
          { from: idLine, to: idLine, at: cues.line("s3"), label: 'id="score" = a NAME TAG' },
        ]}
        parts={{ title: true }}
        refresh={refresh}
        codeAt={codeAt}
        resultAt={refresh + 12}
        browserExtra={<RevealPage at={refresh} parts={{ title: true, score: true }} />}
      />
      <Appear at={cues.word("s3", "tag")} kind="drop" style={{ position: "absolute", left: BR.left + 150, top: BR.top + 150 }}>
        <div style={{ background: C.accent, borderRadius: 14, padding: "8px 18px", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, color: C.ink, transform: "rotate(-6deg)", boxShadow: SHADOW }}>
          HELLO my name is <span style={{ fontFamily: "Consolas, monospace" }}>score</span>
        </div>
      </Appear>
      <Caption at={cues.word("s4", "find")}>
        <span style={{ color: C.js }}>JavaScript</span> will find it by its name.
      </Caption>
      <Sfx at={codeAt} name="typing" volume={0.3} />
      <Sfx at={refresh} name="click" volume={0.5} />
      <Sfx at={cues.word("s3", "tag")} name="thunk" volume={0.5} />
    </SceneFade>
  );
};

const AreaStep: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("area");
  const codeAt = cues.word("a1", "empty");
  const refresh = cues.line("a2") - 4;
  const outline = progress(frame, cues.word("a2", "there"), 12);
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Step 3 · The game area</Kicker>
      <BuildLayout
        step={3}
        lines={bodyLines(3, [codeAt, codeAt + 6, codeAt + 12])}
        parts={{ title: true, score: true }}
        refresh={refresh}
        codeAt={codeAt}
        resultAt={cues.word("a2", "there")}
        browserExtra={<RevealPage at={refresh} parts={{ title: true, score: true, area: true }} outline={outline} />}
      />
      <Appear at={cues.word("a3", "nesting") - 20} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 110 }}>
        <div style={{ background: "white", borderRadius: 24, padding: "18px 24px", boxShadow: SHADOW, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ border: `4px solid ${C.ink}`, borderRadius: 14, padding: 10, fontFamily: "Consolas, monospace", fontSize: 18, fontWeight: 700 }}>
            main
            <div style={{ border: `4px solid ${C.html}`, borderRadius: 10, padding: 8, marginTop: 6 }}>
              game-area
              <div style={{ border: `4px dashed ${C.css}`, borderRadius: 8, padding: "4px 8px", marginTop: 6, color: C.css }}>player…</div>
            </div>
          </div>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, color: C.ink }}>
            Boxes inside boxes
            <br />= <Marker at={cues.word("a3", "nesting")}>nesting</Marker>
          </div>
        </div>
      </Appear>
      <Sfx at={codeAt} name="typing" volume={0.3} />
      <Sfx at={refresh} name="click" volume={0.5} />
      <Sfx at={cues.word("a3", "nesting") - 20} name="pop" volume={0.4} />
    </SceneFade>
  );
};

const PiecesStep: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("pieces");
  const ats = [cues.word("p2", "clouds"), cues.word("p2", "clouds") + 6, cues.word("p2", "player"), cues.word("p2", "obstacle"), cues.word("p2", "ground")];
  const refresh = cues.word("p3", "refresh");
  const menuAt = cues.word("p5", "right");
  const inspectAt = cues.word("p5", "inspect");
  const hoverAt = cues.word("p5", "hover");
  const devtools = progress(frame, inspectAt + 4, 14, EASE_IN_OUT);
  const inspect = progress(frame, hoverAt, 8);
  const classAt = cues.word("p6", "class");
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Step 4 · Fill the world</Kicker>
      <BuildLayout
        step={4}
        lines={bodyLines(4, ats)}
        marks={[
          { from: lineIndex(4, "cloud-one"), to: lineIndex(4, "cloud-two"), at: classAt, label: "class = a group" },
          { from: lineIndex(4, "player"), to: lineIndex(4, "player"), at: cues.word("p6", "unique"), label: "id = one unique thing" },
        ]}
        parts={{ title: true, score: true, area: true }}
        refresh={refresh}
        codeAt={ats[0]}
        resultAt={hoverAt}
        browserExtra={
          <>
            <RevealPage at={refresh} parts={{ title: true, score: true, area: true, pieces: true }} inspect={inspect} />
            {/* right-click menu */}
            <div
              style={{
                position: "absolute",
                left: 300,
                top: 250,
                width: 220,
                background: "white",
                borderRadius: 12,
                boxShadow: SHADOW,
                padding: 8,
                fontFamily: QUICKSAND,
                fontWeight: 600,
                fontSize: 22,
                opacity: interpolate(frame, [menuAt, menuAt + 4, inspectAt + 6, inspectAt + 10], [0, 1, 1, 0], CLAMP),
              }}
            >
              {["Back", "Reload", "Save as…", "Inspect"].map((item) => (
                <div key={item} style={{ padding: "8px 14px", borderRadius: 8, background: item === "Inspect" && frame >= inspectAt ? C.css : "transparent", color: item === "Inspect" && frame >= inspectAt ? "white" : C.ink }}>
                  {item}
                </div>
              ))}
            </div>
            {/* devtools panel */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: 230,
                background: "#1f2430",
                transform: `translateY(${(1 - devtools) * 240}px)`,
                padding: "14px 20px",
                fontFamily: "Consolas, monospace",
                fontSize: 19,
                lineHeight: 1.55,
                color: "#c9d1d9",
              }}
            >
              <div style={{ color: "#8b949e", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 16, letterSpacing: 2, marginBottom: 6 }}>ELEMENTS</div>
              <div>{'▾ <div id="game-area">'}</div>
              <div style={{ paddingLeft: 24 }}>{'<div class="cloud cloud-one"></div>'}</div>
              <div style={{ paddingLeft: 24, background: inspect > 0 ? "rgba(74,143,231,0.45)" : "transparent", borderRadius: 4 }}>{'<div id="player"></div>'}</div>
              <div style={{ paddingLeft: 24 }}>{'<div id="obstacle"></div>'}</div>
              <div style={{ paddingLeft: 24 }}>{'<div id="ground"></div>'}</div>
            </div>
          </>
        }
      />
      <Pointer
        size={40}
        style={{
          position: "absolute",
          left: interpolate(frame, [menuAt - 14, menuAt, hoverAt - 10, hoverAt], [BR.left + 600, BR.left + 290, BR.left + 290, BR.left + 200], { ...CLAMP, easing: EASE_IN_OUT }),
          top: interpolate(frame, [menuAt - 14, menuAt, inspectAt - 6, inspectAt, hoverAt - 10, hoverAt], [BR.top + 500, BR.top + 300, BR.top + 300, BR.top + 450, BR.top + 450, BR.top + 450], { ...CLAMP, easing: EASE_IN_OUT }),
          opacity: interpolate(frame, [menuAt - 16, menuAt - 10, cues.end("p5"), cues.end("p5") + 8], [0, 1, 1, 0], CLAMP),
        }}
      />
      <Caption at={cues.word("p3", "nothing")} out={cues.line("p5") - 4}>
        Invisible... but they <span style={{ color: C.html }}>exist</span>.
      </Caption>
      <Caption at={cues.word("p5", "exists")} out={classAt - 4}>
        Inspect: there it is!
      </Caption>
      {ats.map((at, i) => (
        <Sfx key={i} at={at} name="tick" volume={0.35} />
      ))}
      <Sfx at={refresh} name="click" volume={0.5} />
      <Sfx at={menuAt} name="click" volume={0.5} />
      <Sfx at={inspectAt} name="click" volume={0.5} />
      <Sfx at={hoverAt} name="pop" volume={0.4} />
    </SceneFade>
  );
};

const MessagesStep: React.FC = () => {
  const cues = T.cuesFor("messages");
  const startAt = cues.word("m1", "start");
  const goAt = cues.word("m2", "game");
  const refresh1 = cues.word("m1", "begin");
  const refresh2 = cues.word("m2", "click");
  const msgLine = lineIndex(6, 'class="hidden"');
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Steps 5 + 6 · Messages and the button</Kicker>
      <BuildLayout
        step={6}
        lines={bodyLines(6, (i) => goAt + i * 7).map((l) => (l.text.includes("start-text") ? { text: l.text, at: startAt } : l))}
        marks={[{ from: msgLine, to: msgLine, at: cues.word("m3", "hidden"), label: 'class="hidden" does nothing... yet' }]}
        parts={{ title: true, score: true, area: true, pieces: true }}
        refresh={refresh2}
        codeAt={startAt}
        resultAt={refresh2 + 10}
        browserExtra={
          <>
            <RevealPage at={refresh1} parts={{ title: true, score: true, area: true, pieces: true, start: true }} />
            <RevealPage at={refresh2} parts={{ title: true, score: true, area: true, pieces: true, start: true, gameOver: true }} />
          </>
        }
      />
      <Caption at={cues.word("m3", "showing")} out={cues.line("m4") - 4}>
        Still showing. That's okay, for now!
      </Caption>
      <Caption at={cues.line("m4")}>
        <span style={{ color: C.css }}>CSS</span> hides it · <span style={{ color: C.js }}>JavaScript</span> shows it.
      </Caption>
      <Sfx at={startAt} name="typing" volume={0.3} />
      <Sfx at={goAt} name="typing" volume={0.3} />
      <Sfx at={refresh1} name="click" volume={0.45} />
      <Sfx at={refresh2} name="click" volume={0.45} />
    </SceneFade>
  );
};

const Compare: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("compare");
  const k = 820 / 1300;
  const links = [
    { word: "dinosaur", from: [330, 490], code: '<div id="player">', y: 300 },
    { word: "obstacle", from: [822, 500], code: '<div id="obstacle">', y: 420 },
    { word: "score", from: [1030, 225], code: '<span id="score">', y: 540 },
    { word: "restart", from: [995, 730], code: '<button id="restart-button">', y: 660 },
  ];
  const chipX = 1180;
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Compare with the plan</Kicker>
      <Appear at={0} kind="left" style={{ position: "absolute", left: 80, top: 230 }}>
        <PaperSketch p={FULL_SKETCH} width={820} />
      </Appear>
      <Appear at={cues.line("c1")} kind="fade" style={{ position: "absolute", left: chipX, top: 200, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, color: C.inkSoft, letterSpacing: 3 }}>
        IN OUR HTML
      </Appear>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        {links.map((l) => {
          const at = cues.word("c2", l.word);
          const p = progress(frame, at, 16, EASE_IN_OUT);
          const x1 = 80 + l.from[0] * k;
          const y1 = 230 + l.from[1] * k;
          const x2 = chipX - 10;
          const y2 = l.y + 34;
          return (
            <path
              key={l.word}
              d={`M ${x1} ${y1} C ${x1 + 200} ${y1}, ${x2 - 200} ${y2}, ${x2} ${y2}`}
              stroke={C.html}
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - p}
            />
          );
        })}
      </svg>
      {links.map((l) => (
        <Appear key={l.word} at={cues.word("c2", l.word) + 12} kind="pop" style={{ position: "absolute", left: chipX, top: l.y }}>
          <div style={{ fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 32, background: "white", border: `3px solid ${C.html}`, color: C.html, padding: "12px 22px", borderRadius: 16, boxShadow: SHADOW }}>
            {l.code}
          </div>
        </Appear>
      ))}
      <Appear at={cues.line("c3")} kind="up" style={{ position: "absolute", left: 0, right: 0, top: 830, textAlign: "center" }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 54, color: C.ink }}>
          Every single thing we drew <Marker at={cues.word("c3", "exists")}>now exists.</Marker>
        </span>
      </Appear>
      <AbsoluteFill style={{ background: C.canvas, opacity: 0.92 * progress(frame, cues.line("c4") - 4, 14), justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700, color: C.ink, opacity: progress(frame, cues.line("c4"), 12) }}>
          <div style={{ fontSize: 56, color: C.inkSoft }}>
            Not pretty. <span style={{ opacity: progress(frame, cues.word("c4", "move"), 10) }}>Doesn't move.</span>
          </div>
          <div style={{ fontSize: 110, marginTop: 20, opacity: progress(frame, cues.word("c4", "exist", 0) - 2, 10) }}>
            HTML makes things <span style={{ color: C.html }}>exist</span>.
          </div>
        </div>
      </AbsoluteFill>
      {links.map((l) => (
        <Sfx key={l.word} at={cues.word("c2", l.word) + 12} name="pop" volume={0.35} />
      ))}
      <Sfx at={cues.line("c4")} name="whoosh" volume={0.3} />
    </SceneFade>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("outro");
  const items = ["Dino Runner title", "Score: 0", "Press SPACE to start", "Game Over", "Play Again button", "Inspect: player, obstacle, ground, 2 clouds"];
  const morph = progress(frame, cues.word("o4", "real"), 24, EASE_IN_OUT);
  const end = cues.end("o4") + 20;
  return (
    <SceneFade duration={cues.duration} fadeOut={20}>
      <Kicker at={4}>Checkpoint</Kicker>
      <Appear at={cues.line("o1")} kind="left" style={{ position: "absolute", left: 100, top: 180, width: 820 }}>
        <div style={{ background: "white", borderRadius: 30, padding: "36px 44px", boxShadow: SHADOW }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: C.ink, marginBottom: 20 }}>Your page shows:</div>
          {items.map((it, i) => {
            const at = cues.line("o1") + 20 + i * 10;
            const tick = pop(frame, fps, at, 12);
            return (
              <div key={it} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16, opacity: Math.min(1, tick * 2) }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: C.good, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${tick})` }}>
                  <svg width={24} height={24} viewBox="0 0 34 34">
                    <path d="M 6 18 L 14 26 L 28 8" stroke="white" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, color: C.ink }}>{it}</div>
              </div>
            );
          })}
          <Appear at={cues.word("o2", "checkpoint")} kind="pop" style={{ marginTop: 18 }}>
            <span style={{ fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 24, background: C.canvasDeep, padding: "8px 16px", borderRadius: 10 }}>
              stuck? compare with checkpoints/video-2-html/
            </span>
          </Appear>
        </div>
      </Appear>
      <Appear at={cues.line("o3")} kind="right" style={{ position: "absolute", left: 1000, top: 180, width: 820 }}>
        <div style={{ background: C.ink, color: "white", borderRadius: 30, padding: "30px 40px", boxShadow: SHADOW }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.accent }}>MINI CHALLENGE</div>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, marginTop: 10, lineHeight: 1.4 }}>
            Change the title to <span style={{ color: C.accent }}>your</span> game's name.
            <br />
            Change the button text.
          </div>
        </div>
      </Appear>
      <Appear at={cues.line("o4")} kind="up" style={{ position: "absolute", left: 1000, top: 470 }}>
        <Browser width={820} height={470}>
          <div style={{ position: "absolute", inset: 0, opacity: 1 - morph }}>
            <PlainPage parts={{ title: true, score: true, area: true, pieces: true, start: true, gameOver: true }} />
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: morph }}>
            <Fit width={820}>
              <StyledPage s={{ page: true, score: true, world: true, ground: true, player: true, eye: true, legs: true, obstacle: true, clouds: true, messages: true, button: true, hidden: true }} />
            </Fit>
          </div>
        </Browser>
      </Appear>
      <EndCard at={end} done={2} next="Video 3 · Make It Look Like a Game: CSS" />
      <Sfx at={cues.word("o4", "real")} name="whoosh" volume={0.35} />
      <Sfx at={end} name="chime" volume={0.45} />
    </SceneFade>
  );
};

const SCENES: Record<string, React.FC> = {
  intro: Intro,
  files: Files,
  tour: Tour,
  tags: Tags,
  title: TitleStep,
  score: ScoreStep,
  area: AreaStep,
  pieces: PiecesStep,
  messages: MessagesStep,
  compare: Compare,
  outro: Outro,
};

export const Video2: React.FC = () => <VideoShell timeline={T} scenes={SCENES} voDir="video2/vo" />;
