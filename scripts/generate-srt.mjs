// Writes a .srt subtitle file for a video, using the exact same timeline and
// cue builder as the on-screen captions, so the file always matches the render.
//
// Usage: node scripts/generate-srt.mjs video6 [output.srt]
// Needs Node 22.18+ (built-in TypeScript type stripping).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createTimeline } from "../src/shared/timeline.ts";
import { buildCues, toSrt } from "../src/shared/captions.ts";

const FPS = 30;
const video = process.argv[2];
if (!video) {
  console.error("Usage: node scripts/generate-srt.mjs <videoFolder> [output.srt]");
  process.exit(1);
}

const root = join(import.meta.dirname, "..");
const read = (file) => JSON.parse(readFileSync(join(root, "src", video, file), "utf8"));
const script = read("script.json");
const timings = read("vo-timings.json");

const timeline = createTimeline(script, timings);
const cues = buildCues(timeline.SCENES, FPS);
if (cues.length === 0) {
  console.error(`No subtitle cues produced for ${video}`);
  process.exit(1);
}

// every narration word must appear in the subtitles, in order
const spoken = script.scenes.flatMap((s) => s.lines.map((l) => l.text)).join(" ").split(/\s+/);
const shown = cues.map((c) => c.text).join(" ").split(/\s+/);
if (spoken.join(" ") !== shown.join(" ")) {
  console.error("Subtitle text does not match the narration script.");
  process.exit(1);
}

const out = process.argv[3] ?? join(root, "out", `${video}.srt`);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, toSrt(cues, FPS), "utf8");
const last = cues[cues.length - 1];
console.log(`Wrote ${cues.length} cues (${(last.end / FPS).toFixed(1)} s of ${(timeline.TOTAL_FRAMES / FPS).toFixed(1)} s) to ${out}`);
