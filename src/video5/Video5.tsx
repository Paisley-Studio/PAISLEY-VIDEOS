import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, EASE_IN_OUT, handStyle, Kicker, Marker, pop, progress, SceneFade, Sfx, Strike, TypeOn } from "../shared/anim";
import { Browser, CodeEditor, CodeLine, EndCard, TitleCard } from "../shared/Code";
import { CLASSIC, GameState, GameView, gameStateAt, GW, JUNGLE, Palette, SPEEDUP_ABS } from "../shared/Game";
import { Fit } from "../shared/Pages";
import { FULL_SKETCH, PaperSketch } from "../shared/PaperSketch";
import { createTimeline, VideoScript } from "../shared/timeline";
import { VideoShell } from "../shared/VideoShell";
import { C, HAND, QUICKSAND, SHADOW } from "../shared/theme";
import script from "./script.json";
import timings from "./vo-timings.json";

// VIDEO 5 — Build Smarter With AI: Claude

const T = createTimeline(script as VideoScript, timings);
export const VIDEO5_FRAMES = T.TOTAL_FRAMES;

const CHAT = { left: 70, top: 150, width: 1000, height: 820 };
const SIDE = { left: 1110, top: 150, width: 750 };

// ---------------- Chat window ----------------

type Msg = { from: "you" | "claude"; at: number; text?: string; body?: React.ReactNode; tag?: string; tagColor?: string };

const ChatWindow: React.FC<{ messages: Msg[]; style?: React.CSSProperties; height?: number }> = ({ messages, style, height = CHAT.height }) => {
  const frame = useCurrentFrame();
  const shown = messages.filter((m) => frame >= m.at);
  return (
    <div style={{ width: CHAT.width, height, background: "white", borderRadius: 30, boxShadow: SHADOW, overflow: "hidden", display: "flex", flexDirection: "column", ...style }}>
      <div style={{ padding: "18px 30px", background: "#f7f2ea", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, color: C.ink, display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.dino }} />
        Claude
      </div>
      <div style={{ flex: 1, padding: "24px 30px", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 16, overflow: "hidden" }}>
        {shown.map((m, i) => (
          <Appear key={i} at={m.at} kind="up">
            <div style={{ display: "flex", flexDirection: "column", alignItems: m.from === "you" ? "flex-end" : "flex-start" }}>
              {m.tag ? (
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 17, letterSpacing: 3, color: "white", background: m.tagColor ?? C.ink, padding: "4px 14px", borderRadius: 999, marginBottom: 8 }}>{m.tag}</div>
              ) : null}
              <div
                style={{
                  maxWidth: 820,
                  padding: "16px 24px",
                  borderRadius: m.from === "you" ? "24px 24px 6px 24px" : "24px 24px 24px 6px",
                  background: m.from === "you" ? C.ink : "#f4efe7",
                  color: m.from === "you" ? "white" : C.ink,
                  fontFamily: QUICKSAND,
                  fontWeight: 600,
                  fontSize: 26,
                  lineHeight: 1.4,
                }}
              >
                {m.text !== undefined && m.from === "you" ? <TypeOn text={m.text} at={m.at} cps={60} caret={false} /> : m.text}
                {m.body}
              </div>
            </div>
          </Appear>
        ))}
      </div>
    </div>
  );
};

const CodeBlock: React.FC<{ children: string }> = ({ children }) => (
  <pre style={{ margin: "12px 0 4px", background: "#1f2430", color: "#e6edf3", borderRadius: 14, padding: "14px 18px", fontFamily: "Consolas, monospace", fontSize: 21, lineHeight: 1.45, whiteSpace: "pre" }}>{children}</pre>
);

const STEPS = ["READ", "UNDERSTAND", "TEST", "QUESTION", "IMPROVE"];
const STEP_COLORS = [C.html, C.css, C.good, C.js, C.dino];

/** The READ · UNDERSTAND · TEST · QUESTION · IMPROVE bar, lighting up as each happens. */
const StepsBar: React.FC<{ marks: (number | null)[]; top?: number; left?: number }> = ({ marks, top = 990, left = CHAT.left }) => {
  const frame = useCurrentFrame();
  return (
    <Appear at={6} kind="up" style={{ position: "absolute", left, top, display: "flex", gap: 12 }}>
      {STEPS.map((s, i) => {
        const at = marks[i];
        const lit = at !== null && at !== undefined && frame >= at;
        return (
          <div
            key={s}
            style={{
              fontFamily: QUICKSAND,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 2,
              padding: "10px 22px",
              borderRadius: 999,
              background: lit ? STEP_COLORS[i] : "white",
              color: lit ? (i === 3 ? C.ink : "white") : C.inkSoft,
              boxShadow: lit ? SHADOW : "none",
            }}
          >
            {s}
          </div>
        );
      })}
    </Appear>
  );
};

const GameBox: React.FC<{ state: GameState; at?: number; top?: number; palette?: Palette; best?: number; children?: React.ReactNode; height?: number }> = ({
  state,
  at = 4,
  top = SIDE.top,
  palette,
  best,
  children,
  height = 430,
}) => (
  <Appear at={at} kind="right" style={{ position: "absolute", left: SIDE.left, top }}>
    <Browser width={SIDE.width} height={height}>
      <div style={{ padding: "14px 24px" }}>
        <Fit width={SIDE.width - 48} pageWidth={GW}>
          <GameView state={state} palette={palette} best={best} />
        </Fit>
      </div>
      {children}
    </Browser>
  </Appear>
);

const Side: React.FC<{ at: number; out?: number; top?: number; children: React.ReactNode }> = ({ at, out, top = SIDE.top + 470, children }) => (
  <Appear at={at} out={out} kind="up" style={{ position: "absolute", left: SIDE.left, top, width: SIDE.width }}>
    <div style={{ background: "white", borderRadius: 24, padding: "20px 26px", boxShadow: SHADOW, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, color: C.ink, lineHeight: 1.35 }}>{children}</div>
  </Appear>
);

const IDLE: GameState = { ...gameStateAt(0), obstacles: [600] };

// ---------------- Scenes ----------------

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("intro");
  const show = cues.word("i1", "final");
  const t = 0.7 + Math.max(0, frame - show) / fps;
  const checks = [
    { line: "i2", text: "what you're building" },
    { line: "i3", text: "the building blocks" },
    { line: "i4", text: "the code" },
  ];
  return (
    <SceneFade duration={cues.duration}>
      <TitleCard number={5} title="Build Smarter With AI" subtitle="Claude" color={C.dino} out={show + 4} />
      <Appear at={show + 12} kind="left" style={{ position: "absolute", left: 80, top: 230 }}>
        <PaperSketch p={FULL_SKETCH} width={760} style={{ transform: "rotate(-3deg)" }} />
      </Appear>
      <Appear at={show + 18} kind="right" style={{ position: "absolute", left: 900, top: 190 }}>
        <Browser width={940} height={530}>
          <div style={{ padding: 20 }}>
            <Fit width={892} pageWidth={GW}>
              <GameView state={gameStateAt(Math.min(t, 13))} />
            </Fit>
          </div>
        </Browser>
      </Appear>
      <div style={{ position: "absolute", left: 0, right: 0, top: 770, display: "flex", gap: 18, justifyContent: "center" }}>
        {checks.map((c) => (
          <Appear key={c.line} at={cues.line(c.line)} kind="pop">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, background: "white", padding: "12px 22px", borderRadius: 999, boxShadow: SHADOW, color: C.ink, whiteSpace: "nowrap" }}>
              <span style={{ color: C.good }}>✓</span> You understand {c.text}
            </span>
          </Appear>
        ))}
      </div>
      <Appear at={cues.line("i5")} kind="pop" style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center" }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 52, color: C.ink }}>
          Now: <Marker at={cues.word("i5", "faster")}>build faster with AI</Marker>
        </span>
      </Appear>
      {checks.map((c) => (
        <Sfx key={c.line} at={cues.line(c.line)} name="tick" volume={0.4} />
      ))}
      <Sfx at={cues.line("i5")} name="pop" volume={0.4} />
    </SceneFade>
  );
};

const PARTS = [
  { label: "WHAT I'M BUILDING", text: "I am building a Dino Runner using HTML, CSS and JavaScript.", color: C.html, word: "building" },
  { label: "WHAT I ALREADY HAVE", text: "I already have the structure, styling and a working game loop.", color: C.css, word: "have" },
  { label: "WHAT I UNDERSTAND", text: "HTML creates the elements, CSS controls how they look, JavaScript controls behaviour.", color: C.good, word: "understand" },
  { label: "WHAT I WANT", text: "I want the game to get faster as the score goes up.", color: C.js, word: "want" },
  { label: "WHAT I NEED", text: "Explain the logic first, then show me only the code I need and where it goes.", color: "#9b5de5", word: "need" },
];

const Prompt: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("prompt");
  const badOut = progress(frame, cues.line("p3") - 8, 14, EASE_IN_OUT);
  const wall = progress(frame, cues.line("p1") + 30, 40);
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>How to ask Claude</Kicker>
      {/* the bad prompt */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - badOut }}>
        <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
          <ChatWindow
            messages={[
              { from: "you", at: cues.line("p1"), body: <Strike at={cues.word("p2", "stuck")}>make me a dino game</Strike> },
              {
                from: "claude",
                at: cues.line("p1") + 30,
                body: (
                  <div style={{ fontFamily: "Consolas, monospace", fontSize: 15, lineHeight: 1.3, color: C.inkSoft, height: 420, overflow: "hidden", opacity: wall }}>
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i}>{["const canvas = document.createElement('canvas');", "class Entity { constructor(x, y, w, h) {", "  this.sprites = new Map(); this.vx = 0;", "ctx.drawImage(sheet, frame * 64, 0, 64, 64);", "window.addEventListener('resize', fit);"][i % 5]}</div>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </div>
        <div style={{ position: "absolute", left: SIDE.left, top: 250, width: SIDE.width }}>
          {["not your game", "not your design", "you don't understand it", "when it breaks, you're stuck"].map((s, i) => (
            <Appear key={s} at={cues.word("p2", ["game", "design", "understand", "stuck"][i])} kind="right" style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: C.danger, background: "white", borderRadius: 22, padding: "16px 26px", boxShadow: SHADOW }}>✗ {s}</div>
            </Appear>
          ))}
        </div>
      </div>
      {/* the good prompt */}
      <div style={{ position: "absolute", left: 230, top: 150, width: 1460, opacity: badOut }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 56, color: C.ink, marginBottom: 26, textAlign: "center" }}>
          How a creator asks: <span style={{ color: C.dino }}>5 parts</span>
        </div>
        {PARTS.map((p, i) => (
          <Appear key={p.label} at={cues.word("p4", p.word)} kind="left" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "stretch", background: "white", borderRadius: 22, boxShadow: SHADOW, overflow: "hidden" }}>
              <div style={{ width: 340, background: p.color, color: p.color === C.js ? C.ink : "white", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 24, letterSpacing: 2, display: "flex", alignItems: "center", padding: "0 24px" }}>
                {i + 1}. {p.label}
              </div>
              <div style={{ flex: 1, padding: "20px 28px", fontFamily: QUICKSAND, fontWeight: 600, fontSize: 30, color: C.ink, outline: i === 4 && frame >= cues.line("p5") ? `5px solid ${C.accent}` : "none", outlineOffset: -5 }}>
                {p.text}
              </div>
            </div>
          </Appear>
        ))}
        <Appear at={cues.word("p5", "with")} kind="pop" style={{ textAlign: "center", marginTop: 26 }}>
          <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.ink }}>
            AI thinks <Marker at={cues.word("p5", "with")}>with</Marker> you, not for you.
          </span>
        </Appear>
      </div>
      <Sfx at={cues.line("p1")} name="typing" volume={0.3} />
      <Sfx at={cues.word("p2", "stuck")} name="scribble" volume={0.5} />
      {PARTS.map((p) => (
        <Sfx key={p.word} at={cues.word("p4", p.word)} name="pop" volume={0.35} />
      ))}
    </SceneFade>
  );
};

const Understand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("understand");
  const ask = cues.line("u2");
  const follow = cues.word("u3", "follow");
  const test = cues.line("u4");
  // the test: with padding 30 the dino clips through the edge of the cactus
  const t = Math.max(0, (frame - test) / fps);
  const x = 800 - ((t * 380) % 1100);
  const state: GameState = frame >= test ? { ...IDLE, showStart: false, running: true, obstacles: [x], groundOffset: (t * 380) % 40, legPhase: Math.floor(t * 10) % 2 } : IDLE;
  const clipping = frame >= test && x < 100 && x > 40;
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Use 1 · Understanding</Kicker>
      <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
        <ChatWindow
          messages={[
            { from: "you", at: ask, tag: "UNDERSTANDING", tagColor: C.css, text: "I'm a beginner. Explain what this function does in simple language, line by line: isColliding()" },
            {
              from: "claude",
              at: ask + 70,
              body: (
                <div>
                  <div>1. getBoundingClientRect() gives each box's edges.</div>
                  <div>2. padding shrinks the boxes, so near-misses feel fair.</div>
                  <div>3. overlapLeftRight: do they overlap side to side?</div>
                  <div>4. overlapUpDown: do they overlap up and down?</div>
                  <div>5. A crash only happens when both are true.</div>
                </div>
              ),
            },
            { from: "you", at: follow, text: "What happens if I change padding to 30?" },
            { from: "claude", at: follow + 50, text: "The boxes get much smaller, so the dino could pass through the edges of the cactus. Try it and watch!" },
          ]}
        />
      </div>
      <GameBox state={state}>
        {clipping ? (
          <div style={{ position: "absolute", left: 60, top: 70, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, color: "white", background: C.danger, padding: "6px 16px", borderRadius: 999 }}>clipped through!</div>
        ) : null}
      </GameBox>
      <Side at={cues.word("u3", "tutor")} out={test - 6}>
        Use AI like a <span style={{ color: C.css }}>patient tutor</span>. Ask until it clicks.
      </Side>
      <Side at={test}>
        <span style={{ fontFamily: "Consolas, monospace" }}>padding = 30</span> → tested. <Marker at={cues.word("u4", "see")}>Don't just believe it. See it.</Marker>
      </Side>
      <StepsBar marks={[ask + 70, ask + 120, test, follow, null]} />
      <Sfx at={ask} name="typing" volume={0.3} />
      <Sfx at={ask + 70} name="pop" volume={0.35} />
      <Sfx at={follow} name="typing" volume={0.3} />
      <Sfx at={follow + 50} name="pop" volume={0.35} />
    </SceneFade>
  );
};

const Debug: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("debug");
  const bugAt = cues.word("d2", "falls");
  const t = ((frame - bugAt) / fps) % 1.6;
  const y = frame >= bugAt && frame < cues.line("d3") + 10 ? 900 * t - 1440 * t * t : 0;
  const ask = cues.line("d3");
  const reply = cues.end("d4") + 10;
  const broken: CodeLine[] = [
    { text: "function updatePlayer() {" },
    { text: "  playerY = playerY + playerVelocity;" },
    { text: "  playerVelocity = playerVelocity - gravity;" },
    { text: "" },
    { text: "  // (the landing check was deleted!)" },
    { text: "" },
    { text: '  player.style.bottom = (groundLevel + playerY) + "px";' },
    { text: "}" },
  ];
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Use 2 · Debugging</Kicker>
      <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
        <ChatWindow
          messages={[
            {
              from: "you",
              at: ask,
              tag: "DEBUGGING",
              tagColor: C.danger,
              text: "My dinosaur jumps but doesn't come back to the ground. It falls through the floor and I can't jump again. Here is my code. Explain WHY before you give me the fix.",
            },
            {
              from: "claude",
              at: reply,
              body: (
                <div>
                  <b>Why:</b> gravity keeps making playerVelocity more negative, so playerY keeps going down forever. Nothing says "stop at the ground", and isJumping never goes back to false.
                  <CodeBlock>{"if (playerY <= 0) {\n  playerY = 0;\n  playerVelocity = 0;\n  isJumping = false;\n}"}</CodeBlock>
                </div>
              ),
            },
          ]}
        />
      </div>
      <GameBox state={{ ...IDLE, showStart: false, dinoY: Math.max(-200, y) }} />
      <Appear at={cues.line("d2")} out={reply - 6} kind="up" style={{ position: "absolute", left: SIDE.left, top: SIDE.top + 470 }}>
        <CodeEditor file="script.js" lang="js" lines={broken} width={SIDE.width} height={330} fontSize={18} marks={[{ from: 4, to: 4, at: cues.line("d2"), color: "rgba(214,69,69,0.2)" }]} />
      </Appear>
      <Side at={cues.word("d3", "expected")} out={cues.line("d4") - 4} top={SIDE.top + 820}>
        expected · what happened · the code
      </Side>
      <Appear at={cues.line("d4")} out={reply - 6} kind="pop" style={{ position: "absolute", left: SIDE.left, top: SIDE.top + 820 }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, color: "white", background: C.ink, padding: "12px 28px", borderRadius: 999 }}>Ask WHY before the fix</span>
      </Appear>
      <Side at={cues.line("d6")}>
        <span style={{ color: C.good }}>✓</span> Same bug we fixed in Video 4. You can <Marker at={cues.word("d6", "right")}>check if AI is right</Marker>.
      </Side>
      <StepsBar marks={[reply, cues.line("d5"), null, cues.line("d6"), null]} />
      <Sfx at={bugAt} name="jump" volume={0.35} />
      <Sfx at={ask} name="typing" volume={0.3} />
      <Sfx at={reply} name="pop" volume={0.35} />
      <Sfx at={cues.line("d6")} name="chime" volume={0.3} />
    </SceneFade>
  );
};

const Feature: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("feature");
  const ask = cues.line("f2");
  const table = cues.line("f3");
  const code = cues.line("f4");
  const play = cues.line("f5");
  const q = cues.line("f6");
  const playT = SPEEDUP_ABS - 3.2 + Math.max(0, frame - play + 10) / fps;
  const codeLines: CodeLine[] = [
    { text: "const startSpeed = 6;", at: code },
    { text: "let gameSpeed = startSpeed;", at: code + 6 },
    { text: "", at: code + 10 },
    { text: "function updateSpeed() {", at: code + 12 },
    { text: "  const level = Math.floor(score / 100);", at: code + 18 },
    { text: "  gameSpeed = startSpeed + level;", at: code + 24, until: cues.word("f6", "maximum") + 6 },
    { text: "  gameSpeed = Math.min(startSpeed + level, 14);", at: cues.word("f6", "maximum") + 6 },
    { text: "}", at: code + 30 },
  ];
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Use 3 · Adding a feature</Kicker>
      <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
        <ChatWindow
          messages={[
            { from: "you", at: ask, tag: "FEATURE · 5-PART PROMPT", tagColor: C.js, text: "I'm building a Dino Runner (HTML, CSS, JS). I have a working game loop; the obstacle moves using gameSpeed. I want the game to speed up every 100 points. Explain the logic first, then show me only the code I need." },
            { from: "claude", at: ask + 70, body: <div><b>The logic:</b> level = score ÷ 100, rounded down. Speed = starting speed + level. Keep startSpeed so restart can reset it.</div> },
            { from: "you", at: q, text: "Will this get impossibly fast?" },
            { from: "claude", at: q + 40, body: <div>It could! Add a maximum: <span style={{ fontFamily: "Consolas, monospace" }}>Math.min(startSpeed + level, 14)</span></div> },
          ]}
        />
      </div>
      {/* logic table */}
      <Appear at={table} out={play - 6} kind="right" style={{ position: "absolute", left: SIDE.left, top: SIDE.top }}>
        <div style={{ width: SIDE.width, background: "white", borderRadius: 24, boxShadow: SHADOW, overflow: "hidden", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30 }}>
          {[
            ["Score", "Level", "Speed"],
            ["0 – 99", "0", "6"],
            ["100 – 199", "1", "7"],
            ["200 – 299", "2", "8"],
          ].map((row, i) => (
            <Appear key={i} at={table + 8 + i * 8} kind="fade" style={{ display: "flex", background: i === 0 ? C.js : i % 2 ? "white" : C.canvas }}>
              {row.map((c, j) => (
                <div key={j} style={{ flex: 1, padding: "16px 22px", color: C.ink }}>
                  {c}
                </div>
              ))}
            </Appear>
          ))}
        </div>
      </Appear>
      <Appear at={code} out={play - 6} kind="up" style={{ position: "absolute", left: SIDE.left, top: SIDE.top + 340 }}>
        <CodeEditor file="script.js" lang="js" lines={codeLines} width={SIDE.width} height={330} fontSize={19} />
      </Appear>
      <GameBox at={play} state={gameStateAt(Math.min(playT, 14.2))} />
      <Appear at={q} kind="up" style={{ position: "absolute", left: SIDE.left, top: SIDE.top + 470 }}>
        <CodeEditor file="script.js" lang="js" lines={codeLines.filter((l) => l.text.includes("gameSpeed =")).map((l) => ({ ...l, at: l.at && l.at > q ? l.at : undefined }))} width={SIDE.width} height={160} fontSize={19} />
      </Appear>
      <Appear at={cues.word("f6", "deciding")} kind="pop" style={{ position: "absolute", left: SIDE.left, top: SIDE.top + 660 }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, color: "white", background: C.ink, padding: "12px 28px", borderRadius: 999 }}>You're the one deciding.</span>
      </Appear>
      <StepsBar marks={[ask + 70, table, play, q, cues.word("f6", "maximum")]} />
      <Sfx at={ask} name="typing" volume={0.3} />
      <Sfx at={ask + 70} name="pop" volume={0.35} />
      <Sfx at={code} name="typing" volume={0.3} />
      <Sfx at={play + Math.round((3.2 - 0) * fps) - 10} name="levelup" volume={0.45} />
      <Sfx at={q} name="typing" volume={0.3} />
    </SceneFade>
  );
};

const Ideas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("ideas");
  const ask = cues.line("n2");
  const reply = ask + 60;
  const choose = cues.word("n3", "choose");
  const paperAt = cues.line("n4");
  const ideas = [
    { title: "Best score", file: "HTML + JS", color: C.dino },
    { title: "Different obstacles", file: "CSS + JS", color: C.cactus },
    { title: "Day / night sky", file: "CSS + JS", color: C.css },
  ];
  const picked = frame >= cues.word("n3", "plan");
  const gameAt = paperAt + 70;
  const t = 0.7 + Math.max(0, frame - gameAt) / fps;
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Use 4 · Ideas</Kicker>
      <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
        <ChatWindow
          height={520}
          messages={[
            { from: "you", at: ask, tag: "IDEAS", tagColor: C.good, text: "Suggest three ways to make my game more interesting without changing its core gameplay. Keep them beginner-friendly, and tell me which files each one changes." },
            { from: "claude", at: reply, text: "Here are three ideas:" },
          ]}
        />
      </div>
      <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top + 550, width: CHAT.width, display: "flex", gap: 20 }}>
        {ideas.map((idea, i) => {
          const dim = picked && i !== 0;
          return (
            <Appear key={idea.title} at={reply + 10 + i * 10} kind="pop" style={{ flex: 1 }}>
              <div
                style={{
                  background: "white",
                  borderRadius: 24,
                  padding: "22px 22px",
                  boxShadow: SHADOW,
                  border: `5px solid ${picked && i === 0 ? C.accent : "transparent"}`,
                  opacity: dim ? 0.4 : 1,
                  transform: `scale(${picked && i === 0 ? 1.05 : 1})`,
                }}
              >
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 22, color: idea.color }}>IDEA {i + 1}</div>
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, color: C.ink, margin: "6px 0" }}>{idea.title}</div>
                <div style={{ fontFamily: "Consolas, monospace", fontSize: 20, color: C.inkSoft }}>{idea.file}</div>
              </div>
            </Appear>
          );
        })}
      </div>
      <Side at={choose} out={paperAt - 6} top={SIDE.top}>
        AI gives ideas. <span style={{ color: C.dino }}>You choose.</span> Which one fits your paper plan?
      </Side>
      <Appear at={paperAt} kind="right" style={{ position: "absolute", left: SIDE.left + 75, top: SIDE.top - 10 }}>
        <div style={{ position: "relative" }}>
          <PaperSketch p={FULL_SKETCH} width={600} />
          <div style={{ position: "absolute", left: 600 * 0.73, top: 600 * 0.66 * 0.4, ...handStyle(30, C.dino), clipPath: `inset(-20% ${(1 - progress(frame, cues.word("n4", "paper"), 16)) * 100}% -20% -5%)` }}>
            Best: 0
          </div>
        </div>
      </Appear>
      <GameBox at={gameAt} top={SIDE.top + 420} state={gameStateAt(Math.min(t, 12))} best={162} height={440} />
      <Sfx at={ask} name="typing" volume={0.3} />
      {ideas.map((idea, i) => (
        <Sfx key={idea.title} at={reply + 10 + i * 10} name="pop" volume={0.35} />
      ))}
      <Sfx at={cues.word("n3", "plan")} name="tick" volume={0.45} />
      <Sfx at={cues.word("n4", "paper")} name="pencil" volume={0.35} />
      <Sfx at={gameAt} name="whoosh" volume={0.3} />
    </SceneFade>
  );
};

const Design: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("design");
  const ask = cues.line("s2");
  const reply = cues.line("s3");
  const swap = cues.line("s4");
  const mix = progress(frame, swap + 10, 24, EASE_IN_OUT);
  const t = 0.7 + frame / fps;
  const jungle = mix > 0.5;
  const vars: [string, string, string][] = [
    ["--sky", C.sky, JUNGLE.sky],
    ["--ground", C.ground, JUNGLE.ground],
    ["--player", C.dino, JUNGLE.dino],
    ["--obstacle", C.cactus, JUNGLE.cactus],
  ];
  const lines: CodeLine[] = [{ text: ":root {" }, ...vars.map(([n, a, b]) => ({ text: `  ${n}: ${jungle ? b : a};` })), { text: "}" }];
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Use 5 · Design</Kicker>
      <div style={{ position: "absolute", left: CHAT.left, top: CHAT.top }}>
        <ChatWindow
          messages={[
            { from: "you", at: ask, tag: "DESIGN", tagColor: "#9b5de5", text: "I want a jungle theme. What parts of my HTML and CSS would I need to change? I use CSS variables in :root for my colours." },
            { from: "claude", at: reply, body: <div>Most of it is your <b>:root colour variables</b>: sky, ground, player and obstacle. You could reshape #obstacle into a log. <b>No JavaScript changes needed</b>: behaviour stays the same.</div> },
          ]}
        />
      </div>
      <div style={{ position: "absolute", left: SIDE.left, top: SIDE.top }}>
        <Browser width={SIDE.width} height={430}>
          <div style={{ position: "absolute", inset: 0, padding: "14px 24px", opacity: 1 - mix }}>
            <Fit width={SIDE.width - 48} pageWidth={GW}>
              <GameView state={gameStateAt(Math.min(t, 12))} palette={CLASSIC} />
            </Fit>
          </div>
          <div style={{ position: "absolute", inset: 0, padding: "14px 24px", opacity: mix, background: "#e4efd9" }}>
            <Fit width={SIDE.width - 48} pageWidth={GW}>
              <GameView state={gameStateAt(Math.min(t, 12))} palette={JUNGLE} />
            </Fit>
          </div>
        </Browser>
      </div>
      <Appear at={reply} kind="up" style={{ position: "absolute", left: SIDE.left, top: SIDE.top + 470 }}>
        <CodeEditor file="style.css" lang="css" lines={lines} width={SIDE.width} height={260} fontSize={22} marks={[{ from: 1, to: 4, at: swap }]} />
      </Appear>
      <Side at={cues.line("s5")} top={SIDE.top + 760}>
        No JavaScript changes. <span style={{ color: C.css }}>Appearance</span> and <span style={{ color: C.js }}>behaviour</span> are separate jobs.
      </Side>
      <Sfx at={ask} name="typing" volume={0.3} />
      <Sfx at={reply} name="pop" volume={0.35} />
      <Sfx at={swap + 10} name="whoosh" volume={0.4} />
      <Sfx at={swap + 20} name="chime" volume={0.3} />
    </SceneFade>
  );
};

const Rules: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("rules");
  const uses = ["UNDERSTANDING", "DEBUGGING", "FEATURES", "IDEAS", "DESIGN"];
  const words = ["read", "understand", "test", "question", "improve"];
  return (
    <SceneFade duration={cues.duration}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 16 }}>
          {uses.map((u, i) => (
            <Appear key={u} at={cues.line("r1") + i * 5} kind="pop">
              <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, letterSpacing: 2, padding: "14px 26px", borderRadius: 999, background: "white", color: C.ink, boxShadow: SHADOW }}>{u}</div>
            </Appear>
          ))}
        </div>
        <Appear at={cues.line("r2")} kind="up" style={{ marginTop: 70, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 52, color: C.inkSoft }}>
          Every time, the same five steps:
        </Appear>
        <div style={{ display: "flex", gap: 16, marginTop: 40 }}>
          {STEPS.map((s, i) => {
            const at = cues.word("r3", words[i]);
            const p = pop(frame, fps, at, 11);
            return (
              <div
                key={s}
                style={{
                  fontFamily: QUICKSAND,
                  fontWeight: 700,
                  fontSize: 34,
                  padding: "20px 28px",
                  whiteSpace: "nowrap",
                  borderRadius: 999,
                  background: STEP_COLORS[i],
                  color: i === 3 ? C.ink : "white",
                  boxShadow: SHADOW,
                  transform: `scale(${0.5 + 0.5 * p})`,
                  opacity: Math.min(1, p * 2),
                }}
              >
                {s} IT
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {uses.map((u, i) => (
        <Sfx key={u} at={cues.line("r1") + i * 5} name="tick" volume={0.3} />
      ))}
      {words.map((w) => (
        <Sfx key={w} at={cues.word("r3", w)} name="pop" volume={0.4} />
      ))}
    </SceneFade>
  );
};

const JOURNEY = [
  { label: "IDEA", word: "idea", color: C.ink },
  { label: "PAPER PLAN", word: "paper", color: C.pencil },
  { label: "HTML", word: "html", color: C.html },
  { label: "CSS", word: "css", color: C.css },
  { label: "JAVASCRIPT", word: "javascript", color: C.js },
  { label: "WORKING GAME", word: "working", color: C.good },
  { label: "AI", word: "ai", color: "#9b5de5" },
  { label: "IMPROVED GAME", word: "improved", color: C.dino },
];

const Journey: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("journey");
  return (
    <SceneFade duration={cues.duration}>
      <Appear at={cues.line("j1")} kind="down" style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 80, color: C.ink }}>
        Look how far you've come.
      </Appear>
      <div style={{ position: "absolute", left: 90, right: 90, top: 470, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {JOURNEY.map((n, i) => {
          const at = cues.word("j2", n.word);
          return (
            <React.Fragment key={n.label}>
              <Appear at={at - 2} kind="pop">
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 170 }}>
                  <div style={{ width: 110, height: 110, borderRadius: 32, background: n.color, boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: n.color === C.js ? C.ink : "white" }}>
                    {i + 1}
                  </div>
                  <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 22, letterSpacing: 1, color: C.ink, textAlign: "center" }}>{n.label}</div>
                </div>
              </Appear>
              {i < JOURNEY.length - 1 ? (
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 36, color: C.inkSoft, opacity: progress(frame, cues.word("j2", JOURNEY[i + 1].word) - 6, 8), marginTop: -40 }}>→</div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
      {JOURNEY.map((n) => (
        <Sfx key={n.label} at={cues.word("j2", n.word) - 2} name="tick" volume={0.4} />
      ))}
      <Sfx at={cues.word("j2", "improved")} name="chime" volume={0.35} />
    </SceneFade>
  );
};

const Final: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("final");
  const listOut = progress(frame, cues.line("z11") - 8, 14, EASE_IN_OUT);
  const shapesOut = progress(frame, cues.line("z13") - 8, 14, EASE_IN_OUT);
  const steps = [
    ["z3", "started with an idea"],
    ["z4", "imagined the finished product"],
    ["z5", "put it on paper"],
    ["z6", "broke it into pieces"],
    ["z7", "built those pieces"],
    ["z8", "tested them"],
    ["z9", "solved problems"],
    ["z10", "used AI to go further"],
  ];
  const things = [
    { word: "websites", label: "Websites" },
    { word: "apps", label: "Apps" },
    { word: "tools", label: "Tools" },
    { word: "businesses", label: "Businesses" },
    { word: "creative", label: "Creative projects" },
    { word: "exist", label: "Ideas that don't exist yet" },
  ];
  const triple = ["imagine", "plan", "build"];
  const end = cues.end("z13") + 30;
  return (
    <SceneFade duration={cues.duration} fadeOut={24}>
      {/* not just a game: a process */}
      <div style={{ position: "absolute", inset: 0, opacity: 1 - listOut }}>
        <div style={{ position: "absolute", left: 140, top: 200, width: 700 }}>
          <Appear at={cues.line("z1")} kind="up" style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 62, color: C.inkSoft, lineHeight: 1.15 }}>
            You didn't just make a game.
          </Appear>
          <Appear at={cues.line("z2")} kind="up" style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 92, color: C.ink, marginTop: 20, lineHeight: 1.1 }}>
            You learned a <span style={{ color: C.dino }}>process</span>.
          </Appear>
        </div>
        <div style={{ position: "absolute", left: 1000, top: 170, width: 800 }}>
          {steps.map(([line, text]) => {
            const at = cues.line(line);
            const tick = pop(frame, fps, at, 12);
            return (
              <div key={line} style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, opacity: Math.min(1, tick * 2), transform: `translateX(${(1 - tick) * 40}px)` }}>
                <div style={{ width: 50, height: 50, borderRadius: 16, background: C.good, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width={28} height={28} viewBox="0 0 34 34">
                    <path d="M 6 18 L 14 26 L 28 8" stroke="white" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 42, color: C.ink }}>You {text}.</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* far more than games */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: listOut * (1 - shapesOut) }}>
        <Appear at={cues.line("z11")} kind="up" style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 70, color: C.ink, textAlign: "center" }}>
          This process builds far more than games.
        </Appear>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 22, marginTop: 60, width: 1500 }}>
          {things.map((th, i) => (
            <Appear key={th.word} at={cues.word("z12", th.word)} kind="pop">
              <div
                style={{
                  fontFamily: QUICKSAND,
                  fontWeight: 700,
                  fontSize: 40,
                  padding: "22px 40px",
                  borderRadius: 30,
                  background: i === things.length - 1 ? C.dino : "white",
                  color: i === things.length - 1 ? "white" : C.ink,
                  boxShadow: SHADOW,
                }}
              >
                {th.label}
              </div>
            </Appear>
          ))}
        </div>
      </AbsoluteFill>
      {/* imagine / plan / build */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: shapesOut * (1 - progress(frame, end, 14)) }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          {triple.map((w, i) => {
            const at = cues.word("z13", w);
            const p = pop(frame, fps, at - 3, 12);
            return (
              <div key={w} style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 120, color: C.ink, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 40}px)` }}>
                You <span style={{ color: [C.css, C.good, C.dino][i] }}>{w}</span> it.
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <EndCard at={end} done={5} />
      <Appear at={end + 40} kind="up" style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center" }}>
        <span style={{ fontFamily: HAND, fontWeight: 700, fontSize: 64, color: C.dino }}>Now go build something that doesn't exist yet.</span>
      </Appear>
      {steps.map(([line]) => (
        <Sfx key={line} at={cues.line(line)} name="tick" volume={0.35} />
      ))}
      {things.map((th) => (
        <Sfx key={th.word} at={cues.word("z12", th.word)} name="pop" volume={0.35} />
      ))}
      {triple.map((w) => (
        <Sfx key={w} at={cues.word("z13", w) - 3} name="thunk" volume={0.45} />
      ))}
      <Sfx at={end} name="chime" volume={0.5} />
    </SceneFade>
  );
};

const SCENES: Record<string, React.FC> = {
  intro: Intro,
  prompt: Prompt,
  understand: Understand,
  debug: Debug,
  feature: Feature,
  ideas: Ideas,
  design: Design,
  rules: Rules,
  journey: Journey,
  final: Final,
};

export const Video5: React.FC = () => <VideoShell timeline={T} scenes={SCENES} voDir="video5/vo" />;
