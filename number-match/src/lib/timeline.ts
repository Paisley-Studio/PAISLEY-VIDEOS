// Pure module (no Remotion imports) so Node scripts can reuse it for SRT/VTT.
// Builds a video's timeline from its narration script and measured voice timings:
// every scene lasts as long as its narration (plus lead, gaps and tail).

export const FPS = 30;

export type Word = { t: number; w: string };
export type Timing = { text: string; duration: number; words: Word[] };

export type ScriptLine = { id: string; text: string; caption?: string; gap?: number };
export type ScriptScene = {
  id: string;
  name: string;
  lead?: number;
  tail?: number;
  minDuration?: number;
  lines: ScriptLine[];
  [storyboard: string]: unknown;
};
export type VideoScript = {
  video: number;
  compositionId: string;
  title: string;
  subtitle: string;
  output: string;
  voice: string;
  rate: string;
  scenes: ScriptScene[];
};

export type LineTiming = {
  id: string;
  text: string;
  caption: string;
  start: number; // frame, relative to the scene
  durationInFrames: number;
  words: { frame: number; word: string }[]; // frames relative to the scene
};

export type SceneTiming = {
  id: string;
  name: string;
  from: number; // absolute frame
  durationInFrames: number;
  lines: LineTiming[];
};

export const normalize = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

export const createTimeline = (script: VideoScript, timingsJson: unknown) => {
  const timings = timingsJson as Record<string, Timing>;
  const scenes: SceneTiming[] = [];
  let cursor = 0;
  for (const scene of script.scenes) {
    let t = scene.lead ?? 0.5;
    const lines: LineTiming[] = [];
    scene.lines.forEach((line, index) => {
      if (index > 0) t += line.gap ?? 0.4;
      const timing = timings[line.id];
      if (!timing || timing.text !== line.text) {
        throw new Error(
          `Narration for line "${line.id}" (video ${script.video}) is missing or out of date. Run: python scripts/generate-voiceover.py ${script.video}`,
        );
      }
      lines.push({
        id: line.id,
        text: line.text,
        caption: line.caption ?? line.text,
        start: Math.round(t * FPS),
        durationInFrames: Math.ceil(timing.duration * FPS),
        words: timing.words.map((w) => ({ frame: Math.round((t + w.t) * FPS), word: normalize(w.w) })),
      });
      t += timing.duration;
    });
    t += scene.tail ?? 0.8;
    const durationInFrames = Math.round(Math.max(t, scene.minDuration ?? 0) * FPS);
    scenes.push({ id: scene.id, name: scene.name, from: cursor, durationInFrames, lines });
    cursor += durationInFrames;
  }

  const getScene = (id: string) => {
    const scene = scenes.find((s) => s.id === id);
    if (!scene) throw new Error(`Unknown scene ${id}`);
    return scene;
  };

  /** Frame cues for one scene, relative to the start of that scene. */
  const cuesFor = (sceneId: string) => {
    const scene = getScene(sceneId);
    const find = (lineId: string) => {
      const line = scene.lines.find((l) => l.id === lineId);
      if (!line) throw new Error(`Unknown line ${lineId} in ${sceneId}`);
      return line;
    };
    return {
      duration: scene.durationInFrames,
      line: (lineId: string) => find(lineId).start,
      end: (lineId: string) => {
        const l = find(lineId);
        return l.start + l.durationInFrames;
      },
      /** Frame where a spoken word starts (nth occurrence, 0-based). */
      word: (lineId: string, word: string, nth = 0) => {
        const l = find(lineId);
        const target = normalize(word);
        const exact = l.words.filter((w) => w.word === target);
        const matches = exact.length > 0 ? exact : l.words.filter((w) => w.word.startsWith(target));
        const match = matches[nth] ?? matches[matches.length - 1];
        if (!match) throw new Error(`Word "${word}" not in line ${lineId}`);
        return match.frame;
      },
    };
  };

  return { SCENES: scenes, TOTAL_FRAMES: cursor, getScene, cuesFor };
};

export type Timeline = ReturnType<typeof createTimeline>;
export type Cues = ReturnType<Timeline["cuesFor"]>;
