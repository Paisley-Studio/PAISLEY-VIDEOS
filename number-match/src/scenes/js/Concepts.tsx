import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_FLIP, EASE_IN_OUT, map, pop, progress } from "../../lib/anim";
import { between, block, HTML_LESSON3, JS } from "../../lib/course";
import { simulateGame } from "../../lib/gameSim";
import { Cursor } from "../../components/Cursor";
import { emptyState, GameBrowser } from "../../components/GamePage";
import { centre, Chip, CodeCard, EndCard, IdeStage, Label, ring, SceneFade, StageTitle, typedChars } from "../../components/Lesson";
import { NumberCard } from "../../components/NumberCard";
import { fileRowRect, IDE_RECTS, IdeFile } from "../../components/PaisleyIDE";
import { Backdrop, Sparks } from "../../components/Stage";
import { Sfx } from "../../components/Sfx";
import { C, MONO, QUICKSAND } from "../../styles/theme";
import { TL } from "./timeline";

const EMPTY = emptyState(6);
const flipTo = (frame: number, at: number, up = true) => {
  const p = EASE_FLIP(Math.min(1, Math.max(0, (frame - at) / 17)));
  return up ? 180 * p : 180 - 180 * p;
};

/** 4.2 Looks are not enough. */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("intro");
  const click = c.word("i1", "clicking") + 12;
  const chips = c.line("i3");
  const bulb = c.word("i4", "brain");
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Backdrop count={10} seed={121} speed={0.25} />
      <div style={{ position: "absolute", left: 310, top: 50 }}>
        <GameBrowser width={1300} height={830} zoom={0.62} scrollY={140} state={EMPTY} rings={{ grid: ring(frame, c.line("i2"), c.line("i3")) }}>
          <div style={{ position: "absolute", left: 0, top: -52 }}>
            <Cursor keys={[{ f: 0, x: 900, y: 700 }, { f: click - 4, x: 650, y: 420 }, { f: click, x: 650, y: 420, click: true }, { f: click + 14, x: 650, y: 420, click: true }]} scale={1.2} hideAt={chips} />
          </div>
        </GameBrowser>
      </div>
      <Label at={click + 20} out={chips} x={960} y={600} anchor="center" size={40} color={C.white}>
        ...nothing happens
      </Label>
      {[["RESPOND", "respond"], ["REMEMBER", "remember"], ["DECIDE", "decide"]].map(([t, w], i) => (
        <Label key={t} at={c.word("i3", w)} out={bulb - 10} x={560 + i * 400} y={420} anchor="center" size={52} color={[C.red, C.css, C.gold][i]}>
          {t}
        </Label>
      ))}
      {frame >= bulb && (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: C.night, opacity: Math.min(0.9, (frame - bulb) / 10) }} />
          <svg width={260} height={260} viewBox="0 0 24 24" style={{ position: "absolute", left: 830, top: 160, transform: `scale(${pop(frame, fps, bulb, 12)})` }}>
            <path d="M9 21h6v-1H9zm3-19a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2Z" fill={C.gold} />
          </svg>
          <Label at={bulb + 8} x={960} y={480} anchor="center" size={56}>
            JavaScript = the game's brain
          </Label>
        </AbsoluteFill>
      )}
      <Sfx name="click" at={click} />
      <Sfx name="click" at={click + 14} />
      <Sfx name="tick" at={click + 20} volume={0.6} />
      {["respond", "remember", "decide"].map((w, i) => (
        <Sfx key={w} name={(["pop-low", "pop", "pop-high"] as const)[i]} at={c.word("i3", w)} />
      ))}
      <Sfx name="sparkle" at={bulb} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

const SCRIPT_TAG = '  <script src="script.js" defer></script>';

/** 4.3 Create script.js and link it with defer. */
export const NewJs: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("newjs");
  const clickNew = c.line("n1") + 12;
  const typeAt = c.word("n1", "type");
  const enter = c.word("n1", "enter");
  const name = "script.js";
  const typed = name.slice(0, Math.floor(interpolate(frame, [typeAt + 4, enter - 4], [0, name.length], CLAMP)));
  const created = frame >= enter;
  const files: IdeFile[] = [
    { name: "Number Match", kind: "project" },
    { name: "index.html", kind: "html" },
    { name: "style.css", kind: "css" },
    ...(created ? [{ name: "script.js", kind: "js" as const }] : []),
  ];
  const back = c.line("n3");
  const tagAt = c.word("n3", "script") + 2;
  const onHtml = frame >= back + 8;
  const head = HTML_LESSON3.slice(0, HTML_LESSON3.indexOf("</head>"));
  const lines = [...head, ...(frame >= tagAt ? [SCRIPT_TAG] : []), "</head>"];
  const tagLine = lines.indexOf(SCRIPT_TAG) + 1;
  const deferAt = c.word("n4", "defer");
  const reading = progress(frame, deferAt + 20, 50);
  return (
    <AbsoluteFill>
      <IdeStage
        cam={[
          { f: 0, z: 1.6, x: 260, y: 260 },
          { f: back, z: 1.6, x: 260, y: 260 },
          { f: back + 16, z: 1.25, x: 760, y: 360 },
        ]}
        ide={{
          files,
          activeFile: onHtml ? "index.html" : created ? "script.js" : undefined,
          newFileInput: frame >= clickNew && !created ? typed : null,
          code: onHtml ? { lang: "html", lines, fontSize: 19, marks: tagLine > 0 ? [{ from: tagLine, to: tagLine, color: "rgba(255,194,61,0.35)" }] : [] } : { lang: "js", lines: [], caret: created ? { line: 1, col: 0 } : null },
          previewBlank: true,
          press: { newFile: interpolate(frame, [clickNew, clickNew + 3, clickNew + 8], [0, 1, 0], CLAMP) },
          focus: [{ target: { x: 0, y: 176, w: 300, h: 130 }, amount: ring(frame, c.line("n2"), back), label: "3 FILES!", labelSide: "right" }],
        }}
        overlay={
          <Cursor
            keys={[
              { f: 0, x: 700, y: 600 },
              { f: clickNew - 2, x: centre(IDE_RECTS.newFile).x, y: centre(IDE_RECTS.newFile).y },
              { f: clickNew, x: centre(IDE_RECTS.newFile).x, y: centre(IDE_RECTS.newFile).y, click: true },
              { f: back - 4, x: 100, y: centre(fileRowRect(1)).y },
              { f: back, x: 100, y: centre(fileRowRect(1)).y, click: true },
            ]}
            scale={1.3}
            hideAt={back + 20}
          />
        }
      >
        <Label at={c.word("n3", "source")} x={1150} y={620} size={30}>src = which file to run</Label>
        {frame >= deferAt && (
          <div style={{ position: "absolute", left: 1150, top: 700, display: "flex", alignItems: "center", gap: 20, fontFamily: QUICKSAND, fontWeight: 700 }}>
            <Chip size={30}>defer</Chip>
            <div style={{ width: 300, height: 26, background: C.night2, borderRadius: 13, overflow: "hidden", border: `3px solid ${C.mint}` }}>
              <div style={{ width: `${reading * 100}%`, height: "100%", background: C.mint }} />
            </div>
            <Chip size={30} color={reading >= 1 ? C.gold : C.night3}>
              run JS
            </Chip>
          </div>
        )}
        <Label at={deferAt + 24} x={1150} y={790} size={26} color={C.white}>read the page first, then run</Label>
      </IdeStage>
      <Sfx name="click" at={clickNew} />
      <Sfx name="typing" at={typeAt + 4} dur={enter - typeAt - 8} />
      <Sfx name="pop" at={enter + 2} />
      <Sfx name="typing" at={tagAt} dur={20} />
      <Sfx name="pop-high" at={deferAt + 72} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** A labelled box (variable). */
const VarBox: React.FC<{ name: string; value: string; x: number; y: number; at: number; hot?: number; w?: number }> = ({ name, value, x, y, at, hot = 0, w = 250 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, 13);
  if (frame < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `scale(${s * (1 + 0.06 * hot)})`, fontFamily: QUICKSAND, fontWeight: 700, textAlign: "center" }}>
      <div style={{ background: hot > 0.5 ? C.gold : C.mint, color: C.ink, borderRadius: "14px 14px 0 0", padding: "8px 0", fontSize: 26, fontFamily: MONO }}>{name}</div>
      <div style={{ height: 110, background: C.night2, border: `5px solid ${hot > 0.5 ? C.gold : C.mint}`, borderTop: 0, borderRadius: "0 0 14px 14px", display: "grid", placeItems: "center", color: C.white, fontSize: 46, fontFamily: MONO }}>{value}</div>
    </div>
  );
};

/** 4.4 Variables. */
export const Variables: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("variables");
  const ex = ["let moves = 0;", "let score = 0;"];
  const val = frame >= c.word("v4", "three") ? "3" : frame >= c.word("v4", "two") ? "2" : frame >= c.word("v4", "one") ? "1" : "0";
  const real = c.line("v5");
  const realCode = between(JS, "let firstCard", "let seconds");
  const R = (from: number, to: number) => ring(frame, from, to);
  const v6 = c.line("v6");
  const v7 = c.line("v7");
  const v8 = c.line("v8");
  const end = c.duration;
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={131} speed={0.2} />
      <StageTitle at={0} y={28}>
        {frame < real ? "Variables: labelled boxes" : "The game's variables"}
      </StageTitle>
      {frame < real ? (
        <>
          <div style={{ position: "absolute", left: 80, top: 200 }}>
            <CodeCard file="script.js" lang="js" lines={ex} fontSize={44} width={760} tag="TEACHING EXAMPLE" chars={typedChars(ex, frame, c.line("v2") + 10, c.line("v2") + 50)} marks={[{ from: 1, to: 1, at: c.line("v3") }]} />
          </div>
          <VarBox name="moves" value={val} x={1150} y={260} at={c.line("v2")} w={400} hot={frame >= c.line("v4") ? 1 : 0} />
          <Label at={c.line("v2") + 10} x={1350} y={530} anchor="center" size={32} color={C.white}>a labelled box</Label>
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: 60, top: 140 }}>
            <CodeCard
              file="script.js"
              lang="js"
              lines={realCode}
              fontSize={26}
              width={720}
              marks={[
                { from: 1, to: 2, at: v6, until: v7 },
                { from: 3, to: 3, at: v7, until: v8 },
                { from: 4, to: 7, at: v8 },
              ]}
            />
          </div>
          <VarBox name="firstCard" value="null" x={850} y={170} at={real + 6} hot={R(v6, v7)} />
          <VarBox name="secondCard" value="null" x={1120} y={170} at={real + 10} hot={R(v6, v7)} />
          <VarBox name="lockBoard" value="false" x={1390} y={170} at={real + 14} hot={R(v7, v8)} />
          <VarBox name="moves" value="0" x={850} y={420} at={real + 18} hot={R(c.word("v8", "moves"), c.word("v8", "total"))} />
          <VarBox name="matchedPairs" value="0" x={1120} y={420} at={real + 22} hot={R(c.word("v8", "matched"), c.word("v8", "total"))} />
          <VarBox name="totalPairs" value="6" x={1390} y={420} at={real + 26} hot={R(c.word("v8", "total"), c.word("v8", "seconds"))} />
          <VarBox name="seconds" value="0" x={1120} y={670} at={real + 30} hot={R(c.word("v8", "seconds"), end)} />
          <Label at={c.word("v6", "null")} out={v7} x={1250} y={330} anchor="center" size={28}>null = empty</Label>
        </>
      )}
      <Sfx name="typing" at={c.line("v2") + 10} dur={40} />
      {["one", "two", "three"].map((w) => (
        <Sfx key={w} name="pop" at={c.word("v4", w)} />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <Sfx key={i} name="pop" at={real + 6 + i * 4} volume={0.4} />
      ))}
      <SceneFade duration={end} />
    </AbsoluteFill>
  );
};

/** 4.5 Arrays → createDeck. */
export const Arrays: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("arrays");
  const ex = ["const numbers = [1, 2, 3, 4, 5, 6];"];
  const deck = block(JS, "function createDeck");
  const dup = c.line("a4");
  const d = progress(frame, dup + 30, 26, EASE_IN_OUT);
  const pairs = c.line("a5");
  const W = 130;
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={141} speed={0.2} />
      <StageTitle at={0} y={28}>
        Arrays: many values in one place
      </StageTitle>
      <div style={{ position: "absolute", left: 80, top: 140 }}>
        {frame < dup ? (
          <CodeCard file="script.js" lang="js" lines={ex} fontSize={44} width={1100} tag="TEACHING EXAMPLE" chars={typedChars(ex, frame, c.line("a2"), c.line("a2") + 40)} />
        ) : (
          <CodeCard file="script.js" lang="js" lines={deck} fontSize={24} width={880} marks={[{ from: 2, to: 2, at: dup + 6, until: dup + 40 }, { from: 4, to: 4, at: dup + 40 }]} />
        )}
      </div>
      {/* tray */}
      <div style={{ position: "absolute", left: 1000, top: frame < dup ? 420 : 160, width: 6 * (W + 14) + 20 }}>
        {[1, 2, 3, 4, 5, 6].map((n, i) => {
          const s = pop(frame, fps, c.line("a3") + i * 6, 13);
          if (frame < c.line("a3") + i * 6) return null;
          return (
            <React.Fragment key={n}>
              <div style={{ position: "absolute", left: (i % 6) * (W + 14), top: 0, transform: `scale(${s})` }}>
                <NumberCard number={n} width={W} angle={180} variant="hero" />
              </div>
              {frame >= dup + 30 && (
                <div style={{ position: "absolute", left: i * (W + 14), top: (W / 0.78 + 30) * d, opacity: d }}>
                  <NumberCard number={n} width={W} angle={180} variant="hero" matched={frame >= pairs} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <Label at={c.line("a2") + 30} out={dup} x={1440} y={680} anchor="center" size={32} color={C.white}>[ square brackets ] hold the list</Label>
      <Label at={pairs} x={1400} y={620} anchor="center" size={40}>12 cards = 6 pairs</Label>
      <Sparks x={1400} y={400} t={frame - pairs} />
      <Sfx name="typing" at={c.line("a2")} dur={36} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Sfx key={i} name="tick" at={c.line("a3") + i * 6} />
      ))}
      <Sfx name="whoosh" at={dup + 30} />
      <Sfx name="match" at={pairs} volume={0.7} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

const FUNCS: { name: string; line: string; job: string }[] = [
  { name: "createDeck()", line: "f5", job: "makes the pairs" },
  { name: "shuffle()", line: "f6", job: "mixes them up" },
  { name: "createCard()", line: "f7", job: "builds one card" },
  { name: "buildBoard()", line: "f8", job: "fills the grid" },
  { name: "flipCard()", line: "f9", job: "turns a card over" },
];

/** 4.6 Functions. */
export const Functions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("functions");
  const ex = ["function sayHello() {", '  console.log("Hello, creator!");', "}", "", "sayHello();"];
  const list = c.line("f4");
  const call = c.word("f3", "call") + 4;
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={151} speed={0.2} />
      <StageTitle at={0} y={28}>
        Functions: reusable instructions
      </StageTitle>
      {frame < list ? (
        <>
          <div style={{ position: "absolute", left: 80, top: 160 }}>
            <CodeCard file="script.js" lang="js" lines={ex} fontSize={40} width={1000} tag="TEACHING EXAMPLE" chars={typedChars(ex, frame, c.line("f2"), c.line("f2") + 60)} marks={[{ from: 5, to: 5, at: call }]} />
          </div>
          {frame >= call && (
            <div style={{ position: "absolute", left: 1180, top: 300, width: 640, borderRadius: 18, overflow: "hidden", opacity: progress(frame, call, 10) }}>
              <div style={{ background: "#1c2b28", color: "#5cc2b0", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, padding: "12px 20px" }}>▼ &gt;_ Console</div>
              <div style={{ background: "#13201d", color: "#e8f3ef", fontFamily: MONO, fontSize: 34, padding: "24px 20px", minHeight: 80 }}>{frame >= call + 8 ? "Hello, creator!" : ""}</div>
            </div>
          )}
        </>
      ) : (
        <div style={{ position: "absolute", left: 70, top: 260, display: "flex", gap: 26 }}>
          {FUNCS.map((fn, i) => {
            const s = pop(frame, fps, list + i * 5, 13);
            const reveal = frame >= c.line(fn.line);
            const angle = reveal ? flipTo(frame, c.line(fn.line)) : 0;
            const hot = frame >= c.line(fn.line) && (i === FUNCS.length - 1 || frame < c.line(FUNCS[i + 1].line));
            return (
              <div key={fn.name} style={{ width: 330, height: 430, perspective: 1200, transform: `scale(${s * (hot ? 1.05 : 1)})` }}>
                <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transform: `rotateY(${angle}deg)` }}>
                  <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", borderRadius: 24, background: C.green, border: `6px solid ${C.mint}`, display: "grid", placeItems: "center", color: C.white, fontFamily: MONO, fontSize: 30, fontWeight: 700 }}>
                    {fn.name}
                  </div>
                  <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: 24, background: C.white, border: `6px solid ${hot ? C.gold : C.js}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, fontFamily: QUICKSAND, fontWeight: 700 }}>
                    <div style={{ fontFamily: MONO, fontSize: 30, color: C.ink }}>{fn.name}</div>
                    <div style={{ width: 110, height: 110, borderRadius: "50%", background: C.js, display: "grid", placeItems: "center", fontSize: 60, color: C.ink }}>{i + 1}</div>
                    <div style={{ fontSize: 32, color: C.green, textAlign: "center", padding: "0 20px" }}>{fn.job}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Label at={c.line("f2") + 20} out={list} x={1180} y={200} size={32} color={C.white}>write once, use again and again</Label>
      <Sfx name="typing" at={c.line("f2")} dur={60} />
      <Sfx name="pop-high" at={call + 8} />
      {FUNCS.map((fn, i) => (
        <React.Fragment key={fn.name}>
          <Sfx name="tick" at={list + i * 5} volume={0.5} />
          <Sfx name="flip" at={c.line(fn.line)} />
        </React.Fragment>
      ))}
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 4.7 Events: addEventListener. */
export const Events: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("events");
  const line = ['card.addEventListener("click", () => flipCard(card));'];
  const click = c.word("e4", "click") + 2;
  const signal = progress(frame, click, 18, EASE_IN_OUT);
  const L = (id: string) => c.line(id);
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={161} speed={0.2} />
      <StageTitle at={0} y={28}>
        Events: the game listens
      </StageTitle>
      {frame < L("e3") ? (
        [["click", "click"], ["key press", "key"], ["choice from a list", "choice"]].map(([t, w], i) => (
          <Label key={t} at={c.word("e2", w)} x={420 + i * 540} y={420} anchor="center" size={46} color={[C.red, C.css, C.gold][i]}>
            {t}
          </Label>
        ))
      ) : (
        <>
          <div style={{ position: "absolute", left: 80, top: 170 }}>
            <CodeCard file="script.js" lang="js" lines={line} fontSize={34} width={1240} lineNumbers={false} />
          </div>
          <Label at={c.word("e3", "listen")} x={300} y={330} size={28}>listen for...</Label>
          <Label at={c.word("e3", "click")} x={650} y={330} size={28} color={C.red}>...a click</Label>
          <Label at={c.word("e3", "run")} x={960} y={330} size={28} color={C.css}>then run flipCard</Label>
          <div style={{ position: "absolute", left: 1460, top: 380 }}>
            <NumberCard number={5} width={300} angle={frame >= click + 18 ? flipTo(frame, click + 18) : 0} variant="hero" />
          </div>
          {frame >= click && signal < 1 && <div style={{ position: "absolute", left: interpolate(signal, [0, 1], [1600, 1080]), top: interpolate(signal, [0, 1], [560, 230]), width: 34, height: 34, borderRadius: "50%", background: C.gold }} />}
          <Cursor keys={[{ f: L("e4") - 20, x: 1700, y: 850 }, { f: click - 2, x: 1610, y: 570 }, { f: click, x: 1610, y: 570, click: true }]} scale={1.3} showFrom={L("e4") - 20} />
        </>
      )}
      {["click", "key", "choice"].map((w, i) => (
        <Sfx key={w} name={(["pop-low", "pop", "pop-high"] as const)[i]} at={c.word("e2", w)} />
      ))}
      <Sfx name="click" at={click} />
      <Sfx name="whoosh-short" at={click + 2} />
      <Sfx name="flip" at={click + 18} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 4.8 if / else. */
export const Conditions: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("conditions");
  const code = ["if (firstCard.dataset.number === secondCard.dataset.number) {", "  // The cards match.", "} else {", "  // The cards do not match.", "}"];
  const yes = c.line("d3");
  const no = c.line("d4");
  const shake = frame >= no + 24 && frame < no + 40 ? Math.sin((frame - no) * 1.6) * 10 : 0;
  const backAt = no + 50;
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={171} speed={0.2} />
      <StageTitle at={0} y={28}>
        Decisions: if ... else
      </StageTitle>
      <div style={{ position: "absolute", left: 60, top: 130 }}>
        <CodeCard
          file="script.js"
          lang="js"
          lines={code}
          fontSize={30}
          width={1200}
          tag="FROM checkForMatch()"
          marks={[
            { from: 1, to: 1, at: c.line("d2"), until: yes },
            { from: 1, to: 2, at: yes, until: no, color: "rgba(20,147,107,0.25)" },
            { from: 3, to: 4, at: no, until: c.line("d5"), color: "rgba(227,36,43,0.2)" },
            { from: 1, to: 1, at: c.line("d5") },
          ]}
        />
      </div>
      {/* lanes */}
      <div style={{ position: "absolute", left: 140, top: 520, display: "flex", gap: 40, opacity: progress(frame, yes - 10, 14) }}>
        <NumberCard number={3} width={170} angle={180} variant="hero" matched={frame >= yes + 20} />
        <NumberCard number={3} width={170} angle={frame >= yes ? flipTo(frame, yes) : 0} variant="hero" matched={frame >= yes + 20} />
      </div>
      <Label at={yes + 22} x={330} y={800} anchor="center" size={36} color={C.match}>YES → match!</Label>
      <div style={{ position: "absolute", left: 1000, top: 520, display: "flex", gap: 40, opacity: progress(frame, no - 10, 14), transform: `translateX(${shake}px)` }}>
        <NumberCard number={3} width={170} angle={frame >= backAt ? flipTo(frame, backAt, false) : 180} variant="hero" />
        <NumberCard number={5} width={170} angle={frame >= backAt ? flipTo(frame, backAt, false) : frame >= no ? flipTo(frame, no) : 0} variant="hero" />
      </div>
      <Label at={no + 22} x={1190} y={800} anchor="center" size={36} color={C.red}>NO → flip back</Label>
      <Label at={c.word("d5", "three")} x={1560} y={560} anchor="center" size={60}>===</Label>
      <Label at={c.word("d5", "exactly")} x={1560} y={680} anchor="center" size={30} color={C.white}>exactly the same?</Label>
      <Sfx name="flip" at={yes} />
      <Sfx name="match" at={yes + 20} />
      <Sfx name="flip" at={no} />
      <Sfx name="miss" at={no + 22} />
      <Sfx name="flip" at={backAt} volume={0.6} />
      <Sfx name="pop-high" at={c.word("d5", "three")} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 4.9 The DOM: find elements, create cards. */
export const Dom: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("dom");
  const find = c.line("m2");
  const build = c.line("m4");
  const nodes = [
    { t: "document", x: 300, y: 0 },
    { t: "html", x: 300, y: 90 },
    { t: "head", x: 120, y: 180 },
    { t: "body", x: 480, y: 180 },
    { t: "main", x: 480, y: 270 },
    { t: "header", x: 260, y: 360 },
    { t: "section.hero", x: 480, y: 360 },
    { t: "section.game-panel", x: 720, y: 360 },
    { t: "#moves", x: 560, y: 450 },
    { t: "#timer", x: 760, y: 450 },
    { t: "#gameGrid", x: 960, y: 450, key: true },
  ];
  const code = ['const gameGrid = document.getElementById("gameGrid");', "", 'const card = document.createElement("button");', "gameGrid.appendChild(card);"];
  const sim = simulateGame([3, 1, 5, 2, 6, 4, 1, 3, 4, 6, 2, 5], []);
  const st = sim.at(0);
  const count = Math.floor(interpolate(frame, [build + 30, build + 30 + 12 * 6], [0, 12], CLAMP));
  const state = { ...st, cards: st.cards.slice(0, count) };
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={181} speed={0.2} />
      <StageTitle at={0} y={28}>
        The DOM: JavaScript's view of the page
      </StageTitle>
      <div style={{ position: "absolute", left: 60, top: 130 }}>
        <CodeCard file="script.js" lang="js" lines={code} fontSize={25} width={980} marks={[{ from: 1, to: 1, at: find, until: build }, { from: 3, to: 4, at: build }]} chars={frame < find ? 0 : frame < build ? code[0].length : Infinity} />
      </div>
      {frame < build + 20 ? (
        <div style={{ position: "absolute", left: 60, top: 440, width: 1200, height: 520 }}>
          {nodes.map((n, i) => {
            const s = pop(frame, fps, 6 + i * 3, 13);
            const hot = n.key && frame >= find + 20;
            return (
              <div key={n.t} style={{ position: "absolute", left: n.x, top: n.y, transform: `translateX(-50%) scale(${s * (hot ? 1.15 : 1)})` }}>
                <Chip size={22} color={hot ? C.gold : n.t.startsWith("#") ? C.mint : C.white}>
                  {n.t}
                </Chip>
              </div>
            );
          })}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 1110, top: 300, opacity: progress(frame, build, 14) }}>
        <GameBrowser width={760} height={620} zoom={0.44} scrollY={300} state={state} chrome={false} />
      </div>
      <Label at={c.line("m3")} out={build} x={1300} y={240} size={34}>this is why we gave them ids!</Label>
      <Label at={c.word("m4", "create")} x={1110} y={240} size={28} color={C.css}>createElement → a new card</Label>
      <Label at={c.word("m4", "append")} x={1110} y={940 - 60} size={28} color={C.css}>appendChild → into the grid</Label>
      <Sfx name="typing" at={find} dur={24} />
      <Sfx name="pop-high" at={find + 20} />
      {Array.from({ length: 12 }).map((_, i) => (
        <Sfx key={i} name="thunk" at={build + 30 + i * 6} volume={0.5} />
      ))}
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 4.10 Closing recap. */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("outro");
  const words = [
    ["VARIABLES", "variables"],
    ["ARRAYS", "arrays"],
    ["FUNCTIONS", "functions"],
    ["EVENTS", "events"],
    ["IF / ELSE", "decisions"],
    ["THE DOM", "dom"],
  ];
  return (
    <AbsoluteFill>
      <Backdrop count={12} seed={191} speed={0.3} />
      {words.map(([t, w], i) => (
        <Label key={t} at={c.word("o2", w)} x={300 + (i % 3) * 660} y={260 + Math.floor(i / 3) * 170} anchor="center" size={50} color={[C.mint, C.gold, C.css, C.red, C.white, C.mint][i]}>
          {t}
        </Label>
      ))}
      <Label at={c.line("o3")} x={960} y={680} anchor="center" size={36} color={C.white}>next: connect them all!</Label>
      {words.map(([, w], i) => (
        <Sfx key={i} name="pop" at={c.word("o2", w)} volume={0.6} />
      ))}
      <EndCard at={c.line("o4")} next="Lesson 5 · The Magic Behind Number Match" nextColor={C.red} />
      <Sfx name="sting" at={c.line("o4") + 4} />
      <AbsoluteFill style={{ background: "#000", opacity: map(frame, [c.duration - 16, c.duration], [0, 1]) }} />
    </AbsoluteFill>
  );
};
