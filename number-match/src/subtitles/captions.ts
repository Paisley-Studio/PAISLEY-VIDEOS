// Pure module: turns the timeline into caption cues. Used by the burned-in
// <Subtitles> component AND scripts/build-subtitles.ts, so both always match.

import type { LineTiming, Timeline } from "../lib/timeline.ts";

export type Cue = { start: number; end: number; text: string }; // absolute frames

export const MAX_CHARS = 58; // one comfortable line at 44px Quicksand

/** Split a sentence into readable chunks, preferring punctuation breaks. */
export const chunkText = (text: string, max = MAX_CHARS): string[] => {
  // First split into sentences, then split long sentences into balanced pieces.
  // a sentence ends at . ! ? followed by a space ("style.css" is not a sentence end)
  const sentences = text.split(/(?<=[.!?]["')]*)\s+/).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  let carry = "";
  for (const s of sentences) {
    // merge short sentences together ("Yes! You are...") when they fit
    if (carry && (carry + " " + s).length <= max) {
      carry = carry + " " + s;
      continue;
    }
    if (carry) out.push(...balance(carry, max));
    carry = s;
  }
  if (carry) out.push(...balance(carry, max));
  return out;
};

/** Split one sentence into n near-equal pieces, preferring breaks after punctuation. */
const balance = (sentence: string, max: number): string[] => {
  if (sentence.length <= max) return [sentence];
  const words = sentence.split(/\s+/);
  const n = Math.ceil(sentence.length / max);
  const target = sentence.length / n;
  const pieces: string[] = [];
  let current: string[] = [];
  for (let i = 0; i < words.length; i++) {
    current.push(words[i]);
    const len = current.join(" ").length;
    const remaining = words.length - i - 1;
    if (pieces.length === n - 1 || remaining === 0) continue;
    const punct = /[,;:]$/.test(words[i]);
    const nextLen = len + 1 + (words[i + 1]?.length ?? 0);
    if ((punct && len >= target * 0.6) || nextLen > target * 1.12) {
      pieces.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) pieces.push(current.join(" "));
  return pieces;
};

const lineCues = (line: LineTiming, sceneFrom: number): Cue[] => {
  const lineStart = sceneFrom + line.start;
  const lineEnd = lineStart + line.durationInFrames;
  const chunks = chunkText(line.caption);
  if (chunks.length === 1) return [{ start: lineStart, end: lineEnd, text: chunks[0] }];

  const usesSpoken = line.caption === line.text && line.words.length > 0;
  const starts: number[] = [];
  if (usesSpoken) {
    // map each chunk to the spoken word where it begins
    let wordIndex = 0;
    for (const chunk of chunks) {
      starts.push(sceneFrom + (line.words[Math.min(wordIndex, line.words.length - 1)]?.frame ?? line.start));
      wordIndex += chunk.split(/\s+/).length;
    }
    starts[0] = lineStart;
  } else {
    // caption text differs from what is spoken: split time by characters
    const total = chunks.reduce((a, c) => a + c.length, 0);
    let acc = 0;
    for (const chunk of chunks) {
      starts.push(Math.round(lineStart + (acc / total) * line.durationInFrames));
      acc += chunk.length;
    }
  }
  return chunks.map((text, i) => ({ start: starts[i], end: i + 1 < chunks.length ? starts[i + 1] : lineEnd, text }));
};

export const buildCues = (timeline: Timeline): Cue[] => {
  const cues: Cue[] = [];
  for (const scene of timeline.SCENES) {
    for (const line of scene.lines) cues.push(...lineCues(line, scene.from));
  }
  // linger a little after each line, but never overlap the next cue
  for (let i = 0; i < cues.length; i++) {
    const next = cues[i + 1];
    const linger = cues[i].end + 12;
    cues[i].end = next ? Math.min(linger, next.start) : linger;
  }
  return cues;
};
