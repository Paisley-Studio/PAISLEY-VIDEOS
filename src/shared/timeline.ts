export const FPS = 30;

type Word = { t: number; w: string };
type Timing = { text: string; duration: number; words: Word[] };

type ScriptLine = { id: string; text: string; gap?: number };
type ScriptScene = {
  id: string;
  name: string;
  lead?: number;
  tail?: number;
  minDuration?: number;
  lines: ScriptLine[];
};
export type VideoScript = { scenes: ScriptScene[] };

export type LineTiming = {
  id: string;
  text: string;
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

const normalize = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

/**
 * Builds a video's timeline from its narration script and the measured
 * voiceover timings. Every scene's length follows its narration.
 */
export const createTimeline = (script: VideoScript, timingsJson: unknown) => {
  const timings = timingsJson as Record<string, Timing>;
  const scenes: SceneTiming[] = [];
  let cursor = 0;
  for (const scene of script.scenes) {
    let t = scene.lead ?? 0.5;
    const lines: LineTiming[] = [];
    scene.lines.forEach((line, index) => {
      if (index > 0) t += line.gap ?? 0.35;
      const timing = timings[line.id];
      if (!timing) throw new Error(`No voiceover timing for line "${line.id}". Run scripts/generate-voiceover.py`);
      lines.push({
        id: line.id,
        text: line.text,
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

  /** Frame cues for one scene, all relative to the start of that scene. */
  const cuesFor = (sceneId: string) => {
    const scene = getScene(sceneId);
    const find = (lineId: string) => {
      const line = scene.lines.find((l) => l.id === lineId);
      if (!line) throw new Error(`Unknown line ${lineId} in ${sceneId}`);
      return line;
    };
    return {
      duration: scene.durationInFrames,
      /** Frame where a narration line starts */
      line: (lineId: string) => find(lineId).start,
      /** Frame where a narration line ends */
      end: (lineId: string) => {
        const l = find(lineId);
        return l.start + l.durationInFrames;
      },
      /** Frame where a specific spoken word starts (nth occurrence, 0-based) */
      word: (lineId: string, word: string, nth = 0) => {
        const l = find(lineId);
        const target = normalize(word);
        const exact = l.words.filter((w) => w.word === target);
        // "double-click" or "there's" arrive as one token, so fall back to a prefix match
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
