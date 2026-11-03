import React, { useId } from "react";
import { C, HAND } from "./theme";

// The student's paper plan, drawn with wobbly pencil strokes.
// Each part has a 0..1 progress value so strokes can draw on in time with narration.

export const SKETCH_W = 1300;
export const SKETCH_H = 860;

export type SketchKey =
  | "title"
  | "area"
  | "ground"
  | "dino"
  | "cactus"
  | "score"
  | "jump"
  | "move"
  | "scoreNote"
  | "collision"
  | "button"
  | "erase"
  | "cactus2"
  | "question"
  | "clouds";

export type SketchProgress = Partial<Record<SketchKey, number>>;

export const FULL_SKETCH: SketchProgress = {
  title: 1,
  area: 1,
  ground: 1,
  dino: 1,
  cactus: 1,
  score: 1,
  jump: 1,
  move: 1,
  scoreNote: 1,
  collision: 1,
  button: 1,
};

/** Where the pencil should hover while each part is being drawn */
export const SKETCH_ANCHORS: Record<SketchKey, [number, number]> = {
  title: [880, 95],
  area: [1150, 640],
  ground: [1150, 585],
  dino: [380, 470],
  cactus: [840, 470],
  score: [1100, 225],
  jump: [800, 420],
  move: [900, 545],
  scoreNote: [1150, 275],
  collision: [520, 735],
  button: [1100, 735],
  erase: [830, 500],
  cactus2: [850, 400],
  question: [330, 250],
  clouds: [400, 250],
};

const STROKE = C.pencil;

// deterministic jitter so the lines look hand drawn
const jitter = (i: number, amount: number) => Math.sin(i * 12.9898 + 4.1) * amount;

const wobblyLine = (x1: number, y1: number, x2: number, y2: number, seed = 1, wobble = 4) => {
  const mx = (x1 + x2) / 2 + jitter(seed, wobble);
  const my = (y1 + y2) / 2 + jitter(seed + 1, wobble);
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2 + jitter(seed + 2, 2)} ${y2 + jitter(seed + 3, 2)}`;
};

const wobblyRect = (x: number, y: number, w: number, h: number, seed = 1) =>
  [
    wobblyLine(x, y, x + w, y + 2, seed),
    wobblyLine(x + w, y + 2, x + w - 2, y + h, seed + 4),
    wobblyLine(x + w - 2, y + h, x + 3, y + h - 1, seed + 8),
    wobblyLine(x + 3, y + h - 1, x, y - 4, seed + 12),
  ].join(" ");

/** A stroked path that draws itself as p goes 0 → 1 */
const Draw: React.FC<{ d: string; p: number; width?: number; color?: string; dash?: string; fill?: string }> = ({
  d,
  p,
  width = 5,
  color = STROKE,
  dash,
  fill = "none",
}) => {
  if (p <= 0) return null;
  if (dash) {
    // dashed strokes can't use the dash trick, so fade them in instead
    return <path d={d} fill={fill} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} opacity={p} />;
  }
  return (
    <path
      d={d}
      pathLength={1}
      fill={fill}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="1 1"
      strokeDashoffset={1 - p}
    />
  );
};

/** Handwritten text revealed left to right */
const Write: React.FC<{
  id: string;
  x: number;
  y: number;
  p: number;
  size?: number;
  color?: string;
  anchor?: "start" | "middle" | "end";
  width: number;
  children: React.ReactNode;
}> = ({ id, x, y, p, size = 44, color = STROKE, anchor = "start", width, children }) => {
  if (p <= 0) return null;
  const left = anchor === "start" ? x : anchor === "middle" ? x - width / 2 : x - width;
  return (
    <g>
      <clipPath id={id}>
        <rect x={left - 10} y={y - size * 1.2} width={(width + 20) * p} height={size * 1.8} />
      </clipPath>
      <text
        x={x}
        y={y}
        textAnchor={anchor}
        clipPath={`url(#${id})`}
        style={{ fontFamily: HAND, fontWeight: 700, fontSize: size, fill: color }}
      >
        {children}
      </text>
    </g>
  );
};

const part = (p: SketchProgress, key: SketchKey, from = 0, to = 1) => {
  const v = p[key] ?? 0;
  return Math.max(0, Math.min(1, (v - from) / (to - from)));
};

export const PaperSketch: React.FC<{ p: SketchProgress; width?: number; style?: React.CSSProperties; paper?: boolean }> = ({
  p,
  width = SKETCH_W,
  style,
  paper = true,
}) => {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const cactusOpacity = 1 - part(p, "erase");

  return (
    <svg width={width} height={(width * SKETCH_H) / SKETCH_W} viewBox={`0 0 ${SKETCH_W} ${SKETCH_H}`} style={style}>
      {paper ? (
        <>
          <filter id={id("shadow")} x="-5%" y="-5%" width="110%" height="115%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#5a3c14" floodOpacity="0.16" />
          </filter>
          <rect x={10} y={10} width={SKETCH_W - 20} height={SKETCH_H - 20} rx={14} fill={C.paper} filter={`url(#${id("shadow")})`} />
          {/* faint grid like a sketchbook page */}
          {Array.from({ length: 19 }).map((_, i) => (
            <line key={i} x1={40} x2={SKETCH_W - 40} y1={60 + i * 42} y2={60 + i * 42} stroke="#e9edf3" strokeWidth={2} />
          ))}
        </>
      ) : null}

      {/* Title */}
      <Write id={id("title")} x={650} y={110} p={part(p, "title")} size={84} anchor="middle" width={470}>
        DINO RUNNER
      </Write>
      <Draw d={wobblyLine(420, 128, 880, 132, 3, 3)} p={part(p, "title", 0.7, 1)} width={4} />

      {/* Game area */}
      <Draw d={wobblyRect(150, 170, 1000, 470, 1)} p={part(p, "area")} width={6} />

      {/* Ground */}
      <Draw d={wobblyLine(150, 580, 1150, 584, 21, 3)} p={part(p, "ground")} width={6} />
      <Draw
        d={Array.from({ length: 16 })
          .map((_, i) => `M ${185 + i * 60} 600 l -18 22`)
          .join(" ")}
        p={part(p, "ground", 0.4, 1)}
        width={3}
      />

      {/* Clouds (added later, when we spot what's missing) */}
      <Draw d="M 250 270 q -10 -40 35 -40 q 15 -35 60 -15 q 45 -15 55 25 q 35 5 20 30 Z" p={part(p, "clouds", 0, 0.6)} width={4} />
      <Draw d="M 690 205 q -6 -26 24 -26 q 12 -24 42 -10 q 30 -8 36 18 q 22 4 12 20 Z" p={part(p, "clouds", 0.3, 0.9)} width={4} />
      <Write id={id("clouds")} x={178} y={325} p={part(p, "clouds", 0.6, 1)} size={38} color={C.css} width={150}>
        + clouds!
      </Write>
      <Write id={id("q")} x={300} y={265} p={part(p, "question") * (1 - part(p, "clouds", 0, 0.2))} size={110} color={C.danger} anchor="middle" width={50}>
        ?
      </Write>

      {/* Dino: basically a potato with legs */}
      <Draw d="M 280 560 C 250 520 255 440 300 420 C 340 400 395 415 400 460 C 405 500 395 555 370 562 C 340 570 300 572 280 560 Z" p={part(p, "dino", 0, 0.6)} width={6} />
      <Draw d="M 305 563 L 303 580 M 355 563 L 357 580" p={part(p, "dino", 0.5, 0.8)} width={6} />
      <Draw d="M 362 455 m -9 0 a 9 9 0 1 0 18 0 a 9 9 0 1 0 -18 0" p={part(p, "dino", 0.75, 1)} width={5} />

      {/* Cactus (first version) */}
      <g opacity={cactusOpacity}>
        <Draw d="M 806 580 L 806 480 Q 806 462 822 462 Q 838 462 838 480 L 838 580" p={part(p, "cactus", 0, 0.6)} width={6} />
        <Draw d="M 806 525 L 788 525 L 788 500 M 838 512 L 856 512 L 856 490" p={part(p, "cactus", 0.5, 1)} width={6} />
      </g>
      {/* Cactus (redrawn bigger) */}
      <Draw d="M 800 580 L 800 420 Q 800 398 822 398 Q 844 398 844 420 L 844 580" p={part(p, "cactus2", 0, 0.6)} width={6} />
      <Draw d="M 800 505 L 774 505 L 774 465 M 844 480 L 870 480 L 870 445" p={part(p, "cactus2", 0.5, 1)} width={6} />

      {/* Score */}
      <Write id={id("score")} x={950} y={240} p={part(p, "score")} size={52} width={170}>
        Score: 0
      </Write>
      <Write id={id("scoreNote")} x={950} y={290} p={part(p, "scoreNote")} size={34} color={C.css} width={190}>
        ↑ goes up while
      </Write>
      <Write id={id("scoreNote2")} x={975} y={326} p={part(p, "scoreNote", 0.4, 1)} size={34} color={C.css} width={160}>
        you survive
      </Write>

      {/* Jump arrow */}
      <Draw d="M 330 405 C 420 220 700 220 790 400" p={part(p, "jump", 0, 0.7)} width={5} color={C.dino} />
      <Draw d="M 790 400 L 770 380 M 790 400 L 795 372" p={part(p, "jump", 0.6, 0.8)} width={5} color={C.dino} />
      <Write id={id("jump")} x={560} y={240} p={part(p, "jump", 0.5, 1)} size={46} color={C.dino} anchor="middle" width={140}>
        jumps!
      </Write>

      {/* Obstacle moves toward player */}
      <Draw d="M 1080 545 L 890 545 M 890 545 L 910 530 M 890 545 L 910 560" p={part(p, "move", 0, 0.6)} width={5} color={C.cactus} />
      <Write id={id("move")} x={880} y={515} p={part(p, "move", 0.4, 1)} size={34} color={C.cactus} width={260}>
        moves toward player
      </Write>

      {/* Collision rule */}
      <Draw d="M 190 715 l 12 -30 l 12 30 l 30 -12 l -20 26 l 26 18 l -32 2 l 4 30 l -20 -22 l -20 22 l 4 -30 l -32 -2 l 26 -18 l -20 -26 Z" p={part(p, "collision", 0, 0.5)} width={4} color={C.danger} />
      <Write id={id("collision")} x={260} y={735} p={part(p, "collision", 0.4, 1)} size={46} color={C.danger} width={360}>
        hit = GAME OVER
      </Write>

      {/* Restart button */}
      <Draw d={wobblyRect(880, 690, 230, 80, 41)} p={part(p, "button", 0, 0.5)} width={4} dash="14 10" />
      <Write id={id("button")} x={995} y={744} p={part(p, "button", 0.3, 0.8)} size={42} anchor="middle" width={170}>
        Play Again
      </Write>
      <Write id={id("buttonNote")} x={1125} y={744} p={part(p, "button", 0.7, 1)} size={34} color={C.css} width={130}>
        ← restart
      </Write>
    </svg>
  );
};
