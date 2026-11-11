import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { CLAMP } from "../lib/anim";
import { Cue } from "../subtitles/captions";
import { QUICKSAND } from "../styles/theme";

/**
 * Burned-in subtitles. They sit in the reserved caption zone at the bottom
 * of the frame (y ≥ 950), which no teaching content uses.
 */
export const Subtitles: React.FC<{ cues: Cue[]; hidden?: (frame: number) => boolean }> = ({ cues, hidden }) => {
  const frame = useCurrentFrame();
  const cue = cues.find((c) => frame >= c.start && frame < c.end);
  if (!cue || hidden?.(frame)) return null;
  const opacity = interpolate(frame, [cue.start, cue.start + 4, cue.end - 3, cue.end], [0, 1, 1, 0], CLAMP);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", opacity }}>
      <div
        style={{
          maxWidth: 1500,
          padding: "12px 30px 14px",
          borderRadius: 16,
          background: "rgba(6, 30, 25, 0.84)",
          color: "#ffffff",
          fontFamily: QUICKSAND,
          fontWeight: 700,
          fontSize: 44,
          lineHeight: 1.25,
          textAlign: "center",
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
