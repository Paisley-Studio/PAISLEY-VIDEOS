import React from "react";
import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";
import { CLAMP } from "../shared/anim";
import { buildCues } from "../shared/captions";
import { Keywords, Subtitles } from "../shared/Subtitles";
import { C } from "../shared/theme";
import { VideoShell } from "../shared/VideoShell";
import { T6 } from "./timeline";
import { OpenScene, TitleScene } from "./scenes/Opening";
import { DeliveryScene, EverywhereScene, SchoolScene } from "./scenes/RealWorld";
import { BuildScene, WhatIsScene } from "./scenes/Concepts";
import { CssScene, HtmlScene, JsScene, TogetherScene } from "./scenes/Languages";
import { AiScene, WelcomeScene } from "./scenes/Finale";

// "Welcome to the World of Coding: From Ideas to Real Products"
// Introduction to Coding & Creative Technology, Paisley Tech Studio.

export const VIDEO6_FRAMES = T6.TOTAL_FRAMES;
export const VIDEO6_CUES = buildCues(T6.SCENES, 30);

const SCENES: Record<string, React.FC> = {
  open: OpenScene,
  title: TitleScene,
  delivery: DeliveryScene,
  school: SchoolScene,
  everywhere: EverywhereScene,
  whatis: WhatIsScene,
  build: BuildScene,
  html: HtmlScene,
  css: CssScene,
  js: JsScene,
  together: TogetherScene,
  ai: AiScene,
  welcome: WelcomeScene,
};

const KEYWORDS: Keywords = {
  html: C.html,
  css: C.css,
  javascript: "#f7c948",
  coding: C.accent,
  code: C.accent,
  coded: C.accent,
  ai: "#f0a37a",
  claude: "#f0a37a",
  structure: C.html,
  appearance: "#8fbaf3",
  behavior: "#f7c948",
  paisley: C.accent,
  instructions: C.accent,
};

/** Every narration line as [start, end] in video frames. */
const SPEECH = T6.SCENES.flatMap((s) => s.lines.map((l) => [s.from + l.start, s.from + l.start + l.durationInFrames] as const));

/** 0 while the narrator speaks, easing up to 1 only in real pauses (voice always wins). */
const openness = (f: number) => {
  let gap = Infinity;
  for (const [a, b] of SPEECH) {
    if (f >= a - 8 && f <= b + 8) return 0;
    gap = Math.min(gap, Math.abs(f - (a - 8)), Math.abs(f - (b + 8)));
  }
  return interpolate(gap, [0, 20], [0, 1], CLAMP);
};

/**
 * A quiet, warm score that sits under the narration: soft pads throughout, with a
 * gentle pulse once the real products appear. No ambience and no drums, so
 * nothing competes with the voice. The music dips whenever the narrator speaks
 * and only rises in the pauses, the intro and the ending.
 */
const Score: React.FC = () => {
  const { durationInFrames: end, fps } = useVideoConfig();
  const at = (id: string) => T6.getScene(id).from;
  const fade = (f: number) => interpolate(f, [0, 30, end - 3 * fps, end], [0, 1, 1, 0], CLAMP);
  const mix = (under: number, gaps: number) => (f: number) => fade(f) * (under + (gaps - under) * openness(f));

  const pads = mix(0.045, 0.16);
  const pulseIn = (f: number) => interpolate(f, [at("delivery") - 20, at("delivery") + 20], [0, 1], CLAMP);
  const pulse = (f: number) => pulseIn(f) * mix(0.015, 0.07)(f);

  return (
    <>
      <Audio name="Score: pads" src={staticFile("audio/story-pads.wav")} loop volume={pads} />
      <Audio name="Score: pulse" src={staticFile("audio/story-pulse.wav")} loop volume={pulse} />
    </>
  );
};

export const Video6: React.FC = () => (
  <VideoShell
    timeline={T6}
    scenes={SCENES}
    voDir="video6/vo"
    music={<Score />}
    overlay={<Subtitles cues={VIDEO6_CUES} keywords={KEYWORDS} />}
  />
);
