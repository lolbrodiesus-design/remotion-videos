// Zodiac Killer (16:9, 1920x1080, 30 fps, 1453 f = 48.43 s). One visual per sentence.
// Shot ids 1-10 are the script shots; id 11 is the second half of S4 (newspaper office),
// crossfaded in mid-shot. Cameras: smootherstep glides between keys, every hold creeps
// (end key is always a small push-in on the start key); crossfades 6-8 f on place changes,
// hard cuts only on big jumps (S1->S2 camera jump, S8->S9 dark->day).
import { LightName } from "./lights";

export const FPS = 30;
export const TOTAL = 1453;
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

export type ShotDef = { id: number; a: number; b: number; light: LightName; sunAz?: number; sunEl?: number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 129, light: "golden", sunAz: 6, sunEl: 30 },    // S1 car interior at dusk
  { id: 2, a: 130, b: 314, light: "golden", sunAz: 6, sunEl: 22 },  // S2 1960s street, man walking
  { id: 3, a: 315, b: 425, light: "night" },                       // S3 hooded figure, crosshair glow
  { id: 4, a: 426, b: 617, light: "night" },                       // S4a lovers' lane (parked car, couple)
  { id: 11, a: 426, b: 617, light: "warm" },                       // S4b newspaper office (xfade in at f516)
  { id: 5, a: 618, b: 818, light: "warm" },                        // S5 letter close-up on the desk
  { id: 6, a: 819, b: 945, light: "day" },                         // S6 police station, detective at desk
  { id: 7, a: 946, b: 1075, light: "day" },                        // S7 calendar wall + decoded cipher sheet
  { id: 8, a: 1076, b: 1237, light: "dark" },                      // S8 five candles in the dark
  { id: 9, a: 1238, b: 1392, light: "day" },                       // S9 ordinary man waves at a neighbour
  { id: 10, a: 1393, b: 1452, light: "dark" },                     // S10 crosshair alone on black
];

export const shotAt = (f: number): ShotDef => {
  if (f >= 516 && f < 618) return SHOTS[4]; // office half of S4
  for (const s of SHOTS) if (s.id !== 11 && f >= s.a && f <= s.b) return s;
  return SHOTS[SHOTS.length - 1];
};

/** crossfades: {at, from, to, dur}. Everything else is a hard cut (big jumps only). */
export const XFADES = [
  { at: 315, from: 2, to: 3, dur: 8 },   // street day -> night (time jump)
  { at: 426, from: 3, to: 4, dur: 8 },   // street -> lovers' lane
  { at: 516, from: 4, to: 11, dur: 8 },  // lane -> newspaper office (mid-shot)
  { at: 618, from: 11, to: 5, dur: 6 },  // office wide -> letter close-up
  { at: 819, from: 5, to: 6, dur: 8 },   // office -> police station
  { at: 946, from: 6, to: 7, dur: 6 },   // detective -> calendar wall (same room)
  { at: 1076, from: 7, to: 8, dur: 8 },  // police room -> candles
  { at: 1393, from: 9, to: 10, dur: 8 }, // street -> black crosshair
];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const x of XFADES) {
    if (f >= x.at && f < x.at + x.dur) {
      const t = smooth((f - x.at) / x.dur);
      return [{ id: x.from, alpha: 1 - t }, { id: x.to, alpha: t }];
    }
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Key = { f: number; pos: V3; look: V3; fov: number };
// S1: INSIDE the car, passenger side, looking forward-right at the driver in profile:
//   driver left of frame, wheel centre, gauges right, street through the windshield.
//   Looking forward keeps the driver's door out of the frame (it filled the middle-right
//   when the camera looked across the car). The driver card sits on the floor (base y 0,
//   scale 0.7): feet on the floor, hips on the cushion, crown ~1.22 m.
const KEYS: Record<number, Key[]> = {
  1: [
    { f: 0, pos: [-0.35, 1.18, 0.10], look: [0.45, 1.00, 0.05], fov: 55 },
    { f: 129, pos: [-0.32, 1.17, 0.14], look: [0.45, 1.00, 0.05], fov: 55 },
  ],
  2: [ // street tracking shot from the east sidewalk edge (x 5.2, on the walk, not in the
    // grass), looking across the road so the walker (east walk) and the woman (far walk)
    // are both in frame for the whole shot; fov 55 gives ~9 deg of margin each side
    { f: 130, pos: [5.2, 2.6, 16.0], look: [1.8, 1.0, 8.8], fov: 55 },
    { f: 314, pos: [5.2, 2.6, 9.5], look: [0.4, 1.0, 3.1], fov: 55 },
  ],
  3: [ // low on the hooded figure in the dark street, slow push-in
    { f: 315, pos: [2.5, 1.6, 10.5], look: [0, 1.3, 6.0], fov: 45 },
    { f: 425, pos: [2.2, 1.55, 9.6], look: [0, 1.3, 6.0], fov: 45 },
  ],
  4: [ // lovers' lane: parked car on the west verge, slow push-in
    { f: 426, pos: [-3.6, 1.8, -7.5], look: [-8.0, 1.0, -14.0], fov: 45 },
    { f: 524, pos: [-4.2, 1.7, -8.8], look: [-8.0, 1.0, -14.0], fov: 45 },
  ],
  11: [ // newspaper office wide: desk centre, lamp warm, window on the far wall
    { f: 516, pos: [32.6, 1.7, 3.2], look: [30.0, 0.9, 0.0], fov: 46 },
    { f: 617, pos: [32.2, 1.65, 2.7], look: [30.0, 0.9, 0.0], fov: 46 },
  ],
  5: [ // letter close-up, flat on the desk, slow push-in
    { f: 618, pos: [30.9, 1.9, 1.7], look: [30.0, 0.78, 0.2], fov: 40 },
    { f: 818, pos: [30.55, 1.72, 1.25], look: [30.0, 0.78, 0.2], fov: 40 },
  ],
  6: [ // police station: detective behind the desk, papers everywhere
    { f: 819, pos: [-27.4, 1.7, 3.1], look: [-30.0, 0.9, -0.2], fov: 46 },
    { f: 945, pos: [-27.8, 1.65, 2.6], look: [-30.0, 0.9, -0.2], fov: 46 },
  ],
  7: [ // calendar wall (west wall) + cipher sheet on the desk in the foreground
    { f: 946, pos: [-28.2, 1.7, 1.8], look: [-32.5, 1.4, -0.9], fov: 44 },
    { f: 1075, pos: [-28.5, 1.68, 1.4], look: [-32.5, 1.4, -0.9], fov: 44 },
  ],
  8: [ // five candles on a table in the dark, tight: candles ~50 % of frame height, less void
    { f: 1076, pos: [1.0, 1.25, 23.8], look: [0, 1.0, 22.0], fov: 35 },
    { f: 1237, pos: [0.7, 1.2, 23.4], look: [0, 1.0, 22.0], fov: 35 },
  ],
  9: [ // ordinary day street: man strolls, neighbour waves from the far sidewalk
    { f: 1238, pos: [8.0, 3.0, 10.0], look: [0, 1.0, -1.0], fov: 50 },
    { f: 1392, pos: [7.6, 2.9, 8.8], look: [0, 1.0, -1.5], fov: 50 },
  ],
  10: [ // crosshair alone on black
    { f: 1393, pos: [0, 1.2, 4.0], look: [0, 1.2, 0], fov: 40 },
    { f: 1452, pos: [0, 1.2, 3.7], look: [0, 1.2, 0], fov: 40 },
  ],
};

export const camAt = (id: number, f: number): Cam => {
  const ks = KEYS[id] ?? KEYS[1];
  const a = ks[0], b = ks[ks.length - 1];
  const u = smooth((f - a.f) / Math.max(1, b.f - a.f));
  return { pos: lerp3(a.pos, b.pos, u), look: lerp3(a.look, b.look, u), fov: lerp(a.fov, b.fov, u), roll: 0 };
};

/** thin-lens DOF: focus defaults to the look target; cInf 0 on wides, up to 12 on the letter CU.
 *  (Dormant while the composer is off — the lens pass lives in the composer — but kept true.) */
export type Dof = { f: number; cInf: number; focus?: (f: number) => V3 };
const COF: Record<number, number> = { 1: 8, 2: 5, 3: 6, 4: 6, 11: 8, 5: 12, 6: 8, 7: 10, 8: 6, 9: 5, 10: 0 };
export const dofAt = (f: number): Dof => ({ f, cInf: COF[shotAt(f).id] ?? 6 });
export const focusAt = (id: number, f: number): V3 => camAt(id, f).look;
