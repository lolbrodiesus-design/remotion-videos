import { Composition } from "remotion";
import React, { useEffect, useState } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
import { ACCENT, BaseCharacter, BaseShadow, BLACK } from "./film/characters";

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

const FLOOR_Y = 620;

/** Compact night-street background sized for 1280x720 thumbnails. */
const ThumbBackground: React.FC<{ lampX?: number }> = ({ lampX = 1050 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: "#0A0C0B",
      overflow: "hidden",
    }}
  >
    {/* moon + glow */}
    <div
      style={{
        position: "absolute",
        left: 1120,
        top: 56,
        width: 76,
        height: 76,
        borderRadius: "50%",
        background: "#E8E6D8",
        boxShadow: "0 0 90px 45px rgba(232,230,216,0.22)",
      }}
    />
    {/* skyline */}
    <svg
      style={{ position: "absolute", left: 0, top: 0 }}
      width={1280}
      height={720}
    >
      {[
        { x: 0, w: 120, h: 190 },
        { x: 140, w: 90, h: 250 },
        { x: 250, w: 150, h: 170 },
        { x: 420, w: 110, h: 280 },
        { x: 550, w: 140, h: 210 },
        { x: 710, w: 100, h: 240 },
        { x: 830, w: 160, h: 180 },
        { x: 1010, w: 110, h: 260 },
        { x: 1140, w: 140, h: 200 },
      ].map((b, i) => (
        <g key={i}>
          <rect
            x={b.x}
            y={FLOOR_Y - b.h}
            width={b.w}
            height={b.h}
            fill="#161A19"
          />
          <rect x={b.x + 18} y={FLOOR_Y - b.h + 30} width={12} height={15} fill="#8A97B0" opacity={0.5} />
          <rect x={b.x + b.w - 34} y={FLOOR_Y - b.h + 70} width={12} height={15} fill="#8A97B0" opacity={0.35} />
        </g>
      ))}
    </svg>
    {/* lamp glow */}
    <div
      style={{
        position: "absolute",
        left: lampX - 110,
        top: 180,
        width: 220,
        height: 260,
        background:
          "radial-gradient(ellipse at 50% 20%, rgba(255,226,150,0.35) 0%, rgba(255,226,150,0.08) 55%, transparent 75%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: lampX - 3,
        top: 190,
        width: 6,
        height: FLOOR_Y - 190,
        background: "#6B6B60",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: lampX - 26,
        top: 178,
        width: 52,
        height: 16,
        borderRadius: 8,
        background: "#FFE296",
        boxShadow: "0 0 40px 18px rgba(255,226,150,0.45)",
      }}
    />
    {/* thin grey floor line */}
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: FLOOR_Y,
        height: 2,
        background: "#3A443F",
      }}
    />
  </div>
);

/** Shared font gate + style injection for still renders. */
const useFontGate = () => {
  const [handle] = useState(() => delayRender("Loading Comic Neue font"));
  useEffect(() => {
    Promise.all([
      document.fonts.load('400 46px "Comic Neue"'),
      document.fonts.load('700 200px "Comic Neue"'),
    ])
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
  return <style>{FONT_FACE_CSS}</style>;
};

/** Big thumbnail text: white, bold, Comic Neue, with shadow for readability. */
const ThumbText: React.FC<{ children: React.ReactNode; top?: number; fontSize?: number }> = ({
  children,
  top = 48,
  fontSize = 62,
}) => (
  <div
    style={{
      position: "absolute",
      top,
      left: 0,
      right: 0,
      textAlign: "center",
      fontFamily,
      fontWeight: 700,
      fontSize,
      letterSpacing: 2,
      color: "#FFFFFF",
      textShadow:
        "0 3px 0 rgba(0,0,0,0.85), 0 0 28px rgba(0,0,0,0.9), 0 6px 24px rgba(0,0,0,0.9)",
    }}
  >
    {children}
  </div>
);

/** 1 — The shadow looms huge over the small character. */
const ThumbShadow: React.FC = () => {
  const style = useFontGate();
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      {style}
      <ThumbBackground lampX={1020} />
      {/* giant shadow, feet on the floor, whole head visible */}
      <div style={{ position: "absolute", left: 300, top: FLOOR_Y - 330 * 1.35 }}>
        <BaseShadow phase={0} scale={1.35} grow={1} />
      </div>
      {/* small worried character, standing in the lamp light */}
      <div style={{ position: "absolute", left: 880, top: FLOOR_Y - 330 * 0.72 }}>
        <BaseCharacter phase={0} mood="worried" scale={0.72} wristband />
      </div>
      {/* text in the empty black strip below the floor line — no overlap */}
      <ThumbText top={642} fontSize={56}>IT&rsquo;S STILL HUNGRY</ThumbText>
    </AbsoluteFill>
  );
};

/** Stylized glowing red brain, drawn in code. */
const Brain: React.FC = () => (
  <svg
    width={470}
    height={370}
    viewBox="0 0 470 370"
    style={{ display: "block", filter: "drop-shadow(0 0 34px rgba(229,72,77,0.75))" }}
  >
    {/* lumpy brain outline */}
    <path
      d="M70 210 C45 130 120 55 235 58 C350 55 425 130 400 210 C422 285 345 335 235 330 C125 335 48 285 70 210 Z"
      fill="#5E171A"
      stroke={ACCENT}
      strokeWidth={7}
      strokeLinejoin="round"
    />
    {/* hemisphere split */}
    <path
      d="M235 62 C225 140 245 230 232 328"
      stroke={ACCENT}
      strokeWidth={5}
      fill="none"
      opacity={0.85}
      strokeLinecap="round"
    />
    {/* squiggles */}
    <path d="M110 130 C140 105 175 160 150 195" stroke={ACCENT} strokeWidth={6} fill="none" opacity={0.8} strokeLinecap="round" />
    <path d="M300 120 C330 95 365 150 340 190" stroke={ACCENT} strokeWidth={6} fill="none" opacity={0.8} strokeLinecap="round" />
    <path d="M120 250 C150 225 190 275 165 300" stroke={ACCENT} strokeWidth={6} fill="none" opacity={0.8} strokeLinecap="round" />
    <path d="M300 250 C330 225 365 270 340 300" stroke={ACCENT} strokeWidth={6} fill="none" opacity={0.8} strokeLinecap="round" />
    <path d="M190 90 C210 75 235 105 220 130" stroke={ACCENT} strokeWidth={5} fill="none" opacity={0.7} strokeLinecap="round" />
  </svg>
);

/** 2 — The glowing red brain. */
const ThumbBrain: React.FC = () => {
  const style = useFontGate();
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      {style}
      <ThumbBackground lampX={150} />
      {/* small worried character looking up at the brain (clear of the lamp pole) */}
      <div style={{ position: "absolute", left: 210, top: FLOOR_Y - 330 * 0.8 }}>
        <BaseCharacter phase={0} mood="worried" scale={0.8} wristband />
      </div>
      {/* giant glowing brain */}
      <div style={{ position: "absolute", left: 640, top: 130 }}>
        <Brain />
      </div>
      <ThumbText top={52} fontSize={68}>
        EAT. WAIT. DIE.
      </ThumbText>
    </AbsoluteFill>
  );
};

/** 3 — The HUNGER title moment. */
const ThumbHunger: React.FC = () => {
  const style = useFontGate();
  return (
    <AbsoluteFill style={{ background: BLACK }}>
      {style}
      <ThumbBackground lampX={150} />
      {/* title word, huge, centre */}
      <div
        style={{
          position: "absolute",
          top: 140,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontWeight: 700,
          fontSize: 200,
          letterSpacing: 10,
          color: "#FFFFFF",
          textShadow: "0 4px 0 rgba(0,0,0,0.85), 0 0 40px rgba(0,0,0,0.9)",
        }}
      >
        HUNGER
      </div>
      {/* wavy red underline */}
      <svg
        style={{ position: "absolute", left: 360, top: 355 }}
        width={560}
        height={26}
      >
        <path
          d="M0 13 Q35 1 70 13 T140 13 T210 13 T280 13 T350 13 T420 13 T490 13 T560 13"
          stroke={ACCENT}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      {/* one white line, one short red line */}
      <div
        style={{
          position: "absolute",
          left: 440,
          top: 400,
          width: 400,
          height: 4,
          background: "#FFFFFF",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 580,
          top: 420,
          width: 120,
          height: 4,
          background: ACCENT,
        }}
      />
      {/* character + shadow small at the bottom, clear of the lines */}
      <div style={{ position: "absolute", left: 320, top: FLOOR_Y - 330 * 0.48 }}>
        <BaseCharacter phase={0} mood="determined" scale={0.48} wristband />
      </div>
      <div style={{ position: "absolute", left: 880, top: FLOOR_Y - 330 * 0.58 }}>
        <BaseShadow phase={0} scale={0.58} grow={1} />
      </div>
    </AbsoluteFill>
  );
};

export { ThumbShadow, ThumbBrain, ThumbHunger };

export const ThumbnailsCompositions: React.FC = () => {
  return (
    <>
      <Composition
        id="ThumbShadow"
        component={ThumbShadow}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="ThumbBrain"
        component={ThumbBrain}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={720}
      />
      <Composition
        id="ThumbHunger"
        component={ThumbHunger}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
