import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, Track, useVideoConfig } from "remotion";
import { Background } from "./Props";
import { Timeline } from "./timeline";

/**
 * The frame every video in the series shares: warm background, the scenes in
 * order, the narration lines, and a music bed that ducks under the voice.
 */
export const VideoShell: React.FC<{
  timeline: Timeline;
  scenes: Record<string, React.FC>;
  voDir: string; // folder in public/ with one mp3 per narration line
  musicLoudUntil?: number; // frame where the music ducks for narration
}> = ({ timeline, scenes, voDir, musicLoudUntil }) => {
  const { durationInFrames, fps } = useVideoConfig();
  const duckAt = musicLoudUntil ?? Math.max(30, (timeline.SCENES[0].lines[0]?.start ?? 60) - 10);

  return (
    <AbsoluteFill>
      <Background />

      <Track name="Scenes">
        {timeline.SCENES.map((scene) => {
          const Scene = scenes[scene.id];
          return (
            <Sequence key={scene.id} name={scene.name} from={scene.from} durationInFrames={scene.durationInFrames}>
              <Scene />
            </Sequence>
          );
        })}
      </Track>

      <Track name="Narration">
        {timeline.SCENES.flatMap((scene) =>
          scene.lines.map((line) => (
            <Sequence key={line.id} name={`VO ${line.id}`} from={scene.from + line.start} durationInFrames={line.durationInFrames + 6} layout="none">
              <Audio src={staticFile(`${voDir}/${line.id}.mp3`)} volume={1} />
            </Sequence>
          )),
        )}
      </Track>

      <Audio
        name="Music bed"
        src={staticFile("audio/music-bed.wav")}
        loop
        volume={(f) =>
          interpolate(
            f,
            [0, 20, duckAt - 20, duckAt + 10, durationInFrames - 4 * fps, durationInFrames - 10, durationInFrames],
            [0, 0.3, 0.3, 0.085, 0.085, 0.3, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
    </AbsoluteFill>
  );
};
