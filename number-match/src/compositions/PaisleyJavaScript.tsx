import React from "react";
import { makeOpener } from "../components/Lesson";
import { VideoShell } from "../components/VideoShell";
import { Arrays, Conditions, Dom, Events, Functions, Intro, NewJs, Outro, Variables } from "../scenes/js/Concepts";
import { TL } from "../scenes/js/timeline";

export const JS_FRAMES = TL.TOTAL_FRAMES;
const Opener = makeOpener(4, "JAVASCRIPT", "Giving Our Game a Brain", "Let's teach our game how to think");

/** Video 4 · JavaScript: Giving Our Game a Brain */
export const PaisleyJavaScript: React.FC = () => (
  <VideoShell
    video="04"
    timeline={TL}
    scenes={{ opener: Opener, intro: Intro, newjs: NewJs, variables: Variables, arrays: Arrays, functions: Functions, events: Events, conditions: Conditions, dom: Dom, outro: Outro }}
  />
);
