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
import {
  Bars,
  BigNumber,
  CaveBackground,
  CutBone,
  DayCounter,
  fade,
  FLOOR_BOTTOM,
  FONT_FACE_CSS,
  FortBackground,
  LAMP_X,
  NarratorLine,
  SnowBackground,
} from "./Cannibalism";

/**
 * CANNIBALISM — the 10-minute packaged film. 630s, 28 scenes, flat dark channel style.
 * Scene boundaries (frames @30fps):
 *  S1 question      0–299      S15 diary        9180–9719
 *  S2 brain         300–779    S16 Andes        9720–10619
 *  S3 disgust       780–1439   S17 communion    10620–11159
 *  S4 lock holds    1440–2159  S18 Jamestown    11160–12059
 *  S5 hunger key    2160–2999  S19 Leningrad    12060–12779
 *  S6 lock breaks   3000–3719  S20 calorie lie  12780–13559
 *  S7 after line    3720–4319  S21 mammoth      13560–14279
 *  S8 Gough's Cave  4320–5039  S22 paradox      14280–14819
 *  S9 cut/chewed    5040–5759  S23 kuru         14820–15659
 *  S10 skull cups   5760–6479  S24 shaking      15660–16379
 *  S11 zigzag bone  6480–7019  S25 long wait    16380–17099
 *  S12 Neanderthals 7020–7739  S26 answer       17100–18179
 *  S13 850k years   7740–8279  S27 shadow speaks 18180–18539
 *  S14 Donner       8280–9179  S28 title card   18540–18899 (12s, per channel rules)
 *
 * His one visible item after Day 1: a small lantern, carried from S4 onward.
 */

const fontFamily = "Comic Neue";

/** His one visible item after Day 1: a small lantern with a warm glow. */
const LanternItem: React.FC = () => (
  <svg
    width={64}
    height={92}
    viewBox="0 0 64 92"
    style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 0 14px rgba(255,200,94,0.8))" }}
  >
    <defs>
      <radialGradient id="lanternGlow" cx="50%" cy="55%" r="60%">
        <stop offset="0%" stopColor="#FFE9B0" />
        <stop offset="100%" stopColor="#FFB84D" />
      </radialGradient>
    </defs>
    <path d="M22 12 Q32 0 42 12" fill="none" stroke="#8A8478" strokeWidth={4} strokeLinecap="round" />
    <rect x={20} y={12} width={24} height={8} rx={3} fill="#5A5148" />
    <rect x={14} y={20} width={36} height={56} rx={8} fill="url(#lanternGlow)" stroke="#5A5148" strokeWidth={3} />
    <line x1={32} y1={20} x2={32} y2={76} stroke="#5A5148" strokeWidth={2} />
    <rect x={16} y={76} width={32} height={8} rx={3} fill="#5A5148" />
  </svg>
);

/** The shadow's line: accent-coloured text beside the shadow. */
const ShadowLine: React.FC<{ text: string; start: number; end: number; left?: number; top?: number }> = ({
  text,
  start,
  end,
  left = 300,
  top = 300,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        fontFamily,
        fontSize: 44,
        color: ACCENT,
        opacity: fade(frame, start, end),
        textShadow: "0 0 18px rgba(229,72,77,0.7), 0 2px 12px rgba(0,0,0,0.9)",
      }}
    >
      {text}
    </div>
  );
};

/** Lantern hanging from his front hand (character box is 200x340, hand ~118,218). */
const LanternAtHand: React.FC<{ show: boolean }> = ({ show }) =>
  show ? (
    <div style={{ position: "absolute", left: 104, top: 210 }}>
      <LanternItem />
    </div>
  ) : null;

/* ------------------------------------------------------------------ */
/* ACT 1 — THE BRAIN                                                   */
/* ------------------------------------------------------------------ */

/** S1 — The question (0–299). Walks in under the lamp, shadow rises. */
const SceneQuestion10: React.FC = () => {
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
      <NarratorLine text="Why do humans eat each other?" start={20} end={285} />
      <DayCounter day="DAY 1" start={10} end={295} />
    </>
  );
};

/** S2 — The brain says no (300–779). Close-up, slow push-in, padlock. */
const SceneBrain10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 300;
  const pushIn = interpolate(f, [0, 480], [2.3, 2.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lockIn = interpolate(f, [130, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0A0C0B", overflow: "hidden" }}>
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
        {lockIn > 0 ? (
          <svg style={{ position: "absolute", left: 1420, top: 300, opacity: lockIn }} width={120} height={150} viewBox="0 0 120 150">
            <path d="M30 70 V45 A30 30 0 0 1 90 45 V70" fill="none" stroke="#8A97B0" strokeWidth={10} />
            <rect x={15} y={65} width={90} height={75} rx={12} fill="#3A443F" stroke="#8A97B0" strokeWidth={4} />
            <circle cx={60} cy={98} r={10} fill="#0A0C0B" />
            <rect x={56} y={100} width={8} height={22} rx={4} fill="#0A0C0B" />
          </svg>
        ) : null}
      </div>
      <NarratorLine text="Your brain says no." start={320} end={500} />
      <NarratorLine text="Disgust is a lock." start={510} end={770} />
    </>
  );
};

/** S3 — The disgust circuit (780–1439). His head glows softly; the shadow watches. */
const SceneDisgust10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 780;
  const pushIn = interpolate(f, [0, 660], [1, 1.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glowPulse = 0.5 + Math.sin(f * 0.06) * 0.12;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0A0C0B", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${pushIn})`, transformOrigin: "960px 500px" }}>
          {/* soft teal glow around his head */}
          <div
            style={{
              position: "absolute",
              left: 760,
              top: 180,
              width: 420,
              height: 420,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(143,184,168,${glowPulse}) 0%, rgba(143,184,168,0.12) 45%, rgba(143,184,168,0) 70%)`,
            }}
          />
          {/* circuit dots around the head */}
          {[
            { x: 820, y: 300 },
            { x: 1120, y: 280 },
            { x: 1180, y: 430 },
            { x: 780, y: 460 },
            { x: 960, y: 200 },
          ].map((d, i) => (
            <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: 10, height: 10, borderRadius: "50%", background: "#8FB8A8", opacity: 0.7 }} />
          ))}
          <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
            <line x1={825} y1={305} x2={965} y2={205} stroke="#8FB8A8" strokeWidth={2} opacity={0.35} />
            <line x1={1125} y1={285} x2={965} y2={205} stroke="#8FB8A8" strokeWidth={2} opacity={0.35} />
            <line x1={1185} y1={435} x2={1125} y2={285} stroke="#8FB8A8" strokeWidth={2} opacity={0.35} />
            <line x1={785} y1={465} x2={825} y2={305} stroke="#8FB8A8" strokeWidth={2} opacity={0.35} />
          </svg>
          <div style={{ position: "absolute", left: 860, bottom: FLOOR_BOTTOM }}>
            <BaseCharacter phase={0} mood="worried" running={false} bob={0} />
          </div>
          <div style={{ position: "absolute", left: 1300, bottom: FLOOR_BOTTOM }}>
            <BaseShadow phase={0} scale={1.0} grow={1} bob={0} />
          </div>
        </div>
      </div>
      <NarratorLine text="Your brain treats flesh as poison." start={800} end={1080} />
      <NarratorLine text="One of the strongest taboos." start={1100} end={1420} />
    </>
  );
};

/** S4 — The lock holds (1440–2159). Day 1: he picks up the lantern and walks on. */
const SceneLockHolds10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 1440;
  const { fps } = useVideoConfig();
  const phase = f * 0.16;
  const charX = interpolate(f, [0, 720], [420, 900], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lanternIn = spring({ frame: f - 120, fps, config: { damping: 12, stiffness: 200 } });
  return (
    <>
      <BaseBackground scrollX={0} frame={frame} />
      <div style={{ position: "absolute", left: charX - 240, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={phase * 0.5} scale={1} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: charX, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={phase} mood="neutral" running={false} bob={Math.abs(Math.sin(phase)) * 4} wristband={false} />
        {f >= 120 ? (
          <div style={{ position: "absolute", left: 104, top: 210, transform: `scale(${lanternIn})`, transformOrigin: "32px 10px" }}>
            <LanternItem />
          </div>
        ) : null}
      </div>
      <DayCounter day="DAY 1" start={1450} end={2150} />
      <NarratorLine text="Day 1. He still says no." start={1460} end={1760} />
      <NarratorLine text="The lock holds." start={1780} end={2140} />
    </>
  );
};

/** S5 — Hunger turns the key (2160–2999). Days climb; he thins; the shadow grows. */
const SceneHungerKey10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 2160;
  const phase = f * 0.18;
  const charX = interpolate(f, [0, 840], [500, 900], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shadowScale = interpolate(f, [0, 840], [1, 1.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slump = interpolate(f, [0, 840], [1, 0.88], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <BaseBackground scrollX={0} frame={frame} />
      <div style={{ position: "absolute", left: charX - 260, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={phase * 0.5} scale={shadowScale} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: charX, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={phase} mood="worried" running={false} squashY={slump} bob={Math.abs(Math.sin(phase)) * 3} wristband={false} />
        <LanternAtHand show />
      </div>
      <DayCounter day="DAY 1" start={2160} end={2400} />
      <DayCounter day="DAY 10" start={2400} end={2640} />
      <DayCounter day="DAY 20" start={2640} end={2880} />
      <DayCounter day="DAY 30" start={2880} end={2995} />
      <NarratorLine text="Day 10. Day 20. Day 30." start={2400} end={2720} />
      <NarratorLine text="Hunger turns the key." start={2740} end={2980} />
    </>
  );
};

/** S6 — The lock breaks (3000–3719). The shadow is taller than him now. */
const SceneLockBreaks10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 3000;
  const phase = f * 0.14;
  const charX = interpolate(f, [0, 720], [560, 860], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shadowScale = interpolate(f, [0, 720], [1.6, 1.95], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slump = interpolate(f, [0, 720], [0.88, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <BaseBackground scrollX={0} frame={frame} />
      <div style={{ position: "absolute", left: charX - 280, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={phase * 0.5} scale={shadowScale} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: charX, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={phase} mood="worried" running={false} squashY={slump} bob={Math.abs(Math.sin(phase)) * 3} wristband={false} />
        <LanternAtHand show />
      </div>
      <DayCounter day="DAY 30" start={3010} end={3700} />
      <NarratorLine text="Day 30. The lock breaks." start={3040} end={3340} />
      <NarratorLine text="Starvation switches disgust off." start={3360} end={3700} />
    </>
  );
};

/** S7 — After the line (3720–4319). He looks at his own hands. */
const SceneAfterLine10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 3720;
  const pushIn = interpolate(f, [0, 600], [1, 1.12], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0A0C0B", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${pushIn})`, transformOrigin: "960px 600px" }}>
          <div
            style={{
              position: "absolute",
              left: 560,
              top: 100,
              width: 800,
              height: 700,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,214,140,0.12) 0%, rgba(255,214,140,0) 65%)",
            }}
          />
          <div style={{ position: "absolute", left: 860, bottom: FLOOR_BOTTOM }}>
            <BaseCharacter phase={0} mood="worried" running={false} squashY={0.96} bob={0} />
            <LanternAtHand show />
            {/* cupped hands, held out in front of his chest */}
            <div style={{ position: "absolute", left: 52, top: 232, width: 26, height: 26, borderRadius: "50%", background: "#8FB8A8" }} />
            <div style={{ position: "absolute", left: 122, top: 232, width: 26, height: 26, borderRadius: "50%", background: "#8FB8A8" }} />
          </div>
          <div style={{ position: "absolute", left: 1300, bottom: FLOOR_BOTTOM }}>
            <BaseShadow phase={0} scale={1.3} grow={1} bob={0} />
          </div>
        </div>
      </div>
      <NarratorLine text="Ordinary people cross it." start={3760} end={4020} />
      <NarratorLine text="And live with it after." start={4040} end={4300} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* ACT 2 — STONE AGE                                                   */
/* ------------------------------------------------------------------ */

/** S8 — Gough's Cave (4320–5039). Cave, firelight, stone tools. */
const SceneGough10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 4320;
  const mood: Mood = f < 360 ? "neutral" : "worried";
  return (
    <>
      <CaveBackground frame={frame} />
      <div style={{ position: "absolute", left: 620, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={0} scale={1.2} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: 900, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={Math.sin(f * 0.05) * 4} mood={mood} running={false} bob={0} wristband={false} />
        <LanternAtHand show />
      </div>
      <NarratorLine text="14,700 years ago." start={4340} end={4580} />
      <NarratorLine text="Six people in a cave." start={4600} end={5020} />
    </>
  );
};

/** S9 — Cut and chewed (5040–5759). Bones under lamplight; 65% pops. */
const SceneCutChewed10: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <CaveBackground frame={frame} />
      <CutBone left={700} top={872} rotate={-8} />
      <CutBone left={950} top={884} rotate={14} />
      <CutBone left={1180} top={868} rotate={-20} />
      <CutBone left={1420} top={880} rotate={6} />
      <div style={{ position: "absolute", left: 420, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={0} scale={1.3} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: 1600, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={0} mood="worried" running={false} bob={0} wristband={false} />
        <LanternAtHand show />
      </div>
      <BigNumber value="65%" label="BONES CUT" start={5160} end={5480} left={700} />
      <NarratorLine text="Cut. Chewed. Broken for marrow." start={5060} end={5360} />
      <NarratorLine text="65 in 100 bones cut." start={5400} end={5740} />
    </>
  );
};

/** Skull cup SVG (used in S10). */
const SkullCup: React.FC<{ left: number; top: number; scale?: number }> = ({ left, top, scale = 1 }) => (
  <svg style={{ position: "absolute", left, top, transform: `scale(${scale})` }} width={110} height={110} viewBox="0 0 110 110">
    <path d="M15 60 A40 40 0 0 1 95 60 L95 70 Q95 82 82 82 L28 82 Q15 82 15 70 Z" fill="#EDE8DC" stroke="#8A8478" strokeWidth={3} />
    <circle cx={38} cy={58} r={6} fill="#14100C" />
    <circle cx={72} cy={58} r={6} fill="#14100C" />
  </svg>
);

/** S10 — The skull cups (5760–6479). Three skulls, carefully shaped into cups. */
const SceneSkullCups10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 5760;
  return (
    <>
      <CaveBackground frame={frame} />
      {/* three skull cups on rocks */}
      <div style={{ position: "absolute", left: 320, top: 800, width: 150, height: 100, background: "#2A231B", borderRadius: "40% 40% 10% 10%" }} />
      <SkullCup left={350} top={700} />
      <div style={{ position: "absolute", left: 880, top: 810, width: 150, height: 90, background: "#2A231B", borderRadius: "40% 40% 10% 10%" }} />
      <SkullCup left={910} top={712} scale={0.9} />
      <div style={{ position: "absolute", left: 420, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={0} scale={1.2} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: 1560, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={Math.sin(f * 0.05) * 4} mood="worried" running={false} bob={0} wristband={false} />
        <LanternAtHand show />
      </div>
      <NarratorLine text="Their skulls became cups." start={5780} end={6100} />
      <NarratorLine text="A funeral, not a feast." start={6120} end={6460} />
    </>
  );
};

/** S11 — The zigzag bone (6480–7019). Close-up: an arm bone engraved with a zigzag. */
const SceneZigzag10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 6480;
  const pushIn = interpolate(f, [0, 540], [1, 1.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zigzag = Array.from({ length: 9 })
    .map((_, i) => `${i === 0 ? "M" : "L"} ${i * 60} ${i % 2 === 0 ? 20 : 60}`)
    .join(" ");
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#14100C", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${pushIn})`, transformOrigin: "960px 540px" }}>
          <div
            style={{
              position: "absolute",
              left: 660,
              top: 240,
              width: 600,
              height: 600,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,214,140,0.18) 0%, rgba(255,214,140,0) 65%)",
            }}
          />
          {/* big arm bone, horizontal */}
          <svg style={{ position: "absolute", left: 460, top: 420 }} width={1000} height={240} viewBox="0 0 1000 240">
            <rect x={180} y={90} width={640} height={60} rx={30} fill="#EDE8DC" />
            <circle cx={180} cy={90} r={55} fill="#EDE8DC" />
            <circle cx={180} cy={150} r={55} fill="#EDE8DC" />
            <circle cx={820} cy={90} r={55} fill="#EDE8DC" />
            <circle cx={820} cy={150} r={55} fill="#EDE8DC" />
            {/* the zigzag engraving */}
            <path d={zigzag} transform="translate(230 80)" stroke="#8A2A2E" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <NarratorLine text="One bone, carved with a zigzag." start={6500} end={6760} />
      <NarratorLine text="Ritual. Not butchery." start={6780} end={7000} />
    </>
  );
};

/** S12 — Neanderthals (7020–7739). Ice age, cut-marked bones. */
const SceneNeanderthal10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 7020;
  const phase = f * 0.16;
  const charX = interpolate(f, [0, 720], [420, 760], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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
        <LanternAtHand show />
      </div>
      <NarratorLine text="Neanderthals did it too." start={7040} end={7360} />
      <NarratorLine text="Same tools as deer." start={7380} end={7720} />
    </>
  );
};

/** S13 — 850,000 years (7740–8279). A deep cave, older stone. */
const Scene850k10: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <CaveBackground frame={frame} />
      {/* darker, older: a black veil over the cave */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)" }} />
      <div style={{ position: "absolute", left: 420, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={0} scale={1.4} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: 1560, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={0} mood="worried" running={false} bob={0} wristband={false} />
        <LanternAtHand show />
      </div>
      <BigNumber value="850,000" label="YEARS AGO" start={7800} end={8120} left={640} />
      <NarratorLine text="850,000 years ago." start={7760} end={8020} />
      <NarratorLine text="It is older than us." start={8040} end={8260} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* ACT 3 — HISTORY                                                     */
/* ------------------------------------------------------------------ */

/** S14 — Donner Party (8280–9179). Snow, stuck wagon, 87 → 48. */
const SceneDonner10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 8280;
  const phase = f * 0.14;
  const charX = interpolate(f, [0, 900], [380, 700], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <SnowBackground frame={frame} heavy />
      <div style={{ position: "absolute", left: 1080, top: 660, transform: "rotate(-6deg)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 420, height: 130, background: "#4A3524", borderRadius: 12, border: "3px solid #2E2115" }} />
        <div style={{ position: "absolute", left: 20, top: -90, width: 380, height: 110, background: "#C7D2DA", borderRadius: "190px 190px 0 0", opacity: 0.9 }} />
        <div style={{ position: "absolute", left: 60, top: 120, width: 90, height: 90, borderRadius: "50%", background: "#2E2115", border: "10px solid #6B5138" }} />
        <div style={{ position: "absolute", left: 280, top: 120, width: 90, height: 90, borderRadius: "50%", background: "#2E2115", border: "10px solid #6B5138" }} />
        <div style={{ position: "absolute", left: 330, top: 170, width: 90, height: 10, background: "#6B5138", transform: "rotate(35deg)" }} />
      </div>
      <div style={{ position: "absolute", left: charX - 240, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={phase * 0.5} scale={1.4} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: charX, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={phase} mood="worried" running={false} squashY={0.9} bob={Math.abs(Math.sin(phase)) * 3} wristband={false} />
        <LanternAtHand show />
      </div>
      <BigNumber value="87" label="PIONEERS" start={8340} end={8560} left={1420} />
      <BigNumber value="48" label="WALKED OUT" start={8980} end={9160} left={1420} />
      <NarratorLine text="1846. 87 pioneers." start={8300} end={8620} />
      <NarratorLine text="Dogs. Then rawhide. Then the dead." start={8640} end={8960} />
      <NarratorLine text="48 walked out." start={8980} end={9160} />
    </>
  );
};

/** S15 — The diary (9180–9719). Close-up on a diary page by lantern light. */
const SceneDiary10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 9180;
  const pushIn = interpolate(f, [0, 540], [1, 1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flicker = 1 + Math.sin(f * 0.3) * 0.06;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0E0B08", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${pushIn})`, transformOrigin: "960px 540px" }}>
          {/* lantern glow */}
          <div
            style={{
              position: "absolute",
              left: 1420,
              top: 700,
              width: 500 * flicker,
              height: 500 * flicker,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,200,94,0.35) 0%, rgba(255,200,94,0) 70%)",
              transform: "translate(-50%, -50%)",
            }}
          />
          {/* diary page */}
          <div
            style={{
              position: "absolute",
              left: 660,
              top: 220,
              width: 600,
              height: 640,
              background: "#EDE6D2",
              borderRadius: 6,
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              transform: "rotate(-2deg)",
            }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 60,
                  top: 90 + i * 62,
                  width: i === 3 ? 260 : 480,
                  height: 8,
                  borderRadius: 4,
                  background: "#8A8478",
                  opacity: 0.7,
                }}
              />
            ))}
            {/* one line scratched out, hard */}
            <div style={{ position: "absolute", left: 60, top: 276, width: 260, height: 14, background: "#3A332B", transform: "rotate(-1deg)" }} />
          </div>
          <div style={{ position: "absolute", left: 1440, top: 780 }}>
            <LanternItem />
          </div>
        </div>
      </div>
      <NarratorLine text="The diary barely dares say it." start={9200} end={9700} />
    </>
  );
};

/** S16 — Andes (9720–10619). Plane in the snow, radio, 72 → 16. */
const SceneAndes10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 9720;
  const blink = Math.sin(f * 0.4) > 0 ? 1 : 0.15;
  return (
    <>
      <SnowBackground frame={frame} heavy />
      <div style={{ position: "absolute", left: 980, top: 560, transform: "rotate(8deg)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 560, height: 90, background: "#B9C4CC", borderRadius: 45 }} />
        <div style={{ position: "absolute", left: 430, top: -90, width: 60, height: 110, background: "#8A97A3", transform: "rotate(12deg)" }} />
        <div style={{ position: "absolute", left: 180, top: 70, width: 200, height: 26, background: "#8A97A3", transform: "rotate(-14deg)" }} />
        <div style={{ position: "absolute", left: 60, top: 30, width: 60, height: 30, borderRadius: "50%", background: "#2E3B44" }} />
        <div style={{ position: "absolute", left: 150, top: 30, width: 60, height: 30, borderRadius: "50%", background: "#2E3B44" }} />
      </div>
      <div style={{ position: "absolute", left: 1420, top: 780, width: 420, height: 140, borderRadius: "50%", background: "#D5DEE5" }} />
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
        <LanternAtHand show />
      </div>
      <BigNumber value="72" label="DAYS" start={9900} end={10160} left={1420} />
      <BigNumber value="16" label="SURVIVED" start={10200} end={10500} left={1420} />
      <NarratorLine text="1972. A plane falls." start={9740} end={10000} />
      <NarratorLine text="Day 10. The search is called off." start={10020} end={10300} />
      <NarratorLine text="72 days. 16 survived." start={10320} end={10600} />
    </>
  );
};

/** S17 — Communion (10620–11159). Hands together in the snow. */
const SceneCommunion10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 10620;
  const sway = Math.sin(f * 0.05) * 6;
  return (
    <>
      <SnowBackground frame={frame} />
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 260,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,214,140,0.14) 0%, rgba(255,214,140,0) 65%)",
        }}
      />
      {/* two hands, palms together, centre frame */}
      <div style={{ position: "absolute", left: 830 + sway, top: 400 }}>
        <svg width={260} height={280} viewBox="0 0 260 280">
          {/* left hand */}
          <g transform="rotate(-8 130 260)">
            <rect x={50} y={100} width={82} height={160} rx={34} fill="#8FB8A8" stroke="#3D4A45" strokeWidth={3} />
            <rect x={54} y={52} width={16} height={60} rx={8} fill="#8FB8A8" stroke="#3D4A45" strokeWidth={3} />
            <rect x={74} y={38} width={16} height={74} rx={8} fill="#8FB8A8" stroke="#3D4A45" strokeWidth={3} />
            <rect x={94} y={46} width={16} height={66} rx={8} fill="#8FB8A8" stroke="#3D4A45" strokeWidth={3} />
            <rect x={114} y={64} width={14} height={48} rx={7} fill="#8FB8A8" stroke="#3D4A45" strokeWidth={3} />
          </g>
          {/* right hand */}
          <g transform="rotate(8 130 260)">
            <rect x={128} y={100} width={82} height={160} rx={34} fill="#8FB8A8" stroke="#3D4A45" strokeWidth={3} />
            <rect x={132} y={64} width={14} height={48} rx={7} fill="#8FB8A8" stroke="#3D4A45" strokeWidth={3} />
            <rect x={150} y={46} width={16} height={66} rx={8} fill="#8FB8A8" stroke="#3D4A45" strokeWidth={3} />
            <rect x={170} y={38} width={16} height={74} rx={8} fill="#8FB8A8" stroke="#3D4A45" strokeWidth={3} />
            <rect x={190} y={52} width={16} height={60} rx={8} fill="#8FB8A8" stroke="#3D4A45" strokeWidth={3} />
          </g>
          {/* seam where the palms meet */}
          <line x1={130} y1={100} x2={130} y2={230} stroke="#3D4A45" strokeWidth={3} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 420, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={0} scale={1.2} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: 1500, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={0} mood="worried" running={false} bob={0} wristband={false} />
        <LanternAtHand show />
      </div>
      <NarratorLine text="They called it communion." start={10640} end={10900} />
      <NarratorLine text="Friends, not food." start={10920} end={11140} />
    </>
  );
};

/** S18 — Jamestown (11160–12059). Fort, empty plate, rat, shoe. */
const SceneJamestown10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 11160;
  const ratX = 1500 + Math.sin(f * 0.12) * 24;
  return (
    <>
      <FortBackground />
      <div style={{ position: "absolute", left: 980, top: 856, width: 150, height: 34, borderRadius: "50%", background: "#C7C2B4", border: "4px solid #8A8478" }} />
      <div style={{ position: "absolute", left: ratX, top: 850 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 70, height: 34, borderRadius: "50%", background: "#6B6560" }} />
        <div style={{ position: "absolute", left: 62, top: 14, width: 60, height: 6, background: "#6B6560", borderRadius: 3, transform: "rotate(8deg)" }} />
        <div style={{ position: "absolute", left: 8, top: -14, width: 10, height: 18, background: "#6B6560", borderRadius: "50% 50% 0 0", transform: "rotate(-14deg)" }} />
      </div>
      <div style={{ position: "absolute", left: 1250, top: 862, width: 110, height: 40, background: "#5A4028", borderRadius: "20px 40px 8px 8px", transform: "rotate(-8deg)" }} />
      <div style={{ position: "absolute", left: 500, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={0} scale={1.4} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: 740, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={0} mood="worried" running={false} squashY={0.85} bob={0} wristband={false} />
        <LanternAtHand show />
      </div>
      <NarratorLine text="1609. The Starving Time." start={11180} end={11480} />
      <NarratorLine text="Rats. Leather. Then neighbours." start={11500} end={11800} />
      <NarratorLine text="A girl's bones proved it." start={11820} end={12040} />
    </>
  );
};

/** S19 — Leningrad (12060–12779). A frozen city, snow falling. */
const SceneLeningrad10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 12060;
  const flakes = Array.from({ length: 60 }).map((_, i) => {
    const x = (i * 173 + 41) % 1920;
    const speed = 1.2 + (i % 5) * 0.5;
    const y = (f * speed + i * 97) % 900;
    const sway = Math.sin(f * 0.05 + i) * 14;
    return { x: x + sway, y, r: 2 + (i % 3) };
  });
  return (
    <>
      <BaseBackground scrollX={0} frame={frame} />
      {/* cold blue veil over the city */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(40,60,80,0.25)" }} />
      {flakes.map((fl, i) => (
        <div key={i} style={{ position: "absolute", left: fl.x, top: fl.y, width: fl.r * 2, height: fl.r * 2, borderRadius: "50%", background: "#E8EEF2", opacity: 0.85 }} />
      ))}
      <div style={{ position: "absolute", left: 420, bottom: FLOOR_BOTTOM }}>
        <BaseShadow phase={0} scale={1.5} grow={1} bob={0} />
      </div>
      <div style={{ position: "absolute", left: 700, bottom: FLOOR_BOTTOM }}>
        <BaseCharacter phase={0} mood="worried" running={false} squashY={0.88} bob={0} wristband={false} />
        <LanternAtHand show />
      </div>
      <NarratorLine text="1941. A city starves." start={12080} end={12360} />
      <NarratorLine text="Four winters of hunger." start={12380} end={12760} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* ACT 4 — SCIENCE                                                     */
/* ------------------------------------------------------------------ */

/** S20 — The calorie lie (12780–13559). 125,000 → 32,000. */
const SceneCalorieLie10: React.FC = () => {
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
        <div style={{ position: "absolute", left: 420, bottom: FLOOR_BOTTOM }}>
          <BaseShadow phase={0} scale={1.2} grow={1} bob={0} />
        </div>
        <div style={{ position: "absolute", left: 660, bottom: FLOOR_BOTTOM }}>
          <BaseCharacter phase={0} mood="worried" running={false} bob={0} wristband={false} />
          <LanternAtHand show />
        </div>
      </div>
      <BigNumber value="125,000" label="ONE HUMAN BODY" start={12840} end={13100} left={700} />
      <BigNumber value="32,000" label="EDIBLE MUSCLE" start={13120} end={13480} left={700} />
      <NarratorLine text="A body holds 125,000 calories." start={12800} end={13100} />
      <NarratorLine text="Only 32,000 you can eat." start={13120} end={13540} />
    </>
  );
};

/** S21 — The mammoth (13560–14279). A mammoth towers over him. */
const SceneMammoth10: React.FC = () => {
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
        {frame >= 13800 ? (
          <svg style={{ position: "absolute", left: 1150, top: 560, opacity: fade(frame, 13800, 13920) }} width={560} height={340} viewBox="0 0 560 340">
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
          <LanternAtHand show />
        </div>
      </div>
      <BigNumber value="3,600,000" label="ONE MAMMOTH" start={13680} end={14080} left={620} />
      <NarratorLine text="A mammoth fed 25 for 60 days." start={13600} end={13980} />
      <NarratorLine text="One person feeds them one day." start={14000} end={14260} />
    </>
  );
};

/** S22 — The paradox (14280–14819). The numbers fade away. */
const SceneParadox10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 14280;
  const numbersFade = interpolate(f, [0, 240], [0.85, 0.08], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0A0C0B", overflow: "hidden" }}>
        {/* fading numbers, big and ghostly */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 300,
            textAlign: "center",
            fontFamily,
            fontWeight: 700,
            fontSize: 130,
            color: "#FFFFFF",
            opacity: numbersFade,
          }}
        >
          125,000
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 480,
            textAlign: "center",
            fontFamily,
            fontWeight: 700,
            fontSize: 130,
            color: "#FFFFFF",
            opacity: numbersFade * 0.8,
          }}
        >
          32,000
        </div>
        <div style={{ position: "absolute", left: 420, bottom: FLOOR_BOTTOM }}>
          <BaseShadow phase={0} scale={1.3} grow={1} bob={0} />
        </div>
        <div style={{ position: "absolute", left: 1560, bottom: FLOOR_BOTTOM }}>
          <BaseCharacter phase={0} mood="worried" running={false} bob={0} wristband={false} />
          <LanternAtHand show />
        </div>
      </div>
      <NarratorLine text="Eating people was never about food." start={14300} end={14800} />
    </>
  );
};

/** S23 — Kuru (14820–15659). Papua New Guinea. A brain glowing red. */
const SceneKuru10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 14820;
  const pulse = 1 + Math.sin(f * 0.25) * 0.03;
  const tremor = Math.sin(f * 1.3) * 3;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0D0505", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 1150,
            top: 300,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(229,72,77,0.30) 0%, rgba(229,72,77,0) 65%)",
            transform: "translate(-50%, -50%)",
          }}
        />
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
        <div style={{ position: "absolute", left: 380, bottom: FLOOR_BOTTOM }}>
          <BaseShadow phase={0} scale={1.9} grow={1} bob={0} />
        </div>
        <div style={{ position: "absolute", left: 700 + tremor, bottom: FLOOR_BOTTOM }}>
          <BaseCharacter phase={0} mood="worried" running={false} bob={0} wristband={false} />
          <LanternAtHand show />
        </div>
      </div>
      <NarratorLine text="They ate the dead to free them." start={14840} end={15160} />
      <NarratorLine text="The brain held the poison." start={15180} end={15640} />
    </>
  );
};

/** S24 — The shaking (15660–16379). Hands shaking; the shadow looms. */
const SceneShaking10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 15660;
  const tremor = Math.sin(f * 1.6) * 5;
  const tremorFast = Math.sin(f * 3.1) * 2;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0D0505", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 960,
            top: 400,
            width: 900,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(229,72,77,0.18) 0%, rgba(229,72,77,0) 65%)",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div style={{ position: "absolute", left: 340, bottom: FLOOR_BOTTOM }}>
          <BaseShadow phase={0} scale={1.9} grow={1} bob={0} />
        </div>
        {/* trembling character, shaking hands out in front */}
        <div style={{ position: "absolute", left: 820 + tremor, bottom: FLOOR_BOTTOM }}>
          <BaseCharacter phase={0} mood="worried" running={false} bob={0} wristband={false} />
          <LanternAtHand show />
          <div style={{ position: "absolute", left: 46 + tremorFast, top: 228, width: 24, height: 24, borderRadius: "50%", background: "#8FB8A8" }} />
          <div style={{ position: "absolute", left: 128 - tremorFast, top: 228, width: 24, height: 24, borderRadius: "50%", background: "#8FB8A8" }} />
        </div>
      </div>
      <NarratorLine text="Women and children shook." start={15680} end={16000} />
      <NarratorLine text="Always fatal." start={16020} end={16360} />
    </>
  );
};

/** S25 — The long wait (16380–17099). A slow clock; years tick past. */
const SceneLongWait10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 16380;
  const minuteAngle = interpolate(f, [0, 720], [0, 360], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hourAngle = interpolate(f, [0, 720], [0, 30], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const year = f < 240 ? "1957" : f < 480 ? "1980" : "2005";
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0A0C0B", overflow: "hidden" }}>
        {/* big clock face */}
        <div
          style={{
            position: "absolute",
            left: 1120,
            top: 220,
            width: 480,
            height: 480,
            borderRadius: "50%",
            border: "10px solid #3A443F",
            background: "radial-gradient(circle, #141A18 0%, #0A0C0B 75%)",
          }}
        >
          {[0, 90, 180, 270].map((deg, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 230,
                top: 10,
                width: 20,
                height: 34,
                background: "#8A97B0",
                borderRadius: 4,
                transform: `rotate(${deg}deg)`,
                transformOrigin: "10px 230px",
              }}
            />
          ))}
          {/* hour hand */}
          <div
            style={{
              position: "absolute",
              left: 234,
              top: 240,
              width: 12,
              height: 130,
              background: "#C9C9C4",
              borderRadius: 6,
              transform: `rotate(${hourAngle}deg)`,
              transformOrigin: "6px 0px",
            }}
          />
          {/* minute hand */}
          <div
            style={{
              position: "absolute",
              left: 237,
              top: 240,
              width: 8,
              height: 190,
              background: "#FFFFFF",
              borderRadius: 4,
              transform: `rotate(${minuteAngle}deg)`,
              transformOrigin: "4px 0px",
            }}
          />
          <div style={{ position: "absolute", left: 224, top: 224, width: 32, height: 32, borderRadius: "50%", background: ACCENT }} />
        </div>
        {/* ticking year under the clock */}
        <div
          style={{
            position: "absolute",
            left: 1120,
            top: 740,
            width: 480,
            textAlign: "center",
            fontFamily,
            fontSize: 64,
            letterSpacing: 8,
            color: "#C9C9C4",
          }}
        >
          {year}
        </div>
        <div style={{ position: "absolute", left: 380, bottom: FLOOR_BOTTOM }}>
          <BaseShadow phase={0} scale={1.4} grow={1} bob={0} />
        </div>
        <div style={{ position: "absolute", left: 660, bottom: FLOOR_BOTTOM }}>
          <BaseCharacter phase={0} mood="worried" running={false} bob={0} wristband={false} />
          <LanternAtHand show />
        </div>
      </div>
      <NarratorLine text="It waits 50 years." start={16400} end={16700} />
      <NarratorLine text="The meal that never ends." start={16720} end={17080} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* ACT 5 — THE ANSWER                                                  */
/* ------------------------------------------------------------------ */

/** S26 — The answer (17100–18179). Lamp light, the shadow shrinks back. Full 36s. */
const SceneAnswer10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 17100;
  const shadowScale = interpolate(f, [0, 1080], [1.9, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shadowFade = interpolate(f, [0, 1080], [1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pushIn = interpolate(f, [0, 1080], [1, 1.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${pushIn})`, transformOrigin: "960px 700px" }}>
        <BaseBackground scrollX={0} frame={frame} />
        <div style={{ position: "absolute", left: 840, bottom: FLOOR_BOTTOM, opacity: shadowFade }}>
          <BaseShadow phase={0} scale={shadowScale} grow={1} bob={0} />
        </div>
        <div style={{ position: "absolute", left: 1080, bottom: FLOOR_BOTTOM }}>
          <BaseCharacter phase={0} mood="determined" running={false} bob={0} wristband={false} />
          <LanternAtHand show />
        </div>
      </div>
      <NarratorLine text="Not food." start={17120} end={17500} />
      <NarratorLine text="Ritual. Survival." start={17520} end={17900} />
      <NarratorLine text="The brain still says no." start={17920} end={18160} />
    </>
  );
};

/** S27 — The shadow's last word (18180–18539). The shadow speaks in red. */
const SceneShadowSpeaks10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 18180;
  const pulse = 0.75 + Math.sin(f * 0.2) * 0.25;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "#0A0C0B", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            left: 700,
            top: 300,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(229,72,77,${0.22 * pulse}) 0%, rgba(229,72,77,0) 65%)`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div style={{ position: "absolute", left: 620, bottom: FLOOR_BOTTOM }}>
          <BaseShadow phase={0} scale={1.5} grow={1} bob={0} />
        </div>
        <div style={{ position: "absolute", left: 1300, bottom: FLOOR_BOTTOM }}>
          <BaseCharacter phase={0} mood="determined" running={false} bob={0} wristband={false} />
          <LanternAtHand show />
        </div>
      </div>
      <ShadowLine text="I only grow when you starve." start={18200} end={18520} left={980} top={260} />
    </>
  );
};

/** S28 — Title card (18540–18899, 12s). HUNGER types on, wavy underline, lines, fade. */
const SceneTitle10: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - 18540;
  const word = "HUNGER";
  const lettersShown = Math.min(6, Math.floor((f - 20) / 15) + 1);
  const underlineIn = interpolate(f, [120, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const whiteLineIn = interpolate(f, [220, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const redLineIn = interpolate(f, [280, 310], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(f, [320, 359], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wave = Array.from({ length: 60 })
    .map((_, i) => `${i === 0 ? "M" : "L"} ${i * 12} ${14 + Math.sin(i * 0.55) * 7}`)
    .join(" ");
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: BLACK }}>
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
        <svg style={{ position: "absolute", left: 610, top: 640, opacity: underlineIn }} width={700} height={30} viewBox="0 0 720 30">
          <path d={wave} stroke={ACCENT} strokeWidth={7} fill="none" strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: 710, top: 760, width: 500, height: 4, background: "#FFFFFF", opacity: whiteLineIn }} />
        <div style={{ position: "absolute", left: 810, top: 800, width: 300, height: 4, background: ACCENT, opacity: redLineIn }} />
      </div>
      {fadeOut > 0 ? <div style={{ position: "absolute", inset: 0, background: BLACK, opacity: fadeOut }} /> : null}
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Main film                                                           */
/* ------------------------------------------------------------------ */

export const Cannibalism10minFilm: React.FC = () => {
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
    frame < 300 ? <SceneQuestion10 /> :
    frame < 780 ? <SceneBrain10 /> :
    frame < 1440 ? <SceneDisgust10 /> :
    frame < 2160 ? <SceneLockHolds10 /> :
    frame < 3000 ? <SceneHungerKey10 /> :
    frame < 3720 ? <SceneLockBreaks10 /> :
    frame < 4320 ? <SceneAfterLine10 /> :
    frame < 5040 ? <SceneGough10 /> :
    frame < 5760 ? <SceneCutChewed10 /> :
    frame < 6480 ? <SceneSkullCups10 /> :
    frame < 7020 ? <SceneZigzag10 /> :
    frame < 7740 ? <SceneNeanderthal10 /> :
    frame < 8280 ? <Scene850k10 /> :
    frame < 9180 ? <SceneDonner10 /> :
    frame < 9720 ? <SceneDiary10 /> :
    frame < 10620 ? <SceneAndes10 /> :
    frame < 11160 ? <SceneCommunion10 /> :
    frame < 12060 ? <SceneJamestown10 /> :
    frame < 12780 ? <SceneLeningrad10 /> :
    frame < 13560 ? <SceneCalorieLie10 /> :
    frame < 14280 ? <SceneMammoth10 /> :
    frame < 14820 ? <SceneParadox10 /> :
    frame < 15660 ? <SceneKuru10 /> :
    frame < 16380 ? <SceneShaking10 /> :
    frame < 17100 ? <SceneLongWait10 /> :
    frame < 18180 ? <SceneAnswer10 /> :
    frame < 18540 ? <SceneShadowSpeaks10 /> :
    <SceneTitle10 />;

  return (
    <AbsoluteFill style={{ background: BLACK }}>
      <style>{FONT_FACE_CSS}</style>
      {/* SFX — all synthesized in code, no downloads */}
      <Audio src={staticFile("sfx/drone.wav")} startFrom={0} volume={0.3} />
      <Audio src={staticFile("sfx/drone.wav")} startFrom={4320} volume={0.3} />
      <Audio src={staticFile("sfx/drone.wav")} startFrom={14820} volume={0.35} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={300} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={780} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={1440} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={2160} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={3000} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={3720} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={4320} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={5040} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={5760} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={6480} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={7020} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={7740} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={8280} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={9180} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={9720} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={10620} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={11160} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={12060} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={12780} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={13560} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={14280} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={14820} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={15660} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={16380} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={17100} volume={0.5} />
      <Audio src={staticFile("sfx/whoosh.wav")} startFrom={18180} volume={0.5} />
      <Audio src={staticFile("sfx/heartbeat.wav")} startFrom={2160} volume={0.6} />
      <Audio src={staticFile("sfx/heartbeat.wav")} startFrom={2400} volume={0.5} />
      <Audio src={staticFile("sfx/heartbeat.wav")} startFrom={2880} volume={0.5} />
      <Audio src={staticFile("sfx/heartbeat.wav")} startFrom={3000} volume={0.5} />
      <Audio src={staticFile("sfx/wind.wav")} startFrom={7020} volume={0.7} />
      <Audio src={staticFile("sfx/wind.wav")} startFrom={8280} volume={0.7} />
      <Audio src={staticFile("sfx/wind.wav")} startFrom={9720} volume={0.7} />
      <Audio src={staticFile("sfx/wind.wav")} startFrom={10620} volume={0.7} />
      <Audio src={staticFile("sfx/wind.wav")} startFrom={12060} volume={0.7} />
      <Audio src={staticFile("sfx/crack.wav")} startFrom={7200} volume={0.9} />
      <Audio src={staticFile("sfx/thud.wav")} startFrom={2160} volume={0.7} />
      <Audio src={staticFile("sfx/thud.wav")} startFrom={8280} volume={0.7} />
      <Audio src={staticFile("sfx/thud.wav")} startFrom={11160} volume={0.7} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={5160} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={7800} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={8340} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={8980} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={9900} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={10200} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={12840} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={13120} volume={0.8} />
      <Audio src={staticFile("sfx/tick.wav")} startFrom={13680} volume={0.8} />
      <Audio src={staticFile("sfx/impact.wav")} startFrom={14820} volume={0.9} />
      <Audio src={staticFile("sfx/impact.wav")} startFrom={17100} volume={0.8} />
      <Audio src={staticFile("sfx/pop.wav")} startFrom={18660} volume={0.7} />
      <Audio src={staticFile("sfx/pop.wav")} startFrom={18760} volume={0.7} />

      {scene}
      <Bars />
    </AbsoluteFill>
  );
};
