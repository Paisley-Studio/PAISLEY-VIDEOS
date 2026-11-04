import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, pop, progress, SceneFade } from "../../shared/anim";
import { CodeEditor, CodeLine, Lang, LANG_COLOR } from "../../shared/Code";
import { C, QUICKSAND, SHADOW_SOFT } from "../../shared/theme";
import { T6 } from "../timeline";
import { DeliveryApp, MealCard, SchoolPortal } from "../apps";
import { Camera, FilmFinish, LaptopFrame, LightSweep, Phone, Tap, V6, Sfx } from "../kit";

// ---------------- The house metaphor: frame → paint → lights ----------------

const House: React.FC<{ frameP: number; paintP: number; lightsP: number; size?: number }> = ({ frameP, paintP, lightsP, size = 260 }) => {
  const dash = 1400;
  return (
    <svg width={size} height={size * 0.9} viewBox="0 0 260 234">
      {/* paint */}
      <g opacity={paintP}>
        <path d="M30 110 L130 30 L230 110 Z" fill={C.dino} />
        <rect x="45" y="105" width="170" height="115" fill="#fff4e2" />
        <rect x="112" y="150" width="38" height="70" rx="6" fill={C.css} />
      </g>
      {/* windows: dark until the lights come on */}
      {[
        [62, 130], [168, 130],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="32" height="32" rx="4" fill={paintP > 0 ? `rgba(60,70,90,${0.6 * paintP})` : "none"} />
          <rect x={x} y={y} width="32" height="32" rx="4" fill="#ffd36b" opacity={lightsP} />
          {lightsP > 0 ? <circle cx={x + 16} cy={y + 16} r={30} fill="#ffd36b" opacity={0.25 * lightsP} /> : null}
        </g>
      ))}
      {/* frame lines */}
      <g fill="none" stroke={C.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} strokeDashoffset={dash * (1 - frameP)}>
        <path d="M30 110 L130 30 L230 110 M45 105 V220 H215 V105 M112 220 V150 H150 V220 M62 130 h32 v32 h-32 Z M168 130 h32 v32 h-32 Z M45 160 H215" />
      </g>
      <path d="M10 222 H250" stroke={C.ground} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
};

const LessonPill: React.FC<{ lang: Lang; title: string; role: string; at: number }> = ({ lang, title, role, at }) => (
  <Appear at={at} kind="down" style={{ position: "absolute", left: 100, top: 56 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <div style={{ padding: "12px 28px", borderRadius: 999, background: LANG_COLOR[lang], color: lang === "js" ? C.ink : "white", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 36, boxShadow: SHADOW_SOFT }}>{title}</div>
      <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: C.ink }}>= {role}</div>
    </div>
  </Appear>
);

/** Shared layout: code on the left, the live result in the middle, the house on the right. */
const Workbench: React.FC<{ lang: Lang; file: string; lines: CodeLine[]; card: React.ReactNode; house: React.ReactNode; marks?: React.ComponentProps<typeof CodeEditor>["marks"] }> = ({
  lang,
  file,
  lines,
  card,
  house,
  marks,
}) => (
  <>
    <Appear at={2} kind="left" style={{ position: "absolute", left: 100, top: 170 }}>
      <CodeEditor file={file} lang={lang} lines={lines} width={820} height={640} fontSize={25} marks={marks} />
    </Appear>
    <Appear at={8} kind="up" style={{ position: "absolute", left: 1000, top: 200 }}>
      {card}
    </Appear>
    <Appear at={12} kind="fade" style={{ position: "absolute", left: 1580, top: 150 }}>
      <div style={{ padding: 14, borderRadius: 26, background: "rgba(255,255,255,0.7)", boxShadow: SHADOW_SOFT }}>{house}</div>
    </Appear>
  </>
);

// ---------------- Scene: HTML ----------------

export const HtmlScene: React.FC = () => {
  const frame = useCurrentFrame();
  const q = T6.cuesFor("html");
  const startAt = q.word("h1", "structure");
  const houseAt = q.word("h2", "house");
  const w = (word: string) => q.word("h2", word);
  const nothingAt = q.word("h3", "nothing");
  const lines: CodeLine[] = [
    { text: '<div class="card">', at: startAt },
    { text: "  <h2>Margherita Pizza</h2>", at: w("heading") - 4 },
    { text: '  <img src="pizza.png" alt="Pizza">', at: w("picture") - 4 },
    { text: "  <p>Fresh tomato and mozzarella.</p>", at: w("text") - 4 },
    { text: "  <button>Add to cart</button>", at: w("button") - 4 },
    { text: "</div>", at: w("button") + 10 },
  ];
  const parts = lines.filter((l) => frame >= (l.at ?? 0) + 8).length;
  const gone = nothingAt <= frame && frame < nothingAt + 30;
  return (
    <SceneFade duration={q.duration}>
      <LessonPill lang="html" title="HTML" role="structure" at={q.line("h1")} />
      <Workbench
        lang="html"
        file="index.html"
        lines={lines}
        card={<div style={{ opacity: gone ? 0.08 : 1 }}><MealCard s={{ parts: Math.min(5, parts), style: 0, count: 0 }} /></div>}
        house={<House frameP={progress(frame, houseAt, 40, EASE_IN_OUT)} paintP={0} lightsP={0} size={240} />}
      />
      <Appear at={houseAt} kind="up" style={{ position: "absolute", left: 1585, top: 390, width: 260, textAlign: "center" }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, color: C.inkSoft }}>the frame</div>
      </Appear>
      <FilmFinish vignette={0.14} grain={0.025} />
      {lines.map((l, i) => (
        <Sfx key={i} at={l.at ?? 0} name="typing" volume={0.18} />
      ))}
      <Sfx at={houseAt} name="pencil" volume={0.3} />
      <Sfx at={nothingAt} name="whoosh" volume={0.25} />
    </SceneFade>
  );
};

// ---------------- Scene: CSS ----------------

export const CssScene: React.FC = () => {
  const frame = useCurrentFrame();
  const q = T6.cuesFor("css");
  const w = (word: string) => q.word("c2", word);
  const paintAt = w("paint");
  const colorsAt = w("colors");
  const fontsAt = w("fonts");
  const spacingAt = w("spacing");
  const cornersAt = w("corners");
  const beautifulAt = q.word("c3", "beautiful");
  const lines: CodeLine[] = [
    { text: ".card {", at: q.line("c1") + 10 },
    { text: "  background: white;", at: colorsAt - 4 },
    { text: "  font-family: Quicksand;", at: fontsAt - 4 },
    { text: "  padding: 30px;", at: spacingAt - 4 },
    { text: "  border-radius: 30px;", at: cornersAt - 4 },
    { text: "  box-shadow: 0 20px 46px #0002;", at: cornersAt + 6 },
    { text: "}", at: cornersAt + 12 },
    { text: "button {", at: cornersAt + 18 },
    { text: "  background: #f08a4b;", at: cornersAt + 24 },
    { text: "  color: white;", at: cornersAt + 30 },
    { text: "}", at: cornersAt + 36 },
  ];
  const style = interpolate(frame, [paintAt, colorsAt + 6, fontsAt + 6, spacingAt + 6, cornersAt + 30], [0, 0.3, 0.55, 0.8, 1], { ...CLAMP, easing: EASE_IN_OUT });
  return (
    <SceneFade duration={q.duration}>
      <LessonPill lang="css" title="CSS" role="appearance" at={q.line("c1")} />
      <Workbench
        lang="css"
        file="style.css"
        lines={lines}
        card={<MealCard s={{ parts: 5, style, count: 0 }} />}
        house={<House frameP={1} paintP={progress(frame, paintAt, 30)} lightsP={0} size={240} />}
      />
      <Appear at={paintAt} kind="up" style={{ position: "absolute", left: 1585, top: 390, width: 260, textAlign: "center" }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, color: C.inkSoft }}>the paint</div>
      </Appear>
      <LightSweep at={beautifulAt - 6} dur={30} />
      <FilmFinish vignette={0.14} grain={0.025} />
      {[colorsAt, fontsAt, spacingAt, cornersAt].map((at, i) => (
        <Sfx key={i} at={at} name="pop" volume={0.25} />
      ))}
      <Sfx at={paintAt} name="whoosh" volume={0.25} />
      <Sfx at={beautifulAt} name="sparkle" volume={0.3} />
    </SceneFade>
  );
};

// ---------------- Scene: JavaScript ----------------

export const JsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const q = T6.cuesFor("js");
  const startAt = q.line("j1") + 14;
  const tapAt = q.word("j2", "tap");
  const countsAt = q.word("j3", "counts");
  const checksAt = q.word("j3", "checks");
  const respondsAt = q.word("j3", "responds");
  const lightsAt = q.word("j3", "lights");
  const presses = [tapAt, countsAt, checksAt, respondsAt];
  const count = presses.filter((p) => frame >= p).length;
  const lastPress = [...presses].reverse().find((p) => frame >= p);
  const lines: CodeLine[] = [
    { text: "let count = 0;", at: startAt },
    { text: 'const button = document.querySelector("button");', at: startAt + 8 },
    { text: "", at: startAt + 12 },
    { text: 'button.addEventListener("click", () => {', at: startAt + 16 },
    { text: "  count = count + 1;", at: startAt + 24 },
    { text: "  cartCount.textContent = count;", at: startAt + 32 },
    { text: "});", at: startAt + 40 },
  ];
  const runMarks = presses.map((p) => ({ from: 4, to: 5, at: p, until: p + 14, color: "rgba(242,183,5,0.3)" }));
  // card sits at (1000, 200); its button is near the bottom of the card
  const btnX = 1000 + 260;
  const btnY = 200 + 426;
  return (
    <SceneFade duration={q.duration}>
      <LessonPill lang="js" title="JavaScript" role="behavior" at={q.line("j1")} />
      <Workbench
        lang="js"
        file="script.js"
        lines={lines}
        marks={runMarks}
        card={<MealCard s={{ parts: 5, style: 1, count, pressAt: lastPress, live: true }} />}
        house={<House frameP={1} paintP={1} lightsP={progress(frame, lightsAt, 10)} size={240} />}
      />
      {presses.map((p, i) => (
        <Tap key={i} at={p} x={btnX} y={btnY} />
      ))}
      <Appear at={lightsAt} kind="up" style={{ position: "absolute", left: 1585, top: 390, width: 260, textAlign: "center" }}>
        <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, color: C.inkSoft }}>the electricity</div>
      </Appear>
      <FilmFinish vignette={0.14} grain={0.025} />
      <Sfx at={startAt} name="typing" volume={0.18} />
      {presses.map((p, i) => (
        <React.Fragment key={i}>
          <Sfx at={p} name="click" volume={0.4} />
          <Sfx at={p + 3} name="pop" volume={0.22} />
        </React.Fragment>
      ))}
      <Sfx at={lightsAt} name="chime" volume={0.3} />
    </SceneFade>
  );
};

// ---------------- Scene: three layers, one product ----------------

const Layer: React.FC<{ z: number; label: string; color: string; lit: number; flat: number; children: React.ReactNode }> = ({ z, label, color, lit, flat, children }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 600, height: 700, transform: `translateZ(${z}px)`, transformStyle: "preserve-3d" }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 34, border: `4px solid ${color}`, background: `${color}10`, boxShadow: lit > 0 ? `0 0 ${60 * lit}px ${color}88` : "none", opacity: 1 - flat }} />
    <div style={{ position: "absolute", inset: 40 }}>{children}</div>
    <div style={{ position: "absolute", left: 620, top: 300, padding: "10px 24px", borderRadius: 999, background: color, color: color === C.js ? C.ink : "white", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, whiteSpace: "nowrap", transform: `rotateZ(35deg) rotateX(-58deg) scale(${1 + lit * 0.15})`, transformOrigin: "left center", opacity: 1 - flat }}>
      {label}
    </div>
  </div>
);

export const TogetherScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = T6.cuesFor("together");
  const riseAt = q.line("g1");
  const htmlAt = q.word("g2", "html");
  const cssAt = q.word("g2", "css");
  const jsAt = q.word("g2", "javascript");
  const mergeAt = q.word("g3", "three");
  const productAt = q.word("g3", "product");
  const foodAt = q.word("g3", "food");
  const portalAt = q.word("g3", "portal");
  const siteAt = q.word("g3", "website");
  const spread = progress(frame, riseAt, 30, EASE_IN_OUT) * (1 - progress(frame, mergeAt, 26, EASE_IN_OUT));
  const flat = progress(frame, mergeAt, 26, EASE_IN_OUT);
  const lit = (at: number) => progress(frame, at, 8) * (1 - progress(frame, at + 26, 14));
  const pulse = (frame % 30) / 30;
  const thumbs = [
    { at: foodAt, x: 140, y: 170, node: <Phone style={{ position: "relative" }}><DeliveryApp cues={{ scrollAt: 1e6, pickAt: 1e6, orderAt: 1e6, trackAt: -100 }} /></Phone>, scale: 0.5 },
    { at: portalAt, x: 1270, y: 160, node: <LaptopFrame width={900} address="portal.brookfield-academy.edu" style={{ position: "relative" }}><SchoolPortal width={900} height={900 * 0.625 - 44} cues={{ emailAt: -200, signInAt: -150, dashAt: -120, gradesAt: -100, messageAt: -60 }} /></LaptopFrame>, scale: 0.55 },
    {
      at: siteAt, x: 1300, y: 580, scale: 0.55,
      node: (
        <LaptopFrame width={900} address="paisleytechstudio.com" style={{ position: "relative" }}>
          <div style={{ padding: 40, fontFamily: QUICKSAND, background: C.canvas, height: "100%" }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 6, color: C.inkSoft }}>PAISLEY TECH STUDIO</div>
            <div style={{ fontSize: 64, fontWeight: 700, color: C.ink, marginTop: 10 }}>Learn to build real things.</div>
            <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
              {[C.html, C.css, C.js].map((c) => (
                <div key={c} style={{ flex: 1, height: 200, borderRadius: 24, background: c, opacity: 0.85 }} />
              ))}
            </div>
          </div>
        </LaptopFrame>
      ),
    },
  ];
  return (
    <SceneFade duration={q.duration}>
      <Camera shots={[{ f: 0, scale: 1 }, { f: mergeAt, scale: 1.02 }, { f: foodAt - 10, scale: 1 }, { f: q.duration, scale: 0.97 }]}>
        <div style={{ position: "absolute", left: 600 + flat * 60, top: 250 - flat * 110, width: 600, height: 700, perspective: 2200 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformStyle: "preserve-3d",
              transform: `rotateX(${58 * (1 - flat)}deg) rotateZ(${-35 * (1 - flat)}deg) scale(${1 - 0.18 * (1 - flat)})`,
            }}
          >
            <Layer z={0} label="HTML · structure" color={C.html} lit={lit(htmlAt)} flat={flat}>
              <div style={{ opacity: 1 - flat }}>
                <MealCard s={{ parts: 5, style: 0, count: 0 }} />
              </div>
            </Layer>
            <Layer z={spread * 190} label="CSS · appearance" color={C.css} lit={lit(cssAt)} flat={flat}>
              <div style={{ opacity: 1 }}>
                <MealCard s={{ parts: 5, style: 1, count: frame >= productAt ? 1 : 0, live: flat > 0.9, pressAt: productAt }} />
              </div>
            </Layer>
            <Layer z={spread * 380} label="JavaScript · behavior" color={C.js} lit={lit(jsAt)} flat={flat}>
              <div style={{ position: "absolute", left: 220, top: 540, width: 80, height: 80, borderRadius: "50%", border: `4px solid ${C.js}`, transform: `scale(${1 + pulse * 1.4})`, opacity: (1 - pulse) * (1 - flat) }} />
              <div style={{ position: "absolute", left: 360, top: -30, padding: "8px 16px", borderRadius: 999, background: C.js, fontFamily: V6.mono, fontSize: 22, fontWeight: 700, color: C.ink, opacity: 1 - flat }}>click → count + 1</div>
            </Layer>
          </div>
        </div>
        <Appear at={productAt - 4} kind="up" style={{ position: "absolute", left: 0, right: 0, top: 60, textAlign: "center" }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 64, color: C.ink }}>
            Three layers. <span style={{ color: C.dino }}>One real product.</span>
          </div>
        </Appear>
        {thumbs.map((t, i) => {
          const s = pop(frame, fps, t.at, 13);
          if (frame < t.at) return null;
          return (
            <div key={i} style={{ position: "absolute", left: t.x, top: t.y, transformOrigin: "top left", transform: `scale(${t.scale * (0.7 + 0.3 * s)}) rotate(${(i - 1) * 3}deg)`, opacity: Math.min(1, s * 1.5) }}>
              {t.node}
            </div>
          );
        })}
      </Camera>
      <LightSweep at={mergeAt + 16} dur={30} />
      <FilmFinish vignette={0.16} grain={0.03} />
      <Sfx at={riseAt} name="riser" volume={0.18} />
      {[htmlAt, cssAt, jsAt].map((at, i) => (
        <Sfx key={i} at={at} name="pop" volume={0.3} />
      ))}
      <Sfx at={mergeAt} name="whoosh" volume={0.35} />
      <Sfx at={mergeAt + 24} name="impact" volume={0.3} />
      <Sfx at={productAt} name="chime" volume={0.3} />
      {[foodAt, portalAt, siteAt].map((at, i) => (
        <Sfx key={i} at={at} name="swipe" volume={0.25} />
      ))}
    </SceneFade>
  );
};

