import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, Marker, pop, progress, SceneFade } from "../../shared/anim";
import { C, QUICKSAND, SHADOW } from "../../shared/theme";
import { T6 } from "../timeline";
import { Camera, FilmFinish, Headline, Icon, LightSweep, LOOKS, Parallax, Person, V6, Sfx } from "../kit";

// ---------------- City at sunrise ----------------

/** Deterministic pseudo-random so building windows stay put. */
const hash = (n: number) => {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
};

const Skyline: React.FC<{ seed: number; color: string; base: number; minH: number; maxH: number; windows?: number; lightsOff?: number; width?: number }> = ({
  seed,
  color,
  base,
  minH,
  maxH,
  windows = 0,
  lightsOff = 0,
  width = 3200,
}) => {
  const buildings: React.ReactNode[] = [];
  let x = -100;
  let i = 0;
  while (x < width) {
    const w = 90 + hash(seed + i) * 130;
    const h = minH + hash(seed + i * 3.7) * (maxH - minH);
    const cols = Math.floor((w - 20) / 26);
    const rows = Math.floor((h - 30) / 34);
    buildings.push(
      <g key={i}>
        <rect x={x} y={base - h} width={w} height={h + 400} fill={color} />
        {hash(seed + i * 9) > 0.7 ? <rect x={x + w / 2 - 3} y={base - h - 40} width={6} height={40} fill={color} /> : null}
        {windows > 0
          ? Array.from({ length: rows * cols }).map((_, k) => {
              const r = Math.floor(k / cols);
              const c = k % cols;
              const lit = hash(seed * 7 + i * 31 + k) < windows && hash(seed + k * 1.3 + i) > lightsOff;
              return lit ? <rect key={k} x={x + 14 + c * 26} y={base - h + 20 + r * 34} width={12} height={18} rx={2} fill="#ffd89a" opacity={0.85} /> : null;
            })
          : null}
      </g>,
    );
    x += w + 8 + hash(seed + i * 5) * 20;
    i++;
  }
  return (
    <svg width={width} height={1300} style={{ position: "absolute", left: 0, top: 0 }}>
      {buildings}
    </svg>
  );
};

const Sunrise: React.FC<{ p: number }> = ({ p }) => {
  const sky = `linear-gradient(180deg, ${mixColor("#3b4e72", "#9fc9e3", p)} 0%, ${mixColor("#c98a8a", "#f7d9b8", p)} 55%, ${mixColor("#f3b27a", "#fdeedd", p)} 100%)`;
  return (
    <AbsoluteFill style={{ background: sky, inset: -300 }}>
      <div
        style={{
          position: "absolute",
          left: 1480,
          top: 1060 - p * 360,
          width: 260,
          height: 260,
          marginLeft: -130,
          borderRadius: "50%",
          background: "radial-gradient(circle, #fff6df 0%, #ffd79a 45%, rgba(255,200,130,0) 70%)",
          transform: "scale(2.2)",
        }}
      />
    </AbsoluteFill>
  );
};

const mixColor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * Math.min(1, Math.max(0, t)))).join(",")})`;
};

// ---------------- Floating product cards (front: product, back: its code) ----------------

const FlipCard: React.FC<{ at: number; flipAt: number; x: number; y: number; z: number; front: React.ReactNode; code: string[]; accent: string; w?: number; h?: number }> = ({
  at,
  flipAt,
  x,
  y,
  z,
  front,
  code,
  accent,
  w = 440,
  h = 210,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, 14);
  const flip = interpolate(frame, [flipAt, flipAt + 22], [0, 180], { ...CLAMP, easing: EASE_IN_OUT });
  const float = Math.sin((frame + z) / 28) * 8;
  const face: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: 28, backfaceVisibility: "hidden", overflow: "hidden", boxShadow: SHADOW };
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + float,
        width: w,
        height: h,
        transformStyle: "preserve-3d",
        transform: `translateZ(${z}px) scale(${0.6 + 0.4 * s}) rotateY(${flip}deg)`,
        opacity: Math.min(1, s * 1.5),
      }}
    >
      <div style={{ ...face, background: "rgba(255,253,248,0.96)" }}>{front}</div>
      <div style={{ ...face, background: "#1f2430", transform: "rotateY(180deg)", padding: "22px 26px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", gap: 7, marginBottom: 14 }}>
          {["#ee6a5f", "#f5bd4f", "#61c454"].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
          ))}
        </div>
        {code.map((line, i) => (
          <div key={i} style={{ fontFamily: V6.mono, fontSize: 19, lineHeight: 1.6, color: i === 0 ? accent : "#d7dbe4", whiteSpace: "pre" }}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

const NotificationFront: React.FC = () => (
  <div style={{ display: "flex", gap: 18, padding: 28, fontFamily: QUICKSAND }}>
    <div style={{ width: 70, height: 70, borderRadius: 20, background: "#1f3a5a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon name="bus" size={40} color={C.accent} />
    </div>
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: C.inkSoft, letterSpacing: 1 }}>CITY TRANSIT · NOW</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: C.ink, marginTop: 4 }}>Bus 42 arrives in 6 min</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: C.inkSoft, marginTop: 4 }}>Leave in 2 minutes to catch it.</div>
    </div>
  </div>
);

const MapFront: React.FC<{ draw: number }> = ({ draw }) => (
  <div style={{ position: "absolute", inset: 0, background: "#eaf0e4" }}>
    <svg width={440} height={210}>
      {[40, 110, 170].map((y) => (
        <rect key={y} x={0} y={y} width={440} height={12} fill="white" />
      ))}
      {[90, 230, 350].map((x) => (
        <rect key={x} x={x} y={0} width={12} height={210} fill="white" />
      ))}
      <path d="M40 176 H96 V116 H236 V46 H380" fill="none" stroke={C.css} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={600} strokeDashoffset={600 * (1 - draw)} />
      <circle cx={40} cy={176} r={10} fill={C.ink} />
      <circle cx={380} cy={46} r={12} fill={C.dino} opacity={draw > 0.95 ? 1 : 0} />
    </svg>
    <div style={{ position: "absolute", left: 18, bottom: 16, padding: "8px 14px", borderRadius: 12, background: "white", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 19, color: C.ink }}>
      School · 14 min · fastest route
    </div>
  </div>
);

const MusicFront: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, padding: 26, fontFamily: QUICKSAND }}>
      <div style={{ width: 100, height: 100, borderRadius: 22, background: "linear-gradient(135deg, #f08a4b, #6c5a8e)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name="music" size={50} color="white" />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.inkSoft, letterSpacing: 1 }}>MADE FOR YOU</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.ink }}>Morning Mix</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 40, marginTop: 8 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ width: 9, borderRadius: 4, background: C.dino, height: 8 + Math.abs(Math.sin(frame / 5 + i * 0.9)) * 30 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

// ---------------- Scene: cold open ----------------

export const OpenScene: React.FC = () => {
  const frame = useCurrentFrame();
  const q = T6.cuesFor("open");
  const phoneAt = q.word("o3", "phone");
  const mapAt = q.word("o3", "map");
  const songAt = q.word("o3", "song");
  const flipAt = q.word("o4", "planned");
  const sunrise = interpolate(frame, [0, q.line("o3")], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const lightsOff = interpolate(frame, [0, q.line("o3")], [0, 0.85], CLAMP);
  const focus = progress(frame, phoneAt - 20, 40, EASE_IN_OUT); // city blurs as we focus on Maya

  const tags = [
    { word: "planned", at: q.word("o4", "planned"), color: C.css },
    { word: "designed", at: q.word("o4", "designed"), color: C.dino },
    { word: "built", at: q.word("o4", "built"), color: C.good },
  ];

  return (
    <SceneFade duration={q.duration} fadeIn={0} fadeOut={14}>
      <Camera
        shots={[
          { f: 0, scale: 1.18, y: -60 },
          { f: q.line("o3") - 10, scale: 1.04, y: 0 },
          { f: q.line("o4"), scale: 1, x: 40 },
          { f: q.duration, scale: 1.06, x: 80 },
        ]}
      >
        <Sunrise p={sunrise} />
        <AbsoluteFill style={{ filter: `blur(${focus * 6}px)` }}>
          <Parallax depth={0.25}>
            <div style={{ position: "absolute", top: 0, left: 0, opacity: 0.55 }}>
              <Skyline seed={3} color={mixColor("#4b5a7a", "#a7b9cc", sunrise)} base={760} minH={180} maxH={420} />
            </div>
          </Parallax>
          <Parallax depth={0.6}>
            <div style={{ position: "absolute", top: 0, left: -200 }}>
              <Skyline seed={11} color={mixColor("#2f3b55", "#6e8098", sunrise)} base={880} minH={160} maxH={520} windows={0.35} lightsOff={lightsOff} />
            </div>
          </Parallax>
          <Parallax depth={1.1}>
            <div style={{ position: "absolute", top: 0, left: -300 }}>
              <Skyline seed={29} color={mixColor("#1e2638", "#3e4a5e", sunrise)} base={1020} minH={120} maxH={330} windows={0.25} lightsOff={lightsOff} />
            </div>
          </Parallax>
        </AbsoluteFill>
        <AbsoluteFill style={{ background: `rgba(253,246,236,${focus * 0.28})` }} />

        {/* Maya checks her phone as the morning starts */}
        <div style={{ position: "absolute", left: 120, top: 420 + (1 - focus) * 200, opacity: focus }}>
          <Person look={LOOKS.maya} arm="phone" scale={1.35} lookAt={0.6} />
        </div>

        <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d" }}>
          <FlipCard at={phoneAt} flipAt={flipAt} x={760} y={150} z={60} accent={C.html} front={<NotificationFront />} code={["notify(user, {", '  title: "Bus 42",', '  body: "arrives in 6 min"', "});"]} w={520} />
          <FlipCard
            at={mapAt}
            flipAt={flipAt + 8}
            x={1330}
            y={330}
            z={0}
            accent={C.css}
            front={<MapFront draw={progress(frame, mapAt + 6, 40, EASE_IN_OUT)} />}
            code={["route = fastest(", "  home, school,", "  traffic.now()", ");"]}
          />
          <FlipCard at={songAt} flipAt={flipAt + 16} x={820} y={560} z={120} accent={C.js} front={<MusicFront />} code={["playlist = pickFor(user,", '  mood: "morning"', ");", "play(playlist[0]);"]} w={480} h={180} />
        </div>
      </Camera>

      {/* planned · designed · built */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", justifyContent: "center", gap: 22 }}>
        {tags.map((t) => (
          <Appear key={t.word} at={t.at} kind="pop">
            <div style={{ padding: "12px 30px", borderRadius: 999, background: "rgba(255,253,248,0.92)", boxShadow: SHADOW, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 34, color: t.color }}>{t.word}</div>
          </Appear>
        ))}
      </div>

      <LightSweep at={flipAt - 4} dur={30} />
      <FilmFinish vignette={0.4} />

      <Sfx at={8} name="riser" volume={0.12} />
      <Sfx at={phoneAt} name="notify" volume={0.4} />
      <Sfx at={mapAt} name="swipe" volume={0.3} />
      <Sfx at={songAt} name="sparkle" volume={0.25} />
      <Sfx at={flipAt} name="whoosh" volume={0.3} />
      {tags.map((t) => (
        <Sfx key={t.word} at={t.at} name="pop" volume={0.25} />
      ))}
    </SceneFade>
  );
};

// ---------------- Scene: title ----------------

const DEPTH_ICONS = [
  { icon: "cart", x: 110, y: 150, z: -300, c: C.dino },
  { icon: "bus", x: 1690, y: 130, z: -200, c: C.css },
  { icon: "game", x: 1700, y: 580, z: -350, c: C.good },
  { icon: "globe", x: 90, y: 600, z: -250, c: V6.plum },
  { icon: "chart", x: 520, y: 40, z: -500, c: C.js },
  { icon: "music", x: 1480, y: 790, z: -450, c: C.html },
  { icon: "calendar", x: 1300, y: 30, z: -600, c: C.cactus },
  { icon: "chat", x: 330, y: 800, z: -550, c: C.css },
];

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = T6.cuesFor("title");
  const t1 = q.line("t1");
  const ideas = q.word("t2", "ideas");
  const products = q.word("t2", "products");
  return (
    <SceneFade duration={q.duration} fadeIn={10} fadeOut={14}>
      <Camera shots={[{ f: 0, scale: 1.08 }, { f: q.duration, scale: 1 }]} perspective={1400}>
        {DEPTH_ICONS.map((d, i) => {
          const s = pop(frame, fps, 4 + i * 3, 14);
          const drift = Math.sin((frame + i * 20) / 40) * 14;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: d.x,
                top: d.y + drift,
                width: 130,
                height: 130,
                borderRadius: 34,
                background: "white",
                boxShadow: SHADOW,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `translateZ(${d.z}px) scale(${s})`,
                filter: `blur(${Math.abs(d.z) / 160}px)`,
                opacity: 0.9,
              }}
            >
              <Icon name={d.icon} size={64} color={d.c} stroke={2.2} />
            </div>
          );
        })}
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <Appear at={2} kind="down">
            <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 26, letterSpacing: 8, color: C.inkSoft }}>PAISLEY TECH STUDIO · INTRODUCTION TO CODING & CREATIVE TECHNOLOGY</div>
          </Appear>
          <Headline text="Welcome to the" at={t1} size={118} style={{ marginTop: 34, textAlign: "center" }} />
          <Headline text="World of Coding" at={t1 + 12} size={136} color={C.dino} style={{ marginTop: 4, textAlign: "center" }} />
          <Appear at={ideas - 6} kind="up" style={{ marginTop: 26 }}>
            <div style={{ fontFamily: QUICKSAND, fontWeight: 600, fontSize: 56, color: C.inkSoft }}>
              From <Marker at={ideas}>Ideas</Marker> to <Marker at={products} color="#bfe3cf">Real Products</Marker>
            </div>
          </Appear>
        </AbsoluteFill>
      </Camera>
      <LightSweep at={t1 + 6} dur={34} />
      <FilmFinish vignette={0.18} grain={0.04} />
      <Sfx at={t1} name="impact" volume={0.35} />
      <Sfx at={t1 + 4} name="sparkle" volume={0.25} />
      <Sfx at={ideas} name="tick" volume={0.25} />
      <Sfx at={products} name="tick" volume={0.25} />
    </SceneFade>
  );
};
