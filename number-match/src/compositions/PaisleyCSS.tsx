import React from "react";
import { makeOpener } from "../components/Lesson";
import { VideoShell } from "../components/VideoShell";
import { CardDesign, Flip, Layout, Outro, Responsive, Variables } from "../scenes/css/Design";
import { Basics, Fonts, NewCss, Recap } from "../scenes/css/Setup";
import { TL } from "../scenes/css/timeline";

export const CSS_FRAMES = TL.TOTAL_FRAMES;
const Opener = makeOpener(3, "CSS", "Making the Game Beautiful", "Let's bring our design to life");

/** Video 3 · CSS: Making the Game Beautiful */
export const PaisleyCSS: React.FC = () => (
  <VideoShell
    video="03"
    timeline={TL}
    scenes={{ opener: Opener, recap: Recap, newcss: NewCss, basics: Basics, fonts: Fonts, variables: Variables, layout: Layout, card: CardDesign, flip: Flip, responsive: Responsive, outro: Outro }}
  />
);
