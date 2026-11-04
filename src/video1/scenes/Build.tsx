import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, handStyle, Kicker, pop, progress, SceneFade, Sfx } from "../../shared/anim";
import { Cactus, Dino } from "../../shared/Game";
import { FULL_SKETCH, PaperSketch } from "../../shared/PaperSketch";
import { Caret, Laptop, LANG_FILES } from "../../shared/Props";
import { cuesFor } from "../timeline";
import { C, HAND, QUICKSAND, SHADOW } from "../../shared/theme";

// ---------------- Gather your resources ----------------

const ResourceIcon: React.FC<{ kind: string }> = ({ kind }) => {
  const s = { stroke: C.ink, strokeWidth: 4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (kind) {
    case "characters":
      return <Dino style={{ transform: "scale(1.3)" }} />;
    case "obstacles":
      return <Cactus style={{ transform: "scale(1.2)" }} />;
    case "background":
      return (
        <svg width={90} height={64} viewBox="0 0 90 64">
          <rect x={2} y={2} width={86} height={60} rx={10} fill={C.sky} stroke={C.ink} strokeWidth={3} />
          <rect x={2} y={46} width={86} height={16} fill={C.ground} />
          <rect x={14} y={14} width={30} height={10} rx={5} fill="white" />
        </svg>
      );
    case "sounds":
      return (
        <svg width={80} height={70} viewBox="0 0 80 70">
          <path d="M 10 26 L 24 26 L 40 12 L 40 58 L 24 44 L 10 44 Z" fill={C.dino} stroke={C.ink} strokeWidth={3} strokeLinejoin="round" />
          <path d="M 52 24 Q 60 35 52 46" {...s} />
          <path d="M 60 16 Q 74 35 60 54" {...s} />
        </svg>
      );
    case "fonts":
      return <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 58, color: C.ink, lineHeight: 1 }}>Aa</div>;
    case "buttons":
      return <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 20, background: C.accent, padding: "10px 22px", borderRadius: 999 }}>Play Again</div>;
    case "code":
      return <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 46, color: C.css }}>{"</>"}</div>;
    case "rules":
      return (
        <svg width={70} height={76} viewBox="0 0 70 76">
          <rect x={6} y={4} width={58} height={68} rx={8} fill="white" stroke={C.ink} strokeWidth={3} />
          <path d="M 16 22 l 6 6 l 10 -12 M 16 44 l 6 6 l 10 -12" {...s} stroke={C.good} />
          <line x1={38} y1={24} x2={54} y2={24} {...s} />
          <line x1={38} y1={46} x2={54} y2={46} {...s} />
        </svg>
      );
    default:
      return (
        <svg width={64} height={78} viewBox="0 0 64 78">
          <path d="M 32 4 C 14 4 6 18 8 30 C 10 42 20 46 20 58 L 44 58 C 44 46 54 42 56 30 C 58 18 50 4 32 4 Z" fill="#ffe08a" stroke={C.ink} strokeWidth={3} />
          <line x1={22} y1={66} x2={42} y2={66} {...s} />
          <line x1={25} y1={73} x2={39} y2={73} {...s} />
        </svg>
      );
  }
};

const RESOURCES = [
  { kind: "characters", label: "Characters", word: "characters", tag: "draw it", tagWord: "draw", color: C.dino },
  { kind: "obstacles", label: "Obstacles", word: "obstacles", tag: "build it with CSS", tagWord: "css", color: C.css },
  { kind: "background", label: "Background", word: "background" },
  { kind: "sounds", label: "Sounds", word: "sounds", tag: "find it (with permission)", tagWord: "allowed", color: C.cactus },
  { kind: "fonts", label: "Fonts", word: "fonts" },
  { kind: "buttons", label: "Buttons", word: "buttons" },
  { kind: "code", label: "Code", word: "code", tag: "write it yourself", tagWord: "code", color: C.ink },
  { kind: "rules", label: "Game rules", word: "rules" },
  { kind: "ideas", label: "Ideas", word: "ideas", tag: "explore with AI", tagWord: "ai", color: C.js },
];

export const Resources: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = cuesFor("resources");
  const boardIn = progress(frame, cues.line("r2") - 6, 22);
  const habitOut = progress(frame, cues.line("r3") - 8, 14);

  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Gather your resources</Kicker>

      {/* The habit */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - habitOut }}>
        <Appear at={cues.line("r1")} style={{ fontFamily: QUICKSAND, fontWeight: 600, fontSize: 46, color: C.inkSoft, textAlign: "center" }}>
          Another creator habit:
        </Appear>
        <Appear at={cues.line("r2")} kind="pop" style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 104, color: C.ink, textAlign: "center", marginTop: 10 }}>
          Know what you <span style={{ color: C.dino }}>need</span>
          <br />
          before you start.
        </Appear>
      </AbsoluteFill>

      {/* The resource board */}
      <div
        style={{
          position: "absolute",
          left: 260,
          top: 128,
          width: 1400,
          height: 800,
          borderRadius: 36,
          background: "#f1e4cf",
          backgroundImage: "radial-gradient(rgba(120, 85, 40, 0.18) 2px, transparent 2px)",
          backgroundSize: "22px 22px",
          boxShadow: "inset 0 0 0 10px #e3cfae",
          opacity: habitOut * boardIn,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 34, padding: 50 }}>
          {RESOURCES.map((r, i) => (
            <Appear key={r.kind} at={cues.word("r3", r.word)} kind="drop">
              <div
                style={{
                  position: "relative",
                  height: 210,
                  background: "white",
                  borderRadius: 22,
                  boxShadow: SHADOW,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 22,
                  transform: `rotate(${[-2, 1.5, -1, 2, -1.5, 1, -2, 1.5, -1][i]}deg)`,
                }}
              >
                <div style={{ position: "absolute", top: -10, width: 22, height: 22, borderRadius: "50%", background: C.danger, boxShadow: "0 3px 0 rgba(0,0,0,0.2)" }} />
                <div style={{ height: 80, display: "flex", alignItems: "center" }}>
                  <ResourceIcon kind={r.kind} />
                </div>
                <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, color: C.ink }}>{r.label}</div>
                {r.tag ? (
                  <Appear at={cues.word("r5", r.tagWord ?? "")} kind="pop" style={{ position: "absolute", right: -18, bottom: -22 }}>
                    <div style={{ ...handStyle(34, "white"), background: r.color, padding: "8px 18px", borderRadius: 14, transform: "rotate(-4deg)", color: r.color === C.js ? C.ink : "white" }}>
                      {r.tag}
                    </div>
                  </Appear>
                ) : null}
              </div>
            </Appear>
          ))}
        </div>
      </div>

      {/* Closing caption */}
      <Appear at={cues.word("r6", "knowing")} kind="up" style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center" }}>
        <span style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 46, color: "white", background: C.ink, padding: "14px 36px", borderRadius: 999 }}>
          Where it comes from matters less than knowing you need it.
        </span>
      </Appear>

      {RESOURCES.map((r) => (
        <React.Fragment key={r.kind}>
          <Sfx at={cues.word("r3", r.word)} name="thunk" volume={0.4} />
          {r.tag ? <Sfx at={cues.word("r5", r.tagWord ?? "")} name="pop" volume={0.35} /> : null}
        </React.Fragment>
      ))}
    </SceneFade>
  );
};

// ---------------- Now we're ready ----------------

const READY = [
  { line: "rd1", text: "We have an idea" },
  { line: "rd2", text: "We've seen the finished product" },
  { line: "rd3", text: "We've planned it" },
  { line: "rd4", text: "We've designed it" },
  { line: "rd5", text: "We've broken it into parts" },
  { line: "rd6", text: "We know what we need" },
];

export const Ready: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = cuesFor("ready");
  const ready = cues.word("rd7", "ready");

  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={4}>Now bring back the computer</Kicker>

      {/* Paper plan + blank project side by side */}
      <Appear at={0} kind="left" style={{ position: "absolute", left: 1010, top: 170 }}>
        <PaperSketch p={FULL_SKETCH} width={560} style={{ transform: "rotate(-4deg)" }} />
      </Appear>
      <Appear at={10} kind="right" style={{ position: "absolute", left: 1150, top: 470 }}>
        <Laptop width={680} files={LANG_FILES} activeFile="index.html">
          <Caret height={26} />
        </Laptop>
      </Appear>

      {/* Checklist */}
      <div style={{ position: "absolute", left: 130, top: 200 }}>
        {READY.map((item) => {
          const at = cues.line(item.line);
          const tick = pop(frame, fps, at + 6, 12);
          return (
            <Appear key={item.line} at={at - 2} kind="left" style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 30 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  border: `4px solid ${C.good}`,
                  background: tick > 0.05 ? C.good : "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width={34} height={34} viewBox="0 0 34 34" style={{ transform: `scale(${tick})` }}>
                  <path d="M 6 18 L 14 26 L 28 8" stroke="white" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 48, color: C.ink }}>{item.text}</div>
            </Appear>
          );
        })}
      </div>

      {/* Ready banner */}
      <AbsoluteFill style={{ background: C.canvas, opacity: 0.75 * progress(frame, ready - 6, 12) }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
        <div
          style={{
            background: C.dino,
            color: "white",
            fontFamily: QUICKSAND,
            fontWeight: 700,
            fontSize: 120,
            padding: "40px 110px",
            borderRadius: 40,
            boxShadow: SHADOW,
            transform: `scale(${0.3 + 0.7 * pop(frame, fps, ready - 4, 11)}) rotate(-2deg)`,
            opacity: Math.min(1, pop(frame, fps, ready - 4) * 2),
          }}
        >
          Now we're ready to build.
        </div>
      </AbsoluteFill>

      {READY.map((item) => (
        <Sfx key={item.line} at={cues.line(item.line) + 6} name="tick" volume={0.45} />
      ))}
      <Sfx at={ready - 4} name="chime" volume={0.5} />
      <Sfx at={ready - 4} name="whoosh" volume={0.3} />
    </SceneFade>
  );
};

// ---------------- The build path ----------------

const PATH = [
  { label: "IDEA", word: "idea", color: "white", text: C.ink },
  { label: "PLAN", word: "plan", color: "white", text: C.ink },
  { label: "DESIGN", word: "design", color: "white", text: C.ink },
  { label: "BUILDING BLOCKS", word: "building", color: "white", text: C.ink },
  { label: "HTML", word: "html", color: C.html, text: "white" },
  { label: "CSS", word: "css", color: C.css, text: "white" },
  { label: "JAVASCRIPT", word: "javascript", color: C.js, text: C.ink },
  { label: "TEST", word: "test", color: C.good, text: "white" },
  { label: "IMPROVE", word: "improve", color: C.good, text: "white" },
];

export const BuildPath: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = cuesFor("path");
  const NODE_H = 70;
  const STEP = 96;
  const TOP = 112;
  const loop = progress(frame, cues.word("pa3", "loop"), 26, EASE_IN_OUT);
  const pulse = frame > cues.word("pa3", "test") ? 1 + 0.05 * Math.sin((frame - cues.word("pa3", "test")) / 3) : 1;

  return (
    <SceneFade duration={cues.duration}>
      <div style={{ position: "absolute", left: 130, top: 380, width: 520 }}>
        <Appear at={cues.line("pa1")} kind="left">
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: C.inkSoft }}>THE BUILD PATH</div>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 70, color: C.ink, lineHeight: 1.1, marginTop: 12 }}>
            Every video in this series follows it.
          </div>
        </Appear>
      </div>

      {/* connecting line */}
      <div
        style={{
          position: "absolute",
          left: 1100 - 3,
          top: TOP + NODE_H / 2,
          width: 6,
          height: interpolate(frame, [cues.word("pa2", "idea"), cues.word("pa2", "improve") + 6], [0, STEP * 8], CLAMP),
          background: C.line,
          borderRadius: 3,
        }}
      />

      {PATH.map((node, i) => {
        const at = cues.word("pa2", node.word);
        const isLoop = i >= 7;
        return (
          <Appear key={node.label} at={at - 2} kind="pop" style={{ position: "absolute", left: 1100 - 260, width: 520, top: TOP + i * STEP, display: "flex", justifyContent: "center" }}>
            <div
              style={{
                height: NODE_H,
                minWidth: 300,
                padding: "0 40px",
                borderRadius: 999,
                background: node.color,
                color: node.text,
                border: node.color === "white" ? `4px solid ${C.ink}` : "none",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: QUICKSAND,
                fontWeight: 700,
                fontSize: 36,
                letterSpacing: 3,
                boxShadow: SHADOW,
                transform: `scale(${isLoop ? pulse : 1})`,
              }}
            >
              {node.label}
            </div>
          </Appear>
        );
      })}

      {/* loop arrow from IMPROVE back up to TEST */}
      <svg width={300} height={260} viewBox="0 0 300 260" style={{ position: "absolute", left: 1290, top: TOP + 7 * STEP - 30 }}>
        <path
          d="M 40 190 C 200 200 220 50 40 60"
          stroke={C.good}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - loop}
        />
        <path d="M 40 60 L 68 42 M 40 60 L 66 80" stroke={C.good} strokeWidth={8} strokeLinecap="round" opacity={loop > 0.95 ? 1 : 0} />
        <text x={190} y={135} style={{ fontFamily: HAND, fontWeight: 700, fontSize: 44, fill: C.good }} opacity={loop}>
          again!
        </text>
      </svg>

      {PATH.map((node) => (
        <Sfx key={node.label} at={cues.word("pa2", node.word) - 2} name="tick" volume={0.45} />
      ))}
      <Sfx at={cues.word("pa3", "loop")} name="whoosh" volume={0.3} />
    </SceneFade>
  );
};
