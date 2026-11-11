// The real course code (synced from course-project/ by scripts/sync-course-code.ts)
// plus helpers to cut exact snippets out of it.
import code from "./course-code.json";

export const HTML = code.html;
export const CSS = code.css;
export const JS = code.js;

/** Lines from the first line containing `start` up to and including the first following line containing `end`. */
export const between = (lines: string[], start: string, end: string, from = 0): string[] => {
  const a = lines.findIndex((l, i) => i >= from && l.includes(start));
  if (a < 0) throw new Error(`snippet start not found: ${start}`);
  const b = lines.findIndex((l, i) => i >= a && l.includes(end));
  if (b < 0) throw new Error(`snippet end not found: ${end}`);
  return lines.slice(a, b + 1);
};

/** A whole CSS rule or JS function: from the line containing `start` to its closing brace at the same indent. */
export const block = (lines: string[], start: string): string[] => {
  const a = lines.findIndex((l) => l.includes(start));
  if (a < 0) throw new Error(`block not found: ${start}`);
  const indent = lines[a].match(/^\s*/)![0];
  const b = lines.findIndex((l, i) => i > a && (l === `${indent}}` || l === `${indent}};` || l.startsWith(`${indent}}`)));
  return lines.slice(a, b + 1);
};

/** Remove a common leading indentation. */
export const dedent = (lines: string[]) => {
  const n = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length));
  return lines.map((l) => l.slice(n));
};

/** index.html as it stands at the end of Lesson 2 (no font, stylesheet or script links yet). */
export const HTML_LESSON2 = HTML.filter(
  (l) => !/fonts\.g|QUICKSAND FONT|rel="stylesheet"|<script src/.test(l),
).filter((l, i, arr) => !(l.trim() === "" && (arr[i - 1] ?? "").trim() === ""));

/** index.html at the end of Lesson 3 (fonts + stylesheet, no script yet). */
export const HTML_LESSON3 = HTML.filter((l) => !/<script src/.test(l));

/** Emmet's "!" expansion in the Paisley IDE. */
export const EMMET = [
  "<!DOCTYPE html>",
  '<html lang="en">',
  "<head>",
  '    <meta charset="UTF-8">',
  '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
  "    <title>My page</title>",
  "</head>",
  "<body>",
  "",
  "</body>",
  "</html>",
];
