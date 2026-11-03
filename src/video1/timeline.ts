import { createTimeline, VideoScript } from "../shared/timeline";
import script from "./script.json";
import timings from "./vo-timings.json";

export const { SCENES, TOTAL_FRAMES, getScene, cuesFor } = createTimeline(script as VideoScript, timings);
