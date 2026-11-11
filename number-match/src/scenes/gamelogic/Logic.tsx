import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_IN_OUT, map, pop, progress, rnd } from "../../lib/anim";
import { block, CSS, HTML, JS } from "../../lib/course";
import { Click, formatTime, simulateGame } from "../../lib/gameSim";
import { Cursor, CursorKey } from "../../components/Cursor";
import { GameBrowser, PAGE } from "../../components/GamePage";
import { Chip, CodeCard, EndCard, IdeStage, Label, Mark, ring, SceneFade, StageTitle } from "../../components/Lesson";
import { NumberCard } from "../../components/NumberCard";
import { Backdrop } from "../../components/Stage";
import { GameSounds, Sfx } from "../../components/Sfx";
import { C, MONO, QUICKSAND } from "../../styles/theme";
import { TL } from "./timeline";

// ---------- shuffle (deterministic Fisher–Yates, exactly like shuffle()) ----------
const START = [1, 2, 3, 4, 5, 6, 1, 2, 3, 4, 5, 6];
const SWAPS: [number, number][] = [];
export const DECK = (() => {
  const a = [...START];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd(i * 7 + 3) * (i + 1));
    SWAPS.push([i, j]);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
})();
const pairOf = (i: number) => DECK.findIndex((n, k) => k !== i && n === DECK[i]);
const differentFrom = (i: number, avoid: number[] = []) => DECK.findIndex((n, k) => k !== i && n !== DECK[i] && !avoid.includes(k));

/** Line number (1-based) inside `lines` of the first line containing `text`. */
const ln = (lines: string[], text: string, from = 0) => {
  const i = lines.findIndex((l, k) => k >= from && l.includes(text));
  if (i < 0) throw new Error(`line not found: ${text}`);
  return i + 1;
};

// browser layout used on the right of the code
const BW = 900;
const BH = 820;
const ZOOM = 0.47;
const SCROLL = 290;
const BL = 960;
const BT = 120;
const cardCentre = (i: number) => ({
  x: (BW - PAGE.width * ZOOM) / 2 + (PAGE.shellX + 26 + (i % 4) * (PAGE.cardW + PAGE.gap) + PAGE.cardW / 2) * ZOOM,
  y: 52 + (PAGE.gridTop + Math.floor(i / 4) * (PAGE.cardH + PAGE.gap) + PAGE.cardH / 2 - SCROLL) * ZOOM,
});
const cursorFor = (clicks: Click[], start: CursorKey): CursorKey[] => {
  const keys: CursorKey[] = [start];
  for (const cl of clicks) {
    const p = cardCentre(cl.i);
    keys.push({ f: cl.f - 8, x: p.x + 8, y: p.y + 14 }, { f: cl.f, x: p.x, y: p.y, click: true });
  }
  return keys;
};

const CodeAndGame: React.FC<{
  file: string;
  lines: string[];
  marks: Mark[];
  fontSize?: number;
  clicks: Click[];
  title: string;
  rings?: React.ComponentProps<typeof GameBrowser>["rings"];
  children?: React.ReactNode;
  scroll?: number;
  maxLines?: number;
  deck?: number[];
}> = ({ file, lines, marks, fontSize = 21, clicks, title, rings, children, scroll = 0, maxLines, deck = DECK }) => {
  const frame = useCurrentFrame();
  const sim = useMemo(() => simulateGame(deck, clicks), [clicks, deck]);
  const state = sim.at(frame);
  return (
    <>
      <StageTitle at={0} y={28}>
        {title}
      </StageTitle>
      <div style={{ position: "absolute", left: 40, top: 120 }}>
        <CodeCard file={file} lang="js" lines={lines} fontSize={fontSize} width={890} marks={marks} scroll={scroll} maxLines={maxLines} />
      </div>
      <div style={{ position: "absolute", left: BL, top: BT }}>
        <GameBrowser width={BW} height={BH} zoom={ZOOM} scrollY={SCROLL} state={state} rings={rings}>
          <div style={{ position: "absolute", left: 0, top: -52 }}>
            {clicks.length > 0 && <Cursor keys={cursorFor(clicks, { f: Math.max(0, clicks[0].f - 30), x: BW * 0.8, y: BH * 0.9 })} scale={1.1} />}
          </div>
        </GameBrowser>
      </div>
      <GameSounds sounds={sim.sounds} />
      {children}
    </>
  );
};

/** 5.2 Three files, one team. */
export const Together: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("together");
  const fIdx = c.word("t2", "index");
  const fCss = c.word("t2", "style");
  const fJs = c.word("t2", "script");
  const active = frame >= fJs ? "script.js" : frame >= fCss ? "style.css" : "index.html";
  const code = active === "script.js" ? { lang: "js" as const, lines: JS.slice(0, 26) } : active === "style.css" ? { lang: "css" as const, lines: CSS.slice(0, 26) } : { lang: "html" as const, lines: HTML.slice(0, 26) };
  return (
    <AbsoluteFill>
      <IdeStage
        enter
        ide={{
          files: [
            { name: "Number Match", kind: "project" },
            { name: "index.html", kind: "html" },
            { name: "style.css", kind: "css" },
            { name: "script.js", kind: "js" },
          ],
          activeFile: active,
          code: { ...code, fontSize: 19 },
          previewBlank: true,
          focus: [
            { target: { x: 0, y: 176, w: 300, h: 42 }, amount: ring(frame, fIdx, fCss), label: "STRUCTURE", labelSide: "right" },
            { target: { x: 0, y: 220, w: 300, h: 42 }, amount: ring(frame, fCss, fJs), label: "STYLE", labelSide: "right" },
            { target: { x: 0, y: 264, w: 300, h: 42 }, amount: ring(frame, fJs, c.line("t3") + 20), label: "BEHAVIOUR", labelSide: "right" },
          ],
        }}
      >
        <div style={{ position: "absolute", left: 1150, top: 300, display: "flex", flexDirection: "column", gap: 24, opacity: progress(frame, c.line("t3"), 14) }}>
          <Chip color={C.html} size={40}>HTML · structure</Chip>
          <Chip color={C.css} size={40}>CSS · style</Chip>
          <Chip color={C.js} size={40}>JavaScript · behaviour</Chip>
          <Chip color={C.white} size={40}>= ONE TEAM</Chip>
        </div>
      </IdeStage>
      {[fIdx, fCss, fJs].map((f) => (
        <Sfx key={f} name="click" at={f} />
      ))}
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 5.3 createDeck and shuffle. */
export const Deck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("deck");
  const code = [...block(JS, "function createDeck"), "", ...block(JS, "function shuffle")];
  const sh = ln(code, "function shuffle");
  const shuffleAt = c.line("d6") + 10;
  // swap schedule: two slow swaps, then fast
  const times: number[] = [];
  let t = shuffleAt;
  SWAPS.forEach((_, k) => {
    times.push(t);
    t += k < 2 ? 40 : 9;
  });
  // positions of each original card index at this frame
  const order = [...START.keys()];
  let moving: { a: number; b: number; p: number } | null = null;
  SWAPS.forEach(([i, j], k) => {
    const dur = k < 2 ? 26 : 7;
    if (frame >= times[k] + dur) {
      [order[i], order[j]] = [order[j], order[i]];
    } else if (frame >= times[k]) {
      moving = { a: i, b: j, p: EASE_IN_OUT(Math.min(1, (frame - times[k]) / dur)) };
    }
  });
  const W = 120;
  const slot = (s: number) => ({ x: 980 + (s % 6) * (W + 22), y: 330 + Math.floor(s / 6) * (W / 0.78 + 40) });
  const dupe = c.line("d4") + 10;
  const shown = frame < c.line("d3") ? 0 : frame < dupe ? 6 : 12;
  const activeSwap = SWAPS.findIndex((_, k) => frame >= times[k] && (k === SWAPS.length - 1 || frame < times[k + 1]));
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={201} speed={0.2} />
      <StageTitle at={0} y={28}>
        A fresh, shuffled deck
      </StageTitle>
      <div style={{ position: "absolute", left: 40, top: 120 }}>
        <CodeCard
          file="script.js"
          lang="js"
          lines={code}
          fontSize={21}
          width={900}
          marks={[
            { from: 2, to: 2, at: c.line("d2"), until: c.line("d3") },
            { from: 3, to: 3, at: c.line("d3"), until: c.line("d4") },
            { from: 5, to: 5, at: c.line("d4"), until: c.line("d5") },
            { from: sh, to: sh + 1, at: c.line("d5"), until: c.line("d6") },
            { from: sh + 3, to: sh + 8, at: c.line("d6"), until: c.line("d7") },
            { from: sh + 4, to: sh + 4, at: c.line("d7") },
          ]}
        />
      </div>
      {START.map((n, idx) => {
        if (idx >= shown) return null;
        const s = pop(frame, fps, idx < 6 ? c.line("d3") + idx * 4 : dupe + (idx - 6) * 4, 13);
        let pos = order.indexOf(idx);
        let p = slot(pos);
        const m = moving as { a: number; b: number; p: number } | null;
        if (m && (order[m.a] === idx || order[m.b] === idx)) {
          const from = order[m.a] === idx ? m.a : m.b;
          const to = from === m.a ? m.b : m.a;
          const A = slot(from);
          const B = slot(to);
          p = { x: A.x + (B.x - A.x) * m.p, y: A.y + (B.y - A.y) * m.p - Math.sin(Math.PI * m.p) * 90 * (from === m.a ? 1 : -1) };
          pos = from;
        }
        return (
          <div key={idx} style={{ position: "absolute", left: p.x, top: p.y, transform: `scale(${s})` }}>
            <NumberCard number={n} width={W} angle={180} variant="hero" />
          </div>
        );
      })}
      {activeSwap >= 0 && activeSwap < 2 && frame < times[activeSwap] + 30 && (
        <>
          <Label at={times[activeSwap]} x={slot(SWAPS[activeSwap][0]).x + W / 2} y={slot(SWAPS[activeSwap][0]).y + W / 0.78 + 10} anchor="center" size={24}>index</Label>
          <Label at={times[activeSwap]} x={slot(SWAPS[activeSwap][1]).x + W / 2} y={slot(SWAPS[activeSwap][1]).y - 54} anchor="center" size={24} color={C.mint}>random</Label>
        </>
      )}
      <Label at={c.word("d4", "spread")} out={c.line("d5")} x={1350} y={800} anchor="center" size={34}>[...values, ...values]</Label>
      <Label at={c.line("d7")} x={1350} y={830} anchor="center" size={34} color={C.white}>Math.random() → a different game every time</Label>
      {SWAPS.map((_, k) => (
        <Sfx key={k} name="whoosh-short" at={times[k]} volume={k < 2 ? 0.8 : 0.35} />
      ))}
      <Sfx name="pop" at={c.line("d3")} />
      <Sfx name="pop-high" at={dupe} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 5.4 flipCard. */
export const Flip: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("flip");
  const code = block(JS, "function flipCard");
  const a = 0;
  const b = differentFrom(a);
  const x = 5;
  const y = differentFrom(x, [a, b]);
  const z = [11, 10, 9, 8, 7].find((k) => ![a, b, x, y].includes(k))!;
  const clicks: Click[] = [
    { f: c.line("f2") + 10, i: a },
    { f: c.line("f6") + 20, i: b },
    { f: c.line("f7") + 6, i: x },
    { f: c.line("f7") + 26, i: y },
    { f: c.line("f7") + 38, i: z },
  ];
  const sim = useMemo(() => simulateGame(DECK, clicks), [clicks]);
  const st = sim.at(frame);
  const lockOn = frame >= clicks[3].f && frame < clicks[3].f + 26;
  const marks: Mark[] = [
    { from: 1, to: 1, at: c.line("f2"), until: c.line("f3") },
    { from: ln(code, "if ("), to: ln(code, "return;"), at: c.line("f3"), until: c.line("f4") },
    { from: ln(code, 'classList.add("is-flipped")'), to: ln(code, 'classList.add("is-flipped")'), at: c.line("f4"), until: c.line("f5") },
    { from: ln(code, "if (!firstCard)"), to: ln(code, "if (!firstCard)") + 4, at: c.line("f5"), until: c.line("f6") },
    { from: ln(code, "secondCard = card"), to: ln(code, "checkForMatch()"), at: c.line("f6"), until: c.line("f7") },
    { from: ln(code, "lockBoard ||"), to: ln(code, "lockBoard ||"), at: c.line("f7") },
  ];
  const slotCard = (idx: number | null) => (idx === null ? null : <NumberCard number={DECK[idx]} width={70} angle={180} variant="hero" />);
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={211} speed={0.2} />
      <CodeAndGame file="script.js" lines={code} marks={marks} clicks={clicks} title="flipCard(): turning cards over" fontSize={20}>
        <div style={{ position: "absolute", left: BL + 140, top: BT + 70, display: "flex", gap: 30, fontFamily: QUICKSAND, fontWeight: 700 }}>
          {[
            ["firstCard", st.firstCard],
            ["secondCard", st.secondCard],
          ].map(([name, idx]) => (
            <div key={name as string} style={{ width: 280, height: 140, background: C.night2, border: `4px solid ${idx !== null ? C.gold : C.mint}`, borderRadius: 16, display: "flex", alignItems: "center", gap: 18, padding: "0 18px" }}>
              <div style={{ color: C.mint, fontFamily: MONO, fontSize: 22 }}>{name as string}</div>
              {slotCard(idx as number | null) ?? <div style={{ color: C.muted, fontFamily: MONO, fontSize: 22 }}>null</div>}
            </div>
          ))}
        </div>
        {lockOn && (
          <div style={{ position: "absolute", left: BL + BW / 2 - 70, top: BT + 420, width: 140, height: 140, borderRadius: 30, background: C.gold, display: "grid", placeItems: "center", fontSize: 80 }}>🔒</div>
        )}
        <Label at={c.line("f3")} out={c.line("f4")} x={BL + BW / 2} y={BT + 760} anchor="center" size={30}>return = stop right here</Label>
        <Label at={clicks[4].f} out={clicks[4].f + 40} x={BL + BW / 2} y={BT + 760} anchor="center" size={30} color={C.red}>locked: wait!</Label>
      </CodeAndGame>
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 5.5 checkForMatch: the heart of the game. */
export const Match: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("match");
  const code = [...block(JS, "function checkForMatch"), "", ...block(JS, "function resetTurn")];
  const p1 = 1;
  const p2 = pairOf(p1);
  const m1 = 2;
  const m2 = differentFrom(m1, [p1, p2]);
  const clicks: Click[] = [
    { f: c.line("m3") - 30, i: p1 },
    { f: c.line("m3") - 4, i: p2 },
    { f: c.line("m4") - 10, i: m1 },
    { f: c.line("m4") + 14, i: m2 },
    { f: c.line("m6") + 10, i: 3 },
    { f: c.line("m6") + 34, i: pairOf(3) === 4 ? 6 : 4 },
  ];
  const elseLine = ln(code, "} else {");
  const marks: Mark[] = [
    { from: 2, to: 3, at: c.line("m2"), until: c.line("m3") },
    { from: 5, to: elseLine - 1, at: c.line("m3"), until: c.line("m4"), color: "rgba(20,147,107,0.22)" },
    { from: elseLine, to: ln(code, "}, 850);"), at: c.line("m4"), until: c.line("m5"), color: "rgba(227,36,43,0.18)" },
    { from: ln(code, "function resetTurn"), to: code.length, at: c.line("m5"), until: c.line("m6") },
  ];
  const timerStart = clicks[3].f;
  const t850 = Math.min(1, Math.max(0, (frame - timerStart) / 26));
  const moves = clicks.filter((_, k) => k % 2 === 1).map((cl) => cl.f);
  const pulse = Math.max(...moves.map((f) => interpolate(frame, [f, f + 6, f + 30], [0, 1, 0], CLAMP)));
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={221} speed={0.2} />
      <CodeAndGame
        file="script.js"
        lines={code}
        marks={marks}
        clicks={clicks}
        title="checkForMatch(): match or not?"
        fontSize={17}
        rings={{ moves: frame >= c.line("m6") ? pulse : 0, matched: frame >= c.line("m3") && frame < c.line("m4") ? pulse : 0 }}
      >
        {frame >= timerStart && t850 < 1 && (
          <div style={{ position: "absolute", left: BL + BW - 230, top: BT + 70, display: "flex", alignItems: "center", gap: 14 }}>
            <svg width={90} height={90} viewBox="0 0 40 40">
              <circle cx={20} cy={20} r={16} fill="none" stroke={C.night3} strokeWidth={6} />
              <circle cx={20} cy={20} r={16} fill="none" stroke={C.gold} strokeWidth={6} strokeDasharray={`${100.5 * (1 - t850)} 200`} transform="rotate(-90 20 20)" />
            </svg>
            <Chip size={30}>850 ms</Chip>
          </div>
        )}
        <Label at={c.line("m3") + 10} out={c.line("m4") - 6} x={BL + BW / 2} y={BT + 770} anchor="center" size={32} color={C.match}>YES → is-matched, stay up</Label>
        <Label at={c.line("m4") + 20} out={c.line("m5")} x={BL + BW / 2} y={BT + 770} anchor="center" size={32} color={C.red}>NO → wait, then flip back</Label>
        <Label at={c.line("m5") + 6} out={c.line("m6")} x={BL + BW / 2} y={BT + 770} anchor="center" size={32}>resetTurn() → ready again</Label>
      </CodeAndGame>
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 5.6 Timer and progress. */
export const Timer: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("timer");
  const code = [...block(JS, "function startTimer"), "", ...block(JS, "function formatTime")];
  const stats = block(JS, "function updateStats");
  const showStats = frame >= c.line("n4") - 6;
  const ticks = Math.max(0, Math.floor((frame - c.line("n2")) / 30));
  const example = frame >= c.line("n3") + 30;
  // 3 matched pairs already, for the progress demo
  const done = useMemo(() => {
    const cl: Click[] = [];
    [0, 1, 2].forEach((k) => {
      const i = DECK.indexOf(k + 1);
      cl.push({ f: -100 + k * 20, i }, { f: -90 + k * 20, i: DECK.indexOf(k + 1, i + 1) });
    });
    return simulateGame(DECK, cl).at(10);
  }, []);
  const fill = progress(frame, c.word("n5", "half") - 10, 20);
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={231} speed={0.2} />
      <StageTitle at={0} y={28}>
        {showStats ? "The progress bar" : "The timer"}
      </StageTitle>
      <div style={{ position: "absolute", left: 40, top: 120 }}>
        {showStats ? (
          <CodeCard file="script.js" lang="js" lines={stats} fontSize={22} width={980} marks={[{ from: ln(stats, "progressFill"), to: ln(stats, "progressFill") + 1, at: c.line("n4") }]} />
        ) : (
          <CodeCard
            file="script.js"
            lang="js"
            lines={code}
            fontSize={20}
            width={900}
            marks={[
              { from: ln(code, "setInterval"), to: ln(code, "}, 1000);"), at: c.line("n2"), until: c.line("n3") },
              { from: ln(code, "seconds += 1"), to: ln(code, "formatTime(seconds)"), at: c.line("n3"), until: c.line("n3") + 50 },
              { from: ln(code, "function formatTime"), to: code.length, at: c.line("n3") + 50 },
            ]}
          />
        )}
      </div>
      {!showStats ? (
        <div style={{ position: "absolute", left: 1100, top: 200, textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700 }}>
          <svg width={360} height={400} viewBox="0 0 36 40">
            <rect x={15} y={0} width={6} height={4} rx={1} fill={C.mint} />
            <circle cx={18} cy={22} r={16} fill={C.white} stroke={C.mint} strokeWidth={2} />
            <line x1={18} y1={22} x2={18 + 12 * Math.sin((ticks % 60) * (Math.PI / 30))} y2={22 - 12 * Math.cos((ticks % 60) * (Math.PI / 30))} stroke={C.red} strokeWidth={1.6} strokeLinecap="round" />
            <circle cx={18} cy={22} r={1.6} fill={C.ink} />
          </svg>
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 80, color: C.white }}>{formatTime(frame >= c.line("n2") ? ticks : 0)}</div>
          {example && (
            <div style={{ marginTop: 30, display: "flex", gap: 20, alignItems: "center", justifyContent: "center" }}>
              <Chip size={34} color={C.mint}>65 seconds</Chip>
              <span style={{ color: C.white, fontSize: 40 }}>→</span>
              <Chip size={34}>01:05</Chip>
            </div>
          )}
        </div>
      ) : (
        <div style={{ position: "absolute", left: 1060, top: 160 }}>
          <GameBrowser width={820} height={700} zoom={0.42} scrollY={300} state={{ ...done, progress: 0.5 * fill + (frame < c.word("n5", "half") - 10 ? 0 : 0) }} rings={{ progress: ring(frame, c.line("n5"), c.duration) }} />
          <Label at={c.line("n5")} x={410} y={740} anchor="center" size={40}>3 ÷ 6 × 100% = 50%</Label>
        </div>
      )}
      <Label at={c.word("n2", "thousand")} out={c.line("n3")} x={1290} y={860} anchor="center" size={30} color={C.white}>1000 milliseconds = 1 second</Label>
      {Array.from({ length: 12 }).map((_, k) => (
        <Sfx key={k} name="tick" at={c.line("n2") + k * 30} volume={0.5} />
      ))}
      <Sfx name="whoosh-short" at={c.word("n5", "half") - 10} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 5.7 Sounds and feedback. */
export const Sound: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("sound");
  const calls = [
    { text: 'playTone(520, 0.07, "triangle");', hz: 520, label: "flip", line: "s3", sfx: "flip" as const },
    { text: 'playTone(740, 0.13, "sine", 0.055);', hz: 740, label: "match", line: "s4", sfx: "match" as const },
    { text: 'playTone(220, 0.16, "sine", 0.035);', hz: 220, label: "no match", line: "s5", sfx: "miss" as const },
  ];
  const sig = ["function playTone(frequency, duration = 0.11, type = \"sine\", volume = 0.045) {", "  // the browser builds a tiny note: an oscillator + a volume", "}", "", ...calls.map((k) => k.text)];
  const msgs = ["Great! Now find its matching number.", "Yes! You found a matching pair. Well done!", "Not a match this time. Have another try!"];
  const msgIdx = Math.min(2, Math.max(0, Math.floor((frame - c.line("s6")) / 30)));
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={241} speed={0.2} />
      <StageTitle at={0} y={28}>
        Feedback: sounds and messages
      </StageTitle>
      <div style={{ position: "absolute", left: 40, top: 140 }}>
        <CodeCard
          file="script.js"
          lang="js"
          lines={sig}
          fontSize={22}
          width={1060}
          marks={calls.map((k, i) => ({ from: 5 + i, to: 5 + i, at: c.line(k.line), until: i < 2 ? c.line(calls[i + 1].line) : c.line("s6") }))}
        />
      </div>
      <Label at={c.word("s2", "browser")} x={40} y={540} size={32} color={C.white}>Web Audio API · no audio files needed</Label>
      {calls.map((k, i) => {
        const at = c.line(k.line);
        if (frame < at) return null;
        const p = progress(frame, at, 20);
        const pts = Array.from({ length: 120 }).map((_, x) => {
          const y = 60 + Math.sin((x / 120) * Math.PI * 2 * (k.hz / 110)) * 45 * Math.exp(-x / 90);
          return `${x * 6},${y}`;
        });
        return (
          <div key={k.hz} style={{ position: "absolute", left: 1160, top: 180 + i * 220, fontFamily: QUICKSAND, fontWeight: 700 }}>
            <svg width={720} height={120} style={{ clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
              <polyline points={pts.join(" ")} fill="none" stroke={[C.gold, C.match, C.red][i]} strokeWidth={6} strokeLinejoin="round" />
            </svg>
            <div style={{ color: C.white, fontSize: 30 }}>
              {k.hz} Hz · {k.label}
            </div>
          </div>
        );
      })}
      {frame >= c.line("s6") && (
        <div style={{ position: "absolute", left: 160, top: 720, display: "flex", alignItems: "center", gap: 16, background: C.white, borderRadius: 18, padding: "20px 34px", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 38, color: C.muted }}>
          <span style={{ width: 18, height: 18, borderRadius: "50%", background: C.red }} />
          {msgs[msgIdx]}
        </div>
      )}
      {calls.map((k) => (
        <Sfx key={k.hz} name={k.sfx} at={c.line(k.line) + 10} />
      ))}
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 5.8 Difficulty and restart. */
export const Difficulty: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("difficulty");
  const easy = c.word("l2", "easy");
  const med = c.word("l2", "medium");
  const chal = c.word("l2", "challenge");
  const pairs = frame >= chal ? 8 : frame >= med ? 6 : frame >= easy ? 4 : 6;
  const deck = Array.from({ length: pairs * 2 }, (_, i) => (i % pairs) + 1);
  const state = simulateGame(deck, []).at(0);
  const code = [
    'difficulty.addEventListener("change", startNewGame);',
    "",
    ...block(JS, "function startNewGame"),
    "",
    'restartButton.addEventListener("click", startNewGame);',
    'playAgainButton.addEventListener("click", startNewGame);',
  ];
  const showCode = frame >= c.line("l3") - 6;
  const rows = Math.ceil((pairs * 2) / 4);
  const zoom = rows === 4 ? 0.36 : rows === 3 ? 0.44 : 0.5;
  const rebuild = [easy, med, chal];
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={251} speed={0.2} />
      <StageTitle at={0} y={28}>
        Choose your challenge
      </StageTitle>
      {showCode && (
        <div style={{ position: "absolute", left: 40, top: 120, opacity: progress(frame, c.line("l3") - 6, 12) }}>
          <CodeCard
            file="script.js"
            lang="js"
            lines={code}
            fontSize={17}
            width={900}
            marks={[
              { from: 1, to: 1, at: c.line("l3"), until: c.line("l4") },
              { from: 4, to: code.length - 4, at: c.line("l4"), until: c.line("l5") },
              { from: code.length - 1, to: code.length, at: c.line("l5") },
              { from: 1, to: 1, at: c.line("l5") },
            ]}
          />
        </div>
      )}
      <div style={{ position: "absolute", left: showCode ? 980 : 510, top: 120 }}>
        <GameBrowser key={pairs} width={900} height={820} zoom={zoom} scrollY={280} state={state} rings={{ toolbar: ring(frame, easy - 6, chal + 30) }} />
      </div>
      {frame < c.line("l3") &&
        [
          ["Easy · 4 pairs", easy],
          ["Medium · 6 pairs", med],
          ["Challenge · 8 pairs", chal],
        ].map(([t, f], i) => (
          <Label key={t as string} at={f as number} x={1500} y={300 + i * 120} size={36} color={pairs === [4, 6, 8][i] ? C.gold : C.white}>
            {t}
          </Label>
        ))}
      <Label at={c.word("l5", "write")} x={1430} y={60} anchor="center" size={34}>write once, use everywhere</Label>
      {rebuild.map((f, i) => (
        <React.Fragment key={i}>
          <Sfx name="click" at={f} />
          <Sfx name="whoosh-short" at={f + 2} />
        </React.Fragment>
      ))}
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 5.9 The final pair → finishGame → celebration. */
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("finish");
  const last = 6;
  const pre: Click[] = [];
  let f = -400;
  for (let n = 1; n <= 6; n++) {
    if (n === DECK[last]) continue;
    const a = DECK.indexOf(n);
    pre.push({ f, i: a }, { f: f + 10, i: DECK.indexOf(n, a + 1) });
    f += 30;
  }
  pre.push({ f: -100, i: 3 }, { f: -90, i: DECK.findIndex((n, k) => k !== 3 && n !== DECK[3]) });
  const lastA = DECK.indexOf(DECK[last]);
  const lastB = DECK.indexOf(DECK[last], lastA + 1);
  const clicks: Click[] = [...pre, { f: c.line("w1") + 12, i: lastA }, { f: c.line("w1") + 34, i: lastB }];
  const code = block(JS, "function finishGame");
  const steps = ["stop the timer", "final moves + time", "the message", "3-note tune", "celebration screen"];
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={261} speed={0.2} />
      <CodeAndGame
        file="script.js"
        lines={["if (matchedPairs === totalPairs) {", "  finishGame();", "}", "", ...code]}
        marks={[
          { from: 1, to: 3, at: c.line("w2"), until: c.line("w3") },
          { from: 5, to: 8 + 4, at: c.line("w3") },
        ]}
        clicks={clicks}
        title="The final pair"
        fontSize={17}
        rings={{ progress: ring(frame, c.line("w1") + 34, c.line("w2") + 30) }}
      >
        {frame >= c.line("w3") && (
          <div style={{ position: "absolute", left: 40, top: 900 }}>
            {steps.map((s, i) => (
              <Label key={s} at={c.line("w3") + i * 18} x={i * 182} y={0} size={18} color={C.mint}>
                ✓ {s}
              </Label>
            ))}
          </div>
        )}
      </CodeAndGame>
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 5.10 Closing. */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("outro");
  const clicks = useMemo(() => {
    const cl: Click[] = [];
    let f = 10;
    for (let n = 1; n <= 6; n++) {
      const a = DECK.indexOf(n);
      cl.push({ f, i: a }, { f: f + 10, i: DECK.indexOf(n, a + 1) });
      f += 24;
    }
    return cl;
  }, []);
  const sim = useMemo(() => simulateGame(DECK, clicks), [clicks]);
  return (
    <AbsoluteFill>
      <Backdrop count={12} seed={271} speed={0.3} />
      <div style={{ position: "absolute", left: 410, top: 60, transform: `scale(${interpolate(frame, [0, c.line("o4")], [1, 1.04], CLAMP)})` }}>
        <GameBrowser width={1100} height={820} zoom={0.5} scrollY={260} state={sim.at(frame)} overlayScale={1.3} />
      </div>
      <GameSounds sounds={sim.sounds} until={c.line("o4")} clicks={false} />
      <EndCard at={c.line("o5")} next="Lesson 6 · You Are Now a Game Creator!" nextColor={C.gold} />
      <Sfx name="sting" at={c.line("o5") + 4} />
      <AbsoluteFill style={{ background: "#000", opacity: map(frame, [c.duration - 16, c.duration], [0, 1]) }} />
    </AbsoluteFill>
  );
};

