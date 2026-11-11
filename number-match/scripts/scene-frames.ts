// Prints each scene's frame range (and a suggested QA frame mid-scene) for a video.
// Usage: node scripts/scene-frames.ts 02
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createTimeline, type VideoScript } from "../src/lib/timeline.ts";
const v = (process.argv[2] ?? "01").padStart(2, "0");
const dir = join(import.meta.dirname, "..", "narration", `video-${v}`);
const tl = createTimeline(JSON.parse(readFileSync(join(dir, "script.json"), "utf8")) as VideoScript, JSON.parse(readFileSync(join(dir, "timings.json"), "utf8")));
for (const s of tl.SCENES) console.log(`${s.id.padEnd(12)} ${s.from}-${s.from + s.durationInFrames}  mid ${s.from + Math.round(s.durationInFrames * 0.55)}`);
console.log("total", tl.TOTAL_FRAMES);
