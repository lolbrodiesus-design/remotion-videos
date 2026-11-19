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
import { ACCENT, BaseCharacter, BaseShadow, BLACK, type Mood } from "./characters";
import { BaseBackground } from "./backgrounds";

/**
 * CANNIBALISM — the packaged film. 150s, 12 scenes, flat dark channel style.
 * Scene boundaries (frames @30fps):
 *  S1 question      0–239      S7 Andes        2160–2639
 *  S2 brain         240–479    S8 Jamestown    2640–2999
 *  S3 hunger        480–839    S9 calories     3000–3539
 *  S4 Stone Age     840–1319   S10 kuru        3540–4019
 *  S5 Neanderthals  1320–1679  S11 answer      4020–4139
 *  S6 Donner        1680–2159  S12 title card  4140–4499 (12s, per channel rules)
 */

const fontFamily = "Comic Neue";

export const FONT_FACE_CSS = `
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

export const FLOOR_Y = 900;
export const LAMP_X = 1330;

export function fade(frame: number, start: number, end: number): number {
  return interpolate(frame, [start, start + 8, end - 8, end], [0, 1, 1, 0]);
}

/** Narrator line: small white top-centre, max 8 words, fades in/out. */
export const NarratorLine: React.FC<{ text: string; start: number; end: number; top?: number }> = ({
  text,
  start,
  end,
  top = 108,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        top,
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

/** DAY counter, top left. */
export const DayCounter: React.FC<{ day: string; start: number; end: number }> = ({ day, start, end }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left: 70,
        top: 96,
        fontFamily,
        fontSize: 34,
        letterSpacing: 4,
        color: "#FFFFFF",
        opacity: fade(frame, start, end),
      }}
    >
      {day}
    </div>
  );
};

/** Big number that pops on screen with a spring, plus a small label under it. */
export const BigNumber: React.FC<{ value: string; label: string; start: number; end: number; left?: number }> = ({
  value,
  label,
  start,
  end,
  left = 700,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - start, fps, config: { damping: 11, stiffness: 260 } });
  const visible = frame >= start && frame < end;
  if (!visible) return null;
  return (
    <div style={{ position: "absolute", left, top: 330, textAlign: "center", width: 520 }}>
      <div
        style={{
          fontFamily,
          fontWeight: 700,
          fontSize: 150,
          color: "#FFFFFF",
          transform: `scale(${scale})`,
          textShadow: "0 0 30px rgba(255,255,255,0.5), 0 4px 0 rgba(0,0,0,0.8)",
          opacity: fade(frame, start, end),
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily,
          fontSize: 30,
          letterSpacing: 6,
          color: "#C9C9C4",
          opacity: fade(frame, start + 10, end),
        }}
      >
        {label}
      </div>
    </div>
  );
};

/** His one visible item after Day 1: a small white bone tucked at his waist. */
const BoneItem: React.FC = () => (
  <svg width={70} height={34} viewBox="0 0 70 34" style={{ display: "block", overflow: "visible" }}>
    <g transform="rotate(-24 35 17)">
      <rect x={14} y={12} width={42} height={10} rx={5} fill="#EDE8DC" />
      <circle cx={14} cy={12} r={8} fill="#EDE8DC" />
      <circle cx={14} cy={22} r={8} fill="#EDE8DC" />
      <circle cx={56} cy={12} r={8} fill="#EDE8DC" />
      <circle cx={56} cy={22} r={8} fill="#EDE8DC" />
    </g>
  </svg>
);

/** Thin black bars top and bottom (channel format). */
export const Bars: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 60, background: BLACK }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 60, background: BLACK }} />
  </>
);

/* ------------------------------------------------------------------ */
/* Scene backgrounds (flat shapes, same dark palette as the channel)  */
/* ------------------------------------------------------------------ */

/** Cave: dark brown-black walls, fire glow, stone tools, skull cup on a rock. */
export const CaveBackground: React.FC<{ frame: number }> = ({ frame }) => {
  const flicker = 1 + Math.sin(frame * 0.35) * 0.08 + Math.sin(frame * 0.9) * 0.05;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#14100C", overflow: "hidden" }}>
      {/* cave wall arch */}
      <div
        style={{
          position: "absolute",
          left: -120,
          top: -260,
          width: 2160,
          height: 900,
          borderRadius: "50%",
          background: "#0C0906",
        }}
      />
      {/* stalactites */}
      {[
        { x: 220, h: 120 },
        { x: 620, h: 90 },
        { x: 1020, h: 140 },
        { x: 1520, h: 100 },
        { x: 1780, h: 130 },
      ].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: s.x,
            top: 60,
            width: 46,
            height: s.h,
            background: "#0C0906",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }}
        />
      ))}
      {/* fire glow */}
      <div
        style={{
          position: "absolute",
          left: 1050,
          top: 480,
          width: 560 * flicker,
          height: 560 * flicker,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,150,50,0.55) 0%, rgba(255,120,30,0.18) 45%, rgba(255,120,30,0) 70%)",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* fire: two flame teardrops */}
      <svg style={{ position: "absolute", left: 1180, top: 640 }} width={160} height={220} viewBox="0 0 160 220">
        <path
          d="M80 200 C30 160 40 110 80 40 C120 110 130 160 80 200 Z"
          fill="#FF8C2E"
          transform={`scale(${flicker}) translate(${(1 - flicker) * 80} ${(1 - flicker) * 200})`}
        />
        <path d="M80 200 C55 175 60 140 80 105 C100 140 105 175 80 200 Z" fill="#FFD76A" />
      </svg>
      {/* fire stones */}
      {[1150, 1210, 1270, 1330].map((x, i) => (
        <div key={i} style={{ position: "absolute", left: x, top: 856, width: 34, height: 26, borderRadius: "50%", background: "#3A332B" }} />
      ))}
      {/* stone tools on the ground */}
      {[
        { x: 420, r: -18 },
        { x: 520, r: 12 },
        { x: 1620, r: 24 },
      ].map((t, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: t.x,
            top: 872,
            width: 70,
            height: 26,
            background: "#5A5148",
            clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
            transform: `rotate(${t.r}deg)`,
          }}
        />
      ))}
      {/* skull cup on a rock */}
      <div style={{ position: "absolute", left: 1560, top: 800, width: 150, height: 100, background: "#2A231B", borderRadius: "40% 40% 10% 10%" }} />
      <svg style={{ position: "absolute", left: 1590, top: 700 }} width={110} height={110} viewBox="0 0 110 110">
        <path d="M15 60 A40 40 0 0 1 95 60 L95 70 Q95 82 82 82 L28 82 Q15 82 15 70 Z" fill="#EDE8DC" stroke="#8A8478" strokeWidth={3} />
        <circle cx={38} cy={58} r={6} fill="#14100C" />
        <circle cx={72} cy={58} r={6} fill="#14100C" />
      </svg>
      {/* floor + thin grey line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 180, background: "#0E0B08" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 2, background: "#4A4438" }} />
    </div>
  );
};

/** Snow / ice age ground. `heavy` adds more falling snow. */
export const SnowBackground: React.FC<{ frame: number; heavy?: boolean }> = ({ frame, heavy = false }) => {
  const flakes = Array.from({ length: heavy ? 60 : 36 }).map((_, i) => {
    const x = (i * 173 + 41) % 1920;
    const speed = 1.2 + (i % 5) * 0.5;
    const y = (frame * speed + i * 97) % 900;
    const sway = Math.sin(frame * 0.05 + i) * 14;
    return { x: x + sway, y, r: 2 + (i % 3) };
  });
  return (
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#141B22 0%, #1E2831 70%, #232E38 100%)", overflow: "hidden" }}>
      {/* distant white hills */}
      <div style={{ position: "absolute", left: -100, top: 620, width: 900, height: 300, borderRadius: "50%", background: "#2B3742" }} />
      <div style={{ position: "absolute", left: 1100, top: 660, width: 1000, height: 280, borderRadius: "50%", background: "#27313C" }} />
      {/* falling snow */}
      {flakes.map((f, i) => (
        <div key={i} style={{ position: "absolute", left: f.x, top: f.y, width: f.r * 2, height: f.r * 2, borderRadius: "50%", background: "#E8EEF2", opacity: 0.8 }} />
      ))}
      {/* floor: snow + thin grey line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 180, background: "#C7D2DA" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 2, background: "#8A97A3" }} />
    </div>
  );
};

/** Jamestown fort: wooden palisade, dirt floor. */
export const FortBackground: React.FC = () => {
  const logs = Array.from({ length: 24 }).map((_, i) => ({
    x: i * 82 - 20,
    h: 300 + ((i * 37) % 80),
  }));
  return (
    <div style={{ position: "absolute", inset: 0, background: "#171310", overflow: "hidden" }}>
      {logs.map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: l.x,
            top: FLOOR_Y - l.h,
            width: 78,
            height: l.h,
            background: i % 2 === 0 ? "#3A2E22" : "#33281D",
            borderRadius: "38px 38px 0 0",
            border: "2px solid #241C14",
          }}
        />
      ))}
      {/* a cold fire pit, long dead */}
      <div style={{ position: "absolute", left: 1450, top: 830, width: 220, height: 60, borderRadius: "50%", background: "#241C14" }} />
      <div style={{ position: "absolute", left: 1480, top: 845, width: 160, height: 30, borderRadius: "50%", background: "#171310" }} />
      {/* floor */}
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 180, background: "#241C14" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 2, background: "#5A4A36" }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

export const FLOOR_BOTTOM = 1080 - FLOOR_Y; // 180

/** S1 — The question (0–239). Walks in under the lamp, shadow rises. */
const SceneQuestion: React.FC = () => {
  const frame = useCurrentFrame();
  const phase = frame * 0.35;
  const charX = interpolate(frame, [0, 90], [-220, LAMP_X - 250], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const grow = interpolate(frame, [150, 200], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mood: Mood = frame < 180 ? "neutral" : "worried";
  return (
    <>
      <BaseBackground scrollX={0} frame={frame} />
      {frame >= 150 ? (
        <div style={{ position: "absolute", left: charX - 240, bottom: FLOOR_BOTTOM }}>
          <BaseShadow phase={phase * 0.5} scale={1} grow={grow} bob={0} />
        </div>
      ) : null}
      <div style={{ position: "absolute", left: charX, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={phase} mood={mood} running={false} bob={Math.abs(Math.sin(phase)) * 5} wristband={false} />
      </div>
      <NarratorLine text="Why do humans eat each other?" start={20} end={225} />
      <DayCounter day="DAY 1" start={10} end={235} />
    </>
  );
};

/** S2 — The brain (240–479). Close-up on his head, slow push-in, padlock. */
const SceneBrain: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 240;
  const pushIn = interpolate(f, [0, 240], [2.3, 2.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lockIn = interpolate(f, [130, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0A0C0B", overflow: "hidden" }}>
        {/* spotlight on his face */}
        <div
          style={{
            position: "absolute",
            left: 560,
            top: 60,
            width: 800,
            height: 800,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,214,140,0.14) 0%, rgba(255,214,140,0) 65%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 760,
            bottom: FLOOR_BOTTOM - 140,
            transform: `scale(${pushIn})`,
            transformOrigin: "100px 330px",
          }}
        >
          <BaseCharacter phase={0} mood="worried" running={false} bob={0} />
        </div>
        {/* padlock — disgust is a lock */}
        {lockIn > 0 ? (
          <svg style={{ position: "absolute", left: 1420, top: 300, opacity: lockIn }} width={120} height={150} viewBox="0 0 120 150">
            <path d="M30 70 V45 A30 30 0 0 1 90 45 V70" fill="none" stroke="#8A97B0" strokeWidth={10} />
            <rect x={15} y={65} width={90} height={75} rx={12} fill="#3A443F" stroke="#8A97B0" strokeWidth={4} />
            <circle cx={60} cy={98} r={10} fill="#0A0C0B" />
            <rect x={56} y={100} width={8} height={22} rx={4} fill="#0A0C0B" />
          </svg>
        ) : null}
      </div>
      <NarratorLine text="Your brain says no." start={260} end={360} />
      <NarratorLine text="Disgust is a lock." start={370} end={470} />
    </>
  );
};

/** S3 — Hunger (480–839). Days climb, he weakens, shadow grows. */
const SceneHunger: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 480;
  const phase = f * 0.18;
  const charX = interpolate(f, [0, 360], [500, 900], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shadowScale = interpolate(f, [0, 360], [1, 1.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slump = interpolate(f, [0, 360], [1, 0.88], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mood: Mood = f < 120 ? "worried" : "worried";
  return (
    <>
      <BaseBackground scrollX={0} frame={frame} />
      <div style={{ position: "absolute", left: charX - 260, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={phase * 0.5} scale={shadowScale} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: charX, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={phase} mood={mood} running={false} squashY={slump} bob={Math.abs(Math.sin(phase)) * 3} wristband={false} />
        {/* bone item at his waist, from Day 10 on */}
        {f >= 120 ? (
          <div style={{ position: "absolute", left: 118, top: 218 }}>
            <BoneItem />
          </div>
        ) : null}
      </div>
      <DayCounter day="DAY 1" start={480} end={600} />
      <DayCounter day="DAY 10" start={600} end={720} />
      <DayCounter day="DAY 30" start={720} end={835} />
      <NarratorLine text="Hunger turns the key." start={500} end={640} />
      <NarratorLine text="Day 30. The lock breaks." start={720} end={830} />
    </>
  );
};

/** S4 — Stone Age (840–1319). Cave, fire, skull cup. */
const SceneStoneAge: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 840;
  const mood: Mood = f < 200 ? "neutral" : "worried";
  return (
    <>
      <CaveBackground frame={frame} />
      <div style={{ position: "absolute", left: 620, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={0} scale={1.2} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: 900, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={Math.sin(f * 0.05) * 4} mood={mood} running={false} bob={0} wristband={false} />
        <div style={{ position: "absolute", left: 118, top: 218 }}>
          <BoneItem />
        </div>
      </div>
      <NarratorLine text="14,700 years ago." start={860} end={980} />
      <NarratorLine text="They ate the dead." start={990} end={1140} />
      <NarratorLine text="And made cups from skulls." start={1150} end={1300} />
    </>
  );
};

/** Bone shape with red cut marks, lying on the ground. */
export const CutBone: React.FC<{ left: number; top: number; rotate: number }> = ({ left, top, rotate }) => (
  <svg style={{ position: "absolute", left, top, transform: `rotate(${rotate}deg)` }} width={120} height={50} viewBox="0 0 120 50">
    <rect x={24} y={18} width={72} height={14} rx={7} fill="#EDE8DC" />
    <circle cx={24} cy={18} r={11} fill="#EDE8DC" />
    <circle cx={24} cy={32} r={11} fill="#EDE8DC" />
    <circle cx={96} cy={18} r={11} fill="#EDE8DC" />
    <circle cx={96} cy={32} r={11} fill="#EDE8DC" />
    {/* cut marks */}
    <line x1={48} y1={16} x2={56} y2={34} stroke={ACCENT} strokeWidth={3} />
    <line x1={62} y1={16} x2={70} y2={34} stroke={ACCENT} strokeWidth={3} />
  </svg>
);

/** S5 — Neanderthals (1320–1679). Ice age, cut-marked bones. */
const SceneNeanderthal: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 1320;
  const phase = f * 0.16;
  const charX = interpolate(f, [0, 360], [420, 760], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <SnowBackground frame={frame} />
      <CutBone left={980} top={872} rotate={-8} />
      <CutBone left={1230} top={884} rotate={14} />
      <CutBone left={1450} top={868} rotate={-20} />
      <div style={{ position: "absolute", left: charX - 240, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={phase * 0.5} scale={1.3} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: charX, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={phase} mood="worried" running={false} squashY={0.94} bob={Math.abs(Math.sin(phase)) * 3} wristband={false} />
        <div style={{ position: "absolute", left: 118, top: 218 }}>
          <BoneItem />
        </div>
      </div>
      <NarratorLine text="Neanderthals did it too." start={1340} end={1500} />
      <NarratorLine text="Same tools as deer." start={1510} end={1660} />
    </>
  );
};

/** S6 — Donner Party (1680–2159). Snow, stuck wagon, 87 → 48. */
const SceneDonner: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 1680;
  const phase = f * 0.14;
  const charX = interpolate(f, [0, 480], [380, 700], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <SnowBackground frame={frame} heavy />
      {/* stuck wagon, tilted */}
      <div style={{ position: "absolute", left: 1080, top: 660, transform: "rotate(-6deg)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 420, height: 130, background: "#4A3524", borderRadius: 12, border: "3px solid #2E2115" }} />
        <div style={{ position: "absolute", left: 20, top: -90, width: 380, height: 110, background: "#C7D2DA", borderRadius: "190px 190px 0 0", opacity: 0.9 }} />
        <div style={{ position: "absolute", left: 60, top: 120, width: 90, height: 90, borderRadius: "50%", background: "#2E2115", border: "10px solid #6B5138" }} />
        <div style={{ position: "absolute", left: 280, top: 120, width: 90, height: 90, borderRadius: "50%", background: "#2E2115", border: "10px solid #6B5138" }} />
        {/* broken wheel spoke, sticking out */}
        <div style={{ position: "absolute", left: 330, top: 170, width: 90, height: 10, background: "#6B5138", transform: "rotate(35deg)" }} />
      </div>
      <div style={{ position: "absolute", left: charX - 240, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={phase * 0.5} scale={1.4} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: charX, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={phase} mood="worried" running={false} squashY={0.9} bob={Math.abs(Math.sin(phase)) * 3} wristband={false} />
        <div style={{ position: "absolute", left: 118, top: 218 }}>
          <BoneItem />
        </div>
      </div>
      <BigNumber value="87" label="PIONEERS" start={1740} end={1920} left={1420} />
      <BigNumber value="48" label="WALKED OUT" start={1980} end={2140} left={1420} />
      <NarratorLine text="1846. 87 pioneers." start={1700} end={1900} />
      <NarratorLine text="48 walked out." start={1980} end={2140} />
    </>
  );
};

/** S7 — Andes (2160–2639). Plane in the snow, radio, 72 → 16. */
const SceneAndes: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 2160;
  const blink = Math.sin(f * 0.4) > 0 ? 1 : 0.15;
  return (
    <>
      <SnowBackground frame={frame} heavy />
      {/* crashed plane, nose-down in a snow drift */}
      <div style={{ position: "absolute", left: 980, top: 560, transform: "rotate(8deg)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 560, height: 90, background: "#B9C4CC", borderRadius: 45 }} />
        <div style={{ position: "absolute", left: 430, top: -90, width: 60, height: 110, background: "#8A97A3", transform: "rotate(12deg)" }} />
        <div style={{ position: "absolute", left: 180, top: 70, width: 200, height: 26, background: "#8A97A3", transform: "rotate(-14deg)" }} />
        <div style={{ position: "absolute", left: 60, top: 30, width: 60, height: 30, borderRadius: "50%", background: "#2E3B44" }} />
        <div style={{ position: "absolute", left: 150, top: 30, width: 60, height: 30, borderRadius: "50%", background: "#2E3B44" }} />
      </div>
      {/* snow drift burying the nose */}
      <div style={{ position: "absolute", left: 1420, top: 780, width: 420, height: 140, borderRadius: "50%", background: "#D5DEE5" }} />
      {/* radio with blinking light — clear of the character, right of him */}
      <div style={{ position: "absolute", left: 920, top: 810 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 90, height: 60, background: "#3A443F", borderRadius: 8, border: "3px solid #232826" }} />
        <div style={{ position: "absolute", left: 70, top: -60, width: 4, height: 60, background: "#8A97B0", transform: "rotate(12deg)" }} />
        <div style={{ position: "absolute", left: 14, top: 14, width: 16, height: 16, borderRadius: "50%", background: ACCENT, opacity: blink, boxShadow: `0 0 16px ${ACCENT}` }} />
        <div style={{ position: "absolute", left: 40, top: 22, width: 36, height: 6, background: "#8A97B0", borderRadius: 3 }} />
      </div>
      <div style={{ position: "absolute", left: 420, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={0} scale={1.5} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: 660, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={0} mood="worried" running={false} squashY={0.92} bob={0} wristband={false} />
        <div style={{ position: "absolute", left: 118, top: 218 }}>
          <BoneItem />
        </div>
      </div>
      <BigNumber value="72" label="DAYS" start={2220} end={2380} left={1420} />
      <BigNumber value="16" label="SURVIVED" start={2400} end={2580} left={1420} />
      <NarratorLine text="1972. 72 days." start={2180} end={2380} />
      <NarratorLine text="16 survived." start={2400} end={2560} />
      <NarratorLine text="They called it communion." start={2560} end={2630} />
    </>
  );
};

/** S8 — Jamestown (2640–2999). Fort, empty plate, rat, shoe. */
const SceneJamestown: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 2640;
  const ratX = 1500 + Math.sin(f * 0.12) * 24;
  return (
    <>
      <FortBackground />
      {/* empty plate */}
      <div style={{ position: "absolute", left: 980, top: 856, width: 150, height: 34, borderRadius: "50%", background: "#C7C2B4", border: "4px solid #8A8478" }} />
      {/* rat */}
      <div style={{ position: "absolute", left: ratX, top: 850 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 70, height: 34, borderRadius: "50%", background: "#6B6560" }} />
        <div style={{ position: "absolute", left: 62, top: 14, width: 60, height: 6, background: "#6B6560", borderRadius: 3, transform: "rotate(8deg)" }} />
        <div style={{ position: "absolute", left: 8, top: -14, width: 10, height: 18, background: "#6B6560", borderRadius: "50% 50% 0 0", transform: "rotate(-14deg)" }} />
      </div>
      {/* worn shoe */}
      <div style={{ position: "absolute", left: 1250, top: 862, width: 110, height: 40, background: "#5A4028", borderRadius: "20px 40px 8px 8px", transform: "rotate(-8deg)" }} />
      <div style={{ position: "absolute", left: 500, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={0} scale={1.4} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: 740, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={0} mood="worried" running={false} squashY={0.85} bob={0} wristband={false} />
        <div style={{ position: "absolute", left: 118, top: 218 }}>
          <BoneItem />
        </div>
      </div>
      <NarratorLine text="1609. The Starving Time." start={2660} end={2800} />
      <NarratorLine text="Rats. Leather. Then neighbours." start={2820} end={2980} />
    </>
  );
};

/** S9 — Science: calories (3000–3539). 125,000 → 32,000 → 3,600,000. */
const SceneCalories: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0A0C0B", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 560,
            top: 180,
            width: 900,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,214,140,0.10) 0%, rgba(255,214,140,0) 65%)",
          }}
        />
        {/* mammoth silhouette, appears with the big number */}
        {frame >= 3380 ? (
          <svg style={{ position: "absolute", left: 1150, top: 560, opacity: fade(frame, 3380, 3520) }} width={560} height={340} viewBox="0 0 560 340">
            <ellipse cx={280} cy={180} rx={210} ry={130} fill="#1E2422" />
            <circle cx={120} cy={120} r={70} fill="#1E2422" />
            <path d="M90 160 Q60 260 110 300" stroke="#EDE8DC" strokeWidth={10} fill="none" strokeLinecap="round" />
            <path d="M160 240 L160 330 M200 260 L200 330 M360 260 L360 330 M420 250 L420 330" stroke="#1E2422" strokeWidth={26} strokeLinecap="round" />
          </svg>
        ) : null}
        <div style={{ position: "absolute", left: 420, bottom: FLOOR_BOTTOM }}>
          <BaseShadow phase={0} scale={1.2} grow={1} bob={0} />
        </div>
        <div style={{ position: "absolute", left: 660, bottom: FLOOR_BOTTOM }}>
          <BaseCharacter phase={0} mood="worried" running={false} bob={0} wristband={false} />
          <div style={{ position: "absolute", left: 118, top: 218 }}>
            <BoneItem />
          </div>
        </div>
      </div>
      <BigNumber value="125,000" label="ONE HUMAN BODY" start={3060} end={3200} left={700} />
      <BigNumber value="32,000" label="EDIBLE MUSCLE" start={3220} end={3360} left={700} />
      <BigNumber value="3,600,000" label="ONE MAMMOTH" start={3380} end={3520} left={620} />
      <NarratorLine text="A human is a bad meal." start={3080} end={3220} />
      <NarratorLine text="A mammoth fed 25 for 60 days." start={3400} end={3520} />
    </>
  );
};

/** S10 — Science: kuru (3540–4019). Red brain, shaking hands, looming shadow. */
const SceneKuru: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 3540;
  const pulse = 1 + Math.sin(f * 0.25) * 0.03;
  const tremor = Math.sin(f * 1.3) * 3;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0D0505", overflow: "hidden" }}>
        {/* red glow */}
        <div
          style={{
            position: "absolute",
            left: 1150,
            top: 300,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(229,72,77,0.30) 0%, rgba(229,72,77,0) 65%)`,
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* the brain: red, glowing, pulsing */}
        <svg
          style={{ position: "absolute", left: 1180, top: 280, transform: `scale(${pulse})`, filter: "drop-shadow(0 0 30px rgba(229,72,77,0.8))" }}
          width={340}
          height={300}
          viewBox="0 0 340 300"
        >
          <path
            d="M60 190 C20 140 40 60 110 45 C140 10 220 10 250 45 C320 60 330 140 290 190 C300 240 250 280 170 280 C100 280 50 250 60 190 Z"
            fill="#C22E33"
            stroke="#E5484D"
            strokeWidth={4}
          />
          <path d="M110 90 Q150 70 190 95 M90 150 Q140 130 180 155 M120 210 Q170 190 220 215 M200 60 Q240 90 230 130" stroke="#7A1A1D" strokeWidth={7} fill="none" strokeLinecap="round" />
        </svg>
        {/* looming shadow, huge */}
        <div style={{ position: "absolute", left: 380, bottom: FLOOR_BOTTOM }}>
          <BaseShadow phase={0} scale={1.9} grow={1} bob={0} />
        </div>
        {/* the character, trembling */}
        <div style={{ position: "absolute", left: 700 + tremor, bottom: FLOOR_BOTTOM }}>
          <BaseCharacter phase={0} mood="worried" running={false} bob={0} wristband={false} />
          <div style={{ position: "absolute", left: 118, top: 218 }}>
            <BoneItem />
          </div>
        </div>
      </div>
      <NarratorLine text="Eat the brain, get the sickness." start={3560} end={3740} />
      <NarratorLine text="It waits 50 years." start={3760} end={3900} />
      <NarratorLine text="Always fatal." start={3920} end={4000} />
    </>
  );
};

/** S11 — The answer (4020–4139). Lamp light, shadow shrinks back. */
const SceneAnswer: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 4020;
  const shadowScale = interpolate(f, [0, 120], [1.9, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shadowFade = interpolate(f, [0, 120], [1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pushIn = interpolate(f, [0, 120], [1, 1.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${pushIn})`, transformOrigin: "960px 700px" }}>
        <BaseBackground scrollX={0} frame={frame} />
        <div style={{ position: "absolute", left: 840, bottom: FLOOR_BOTTOM, opacity: shadowFade }}>
          <BaseShadow phase={0} scale={shadowScale} grow={1} bob={0} />
        </div>
        <div style={{ position: "absolute", left: 1080, bottom: FLOOR_BOTTOM }}>
          <BaseCharacter phase={0} mood="determined" running={false} bob={0} wristband={false} />
          <div style={{ position: "absolute", left: 118, top: 218 }}>
            <BoneItem />
          </div>
        </div>
      </div>
      <NarratorLine text="Not food." start={4030} end={4070} />
      <NarratorLine text="Ritual. Survival." start={4080} end={4130} />
    </>
  );
};

/** S12 — Title card (4140–4499, 12s). HUNGER types on, wavy underline, lines, fade. */
const SceneTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 4140;
  const word = "HUNGER";
  const lettersShown = Math.min(6, Math.floor((f - 20) / 15) + 1);
  const underlineIn = interpolate(f, [120, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const whiteLineIn = interpolate(f, [220, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const redLineIn = interpolate(f, [280, 310], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [320, 359], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // wavy underline path
  const wave = Array.from({ length: 60 })
    .map((_, i) => `${i === 0 ? "M" : "L"} ${i * 12} ${14 + Math.sin(i * 0.55) * 7}`)
    .join(" ");
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#000" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 400,
            textAlign: "center",
            fontFamily,
            fontWeight: 700,
            fontSize: 200,
            letterSpacing: 24,
            color: "#FFFFFF",
          }}
        >
          {word.slice(0, Math.max(0, lettersShown))}
        </div>
        {/* wavy accent underline */}
        <svg style={{ position: "absolute", left: 610, top: 640, opacity: underlineIn }} width={700} height={30} viewBox="0 0 720 30">
          <path d={wave} stroke={ACCENT} strokeWidth={7} fill="none" strokeLinecap="round" />
        </svg>
        {/* one white line */}
        <div style={{ position: "absolute", left: 710, top: 760, width: 500, height: 4, background: "#FFFFFF", opacity: whiteLineIn }} />
        {/* one short accent line */}
        <div style={{ position: "absolute", left: 810, top: 800, width: 300, height: 4, background: ACCENT, opacity: redLineIn }} />
      </div>
      {fadeOut > 0 ? <div style={{ position: "absolute", inset: 0, background: "#000", opacity: fadeOut }} /> : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Main film                                                           */
/* ------------------------------------------------------------------ */

export const CannibalismFilm: React.FC = () => {
  const frame = useCurrentFrame();

  const [fontHandle] = useState(() => delayRender("Loading Comic Neue font"));
  useEffect(() => {
    Promise.all([
      document.fonts.load('400 46px "Comic Neue"'),
      document.fonts.load('700 200px "Comic Neue"'),
    ])
      .then(() => continueRender(fontHandle))
      .catch(() => continueRender(fontHandle));
  }, [fontHandle]);

  const scene =
    frame < 240 ? <SceneQuestion /> :
    frame < 480 ? <SceneBrain /> :
    frame < 840 ? <SceneHunger /> :
    frame < 1320 ? <SceneStoneAge /> :
    frame < 1680 ? <SceneNeanderthal /> :
    frame < 2160 ? <SceneDonner /> :
    frame < 2640 ? <SceneAndes /> :
    frame < 3000 ? <SceneJamestown /> :
    frame < 3540 ? <SceneCalories /> :
    frame < 4020 ? <SceneKuru /> :
    frame < 4140 ? <SceneAnswer /> :
    <SceneTitle />;

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <style>{FONT_FACE_CSS}</style>
      {/* SFX — all synthesized in code, no downloads */}
      <Audio src={staticFile("sfx/drone.wav")} startFrom={0} volume={0.3} />
      <Audio src={staticFile("sfx/drone.wav")} startFrom={840} volume={0.3} />
      <Audio src={staticFile("sfx/drone.wav")} startFrom={3540} volume={0.35} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={240} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={480} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={840} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={1320} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={1680} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={2160} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={2640} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={3000} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={3540} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={4020} volume={0.5} />
      <Audio src={staticFile("sfx/heartbeat.wav")} startFrom={480} volume={0.6} />
      <Audio src={staticFile("sfx/heartbeat.wav")} startFrom={600} volume={0.5} />
      <Audio src={staticFile("sfx/heartbeat.wav")} startFrom={720} volume={0.5} />
      <Audio src={staticFile("sfx/wind.wav")} startFrom={1320} volume={0.7} />
      <Audio src={staticFile("sfx/wind.wav")} startFrom={1680} volume={0.7} />
      <Audio src={staticFile("sfx/wind.wav")} startFrom={2160} volume={0.7} />
      <Audio src={staticFile("sfx/crack.wav")} startFrom={1400} volume={0.9} />
      <Audio src={staticFile("sfx/thud.wav")} startFrom={480} volume={0.7} />
      <Audio src={staticFile("sfx/thud.wav")} startFrom={1680} volume={0.7} />
      <Audio src={staticFile("sfx/thud.wav")} startFrom={2640} volume={0.7} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={600} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={720} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={1740} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={1980} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={2220} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={2400} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={3060} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={3220} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={3380} volume={0.8} />
      <Audio src={staticFile("sfx/impact.wav")} startFrom={3600} volume={0.9} />
      <Audio src={staticFile("sfx/impact.wav")} startFrom={4020} volume={0.8} />
      <Audio src={staticFile("sfx/pop.wav")} startFrom={4260} volume={0.7} />
      <Audio src={staticFile("sfx/pop.wav")} startFrom={4360} volume={0.7} />

      {scene}
      <Bars />
    </AbsoluteFill>
  );
};
