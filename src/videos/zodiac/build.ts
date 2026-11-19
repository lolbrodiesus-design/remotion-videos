// Static scenery: merged batches (one mesh per material), box-section strands rebuilt along a path every frame
// (chains, rails), and the town on both banks: gabled houses with painted facades, church, mill + chimneys, quay,
// hills and CC0 Kenney props (trees, lanterns, stalls, hedges).
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { brick, rng, ctex, rep, facadeHD, roofHD, stoneHD, leatherHD, grassHD } from "./paint";
import { twoTone } from "./shade";

export type Kit = Record<string, THREE.Object3D>;
export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

// ---------------- materials (shared, cached) ----------------
const mats = new Map<string, THREE.Material>();
/** materials whose Strands are built as real interlocking chain links (MAT pass) instead of a textured box tube */
const CHAIN_MATS = new WeakSet<THREE.Material>();
export const lam = (key: string, make: () => THREE.MeshLambertMaterialParameters) => {
  let m = mats.get(key) as THREE.MeshLambertMaterial | undefined;
  if (!m) {
    if (key === "chainHD") {
      // MAT pass: the chain material (world.ts) becomes slate blue-grey iron with a soft painted-metal highlight;
      // its Strands switch to link geometry, so links read in close-ups (bank f1780, overhead f1650)
      const c = twoTone(new THREE.MeshPhongMaterial({ color: "#7a8490", specular: "#6c727b", shininess: 30 }));
      CHAIN_MATS.add(c);
      m = c as unknown as THREE.MeshLambertMaterial;
    } else m = twoTone(new THREE.MeshLambertMaterial(make()));
    mats.set(key, m);
  }
  return m;
};
const lamOf = new Map<string, THREE.MeshLambertMaterial>();
// the nature kit ships a teal palette; our valley wants storybook greens and browns
const GREENS = ["#62ae4c", "#56a447", "#72b853"];
const RECOLOR: Record<string, string> = { grass: "#6aab4f", leafsDark: "#4a9142", woodBark: "#8a5a3c", woodInner: "#e8cfa4", wood: "#a8724a",
  woodDark: "#7a4f33", dirt: "#8a6a4a", stone: "#b7b4ad" };
/** Kenney GLB materials -> Lambert, so the whole world shares one lighting model */
const toLambert = (m: THREE.Material) => {
  let l = lamOf.get(m.uuid);
  if (!l) {
    const s = m as THREE.MeshStandardMaterial;
    const col = m.name === "leafsGreen" ? GREENS[lamOf.size % 3] : RECOLOR[m.name];
    l = twoTone(new THREE.MeshLambertMaterial({ color: col ? new THREE.Color(col) : s.color?.clone() ?? new THREE.Color("#ffffff"), map: s.map ?? null, side: s.side, alphaTest: s.alphaTest }));
    lamOf.set(m.uuid, l);
  }
  return l;
};

// ---------------- geometry pieces ----------------
const f32 = (a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) => {
  const out = new Float32Array(a.count * a.itemSize);
  for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
  return new THREE.Float32BufferAttribute(out, a.itemSize);
};
/** quad a,b,c,d counter-clockwise seen from its front; uv (u0,v0) at a, (u1,v1) at c */
export const quad = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, u1 = 1, v1 = 1, u0 = 0, v0 = 0) => {
  const g = new THREE.BufferGeometry();
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(d, a)).normalize();
  g.setAttribute("position", new THREE.Float32BufferAttribute([a, b, c, a, c, d].flatMap((v) => [v.x, v.y, v.z]), 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 2, 3, 4, 5].flatMap(() => [n.x, n.y, n.z]), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1], 2));
  return g;
};
export const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
  const g = new THREE.BufferGeometry();
  const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
  g.setAttribute("position", new THREE.Float32BufferAttribute([a, b, c].flatMap((v) => [v.x, v.y, v.z]), 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute([0, 1, 2].flatMap(() => [n.x, n.y, n.z]), 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2));
  return g;
};
/** axis box from min to max, texture tiled every `tile` metres (0 = one image per face) */
export const boxGeo = (min: THREE.Vector3, max: THREE.Vector3, tile = 0, bottom = false) => {
  const [x0, y0, z0] = [min.x, min.y, min.z], [x1, y1, z1] = [max.x, max.y, max.z];
  const t = (a: number) => (tile ? a / tile : 1);
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  const faces = [
    quad(V(x0, y0, z1), V(x1, y0, z1), V(x1, y1, z1), V(x0, y1, z1), t(w), t(h)),
    quad(V(x1, y0, z0), V(x0, y0, z0), V(x0, y1, z0), V(x1, y1, z0), t(w), t(h)),
    quad(V(x0, y0, z0), V(x0, y0, z1), V(x0, y1, z1), V(x0, y1, z0), t(d), t(h)),
    quad(V(x1, y0, z1), V(x1, y0, z0), V(x1, y1, z0), V(x1, y1, z1), t(d), t(h)),
    quad(V(x0, y1, z1), V(x1, y1, z1), V(x1, y1, z0), V(x0, y1, z0), t(w), t(d)),
  ];
  if (bottom) faces.push(quad(V(x0, y0, z0), V(x1, y0, z0), V(x1, y0, z1), V(x0, y0, z1), t(w), t(d)));
  return mergeGeometries(faces, false);
};

/** collects pieces by material and merges them into one static mesh per material */
export class Batch {
  private g = new Map<THREE.Material, THREE.BufferGeometry[]>();
  add(geo: THREE.BufferGeometry, mat: THREE.Material, m?: THREE.Matrix4) {
    const src = geo.index ? geo.toNonIndexed() : geo;
    const x = new THREE.BufferGeometry();
    x.setAttribute("position", f32(src.attributes.position));
    if (src.attributes.normal) x.setAttribute("normal", f32(src.attributes.normal)); else x.computeVertexNormals();
    x.setAttribute("uv", src.attributes.uv ? f32(src.attributes.uv) : new THREE.Float32BufferAttribute(new Float32Array(src.attributes.position.count * 2), 2));
    if (m) x.applyMatrix4(m);
    const l = this.g.get(mat);
    if (l) l.push(x); else this.g.set(mat, [x]);
  }
  addObject(o: THREE.Object3D, m: THREE.Matrix4) {
    o.updateMatrixWorld(true);
    o.traverse((c) => {
      const mesh = c as THREE.Mesh;
      if (!mesh.isMesh) return;
      this.add(mesh.geometry, toLambert(Array.isArray(mesh.material) ? mesh.material[0] : mesh.material), new THREE.Matrix4().multiplyMatrices(m, mesh.matrixWorld));
    });
  }
  build(parent: THREE.Object3D, cast = true) {
    for (const [mat, list] of this.g) {
      const mesh = new THREE.Mesh(mergeGeometries(list, false), mat);
      mesh.castShadow = cast; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false;
      parent.add(mesh);
    }
    this.g.clear();
  }
}

// ---------------- strands: box-section tube along a path, rebuilt in place ----------------
// chain-link template (MAT pass): a stadium-shaped ring tube in link space (x along the chain, y in the ring plane,
// z across), NS centre-line samples x NR tube sides, smooth normals (clean ink silhouettes, no facet creases)
const LNS = 16, LNR = 6;
type LinkT = { p: Float32Array; n: Float32Array; idx: number[]; pitch: number };
const linkTemplate = (h: number): LinkT => {
  const ow = h * 0.85, rb = ow * 0.14, ol = ow * 1.62, rc = ow / 2 - rb, hl = ol / 2 - rb - rc;
  const p = new Float32Array(LNS * LNR * 3), n = new Float32Array(LNS * LNR * 3), idx: number[] = [];
  for (let j = 0; j < LNS; j++) {
    const th = (2 * Math.PI * (j + 0.5)) / LNS, nx = Math.cos(th), ny = Math.sin(th);
    const cx = rc * nx + Math.sign(nx) * hl, cy = rc * ny;
    for (let k = 0; k < LNR; k++) {
      const ph = (2 * Math.PI * k) / LNR, cp = Math.cos(ph), sp = Math.sin(ph), o = (j * LNR + k) * 3;
      p[o] = cx + rb * cp * nx; p[o + 1] = cy + rb * cp * ny; p[o + 2] = rb * sp;
      n[o] = cp * nx; n[o + 1] = cp * ny; n[o + 2] = sp;
      const a = j * LNR + k, b = j * LNR + ((k + 1) % LNR), c = ((j + 1) % LNS) * LNR + ((k + 1) % LNR), d = ((j + 1) % LNS) * LNR + k;
      idx.push(a, d, c, a, c, b); // outward winding
    }
  }
  return { p, n, idx, pitch: ol - 4 * rb };
};

export class Strand {
  mesh: THREE.Mesh;
  private pos: Float32Array; private nor: Float32Array; private uv: Float32Array;
  private lt: LinkT | null = null; private maxLinks = 0;
  constructor(public n: number, public w: number, public h: number, mat: THREE.Material, public tile = 1, cast = true) {
    const g = new THREE.BufferGeometry();
    if (CHAIN_MATS.has(mat)) {
      // link mode: up to maxLinks interlocking links laid along the path every frame (draw range = links used)
      const lt = (this.lt = linkTemplate(h)), nv = LNS * LNR;
      this.maxLinks = 440;
      this.pos = new Float32Array(this.maxLinks * nv * 3); this.nor = new Float32Array(this.maxLinks * nv * 3); this.uv = new Float32Array(this.maxLinks * nv * 2);
      const idx = new Uint32Array(this.maxLinks * lt.idx.length);
      for (let l = 0; l < this.maxLinks; l++) for (let i = 0; i < lt.idx.length; i++) idx[l * lt.idx.length + i] = lt.idx[i] + l * nv;
      g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
      g.setAttribute("normal", new THREE.BufferAttribute(this.nor, 3));
      g.setAttribute("uv", new THREE.BufferAttribute(this.uv, 2));
      g.setIndex(new THREE.BufferAttribute(idx, 1));
      g.setDrawRange(0, 0);
    } else {
      this.pos = new Float32Array(n * 12); this.nor = new Float32Array(n * 12); this.uv = new Float32Array(n * 8);
      g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
      g.setAttribute("normal", new THREE.BufferAttribute(this.nor, 3));
      g.setAttribute("uv", new THREE.BufferAttribute(this.uv, 2));
      const idx: number[] = [];
      for (let i = 0; i < n - 1; i++) for (let k = 0; k < 4; k++) {
        const a = i * 4 + k, b = i * 4 + ((k + 1) % 4), c = (i + 1) * 4 + ((k + 1) % 4), d = (i + 1) * 4 + k;
        idx.push(a, b, c, a, c, d);
      }
      g.setIndex(idx);
    }
    this.mesh = new THREE.Mesh(g, mat);
    this.mesh.frustumCulled = false; this.mesh.castShadow = cast; this.mesh.receiveShadow = true;
  }
  private T = new THREE.Vector3(); private S = new THREE.Vector3(); private N = new THREE.Vector3();
  /** link mode: links every `pitch` along the polyline, centred, alternating ring plane (vertical / horizontal) */
  private setLinks(pts: THREE.Vector3[], lt: LinkT) {
    const { T, S, N } = this, nv = LNS * LNR;
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const total = cum[cum.length - 1], count = Math.max(0, Math.min(this.maxLinks, Math.floor(total / lt.pitch)));
    const s0 = (total - (count - 1) * lt.pitch) / 2;
    let seg = 1;
    for (let l = 0; l < count; l++) {
      const s = s0 + l * lt.pitch;
      while (seg < pts.length - 1 && cum[seg] < s) seg++;
      const a = pts[seg - 1], b = pts[seg], u = (s - cum[seg - 1]) / Math.max(1e-6, cum[seg] - cum[seg - 1]);
      const px = a.x + (b.x - a.x) * u, py = a.y + (b.y - a.y) * u, pz = a.z + (b.z - a.z) * u;
      T.subVectors(b, a).normalize();
      S.set(-T.z, 0, T.x); // T x up
      if (S.lengthSq() < 1e-6) S.set(1, 0, 0);
      S.normalize(); N.crossVectors(S, T).normalize();
      const odd = l % 2 === 1;
      // ring plane: (T, N) for even links, (T, S) for odd links; z (thickness) across it
      const yx = odd ? S.x : N.x, yy = odd ? S.y : N.y, yz = odd ? S.z : N.z;
      const zx = odd ? -N.x : S.x, zy = odd ? -N.y : S.y, zz = odd ? -N.z : S.z;
      const base = l * nv * 3;
      for (let v = 0; v < nv * 3; v += 3) {
        const x = lt.p[v], y = lt.p[v + 1], z = lt.p[v + 2], o = base + v;
        this.pos[o] = px + T.x * x + yx * y + zx * z;
        this.pos[o + 1] = py + T.y * x + yy * y + zy * z;
        this.pos[o + 2] = pz + T.z * x + yz * y + zz * z;
        const nx = lt.n[v], ny = lt.n[v + 1], nz = lt.n[v + 2];
        this.nor[o] = T.x * nx + yx * ny + zx * nz;
        this.nor[o + 1] = T.y * nx + yy * ny + zy * nz;
        this.nor[o + 2] = T.z * nx + yz * ny + zz * nz;
      }
    }
    const g = this.mesh.geometry;
    g.setDrawRange(0, count * lt.idx.length);
    g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true;
  }
  set(pts: THREE.Vector3[]) {
    if (this.lt) { this.setLinks(pts, this.lt); return; }
    const { T, S, N } = this;
    let len = 0;
    for (let i = 0; i < this.n; i++) {
      const p = pts[Math.min(i, pts.length - 1)];
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      T.subVectors(b, a).normalize();
      S.crossVectors(T, V(0, 1, 0));
      if (S.lengthSq() < 1e-6) S.set(1, 0, 0);
      S.normalize(); N.crossVectors(S, T).normalize();
      if (i) len += p.distanceTo(pts[Math.min(i - 1, pts.length - 1)]);
      for (let k = 0; k < 4; k++) {
        const sx = k === 0 || k === 3 ? -1 : 1, sy = k < 2 ? -1 : 1, j = (i * 4 + k) * 3;
        this.pos[j] = p.x + S.x * sx * this.w / 2 + N.x * sy * this.h / 2;
        this.pos[j + 1] = p.y + S.y * sx * this.w / 2 + N.y * sy * this.h / 2;
        this.pos[j + 2] = p.z + S.z * sx * this.w / 2 + N.z * sy * this.h / 2;
        const nx = S.x * sx + N.x * sy, ny = S.y * sx + N.y * sy, nz = S.z * sx + N.z * sy, nl = Math.hypot(nx, ny, nz);
        this.nor[j] = nx / nl; this.nor[j + 1] = ny / nl; this.nor[j + 2] = nz / nl;
        this.uv[(i * 4 + k) * 2] = k / 4; this.uv[(i * 4 + k) * 2 + 1] = len / this.tile;
      }
    }
    const g = this.mesh.geometry;
    g.attributes.position.needsUpdate = true; g.attributes.normal.needsUpdate = true; g.attributes.uv.needsUpdate = true;
  }
}

// ---------------- set dressing around the lens ----------------
/** a sight line of the film: from the lens toward the shot's subject, `len` along d (d has unit forward component) */
export type Ray = { o: THREE.Vector3; d: THREE.Vector3; len: number; core: boolean };
let sight: Ray[] = [];
/** does any sight line pass through this box? (centre lines only for small props, so they can still frame a shot) */
const inTheWay = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, coreOnly = false) => {
  for (const { o, d, len, core } of sight) {
    if (coreOnly && !core) continue;
    let t0 = 0, t1 = len;
    for (const [oo, dd, a, b] of [[o.x, d.x, x0, x1], [o.y, d.y, y0, y1], [o.z, d.z, z0, z1]]) {
      if (Math.abs(dd) < 1e-9) { if (oo < a || oo > b) t0 = Infinity; continue; }
      const ta = (a - oo) / dd, tb = (b - oo) / dd;
      t0 = Math.max(t0, Math.min(ta, tb)); t1 = Math.min(t1, Math.max(ta, tb));
    }
    if (t0 <= t1) return true;
  }
  return false;
};

// ---------------- cartoon vegetation (MAT pass) ----------------
// Kenney's faceted low-poly trees and box hedges -> rounded storybook shapes: clustered smooth spheres for canopies
// (the two-tone sun term gives each lobe a lit cap and a cool belly), tapered trunks, rounded-box hedges. Smooth
// normals mean the world ink draws clean silhouettes and lobe-to-lobe folds instead of a crease on every facet.
type VegKind = "round" | "fat" | "tall" | "cone" | "bush" | "hedge";
const VEG: Record<string, VegKind> = {
  tree_oak: "round", tree_default: "round", tree_detailed: "round", tree_fat: "fat", "tree-high-round": "tall", tree: "tall",
  tree_cone: "cone", plant_bushLarge: "bush", plant_bushDetailed: "bush", plant_bush: "bush", hedge: "hedge",
};
const LEAF = ["#549a3e", "#4a8f3c", "#62a848", "#4f9844", "#3f873d"];
/** canopy paint (equal px per metre on a unit sphere: 256 around x 128 pole to pole): light crown, darker belly,
 *  soft leaf-clump dabs (kept low contrast: the two-tone sun term does the main modelling) */
const leafTex = (i: number) => ctex("leafHD" + i, 256, 128, (g, r) => {
  const base = new THREE.Color(LEAF[i]), top = base.clone().offsetHSL(0.012, 0.03, 0.08), bot = base.clone().offsetHSL(-0.015, 0.0, -0.08);
  const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, "#" + top.getHexString()); gr.addColorStop(0.42, "#" + base.getHexString()); gr.addColorStop(1, "#" + bot.getHexString());
  g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
  for (let k = 0; k < 46; k++) {
    const x = r() * 256, y = 10 + r() * 108, rad = 5 + r() * 9, light = y < 64 ? r() < 0.7 : r() < 0.25;
    for (const ox of [-256, 0, 256]) {
      g.strokeStyle = light ? "rgba(225,255,170,0.22)" : "rgba(20,70,30,0.2)"; g.lineWidth = 2.5; g.lineCap = "round";
      g.beginPath(); g.arc(x + ox, y + rad * 0.6, rad, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
    }
  }
});
const leafMat = (i: number) => lam("leafHD" + i, () => ({ map: leafTex(i) }));
const barkMat = () => lam("barkHD", () => ({ color: "#8f5d3b" }));
const vegGeo = new Map<string, THREE.BufferGeometry>();
const lobeGeo = (q: number) => {
  const k = "lobe" + q;
  let g = vegGeo.get(k);
  if (!g) { g = new THREE.SphereGeometry(1, [20, 14, 10][q], [14, 10, 7][q]); vegGeo.set(k, g); }
  return g;
};
const trunkGeo = () => {
  let g = vegGeo.get("trunk");
  if (!g) { g = new THREE.CylinderGeometry(0.6, 1, 1, 10, 1, true).translate(0, 0.5, 0); vegGeo.set("trunk", g); }
  return g;
};
/** rounded box (exact: inner box + radius), unit size along x, smooth normals; used for hedges */
const hedgeGeo = () => {
  let g = vegGeo.get("hedge");
  if (!g) {
    g = new THREE.BoxGeometry(1, 1, 1, 18, 10, 10);
    const p = g.attributes.position as THREE.BufferAttribute, n = g.attributes.normal as THREE.BufferAttribute;
    // per-axis rounding radii in unit space (~0.35 m at the ends, ~0.45 m on top / sides at 3.3 x 1.56 x 1.17 m);
    // flat bottom (it sits on the lawn)
    const R = [0.106, 0.29, 0.385], v = new THREE.Vector3(), e = new THREE.Vector3(), q = [0, 0, 0];
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      for (let a = 0; a < 3; a++) {
        const c = v.getComponent(a), lim = a === 1 && c < 0 ? 0.5 : 0.5 - R[a];
        q[a] = THREE.MathUtils.clamp(c, -lim, lim); e.setComponent(a, (c - q[a]) / R[a]);
      }
      const L = e.length();
      if (L < 1e-6) continue;
      e.divideScalar(L);
      p.setXYZ(i, q[0] + e.x * R[0], q[1] + e.y * R[1], q[2] + e.z * R[2]);
      const nn = new THREE.Vector3(e.x / R[0], e.y / R[1], e.z / R[2]).normalize();
      n.setXYZ(i, nn.x, nn.y, nn.z);
    }
    g.translate(0, 0.5, 0);
    vegGeo.set("hedge", g);
  }
  return g;
};
const yawQ = (a: number) => new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), a);
/** half-width of a cartoon plant of kind k and height h (for the sight-line test) */
const vegRad = (k: VegKind, h: number) => (k === "hedge" ? 1.7 : k === "bush" ? 0.85 * h : k === "tall" ? 0.2 * h : k === "cone" ? 0.27 * h : k === "fat" ? 0.44 * h : 0.39 * h);
/** add one cartoon plant to a batch: base at (x, y, z), height h, q = lobe detail (0 near .. 2 far) */
const addVeg = (b: Batch, k: VegKind, x: number, y: number, z: number, h: number, seed: number, q = 0) => {
  const r = rng(Math.abs(Math.floor(seed)) % 200000 + 7), U = (a: number, c: number) => a + (c - a) * r();
  const leaf = leafMat(k === "cone" ? 4 : k === "hedge" ? 1 : Math.floor(r() * 4)), lobe = lobeGeo(q), yaw = r() * 6.28;
  const put = (px: number, py: number, pz: number, rad: number, sy = 0.9) =>
    b.add(lobe, leaf, new THREE.Matrix4().compose(V(x + px, y + py, z + pz), yawQ(r() * 6.28), V(rad, rad * sy, rad)));
  const trunk = (th: number, tr: number) =>
    b.add(trunkGeo(), barkMat(), new THREE.Matrix4().compose(V(x, y - 0.15, z), yawQ(yaw), V(tr, th + 0.15, tr)));
  const ring = (n: number, dist: number, r0: number, r1: number, cy: number, dy: number) => {
    const a0 = r() * 6.28;
    for (let i = 0; i < n; i++) {
      const a = a0 + (i * 6.28) / n + U(-0.35, 0.35), dd = dist * U(0.85, 1.12);
      put(Math.cos(a) * dd, cy + U(-dy, dy), Math.sin(a) * dd, U(r0, r1));
    }
  };
  if (k === "round" || k === "fat") {
    const f = k === "fat";
    trunk((f ? 0.4 : 0.48) * h, 0.055 * h);
    const cy = (f ? 0.58 : 0.64) * h;
    put(0, cy, 0, (f ? 0.29 : 0.26) * h);
    ring(f ? 5 : 4, (f ? 0.22 : 0.18) * h, (f ? 0.19 : 0.17) * h, (f ? 0.23 : 0.21) * h, cy - 0.05 * h, 0.04 * h);
    put(U(-0.05, 0.05) * h, cy + (f ? 0.15 : 0.17) * h, U(-0.05, 0.05) * h, (f ? 0.19 : 0.17) * h);
  } else if (k === "tall") {
    trunk(0.34 * h, 0.045 * h);
    put(0, 0.47 * h, 0, 0.17 * h, 1.3);
    put(U(-0.03, 0.03) * h, 0.65 * h, U(-0.03, 0.03) * h, 0.15 * h, 1.3);
    put(0, 0.82 * h, 0, 0.11 * h, 1.25);
    ring(3, 0.1 * h, 0.1 * h, 0.12 * h, 0.55 * h, 0.06 * h);
  } else if (k === "cone") {
    trunk(0.2 * h, 0.05 * h);
    put(0, 0.3 * h, 0, 0.26 * h, 0.62);
    put(0, 0.5 * h, 0, 0.2 * h, 0.66);
    put(0, 0.68 * h, 0, 0.14 * h, 0.75);
    put(0, 0.84 * h, 0, 0.08 * h, 1.0);
  } else if (k === "bush") {
    put(0, 0.46 * h, 0, 0.5 * h);
    ring(3, 0.42 * h, 0.32 * h, 0.38 * h, 0.32 * h, 0.04 * h);
  } else { // hedge segment, 3.3 m along local x
    b.add(hedgeGeo(), leaf, new THREE.Matrix4().compose(V(x, y - 0.06, z), new THREE.Quaternion(), V(3.3, h + 0.06, Math.max(0.9, h * 0.78))));
  }
};

// ---------------- painted cloth banner (MAT round 3) ----------------
// The Kenney banner is one flat face of the saturated colour atlas: in golden light it kept a uniform, hot red and
// read as pasted on. Ours is a hanging cloth with real folds (smooth normals, so the two-tone light rolls across
// them), a swallow-tail hem, a muted crimson (sat ~-25 %) with an ochre border and a diamond like the tower flags.
const BANNER_COL: Record<string, string> = { "banner-red": "#b8553a", "banner-green": "#4f8a5a" }; // warm red: no purple in shade
const FOLD = 0.27, CLOTH_W = 1.1, CLOTH_H = 2.6; // fold period across the cloth, cloth size (m)
const bannerTex = (col: string) => ctex("bannerHD" + col, 256, 700, (g) => {
  const W = 256, H = 700, base = new THREE.Color(col);
  const gr = g.createLinearGradient(0, 0, 0, H);
  gr.addColorStop(0, "#" + base.clone().offsetHSL(0, 0, 0.04).getHexString()); gr.addColorStop(1, "#" + base.clone().offsetHSL(0, 0, -0.06).getHexString());
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x++) { // painted fold shading, in phase with the geometry folds
    const s = Math.sin((x / W) * (CLOTH_W / FOLD) * Math.PI * 2);
    g.fillStyle = s > 0 ? `rgba(255,235,215,${0.1 * s})` : `rgba(60,15,15,${-0.12 * s})`; g.fillRect(x, 0, 1, H);
  }
  g.fillStyle = "#" + base.clone().offsetHSL(0, -0.05, -0.12).getHexString(); g.fillRect(0, 0, W, 54); // top hem
  g.strokeStyle = "#d1aa5c"; g.lineWidth = 9; g.strokeRect(20, 66, W - 40, H - 86);                 // ochre border
  g.strokeStyle = "rgba(60,30,20,0.45)"; g.lineWidth = 2; g.strokeRect(14, 60, W - 28, H - 74); g.strokeRect(26, 72, W - 52, H - 98);
  g.fillStyle = "#d1aa5c"; g.fillRect(0, 46, W, 8);
  const cx = W / 2, cy = 250; // emblem: diamond (the tower flags' motif) on a light disc
  g.fillStyle = "#efe2c2"; g.beginPath(); g.arc(cx, cy, 62, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "rgba(60,30,20,0.55)"; g.lineWidth = 3; g.stroke();
  g.fillStyle = "#d1aa5c"; g.beginPath(); g.moveTo(cx, cy - 46); g.lineTo(cx + 34, cy); g.lineTo(cx, cy + 46); g.lineTo(cx - 34, cy); g.closePath(); g.fill();
  g.strokeStyle = "rgba(60,30,20,0.6)"; g.lineWidth = 2.5; g.stroke();
});
const bannerGeo = () => {
  let geo = vegGeo.get("banner");
  if (!geo) {
    const w = CLOTH_W, hh = CLOTH_H, notch = 0.42;
    geo = new THREE.PlaneGeometry(w, hh, 16, 20).translate(0, -hh / 2, 0); // top edge at y = 0
    const p = geo.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), t = -y / hh; // 0 top .. 1 bottom
      p.setY(i, y + notch * (1 - Math.abs(x) / (w / 2)) * t * t);                              // swallow-tail hem
      p.setZ(i, (0.025 + 0.055 * t) * Math.sin((x / FOLD) * Math.PI * 2 + 0.6) + 0.04 * t * t); // folds deepen downwards
    }
    geo.computeVertexNormals();
    vegGeo.set("banner", geo);
  }
  return geo;
};
/** gonfalon on a pole where the Kenney banner plate stood: its plate hung 0.4 x scale beside the placement point,
 *  facing local +-x, so the pole goes there (same framing) and the cloth faces that way */
const bannerProp = (b: Batch, name: string, x0: number, y: number, z0: number, h: number, yaw0: number) => {
  const off = 0.4 * (h / 0.84), x = x0 + Math.cos(yaw0) * off, z = z0 - Math.sin(yaw0) * off, yaw = yaw0 + Math.PI / 2;
  if (inTheWay(x - 0.7, x + 0.7, y, y + h, z - 0.7, z + 0.7, true)) return;
  const col = BANNER_COL[name] ?? "#b4524b";
  const M = (px: number, py: number, pz: number) => new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z).multiply(new THREE.Matrix4().makeTranslation(px, py, pz));
  const pole = lam("bannerPole", () => ({ color: "#6e4b33" })), gold = lam("bannerGold", () => ({ color: "#c9a24e" }));
  b.add(new THREE.CylinderGeometry(0.045, 0.06, h, 10).translate(0, h / 2, 0), pole, M(0, 0, 0));
  b.add(new THREE.SphereGeometry(0.1, 14, 10), gold, M(0, h + 0.06, 0));
  b.add(new THREE.CylinderGeometry(0.03, 0.03, CLOTH_W + 0.2, 8).rotateZ(Math.PI / 2), pole, M(0, h - 0.18, 0.06));
  for (const s of [-1, 1]) b.add(new THREE.SphereGeometry(0.045, 10, 8), gold, M(s * (CLOTH_W / 2 + 0.12), h - 0.18, 0.06));
  b.add(bannerGeo(), lam("bannerHD" + col, () => ({ map: bannerTex(col), side: THREE.DoubleSide })), M(0, h - 0.2, 0.1));
};

// ---------------- Kenney props ----------------
const boxes = new Map<THREE.Object3D, THREE.Box3>();
/** place a Kenney model with its base on y, scaled to height h (left out when it would stand in front of the lens).
 *  Trees, bushes and hedges are drawn as cartoon vegetation, banners as painted cloth instead (MAT pass). */
export const prop = (b: Batch, kit: Kit, name: string, x: number, y: number, z: number, h: number, yaw = 0) => {
  if (name.startsWith("banner")) { bannerProp(b, name, x, y, z, h, yaw); return; }
  const vk = VEG[name];
  if (vk) {
    const rad = vegRad(vk, h);
    if (inTheWay(x - rad, x + rad, y, y + h, z - rad, z + rad, true)) return;
    const d = Math.hypot(x, z);
    addVeg(b, vk, x, y, z, h, x * 92.7 + z * 31.3 + yaw * 1000, d > 200 ? 2 : Math.abs(z) > 45 && d > 60 ? 1 : 0);
    return;
  }
  const o = kit[name];
  if (!o) return;
  let box = boxes.get(o);
  if (!box) { box = new THREE.Box3().setFromObject(o); boxes.set(o, box); }
  const s = h / Math.max(0.01, box.max.y - box.min.y), r = Math.max(box.max.x - box.min.x, box.max.z - box.min.z) * s * 0.5;
  if (inTheWay(x - r, x + r, y, y + h, z - r, z + r, true)) return;
  b.addObject(o, new THREE.Matrix4().compose(V(x, y - box.min.y * s, z), new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), yaw), V(s, s, s)));
};

/** a Kenney model as its own object (two-tone materials), base at y = 0, scaled to height h (no sight-line test:
 *  used for the CAM agent's FOREGROUND framing objects, which are meant to stand in front of the lens) */
export const kitClone = (kit: Kit, name: string, h: number): THREE.Object3D | null => {
  const vk = VEG[name];
  if (vk) { // cartoon plant as its own object (MAT pass), base at y = 0
    const vb = new Batch(), grp = new THREE.Group();
    addVeg(vb, vk, 0, 0, 0, h, name.length * 977 + h * 131, 0);
    vb.build(grp, false);
    grp.traverse((x) => { const m = x as THREE.Mesh; if (m.isMesh) { m.castShadow = false; m.receiveShadow = true; m.matrixAutoUpdate = true; } });
    return grp;
  }
  const o = kit[name];
  if (!o) return null;
  let box = boxes.get(o);
  if (!box) { box = new THREE.Box3().setFromObject(o); boxes.set(o, box); }
  const c = o.clone(true), s = h / Math.max(0.01, box.max.y - box.min.y);
  c.traverse((x) => {
    const m = x as THREE.Mesh;
    if (m.isMesh) { m.material = toLambert(Array.isArray(m.material) ? m.material[0] : m.material); m.castShadow = false; m.receiveShadow = true; }
  });
  const g = new THREE.Group();
  c.position.y = -box.min.y * s; c.scale.setScalar(s);
  g.add(c);
  return g;
};

// ---------------- houses ----------------
type Style = { wall: string; shutter: string; roof: string; timber?: boolean; brick?: boolean };
// MAT pass: warm ochre / cream / sandstone / salmon walls + one blue-grey (the old pinks, whites and grey-blues read
// lavender: the two-tone shade multiplies by a blue-violet, so a near-neutral albedo turns lilac on every shaded face)
// round 3: saturation -35 % on every wall (neutral warm grey / beige; the salmon became a warm greige)
// round 4: the pale greiges still read lavender-grey in shade -> a muted brick / cream / ochre / terracotta spread
const STYLES: Style[] = [
  { wall: "#ecdab2", shutter: "#3f6fb5", roof: "#d27a62" },              // cream
  { wall: "#d8a95f", shutter: "#2f6a43", roof: "#b8644f" },              // ochre
  { wall: "#c47a5c", shutter: "#2f5f6a", roof: "#8f97a8" },              // muted brick-red plaster
  { wall: "#efdcb8", shutter: "#2f5f6a", roof: "#c9775a", timber: true }, // cream timber frame
  { wall: "#ddbd78", shutter: "#5a3b2a", roof: "#d27a62" },              // straw ochre
  { wall: "#cc9a6c", shutter: "#3f6fb5", roof: "#8e7aa0" },              // terracotta sand
  { wall: "#e2c49a", shutter: "#8c3b4a", roof: "#c9775a" },              // warm sandstone
  { wall: "#e3d2b8", shutter: "#2f6a43", roof: "#8f97a8", brick: true },
];
const roofMat = (col: string) => lam("roof" + col, () => ({ map: roofHD(col, col === "#8f97a8"), side: THREE.DoubleSide }));

/** gabled house: front facade (local +z) at width w, depth d, wall height h, ridge along local x (left out if it blocks a shot) */
export const house = (b: Batch, x: number, z: number, yaw: number, w: number, d: number, h: number, si: number, y = 0) => {
  const across = Math.abs(Math.sin(yaw)) > 0.5, hx = (across ? d : w) / 2 + 0.6, hz = (across ? w : d) / 2 + 0.6;
  if (inTheWay(x - hx, x + hx, y, y + h + d * 0.42 + 1.2, z - hz, z + hz)) return;
  const st = STYLES[si % STYLES.length];
  const m = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  const front = lam(`hf${si}_${w}_${h}`, () => ({ map: facadeHD(`hf${si}_${w}_${h}`, w, h, { ...st, door: true }) }));
  const side = lam(`hs${si}_${h}`, () => ({ map: facadeHD(`hs${si}_${h}`, 8, h, st) }));
  const wall = lam("wall" + st.wall, () => ({ color: st.brick ? "#c8643f" : st.wall }));
  const hw = w / 2, hd = d / 2, rh = d * 0.42, o = 0.35;
  b.add(quad(V(-hw, 0, hd), V(hw, 0, hd), V(hw, h, hd), V(-hw, h, hd)), front, m);
  b.add(quad(V(hw, 0, -hd), V(-hw, 0, -hd), V(-hw, h, -hd), V(hw, h, -hd)), side, m);
  b.add(quad(V(-hw, 0, -hd), V(-hw, 0, hd), V(-hw, h, hd), V(-hw, h, -hd)), side, m);
  b.add(quad(V(hw, 0, hd), V(hw, 0, -hd), V(hw, h, -hd), V(hw, h, hd)), side, m);
  b.add(tri(V(-hw, h, -hd), V(-hw, h, hd), V(-hw, h + rh, 0)), wall, m);
  b.add(tri(V(hw, h, hd), V(hw, h, -hd), V(hw, h + rh, 0)), wall, m);
  const ru = (w + 2 * o) / 4, rv = Math.hypot(hd + o, rh) / 4, rm = roofMat(st.roof);
  b.add(quad(V(-hw - o, h - 0.25, hd + o), V(hw + o, h - 0.25, hd + o), V(hw + o, h + rh, 0), V(-hw - o, h + rh, 0), ru, rv), rm, m);
  b.add(quad(V(hw + o, h - 0.25, -hd - o), V(-hw - o, h - 0.25, -hd - o), V(-hw - o, h + rh, 0), V(hw + o, h + rh, 0), ru, rv), rm, m);
  const cx = hw * 0.45 * (si % 2 ? 1 : -1);
  b.add(boxGeo(V(cx - 0.4, h + rh * 0.3, -hd * 0.35 - 0.4), V(cx + 0.4, h + rh + 1.1, -hd * 0.35 + 0.4), 2), lam("chim", () => ({ map: rep(brick(), 1, 1) })), m);
  houseDetail(b, m, w, d, h, rh, cx);
};

// round 4: real 3D relief on every house (was a flat window-textured box): stone plinth, cornice under the eaves,
// window sills + lintel hoods matching facadeHD's window layout, front door step + door hood, chimney cap and pot
const UB = new THREE.BoxGeometry(1, 1, 1);
const trimM = () => lam("trimStone", () => ({ color: "#efe3c8" }));
const capM = () => lam("chimCap", () => ({ color: "#9a8778" }));
const plinthM = () => lam("plinthHD", () => ({ map: stoneHD("copeHD") }));
const ub = (b: Batch, mat: THREE.Material, m: THREE.Matrix4, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  b.add(UB, mat, m.clone().multiply(new THREE.Matrix4().compose(V((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), new THREE.Quaternion(), V(x1 - x0, y1 - y0, z1 - z0))));
const houseDetail = (b: Batch, m: THREE.Matrix4, w: number, d: number, h: number, rh: number, chx: number) => {
  const hw = w / 2, hd = d / 2, tm = trimM(), floors = Math.max(1, Math.floor(h / 2.8));
  b.add(boxGeo(V(-hw - 0.07, -0.05, -hd - 0.07), V(hw + 0.07, 0.45, hd + 0.07), 2), plinthM(), m);          // plinth
  ub(b, tm, m, -hw - 0.12, hw + 0.12, h - 0.52, h - 0.25, hd, hd + 0.17);                                   // cornice front
  ub(b, tm, m, -hw - 0.12, hw + 0.12, h - 0.52, h - 0.25, -hd - 0.17, -hd);                                 // cornice back
  for (const s of [-1, 1]) ub(b, tm, m, s < 0 ? -hw - 0.17 : hw, s < 0 ? -hw : hw + 0.17, h - 0.52, h - 0.25, -hd - 0.12, hd + 0.12);
  // windows: facadeHD puts nWin = floor(width / 2.2) per floor at (i + 0.5) / nWin, sill line fl * 2.8 + 0.9 m
  const wins = (len: number, door: boolean, at: (u: number) => [number, number], out: [number, number]) => {
    const n = Math.max(1, Math.floor(len / 2.2));
    for (let fl = 0; fl < floors; fl++) for (let i = 0; i < n; i++) {
      const [px, pz] = at((i + 0.5) / n), yb = fl * 2.8 + 0.9;
      if (door && fl === 0 && i === Math.floor(n / 2)) {
        const along = (k: number) => [px + out[1] * k, pz - out[0] * k] as const; // along the wall (perpendicular to out)
        const [ax, az] = along(-0.82), [bx, bz] = along(0.82), [cx2, cz2] = along(-0.78), [dx2, dz2] = along(0.78);
        ub(b, plinthM(), m, Math.min(ax, bx, ax + out[0] * 0.5), Math.max(ax, bx, ax + out[0] * 0.5), 0, 0.2, Math.min(az, bz, az + out[1] * 0.5), Math.max(az, bz, az + out[1] * 0.5)); // step
        ub(b, tm, m, Math.min(cx2, dx2, cx2 + out[0] * 0.34), Math.max(cx2, dx2, cx2 + out[0] * 0.34), 2.3, 2.44, Math.min(cz2, dz2, cz2 + out[1] * 0.34), Math.max(cz2, dz2, cz2 + out[1] * 0.34)); // hood
        continue;
      }
      for (const [y0, y1, dep, half] of [[yb - 0.2, yb - 0.08, 0.14, 0.6], [yb + 1.33, yb + 1.43, 0.08, 0.55]] as const) {
        const ax = px - out[1] * half, az = pz + out[0] * half, bx = px + out[1] * half, bz = pz - out[0] * half;
        ub(b, tm, m, Math.min(ax, bx, ax + out[0] * dep), Math.max(ax, bx, ax + out[0] * dep), y0, y1, Math.min(az, bz, az + out[1] * dep), Math.max(az, bz, az + out[1] * dep));
      }
    }
  };
  wins(w, true, (u) => [-hw + u * w, hd], [0, 1]);            // front (+z), u from -x to +x
  wins(8, false, (u) => [hw - u * w, -hd], [0, -1]);          // back: side texture (8 m layout) stretched over w
  wins(8, false, (u) => [-hw, -hd + u * d], [-1, 0]);         // left side (-x): side texture is always the 8 m layout
  wins(8, false, (u) => [hw, hd - u * d], [1, 0]);            // right side (+x)
  // chimney cap + pot
  const cz = -hd * 0.35, top = h + rh + 1.1;
  ub(b, capM(), m, chx - 0.52, chx + 0.52, top, top + 0.16, cz - 0.52, cz + 0.52);
  b.add(new THREE.CylinderGeometry(0.13, 0.16, 0.42, 10).translate(0, 0.21, 0), lam("chimPot", () => ({ color: "#b8684a" })), m.clone().multiply(new THREE.Matrix4().makeTranslation(chx, top + 0.16, cz)));
};

/** round 4: St George's cross (England, 1831): white field, red cross (the old red + yellow diamond read as Vietnam's flag) */
export const flagTex = () => ctex("flagStGeorge", 256, 160, (g) => {
  g.fillStyle = "#f4f0e6"; g.fillRect(0, 0, 256, 160);
  g.fillStyle = "#c8323a"; g.fillRect(0, 62, 256, 36); g.fillRect(110, 0, 36, 160);
  g.fillStyle = "rgba(120,100,90,0.10)"; g.fillRect(0, 150, 256, 10); // soft hem shade
});

// ---------------- 1960s sedan interior + street ----------------
// Car axes: +z = car front (windshield), +x = DRIVER side (left-hand drive), floor y = 0.
// The camera sits on the passenger side (-x), looking diagonally forward-left at the driver
// (+0.5, ~1.0, -0.15): driver left of frame, wheel centre, gauges right, door window behind him.
// The floor and the seat-cushion near edge fall outside the frame; the seat back shows behind him.
// No window glass: the openings stay open so the ink pass and DOF see the street
// directly (glass would write a solid normal plane into the ink buffer).
const chromeM = () => twoTone(new THREE.MeshPhongMaterial({ color: "#9a9da2", specular: "#e8e8e8", shininess: 80 }), 0.15);

export const buildCarInterior = (root: THREE.Object3D, kit: Kit, rays: Ray[] = []) => {
  const b = new Batch();
  sight = rays;
  const leather = (key: string, col: string) => lam(key, () => ({ map: leatherHD(col) }));
  const seatM = leather("leatherSeat", "#6b4a2f");
  const dashM = leather("dashVinyl", "#4a382c");
  const doorM = leather("doorPanel", "#5a3d28");
  const linerM = lam("headliner", () => ({ color: "#d8cbb2" }));
  const bodyM = lam("carBody", () => ({ color: "#3d5a52" }));
  const wheelM = lam("wheelWood", () => ({ color: "#4a2e1c" }));
  const steel = chromeM();
  const gaugeM = lam("gaugeFace", () => ({ color: "#f2ede0" }));
  const darkM = lam("carDark", () => ({ color: "#241c18" }));
  const floorM = lam("carFloor", () => ({ color: "#3d434e" }));
  const pipeM = leather("seatPiping", "#4a3423");
  const lampM = lam("headlamp", () => ({ color: "#f2e6b8" }));

  // ---- bench seat: cushion + backrest, one piece across the car ----
  b.add(boxGeo(V(-0.85, 0.38, -0.55), V(0.85, 0.48, 0.05)), seatM);
  b.add(boxGeo(V(-0.85, 0.48, -0.58), V(0.85, 1.0, -0.45)), seatM);
  // piping seams break up the backrest: one horizontal, two vertical (just proud of the front face)
  b.add(boxGeo(V(-0.85, 0.71, -0.45), V(0.85, 0.73, -0.435)), pipeM);
  b.add(boxGeo(V(-0.32, 0.48, -0.45), V(-0.30, 1.0, -0.435)), pipeM);
  b.add(boxGeo(V(0.30, 0.48, -0.45), V(0.32, 1.0, -0.435)), pipeM);
  // ---- floor + transmission tunnel ----
  b.add(boxGeo(V(-0.9, -0.02, -0.7), V(0.9, 0.02, 1.0)), floorM);
  b.add(boxGeo(V(-0.15, 0.02, -0.5), V(0.15, 0.18, 0.8)), darkM);
  // ---- dashboard: main box + top pad + lower panel + glovebox ----
  b.add(boxGeo(V(-0.88, 0.78, 0.72), V(0.88, 0.98, 0.98)), dashM);
  b.add(boxGeo(V(-0.88, 0.98, 0.70), V(0.88, 1.02, 1.0)), dashM);
  b.add(boxGeo(V(-0.88, 0.55, 0.85), V(0.88, 0.78, 0.95)), dashM);
  b.add(boxGeo(V(-0.65, 0.80, 0.715), V(-0.15, 0.95, 0.72)), darkM);
  // ---- gauges: 3 round dials in front of the driver + 2 small ones on the passenger side ----
  const gauge = (x: number, y: number, r: number) => {
    const face = new THREE.CylinderGeometry(r, r, 0.02, 20); face.rotateX(Math.PI / 2);
    b.add(face, gaugeM, new THREE.Matrix4().makeTranslation(x, y, 0.71));
    const ring = new THREE.TorusGeometry(r, 0.008, 8, 24);
    b.add(ring, steel, new THREE.Matrix4().makeTranslation(x, y, 0.70));
    const needle = new THREE.BoxGeometry(0.006, r * 0.8, 0.004);
    needle.rotateZ(0.7 + x);
    b.add(needle, darkM, new THREE.Matrix4().makeTranslation(x, y, 0.698));
  };
  gauge(0.68, 0.97, 0.07); gauge(0.5, 0.97, 0.07); gauge(0.32, 0.97, 0.07);
  gauge(-0.25, 0.95, 0.035); gauge(-0.40, 0.95, 0.035);
  // ---- steering wheel: thin 1960s rim, 3 spokes, chrome hub, tilted toward the driver ----
  const wheel = new THREE.TorusGeometry(0.24, 0.016, 10, 32);
  wheel.rotateX(-0.5);
  b.add(wheel, wheelM, new THREE.Matrix4().makeTranslation(0.5, 0.82, 0.60));
  for (const a of [Math.PI / 2, Math.PI * 7 / 6, Math.PI * 11 / 6]) {
    const sp = new THREE.BoxGeometry(0.24, 0.02, 0.015);
    sp.translate(0.12, 0, 0); sp.rotateZ(a); sp.rotateX(-0.5);
    b.add(sp, wheelM, new THREE.Matrix4().makeTranslation(0.5, 0.82, 0.60));
  }
  const hub = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16); hub.rotateX(Math.PI / 2);
  b.add(hub, steel, new THREE.Matrix4().makeTranslation(0.5, 0.82, 0.60));
  // steering column: dash to hub
  const colDir = V(0, 0.12, -0.17).normalize();
  const col = new THREE.CylinderGeometry(0.03, 0.03, 0.21, 10);
  col.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), colDir));
  b.add(col, darkM, new THREE.Matrix4().makeTranslation(0.5, 0.78, 0.66));
  // ---- pedals ----
  for (const x of [0.62, 0.44]) {
    const pd = new THREE.BoxGeometry(0.09, 0.02, 0.05);
    pd.rotateX(-0.5);
    b.add(pd, darkM, new THREE.Matrix4().makeTranslation(x, 0.10, 0.62));
  }
  // ---- driver's door: panel, armrest, chrome handle, window crank, window frame ----
  b.add(boxGeo(V(0.88, 0.0, -0.6), V(0.95, 0.95, 0.75)), doorM);
  b.add(boxGeo(V(0.86, 0.68, -0.05), V(0.94, 0.74, 0.35)), doorM);
  b.add(boxGeo(V(0.87, 0.80, 0.18), V(0.90, 0.83, 0.30)), steel);
  const crank = new THREE.CylinderGeometry(0.015, 0.015, 0.06, 8); crank.rotateZ(Math.PI / 2);
  b.add(crank, steel, new THREE.Matrix4().makeTranslation(0.89, 0.86, 0.45));
  b.add(boxGeo(V(0.88, 1.42, -0.6), V(0.95, 1.47, 0.75)), doorM); // window top rail
  b.add(boxGeo(V(0.88, 0.95, 0.70), V(0.95, 1.42, 0.75)), doorM); // front post
  b.add(boxGeo(V(0.88, 0.95, -0.6), V(0.95, 1.42, -0.55)), doorM); // rear post
  // ---- headliner, roof header, A-pillars ----
  b.add(boxGeo(V(-0.9, 1.47, -0.7), V(0.9, 1.5, 1.25)), linerM);
  b.add(boxGeo(V(-0.9, 1.44, 1.18), V(0.9, 1.5, 1.28)), bodyM);
  for (const x of [-0.88, 0.88]) {
    const pil = new THREE.BoxGeometry(0.045, 0.55, 0.045);
    pil.rotateX(0.47);
    b.add(pil, bodyM, new THREE.Matrix4().makeTranslation(x, 1.24, 1.10));
  }
  // ---- rear-view mirror, hanging from the header ----
  b.add(boxGeo(V(-0.08, 1.37, 0.94), V(-0.02, 1.44, 0.96)), darkM);
  b.add(boxGeo(V(-0.17, 1.29, 0.90), V(0.07, 1.37, 0.92)), steel);
  b.add(boxGeo(V(-0.16, 1.30, 0.895), V(0.06, 1.36, 0.90)), darkM);
  // ---- hood + fenders + headlights, seen through the windshield ----
  b.add(boxGeo(V(-0.85, 0.86, 1.0), V(0.85, 0.94, 2.3)), bodyM);
  b.add(boxGeo(V(-0.9, 0.82, 1.0), V(-0.72, 1.0, 2.2)), bodyM);
  b.add(boxGeo(V(0.72, 0.82, 1.0), V(0.9, 1.0, 2.2)), bodyM);
  // ---- hero-car exterior (S1 is shot from OUTSIDE the car, front-right 3/4 through the
  //  windshield, so the car needs a real outside: wheels, side body, trunk, roof, bumpers).
  //  Window openings stay open (no glass) so the street shows through the side windows.
  for (const x of [-0.6, 0.6]) b.add(boxGeo(V(x - 0.06, 0.92, 2.28), V(x + 0.06, 1.0, 2.30)), lampM);
  // passenger door (mirror of the driver's) + window frame
  b.add(boxGeo(V(-0.95, 0.0, -0.6), V(-0.88, 0.95, 0.75)), doorM);
  b.add(boxGeo(V(-0.94, 0.68, -0.05), V(-0.86, 0.74, 0.35)), doorM);
  b.add(boxGeo(V(-0.95, 1.42, -0.6), V(-0.88, 1.47, 0.75)), doorM);
  b.add(boxGeo(V(-0.95, 0.95, 0.70), V(-0.88, 1.42, 0.75)), doorM);
  b.add(boxGeo(V(-0.95, 0.95, -0.6), V(-0.88, 1.42, -0.55)), doorM);
  // side body below the doors, front wings and rear quarters
  for (const s of [-1, 1]) {
    const xa = Math.min(s * 0.88, s * 0.95), xb = Math.max(s * 0.88, s * 0.95);
    b.add(boxGeo(V(xa, 0.05, -2.2), V(xb, 0.9, -0.6)), bodyM);
    b.add(boxGeo(V(xa, 0.05, 0.75), V(xb, 0.9, 1.0)), bodyM);
  }
  // trunk + rear panel
  b.add(boxGeo(V(-0.85, 0.35, -2.3), V(0.85, 0.95, -0.7)), bodyM);
  b.add(boxGeo(V(-0.85, 0.35, -2.32), V(0.85, 0.55, -2.28)), steel);
  // roof slab over the headliner
  b.add(boxGeo(V(-0.9, 1.50, -0.7), V(0.9, 1.54, 1.28)), bodyM);
  // wheels + hubcaps, bumpers, grille
  const tyreM = lam("heroTyre", () => ({ color: "#1c1a18" }));
  for (const [sx, sz] of [[-0.82, -1.35], [0.82, -1.35], [-0.82, 1.35], [0.82, 1.35]] as const) {
    const w = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 14); w.rotateZ(Math.PI / 2);
    b.add(w, tyreM, new THREE.Matrix4().makeTranslation(sx, 0.32, sz));
    const hub = new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12); hub.rotateZ(Math.PI / 2);
    b.add(hub, steel, new THREE.Matrix4().makeTranslation(sx, 0.32, sz));
  }
  b.add(boxGeo(V(-0.85, 0.40, 2.30), V(0.85, 0.50, 2.38)), steel);
  b.add(boxGeo(V(-0.85, 0.40, -2.38), V(0.85, 0.50, -2.30)), steel);
  b.add(boxGeo(V(-0.6, 0.60, 2.28), V(0.6, 0.85, 2.31)), darkM);
  b.build(root);
  sight = [];
};

/** one simple period car, built from boxes in local coords (length along z), yawed into place */
export const buildParkedCar = (b: Batch, x: number, z: number, yaw: number, color: string) => {
  const M = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z);
  const bodyM = lam("parked" + color, () => ({ color }));
  const glassM = lam("parkedGlass", () => ({ color: "#2a3542" }));
  const tyreM = lam("parkedTyre", () => ({ color: "#1c1a18" }));
  const steel = chromeM();
  b.add(boxGeo(V(-0.85, 0.35, -2.1), V(0.85, 0.85, 2.1)), bodyM, M);
  b.add(boxGeo(V(-0.75, 0.85, -1.2), V(0.75, 1.30, 0.8)), bodyM, M);
  b.add(boxGeo(V(-0.76, 0.92, -1.15), V(0.76, 1.24, 0.75)), glassM, M);
  for (const [sx, sz] of [[-0.8, -1.3], [0.8, -1.3], [-0.8, 1.3], [0.8, 1.3]] as const) {
    const w = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 14); w.rotateZ(Math.PI / 2);
    b.add(w, tyreM, new THREE.Matrix4().multiplyMatrices(M, new THREE.Matrix4().makeTranslation(sx, 0.32, sz)));
  }
  for (const sz of [-2.1, 2.1]) b.add(boxGeo(V(-0.85, 0.42, sz - 0.07), V(0.85, 0.50, sz + 0.07)), steel, M);
};

/** the street the car is parked on: road along z, sidewalks, verges, houses across the
 *  street on both sides, trees, two parked period cars, a streetlamp. */
export const buildStreet = (root: THREE.Object3D, kit: Kit, rays: Ray[] = []) => {
  const b = new Batch(), r = rng(23);
  sight = rays;
  const asphaltM = lam("asphalt", () => ({ color: "#74747e" }));
  const walkM = lam("sidewalk", () => ({ color: "#9a938a" }));
  const grassM = lam("streetGrass", () => ({ map: grassHD() }));
  // dark ground under everything: without it the verge strips end in void and read as a glowing line on the horizon
  b.add(boxGeo(V(-60, -0.06, -60), V(60, -0.04, 60)), lam("streetGround", () => ({ color: "#2a3a22" })));
  b.add(boxGeo(V(-4, -0.04, -40), V(4, 0.0, 40)), asphaltM);
  for (const s of [-1, 1]) {
    b.add(boxGeo(V(s * 4, 0.0, -40), V(s * 5.5, 0.08, 40)), walkM);
    b.add(boxGeo(V(s * 5.5, 0.0, -40), V(s * 9, 0.06, 40)), grassM);
  }
  // houses across the street, fronts facing the car (yaw +-PI/2)
  house(b, -18, 2, Math.PI / 2, 5, 8, 4, 1);
  house(b, -18, 10, Math.PI / 2, 6, 8, 4.5, 3);
  house(b, -18, -6, Math.PI / 2, 5, 8, 4, 5);
  house(b, 18, 4, -Math.PI / 2, 5, 8, 4, 2);
  house(b, 18, 12, -Math.PI / 2, 6, 8, 4.5, 6);
  // trees along both sidewalks
  const trees = ["tree_oak", "tree_default", "tree_detailed", "tree_fat"];
  for (let z = -8; z <= 12; z += 4) {
    prop(b, kit, trees[Math.floor(r() * trees.length) % trees.length], -9.0, 0, z, 3.0 + r() * 0.6, r() * 6);
    prop(b, kit, trees[Math.floor(r() * trees.length) % trees.length], 9.0, 0, z + 2, 3.0 + r() * 0.6, r() * 6);
  }
  for (const [x, z] of [[-8, 3], [-8, -3], [8, -7]] as const)
    prop(b, kit, "plant_bushLarge", x, 0, z, 1.0);
  prop(b, kit, "lantern", -8, 0, 8, 2.8);
  buildParkedCar(b, -1.7, 11, 0, "#5a6a7a");
  buildParkedCar(b, 1.7, -9, Math.PI, "#8a4a3a");
  b.build(root);
  sight = [];
};

// ---------------- unlit helper (lamp shades, flames, window sky) ----------------
const basic = (root: THREE.Object3D, geo: THREE.BufferGeometry, color: string, x: number, y: number, z: number, ry = 0) => {
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
  m.position.set(x, y, z); m.rotation.y = ry;
  root.add(m);
  return m;
};

// ---------------- lovers' lane car (open cabin: no glass, no cabin box — the couple reads through it) ----------------
export const buildLaneCar = (b: Batch, x: number, z: number, yaw: number, color: string) => {
  const M = new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z);
  const bodyM = lam("lane" + color, () => ({ color }));
  const seatM = lam("laneSeat", () => ({ color: "#4a3423" }));
  const tyreM = lam("laneTyre", () => ({ color: "#1c1a18" }));
  const steel = chromeM();
  b.add(boxGeo(V(-0.85, 0.35, -2.1), V(0.85, 0.85, 2.1)), bodyM, M);
  b.add(boxGeo(V(-0.78, 1.28, -1.2), V(0.78, 1.33, 0.8)), bodyM, M); // roof slab on pillars
  for (const [px, pz] of [[-0.72, -1.15], [0.72, -1.15], [-0.72, 0.75], [0.72, 0.75]] as const)
    b.add(boxGeo(V(px - 0.03, 0.85, pz - 0.03), V(px + 0.03, 1.28, pz + 0.03)), bodyM, M);
  b.add(boxGeo(V(-0.7, 0.40, -0.5), V(0.7, 0.50, 0.15)), seatM, M); // bench seat
  b.add(boxGeo(V(-0.85, 0.78, 0.7), V(0.85, 0.95, 0.9)), bodyM, M); // dash
  for (const [sx, sz] of [[-0.8, -1.3], [0.8, -1.3], [-0.8, 1.3], [0.8, 1.3]] as const) {
    const w = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 14); w.rotateZ(Math.PI / 2);
    b.add(w, tyreM, new THREE.Matrix4().multiplyMatrices(M, new THREE.Matrix4().makeTranslation(sx, 0.32, sz)));
  }
  for (const sz of [-2.1, 2.1]) b.add(boxGeo(V(-0.85, 0.42, sz - 0.07), V(0.85, 0.50, sz + 0.07)), steel, M);
};

/** lovers' lane: a secluded grass verge west of the road, one parked car, trees all round */
export const buildLane = (root: THREE.Object3D, kit: Kit, rays: Ray[] = []) => {
  const b = new Batch(), r = rng(41);
  sight = rays;
  b.add(boxGeo(V(-14, -0.01, -24), V(-2, 0.03, -4)), lam("laneGrass", () => ({ map: grassHD() })));
  buildLaneCar(b, -8, -14, 0.12, "#3d4a3a");
  prop(b, kit, "tree_oak", -12, 0, -19, 4.5, r() * 6);
  prop(b, kit, "tree_default", -5.5, 0, -20, 4.0, r() * 6);
  prop(b, kit, "tree_fat", -13, 0, -9, 3.8, r() * 6);
  prop(b, kit, "tree_detailed", -4.5, 0, -9.5, 3.2, r() * 6);
  prop(b, kit, "plant_bushLarge", -11, 0, -12, 1.0);
  prop(b, kit, "plant_bushLarge", -5, 0, -17, 1.0);
  b.build(root);
  sight = [];
};

/** wall calendar strip: four pages, 1969 -> 1985 -> 2001 -> 2020, each with a coloured
 *  header band, a big dark year and a day grid (diegetic year numbers, not captions) */
const calStripTex = () => ctex("calStrip", 1024, 512, (g) => {
  const years = ["1969", "1985", "2001", "2020"];
  const bands = ["#b8553a", "#3f6fb5", "#2f6a43", "#8c3b4a"];
  g.fillStyle = "#efe8d0"; g.fillRect(0, 0, 1024, 512);
  years.forEach((yr, i) => {
    const x0 = 16 + i * 252;
    g.fillStyle = "#f6f1de"; g.fillRect(x0, 16, 228, 480);
    g.strokeStyle = "#3a3230"; g.lineWidth = 4; g.strokeRect(x0, 16, 228, 480);
    g.fillStyle = bands[i]; g.fillRect(x0, 16, 228, 66);
    g.fillStyle = "#241c18"; g.font = "bold 52px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText(yr, x0 + 114, 50);
    g.strokeStyle = "#b8a888"; g.lineWidth = 2;
    for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) g.strokeRect(x0 + 14 + c * 29, 104 + r * 62, 25, 52);
    g.fillStyle = "#8a2a20";
    for (const [r, c] of [[1, 2], [2, 5], [3, 1]] as const) g.fillRect(x0 + 18 + c * 29, 108 + r * 62, 17, 44);
  });
});

// ---------------- interiors ----------------
/** one room shell centred at (ox, 0, 0): 8 x 6 m, 4.2 m high (taller than the 3 m template:
 *  interior cameras look up enough to see over 3 m walls into the sky), window in the west wall
 *  (in frame), solid east wall behind the camera, floor + ceiling so no sky leaks in. */
const roomShell = (b: Batch, ox: number, winZ0: number, winZ1: number, winCol: string) => {
  const H = 4.2;
  const plaster = lam("roomPlaster" + ox, () => ({ color: "#c9b896" }));
  const floorM = lam("roomFloor" + ox, () => ({ color: "#7a5a3c" }));
  const ceilM = lam("roomCeil" + ox, () => ({ color: "#d8cbb2" }));
  const paneM = lam("roomPane" + ox, () => ({ color: winCol }));
  b.add(boxGeo(V(ox - 4, -0.02, -3), V(ox + 4, 0.03, 3)), floorM);
  b.add(boxGeo(V(ox - 4, H, -3), V(ox + 4, H + 0.12, 3)), ceilM);
  b.add(boxGeo(V(ox + 4, 0, -3), V(ox + 4.15, H, 3)), plaster); // east, behind camera
  b.add(boxGeo(V(ox - 4, 0, -3), V(ox + 4, H, -2.85)), plaster); // north
  b.add(boxGeo(V(ox - 4, 0, 2.85), V(ox + 4, H, 3)), plaster); // south
  // west wall around the window opening (y 0.9..2.1, z winZ0..winZ1)
  b.add(boxGeo(V(ox - 4.15, 0, -3), V(ox - 4, 0.9, 3)), plaster);
  b.add(boxGeo(V(ox - 4.15, 2.1, -3), V(ox - 4, H, 3)), plaster);
  b.add(boxGeo(V(ox - 4.15, 0.9, -3), V(ox - 4, 2.1, winZ0)), plaster);
  b.add(boxGeo(V(ox - 4.15, 0.9, winZ1), V(ox - 4, 2.1, 3)), plaster);
  b.add(boxGeo(V(ox - 4.2, 0.9, winZ0), V(ox - 4.16, 2.1, winZ1)), paneM); // window pane
  b.add(boxGeo(V(ox - 4.18, 1.48, winZ0), V(ox - 4.14, 1.52, winZ1)), plaster); // cross bar
  b.add(boxGeo(V(ox - 4.18, 0.9, (winZ0 + winZ1) / 2 - 0.02), V(ox - 4.14, 2.1, (winZ0 + winZ1) / 2 + 0.02)), plaster);
};

/** desk 1.6 x 0.8 m, top at 0.78 m, long axis along x */
const desk = (b: Batch, x: number, z: number) => {
  const wood = lam("deskWood", () => ({ color: "#5a3d28" }));
  const woodD = lam("deskWoodD", () => ({ color: "#4a3120" }));
  b.add(boxGeo(V(x - 0.8, 0.73, z - 0.4), V(x + 0.8, 0.78, z + 0.4)), wood);
  b.add(boxGeo(V(x - 0.8, 0.05, z - 0.4), V(x - 0.72, 0.73, z + 0.4)), woodD);
  b.add(boxGeo(V(x + 0.72, 0.05, z - 0.4), V(x + 0.8, 0.73, z + 0.4)), woodD);
  b.add(boxGeo(V(x + 0.1, 0.45, z + 0.34), V(x + 0.7, 0.72, z + 0.4)), woodD); // drawer front
};

/** desk lamp: dark base + stem, warm unlit shade + bulb (reads as lit under the warm preset) */
const deskLamp = (root: THREE.Object3D, x: number, z: number) => {
  const dark = new THREE.MeshLambertMaterial({ color: "#241c18" });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.04, 12), dark);
  base.position.set(x, 0.80, z); root.add(base);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 8), dark);
  stem.position.set(x, 0.98, z); root.add(stem);
  basic(root, new THREE.CylinderGeometry(0.08, 0.15, 0.18, 12, 1, true), "#ffca7a", x, 1.18, z);
  basic(root, new THREE.SphereGeometry(0.045, 10, 8), "#fff2c0", x, 1.12, z);
};

/** newspaper office (S4b + S5): desk, typewriter, envelopes, lamp, rug, chair */
export const buildOffice = (root: THREE.Object3D, kit: Kit, rays: Ray[] = []) => {
  const b = new Batch();
  sight = rays;
  roomShell(b, 30, 0.2, 1.4, "#101c3a");
  desk(b, 30, 0);
  const paperM = lam("officePaper", () => ({ color: "#f2ede0" }));
  const darkM = lam("officeDark", () => ({ color: "#241c18" }));
  // typewriter: base + roller + paper sheet tilted up + keys
  b.add(boxGeo(V(29.5, 0.78, -0.05), V(29.88, 0.88, 0.25)), darkM);
  b.add(boxGeo(V(29.56, 0.88, 0.2), V(29.82, 0.90, 0.24)), paperM);
  const sheet = new THREE.BoxGeometry(0.22, 0.3, 0.005); sheet.rotateX(-0.35);
  b.add(sheet, paperM, new THREE.Matrix4().makeTranslation(29.69, 1.0, 0.22));
  b.add(boxGeo(V(29.54, 0.78, 0.26), V(29.84, 0.82, 0.38)), darkM);
  // envelopes: two flat, one leaning on the typewriter
  b.add(boxGeo(V(30.3, 0.78, -0.28), V(30.54, 0.79, -0.16)), paperM);
  b.add(boxGeo(V(30.32, 0.79, -0.26), V(30.56, 0.80, -0.14)), paperM);
  const env = new THREE.BoxGeometry(0.24, 0.01, 0.13); env.rotateX(-0.5);
  b.add(env, paperM, new THREE.Matrix4().makeTranslation(30.15, 0.86, 0.28));
  // paper stacks on the desk (clear of the S5 letter, which covers x 29.75..30.25, z -0.19..0.49)
  b.add(boxGeo(V(30.5, 0.78, 0.14), V(30.75, 0.84, 0.38)), paperM);
  b.add(boxGeo(V(30.52, 0.84, 0.16), V(30.73, 0.87, 0.36)), paperM);
  b.add(boxGeo(V(29.3, 0.78, -0.32), V(29.55, 0.83, -0.08)), paperM);
  // a newspaper, flat on the front-left corner, header band along its top edge
  b.add(boxGeo(V(29.28, 0.785, 0.16), V(29.62, 0.795, 0.40)), paperM);
  b.add(boxGeo(V(29.28, 0.796, 0.16), V(29.62, 0.80, 0.22)), darkM);
  // a coffee cup on the desk
  b.add(boxGeo(V(30.66, 0.78, 0.01), V(30.74, 0.87, 0.09)), darkM);
  // bulletin board with pinned notices on the north wall (across the room from the camera)
  const corkM = lam("officeCork", () => ({ color: "#8a6a42" }));
  b.add(boxGeo(V(27.2, 1.5, -2.84), V(28.6, 2.3, -2.78)), corkM);
  for (const [px, py] of [[27.45, 1.95], [27.95, 2.05], [28.3, 1.8], [27.7, 1.65]] as const)
    b.add(boxGeo(V(px - 0.11, py - 0.14, -2.78), V(px + 0.11, py + 0.14, -2.76)), paperM);
  // wall notices on the west wall, left of the window
  for (const [pz, y0, y1] of [[-1.9, 1.6, 2.0], [-1.45, 1.8, 2.2], [-0.95, 1.55, 1.95]] as const)
    b.add(boxGeo(V(26.0, y0, pz), V(26.03, y1, pz + 0.3)), paperM);
  // filing cabinet against the north wall (far right corner) + coat rack (far left corner)
  const cabM = lam("officeCab", () => ({ color: "#4a5a52" }));
  b.add(boxGeo(V(32.9, 0, -2.7), V(33.5, 1.4, -2.2)), cabM);
  b.add(boxGeo(V(33.0, 0.6, -2.21), V(33.4, 0.63, -2.19)), darkM);
  b.add(boxGeo(V(33.0, 1.0, -2.21), V(33.4, 1.03, -2.19)), darkM);
  b.add(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8).translate(0, 0.9, 0), darkM, new THREE.Matrix4().makeTranslation(26.8, 0, -2.5));
  b.add(boxGeo(V(26.6, 1.7, -2.56), V(27.0, 1.73, -2.44)), darkM);
  // wastebasket with crumpled paper, beside the desk
  b.add(new THREE.CylinderGeometry(0.14, 0.11, 0.3, 10).translate(0, 0.15, 0), darkM, new THREE.Matrix4().makeTranslation(31.6, 0, -0.9));
  b.add(new THREE.SphereGeometry(0.08, 8, 6), paperM, new THREE.Matrix4().makeTranslation(31.6, 0.32, -0.9));
  // chair on the camera side of the desk + rug
  b.add(boxGeo(V(30.9, 0.42, 0.35), V(31.35, 0.47, 0.8)), darkM);
  b.add(boxGeo(V(31.28, 0.47, 0.35), V(31.35, 1.0, 0.8)), darkM);
  b.add(boxGeo(V(29.0, 0.03, -0.3), V(31.4, 0.05, 1.3)), lam("officeRug", () => ({ color: "#7a3a3a" })));
  b.build(root);
  deskLamp(root, 30.6, -0.28);
  sight = [];
};

/** police station (S6 + S7): desk, detective's chair, papers, filing cabinet, clock, calendar wall */
export const buildPolice = (root: THREE.Object3D, kit: Kit, rays: Ray[] = []) => {
  const b = new Batch();
  sight = rays;
  roomShell(b, -30, 1.2, 2.6, "#b8d0ec");
  desk(b, -30, 0.3);
  const paperM = lam("policePaper", () => ({ color: "#f2ede0" }));
  const darkM = lam("policeDark", () => ({ color: "#241c18" }));
  const cabM = lam("policeCab", () => ({ color: "#4a5a52" }));
  // papers scattered on the desk
  const papers: [number, number, number][] = [[-30.4, 0.1, 0.05], [-30.1, -0.1, -0.15], [-29.7, 0.2, 0.1], [-30.5, -0.15, 0.2], [-29.9, 0.05, -0.2]];
  papers.forEach(([px, pz, ry], i) => {
    const g = new THREE.BoxGeometry(0.22, 0.008, 0.3); g.rotateY(ry);
    b.add(g, paperM, new THREE.Matrix4().makeTranslation(px, 0.785 + i * 0.004, 0.3 + pz));
  });
  // detective's chair behind the desk (west side), filing cabinet, wall clock
  b.add(boxGeo(V(-30.25, 0.42, -1.15), V(-29.75, 0.47, -0.65)), darkM);
  b.add(boxGeo(V(-30.25, 0.47, -1.15), V(-30.18, 1.0, -0.65)), darkM);
  b.add(boxGeo(V(-33.6, 0, 2.2), V(-33.0, 1.4, 2.7)), cabM);
  const clock = new THREE.CylinderGeometry(0.22, 0.22, 0.05, 20); clock.rotateX(Math.PI / 2);
  b.add(clock, paperM, new THREE.Matrix4().makeTranslation(-31.5, 2.2, -2.82));
  // the wall calendar: one big strip on the west wall, four pages showing the years passing
  // 1969 -> 1985 -> 2001 -> 2020 (the "51 years to crack" beat). Canvas texture, 2.4 x 1.2 m.
  b.add(quad(V(-33.88, 0.9, 0.2), V(-33.88, 0.9, -2.2), V(-33.88, 2.1, -2.2), V(-33.88, 2.1, 0.2)),
    lam("calStrip", () => ({ map: calStripTex() })));
  // case board on the north wall: cork board, pinned papers, red string between them
  const boardM = lam("caseBoard", () => ({ color: "#6a4a30" }));
  const stringM = lam("caseString", () => ({ color: "#a52a2a" }));
  b.add(boxGeo(V(-30.6, 1.25, -2.84), V(-28.4, 2.25, -2.78)), boardM);
  for (const [px, py] of [[-30.3, 1.95], [-29.7, 2.1], [-29.0, 1.8], [-28.6, 2.05], [-30.0, 1.5], [-29.3, 1.4]] as const)
    b.add(boxGeo(V(px - 0.11, py - 0.14, -2.78), V(px + 0.11, py + 0.14, -2.76)), paperM);
  const strut = (x0: number, y0: number, x1: number, y1: number) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const g = new THREE.BoxGeometry(len, 0.012, 0.012);
    g.rotateZ(Math.atan2(y1 - y0, x1 - x0));
    b.add(g, stringM, new THREE.Matrix4().makeTranslation((x0 + x1) / 2, (y0 + y1) / 2, -2.755));
  };
  strut(-30.3, 1.95, -29.0, 1.8); strut(-29.7, 2.1, -28.6, 2.05); strut(-30.0, 1.5, -29.3, 1.4); strut(-29.7, 2.1, -30.0, 1.5);
  // window blinds: thin slats across the window
  for (let i = 0; i < 4; i++) b.add(boxGeo(V(-34.16, 1.05 + i * 0.25, 1.2), V(-34.1, 1.09 + i * 0.25, 2.6)), paperM);
  b.build(root);
  deskLamp(root, -30.6, 0.55);
  sight = [];
};

/** five candles on a table in the dark (S8): own black ground plane; the candles themselves
 *  are candleFlame Fx cards in cast.ts (teardrop flame + glow), so no 3D wax here */
export const buildCandles = (root: THREE.Object3D, kit: Kit, rays: Ray[] = []) => {
  const b = new Batch();
  sight = rays;
  b.add(boxGeo(V(-40, -0.02, -10), V(40, 0.0, 60)), lam("candleGround", () => ({ color: "#0a0a0e" })));
  const wood = lam("candleWood", () => ({ color: "#3a2a1c" }));
  b.add(boxGeo(V(-0.9, 0.72, 21.55), V(0.9, 0.78, 22.45)), wood);
  for (const [lx, lz] of [[-0.8, 21.65], [0.8, 21.65], [-0.8, 22.35], [0.8, 22.35]] as const)
    b.add(boxGeo(V(lx - 0.04, 0, lz - 0.04), V(lx + 0.04, 0.72, lz + 0.04)), wood);
  b.build(root);
  sight = [];
};
