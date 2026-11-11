// A deterministic, frame-based copy of course-project/script.js's rules.
// Give it a deck and a list of clicks; get the exact game state at any frame,
// plus a list of sound events. Every gameplay shot in the series uses this,
// so the stats on screen always obey the real game logic.

import { EASE_FLIP, FLIP_FRAMES } from "./anim";

export const MISMATCH_FRAMES = Math.round(0.85 * 30); // setTimeout(..., 850)
export const WIN_DELAY_FRAMES = Math.round(0.45 * 30); // setTimeout(..., 450)

export type Click = { f: number; i: number };
export type SoundEvent = { f: number; kind: "flip" | "match" | "miss" | "win" | "blocked" };

type CardTrack = { flips: { f: number; up: boolean }[]; matchedAt: number | null; missAt: number | null };

export type GameState = {
  cards: { number: number; angle: number; matched: boolean; wrong: number }[];
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  seconds: number;
  message: string;
  progress: number; // 0..1 as rendered (with the .35s width transition)
  winOverlay: number; // 0..1 opacity of the win overlay
  firstCard: number | null;
  secondCard: number | null;
  locked: boolean;
};

export const formatTime = (total: number) =>
  `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;

/** Precompute the whole game once; then `at(frame)` is cheap. */
export const simulateGame = (deck: number[], clicks: Click[], fps = 30) => {
  const totalPairs = deck.length / 2;
  const tracks: CardTrack[] = deck.map(() => ({ flips: [], matchedAt: null, missAt: null }));
  const sounds: SoundEvent[] = [];
  const moveFrames: number[] = [];
  const matchFrames: number[] = [];
  const messages: { f: number; text: string }[] = [{ f: -Infinity, text: "Choose any card to begin!" }];
  let first: number | null = null;
  let lockUntil = -Infinity;
  let startFrame: number | null = null;
  let winFrame: number | null = null;
  let matched = 0;
  const selections: { f: number; first: number | null; second: number | null }[] = [{ f: -Infinity, first: null, second: null }];

  for (const { f, i } of [...clicks].sort((a, b) => a.f - b.f)) {
    const t = tracks[i];
    const up = t.flips.length > 0 && t.flips[t.flips.length - 1].up && t.flips[t.flips.length - 1].f <= f;
    if (f < lockUntil || i === first || t.matchedAt !== null || up || winFrame !== null) {
      sounds.push({ f, kind: "blocked" });
      continue;
    }
    if (startFrame === null) startFrame = f;
    t.flips.push({ f, up: true });
    sounds.push({ f, kind: "flip" });
    if (first === null) {
      first = i;
      messages.push({ f, text: "Great! Now find its matching number." });
      selections.push({ f, first: i, second: null });
      continue;
    }
    const a = first;
    moveFrames.push(f);
    selections.push({ f, first: a, second: i });
    if (deck[a] === deck[i]) {
      tracks[a].matchedAt = f;
      t.matchedAt = f;
      matched += 1;
      matchFrames.push(f);
      sounds.push({ f, kind: "match" });
      messages.push({ f, text: "Yes! You found a matching pair. Well done!" });
      selections.push({ f: f + 1, first: null, second: null });
      if (matched === totalPairs) {
        winFrame = f + WIN_DELAY_FRAMES;
        messages.push({ f, text: "Amazing! You matched every pair." });
        sounds.push({ f: winFrame, kind: "win" });
      }
    } else {
      sounds.push({ f, kind: "miss" });
      messages.push({ f, text: "Not a match this time. Have another try!" });
      tracks[a].missAt = f;
      t.missAt = f;
      const back = f + MISMATCH_FRAMES;
      tracks[a].flips.push({ f: back, up: false });
      t.flips.push({ f: back, up: false });
      lockUntil = back;
      selections.push({ f: back, first: null, second: null });
    }
    first = null;
  }

  const stopFrame = winFrame !== null ? winFrame - WIN_DELAY_FRAMES : null;

  const angleAt = (t: CardTrack, frame: number) => {
    let angle = 0;
    for (const flip of t.flips) {
      if (flip.f > frame) break;
      const p = EASE_FLIP(Math.min(1, (frame - flip.f) / FLIP_FRAMES));
      angle = flip.up ? angle + (180 - angle) * p : angle * (1 - p);
    }
    return angle;
  };

  const at = (frame: number): GameState => {
    const done = (fs: number[]) => fs.filter((x) => x <= frame).length;
    const pairs = done(matchFrames);
    const end = stopFrame !== null && frame >= stopFrame ? stopFrame : frame;
    const seconds = startFrame === null || frame < startFrame ? 0 : Math.floor((end - startFrame) / fps);
    // progress-fill animates its width over .35s
    let shown = 0;
    for (let k = 0; k < matchFrames.length; k++) {
      if (matchFrames[k] > frame) break;
      const p = Math.min(1, (frame - matchFrames[k]) / (0.35 * fps));
      shown = k / totalPairs + p * (1 / totalPairs);
    }
    const sel = [...selections].reverse().find((s) => s.f <= frame)!;
    return {
      cards: deck.map((number, i) => {
        const t = tracks[i];
        const miss = t.missAt !== null && frame >= t.missAt && frame < t.missAt + MISMATCH_FRAMES ? 1 : 0;
        return {
          number,
          angle: angleAt(t, frame),
          matched: t.matchedAt !== null && frame >= t.matchedAt,
          wrong: miss,
        };
      }),
      moves: done(moveFrames),
      matchedPairs: pairs,
      totalPairs,
      seconds,
      message: [...messages].reverse().find((m) => m.f <= frame)!.text,
      progress: shown,
      winOverlay: winFrame === null ? 0 : Math.max(0, Math.min(1, (frame - winFrame) / (0.3 * fps))),
      firstCard: sel.first,
      secondCard: sel.second,
      locked: frame < lockUntil && sel.second !== null,
    };
  };

  return { at, sounds, winFrame, startFrame, totalPairs };
};

export type GameSim = ReturnType<typeof simulateGame>;
