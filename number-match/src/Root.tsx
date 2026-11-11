import React from "react";
import { Composition, Folder } from "remotion";
import { CSS_FRAMES, PaisleyCSS } from "./compositions/PaisleyCSS";
import { FINALE_FRAMES, PaisleyFinale } from "./compositions/PaisleyFinale";
import { LOGIC_FRAMES, PaisleyGameLogic } from "./compositions/PaisleyGameLogic";
import { HTML_FRAMES, PaisleyHTML } from "./compositions/PaisleyHTML";
import { INTRO_FRAMES, PaisleyIntro } from "./compositions/PaisleyIntro";
import { JS_FRAMES, PaisleyJavaScript } from "./compositions/PaisleyJavaScript";

const HD = { fps: 30, width: 1920, height: 1080 } as const;

/** Paisley Studio · Number Match masterclass: six lessons, one composition each. */
export const RemotionRoot: React.FC = () => (
  <Folder name="Number-Match-Masterclass">
    <Composition id="PaisleyIntro" component={PaisleyIntro} durationInFrames={INTRO_FRAMES} {...HD} />
    <Composition id="PaisleyHTML" component={PaisleyHTML} durationInFrames={HTML_FRAMES} {...HD} />
    <Composition id="PaisleyCSS" component={PaisleyCSS} durationInFrames={CSS_FRAMES} {...HD} />
    <Composition id="PaisleyJavaScript" component={PaisleyJavaScript} durationInFrames={JS_FRAMES} {...HD} />
    <Composition id="PaisleyGameLogic" component={PaisleyGameLogic} durationInFrames={LOGIC_FRAMES} {...HD} />
    <Composition id="PaisleyFinale" component={PaisleyFinale} durationInFrames={FINALE_FRAMES} {...HD} />
  </Folder>
);
