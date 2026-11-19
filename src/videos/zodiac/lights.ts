// Light presets per time of day. The sun is CAMERA-RELATIVE and frozen per shot (world.ts update()):
// az = degrees from the shot camera's forward axis (0 = sun straight ahead = backlight, +90 = screen right,
// 180 = behind camera), el = elevation. lit/shade/lift are LINEAR RGB multipliers for shade.ts (may exceed 1).
// Field names follow lighting.md 9.1 exactly (the CHAR and POST agents read them); values are tuned on renders.
export type LightName = "day" | "golden" | "night" | "warm" | "dark";
type C3 = [number, number, number];
export type LightPreset = {
  az: number; el: number;
  lit: C3; shade: C3; lift: C3; lambert: number; sideK: number; term: number;      // world two-tone (shade.ts)
  charTint: C3; charShade: number; charGrad: number; bodyGrad: number; sideTint: C3; // character cards (cast.ts)
  blob: C3; actorShadow: boolean;                                                    // contact blobs / card shadows
  top: string; hor: string; skyCurve: C3; fog: string; fogNear: number; fogFar: number; sunDisc: string; // depth.md 6.5
  sunCol: string; sunI: number; sky: string; ground: string; hemiI: number;         // three lights (unpatched mats only)
  bias: number; normalBias: number;
};
export const LIGHTS: Record<LightName, LightPreset> = {
  day: {
    az: 75, el: 48,
    lit: [1.58, 1.5, 1.33], shade: [0.3, 0.29, 0.36], lift: [0.05, 0.06, 0.11], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.94, 0.92], charShade: 0.86, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.92, 0.90, 0.96],
    blob: [0.62, 0.58, 0.58], actorShadow: false,
    top: "#3e7fd2", hor: "#b8d0ec", skyCurve: [0.0, 0.5, 0.6], fog: "#b8d0ec", fogNear: 25, fogFar: 300, sunDisc: "#000000",
    sunCol: "#fff3e0", sunI: 2.8, sky: "#dcecff", ground: "#b49a78", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
  golden: {
    az: 6, el: 7,
    lit: [1.5, 0.68, 0.24], shade: [0.30, 0.20, 0.15], lift: [0.09, 0.06, 0.04], lambert: 0.35, sideK: 0.82, term: 0.07,
    charTint: [1.0, 0.78, 0.56], charShade: 0.88, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.85, 0.80, 0.95],
    blob: [0.75, 0.74, 0.9], actorShadow: true,
    top: "#6a4f8c", hor: "#ffd08a", skyCurve: [0.05, 0.6, 1.0], fog: "#efb489", fogNear: 50, fogFar: 380, sunDisc: "#ffcf9e",
    sunCol: "#ffab5e", sunI: 5.5, sky: "#d8b0b8", ground: "#8a6a60", hemiI: 0.65,
    bias: -0.0006, normalBias: 0.03,
  },
  // night-blue: cold moon key, deep blue-violet shade, dark sky, short fog so the background falls to black.
  // sat 0.55: night vegetation reads dark blue-green, not bright saturated green
  night: {
    az: 120, el: 32,
    lit: [0.32, 0.36, 0.62], shade: [0.10, 0.11, 0.22], lift: [0.02, 0.025, 0.05], lambert: 0.3, sideK: 0.84, term: 0.15,
    charTint: [0.85, 0.88, 1.0], charShade: 0.8, charGrad: 0.08, bodyGrad: 0.2, sideTint: [0.8, 0.84, 1.0],
    blob: [0.4, 0.42, 0.6], actorShadow: false,
    top: "#0b1530", hor: "#27395e", skyCurve: [0.0, 0.5, 0.6], fog: "#1c2a4a", fogNear: 18, fogFar: 220, sunDisc: "#cdd8ff",
    sunCol: "#8fa8ff", sunI: 0.7, sky: "#5a6f9e", ground: "#2a2f45", hemiI: 0.28,
    bias: -0.00025, normalBias: 0.015,
  },
  // warm desk-lamp interior: warm key, brown shade, fog close in (interiors are small)
  warm: {
    az: 55, el: 50,
    lit: [1.7, 1.25, 0.85], shade: [0.34, 0.27, 0.22], lift: [0.06, 0.05, 0.04], lambert: 0.35, sideK: 0.82, term: 0.15,
    charTint: [1.0, 0.9, 0.78], charShade: 0.86, charGrad: 0.08, bodyGrad: 0.2, sideTint: [0.95, 0.88, 0.8],
    blob: [0.6, 0.55, 0.5], actorShadow: false,
    top: "#2e2118", hor: "#5a4030", skyCurve: [0.0, 0.5, 0.6], fog: "#4a3828", fogNear: 6, fogFar: 60, sunDisc: "#000000",
    sunCol: "#ffd9a0", sunI: 2.4, sky: "#c8a888", ground: "#5a4636", hemiI: 0.5,
    bias: -0.00025, normalBias: 0.015,
  },
  // near-black: candles / final card only; everything falls off within a few metres
  dark: {
    az: 90, el: 40,
    lit: [0.32, 0.32, 0.42], shade: [0.07, 0.07, 0.11], lift: [0.01, 0.01, 0.02], lambert: 0.3, sideK: 0.84, term: 0.15,
    charTint: [0.9, 0.9, 0.95], charShade: 0.8, charGrad: 0.08, bodyGrad: 0.2, sideTint: [0.85, 0.85, 0.95],
    blob: [0.3, 0.3, 0.4], actorShadow: false,
    top: "#04050a", hor: "#07080f", skyCurve: [0.0, 0.5, 0.6], fog: "#05060a", fogNear: 3, fogFar: 40, sunDisc: "#000000",
    sunCol: "#6a76a0", sunI: 0.35, sky: "#2a3048", ground: "#101018", hemiI: 0.16,
    bias: -0.00025, normalBias: 0.015,
  },
};

/** world-only look per light (sky stops by elevation in degrees, river colours, cloud palette). All colours are
 *  ON-SCREEN targets under the current PBR-Neutral tone map; world.ts pre-inverts the tone map (shade.ts untone). */
export type WorldLook = {
  sky: { c: string[]; e: number[] };                         // 5 stops: c[i] at elevation e[i] (deg), smoothstep between
  water: { near: string; mid: string; far: string; crest: string; trough: string; glint: string; shade: C3 };
  bounce: C3;                                                 // shade.ts uBounce: albedo x bounce on shaded faces turned to the lens
  sat: number;                                                // shade.ts uSat: world albedo saturation (1 = as painted)
  cloud: { lit: string; mid: string; shade: string };
};
export const LOOK: Record<LightName, WorldLook> = {
  day: {
    // depth.md 2.2: horizon #9fb6e6 just above the skyline, upper sky #5e93d9 at ~20 deg (grade: frame top #5997e2)
    sky: { c: ["#b8d0ec", "#9cbfea", "#6a9fe0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0, 0, 0],
    sat: 1.08,
  },
  golden: {
    // sunset, not dusk: #ffd08a horizon, peach/orange through ~10 deg, warm rose at 20, muted warm mauve only near the top
    // (the golden grade adds ~+11/255 blue to shadows/mids, so these lean warm)
    sky: { c: ["#f0b578", "#f0a878", "#e0967c", "#c4848e", "#8a6f8a"], e: [0, 4, 10, 20, 40] },
    water: { near: "#1e3a6e", mid: "#355f96", far: "#d4a48e", crest: "#d9a088", trough: "#16294f", glint: "#ffe2b0", shade: [0.42, 0.46, 0.72] },
    cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
    bounce: [0.04, 0.02, 0.0],
    sat: 1.0,
  },
  night: {
    sky: { c: ["#1c2a4a", "#22345a", "#1a2a50", "#101c3a", "#0b1530"], e: [0, 3, 8, 16, 40] },
    water: { near: "#0e2038", mid: "#12283f", far: "#0a1826", crest: "#2a4a6a", trough: "#081222", glint: "#8fa8ff", shade: [0.4, 0.46, 0.66] },
    cloud: { lit: "#5a6f9e", mid: "#3a4a72", shade: "#232f52" },
    bounce: [0, 0, 0.02],
    sat: 0.55,
  },
  warm: {
    sky: { c: ["#4a3828", "#54402c", "#4a3828", "#3a2c20", "#2e2118"], e: [0, 4, 10, 20, 40] },
    water: { near: "#2a2018", mid: "#33261a", far: "#241a12", crest: "#6a4a30", trough: "#1a120c", glint: "#ffd9a0", shade: [0.5, 0.46, 0.4] },
    cloud: { lit: "#c8a888", mid: "#a8886a", shade: "#6a4a3a" },
    bounce: [0.05, 0.03, 0.01],
    sat: 1.0,
  },
  dark: {
    sky: { c: ["#05060a", "#06070c", "#05060a", "#04050a", "#030409"], e: [0, 3, 8, 16, 40] },
    water: { near: "#05060a", mid: "#06070c", far: "#04050a", crest: "#101018", trough: "#030409", glint: "#2a3048", shade: [0.4, 0.42, 0.55] },
    cloud: { lit: "#1a2038", mid: "#12162a", shade: "#0a0d1c" },
    bounce: [0, 0, 0],
    sat: 0.9,
  },
};
