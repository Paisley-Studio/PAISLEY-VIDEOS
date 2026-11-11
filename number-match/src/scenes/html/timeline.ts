import script from "../../../narration/video-02/script.json";
import timings from "../../../narration/video-02/timings.json";
import { createTimeline, VideoScript } from "../../lib/timeline";

export const TL = createTimeline(script as VideoScript, timings);
