import type { SceneTiming } from "./timeline";

// Subtitle cues built from the narration's word timings.
// The on-screen captions and the exported .srt file both come from this one
// function, so they always match the final narration exactly.
// (Kept free of runtime imports so scripts/generate-srt.mjs can load it in Node.)

export type CueWord = { text: string; frame: number };
export type SubtitleCue = {
  index: number;
  start: number; // absolute frame
  end: number; // absolute frame (exclusive)
  text: string;
  words: CueWord[];
};

const MAX_CHARS = 44;
const SOFT_BREAK_AT = 22; // after this many characters, prefer to break on punctuation

const normalize = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

/** Pairs every written word (with its punctuation) with the frame it is spoken. */
const alignWords = (text: string, spoken: { frame: number; word: string }[], lineStart: number, lineEnd: number): CueWord[] => {
  const tokens = text.split(/\s+/).filter(Boolean);
  const out: CueWord[] = [];
  let j = 0;
  tokens.forEach((token, i) => {
    const target = normalize(token);
    // walk forward through the spoken words to find this token
    let k = j;
    while (k < spoken.length && spoken[k].word !== target && !spoken[k].word.startsWith(target) && !target.startsWith(spoken[k].word)) k++;
    if (k < spoken.length && target !== "") {
      out.push({ text: token, frame: spoken[k].frame });
      j = k + 1;
    } else {
      // not reported by the voice engine (rare): place it proportionally
      const prev = out.length > 0 ? out[out.length - 1].frame : lineStart;
      const estimate = lineStart + ((lineEnd - lineStart) * i) / tokens.length;
      out.push({ text: token, frame: Math.max(prev + 1, Math.round(estimate)) });
    }
  });
  return out;
};

const endsClause = (w: string) => /[.,!?;:]$/.test(w);
const endsSentence = (w: string) => /[.!?]$/.test(w);

export const buildCues = (scenes: SceneTiming[], fps: number): SubtitleCue[] => {
  const cues: SubtitleCue[] = [];
  for (const scene of scenes) {
    for (const line of scene.lines) {
      const lineStart = scene.from + line.start;
      const lineEnd = lineStart + line.durationInFrames;
      const words = alignWords(
        line.text,
        line.words.map((w) => ({ frame: scene.from + w.frame, word: w.word })),
        lineStart,
        lineEnd,
      );

      // group words into readable cues
      const groups: CueWord[][] = [];
      let current: CueWord[] = [];
      const len = (ws: CueWord[]) => ws.map((w) => w.text).join(" ").length;
      words.forEach((word, i) => {
        if (current.length > 0 && len([...current, word]) > MAX_CHARS) {
          groups.push(current);
          current = [];
        }
        current.push(word);
        const remaining = words.slice(i + 1);
        const remainingLen = len(remaining);
        const breakHere =
          remaining.length > 0 &&
          ((endsSentence(word.text) && len(current) >= 10) || (endsClause(word.text) && len(current) >= SOFT_BREAK_AT)) &&
          // don't leave a one-word orphan behind
          !(remaining.length === 1 && len(current) + remainingLen + 1 <= MAX_CHARS + 6);
        if (breakHere) {
          groups.push(current);
          current = [];
        }
      });
      if (current.length > 0) groups.push(current);

      groups.forEach((group, g) => {
        const start = g === 0 ? lineStart : group[0].frame;
        const nextStart = g + 1 < groups.length ? groups[g + 1][0].frame : lineEnd;
        // keep very short cues on screen long enough to read
        const end = Math.max(nextStart, Math.min(start + Math.round(fps * 0.9), lineEnd + Math.round(fps * 0.3)));
        cues.push({ index: cues.length + 1, start, end, text: group.map((w) => w.text).join(" "), words: group });
      });
    }
  }
  // never overlap the next cue
  for (let i = 0; i < cues.length - 1; i++) cues[i].end = Math.min(cues[i].end, cues[i + 1].start);
  return cues;
};

const pad = (n: number, size = 2) => String(n).padStart(size, "0");
const srtTime = (frame: number, fps: number) => {
  const ms = Math.round((frame / fps) * 1000);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms % 1000, 3)}`;
};

/** Standard SubRip text for the cues. */
export const toSrt = (cues: SubtitleCue[], fps: number) =>
  cues.map((c) => `${c.index}\n${srtTime(c.start, fps)} --> ${srtTime(c.end, fps)}\n${c.text}\n`).join("\n");
