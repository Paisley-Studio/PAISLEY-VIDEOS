import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_FLIP, EASE_IN_OUT, map, pop, progress, typed } from "../../lib/anim";
import { HTML_LESSON3, JS } from "../../lib/course";
import { Click, simulateGame } from "../../lib/gameSim";
import { Cursor, CursorKey } from "../../components/Cursor";
import { emptyState, GameBrowser, PAGE } from "../../components/GamePage";
import { centre, Chip, IdeStage, Label, ring, SceneFade } from "../../components/Lesson";
import { NumberMatchLogo, PaisleyBadge } from "../../components/Brand";
import { NumberCard } from "../../components/NumberCard";
import { fileRowRect, IDE_RECTS } from "../../components/PaisleyIDE";
import { PlainPage } from "../../components/PlainPage";
import { Backdrop, Sparks } from "../../components/Stage";
import { GameSounds, Sfx } from "../../components/Sfx";
import { C, QUICKSAND } from "../../styles/theme";
import { TL } from "./timeline";

const DECK = [2, 5, 1, 6, 3, 4, 5, 1, 4, 2, 6, 3];
const FILES = [
  { name: "Number Match", kind: "project" as const },
  { name: "index.html", kind: "html" as const },
  { name: "style.css", kind: "css" as const },
  { name: "script.js", kind: "js" as const },
];
const idx = (n: number, nth = 0) => DECK.reduce<number[]>((a, v, i) => (v === n ? [...a, i] : a), [])[nth];

/** 6.2 Save and Run. */
export const SaveRun: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("ide");
  const save = c.word("i3", "save", 1);
  const run = c.word("i3", "run");
  const sim = useMemo(() => simulateGame(DECK, []), []);
  const sr = IDE_RECTS.save;
  const rr = IDE_RECTS.run;
  return (
    <AbsoluteFill>
      <IdeStage
        enter
        cam={[
          { f: c.line("i3") - 10, z: 1 },
          { f: c.line("i3") + 6, z: 1.6, x: 1600, y: 300 },
        ]}
        ide={{
          files: FILES,
          activeFile: "script.js",
          code: { lang: "js", lines: JS.slice(0, 30) },
          preview: frame >= run + 4 ? <GameBrowser width={810} height={970} zoom={0.6} scrollY={70} chrome={false} state={sim.at(0)} /> : undefined,
          previewBlank: frame < run + 4,
          press: { save: interpolate(frame, [save, save + 3, save + 8], [0, 1, 0], CLAMP), run: interpolate(frame, [run, run + 3, run + 8], [0, 1, 0], CLAMP) },
          focus: [{ target: { x: 0, y: 176, w: 300, h: 130 }, amount: ring(frame, c.line("i2"), c.line("i3")), label: "ALL FINISHED", labelSide: "right" }],
        }}
        overlay={
          <Cursor
            keys={[
              { f: c.line("i3") - 10, x: 1300, y: 600 },
              { f: save - 2, x: centre(sr).x, y: centre(sr).y },
              { f: save, x: centre(sr).x, y: centre(sr).y, click: true },
              { f: run - 2, x: centre(rr).x, y: centre(rr).y },
              { f: run, x: centre(rr).x, y: centre(rr).y, click: true },
            ]}
            scale={1.2}
            showFrom={c.line("i3") - 10}
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

// browser placement for the test
const BW = 1100;
const BH = 860;
const BL = 60;
const BT = 70;
const ZOOM = 0.5;
const SCROLL = 280;
const cardCentre = (i: number) => ({
  x: (BW - PAGE.width * ZOOM) / 2 + (PAGE.shellX + 26 + (i % 4) * (PAGE.cardW + PAGE.gap) + PAGE.cardW / 2) * ZOOM,
  y: 52 + (PAGE.gridTop + Math.floor(i / 4) * (PAGE.cardH + PAGE.gap) + PAGE.cardH / 2 - SCROLL) * ZOOM,
});

/** 6.3 The tester's checklist. */
export const Test: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("test");
  const L = (id: string) => c.line(id);
  const clicks: Click[] = useMemo(() => {
    const cl: Click[] = [
      { f: L("t2") + 20, i: idx(2) },
      { f: L("t2") + 44, i: idx(5) }, // flip (miss)
      { f: L("t3") + 10, i: idx(1) },
      { f: L("t3") + 30, i: idx(1, 1) }, // match
      { f: L("t4") + 10, i: idx(6) },
      { f: L("t4") + 30, i: idx(3) }, // miss
    ];
    let f = L("t7") + 4;
    for (const n of [2, 5, 6, 3, 4]) {
      cl.push({ f, i: idx(n) }, { f: f + 9, i: idx(n, 1) });
      f += 20;
    }
    return cl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const sim = useMemo(() => simulateGame(DECK, clicks), [clicks]);
  const again = c.word("t8", "play");
  const easyAt = c.word("t8", "easy");
  const restarted = frame >= again + 6;
  const easyDeck = [3, 1, 4, 2, 1, 3, 2, 4];
  const state = restarted ? simulateGame(frame >= easyAt + 4 ? easyDeck : DECK, []).at(0) : sim.at(frame);
  const items: [string, number][] = [
    ["Cards flip", L("t2") + 50],
    ["A matching pair stays", L("t3") + 36],
    ["A wrong pair flips back", L("t4") + 60],
    ["Moves counter", L("t5") + 30],
    ["Timer", L("t6") + 20],
    ["Celebration screen", (sim.winFrame ?? 0) + 14],
    ["Play again", again + 10],
    ["Difficulty", easyAt + 10],
  ];
  const keys: CursorKey[] = [{ f: L("t2"), x: BW * 0.8, y: BH * 0.9 }];
  for (const cl of clicks) {
    const p = cardCentre(cl.i);
    keys.push({ f: cl.f - 8, x: p.x + 8, y: p.y + 14 }, { f: cl.f, x: p.x, y: p.y, click: true });
  }
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={301} speed={0.2} />
      <div style={{ position: "absolute", left: BL, top: BT }}>
        <GameBrowser
          width={BW}
          height={BH}
          zoom={ZOOM}
          scrollY={SCROLL}
          state={state}
          overlayScale={1.2}
          rings={{ moves: ring(frame, L("t5"), L("t6")), time: ring(frame, L("t6"), L("t7")), toolbar: ring(frame, easyAt - 4, easyAt + 40) }}
        >
          <div style={{ position: "absolute", left: 0, top: -52 }}>
            <Cursor keys={keys} scale={1.1} hideAt={sim.winFrame ?? undefined} />
          </div>
        </GameBrowser>
      </div>
      <div style={{ position: "absolute", left: 1220, top: 90, width: 640, background: C.white, borderRadius: 24, padding: "26px 30px", fontFamily: QUICKSAND, fontWeight: 700, boxShadow: `0 10px 0 ${C.night2}` }}>
        <div style={{ fontSize: 34, color: C.green, letterSpacing: "0.06em", marginBottom: 14 }}>TESTER'S CHECKLIST</div>
        {items.map(([t, f]) => {
          const done = frame >= f;
          const p = progress(frame, f, 10);
          return (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 18, padding: "11px 0", fontSize: 30, color: done ? C.ink : C.muted }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, border: `4px solid ${done ? C.match : "#c6d6d1"}`, background: done ? C.match : C.white, display: "grid", placeItems: "center", color: C.white, fontSize: 28, transform: `scale(${1 + 0.25 * (p > 0 && p < 1 ? 1 - p : 0)})` }}>{done ? "✓" : ""}</div>
              {t}
            </div>
          );
        })}
      </div>
      <GameSounds sounds={sim.sounds} until={again} />
      {items.map(([t, f]) => (
        <Sfx key={t} name="tick" at={f} />
      ))}
      <Sfx name="click" at={again} />
      <Sfx name="whoosh-short" at={again + 4} />
      <Sfx name="click" at={easyAt} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 6.4 Debugging practice: styles.css vs style.css. */
export const Debug: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("debug");
  const L = (id: string) => c.line(id);
  const runBroken = c.word("d3", "run");
  const fixAt = L("d6") + 4;
  const save = c.word("d6", "save");
  const run2 = c.word("d6", "run");
  const fixed = frame >= fixAt + 10;
  const lines = HTML_LESSON3.slice(0, HTML_LESSON3.indexOf("</head>") + 1).map((l) => (l.includes('rel="stylesheet" href="style.css"') && !fixed ? l.replace("style.css", "styles.css") : l));
  const linkLine = lines.findIndex((l) => l.includes('rel="stylesheet" href="sty')) + 1;
  const sim = useMemo(() => simulateGame(DECK, []), []);
  const preview = frame >= run2 + 4 ? <GameBrowser width={810} height={970} zoom={0.6} scrollY={70} chrome={false} state={sim.at(0)} /> : frame >= runBroken + 4 ? <PlainPage scale={1.3} /> : undefined;
  const hunt = L("d4");
  const sr = IDE_RECTS.save;
  const rr = IDE_RECTS.run;
  return (
    <AbsoluteFill>
      <IdeStage
        cam={[
          { f: 0, z: 1 },
          { f: L("d2"), z: 1.5, x: 720, y: 330 },
          { f: runBroken - 6, z: 1 },
          { f: L("d5"), z: 1.5, x: 560, y: 330 },
          { f: save - 10, z: 1 },
        ]}
        ide={{
          files: [
            { name: "Debugging practice", kind: "project" },
            { name: "index.html", kind: "html" },
            { name: "style.css", kind: "css" },
          ],
          activeFile: "index.html",
          code: {
            lang: "html",
            lines,
            fontSize: 20,
            marks: frame >= L("d2") ? [{ from: linkLine, to: linkLine, color: fixed ? "rgba(20,147,107,0.25)" : "rgba(227,36,43,0.22)" }] : [],
            caret: frame >= fixAt - 10 && frame < fixAt + 40 ? { line: linkLine, col: lines[linkLine - 1].indexOf("css") - (fixed ? 1 : 0) } : null,
          },
          preview,
          previewBlank: !preview,
          press: {
            run: Math.max(interpolate(frame, [runBroken, runBroken + 3, runBroken + 8], [0, 1, 0], CLAMP), interpolate(frame, [run2, run2 + 3, run2 + 8], [0, 1, 0], CLAMP)),
            save: interpolate(frame, [save, save + 3, save + 8], [0, 1, 0], CLAMP),
          },
          focus: [
            { target: fileRowRect(2), amount: ring(frame, L("d5"), L("d6")), label: "style.css", labelSide: "right" },
            { target: "preview", amount: ring(frame, runBroken + 10, hunt), label: "NO COLOURS!", labelSide: "left" },
          ],
        }}
        overlay={
          <Cursor
            keys={[
              { f: 0, x: 1300, y: 700 },
              { f: runBroken - 4, x: centre(rr).x, y: centre(rr).y },
              { f: runBroken, x: centre(rr).x, y: centre(rr).y, click: true },
              { f: fixAt - 6, x: 700, y: 360 },
              { f: fixAt, x: 700, y: 360, click: true },
              { f: save - 4, x: centre(sr).x, y: centre(sr).y },
              { f: save, x: centre(sr).x, y: centre(sr).y, click: true },
              { f: run2 - 4, x: centre(rr).x, y: centre(rr).y },
              { f: run2, x: centre(rr).x, y: centre(rr).y, click: true },
            ]}
            scale={1.2}
          />
        }
      >
        <div style={{ position: "absolute", left: 150, top: 790 }}>
          <Chip size={28} color={C.gold}>PRACTICE PROJECT</Chip>
        </div>
        <Label at={c.word("d4", "html")} out={L("d5")} x={1180} y={640} size={32} color={C.match}>HTML ✓</Label>
        <Label at={c.word("d4", "css")} out={L("d5")} x={1180} y={720} size={32} color={C.match}>CSS ✓</Label>
        <Label at={c.word("d4", "link")} out={L("d5")} x={1180} y={800} size={32} color={C.red}>the link ✗</Label>
        <Label at={L("d5") + 10} out={L("d6")} x={1180} y={720} size={40} color={C.red}>styles.css ≠ style.css</Label>
        <Label at={c.word("d7", "debugging")} x={960} y={30} anchor="center" size={36}>DEBUGGING = finding and fixing mistakes</Label>
      </IdeStage>
      <Sfx name="click" at={runBroken} />
      <Sfx name="uh-oh" at={runBroken + 8} />
      <Sfx name="tick" at={c.word("d4", "html")} />
      <Sfx name="tick" at={c.word("d4", "css")} />
      <Sfx name="pop-low" at={c.word("d4", "link")} />
      <Sfx name="key" at={fixAt} />
      <Sfx name="click" at={save} />
      <Sfx name="save" at={save + 2} />
      <Sfx name="click" at={run2} />
      <Sfx name="sparkle" at={run2 + 6} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

const CHALLENGES: { line: string; title: string; where: string; demo: (p: number) => React.ReactNode }[] = [
  { line: "c2", title: "Background colour", where: "style.css · body", demo: (p) => <div style={{ width: 200, height: 110, borderRadius: 14, background: p > 0.5 ? "#fff3d6" : C.page, border: `3px solid ${C.mint}` }} /> },
  { line: "c3", title: "New heading", where: "index.html · <h1>", demo: (p) => <div style={{ fontSize: 30, color: C.green }}>{p > 0.5 ? "Let's play!" : "Ready to match?"}</div> },
  { line: "c4", title: "Font weights", where: "style.css · font-weight", demo: () => <div style={{ fontSize: 34, color: C.green }}>{[300, 500, 700].map((w) => <span key={w} style={{ fontWeight: w, marginRight: 14 }}>Aa</span>)}</div> },
  { line: "c5", title: "Number of pairs", where: "index.html · <option> (max 8)", demo: (p) => <Chip size={24} color={C.mint}>{p > 0.5 ? "Easy · 3 pairs" : "Easy · 4 pairs"}</Chip> },
  { line: "c6", title: "Card size", where: "style.css · .app-shell / .game-grid", demo: (p) => <NumberCard number={5} width={70 + 30 * p} angle={180} variant="hero" /> },
  { line: "c7", title: "Card back colour", where: "style.css · .card-back", demo: (p) => <NumberCard number={5} width={80} angle={0} variant="hero" backColor={p > 0.5 ? "#6b3fa0" : C.green} /> },
  { line: "c8", title: "Your own version", where: "all three files", demo: () => <div style={{ display: "flex", gap: 10, fontSize: 40 }}>{["A", "★", "●"].map((t) => <span key={t} style={{ width: 60, height: 76, borderRadius: 12, border: `4px solid ${C.red}`, display: "grid", placeItems: "center", color: C.red }}>{t}</span>)}</div> },
];

/** 6.5 Seven creative challenges. */
export const Challenge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("challenge");
  return (
    <AbsoluteFill>
      <Backdrop count={10} seed={321} speed={0.25} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 58, color: C.white, opacity: progress(frame, 0, 14) }}>
        Make it <span style={{ color: C.gold }}>yours</span>!
      </div>
      {CHALLENGES.map((ch, i) => {
        const at = c.line(ch.line);
        const s = pop(frame, fps, at, 13);
        if (frame < at) return null;
        const flip = 180 * EASE_FLIP(Math.min(1, (frame - at) / 17));
        const hot = i === CHALLENGES.length - 1 ? frame < c.line("c9") : frame < c.line(CHALLENGES[i + 1].line);
        const demoP = progress(frame, at + 30, 20, EASE_IN_OUT);
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = row === 0 ? 70 + col * 450 : 295 + col * 450;
        const y = 140 + row * 400;
        return (
          <div key={ch.line} style={{ position: "absolute", left: x, top: y, width: 420, height: 370, perspective: 1200, transform: `scale(${s * (hot ? 1.04 : 1)})` }}>
            <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: `rotateY(${flip}deg)` }}>
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 26, background: C.green, border: `6px solid ${C.mint}` }} />
              <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 26, background: C.white, border: `6px solid ${hot ? C.gold : C.red}`, padding: 24, boxSizing: "border-box", fontFamily: QUICKSAND, fontWeight: 700, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 70, height: 70, borderRadius: "50%", background: C.red, color: C.white, fontSize: 42, display: "grid", placeItems: "center" }}>{i + 1}</div>
                  <div style={{ fontSize: 32, color: C.ink, lineHeight: 1.1 }}>{ch.title}</div>
                </div>
                <div style={{ flex: 1, display: "grid", placeItems: "center" }}>{ch.demo(demoP)}</div>
                <div style={{ fontSize: 20, color: C.muted }}>{ch.where}</div>
              </div>
            </div>
          </div>
        );
      })}
      <Label at={c.line("c9")} x={960} y={900} anchor="center" size={34} color={C.mint}>Breaking things is how we learn!</Label>
      {CHALLENGES.map((ch) => (
        <Sfx key={ch.line} name="flip" at={c.line(ch.line)} />
      ))}
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 6.6 Montage: the finished project (no narration, music at its peak). */
export const Montage: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const D = durationInFrames;
  const clicks = useMemo(() => {
    const cl: Click[] = [];
    let f = 110;
    for (const n of [1, 4, 2, 6, 3, 5]) {
      cl.push({ f, i: idx(n) }, { f: f + 8, i: idx(n, 1) });
      f += 22;
    }
    return cl;
  }, []);
  const sim = useMemo(() => simulateGame(DECK, clicks), [clicks]);
  const shot = frame < 100 ? 0 : frame < 250 ? 1 : 2;
  return (
    <AbsoluteFill>
      <Backdrop count={22} seed={331} speed={1.2} push={progress(frame, 0, D)} />
      {shot === 0 &&
        [1, 2, 3].map((n, i) => {
          const at = 8 + i * 22;
          const a = 180 * EASE_FLIP(Math.min(1, Math.max(0, (frame - at) / 17)));
          return (
            <div key={n} style={{ position: "absolute", left: 360 + i * 440, top: 250, transform: `scale(${1 + frame / 400}) rotate(${(i - 1) * 6}deg)`, transformOrigin: "50% 50%" }}>
              <NumberCard number={n} width={330} angle={a} variant="hero" matched={frame > 80} />
            </div>
          );
        })}
      {shot === 1 && (
        <div style={{ position: "absolute", left: 310, top: 50, transform: `perspective(2000px) rotateY(${interpolate(frame, [100, 250], [-10, 6])}deg) scale(${interpolate(frame, [100, 250], [0.95, 1.05])})` }}>
          <GameBrowser width={1300} height={840} zoom={0.6} scrollY={280} state={sim.at(frame)} overlayScale={1.4} />
        </div>
      )}
      {shot === 2 && (
        <div style={{ position: "absolute", inset: 0, opacity: progress(frame, 250, 12) }}>
          <div style={{ position: "absolute", left: 120, top: 220, transform: `scale(${interpolate(frame, [250, D], [1, 1.08])})` }}>
            <NumberMatchLogo size={1.15} />
          </div>
          <Sparks x={960} y={420} t={frame - 262} count={26} spread={600} />
        </div>
      )}
      <GameSounds sounds={sim.sounds} clicks={false} />
      {[8, 30, 52].map((f) => (
        <Sfx key={f} name="flip" at={f} />
      ))}
      <Sfx name="match" at={82} />
      <Sfx name="whoosh" at={98} />
      <Sfx name="whoosh" at={248} />
      <Sfx name="sparkle" at={262} />
      <AbsoluteFill style={{ background: C.night, opacity: Math.max(map(frame, [96, 100], [0, 1]) * map(frame, [100, 106], [1, 0]), map(frame, [D - 10, D], [0, 1])) }} />
    </AbsoluteFill>
  );
};

/** 6.7 Celebrate the learner + final brand frame. */
export const Celebrate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("celebrate");
  const L = (id: string) => c.line(id);
  const stones: { at: number; label: string; node: React.ReactNode }[] = [
    { at: L("e2"), label: "an empty file", node: <div style={{ width: 120, height: 150, borderRadius: 12, background: C.white, border: `5px solid ${C.html}` }} /> },
    { at: c.word("e3", "structure"), label: "structure", node: <div style={{ width: 150, height: 150, border: `4px solid ${C.white}`, borderRadius: 8, padding: 10, boxSizing: "border-box", display: "grid", gap: 8 }}>{[0, 1, 2].map((k) => <div key={k} style={{ border: `3px solid ${C.mint}`, borderRadius: 4 }} />)}</div> },
    { at: c.word("e3", "style"), label: "style", node: <NumberCard number={1} width={120} angle={180} variant="hero" /> },
    { at: c.word("e3", "javascript"), label: "behaviour", node: <NumberCard number={1} width={120} angle={180 * EASE_FLIP(Math.min(1, Math.max(0, ((frame - c.word("e3", "javascript")) % 50) / 17)))} variant="hero" matched /> },
    { at: c.word("e4", "built"), label: "YOUR GAME!", node: <div style={{ width: 220, height: 160, borderRadius: 14, overflow: "hidden", border: `5px solid ${C.gold}` }}><GameBrowser width={220} height={160} zoom={0.15} scrollY={0} chrome={false} state={emptyState(6)} /></div> },
  ];
  const stamp = pop(frame, fps, c.word("e4", "memory"), 10);
  const brand = L("e7") - 10;
  const b = progress(frame, brand, 20);
  const line = progress(frame, L("e2"), Math.max(30, c.word("e4", "built") - L("e2")), EASE_IN_OUT);
  const tag = L("e8");
  const tagText = "Imagine it. Build it. Make it yours.";
  return (
    <AbsoluteFill>
      <Backdrop count={16} seed={341} speed={0.35} />
      {frame < brand + 20 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - b }}>
          <div style={{ position: "absolute", left: 140, top: 520, height: 10, width: 1640 * line, background: C.gold, borderRadius: 5 }} />
          {stones.map((s, i) => {
            if (frame < s.at) return null;
            const p = pop(frame, fps, s.at, 12);
            const x = 140 + i * 410;
            return (
              <div key={i} style={{ position: "absolute", left: x, top: 340, width: 260, transform: `translateX(-50%) scale(${p})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                <div style={{ height: 170, display: "grid", placeItems: "end center" }}>{s.node}</div>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.gold, border: `6px solid ${C.night}` }} />
                <Chip size={26} color={i === 4 ? C.gold : C.white}>{s.label}</Chip>
              </div>
            );
          })}
          {frame >= c.word("e4", "memory") && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 130, color: C.gold, textShadow: `0 8px 0 ${C.goldDark}`, transform: `scale(${2 - stamp}) rotate(-4deg)`, opacity: Math.min(1, stamp * 1.5) }}>I MADE THIS!</div>
          )}
          <Label at={L("e5")} x={960} y={760} anchor="center" size={36} color={C.mint}>one small thing at a time</Label>
          {["Keep experimenting.", "Keep creating.", "Never stop being curious."].map((t, i) => (
            <Label key={t} at={c.line("e6") + i * 30} x={480 + i * 480} y={840} anchor="center" size={30} color={C.white}>
              {t}
            </Label>
          ))}
        </div>
      )}
      {frame >= brand && (
        <AbsoluteFill style={{ opacity: b, fontFamily: QUICKSAND, fontWeight: 700 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center", transform: `scale(${0.8 + 0.2 * b})` }}>
            <PaisleyBadge size={420} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontSize: 64, color: C.white }}>
            {typed(tagText, frame, tag, 22)}
            <span style={{ opacity: frame >= tag && frame % 30 < 15 ? 1 : 0, color: C.gold }}>|</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center", opacity: progress(frame, tag + 40, 20) }}>
            <NumberMatchLogo size={0.5} />
          </div>
        </AbsoluteFill>
      )}
      {stones.map((s, i) => (
        <Sfx key={i} name="pop" at={s.at} volume={0.6} />
      ))}
      <Sfx name="thunk" at={c.word("e4", "memory")} />
      <Sfx name="sparkle" at={c.word("e4", "memory") + 2} />
      <Sfx name="whoosh" at={brand} />
      <Sfx name="sting" at={tag + 30} />
      <AbsoluteFill style={{ background: "#000", opacity: map(frame, [c.duration - 24, c.duration], [0, 1]) }} />
    </AbsoluteFill>
  );
};

