import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_OUT, pop, progress } from "../../lib/anim";
import { EMMET } from "../../lib/course";
import { Cursor } from "../../components/Cursor";
import { centre, Chip, IdeStage, Label, ring, SceneFade } from "../../components/Lesson";
import { fileActionRects, fileRowRect, IDE_RECTS, IdeFile } from "../../components/PaisleyIDE";
import { Backdrop } from "../../components/Stage";
import { Sfx } from "../../components/Sfx";
import { C, MONO, QUICKSAND } from "../../styles/theme";
import { TL } from "./timeline";

// The exact project shown in the supplied Paisley IDE screenshot.
const SHOT_FILES: IdeFile[] = [
  { name: "Game Design & Styling", kind: "project" },
  { name: "index.html", kind: "html" },
];
const SHOT_CODE = ["<!DOCTYPE html>", '<html lang="en">', "<head>", '  <meta charset="UTF-8">', "  <title>My project</title>", "</head>", "<body>", "  <h1>Hello, studio!</h1>", "</body>", "</html>"];
const HelloPreview = () => <div style={{ padding: "26px 14px", fontFamily: '"Times New Roman", serif', fontWeight: 700, fontSize: 52 }}>Hello, studio!</div>;

const at = (r: { x: number; y: number; w: number; h: number }) => centre(r);

/** 2.2 Welcome to Paisley Studio: the real screenshot, then a guided tour. */
export const Tour: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("tour");
  const shotOut = c.line("w3") - 10;
  const shotIn = progress(frame, 0, 20, EASE_OUT);
  const shotFade = interpolate(frame, [shotOut, shotOut + 14], [1, 0], CLAMP);

  const fSide = c.line("w3");
  const fButtons = c.line("w4");
  const fNew = c.word("w5", "first");
  const fFolder = c.word("w6", "second");
  const fUpload = c.word("w7", "third");
  const fActions = c.line("w8");
  const fEditor = c.line("w9");
  const fPreview = c.line("w10");
  const fTop = c.line("w11");
  const fSave = c.word("w11", "save");
  const fRun = c.word("w11", "run");
  const end = c.duration;

  const row1 = fileRowRect(1);
  const act = fileActionRects(1);
  const cam = [
    { f: fSide - 10, z: 1 },
    { f: fButtons, z: 1.9, x: 200, y: 240 },
    { f: fActions + 30, z: 1.9, x: 200, y: 240 },
    { f: fEditor, z: 1 },
    { f: fTop - 8, z: 1 },
    { f: fTop + 14, z: 2, x: 1700, y: 120 },
    { f: end - 14, z: 2, x: 1700, y: 120 },
    { f: end, z: 1 },
  ];
  const keys = [
    { f: fSide, x: 900, y: 700 },
    { f: fNew - 6, x: at(IDE_RECTS.newFile).x, y: at(IDE_RECTS.newFile).y },
    { f: fFolder - 6, x: at(IDE_RECTS.newFolder).x, y: at(IDE_RECTS.newFolder).y },
    { f: fUpload - 6, x: at(IDE_RECTS.upload).x, y: at(IDE_RECTS.upload).y },
    { f: fActions - 4, x: 120, y: at(row1).y },
    { f: fActions + 2, x: 120, y: at(row1).y, click: true },
    { f: c.word("w8", "pencil", 1) - 6, x: at(act.rename).x, y: at(act.rename).y },
    { f: c.word("w8", "bin", 1) - 6, x: at(act.remove).x, y: at(act.remove).y },
    { f: fEditor + 10, x: 700, y: 520 },
    { f: fPreview + 10, x: 1500, y: 520 },
    { f: fSave - 6, x: at(IDE_RECTS.save).x, y: at(IDE_RECTS.save).y },
    { f: fRun - 6, x: at(IDE_RECTS.run).x, y: at(IDE_RECTS.run).y },
  ];

  return (
    <AbsoluteFill>
      <IdeStage
        cam={cam}
        ide={{
          files: SHOT_FILES,
          activeFile: "index.html",
          showFileActions: frame >= fActions + 2,
          code: { lang: "html", lines: SHOT_CODE, caret: { line: 10, col: 7 } },
          preview: <HelloPreview />,
          focus: [
            { target: "sidebar", amount: ring(frame, fSide, fButtons), label: "PROJECT AREA", labelSide: "right" },
            { target: "sideButtons", amount: ring(frame, fButtons, fNew), label: "3 BUTTONS", labelSide: "right" },
            { target: "newFile", amount: ring(frame, fNew, fFolder), label: "NEW FILE", labelSide: "right" },
            { target: "newFolder", amount: ring(frame, fFolder, fUpload), label: "NEW FOLDER", labelSide: "right" },
            { target: "upload", amount: ring(frame, fUpload, fActions), label: "UPLOAD", labelSide: "right" },
            { target: act.rename, amount: ring(frame, c.word("w8", "pencil", 1), c.word("w8", "bin", 1)), label: "RENAME", labelSide: "below" },
            { target: act.remove, amount: ring(frame, c.word("w8", "bin", 1), fEditor), label: "DELETE", labelSide: "below" },
            { target: "editor", amount: ring(frame, fEditor, fPreview), label: "CODE EDITOR", labelSide: "below" },
            { target: "preview", amount: ring(frame, fPreview, fTop), label: "PREVIEW", labelSide: "left" },
            { target: "save", amount: ring(frame, fSave, fRun), label: "SAVE", labelSide: "below" },
            { target: "run", amount: ring(frame, fRun, end - 6), label: "RUN", labelSide: "below" },
          ],
        }}
        overlay={<Cursor keys={keys} scale={1.3} showFrom={fSide} />}
      />
      {/* the real screenshot first */}
      {frame < shotOut + 14 && (
        <AbsoluteFill style={{ background: C.night, opacity: shotFade }}>
          <Backdrop count={10} seed={5} speed={0.3} />
          <div style={{ position: "absolute", left: 210, top: 70, width: 1500, transform: `scale(${0.9 + 0.1 * shotIn})`, opacity: shotIn }}>
            <Img src={staticFile("images/paisley-ide.png")} style={{ width: 1500, borderRadius: 18, border: `6px solid ${C.white}`, boxShadow: `0 14px 0 ${C.night2}` }} />
          </div>
          <Label at={c.word("w2", "paisley")} x={960} y={790} anchor="center" size={40}>
            THIS IS PAISLEY STUDIO
          </Label>
        </AbsoluteFill>
      )}
      <Sfx name="whoosh" at={shotOut} volume={0.6} />
      {[fSide, fButtons, fNew, fFolder, fUpload, fEditor, fPreview, fSave, fRun].map((f, i) => (
        <Sfx key={i} name="tick" at={f} />
      ))}
      <Sfx name="click" at={fActions + 2} />
      <SceneFade duration={end} />
    </AbsoluteFill>
  );
};

/** 2.3 Create index.html, then "what is HTML". */
export const NewFile: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("newfile");
  const clickNew = c.word("n1", "click") + 8;
  const typeFrom = c.word("n2", "type");
  const enter = c.word("n2", "enter");
  const name = "index.html";
  const typed = name.slice(0, Math.floor(interpolate(frame, [typeFrom + 6, enter - 4], [0, name.length], CLAMP)));
  const created = frame >= enter;
  const files: IdeFile[] = [{ name: "Number Match", kind: "project" }, ...(created ? [{ name: "index.html", kind: "html" as const }] : [])];
  const explain = c.line("n4") - 8;
  const ex = progress(frame, explain, 14);
  const end = c.duration;
  const letters = [
    ["H", "yper"],
    ["T", "ext"],
    ["M", "arkup"],
    ["L", "anguage"],
  ];
  const frameAt = c.word("n5", "frame");

  return (
    <AbsoluteFill>
      <IdeStage
        cam={[
          { f: 0, z: 1 },
          { f: 16, z: 1.8, x: 200, y: 230 },
          { f: explain, z: 1.8, x: 200, y: 230 },
        ]}
        ide={{
          files,
          activeFile: created ? "index.html" : undefined,
          newFileInput: frame >= clickNew && !created ? typed : null,
          code: { lang: "html", lines: [], caret: created ? { line: 1, col: 0 } : null },
          previewBlank: true,
          press: { newFile: interpolate(frame, [clickNew, clickNew + 3, clickNew + 8], [0, 1, 0], CLAMP) },
          focus: [
            { target: "newFile", amount: ring(frame, c.line("n1"), clickNew + 10), label: "NEW FILE", labelSide: "right" },
            { target: fileRowRect(1), amount: ring(frame, c.line("n3"), explain), label: "index.html", labelSide: "right" },
          ],
        }}
        overlay={
          <Cursor
            keys={[
              { f: c.line("n1"), x: 600, y: 500 },
              { f: clickNew - 2, x: at(IDE_RECTS.newFile).x, y: at(IDE_RECTS.newFile).y },
              { f: clickNew, x: at(IDE_RECTS.newFile).x, y: at(IDE_RECTS.newFile).y, click: true },
            ]}
            scale={1.3}
            hideAt={explain}
          />
        }
      />
      {frame >= explain && (
        <AbsoluteFill style={{ opacity: ex }}>
          <Backdrop count={12} seed={8} speed={0.3} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center", gap: 34, fontFamily: QUICKSAND, fontWeight: 700 }}>
            {letters.map(([big, rest], i) => {
              const s = pop(frame, fps, explain + 8 + i * 7, 12);
              return (
                <div key={big} style={{ textAlign: "center", transform: `scale(${s})` }}>
                  <div style={{ width: 170, height: 170, borderRadius: 30, background: C.html, color: C.white, fontSize: 120, display: "grid", placeItems: "center", boxShadow: `0 10px 0 ${C.redDark}` }}>{big}</div>
                  <div style={{ marginTop: 18, color: C.white, fontSize: 40 }}>
                    <span style={{ color: C.html }}>{big}</span>
                    {rest}
                  </div>
                </div>
              );
            })}
          </div>
          {/* the frame that holds up a house */}
          <HouseFrame at={frameAt} />
          <Label at={c.word("n5", "structure")} x={960} y={830} anchor="center" size={38}>
            HTML = STRUCTURE
          </Label>
        </AbsoluteFill>
      )}
      <Sfx name="click" at={clickNew} />
      <Sfx name="typing" at={typeFrom + 6} dur={enter - typeFrom - 10} />
      <Sfx name="key" at={enter} />
      <Sfx name="pop" at={enter + 2} />
      <Sfx name="whoosh" at={explain} volume={0.6} />
      {letters.map((_, i) => (
        <Sfx key={i} name="pop-low" at={explain + 8 + i * 7} volume={0.6} />
      ))}
      <Sfx name="thunk" at={frameAt} />
      <SceneFade duration={end} />
    </AbsoluteFill>
  );
};

const HouseFrame: React.FC<{ at: number }> = ({ at: from }) => {
  const frame = useCurrentFrame();
  const beams = [
    { x1: 760, y1: 790, x2: 1160, y2: 790 },
    { x1: 780, y1: 790, x2: 780, y2: 610 },
    { x1: 1140, y1: 790, x2: 1140, y2: 610 },
    { x1: 960, y1: 790, x2: 960, y2: 610 },
    { x1: 760, y1: 610, x2: 1160, y2: 610 },
    { x1: 740, y1: 620, x2: 960, y2: 480 },
    { x1: 1180, y1: 620, x2: 960, y2: 480 },
  ];
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
      {beams.map((b, i) => {
        const p = progress(frame, from + i * 4, 10);
        if (p <= 0.01) return null;
        return <line key={i} x1={b.x1} y1={b.y1} x2={b.x1 + (b.x2 - b.x1) * p} y2={b.y1 + (b.y2 - b.y1) * p} stroke={C.gold} strokeWidth={14} strokeLinecap="round" />;
      })}
    </svg>
  );
};

/** 2.4 The Emmet shortcut: SHIFT + 1, ENTER. */
export const Emmet: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("emmet");
  const click = c.word("e1", "click") + 10;
  const shift = c.word("e2", "shift");
  const one = c.word("e2", "one");
  const bang = c.word("e2", "exclamation");
  const enter = c.word("e3", "enter");
  const expandEnd = enter + 14;
  const showBang = frame >= one + 4 && frame < enter;
  const expanded = frame >= enter;
  const chars = expanded ? Math.floor(interpolate(frame, [enter, expandEnd], [0, EMMET.join("\n").length], CLAMP)) : undefined;
  const end = c.duration;
  const kb = progress(frame, shift - 12, 14);
  const kbOut = interpolate(frame, [c.line("e4") + 20, c.line("e4") + 34], [1, 0], CLAMP);

  const Key: React.FC<{ label: string; down: boolean; w: number }> = ({ label, down, w }) => (
    <div
      style={{
        width: w,
        height: 110,
        borderRadius: 18,
        background: down ? C.gold : C.white,
        color: C.ink,
        display: "grid",
        placeItems: "center",
        fontFamily: QUICKSAND,
        fontWeight: 700,
        fontSize: label.length > 2 ? 40 : 56,
        boxShadow: down ? `0 3px 0 ${C.goldDark}` : `0 12px 0 #b9cfc7`,
        transform: `translateY(${down ? 9 : 0}px)`,
      }}
    >
      {label}
    </div>
  );

  return (
    <AbsoluteFill>
      <IdeStage
        cam={[
          { f: 0, z: 1 },
          { f: click, z: 1.5, x: 650, y: 330 },
        ]}
        ide={{
          files: [{ name: "Number Match", kind: "project" }, { name: "index.html", kind: "html" }],
          activeFile: "index.html",
          code: expanded ? { lang: "html", lines: EMMET, chars, fontSize: 22, caret: frame > expandEnd ? { line: 9, col: 0 } : "end" } : { lang: "html", lines: showBang ? ["!"] : [""], fontSize: 22, caret: frame >= click ? { line: 1, col: showBang ? 1 : 0 } : null },
          previewBlank: true,
          focus: [{ target: "editor", amount: ring(frame, c.line("e1"), click + 12), label: "CLICK HERE", labelSide: "below" }],
        }}
        overlay={
          <Cursor
            keys={[
              { f: c.line("e1"), x: 900, y: 800 },
              { f: click - 2, x: 500, y: 200 },
              { f: click, x: 500, y: 200, click: true },
            ]}
            scale={1.3}
            hideAt={shift - 10}
          />
        }
      >
        {frame >= shift - 12 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", alignItems: "center", gap: 30, opacity: kb * kbOut }}>
            <Key label="SHIFT" w={260} down={frame >= shift && frame < enter - 6} />
            <div style={{ color: C.white, fontSize: 64, fontFamily: QUICKSAND, fontWeight: 700 }}>+</div>
            <Key label="1 !" w={130} down={frame >= one && frame < one + 10} />
            <div style={{ color: C.white, fontSize: 64, fontFamily: QUICKSAND, fontWeight: 700, opacity: frame >= bang ? 1 : 0 }}>=</div>
            <div style={{ opacity: frame >= bang ? 1 : 0, fontFamily: MONO, fontSize: 96, color: C.gold, fontWeight: 700 }}>!</div>
            <div style={{ width: 60 }} />
            <div style={{ opacity: frame >= enter - 20 ? 1 : 0.25 }}>
              <Key label="ENTER" w={240} down={frame >= enter && frame < enter + 10} />
            </div>
          </div>
        )}
        <Label at={c.word("e4", "emmet")} x={1500} y={130} size={40}>
          ✨ EMMET
        </Label>
      </IdeStage>
      <Sfx name="click" at={click} />
      <Sfx name="key" at={shift} volume={0.7} />
      <Sfx name="key" at={one} />
      <Sfx name="key" at={enter} />
      <Sfx name="sparkle" at={enter + 2} />
      <Sfx name="pop-high" at={c.word("e4", "emmet")} />
      <SceneFade duration={end} />
    </AbsoluteFill>
  );
};

/** Small helper so other scenes can show the "LESSON 2" corner bug. */
export const Corner: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", right: 40, top: 30 }}>
    <Chip color={C.html} size={22}>
      {text}
    </Chip>
  </div>
);

