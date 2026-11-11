// Settings for the Remotion CLI (the GitHub Actions render uses these too).
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(18);
Config.setPixelFormat("yuv420p");
Config.setAudioBitrate("192k");
Config.setDefaultPremountInSeconds(1);
