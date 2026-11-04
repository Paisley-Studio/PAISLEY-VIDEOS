import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, EASE_OUT, Marker, progress, SceneFade, Sfx, Strike } from "../../shared/anim";
import {
  CRASH_AT,
  FREEZE_AT,
  GameView,
  gameStateAt,
  JUMP_TIMES,
  RESTART_AT,
  RUN1_START,
  SPEEDUP_ABS,
} from "../../shared/Game";
import { Caret, Laptop, LANG_FILES, Pointer, SpaceKey } from "../../shared/Props";
import { cuesFor } from "../timeline";
import { C, QUICKSAND } from "../../shared/theme";

// ---------------- SCENE 1: COLD OPEN ----------------

export const ColdOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cues = cuesFor("coldOpen");
  const t = Math.min(frame / fps, FREEZE_AT);
  const state = gameStateAt(t);

  const spacePressed =
    Math.abs(t - (RUN1_START - 0.1)) < 0.12 || JUMP_TIMES.some((j) => t >= j && t < j + 0.14) || false;

  // Cursor travels to the Play Again button after the crash
  const cursorIn = progress(frame, (CRASH_AT + 0.8) * fps, 0.9 * fps, EASE_IN_OUT);
  const clicking = t > RESTART_AT - 0.15 && t < RESTART_AT;
  const cursorOpacity = interpolate(t, [CRASH_AT + 0.6, CRASH_AT + 0.9, RESTART_AT + 0.2, RESTART_AT + 0.5], [0, 1, 1, 0], CLAMP);

  const zoom = interpolate(t, [0, 2, CRASH_AT - 0.3, CRASH_AT, CRASH_AT + 0.4], [1.08, 1, 1, 1.05, 1.02], { ...CLAMP, easing: EASE_OUT });
  const shake = t > CRASH_AT && t < CRASH_AT + 0.3 ? Math.sin(frame * 3.1) * 6 * (1 - (t - CRASH_AT) / 0.3) : 0;

  return (
    <SceneFade duration={cues.duration} fadeOut={0}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: `translateX(${shake}px) scale(${zoom * 2})`, marginTop: -40 }}>
          <GameView state={state} buttonPressed={clicking} />
        </div>
        {/* the Play Again button sits at the centre of the game area */}
        <Pointer
          size={44}
          style={{
            position: "absolute",
            left: interpolate(cursorIn, [0, 1], [1500, 968]),
            top: interpolate(cursorIn, [0, 1], [930, 676]),
            opacity: cursorOpacity,
            transform: clicking ? "scale(0.9)" : "none",
          }}
        />
        <div style={{ position: "absolute", right: 90, bottom: 60, opacity: interpolate(t, [CRASH_AT, CRASH_AT + 0.3], [1, 0.25], CLAMP) }}>
          <SpaceKey pressed={spacePressed} scale={0.7} />
        </div>
      </AbsoluteFill>

      {JUMP_TIMES.filter((j) => j < FREEZE_AT).map((j) => (
        <Sfx key={j} at={j * fps} name="jump" volume={0.35} />
      ))}
      <Sfx at={(RUN1_START - 0.1) * fps} name="click" volume={0.4} />
      <Sfx at={SPEEDUP_ABS * fps} name="levelup" volume={0.35} />
      <Sfx at={CRASH_AT * fps} name="thud" volume={0.7} />
      <Sfx at={(CRASH_AT + 0.2) * fps} name="pop" volume={0.3} />
      <Sfx at={(RESTART_AT - 0.15) * fps} name="click" volume={0.6} />
    </SceneFade>
  );
};

// ---------------- SCENE 2: THE QUESTION ----------------

export const Question: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = cuesFor("question");
  const frozen = gameStateAt(FREEZE_AT);

  const pull = progress(frame, 4, 30, EASE_IN_OUT);
  const laptopIn = progress(frame, cues.line("q4") - 10, 22);
  const laptopOut = progress(frame, cues.end("q5") + 8, 16, EASE_IN_OUT);
  const gameOut = laptopIn;
  const thinkStart = cues.end("q5") + 18;

  return (
    <SceneFade duration={cues.duration} fadeIn={0}>
      {/* Frozen game pulls back into a floating "screen" */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            transform: `translateY(${interpolate(pull, [0, 1], [-40, -150])}px) translateX(${gameOut * -1400}px) scale(${interpolate(pull, [0, 1], [2, 1.25])})`,
            filter: `saturate(${interpolate(pull, [0, 1], [1, 0.55])})`,
            opacity: 1 - gameOut,
          }}
        >
          <div style={{ background: "white", padding: 24, borderRadius: 26, boxShadow: `0 ${pull * 30}px ${pull * 60}px rgba(80,55,25,${0.18 * pull})` }}>
            <GameView state={frozen} />
          </div>
        </div>
      </AbsoluteFill>

      {/* Narration text under the frozen game */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150, opacity: 1 - gameOut }}>
        <div style={{ position: "relative", height: 120, width: 1700, textAlign: "center", fontFamily: QUICKSAND, fontWeight: 700, color: C.ink }}>
          <Appear at={cues.line("q1")} out={cues.line("q2") - 6} style={{ position: "absolute", inset: 0, fontSize: 76 }}>
            You just saw a game.
          </Appear>
          <Appear at={cues.line("q2")} style={{ position: "absolute", inset: 0, fontSize: 66 }}>
            How do you actually <Marker at={cues.word("q3", "make")}>make</Marker> something like this?
          </Appear>
        </div>
      </AbsoluteFill>

      {/* Laptop with a blank editor: "Just start coding?" */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: laptopIn * (1 - laptopOut),
          transform: `translateY(${(1 - laptopIn) * 200 + laptopOut * 300}px)`,
        }}
      >
        <Laptop width={1150} files={LANG_FILES} activeFile="index.html">
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 24, color: "#b9b1a6" }}>1</div>
            <Caret />
          </div>
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Appear at={cues.word("q4", "immediately")} kind="pop">
              <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 64, color: C.ink, whiteSpace: "nowrap" }}>
                <Strike at={cues.line("q5")} thickness={12}>
                  Just start coding?
                </Strike>
              </div>
            </Appear>
          </div>
        </Laptop>
      </AbsoluteFill>

      {/* THINK */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 300, color: C.ink, letterSpacing: 10 }}>
          {"THINK.".split("").map((letter, i) => (
            <Appear key={i} at={thinkStart + i * 4} kind="pop">
              <span style={{ color: letter === "." ? C.dino : C.ink }}>{letter}</span>
            </Appear>
          ))}
        </div>
        <Appear at={cues.line("q6")} style={{ position: "absolute", top: 720, fontFamily: QUICKSAND, fontWeight: 600, fontSize: 52, color: C.inkSoft }}>
          You start by thinking.
        </Appear>
      </AbsoluteFill>

      <Sfx at={4} name="whoosh" volume={0.3} />
      <Sfx at={cues.line("q4") - 10} name="whoosh" volume={0.35} />
      <Sfx at={cues.word("q4", "immediately")} name="pop" volume={0.4} />
      <Sfx at={cues.line("q5")} name="scribble" volume={0.6} />
      <Sfx at={cues.end("q5") + 8} name="whoosh" volume={0.3} />
      {Array.from({ length: 6 }).map((_, i) => (
        <Sfx key={i} at={thinkStart + i * 4} name="tick" volume={0.4} />
      ))}
    </SceneFade>
  );
};
