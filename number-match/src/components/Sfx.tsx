import React from "react";
import { Audio } from "@remotion/media";
import { Sequence, staticFile } from "remotion";
import { SoundEvent } from "../lib/gameSim";

export type SfxName =
  | "click" | "tick" | "pop" | "pop-low" | "pop-high" | "whoosh" | "whoosh-short" | "typing" | "key" | "save" | "run"
  | "sparkle" | "thunk" | "uh-oh" | "flip" | "match" | "miss" | "win" | "ambient" | "sting";

const LEVEL: Record<SfxName, number> = {
  click: 0.45, tick: 0.35, pop: 0.5, "pop-low": 0.5, "pop-high": 0.5, whoosh: 0.4, "whoosh-short": 0.35, typing: 0.3,
  key: 0.5, save: 0.45, run: 0.45, sparkle: 0.35, thunk: 0.4, "uh-oh": 0.45, flip: 0.55, match: 0.55, miss: 0.5,
  win: 0.6, ambient: 0.7, sting: 0.6,
};

/** Plays one sound effect at frame `at` (relative to the enclosing Sequence). */
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number; dur?: number }> = ({ name, at, volume = 1, dur }) => (
  <Sequence from={Math.round(at)} durationInFrames={dur} layout="none" name={`SFX ${name}`}>
    <Audio src={staticFile(`audio/${name}.wav`)} volume={LEVEL[name] * volume} loop={dur !== undefined} />
  </Sequence>
);

/** Plays the game's own sounds for a simulated game. */
export const GameSounds: React.FC<{ sounds: SoundEvent[]; offset?: number; until?: number; clicks?: boolean }> = ({ sounds, offset = 0, until = Infinity, clicks = true }) => (
  <>
    {sounds
      .filter((s) => s.f + offset < until)
      .map((s, i) =>
        s.kind === "blocked" ? (
          clicks ? <Sfx key={i} name="click" at={s.f + offset} volume={0.7} /> : null
        ) : (
          <React.Fragment key={i}>
            {clicks && s.kind === "flip" && <Sfx name="click" at={s.f + offset - 1} volume={0.6} />}
            <Sfx name={s.kind} at={s.f + offset} />
          </React.Fragment>
        ),
      )}
  </>
);
