import React from "react";
import { VideoShell } from "../components/VideoShell";
import { Hook } from "../scenes/intro/Hook";
import { IdeGlimpse } from "../scenes/intro/IdeGlimpse";
import { Journey } from "../scenes/intro/Journey";
import { Reveal } from "../scenes/intro/Reveal";
import { TitleCard } from "../scenes/intro/TitleCard";
import { TL } from "../scenes/intro/timeline";

export const INTRO_FRAMES = TL.TOTAL_FRAMES;

/** Video 1 · The Big Reveal: "Imagine It. Build It. Play It." */
export const PaisleyIntro: React.FC = () => {
  const hook = TL.getScene("hook");
  // music enters under "Yes! You are about to become a game creator."
  const musicStart = hook.from + TL.cuesFor("hook").line("h3") - 10;
  return <VideoShell video="01" timeline={TL} scenes={{ hook: Hook, reveal: Reveal, journey: Journey, ide: IdeGlimpse, title: TitleCard }} musicStart={musicStart} />;
};
