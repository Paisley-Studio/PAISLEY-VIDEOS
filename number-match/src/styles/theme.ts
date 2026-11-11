import { loadFont as loadQuicksand } from "@remotion/google-fonts/Quicksand";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily: QUICKSAND } = loadQuicksand("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
});
// Quicksand's 800 isn't in @remotion/google-fonts' normal style list on every version,
// so the heavy weight falls back to 700 cleanly.

export const { fontFamily: MONO } = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
});

/**
 * Series palette. Flat colours only: no gradients, no blur, no glass.
 * The first block mirrors course-project/style.css exactly.
 */
export const C = {
  // game (style.css :root)
  green: "#0e4a3f",
  green2: "#16705f",
  mint: "#e4f4ee",
  red: "#e3242b",
  redDark: "#b81b21",
  match: "#14936b",
  ink: "#17302b",
  muted: "#5f7570",
  page: "#f4faf7",
  white: "#ffffff",
  cardBackShadow: "#c9e3d9",
  cardFrontShadow: "#f5c4c6",
  matchShadow: "#c3e8da",

  // cinematic stage
  night: "#072b24", // deep forest-green backdrop
  night2: "#0a3a31",
  night3: "#0d463b",
  nightLine: "#145446",
  gold: "#ffc23d",
  goldDark: "#d99a12",

  // language colours (consistent across all six videos)
  html: "#e3242b",
  css: "#14936b",
  js: "#ffc23d",
};

/** Paisley IDE colours, sampled from the supplied screenshots. */
export const IDE = {
  topbar: "#f1f7f5",
  topbarLine: "#dfe9e6",
  pill: "#1f5b51",
  pillIcon: "#f2c94c",
  pathText: "#1f4a43",
  sidebar: "#f3f8f6",
  sidebarActive: "#dcefe9",
  sidebarText: "#24433d",
  sidebarHint: "#5c6f6a",
  iconGreen: "#1f5b51",
  folderYellow: "#e3b341",
  htmlIcon: "#e44d26",
  cssIcon: "#2965f1",
  jsIcon: "#3d4c48",
  buttonBorder: "#e3ebe8",
  save: "#1f5b51",
  run: "#5cc2b0",
  runText: "#0e3b33",
  editorBg: "#ffffff",
  gutter: "#f6f8f7",
  gutterText: "#8b9b97",
  activeLine: "#eef6f3",
  hintBar: "#f4f7f6",
  hintText: "#4f625d",
  consoleBar: "#1c2b28",
  consoleText: "#5cc2b0",
  previewBg: "#ffffff",
  splitter: "#e6ecea",
  // CodeMirror 5 default theme (matches the IDE's highlighting)
  tok: {
    tag: "#117700",
    attr: "#0000cc",
    string: "#aa1111",
    comment: "#aa5500",
    keyword: "#770088",
    def: "#0000ff",
    number: "#116644",
    atom: "#221199",
    builtin: "#3300aa",
    qualifier: "#555555",
    variable2: "#0055aa",
    bracket: "#997799",
    meta: "#555555",
    plain: "#000000",
  },
};

/** Hard, flat drop shadows (no blur) give depth without blends. */
export const FLAT_SHADOW = (y = 8, color = "rgba(0,0,0,0.18)") => `0 ${y}px 0 ${color}`;
