import React from "react";
import { makeOpener } from "../components/Lesson";
import { VideoShell } from "../components/VideoShell";
import { Boilerplate, Outro, RunStep, Structure, TitleStep } from "../scenes/html/Build";
import { TL } from "../scenes/html/timeline";
import { Emmet, NewFile, Tour } from "../scenes/html/Workspace";

export const HTML_FRAMES = TL.TOTAL_FRAMES;
const Opener = makeOpener(2, "HTML", "Building the Foundation", "Let's give our game its structure");

/** Video 2 · HTML: Building the Foundation */
export const PaisleyHTML: React.FC = () => (
  <VideoShell
    video="02"
    timeline={TL}
    scenes={{ opener: Opener, tour: Tour, newfile: NewFile, emmet: Emmet, boilerplate: Boilerplate, title: TitleStep, structure: Structure, run: RunStep, outro: Outro }}
  />
);
