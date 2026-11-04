// Helpers for the GitHub Actions render workflow.
//
//   node scripts/ci.mjs matrix <compositionId | all | dino-series>   → JSON list of videos to render
//   node scripts/ci.mjs check  <compositionId>                       → fail early if any asset is missing
//   node scripts/ci.mjs verify <compositionId> <file.mp4> [scale]    → fail if the MP4 is incomplete or invalid
//
// Needs Node 22.18+ (it loads the TypeScript timeline directly).

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { createTimeline } from "../src/shared/timeline.ts";

const ROOT = join(import.meta.dirname, "..");
const FPS = 30;
const VIDEOS = JSON.parse(readFileSync(join(ROOT, "scripts", "videos.json"), "utf8"));

const fail = (message) => {
  console.error(`::error::${message}`);
  process.exit(1);
};

const find = (id) => VIDEOS.find((v) => v.id === id) ?? fail(`Unknown composition "${id}". Known: ${VIDEOS.map((v) => v.id).join(", ")}`);

const timelineFor = (video) => {
  const read = (file) => JSON.parse(readFileSync(join(ROOT, "src", video.folder, file), "utf8"));
  const script = read("script.json");
  return { script, timeline: createTimeline(script, read("vo-timings.json")) };
};

/** Every source file under src/, for scanning asset references. */
const sourceFiles = (dir = join(ROOT, "src")) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? sourceFiles(p) : /\.(tsx?|jsx?)$/.test(name) ? [p] : [];
  });

const [command, arg, file, scaleArg] = process.argv.slice(2);

if (command === "matrix") {
  const selected = arg === "all" ? VIDEOS : arg === "dino-series" ? VIDEOS.filter((v) => /^Video[1-5]-/.test(v.id)) : [find(arg)];
  console.log(JSON.stringify(selected));
} else if (command === "check") {
  const video = find(arg);
  const missing = [];
  // narration: one mp3 per line, with timings
  const { script, timeline } = timelineFor(video);
  for (const scene of script.scenes) {
    for (const line of scene.lines) {
      const mp3 = join(ROOT, "public", video.folder, "vo", `${line.id}.mp3`);
      if (!existsSync(mp3) || statSync(mp3).size === 0) missing.push(`public/${video.folder}/vo/${line.id}.mp3`);
    }
  }
  // sound effects + music referenced anywhere in the code
  const refs = new Set();
  for (const src of sourceFiles()) {
    const text = readFileSync(src, "utf8");
    for (const m of text.matchAll(/<Sfx[^>]*?name="([^"]+)"/g)) refs.add(`audio/${m[1]}.wav`);
    for (const m of text.matchAll(/staticFile\(\s*"([^"]+)"\s*\)/g)) refs.add(m[1]);
  }
  for (const ref of refs) if (!existsSync(join(ROOT, "public", ref))) missing.push(`public/${ref}`);
  if (missing.length > 0) fail(`Missing ${missing.length} asset(s):\n  ${missing.join("\n  ")}`);
  console.log(`All assets present for ${video.id}: ${timeline.SCENES.length} scenes, ${(timeline.TOTAL_FRAMES / FPS).toFixed(1)} s, ${refs.size} shared audio files.`);
} else if (command === "verify") {
  const video = find(arg);
  if (!file || !existsSync(file)) fail(`Render output not found: ${file}`);
  const size = statSync(file).size;
  if (size < 100_000) fail(`Render output is suspiciously small (${size} bytes): ${file}`);
  const { timeline } = timelineFor(video);
  const expected = timeline.TOTAL_FRAMES / FPS;
  const scale = Number(scaleArg ?? 1);

  const probe = JSON.parse(
    execFileSync("npx", ["remotion", "ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], {
      encoding: "utf8",
      shell: process.platform === "win32",
    }),
  );
  const videoStream = probe.streams.find((s) => s.codec_type === "video");
  const audioStream = probe.streams.find((s) => s.codec_type === "audio");
  const duration = Number(probe.format.duration);
  const problems = [];
  if (!videoStream) problems.push("no video stream");
  if (!audioStream) problems.push("no audio stream (narration missing)");
  if (videoStream && videoStream.codec_name !== "h264") problems.push(`video codec is ${videoStream.codec_name}, expected h264`);
  if (videoStream && (videoStream.width !== Math.round(1920 * scale) || videoStream.height !== Math.round(1080 * scale)))
    problems.push(`resolution ${videoStream.width}x${videoStream.height}, expected ${Math.round(1920 * scale)}x${Math.round(1080 * scale)}`);
  if (!(Math.abs(duration - expected) < 1)) problems.push(`duration ${duration.toFixed(2)} s, expected ${expected.toFixed(2)} s`);
  if (problems.length > 0) fail(`${file} failed validation: ${problems.join("; ")}`);
  console.log(
    `Valid MP4: ${videoStream.width}x${videoStream.height} h264 + ${audioStream.codec_name} audio, ${duration.toFixed(2)} s (expected ${expected.toFixed(2)} s), ${(size / 1_048_576).toFixed(1)} MB`,
  );
} else {
  fail("Usage: node scripts/ci.mjs matrix|check|verify ...");
}
