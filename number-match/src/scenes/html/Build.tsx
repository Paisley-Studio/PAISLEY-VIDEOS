import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_IN_OUT, map, pop, progress } from "../../lib/anim";
import { between, dedent, EMMET, HTML, HTML_LESSON2 } from "../../lib/course";
import { simulateGame } from "../../lib/gameSim";
import { Cursor } from "../../components/Cursor";
import { GameBrowser } from "../../components/GamePage";
import { centre, CodeCard, EndCard, IdeStage, Label, ring, SceneFade, StageTitle, typedChars } from "../../components/Lesson";
import { IDE_RECTS } from "../../components/PaisleyIDE";
import { PlainPage } from "../../components/PlainPage";
import { Backdrop } from "../../components/Stage";
import { Sfx } from "../../components/Sfx";
import { C, QUICKSAND } from "../../styles/theme";
import { TL } from "./timeline";

const FILES = [
  { name: "Number Match", kind: "project" as const },
  { name: "index.html", kind: "html" as const },
];

/** 2.5 What each line of the boilerplate means. */
export const Boilerplate: React.FC = () => {
  const c = TL.cuesFor("boilerplate");
  const FS = 28;
  const lineH = Math.round(FS * 1.55);
  const top = 110;
  const y = (n: number) => top + 58 + 14 + (n - 1) * lineH + lineH / 2 - 26;
  const L = (id: string) => c.line(id);
  const marks = [
    { from: 1, to: 1, at: L("b2"), until: L("b3") },
    { from: 2, to: 2, at: L("b3"), until: L("b4") },
    { from: 11, to: 11, at: L("b3"), until: L("b4") },
    { from: 3, to: 7, at: L("b4"), until: L("b5") },
    { from: 4, to: 4, at: L("b5"), until: L("b6") },
    { from: 5, to: 5, at: L("b6"), until: L("b7") },
    { from: 6, to: 6, at: L("b7"), until: L("b8") },
    { from: 8, to: 10, at: L("b8"), until: L("b9") },
    { from: 8, to: 8, at: L("b9"), color: "rgba(227,36,43,0.22)" },
    { from: 10, to: 10, at: L("b9"), color: "rgba(20,147,107,0.25)" },
  ];
  const lx = 1430;
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={12} speed={0.2} />
      <StageTitle at={0} y={28}>
        The HTML starter, line by line
      </StageTitle>
      <div style={{ position: "absolute", left: 60, top }}>
        <CodeCard file="index.html" lang="html" lines={EMMET} fontSize={FS} width={1340} marks={marks} />
      </div>
      <Label at={L("b2")} out={L("b3")} x={lx} y={y(1)}>modern HTML</Label>
      <Label at={L("b3")} out={L("b4")} x={lx} y={y(2)}>the whole page</Label>
      <Label at={c.word("b3", "lang")} out={L("b4")} x={lx} y={y(2) + 70} color={C.mint}>lang = English</Label>
      <Label at={L("b4")} out={L("b5")} x={lx} y={y(5)}>info about the page</Label>
      <Label at={L("b5")} out={L("b6")} x={lx} y={y(4)}>letters & symbols</Label>
      <Label at={L("b6")} out={L("b7")} x={lx} y={y(5)}>fits every screen</Label>
      <Label at={L("b7")} out={L("b8")} x={lx} y={y(6)}>name on the tab</Label>
      <Label at={L("b8")} out={L("b9")} x={lx} y={y(9)}>what we SEE</Label>
      <Label at={c.word("b9", "opening")} x={lx} y={y(8)} color={C.html}>opening tag</Label>
      <Label at={c.word("b9", "closing")} x={lx} y={y(10)} color={C.css}>closing tag  /</Label>
      {[L("b2"), L("b3"), L("b4"), L("b5"), L("b6"), L("b7"), L("b8"), L("b9")].map((f, i) => (
        <Sfx key={i} name="tick" at={f} />
      ))}
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 2.6 Give the page a title. */
export const TitleStep: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("title");
  const sel = c.word("t2", "select");
  const typeAt = c.word("t2", "type") + 4;
  const name = "Number Match";
  const n = Math.floor(interpolate(frame, [typeAt, typeAt + 26], [0, name.length], CLAMP));
  const replaced = frame >= typeAt;
  const lines = EMMET.map((l) => (l.includes("<title>") ? `    <title>${replaced ? name.slice(0, n) : "My page"}</title>` : l));
  const tabs = pop(frame, fps, c.line("t3") - 6, 14);
  const tabTitle = frame >= c.line("t3") + 10 ? "Number Match" : "My page";
  return (
    <AbsoluteFill>
      <IdeStage
        cam={[{ f: 0, z: 1.9, x: 620, y: 260 }]}
        ide={{
          files: FILES,
          activeFile: "index.html",
          code: {
            lang: "html",
            lines,
            fontSize: 22,
            selection: frame >= sel && !replaced ? { line: 6, from: 11, to: 18 } : null,
            caret: replaced ? { line: 6, col: 11 + n } : null,
          },
          previewBlank: true,
        }}
      >
        {frame >= c.line("t3") - 6 && (
          <div style={{ position: "absolute", left: 360, top: 800, transform: `scale(${tabs})`, display: "flex", gap: 6, fontFamily: QUICKSAND, fontWeight: 700 }}>
            {["Homework", "Music", tabTitle, "Maps"].map((t, i) => (
              <div
                key={i}
                style={{
                  width: 280,
                  height: 70,
                  borderRadius: "16px 16px 0 0",
                  background: i === 2 ? C.white : "#cfe0da",
                  color: C.ink,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "0 20px",
                  fontSize: 28,
                  outline: i === 2 ? `5px solid ${C.gold}` : undefined,
                }}
              >
                {i === 2 && <span style={{ width: 26, height: 26, borderRadius: 7, background: C.red, color: C.white, fontSize: 18, display: "grid", placeItems: "center" }}>N</span>}
                {t}
              </div>
            ))}
          </div>
        )}
      </IdeStage>
      <Sfx name="click" at={sel} />
      <Sfx name="typing" at={typeAt} dur={28} />
      <Sfx name="pop" at={c.line("t3") - 6} />
      <Sfx name="pop-high" at={c.line("t3") + 10} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

// ---------- 2.7 the structure, group by group ----------

const cut = (start: string, end: string) => dedent(between(HTML, start, end));
const GROUPS: { line: string; code: string[] }[] = [
  { line: "s2", code: ['<main class="app-shell">', "", "  <!-- everything goes in here -->", "", "</main>"] },
  { line: "s3", code: cut('<header class="topbar">', "</header>") },
  { line: "s4", code: cut('<section class="hero">', "</section>") },
  { line: "s6", code: ['<section class="game-panel" aria-label="Memory game">', "", "  <!-- the game lives here -->", "", "</section>"] },
  { line: "s7", code: [...cut('<div class="game-toolbar">', "</button>"), "</div>"] },
  { line: "s8", code: cut('<div class="stats"', '<strong id="timer">').concat(["  </div>", "</div>"]) },
  { line: "s10", code: cut('<div class="progress-track"', "</div>").concat(["</div>"]) },
  { line: "s11", code: cut('<div class="game-grid"', "game-grid") },
  { line: "s12", code: cut('<div class="game-message"', "</div>") },
  { line: "s13", code: cut('<footer class="footer">', "</footer>") },
  { line: "s14", code: cut('<div class="win-overlay"', "Brilliant matching").concat(["    ...", "  </div>", "</div>"]) },
];

type Box = { id: string; x: number; y: number; w: number; h: number; label: string; line: string; color?: string };
const BOXES: Box[] = [
  { id: "body", x: 0, y: 0, w: 760, h: 860, label: "<body>", line: "s1", color: C.mint },
  { id: "main", x: 20, y: 50, w: 720, h: 640, label: "<main class=\"app-shell\">", line: "s2" },
  { id: "header", x: 40, y: 100, w: 680, h: 60, label: "<header>  N NUMBERMATCH", line: "s3" },
  { id: "hero", x: 40, y: 175, w: 680, h: 95, label: "<section class=\"hero\">", line: "s4" },
  { id: "h1", x: 220, y: 212, w: 320, h: 46, label: "<h1> Ready to match?", line: "s5" },
  { id: "panel", x: 40, y: 285, w: 680, h: 330, label: "<section class=\"game-panel\">", line: "s6" },
  { id: "toolbar", x: 60, y: 325, w: 640, h: 44, label: "select · Restart", line: "s7" },
  { id: "stats", x: 60, y: 380, w: 640, h: 44, label: "#moves  #matched  #timer", line: "s8" },
  { id: "progress", x: 60, y: 435, w: 640, h: 24, label: "progress", line: "s10" },
  { id: "grid", x: 60, y: 470, w: 640, h: 90, label: "#gameGrid  (empty for now)", line: "s11", color: C.gold },
  { id: "message", x: 60, y: 570, w: 640, h: 34, label: "#gameMessage", line: "s12" },
  { id: "footer", x: 40, y: 630, w: 680, h: 44, label: "<footer>", line: "s13" },
  { id: "win", x: 20, y: 710, w: 720, h: 130, label: "#winOverlay  (celebration screen)", line: "s14", color: C.red },
];

export const Structure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("structure");
  const current = [...GROUPS].reverse().find((g) => frame >= c.line(g.line) - 6) ?? null;
  const startOf = current ? c.line(current.line) - 6 : 0;
  const nesting = c.line("s15");
  const codeIn = progress(frame, startOf, 10);

  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={14} speed={0.2} />
      <StageTitle at={0} y={28}>
        Building the game's structure
      </StageTitle>
      {current && frame < nesting && (
        <div style={{ position: "absolute", left: 60, top: 120, opacity: codeIn, transform: `translateY(${(1 - codeIn) * 20}px)` }}>
          <CodeCard file="index.html" lang="html" lines={current.code} fontSize={24} width={1000} chars={typedChars(current.code, frame, startOf + 4, startOf + 4 + Math.min(70, current.code.join("").length / 2))} />
        </div>
      )}
      {frame >= c.line("s9") && frame < c.line("s10") - 6 && <Label at={c.line("s9")} x={360} y={840} size={34}>id = a unique name JavaScript can find</Label>}
      {/* box diagram */}
      <div style={{ position: "absolute", left: frame >= nesting ? interpolate(frame, [nesting, nesting + 20], [1110, 580], { ...CLAMP, easing: EASE_IN_OUT }) : 1110, top: 110 - 14, transform: "scale(0.98)", transformOrigin: "0 0" }}>
        {BOXES.map((b) => {
          const appear = b.line === "s1" ? 0 : c.line(b.line) + 4;
          if (frame < appear) return null;
          const s = pop(frame, fps, appear, 14);
          const isCurrent = current?.line === b.line || (b.id === "h1" && frame >= c.line("s5") && frame < c.line("s6"));
          const flashNest = frame >= nesting ? interpolate(frame, [nesting + 24 + BOXES.indexOf(b) * 5, nesting + 34 + BOXES.indexOf(b) * 5], [0, 1], CLAMP) : 0;
          const color = b.color ?? C.white;
          return (
            <div
              key={b.id}
              style={{
                position: "absolute",
                left: b.x,
                top: b.y,
                width: b.w,
                height: b.h,
                border: `${isCurrent || flashNest > 0.5 ? 5 : 3}px solid ${isCurrent ? C.gold : color}`,
                borderRadius: 10,
                boxSizing: "border-box",
                background: isCurrent ? "rgba(255,194,61,0.12)" : "transparent",
                transform: `scale(${0.85 + 0.15 * s})`,
                opacity: Math.min(1, s * 1.5),
                fontFamily: QUICKSAND,
                fontWeight: 700,
                fontSize: 20,
                color: isCurrent ? C.gold : color,
                padding: "6px 10px",
              }}
            >
              {b.label}
              {b.id === "stats" && frame >= c.line("s9") && (
                <span style={{ marginLeft: 12, color: C.gold }}>← ids</span>
              )}
            </div>
          );
        })}
      </div>
      {frame >= nesting + 10 && (
        <Label at={c.word("s15", "nesting")} x={960} y={30} anchor="center" size={40}>
          BOXES INSIDE BOXES = NESTING
        </Label>
      )}
      {GROUPS.map((g) => (
        <React.Fragment key={g.line}>
          <Sfx name="typing" at={c.line(g.line) - 2} dur={Math.min(60, 20 + g.code.length * 4)} volume={0.8} />
          <Sfx name="thunk" at={c.line(g.line) + 4} volume={0.8} />
        </React.Fragment>
      ))}
      <Sfx name="sparkle" at={nesting + 24} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 2.8 Save and Run → the plain page appears. */
export const RunStep: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("run");
  const save = c.word("r1", "save");
  const run = c.word("r2", "run");
  const look = c.line("r3");
  const ran = frame >= run + 4;
  const sr = IDE_RECTS.save;
  const rr = IDE_RECTS.run;
  return (
    <AbsoluteFill>
      <IdeStage
        cam={[
          { f: 0, z: 1.7, x: 1600, y: 200 },
          { f: run + 10, z: 1.7, x: 1600, y: 200 },
          { f: look, z: 1.45, x: 1420, y: 520 },
          { f: c.line("r4") + 30, z: 1 },
        ]}
        ide={{
          files: FILES,
          activeFile: "index.html",
          code: { lang: "html", lines: HTML_LESSON2, scroll: 0 },
          preview: ran ? <PlainPage scale={1.35} /> : undefined,
          previewBlank: !ran,
          press: {
            save: interpolate(frame, [save, save + 3, save + 8], [0, 1, 0], CLAMP),
            run: interpolate(frame, [run, run + 3, run + 8], [0, 1, 0], CLAMP),
          },
          focus: [
            { target: "save", amount: ring(frame, save - 6, run - 4), label: "SAVE", labelSide: "below" },
            { target: "run", amount: ring(frame, run - 4, look), label: "RUN", labelSide: "below" },
            { target: { x: 1116, y: 175, w: 430, h: 58 }, amount: ring(frame, c.word("r3", "heading"), c.word("r3", "stats")), label: "heading", labelSide: "left" },
            { target: { x: 1116, y: 403, w: 260, h: 78 }, amount: ring(frame, c.word("r3", "stats"), c.word("r3", "buttons")), label: "stats", labelSide: "left" },
            { target: { x: 1116, y: 343, w: 300, h: 60 }, amount: ring(frame, c.word("r3", "buttons"), c.word("r3", "message")), label: "buttons", labelSide: "left" },
            { target: { x: 1116, y: 480, w: 330, h: 30 }, amount: ring(frame, c.word("r3", "message"), c.line("r4")), label: "message", labelSide: "left" },
          ],
        }}
        overlay={
          <Cursor
            keys={[
              { f: 0, x: 1400, y: 500 },
              { f: save - 2, x: centre(sr).x, y: centre(sr).y },
              { f: save, x: centre(sr).x, y: centre(sr).y, click: true },
              { f: run - 2, x: centre(rr).x, y: centre(rr).y },
              { f: run, x: centre(rr).x, y: centre(rr).y, click: true },
            ]}
            scale={1.2}
            hideAt={look}
          />
        }
      />
      <Sfx name="click" at={save} />
      <Sfx name="save" at={save + 2} />
      <Sfx name="click" at={run} />
      <Sfx name="run" at={run + 2} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 2.9 Closing: plain page → colourful design teaser → end card. */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("outro");
  const wipeAt = c.word("o4", "colour");
  const wipe = progress(frame, wipeAt, 30, EASE_IN_OUT);
  const sim = simulateGame([3, 1, 5, 2, 6, 4, 1, 3, 4, 6, 2, 5], [1, 6, 3, 10].map((i, k) => ({ f: k * 10, i })));
  const push = interpolate(frame, [0, c.line("o5")], [1, 1.06], CLAMP);
  return (
    <AbsoluteFill>
      <Backdrop count={12} seed={19} speed={0.3} />
      <div style={{ position: "absolute", left: 310, top: 50, width: 1300, height: 840, transform: `scale(${push})`, borderRadius: 18, overflow: "hidden", background: C.white, boxShadow: `0 14px 0 ${C.night2}` }}>
        <div style={{ position: "absolute", inset: 0, padding: 10 }}>
          <PlainPage scale={1.6} />
        </div>
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
          <GameBrowser width={1300} height={840} zoom={0.64} scrollY={240} chrome={false} state={sim.at(60)} />
        </div>
        {wipe > 0 && wipe < 1 && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wipe * 100}%`, width: 12, background: C.gold }} />}
      </div>
      <Label at={c.line("o3")} out={wipeAt} x={960} y={900} anchor="center" size={34}>
        something is missing...
      </Label>
      <Sfx name="whoosh" at={wipeAt} />
      <Sfx name="sparkle" at={wipeAt + 20} />
      <EndCard at={c.line("o5")} next="Lesson 3 · CSS: Making the Game Beautiful" nextColor={C.css} />
      <Sfx name="sting" at={c.line("o5") + 4} />
      <AbsoluteFill style={{ background: "#000", opacity: map(frame, [c.duration - 16, c.duration], [0, 1]) }} />
    </AbsoluteFill>
  );
};
