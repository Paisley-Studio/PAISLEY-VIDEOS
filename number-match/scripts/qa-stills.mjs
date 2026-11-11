// QA helper: renders individual still frames (PNG) for visual review.
// This is NOT the video render — final MP4s are rendered by GitHub Actions.
// Usage: node scripts/qa-stills.mjs PaisleyIntro 90 300 560 ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const [id, ...frames] = process.argv.slice(2);
const root = join(import.meta.dirname, "..");
const out = join(root, "out", "qa", id);
mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: join(root, "src", "index.ts") });
const composition = await selectComposition({ serveUrl, id });
for (const f of frames.map(Number)) {
  await renderStill({ serveUrl, composition, frame: f, output: join(out, `${String(f).padStart(5, "0")}.png`), scale: 0.5 });
  console.log("still", f);
}
