import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Appear, CLAMP, EASE_IN_OUT, Kicker, pop, progress, SceneFade, Sfx, Strike } from "../../shared/anim";
import { C, HAND, QUICKSAND, SHADOW, SHADOW_SOFT } from "../../shared/theme";
import { T6 } from "../timeline";
import { DeliveryApp, FoodArt, SchoolPortal, ShopApp, TransportApp } from "../apps";
import { Camera, FilmFinish, Icon, LaptopFrame, LightSweep, LOOKS, Person, Phone, Tap, V6 } from "../kit";

const PHONE_SCALE = 0.9;

/** A small floating status card that pops out of the phone in 3D. */
const PopOut: React.FC<{ at: number; x: number; y: number; icon: string; color: string; title: string; body: string }> = ({ at, x, y, icon, color, title, body }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = pop(frame, fps, at, 13);
  if (frame < at) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + Math.sin((frame - at) / 18) * 6,
        width: 420,
        padding: "20px 24px",
        borderRadius: 24,
        background: "white",
        boxShadow: SHADOW,
        display: "flex",
        gap: 18,
        alignItems: "center",
        fontFamily: QUICKSAND,
        transform: `translateX(${(1 - s) * -120}px) scale(${0.7 + 0.3 * s})`,
        opacity: Math.min(1, s * 1.6),
      }}
    >
      <div style={{ width: 62, height: 62, borderRadius: 18, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon name={icon} size={34} color={color} stroke={2.4} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.ink }}>{title}</div>
        <div style={{ fontSize: 19, fontWeight: 600, color: C.inkSoft, marginTop: 2 }}>{body}</div>
      </div>
    </div>
  );
};

const CodeSlab: React.FC<{ at: number; lines: { t: string; c: string }[]; style?: React.CSSProperties }> = ({ at, lines, style }) => {
  const frame = useCurrentFrame();
  const p = progress(frame, at, 22, EASE_IN_OUT);
  return (
    <div
      style={{
        position: "absolute",
        padding: "28px 34px",
        borderRadius: 28,
        background: "#1f2430",
        boxShadow: SHADOW,
        opacity: p,
        ...style,
        transform: `${style?.transform ?? ""} translateX(${(1 - p) * 120}px)`,
      }}
    >
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: V6.mono, fontSize: 24, lineHeight: 1.75, color: l.c, whiteSpace: "pre", opacity: progress(frame, at + 8 + i * 5, 10) }}>
          {l.t}
        </div>
      ))}
    </div>
  );
};

/** Three dishes float on the right; the chosen one steps forward. */
const MenuHero: React.FC<{ showAt: number; pickAt: number; hideAt: number }> = ({ showAt, pickAt, hideAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = progress(frame, hideAt, 14, EASE_IN_OUT);
  const chosen = progress(frame, pickAt, 20, EASE_IN_OUT);
  if (frame < showAt || out >= 1) return null;
  const dishes = [
    { kind: "bowl" as const, label: "Green Bowl", price: "$10.90" },
    { kind: "pizza" as const, label: "Margherita Pizza", price: "$12.50" },
    { kind: "burger" as const, label: "Classic Burger", price: "$9.80" },
  ];
  return (
    <div style={{ position: "absolute", left: 900, top: 270, width: 900, height: 560, opacity: 1 - out }}>
      {dishes.map((d, i) => {
        const s = pop(frame, fps, showAt + i * 5, 13);
        const isPick = d.kind === "pizza";
        const x = (i - 1) * 290 * (1 - chosen * (isPick ? 1 : -0.15));
        const scale = (0.85 + 0.15 * s) * (isPick ? 1 + 0.45 * chosen : 1 - 0.25 * chosen);
        const bob = Math.sin((frame + i * 20) / 22) * 8;
        return (
          <div key={d.kind} style={{ position: "absolute", left: 450 - 130 + x, top: 120 + bob, width: 260, textAlign: "center", transform: `scale(${scale})`, opacity: Math.min(1, s * 1.5) * (isPick ? 1 : 1 - chosen * 0.75), zIndex: isPick ? 2 : 1 }}>
            <div style={{ width: 230, height: 230, margin: "0 auto", borderRadius: "50%", background: "white", boxShadow: SHADOW, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FoodArt kind={d.kind} size={180} spin={frame * 0.2} />
            </div>
            <div style={{ marginTop: 18, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, color: C.ink }}>{d.label}</div>
            <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 24, color: C.dino }}>{d.price}</div>
          </div>
        );
      })}
      {chosen > 0 ? (
        <div style={{ position: "absolute", left: 640, top: 70, opacity: chosen, transform: `scale(${pop(frame, fps, pickAt + 8)})` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 999, background: C.ink, color: "white", fontFamily: QUICKSAND, fontWeight: 700, fontSize: 24 }}>
            <Icon name="heart" size={24} color={C.dino} fill={C.dino} /> Favorite
          </div>
        </div>
      ) : null}
    </div>
  );
};

// ---------------- Scene: food delivery ----------------

export const DeliveryScene: React.FC = () => {
  const frame = useCurrentFrame();
  const q = T6.cuesFor("delivery");
  const openAt = q.word("d2", "open");
  const scrollAt = q.word("d3", "scroll");
  const pickAt = q.word("d3", "favorite");
  const orderAt = q.word("d3", "order");
  const kitchenAt = q.word("d4", "kitchen");
  const riderAt = q.word("d4", "rider");
  const mapAt = q.word("d4", "map");
  const codeAt = q.word("d5", "coded");
  const trackAt = riderAt - 8;
  const phoneIn = progress(frame, openAt - 12, 26, EASE_IN_OUT);
  const tilt = interpolate(frame, [q.line("d5"), q.line("d5") + 30], [0, 1], { ...CLAMP, easing: EASE_IN_OUT });
  const phoneX = 300;
  const phoneY = 60;
  const sx = (x: number) => phoneX + 14 * PHONE_SCALE + x * PHONE_SCALE;
  const sy = (y: number) => phoneY + 14 * PHONE_SCALE + y * PHONE_SCALE;

  const steps = [
    { label: "Browse", at: scrollAt, icon: "search" },
    { label: "Choose", at: pickAt, icon: "heart" },
    { label: "Order", at: orderAt, icon: "cart" },
    { label: "Track", at: trackAt, icon: "pin" },
  ];

  return (
    <SceneFade duration={q.duration}>
      <Kicker at={4} style={{ top: 60, left: 900, right: 0, textAlign: "left" }}>
        Real product · Food delivery
      </Kicker>
      <Camera
        shots={[
          { f: 0, scale: 1.12, x: -60 },
          { f: openAt + 20, scale: 1.05, x: -30 },
          { f: kitchenAt - 10, scale: 1, x: 0 },
          { f: q.line("d5"), scale: 1, x: 0 },
          { f: q.duration, scale: 0.96, x: 40 },
        ]}
      >
        {/* left: the user's intent written by hand */}
        <Appear at={q.line("d2")} kind="fade" out={openAt + 10} style={{ position: "absolute", left: 160, top: 360 }}>
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 92, color: C.dino, transform: "rotate(-4deg)" }}>I&apos;m hungry...</div>
        </Appear>

        <div style={{ position: "absolute", left: 0, top: 0, perspective: 1600, width: 1920, height: 1080 }}>
          <div
            style={{
              position: "absolute",
              left: phoneX,
              top: phoneY + (1 - phoneIn) * 700,
              transformOrigin: "top left",
              transform: `scale(${PHONE_SCALE}) rotateY(${tilt * 24}deg) rotateZ(${tilt * -2}deg)`,
              opacity: phoneIn,
            }}
          >
            <Phone glow={progress(frame, codeAt - 6, 12) * (1 - progress(frame, codeAt + 30, 30))}>
              <DeliveryApp cues={{ scrollAt, pickAt, orderAt, trackAt }} />
            </Phone>
          </div>
        </div>
        <Tap at={pickAt} x={sx(200)} y={sy(330)} />
        <Tap at={orderAt} x={sx(200)} y={sy(752)} />

        {/* right: the menu, then the choice */}
        <MenuHero showAt={openAt + 10} pickAt={pickAt} hideAt={kitchenAt - 8} />

        {/* right: journey stepper + kitchen and rider pop-outs */}
        <div style={{ position: "absolute", left: 900, top: 150, display: "flex", gap: 18, opacity: 1 - tilt }}>
          {steps.map((s, i) => {
            const on = frame >= s.at;
            return (
              <Appear key={s.label} at={openAt + 6 + i * 4} kind="up">
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 24px", borderRadius: 999, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 28, background: on ? C.ink : "white", color: on ? "white" : C.inkSoft, boxShadow: SHADOW_SOFT }}>
                  <Icon name={s.icon} size={26} color={on ? C.accent : C.inkSoft} stroke={2.4} />
                  {s.label}
                </div>
              </Appear>
            );
          })}
        </div>
        <div style={{ opacity: 1 - tilt }}>
          <PopOut at={kitchenAt} x={920} y={300} icon="bell" color={C.dino} title="Kitchen · New order #2048" body="1 × Margherita Pizza · Preparing" />
          <PopOut at={riderAt} x={1000} y={460} icon="bike" color={C.good} title="Rider assigned · Jordan" body="Picking up in 6 minutes" />
          <PopOut at={mapAt} x={920} y={620} icon="pin" color={C.css} title="Live map updates" body="Location refreshes every 2 seconds" />
        </div>

        {/* someone coded it: the code behind the product */}
        <CodeSlab
          at={q.line("d5") + 6}
          style={{ left: 900, top: 190, width: 860 }}
          lines={[
            { t: "<!-- HTML: what's on the screen -->", c: "#8b93a7" },
            { t: '<button class="order">Place order</button>', c: "#f6a66f" },
            { t: "/* CSS: how it looks */", c: "#8b93a7" },
            { t: ".order { background: #f08a4b; }", c: "#8fbaf3" },
            { t: "// JavaScript: what it does", c: "#8b93a7" },
            { t: "order.onclick = () => sendToKitchen(cart);", c: "#f7d36a" },
            { t: "rider.onMove(pos => map.update(pos));", c: "#f7d36a" },
          ]}
        />
        <Appear at={codeAt} kind="pop" style={{ position: "absolute", left: 1180, top: 700 }}>
          <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 78, color: C.dino, transform: "rotate(-3deg)" }}>Someone coded it!</div>
        </Appear>
      </Camera>
      <FilmFinish vignette={0.22} grain={0.035} />

      <Sfx at={openAt} name="swipe" volume={0.35} />
      <Sfx at={scrollAt} name="swipe" volume={0.25} />
      <Sfx at={pickAt} name="click" volume={0.45} />
      <Sfx at={orderAt} name="click" volume={0.5} />
      <Sfx at={orderAt + 8} name="chime" volume={0.35} />
      <Sfx at={kitchenAt} name="notify" volume={0.35} />
      <Sfx at={riderAt} name="pop" volume={0.3} />
      <Sfx at={mapAt} name="pop" volume={0.3} />
      <Sfx at={q.line("d5") + 6} name="whoosh" volume={0.3} />
      <Sfx at={codeAt} name="sparkle" volume={0.3} />
    </SceneFade>
  );
};

// ---------------- Scene: school portal ----------------

const Kitchen: React.FC = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #f3e6d3 0%, #efdcc4 62%, #c9a77f 62%, #b8946b 100%)" }}>
    {/* window with morning light */}
    <div style={{ position: "absolute", left: 1180, top: 110, width: 520, height: 420, borderRadius: 18, background: "linear-gradient(180deg, #bfe0f0, #e9f4f7)", border: "16px solid #fbf6ee", boxShadow: "inset 0 0 0 4px #e3d6c3" }}>
      <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 12, marginLeft: -6, background: "#fbf6ee" }} />
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 12, marginTop: -6, background: "#fbf6ee" }} />
    </div>
    <div style={{ position: "absolute", left: 1000, top: 0, width: 900, height: 1080, background: "linear-gradient(100deg, transparent 20%, rgba(255,240,210,0.35) 50%, transparent 80%)" }} />
    {/* shelf with plant */}
    <div style={{ position: "absolute", left: 200, top: 260, width: 360, height: 18, borderRadius: 6, background: "#a77e57" }} />
    <div style={{ position: "absolute", left: 260, top: 190, width: 70, height: 70, borderRadius: "10px 10px 20px 20px", background: "#d98c5f" }} />
    <div style={{ position: "absolute", left: 245, top: 120, width: 100, height: 90, borderRadius: "50%", background: "#5aa65a" }} />
    <div style={{ position: "absolute", left: 420, top: 200, width: 110, height: 60, borderRadius: 8, background: "#f6ead8", border: "4px solid #e2d3bd" }} />
  </AbsoluteFill>
);

export const SchoolScene: React.FC = () => {
  const frame = useCurrentFrame();
  const q = T6.cuesFor("school");
  const paperAt = q.word("s2", "paper");
  const openAt = q.word("s3", "open");
  const signInAt = q.word("s3", "securely");
  const dashAt = q.word("s3", "there");
  const gradesAt = q.word("s3", "subject");
  const messageAt = q.word("s3", "teacher");
  const lineAt = q.word("s4", "line");
  const zoom = progress(frame, openAt - 16, 30, EASE_IN_OUT); // push into the laptop screen
  const split = progress(frame, q.line("s4"), 26, EASE_IN_OUT);
  const laptopW = 1100;

  return (
    <SceneFade duration={q.duration}>
      {/* establishing shot: a parent at the kitchen table */}
      <AbsoluteFill style={{ opacity: 1 - zoom, transform: `scale(${1 + zoom * 0.6})`, transformOrigin: "50% 60%" }}>
        <Kitchen />
        <div style={{ position: "absolute", left: 640, top: 300 }}>
          <Person look={LOOKS.parent} arm="type" scale={1.3} lookAt={0.2} />
        </div>
        {/* table + laptop back */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 790, height: 300, background: "linear-gradient(#d8b98f, #c7a479)", boxShadow: "0 -6px 0 #b8946b" }} />
        <div style={{ position: "absolute", left: 640, top: 560, width: 480, height: 260, borderRadius: "16px 16px 4px 4px", background: "linear-gradient(135deg, #cfd3d9, #a9aeb6)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
          <div style={{ position: "absolute", left: "50%", top: "45%", width: 40, height: 40, marginLeft: -20, borderRadius: "50%", background: "rgba(255,255,255,0.45)" }} />
        </div>
        <div style={{ position: "absolute", left: 1300, top: 700, width: 110, height: 90, borderRadius: "0 0 22px 22px", background: "#fbf6ee", boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }} />
        {/* the old way: a paper report */}
        <Appear at={paperAt - 8} kind="drop" style={{ position: "absolute", left: 160, top: 470 }}>
          <div style={{ width: 300, padding: 26, background: "white", borderRadius: 8, boxShadow: SHADOW, transform: "rotate(-6deg)", fontFamily: QUICKSAND }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>
              <Strike at={paperAt + 10}>Paper report</Strike>
            </div>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ height: 10, borderRadius: 5, background: "#ece4d7", marginTop: 14, width: `${90 - i * 12}%` }} />
            ))}
            <div style={{ fontSize: 18, fontWeight: 600, color: C.inkSoft, marginTop: 16 }}>Arrives in 2 weeks...</div>
          </div>
        </Appear>
      </AbsoluteFill>

      {/* inside the screen: the portal */}
      {zoom > 0 ? (
        <AbsoluteFill style={{ opacity: zoom }}>
          <Camera
            shots={[
              { f: openAt, scale: 1.08, y: 40 },
              { f: dashAt, scale: 1, y: 0 },
              { f: gradesAt + 30, scale: 1.04, x: 20, y: 30 },
              { f: q.line("s4"), scale: 1, x: 0, y: 0 },
            ]}
          >
            <div style={{ position: "absolute", left: 390 - split * 330, top: 40, transform: `scale(${1 - split * 0.18})`, transformOrigin: "top left" }}>
              <LaptopFrame width={laptopW} address="portal.brookfield-academy.edu/reports">
                <SchoolPortal width={laptopW} height={laptopW * 0.625 - 44} cues={{ emailAt: openAt + 6, signInAt, dashAt, gradesAt, messageAt }} />
              </LaptopFrame>
            </div>
            <CodeSlab
              at={q.line("s4") + 4}
              style={{ left: 1100, top: 120, width: 700 }}
              lines={[
                { t: "<h1>Amara Johnson</h1>", c: "#f6a66f" },
                { t: '<table class="grades">', c: "#f6a66f" },
                { t: "  <tr>", c: "#f6a66f" },
                { t: "    <td>Science</td>", c: "#d7dbe4" },
                { t: "    <td>A</td>", c: "#d7dbe4" },
                { t: "  </tr>", c: "#f6a66f" },
                { t: "</table>", c: "#f6a66f" },
              ]}
            />
            <Appear at={lineAt} kind="pop" style={{ position: "absolute", left: 1180, top: 650 }}>
              <div style={{ fontFamily: HAND, fontWeight: 700, fontSize: 76, color: C.css, transform: "rotate(-3deg)" }}>...line by line.</div>
            </Appear>
          </Camera>
        </AbsoluteFill>
      ) : null}
      <LightSweep at={openAt - 10} dur={28} />
      <FilmFinish vignette={0.26} grain={0.04} />

      <Sfx at={paperAt - 8} name="thunk" volume={0.35} />
      <Sfx at={paperAt + 10} name="scribble" volume={0.35} />
      <Sfx at={openAt - 12} name="whoosh" volume={0.35} />
      <Sfx at={openAt + 6} name="typing" volume={0.25} />
      <Sfx at={signInAt} name="click" volume={0.45} />
      <Sfx at={dashAt} name="swipe" volume={0.3} />
      <Sfx at={gradesAt} name="levelup" volume={0.2} />
      <Sfx at={messageAt} name="notify" volume={0.35} />
      <Sfx at={q.line("s4") + 4} name="whoosh" volume={0.3} />
    </SceneFade>
  );
};

// ---------------- Scene: code is everywhere ----------------

const BURST = [
  { icon: "cart", c: C.dino }, { icon: "bus", c: C.css }, { icon: "music", c: V6.plum }, { icon: "globe", c: C.good },
  { icon: "chat", c: C.css }, { icon: "calendar", c: C.dino }, { icon: "heart", c: C.danger }, { icon: "game", c: C.good },
  { icon: "chart", c: C.js }, { icon: "pin", c: C.dino }, { icon: "star", c: C.accent }, { icon: "bell", c: V6.plum },
];

export const EverywhereScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = T6.cuesFor("everywhere");
  const burstAt = q.word("e1", "everywhere");
  const shopAt = q.line("e2");
  const cartAt = q.word("e2", "cart");
  const busLine = q.line("e3");
  const busAt = q.word("e3", "bus");
  const ideaAt = q.word("e4", "idea");
  const codeAt = q.word("e4", "code");
  const shopIn = progress(frame, shopAt - 10, 22, EASE_IN_OUT);
  const busIn = progress(frame, busLine - 10, 22, EASE_IN_OUT);
  const gather = progress(frame, shopAt - 14, 20, EASE_IN_OUT);
  const apart = progress(frame, q.line("e4") - 8, 26, EASE_IN_OUT); // phones step aside for the idea → code → product row

  return (
    <SceneFade duration={q.duration}>
      <Camera
        shots={[
          { f: 0, scale: 1.05 },
          { f: shopAt, scale: 1, x: -80 },
          { f: busLine + 10, scale: 1, x: 80 },
          { f: q.line("e4"), scale: 0.98, x: 0 },
          { f: q.duration, scale: 1.02, x: 0 },
        ]}
        perspective={1600}
      >
        {/* icons burst outward in depth, then settle into a soft backdrop */}
        {BURST.map((b, i) => {
          const angle = (i / BURST.length) * Math.PI * 2;
          const s = pop(frame, fps, burstAt - 6 + i * 2, 13);
          const r = 260 + s * (340 + (i % 3) * 90);
          const x = 960 + Math.cos(angle) * r * 1.4 - 55;
          const y = 470 + Math.sin(angle) * r * 0.75 - 55;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y + Math.sin((frame + i * 13) / 26) * 10,
                width: 110,
                height: 110,
                borderRadius: 30,
                background: "white",
                boxShadow: SHADOW_SOFT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: Math.min(1, s * 1.5) * (1 - gather * 0.65),
                transform: `scale(${s * (1 - gather * 0.3)}) translateZ(${-(i % 4) * 120}px)`,
                filter: `blur(${gather * 3}px)`,
              }}
            >
              <Icon name={b.icon} size={54} color={b.c} stroke={2.2} />
            </div>
          );
        })}
        <Appear at={q.line("e1")} kind="up" out={shopAt - 10} style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center" }}>
          <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 92, color: C.ink }}>Code is everywhere.</div>
        </Appear>

        {/* the store */}
        <div style={{ position: "absolute", left: 360 - apart * 300, top: 70 + (1 - shopIn) * 600, opacity: shopIn * (1 - apart * 0.35), transform: `scale(${PHONE_SCALE * (1 - apart * 0.12)}) rotate(${-4 - apart * 4}deg)`, transformOrigin: "top left" }}>
          <Phone>
            <ShopApp addAt={cartAt} />
          </Phone>
        </div>
        <Tap at={cartAt} x={360 + 14 * 0.9 + 200 * 0.9} y={70 + (14 + 752) * 0.9 - 40} />

        {/* the bus */}
        <div style={{ position: "absolute", left: 1150 + apart * 330, top: 90 + (1 - busIn) * 600, opacity: busIn * (1 - apart * 0.35), transform: `scale(${PHONE_SCALE * (1 - apart * 0.12)}) rotate(${4 + apart * 4}deg)`, transformOrigin: "top left" }}>
          <Phone>
            <TransportApp at={busAt - 10} />
          </Phone>
        </div>

        {/* idea -> code -> product */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 440, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
          {[
            { label: "Idea", icon: "bulb", at: ideaAt, color: C.accent },
            { label: "Code", icon: "chat", at: codeAt, color: C.css },
            { label: "Product", icon: "star", at: codeAt + 14, color: C.good },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 ? (
                <Appear at={s.at - 4} kind="fade">
                  <div style={{ fontFamily: QUICKSAND, fontWeight: 700, fontSize: 40, color: C.inkSoft }}>→</div>
                </Appear>
              ) : null}
              <Appear at={s.at} kind="pop">
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 30px", borderRadius: 999, background: "white", boxShadow: SHADOW, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 36, color: C.ink }}>
                  <Icon name={s.icon} size={34} color={s.color} stroke={2.4} />
                  {s.label}
                </div>
              </Appear>
            </React.Fragment>
          ))}
        </div>
      </Camera>
      <FilmFinish vignette={0.2} grain={0.035} />

      <Sfx at={burstAt - 6} name="whoosh" volume={0.35} />
      {[0, 3, 6, 9].map((i) => (
        <Sfx key={i} at={burstAt - 6 + i * 2} name="pop" volume={0.18} />
      ))}
      <Sfx at={shopAt - 10} name="swipe" volume={0.3} />
      <Sfx at={cartAt} name="click" volume={0.45} />
      <Sfx at={cartAt + 4} name="pop" volume={0.3} />
      <Sfx at={busLine - 10} name="swipe" volume={0.3} />
      <Sfx at={busAt} name="notify" volume={0.3} />
      <Sfx at={ideaAt} name="pop" volume={0.3} />
      <Sfx at={codeAt} name="pop" volume={0.3} />
      <Sfx at={codeAt + 14} name="chime" volume={0.3} />
    </SceneFade>
  );
};
