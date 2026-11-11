// Fails loudly if a video can't be rendered faithfully: missing or stale
// narration audio, missing sound effects, or missing branding.
// Missing narration is NEVER replaced with silence or music.
// Usage: node scripts/verify-assets.ts 01 [02 ...]

import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { VideoScript } from "../src/lib/timeline.ts";

const ROOT = join(import.meta.dirname, "..");
const SFX = [
  "click", "tick", "pop", "pop-low", "pop-high", "whoosh", "whoosh-short", "typing", "key", "save", "run",
  "sparkle", "thunk", "uh-oh", "flip", "match", "miss", "win", "ambient", "sting", "music-bed",
];
const problems: string[] = [];

for (const name of SFX) {
  if (!existsSync(join(ROOT, "public", "audio", `${name}.wav`))) problems.push(`missing sound effect public/audio/${name}.wav (run: node scripts/generate-audio.mjs)`);
}
if (!existsSync(join(ROOT, "public", "branding", "paisley-badge.png"))) problems.push("missing public/branding/paisley-badge.png");

for (const arg of process.argv.slice(2)) {
  const video = arg.padStart(2, "0");
  const folder = join(ROOT, "narration", `video-${video}`);
  const script = JSON.parse(readFileSync(join(folder, "script.json"), "utf8")) as VideoScript;
  const timingsPath = join(folder, "timings.json");
  const timings = existsSync(timingsPath) ? JSON.parse(readFileSync(timingsPath, "utf8")) : {};
  let lines = 0;
  for (const scene of script.scenes) {
    for (const line of scene.lines) {
      lines++;
      const mp3 = join(ROOT, "public", "vo", `video-${video}`, `${line.id}.mp3`);
      if (!existsSync(mp3) || statSync(mp3).size < 2000) problems.push(`video ${video}: narration audio missing for line ${line.id}: "${line.text}"`);
      else if (!timings[line.id] || timings[line.id].text !== line.text) problems.push(`video ${video}: narration for line ${line.id} is out of date with script.json`);
    }
  }
  console.log(`video ${video} (${script.compositionId}): ${lines} narration lines checked`);
}

if (problems.length) {
  console.error("\nASSET CHECK FAILED:\n- " + problems.join("\n- "));
  console.error("\nGenerate narration with: python scripts/generate-voiceover.py <video>  (see README › Narration)");
  process.exit(1);
}
console.log("All assets present.");
