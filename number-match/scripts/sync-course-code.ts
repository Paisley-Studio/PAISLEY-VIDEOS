// Copies course-project/index.html, style.css and script.js into
// src/lib/course-code.json so every snippet shown in the videos is the real code.
// Run after editing the course project: node scripts/sync-course-code.ts
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const read = (f: string) => readFileSync(join(ROOT, "course-project", f), "utf8").replace(/\r/g, "").replace(/\n$/, "").split("\n");
const out = { html: read("index.html"), css: read("style.css"), js: read("script.js") };
writeFileSync(join(ROOT, "src", "lib", "course-code.json"), JSON.stringify(out, null, 1));
console.log(`synced: html ${out.html.length}, css ${out.css.length}, js ${out.js.length} lines`);
