import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP } from "./anim";
import { SubtitleCue } from "./captions";
import { QUICKSAND } from "./theme";

/** Words that get a colour accent and a small lift when they are spoken. */
export type Keywords = Record<string, string>;

const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, "");

/**
 * Burned-in subtitles: a frosted pill at a fixed position near the bottom,
 * with spoken keywords lifting into their accent colour.
 */
export const Subtitles: React.FC<{ cues: SubtitleCue[]; keywords?: Keywords; bottom?: number }> = ({ cues, keywords = {}, bottom = 64 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cue = cues.find((c) => frame >= c.start && frame < c.end);
  if (!cue) return null;

  const fadeIn = interpolate(frame, [cue.start, cue.start + 5], [0, 1], CLAMP);
  const fadeOut = interpolate(frame, [cue.end - 4, cue.end], [1, 0], CLAMP);
  const lift = interpolate(frame, [cue.start, cue.start + 7], [10, 0], CLAMP);

  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom, display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 100 }}>
      <div
        style={{
          maxWidth: 1400,
          padding: "14px 34px 16px",
          borderRadius: 22,
          background: "rgba(28, 25, 22, 0.74)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
          opacity: fadeIn * fadeOut,
          transform: `translateY(${lift}px)`,
          textAlign: "center",
          fontFamily: QUICKSAND,
          fontWeight: 600,
          fontSize: 44,
          lineHeight: 1.25,
          color: "#fffaf2",
          letterSpacing: 0.2,
        }}
      >
        {cue.words.map((w, i) => {
          const color = keywords[clean(w.text)];
          const spoken = frame >= w.frame;
          const s = color && spoken ? spring({ frame: frame - w.frame, fps, config: { damping: 11, stiffness: 200, mass: 0.6 } }) : 0;
          return (
            <React.Fragment key={i}>
              <span
                style={{
                  display: "inline-block",
                  color: color && spoken ? color : undefined,
                  fontWeight: color ? 700 : 600,
                  transform: color ? `translateY(${-4 * s}px) scale(${1 + 0.08 * s})` : undefined,
                }}
              >
                {w.text}
              </span>
              {i < cue.words.length - 1 ? " " : null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
