import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, EASE_OUT, handStyle, Kicker, Marker, progress, SceneFade, Sfx } from "../../shared/anim";
import { PaperSketch, SKETCH_ANCHORS, SKETCH_H, SKETCH_W, SketchKey, SketchProgress } from "../../shared/PaperSketch";
import { Laptop } from "../../shared/Props";
import { cuesFor } from "../timeline";
import { C, QUICKSAND, SHADOW } from "../../shared/theme";

export const PencilIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg width={70} height={70} viewBox="0 0 70 70" style={style}>
    <g transform="rotate(-45 35 35)">
      <rect x={27} y={2} width={16} height={48} rx={3} fill={C.accent} stroke={C.ink} strokeWidth={2.5} />
      <rect x={27} y={2} width={16} height={9} rx={3} fill="#f4a3a3" stroke={C.ink} strokeWidth={2.5} />
      <path d="M 27 50 L 35 66 L 43 50 Z" fill="#f5dcb5" stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M 32.5 61 L 35 66 L 37.5 61 Z" fill={C.ink} />
    </g>
  </svg>
);

const SHEET_W = 1300;
const SHEET_LEFT = (1920 - SHEET_W) / 2;
const SHEET_TOP = 130;

export const Paper: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = cuesFor("paper");

  // When each part of the sketch starts drawing, and for how long
  const plan: [SketchKey, number, number][] = [
    ["title", cues.word("p2", "design"), 26],
    ["area", cues.word("p3", "area"), 20],
    ["ground", cues.word("p3", "ground"), 16],
    ["dino", cues.word("p3", "dinosaur"), 24],
    ["cactus", cues.word("p3", "obstacle"), 18],
    ["score", cues.word("p3", "score"), 16],
    ["jump", cues.word("p4", "jumps"), 24],
    ["move", cues.word("p4", "moves"), 24],
    ["scoreNote", cues.word("p4", "goes"), 26],
    ["collision", cues.word("p4", "collide"), 26],
    ["button", cues.word("p5", "button"), 26],
    ["erase", cues.word("p9", "change"), 18],
    ["cactus2", cues.word("p9", "change") + 20, 18],
    ["question", cues.word("p10", "missing"), 10],
    ["clouds", cues.end("p10") + 6, 28],
  ];
  const p: SketchProgress = {};
  for (const [key, at, dur] of plan) p[key] = progress(frame, at, dur, EASE_IN_OUT);

  // Pencil follows whichever part is being drawn most recently
  const active = plan.filter(([, at]) => frame >= at - 8).pop();
  const prev = plan.filter(([, at]) => frame >= at - 8).slice(-2)[0];
  const travel = active ? progress(frame, active[1] - 8, 10, EASE_IN_OUT) : 0;
  const target = active ? SKETCH_ANCHORS[active[0]] : SKETCH_ANCHORS.title;
  const from = prev && prev !== active ? SKETCH_ANCHORS[prev[0]] : target;
  const px = interpolate(travel, [0, 1], [from[0], target[0]]);
  const py = interpolate(travel, [0, 1], [from[1], target[1]]);
  const wiggle = Math.sin(frame * 0.9) * 4;
  const pencilVisible = interpolate(frame, [cues.line("p2"), cues.line("p2") + 10, cues.line("p6") - 4, cues.line("p6") + 6, cues.line("p9") - 4, cues.line("p9") + 4, cues.duration - 30, cues.duration - 20], [0, 1, 1, 0, 0, 1, 1, 0], CLAMP);

  // Entrance: computer slides away, paper slides in
  const laptopOut = progress(frame, 6, 24, EASE_IN_OUT);
  const paperIn = progress(frame, cues.word("p1", "away"), 28, EASE_OUT);

  // Zoom into the potato dino, then back
  const zoomIn = progress(frame, cues.word("p6", "look"), 24, EASE_IN_OUT);
  const zoomOut = progress(frame, cues.word("p7", "fine"), 24, EASE_IN_OUT);
  const zoom = zoomIn * (1 - zoomOut);
  const scale = 1 + zoom * 1.4;
  const focusX = SHEET_LEFT + (340 / SKETCH_W) * SHEET_W;
  const focusY = SHEET_TOP + (490 / SKETCH_H) * ((SHEET_W * SKETCH_H) / SKETCH_W);

  // "you can see it" — a soft glow sweep
  const seeIt = interpolate(frame, [cues.word("p8", "see"), cues.word("p8", "see") + 10, cues.end("p8") + 10], [0, 1, 0], CLAMP);

  const friendIn = cues.word("p11", "explain");

  return (
    <SceneFade duration={cues.duration}>
      <Kicker at={cues.line("p2")}>Plan before you build</Kicker>

      {/* The computer leaves */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - laptopOut, transform: `translateX(${laptopOut * 1200}px) rotate(${laptopOut * 8}deg)` }}>
        <Laptop width={900} />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          transformOrigin: `${focusX}px ${focusY}px`,
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: SHEET_LEFT,
            top: SHEET_TOP,
            transform: `translateY(${(1 - paperIn) * 900}px) rotate(${(1 - paperIn) * 6 - 0.6}deg)`,
          }}
        >
          <PaperSketch p={p} width={SHEET_W} />
          {/* highlight glow for "you can see it" */}
          <div style={{ position: "absolute", inset: 0, borderRadius: 14, boxShadow: `0 0 0 ${seeIt * 14}px rgba(255,183,3,0.45)`, pointerEvents: "none" }} />
          <PencilIcon
            style={{
              position: "absolute",
              left: (px / SKETCH_W) * SHEET_W - 6,
              top: (py / SKETCH_H) * ((SHEET_W * SKETCH_H) / SKETCH_W) - 64 + wiggle,
              opacity: pencilVisible,
            }}
          />
          {/* potato label during the zoom */}
          <div
            style={{
              position: "absolute",
              left: (420 / SKETCH_W) * SHEET_W,
              top: (370 / SKETCH_H) * ((SHEET_W * SKETCH_H) / SKETCH_W),
              opacity: interpolate(frame, [cues.word("p6", "potato") - 4, cues.word("p6", "potato") + 6, cues.word("p7", "fine"), cues.word("p7", "fine") + 8], [0, 1, 1, 0], CLAMP),
              ...handStyle(30, C.dino),
              transform: "rotate(-6deg)",
            }}
          >
            (a potato with legs)
          </div>
        </div>
      </AbsoluteFill>

      {/* Caption for "make the idea visible" */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 40,
          textAlign: "center",
          fontFamily: QUICKSAND,
          fontWeight: 700,
          fontSize: 50,
          color: C.ink,
          opacity: interpolate(frame, [cues.word("p7", "point", 1) - 6, cues.word("p7", "point", 1) + 6, cues.line("p8") - 6, cues.line("p8") + 4], [0, 1, 1, 0], CLAMP),
        }}
      >
        Not art. <Marker at={cues.word("p7", "visible")}>Make the idea visible.</Marker>
      </div>

      {/* A friend who now understands the idea */}
      <Appear at={friendIn} kind="pop" style={{ position: "absolute", right: 34, top: 600 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ ...handStyle(40, C.ink), background: "white", padding: "14px 22px", borderRadius: 24, boxShadow: SHADOW }}>Oh, I get it!</div>
          <svg width={110} height={130} viewBox="0 0 110 130">
            <circle cx={55} cy={40} r={30} fill={C.css} />
            <path d="M 15 130 Q 15 78 55 78 Q 95 78 95 130 Z" fill={C.css} opacity={0.85} />
            <circle cx={46} cy={38} r={4} fill="white" />
            <circle cx={66} cy={38} r={4} fill="white" />
            <path d="M 45 50 Q 56 58 67 50" stroke="white" strokeWidth={3} fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </Appear>

      {/* Sound */}
      <Sfx at={6} name="whoosh" volume={0.35} />
      <Sfx at={cues.word("p1", "away")} name="whoosh" volume={0.3} />
      {plan
        .filter(([key]) => key !== "erase" && key !== "question")
        .map(([key, at]) => (
          <Sfx key={key} at={at} name="pencil" volume={0.35} />
        ))}
      <Sfx at={cues.word("p9", "change")} name="eraser" volume={0.45} />
      <Sfx at={cues.word("p10", "missing")} name="pop" volume={0.4} />
      <Sfx at={friendIn} name="pop" volume={0.4} />
      <Sfx at={cues.word("p6", "look")} name="whoosh" volume={0.25} />
    </SceneFade>
  );
};

// ---------------- The big principle ----------------

const Icon: React.FC<{ kind: "web" | "app" | "game" | "business" | "creative" }> = ({ kind }) => {
  const stroke = { stroke: C.ink, strokeWidth: 5, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      {kind === "web" ? (
        <>
          <rect x={12} y={22} width={96} height={76} rx={12} {...stroke} />
          <line x1={12} y1={42} x2={108} y2={42} {...stroke} />
          <circle cx={26} cy={32} r={3} fill={C.ink} />
          <rect x={26} y={56} width={40} height={28} rx={5} fill={C.html} />
          <line x1={76} y1={60} x2={94} y2={60} {...stroke} />
          <line x1={76} y1={74} x2={90} y2={74} {...stroke} />
        </>
      ) : null}
      {kind === "app" ? (
        <>
          <rect x={34} y={10} width={52} height={100} rx={12} {...stroke} />
          <rect x={44} y={28} width={14} height={14} rx={4} fill={C.css} />
          <rect x={62} y={28} width={14} height={14} rx={4} fill={C.js} />
          <rect x={44} y={48} width={14} height={14} rx={4} fill={C.dino} />
          <rect x={62} y={48} width={14} height={14} rx={4} fill={C.cactus} />
        </>
      ) : null}
      {kind === "game" ? (
        <>
          <path d="M 20 50 Q 20 34 36 34 L 84 34 Q 100 34 100 50 L 104 78 Q 106 94 92 92 L 80 80 L 40 80 L 28 92 Q 14 94 16 78 Z" {...stroke} />
          <line x1={38} y1={50} x2={38} y2={66} {...stroke} />
          <line x1={30} y1={58} x2={46} y2={58} {...stroke} />
          <circle cx={78} cy={52} r={5} fill={C.dino} />
          <circle cx={88} cy={62} r={5} fill={C.cactus} />
        </>
      ) : null}
      {kind === "business" ? (
        <>
          <path d="M 18 50 L 102 50 L 96 104 L 24 104 Z" {...stroke} />
          <path d="M 14 50 L 30 22 L 90 22 L 106 50" {...stroke} />
          <rect x={48} y={70} width={24} height={34} rx={4} fill={C.accent} />
        </>
      ) : null}
      {kind === "creative" ? (
        <>
          <path d="M 60 14 C 90 14 108 34 104 60 C 101 78 84 76 80 86 C 76 98 66 106 52 104 C 26 100 12 80 14 58 C 16 32 34 14 60 14 Z" {...stroke} />
          <circle cx={40} cy={46} r={7} fill={C.dino} />
          <circle cx={62} cy={34} r={7} fill={C.accent} />
          <circle cx={82} cy={48} r={7} fill={C.css} />
          <circle cx={40} cy={74} r={7} fill={C.cactus} />
        </>
      ) : null}
    </svg>
  );
};

export const Principle: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = cuesFor("principle");
  const words1 = "This is how all your development and product building should start.".split(" ");
  const firstOut = cues.line("st2") - 8;
  const icons: { kind: "web" | "app" | "game" | "business" | "creative"; word: string; label: string }[] = [
    { kind: "web", word: "websites", label: "Websites" },
    { kind: "app", word: "apps", label: "Apps" },
    { kind: "game", word: "games", label: "Games" },
    { kind: "business", word: "businesses", label: "Businesses" },
    { kind: "creative", word: "creative", label: "Creative projects" },
  ];
  const statementUp = progress(frame, cues.line("st4") - 6, 22, EASE_IN_OUT);

  return (
    <SceneFade duration={cues.duration}>
      {/* Statement 1, word by word in sync with the voice */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 1 - progress(frame, firstOut, 10) }}>
        <div style={{ width: 1500, textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 96, lineHeight: 1.2, color: C.ink }}>
          {words1.map((w, i) => {
            const at = cues.word("st1", w.replace(".", ""), w === "start." ? 0 : 0);
            const highlight = w === "should" || w === "start.";
            return (
              <Appear key={i} at={at - 2} dur={10} style={{ display: "inline-block", marginRight: 26 }}>
                <span style={{ color: highlight ? C.dino : C.ink }}>{w}</span>
              </Appear>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* Statement 2 */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `translateY(${statementUp * -200}px) scale(${1 - statementUp * 0.25})` }}>
        <div style={{ textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700, color: C.ink }}>
          <Appear at={cues.line("st2")} style={{ fontSize: 88, color: C.inkSoft }}>
            Don't start by building.
          </Appear>
          <Appear at={cues.line("st3")} style={{ fontSize: 100, marginTop: 30 }}>
            Start by <Marker at={cues.word("st3", "understanding")}>understanding</Marker> what you're building.
          </Appear>
        </div>
      </AbsoluteFill>

      {/* It applies to everything */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", gap: 60 }}>
        {icons.map((icon) => (
          <Appear key={icon.kind} at={cues.word("st4", icon.word)} kind="pop" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{ background: "white", borderRadius: 32, padding: 22, boxShadow: SHADOW }}>
              <Icon kind={icon.kind} />
            </div>
            <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 32, color: C.ink }}>{icon.label}</div>
          </Appear>
        ))}
      </div>

      {icons.map((icon) => (
        <Sfx key={icon.kind} at={cues.word("st4", icon.word)} name="pop" volume={0.35} />
      ))}
      <Sfx at={cues.line("st2")} name="whoosh" volume={0.25} />
      <Sfx at={cues.word("st3", "understanding")} name="tick" volume={0.4} />
    </SceneFade>
  );
};
