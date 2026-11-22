// shots/04_iowa_a.js — Story 4 (Iowa): s092a–s098. Discovery of the secret room.
// 3D house establishings (orbit + dolly-in), calendar, phone insert, the story's ONE
// bigFace close-up (s094b), stethoscope insert, carpet pull, floor track, freeze frame.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, glow, alpha, shade, linGrad, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { basement } from '../sets/basement.js';
import { MERIDITH } from '../cast.js';

const HUSBAND = { top: 'tshirt', color: '#5a5a6a', head: 'cap', headColor: '#3a6ea5' }; // grey tee, blue cap

// ---------- 3D Iowa house stage (adapted from build/_old_scenes/est3d.js 'house') ----------
function houseStage(T, withFigure) {
  const M = mood('dusk');
  const st = T.stage({ mood: 'dusk', fov: 38, fog: [16, 60], keyPos: [-8, 9, 6] });
  st.add(T.ground(70, 70, M.grass));
  const house = T.building(7, 4.2, 5.5, { color: M.wall, win: M.practical, lit: 0.4, seed: 5 });
  st.add(house);
  const win = T.windowPane(1.4, 1.6, { glowColor: M.practical, cols: 2, rows: 2, power: 1.1 });
  win.position.set(-1.5, 0.9, 2.78); st.add(win);
  st.add(T.tree3D(-9, 3, 1.3, M.dark), T.tree3D(10, -2, 1.1, M.dark));
  st.add(T.box(8, 0.15, 0.4, M.road, 0, 0.08, 5.5));
  let mer = null;
  if (withFigure) {
    mer = T.figure3D(MERIDITH, { rim: M.rim, pose: POSES.point });
    mer.position.set(2.6, 0, 4.2); mer.rotation.y = -2.4; st.add(mer);
  }
  return { stage: st, mer };
}

// s092a — "In April 2024, a couple in Iowa …" 3D: slow orbit around the house at dusk.
registerShot('s092a', {
  kind: '3d',
  init(T) { return houseStage(T, false); },
  draw(s, t, info, T) {
    T.orbit(s.stage.camera, t, { target: [0, 1.4, 0], radius: [13, 9], height: [4.5, 2.6], from: -0.9, to: 0.4, dur: info.dur });
  },
});

// s092b — "… found a secret room in their own house," 3D: dolly-in toward the glowing
// basement window (different path from s092a's orbit). Meredith stands by the porch,
// pointing toward the house — the DS pointing beat, kept inside the 3D shot.
registerShot('s092b', {
  kind: '3d',
  init(T) { return houseStage(T, true); },
  draw(s, t, info, T) {
    T.dolly(s.stage.camera, t, [
      [0, { pos: [6, 3.2, 11], look: [-1.5, 0.9, 2.8], fov: 38 }],
      [info.dur, { pos: [-0.6, 1.3, 5.2], look: [-1.5, 0.9, 2.8], fov: 34 }],
    ]);
  },
});

// s093 — "and they had lived there for four years without knowing it was there."
// Wide basement: tattered wall calendar, pages fluttering, sun/moon shadows sweeping.
registerShot('s093', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1 + 0.05 * k, x: 30 * k, r: 0.008 * k };
  const { GY, CX, M } = basement(g, t, cam);
  const calX = CX - V(620, 460), calY = GY - V(560, 800), cw = V(190, 150), ch = V(240, 190);
  layer(g, cam, 1, (g) => {
    // tattered calendar on the block wall; top page flutters
    const fl = Math.sin(t * 9) * 6;
    rr(g, calX, calY, cw, ch, 6); g.fillStyle = S().ui.cream; g.fill();
    rr(g, calX + 6, calY + 4 + fl, cw - 12, ch - 40, 4); g.fillStyle = alpha(S().ui.cream, 0.85); g.fill();
    g.fillStyle = S().ui.accent; g.fillRect(calX, calY, cw, 34);
    g.strokeStyle = alpha(S().ink, 0.5); g.lineWidth = 2;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { g.strokeRect(calX + 12 + c * (cw - 24) / 5, calY + 48 + r * (ch - 60) / 4, (cw - 24) / 5 - 4, (ch - 60) / 4 - 4); }
    // sun/moon shadow band sweeping across the room
    const sx = lerp(-E.W * 0.4, E.W * 1.1, prog(t, 0, info.dur));
    g.save(); g.globalAlpha = 0.28; g.fillStyle = S().ink;
    g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx + 260, 0); g.lineTo(sx + 60, E.H); g.lineTo(sx - 200, E.H); g.closePath(); g.fill(); g.restore();
    glow(g, calX + cw / 2, calY + ch / 2, 130, M.practical, 0.12);
  });
  FX.dust(g, t, { count: 36, color: '#ffe0b0', a: 0.3 });
  FX.fog(g, GY - 120, 180, M.fog, 0.18);
} });

// s094a — "The woman posted …" Insert: glowing smartphone, thumb swiping up.
registerShot('s094a', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 14, (g) => basement(g, t, { z: 1.7 + 0.06 * k, x: -120, y: -140 })); veil(g, '#0a0a14', 0.45);
  const M = mood('night');
  const px = E.W * 0.56, py = E.H * 0.52, pw = V(300, 260), ph = V(560, 480);
  const swipe = ease.out(prog(t, 0.2, 1.6));
  // phone body + glowing blue screen
  rr(g, px - pw / 2, py - ph / 2, pw, ph, 26); g.fillStyle = S().ink; g.fill();
  rr(g, px - pw / 2 + 14, py - ph / 2 + 14, pw - 28, ph - 28, 18);
  g.fillStyle = linGrad(g, px, py - ph / 2, px, py + ph / 2, [S().ui.blueprint, M.key]); g.fill();
  glow(g, px, py, 260, S().ui.blueprint, 0.5);
  circle(g, px, py - ph / 2 + 60, 26, alpha('#ffffff', 0.85)); // app icon glint
  seg(g, [[px - 70, py + 40], [px + 70, py + 40]], 6, alpha('#ffffff', 0.6));
  seg(g, [[px - 70, py + 80], [px + 30, py + 80]], 6, alpha('#ffffff', 0.4));
  // thumb swiping upward across the glass
  const ty = lerp(py + ph * 0.34, py - ph * 0.3, swipe);
  seg(g, [[px + 60, py + ph * 0.62], [px + 26, ty + 30]], 64, S().ink);
  circle(g, px + 20, ty, 34, S().ink);
  FX.rings(g, px, ty, t, { count: 2, r0: 40, r1: 200, color: S().ui.blueprint, a: 0.4 * (1 - prog(t, 1.2, info.dur)) });
  FX.dust(g, t, { count: 24, color: '#bcd0ff', a: 0.3 });
} });

// s094b — "… on TikTok as @kids_up_in_here." THE story's one bigFace close-up:
// Meredith, worry sharpening, glancing down at the carpet, flickering blue phone glow.
registerShot('s094b', { draw(g, t, info) {
  blurLayer(g, 14, (g) => basement(g, t, { z: 1.6, x: 200, y: -160 })); veil(g, '#0a0a14', 0.42);
  const M = mood('night');
  const r = V(300, 330) * (1 + 0.03 * prog(t, 0, info.dur));
  bigFace(g, E.W / 2, E.H * V(0.6, 0.55), r, { outfit: MERIDITH, expr: 'worried', look: [0.25, 0.45], rimColor: M.rim, rimSide: -1, blink: (t % 2.9) > 2.8 });
  // flickering blue screen glow on the lit side of her face
  const flick = 0.22 + 0.18 * (0.5 + 0.5 * Math.sin(t * 13)) * (0.5 + 0.5 * Math.sin(t * 7.3));
  glow(g, E.W / 2 - r * 0.9, E.H * V(0.6, 0.55), r * 1.1, S().ui.blueprint, flick);
  FX.dust(g, t, { count: 26, color: '#bcd0ff', a: 0.3 });
} });

// s095 — "Her name was Maridith Morris, and she was a nurse and a midwife."
// Insert: stethoscope chest piece, cold blue moonlight beam across the metal.
registerShot('s095', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 14, (g) => basement(g, t, { z: 1.8 + 0.05 * k, x: 160 - 60 * k, y: -200 + 40 * k })); veil(g, '#0a0e20', 0.4);
  const M = mood('interiorCool');
  const cx = E.W / 2, cy = E.H * 0.46;
  FX.godRays(g, E.W * 0.12, 0, { count: 6, angle: Math.PI / 2.6, spread: 0.5, len: 1400, color: M.key, a: 0.12, t });
  FX.lightCone(g, E.W * 0.12, 0, { angle: Math.PI / 2.6, spread: 0.4, len: 1100, color: M.key, a: 0.12 });
  // stethoscope: tube curving in, chest piece catching the beam
  g.save(); g.translate(40 * k, 0);
  seg(g, [[cx - 420, cy + 260], [cx - 260, cy + 120], [cx - 120, cy + 40], [cx - 30, cy - 10]], 14, shade(M.wall, 0.35));
  seg(g, [[cx - 420, cy + 260], [cx - 260, cy + 120], [cx - 120, cy + 40], [cx - 30, cy - 10]], 5, S().feature);
  ring(g, cx + 30, cy, 74, 10, M.key); circle(g, cx + 30, cy, 74, shade(M.wall, -0.2));
  ring(g, cx + 30, cy, 74, 4, S().feature); circle(g, cx + 30, cy, 30, M.key);
  glow(g, cx + 30, cy, 180, M.key, 0.45);
  seg(g, [[cx + 30, cy], [cx + 150, cy - 90]], 12, shade(M.wall, 0.35));
  circle(g, cx + 158, cy - 96, 16, shade(M.wall, 0.35));
  g.restore();
  FX.lensStreak(g, cx + 30, cy, E.W * 0.9, M.key, 0.22);
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.3 });
} });

// s096 — "She and her husband were removing the carpet in their basement."
// Wide: the couple pull a heavy carpet corner back, revealing cold grey concrete.
registerShot('s096', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1 + 0.08 * k, x: -20 * k };
  const { GY, CX, M } = basement(g, t, cam);
  const peel = ease.inOut(prog(t, 0.3, info.dur));
  layer(g, cam, 1, (g) => {
    // revealed concrete where the carpet has been pulled back
    g.fillStyle = shade(M.floor, 0.45); g.beginPath(); g.ellipse(CX - 120, GY + 130, 420, 60, 0, 0, 7); g.fill();
    // carpet flap peeling up toward the couple
    const lift = peel * 130;
    g.save(); g.translate(CX - 300, GY + 60); g.rotate(-0.1 - peel * 0.35);
    rr(g, -40, -26 - lift, V(560, 440), 52, 26); g.fillStyle = '#8a7a5e'; g.fill();
    circle(g, V(560, 440) - 40, -lift, 26, '#6a5c46'); g.restore();
    drawFigure(g, { x: CX - V(430, 340), y: GY, s: 1.5, facing: 1, outfit: MERIDITH, pose: breathe(posesAt(t, [[0, 'crouch'], [0.5, 'reach']]), t), expr: 'determined', rim: { color: M.rim, dir: [0, -1] } });
    drawFigure(g, { x: CX + V(180, 140), y: GY, s: 1.55, facing: -1, outfit: HUSBAND, pose: breathe(posesAt(t, [[0, 'crouch'], [0.5, 'reach']]), t, 1, 2), expr: 'determined', rim: { color: M.rim, dir: [0, -1] } });
  });
  FX.dust(g, t, { count: 60, color: '#ffe0b0', a: 0.4 });
  FX.fog(g, GY - 100, 160, M.fog, 0.2);
} });

// s097 — "Under the carpet, they found a sliding wall."
// Medium: a hand reaches down to the cold steel floor track; carpet fully rolled.
// FIX: the arm is drawn at believable scale — a slim red-orange sleeve (never
// wider than a torso) entering from the top edge, a small ink hand with thin
// fingers touching the horizontal steel rail.
registerShot('s097', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 12, (g) => basement(g, t, { z: 1.7 - 0.2 * k, x: 120, y: -260 })); veil(g, '#0a0a14', 0.35);
  const M = mood('night');
  const trackY = E.H * 0.72, tx = E.W / 2;
  // floor band + rolled carpet edge at the top of the frame
  g.fillStyle = linGrad(g, 0, E.H * 0.5, 0, E.H, [shade(M.floor, 0.1), shade(M.dark, -0.1)]); g.fillRect(0, E.H * 0.5, E.W, E.H * 0.5);
  rr(g, E.W * 0.14, E.H * 0.44, E.W * 0.72, 46, 23); g.fillStyle = shade(M.wall, 0.15); g.fill();
  // the steel track embedded in the floor: a horizontal rail with a groove
  // and bolt heads, glinting under the bulb
  seg(g, [[E.W * 0.16, trackY - 14], [E.W * 0.84, trackY - 14]], 8, shade(M.wall, 0.35));
  seg(g, [[E.W * 0.16, trackY + 12], [E.W * 0.84, trackY + 12]], 8, shade(M.wall, 0.35));
  seg(g, [[E.W * 0.16, trackY], [E.W * 0.84, trackY]], 5, shade(M.wall, -0.4));
  seg(g, [[E.W * 0.16, trackY - 6], [E.W * 0.84, trackY - 6]], 3, M.key);
  for (let i = 0; i < 5; i++) circle(g, E.W * (0.24 + i * 0.13), trackY - 14, 6, shade(M.wall, 0.5));
  glow(g, tx, trackY, 220, M.key, 0.3);
  // the reaching arm: slim red-orange sleeve from the top edge, small hand
  const hy = lerp(E.H * 0.42, trackY - 48, ease.out(prog(t, 0.2, 1.8)));
  const wx = tx + 46, wy = hy - 26; // wrist
  seg(g, [[tx + 210, -30], [wx, wy]], 30, MERIDITH.color);
  seg(g, [[tx + 196, -30], [wx - 8, wy - 8]], 3, M.rim); // rim light on the sleeve's lit edge
  circle(g, wx, wy, 16, S().ink); // cuff
  // small hand: palm + four thin fingers reaching down to the rail
  circle(g, tx + 16, hy, 26, S().ink);
  for (let i = 0; i < 4; i++) seg(g, [[tx + 2 + i * 11, hy + 14], [tx - 2 + i * 11, trackY - 8]], 12, S().ink);
  seg(g, [[tx - 6, hy + 8], [tx - 22, hy + 34]], 12, S().ink); // thumb, curled back
  g.fillStyle = alpha(S().ink, 0.35);
  g.beginPath(); g.ellipse(tx + 8, trackY + 22, 52, 10, 0, 0, 7); g.fill(); // contact shadow on the rail
  if (prog(t, 1.8, 2.2) > 0) FX.rings(g, tx, trackY, t - 1.8, { count: 2, r0: 30, r1: 180, color: M.key, a: 0.4 });
  FX.dust(g, t, { count: 30, color: '#ffe0b0', a: 0.3 });
} });

// s098 — "Behind the sliding wall, there was a heavy metal door." FREEZE FRAME.
// The one intentional static shot: heavy metal door, frozen droplets, cool tint, STILL badge.
registerShot('s098', { draw(g, t, info) {
  const cam = { z: 1, x: 0 }; // STATIC — intentional hold (the video's freeze frame)
  const { GY, CX, M } = basement(g, t, cam, { doorGlow: true });
  layer(g, cam, 1, (g) => {
    FX.drops(g, 0, { count: 60, color: '#cfe0ff', rMax: 12, drift: 2 });
    // a heavy shadow slowly creeping over the rusted door
    const dx = CX + V(380, 300), dy = GY - V(540, 780), dw = V(280, 220), dh = V(540, 780);
    g.fillStyle = alpha(S().ink, 0.38 * prog(t, 0, info.dur));
    g.fillRect(dx - 6, dy - 6, (dw + 12) * prog(t, 0, info.dur), dh + 12);
    FX.rings(g, dx + dw / 2, dy + dh / 2, t, { count: 3, r0: 140, r1: 560, speed: 0.3, color: '#e8f0ff', a: 0.3 });
  });
  veil(g, M.key, 0.16); // cool tint
  UI.badge(g, { str: 'STILL', a: ease.out(prog(t, 0.3, 0.8)) });
} });
