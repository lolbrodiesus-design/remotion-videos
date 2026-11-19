import React from "react";

export const TEAL = "#8FB8A8";
export const TEAL_DARK = "#3D4A45";
export const ACCENT = "#E5484D";
export const BLACK = "#050505";

export type Mood = "neutral" | "worried" | "determined";

export type CharacterProps = {
  /** walk/run cycle phase in radians */
  phase: number;
  mood: Mood;
  running?: boolean;
  /** squash & stretch: 1 = normal */
  squashX?: number;
  squashY?: number;
  /** vertical bob in px */
  bob?: number;
  /** scale of the whole figure */
  scale?: number;
  /** small red wristband visible after Day 1 */
  wristband?: boolean;
};

/** Brow angle (deg) per mood: inner end of the brow. */
function browAngle(mood: Mood): number {
  if (mood === "determined") return -20;
  if (mood === "worried") return 18;
  return 0;
}

function mouthPath(mood: Mood): string {
  if (mood === "determined") return "M 86 94 Q 100 100 114 94"; // slight smile
  if (mood === "worried") return "M 86 96 Q 100 88 114 96"; // frown
  return "M 88 94 L 112 94"; // flat
}

/**
 * Base character: big round head, no neck, dot eyes, line brows + mouth,
 * long noodle limbs, no fingers. Side-on, facing right.
 */
export const BaseCharacter: React.FC<CharacterProps> = ({
  phase,
  mood,
  running = false,
  squashX = 1,
  squashY = 1,
  bob = 0,
  scale = 1,
  wristband = false,
}) => {
  const swing = running ? 32 : 22;
  const legL = Math.sin(phase) * swing;
  const legR = Math.sin(phase + Math.PI) * swing;
  const armL = Math.sin(phase + Math.PI) * swing * 0.8;
  const armR = Math.sin(phase) * swing * 0.8;
  const brow = browAngle(mood);

  return (
    <svg
      width={200 * scale}
      height={340 * scale}
      viewBox="0 0 200 340"
      style={{ display: "block", overflow: "visible" }}
    >
      <g
        transform={`translate(100 330) scale(${squashX} ${squashY}) translate(-100 -330) translate(0 ${bob})`}
      >
        {/* back leg */}
        <g transform={`rotate(${legL} 100 215)`}>
          <path
            d="M 100 215 L 88 318"
            stroke={TEAL}
            strokeWidth={13}
            strokeLinecap="round"
            fill="none"
          />
        </g>
        {/* back arm */}
        <g transform={`rotate(${armL} 100 145)`}>
          <path
            d="M 100 145 L 82 218"
            stroke={TEAL}
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
          />
          {wristband ? (
            <circle cx={84} cy={206} r={7} fill={ACCENT} />
          ) : null}
        </g>
        {/* torso */}
        <rect
          x={80}
          y={122}
          width={40}
          height={98}
          rx={20}
          fill={TEAL}
          stroke={TEAL_DARK}
          strokeWidth={3}
        />
        {/* front leg */}
        <g transform={`rotate(${legR} 100 215)`}>
          <path
            d="M 100 215 L 112 318"
            stroke={TEAL}
            strokeWidth={13}
            strokeLinecap="round"
            fill="none"
          />
        </g>
        {/* front arm */}
        <g transform={`rotate(${armR} 100 145)`}>
          <path
            d="M 100 145 L 118 218"
            stroke={TEAL}
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
          />
        </g>
        {/* head */}
        <circle
          cx={100}
          cy={70}
          r={54}
          fill={TEAL}
          stroke={TEAL_DARK}
          strokeWidth={3}
        />
        {/* dot eyes */}
        <circle cx={80} cy={64} r={5.5} fill={BLACK} />
        <circle cx={120} cy={64} r={5.5} fill={BLACK} />
        {/* eyebrows — most of the emotion lives here */}
        <g transform={`rotate(${brow} 80 46)`}>
          <line
            x1={70}
            y1={46}
            x2={90}
            y2={46}
            stroke={BLACK}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>
        <g transform={`rotate(${-brow} 120 46)`}>
          <line
            x1={110}
            y1={46}
            x2={130}
            y2={46}
            stroke={BLACK}
            strokeWidth={4}
            strokeLinecap="round"
          />
        </g>
        {/* mouth */}
        <path
          d={mouthPath(mood)}
          stroke={BLACK}
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
};

/** The Shadow: same body, pure black and taller, glowing red outline, slit eyes. */
export const BaseShadow: React.FC<{
  phase: number;
  scale?: number;
  grow?: number; // 0..1 how fully risen
  bob?: number;
}> = ({ phase, scale = 1, grow = 1, bob = 0 }) => {
  const swing = 20;
  const legL = Math.sin(phase) * swing;
  const legR = Math.sin(phase + Math.PI) * swing;
  return (
    <svg
      width={200 * scale}
      height={340 * scale}
      viewBox="0 0 200 340"
      style={{
        display: "block",
        overflow: "visible",
        opacity: grow,
        filter: `drop-shadow(0 0 16px ${ACCENT})`,
      }}
    >
      <g
        transform={`translate(100 330) scale(1 ${1 + 0.35 * grow}) translate(-100 -330) translate(0 ${bob})`}
      >
        <g transform={`rotate(${legL} 100 215)`}>
          <path
            d="M 100 215 L 88 318"
            stroke={BLACK}
            strokeWidth={14}
            strokeLinecap="round"
            fill="none"
          />
        </g>
        <g transform={`rotate(${legR} 100 215)`}>
          <path
            d="M 100 215 L 112 318"
            stroke={BLACK}
            strokeWidth={14}
            strokeLinecap="round"
            fill="none"
          />
        </g>
        <rect x={78} y={120} width={44} height={100} rx={22} fill={BLACK} />
        <circle cx={100} cy={70} r={56} fill={BLACK} />
        {/* slit eyes */}
        <rect x={70} y={60} width={20} height={4} rx={2} fill={ACCENT} />
        <rect x={110} y={60} width={20} height={4} rx={2} fill={ACCENT} />
        {/* glowing red outline */}
        <circle
          cx={100}
          cy={70}
          r={56}
          fill="none"
          stroke={ACCENT}
          strokeWidth={2}
          opacity={0.85}
        />
      </g>
    </svg>
  );
};
