import React from "react";

/**
 * index.html as a browser draws it with NO CSS: default Times font, blue links,
 * plain form controls, every element stacked. This is what students see at the
 * end of Lesson 2, and in the debugging example in Lesson 6.
 */
export const PlainPage: React.FC<{ scale?: number; show?: number }> = ({ scale = 1, show = 99 }) => {
  const base: React.CSSProperties = { fontFamily: '"Times New Roman", Times, serif', color: "#000", fontSize: 16, lineHeight: 1.2 };
  const p: React.CSSProperties = { margin: "16px 0" };
  const btn: React.CSSProperties = { fontFamily: "Arial, sans-serif", fontSize: 13.3, padding: "1px 6px", border: "2px outset #ccc", background: "#efefef", display: "inline-block" };
  const parts: React.ReactNode[] = [
    <div key="h">
      <span style={{ color: "#0000ee", textDecoration: "underline" }}>NNUMBERMATCH</span> A MEMORY CHALLENGE
    </div>,
    <div key="hero">
      <p style={p}>THINK • FLIP • MATCH</p>
      <h1 style={{ fontSize: 32, margin: "21px 0" }}>Ready to match?</h1>
      <p style={p}>Turn over two cards. Find the numbers that belong together. How good is your memory?</p>
    </div>,
    <div key="tool">
      <div>CHOOSE YOUR CHALLENGE</div>
      <div>
        <span style={{ ...btn, border: "1px solid #767676", background: "#fff", borderRadius: 2 }}>Medium · 6 pairs ▾</span>
      </div>
      <span style={btn}>↻ Restart</span>
    </div>,
    <div key="stats">
      <div>MOVES 0</div>
      <div>
        MATCHED 0 <small>/ 6</small>
      </div>
      <div>TIME 00:00</div>
    </div>,
    <div key="msg">Choose any card to begin!</div>,
    <div key="foot">PAISLEY STUDIO · LEARN BY CREATING Every flip brings you closer.</div>,
    <div key="win">
      <div>✦</div>
      <p style={p}>CHALLENGE COMPLETE</p>
      <h2 style={{ fontSize: 24, margin: "19px 0" }}>Brilliant matching!</h2>
      <p style={p}>You found every pair. Your memory is getting stronger!</p>
      <div>MOVES 0</div>
      <div>TIME 00:00</div>
      <span style={btn}>Play again →</span>
    </div>,
  ];
  return (
    <div style={{ ...base, background: "#fff", padding: 8, width: 810 / scale, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
      {parts.slice(0, show)}
    </div>
  );
};
