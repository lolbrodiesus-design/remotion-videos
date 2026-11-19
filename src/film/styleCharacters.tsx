import React from "react";
import { ACCENT, BLACK, TEAL, type CharacterProps, type Mood } from "./characters";

/* ------------------------------------------------------------------ */
/* PIXEL ART — head + torso from a cell map, animated block legs/arms  */
/* ------------------------------------------------------------------ */

const PIXEL_MAP = [
  "....OOOOOO....",
  "..OOTTTTTTOO..",
  ".OTTTTTTTTTTO.",
  ".OTBBTTTTBBTO.",
  ".OTTTTTTTTTTO.",
  ".OTTTTTTTTTTO.",
  ".OTTTBBBBTTTO.",
  "..OTTTTTTTTO..",
  "...OOTTTTOO...",
  ".....OOOO.....",
  "....OTTTTO....",
  "...OTTTTTTO...",
  "..OTTTTTTTTO..",
  "..OTTTTTTTTO..",
  "...OTTTTTTO...",
  "....OTTTTO....",
  "...OOTTTTOO...",
];
const CELL = 14;

function browAngle(mood: Mood): number {
  if (mood === "determined") return -20;
  if (mood === "worried") return 18;
  return 0;
}

export const PixelFigure: React.FC<
  CharacterProps & {
    body: string;
    outline: string;
    eye: string;
    glow?: string;
    taller?: boolean;
    slitEyes?: boolean;
  }
> = ({ phase, mood, running = false, squashX = 1, squashY = 1, bob = 0, scale = 1, body, outline, eye, glow, taller = false, slitEyes = false, wristband = false }) => {
  const swing = running ? 24 : 16;
  const armL = Math.sin(phase + Math.PI) * swing;
  const armR = Math.sin(phase) * swing;
  const legL = Math.sin(phase) * 9;
  const legR = -Math.sin(phase) * 9;
  const brow = browAngle(mood);
  const colorFor = (ch: string): string | null => {
    if (ch === "T") return body;
    if (ch === "O") return outline;
    if (ch === "B") return eye;
    return null;
  };
  const h = PIXEL_MAP.length * CELL; // 238
  const legH = 8 * CELL; // 112
  return (
    <svg
      width={196 * scale}
      height={(h + legH) * scale}
      viewBox={`0 0 196 ${h + legH}`}
      shapeRendering="crispEdges"
      style={{
        display: "block",
        overflow: "visible",
        filter: glow ? `drop-shadow(0 0 14px ${glow})` : undefined,
      }}
    >
      <g transform={`translate(98 ${taller ? h + legH : 175}) scale(${squashX} ${squashY * (taller ? 1.3 : 1)}) translate(-98 -${taller ? h + legH : 175}) translate(0 ${bob})`}>
        {/* arms */}
        <g transform={`rotate(${armL} 30 168)`}>
          <rect x={22} y={154} width={14} height={84} fill={body} stroke={outline} strokeWidth={2} />
        </g>
        <g transform={`rotate(${armR} 166 168)`}>
          <rect x={160} y={154} width={14} height={84} fill={body} stroke={outline} strokeWidth={2} />
          {wristband ? <rect x={160} y={224} width={14} height={10} fill={ACCENT} /> : null}
        </g>
        {/* head + torso from the map */}
        {PIXEL_MAP.map((row, r) =>
          row.split("").map((ch, c) => {
            const fill = colorFor(ch);
            if (!fill) return null;
            return <rect key={`${r}-${c}`} x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill={fill} />;
          }),
        )}
        {/* brows */}
        <g transform={`rotate(${brow} 56 28)`}>
          <rect x={42} y={28} width={28} height={7} fill={eye} />
        </g>
        <g transform={`rotate(${-brow} 140 28)`}>
          <rect x={126} y={28} width={28} height={7} fill={eye} />
        </g>
        {/* slit eyes for the shadow */}
        {slitEyes ? (
          <>
            <rect x={42} y={45} width={28} height={7} fill={eye} />
            <rect x={126} y={45} width={28} height={7} fill={eye} />
          </>
        ) : null}
        {/* legs: two block columns, alternating lift */}
        <g transform={`translate(0 ${legL})`}>
          <rect x={56} y={h} width={28} height={legH} fill={body} stroke={outline} strokeWidth={2} />
        </g>
        <g transform={`translate(0 ${legR})`}>
          <rect x={112} y={h} width={28} height={legH} fill={body} stroke={outline} strokeWidth={2} />
        </g>
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* PAPER CUT-OUT — flat divs, rough hand-cut borders, soft shadows     */
/* ------------------------------------------------------------------ */

const roughRadius = "48% 52% 55% 45% / 52% 46% 54% 48%";

export const PaperFigure: React.FC<
  CharacterProps & { body: string; line: string; eye: string; glow?: string; taller?: boolean; slitEyes?: boolean }
> = ({ phase, mood, running = false, squashX = 1, squashY = 1, bob = 0, scale = 1, body, line, eye, glow, taller = false, slitEyes = false, wristband = false }) => {
  const swing = running ? 22 : 14;
  const legL = Math.sin(phase) * swing;
  const legR = Math.sin(phase + Math.PI) * swing;
  const armL = Math.sin(phase + Math.PI) * swing * 0.8;
  const armR = Math.sin(phase) * swing * 0.8;
  const brow = browAngle(mood);
  const shadow = "3px 5px 0 rgba(0,0,0,0.45)";
  return (
    <div
      style={{
        position: "relative",
        width: 200 * scale,
        height: 340 * scale,
        transform: `scale(${squashX}, ${squashY * (taller ? 1.3 : 1)}) translateY(${bob}px)`,
        transformOrigin: "50% 100%",
        filter: glow ? `drop-shadow(0 0 14px ${glow})` : undefined,
      }}
    >
      {/* back leg / arm */}
      <div style={{ position: "absolute", left: 88, top: 210, width: 16, height: 112, background: body, borderRadius: roughRadius, transform: `rotate(${legL}deg)`, transformOrigin: "50% 0%", boxShadow: shadow }} />
      <div style={{ position: "absolute", left: 66, top: 140, width: 14, height: 84, background: body, borderRadius: roughRadius, transform: `rotate(${armL}deg)`, transformOrigin: "50% 0%", boxShadow: shadow }} />
      {/* torso */}
      <div style={{ position: "absolute", left: 78, top: 120, width: 44, height: 100, background: body, borderRadius: roughRadius, transform: "rotate(-1deg)", boxShadow: shadow }} />
      {/* front leg / arm */}
      <div style={{ position: "absolute", left: 100, top: 210, width: 16, height: 112, background: body, borderRadius: roughRadius, transform: `rotate(${legR}deg)`, transformOrigin: "50% 0%", boxShadow: shadow }} />
      <div style={{ position: "absolute", left: 120, top: 140, width: 14, height: 84, background: body, borderRadius: roughRadius, transform: `rotate(${armR}deg)`, transformOrigin: "50% 0%", boxShadow: shadow }}>
        {wristband ? <div style={{ position: "absolute", left: 0, top: 64, width: 14, height: 9, background: ACCENT }} /> : null}
      </div>
      {/* head */}
      <div style={{ position: "absolute", left: 46, top: 14, width: 108, height: 108, background: body, borderRadius: roughRadius, transform: "rotate(1deg)", boxShadow: shadow }}>
        {/* eyes */}
        {slitEyes ? (
          <>
            <div style={{ position: "absolute", left: 22, top: 48, width: 20, height: 4, background: eye }} />
            <div style={{ position: "absolute", left: 66, top: 48, width: 20, height: 4, background: eye }} />
          </>
        ) : (
          <>
            <div style={{ position: "absolute", left: 28, top: 46, width: 11, height: 11, borderRadius: "50%", background: eye }} />
            <div style={{ position: "absolute", left: 70, top: 46, width: 11, height: 11, borderRadius: "50%", background: eye }} />
          </>
        )}
        {/* brows */}
        <div style={{ position: "absolute", left: 20, top: 28, width: 24, height: 4, background: line, transform: `rotate(${brow}deg)` }} />
        <div style={{ position: "absolute", left: 64, top: 28, width: 24, height: 4, background: line, transform: `rotate(${-brow}deg)` }} />
        {/* mouth */}
        <div style={{ position: "absolute", left: 38, top: 80, width: 32, height: 4, background: line, borderRadius: 2, transform: mood === "worried" ? "rotate(4deg)" : mood === "determined" ? "rotate(-4deg)" : undefined }} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* INK WASH — grayscale SVG, soft bleeding edges                      */
/* ------------------------------------------------------------------ */

export const InkFigure: React.FC<
  CharacterProps & { body: string; line: string; eye: string; glow?: string; taller?: boolean; slitEyes?: boolean }
> = (props) => {
  const { body, line, eye, glow, taller, slitEyes, ...rest } = props;
  return (
    <div style={{ filter: "blur(0.7px) contrast(1.25)" }}>
      <InkSvg {...rest} body={body} line={line} eye={eye} glow={glow} taller={taller} slitEyes={slitEyes} />
    </div>
  );
};

const InkSvg: React.FC<
  CharacterProps & { body: string; line: string; eye: string; glow?: string; taller?: boolean; slitEyes?: boolean }
> = ({ phase, mood, running = false, squashX = 1, squashY = 1, bob = 0, scale = 1, body, line, eye, glow, taller = false, slitEyes = false, wristband = false }) => {
  const swing = running ? 32 : 22;
  const legL = Math.sin(phase) * swing;
  const legR = Math.sin(phase + Math.PI) * swing;
  const armL = Math.sin(phase + Math.PI) * swing * 0.8;
  const armR = Math.sin(phase) * swing * 0.8;
  const brow = browAngle(mood);
  return (
    <svg width={200 * scale} height={340 * scale} viewBox="0 0 200 340" style={{ display: "block", overflow: "visible", filter: glow ? `drop-shadow(0 0 14px ${glow})` : undefined }}>
      <g transform={`translate(100 330) scale(${squashX} ${squashY * (taller ? 1.3 : 1)}) translate(-100 -330) translate(0 ${bob})`}>
        <g transform={`rotate(${legL} 100 215)`}><path d="M 100 215 L 88 318" stroke={body} strokeWidth={15} strokeLinecap="round" fill="none" /></g>
        <g transform={`rotate(${armL} 100 145)`}><path d="M 100 145 L 82 218" stroke={body} strokeWidth={13} strokeLinecap="round" fill="none" /></g>
        <rect x={80} y={122} width={40} height={98} rx={20} fill={body} />
        <g transform={`rotate(${legR} 100 215)`}><path d="M 100 215 L 112 318" stroke={body} strokeWidth={15} strokeLinecap="round" fill="none" /></g>
        <g transform={`rotate(${armR} 100 145)`}>
          <path d="M 100 145 L 118 218" stroke={body} strokeWidth={13} strokeLinecap="round" fill="none" />
          {wristband ? <circle cx={116} cy={206} r={7} fill={ACCENT} /> : null}
        </g>
        <circle cx={100} cy={70} r={54} fill={body} />
        {slitEyes ? (
          <>
            <rect x={70} y={60} width={20} height={4} rx={2} fill={eye} />
            <rect x={110} y={60} width={20} height={4} rx={2} fill={eye} />
          </>
        ) : (
          <>
            <circle cx={80} cy={64} r={5.5} fill={eye} />
            <circle cx={120} cy={64} r={5.5} fill={eye} />
          </>
        )}
        <g transform={`rotate(${brow} 80 46)`}><line x1={70} y1={46} x2={90} y2={46} stroke={line} strokeWidth={4} strokeLinecap="round" /></g>
        <g transform={`rotate(${-brow} 120 46)`}><line x1={110} y1={46} x2={130} y2={46} stroke={line} strokeWidth={4} strokeLinecap="round" /></g>
        <path d={mood === "determined" ? "M 86 94 Q 100 100 114 94" : mood === "worried" ? "M 86 96 Q 100 88 114 96" : "M 88 94 L 112 94"} stroke={line} strokeWidth={4} strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* 1930s RUBBER HOSE — white body, pie-cut eyes, white gloves         */
/* ------------------------------------------------------------------ */

export const HoseFigure: React.FC<
  CharacterProps & { body: string; line: string; eye: string; glow?: string; taller?: boolean; slitEyes?: boolean }
> = ({ phase, mood, running = false, squashX = 1, squashY = 1, bob = 0, scale = 1, body, line, eye, glow, taller = false, slitEyes = false, wristband = false }) => {
  // rubber hose walks with an exaggerated bounce
  const swing = running ? 36 : 24;
  const legL = Math.sin(phase) * swing;
  const legR = Math.sin(phase + Math.PI) * swing;
  const armL = Math.sin(phase + Math.PI) * swing;
  const armR = Math.sin(phase) * swing;
  const brow = browAngle(mood);
  const bounce = (1 - Math.abs(Math.sin(phase))) * 10;
  return (
    <svg width={200 * scale} height={340 * scale} viewBox="0 0 200 340" style={{ display: "block", overflow: "visible", filter: glow ? `drop-shadow(0 0 14px ${glow})` : undefined }}>
      <g transform={`translate(100 330) scale(${squashX} ${squashY * (taller ? 1.3 : 1)}) translate(-100 -330) translate(0 ${bob - bounce})`}>
        {/* hose limbs: thin, curvy */}
        <g transform={`rotate(${legL} 100 215)`}>
          <path d="M 100 215 Q 92 270 88 318" stroke={body} strokeWidth={11} strokeLinecap="round" fill="none" />
          <ellipse cx={88} cy={320} rx={14} ry={7} fill={body} />
        </g>
        <g transform={`rotate(${armL} 100 145)`}>
          <path d="M 100 145 Q 88 180 82 214" stroke={body} strokeWidth={10} strokeLinecap="round" fill="none" />
          <circle cx={82} cy={218} r={11} fill="#FFFFFF" stroke={line} strokeWidth={2} />
        </g>
        <rect x={80} y={122} width={40} height={98} rx={20} fill={body} stroke={line} strokeWidth={2.5} />
        <g transform={`rotate(${legR} 100 215)`}>
          <path d="M 100 215 Q 108 270 112 318" stroke={body} strokeWidth={11} strokeLinecap="round" fill="none" />
          <ellipse cx={112} cy={320} rx={14} ry={7} fill={body} />
        </g>
        <g transform={`rotate(${armR} 100 145)`}>
          <path d="M 100 145 Q 112 180 118 214" stroke={body} strokeWidth={10} strokeLinecap="round" fill="none" />
          <circle cx={118} cy={218} r={11} fill="#FFFFFF" stroke={line} strokeWidth={2} />
          {wristband ? <circle cx={118} cy={206} r={6} fill={ACCENT} /> : null}
        </g>
        <circle cx={100} cy={70} r={54} fill={body} stroke={line} strokeWidth={2.5} />
        {slitEyes ? (
          <>
            <rect x={70} y={60} width={20} height={4} rx={2} fill={eye} />
            <rect x={110} y={60} width={20} height={4} rx={2} fill={eye} />
          </>
        ) : (
          <>
            {/* pie-cut eyes: white circle with a black wedge */}
            <circle cx={80} cy={64} r={9} fill="#FFFFFF" stroke={line} strokeWidth={2} />
            <path d="M 80 64 L 89 57 L 89 64 Z" fill={BLACK} />
            <circle cx={120} cy={64} r={9} fill="#FFFFFF" stroke={line} strokeWidth={2} />
            <path d="M 120 64 L 129 57 L 129 64 Z" fill={BLACK} />
          </>
        )}
        <g transform={`rotate(${brow} 80 46)`}><line x1={70} y1={46} x2={90} y2={46} stroke={line} strokeWidth={4} strokeLinecap="round" /></g>
        <g transform={`rotate(${-brow} 120 46)`}><line x1={110} y1={46} x2={130} y2={46} stroke={line} strokeWidth={4} strokeLinecap="round" /></g>
        {/* small round mouth */}
        <ellipse cx={100} cy={94} rx={6} ry={mood === "worried" ? 3 : 8} fill={line} />
      </g>
    </svg>
  );
};

/* ------------------------------------------------------------------ */
/* NEON LINE ART — stroke-only, glowing outlines on pure black         */
/* ------------------------------------------------------------------ */

export const NeonFigure: React.FC<
  CharacterProps & { body: string; line: string; eye: string; glow?: string; taller?: boolean; slitEyes?: boolean }
> = ({ phase, mood, running = false, squashX = 1, squashY = 1, bob = 0, scale = 1, body, line, eye, glow, taller = false, slitEyes = false, wristband = false }) => {
  const swing = running ? 32 : 22;
  const legL = Math.sin(phase) * swing;
  const legR = Math.sin(phase + Math.PI) * swing;
  const armL = Math.sin(phase + Math.PI) * swing * 0.8;
  const armR = Math.sin(phase) * swing * 0.8;
  const brow = browAngle(mood);
  const glowColor = glow ?? body;
  return (
    <svg
      width={200 * scale}
      height={340 * scale}
      viewBox="0 0 200 340"
      style={{ display: "block", overflow: "visible", filter: `drop-shadow(0 0 10px ${glowColor}) drop-shadow(0 0 26px ${glowColor}55)` }}
    >
      <g transform={`translate(100 330) scale(${squashX} ${squashY * (taller ? 1.3 : 1)}) translate(-100 -330) translate(0 ${bob})`}>
        <g transform={`rotate(${legL} 100 215)`}><path d="M 100 215 L 88 318" stroke={body} strokeWidth={5} strokeLinecap="round" fill="none" /></g>
        <g transform={`rotate(${armL} 100 145)`}><path d="M 100 145 L 82 218" stroke={body} strokeWidth={5} strokeLinecap="round" fill="none" /></g>
        <path d="M 100 122 L 100 220" stroke={body} strokeWidth={5} strokeLinecap="round" />
        <g transform={`rotate(${legR} 100 215)`}><path d="M 100 215 L 112 318" stroke={body} strokeWidth={5} strokeLinecap="round" fill="none" /></g>
        <g transform={`rotate(${armR} 100 145)`}>
          <path d="M 100 145 L 118 218" stroke={body} strokeWidth={5} strokeLinecap="round" fill="none" />
          {wristband ? <circle cx={118} cy={206} r={6} fill={ACCENT} /> : null}
        </g>
        <circle cx={100} cy={70} r={54} fill="none" stroke={body} strokeWidth={5} />
        {slitEyes ? (
          <>
            <line x1={72} y1={62} x2={88} y2={62} stroke={eye} strokeWidth={4} strokeLinecap="round" />
            <line x1={112} y1={62} x2={128} y2={62} stroke={eye} strokeWidth={4} strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={80} cy={64} r={6} fill={eye} />
            <circle cx={120} cy={64} r={6} fill={eye} />
          </>
        )}
        <g transform={`rotate(${brow} 80 46)`}><line x1={70} y1={46} x2={90} y2={46} stroke={line} strokeWidth={4} strokeLinecap="round" /></g>
        <g transform={`rotate(${-brow} 120 46)`}><line x1={110} y1={46} x2={130} y2={46} stroke={line} strokeWidth={4} strokeLinecap="round" /></g>
        <path d={mood === "determined" ? "M 86 94 Q 100 100 114 94" : mood === "worried" ? "M 86 96 Q 100 88 114 96" : "M 88 94 L 112 94"} stroke={line} strokeWidth={4} strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

/** Re-export shared constants for style defs. */
export { TEAL, ACCENT, BLACK };
