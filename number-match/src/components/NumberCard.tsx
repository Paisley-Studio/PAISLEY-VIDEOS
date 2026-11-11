import React from "react";
import { C, QUICKSAND } from "../styles/theme";

export const NUMBER_WORDS: Record<number, string> = {
  1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six", 7: "Seven", 8: "Eight",
};

/** Card proportions from style.css (.memory-card aspect-ratio 0.78). */
export const CARD_RATIO = 0.78;
/** Card width the CSS sizes were designed at (1080px shell, 4 columns, 15px gap). */
const BASE_W = 247;

export type CardFaceStyle = "game" | "hero";

type Props = {
  number: number;
  width: number;
  /** 0 = back facing us, 180 = number facing us */
  angle: number;
  matched?: boolean;
  /** "game" = exact in-game proportions, "hero" = big circle like the reference card */
  variant?: CardFaceStyle;
  backColor?: string;
  style?: React.CSSProperties;
  /** extra transforms applied to the whole card (3D) */
  transform?: string;
  /** red outline flash for a mismatch (0..1) */
  wrong?: number;
};

/** One Number Match card, faithful to .memory-card / .card-face in style.css. */
export const NumberCard: React.FC<Props> = ({
  number,
  width,
  angle,
  matched = false,
  variant = "game",
  backColor = C.green,
  style,
  transform = "",
  wrong = 0,
}) => {
  const s = width / BASE_W;
  const height = width / CARD_RATIO;
  const radius = 19 * s;
  const border = 5 * s;
  const accent = matched ? C.match : C.red;
  const circle = variant === "hero" ? width * 0.72 : Math.min(width * 0.72, 112 * s);
  const numeral = variant === "hero" ? circle * 0.66 : 82 * s;
  const word = variant === "hero" ? width * 0.15 : 23 * s;

  const face: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: radius,
    boxSizing: "border-box",
    fontFamily: QUICKSAND,
  };

  return (
    <div style={{ position: "relative", width, height, perspective: 900 * s, transform, ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateY(${angle}deg)`,
        }}
      >
        {/* back */}
        <div
          style={{
            ...face,
            background: backColor,
            border: `${border}px solid ${C.mint}`,
            boxShadow: `0 ${7 * s}px 0 ${C.cardBackShadow}`,
            color: C.white,
          }}
        >
          <div
            style={{
              width: 55 * s,
              height: 55 * s,
              display: "grid",
              placeItems: "center",
              border: `${3 * s}px solid ${C.white}`,
              borderRadius: "50%",
              fontSize: 29 * s,
              fontWeight: 700,
            }}
          >
            ?
          </div>
          <div style={{ marginTop: 12 * s, fontSize: 9 * s, letterSpacing: "0.18em", fontWeight: 700, color: C.mint }}>
            FLIP ME
          </div>
        </div>
        {/* front */}
        <div
          style={{
            ...face,
            transform: "rotateY(180deg)",
            background: C.white,
            border: `${border}px solid ${accent}`,
            boxShadow: `0 ${7 * s}px 0 ${matched ? C.matchShadow : C.cardFrontShadow}`,
            outline: wrong > 0 ? `${6 * s * wrong}px solid ${C.red}` : undefined,
            outlineOffset: 4 * s,
          }}
        >
          <div
            style={{
              width: circle,
              height: circle,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              background: accent,
              color: C.white,
              fontSize: numeral,
              lineHeight: 1,
              fontWeight: 700,
            }}
          >
            <span style={{ transform: `translateY(${-numeral * 0.04}px)` }}>{number}</span>
          </div>
          <div style={{ marginTop: (variant === "hero" ? 18 : 10) * s, color: C.ink, fontSize: word, fontWeight: 700 }}>
            {NUMBER_WORDS[number]}
          </div>
        </div>
      </div>
    </div>
  );
};
