import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, Marker, pop, progress, SceneFade, Sfx } from "../../shared/anim";
import { CodeEditor, CodeLine } from "../../shared/Code";
import { C, HAND, QUICKSAND, SHADOW, SHADOW_SOFT } from "../../shared/theme";
import { T6 } from "../timeline";
import { DeliveryApp, MealCard, ShopApp } from "../apps";
import { Camera, FilmFinish, Headline, Icon, LaptopFrame, LightSweep, LOOKS, Person, Phone, V6 } from "../kit";

// ---------------- Scene: AI as a creative tool ----------------

const Bubble: React.FC<{ at: number; from: "you" | "ai"; children: React.ReactNode }> = ({ at, from, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at) return null;
  const s = pop(frame, fps, at, 14);
  const you = from === "you";
  return (
    <div style={{ display: "flex", justifyContent: you ? "flex-end" : "flex-start", marginTop: 12, opacity: Math.min(1, s * 1.5), transform: `translateY(${(1 - s) * 16}px)` }}>
      <div
        style={{
          maxWidth: 330,
          padding: "11px 15px",
          borderRadius: you ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: you ? C.ink : "white",
          color: you ? "white" : C.ink,
          border: you ? "none" : "2px solid #efe6d8",
          fontFamily: QUICKSAND,
          fontWeight: 600,
          fontSize: 17,
          lineHeight: 1.35,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const Mono: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: V6.mono, fontSize: 15, background: "#f3ede3", color: C.ink, padding: "1px 5px", borderRadius: 5 }}>{children}</span>
);

export const AiScene: React.FC = () => {
  const frame = useCurrentFrame();
  const q = T6.cuesFor("ai");
  const aiAt = q.word("a1", "ai");
  const explainAt = q.word("a2", "explain");
  const bugAt = q.word("a2", "bug");
  const ideaAt = q.word("a2", "idea");
  const ideasAt = q.word("a3", "ideas");
  const decisionsAt = q.word("a3", "decisions");
  const understandAt = q.word("a3", "understand");
  const fasterAt = q.word("a4", "faster");
  const fixAt = decisionsAt + 6;
  const panelIn = progress(frame, aiAt - 4, 20, EASE_IN_OUT);
  const statements = progress(frame, q.line("a3") - 6, 22, EASE_IN_OUT);

  const lines: CodeLine[] = [
    { text: "let count = 0;" },
    { text: 'const button = document.querySelector("button");' },
    { text: 'const cartCount = document.querySelector("#count");' },
    { text: 'button.addEventListener("click", () => {' },
    { text: "  count = count + 1;" },
    { text: "  cartCont.textContent = count;", until: fixAt },
    { text: "  cartCount.textContent = count;", at: fixAt },
    { text: "});" },
  ];
  const marks = [
    { from: 3, to: 3, at: explainAt, until: bugAt - 4, label: "explain this" },
    { from: 5, to: 5, at: bugAt + 4, until: fixAt + 20, color: "rgba(214,69,69,0.22)", label: frame < fixAt ? "bug" : "fixed!" },
  ];
  const works = frame >= fasterAt;

  return (
    <SceneFade duration={q.duration}>
      <Camera
        shots={[
          { f: 0, scale: 1 },
          { f: explainAt, scale: 1.18, x: 210, y: 40 },
          { f: q.line("a3") - 8, scale: 1.18, x: 210, y: 40 },
          { f: q.line("a3") + 14, scale: 1, x: 0, y: 0 },
          { f: q.duration, scale: 1.02 },
        ]}
      >
        {/* the creator at a desk */}
        <div style={{ position: "absolute", left: 70, top: 380 }}>
          <Person look={LOOKS.leo} arm="type" scale={1.25} lookAt={0.7} />
        </div>
        <div style={{ position: "absolute", left: -40, top: 830, width: 700, height: 46, borderRadius: 14, background: "linear-gradient(#d8b98f, #c7a479)", boxShadow: "0 18px 30px rgba(80,55,25,0.18)" }} />
        <div style={{ position: "absolute", left: 470, top: 772, width: 64, height: 60, borderRadius: "8px 8px 18px 18px", background: "#fbf6ee", boxShadow: SHADOW_SOFT }} />
        <Appear at={q.line("a1")} kind="up" style={{ position: "absolute", left: 80, top: 130 }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 56, color: C.ink, lineHeight: 1.1, opacity: 1 - progress(frame, explainAt - 24, 14) }}>
            A new helper
            <br />
            for <span style={{ color: V6.ai }}>creators</span>.
          </div>
        </Appear>

        {/* the laptop: editor + AI panel */}
        <div style={{ position: "absolute", left: 640, top: 80 }}>
          <LaptopFrame width={1120} address="my-project / script.js">
            <div style={{ position: "absolute", inset: 0, display: "flex", background: "#f6f2ec" }}>
              <div style={{ width: 1120 - 400 * panelIn, padding: 12, boxSizing: "border-box" }}>
                <CodeEditor file="script.js" lang="js" lines={lines} width={1120 - 400 * panelIn - 24} height={1120 * 0.625 - 44 - 24} fontSize={19} marks={marks} newFlash={false} />
              </div>
              <div style={{ width: 400 * panelIn, overflow: "hidden", borderLeft: "2px solid #ece3d6", background: "#fbf8f3" }}>
                <div style={{ width: 400, padding: "16px 18px", boxSizing: "border-box" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 20, color: C.ink }}>
                    <Icon name="spark" size={24} color={V6.ai} fill={V6.ai} stroke={1} /> Claude
                    <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: C.inkSoft, letterSpacing: 1 }}>AI HELPER</span>
                  </div>
                  <Bubble at={explainAt - 12} from="you">What does line 4 do?</Bubble>
                  <Bubble at={explainAt + 14} from="ai">
                    It tells the button to wait for a click, then run the code inside the curly brackets.
                  </Bubble>
                  <Bubble at={bugAt - 10} from="you">Why doesn&apos;t my cart count go up?</Bubble>
                  <Bubble at={bugAt + 12} from="ai">
                    Line 6 says <Mono>cartCont</Mono>, but your variable is called <Mono>cartCount</Mono>. Check the spelling.
                  </Bubble>
                  <Bubble at={ideaAt + 4} from="ai">
                    Idea: add a little bounce to the badge so people notice it change.
                  </Bubble>
                </div>
              </div>
            </div>
          </LaptopFrame>
        </div>

        {/* the result, once the creator fixes it */}
        <Appear at={fasterAt - 10} kind="pop" style={{ position: "absolute", left: 900, top: 450, transform: "scale(0.62)", transformOrigin: "top left" }}>
          <div style={{ padding: 10, borderRadius: 40, background: "rgba(255,255,255,0.6)" }}>
            <MealCard s={{ parts: 5, style: 1, count: works ? Math.min(3, 1 + Math.floor((frame - fasterAt) / 12)) : 0, pressAt: works ? fasterAt + Math.floor((frame - fasterAt) / 12) * 12 : undefined, live: true }} />
          </div>
        </Appear>

        {/* the creator is in charge */}
        <div style={{ position: "absolute", left: 80, top: 120, opacity: statements }}>
          {[
            { t: "You bring the ideas.", at: ideasAt, icon: "bulb", c: C.accent },
            { t: "You make the decisions.", at: decisionsAt, icon: "check", c: C.good },
            { t: "You understand what you create.", at: understandAt, icon: "heart", c: C.dino },
          ].map((s) => (
            <Appear key={s.t} at={s.at} kind="left" style={{ marginBottom: 14 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "12px 24px", borderRadius: 999, background: "white", boxShadow: SHADOW, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, color: C.ink }}>
                <Icon name={s.icon} size={30} color={s.c} stroke={2.6} />
                {s.t}
              </div>
            </Appear>
          ))}
        </div>
        <Appear at={q.word("a3", "tool")} kind="pop" style={{ position: "absolute", left: 1350, top: 40 }}>
          <div style={{ padding: "10px 22px", borderRadius: 999, background: V6.ai, color: "white", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, boxShadow: SHADOW_SOFT, opacity: statements }}>AI = a tool, not the builder</div>
        </Appear>
      </Camera>
      <FilmFinish vignette={0.18} grain={0.03} />

      <Sfx at={aiAt - 4} name="whoosh" volume={0.3} />
      <Sfx at={explainAt - 12} name="typing" volume={0.2} />
      <Sfx at={explainAt + 14} name="pop" volume={0.25} />
      <Sfx at={bugAt - 10} name="typing" volume={0.2} />
      <Sfx at={bugAt + 12} name="pop" volume={0.25} />
      <Sfx at={ideaAt + 4} name="sparkle" volume={0.25} />
      <Sfx at={ideasAt} name="pop" volume={0.25} />
      <Sfx at={decisionsAt} name="pop" volume={0.25} />
      <Sfx at={fixAt} name="typing" volume={0.2} />
      <Sfx at={understandAt} name="pop" volume={0.25} />
      <Sfx at={fasterAt} name="levelup" volume={0.25} />
    </SceneFade>
  );
};

// ---------------- Scene: welcome to Paisley Tech Studio ----------------

export const WelcomeScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = T6.cuesFor("welcome");
  const startedAt = q.word("f1", "started");
  const ideaAt = q.word("f2", "idea");
  const blocksAt = q.word("f2", "building");
  const goingAt = q.word("f2", "going");
  const welcomeAt = q.line("f3");
  const creatingAt = q.word("f3", "creating");
  const togetherAt = q.word("f4", "together");
  const act1 = 1 - progress(frame, q.line("f2") - 8, 16);
  const act2 = progress(frame, q.line("f2") - 6, 16) * (1 - progress(frame, welcomeAt - 10, 16));
  const act3 = progress(frame, welcomeAt - 8, 20);

  // products orbit around the line "built by people like you"
  const orbit = [
    <Phone key="a" style={{ position: "relative" }}><DeliveryApp cues={{ scrollAt: 1e6, pickAt: 1e6, orderAt: 1e6, trackAt: 1e6 }} /></Phone>,
    <Phone key="b" style={{ position: "relative" }}><ShopApp addAt={1e6} /></Phone>,
  ];

  const path = [
    { label: "An idea", icon: "bulb", at: ideaAt, color: C.accent, x: 260, y: 600 },
    { label: "The building blocks", icon: "grid", at: blocksAt, color: C.css, x: 760, y: 430 },
    { label: "Keep going", icon: "star", at: goingAt, color: C.good, x: 1300, y: 250 },
  ];

  return (
    <SceneFade duration={q.duration} fadeOut={20}>
      {/* act 1: people like you built all of this */}
      <AbsoluteFill style={{ opacity: act1 }}>
        <Camera shots={[{ f: 0, scale: 1.06 }, { f: q.line("f2"), scale: 1 }]}>
          {orbit.map((node, i) => {
            const s = pop(frame, fps, 6 + i * 6, 14);
            const float = Math.sin((frame + i * 40) / 30) * 12;
            return (
              <div key={i} style={{ position: "absolute", left: i === 0 ? 120 : 1600, top: 220 + float + (1 - s) * 200, transform: `scale(0.5) rotate(${i === 0 ? -6 : 6}deg)`, transformOrigin: "top left", opacity: Math.min(1, s * 1.5) }}>
                {node}
              </div>
            );
          })}
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center", zIndex: 5 }}>
            <Headline text="Every app you use was" at={q.line("f1") + 8} size={84} style={{ textAlign: "center" }} />
            <Headline text="built by people" at={q.line("f1") + 20} size={84} style={{ textAlign: "center" }} />
            <Appear at={startedAt} kind="up" style={{ marginTop: 20 }}>
              <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 64, color: C.dino }}>
                who started <Marker at={startedAt + 10}>where you are now.</Marker>
              </div>
            </Appear>
          </AbsoluteFill>
        </Camera>
      </AbsoluteFill>

      {/* act 2: idea → building blocks → keep going */}
      {act2 > 0 ? (
        <AbsoluteFill style={{ opacity: act2 }}>
          <svg width={1920} height={1080} style={{ position: "absolute" }}>
            <path d="M330 690 C 600 690, 620 520, 900 520 S 1250 330, 1500 330" fill="none" stroke={C.line} strokeWidth={10} strokeLinecap="round" />
            <path d="M330 690 C 600 690, 620 520, 900 520 S 1250 330, 1500 330" fill="none" stroke={C.dino} strokeWidth={10} strokeLinecap="round" strokeDasharray={1400} strokeDashoffset={1400 * (1 - progress(frame, ideaAt, goingAt - ideaAt + 20, EASE_IN_OUT))} />
          </svg>
          {path.map((p) => (
            <Appear key={p.label} at={p.at} kind="pop" style={{ position: "absolute", left: p.x, top: p.y }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 30px", borderRadius: 999, background: "white", boxShadow: SHADOW, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: C.ink }}>
                <Icon name={p.icon} size={40} color={p.color} stroke={2.4} />
                {p.label}
              </div>
            </Appear>
          ))}
          <Appear at={blocksAt + 8} kind="up" style={{ position: "absolute", left: 800, top: 560, display: "flex", gap: 12 }}>
            {[["HTML", C.html], ["CSS", C.css], ["JS", C.js]].map(([l, c]) => (
              <div key={l} style={{ padding: "8px 18px", borderRadius: 14, background: c, color: l === "JS" ? C.ink : "white", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26 }}>{l}</div>
            ))}
          </Appear>
        </AbsoluteFill>
      ) : null}

      {/* act 3: welcome */}
      {act3 > 0 ? (
        <AbsoluteFill style={{ opacity: act3 }}>
          <Camera shots={[{ f: welcomeAt - 8, scale: 1.1 }, { f: q.duration, scale: 1 }]}>
            <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #fffaf2 0%, rgba(253,246,236,0) 70%)" }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center" }}>
              <Appear at={welcomeAt} kind="down">
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 30, letterSpacing: 10, color: C.inkSoft }}>WELCOME TO</div>
              </Appear>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 26, marginTop: 18 }}>
                <PaisleyMark at={welcomeAt + 4} />
                <Headline text="Paisley Tech Studio" at={welcomeAt + 6} size={120} />
              </div>
              <Appear at={creatingAt - 10} kind="up" style={{ marginTop: 24 }}>
                <div style={{ fontFamily: QUICKSAND, fontWeight: 600, fontSize: 48, color: C.inkSoft }}>
                  Stop just using technology. <span style={{ color: C.dino, fontWeight: 700 }}>Start creating it.</span>
                </div>
              </Appear>
            </div>
            {/* students, with a soft floor so they don't end abruptly */}
            {[
              { look: LOOKS.maya, x: 420, at: welcomeAt + 14, arm: "wave" as const },
              { look: LOOKS.sam, x: 780, at: welcomeAt + 20, arm: "down" as const },
              { look: LOOKS.ana, x: 1140, at: welcomeAt + 26, arm: "wave" as const },
            ].map((p, i) => {
              const s = pop(frame, fps, p.at, 14);
              return (
                <div key={i} style={{ position: "absolute", left: p.x, top: 560 + (1 - s) * 300, opacity: Math.min(1, s * 1.5) }}>
                  <Person look={p.look} arm={p.arm} scale={0.95} lookAt={(i - 1) * -0.5} />
                </div>
              );
            })}
            <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 78%, ${C.canvas} 94%)` }} />
            <Appear at={togetherAt - 4} kind="pop" style={{ position: "absolute", left: 1350, top: 520 }}>
              <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 80, color: C.css, transform: "rotate(-5deg)", lineHeight: 1 }}>
                I can build this!
              </div>
            </Appear>
          </Camera>
          {/* last frames: a clean end card */}
          <AbsoluteFill style={{ opacity: interpolate(frame, [q.duration - 70, q.duration - 50], [0, 1], CLAMP), background: C.canvas, justifyContent: "center", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <PaisleyMark at={q.duration - 70} />
              <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 84, color: C.ink }}>Paisley Tech Studio</div>
            </div>
            <div style={{ fontFamily: QUICKSAND, fontWeight: 600, fontSize: 40, color: C.inkSoft, marginTop: 18 }}>Introduction to Coding &amp; Creative Technology</div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
      <LightSweep at={welcomeAt + 4} dur={36} />
      <FilmFinish vignette={0.2} grain={0.03} />

      <Sfx at={q.line("f1") + 8} name="whoosh" volume={0.25} />
      <Sfx at={ideaAt} name="pop" volume={0.3} />
      <Sfx at={blocksAt} name="pop" volume={0.3} />
      <Sfx at={goingAt} name="levelup" volume={0.25} />
      <Sfx at={welcomeAt - 70} name="riser" volume={0.22} />
      <Sfx at={welcomeAt + 4} name="impact" volume={0.4} />
      <Sfx at={welcomeAt + 8} name="sparkle" volume={0.3} />
      <Sfx at={togetherAt} name="chime" volume={0.35} />
    </SceneFade>
  );
};

/** The studio mark: three rounded tiles in the HTML / CSS / JS colours. */
export const PaisleyMark: React.FC<{ at: number; size?: number }> = ({ at, size = 104 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tile = size * 0.44;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {[
        { c: C.html, x: 0, y: 0 },
        { c: C.css, x: size - tile, y: size * 0.12 },
        { c: C.js, x: size * 0.28, y: size - tile },
      ].map((t, i) => {
        const s = pop(frame, fps, at + i * 4, 11);
        return <div key={i} style={{ position: "absolute", left: t.x, top: t.y, width: tile, height: tile, borderRadius: tile * 0.32, background: t.c, transform: `scale(${s}) rotate(${(1 - s) * 90}deg)`, boxShadow: SHADOW_SOFT }} />;
      })}
    </div>
  );
};

