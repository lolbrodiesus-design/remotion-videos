// shots/07_gabby_a.js — Story 7 (Gabby Petito), part A: s178a–s184a.
// 3D establishings (s178a/s178b) + road-trip opening beats.
import { E, V, registerShot, mood, S, layer, blurLayer, veil, ease, prog, key, clamp, lerp, rng, noise, shake, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, radGrad, backdrop, text, measure, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { roadside, roadsideGround, van2D } from '../sets/roadside.js';
import { GABBY, BRIAN } from '../cast.js';

const CREAM = () => '#f2ead8';

// --- shared 3D van stage (adapted from build/_old_scenes/est3d.js 'van' builder) ---
function vanStage(T, withFigure) {
  const M = mood('golden');
  const st = T.stage({ mood: 'golden', fov: 36, fog: [20, 90], keyPos: [8, 10, 4], keyIntensity: 2.6, ambient: 1.1 });
  st.add(T.ground(140, 140, M.grass));
  const road = T.ground(140, 7, '#4a3c40'); road.position.set(0, 0.02, 0); st.add(road);
  // distant mountains
  for (const [mx, mz, mr, mh] of [[-30, -34, 16, 14], [-8, -40, 20, 19], [16, -36, 15, 12], [34, -30, 13, 10]]) {
    st.add(T.cone(mr, mh, '#2a2440', mx, mh / 2 - 0.5, mz));
  }
  const van = new T.THREE.Group();
  van.add(T.box(4.4, 1.7, 1.9, '#f2efe8', 0, 1.15, 0));
  van.add(T.box(1.4, 1.2, 1.8, '#f2efe8', 2.6, 0.95, 0));
  van.add(T.box(0.1, 0.7, 1.6, '#2a3a55', 3.3, 1.15, 0));
  van.add(T.box(2.2, 0.6, 0.06, '#2a3a55', -0.6, 1.45, 0.96));
  van.add(T.box(1.4, 0.6, 0.06, '#2a3a55', 1.4, 1.45, 0.96));
  van.add(T.box(4.4, 0.14, 0.06, '#3a6ea5', 0, 0.55, 0.96));
  for (const [wx, wz] of [[-1.5, 0.95], [1.5, 0.95], [-1.5, -0.95], [1.5, -0.95]]) {
    const w = T.cyl(0.42, 0.42, 0.3, '#14101c', wx, 0.42, wz, 12); w.rotation.x = Math.PI / 2; van.add(w);
  }
  st.add(van);
  for (let i = 0; i < 10; i++) st.add(T.pine3D(-16 + i * 3.6, i % 2 ? 9 : -9, 1.2 + (i % 3) * 0.3, '#1c2a1c'));
  let gabby = null;
  if (withFigure) {
    gabby = T.figure3D(GABBY, { rim: M.rim, pose: POSES.stand });
    gabby.position.set(-4, 0, 2.4); gabby.rotation.y = Math.PI; st.add(gabby);
  }
  return { stage: st, van, gabby };
}

// s178a — 3D: white van on a mountain road, dolly alongside; Gabby's silhouette watches.
registerShot('s178a', {
  kind: '3d',
  init(T) { return vanStage(T, true); },
  draw(s, t, info, T) {
    T.dolly(s.stage.camera, t, [
      [0, { pos: [-9, 2.4, 6], look: [0, 1, 0] }],
      [info.dur, { pos: [9, 2.4, 6], look: [0, 1, 0] }],
    ]);
  },
  overlay(g, t, info) {
    FX.dust(g, t, { count: 24, color: '#ffe0b0', a: 0.3 });
    veil(g, '#0a0e2a', 0.28 * prog(t, 0, info.dur)); // sky darkens to deep navy
  },
});

// s178b — 3D: high orbit pulling back to the mountains; Gabby by the van, windows catching gold.
registerShot('s178b', {
  kind: '3d',
  init(T) {
    const st = vanStage(T, true);
    const M = mood('golden');
    const pane = T.windowPane(2.2, 0.7, { glowColor: M.practical, cols: 3, rows: 1, power: 1.2, interior: true });
    pane.position.set(-0.6, 1.45, 0.99); pane.rotation.y = 0; st.stage.add(pane);
    return st;
  },
  draw(s, t, info, T) {
    T.orbit(s.stage.camera, t, { target: [0, 1, 0], radius: [5, 12], height: [2, 6.5], from: -0.9, to: 0.45, dur: info.dur });
  },
  overlay(g, t) {
    FX.dust(g, t, { count: 20, color: '#ffe0b0', a: 0.28 });
    FX.lensStreak(g, E.W * 0.68, E.H * 0.3, E.W * 0.9, '#ffe0b0', 0.16);
  },
});

// s179 — insert: granola bar on the dark dashboard; side mirror shows the empty road behind.
registerShot('s179', { draw(g, t, info) {
  const cam = { z: 1.55 + 0.05 * ease.inOut(t / info.dur), x: 20 * ease.inOut(t / info.dur), y: 60 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.4, x: -120, y: -80 }, { mood: 'dusk' })); veil(g, '#0e0a12', 0.42);
  const M = mood('dusk');
  // dashboard slab
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, E.H * 0.62, 0, E.H, [shade(M.wall, -0.3), shade(M.dark, -0.2)]); g.fillRect(-E.W, E.H * 0.62, E.W * 3, E.H);
    FX.pool(g, E.W * 0.3, E.H * 0.78, 300, 40, M.key, 0.14);
    // granola bar, half-eaten (bite notch)
    const bx = E.W * 0.3, by = E.H * 0.74;
    rr(g, bx - 150, by - 26, 300, 52, 22); g.fillStyle = '#8a6a42'; g.fill();
    circle(g, bx + 130, by - 4, 30, shade(M.wall, -0.3));
    const r = rng(4); for (let i = 0; i < 14; i++) circle(g, bx - 130 + r() * 260, by - 16 + r() * 32, 3 + r() * 3, '#6a4a28');
    // amber beam from the glovebox
    FX.lightCone(g, E.W * 0.82, E.H * 0.95, { angle: -Math.PI / 2.4, spread: 0.5, len: 620, color: M.key, a: 0.22 });
    // side mirror, right: empty road + mountains reflected
    const mx = E.W * 0.78, my = E.H * 0.34;
    rr(g, mx - 170, my - 110, 340, 220, 26); g.fillStyle = shade(M.wall, -0.35); g.fill();
    g.save(); g.beginPath(); rr(g, mx - 156, my - 96, 312, 192, 18); g.clip();
    g.fillStyle = linGrad(g, 0, my - 96, 0, my + 96, [M.sky[0], M.sky[1]]); g.fillRect(mx - 156, my - 96, 312, 192);
    FX.hills(g, { y: my + 40, amp: 34, color: shade(M.wall, -0.2), seed: 21 });
    poly(g, [[mx - 156, my + 96], [mx - 20, my + 20], [mx + 40, my + 20], [mx + 156, my + 96]], '#4a3c40');
    g.restore();
    seg(g, [[mx - 170, my - 110], [mx + 170, my - 110]], 4, alpha('#ffffff', 0.25));
  });
  FX.dust(g, t, { count: 26, color: '#ffcf9e', a: 0.4 });
  FX.lensStreak(g, E.W * 0.82, E.H * 0.7, E.W * 0.7, '#ffcf9e', 0.14);
} });

// s180a — wide: van front grill facing a silhouetted New York skyline at dawn.
// (v4 fix: the van front is now the focal object — big grill, headlights,
// windshield, bumper — with the dawn skyline behind it, not a white box.)
registerShot('s180a', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), x: -30 * ease.inOut(t / info.dur), y: -40 * ease.inOut(t / info.dur) };
  const M = mood('golden');
  layer(g, cam, 0.15, (g) => {
    backdrop(g, M.sky);
    glow(g, E.W * 0.72, E.H * 0.42, 380, M.key, 0.55);
    FX.clouds(g, { y: E.H * 0.14, h: 90, color: S().ui.cream, a: 0.14, seed: 17 });
    // silhouetted New York skyline: varied towers, spires, lit windows
    const r = rng(7);
    let bx = -E.W * 0.2;
    while (bx < E.W * 1.2) {
      const bw = 110 + r() * 170, bh = 220 + r() * 340;
      g.fillStyle = shade(M.wall, -0.45);
      g.fillRect(bx, E.H * 0.66 - bh, bw, bh + 200);
      if (r() < 0.3) {
        seg(g, [[bx + bw / 2, E.H * 0.66 - bh], [bx + bw / 2, E.H * 0.66 - bh - 90]], 6, shade(M.wall, -0.45));
        circle(g, bx + bw / 2, E.H * 0.66 - bh - 92, 6, S().ui.accent);
        glow(g, bx + bw / 2, E.H * 0.66 - bh - 92, 26, S().ui.accent, 0.7);
      }
      for (let i = 0; i < 14; i++) {
        if (r() < 0.42) {
          g.fillStyle = alpha(M.practical, 0.85);
          g.fillRect(bx + 16 + r() * (bw - 34), E.H * 0.66 - bh + 22 + r() * (bh - 70), 10, 14);
        }
      }
      bx += bw + 16;
    }
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, E.H * 0.66, 0, E.H, [shade(M.road, -0.1), M.dark]);
    g.fillRect(-E.W, E.H * 0.66, E.W * 3, E.H);
    poly(g, [[E.W * 0.42, E.H], [E.W * 0.48, E.H * 0.66], [E.W * 0.52, E.H * 0.66], [E.W * 0.58, E.H]], shade(M.road, 0.15));
    // streetlamp, flickering amber
    const fl = 0.5 + 0.45 * noise(t * 7, 3);
    FX.lampPost(g, E.W * 0.16, E.H * 0.88, 340, { light: M.practical, a: 0.2 * fl });
    glow(g, E.W * 0.16 + 37, E.H * 0.88 - 342, 70, M.practical, 0.5 * fl);
  });
  // van front, large in frame, facing the viewer
  layer(g, cam, 1, (g) => {
    const vx = E.W / 2, vy = E.H * 0.88, vw = 1040, vh = 620, top = vy - vh;
    g.fillStyle = 'rgba(0,0,0,.4)';
    g.beginPath(); g.ellipse(vx, vy + 8, vw * 0.52, 18, 0, 0, 7); g.fill();
    // body: tall white front face
    rr(g, vx - vw / 2, top, vw, vh, 48); g.fillStyle = S().ui.cream; g.fill();
    // dawn wash across the roof
    glow(g, vx, top + 30, 520, M.key, 0.2);
    // side mirrors
    seg(g, [[vx - vw / 2, top + 150], [vx - vw / 2 - 30, top + 150]], 8, shade(M.wall, -0.2));
    rr(g, vx - vw / 2 - 54, top + 108, 50, 92, 12); g.fillStyle = shade(M.wall, -0.2); g.fill();
    seg(g, [[vx + vw / 2, top + 150], [vx + vw / 2 + 30, top + 150]], 8, shade(M.wall, -0.2));
    rr(g, vx + vw / 2 + 4, top + 108, 50, 92, 12); g.fillStyle = shade(M.wall, -0.2); g.fill();
    // windshield: two dark panes with a dawn reflection band
    for (const wx of [vx - 420, vx + 20]) {
      rr(g, wx, top + 50, 400, 200, 16); g.fillStyle = shade(M.wall, -0.35); g.fill();
      poly(g, [[wx + 40, top + 250], [wx + 200, top + 50], [wx + 300, top + 50], [wx + 140, top + 250]], alpha(M.key, 0.3));
    }
    seg(g, [[vx - 8, top + 50], [vx - 8, top + 250]], 8, S().ui.cream);
    // wipers
    seg(g, [[vx - 380, top + 240], [vx - 180, top + 120]], 7, shade(M.wall, -0.3));
    seg(g, [[vx + 60, top + 240], [vx + 260, top + 120]], 7, shade(M.wall, -0.3));
    // hood seam + amber streetlamp reflections on the hood
    seg(g, [[vx - vw / 2 + 40, top + 290], [vx + vw / 2 - 40, top + 290]], 3, alpha(S().ink, 0.25));
    for (const hx of [-260, 240]) {
      seg(g, [[vx + hx, top + 300], [vx + hx + 30, top + 400]], 10, alpha(M.practical, 0.5));
      glow(g, vx + hx + 14, top + 350, 60, M.practical, 0.25);
    }
    // grill: dark recess, chrome slats, centre emblem
    rr(g, vx - 300, top + 330, 600, 150, 18); g.fillStyle = shade(M.dark, -0.1); g.fill();
    for (let i = 0; i < 5; i++) seg(g, [[vx - 270, top + 356 + i * 26], [vx + 270, top + 356 + i * 26]], 6, alpha(S().ui.cream, 0.75));
    for (let i = 0; i < 4; i++) seg(g, [[vx - 150 + i * 100, top + 340], [vx - 150 + i * 100, top + 470]], 4, alpha(S().ui.cream, 0.35));
    circle(g, vx, top + 405, 34, shade(M.wall, -0.2));
    ring(g, vx, top + 405, 34, 4, S().ui.gold);
    circle(g, vx, top + 405, 12, S().ui.gold);
    // headlights: big round lamps flanking the grill, glowing
    for (const hx of [-425, 425]) {
      glow(g, vx + hx, top + 405, 130, M.key, 0.5);
      circle(g, vx + hx, top + 405, 62, S().feature);
      ring(g, vx + hx, top + 405, 62, 5, alpha(S().ui.cream, 0.8));
      circle(g, vx + hx, top + 405, 30, shade(S().ui.cream, -0.15));
      glow(g, vx + hx, top + 405, 60, S().feature, 0.6);
    }
    // bumper with fog lights + license plate
    rr(g, vx - vw / 2 + 10, vy - 110, vw - 20, 100, 20); g.fillStyle = shade(M.wall, -0.25); g.fill();
    for (const fx of [-400, 400]) {
      glow(g, vx + fx, vy - 60, 60, M.key, 0.35);
      circle(g, vx + fx, vy - 60, 24, S().feature);
    }
    rr(g, vx - 80, vy - 96, 160, 62, 8); g.fillStyle = S().ui.cream; g.fill();
    seg(g, [[vx - 60, vy - 66], [vx + 60, vy - 66]], 6, shade(S().ui.blueprint, -0.3));
    seg(g, [[vx - 60, vy - 46], [vx + 60, vy - 46]], 4, alpha(S().ink, 0.4));
    // tires peeking at the bottom corners
    for (const tx of [-470, 470]) { rr(g, vx + tx - 55, vy - 14, 110, 46, 18); g.fillStyle = S().ink; g.fill(); }
  });
  FX.dust(g, t, { count: 22, color: S().ui.cream, a: 0.28 });
  FX.godRays(g, E.W * 0.72, E.H * 0.42, { count: 8, angle: -Math.PI / 2, spread: Math.PI, len: 1200, a: 0.05, t });
  FX.lensStreak(g, E.W * 0.72, E.H * 0.4, E.W * 0.9, M.key, 0.14);
} });

// s180b — medium: hands gripping the steering wheel at dawn; cyan dashboard needles.
registerShot('s180b', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.06 * ease.inOut(t / info.dur), x: 30 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.6, x: 200, y: -140 }, { mood: 'golden' })); veil(g, '#120a10', 0.4);
  const M = mood('golden');
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H * 0.62;
    // dashboard + glowing cyan dials
    g.fillStyle = shade(M.wall, -0.4); g.fillRect(-E.W, E.H * 0.78, E.W * 3, E.H * 0.3);
    for (const [dx, a0] of [[-260, -0.6], [260, 0.4]]) {
      circle(g, cx + dx, E.H * 0.86, 52, shade(M.dark, -0.2)); ring(g, cx + dx, E.H * 0.86, 52, 3, alpha(M.practical, 0.5));
      const na = a0 + Math.sin(t * 1.4 + dx) * 0.15;
      seg(g, [[cx + dx, E.H * 0.86], [cx + dx + Math.cos(na - Math.PI / 2) * 40, E.H * 0.86 + Math.sin(na - Math.PI / 2) * 40]], 4, '#7fd0d6');
      glow(g, cx + dx, E.H * 0.86, 60, '#7fd0d6', 0.3);
    }
    // steering wheel
    ring(g, cx, cy, 210, 22, S().ink);
    circle(g, cx, cy, 34, S().ink);
    seg(g, [[cx, cy], [cx - 150, cy + 140]], 16, S().ink); seg(g, [[cx, cy], [cx + 150, cy + 140]], 16, S().ink);
    // two hands gripping the top of the wheel
    for (const hx of [-120, 120]) {
      circle(g, cx + hx, cy - 200, 34, S().ink);
      for (let i = 0; i < 4; i++) seg(g, [[cx + hx - 18 + i * 12, cy - 210], [cx + hx - 14 + i * 12, cy - 248]], 13, S().ink);
      seg(g, [[cx + hx + (hx < 0 ? -30 : 30), cy - 190], [cx + hx + (hx < 0 ? -90 : 90), cy - 120]], 20, S().ink);
    }
    glow(g, cx, cy - 220, 260, M.key, 0.12);
  });
  FX.dust(g, t, { count: 18, color: '#ffe0b0', a: 0.3 });
  FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W, '#ffe0b0', 0.14);
} });

// s181a — insert: paper national-park map, red ink line, a finger tracing the route.
registerShot('s181a', { draw(g, t, info) {
  const cam = { z: 1.45 + 0.07 * ease.inOut(t / info.dur), x: -24 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.7, x: -160, y: -120 }, { mood: 'golden' })); veil(g, '#120a10', 0.42);
  const M = mood('golden');
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 420, py = E.H * 0.16, pw = 840, ph = 700;
    g.save(); g.translate(E.W / 2, E.H * 0.52); g.rotate(-0.03 + 0.01 * Math.sin(t * 0.7)); g.translate(-E.W / 2, -E.H * 0.52);
    rr(g, px, py, pw, ph, 10); g.fillStyle = CREAM(); g.fill();
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(px, py + ph - 8, pw, 8);
    // geometric mountain shapes on the map
    const r = rng(11);
    for (let i = 0; i < 7; i++) { const mx = px + 70 + r() * (pw - 200), my = py + 90 + r() * (ph - 240), ms = 50 + r() * 70; poly(g, [[mx - ms, my + ms * 0.6], [mx, my - ms * 0.6], [mx + ms, my + ms * 0.6]], shade(M.wall, -0.1 + r() * 0.15)); }
    // red route line, drawing on
    const path = [[px + 90, py + ph - 120], [px + 260, py + ph - 260], [px + 430, py + ph - 200], [px + 580, py + 330], [px + 740, py + 160]];
    const k = ease.inOut(prog(t, 0.2, info.dur - 0.2));
    const total = path.length - 1, fi = k * total, si = Math.floor(fi), fk = fi - si;
    g.strokeStyle = S().ui.accent; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(...path[0]);
    for (let i = 1; i <= si; i++) g.lineTo(...path[i]);
    if (si < total) g.lineTo(lerp(path[si][0], path[si + 1][0], fk), lerp(path[si][1], path[si + 1][1], fk));
    g.stroke();
    const fx = lerp(path[Math.min(si, total - 1)][0], path[Math.min(si + 1, total)][0], fk);
    const fy = lerp(path[Math.min(si, total - 1)][1], path[Math.min(si + 1, total)][1], fk);
    // tracing finger
    seg(g, [[fx + 26, fy + 60], [fx + 6, fy + 6]], 26, S().ink);
    circle(g, fx, fy, 20, S().ink);
    circle(g, px + pw - 90, py + 60, 16, S().ui.accent);
    text(g, 'GRAND TETON', px + pw - 110, py + 100, { size: 26, color: S().ink, font: FONTS.ui, weight: 900, align: 'right', spacing: 1 });
    g.restore();
    glow(g, E.W / 2, E.H * 0.5, 420, M.key, 0.1);
  });
  FX.dust(g, t, { count: 20, color: '#ffe0b0', a: 0.3 });
} });

// s181b — FACE CU 1/3: Gabby's reflection in the side mirror, sad, looking up as the light dims.
registerShot('s181b', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.6, x: 180, y: -120 }, { mood: 'dusk' })); veil(g, '#120a10', 0.38);
  const M = mood('dusk');
  layer(g, cam, 1, (g) => {
    // mirror frame
    const mx = E.W / 2, my = E.H * 0.52, mw = 980, mh = 640;
    rr(g, mx - mw / 2 - 18, my - mh / 2 - 18, mw + 36, mh + 36, 34); g.fillStyle = shade(M.wall, -0.2); g.fill();
    g.save(); g.beginPath(); rr(g, mx - mw / 2, my - mh / 2, mw, mh, 26); g.clip();
    g.fillStyle = linGrad(g, 0, my - mh / 2, 0, my + mh / 2, ['#ffb36a', '#7a4a7a', '#1c1c3a']); g.fillRect(mx - mw / 2, my - mh / 2, mw, mh);
    glow(g, mx - mw * 0.28, my - mh * 0.2, 200, '#ffcf9e', 0.35);
    g.restore();
    const r = V(300, 320) * (1 + 0.03 * ease.inOut(t / info.dur));
    bigFace(g, mx, my + 40, r, { outfit: GABBY, expr: 'sad', look: [0.1, lerp(0.35, -0.35, ease.inOut(prog(t, 0.4, info.dur - 0.2)))], rimColor: M.rim, rimSide: -1, blink: (t % 3.4) > 3.3 });
    // mirror glint + dimming veil
    seg(g, [[mx - mw / 2 + 60, my + mh / 2 - 40], [mx - mw / 2 + 320, my - mh / 2 + 60]], 5, alpha('#ffffff', 0.18));
    veil(g, '#1c1c3a', 0.22 * prog(t, 0.5, info.dur));
  });
  FX.dust(g, t, { count: 16, color: '#ffcf9e', a: 0.3 });
} });

// s182 — UI: calendar grid on a dark screen; the 25th pulses as the rest of the month dims.
registerShot('s182', { draw(g, t, info) {
  const cam = { z: 1.08 - 0.08 * ease.inOut(t / info.dur), x: 16 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.7, x: 120, y: -100 }, { mood: 'night' })); veil(g, '#0a0812', 0.5);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 300, py = E.H * 0.1, pw = 600, ph = 860;
    rr(g, px - 16, py - 16, pw + 32, ph + 32, 40); g.fillStyle = shade(M.dark, -0.3); g.fill();
    rr(g, px, py, pw, ph, 30); g.fillStyle = shade(M.wall, -0.35); g.fill();
    glow(g, E.W / 2, E.H * 0.5, 420, M.practical, 0.16);
    text(g, 'AUGUST 2021', E.W / 2, py + 62, { size: 34, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3 });
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    days.forEach((d, i) => text(g, d, px + 52 + i * 78, py + 116, { size: 24, color: alpha(S().ui.cream, 0.55), font: FONTS.ui, weight: 900 }));
    const dim = prog(t, 0.6, info.dur);
    for (let d = 1; d <= 31; d++) {
      const col = (d - 1) % 7, row = Math.floor((d - 1) / 7);
      const cx = px + 52 + col * 78, cy = py + 168 + row * 78;
      if (d === 25) {
        const pulse = 0.7 + 0.3 * Math.sin(t * 5);
        glow(g, cx, cy - 8, 60, S().ui.gold, 0.5 * pulse);
        circle(g, cx, cy - 8, 30, alpha(S().ui.gold, 0.25 + 0.2 * pulse));
        text(g, '25', cx, cy, { size: 36, color: S().ui.gold, font: FONTS.ui, weight: 900 });
      } else {
        text(g, String(d), cx, cy, { size: 28, color: alpha(S().ui.cream, lerp(0.85, 0.25, dim)), font: FONTS.ui, weight: 900 });
      }
    }
    // TikTok tile strip: last post highlighted
    for (let i = 0; i < 3; i++) {
      const tx = px + 30 + i * 190, ty = py + ph - 130;
      rr(g, tx, ty, 170, 100, 12); g.fillStyle = i === 2 ? mix(M.practical, M.wall, 0.4) : shade(M.wall, -0.1); g.fill();
      if (i === 2) { ring(g, tx + 85, ty + 50, 30, 3, alpha(S().ui.gold, 0.8)); poly(g, [[tx + 76, ty + 34], [tx + 76, ty + 66], [tx + 100, ty + 50]], S().ui.gold); }
      else { poly(g, [[tx + 76, ty + 36], [tx + 76, ty + 64], [tx + 98, ty + 50]], alpha(S().ui.cream, 0.6)); }
    }
  });
  FX.dust(g, t, { count: 14, color: '#cfd8ff', a: 0.25 });
} });

// s183a — insert: smartphone vibrating on a dark navy wooden surface.
registerShot('s183a', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.06 * ease.inOut(t / info.dur), x: -30 * ease.inOut(t / info.dur) };
  const M = mood('night');
  layer(g, cam, 0.6, (g) => {
    backdrop(g, [shade(M.wall, -0.5), shade(M.dark, -0.2)]);
    for (let i = 0; i < 6; i++) { seg(g, [[-E.W, E.H * (0.2 + i * 0.14)], [E.W * 2, E.H * (0.2 + i * 0.14)]], 2, 'rgba(0,0,0,.35)'); }
    FX.pool(g, E.W / 2, E.H * 0.55, 380, 60, M.practical, 0.12);
  });
  layer(g, cam, 1, (g) => {
    const [sx, sy] = shake(t, 3.5, 16, 5);
    g.save(); g.translate(sx, sy); g.rotate(-0.06);
    const px = E.W / 2 - 150, py = E.H * 0.32, pw = 300, ph = 560;
    rr(g, px - 12, py - 12, pw + 24, ph + 24, 36); g.fillStyle = shade(M.dark, -0.4); g.fill();
    rr(g, px, py, pw, ph, 28); g.fillStyle = shade(M.wall, -0.45); g.fill();
    seg(g, [[px + 40, py + 90], [px + pw - 40, py + 90]], 3, alpha('#ffffff', 0.14));
    circle(g, px + pw / 2, py + ph - 60, 34, shade(M.wall, -0.2)); ring(g, px + pw / 2, py + ph - 60, 34, 3, alpha(S().ui.cream, 0.4));
    text(g, '11 SEPT', E.W / 2, py + 170, { size: 30, color: alpha(S().ui.cream, 0.8), font: FONTS.ui, weight: 900, spacing: 2 });
    g.restore();
    FX.rings(g, E.W / 2, E.H * 0.58, t, { count: 3, r0: 180, r1: 520, speed: 1.2, color: '#ffffff', a: 0.4 });
  });
  FX.dust(g, t, { count: 14, color: '#cfd8ff', a: 0.25 });
  FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 0.8, '#cfd8ff', 0.12);
} });

// s183b — medium: Gabby's parents silhouetted in a room lit by a single amber floor lamp.
// (DS object = parents in the lamp-lit room; the dark phone sits on the side table.)
registerShot('s183b', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: 34 * ease.inOut(t / info.dur) };
  const M = mood('interiorWarm');
  layer(g, cam, 0.55, (g) => {
    backdrop(g, [shade(M.wall, -0.4), shade(M.dark, -0.25)]);
    g.fillStyle = shade(M.floor, -0.3); g.fillRect(-E.W, E.H * 0.78, E.W * 3, E.H * 0.3);
    FX.floorLines(g, E.H * 0.78, E.H, 'rgba(0,0,0,.2)', 0.08);
    FX.windowFrame(g, { x: E.W * 0.08, y: E.H * 0.14, w: 420, h: 420, cols: 2, rows: 2 }, (gg, wx, wy, ww, wh) => { gg.fillStyle = linGrad(gg, 0, wy, 0, wy + wh, [shade(M.wall, -0.5), shade(M.dark, -0.3)]); gg.fillRect(wx, wy, ww, wh); glow(gg, wx + ww * 0.7, wy + wh * 0.3, 90, M.practical, 0.4); });
  });
  layer(g, cam, 0.9, (g) => {
    // floor lamp, right
    const lx = E.W * 0.78, ly = E.H * 0.78;
    seg(g, [[lx, ly], [lx, ly - 380]], 8, shade(M.wall, -0.3));
    poly(g, [[lx - 90, ly - 380], [lx + 90, ly - 380], [lx + 60, ly - 460], [lx - 60, ly - 460]], M.practical);
    glow(g, lx, ly - 420, 220, M.practical, 0.55);
    FX.lightCone(g, lx, ly - 400, { angle: Math.PI / 2, spread: 0.7, len: 700, color: M.practical, a: 0.2 });
    FX.pool(g, lx, ly + 10, 320, 44, M.practical, 0.22);
    // long sharp shadows stretching left across the floor
    for (const [sx, sw] of [[E.W * 0.42, 260], [E.W * 0.58, 200]]) {
      poly(g, [[sx, ly], [sx - 420, ly + 130], [sx - 420 + sw, ly + 130], [sx + sw * 0.4, ly]], 'rgba(0,0,0,.45)');
    }
    // side table with the dark phone
    rr(g, E.W * 0.16, ly - 150, 200, 16, 6); g.fillStyle = shade(M.wall, -0.2); g.fill();
    seg(g, [[E.W * 0.2, ly - 134], [E.W * 0.2, ly]], 8, shade(M.wall, -0.2));
    seg(g, [[E.W * 0.32, ly - 134], [E.W * 0.32, ly]], 8, shade(M.wall, -0.2));
    rr(g, E.W * 0.2, ly - 216, 70, 60, 8); g.fillStyle = shade(M.dark, -0.3); g.fill();
  });
  layer(g, cam, 1, (g) => {
    const rim = { color: M.rim, dir: [1, -0.4], w: 4 };
    const dad = { top: 'tshirt', color: shade(M.wall, -0.1), head: 'none' };
    const mum = { top: 'tshirt', color: shade(M.wall, 0.05), head: 'bun', headColor: shade(M.wall, 0.05) };
    drawFigure(g, { x: E.W * 0.42, y: E.H * 0.78, s: 1.6, facing: 1, outfit: dad, pose: breathe(POSES.stand, t, 1, 1), expr: 'sad', rim, blink: (t % 3.2) > 3.1 });
    drawFigure(g, { x: E.W * 0.58, y: E.H * 0.78, s: 1.55, facing: -1, outfit: mum, pose: breathe(posesAt(t, [[0, 'stand'], [0.9, 'sad']]), t, 1, 2), expr: 'sad', rim, blink: (t % 3.7) > 3.6 });
  });
  FX.dust(g, t, { count: 26, color: '#ffcf9e', a: 0.3 });
  blurLayer(g, 10, (g) => { g.fillStyle = shade(M.wall, -0.5); g.fillRect(-E.W, E.H * 0.9, E.W * 3, 200); }, null, 1.7);
} });

// s184a — wide: the van driving alone down a long straight highway; headlights receding.
registerShot('s184a', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), x: -26 * ease.inOut(t / info.dur), y: 30 * ease.inOut(t / info.dur) };
  const M = mood('dusk');
  layer(g, cam, 0.15, (g) => {
    backdrop(g, M.sky);
    FX.sun(g, E.W * 0.5, E.H * 0.34, 46, '#fff3dc', M.key, 4);
    FX.clouds(g, { y: E.H * 0.14, h: 90, color: '#ffcf9e', a: 0.12, seed: 23 });
    FX.hills(g, { y: E.H * 0.6, amp: 90, color: mix(M.wall, '#3a2a4a', 0.5), seed: 9 });
  });
  layer(g, cam, 0.9, (g) => {
    // long straight road to the vanishing point
    const vx = E.W / 2, vy = E.H * 0.6;
    poly(g, [[-E.W, E.H], [vx - 60, vy], [vx + 60, vy], [E.W * 2, E.H]], '#4a3c40');
    g.fillStyle = linGrad(g, 0, vy, 0, E.H, [M.grass, shade(M.dark, -0.1)]); g.fillRect(-E.W, vy, E.W * 3, 10);
    g.fillStyle = linGrad(g, 0, vy, 0, E.H, [shade(M.grass, -0.2), shade(M.dark, -0.15)]);
    poly(g, [[-E.W, vy], [vx - 60, vy], [-E.W, E.H]], shade(M.grass, -0.2));
    poly(g, [[E.W * 2, vy], [vx + 60, vy], [E.W * 2, E.H]], shade(M.grass, -0.2));
    for (let i = 0; i < 6; i++) { const yy = vy + (E.H - vy) * ((i + 0.5) / 6); const w = 4 + i * 10; g.fillStyle = alpha('#e8e4d4', 0.7); g.fillRect(vx - w / 2, yy, w, 8 + i * 6); }
    // swamp silhouettes at the roadside
    for (const [px, s] of [[E.W * 0.12, 1.1], [E.W * 0.88, 1.25], [E.W * 0.05, 0.8], [E.W * 0.95, 0.9]]) FX.pine(g, px, E.H * 0.94, s, '#14101c');
    FX.fog(g, E.H * 0.55, 160, M.fog, 0.22);
  });
  layer(g, cam, 1, (g) => {
    // van receding toward the vanishing point; two white headlight circles
    const k = ease.inOut(prog(t, 0, info.dur));
    const vx = E.W / 2 + 40 * (1 - k), vy = lerp(E.H * 0.78, E.H * 0.62, k), s = lerp(0.85, 0.32, k);
    van2D(g, vx, vy, s, { headlights: true });
    glow(g, vx + 200 * s, vy - 30 * s, 60, '#ffffff', 0.5 * (1 - k * 0.4));
    circle(g, vx + 200 * s, vy - 30 * s, 10, '#ffffff');
    circle(g, vx + 170 * s, vy - 30 * s, 8, '#ffffff');
  });
  FX.dust(g, t, { count: 20, color: '#ffe0b0', a: 0.25 });
} });
