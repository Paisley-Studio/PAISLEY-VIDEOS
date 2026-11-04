// Synthesizes the series' sound effects and a light music bed as WAV files.
// Everything is generated from code, so there are no licensing questions.
// Usage: node scripts/generate-audio.mjs

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RATE = 44100;
const OUT = join(import.meta.dirname, "..", "public", "audio");
mkdirSync(OUT, { recursive: true });

// Deterministic random so the files are the same every run
let seed = 12345;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;

const buffer = (seconds) => new Float32Array(Math.ceil(seconds * RATE));

function writeWav(name, data, gain = 1) {
  let peak = 0;
  for (const v of data) peak = Math.max(peak, Math.abs(v));
  const scale = peak > 0 ? (0.9 / peak) * gain : 0;
  const bytes = Buffer.alloc(44 + data.length * 2);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(36 + data.length * 2, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(RATE, 24);
  bytes.writeUInt32LE(RATE * 2, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(data.length * 2, 40);
  data.forEach((v, i) => {
    const s = Math.max(-1, Math.min(1, v * scale));
    bytes.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  });
  writeFileSync(join(OUT, name), bytes);
  console.log("wrote", name);
}

// Simple resonant band-pass (state variable filter)
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

// A sweeping sine/triangle tone
function tone(data, start, length, { from, to, type = "sine", attack = 0.003, decay = 6, amp = 1, curve = 1 }) {
  let phase = 0;
  const startI = Math.floor(start * RATE);
  const n = Math.floor(length * RATE);
  for (let i = 0; i < n && startI + i < data.length; i++) {
    const t = i / RATE;
    const k = Math.pow(i / n, curve);
    const freq = from * Math.pow(to / from, k);
    phase += (2 * Math.PI * freq) / RATE;
    let wave = Math.sin(phase);
    if (type === "triangle") wave = (2 / Math.PI) * Math.asin(Math.sin(phase));
    const env = Math.min(1, t / attack) * Math.exp(-decay * t);
    data[startI + i] += wave * env * amp;
  }
}

// ---------- SOUND EFFECTS ----------

{ // pop: a bubbly UI pop for cards and labels
  const d = buffer(0.18);
  tone(d, 0, 0.18, { from: 950, to: 320, decay: 28, curve: 0.5 });
  tone(d, 0, 0.05, { from: 2400, to: 1800, decay: 90, amp: 0.25 });
  writeWav("pop.wav", d, 0.8);
}

{ // tick: a small crisp tick for list items and nodes
  const d = buffer(0.06);
  tone(d, 0, 0.06, { from: 2600, to: 2300, decay: 110 });
  tone(d, 0, 0.06, { from: 5200, to: 5000, decay: 160, amp: 0.3 });
  writeWav("tick.wav", d, 0.6);
}

{ // whoosh: a soft air swish for movement and scene changes
  const d = buffer(0.7);
  const bp = bandpass();
  for (let i = 0; i < d.length; i++) {
    const k = i / d.length;
    const env = Math.sin(Math.PI * Math.pow(k, 0.7)) ** 2;
    const freq = 300 + 2400 * Math.sin(Math.PI * k);
    d[i] = bp(noise(), freq, 1.1) * env;
  }
  writeWav("whoosh.wav", d, 0.7);
}

{ // jump: a friendly upward "bloop" for the dino
  const d = buffer(0.22);
  tone(d, 0, 0.22, { from: 280, to: 820, type: "triangle", decay: 14, curve: 0.6 });
  writeWav("jump.wav", d, 0.6);
}

{ // thud: crash
  const d = buffer(0.5);
  tone(d, 0, 0.5, { from: 140, to: 48, decay: 9, curve: 0.4 });
  const bp = bandpass();
  for (let i = 0; i < 0.12 * RATE; i++) {
    d[i] += bp(noise(), 400, 1) * Math.exp(-30 * (i / RATE)) * 0.8;
  }
  writeWav("thud.wav", d, 0.9);
}

{ // click: mouse/button click
  const d = buffer(0.05);
  for (let i = 0; i < d.length; i++) {
    const t = i / RATE;
    d[i] = noise() * Math.exp(-400 * t) * 0.6 + Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-200 * t);
  }
  writeWav("click.wav", d, 0.6);
}

{ // pencil: scratchy graphite strokes
  const d = buffer(1.3);
  const bp = bandpass();
  let stroke = 0;
  for (let i = 0; i < d.length; i++) {
    const t = i / RATE;
    if (i % Math.floor(RATE / 9) === 0) stroke = 0.4 + rand() * 0.6;
    const wobble = 0.5 + 0.5 * Math.sin(2 * Math.PI * 9 * t);
    const fade = Math.min(1, t / 0.05) * Math.min(1, (1.3 - t) / 0.15);
    d[i] = bp(noise(), 3800 + 900 * Math.sin(t * 13), 0.5) * wobble * stroke * fade;
  }
  writeWav("pencil.wav", d, 0.45);
}

{ // eraser: lower rubbing scrub
  const d = buffer(1.0);
  const bp = bandpass();
  for (let i = 0; i < d.length; i++) {
    const t = i / RATE;
    const rub = 0.5 + 0.5 * Math.sin(2 * Math.PI * 7 * t);
    const fade = Math.min(1, t / 0.05) * Math.min(1, (1 - t) / 0.2);
    d[i] = bp(noise(), 1200, 0.6) * rub * fade;
  }
  writeWav("eraser.wav", d, 0.45);
}

{ // chime: warm two-note success chime
  const d = buffer(1.8);
  const note = (start, freq, amp) => {
    tone(d, start, 1.7, { from: freq, to: freq, decay: 2.6, amp });
    tone(d, start, 1.7, { from: freq * 2, to: freq * 2, decay: 4, amp: amp * 0.3 });
    tone(d, start, 1.7, { from: freq * 3, to: freq * 3, decay: 6, amp: amp * 0.12 });
  };
  note(0, 659.25, 1);
  note(0.09, 987.77, 0.8);
  writeWav("chime.wav", d, 0.6);
}

{ // levelup: quick bright arpeggio
  const d = buffer(0.6);
  [1046.5, 1318.5, 1568, 2093].forEach((f, i) => tone(d, i * 0.06, 0.35, { from: f, to: f, decay: 9, type: "triangle" }));
  writeWav("levelup.wav", d, 0.5);
}

{ // thunk: pinning a card to a board
  const d = buffer(0.2);
  tone(d, 0, 0.2, { from: 220, to: 120, decay: 22, curve: 0.5 });
  for (let i = 0; i < 0.01 * RATE; i++) d[i] += noise() * (1 - i / (0.01 * RATE)) * 0.5;
  writeWav("thunk.wav", d, 0.7);
}

{ // typing: a burst of soft key clicks
  const d = buffer(1.8);
  let t = 0.02;
  while (t < 1.7) {
    const start = Math.floor(t * RATE);
    const pitch = 1400 + rand() * 900;
    for (let i = 0; i < 0.03 * RATE && start + i < d.length; i++) {
      const s = i / RATE;
      d[start + i] += (noise() * 0.5 + Math.sin(2 * Math.PI * pitch * s)) * Math.exp(-260 * s) * (0.6 + rand() * 0.4);
    }
    t += 0.055 + rand() * 0.07;
  }
  writeWav("typing.wav", d, 0.45);
}

{ // scribble: a fast cross-out stroke
  const d = buffer(0.45);
  const bp = bandpass();
  for (let i = 0; i < d.length; i++) {
    const t = i / RATE;
    const env = Math.sin(Math.PI * (t / 0.45));
    d[i] = bp(noise(), 2600 + 1400 * Math.sin(t * 40), 0.5) * env;
  }
  writeWav("scribble.wav", d, 0.55);
}

// ---------- MUSIC BED ----------
// Warm, light and positive: Cmaj7 - Am7 - Fmaj7 - G6 at 96 BPM.
{
  const BPM = 96;
  const beat = 60 / BPM;
  const bar = beat * 4;
  const chords = [
    [48, 60, 64, 67, 71], // Cmaj7
    [45, 57, 60, 64, 67], // Am7
    [41, 57, 60, 64, 65], // Fmaj7 (voiced up)
    [43, 55, 59, 62, 64], // G6
  ];
  const bars = 16; // 4 passes of the progression
  const length = bars * bar;
  const d = buffer(length + 2);
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  for (let b = 0; b < bars; b++) {
    const chord = chords[b % 4];
    const t0 = b * bar;
    // pad: soft detuned sines
    for (const n of chord.slice(1)) {
      for (const detune of [-0.003, 0.003]) {
        const f = midi(n) * (1 + detune);
        const start = Math.floor(t0 * RATE);
        const len = Math.floor((bar + 0.6) * RATE);
        for (let i = 0; i < len; i++) {
          const t = i / RATE;
          const env = Math.min(1, t / 0.5) * Math.min(1, Math.max(0, (bar + 0.6 - t) / 0.6));
          d[start + i] += Math.sin(2 * Math.PI * f * t) * env * 0.05;
        }
      }
    }
    // bass on beats 1 and 3
    for (const beatIndex of [0, 2]) {
      tone(d, t0 + beatIndex * beat, beat * 1.8, { from: midi(chord[0]), to: midi(chord[0]), decay: 2.2, amp: 0.32, attack: 0.01 });
    }
    // arpeggio: eighth-note plucks, pattern varies in later passes
    const pattern = b >= 8 ? [1, 2, 3, 4, 3, 2, 4, 3] : [1, 3, 2, 4, 1, 3, 2, 4];
    if (b >= 2) {
      pattern.forEach((p, i) => {
        const f = midi(chord[p] + 12);
        tone(d, t0 + (i * beat) / 2, 0.5, { from: f, to: f, decay: 8, amp: 0.09, attack: 0.004 });
      });
    }
    // light shaker on off-beats
    if (b >= 4) {
      const bp = bandpass();
      for (let i = 0; i < 8; i++) {
        if (i % 2 === 0) continue;
        const start = Math.floor((t0 + (i * beat) / 2) * RATE);
        for (let j = 0; j < 0.06 * RATE; j++) {
          d[start + j] += bp(noise(), 7000, 0.6) * Math.exp(-60 * (j / RATE)) * 0.06;
        }
      }
    }
    // soft kick on 1 and 3 in the second half
    if (b >= 8) {
      for (const beatIndex of [0, 2]) tone(d, t0 + beatIndex * beat, 0.25, { from: 110, to: 45, decay: 16, amp: 0.35 });
    }
  }

  // wrap the tail into the start so the loop is seamless
  const loopLen = Math.floor(length * RATE);
  const music = new Float32Array(loopLen);
  for (let i = 0; i < d.length; i++) music[i % loopLen] += d[i];
  writeWav("music-bed.wav", music, 0.85);
}

// =====================================================================
// Video 6 ("Welcome to the World of Coding") additions.
// Appended after the original files so those stay byte-identical.
// =====================================================================

{ // notify: soft two-note phone notification
  const d = buffer(0.9);
  tone(d, 0, 0.8, { from: 1174.7, to: 1174.7, decay: 7, amp: 1 });
  tone(d, 0.11, 0.8, { from: 1568, to: 1568, decay: 6, amp: 0.9 });
  tone(d, 0.11, 0.8, { from: 3136, to: 3136, decay: 14, amp: 0.12 });
  writeWav("notify.wav", d, 0.55);
}

{ // swipe: quick, bright interface swish
  const d = buffer(0.32);
  const bp = bandpass();
  for (let i = 0; i < d.length; i++) {
    const k = i / d.length;
    const env = Math.sin(Math.PI * Math.pow(k, 0.5)) ** 2;
    d[i] = bp(noise(), 1800 + 4200 * k, 0.9) * env;
  }
  writeWav("swipe.wav", d, 0.5);
}

{ // riser: a 2.4 s lift into a big moment
  const len = 2.4;
  const d = buffer(len);
  const bp = bandpass();
  for (let i = 0; i < d.length; i++) {
    const k = i / d.length;
    d[i] = bp(noise(), 400 + 5200 * k * k, 0.8) * k * k * 0.9;
  }
  tone(d, 0, len, { from: 220, to: 880, decay: 0, amp: 0.18, curve: 2, attack: 1.2 });
  writeWav("riser.wav", d, 0.55);
}

{ // impact: soft cinematic low hit with a long tail
  const d = buffer(2.2);
  tone(d, 0, 2.2, { from: 90, to: 38, decay: 2.4, curve: 0.3, amp: 1 });
  tone(d, 0, 2.2, { from: 180, to: 120, decay: 4, amp: 0.25 });
  const bp = bandpass();
  for (let i = 0; i < 0.5 * RATE; i++) d[i] += bp(noise(), 600, 0.8) * Math.exp(-9 * (i / RATE)) * 0.5;
  writeWav("impact.wav", d, 0.8);
}

{ // sparkle: delicate shimmer for reveals
  const d = buffer(1.2);
  [2093, 2637, 3136, 3951, 4186].forEach((f, i) => tone(d, i * 0.045, 1.0, { from: f, to: f, decay: 5, amp: 0.5 - i * 0.06 }));
  writeWav("sparkle.wav", d, 0.4);
}

{ // ambience: morning air with distant birds (seamless 12 s loop)
  const len = 12;
  const d = buffer(len);
  const lp = bandpass();
  for (let i = 0; i < d.length; i++) {
    const t = i / RATE;
    const swell = 0.75 + 0.25 * Math.sin((2 * Math.PI * t) / len);
    d[i] = lp(noise(), 260, 1.2) * 0.9 * swell;
  }
  // distant bird chirps: quick falling sines
  const birds = [0.8, 1.05, 3.4, 3.6, 3.78, 6.2, 7.9, 8.1, 10.4, 10.62];
  birds.forEach((s) => {
    const f = 2600 + rand() * 1400;
    tone(d, s, 0.09, { from: f * 1.25, to: f, decay: 30, amp: 0.05 });
  });
  writeWav("ambience-morning.wav", d, 0.6);
}

// ---------- STORY SCORE (three stems that layer on top of each other) ----------
// Uplifting and cinematic: Fmaj9 - Am7 - Cmaj7/G - Gsus at 92 BPM. All stems share
// the same length, so they stay locked together when looped and can be faded in
// and out independently as the story builds.
{
  const BPM = 92;
  const beat = 60 / BPM;
  const bar = beat * 4;
  const bars = 16;
  const length = bars * bar;
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);
  const chords = [
    [41, 57, 60, 64, 67], // Fmaj9 (F A C E G)
    [45, 57, 60, 64, 67], // Am7
    [43, 55, 60, 64, 71], // Cmaj7/G
    [43, 55, 60, 62, 67], // Gsus
  ];
  const loopWrap = (d, name, gain) => {
    const loopLen = Math.floor(length * RATE);
    const out = new Float32Array(loopLen);
    for (let i = 0; i < d.length; i++) out[i % loopLen] += d[i];
    writeWav(name, out, gain);
  };

  { // stem 1 - pads + felt-piano notes: present from the first frame
    const d = buffer(length + 3);
    for (let b = 0; b < bars; b++) {
      const chord = chords[b % 4];
      const t0 = b * bar;
      for (const n of chord.slice(1)) {
        for (const detune of [-0.004, 0, 0.004]) {
          const f = midi(n) * (1 + detune);
          const start = Math.floor(t0 * RATE);
          const len = Math.floor((bar + 1.2) * RATE);
          for (let i = 0; i < len; i++) {
            const t = i / RATE;
            const env = Math.min(1, t / 0.9) * Math.min(1, Math.max(0, (bar + 1.2 - t) / 1.2));
            d[start + i] += (Math.sin(2 * Math.PI * f * t) + 0.18 * Math.sin(4 * Math.PI * f * t)) * env * 0.035;
          }
        }
      }
      // felt piano: chord tones spread over the bar
      [0, 1.5, 2.5].forEach((beatPos, i) => {
        const f = midi(chord[[2, 3, 4][i]] + 12);
        tone(d, t0 + beatPos * beat, 2.4, { from: f, to: f, decay: 1.6, amp: 0.13, attack: 0.008 });
        tone(d, t0 + beatPos * beat, 2.4, { from: f * 2, to: f * 2, decay: 3.5, amp: 0.03, attack: 0.008 });
      });
    }
    loopWrap(d, "story-pads.wav", 0.8);
  }

  { // stem 2 - pulse: bass + eighth-note arpeggio
    const d = buffer(length + 3);
    for (let b = 0; b < bars; b++) {
      const chord = chords[b % 4];
      const t0 = b * bar;
      for (let i = 0; i < 8; i++) {
        const f = midi(chord[0]);
        tone(d, t0 + (i * beat) / 2, beat * 0.5, { from: f, to: f, decay: 5, amp: i % 2 === 0 ? 0.38 : 0.22, attack: 0.006 });
      }
      const pattern = [1, 2, 3, 4, 3, 2, 4, 2];
      pattern.forEach((p, i) => {
        const f = midi(chord[p] + 12);
        tone(d, t0 + (i * beat) / 2, 0.45, { from: f, to: f, decay: 9, amp: 0.11, type: "triangle", attack: 0.003 });
      });
    }
    loopWrap(d, "story-pulse.wav", 0.75);
  }

  { // stem 3 - drums: kick, soft clap and shaker for the energetic sections
    const d = buffer(length + 3);
    for (let b = 0; b < bars; b++) {
      const t0 = b * bar;
      for (const k of [0, 1.5, 2]) tone(d, t0 + k * beat, 0.3, { from: 120, to: 42, decay: 14, amp: 0.9, curve: 0.4 });
      for (const k of [1, 3]) {
        const bp = bandpass();
        const start = Math.floor((t0 + k * beat) * RATE);
        for (let j = 0; j < 0.18 * RATE; j++) d[start + j] += bp(noise(), 1500, 0.7) * Math.exp(-22 * (j / RATE)) * 0.55;
      }
      const bp = bandpass();
      for (let i = 0; i < 16; i++) {
        const start = Math.floor((t0 + (i * beat) / 4) * RATE);
        const accent = i % 4 === 2 ? 1 : 0.5;
        for (let j = 0; j < 0.05 * RATE; j++) d[start + j] += bp(noise(), 8000, 0.6) * Math.exp(-70 * (j / RATE)) * 0.12 * accent;
      }
    }
    loopWrap(d, "story-drums.wav", 0.7);
  }
}
