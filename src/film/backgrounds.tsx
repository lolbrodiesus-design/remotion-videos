import React from "react";
import { ACCENT, TEAL } from "./characters";

export type BgProps = {
  /** horizontal scroll offset in px (city scrolls when running) */
  scrollX: number;
  frame: number;
};

/** Deterministic building set (widths/heights) so nothing flickers frame to frame. */
const BUILDINGS = [
  { w: 150, h: 260, lit: 3 },
  { w: 110, h: 340, lit: 5 },
  { w: 190, h: 210, lit: 2 },
  { w: 130, h: 380, lit: 6 },
  { w: 170, h: 290, lit: 4 },
  { w: 120, h: 320, lit: 3 },
  { w: 200, h: 240, lit: 5 },
  { w: 140, h: 360, lit: 2 },
  { w: 160, h: 280, lit: 4 },
  { w: 120, h: 300, lit: 3 },
];

function buildingStrip(
  yBase: number,
  color: string,
  windowColor: string,
  keyPrefix: string,
  litOpacity: number,
) {
  let x = -100;
  const els: React.ReactNode[] = [];
  // two repeats for seamless scrolling across 1920 + margin
  for (let rep = 0; rep < 2; rep++) {
    BUILDINGS.forEach((b, i) => {
      const bx = x;
      els.push(
        <rect key={`${keyPrefix}-${rep}-${i}`} x={bx} y={yBase - b.h} width={b.w} height={b.h} fill={color} />,
      );
      for (let wIdx = 0; wIdx < b.lit; wIdx++) {
        const wx = bx + 18 + ((wIdx * 37) % (b.w - 40));
        const wy = yBase - b.h + 24 + ((wIdx * 53) % Math.max(60, b.h - 90));
        els.push(
          <rect
            key={`${keyPrefix}-w-${rep}-${i}-${wIdx}`}
            x={wx}
            y={wy}
            width={14}
            height={18}
            fill={windowColor}
            opacity={litOpacity}
          />,
        );
      }
      x += b.w + 26;
    });
  }
  return els;
}

const FLOOR_Y = 900;

/** Base: very dark night street, moon, lamp glow, scrolling skyline, thin grey floor line. */
export const BaseBackground: React.FC<BgProps> = ({ scrollX }) => {
  const far = (scrollX * 0.35) % 2100;
  const near = scrollX % 2100;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0A0C0B", overflow: "hidden" }}>
      {/* moon + glow */}
      <div
        style={{
          position: "absolute",
          left: 1560,
          top: 110,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: "#E8E6D8",
          boxShadow: "0 0 120px 60px rgba(232,230,216,0.22)",
        }}
      />
      {/* far skyline */}
      <svg style={{ position: "absolute", left: -far, top: 0 }} width={4200} height={1080}>
        {buildingStrip(FLOOR_Y, "#101312", "#3A443F", "far", 0.25)}
      </svg>
      {/* near skyline */}
      <svg style={{ position: "absolute", left: -near, top: 0 }} width={4200} height={1080}>
        {buildingStrip(FLOOR_Y, "#161A19", "#8A97B0", "near", 0.55)}
      </svg>
      {/* street lamp at centre-right */}
      <div style={{ position: "absolute", left: 1330, top: 300 }}>
        <div style={{ position: "absolute", left: -4, top: 0, width: 8, height: 600, background: "#232826" }} />
        <div
          style={{
            position: "absolute",
            left: -60,
            top: -8,
            width: 128,
            height: 14,
            borderRadius: 7,
            background: "#2C3230",
          }}
        />
        {/* lamp glow: big soft radial glow */}
        <div
          style={{
            position: "absolute",
            left: -190,
            top: -30,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,214,140,0.55) 0%, rgba(255,214,140,0.12) 45%, rgba(255,214,140,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -34,
            top: 0,
            width: 68,
            height: 26,
            borderRadius: 13,
            background: "#FFE9B0",
            boxShadow: "0 0 60px 24px rgba(255,214,140,0.75)",
          }}
        />
        {/* light cone down to the floor */}
        <div
          style={{
            position: "absolute",
            left: -150,
            top: 20,
            width: 320,
            height: 580,
            background:
              "linear-gradient(to bottom, rgba(255,214,140,0.20), rgba(255,214,140,0.02))",
            clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0% 100%)",
          }}
        />
      </div>
      {/* floor + thin grey line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 180, background: "#0D100F" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 2, background: "#4A5550" }} />
    </div>
  );
};

/** Pixel art: chunky grid-snapped buildings, hard-edged lamp. */
export const PixelBackground: React.FC<BgProps> = ({ scrollX }) => {
  const near = Math.round(scrollX / 8) * 8 % 2100;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0B0E0D", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 1560, top: 112, width: 96, height: 96, background: "#E8E6D8" }} />
      <svg style={{ position: "absolute", left: -near, top: 0 }} width={4200} height={1080} shapeRendering="crispEdges">
        {buildingStrip(FLOOR_Y, "#151918", "#7A8698", "px", 0.8)}
      </svg>
      {/* pixel lamp: blocky pole + square glow */}
      <div style={{ position: "absolute", left: 1330, top: 300 }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 16, height: 600, background: "#232826" }} />
        <div style={{ position: "absolute", left: -64, top: -16, width: 144, height: 16, background: "#2C3230" }} />
        <div style={{ position: "absolute", left: -176, top: -16, width: 368, height: 368, background: "rgba(255,214,140,0.10)" }} />
        <div style={{ position: "absolute", left: -32, top: 0, width: 80, height: 32, background: "#FFE9B0" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 180, background: "#0D100F" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 4, background: "#4A5550" }} />
    </div>
  );
};

/** Paper cut-out: warm dark paper, cut shapes with soft drop shadows. */
export const PaperBackground: React.FC<BgProps> = ({ scrollX }) => {
  const near = scrollX % 2100;
  // two repeats of the strip so the skyline still fills the frame after scrolling
  const paperBuildings = BUILDINGS.map((b, i) => {
    let x = -100;
    for (let j = 0; j < i; j++) x += BUILDINGS[j].w + 26;
    return (
      <g key={`paper-${i}`} transform={`rotate(${i % 2 === 0 ? 0.6 : -0.5} ${x + b.w / 2} ${FLOOR_Y})`}>
        <rect
          x={x}
          y={FLOOR_Y - b.h}
          width={b.w}
          height={b.h}
          fill={i % 3 === 0 ? "#2A241E" : "#241F1A"}
          style={{ filter: "drop-shadow(5px 6px 0 rgba(0,0,0,0.4))" }}
        />
      </g>
    );
  });
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "#1B1713",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 1560,
          top: 110,
          width: 110,
          height: 110,
          borderRadius: "48% 52% 50% 50%",
          background: "#EFE7CE",
          boxShadow: "4px 6px 0 rgba(0,0,0,0.45)",
        }}
      />
      <svg style={{ position: "absolute", left: -near, top: 0 }} width={4200} height={1080}>
        {paperBuildings}
        <g transform="translate(1750 0)">{paperBuildings}</g>
      </svg>
      {/* paper lamp */}
      <div style={{ position: "absolute", left: 1330, top: 300 }}>
        <div style={{ position: "absolute", left: -5, top: 0, width: 10, height: 600, background: "#3A332A", transform: "rotate(0.5deg)", boxShadow: "3px 4px 0 rgba(0,0,0,0.4)" }} />
        <div style={{ position: "absolute", left: -40, top: 0, width: 90, height: 30, borderRadius: "50% 50% 40% 40%", background: "#FFE9B0", boxShadow: "3px 4px 0 rgba(0,0,0,0.4), 0 0 90px 30px rgba(255,214,140,0.35)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 180, background: "#211B15" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 3, background: "#6B5D4C" }} />
    </div>
  );
};

/** Ink wash: grey wash blobs, soft blurred edges, one red accent only. */
export const InkBackground: React.FC<BgProps> = ({ scrollX }) => {
  const near = scrollX % 2100;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#101010", overflow: "hidden", filter: "contrast(1.15)" }}>
      <div style={{ position: "absolute", left: 1520, top: 90, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(230,230,220,0.9), rgba(230,230,220,0.05) 70%)", filter: "blur(6px)" }} />
      <svg style={{ position: "absolute", left: -near, top: 0, filter: "blur(1.5px)" }} width={4200} height={1080}>
        {buildingStrip(FLOOR_Y, "#1C1C1C", "#5A5A55", "ink", 0.4)}
      </svg>
      {/* wash lamp */}
      <div style={{ position: "absolute", left: 1330, top: 300 }}>
        <div style={{ position: "absolute", left: -3, top: 0, width: 6, height: 600, background: "#2A2A2A", filter: "blur(1px)" }} />
        <div style={{ position: "absolute", left: -34, top: -4, width: 68, height: 24, borderRadius: 12, background: "#E8E4D4", filter: "blur(2px)", boxShadow: "0 0 50px 20px rgba(240,235,210,0.5)" }} />
        <div style={{ position: "absolute", left: -150, top: -40, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,235,210,0.5), rgba(240,235,210,0) 65%)", filter: "blur(10px)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 180, background: "#141414" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 2, background: "#555" }} />
    </div>
  );
};

/** 1930s rubber hose: black & white, big moon, deco skyline. */
export const HoseBackground: React.FC<BgProps> = ({ scrollX }) => {
  const near = scrollX % 2100;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#0D0D0D", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 1540, top: 100, width: 130, height: 130, borderRadius: "50%", background: "#F5F0E6", boxShadow: "0 0 100px 40px rgba(245,240,230,0.25)" }} />
      <svg style={{ position: "absolute", left: -near, top: 0 }} width={4200} height={1080}>
        {buildingStrip(FLOOR_Y, "#1E1E1E", "#EDE8DC", "hose", 0.9)}
      </svg>
      <div style={{ position: "absolute", left: 1330, top: 300 }}>
        <div style={{ position: "absolute", left: -4, top: 0, width: 8, height: 600, background: "#EDE8DC" }} />
        <div style={{ position: "absolute", left: -70, top: -10, width: 148, height: 16, borderRadius: 8, background: "#EDE8DC" }} />
        <div style={{ position: "absolute", left: -170, top: -30, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,240,230,0.45), rgba(245,240,230,0) 70%)" }} />
        <div style={{ position: "absolute", left: -30, top: 0, width: 60, height: 24, borderRadius: 12, background: "#FFFBEF", boxShadow: "0 0 50px 20px rgba(255,251,239,0.7)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 180, background: "#111" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 2, background: "#EDE8DC" }} />
    </div>
  );
};

/** Neon line art: pure black, everything as glowing outlines. */
export const NeonBackground: React.FC<BgProps> = ({ scrollX }) => {
  const near = scrollX % 2100;
  // two repeats of the strip so the skyline still fills the frame after scrolling
  const neonBuildings = BUILDINGS.map((b, i) => {
    let x = -100;
    for (let j = 0; j < i; j++) x += BUILDINGS[j].w + 26;
    return (
      <rect
        key={`neon-${i}`}
        x={x}
        y={FLOOR_Y - b.h}
        width={b.w}
        height={b.h}
        fill="none"
        stroke="#2E6B5E"
        strokeWidth={3}
        style={{ filter: `drop-shadow(0 0 8px #2E6B5E)` }}
      />
    );
  });
  return (
    <div style={{ position: "absolute", inset: 0, background: "#000000", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 1560,
          top: 110,
          width: 110,
          height: 110,
          borderRadius: "50%",
          border: `3px solid ${TEAL}`,
          boxShadow: `0 0 30px ${TEAL}, inset 0 0 30px ${TEAL}`,
        }}
      />
      <svg
        style={{ position: "absolute", left: -near, top: 0 }}
        width={4200}
        height={1080}
      >
        {neonBuildings}
        <g transform="translate(1750 0)">{neonBuildings}</g>
      </svg>
      {/* neon lamp */}
      <div style={{ position: "absolute", left: 1330, top: 300 }}>
        <div style={{ position: "absolute", left: -2, top: 0, width: 4, height: 600, background: "#FFE9B0", boxShadow: "0 0 14px #FFE9B0" }} />
        <div style={{ position: "absolute", left: -34, top: 0, width: 68, height: 22, borderRadius: 11, border: "3px solid #FFE9B0", boxShadow: "0 0 26px #FFE9B0, inset 0 0 18px #FFE9B0" }} />
        <div style={{ position: "absolute", left: -170, top: -30, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,233,176,0.16), rgba(255,233,176,0) 70%)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: FLOOR_Y, height: 2, background: ACCENT, boxShadow: `0 0 12px ${ACCENT}` }} />
    </div>
  );
};
