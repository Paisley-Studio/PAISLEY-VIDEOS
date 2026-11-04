import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { C, QUICKSAND, SHADOW } from "./theme";

/** Warm canvas with slow-drifting soft shapes. Sits behind every scene. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const blob = (x: number, y: number, size: number, color: string, speed: number, phase: number): React.CSSProperties => ({
    position: "absolute",
    left: x + Math.sin(t * speed + phase) * 60,
    top: y + Math.cos(t * speed * 0.8 + phase) * 40,
    width: size,
    height: size,
    borderRadius: "50%",
    background: color,
    filter: "blur(90px)",
    opacity: 0.55,
  });
  return (
    <AbsoluteFill style={{ background: C.canvas, overflow: "hidden" }}>
      <div style={blob(-200, -150, 700, "#ffd9bd", 0.05, 0)} />
      <div style={blob(1400, 600, 760, "#cfe9f3", 0.04, 2)} />
      <div style={blob(900, -300, 520, "#fff0c2", 0.06, 4)} />
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(90, 70, 40, 0.10) 1.6px, transparent 1.6px)",
          backgroundSize: "36px 36px",
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};

export const SpaceKey: React.FC<{ pressed?: boolean; scale?: number; style?: React.CSSProperties }> = ({ pressed = false, scale = 1, style }) => (
  <div
    style={{
      width: 300 * scale,
      height: 74 * scale,
      borderRadius: 18 * scale,
      background: pressed ? "#f3ece1" : "white",
      border: `${3 * scale}px solid ${C.ink}`,
      boxShadow: pressed ? `0 ${2 * scale}px 0 ${C.ink}` : `0 ${8 * scale}px 0 ${C.ink}`,
      transform: `translateY(${pressed ? 6 * scale : 0}px)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: QUICKSAND,
      fontWeight: 700,
      fontSize: 26 * scale,
      letterSpacing: 4 * scale,
      color: C.ink,
      ...style,
    }}
  >
    SPACE
  </div>
);

/** A mouse pointer arrow. */
export const Pointer: React.FC<{ style?: React.CSSProperties; size?: number }> = ({ style, size = 40 }) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 30 39" style={style}>
    <path d="M2 2 L2 32 L10 25 L15 37 L20 35 L15 23 L26 23 Z" fill="white" stroke={C.ink} strokeWidth={2.5} strokeLinejoin="round" />
  </svg>
);

type FileEntry = { name: string; color: string };

/** A clean laptop with a light code editor on screen. */
export const Laptop: React.FC<{
  width?: number;
  files?: FileEntry[];
  activeFile?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ width = 1100, files = [], activeFile, children, style }) => {
  const screenH = width * 0.6;
  return (
    <div style={{ width, ...style }}>
      <div
        style={{
          background: C.ink,
          borderRadius: `${width * 0.03}px ${width * 0.03}px 6px 6px`,
          padding: width * 0.022,
          boxShadow: SHADOW,
        }}
      >
        <div style={{ height: screenH, background: "#fbfaf7", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ height: 42, background: "#efe9df", display: "flex", alignItems: "center", gap: 10, padding: "0 18px" }}>
            {["#ee6a5f", "#f5bd4f", "#61c454"].map((c) => (
              <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
            ))}
            {activeFile ? (
              <div
                style={{
                  marginLeft: 20,
                  padding: "6px 16px",
                  background: "#fbfaf7",
                  borderRadius: "8px 8px 0 0",
                  fontFamily: QUICKSAND,
                  fontWeight: 700,
                  fontSize: 17,
                  color: C.ink,
                  alignSelf: "flex-end",
                }}
              >
                {activeFile}
              </div>
            ) : null}
          </div>
          <div style={{ flex: 1, display: "flex" }}>
            {files.length > 0 ? (
              <div style={{ width: width * 0.24, background: "#f4efe7", padding: "22px 18px", fontFamily: QUICKSAND }}>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 2, color: C.inkSoft, marginBottom: 14 }}>DINO-GAME</div>
                {files.map((f) => (
                  <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 19, fontWeight: 600, color: C.ink, marginBottom: 12 }}>
                    <div style={{ width: 14, height: 18, borderRadius: 3, background: f.color }} />
                    {f.name}
                  </div>
                ))}
              </div>
            ) : null}
            <div style={{ flex: 1, position: "relative", padding: 28 }}>{children}</div>
          </div>
        </div>
      </div>
      <div
        style={{
          height: width * 0.035,
          background: "#d9d2c7",
          margin: `0 ${-width * 0.04}px`,
          borderRadius: `0 0 ${width * 0.04}px ${width * 0.04}px`,
          boxShadow: SHADOW,
        }}
      />
    </div>
  );
};

export const LANG_FILES: FileEntry[] = [
  { name: "index.html", color: C.html },
  { name: "style.css", color: C.css },
  { name: "script.js", color: C.js },
];

/** A blinking text caret for empty editors. */
export const Caret: React.FC<{ height?: number }> = ({ height = 34 }) => {
  const frame = useCurrentFrame();
  return <div style={{ width: 3, height, background: C.dino, opacity: Math.floor(frame / 15) % 2 === 0 ? 1 : 0 }} />;
};

/** A white rounded card. */
export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ background: "white", borderRadius: 28, boxShadow: SHADOW, ...style }}>{children}</div>
);
