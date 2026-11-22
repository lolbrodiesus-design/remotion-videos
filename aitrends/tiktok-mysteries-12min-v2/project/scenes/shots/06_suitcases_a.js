// shots/06_suitcases_a.js — Story 6 (Alki Beach), part A: s150a–s157.
// 3D beach establishings + the discovery of the suitcase.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, text, FONTS, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, backdrop } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { beach } from '../sets/beach.js';
import { TEEN } from '../cast.js';

// Big black suitcase prop (never opened on screen). x,y = ground point under it.
function suitcaseProp(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -140, -260, 280, 260, 18); g.fillStyle = S().ink; g.fill();
  rr(g, -140, -260, 280, 260, 18); g.strokeStyle = shade(S().ink, 0.3); g.lineWidth = 5; g.stroke();
  seg(g, [[-140, -130], [140, -130]], 5, shade(S().ink, 0.3));
  seg(g, [[-140, -200], [140, -200]], 3, shade(S().ink, 0.18));
  rr(g, -52, -296, 104, 40, 10); g.fillStyle = S().ink; g.fill();
  rr(g, -70, -330, 140, 26, 12); g.fillStyle = mix(S().ui.gold, S().ink, 0.45); g.fill();   // rusty silver handle
  glow(g, 0, -320, 60, S().ui.gold, 0.15);
  g.restore();
}

// --- 3D Alki Beach stage (shared by s150a + s150b) ---
function buildBeach3D(T) {
  const M = mood('dusk');
  const st = T.stage({ mood: 'dusk', fov: V(38, 52), fog: [18, 70], keyPos: [8, 9, -6], keyIntensity: 2.4, ambient: 1.1 });
  st.add(T.ground(90, 90, '#8a6a52'));
  const sea = T.ground(90, 40, '#3a4a7a'); sea.position.set(0, 0.05, -32); st.add(sea);
  for (let i = 0; i < 5; i++) st.add(T.box(0.5, 2.2, 0.5, '#3a2c34', 6 + i * 2.4, 1.1, -14));   // pier posts
  st.add(T.box(14, 0.4, 2.5, '#4a3428', 11, 2.3, -14));                                          // pier deck
  st.add(T.box(2.2, 1.4, 1.8, '#4a3a40', -6, 0.7, 5));                                           // rocks, left
  st.add(T.box(1.6, 1.0, 1.4, '#3a2c34', -4, 0.5, 6.5));
  st.add(T.box(0.9, 0.7, 0.5, '#14101c', -5, 0.35, 7));                                          // black suitcase by the rocks
  const t1 = T.figure3D(TEEN, { rim: M.rim, pose: POSES.stand }); t1.position.set(-2, 0, 4); st.add(t1);
  const t2 = T.figure3D(TEEN, { rim: M.rim, pose: POSES.stand }); t2.position.set(0.5, 0, 5); t2.rotation.y = 0.6; st.add(t2);
  const t3 = T.figure3D(TEEN, { rim: M.rim, pose: POSES.phone }); t3.position.set(2.5, 0, 3.5); t3.rotation.y = -0.4; st.add(t3);
  for (const [gx, gy, gz] of [[-4, 6, -6], [0, 7, -10], [5, 5.5, -4]]) st.add(T.box(0.5, 0.06, 0.12, '#f2efe8', gx, gy, gz)); // gulls
  return { stage: st };
}

// s150a — 3D high orbit over Alki Beach and the pier; three teens walk the distant dunes.
registerShot('s150a', {
  kind: '3d',
  init(T) { return buildBeach3D(T); },
  draw(s, t, info, T) {
    T.orbit(s.stage.camera, t, { target: [2, 0.8, -2], radius: [15, 10], height: [5, 2.8], from: -0.7, to: 0.5, dur: info.dur });
  },
  overlay(g, t) { FX.dust(g, t, { count: 20, color: '#ffd9b0', a: 0.25 }); },
});

// s150b — 3D low dolly along the sand toward the pier (different camera path from s150a).
// FIX (QC v4): the old path drove the camera at 1.0–1.2 m from z=9 to z=2.5,
// straight through the three teens (z 3.5–5, ~1.7 m tall) and past the suitcase,
// so the frame filled with one huge black object. New path: wide left of every
// figure, 2.2–2.4 m up (above head height), stopping well short of them; the
// look sweeps from the suitcase and rocks across to the pier, so sand, sea,
// suitcase and pier all read. Dusk light unchanged.
registerShot('s150b', {
  kind: '3d',
  init(T) { return buildBeach3D(T); },
  draw(s, t, info, T) {
    T.dolly(s.stage.camera, t, [
      [0, { pos: [-11.5, 2.4, 12.5], look: [-4, 0.6, 5], fov: 46 }],
      [info.dur, { pos: [-7.5, 2.2, 7.5], look: [9, 1.6, -14], fov: 46 }],
    ]);
  },
  overlay(g, t) { FX.dust(g, t, { count: 20, color: '#ffd9b0', a: 0.25 }); },
});

// s151 — silhouette face variant: teen in yellow cap, head bowed, face masked by shadow, sun behind.
registerShot('s151', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  const cam = { z: 1.04 + 0.05 * k, y: lerp(50, -30, k), x: -20 * k };
  const { GY, CX, M } = beach(g, t, cam);
  const rim = { color: M.rim, dir: [1, -0.3], w: 5 };
  const bow = { ...POSES.stand, head: [12, -196], hF: [24, -172], eF: [18, -136], hB: [-14, -150], eB: [-18, -110] };
  const fx = CX + V(180, 120), s = 1.7;
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: fx, y: GY, s, facing: 1, outfit: TEEN, pose: breathe(bow, t), expr: 'sad', rim, blink: (t % 3.4) > 3.3 });
    // shadow masking the face: dark veil over the lower half of the head only, cap stays yellow
    const [hx, hy, hr] = headPos({ x: fx, y: GY, s, facing: 1, pose: bow });
    g.save(); g.beginPath(); g.ellipse(hx, hy + hr * 0.35, hr * 0.98, hr * 0.72, 0, 0, Math.PI * 2); g.clip();
    g.fillStyle = alpha(S().ink, 0.78); g.fillRect(hx - hr, hy - hr, hr * 2, hr * 2); g.restore();
  });
  FX.godRays(g, CX + V(500, 240), GY - V(330, 760), { count: 8, angle: -Math.PI / 2, spread: Math.PI, len: 1200, a: 0.06, t });
  FX.lensStreak(g, CX + V(500, 240), GY - V(330, 760), E.W * 1.1, M.key, 0.16);
  FX.fog(g, GY - 90, 150, M.fog, 0.2);
} });

// s152 — insert: glowing digital clock numbers "06/19"; slow zoom-out reveals the car dashboard in the dark.
registerShot('s152', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: lerp(1.16, 1.0, k), r: lerp(0.02, 0, k) };
  g.fillStyle = shade(M.dark, -0.2); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  layer(g, cam, 0.5, (g) => {
    // dashboard shelf + steering wheel silhouette, revealed by the zoom-out
    rr(g, -E.W, E.H * 0.72, E.W * 3, 420, 60); g.fillStyle = shade(M.wall, -0.5); g.fill();
    ring(g, E.W * 0.2, E.H * 0.86, 150, 20, shade(M.wall, -0.35));
    ring(g, E.W * 0.2, E.H * 0.86, 60, 12, shade(M.wall, -0.35));
    // glowing clock
    glow(g, E.W / 2, E.H * 0.42, 260, M.key, 0.5);
    rr(g, E.W / 2 - 300, E.H * 0.42 - 110, 600, 220, 16); g.fillStyle = shade(M.dark, 0.1); g.fill();
    g.strokeStyle = alpha(M.key, 0.5); g.lineWidth = 3; g.stroke();
    text(g, '06/19', E.W / 2, E.H * 0.42 + 8, { size: 150, color: M.key, font: FONTS.ui, weight: 900, glow: 34, glowColor: alpha(M.key, 0.8) });
    text(g, 'JUNE 19, 2020', E.W / 2, E.H * 0.42 + 92, { size: 30, color: alpha(S().ui.cream, 0.75), font: FONTS.ui, weight: 900, spacing: 4 });
  });
  FX.dust(g, t, { count: 18, color: M.key, a: 0.2 });
  FX.fog(g, E.H * 0.6, 200, M.fog, 0.15);
} });

// s153 — medium: teens on the sand point and step back; jagged wet rock in the foreground; cold moonlight on the waves.
registerShot('s153', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  const cam = { z: 1.03 + 0.05 * k, x: lerp(30, -50, k) };
  const { GY, CX, M } = beach(g, t, cam, { mood: 'night' });
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: CX - V(220, 160), y: GY, s: 1.5, facing: 1, outfit: TEEN, pose: breathe(posesAt(t, [[0, 'stand'], [0.5, 'point']]), t), expr: 'surprised', rim, blink: (t % 3.1) > 3.0 });
    const bx = CX + V(260, 200) - t * 40;   // second teen stepping back
    drawFigure(g, { x: bx, y: GY, s: 1.5, facing: -1, outfit: TEEN, pose: breathe(walkPose(t * 2.2), t, 1, 2), expr: 'worried', rim, blink: (t % 3.7) > 3.6 });
  });
  blurLayer(g, 10, (g) => {   // jagged wet rock, foreground
    poly(g, [[-80, E.H + 40], [120, E.H * 0.62], [300, E.H * 0.78], [430, E.H * 0.66], [620, E.H + 40]], shade(M.wall, -0.55));
    glow(g, 300, E.H * 0.8, 200, M.key, 0.08);
  }, cam, 1.7);
  FX.fog(g, GY - 100, 160, M.fog, 0.25);
  FX.stars(g, t, { seed: 21, count: 30, area: [0, 0, E.W, E.H * 0.3], color: '#dfe8ff' });
} });

// s154a — UI: Randonautica phone map; pulsing blue coordinate dot on a navy grid, radar sweep, pin dropping.
registerShot('s154a', { draw(g, t, info) {
  const M = mood('void'), k = ease.inOut(t / info.dur);
  const cam = { z: 1 + 0.08 * k, x: -20 * k };
  backdrop(g, M.sky);
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 520, py = 150, pw = 1040, ph = 720;
    FX.screen(g, { x: px, y: py, w: pw, h: ph, bg: '#0e1a30', glowC: S().ui.blueprint, a: 0.3 }, (g, x, y, w, h) => {
      g.strokeStyle = alpha(S().ui.blueprint, 0.16); g.lineWidth = 1;
      for (let gx = x; gx <= x + w; gx += 60) { g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); }
      for (let gy = y; gy <= y + h; gy += 60) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); }
      // coastline
      g.strokeStyle = alpha(S().ui.blueprint, 0.5); g.lineWidth = 3;
      g.beginPath(); g.moveTo(x, y + h * 0.75); g.bezierCurveTo(x + w * 0.3, y + h * 0.55, x + w * 0.6, y + h * 0.8, x + w, y + h * 0.5); g.stroke();
      const dx = x + w * 0.58, dy = y + h * 0.42;
      // radar sweep
      const ang = t * 1.4;
      seg(g, [[dx, dy], [dx + Math.cos(ang) * 220, dy + Math.sin(ang) * 220]], 3, alpha(S().ui.blueprint, 0.6));
      // pulsing coordinate dot
      const pulse = 1 + 0.25 * Math.sin(t * 4);
      glow(g, dx, dy, 90 * pulse, S().ui.blueprint, 0.7);
      circle(g, dx, dy, 16 * pulse, S().ui.blueprint);
      ring(g, dx, dy, 34 + 14 * Math.sin(t * 4), 3, alpha(S().ui.blueprint, 0.7));
      // pin dropping onto the dot
      const pk = ease.out(prog(t, 0.4, 1.0));
      const pinY = dy - 190 + 190 * pk;
      poly(g, [[dx - 14, pinY - 26], [dx + 14, pinY - 26], [dx, pinY + 6]], S().ui.accent);
      circle(g, dx, pinY - 26, 15, S().ui.accent);
      text(g, 'RANDONAUTICA', x + 30, y + 52, { size: 30, color: alpha(S().ui.cream, 0.85), font: FONTS.ui, weight: 900, align: 'left', spacing: 3 });
    });
  });
  FX.dust(g, t, { count: 16, color: S().ui.blueprint, a: 0.2 });
} });

// s154b — insert: fingertip taps the phone map; a small white ripple spreads on the glass.
// FIX (QC v4): the old "fingertip" was two giant segs (width 64–90) spanning the
// whole frame corner-to-corner — a yellow diagonal beam. Redrawn at believable
// scale: one slim ink finger (24 wide) with a small fingertip pad, entering from
// the bottom edge just below the tap point, a yellow tee cuff at the wrist, a
// thin rim of dusk light along its lit side. The map + beach/pier behind stay.
registerShot('s154b', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: lerp(1.12, 1.0, k), x: 20 * k };
  blurLayer(g, 14, (g) => beach(g, t, { z: 1.6, x: 200, y: -80 }, {})); veil(g, '#120a10', 0.3);
  const px = E.W / 2 - 260, py = 120, pw = 520, ph = 780;
  const tap = [px + pw * 0.66, py + ph * 0.68];
  layer(g, cam, 1, (g) => {
    FX.screen(g, { x: px, y: py, w: pw, h: ph, bg: '#0e1a30', glowC: S().ui.blueprint, a: 0.35 }, (g, x, y, w, h) => {
      g.strokeStyle = alpha(S().ui.blueprint, 0.18); g.lineWidth = 1;
      for (let gx = x; gx <= x + w; gx += 52) { g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); }
      for (let gy = y; gy <= y + h; gy += 52) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); }
      // coastline on the glowing map
      g.strokeStyle = alpha(S().ui.blueprint, 0.5); g.lineWidth = 3;
      g.beginPath(); g.moveTo(x, y + h * 0.8); g.bezierCurveTo(x + w * 0.3, y + h * 0.62, x + w * 0.6, y + h * 0.82, x + w, y + h * 0.55); g.stroke();
      circle(g, tap[0], tap[1], 12, S().ui.blueprint);
      ring(g, tap[0], tap[1], 26, 3, alpha(S().ui.blueprint, 0.7));
    });
    // fingertip coming down onto the glass: hovers, then presses at t 0.5–0.9
    const press = ease.out(prog(t, 0.5, 0.9));
    const ex = tap[0] + 130, ey = E.H + 30;                                   // entry, off the bottom edge
    const tip = [tap[0], tap[1] + 34 * (1 - press)];
    const dx = tip[0] - ex, dy = tip[1] - ey, len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    seg(g, [[ex - ux * 10, ey - uy * 10], [ex + ux * 70, ey + uy * 70]], 46, TEEN.color);   // yellow tee cuff at the wrist
    seg(g, [[ex + ux * 60, ey + uy * 60], [tip[0] - ux * 10, tip[1] - uy * 10]], 24, S().ink); // the finger, slim
    circle(g, tip[0] - ux * 95, tip[1] - uy * 95, 13, S().ink);                            // knuckle bump
    circle(g, tip[0], tip[1], 15, S().ink);                                                 // fingertip pad
    seg(g, [[ex + ux * 60 - uy * 11, ey + uy * 60 + ux * 11], [tip[0] - ux * 10 - uy * 11, tip[1] - uy * 10 + ux * 11]], 3, alpha(M.rim, 0.8)); // rim light
    glow(g, tap[0], tap[1], 80, S().ui.blueprint, 0.35);
    if (t > 0.9) FX.rings(g, tap[0], tap[1], t - 0.9, { count: 3, r0: 14, r1: 150, speed: 1.6, color: '#ffffff', a: 0.6 * (1 - prog(t, 0.9, 1.9)) });
  });
  FX.dust(g, t, { count: 14, color: S().ui.blueprint, a: 0.2 });
} });

// s155 — medium: teens walk the sand filming; one holds the phone up, the other scans the rocks; shaky walking motion.
registerShot('s155', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  const sh = shake(t, 4, 1.3, 5);
  const cam = { z: 1.03 + 0.04 * k, x: lerp(40, -60, k) + sh[0], y: sh[1] * 0.5 };
  const { GY, CX, M } = beach(g, t, cam);
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    const wob = Math.sin(t * 5) * 6;
    drawFigure(g, { x: CX - V(240, 180) + t * 60, y: GY + wob, s: 1.6, facing: 1, outfit: TEEN, pose: breathe(POSES.phone, t), prop: 'phone', expr: 'happy', rim, blink: (t % 3.2) > 3.1 });
    drawFigure(g, { x: CX + V(240, 180) + t * 60, y: GY, s: 1.6, facing: 1, outfit: TEEN, pose: breathe(walkPose(t * 5.6), t, 1, 2), expr: 'neutral', rim, blink: (t % 3.9) > 3.8 });
  });
  FX.dust(g, t, { count: 24, color: '#ffd9b0', a: 0.25 });
  FX.lensStreak(g, CX + V(500, 240), GY - V(330, 760), E.W, M.key, 0.12);
} });

// s156 — insert: the black suitcase wedged in the rocks under the pier; pier-slat shadows drift across it.
registerShot('s156', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.06 + 0.04 * k, x: lerp(-40, 40, k) };
  blurLayer(g, 12, (g) => beach(g, t, { z: 1.5, x: 260, y: -100 }, { suitcase: true })); veil(g, '#120a10', 0.28);
  layer(g, cam, 1, (g) => {
    suitcaseProp(g, E.W / 2, E.H * 0.86, 2.2, -0.04);
    // pier-slat shadows drifting slowly across the black surface
    g.save(); g.beginPath(); g.rect(E.W / 2 - 320, E.H * 0.86 - 580, 640, 580); g.clip();
    for (let i = 0; i < 5; i++) {
      const sx = E.W / 2 - 360 + i * 170 - t * 46;
      poly(g, [[sx, E.H * 0.86 - 580], [sx + 46, E.H * 0.86 - 580], [sx + 90, E.H * 0.86], [sx + 44, E.H * 0.86]], alpha(S().ink, 0.5));
    }
    g.restore();
    // water lapping at the base
    const foam = 0.35 + 0.2 * Math.sin(t * 2.2);
    g.fillStyle = alpha(S().feature, foam);
    g.beginPath(); g.ellipse(E.W / 2, E.H * 0.86 + 6, 330, 14 + 6 * Math.sin(t * 2.2), 0, 0, Math.PI * 2); g.fill();
  });
  FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 1.1, M.key, 0.14);
  FX.dust(g, t, { count: 16, color: '#ffd9b0', a: 0.22 });
} });

// s157 — medium: the teen recoils, pulling the yellow tee up over mouth and nose; suitcase out of focus behind.
// (TEEN's locked outfit is a yellow tee, not a hoodie — the tee is pulled up over the mouth.)
registerShot('s157', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  const cam = { z: 1.04 + 0.05 * k, y: lerp(-30, 40, k) };
  const { GY, CX, M } = beach(g, t, cam);
  const rim = { color: M.rim, dir: [0, -1], w: 4 };
  blurLayer(g, 8, (g) => suitcaseProp(g, CX + V(430, 320), GY + 10, 1.1, 0.05), cam, 0.85);
  const recoil = ease.out(prog(t, 0.2, 0.9));
  const pose = { ...POSES.stand, hF: [22, -168 - recoil * 8], eF: [16, -128], hB: [-16, -120], eB: [-20, -80] };
  layer(g, cam, 1, (g) => {
    const fx = CX - V(120, 80) - recoil * 46;
    drawFigure(g, { x: fx, y: GY, s: 1.7, facing: 1, outfit: TEEN, pose: breathe(pose, t), expr: 'scared', rim, rot: -0.08 * recoil, blink: (t % 2.8) > 2.7 });
    // yellow tee pulled up over the mouth and nose
    const [hx, hy, hr] = headPos({ x: fx, y: GY, s: 1.7, facing: 1, pose });
    g.save(); g.translate(hx + hr * 0.25, hy + hr * 0.55); g.rotate(-0.15);
    rr(g, -hr * 0.95, -hr * 0.5, hr * 1.9, hr * 1.0, hr * 0.45); g.fillStyle = TEEN.color; g.fill();
    seg(g, [[-hr * 0.5, -hr * 0.2], [hr * 0.5, -hr * 0.25]], 3, shade(TEEN.color, -0.3));
    seg(g, [[-hr * 0.4, hr * 0.15], [hr * 0.4, hr * 0.1]], 3, shade(TEEN.color, -0.3));
    g.restore();
  });
  FX.dust(g, t, { count: 18, color: '#ffd9b0', a: 0.25 });
  FX.fog(g, GY - 80, 140, M.fog, 0.18);
} });
