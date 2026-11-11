import script from "../../../narration/video-01/script.json";
import timings from "../../../narration/video-01/timings.json";
import { createTimeline, VideoScript } from "../../lib/timeline";

export const SCRIPT = script as VideoScript;
export const TL = createTimeline(SCRIPT, timings);
