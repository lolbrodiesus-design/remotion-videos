// The whole place as one three.js scene: sky, sun, clouds, Commercial Street
// (cobbles, brick tenements, lamp posts, horse cart, the colossal riveted tank),
// the advancing molasses wave (a dynamic curtain mesh, rebuilt every frame from
// story.ts waveZ/waveH), and the flooded aftermath with the big speedometer.
// update(id, f, camera) poses everything for shot `id` at frame f (pure function of id + f).
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { staticFile } from "remotion";
import { V, buildMolassesStreet, buildWaveSet, buildAftermath, Kit, Ray } from "./build";
import { ctex, cloudHD, molassesHD } from "./paint";
import { LIGHTS, LOOK, LightPreset, LightName } from "./lights";
import { TONE, CHAR, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { FPS, SHOTS, camAt, ShotDef, waveZ, waveH } from "./story";

// ---------------- assets ----------------
const KENNEY = ["tree_oak", "tree_default", "tree_detailed", "tree_fat", "tree_cone", "plant_bushLarge", "plant_bushDetailed",
  "plant_bush", "hedge", "lantern", "cart"];
let kitP: Promise<Kit> | null = null;
export const loadKit = () => {
  if (!kitP) {
    const loader = new GLTFLoader();
    kitP = Promise.all(KENNEY.map((n) => loader.loadAsync(staticFile(`bridge/kenney/${n}.glb`)).then((g) => [n, g.scene] as const).catch(() => [n, null] as const)))
      .then((list) => Object.fromEntries(list.filter((e) => e[1]).map(([n, s]) => [n, s!])) as Kit);
  }
  return kitP;
};

/** sun disc (solid, soft rim) and the flat golden halo (lighting.md 6 / depth.md 6.4: r50 13-26 % of the frame width) */
const discTex = () => ctex("sunDisc", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});
const haloTex = () => ctex("sunHalo", 256, 256, (g) => {
  const im = g.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const u = Math.hypot(x - 127.5, y - 127.5) / 128;
    const a = (0.55 * Math.exp(-((u / 0.25) ** 2)) + 0.35 * Math.exp(-((u / 0.6) ** 2))) * (1 - Math.min(1, Math.max(0, (u - 0.8) / 0.2)));
    const i = (y * 256 + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = 255; im.data[i + 3] = Math.round(255 * Math.min(1, a));
  }
  g.putImageData(im, 0, 0);
});

/** every lens position of the film looking at its subject: centre, sides and top of frame.
 *  VERTICAL 1080x1920 frame: the horizontal half-angle is ty * 9/16 (the zodiac's 16/9 was for 16:9). */
const sightLines = (): Ray[] => {
  const out: Ray[] = [];
  for (const s of SHOTS) for (let f = s.a - 8; f < s.b + 8; f += 2) {
    const c = camAt(s.id, Math.max(0, f)), o = V(...c.pos), look = V(...c.look);
    const fw = look.clone().sub(o), len = fw.length();
    fw.normalize();
    const rt = fw.clone().cross(V(0, 1, 0)).normalize(), up = rt.clone().cross(fw);
    const ty = Math.tan((c.fov * Math.PI) / 360), tx = ty * (9 / 16);
    for (const [sx, sy] of [[0, 0], [-0.6, 0], [0.6, 0], [0, 0.6], [0, -0.4]])
      out.push({ o, d: fw.clone().addScaledVector(rt, sx * tx).addScaledVector(up, sy * ty), len, core: sx === 0 && sy === 0 });
  }
  return out;
};

// ---------------- the wave: a vertical curtain across the street, rebuilt per frame ----------------
const WAVE_NX = 25, WAVE_NY = 13, WAVE_HALF_W = 6.5;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const wsmooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight; private fill: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private streetG = new THREE.Group(); private waveG = new THREE.Group(); private payoffG = new THREE.Group();
  private waveMesh: THREE.Mesh; private waveGeo: THREE.BufferGeometry;
  private surge: THREE.Mesh; private roll: THREE.Group;
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<LightName, THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(kit: Kit) {
    const R = this.root;
    // ---- sky + light ----
    // sky: 5 colour stops by elevation (textures.md 5.2 #5 + depth.md 2/6.5), written as tone-map-inverted linear values
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: discTex(), color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, depthTest: true,
      transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(4096, 4096);
    this.fill = new THREE.DirectionalLight("#9fb8ff", 0.35);
    R.add(this.hemi, this.sun, this.sun.target, this.fill, this.fill.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 130 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 120 + (i % 4) * 38, Math.sin(a) * d); m.scale.set(w, w / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }
    // three more clouds low over the far end of the street, so the tank shot's sky is dressed
    for (const [cx, cy, cz, cw] of [[-220, 150, -600, 180], [60, 185, -630, 210], [260, 140, -580, 160]] as const) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[1], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      m.position.set(cx, cy, cz); m.scale.set(cw, cw / 2, 1);
      m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- the sets, one group per place, toggled per shot in update() ----
    const rays = sightLines();
    buildMolassesStreet(this.streetG, kit, rays);
    buildWaveSet(this.waveG, kit, rays);
    buildAftermath(this.payoffG, kit, rays);
    R.add(this.streetG, this.waveG, this.payoffG);

    // ---- the wave curtain (dynamic) + the surge plane at its foot ----
    // Plain Lambert, NOT the two-tone lam(): the curtain faces the lens while the day sun
    // sits behind it, so the two-tone shade turned the whole face dark blue-brown. With
    // the shot-2 sun moved behind the lens (story.ts sunAz 150) + plain lighting + the
    // brighter molasses texture, the face reads as warm glossy liquid.
    const waveMat = new THREE.MeshLambertMaterial({ map: molassesHD(), side: THREE.DoubleSide });
    this.waveGeo = new THREE.BufferGeometry();
    const nv = WAVE_NX * WAVE_NY;
    this.waveGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
    this.waveGeo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
    const uv = new Float32Array(nv * 2);
    for (let j = 0; j < WAVE_NY; j++) for (let i = 0; i < WAVE_NX; i++) { uv[(j * WAVE_NX + i) * 2] = i / (WAVE_NX - 1); uv[(j * WAVE_NX + i) * 2 + 1] = j / (WAVE_NY - 1); }
    this.waveGeo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    const idx: number[] = [];
    for (let j = 0; j < WAVE_NY - 1; j++) for (let i = 0; i < WAVE_NX - 1; i++) {
      const a = j * WAVE_NX + i, b = a + 1, c = a + WAVE_NX, d = c + 1;
      idx.push(a, c, d, a, d, b);
    }
    this.waveGeo.setIndex(idx);
    this.waveMesh = new THREE.Mesh(this.waveGeo, waveMat);
    this.waveMesh.castShadow = true; this.waveMesh.receiveShadow = true; this.waveMesh.frustumCulled = false;
    this.waveG.add(this.waveMesh);
    const surgeGeo = new THREE.PlaneGeometry(1, 1); surgeGeo.rotateX(-Math.PI / 2);
    this.surge = new THREE.Mesh(surgeGeo, new THREE.MeshLambertMaterial({ map: molassesHD() }));
    this.surge.receiveShadow = true; this.surge.frustumCulled = false;
    this.waveG.add(this.surge);
    // the crest: a bumpy roll of overlapping glossy spheres along the top of the curtain —
    // a foamy rolled-over lip. (A single cylinder read as a flat wooden beam.)
    this.roll = new THREE.Group();
    const jr = (i: number) => Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    for (let i = 0; i < 13; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.85 + jr(i) * 0.3, 18, 14), waveMat);
      s.castShadow = true; s.receiveShadow = false; s.frustumCulled = false;
      s.position.set(-6 + i, jr(i + 40) * 0.5 - 0.1, jr(i + 80) * 0.8 - 0.2);
      this.roll.add(s);
    }
    this.waveG.add(this.roll);
  }

  /** camera-relative sun, frozen per shot: the shot's mean view direction turned by az toward screen right, lifted by el */
  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const ss = s as ShotDef & { sunAz?: number; sunEl?: number };
    const az = THREE.MathUtils.degToRad(ss.sunAz ?? L.az), el = THREE.MathUtils.degToRad(ss.sunEl ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az); // screen right = (-fz, fx)
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  /** rebuild the wave curtain for frame f: front z + height from story.ts, crest curling
   *  toward the camera, top edge drooping forward into the crest roll, wavy top edge,
   *  slight sideways undulation. */
  private poseWave(f: number) {
    const zf = waveZ(f), H = waveH(f);
    const pos = this.waveGeo.attributes.position.array as Float32Array;
    for (let j = 0; j < WAVE_NY; j++) {
      const v = j / (WAVE_NY - 1);
      const curl = 2.2 * wsmooth((v - 0.55) / 0.45); // top 45% curls forward over the street
      const droop = 0.9 * wsmooth((v - 0.85) / 0.15); // the very top folds forward and DOWN into the crest
      for (let i = 0; i < WAVE_NX; i++) {
        const u = i / (WAVE_NX - 1), x = (u * 2 - 1) * WAVE_HALF_W;
        const topWobble = 1 + 0.05 * Math.sin(x * 0.8 + 1.2); // wavy crest line
        const y = v * H * topWobble - droop;
        const z = zf + curl + droop * 0.6 + 0.3 * Math.sin(x * 0.7 + 0.6) * v;
        const o = (j * WAVE_NX + i) * 3;
        pos[o] = x; pos[o + 1] = y; pos[o + 2] = z;
      }
    }
    this.waveGeo.attributes.position.needsUpdate = true;
    this.waveGeo.computeVertexNormals();
    this.roll.position.set(0, H - 0.2, zf + 2.5);
    // the surge: glossy molasses already on the ground from the wave's foot to past the lens
    const len = 16 - zf;
    this.surge.position.set(0, 0.06, (zf + 16) / 2);
    this.surge.scale.set(13, 1, len);
  }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS.find((x) => x.id === id) ?? SHOTS[0], L = LIGHTS[s.light];
    // ---- which set is on screen ----
    this.streetG.visible = true; // the street + tank are the one place for all three shots
    this.waveG.visible = id === 2;
    this.payoffG.visible = id === 3;
    if (id === 2) this.poseWave(f);
    // ---- camera ----
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.2; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK); // sky, clouds and sun sprites live on the no-ink layer but are still rendered
    // ---- light rig (lighting.md 9.4): camera-relative sun frozen per shot, two-tone uniforms, shadow fit ----
    const K = LOOK[s.light], sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 7, 12, 95);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    this.fill.intensity = 0; // not used by the two-tone shading
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...LOOK[s.light].bounce); TONE.uSat.value = LOOK[s.light].sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog (colour = horizon colour, linear fogNear -> fogFar), sun disc + halo, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    const showSun = s.light === "golden";
    this.sunDisc.visible = this.sunHalo.visible = showSun;
    if (showSun) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7)));
      this.sunHalo.position.copy(this.sunDisc.position); this.sunHalo.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(24)));
      (this.sunHalo.material as THREE.SpriteMaterial).color.set(L.sunDisc).multiplyScalar(1.3);
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[s.light][i % 4];
    }
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, t, { pos: cam.position, right });
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const tint = s.light === "golden" ? "#ffcf9e" : "#ffffff";
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      if (a.mat.emissiveMap) a.mat.emissive.set(tint); // legacy emissive card until the CHAR agent's cardShade lands
      a.mesh.castShadow = L.actorShadow; // day: soft contact blobs instead (CHAR agent)
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e = this.fx(fi++);
      e.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e.use(!!p.soft);
      e.mesh.visible = true;
      e.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e.mesh.quaternion.copy(cam.quaternion); e.mesh.rotateZ(p.rot ?? 0); }
      e.mesh.scale.set(p.w, p.h, 1);
      fused.push(e);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e of fused) e.bind();
    return focus;
  }
}
