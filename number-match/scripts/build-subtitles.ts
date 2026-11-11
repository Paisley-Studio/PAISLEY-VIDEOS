// Writes subtitles/video-XX/<output>.srt and .vtt from the narration timings,
// using exactly the same cue logic as the burned-in subtitles.
// Usage: node scripts/build-subtitles.ts [01|all]   (Node 22.18+ runs .ts directly)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createTimeline, FPS, type VideoScript } from "../src/lib/timeline.ts";
import { buildCues } from "../src/subtitles/captions.ts";

const ROOT = join(import.meta.dirname, "..");
const arg = process.argv[2] ?? "all";
const videos = arg === "all" ? ["01", "02", "03", "04", "05", "06"] : [arg.padStart(2, "0")];

const stamp = (frame: number, sep: "," | ".") => {
  const ms = Math.round((frame / FPS) * 1000);
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const rest = ms % 1000;
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${p(h)}:${p(m)}:${p(s)}${sep}${p(rest, 3)}`;
};

for (const video of videos) {
  const folder = join(ROOT, "narration", `video-${video}`);
  const timingsPath = join(folder, "timings.json");
  if (!existsSync(timingsPath)) {
    console.error(`video ${video}: no timings.json yet. Run: python scripts/generate-voiceover.py ${video}`);
    process.exitCode = 1;
    continue;
  }
  const script = JSON.parse(readFileSync(join(folder, "script.json"), "utf8")) as VideoScript;
  const timings = JSON.parse(readFileSync(timingsPath, "utf8"));
  const cues = buildCues(createTimeline(script, timings));

  const srt = cues.map((c, i) => `${i + 1}\n${stamp(c.start, ",")} --> ${stamp(c.end, ",")}\n${c.text}\n`).join("\n");
  const vtt = "WEBVTT\n\n" + cues.map((c) => `${stamp(c.start, ".")} --> ${stamp(c.end, ".")}\n${c.text}\n`).join("\n");

  const outDir = join(ROOT, "subtitles", `video-${video}`);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `${script.output}.srt`), srt, "utf8");
  writeFileSync(join(outDir, `${script.output}.vtt`), vtt, "utf8");
  console.log(`video ${video}: ${cues.length} cues -> subtitles/video-${video}/${script.output}.srt/.vtt`);
}
