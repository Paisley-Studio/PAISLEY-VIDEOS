import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_IN_OUT, pop, progress } from "../../lib/anim";
import { HTML, HTML_LESSON2 } from "../../lib/course";
import { GameBrowser } from "../../components/GamePage";
import { simulateGame } from "../../lib/gameSim";
import { Cursor } from "../../components/Cursor";
import { centre, CodeCard, IdeStage, Label, ring, SceneFade, StageTitle } from "../../components/Lesson";
import { fileRowRect, IDE_RECTS, IdeFile } from "../../components/PaisleyIDE";
import { PlainPage } from "../../components/PlainPage";
import { Backdrop } from "../../components/Stage";
import { Sfx } from "../../components/Sfx";
import { C, MONO, QUICKSAND } from "../../styles/theme";
import { TL } from "./timeline";

const DECK = [3, 1, 5, 2, 6, 4, 1, 3, 4, 6, 2, 5];
export const FINISHED = simulateGame(DECK, [1, 6, 0, 7, 3, 10].map((i, k) => ({ f: k * 10, i }))).at(90);

/** Big letter tiles that spell out an acronym. */
export const Acronym: React.FC<{ at: number; parts: [string, string][]; color: string; dark: string; y?: number }> = ({ at, parts, color, dark, y = 150 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", gap: 40, fontFamily: QUICKSAND, fontWeight: 700 }}>
      {parts.map(([big, rest], i) => {
        const s = pop(frame, fps, at + i * 8, 12);
        return (
          <div key={i} style={{ textAlign: "center", transform: `scale(${s})` }}>
            <div style={{ width: 180, height: 180, borderRadius: 30, background: color, color: C.white, fontSize: 124, display: "grid", placeItems: "center", boxShadow: `0 10px 0 ${dark}` }}>{big}</div>
            <div style={{ marginTop: 18, color: C.white, fontSize: 40 }}>
              <span style={{ color }}>{big}</span>
              {rest}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** 3.2 Recap: plain page → finished design. */
export const Recap: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("recap");
  const into = c.word("c2", "into");
  const split = progress(frame, into, 26, EASE_IN_OUT);
  const plainX = interpolate(split, [0, 1], [380, 70]);
  const plainS = interpolate(split, [0, 1], [1, 0.62]);
  return (
    <AbsoluteFill>
      <Backdrop count={12} seed={31} speed={0.3} />
      <div style={{ position: "absolute", left: plainX, top: 70, width: 1160, height: 820, transformOrigin: "0 0", transform: `scale(${plainS})`, background: C.white, borderRadius: 18, overflow: "hidden", boxShadow: `0 14px 0 ${C.night2}` }}>
        <PlainPage scale={1.43} />
      </div>
      {frame >= into && (
        <div style={{ position: "absolute", left: 830, top: 70, opacity: split, transform: `translateX(${(1 - split) * 200}px)` }}>
          <GameBrowser width={1020} height={820} zoom={0.52} scrollY={260} state={FINISHED} />
        </div>
      )}
      <Label at={into + 20} x={430} y={620} anchor="center" size={38} color={C.white}>BEFORE</Label>
      <Label at={into + 26} x={1340} y={905} anchor="center" size={38} color={C.css}>AFTER</Label>
      <Label at={c.line("c3")} x={960} y={20} anchor="center" size={44} color={C.css}>✦ THE POWER OF CSS</Label>
      <Sfx name="whoosh" at={into} />
      <Sfx name="sparkle" at={into + 14} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

const headLines = (extra: string[]) => {
  const head = HTML_LESSON2.slice(0, HTML_LESSON2.indexOf("</head>"));
  return [...head, ...extra, "</head>", "<body>", "  ..."];
};
const STYLE_LINK = '  <link rel="stylesheet" href="style.css">';

/** 3.3 Create style.css and link it. */
export const NewCss: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("newcss");
  const ideAt = c.line("n2") - 10;
  const clickNew = c.line("n2") + 14;
  const typeAt = c.word("n2", "type");
  const enter = c.word("n2", "enter");
  const name = "style.css";
  const typed = name.slice(0, Math.floor(interpolate(frame, [typeAt + 4, enter - 4], [0, name.length], CLAMP)));
  const created = frame >= enter;
  const files: IdeFile[] = [{ name: "Number Match", kind: "project" }, { name: "index.html", kind: "html" }, ...(created ? [{ name: "style.css", kind: "css" as const }] : [])];
  const backToHtml = c.line("n4");
  const linkType = c.word("n4", "type") + 4;
  const onHtml = frame >= backToHtml + 10;
  const lines = headLines(frame >= linkType ? [STYLE_LINK] : []);
  const linkLine = lines.indexOf(STYLE_LINK) + 1;
  const chars = frame >= linkType ? lines.slice(0, linkLine - 1).join("\n").length + 1 + Math.floor(interpolate(frame, [linkType, linkType + 34], [0, STYLE_LINK.length], CLAMP)) : undefined;
  const intro = frame < ideAt;
  const rel = c.word("n5", "rel");
  const href = c.word("n5", "tells", 1);

  return (
    <AbsoluteFill>
      <IdeStage
        cam={[
          { f: ideAt, z: 1.6, x: 260, y: 250 },
          { f: c.line("n3") + 20, z: 1.6, x: 260, y: 250 },
          { f: backToHtml + 10, z: 1.45, x: 700, y: 300 },
        ]}
        ide={{
          files,
          activeFile: onHtml ? "index.html" : created ? "style.css" : undefined,
          newFileInput: frame >= clickNew && !created ? typed : null,
          code: onHtml ? { lang: "html", lines, chars: frame >= linkType ? (frame > linkType + 34 ? Infinity : chars) : Infinity, fontSize: 22, marks: frame >= rel ? [{ from: linkLine, to: linkLine, color: "rgba(255,194,61,0.3)" }] : [] } : { lang: "css", lines: [], caret: created ? { line: 1, col: 0 } : null },
          previewBlank: true,
          press: { newFile: interpolate(frame, [clickNew, clickNew + 3, clickNew + 8], [0, 1, 0], CLAMP) },
          focus: [
            { target: fileRowRect(2), amount: ring(frame, enter + 4, backToHtml) + ring(frame, href, c.duration), label: "style.css", labelSide: "right" },
            { target: fileRowRect(1), amount: ring(frame, backToHtml - 4, backToHtml + 16) },
          ],
        }}
        overlay={
          <Cursor
            keys={[
              { f: ideAt, x: 700, y: 600 },
              { f: clickNew - 2, x: centre(IDE_RECTS.newFile).x, y: centre(IDE_RECTS.newFile).y },
              { f: clickNew, x: centre(IDE_RECTS.newFile).x, y: centre(IDE_RECTS.newFile).y, click: true },
              { f: backToHtml - 6, x: 100, y: centre(fileRowRect(1)).y },
              { f: backToHtml, x: 100, y: centre(fileRowRect(1)).y, click: true },
            ]}
            scale={1.3}
            showFrom={ideAt}
            hideAt={linkType}
          />
        }
      >
        <Label at={c.word("n3", "html")} out={backToHtml - 4} x={1100} y={300} color={C.html} size={36}>HTML → structure</Label>
        <Label at={c.word("n3", "css")} out={backToHtml - 4} x={1100} y={390} color={C.css} size={36}>CSS → style</Label>
        <Label at={rel} x={1240} y={640} size={32}>rel = "this is a style file"</Label>
        <Label at={href} x={1240} y={720} size={32}>href = "where to find it"</Label>
      </IdeStage>
      {intro && (
        <AbsoluteFill style={{ opacity: interpolate(frame, [ideAt - 10, ideAt], [1, 0], CLAMP) }}>
          <Backdrop count={12} seed={2} speed={0.3} />
          <Acronym
            at={4}
            color={C.css}
            dark="#0c6b4c"
            parts={[
              ["C", "ascading"],
              ["S", "tyle"],
              ["S", "heets"],
            ]}
          />
          {["colours", "sizes", "spacing", "movement"].map((w, i) => (
            <Label key={w} at={c.word("n1", w)} x={480 + i * 320} y={600} anchor="center" color={C.mint} size={36}>
              {w}
            </Label>
          ))}
        </AbsoluteFill>
      )}
      <Sfx name="click" at={clickNew} />
      <Sfx name="typing" at={typeAt + 4} dur={enter - typeAt - 8} />
      <Sfx name="pop" at={enter + 2} />
      <Sfx name="click" at={backToHtml} />
      <Sfx name="typing" at={linkType} dur={34} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 3.4 Selector, braces, property, value, semicolon. */
export const Basics: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("basics");
  const FS = 50;
  const lineH = Math.round(FS * 1.55);
  const X = 110;
  const Y = 210;
  const lines = ["body {", "  background-color: #f4faf7;", "  font-family: 'Quicksand', sans-serif;", "}"];
  const chars = Math.floor(interpolate(frame, [c.line("b1") + 10, c.line("b2")], [0, lines.join("\n").length], CLAMP));
  const box = (line: number, col: number, len: number, color: string, from: number, to: number, label: string, below = true) => {
    const a = ring(frame, from, to);
    if (a <= 0) return null;
    const left = X + 24 + col * FS * 0.6 - 6;
    const top = Y + 58 + 14 + (line - 1) * lineH;
    return (
      <>
        <div style={{ position: "absolute", left, top, width: len * FS * 0.6 + 12, height: lineH, border: `5px solid ${color}`, borderRadius: 10, opacity: a, boxSizing: "border-box" }} />
        <div style={{ position: "absolute", left, top: below ? Y + 58 + 28 + 4 * lineH + 18 : Y - 62, opacity: a }}>
          <div style={{ background: color, color: color === C.gold ? C.ink : C.white, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, padding: "6px 16px", borderRadius: 10, whiteSpace: "nowrap" }}>{label}</div>
        </div>
      </>
    );
  };
  const swatch = progress(frame, c.word("b4", "value"), 14);
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={41} speed={0.2} />
      <StageTitle at={0} y={40}>
        Our first CSS rule
      </StageTitle>
      <div style={{ position: "absolute", left: X, top: Y }}>
        <CodeCard file="style.css" lang="css" lines={lines} fontSize={FS} width={1300} chars={chars} lineNumbers={false} tag="TEACHING EXAMPLE" />
      </div>
      {box(1, 0, 4, C.red, c.word("b2", "selector"), c.line("b3"), "SELECTOR: which element?", false)}
      {box(1, 5, 1, C.gold, c.line("b3"), c.line("b4"), "{ opens the declaration block")}
      {box(4, 0, 1, C.gold, c.line("b3"), c.line("b4"), "} closes it")}
      {box(2, 2, 16, C.css, c.word("b4", "property"), c.word("b4", "value"), "PROPERTY: what to change", false)}
      {box(2, 18, 1, C.white, c.word("b4", "colon"), c.word("b4", "value"), ":", true)}
      {box(2, 20, 7, C.gold, c.word("b4", "value"), c.line("b5"), "VALUE: how")}
      {box(2, 27, 1, C.red, c.line("b5"), c.line("b6"), "; = full stop")}
      {box(3, 2, 36, C.css, c.line("b6"), c.duration, "font-family", false)}
      <div style={{ position: "absolute", left: 1480, top: 260, width: 330, height: 300, borderRadius: 22, background: swatch > 0 ? "#f4faf7" : C.white, border: `6px solid ${C.white}`, opacity: swatch, fontFamily: QUICKSAND, fontWeight: 700, color: C.muted, display: "grid", placeItems: "center", fontSize: 28 }}>
        #f4faf7
      </div>
      <Label at={c.word("b6", "quicksand")} x={1480} y={600} size={40} color={C.mint}>
        <span style={{ fontFamily: QUICKSAND }}>Quicksand Aa</span>
      </Label>
      {[c.word("b2", "selector"), c.line("b3"), c.word("b4", "property"), c.word("b4", "value"), c.line("b5"), c.line("b6")].map((f, i) => (
        <Sfx key={i} name="tick" at={f} />
      ))}
      <Sfx name="typing" at={c.line("b1") + 10} dur={c.line("b2") - c.line("b1") - 10} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

const FONT_LINKS = HTML.filter((l) => /fonts\.g/.test(l));

/** 3.5 Google Fonts: a simplified, unbranded walkthrough, then paste into <head>. */
export const Fonts: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("fonts");
  const step = (id: string) => c.line(id);
  const searchType = c.word("f3", "search") + 6;
  const query = "Quicksand".slice(0, Math.floor(interpolate(frame, [searchType, searchType + 22], [0, 9], CLAMP)));
  const clickResult = c.word("f3", "click") + 4;
  const getFont = c.word("f4", "get") + 2;
  const embed = c.word("f4", "get", 1) + 2;
  const copyAt = c.word("f6", "copy") + 6;
  const ideAt = step("f7") - 6;
  const pasteAt = c.word("f7", "paste") + 2;
  const page = frame < clickResult ? "search" : frame < getFont + 6 ? "font" : "embed";
  const BX = 160;
  const BY = 60;
  const BW = 1600;
  const BH = 840;

  const htmlLines = (() => {
    const head = HTML_LESSON2.slice(0, HTML_LESSON2.indexOf("</head>"));
    const pasted = frame >= pasteAt ? ["", "  <!-- QUICKSAND FONT (Google Fonts) -->", ...FONT_LINKS, ""] : [];
    return [...head, ...pasted, STYLE_LINK, "</head>"];
  })();
  const firstFont = htmlLines.findIndex((l) => l.includes("preconnect")) + 1;

  const weight = (w: number) => w >= 400;

  return (
    <AbsoluteFill>
      {frame < ideAt + 10 && (
        <AbsoluteFill style={{ opacity: interpolate(frame, [ideAt, ideAt + 10], [1, 0], CLAMP) }}>
          <Backdrop count={10} seed={51} speed={0.25} />
          {/* intro: font samples */}
          {frame < step("f2") && (
            <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", color: C.white, fontWeight: 700, lineHeight: 1.5 }}>
              {[["Quicksand", QUICKSAND], ["Times New Roman", '"Times New Roman", serif'], ["Courier", "Courier New, monospace"], ["Georgia", "Georgia, serif"]].map(([n, f], i) => (
                <Label key={n} at={8 + i * 8} x={960} y={i * 110} anchor="center" size={52} color={i === 0 ? C.gold : C.white}>
                  <span style={{ fontFamily: f }}>{n} Aa</span>
                </Label>
              ))}
            </div>
          )}
          {frame >= step("f2") && (
            <div style={{ position: "absolute", left: BX, top: BY, width: BW, height: BH, background: C.white, borderRadius: 18, overflow: "hidden", fontFamily: QUICKSAND, boxShadow: `0 14px 0 ${C.night2}` }}>
              <div style={{ height: 64, background: "#eef2f1", display: "flex", alignItems: "center", padding: "0 24px", gap: 12 }}>
                {["#ff6058", "#ffbd2e", "#28c940"].map((col) => (
                  <span key={col} style={{ width: 16, height: 16, borderRadius: "50%", background: col }} />
                ))}
                <div style={{ marginLeft: 20, flex: 1, height: 40, borderRadius: 20, background: C.white, display: "flex", alignItems: "center", padding: "0 20px", fontSize: 24, fontWeight: 600, color: C.ink }}>fonts.google.com</div>
              </div>
              <div style={{ position: "relative", padding: 50, fontWeight: 700 }}>
                {page === "search" && (
                  <>
                    <div style={{ fontSize: 40, color: C.ink }}>Fonts</div>
                    <div style={{ marginTop: 26, height: 70, borderRadius: 35, border: `3px solid ${frame >= searchType ? C.css : "#ccd"}`, display: "flex", alignItems: "center", padding: "0 30px", fontSize: 32, color: query ? C.ink : "#8a9a96" }}>
                      🔍 {query || "Search fonts"}
                    </div>
                    {query.length > 5 && (
                      <div style={{ marginTop: 34, width: 700, padding: 30, borderRadius: 20, border: `3px solid ${frame >= clickResult - 10 ? C.gold : "#dde"}` }}>
                        <div style={{ fontSize: 26, color: C.muted }}>Quicksand</div>
                        <div style={{ fontFamily: QUICKSAND, fontSize: 64, color: C.ink }}>Whereas recognition</div>
                      </div>
                    )}
                  </>
                )}
                {page === "font" && (
                  <>
                    <div style={{ fontFamily: QUICKSAND, fontSize: 90, color: C.ink }}>Quicksand</div>
                    <div style={{ position: "absolute", right: 60, top: 60, background: frame >= getFont ? C.css : "#1a73e8", color: C.white, padding: "16px 30px", borderRadius: 30, fontSize: 30 }}>Get font</div>
                    <div style={{ marginTop: 30, fontSize: 34, color: C.muted, fontWeight: 500 }}>Weights 300 · 400 · 500 · 600 · 700</div>
                  </>
                )}
                {page === "embed" && (
                  <>
                    <div style={{ fontSize: 40, color: C.ink }}>Embed code</div>
                    {frame < embed + 4 && <div style={{ position: "absolute", right: 60, top: 60, background: "#1a73e8", color: C.white, padding: "16px 30px", borderRadius: 30, fontSize: 30 }}>Get embed code</div>}
                    {frame >= embed + 4 && (
                      <>
                        <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
                          {[300, 400, 500, 600, 700].map((w) => {
                            const on = frame >= step("f5") && weight(w);
                            return (
                              <div key={w} style={{ padding: "12px 22px", borderRadius: 14, border: `3px solid ${on ? C.css : "#ccd"}`, background: on ? C.mint : C.white, fontFamily: QUICKSAND, fontWeight: w, fontSize: 30, color: C.ink }}>
                                {w} Aa
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ marginTop: 34, background: "#f4f7f6", borderRadius: 14, padding: 24, fontFamily: MONO, fontSize: 21, lineHeight: 1.6, color: C.ink, border: `4px solid ${frame >= copyAt ? C.gold : "transparent"}` }}>
                          {FONT_LINKS.map((l) => (
                            <div key={l} style={{ whiteSpace: "pre" }}>{l.trim()}</div>
                          ))}
                        </div>
                        <div style={{ marginTop: 20, display: "inline-block", background: frame >= copyAt ? C.css : "#1a73e8", color: C.white, padding: "14px 30px", borderRadius: 30, fontSize: 28 }}>{frame >= copyAt + 4 ? "Copied ✓" : "Copy code"}</div>
                      </>
                    )}
                  </>
                )}
              </div>
              <Cursor
                keys={[
                  { f: step("f2"), x: 900, y: 600 },
                  { f: searchType - 4, x: 600, y: 240 },
                  { f: searchType - 2, x: 600, y: 240, click: true },
                  { f: clickResult - 4, ...{ x: 500, y: 460 } },
                  { f: clickResult, x: 500, y: 460, click: true },
                  { f: getFont - 4, x: 1460, y: 140 },
                  { f: getFont, x: 1460, y: 140, click: true },
                  { f: embed - 4, x: 1400, y: 140 },
                  { f: embed, x: 1400, y: 140, click: true },
                  { f: copyAt - 6, x: 160, y: 590 },
                  { f: copyAt, x: 160, y: 590, click: true },
                ]}
                scale={1.2}
                showFrom={step("f2")}
              />
            </div>
          )}
          <Label at={step("f5")} out={step("f6")} x={960} y={20} anchor="center" size={34}>
            400 → 700: higher number = bolder text
          </Label>
        </AbsoluteFill>
      )}
      {frame >= ideAt && (
        <IdeStage
          cam={[{ f: ideAt, z: 1.35, x: 760, y: 320 }]}
          ide={{
            files: [
              { name: "Number Match", kind: "project" },
              { name: "index.html", kind: "html" },
              { name: "style.css", kind: "css" },
            ],
            activeFile: "index.html",
            code: {
              lang: "html",
              lines: htmlLines,
              fontSize: 20,
              marks:
                frame >= step("f8")
                  ? [
                      { from: firstFont, to: firstFont + 1, color: frame < c.word("f8", "last") ? "rgba(255,194,61,0.35)" : "transparent" },
                      { from: firstFont + 2, to: firstFont + 2, color: frame >= c.word("f8", "last") ? "rgba(255,194,61,0.35)" : "transparent" },
                    ]
                  : frame >= pasteAt
                    ? [{ from: firstFont - 1, to: firstFont + 2, color: "rgba(20,147,107,0.18)" }]
                    : [],
            },
            previewBlank: true,
          }}
        >
          <Label at={c.word("f8", "preconnect")} out={c.word("f8", "last")} x={1250} y={720} size={30}>preconnect = get ready, fast</Label>
          <Label at={c.word("f8", "last")} x={1250} y={720} size={30}>downloads Quicksand</Label>
          <Label at={c.word("f9", "internet")} x={960} y={840} anchor="center" size={34} color={C.red}>needs an internet connection</Label>
        </IdeStage>
      )}
      <Sfx name="typing" at={searchType} dur={24} />
      {[clickResult, getFont, embed, copyAt].map((f, i) => (
        <Sfx key={i} name="click" at={f} />
      ))}
      <Sfx name="pop" at={copyAt + 4} />
      <Sfx name="whoosh-short" at={ideAt} />
      <Sfx name="pop-high" at={pasteAt} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

