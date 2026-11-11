import script from "../../../narration/video-05/script.json";
import timings from "../../../narration/video-05/timings.json";
import { createTimeline, VideoScript } from "../../lib/timeline";

export const TL = createTimeline(script as VideoScript, timings);
