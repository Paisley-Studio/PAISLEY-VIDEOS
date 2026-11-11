import React from "react";
import { makeOpener } from "../components/Lesson";
import { VideoShell } from "../components/VideoShell";
import { Deck, Difficulty, Finish, Flip, Match, Outro, Sound, Timer, Together } from "../scenes/gamelogic/Logic";
import { TL } from "../scenes/gamelogic/timeline";

export const LOGIC_FRAMES = TL.TOTAL_FRAMES;
const Opener = makeOpener(5, "GAME LOGIC", "Making the Game Work", "The magic behind Number Match");

/** Video 5 · Making the Game Work */
export const PaisleyGameLogic: React.FC = () => (
  <VideoShell
    video="05"
    timeline={TL}
    scenes={{ opener: Opener, together: Together, deck: Deck, flip: Flip, match: Match, timer: Timer, sound: Sound, difficulty: Difficulty, finish: Finish, outro: Outro }}
  />
);
