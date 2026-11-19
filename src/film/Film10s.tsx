import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ACCENT, BLACK, type CharacterProps, type Mood } from "./characters";
import type { BgProps } from "./backgrounds";

/**
 * Comic Neue, self-hosted. The render browser cannot reach Google Fonts
 * (egress proxy SSL), so the woff2 files live in public/fonts/ and are
 * served locally. The render waits until both weights are loaded.
 */
const fontFamily = "Comic Neue";

const FONT_FACE_CSS = `
@font-face {
  font-family: 'Comic Neue';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(${staticFile("fonts/comic-neue-400.woff2")}) format('woff2');
}
@font-face {
  font-family: 'Comic Neue';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url(${staticFile("fonts/comic-neue-700.woff2")}) format('woff2');
}
`;

export type ShadowProps = {
  phase: number;
  scale?: number;
  grow?: number;
  bob?: number;
};

export type StyleDef = {
  id: string;
  name: string;
  Character: React.FC<CharacterProps>;
  Shadow: React.FC<ShadowProps>;
  Background: React.FC<BgProps>;
  /** extra overlay (grain, vignette, …) */
  overlay?: React.ReactNode;
};

const FLOOR_Y = 900;
const LAMP_X = 1330;

function fade(frame: number, start: number, end: number): number {
  return interpolate(frame, [start, start + 8, end - 8, end], [0, 1, 1, 0]);
}

const NarratorLine: React.FC<{ text: string; start: number; end: number }> = ({ text, start, end }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top: 108,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily,
        fontSize: 46,
        color: "#FFFFFF",
        opacity: fade(frame, start, end),
        textShadow: "0 2px 12px rgba(0,0,0,0.9)",
      }}
    >
      {text}
    </div>
  );
};

/**
 * The 10-second test story, rendered in whatever style is passed in.
 * Beats: walk in (0-2s) -> shadow rises (2-4s) -> run + rep counts (4-6s)
 * -> big hit + flash (6-8s) -> stand in the glow (8-10s).
 */
export const Film10s: React.FC<{ style: StyleDef }> = ({ style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { Character, Shadow, Background } = style;

  const [fontHandle] = useState(() => delayRender("Loading Comic Neue font"));
  useEffect(() => {
    Promise.all([
      document.fonts.load('400 46px "Comic Neue"'),
      document.fonts.load('700 150px "Comic Neue"'),
    ])
      .then(() => continueRender(fontHandle))
      .catch(() => continueRender(fontHandle));
  }, [fontHandle]);

  const walking = frame < 120;
  const running = frame >= 120 && frame < 180;
  // continuous phase: walk 0.35 rad/f, run 0.85 rad/f, then ease to a
  // planted stance (nearest multiple of PI = legs together) for the punch
  const phase =
    frame < 120
      ? frame * 0.35
      : frame < 180
        ? 42 + (frame - 120) * 0.85
        : interpolate(frame, [180, 195], [93, 30 * Math.PI], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

  const mood: Mood = frame < 60 ? "neutral" : frame < 120 ? "worried" : "determined";

  // character x: walks from off-screen left to under the lamp
  const charX = interpolate(frame, [0, 60], [-220, LAMP_X - 250], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // city scrolls only while he runs
  const scrollX = interpolate(frame, [120, 180], [0, 1400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // squash & stretch around the big hit
  const squashX = interpolate(frame, [180, 195, 198, 202, 215], [1, 0.92, 1.28, 1.18, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const squashY = interpolate(frame, [180, 195, 198, 202, 215], [1, 1.1, 0.72, 0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const bob = running
    ? Math.abs(Math.sin(phase)) * 10
    : walking
      ? Math.abs(Math.sin(phase)) * 5
      : 0;

  // shadow rises beside him, grows taller
  const grow = interpolate(frame, [60, 100], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // slow push-in on the final moment
  const pushIn = interpolate(frame, [240, 300], [1, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // white flash on the big hit
  const flash = interpolate(frame, [195, 198, 204, 210], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const speedLines = interpolate(frame, [195, 200, 212], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const repPops = [128, 143, 158].map((start, i) => ({
    value: i + 1,
    scale: spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 260 } }),
    visible: frame >= start && frame < start + 22,
  }));

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <style>{FONT_FACE_CSS}</style>
      {/* SFX — all synthesized in code, no downloads */}
      <Audio src={staticFile("sfx/drone.wav")} startFrom={0} volume={0.35} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={60} volume={0.7} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={128} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={143} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={158} volume={0.8} />
      <Audio src={staticFile("sfx/impact.wav")} startFrom={195} volume={0.9} />
      <Audio src={staticFile("sfx/thud.wav")} startFrom={240} volume={0.8} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${pushIn})`,
          transformOrigin: "960px 700px",
        }}
      >
        <Background scrollX={scrollX} frame={frame} />

        {/* the shadow — rises at frame 60, stands to his left */}
        {frame >= 60 ? (
          <div style={{ position: "absolute", left: charX - 240, bottom: 1080 - FLOOR_Y }}>
            <Shadow phase={phase * 0.5} scale={1} grow={grow} bob={bob * 0.4} />
          </div>
        ) : null}

        {/* the character */}
        <div style={{ position: "absolute", left: charX, bottom: 1080 - FLOOR_Y }}>
          <Character
            phase={phase}
            mood={mood}
            running={running}
            squashX={squashX}
            squashY={squashY}
            bob={bob}
            wristband={frame >= 60}
          />
        </div>

        {/* speed lines on the big hit */}
        {speedLines > 0 ? (
          <div style={{ position: "absolute", left: charX + 200, top: 640, opacity: speedLines }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = i * 45;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: -8,
                    top: -4,
                    width: 320,
                    height: 8,
                    background: "#FFFFFF",
                    borderRadius: 4,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: "0 50%",
                  }}
                />
              );
            })}
          </div>
        ) : null}

        {/* rep counts pop on screen */}
        {repPops.map((r) =>
          r.visible ? (
            <div
              key={r.value}
              style={{
                position: "absolute",
                left: 1420,
                top: 380,
                fontFamily,
                fontWeight: 700,
                fontSize: 150,
                color: "#FFFFFF",
                transform: `scale(${r.scale})`,
                textShadow: "0 0 30px rgba(255,255,255,0.5), 0 4px 0 rgba(0,0,0,0.8)",
              }}
            >
              {r.value}
            </div>
          ) : null,
        )}

        {/* shadow's line, in the accent colour beside the shadow */}
        {frame >= 75 && frame <= 115 ? (
          <div
            style={{
              position: "absolute",
              left: charX - 260,
              top: 430,
              fontFamily,
              fontSize: 42,
              color: ACCENT,
              opacity: fade(frame, 75, 115),
              textShadow: `0 0 18px ${ACCENT}`,
              transform: "rotate(-3deg)",
            }}
          >
            You will quit.
          </div>
        ) : null}

        {/* narrator lines, max 8 words, top centre */}
        <NarratorLine text="Day one. He decides to change." start={10} end={55} />
        <NarratorLine text="He keeps going." start={245} end={292} />

        {/* DAY counter, top left */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 96,
            fontFamily,
            fontSize: 34,
            letterSpacing: 4,
            color: "#FFFFFF",
            opacity: interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          DAY 1
        </div>
      </div>

      {/* white flash on the big hit */}
      {flash > 0 ? (
        <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", opacity: flash }} />
      ) : null}

      {/* thin black bars top and bottom */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 60, background: BLACK }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 60, background: BLACK }} />

      {style.overlay}
    </AbsoluteFill>
  );
};
