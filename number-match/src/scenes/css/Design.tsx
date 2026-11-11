import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_FLIP, EASE_IN_OUT, map, pop, progress } from "../../lib/anim";
import { block, CSS, dedent } from "../../lib/course";
import { emptyState, GameBrowser, GamePage } from "../../components/GamePage";
import { CodeCard, EndCard, Label, SceneFade, StageTitle, typedChars } from "../../components/Lesson";
import { NumberCard } from "../../components/NumberCard";
import { Backdrop, Sparks } from "../../components/Stage";
import { Sfx } from "../../components/Sfx";
import { C, QUICKSAND } from "../../styles/theme";
import { FINISHED } from "./Setup";
import { TL } from "./timeline";

const EMPTY = emptyState(6);

/** 3.6 CSS variables, with the live "change --red" demo. */
export const Variables: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("variables");
  const root = block(CSS, ":root {");
  const typeFrom = c.line("v2");
  const chars = typedChars(root, frame, typeFrom + 6, typeFrom + 70);
  const swap = c.line("v6") - 4;
  const back = c.duration - 30;
  const purple = frame >= swap && frame < back;
  const lines = purple ? root.map((l) => (l.includes("--red:") ? "  --red: #7b2ff7;" : l)) : root;
  const red = purple ? "#7b2ff7" : C.red;
  const greenLine = root.findIndex((l) => l.includes("--green:")) + 1;
  const redLine = root.findIndex((l) => l.includes("--red:")) + 1;
  const usage = ["/* used in style.css like this: */", ".brand-mark {", "  background-color: var(--red);", "}"];
  const rowY = (n: number) => 120 + 58 + 14 + (n - 1) * 39;
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={61} speed={0.2} />
      <div style={{ position: "absolute", left: 50, top: 120 }}>
        <CodeCard
          file="style.css"
          lang="css"
          lines={lines}
          fontSize={25}
          width={720}
          chars={chars}
          marks={[
            { from: greenLine, to: greenLine, at: c.word("v3", "green"), until: c.word("v3", "red") },
            { from: redLine, to: redLine, at: c.word("v3", "red"), until: c.line("v4") },
            { from: redLine, to: redLine, at: c.line("v5") },
          ]}
        />
      </div>
      {root.map((l, i) => {
        const m = l.match(/#[0-9a-f]{6}/i);
        if (!m || frame < typeFrom + 6 + (i / root.length) * 64) return null;
        const col = l.includes("--red:") ? red : m[0];
        return <div key={i} style={{ position: "absolute", left: 610, top: rowY(i + 1) - 14, width: 110, height: 28, borderRadius: 8, background: col, border: `3px solid ${C.white}` }} />;
      })}
      {frame >= c.line("v4") && (
        <div style={{ position: "absolute", left: 50, top: 770 }}>
          <CodeCard lang="css" lines={usage} fontSize={24} width={720} lineNumbers={false} marks={[{ from: 3, to: 3, at: c.word("v4", "var") }]} dim={false} />
        </div>
      )}
      <div style={{ position: "absolute", left: 820, top: 120, opacity: progress(frame, c.line("v4"), 14) }}>
        <GameBrowser width={1050} height={720} zoom={0.56} scrollY={0} state={EMPTY} red={red} />
      </div>
      <Label at={c.line("v5")} x={1340} y={860} anchor="center" size={34}>change it in ONE place...</Label>
      <Label at={swap + 8} x={1340} y={30} anchor="center" size={34} color={red}>...it changes EVERYWHERE</Label>
      <Sfx name="typing" at={typeFrom + 6} dur={64} />
      <Sfx name="pop-high" at={swap} />
      <Sfx name="sparkle" at={swap + 2} />
      <Sfx name="pop-low" at={back} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 3.7 Layout rules, each with the matching part of the page outlined. */
export const Layout: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("layout");
  const steps: { line: string; code: string[]; ring: string }[] = [
    { line: "l2", code: block(CSS, ".app-shell {"), ring: "shell" },
    { line: "l3", code: block(CSS, ".topbar {"), ring: "topbar" },
    { line: "l4", code: [...block(CSS, ".hero h1 {"), "", ...block(CSS, ".hero h1 span {")], ring: "heading" },
    { line: "l5", code: block(CSS, ".game-panel {"), ring: "panel" },
    { line: "l6", code: block(CSS, ".stats {"), ring: "stats" },
    { line: "l7", code: block(CSS, ".progress-fill {"), ring: "progress" },
  ];
  const cur = [...steps].reverse().find((s) => frame >= c.line(s.line) - 6);
  const start = cur ? c.line(cur.line) - 6 : 0;
  const pulse = cur ? interpolate(frame, [start, start + 10], [0, 1], CLAMP) : 0;
  const scroll = cur?.ring === "stats" || cur?.ring === "progress" ? 200 : 0;
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={71} speed={0.2} />
      <StageTitle at={0} y={28}>
        Styling the page, one rule at a time
      </StageTitle>
      {cur && (
        <div key={cur.line} style={{ position: "absolute", left: 50, top: 130, opacity: progress(frame, start, 10) }}>
          <CodeCard file="style.css" lang="css" lines={cur.code} fontSize={27} width={760} chars={typedChars(cur.code, frame, start + 4, start + 40)} />
        </div>
      )}
      <div style={{ position: "absolute", left: 850, top: 130 }}>
        <GameBrowser width={1020} height={760} zoom={0.62} scrollY={interpolate(frame, [c.line("l6") - 10, c.line("l6") + 10], [0, scroll], { ...CLAMP, easing: EASE_IN_OUT })} state={EMPTY} rings={cur ? { [cur.ring]: pulse } : {}} />
      </div>
      {steps.map((s) => (
        <React.Fragment key={s.line}>
          <Sfx name="typing" at={c.line(s.line) - 2} dur={34} volume={0.8} />
          <Sfx name="tick" at={c.line(s.line) + 4} />
        </React.Fragment>
      ))}
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 3.8 SIGNATURE: building the number card, step by step. */
export const CardDesign: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("card");
  const L = (id: string) => c.line(id);
  const rect = progress(frame, L("k2"), 16);
  const round = progress(frame, L("k3"), 18);
  const border = progress(frame, L("k4"), 18);
  const circle = progress(frame, L("k5"), 22);
  const circleRound = progress(frame, c.word("k5", "fifty"), 22);
  const red = progress(frame, L("k6"), 14);
  const num = pop(frame, fps, L("k7"), 12);
  const big = progress(frame, L("k8"), 18);
  const word = progress(frame, L("k9"), 16);
  const compare = progress(frame, L("k10"), 20, EASE_IN_OUT);
  const gridAt = L("k11");
  const grid = progress(frame, gridAt, 20, EASE_IN_OUT);
  const orbit = Math.sin(frame / 50) * 8 * (1 - compare);

  const W = 400;
  const H = W / 0.78;
  const cx = interpolate(compare, [0, 1], [1260, 1180]);
  const cardScale = 1 - grid * 0.6;
  const steps: { at: number; code: string[] }[] = [
    { at: L("k2"), code: [".card-front {", "  background-color: var(--white);", "}"] },
    { at: L("k3"), code: [".card-face {", "  border-radius: 19px;", "}"] },
    { at: L("k4"), code: [".card-front {", "  border: 5px solid var(--red);", "}"] },
    { at: L("k5"), code: [".number-circle {", "  width: min(72%, 112px);", "  aspect-ratio: 1;", "  border-radius: 50%;", "}"] },
    { at: L("k6"), code: [".number-circle {", "  background-color: var(--red);", "}"] },
    { at: L("k7"), code: [".number-circle {", "  display: grid;", "  place-items: center;", "}"] },
    { at: L("k8"), code: [".number-circle {", "  font-size: clamp(48px, 7vw, 82px);", "  font-weight: 700;", "}"] },
    { at: L("k9"), code: dedent(block(CSS, ".number-word {")) },
    { at: L("k11"), code: block(CSS, ".game-grid {") },
  ];
  const step = [...steps].reverse().find((s) => frame >= s.at - 4);

  return (
    <AbsoluteFill>
      <Backdrop count={14} seed={81} speed={0.25} />
      <StageTitle at={0} y={28}>
        Designing the number card
      </StageTitle>
      {step && compare < 0.5 && (
        <div key={step.at} style={{ position: "absolute", left: 60, top: 200, opacity: progress(frame, step.at - 4, 10) * (1 - compare * 2) }}>
          <CodeCard file="style.css" lang="css" lines={step.code} fontSize={30} width={800} chars={typedChars(step.code, frame, step.at, step.at + 26)} />
        </div>
      )}
      {step && grid > 0 && (
        <div style={{ position: "absolute", left: 60, top: 200, opacity: grid }}>
          <CodeCard file="style.css" lang="css" lines={block(CSS, ".game-grid {")} fontSize={30} width={800} />
        </div>
      )}
      {/* the card being built */}
      {frame >= L("k2") && grid < 1 && (
        <div style={{ position: "absolute", left: cx - W / 2, top: 520 - H / 2, width: W, height: H, transform: `perspective(1400px) rotateY(${orbit}deg) scale(${(0.6 + 0.4 * rect) * cardScale})`, opacity: rect * (1 - grid) }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: C.white,
              borderRadius: 31 * round,
              border: `${8 * border}px solid ${C.red}`,
              boxShadow: border > 0.5 ? `0 11px 0 ${C.cardFrontShadow}` : undefined,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: QUICKSAND,
              fontWeight: 700,
            }}
          >
            {frame >= L("k5") && (
              <div
                style={{
                  width: 288 * circle,
                  height: 288 * circle,
                  borderRadius: `${50 * circleRound}%`,
                  background: red > 0 ? C.red : "#dfe7e4",
                  outline: red > 0 ? undefined : `3px dashed ${C.muted}`,
                  display: num > 0 ? "grid" : "block",
                  placeItems: "center",
                  color: C.white,
                  fontSize: 120 + 70 * big,
                  lineHeight: 1,
                }}
              >
                {num > 0 && <span style={{ transform: `scale(${num})` }}>1</span>}
              </div>
            )}
            <div style={{ marginTop: 22, color: C.ink, fontSize: 56, opacity: word, transform: `translateY(${(1 - word) * 12}px)` }}>One</div>
          </div>
        </div>
      )}
      {/* compare with the original reference (fruit not used) */}
      {compare > 0 && grid < 1 && (
        <div style={{ position: "absolute", left: 1520, top: 520 - 230, opacity: compare * (1 - grid), transform: `translateX(${(1 - compare) * 200}px)` }}>
          <div style={{ position: "relative", width: 300, height: 460, borderRadius: 20, overflow: "hidden", background: C.white }}>
            <Img src={staticFile("references/number-card-reference.png")} style={{ width: 300, height: 460, objectFit: "contain" }} />
            <div style={{ position: "absolute", left: 60, top: 268, width: 180, height: 70, borderRadius: 12, background: C.ink, color: C.white, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 20, display: "grid", placeItems: "center" }}>no fruit</div>
          </div>
          <div style={{ marginTop: 14, textAlign: "center", color: C.mint, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28 }}>original design</div>
        </div>
      )}
      <Label at={L("k10") + 10} out={gridAt - 6} x={1180} y={860} anchor="center" size={32}>made with code</Label>
      {grid > 0 && (
        <div style={{ position: "absolute", left: 980, top: 160, display: "grid", gridTemplateColumns: "repeat(4, 190px)", gap: 15, opacity: grid }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => {
            const s = pop(frame, fps, gridAt + 6 + i * 4, 13);
            return (
              <div key={n} style={{ transform: `scale(${s})` }}>
                <NumberCard number={n} width={190} angle={180} variant="game" />
              </div>
            );
          })}
        </div>
      )}
      <Sparks x={cx} y={520} t={frame - L("k9") - 10} count={14} />
      {[L("k2"), L("k3"), L("k4"), L("k5"), L("k6"), L("k7"), L("k8"), L("k9")].map((f, i) => (
        <Sfx key={i} name={i % 2 ? "whoosh-short" : "pop"} at={f} volume={0.6} />
      ))}
      <Sfx name="match" at={L("k9") + 10} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Sfx key={i} name="pop" at={gridAt + 6 + i * 4} volume={0.35} />
      ))}
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 3.9 Transforms and transitions: how the flip works. */
export const Flip: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("flip");
  const L = (id: string) => c.line(id);
  const explode = interpolate(frame, [L("a2"), L("a2") + 20, L("a4") + 10, L("a4") + 30], [0, 1, 1, 0], { ...CLAMP, easing: EASE_IN_OUT });
  const spinDemo = frame >= L("a3") && frame < L("a4") ? 180 * EASE_FLIP(Math.min(1, Math.max(0, (frame - c.word("a3", "transform") - 10) / 24))) : 0;
  const flipOn = c.line("a5") + 30;
  const flipAngle = 180 * EASE_FLIP(Math.min(1, Math.max(0, (frame - flipOn) / 17)));
  const side = frame >= L("a6") && frame < L("a7");
  const matched = frame >= L("a7") + 20;
  const W = 330;
  const H = W / 0.78;
  const codeLines =
    frame < L("a4")
      ? [".memory-card.is-flipped .card-inner {", "  transform: rotateY(180deg);", "}"]
      : frame < L("a6")
        ? [".card-front {", "  transform: rotateY(180deg);", "}", ".card-face {", "  backface-visibility: hidden;", "}"]
        : frame < L("a7")
          ? [".card-inner {", "  transition: transform .55s", "    cubic-bezier(.2, .75, .25, 1);", "}"]
          : [".memory-card.is-matched .card-front {", "  border-color: var(--match);", "}"];
  const cycle = (frame - L("a6")) % 60;
  const snapAngle = cycle < 30 ? 0 : 180;
  const smoothAngle = 180 * EASE_FLIP(Math.min(1, cycle / 17)) * (cycle < 30 ? 1 : 1) - (cycle >= 30 ? 180 * EASE_FLIP(Math.min(1, (cycle - 30) / 17)) : 0);
  return (
    <AbsoluteFill>
      <Backdrop count={10} seed={91} speed={0.2} />
      <StageTitle at={0} y={28}>
        How a card flips
      </StageTitle>
      <div style={{ position: "absolute", left: 60, top: 150 }}>
        <CodeCard file="style.css" lang="css" lines={codeLines} fontSize={30} width={820} />
      </div>
      {!side && (
        <div style={{ position: "absolute", left: 1330 - W / 2, top: 540 - H / 2, width: W, height: H, perspective: 1600 }}>
          {explode > 0.02 ? (
            <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateY(${-35 * explode}deg)` }}>
              <div style={{ position: "absolute", inset: 0, transform: `translateZ(${-140 * explode}px)` }}>
                <NumberCard number={4} width={W} angle={0} variant="hero" />
              </div>
              <div style={{ position: "absolute", inset: 0, transform: `translateZ(${140 * explode}px) rotateY(${spinDemo}deg)` }}>
                <NumberCard number={4} width={W} angle={180} variant="hero" />
              </div>
            </div>
          ) : (
            <NumberCard number={4} width={W} angle={frame >= L("a5") ? flipAngle : 0} variant="hero" matched={matched} />
          )}
        </div>
      )}
      {side && (
        <div style={{ position: "absolute", left: 950, top: 230, display: "flex", gap: 90, fontFamily: QUICKSAND, fontWeight: 700, textAlign: "center" }}>
          {[
            ["no transition", snapAngle],
            ["with transition", smoothAngle],
          ].map(([label, angle]) => (
            <div key={label as string}>
              <NumberCard number={4} width={280} angle={angle as number} variant="hero" />
              <div style={{ marginTop: 26, color: label === "with transition" ? C.gold : C.mint, fontSize: 32 }}>{label}</div>
            </div>
          ))}
        </div>
      )}
      <Label at={L("a2") + 10} out={L("a4") + 20} x={1060} y={860} size={30} color={C.green}>back</Label>
      <Label at={L("a2") + 10} out={L("a4") + 20} x={1480} y={860} size={30} color={C.white}>front</Label>
      <Label at={c.word("a4", "backface")} out={L("a5")} x={1330} y={150} anchor="center" size={30}>backface-visibility: hidden</Label>
      <Label at={L("a5") + 16} out={L("a6")} x={1330} y={150} anchor="center" size={34} color={C.gold}>
        class="memory-card is-flipped"
      </Label>
      <Label at={L("a7") + 16} x={1330} y={150} anchor="center" size={34} color={C.match}>
        class="memory-card is-matched"
      </Label>
      <Sfx name="whoosh" at={L("a2")} volume={0.6} />
      <Sfx name="flip" at={c.word("a3", "transform") + 10} />
      <Sfx name="flip" at={flipOn} />
      <Sfx name="match" at={L("a7") + 20} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 3.10 Responsive design with a media query. */
export const Responsive: React.FC = () => {
  const frame = useCurrentFrame();
  const c = TL.cuesFor("responsive");
  const media = CSS.slice(CSS.findIndex((l) => l.startsWith("@media (max-width: 650px)")), CSS.findIndex((l) => l.startsWith("@media (max-width: 650px)")) + 60);
  const shown = [media[0], ...block(media, ".game-grid {"), ...block(media, ".card-front,").slice(0, 5), ...block(media, ".number-circle {"), "}"];
  const phone = progress(frame, c.line("p3"), 20);
  const sim = FINISHED;
  return (
    <AbsoluteFill>
      <Backdrop count={8} seed={101} speed={0.2} />
      <StageTitle at={0} y={28}>
        Responsive design
      </StageTitle>
      <div style={{ position: "absolute", left: 60, top: 140, opacity: progress(frame, c.line("p2") - 6, 12) }}>
        <CodeCard
          file="style.css"
          lang="css"
          lines={shown}
          fontSize={22}
          width={700}
          chars={typedChars(shown, frame, c.line("p2"), c.line("p2") + 60)}
          marks={[
            { from: 1, to: 1, at: c.word("p2", "max"), until: c.line("p3") },
            { from: 2, to: 5, at: c.line("p3"), until: c.line("p3") + 40 },
            { from: 6, to: 10, at: c.line("p3") + 40, until: c.line("p3") + 80 },
            { from: 11, to: 15, at: c.line("p3") + 80, until: c.line("p4") },
          ]}
        />
      </div>
      {/* desktop */}
      <div style={{ position: "absolute", left: 800, top: 160 }}>
        <GameBrowser width={720} height={600} zoom={0.38} scrollY={280} state={sim} url="computer" />
      </div>
      {/* phone */}
      <div style={{ position: "absolute", left: 1560, top: 150, width: 300, height: 620, borderRadius: 42, background: C.ink, padding: 14, boxSizing: "border-box", transform: `translateY(${(1 - Math.max(phone, progress(frame, 0, 20))) * 40}px)` }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 30, overflow: "hidden", background: C.page, position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: "scale(0.215)" }}>
            <div style={{ width: 1280 }}>
              <GamePage state={sim} />
            </div>
          </div>
          {phone > 0 && (
            <div style={{ position: "absolute", left: 8, right: 8, top: 120, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 * phone + 3 * (1 - phone), opacity: phone, background: C.page, padding: 6 }}>
              {sim.cards.map((cd, i) => (
                <NumberCard key={i} number={cd.number} width={60} angle={cd.angle} matched={cd.matched} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Label at={c.line("p1") + 10} x={1160} y={790} anchor="center" size={28} color={C.white}>computer</Label>
      <Label at={c.line("p1") + 16} x={1710} y={800} anchor="center" size={28} color={C.white}>phone</Label>
      <Label at={c.line("p4")} x={1340} y={880} anchor="center" size={38}>RESPONSIVE DESIGN</Label>
      <Sfx name="typing" at={c.line("p2")} dur={60} />
      <Sfx name="whoosh-short" at={c.line("p3")} />
      <Sfx name="pop-high" at={c.line("p4")} />
      <SceneFade duration={c.duration} />
    </AbsoluteFill>
  );
};

/** 3.11 Closing: one card, and it needs a brain. */
export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TL.cuesFor("outro");
  const brain = pop(frame, fps, c.word("o4", "brain"), 12);
  const cardIn = progress(frame, c.line("o3") - 6, 16);
  return (
    <AbsoluteFill>
      <Backdrop count={12} seed={111} speed={0.3} />
      <div style={{ position: "absolute", left: 310, top: 60, opacity: 1 - cardIn }}>
        <GameBrowser width={1300} height={820} zoom={0.62} scrollY={0} state={EMPTY} />
      </div>
      {cardIn > 0 && (
        <div style={{ position: "absolute", left: 960 - 160, top: 300, opacity: cardIn, transform: `scale(${0.7 + 0.3 * cardIn})` }}>
          <NumberCard number={1} width={320} angle={180} variant="hero" />
        </div>
      )}
      {frame >= c.word("o4", "brain") && (
        <svg width={220} height={220} viewBox="0 0 24 24" style={{ position: "absolute", left: 850, top: 70, transform: `scale(${brain})` }}>
          <path d="M9 21h6v-1H9zm3-19a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2Z" fill={C.gold} />
        </svg>
      )}
      <Label at={c.word("o4", "brain") + 6} x={960} y={300 + 420} anchor="center" size={36}>needs JavaScript</Label>
      <Sfx name="pop-high" at={c.word("o4", "brain")} />
      <EndCard at={c.line("o5")} next="Lesson 4 · JavaScript: Giving Our Game a Brain" nextColor={C.gold} />
      <Sfx name="sting" at={c.line("o5") + 4} />
      <AbsoluteFill style={{ background: "#000", opacity: map(frame, [c.duration - 16, c.duration], [0, 1]) }} />
    </AbsoluteFill>
  );
};
