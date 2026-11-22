// scenes/shots/est3d.js — 3D establishing shots (Three.js) for tiktok-mysteries-12min.
// Picks shots whose notes say '3D establishing' from E.shots and builds one
// small 3D stage per shot: satellite dive (Google Earth), Iowa house orbit,
// Alki Beach orbit, van dolly. init() builds once; draw() moves the camera.
import { E, V, registerShot, mood, ease, clamp, lerp } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { TEEN, GABBY } from '../cast.js';

function variantOf(shot) {
  const sc = shot.scene || '';
  if (/google earth|satellite|orbit into/i.test(sc)) return 'earth';
  if (/iowa house/i.test(sc)) return 'house';
  if (/alki beach/i.test(sc)) return 'beach';
  if (/white van/i.test(sc)) return 'van';
  return 'house';
}

function desertTex(T) {
  return T.canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#d8a878'; g.fillRect(0, 0, w, h);
    const r = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(150,100,60,${0.08 + r() * 0.15})`; g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 60, 12 + r() * 30, r() * 3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(90,60,40,.6)'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(0, h * 0.7); g.bezierCurveTo(w * 0.3, h * 0.6, w * 0.6, h * 0.8, w, h * 0.65); g.stroke();
    for (let i = 0; i < 12; i++) { g.fillStyle = '#ffffff'; g.fillRect(w * 0.42 + (i % 6) * 12, h * 0.42 + Math.floor(i / 6) * 10, 7, 12); }
  });
}

const BUILDERS = {
  earth(T, info) {
    const st = T.stage({ mood: 'dusk', fov: 40, fog: false, keyIntensity: 1.8, ambient: 0.8 });
    st.add(T.ground(140, 140, '#d8a878', desertTex(T)));
    st.add(T.box(10, 1.2, 4, '#6a4a38', -20, 0.6, -14));
    st.add(T.box(6, 2.2, 5, '#5a3a30', 24, 1.1, 10));
    return { stage: st, dur: info.dur };
  },
  house(T, info) {
    const M = mood('dusk');
    const st = T.stage({ mood: 'dusk', fov: 38, fog: [16, 60], keyPos: [-8, 9, 6] });
    st.add(T.ground(70, 70, M.grass));
    const house = T.building(7, 4.2, 5.5, { color: '#3a2c3a', win: '#ffcf8a', lit: 0.4, seed: 5 });
    st.add(house);
    const win = T.windowPane(1.4, 1.6, { glowColor: '#ffd9a0', cols: 2, rows: 2, power: 1.1 });
    win.position.set(-1.5, 0.9, 2.78); st.add(win);
    st.add(T.tree3D(-9, 3, 1.3, '#1c1626'), T.tree3D(10, -2, 1.1, '#1c1626'));
    st.add(T.box(8, 0.15, 0.4, '#2a2238', 0, 0.08, 5.5));
    return { stage: st, dur: info.dur };
  },
  beach(T, info) {
    const M = mood('dusk');
    const st = T.stage({ mood: 'dusk', fov: 38, fog: [18, 70], keyPos: [8, 9, -6] });
    st.add(T.ground(90, 90, '#8a6a52'));
    const sea = T.ground(90, 40, '#3a4a7a'); sea.position.set(0, 0.05, -32); st.add(sea);
    for (let i = 0; i < 5; i++) st.add(T.box(0.5, 2.2, 0.5, '#3a2c34', 6 + i * 2.4, 1.1, -14));
    st.add(T.box(14, 0.4, 2.5, '#4a3428', 11, 2.3, -14));
    const t1 = T.figure3D(TEEN, { pose: POSES.stand }); t1.position.set(-2, 0, 4); st.add(t1);
    const t2 = T.figure3D(TEEN, { pose: POSES.stand }); t2.position.set(0.5, 0, 5); t2.rotation.y = 0.6; st.add(t2);
    st.add(T.box(0.9, 0.7, 0.5, '#14101c', 3.5, 0.35, 7));
    return { stage: st, dur: info.dur };
  },
  van(T, info) {
    const M = mood('golden');
    const st = T.stage({ mood: 'golden', fov: 36, fog: [20, 80], keyPos: [8, 10, 4] });
    st.add(T.ground(120, 120, M.grass));
    const road = T.ground(120, 7, '#4a3c40'); road.position.set(0, 0.02, 0); st.add(road);
    const van = new T.THREE.Group();
    const body = T.box(4.4, 1.7, 1.9, '#f2efe8', 0, 1.15, 0);
    const cab = T.box(1.4, 1.2, 1.8, '#f2efe8', 2.6, 0.95, 0);
    const winF = T.box(0.1, 0.7, 1.6, '#2a3a55', 3.3, 1.15, 0);
    van.add(body, cab, winF);
    for (const [wx, wz] of [[-1.5, 0.95], [1.5, 0.95], [-1.5, -0.95], [1.5, -0.95]]) {
      const w = T.cyl(0.42, 0.42, 0.3, '#14101c', wx, 0.42, wz, 12); w.rotation.x = Math.PI / 2; van.add(w);
    }
    st.add(van);
    for (let i = 0; i < 10; i++) st.add(T.pine3D(-14 + i * 3.2, i % 2 ? 9 : -9, 1.2 + (i % 3) * 0.3, '#1c2a1c'));
    return { stage: st, dur: info.dur, van };
  },
};

for (const s of E.shots) {
  if (!/3D establishing/i.test(s.notes || '')) continue;
  const variant = variantOf(s);
  registerShot(s.id, {
    kind: '3d',
    init(T, info) { return BUILDERS[variant](T, info); },
    draw(st, t, info, T) {
      const dur = info.dur;
      if (variant === 'earth') {
        T.dolly(st.stage.camera, t, [
          [0, { pos: [0, 34, 26], look: [0, 0, 0], fov: 44 }],
          [dur, { pos: [0, 5, 14], look: [0, 6, -16], fov: 38 }],
        ]);
      } else if (variant === 'house') {
        T.orbit(st.stage.camera, t, { target: [0, 1.4, 0], radius: [13, 9], height: [4.5, 2.6], from: -0.9, to: 0.4, dur });
      } else if (variant === 'beach') {
        T.orbit(st.stage.camera, t, { target: [2, 0.8, -2], radius: [15, 10], height: [5, 2.8], from: -0.7, to: 0.5, dur });
      } else {
        T.dolly(st.stage.camera, t, [
          [0, { pos: [-8, 2.2, 5], look: [2, 1, 0] }],
          [dur, { pos: [8, 2.2, 5], look: [2, 1, 0] }],
        ]);
      }
    },
  });
}
