// Molasses Flood (vertical 1080x1920, 30 fps, 300 f = 10.0 s). One visual per sentence.
// Boston North End, 15 Jan 1919, 529 Commercial Street: a 50-ft steel tank holding
// 2.3M gallons of molasses burst at ~12:30 pm; a 25-ft wave at 35 mph killed 21.
// Scene ranges follow the MEASURED tightened-VO sentence boundaries:
//   S1 "In 1919, a molasses tank burst."            f0-71   -> shot 1 f0-72
//   S2 "A 25-foot wave flooded Boston at 35 mph."  f75-176 } -> shot 2 f73-219 (long money shot)
//   S2b "Twenty-one people drowned."               f179-218 }
//   S3 "You see, it wasn't the sweetness."         f221-269 -> shot 3 f220-299
//   S3b "It was the speed."                        f272-299 }
// Crossfades 6 f at f73 and f220 (zodiac story.ts XFADES/layersAt pattern).
// Ground is y = 0 (D0 = 0); the street runs along z, the tank at the far end (z = -48).
// Cameras: smootherstep glides between keys, every hold creeps (end key is always a
// small push-in on the start key).
import { LightName } from "./lights";

export const FPS = 30;
export const TOTAL = 300;
export const D0 = 0; // molasses ground level (the bridge template's D0 = 6 is not used here)
export type V3 = [number, number, number];

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerp3 = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

/** kept for the template Bridge.tsx import (no flash in this film) */
export const FLASH_AT = -1;

export type ShotDef = { id: number; a: number; b: number; light: LightName; sunAz?: number; sunEl?: number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 72, light: "day", sunAz: 75, sunEl: 48 },    // S1 the tank, wide establishing
  { id: 2, a: 73, b: 219, light: "day", sunAz: 150, sunEl: 48 },  // S2 the wave advances (147 f); sun behind the lens so the wave face is lit, not backlit
  { id: 3, a: 220, b: 299, light: "day", sunAz: 75, sunEl: 48 }, // S3 the payoff: speedometer + aftermath
];

export const shotAt = (f: number): ShotDef => {
  for (const s of SHOTS) if (f >= s.a && f <= s.b) return s;
  return SHOTS[SHOTS.length - 1];
};

/** crossfades: {at, from, to, dur}. Everything else is a hard cut (none here). */
export const XFADES = [
  { at: 73, from: 1, to: 2, dur: 6 },
  { at: 220, from: 2, to: 3, dur: 6 },
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

/** the wave's advance across shot 2 (pure function of frame): front z from -26 m
 *  (far down the street) to -3 m — the front STOPS ~14 m from the lens. It must never
 *  reach the camera: at +4 m the last frames were nothing but brown (the wave filled
 *  the frame, the second surge hid the runners, a barrel filled the lens). The wave
 *  still advances 23 m and looms large behind the runners; the flood ARRIVING is
 *  shot 3's job. Height 6.2 -> 7.6 m.
 *  THREE SURGES, not one smooth glide: burst to 42% (f73-124), a beat of hesitation,
 *  burst to 75% (f124-168), then a slow creep to 100% (f168-219). smooth() has zero
 *  slope at its ends, so the wave visibly hesitates between bursts. */
export const waveU = (f: number) => {
  const u = clamp01((f - 73) / 146);
  if (u <= 0) return 0;
  if (u >= 1) return 1;
  const s1 = smooth(u / 0.35) * 0.42;
  const s2 = u < 0.35 ? 0 : smooth((u - 0.35) / 0.3) * 0.33;
  const s3 = u < 0.65 ? 0 : smooth((u - 0.65) / 0.35) * 0.25;
  return s1 + s2 + s3;
};
export const waveZ = (f: number) => lerp(-26, -3, waveU(f));
export const waveH = (f: number) => lerp(6.2, 7.6, waveU(f));

export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Key = { f: number; pos: V3; look: V3; fov: number };
// S1: low on the street (1.6 m), looking slightly up the street at the tank; slow push-in.
//   Tank front face z = -34.5, 50 m from the lens: 27 m wide = ~15 deg half-angle, just
//   inside the vertical frame's ~16 deg horizontal half-angle at fov 52.
const KEYS: Record<number, Key[]> = {
  1: [
    { f: 0, pos: [0, 1.6, 16], look: [0, 4.0, -34], fov: 52 },
    { f: 72, pos: [0, 1.6, 13.5], look: [0, 4.0, -34], fov: 52 },
  ],
  2: [ // low, looking down the street at the oncoming wave; the camera DRIFTS mid-shot
    // (f150: left, lower, closer, tighter fov, looking slightly right) so 147 frames are
    // not one identical slow push-in — a new angle on the wave + runners, then back.
    { f: 73, pos: [0, 1.4, 14], look: [0, 2.2, -10], fov: 52 },
    { f: 150, pos: [-1.6, 1.05, 12.6], look: [0.6, 1.9, -5], fov: 48 },
    { f: 219, pos: [0, 1.4, 11], look: [0, 2.2, -10], fov: 52 },
  ],
  3: [ // slow push-in on the big speedometer dial; flooded street behind it
    { f: 220, pos: [0, 1.7, 11], look: [0.3, 1.1, 2], fov: 50 },
    { f: 299, pos: [0, 1.65, 9.2], look: [0.3, 1.1, 2], fov: 50 },
  ],
};

export const camAt = (id: number, f: number): Cam => {
  const ks = KEYS[id] ?? KEYS[1];
  if (f <= ks[0].f) { const k = ks[0]; return { pos: [...k.pos], look: [...k.look], fov: k.fov, roll: 0 }; }
  for (let i = 0; i < ks.length - 1; i++) {
    const a = ks[i], b = ks[i + 1];
    if (f <= b.f) {
      const u = smooth((f - a.f) / Math.max(1, b.f - a.f));
      return { pos: lerp3(a.pos, b.pos, u), look: lerp3(a.look, b.look, u), fov: lerp(a.fov, b.fov, u), roll: 0 };
    }
  }
  const l = ks[ks.length - 1];
  return { pos: [...l.pos], look: [...l.look], fov: l.fov, roll: 0 };
};

/** thin-lens DOF: focus defaults to the look target; cInf 0 on the wide, up to 8 on the
 *  gauge close-up. (Dormant while the composer is off — the lens pass lives in the
 *  composer — but kept true.) */
export type Dof = { f: number; cInf: number; focus?: (f: number) => V3 };
const COF: Record<number, number> = { 1: 0, 2: 5, 3: 8 };
export const dofAt = (f: number): Dof => ({ f, cInf: COF[shotAt(f).id] ?? 0 });
export const focusAt = (id: number, f: number): V3 => camAt(id, f).look;
