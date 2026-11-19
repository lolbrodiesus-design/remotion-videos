// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing. Characters are yaw-only billboards shaded by cardShade()
// (scene tint, bright floor, side gradient toward the sun, painted crescent in the drawing); standing ones get a
// soft multiply contact blob. Cards, effects and blobs live on the NOINK layer so the world ink pass never
// outlines their quads.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, fxShadow, fxContact, fxMolassesSplash, fxSpray, townsfolk,
  Outfit, Expr, FrontOpts, SideOpts,
} from "./toon";
import {
  FPS, clamp01, SHOTS, waveZ,
} from "./story";
import type { LightName } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
/** head-shape seed: 7 shapes, so figures in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: LightName = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

// ---------------- life: blinks ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<LightName, [number, number, number]> = {
  day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33],
};
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- the cast ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };

/** 1919 North End men: long dark coats, top hats (the toon set's period hat) */
const COAT: Outfit[] = [
  { jacket: "#2f333d", pants: "#2f333d", boots: "#241f1a", hat: "tophat", hair: "#3a2a1a" },
  { jacket: "#3a2e28", pants: "#2f2a26", boots: "#241f1a", hat: "tophat", hair: "#4a3426" },
  { jacket: "#24303a", pants: "#2f333d", boots: "#241f1a", hat: "tophat", hair: "#2a201a" },
  { jacket: "#4a2f28", pants: "#3a2e28", boots: "#241f1a", hat: "tophat", hair: "#3a2a1a" },
];

/** everything with a face in shot `id` at time t.
 *  S1: four period figures on the sidewalks; one points up at the tank (wave arm, shock).
 *  S2: three figures fleeing in side view (flee pose: march run cycle, both arms thrown
 *    up), scattering past the lens as the wave advances behind them, plus one fallen
 *    figure at the kerb. (Front-facing runners would show their faces to the lens; the
 *    side flee pose reads as running AWAY from the wave.)
 *  S3: one dazed figure standing ankle-deep in molasses, looking at the viewer; no
 *    contact blob (his feet are under the flood slab). */
export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  LNAME = SHOTS.find((s) => s.id === id)?.light ?? "day";
  findSun(cam, SUN);
  const who = (i: number, o: Outfit, okey: string): Who => ({ i, o, okey });
  const front = { side: false, mirror: false };
  switch (id) {
    case 1: {
      // figures at the kerb (x = ±4.0-4.2), spread down the street so the narrow vertical
      // frame holds them: the pointer up front, three more behind him on both sidewalks.
      const p1: FrontOpts = { mode: "stand", expr: "shock" as Expr, blink: lidAt(t, 0), wave: 1 };
      out.places.push(person(cam, who(0, COAT[0], "coat0"), -4.0, 0, -4, front, p1, {}, 1));
      blob(out, -4.0, 0.02, -4, 1);
      const p2: FrontOpts = { mode: "stand", expr: "neutral" as Expr, blink: lidAt(t, 1) };
      out.places.push(person(cam, who(1, COAT[1], "coat1"), -4.2, 0, -12, front, p2, {}, 1));
      blob(out, -4.2, 0.02, -12, 1);
      const p3: FrontOpts = { mode: "stand", expr: "nervous" as Expr, blink: lidAt(t, 2) };
      out.places.push(person(cam, who(2, COAT[2], "coat2"), 4.2, 0, -8, front, p3, {}, 1));
      blob(out, 4.2, 0.02, -8, 1);
      const p4: FrontOpts = { mode: "stand", expr: "neutral" as Expr, blink: lidAt(t, 3) };
      out.places.push(person(cam, who(3, townsfolk(1), "woman1"), 4.2, 0, -16, front, p4, {}, 1));
      blob(out, 4.2, 0.02, -16, 1);
      break;
    }
    case 2: {
      const f = t * FPS, lu = clamp01((f - 73) / 146); // LINEAR progress: constant speed,
      // so the leg cycle can be matched to the ground speed and the feet actually plant
      // (the old smootherstep + 2.4 Hz cycle made the feet slide ~3.7 m/s while the body
      // glided at 0.71 m/s — running in place). Path ~6.1 m in 4.87 s ≈ 1.26 m/s.
      // side-view FLEE pose (run cycle, both arms thrown up and PUMPING), scattering
      // diagonally away from the wave, past the lens: each runner its own stride,
      // cadence and drift, so they never move in lockstep.
      const run = (i: number, o: Outfit, okey: string, x0: number, z0: number, dx: number, dz: number, stride: number, ph: number, mirror: boolean) => {
        const pathLen = Math.hypot(dx, dz), speed = pathLen / (146 / FPS);
        const freq = speed / (0.8 * stride); // strides/s: stride world length 0.8*stride m per cycle
        const x = x0 + lu * dx, z = z0 + lu * dz;
        const phase = (t * freq + ph) % 1;
        const so: SideOpts = { mode: "flee", phase, expr: "shock" as Expr, blink: lidAt(t, i), stride };
        out.places.push(person(cam, who(i, o, okey), x, 0, z, { side: true, mirror }, {}, so, 1));
        blob(out, x, 0.02, z, 1);
        // foot splash: peaks at each footfall (phase 0 and 0.5), fades between steps
        const pulse = 0.55 + 0.75 * (1 - Math.abs(Math.sin(Math.PI * phase)));
        out.fx.push({ key: "splash", cw: 128, ch: 128, draw: (p) => fxMolassesSplash(p), x, y: 0.03, z, w: 0.9 * pulse, h: 0.7 * pulse, flat: true });
      };
      run(4, COAT[0], "coat0", -3.2, -2, -1.4, 6.0, 1.0, 0, true);
      run(5, townsfolk(3), "woman3", 0.2, 0, 1.0, 6.0, 1.15, 0.33, false);
      run(6, COAT[3], "coat3", 1.9, 2, 1.4, 6.0, 1.3, 0.66, false);
      // spray churning at the foot of the wave: six cards spread across the front,
      // each pulsing on its own phase so the foot of the wave never sits still
      for (let i = 0; i < 6; i++) {
        const sx = -5 + i * 2, sz = waveZ(f) + 0.8;
        const sp = 0.6 + 0.7 * Math.max(0, Math.sin(t * 3.5 + i * 1.9));
        out.fx.push({ key: `spray|${i}`, cw: 128, ch: 256, draw: (p) => fxSpray(p, i), x: sx, y: 0.5, z: sz, w: 1.1 * sp, h: 1.4 * sp });
      }
      const fall: FrontOpts = { mode: "fall", expr: "shock" as Expr, blink: lidAt(t, 7) };
      out.places.push(person(cam, who(7, COAT[1], "coat1"), -1.6, 0, 4, front, fall, {}, 1));
      blob(out, -1.6, 0.02, 4, 1);
      break;
    }
    case 3: {
      const fo: FrontOpts = { mode: "stand", expr: "dazed" as Expr, blink: lidAt(t, 8) };
      out.places.push(person(cam, who(8, COAT[2], "coat2"), 1.9, 0, 1.0, front, fo, {}, 1));
      break;
    }
    default:
      break;
  }
  return out;
};
export { FPS };
