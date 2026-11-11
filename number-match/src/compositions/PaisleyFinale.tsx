import React from "react";
import { makeOpener } from "../components/Lesson";
import { VideoShell } from "../components/VideoShell";
import { Celebrate, Challenge, Debug, Montage, SaveRun, Test } from "../scenes/finale/Finale";
import { TL } from "../scenes/finale/timeline";

export const FINALE_FRAMES = TL.TOTAL_FRAMES;
const Opener = makeOpener(6, "FINALE", "You Are Now a Game Creator!", "Testing, creativity and the grand finale");

/** Video 6 · Testing, Creativity and the Grand Finale */
export const PaisleyFinale: React.FC = () => (
  <VideoShell
    video="06"
    timeline={TL}
    scenes={{ opener: Opener, ide: SaveRun, test: Test, debug: Debug, challenge: Challenge, montage: Montage, celebrate: Celebrate }}
  />
);
