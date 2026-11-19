// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing. Characters are yaw-only billboards shaded by cardShade()
// (scene tint, bright floor, side gradient toward the sun, painted crescent in the drawing); seated ones get a
// soft multiply contact blob. Cards, effects and blobs live on the NOINK layer so the world ink pass never
// outlines their quads.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, fxShadow, fxContact, townsfolk,
  manLetterSide, manWalk, hooded, detective, candleFlame,
  Outfit, Expr, FrontOpts, SideOpts,
} from "./toon";
import {
  FPS, clamp01, SHOTS,
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
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
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

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<LightName, [number, number, number]> = {
  day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33],
  night: [0.16, 0.17, 0.3], warm: [0.24, 0.21, 0.28], dark: [0.14, 0.14, 0.22],
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

/** ordinary 1960s man: green jacket, dark hair (no period hat in the template set) */
const EVERYMAN: Outfit = { jacket: "#5d7a3a", pants: "#3b3f52", boots: "#4a3426", hat: "hair", hair: "#3a2a1a" };

// The Zodiac-specific draws live in toon.ts (manLetter, manWalk, hooded, couple, detective,
// neighbour, letterProp, cipherSheet, crosshairMark, candleFlame) and are placed through the
// card() helper above. The letter / cipher sheet / crosshair stay as Pen-drawn Fx cards
// (drawLetter / drawCrosshair below) — the S5 letter keeps its crosshair + cipher rows and
// the S7 sheet keeps its blank name-box, both of which read well as they are.

/** crosshair symbol on a transparent card (canvas 400x400): circle + cross + centre dot */
const drawCrosshair = (col: string) => (p: Pen) => {
  p.arc(200, 200, 150, 150, 0, 360, 14, col);
  p.line([[200, 18], [200, 382]], col, 14, false);
  p.line([[18, 200], [382, 200]], col, 14, false);
  p.dot(200, 200, 18, col);
};

/** the Zodiac letter on a transparent card (canvas 600x800): aged paper, crosshair at the top,
 *  five rows of cipher symbols (circles, triangles, squares — no readable text). With blankName,
 *  an empty outlined box sits where the name should be (S7: the cipher revealed no name). */
const drawLetter = (blankName: boolean) => (p: Pen) => {
  const ink = "#3a3230";
  p.poly([[30, 30], [570, 30], [570, 770], [30, 770]], "#fbf3da", 6);
  p.poly([[30, 700], [570, 700], [570, 770], [30, 770]], "#e8d8ae", 0);
  p.arc(300, 150, 70, 70, 0, 360, 8, "#8a2a20");
  p.line([[300, 70], [300, 230]], "#8a2a20", 8, false);
  p.line([[220, 150], [380, 150]], "#8a2a20", 8, false);
  p.dot(300, 150, 8, "#8a2a20");
  for (let row = 0; row < 5; row++) {
    const y = 300 + row * 88;
    for (let k = 0; k < 7; k++) {
      const x = 95 + k * 68, kind = (row * 7 + k) % 3;
      if (kind === 0) {
        p.arc(x, y, 20, 20, 0, 360, 5, ink);
        p.line([[x - 14, y], [x + 14, y]], ink, 4, false);
        p.line([[x, y - 14], [x, y + 14]], ink, 4, false);
      } else if (kind === 1) {
        p.poly([[x, y - 20], [x + 20, y + 16], [x - 20, y + 16]], null, 5);
      } else {
        p.poly([[x - 17, y - 17], [x + 17, y - 17], [x + 17, y + 17], [x - 17, y + 17]], null, 5);
      }
    }
  }
  if (blankName) p.poly([[190, 640], [410, 640], [410, 690], [190, 690]], null, 5);
};

/** a character card drawn by a custom toon.ts function (manLetter, hooded, detective, ...),
 *  sized by distance like person() (same 600 x 1000 design space, soles at y = 975) */
const card = (cam: CamInfo, key: string, draw: (p: Pen) => void, x: number, y: number, z: number, scale = 1, mirror = false): Place => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  return { key, draw, x, y, z, scale, mirror, size: [w, h, k] };
};

/** warm light pool on a tabletop (flat soft Fx card): concentric warm ellipses, no hard edge */
const drawGlowPool = (p: Pen) => {
  for (const [rx, ry, a] of [[190, 100, 0.30], [150, 78, 0.22], [105, 55, 0.16], [60, 32, 0.10]] as const)
    p.ell(200, 110, rx, ry, `rgba(255, 170, 80, ${a})`, 0);
};

/** everything with a face in shot `id` at time t.
 *  S1: the driver sits IN the seat in PROFILE — manLetterSide draws him in side view facing
 *  screen-right (the wheel / dashboard), the folded letter tilted at chest height in both
 *  hands, seat back drawn behind him. Card base y 0 at scale 0.7 puts his feet on the floor
 *  and his hips on the 0.48 m bench cushion; his crown is at ~1.22 m. No contact blob
 *  (he is inside the car). */
export const stage = (id: number, t: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  LNAME = SHOTS.find((s) => s.id === id)?.light ?? "day";
  findSun(cam, SUN);
  const who = (i: number, o: Outfit, okey: string): Who => ({ i, o, okey });
  switch (id) {
    case 1: {
      const blink = lidAt(t, 0), light = light2D(cam, false);
      out.places.push(card(cam, `letterSide|${blink}|${Math.round(light * 100)}`,
        (p) => manLetterSide(p, { seed: 1, expr: "worried" as Expr, blink, light }),
        0.5, 0, -0.15, 0.7));
      break;
    }
    case 2: { // man walking down the sidewalk (2 steps/s, 1.6 m/s); a woman stands on the far side
      const z = 12 - (t - 130 / FPS) * 1.6;
      const light = light2D(cam, false), blink = lidAt(t, 1);
      out.places.push(card(cam, `walk|${q((t * 2) % 1)}|${blink}|${Math.round(light * 100)}`,
        (p) => manWalk(p, { phase: (t * 2) % 1, expr: "worried" as Expr, seed: 1, stride: 1, light, blink }),
        4.75, 0, z, 1));
      blob(out, 4.75, 0.02, z, 1);
      const fo: FrontOpts = { mode: "stand", expr: "neutral" as Expr, blink: lidAt(t, 2) };
      out.places.push(person(cam, who(2, townsfolk(1), "townswoman"), -4.75, 0, 6, { side: false, mirror: false }, fo, {}, 1));
      blob(out, -4.75, 0.02, 6, 1);
      break;
    }
    case 3: { // hooded figure in the dark street, crosshair glowing in the sky behind him
      const light = light2D(cam, false);
      out.places.push(card(cam, `hooded|${Math.round(light * 100)}`,
        (p) => hooded(p, { seed: 7, light }), 0, 0, 6, 0.9));
      blob(out, 0, 0.02, 6, 1);
      out.fx.push({ key: "fx|crosshair-red", cw: 400, ch: 400, draw: drawCrosshair("#ff3b30"), x: 0, y: 2.5, z: 4.0, w: 1.8, h: 1.8 });
      break;
    }
    case 4: { // the couple in the parked lane car: two seated cards, heads below the 1.28 m roof
      //   slab (base y 0.12 puts the crowns at ~1.11 m) so they read through the open cabin,
      //   not sticking out of the roof
      const man: FrontOpts = { mode: "sit", expr: "neutral" as Expr, blink: lidAt(t, 4) };
      const woman: FrontOpts = { mode: "sit", expr: "nervous" as Expr, blink: lidAt(t, 5) };
      out.places.push(person(cam, who(4, EVERYMAN, "laneman"), -8.35, 0.12, -14.0, { side: false, mirror: false }, man, {}, 0.9));
      out.places.push(person(cam, who(5, townsfolk(1), "lanewoman"), -7.65, 0.12, -14.0, { side: false, mirror: false }, woman, {}, 0.9));
      break;
    }
    case 11: // newspaper office: empty desk, typewriter, envelopes, lamp (the letters have arrived)
      break;
    case 5: // the letter, flat on the office desk
      out.fx.push({ key: "fx|letter", cw: 600, ch: 800, draw: drawLetter(false), x: 30, y: 0.79, z: 0.15, w: 0.5, h: 0.68, flat: true, rot: -0.15 });
      break;
    case 6: { // detective SEATED at the desk (fedora + suit + tie): the draw is a full
      //   standing figure, so soles go on the FLOOR (y 0) at the chair and the 3D desk
      //   hides everything below ~0.35 m — only head + shoulders show above the desk.
      //   (Base 0.32 floated his feet in mid-air and he read as standing ON the desk.)
      //   Scale 0.75 puts his crown at ~1.26 m, a natural seated head height.
      const blink = lidAt(t, 6), light = light2D(cam, false);
      out.places.push(card(cam, `detective|${blink}|${Math.round(light * 100)}`,
        (p) => detective(p, { seed: 3, expr: "exasperated" as Expr, blink, light }),
        -30, 0, -0.9, 0.75));
      break;
    }
    case 7: // decoded cipher sheet on the desk, blank box where the name should be
      out.fx.push({ key: "fx|cipher", cw: 600, ch: 800, draw: drawLetter(true), x: -30.2, y: 0.80, z: 0.0, w: 0.45, h: 0.6, flat: true, rot: 0.2 });
      break;
    case 8: { // five candles with real teardrop flames + glow (candleFlame draw, soft cards so
      //   the translucent glow survives) on a warm light pool on the table
      for (let i = 0; i < 5; i++) {
        const x = -0.6 + i * 0.3;
        out.fx.push({ key: `fx|candle|${i}`, cw: 600, ch: 1000, draw: (p) => candleFlame(p, { sway: (i % 3 - 1) * 4 }),
          x, y: 1.015, z: 22, w: 0.32, h: 0.54, soft: true });
      }
      out.fx.push({ key: "fx|glowpool", cw: 400, ch: 220, draw: drawGlowPool, x: 0, y: 0.785, z: 22, w: 2.0, h: 1.1, flat: true, soft: true });
      break;
    }
    case 9: { // ordinary man strolls; neighbour waves from the far sidewalk
      const z = 2 - (t - 1238 / FPS) * 1.4;
      const so: SideOpts = { mode: "march", phase: (t * 2) % 1, expr: "smile" as Expr, stride: 0.8 };
      out.places.push(person(cam, who(7, EVERYMAN, "ordinary"), 4.75, 0, z, { side: true, mirror: false }, {}, so, 1));
      blob(out, 4.75, 0.02, z, 1);
      const fo: FrontOpts = { mode: "stand", expr: "smile" as Expr, blink: lidAt(t, 8), wave: 0.6 };
      out.places.push(person(cam, who(8, townsfolk(1), "neighbour"), -4.75, 0, 0.5, { side: false, mirror: false }, fo, {}, 1));
      blob(out, -4.75, 0.02, 0.5, 1);
      break;
    }
    case 10: // the crosshair alone on black
      out.fx.push({ key: "fx|crosshair-white", cw: 400, ch: 400, draw: drawCrosshair("#f2ede0"), x: 0, y: 1.2, z: 0, w: 1.5, h: 1.5 });
      break;
    default:
      break;
  }
  return out;
};
export { FPS };
