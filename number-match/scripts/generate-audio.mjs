// Synthesizes every sound effect and the music bed for the series as WAV files.
// Everything is generated from code, so it is original and licence-free.
// Card sounds reuse the game's own Web Audio notes (520 / 740 / 220 Hz,
// and the 660-830-990 Hz win tune) so the videos sound like the real game.
// Usage: node scripts/generate-audio.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RATE = 44100;
const OUT = join(import.meta.dirname, "..", "public", "audio");
mkdirSync(OUT, { recursive: true });

let seed = 20261111;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;
const buffer = (seconds) => new Float32Array(Math.ceil(seconds * RATE));
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

/** Writes 16-bit mono (or stereo when `right` is given) WAV, normalised to `peakDb`. */
function writeWav(name, left, peakDb = -3, right) {
  const channels = right ? 2 : 1;
  let peak = 0;
  for (const v of left) peak = Math.max(peak, Math.abs(v));
  if (right) for (const v of right) peak = Math.max(peak, Math.abs(v));
  const target = Math.pow(10, peakDb / 20);
  const scale = peak > 0 ? target / peak : 0;
  const frames = left.length;
  const bytes = Buffer.alloc(44 + frames * 2 * channels);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(36 + frames * 2 * channels, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(channels, 22);
  bytes.writeUInt32LE(RATE, 24);
  bytes.writeUInt32LE(RATE * 2 * channels, 28);
  bytes.writeUInt16LE(2 * channels, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(frames * 2 * channels, 40);
  for (let i = 0; i < frames; i++) {
    const l = Math.max(-1, Math.min(1, left[i] * scale));
    bytes.writeInt16LE(Math.round(l * 32767), 44 + i * 2 * channels);
    if (right) {
      const r = Math.max(-1, Math.min(1, right[i] * scale));
      bytes.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
    }
  }
  writeFileSync(join(OUT, name), bytes);
  console.log("wrote", name);
}

function bandpass() {
  let low = 0;
  let band = 0;
  return (input, freq, q = 0.7) => {
    const f = 2 * Math.sin((Math.PI * Math.min(freq, RATE / 6)) / RATE);
    low += f * band;
    const high = input - low - q * band;
    band += f * high;
    return band;
  };
}

function tone(d, start, length, { from, to = from, type = "sine", attack = 0.004, decay = 6, amp = 1, curve = 1 }) {
  let phase = 0;
  const s = Math.floor(start * RATE);
  const n = Math.floor(length * RATE);
  for (let i = 0; i < n && s + i < d.length; i++) {
    const t = i / RATE;
    const freq = from * Math.pow(to / from, Math.pow(i / n, curve));
    phase += (2 * Math.PI * freq) / RATE;
    let w = Math.sin(phase);
    if (type === "triangle") w = (2 / Math.PI) * Math.asin(Math.sin(phase));
    const env = Math.min(1, t / attack) * Math.exp(-decay * t);
    d[s + i] += w * env * amp;
  }
}

/** Soft mallet/marimba note: fundamental + quick-decaying 4th harmonic. */
function mallet(d, start, freq, amp = 1, decay = 7) {
  tone(d, start, 1.2, { from: freq, decay, amp });
  tone(d, start, 0.4, { from: freq * 4, decay: decay * 4, amp: amp * 0.18 });
  tone(d, start, 0.6, { from: freq * 2, decay: decay * 2, amp: amp * 0.25 });
}

/** Warm bell for stings and chimes. */
function bell(d, start, freq, amp = 1, length = 2.4) {
  tone(d, start, length, { from: freq, decay: 2.2, amp });
  tone(d, start, length, { from: freq * 2.01, decay: 3.6, amp: amp * 0.35 });
  tone(d, start, length, { from: freq * 3.0, decay: 5.5, amp: amp * 0.15 });
}

function swish(d, start, length, lo, hi, amp = 1) {
  const bp = bandpass();
  const s = Math.floor(start * RATE);
  const n = Math.floor(length * RATE);
  for (let i = 0; i < n && s + i < d.length; i++) {
    const k = i / n;
    const env = Math.sin(Math.PI * Math.pow(k, 0.65)) ** 2;
    d[s + i] += bp(noise(), lo + (hi - lo) * Math.sin(Math.PI * k), 1.1) * env * amp;
  }
}

// ---------------- UI + teaching ----------------

{ const d = buffer(0.06); // click: mouse/button press
  for (let i = 0; i < d.length; i++) {
    const t = i / RATE;
    d[i] = noise() * Math.exp(-420 * t) * 0.5 + Math.sin(2 * Math.PI * 1900 * t) * Math.exp(-220 * t);
  }
  writeWav("click.wav", d, -6); }

{ const d = buffer(0.08); // tick: soft highlight tick
  tone(d, 0, 0.08, { from: 2400, to: 2200, decay: 90 });
  tone(d, 0, 0.05, { from: 4800, decay: 150, amp: 0.25 });
  writeWav("tick.wav", d, -10); }

for (const [name, f] of [["pop-low.wav", 520], ["pop.wav", 760], ["pop-high.wav", 1040]]) {
  const d = buffer(0.22);
  tone(d, 0, 0.22, { from: f * 1.5, to: f * 0.6, decay: 24, curve: 0.5 });
  tone(d, 0, 0.05, { from: f * 3, decay: 80, amp: 0.2 });
  writeWav(name, d, -6);
}

{ const d = buffer(0.75); swish(d, 0, 0.75, 300, 2600); writeWav("whoosh.wav", d, -9); }
{ const d = buffer(0.45); swish(d, 0, 0.45, 600, 3800); writeWav("whoosh-short.wav", d, -10); }

{ const d = buffer(2.2); // typing: a run of soft key clicks (loopable bed)
  let t = 0.02;
  while (t < 2.1) {
    const s = Math.floor(t * RATE);
    const pitch = 1300 + rand() * 900;
    for (let i = 0; i < 0.03 * RATE && s + i < d.length; i++) {
      const x = i / RATE;
      d[s + i] += (noise() * 0.5 + Math.sin(2 * Math.PI * pitch * x)) * Math.exp(-280 * x) * (0.55 + rand() * 0.45);
    }
    t += 0.07 + rand() * 0.07;
  }
  writeWav("typing.wav", d, -12); }

{ const d = buffer(0.25); // key: a single keypress (bigger, for SHIFT / ENTER demos)
  for (let i = 0; i < d.length; i++) {
    const t = i / RATE;
    d[i] = (noise() * 0.6 + Math.sin(2 * Math.PI * 900 * t)) * Math.exp(-90 * t);
  }
  tone(d, 0.012, 0.1, { from: 180, decay: 50, amp: 0.6 });
  writeWav("key.wav", d, -8); }

{ const d = buffer(0.7); // save: two-note confirm
  bell(d, 0, midi(76), 0.7, 0.6);
  bell(d, 0.09, midi(83), 0.8, 0.6);
  writeWav("save.wav", d, -9); }

{ const d = buffer(0.9); // run: rising swoosh + bright blip
  swish(d, 0, 0.5, 400, 3000, 0.7);
  tone(d, 0.28, 0.5, { from: midi(79), to: midi(86), decay: 7, type: "triangle", amp: 0.8, curve: 0.3 });
  writeWav("run.wav", d, -8); }

{ const d = buffer(1.4); // sparkle: little tinkles
  for (let k = 0; k < 9; k++) {
    const f = midi(88 + Math.floor(rand() * 10));
    tone(d, k * 0.07 + rand() * 0.03, 0.6, { from: f, decay: 9, amp: 0.4 + rand() * 0.4 });
  }
  writeWav("sparkle.wav", d, -12); }

{ const d = buffer(0.35); // thunk: box lands (structure diagrams)
  tone(d, 0, 0.3, { from: 260, to: 130, decay: 20, curve: 0.5 });
  for (let i = 0; i < 0.012 * RATE; i++) d[i] += noise() * (1 - i / (0.012 * RATE)) * 0.4;
  writeWav("thunk.wav", d, -9); }

{ const d = buffer(0.5); // uh-oh: gentle error (debugging)
  tone(d, 0, 0.22, { from: midi(67), decay: 8, type: "triangle", amp: 0.8 });
  tone(d, 0.18, 0.3, { from: midi(63), decay: 7, type: "triangle", amp: 0.8 });
  writeWav("uh-oh.wav", d, -10); }

// ---------------- the game's own sounds ----------------

{ const d = buffer(0.32); // flip: card swish + the game's 520 Hz triangle blip
  swish(d, 0, 0.2, 1200, 4200, 0.5);
  tone(d, 0.02, 0.12, { from: 520, decay: 32, type: "triangle", amp: 1 });
  writeWav("flip.wav", d, -8); }

{ const d = buffer(1.2); // match: the game's 740 Hz, dressed as a warm chime
  bell(d, 0, 740, 1, 1.1);
  bell(d, 0.07, 740 * 1.5, 0.45, 1.0);
  writeWav("match.wav", d, -8); }

{ const d = buffer(0.5); // miss: the game's soft 220 Hz
  tone(d, 0, 0.45, { from: 220, to: 205, decay: 7, amp: 1 });
  tone(d, 0, 0.45, { from: 440, decay: 12, amp: 0.15 });
  writeWav("miss.wav", d, -11); }

{ const d = buffer(1.6); // win: the game's three-note tune 660 / 830 / 990
  bell(d, 0, 660, 0.9, 1.2);
  bell(d, 0.13, 830, 0.9, 1.2);
  bell(d, 0.28, 990, 1, 1.3);
  writeWav("win.wav", d, -6); }

// ---------------- cinematic ----------------

{ // ambient: dark, warm swell for the Video 1 hook (8 s)
  const L = 8;
  const d = buffer(L);
  for (const [n, a] of [[38, 0.5], [45, 0.35], [50, 0.3], [57, 0.18], [62, 0.12]]) {
    for (const det of [-0.004, 0.004]) {
      const f = midi(n) * (1 + det);
      for (let i = 0; i < d.length; i++) {
        const t = i / RATE;
        const env = Math.min(1, t / 3) * Math.min(1, (L - t) / 2.5);
        d[i] += Math.sin(2 * Math.PI * f * t + det * 50) * env * a * (0.8 + 0.2 * Math.sin(t * 0.9 + n));
      }
    }
  }
  const bp = bandpass();
  for (let i = 0; i < d.length; i++) {
    const t = i / RATE;
    d[i] += bp(noise(), 900 + 500 * Math.sin(t * 0.5), 0.9) * 0.05 * Math.min(1, t / 3) * Math.min(1, (L - t) / 2.5);
  }
  writeWav("ambient.wav", d, -8); }

{ // sting: closing audio signature (D major add9 bloom + bell motif)
  const L = 4.5;
  const d = buffer(L);
  for (const n of [50, 57, 62, 66, 69, 76]) {
    const f = midi(n);
    for (let i = 0; i < d.length; i++) {
      const t = i / RATE;
      const env = Math.min(1, t / 0.25) * Math.exp(-0.9 * t);
      d[i] += Math.sin(2 * Math.PI * f * t) * env * 0.16;
    }
  }
  [74, 78, 81, 86].forEach((n, i) => bell(d, 0.05 + i * 0.12, midi(n), 0.55, 3));
  writeWav("sting.wav", d, -6); }

// ---------------- music bed ----------------
// Original, warm and curious: D - Bm - G - A (with sus/add colours) at 100 BPM.
// Marimba arpeggios, soft pad, round bass, light shaker. Seamless loop.
{
  const BPM = 100;
  const beat = 60 / BPM;
  const bar = beat * 4;
  const chords = [
    [38, 62, 66, 69, 76], // Dadd9
    [35, 59, 62, 66, 73], // Bm7
    [31, 59, 62, 67, 74], // Gmaj7
    [33, 57, 61, 64, 71], // A6/9-ish
  ];
  const bars = 16;
  const length = bars * bar;
  const L = buffer(length + 3);
  const R = buffer(length + 3);
  const both = (fn) => { fn(L, 1); fn(R, 1); };

  for (let b = 0; b < bars; b++) {
    const chord = chords[b % 4];
    const t0 = b * bar;
    // pad (slightly wider in stereo)
    for (const n of chord.slice(1, 4)) {
      [[L, -0.003], [R, 0.003]].forEach(([d, det]) => {
        const f = midi(n) * (1 + det);
        const s = Math.floor(t0 * RATE);
        const len = Math.floor((bar + 0.8) * RATE);
        for (let i = 0; i < len; i++) {
          const t = i / RATE;
          const env = Math.min(1, t / 0.6) * Math.min(1, Math.max(0, (bar + 0.8 - t) / 0.8));
          d[s + i] += Math.sin(2 * Math.PI * f * t) * env * 0.035;
        }
      });
    }
    // bass
    both((d) => tone(d, t0, beat * 2.2, { from: midi(chord[0] + 12), decay: 1.8, amp: 0.3, attack: 0.012 }));
    both((d) => tone(d, t0 + beat * 2.5, beat * 1.4, { from: midi(chord[0] + 12), decay: 2.4, amp: 0.2, attack: 0.012 }));
    // marimba arpeggio (from bar 2), alternating left/right a little
    if (b >= 1) {
      const pattern = b >= 8 ? [1, 3, 2, 4, 3, 2, 4, 3] : [1, 2, 3, 4, 3, 2, 3, 4];
      pattern.forEach((p, i) => {
        const f = midi(chord[p] + 12);
        const t = t0 + (i * beat) / 2;
        const pan = i % 2 === 0 ? [0.11, 0.07] : [0.07, 0.11];
        mallet(L, t, f, pan[0], 7);
        mallet(R, t, f, pan[1], 7);
      });
    }
    // little melody motif on bars 4-7 and 12-15
    if ((b >= 4 && b < 8) || b >= 12) {
      const motif = [[0, 4], [1.5, 3], [2, 2], [3, 4]];
      motif.forEach(([at, p]) => {
        const f = midi(chord[p] + 24);
        both((d) => bell(d, t0 + at * beat, f, 0.05, 1.2));
      });
    }
    // shaker on off-beats (second half)
    if (b >= 8) {
      for (let i = 1; i < 8; i += 2) {
        const s = Math.floor((t0 + (i * beat) / 2) * RATE);
        const bpL = bandpass();
        const bpR = bandpass();
        for (let j = 0; j < 0.07 * RATE; j++) {
          const e = Math.exp(-55 * (j / RATE)) * 0.035;
          L[s + j] += bpL(noise(), 7200, 0.6) * e;
          R[s + j] += bpR(noise(), 7600, 0.6) * e;
        }
      }
    }
  }
  const loopLen = Math.floor(length * RATE);
  const mL = new Float32Array(loopLen);
  const mR = new Float32Array(loopLen);
  for (let i = 0; i < L.length; i++) {
    mL[i % loopLen] += L[i];
    mR[i % loopLen] += R[i];
  }
  writeWav("music-bed.wav", mL, -4, mR);
}
