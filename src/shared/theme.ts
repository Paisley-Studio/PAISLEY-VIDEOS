import { loadFont as loadQuicksand } from "@remotion/google-fonts/Quicksand";
import { loadFont as loadCaveat } from "@remotion/google-fonts/Caveat";

export const { fontFamily: QUICKSAND } = loadQuicksand("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});

export const { fontFamily: HAND } = loadCaveat("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});

// Shared palette: the game's own colours + one colour per language.
export const C = {
  canvas: "#fdf6ec",
  canvasDeep: "#f6ead8",
  paper: "#fffdf8",
  ink: "#2b2b2b",
  inkSoft: "#6b645c",
  line: "#e8dccb",
  sky: "#dff1f7",
  ground: "#5c4a3d",
  dino: "#f08a4b",
  cactus: "#2d6a4f",
  accent: "#ffb703",
  danger: "#d64545",
  html: "#f08a4b",
  css: "#4a8fe7",
  js: "#f2b705",
  good: "#3a9d6a",
  pencil: "#3a3632",
};

export const SHADOW = "0 18px 40px rgba(80, 55, 25, 0.12), 0 4px 10px rgba(80, 55, 25, 0.08)";
export const SHADOW_SOFT = "0 10px 24px rgba(80, 55, 25, 0.10)";
