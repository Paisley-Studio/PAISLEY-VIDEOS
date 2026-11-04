import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, EASE_IN_OUT, EASE_OUT, pop, progress } from "../shared/anim";
import { C, QUICKSAND, SHADOW_SOFT } from "../shared/theme";
import { Icon, pressScale, StatusBar, V6 } from "./kit";

// Believable product interfaces, each driven by frame cues passed in from the scene.

// ---------------- Food artwork (no photos needed) ----------------

export const FoodArt: React.FC<{ kind: "pizza" | "bowl" | "burger" | "salad"; size: number; spin?: number }> = ({ kind, size, spin = 0 }) => {
  if (kind === "pizza") {
    return (
      <div style={{ width: size, height: size, borderRadius: "50%", background: "radial-gradient(circle at 45% 40%, #f6c26b, #e3a043 70%, #c97c2c 72%, #d98c38)", position: "relative", transform: `rotate(${spin}deg)`, boxShadow: "0 8px 18px rgba(80,40,10,0.25)" }}>
        <div style={{ position: "absolute", inset: size * 0.09, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, #e2553b, #c43d2a)" }} />
        {[
          [0.3, 0.3], [0.62, 0.28], [0.45, 0.55], [0.25, 0.6], [0.66, 0.62], [0.5, 0.78],
        ].map(([x, y], i) => (
          <div key={i} style={{ position: "absolute", left: size * x, top: size * y, width: size * 0.16, height: size * 0.13, borderRadius: "45%", background: "#fff4dc" }} />
        ))}
        {[
          [0.4, 0.4], [0.58, 0.45], [0.36, 0.72], [0.7, 0.4],
        ].map(([x, y], i) => (
          <div key={i} style={{ position: "absolute", left: size * x, top: size * y, width: size * 0.08, height: size * 0.05, borderRadius: "50% 0", background: "#3a8a4a", transform: `rotate(${i * 50}deg)` }} />
        ))}
      </div>
    );
  }
  if (kind === "bowl") {
    return (
      <div style={{ width: size, height: size, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: size * 0.18, height: size * 0.5, borderRadius: "50%", background: "radial-gradient(circle at 50% 40%, #f4e4c4, #e8cfa0)" }} />
        {[["#f08a4b", 0.22, 0.24], ["#3a9d6a", 0.48, 0.2], ["#d64545", 0.36, 0.36], ["#f2b705", 0.6, 0.34]].map(([c, x, y], i) => (
          <div key={i} style={{ position: "absolute", left: size * (x as number), top: size * (y as number), width: size * 0.2, height: size * 0.14, borderRadius: "50%", background: c as string }} />
        ))}
        <div style={{ position: "absolute", left: size * 0.04, right: size * 0.04, top: size * 0.42, height: size * 0.44, borderRadius: `0 0 ${size}px ${size}px`, background: "linear-gradient(#2a9d8f, #1f776c)" }} />
      </div>
    );
  }
  if (kind === "burger") {
    return (
      <div style={{ width: size, height: size, position: "relative" }}>
        <div style={{ position: "absolute", left: "8%", right: "8%", top: "16%", height: "32%", borderRadius: `${size}px ${size}px 10px 10px`, background: "linear-gradient(#f2b45c, #d98c38)" }} />
        <div style={{ position: "absolute", left: "4%", right: "4%", top: "46%", height: "8%", borderRadius: 8, background: "#3a9d6a" }} />
        <div style={{ position: "absolute", left: "6%", right: "6%", top: "52%", height: "14%", borderRadius: 10, background: "#6b3a22" }} />
        <div style={{ position: "absolute", left: "5%", right: "5%", top: "64%", height: "6%", borderRadius: 6, background: "#f2b705" }} />
        <div style={{ position: "absolute", left: "8%", right: "8%", top: "70%", height: "14%", borderRadius: "8px 8px 18px 18px", background: "#e3a043" }} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "radial-gradient(circle, #fffdf6, #efe6d6)", position: "relative" }}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{ position: "absolute", left: size * (0.25 + 0.08 * (i % 4)), top: size * (0.25 + 0.1 * Math.floor(i / 2)), width: size * 0.26, height: size * 0.16, borderRadius: "50% 0", background: i % 3 === 0 ? "#d64545" : "#5aa65a", transform: `rotate(${i * 37}deg)` }} />
      ))}
    </div>
  );
};

const foodBg: Record<string, string> = { pizza: "#fde3c8", bowl: "#d9efe9", burger: "#fbe6c2", salad: "#e3f0d8" };

// ---------------- Food delivery app ----------------

export type DeliveryCues = { scrollAt: number; pickAt: number; orderAt: number; trackAt: number; codeAt?: number };

const RESTAURANTS = [
  { name: "Luca's Wood-Fired Pizza", kind: "pizza" as const, rating: "4.9", time: "15–20 min", tag: "Popular" },
  { name: "Green Bowl Kitchen", kind: "bowl" as const, rating: "4.7", time: "20–25 min", tag: "Healthy" },
  { name: "Brooklyn Burger Co.", kind: "burger" as const, rating: "4.8", time: "10–15 min", tag: "Fast" },
  { name: "Garden Table", kind: "salad" as const, rating: "4.6", time: "15–25 min", tag: "New" },
];

/** Route the rider follows on the tracking map (screen coordinates inside the phone). */
const ROUTE: [number, number][] = [[60, 120], [160, 120], [160, 250], [300, 250], [300, 380], [340, 380]];
const pointOnRoute = (t: number): [number, number] => {
  const segs = ROUTE.slice(1).map((p, i) => Math.hypot(p[0] - ROUTE[i][0], p[1] - ROUTE[i][1]));
  const total = segs.reduce((a, b) => a + b, 0);
  let d = t * total;
  for (let i = 0; i < segs.length; i++) {
    if (d <= segs[i]) {
      const k = d / segs[i];
      return [ROUTE[i][0] + (ROUTE[i + 1][0] - ROUTE[i][0]) * k, ROUTE[i][1] + (ROUTE[i + 1][1] - ROUTE[i][1]) * k];
    }
    d -= segs[i];
  }
  return ROUTE[ROUTE.length - 1];
};

export const DeliveryApp: React.FC<{ cues: DeliveryCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // scroll down the list, then back up to the first restaurant just before it's chosen
  const scroll = 300 * progress(frame, cues.scrollAt, 34, EASE_IN_OUT) - 300 * progress(frame, cues.pickAt - 14, 10, EASE_IN_OUT);
  const sheet = progress(frame, cues.pickAt, 18);
  const confirm = pop(frame, fps, cues.orderAt + 8, 13);
  const tracking = progress(frame, cues.trackAt, 20);
  const rider = interpolate(frame, [cues.trackAt + 10, cues.trackAt + 200], [0, 0.82], { ...CLAMP, easing: EASE_IN_OUT });
  const [rx, ry] = pointOnRoute(rider);
  const eta = Math.max(4, Math.round(12 - rider * 9));
  const steps = ["Order received", "Kitchen is preparing", "Rider on the way"];
  const stepOn = (i: number) => frame >= cues.trackAt + 14 + i * 22;

  return (
    <AbsoluteFill style={{ fontFamily: QUICKSAND, color: C.ink }}>
      {/* --- home --- */}
      <AbsoluteFill style={{ background: V6.appBg }}>
        <StatusBar />
        <div style={{ padding: "6px 26px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 600, color: C.inkSoft }}>
            <Icon name="pin" size={16} color={C.dino} /> Deliver to · <b style={{ color: C.ink }}>Home</b>
          </div>
          <div style={{ fontSize: 31, fontWeight: 700, marginTop: 8, letterSpacing: -0.5 }}>Hungry, Maya?</div>
          <div style={{ marginTop: 14, height: 48, borderRadius: 16, background: "white", boxShadow: "0 4px 12px rgba(80,55,25,0.08)", display: "flex", alignItems: "center", gap: 10, padding: "0 16px", color: C.inkSoft, fontSize: 16, fontWeight: 600 }}>
            <Icon name="search" size={20} color={C.inkSoft} /> Search dishes or restaurants
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {["Pizza", "Bowls", "Burgers", "Salads"].map((c, i) => (
              <div key={c} style={{ padding: "8px 15px", borderRadius: 999, fontSize: 15, fontWeight: 700, background: i === 0 ? C.ink : "white", color: i === 0 ? "white" : C.ink, boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                {c}
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "absolute", top: 270, left: 0, right: 0, bottom: 74, overflow: "hidden" }}>
          <div style={{ padding: "0 26px", transform: `translateY(${-scroll}px)` }}>
            {RESTAURANTS.concat(RESTAURANTS.slice(0, 2)).map((r, i) => (
              <div key={i} style={{ marginBottom: 16, borderRadius: 22, background: "white", boxShadow: "0 6px 16px rgba(80,55,25,0.08)", overflow: "hidden", transform: i === 0 ? `scale(${pressScale(frame, cues.pickAt)})` : undefined }}>
                <div style={{ height: 112, background: foodBg[r.kind], display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <FoodArt kind={r.kind} size={96} spin={frame * 0.15} />
                  <div style={{ position: "absolute", left: 12, top: 12, padding: "4px 10px", borderRadius: 999, background: "white", fontSize: 12, fontWeight: 700 }}>{r.tag}</div>
                </div>
                <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.inkSoft, marginTop: 2 }}>{r.time} · Free delivery</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 15, fontWeight: 700 }}>
                    <Icon name="star" size={16} color={C.accent} fill={C.accent} /> {r.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <TabBar active={0} />
      </AbsoluteFill>

      {/* --- meal sheet --- */}
      {sheet > 0 ? (
        <AbsoluteFill style={{ background: `rgba(20,15,10,${0.35 * sheet})` }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 640, borderRadius: "34px 34px 0 0", background: "white", transform: `translateY(${(1 - sheet) * 660}px)`, padding: "18px 26px", boxSizing: "border-box" }}>
            <div style={{ width: 48, height: 5, borderRadius: 3, background: "#ddd3c4", margin: "0 auto 14px" }} />
            <div style={{ height: 210, borderRadius: 24, background: foodBg.pizza, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FoodArt kind="pizza" size={180} spin={frame * 0.25} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 18 }}>Margherita Pizza</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.inkSoft, marginTop: 4, lineHeight: 1.4 }}>Tomato, fresh mozzarella and basil on a crispy wood-fired base.</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
              <div style={{ fontSize: 26, fontWeight: 700 }}>$12.50</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 20, fontWeight: 700 }}>
                <span style={{ width: 36, height: 36, borderRadius: 12, background: "#f3ece1", display: "flex", alignItems: "center", justifyContent: "center" }}>–</span>1
                <span style={{ width: 36, height: 36, borderRadius: 12, background: "#f3ece1", display: "flex", alignItems: "center", justifyContent: "center" }}>+</span>
              </div>
            </div>
            <div style={{ marginTop: 22, height: 62, borderRadius: 20, background: C.dino, color: "white", fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pressScale(frame, cues.orderAt)})`, boxShadow: "0 10px 20px rgba(240,138,75,0.35)" }}>
              Place order · $14.50
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* --- confirmation --- */}
      {confirm > 0 && tracking < 1 ? (
        <AbsoluteFill style={{ background: "white", opacity: Math.min(1, confirm * 2) * (1 - tracking), display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ width: 130, height: 130, borderRadius: "50%", background: C.good, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${confirm})` }}>
            <Icon name="check" size={80} color="white" stroke={3} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, marginTop: 26 }}>Order placed!</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.inkSoft, marginTop: 6 }}>Order #2048 · Luca&apos;s Wood-Fired Pizza</div>
        </AbsoluteFill>
      ) : null}

      {/* --- live tracking --- */}
      {tracking > 0 ? (
        <AbsoluteFill style={{ opacity: tracking, background: "#eef0e8" }}>
          <svg width={400} height={560} style={{ position: "absolute", top: 0 }}>
            <rect width={400} height={560} fill="#e9eee3" />
            {[[0, 60, 400, 70], [0, 190, 400, 200], [0, 320, 400, 330], [110, 0, 120, 560], [240, 0, 250, 560]].map(([x1, y1, x2, y2], i) => (
              <rect key={i} x={x1} y={y1} width={Math.max(14, x2 - x1)} height={Math.max(14, y2 - y1)} fill="white" />
            ))}
            {[[20, 20, 80, 30], [140, 90, 90, 80], [270, 20, 110, 30], [20, 220, 80, 90], [270, 210, 110, 90], [140, 350, 90, 120], [20, 350, 80, 120]].map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx={10} fill={i % 3 === 0 ? "#cfe3c3" : "#dfe5d6"} />
            ))}
            <rect x={270} y={360} width={110} height={110} rx={12} fill="#cbe1f0" />
            <polyline points={ROUTE.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.ink} strokeOpacity={0.15} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={ROUTE.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.dino} strokeWidth={6} strokeDasharray="2 12" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={ROUTE[0][0]} cy={ROUTE[0][1]} r={12} fill={C.ink} />
            <g transform="translate(340 380)">
              <circle r={26} fill={C.good} opacity={0.18 + 0.1 * Math.sin(frame / 6)} />
              <circle r={14} fill={C.good} />
            </g>
          </svg>
          <div style={{ position: "absolute", left: rx - 26, top: ry - 26, width: 52, height: 52, borderRadius: "50%", background: "white", boxShadow: "0 6px 14px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="bike" size={30} color={C.dino} stroke={2.4} />
          </div>
          <StatusBar />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 330, background: "white", borderRadius: "30px 30px 0 0", padding: "22px 26px", boxSizing: "border-box", boxShadow: "0 -8px 24px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.inkSoft, letterSpacing: 1 }}>ARRIVING IN</div>
            <div style={{ fontSize: 40, fontWeight: 700 }}>{eta} min</div>
            <div style={{ marginTop: 12 }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, fontSize: 18, fontWeight: 700, color: stepOn(i) ? C.ink : "#c9bfb1" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: stepOn(i) ? C.good : "#efe9df", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${stepOn(i) ? pop(frame, fps, cues.trackAt + 14 + i * 22) : 1})` }}>
                    {stepOn(i) ? <Icon name="check" size={18} color="white" stroke={3} /> : null}
                  </div>
                  {s}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, padding: "12px 14px", borderRadius: 16, background: "#f7f2ea" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#8d5a3b", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700 }}>J</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Jordan · your rider</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.inkSoft }}>E-bike · 4.9 ★</div>
              </div>
              <Icon name="chat" size={24} color={C.ink} />
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const TabBar: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 74, background: "white", borderTop: "1px solid #eee5d8", display: "flex", justifyContent: "space-around", alignItems: "center", paddingBottom: 8 }}>
    {["home", "search", "cart", "user"].map((n, i) => (
      <Icon key={n} name={n} size={26} color={i === active ? C.dino : "#b9ae9f"} stroke={2.2} />
    ))}
  </div>
);

// ---------------- School portal (laptop screen) ----------------

export type PortalCues = { emailAt: number; signInAt: number; dashAt: number; gradesAt: number; messageAt: number };

const SUBJECTS = [
  { name: "Mathematics", grade: "A", score: 91, color: C.css },
  { name: "English", grade: "A–", score: 88, color: C.dino },
  { name: "Science", grade: "A", score: 94, color: C.good },
  { name: "Art & Design", grade: "B+", score: 84, color: V6.plum },
  { name: "Computing", grade: "A*", score: 97, color: C.js },
];

export const SchoolPortal: React.FC<{ cues: PortalCues; width: number; height: number }> = ({ cues, width, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const email = "a.johnson@familymail.com";
  const typed = Math.max(0, Math.min(email.length, Math.floor((frame - cues.emailAt) * 1.1)));
  const dots = Math.max(0, Math.min(10, Math.floor((frame - cues.emailAt - email.length / 1.1 - 4) * 0.8)));
  const dash = progress(frame, cues.dashAt, 16);
  const s = width / 1100;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{ width: 1100, height: height / s, transform: `scale(${s})`, transformOrigin: "top left", fontFamily: QUICKSAND, color: C.ink, position: "relative" }}>
        {/* login */}
        <AbsoluteFill style={{ background: "linear-gradient(135deg, #e8f1f7, #f7efe4)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - dash }}>
          <div style={{ width: 430, padding: "36px 40px", background: "white", borderRadius: 26, boxShadow: SHADOW_SOFT }}>
            <SchoolCrest />
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 16 }}>Parent Portal</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.inkSoft, marginTop: 4 }}>Brookfield Academy</div>
            <Field label="Email" value={email.slice(0, typed)} caret={typed < email.length && frame >= cues.emailAt} />
            <Field label="Password" value={"•".repeat(dots)} caret={typed >= email.length && dots < 10} />
            <div style={{ marginTop: 22, height: 54, borderRadius: 16, background: C.css, color: "white", fontSize: 19, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${pressScale(frame, cues.signInAt)})` }}>
              <Icon name="lock" size={20} color="white" /> Sign in securely
            </div>
          </div>
        </AbsoluteFill>
        {/* dashboard */}
        {dash > 0 ? (
          <AbsoluteFill style={{ opacity: dash, background: "#f8f5ef", display: "flex", flexDirection: "row" }}>
            <div style={{ width: 230, background: "#1f3a5a", color: "white", padding: "26px 22px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SchoolCrest size={38} />
                <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.1 }}>Brookfield<br />Academy</div>
              </div>
              {["Overview", "Reports", "Attendance", "Messages", "Calendar"].map((n, i) => (
                <div key={n} style={{ marginTop: i === 0 ? 34 : 8, padding: "11px 14px", borderRadius: 12, fontSize: 16, fontWeight: 700, background: i === 1 ? "rgba(255,255,255,0.16)" : "transparent", opacity: i === 1 ? 1 : 0.7 }}>
                  {n}
                </div>
              ))}
            </div>
            <div style={{ flex: 1, padding: "28px 36px", position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.inkSoft, letterSpacing: 1 }}>END OF TERM REPORT · TERM 2</div>
                  <div style={{ fontSize: 34, fontWeight: 700, marginTop: 4 }}>Amara Johnson</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: C.inkSoft }}>Grade 7 · Class 7B</div>
                </div>
                <AttendanceRing frame={frame} at={cues.gradesAt} />
              </div>
              <div style={{ marginTop: 20, background: "white", borderRadius: 20, padding: "8px 24px", boxShadow: "0 4px 14px rgba(80,55,25,0.06)" }}>
                {SUBJECTS.map((sub, i) => {
                  const at = cues.gradesAt + i * 9;
                  const fill = progress(frame, at, 26);
                  const g = pop(frame, fps, at + 14, 12);
                  return (
                    <div key={sub.name} style={{ display: "flex", alignItems: "center", gap: 18, height: 50, borderBottom: i < SUBJECTS.length - 1 ? "1px solid #f0e9de" : "none" }}>
                      <div style={{ width: 150, fontSize: 18, fontWeight: 700 }}>{sub.name}</div>
                      <div style={{ flex: 1, height: 12, borderRadius: 6, background: "#f1ebe1", overflow: "hidden" }}>
                        <div style={{ width: `${sub.score * fill}%`, height: "100%", borderRadius: 6, background: sub.color }} />
                      </div>
                      <div style={{ width: 44, fontSize: 16, fontWeight: 700, color: C.inkSoft, textAlign: "right" }}>{Math.round(sub.score * fill)}%</div>
                      <div style={{ width: 52, height: 36, borderRadius: 10, background: `${sub.color}22`, color: C.ink, fontSize: 19, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${g})` }}>
                        {sub.grade}
                      </div>
                    </div>
                  );
                })}
              </div>
              {frame >= cues.messageAt ? (
                <div style={{ marginTop: 16, display: "flex", gap: 16, alignItems: "flex-start", background: "#fff8e8", border: "2px solid #f6dfa5", borderRadius: 18, padding: "14px 18px", transform: `translateY(${(1 - progress(frame, cues.messageAt, 14)) * 30}px)`, opacity: progress(frame, cues.messageAt, 10) }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#c68b62", color: "white", fontWeight: 700, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>MR</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>Ms. Rivera · Class teacher</div>
                    <div style={{ fontSize: 17, fontWeight: 600, color: "#4e473f", marginTop: 3, lineHeight: 1.35 }}>Amara has made brilliant progress this term, especially in Science and Computing. Keep it up!</div>
                  </div>
                </div>
              ) : null}
            </div>
          </AbsoluteFill>
        ) : null}
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; value: string; caret: boolean }> = ({ label, value, caret }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.inkSoft, marginBottom: 6 }}>{label}</div>
      <div style={{ height: 48, borderRadius: 14, border: `2px solid ${caret ? C.css : "#e6ddcf"}`, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 18, fontWeight: 600 }}>
        {value}
        {caret && Math.floor(frame / 8) % 2 === 0 ? <span style={{ width: 2, height: 22, background: C.css, marginLeft: 1 }} /> : null}
      </div>
    </div>
  );
};

export const SchoolCrest: React.FC<{ size?: number }> = ({ size = 58 }) => (
  <svg width={size} height={size} viewBox="0 0 60 60">
    <path d="M30 4 L54 12 V30 C54 44 43 52 30 57 C17 52 6 44 6 30 V12 Z" fill="#1f3a5a" stroke="#f2b705" strokeWidth={3} />
    <path d="M18 26 L30 20 L42 26 L30 32 Z" fill="#f2b705" />
    <path d="M23 30 V37 C27 40 33 40 37 37 V30" fill="none" stroke="white" strokeWidth={3} />
  </svg>
);

const AttendanceRing: React.FC<{ frame: number; at: number }> = ({ frame, at }) => {
  const p = progress(frame, at, 40);
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={84} height={84} viewBox="0 0 84 84">
        <circle cx={42} cy={42} r={r} stroke="#ece4d7" strokeWidth={9} fill="none" />
        <circle cx={42} cy={42} r={r} stroke={C.good} strokeWidth={9} fill="none" strokeDasharray={`${c * 0.98 * p} ${c}`} strokeLinecap="round" transform="rotate(-90 42 42)" />
        <text x={42} y={48} textAnchor="middle" fontFamily={QUICKSAND} fontWeight={700} fontSize={18} fill={C.ink}>
          {Math.round(98 * p)}%
        </text>
      </svg>
      <div style={{ fontSize: 15, fontWeight: 700, color: C.inkSoft }}>Attendance</div>
    </div>
  );
};

// ---------------- Online store ----------------

export const Sneaker: React.FC<{ size: number; color?: string }> = ({ size, color = C.css }) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 200 110">
    <path d="M10 70 Q12 40 40 38 L70 30 Q90 50 120 52 Q170 56 188 76 L190 88 H10 Z" fill={color} />
    <path d="M70 30 Q78 20 92 26 L100 48 Q86 48 70 30 Z" fill="white" opacity={0.8} />
    <path d="M8 86 H192 V96 Q100 104 8 96 Z" fill="#f5efe4" stroke="#d8cfc2" strokeWidth={2} />
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M${80 + i * 12} ${40 + i * 3} L${92 + i * 12} ${52 + i * 2}`} stroke="white" strokeWidth={4} strokeLinecap="round" />
    ))}
    <path d="M120 60 Q150 62 172 74" stroke="white" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
  </svg>
);

export const ShopApp: React.FC<{ addAt: number }> = ({ addAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const added = frame >= addAt;
  const badge = pop(frame, fps, addAt + 4, 9);
  const fly = progress(frame, addAt, 16, EASE_IN_OUT);
  return (
    <AbsoluteFill style={{ fontFamily: QUICKSAND, color: C.ink, background: "#f6f3ee" }}>
      <StatusBar time="4:15" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 26px" }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>stride.</div>
        <div style={{ position: "relative" }}>
          <Icon name="cart" size={30} />
          {added ? (
            <div style={{ position: "absolute", right: -8, top: -8, width: 22, height: 22, borderRadius: "50%", background: C.dino, color: "white", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${badge})` }}>1</div>
          ) : null}
        </div>
      </div>
      <div style={{ margin: "14px 22px 0", height: 330, borderRadius: 28, background: "linear-gradient(160deg, #e3eefb, #cfe0f6)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ transform: `rotate(${-8 + Math.sin(frame / 30) * 3}deg) translateY(${Math.sin(frame / 20) * 6}px)` }}>
          <Sneaker size={300} />
        </div>
        {fly > 0 && fly < 1 ? (
          <div style={{ position: "absolute", left: 150 + fly * 170, top: 140 - fly * 210, transform: `scale(${1 - fly * 0.85})`, opacity: 1 - fly * 0.5 }}>
            <Sneaker size={120} />
          </div>
        ) : null}
      </div>
      <div style={{ padding: "18px 26px" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.inkSoft, letterSpacing: 1 }}>RUNNING · NEW IN</div>
        <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>Cloudstep Runner</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.css, marginTop: 4 }}>$89.00</div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {[6, 7, 8, 9, 10].map((sz) => (
            <div key={sz} style={{ width: 52, height: 44, borderRadius: 12, border: `2px solid ${sz === 8 ? C.ink : "#e2d9cb"}`, background: sz === 8 ? C.ink : "white", color: sz === 8 ? "white" : C.ink, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {sz}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 22, height: 60, borderRadius: 18, background: added ? C.good : C.ink, color: "white", fontSize: 19, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transform: `scale(${pressScale(frame, addAt)})` }}>
          {added ? <Icon name="check" size={22} color="white" stroke={3} /> : <Icon name="cart" size={22} color="white" />}
          {added ? "Added to cart" : "Add to cart"}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- Transport app ----------------

export const TransportApp: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const busP = interpolate(frame, [at, at + 150], [0.08, 0.62], { ...CLAMP, easing: EASE_OUT });
  const mins = Math.max(1, Math.round(3 - busP * 2.4));
  const stops = ["Riverside", "Market St", "Library", "Oak Avenue", "Your stop: Park Rd"];
  return (
    <AbsoluteFill style={{ fontFamily: QUICKSAND, color: "white", background: "linear-gradient(180deg, #1f3a5a, #284b70)" }}>
      <StatusBar dark time="7:58" />
      <div style={{ padding: "8px 26px" }}>
        <div style={{ fontSize: 15, fontWeight: 700, opacity: 0.75, letterSpacing: 1 }}>NEXT BUS · PARK RD</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
          <div style={{ padding: "8px 16px", borderRadius: 14, background: C.accent, color: C.ink, fontSize: 26, fontWeight: 700 }}>42</div>
          <div>
            <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1 }}>{mins} min</div>
            <div style={{ fontSize: 15, fontWeight: 600, opacity: 0.75 }}>On time · to City School</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 52, top: 250, bottom: 70, width: 6, borderRadius: 3, background: "rgba(255,255,255,0.18)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: `${busP * 100}%`, borderRadius: 3, background: C.accent }} />
        <div style={{ position: "absolute", left: -21, top: `calc(${busP * 100}% - 24px)`, width: 48, height: 48, borderRadius: 16, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 8px rgba(255,183,3,0.2)" }}>
          <Icon name="bus" size={28} color={C.ink} />
        </div>
      </div>
      {stops.map((s, i) => {
        const y = 250 + (i / (stops.length - 1)) * 500;
        const passed = busP > i / (stops.length - 1);
        const last = i === stops.length - 1;
        return (
          <div key={s} style={{ position: "absolute", left: 100, top: y - 14, fontSize: last ? 21 : 18, fontWeight: 700, opacity: passed ? 0.45 : 1, color: last ? C.accent : "white" }}>
            {s}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------- The meal card built with HTML → CSS → JS ----------------

export type CardStage = {
  parts: number; // 0..5 html elements present (div, h2, img, p, button)
  style: number; // 0..1 how much CSS is applied
  count: number; // cart count (JavaScript)
  pressAt?: number;
  live?: boolean;
};

export const MealCard: React.FC<{ s: CardStage }> = ({ s }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = s.style;
  const mix = (a: number, b: number) => a + (b - a) * k;
  const badgePop = s.pressAt !== undefined ? pop(frame, fps, s.pressAt + 3, 9) : 1;
  return (
    <div style={{ width: 520, position: "relative" }}>
      {s.live ? (
        <div style={{ position: "absolute", right: -30, top: -34, display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 999, background: "white", boxShadow: SHADOW_SOFT, fontFamily: QUICKSAND, fontWeight: 700, fontSize: 22, zIndex: 3 }}>
          <Icon name="cart" size={26} />
          <span style={{ display: "inline-block", minWidth: 30, height: 30, borderRadius: 15, background: C.dino, color: "white", textAlign: "center", lineHeight: "30px", transform: `scale(${s.count > 0 ? 0.6 + 0.4 * badgePop : 1})` }}>{s.count}</span>
        </div>
      ) : null}
      <div
        style={{
          padding: mix(8, 30),
          background: k > 0 ? `rgba(255,255,255,${k})` : "transparent",
          borderRadius: mix(0, 30),
          boxShadow: k > 0 ? `0 ${20 * k}px ${46 * k}px rgba(80,55,25,${0.16 * k})` : "none",
          outline: k < 1 && s.parts > 0 ? `2px dashed rgba(240,138,75,${0.8 * (1 - k)})` : "none",
          fontFamily: k > 0.5 ? QUICKSAND : "'Times New Roman', serif",
          color: C.ink,
        }}
      >
        {s.parts >= 2 ? <div style={{ fontSize: mix(30, 38), fontWeight: 700, margin: `0 0 ${mix(8, 16)}px` }}>Margherita Pizza</div> : null}
        {s.parts >= 3 ? (
          k > 0 ? (
            <div style={{ height: 240 * Math.max(0.5, k), borderRadius: 22 * k, background: foodBg.pizza, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FoodArt kind="pizza" size={190 * Math.max(0.55, k)} spin={frame * 0.2} />
            </div>
          ) : (
            <div style={{ width: 200, height: 120, border: "2px solid #b9b2a8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial", fontSize: 16, color: "#8a8178", background: "#f4f1ec" }}>
              [ pizza.png ]
            </div>
          )
        ) : null}
        {s.parts >= 4 ? <div style={{ fontSize: mix(20, 22), fontWeight: k > 0.5 ? 600 : 400, color: k > 0.5 ? C.inkSoft : "black", margin: `${mix(10, 16)}px 0` }}>Fresh tomato and mozzarella.</div> : null}
        {s.parts >= 5 ? (
          <div
            style={{
              display: k > 0.4 ? "flex" : "inline-block",
              alignItems: "center",
              justifyContent: "center",
              height: k > 0.4 ? 66 : undefined,
              padding: k > 0.4 ? 0 : "2px 8px",
              borderRadius: k > 0.4 ? 20 : 3,
              background: k > 0.4 ? C.dino : "#efefef",
              border: k > 0.4 ? "none" : "1px solid #767676",
              color: k > 0.4 ? "white" : "black",
              fontFamily: k > 0.4 ? QUICKSAND : "Arial",
              fontSize: k > 0.4 ? 24 : 15,
              fontWeight: k > 0.4 ? 700 : 400,
              transform: s.pressAt !== undefined ? `scale(${pressScale(frame, s.pressAt)})` : undefined,
              boxShadow: k > 0.4 ? "0 10px 20px rgba(240,138,75,0.35)" : "none",
            }}
          >
            Add to cart
          </div>
        ) : null}
      </div>
    </div>
  );
};

