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

/**
 * The score develops with the story: soft pads for the opening, a pulse when the
 * real products appear, light drums while we build, and a full lift for the welcome.
 * Each stem loops in sync; only their volumes change.
 */
const Score: React.FC = () => {
  const { durationInFrames, fps } = useVideoConfig();
  const at = (id: string) => T6.getScene(id).from;
  const end = durationInFrames;
  const welcome = T6.getScene("welcome");
  const welcomeLift = welcome.from + welcome.lines[2].start - 20; // "Welcome to Paisley Tech Studio"
  const firstLine = T6.SCENES[0].lines[0].start;

  const curve = (frames: number[], values: number[]) => (f: number) => interpolate(f, frames, values, CLAMP);

  const pads = curve(
    [0, 30, firstLine - 10, firstLine + 10, at("title"), at("title") + 20, at("delivery"), at("whatis"), at("build"), welcomeLift, welcomeLift + 30, end - 3 * fps, end],
    [0, 0.34, 0.34, 0.15, 0.15, 0.22, 0.13, 0.15, 0.11, 0.12, 0.2, 0.22, 0],
  );
  const pulse = curve(
    [at("delivery") - 20, at("delivery") + 20, at("whatis") - 10, at("whatis") + 20, at("build") - 10, at("build") + 20, at("ai") - 10, at("ai") + 20, welcomeLift, welcomeLift + 30, end - 3 * fps, end],
    [0, 0.1, 0.1, 0.05, 0.05, 0.11, 0.11, 0.07, 0.08, 0.16, 0.16, 0],
  );
  const drums = curve(
    [at("build") - 10, at("build") + 30, at("ai") - 20, at("ai") + 10, welcomeLift, welcomeLift + 20, end - 3 * fps, end],
    [0, 0.07, 0.08, 0, 0, 0.13, 0.13, 0],
  );
  const air = curve([0, 20, at("title") - 10, at("title") + 20], [0, 0.32, 0.22, 0]);

  return (
    <>
      <Audio name="Score: pads" src={staticFile("audio/story-pads.wav")} loop volume={pads} />
      <Audio name="Score: pulse" src={staticFile("audio/story-pulse.wav")} loop volume={pulse} />
      <Audio name="Score: drums" src={staticFile("audio/story-drums.wav")} loop volume={drums} />
      <Audio name="Ambience: morning" src={staticFile("audio/ambience-morning.wav")} loop volume={air} />
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
