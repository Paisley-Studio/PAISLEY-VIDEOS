import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CLAMP, EASE_IN_OUT, EASE_OUT, map, progress } from "../../lib/anim";
import { simulateGame } from "../../lib/gameSim";
import { GameBrowser } from "../../components/GamePage";
import { Cursor } from "../../components/Cursor";
import { codePoint, IDE_RECTS, PaisleyIDE } from "../../components/PaisleyIDE";
import { Backdrop } from "../../components/Stage";
import { Sfx } from "../../components/Sfx";
import { C } from "../../styles/theme";
import { REVEAL_DECK } from "./Reveal";
import { TL } from "./timeline";

// The opening lines of course-project/index.html, exactly as written.
const CODE = [
  "<!DOCTYPE html>",
  '<html lang="en">',
  "<head>",
  '  <meta charset="UTF-8">',
  '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
  "  <title>Number Match</title>",
  "</head>",
  "<body>",
  '  <main class="app-shell">',
  '    <header class="topbar">',
  '      <a class="brand" href="#">',
  '        <span class="brand-mark">N</span>',
];

const SCALE = 0.86;
const OX = (1920 - 1920 * SCALE) / 2;
const OY = 22;
const FONT = 22;

export const IdeGlimpse: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("ide");
  const end = c.duration;

  const enter = progress(frame, 0, 24, EASE_OUT);
  const fSidebar = c.word("i1", "where") ;
  const fEditor = c.word("i1", "here");
  const fPreview = c.word("i1", "coding");
  const typeAt = c.line("i2") - 6;
  const runAt = c.word("i3", "create") - 4;

  const ring = (from: number, to: number) => interpolate(frame, [from, from + 8, to - 6, to], [0, 1, 1, 0], CLAMP);
  const totalChars = CODE.join("\n").length;
  const chars = Math.floor(interpolate(frame, [typeAt, runAt - 14], [0, totalChars], CLAMP));

  // camera: drift toward the editor while typing, then toward the preview after Run
  const toEditor = map(frame, [typeAt - 10, typeAt + 30], [0, 1]);
  const toPreview = map(frame, [runAt + 10, end - 4], [0, 1], EASE_IN_OUT);
  const camScale = 1 + 0.05 * toEditor * (1 - toPreview) + 0.22 * toPreview;
  const originX = interpolate(toPreview, [0, 1], [700, 1480]);
  const originY = 540;

  const sim = useMemo(() => simulateGame(REVEAL_DECK, []), []);
  const runP = progress(frame, runAt + 6, 14);

  const caretEnd = codePoint(CODE.length, CODE[CODE.length - 1].length, FONT);
  const keys = [
    { f: typeAt - 40, x: 1500, y: 900 },
    { f: typeAt - 8, x: caretEnd.x - 200, y: 300 },
    { f: typeAt - 2, x: caretEnd.x - 200, y: 300, click: true },
    { f: runAt - 12, x: IDE_RECTS.run.x + 30, y: IDE_RECTS.run.y + 22 },
    { f: runAt, x: IDE_RECTS.run.x + 30, y: IDE_RECTS.run.y + 22, click: true },
  ];

  return (
    <AbsoluteFill>
      <Backdrop count={10} seed={33} speed={0.3} />
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${originX}px ${originY}px`, transform: `scale(${camScale})` }}>
        <div
          style={{
            position: "absolute",
            left: OX,
            top: OY,
            width: 1920,
            height: 1080,
            transformOrigin: "0 0",
            transform: `translateY(${(1 - enter) * 120}px) scale(${SCALE})`,
            opacity: enter,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: `0 14px 0 ${C.night2}`,
          }}
        >
          <PaisleyIDE
            files={[
              { name: "Number Match", kind: "project" },
              { name: "index.html", kind: "html" },
              { name: "style.css", kind: "css" },
              { name: "script.js", kind: "js" },
            ]}
            activeFile="index.html"
            code={{ lang: "html", lines: CODE, chars, fontSize: FONT, caret: frame > typeAt ? "end" : null }}
            press={{ run: interpolate(frame, [runAt, runAt + 3, runAt + 8], [0, 1, 0], CLAMP) }}
            preview={
              <div style={{ opacity: runP, width: "100%", height: "100%" }}>
                <GameBrowser width={810} height={970} zoom={0.6} scrollY={70} chrome={false} state={sim.at(0)} />
              </div>
            }
            focus={[
              { target: "sidebar", amount: ring(fSidebar, fEditor), label: "FILES", labelSide: "right" },
              { target: "editor", amount: ring(fEditor, fPreview), label: "CODE", labelSide: "below" },
              { target: "preview", amount: ring(fPreview, typeAt + 4), label: "PREVIEW", labelSide: "left" },
            ]}
          />
          <Cursor keys={keys} scale={1.2} />
        </div>
      </div>
      <Sfx name="whoosh" at={0} volume={0.7} />
      <Sfx name="tick" at={fSidebar} />
      <Sfx name="tick" at={fEditor} />
      <Sfx name="tick" at={fPreview} />
      <Sfx name="click" at={typeAt - 2} />
      <Sfx name="typing" at={typeAt} dur={runAt - 14 - typeAt} />
      <Sfx name="click" at={runAt} />
      <Sfx name="run" at={runAt + 2} />
      <AbsoluteFill style={{ background: C.night, opacity: map(frame, [end - 8, end], [0, 1]) }} />
    </AbsoluteFill>
  );
};
