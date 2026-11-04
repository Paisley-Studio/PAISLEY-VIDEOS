import { Composition, Folder } from "remotion";
import { Video1 } from "./video1/Video1";
import { TOTAL_FRAMES } from "./video1/timeline";
import { Video2, VIDEO2_FRAMES } from "./video2/Video2";
import { Video3, VIDEO3_FRAMES } from "./video3/Video3";
import { Video4, VIDEO4_FRAMES } from "./video4/Video4";
import { Video5, VIDEO5_FRAMES } from "./video5/Video5";
import { Video6, VIDEO6_FRAMES } from "./video6/Video6";

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Folder name="Dino-Runner-Series">
      <Composition id="Video1-ThinkLikeACreator" component={Video1} durationInFrames={TOTAL_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Video2-HTML" component={Video2} durationInFrames={VIDEO2_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Video3-CSS" component={Video3} durationInFrames={VIDEO3_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Video4-JavaScript" component={Video4} durationInFrames={VIDEO4_FRAMES} fps={30} width={1920} height={1080} />
      <Composition id="Video5-AI-Claude" component={Video5} durationInFrames={VIDEO5_FRAMES} fps={30} width={1920} height={1080} />
    </Folder>
    <Folder name="Intro-To-Coding">
      <Composition id="Video6-WelcomeToCoding" component={Video6} durationInFrames={VIDEO6_FRAMES} fps={30} width={1920} height={1080} />
    </Folder>
    </>
  );
};
