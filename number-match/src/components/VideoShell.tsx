import React, { useMemo } from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { Timeline } from "../lib/timeline";
import { buildCues } from "../subtitles/captions";
import { C } from "../styles/theme";
import { Subtitles } from "./Subtitles";

const MUSIC_FULL = 0.32;
const MUSIC_UNDER_VOICE = 0.075;

/**
 * Shared frame for every video: background, scenes in order, narration,
 * a music bed that ducks under the voice, and burned-in subtitles.
 */
export const VideoShell: React.FC<{
  video: string; // "01".."06"
  timeline: Timeline;
  scenes: Record<string, React.FC>;
  background?: string;
  /** frames (absolute) where the music should be silent, e.g. the hook */
  musicStart?: number;
  /** extra volume curve multiplier per absolute frame */
  musicShape?: (frame: number) => number;
}> = ({ video, timeline, scenes, background = C.night, musicStart = 0, musicShape }) => {
  const { durationInFrames } = useVideoConfig();
  const cues = useMemo(() => buildCues(timeline), [timeline]);

  // absolute frame intervals where narration is speaking (with a little padding)
  const speech = useMemo(
    () =>
      timeline.SCENES.flatMap((s) =>
        s.lines.map((l) => [s.from + l.start - 8, s.from + l.start + l.durationInFrames + 10] as const),
      ),
    [timeline],
  );

  const musicVolume = (f: number) => {
    const abs = f + musicStart;
    // distance (frames) to the nearest speech interval → smooth duck
    let d = Infinity;
    for (const [a, b] of speech) {
      if (abs >= a && abs <= b) {
        d = 0;
        break;
      }
      d = Math.min(d, abs < a ? a - abs : abs - b);
    }
    const duck = interpolate(d, [0, 14], [MUSIC_UNDER_VOICE, MUSIC_FULL], { extrapolateRight: "clamp" });
    const fade = interpolate(abs, [musicStart, musicStart + 30, durationInFrames - 75, durationInFrames - 2], [0, 1, 1, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return duck * fade * (musicShape ? musicShape(abs) : 1);
  };

  return (
    <AbsoluteFill style={{ background }}>
      {timeline.SCENES.map((scene) => {
        const Scene = scenes[scene.id];
        if (!Scene) throw new Error(`Video ${video}: no component for scene "${scene.id}"`);
        return (
          <Sequence key={scene.id} name={scene.name} from={scene.from} durationInFrames={scene.durationInFrames}>
            <Scene />
          </Sequence>
        );
      })}

      {timeline.SCENES.flatMap((scene) =>
        scene.lines.map((line) => (
          <Sequence key={line.id} name={`VO ${line.id}`} from={scene.from + line.start} durationInFrames={line.durationInFrames + 6} layout="none">
            <Audio src={staticFile(`vo/video-${video}/${line.id}.mp3`)} volume={1} />
          </Sequence>
        )),
      )}

      <Sequence from={musicStart} name="Music bed" layout="none">
        <Audio src={staticFile("audio/music-bed.wav")} loop volume={musicVolume} />
      </Sequence>

      <Subtitles cues={cues} />
    </AbsoluteFill>
  );
};
