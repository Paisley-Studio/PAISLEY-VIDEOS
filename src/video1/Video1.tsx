import React from "react";
import { VideoShell } from "../shared/VideoShell";
import { createTimeline, VideoScript } from "../shared/timeline";
import script from "./script.json";
import timings from "./vo-timings.json";
import { AiFits, YourTurn } from "./scenes/Ending";
import { Blocks, House, Questions } from "./scenes/Blocks";
import { Breakdown } from "./scenes/Breakdown";
import { BuildPath, Ready, Resources } from "./scenes/Build";
import { ColdOpen, Question } from "./scenes/Opening";
import { Paper, Principle } from "./scenes/Paper";

// VIDEO 1 — Before We Code: Think Like a Creator

const TIMELINE = createTimeline(script as VideoScript, timings);

const SCENES: Record<string, React.FC> = {
  coldOpen: ColdOpen,
  question: Question,
  breakdown: Breakdown,
  paper: Paper,
  principle: Principle,
  questions: Questions,
  blocks: Blocks,
  house: House,
  resources: Resources,
  ready: Ready,
  path: BuildPath,
  ai: AiFits,
  task: YourTurn,
};

export const Video1: React.FC = () => (
  <VideoShell timeline={TIMELINE} scenes={SCENES} voDir="video1/vo" musicLoudUntil={TIMELINE.getScene("question").from} />
);
