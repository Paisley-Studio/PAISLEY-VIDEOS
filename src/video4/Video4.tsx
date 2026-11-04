import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, handStyle, Kicker, Marker, pop, progress, SceneFade, Sfx } from "../shared/anim";
import { Browser, CodeEditor, CodeLine, CodeMark, EndCard, Stepper, TitleCard } from "../shared/Code";
import { CRASH_AT, GameState, GameView, gameStateAt, GW, JUMP_TIMES, RESTART_AT } from "../shared/Game";
import { Fit } from "../shared/Pages";
import { SpaceKey } from "../shared/Props";
import { createTimeline, VideoScript } from "../shared/timeline";
import { VideoShell } from "../shared/VideoShell";
import { C, QUICKSAND, SHADOW } from "../shared/theme";
import script from "./script.json";
import timings from "./vo-timings.json";

// VIDEO 4 — Make It Come Alive: JavaScript

const T = createTimeline(script as VideoScript, timings);
export const VIDEO4_FRAMES = T.TOTAL_FRAMES;

const SECTIONS = ["Find the game pieces", "Keyboard input", "Jumping + the game loop", "Gravity + landing", "Moving the obstacle", "Collision detection", "Score", "Game Over + restart"];

const jsLines = (section: number, body: (string | CodeLine)[], at: number, perLine = 5): CodeLine[] => [
  ...SECTIONS.slice(0, section).map((name, i) => ({ text: `// ✓ ${i + 1}. ${name}` })),
  ...(section > 0 ? [{ text: "" }] : []),
  { text: `// ${section + 1}. ${SECTIONS[section].toUpperCase()}`, at },
  ...body.map((l, i) => (typeof l === "string" ? { text: l, at: at + 6 + i * perLine } : l)),
];
const head = (section: number) => section + (section > 0 ? 2 : 1);

const ED = { left: 60, top: 140, width: 1030, height: 830 };
const BR = { left: 1130, top: 150, width: 730, height: 420 };

// ---------- Game states for the demos ----------
const IDLE: GameState = { ...gameStateAt(0), obstacles: [600] };
const RUNNING = (t: number, extra: Partial<GameState> = {}): GameState => ({
  ...IDLE,
  showStart: false,
  running: true,
  groundOffset: (t * 380) % 40,
  cloudOffset: t * 24,
  legPhase: Math.floor(t * 10) % 2,
  ...extra,
});
const V = 900; // jump speed, px per second
const G = 2880; // gravity, px per second²

/** The browser showing the game */
const GameBrowser: React.FC<{ state: GameState; refreshAt?: number[]; buttonPressed?: boolean; children?: React.ReactNode; top?: number; height?: number }> = ({
  state,
  refreshAt = [],
  buttonPressed,
  children,
  top = BR.top,
  height = BR.height,
}) => (
  <Appear at={4} kind="right" style={{ position: "absolute", left: BR.left, top }}>
    <Browser width={BR.width} height={height} refreshAt={refreshAt}>
      <div style={{ padding: "14px 24px" }}>
        <Fit width={BR.width - 48} pageWidth={GW}>
          <GameView state={state} buttonPressed={buttonPressed} showSpeed={false} />
        </Fit>
      </div>
      {children}
    </Browser>
  </Appear>
);

const Editor: React.FC<{ lines: CodeLine[]; marks?: CodeMark[]; scroll?: [number, number][]; fontSize?: number }> = ({ lines, marks, scroll, fontSize = 20 }) => (
  <Appear at={0} kind="left" style={{ position: "absolute", left: ED.left, top: ED.top }}>
    <CodeEditor file="script.js" lang="js" lines={lines} marks={marks} width={ED.width} height={ED.height} fontSize={fontSize} scroll={scroll} />
  </Appear>
);

const Panel: React.FC<{ at: number; out?: number; top?: number; children: React.ReactNode; dark?: boolean }> = ({ at, out, top = BR.top + BR.height + 30, children, dark }) => (
  <Appear at={at} out={out} kind="up" style={{ position: "absolute", left: BR.left, top, width: BR.width }}>
    <div
      style={{
        background: dark ? "#1f2430" : "white",
        color: dark ? "#c9d1d9" : C.ink,
        borderRadius: 24,
        padding: "20px 26px",
        boxShadow: SHADOW,
        fontFamily: QUICKSAND,
        fontWeight: 700,
        fontSize: 30,
        lineHeight: 1.35,
      }}
    >
      {children}
    </div>
  </Appear>
);

/** Browser console with log lines appearing at given frames */
const Console: React.FC<{ at: number; logs: { at: number; text: string }[]; top?: number }> = ({ at, logs, top }) => {
  const frame = useCurrentFrame();
  const shown = logs.filter((l) => frame >= l.at);
  return (
    <Panel at={at} top={top} dark>
      <div style={{ fontSize: 18, letterSpacing: 3, color: "#8b949e", marginBottom: 10 }}>CONSOLE</div>
      <div style={{ fontFamily: "Consolas, monospace", fontSize: 24, minHeight: 120 }}>
        {shown.slice(-4).map((l, i) => (
          <div key={i} style={{ color: l.text.startsWith("<") ? "#f4a3d0" : "#e6edf3" }}>
            › {l.text}
          </div>
        ))}
      </div>
    </Panel>
  );
};

/** Live variable boxes */
const Vars: React.FC<{ vars: [string, string][]; at: number; out?: number; top?: number }> = ({ vars, at, out, top }) => (
  <Panel at={at} out={out} top={top}>
    <div style={{ display: "flex", gap: 18 }}>
      {vars.map(([n, v]) => (
        <div key={n} style={{ flex: 1, background: C.canvas, borderRadius: 16, padding: "12px 16px", border: `3px solid ${C.js}` }}>
          <div style={{ fontFamily: "Consolas, monospace", fontSize: 20, color: C.inkSoft }}>{n}</div>
          <div style={{ fontFamily: "Consolas, monospace", fontSize: 36, color: C.ink }}>{v}</div>
        </div>
      ))}
    </div>
  </Panel>
);

const Strip: React.FC<{ marks: number[] }> = ({ marks }) => (
  <Appear at={8} kind="up" style={{ position: "absolute", left: ED.left, top: 990 }}>
    <Stepper steps={["SHOW CODE", "EXPLAIN IT", "RUN IT", "SEE WHAT CHANGED"]} marks={marks} color={C.js} />
  </Appear>
);

// ---------------- Scenes ----------------

const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("intro");
  const show = cues.word("i1", "structure");
  const items = ["jumps", "moves", "detects collision", "increases score", "ends the game", "restarts"];
  const press = cues.word("i3", "teach");
  return (
    <SceneFade duration={cues.duration}>
      <TitleCard number={4} title="Make It Come Alive" subtitle="JavaScript" color={C.js} out={show - 8} />
      <Appear at={show} kind="left" style={{ position: "absolute", left: 90, top: 210 }}>
        <Browser width={980} height={560}>
          <div style={{ padding: 30 }}>
            <Fit width={920} pageWidth={GW}>
              <GameView state={IDLE} />
            </Fit>
          </div>
        </Browser>
      </Appear>
      <Appear at={cues.line("i2")} kind="up" style={{ position: "absolute", left: 330, top: 820 }}>
        <SpaceKey pressed={(frame > press && frame < press + 8) || (frame > press + 14 && frame < press + 22)} />
      </Appear>
      <Appear at={cues.word("i3", "do")} kind="right" style={{ position: "absolute", left: 1150, top: 210, width: 690 }}>
        <div style={{ background: "white", borderRadius: 30, padding: "34px 40px", boxShadow: SHADOW, borderTop: `10px solid ${C.js}` }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.inkSoft }}>QUESTION 3</div>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 56, color: C.ink, margin: "6px 0 20px" }}>What does it do?</div>
          {items.map((it, i) => {
            const at = cues.end("i3") + 6 + i * 6;
            const s = pop(frame, fps, at);
            return (
              <div key={it} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12, opacity: Math.min(1, s * 2), transform: `translateX(${(1 - s) * 30}px)` }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.js, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</div>
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, color: C.ink }}>{it}</div>
              </div>
            );
          })}
        </div>
      </Appear>
      <Sfx at={press} name="click" volume={0.5} />
      <Sfx at={press + 14} name="click" volume={0.5} />
      {items.map((it, i) => (
        <Sfx key={it} at={cues.end("i3") + 6 + i * 6} name="tick" volume={0.3} />
      ))}
    </SceneFade>
  );
};

const Pieces: React.FC = () => {
  const cues = T.cuesFor("pieces");
  const at = cues.word("a1", "find");
  const ids = ["game", "game-area", "player", "obstacle", "score", "start-text", "message", "restart-button"];
  const names = ["game", "gameArea", "player", "obstacle", "scoreText", "startText", "message", "restartButton"];
  const body = [...ids.map((id, i) => `const ${names[i]} = document.getElementById("${id}");`), "", { text: "console.log(player);", at: cues.line("a5") }];
  const h = head(0);
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>1 · Find the game pieces</Kicker>
      <Editor
        fontSize={19}
        lines={jsLines(0, body, at, 5)}
        marks={[
          { from: h + 2, to: h + 2, at: cues.line("a3"), until: cues.line("a5"), label: "find the thing called player" },
          { from: h + 2, to: h + 2, at: cues.line("a4"), until: cues.line("a5"), color: "rgba(242,183,5,0.25)" },
        ]}
      />
      <GameBrowser state={IDLE} />
      <Panel at={cues.line("a2")} out={cues.line("a4") - 4}>
        Remember the <span style={{ color: C.html }}>id name tags</span>? This is why we made them.
      </Panel>
      <Appear at={cues.line("a4")} out={cues.line("a5") - 4} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 30, width: BR.width }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, background: "white", borderRadius: 24, padding: "20px 26px", boxShadow: SHADOW }}>
          <div style={{ width: 150, height: 110, borderRadius: 16, border: `5px solid ${C.js}`, display: "flex", alignItems: "center", justifyContent: "center", background: C.canvas }}>
            <div style={{ width: 30, height: 36, borderRadius: "10px 12px 4px 4px", background: C.dino }} />
          </div>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, color: C.ink }}>
            A <span style={{ color: C.js }}>variable</span> is a labelled box
            <br />
            called <span style={{ fontFamily: "Consolas, monospace" }}>player</span>.
          </div>
        </div>
      </Appear>
      <Console at={cues.line("a5")} logs={[{ at: cues.word("a5", "there"), text: '<div id="player"></div>' }]} />
      <Strip marks={[at, cues.line("a3"), cues.line("a5"), cues.word("a5", "there")]} />
      <Sfx at={at} name="typing" volume={0.3} />
      <Sfx at={cues.word("a5", "there")} name="pop" volume={0.45} />
    </SceneFade>
  );
};

const Keyboard: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = T.cuesFor("keyboard");
  const at = cues.word("k1", "know");
  const body = [
    'document.addEventListener("keydown", function (event) {',
    '  if (event.code !== "Space") {',
    "    return; // we only care about Space",
    "  }",
    "  event.preventDefault(); // don't scroll the page",
    "",
    '  console.log("Space pressed!");',
    "});",
  ];
  const h = head(1);
  const p = cues.word("k4", "press");
  const presses = [p + 4, p + 16, p + 26];
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>2 · Keyboard input</Kicker>
      <Editor
        lines={jsLines(1, body, at, 6)}
        marks={[
          { from: h, to: h, at: cues.line("k2"), until: cues.line("k3"), label: "listen for a key" },
          { from: h + 1, to: h + 3, at: cues.line("k3"), until: cues.line("k4"), label: "not Space? stop." },
          { from: h + 6, to: h + 6, at: cues.line("k4") },
        ]}
      />
      <GameBrowser state={IDLE} />
      <Appear at={cues.line("k2")} kind="pop" style={{ position: "absolute", left: BR.left + 40, top: BR.top + 40 }}>
        <svg width={80} height={90} viewBox="0 0 80 90">
          <path d="M 60 40 C 60 10 20 5 15 35 C 12 55 30 55 30 70 C 30 82 45 85 50 75" stroke={C.ink} strokeWidth={7} fill={C.accent} strokeLinecap="round" />
        </svg>
      </Appear>
      <Appear at={cues.line("k3")} kind="up" style={{ position: "absolute", left: BR.left + 180, top: BR.top + BR.height + 30 }}>
        <SpaceKey pressed={presses.some((f) => frame >= f && frame < f + 6)} />
      </Appear>
      <Console at={cues.line("k4")} top={BR.top + BR.height + 150} logs={presses.map((f) => ({ at: f + 2, text: "Space pressed!" }))} />
      <Strip marks={[at, cues.line("k2"), p, cues.word("k4", "hear")]} />
      <Sfx at={at} name="typing" volume={0.3} />
      {presses.map((f) => (
        <Sfx key={f} at={f} name="click" volume={0.5} />
      ))}
    </SceneFade>
  );
};

const Jump: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("jump");
  const at = cues.line("j1");
  const settingsAt = cues.line("j2");
  const funcAt = cues.line("j3");
  const loopAt = cues.line("j4");
  const body: CodeLine[] = [
    ...["const groundLevel = 50;", "const jumpPower = 15;", "let playerY = 0;", "let playerVelocity = 0;", "let isJumping = false;", ""].map((text, i) => ({ text, at: settingsAt + i * 5 })),
    ...["function jump() {", "  if (isJumping) {", "    return;", "  }", "  playerVelocity = jumpPower; // push up!", "  isJumping = true;", "}", ""].map((text, i) => ({ text, at: funcAt + i * 5 })),
    ...["function updatePlayer() {", "  playerY = playerY + playerVelocity;", '  player.style.bottom = (groundLevel + playerY) + "px";', "}", "", "function gameLoop() {", "  updatePlayer();", "  requestAnimationFrame(gameLoop); // again!", "}"].map((text, i) => ({
      text,
      at: loopAt + i * 5,
    })),
  ];
  const h = head(2);
  const tryAt = cues.word("j6", "try") + 12;
  const t = Math.max(0, (frame - tryAt) / fps);
  const y = frame >= tryAt ? V * t : 0;
  const state = RUNNING(0, { dinoY: y, running: false, legPhase: 0 });
  const flip = progress(frame, loopAt, 16) * (1 - progress(frame, cues.line("j6") - 4, 10));
  const spin = Math.max(0, frame - loopAt) * 6;
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>3 · Jumping + the game loop</Kicker>
      <Editor
        lines={jsLines(2, body, at)}
        scroll={[
          [funcAt + 20, 0],
          [loopAt + 10, 9],
        ]}
        marks={[
          { from: h, to: h + 1, at: settingsAt, until: cues.word("j2", "state"), label: "SETTINGS: numbers we choose" },
          { from: h + 2, to: h + 4, at: cues.word("j2", "state"), until: funcAt, label: "STATE: let = can change" },
          { from: h + 6, to: h + 12, at: funcAt + 30, until: loopAt },
          { from: h + 19, to: h + 22, at: cues.line("j5"), until: cues.line("j7"), label: "run me again ~60× a second" },
        ]}
      />
      <GameBrowser state={state} />
      {/* flip-book loop */}
      <div style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 30, width: BR.width, opacity: flip }}>
        <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: SHADOW, display: "flex", alignItems: "center", gap: 30 }}>
          <svg width={150} height={150} viewBox="0 0 150 150" style={{ transform: `rotate(${spin}deg)` }}>
            <circle cx={75} cy={75} r={55} stroke={C.js} strokeWidth={12} fill="none" strokeDasharray="250 96" strokeLinecap="round" />
            <path d="M 118 40 L 132 62 L 106 64 Z" fill={C.js} />
          </svg>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, color: C.ink }}>
            update → draw → next frame
            <div style={{ color: C.inkSoft, fontSize: 28 }}>about 60 times every second</div>
          </div>
        </div>
      </div>
      <Vars at={cues.line("j6")} vars={[["playerY", Math.round(y).toString()], ["playerVelocity", "15"]]} />
      <Appear at={cues.line("j7")} out={cues.line("j8") + 40} kind="pop" style={{ position: "absolute", left: BR.left + 120, top: BR.top + 150 }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: "white", background: C.danger, padding: "14px 30px", borderRadius: 20, transform: "rotate(-3deg)" }}>
          Houston, we have a problem!
        </div>
      </Appear>
      <Panel at={cues.word("j8", "gravity")} top={BR.top + BR.height + 170}>
        Nothing pulls it back down. We haven't told it about <span style={{ color: C.js }}>gravity</span>.
      </Panel>
      <Strip marks={[at, funcAt, tryAt, cues.line("j7")]} />
      <Sfx at={settingsAt} name="typing" volume={0.25} />
      <Sfx at={funcAt} name="typing" volume={0.25} />
      <Sfx at={loopAt} name="typing" volume={0.25} />
      <Sfx at={tryAt - 2} name="click" volume={0.5} />
      <Sfx at={tryAt} name="jump" volume={0.4} />
      <Sfx at={cues.line("j7")} name="thud" volume={0.4} />
    </SceneFade>
  );
};

const Gravity: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("gravity");
  const g1 = cues.word("g1", "gravity");
  const fixAt = cues.line("g4");
  const body: CodeLine[] = [
    { text: "const gravity = 0.8;", at: g1 },
    { text: "" },
    { text: "function updatePlayer() {" },
    { text: "  playerY = playerY + playerVelocity;" },
    { text: "  playerVelocity = playerVelocity - gravity;", at: g1 + 8 },
    { text: "" },
    { text: "  if (playerY <= 0) { // landed?", at: fixAt + 4 },
    { text: "    playerY = 0;", at: fixAt + 10 },
    { text: "    playerVelocity = 0;", at: fixAt + 16 },
    { text: "    isJumping = false;", at: fixAt + 22 },
    { text: "  }", at: fixAt + 28 },
    { text: "" },
    { text: '  player.style.bottom = (groundLevel + playerY) + "px";' },
    { text: "}" },
  ];
  const h = head(3);
  // demo 1: falls through the floor
  const d1 = cues.word("g2", "falls") + 10;
  // demo 2: proper jumps after the fix
  const d2 = cues.end("g4") + 10;
  let y = 0;
  let vel = 0;
  if (frame >= d1 && frame < fixAt) {
    const t = (frame - d1) / fps;
    y = V * t - (G * t * t) / 2;
    vel = 15 - 0.8 * t * 60;
  } else if (frame >= d2) {
    const t = ((frame - d2) / fps) % 1.1;
    const air = (2 * V) / G;
    if (t < air) {
      y = V * t - (G * t * t) / 2;
      vel = 15 - 0.8 * t * 60;
    }
  }
  const jumps = [0, 1, 2, 3].map((i) => d2 + Math.round(i * 1.1 * fps));
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>4 · Gravity + landing</Kicker>
      <Editor
        lines={jsLines(3, body, g1 - 6)}
        marks={[
          { from: h + 4, to: h + 4, at: g1 + 14, until: cues.line("g3"), label: "gravity pulls down every frame" },
          { from: h + 6, to: h + 10, at: fixAt + 30, label: "landing check" },
        ]}
      />
      <GameBrowser state={RUNNING(0, { dinoY: Math.max(-200, y), running: false, legPhase: 0 })} />
      <Vars at={cues.line("g2")} vars={[["playerY", Math.round(y).toString()], ["playerVelocity", vel.toFixed(1)]]} />
      <Appear at={cues.line("g3")} out={fixAt - 4} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 170, width: BR.width }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 36, color: C.danger, background: "white", borderRadius: 24, padding: "16px 26px", boxShadow: SHADOW }}>Better… but it fell through the floor!</div>
      </Appear>
      <Appear at={cues.line("g5")} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 170, width: BR.width }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["ran it", "saw a problem", "figured out why", "fixed it"].map((s, i) => (
            <Appear key={s} at={cues.line("g5") + i * 10} kind="pop">
              <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, background: i === 3 ? C.good : "white", color: i === 3 ? "white" : C.ink, padding: "10px 20px", borderRadius: 999, boxShadow: SHADOW, display: "inline-block" }}>
                {s}
              </span>
            </Appear>
          ))}
        </div>
      </Appear>
      <Strip marks={[g1, cues.line("g2"), d1, cues.line("g3")]} />
      <Sfx at={g1} name="typing" volume={0.3} />
      <Sfx at={d1} name="jump" volume={0.4} />
      <Sfx at={d1 + 28} name="whoosh" volume={0.3} />
      <Sfx at={fixAt + 4} name="typing" volume={0.3} />
      {jumps.map((f) => (
        <Sfx key={f} at={f} name="jump" volume={0.35} />
      ))}
    </SceneFade>
  );
};

const Obstacle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("obstacle");
  const at = cues.line("b1");
  const body = [
    "let gameSpeed = 6;",
    "let obstacleX = 600;",
    "",
    "function updateObstacle() {",
    "  obstacleX = obstacleX - gameSpeed; // move left",
    "",
    "  if (obstacleX < -50) { // gone off the left side?",
    "    obstacleX = gameArea.clientWidth + Math.random() * 300;",
    "  }",
    "  obstacle.style.left = obstacleX + \"px\";",
    "}",
    "",
    "// in startGame():",
    'game.classList.add("running"); // CSS animations on!',
  ];
  const h = head(4);
  const runAt = cues.word("b2", "cactus");
  const t = Math.max(0, (frame - runAt) / fps);
  const x = frame >= runAt ? 800 - ((t * 380) % 1000) : 600;
  const state = frame >= runAt ? RUNNING(t, { obstacles: [x] }) : IDLE;
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>5 · Moving the obstacle</Kicker>
      <Editor
        lines={jsLines(4, body, at, 4)}
        marks={[
          { from: h + 4, to: h + 4, at: cues.word("b2", "moves"), until: cues.word("b2", "disappears"), label: "6 px left, every frame" },
          { from: h + 6, to: h + 8, at: cues.word("b2", "disappears"), until: cues.line("b3"), label: "back to the right + random gap" },
          { from: h + 13, to: h + 13, at: cues.line("b3"), until: cues.line("b4") },
        ]}
      />
      <GameBrowser state={state} />
      <Panel at={cues.line("b3")} out={cues.line("b4") - 4}>
        The ground scrolls, the legs run: <span style={{ color: C.js }}>JavaScript</span> switched on the <span style={{ color: C.css }}>CSS</span> animations.
      </Panel>
      <Appear at={cues.word("b4", "ghost")} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 30, width: BR.width }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: C.ink, background: "white", borderRadius: 24, padding: "16px 26px", boxShadow: SHADOW }}>
          Our dinosaur is a <Marker at={cues.word("b4", "ghost")}>ghost</Marker>.
        </div>
      </Appear>
      <Strip marks={[at, cues.word("b2", "moves"), runAt, cues.line("b3")]} />
      <Sfx at={at} name="typing" volume={0.3} />
      <Sfx at={runAt} name="whoosh" volume={0.3} />
      <Sfx at={cues.word("b4", "ghost")} name="pop" volume={0.4} />
    </SceneFade>
  );
};

const Collision: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("collision");
  const at = cues.line("c1");
  const body = [
    "function isColliding() {",
    "  const p = player.getBoundingClientRect();",
    "  const o = obstacle.getBoundingClientRect();",
    "  const padding = 8; // a little forgiving",
    "",
    "  const overlapLeftRight = p.right - padding > o.left",
    "                        && p.left + padding < o.right;",
    "  const overlapUpDown = p.bottom - padding > o.top;",
    "",
    "  return overlapLeftRight && overlapUpDown;",
    "}",
    "",
    "// in gameLoop():",
    "if (isColliding()) {",
    "  gameOver();",
    "  return;",
    "}",
  ];
  const h = head(5);
  const runAt = cues.line("c4");
  const t = Math.max(0, (frame - runAt) / fps);
  const crashT = (800 - 96) / 380;
  const crashed = t >= crashT;
  const tt = Math.min(t, crashT);
  const state = frame >= runAt ? RUNNING(tt, { obstacles: [800 - tt * 380], running: !crashed, crashed, legPhase: crashed ? 0 : Math.floor(tt * 10) % 2 }) : IDLE;
  const box = (x: number, y: number, w: number, hgt: number, color: string, label: string) => (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: hgt, border: `4px solid ${color}`, background: `${color}22`, borderRadius: 8 }}>
      <div style={{ position: "absolute", top: -26, left: 0, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 18, color }}>{label}</div>
    </div>
  );
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>6 · Collision detection</Kicker>
      <Editor
        fontSize={19}
        lines={jsLines(5, body, at, 4)}
        marks={[
          { from: h + 1, to: h + 2, at: cues.word("c1", "compares"), until: cues.line("c2"), label: "each box's edges" },
          { from: h + 5, to: h + 7, at: cues.line("c2"), until: cues.line("c4") },
          { from: h + 13, to: h + 16, at: runAt },
        ]}
      />
      <GameBrowser state={state} />
      <div style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 30, width: BR.width, display: "flex", gap: 20 }}>
        <Appear at={cues.line("c2")} kind="pop" style={{ flex: 1 }}>
          <div style={{ position: "relative", height: 290, background: "white", borderRadius: 24, boxShadow: SHADOW }}>
            {box(70, 110, 90, 110, C.dino, "player")}
            {box(130, 140, 60, 80, C.cactus, "obstacle")}
            <div style={{ position: "absolute", left: 20, bottom: 14, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 22, color: C.ink }}>
              ↔ ✓ &nbsp; ↕ ✓ → <span style={{ color: C.danger }}>CRASH</span>
            </div>
          </div>
        </Appear>
        <Appear at={cues.line("c3")} kind="pop" style={{ flex: 1 }}>
          <div style={{ position: "relative", height: 290, background: "white", borderRadius: 24, boxShadow: SHADOW }}>
            {box(110, 40, 90, 100, C.dino, "player (jumping)")}
            {box(130, 160, 60, 80, C.cactus, "obstacle")}
            <div style={{ position: "absolute", left: 20, bottom: 14, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 22, color: C.ink }}>
              ↔ ✓ &nbsp; ↕ ✗ → <span style={{ color: C.good }}>SAFE</span>
            </div>
          </div>
        </Appear>
      </div>
      <Strip marks={[at, cues.line("c2"), runAt, runAt + Math.round(crashT * fps)]} />
      <Sfx at={at} name="typing" volume={0.3} />
      <Sfx at={cues.line("c2")} name="pop" volume={0.35} />
      <Sfx at={cues.line("c3")} name="pop" volume={0.35} />
      <Sfx at={runAt + Math.round(crashT * fps)} name="thud" volume={0.6} />
    </SceneFade>
  );
};

const Score: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("score");
  const at = cues.line("s1");
  const body = ["let score = 0;", "", "function updateScore() {", "  score = score + 0.1; // a little every frame", "  scoreText.textContent = Math.floor(score);", "}", "", "// in gameLoop():", "updateScore();"];
  const h = head(6);
  const runAt = at + 30;
  const t = Math.max(0, (frame - runAt) / fps);
  const state = frame >= runAt ? gameStateAt(0.7 + t) : IDLE;
  const raw = Math.max(0, t * 6);
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>7 · Score</Kicker>
      <Editor
        lines={jsLines(6, body, at, 5)}
        marks={[
          { from: h + 3, to: h + 3, at: cues.word("s1", "add"), until: cues.line("s2") },
          { from: h + 4, to: h + 4, at: cues.line("s2"), label: "chop off the decimals" },
        ]}
      />
      <GameBrowser state={state} />
      <Vars at={cues.line("s2")} vars={[["score", raw.toFixed(1)], ["on screen", Math.floor(raw).toString()]]} />
      <Strip marks={[at, cues.word("s1", "add"), runAt, cues.line("s2")]} />
      <Sfx at={at} name="typing" volume={0.3} />
      {JUMP_TIMES.filter((j) => j - 0.7 < cues.duration / fps).map((j) => (
        <Sfx key={j} at={runAt + (j - 0.7) * fps} name="jump" volume={0.25} />
      ))}
    </SceneFade>
  );
};

const GameOver: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("gameover");
  const at = cues.line("e1");
  const body = [
    "function gameOver() {",
    "  isRunning = false;",
    '  game.classList.remove("running");',
    '  player.classList.add("crashed");',
    '  message.classList.remove("hidden");',
    "}",
    "",
    "function restartGame() {",
    "  playerY = 0;",
    "  score = 0;",
    '  player.classList.remove("crashed");',
    '  message.classList.add("hidden");',
    "  startGame();",
    "}",
    "",
    'restartButton.addEventListener("click", restartGame);',
  ];
  const h = head(7);
  // Play the cold-open run so the crash lands on the word "crash"
  const crashWord = cues.word("e5", "crash");
  const playFrom = crashWord - Math.round((CRASH_AT - 9) * fps);
  const gt = frame >= playFrom ? 9 + (frame - playFrom) / fps : null;
  const switches = frame >= cues.line("e3") && frame < cues.line("e4");
  const state = gt !== null ? gameStateAt(Math.min(gt, RESTART_AT + 2.5)) : switches ? { ...IDLE, showStart: false, crashed: frame >= cues.word("e3", "red"), gameOver: frame >= cues.word("e3", "appears") } : IDLE;
  const sw = (label: string, on: boolean, color: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 70, height: 38, borderRadius: 999, background: on ? color : C.line, position: "relative" }}>
        <div style={{ position: "absolute", top: 4, left: on ? 36 : 4, width: 30, height: 30, borderRadius: "50%", background: "white" }} />
      </div>
      <span style={{ fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 24, color: C.ink }}>{label}</span>
    </div>
  );
  const jumpSfx = JUMP_TIMES.filter((j) => j > 9 && j < RESTART_AT + 2.5).map((j) => playFrom + Math.round((j - 9) * fps));
  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>8 · Game Over + restart</Kicker>
      <Editor
        lines={jsLines(7, body, at, 4)}
        marks={[
          { from: h + 2, to: h + 4, at: cues.line("e3"), until: cues.line("e4"), label: "flip the CSS switches" },
          { from: h + 7, to: h + 12, at: cues.line("e4"), until: cues.line("e5") },
        ]}
      />
      <GameBrowser state={state} buttonPressed={gt !== null && gt > RESTART_AT - 0.15 && gt < RESTART_AT} />
      <Panel at={cues.line("e2")} out={cues.line("e5") - 4}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sw('"running" on the game', !(frame >= cues.line("e3")), C.js)}
          {sw('"crashed" on the player', frame >= cues.word("e3", "red"), C.danger)}
          {sw('"hidden" on Game Over', !(frame >= cues.word("e3", "appears")), C.css)}
        </div>
      </Panel>
      <Appear at={cues.line("e5")} kind="pop" style={{ position: "absolute", left: BR.left, top: BR.top + BR.height + 30, width: BR.width, textAlign: "center" }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 44, color: C.ink }}>Jump · Jump · Crash · Play again</span>
      </Appear>
      <Strip marks={[at, cues.line("e2"), playFrom, crashWord]} />
      <Sfx at={at} name="typing" volume={0.3} />
      <Sfx at={cues.word("e3", "red")} name="click" volume={0.45} />
      <Sfx at={cues.word("e3", "appears")} name="click" volume={0.45} />
      {jumpSfx.map((f) => (
        <Sfx key={f} at={f} name="jump" volume={0.35} />
      ))}
      <Sfx at={crashWord} name="thud" volume={0.6} />
      <Sfx at={playFrom + Math.round((RESTART_AT - 0.15 - 9) * fps)} name="click" volume={0.5} />
    </SceneFade>
  );
};

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = T.cuesFor("outro");
  const t = 0.7 + frame / fps;
  const state = gameStateAt(Math.min(t, CRASH_AT - 0.4));
  const challenges = [
    { word: "jump", text: "Change the jump height", where: "jumpPower" },
    { word: "speed", text: "Change the speed", where: "gameSpeed" },
    { word: "moon", text: "Try moon gravity", where: "gravity" },
    { word: "obstacle", text: "Change the obstacle", where: "#obstacle in style.css" },
    { word: "paper", text: "Turn it into your paper design", where: "all three files!" },
  ];
  const end = cues.end("o3") + 20;
  return (
    <SceneFade duration={cues.duration} fadeOut={20}>
      <Kicker at={4}>It's alive!</Kicker>
      <Appear at={0} kind="left" style={{ position: "absolute", left: 80, top: 170 }}>
        <Browser width={940} height={560}>
          <div style={{ padding: 28 }}>
            <Fit width={884} pageWidth={GW}>
              <GameView state={state} />
            </Fit>
          </div>
        </Browser>
      </Appear>
      <Appear at={cues.line("o1")} kind="up" style={{ position: "absolute", left: 80, top: 780, width: 940 }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: C.ink }}>
          A working game, and you know what <Marker at={cues.word("o1", "every")}>every line</Marker> does.
        </div>
      </Appear>
      <div style={{ position: "absolute", left: 1080, top: 170, width: 770 }}>
        {challenges.map((c) => (
          <Appear key={c.word} at={cues.word("o2", c.word)} kind="right" style={{ marginBottom: 18 }}>
            <div style={{ background: "white", borderRadius: 22, padding: "16px 24px", boxShadow: SHADOW, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, color: C.ink }}>{c.text}</span>
              <span style={{ fontFamily: "Consolas, monospace", fontWeight: 700, fontSize: 22, color: C.ink, background: C.js, padding: "6px 14px", borderRadius: 10 }}>{c.where}</span>
            </div>
          </Appear>
        ))}
      </div>
      <Appear at={cues.line("o3")} kind="up" style={{ position: "absolute", left: 1080, top: 820, width: 770 }}>
        <div style={{ ...handStyle(46, C.dino) }}>Next: bring in Claude →</div>
      </Appear>
      <EndCard at={end} done={4} next="Video 5 · Build Smarter With AI: Claude" />
      {JUMP_TIMES.filter((j) => j > 0.7 && j < CRASH_AT - 0.4 && (j - 0.7) * fps < end).map((j) => (
        <Sfx key={j} at={(j - 0.7) * fps} name="jump" volume={0.25} />
      ))}
      {challenges.map((c) => (
        <Sfx key={c.word} at={cues.word("o2", c.word)} name="tick" volume={0.35} />
      ))}
      <Sfx at={end} name="chime" volume={0.45} />
    </SceneFade>
  );
};

const SCENES: Record<string, React.FC> = {
  intro: Intro,
  pieces: Pieces,
  keyboard: Keyboard,
  jump: Jump,
  gravity: Gravity,
  obstacle: Obstacle,
  collision: Collision,
  score: Score,
  gameover: GameOver,
  outro: Outro,
};

export const Video4: React.FC = () => <VideoShell timeline={T} scenes={SCENES} voDir="video4/vo" />;

