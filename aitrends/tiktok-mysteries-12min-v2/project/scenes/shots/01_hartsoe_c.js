// shots/01_hartsoe_c.js — Hartsoe story, part C: s017–s024 (comparisons → the hidden apartment).
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly, text, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom } from '../sets/bathroom.js';
import { livingroom } from '../sets/livingroom.js';
import { SAMANTHA } from '../cast.js';

const rim = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 4 });

function hammer(g, x, y, ang, s = 1, glint = 0) {
  g.save(); g.translate(x, y); g.rotate(ang);
  seg(g, [[0, 0], [0, -90 * s]], 12 * s, '#3a2c22');
  rr(g, -34 * s, -112 * s, 68 * s, 26 * s, 6 * s); g.fillStyle = '#8d97a3'; g.fill();
  seg(g, [[34 * s, -99 * s], [58 * s, -112 * s]], 10 * s, '#8d97a3');
  if (glint > 0) FX.sparkle(g, 20 * s, -100 * s, 26 * s, '#ffe9b0', glint);
  g.restore();
}

// s017 — "People compared it to horror films."  Insert: hand over her mouth, phone light on her face
registerShot('s017', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.05, x: lerp(40, -40, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mood: 'interiorCool' });
  const overMouth = { ...POSES.phone, hF: [28, -178], eF: [22, -150] };
  layer(g, cam, 1, (g) => {
    const jx = Math.sin(t * 22) * 3;
    drawFigure(g, { x: E.W / 2 + jx, y: GY, s: 1.5, facing: -1, outfit: SAMANTHA, pose: breathe(overMouth, t), expr: 'scared', prop: { type: 'phone', hand: 'B' }, rim: rim(M, [-1, -0.3]), blink: (t % 2.9) > 2.8 });
    const [hx, hy] = headPos({ x: E.W / 2 + jx, y: GY, s: 1.5, facing: -1, pose: overMouth });
    glow(g, hx - 30, hy + 10, 150, '#9fd8ff', 0.35);
    FX.lightCone(g, hx - 40, hy + 20, { angle: Math.PI, spread: 0.5, len: 320, color: '#9fd8ff', a: 0.08 });
  });
  FX.fog(g, E.H * 0.7, 150, '#8fb4ff', 0.18);
  FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.3 });
} });

// s018 — "They said it was like Candyman."  Wide: a long dark corridor with many doors
registerShot('s018', { draw(g, t, info) {
  const D = info.dur, M = mood('night');
  const cam = { z: 1 + 0.05 * ease.inOut(t / D), x: lerp(-40, 40, ease.inOut(t / D)) };
  const { GY } = livingroom(g, t, cam, { variant: 'hallway' });
  // a small figure at the far end, one long thin shadow stretching toward camera
  layer(g, cam, 1, (g) => {
    g.fillStyle = 'rgba(0,0,0,.5)';
    g.beginPath(); g.ellipse(E.W / 2 + 60, GY + 120, 320, 14, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(E.W / 2 + 40, GY + 110); g.lineTo(E.W / 2 + 90, GY + 110); g.lineTo(E.W / 2 + 320, GY + 210); g.lineTo(E.W / 2 + 160, GY + 210); g.closePath(); g.fill();
    drawFigure(g, { x: E.W / 2 + 60, y: GY + 60, s: 0.6, facing: -1, outfit: SAMANTHA, pose: breathe(POSES.stand, t, 1, 4), expr: 'worried', rim: { color: M.rim, dir: [0, -1] }, shadow: false });
  });
  FX.fog(g, GY - 120, 180, M.fog, 0.25);
  FX.dust(g, t, { count: 22, color: '#cfe0ff', a: 0.28 });
} });

// s019 — "They said it was like Parasite."  Insert: low-angle basement stair, one drop into a dark puddle
registerShot('s019', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.15, y: lerp(-30, 50, ease.inOut(t / D)) };
  const { GY } = livingroom(g, t, cam, { variant: 'bare' });
  layer(g, cam, 1, (g) => {
    // low-angle staircase descending from the top-left toward the camera
    const sx0 = E.W * 0.05, sy0 = E.H * 0.06, sw = 860, sh = 88;
    for (let i = 0; i < 7; i++) {
      const y = sy0 + i * sh, w = sw - i * 46, x = sx0 + i * 22;
      // step face (riser), darker the lower it gets
      g.fillStyle = shade(M.wall, -0.28 - i * 0.05);
      g.fillRect(x, y, w, sh);
      // tread nosing — a cold lit top edge on every step
      g.fillStyle = alpha('#cfe0ff', 0.5 - i * 0.05);
      g.fillRect(x, y, w, 7);
      // step side shadow
      g.fillStyle = 'rgba(0,0,0,.3)';
      g.fillRect(x + w - 26, y, 26, sh);
    }
    // handrail descending along the right side of the stair
    const rx0 = sx0 + sw + 60, ry0 = sy0 - 30, rx1 = sx0 + 300, ry1 = sy0 + 7 * sh + 40;
    seg(g, [[rx0, ry0], [rx1, ry1]], 16, shade(S().ink, 0.4));
    seg(g, [[rx0, ry0 + 26], [rx1, ry1 + 26]], 8, shade(S().ink, 0.25));
    for (let i = 0; i < 6; i++) {
      const k = i / 5, bx = lerp(rx0, rx1, k), by = lerp(ry0, ry1, k);
      seg(g, [[bx, by], [bx + 30, by + 150]], 7, shade(S().ink, 0.3));
    }
    // dark indigo puddle
    const px = E.W * 0.62, py = GY + 120;
    g.fillStyle = '#141a38'; g.beginPath(); g.ellipse(px, py, 260, 34, 0, 0, 7); g.fill();
    glow(g, px, py, 200, '#8fb4ff', 0.12);
    // one drop falling, then ripples
    const fall = ease.in(prog(t, 0.2, 1.3));
    const dy = lerp(E.H * 0.2, py - 6, fall);
    if (fall < 1) circle(g, px, dy, 7, '#cfe0ff');
    if (fall >= 1) FX.rings(g, px, py, t - 1.3, { count: 3, r0: 20, r1: 200, speed: 0.9, color: '#9fc8ff', a: 0.5 });
    FX.lightCone(g, E.W * 0.8, E.H * 0.1, { angle: Math.PI / 2, spread: 0.5, len: 500, color: '#8fb4ff', a: 0.07 });
  });
  FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.3 });
} });

// s020 — "They told her not to go in."  UI: phone notification bubble — "DON'T GO"
registerShot('s020', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.5, x: 100, y: lerp(40, -30, ease.inOut(t / D)) }, { mood: 'interiorCool' })); veil(g, '#0a1024', 0.42);
  // comment bubbles rising up the glass
  for (let i = 0; i < 5; i++) {
    const rise = ((t * 60 + i * 130) % 500);
    const bx = E.W * 0.18 + (i % 2) * 90, by = E.H * 0.85 - rise;
    const a = rise < 60 ? rise / 60 : 1 - (rise - 60) / 440;
    UI.bubble(g, bx, by, { w: 110, h: 64, color: `rgba(244,239,230,${clamp(a, 0, 1).toFixed(3)})` });
  }
  // the notification itself, popping in sharp and white
  const pop = ease.outBack(prog(t, 0.3, 0.8));
  g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(pop, pop);
  UI.bubble(g, 0, 0, { w: 620, h: 170, str: "DON'T GO" });
  g.restore();
  glow(g, E.W / 2, E.H * 0.42, 300, '#ffffff', 0.12 * pop);
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });

// s021 — "But Samantha did go in."  Medium: adjusting her headlamp strap over her black beanie
registerShot('s021', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorWarm');
  const cam = { z: 1.05 + 0.04 * ease.inOut(t / D), x: Math.sin(t * 1.0) * 30 };
  const { GY } = bathroom(g, t, cam, { mood: 'interiorWarm' });
  // warm hallway light behind her, from the right
  glow(g, E.W * 0.92, GY - 420, 320, '#ffd9a0', 0.3);
  const strap = { ...POSES.stand, eF: [24, -190], hF: [30, -206], eB: [-10, -150], hB: [-22, -122] };
  const fx0 = E.W / 2, s = 1.5;
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: fx0, y: GY, s, facing: 1, outfit: SAMANTHA, pose: breathe(strap, t), expr: 'determined', rim: rim(M, [1, -0.4]), blink: (t % 3.1) > 3.0 });
    // headlamp on her forehead
    const [hx, hy, hr] = headPos({ x: fx0, y: GY, s, facing: 1, pose: strap });
    circle(g, hx + hr * 0.6, hy - hr * 0.5, 12, '#fff3dc');
    glow(g, hx + hr * 0.6, hy - hr * 0.5, 110, '#fff3dc', 0.7);
    FX.lightCone(g, hx + hr * 0.6, hy - hr * 0.5, { angle: 0, spread: 0.4, len: 520, color: '#fff3dc', a: 0.14 });
    // hammer in her far hand
    const hbx = fx0 + strap.hB[0] * s, hby = GY + strap.hB[1] * s;
    hammer(g, hbx, hby, 0.7, 0.9, 0.4 + 0.3 * Math.sin(t * 3));
  });
  FX.dust(g, t, { count: 22, color: '#ffe2b0', a: 0.3 });
} });

// s022a — "She put on a headlamp, she grabbed a …"  Wide: climbing through the bathroom wall hole
registerShot('s022a', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.1 + 0.15 * ease.inOut(t / D), x: lerp(-60, 40, ease.inOut(t / D)), y: lerp(30, -20, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mirrorOff: true, mood: 'interiorCool' });
  const hx0 = E.W / 2 - 160, hy0 = GY - 60;
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: hx0, y: hy0, s: 1.2, facing: 1, outfit: SAMANTHA, pose: breathe(POSES.crouch, t), expr: 'determined', rim: rim(M, [1, -0.3]) });
    const [hx, hy, hr] = headPos({ x: hx0, y: hy0, s: 1.2, facing: 1, pose: POSES.crouch });
    circle(g, hx + hr * 0.6, hy - hr * 0.5, 11, '#fff3dc');
    glow(g, hx + hr * 0.6, hy - hr * 0.5, 100, '#fff3dc', 0.7);
    // headlamp beam cutting a bright white cone into the darkness
    FX.lightCone(g, hx + hr * 0.6, hy - hr * 0.5, { angle: 0.15, spread: 0.42, len: 760, color: '#fff3dc', a: 0.2 });
    FX.pool(g, hx0 + 260, GY + 30, 220, 22, '#fff3dc', 0.1);
  });
  FX.dust(g, t, { count: 30, color: '#dfe8ff', a: 0.38 });
  FX.fog(g, GY - 60, 130, '#8fb4ff', 0.16);
} });

// s022b — "… hammer for protection, and she climbed through the hole."  Insert: a metal hammer head, gripped tight
registerShot('s022b', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  blurLayer(g, 14, (g) => bathroom(g, t, { z: 1.8, x: -200, y: -100 }, { mirrorOff: true, mood: 'interiorCool' })); veil(g, '#05040a', 0.5);
  const sc = 1.15 + 0.25 * ease.inOut(t / D);
  const hx = E.W * 0.5, hy = E.H * 0.55;
  g.save(); g.translate(hx, hy); g.scale(sc, sc); g.translate(-hx, -hy);
  // thin tapered forearm entering from the frame edge, hand gripping the hammer
  const ex = hx + 190, ey = hy + 260;              // elbow
  const shx = E.W + 120, shy = hy + 480;           // shoulder, off the frame edge
  seg(g, [[shx, shy], [ex, ey]], 42, SAMANTHA.color);   // pink sleeve, shoulder → elbow
  seg(g, [[ex, ey], [hx + 66, hy + 150]], 26, S().ink); // bare forearm, thin and tapered
  seg(g, [[hx + 96, hy + 168], [hx + 66, hy + 150]], 19, S().ink);
  seg(g, [[ex - 4, ey - 14], [hx + 70, hy + 134]], 4, alpha(M.rim, 0.8)); // rim light on the forearm
  circle(g, hx + 40, hy + 130, 44, S().ink);        // gripping hand
  for (let i = 0; i < 4; i++) circle(g, hx + 8 + i * 6, hy + 92 + i * 22, 14, S().ink); // fingers wrapped on the handle
  hammer(g, hx + 10, hy + 60, -0.6, 2.2, 0.6 + 0.4 * Math.sin(t * 4));
  glow(g, hx + 30, hy - 40, 170, '#ffcf8a', 0.35);  // amber glint on the hammer head
  g.restore();
  FX.lensStreak(g, hx + 60, hy - 60, E.W * 0.8, '#ffe9b0', 0.2);
  FX.dust(g, t, { count: 14, color: '#cfe0ff', a: 0.3 });
} });

// s023 — "On the other side, she did not find a small cupboard."  Wide: a hollowed-out living room
registerShot('s023', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.15 - 0.12 * ease.inOut(t / D) };
  const { GY } = livingroom(g, t, cam, { variant: 'bare' });
  // massive geometric shadows cast by the exposed wall studs
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = 'rgba(0,0,0,.38)';
    for (let i = 0; i < 7; i++) {
      const sx = -E.W * 0.4 + i * 280;
      poly(g, [[sx, GY - 560], [sx + 26, GY - 560], [sx + 420, GY + 60], [sx + 340, GY + 60]], 'rgba(0,0,0,.38)');
    }
  });
  layer(g, cam, 1, (g) => {
    const sx = E.W / 2 - 200, s = 0.95;
    drawFigure(g, { x: sx, y: GY, s, facing: 1, outfit: SAMANTHA, pose: breathe(POSES.stand, t), expr: 'surprised', rim: rim(M, [1, -0.3]) });
    const [hx, hy, hr] = headPos({ x: sx, y: GY, s, facing: 1, pose: POSES.stand });
    circle(g, hx + hr * 0.6, hy - hr * 0.5, 10, '#fff3dc');
    FX.lightCone(g, hx + hr * 0.6, hy - hr * 0.5, { angle: Math.sin(t * 0.9) * 0.5, spread: 0.42, len: 700, color: '#fff3dc', a: 0.16 });
  });
  FX.dust(g, t, { count: 30, color: '#cfe0ff', a: 0.34 });
  FX.fog(g, GY - 100, 160, '#8fb4ff', 0.16);
} });

// s024 — "She found an entire apartment."  Insert: an old-fashioned radiator, dust vibrating on the metal
registerShot('s024', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  // zoom onto the radiator at the left of the bare set
  const cam = { z: 2.2, x: lerp(-620, -680, ease.inOut(t / D)), y: 220 };
  const { GY } = livingroom(g, t, cam, { variant: 'bare' });
  // grey dust motes vibrating on the metallic surface (same layer as the set's radiator)
  const rx = E.W / 2 - 760 + 110, ry = GY - 180 + 75;
  layer(g, cam, 0.55, (g) => {
    for (let i = 0; i < 26; i++) {
      const dx = ((i * 37) % 200) - 100, dy = ((i * 53) % 130) - 65;
      circle(g, rx + dx + Math.sin(t * 30 + i) * 2.5, ry + dy + Math.cos(t * 26 + i * 1.3) * 2.5, 2.5 + (i % 3), alpha('#c8c8d0', 0.55));
    }
    glow(g, rx, ry, 180, '#8fb4ff', 0.1);
  });
  FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.3 });
} });
