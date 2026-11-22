// shots/05_shawne_d.js — Story 5 (Shawne Bolton): s143–s149b.
// Piecing her life together; TikTok helps again — her father is found, DNA confirms it, and she is found.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, rng, S, text, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { office } from '../sets/office.js';
import { livingroom } from '../sets/livingroom.js';
import { SHAWNE } from '../cast.js';

const fatherOutfit = (M) => ({ top: 'tshirt', color: shade(M.wall, 0.25) });
// Doorframe geometry shared by s145 and s146: dark frame at the right edge, warm room beyond it.
const DOOR_X = () => E.W - V(280, 220);
function doorframeRight(g, w = 64) {
  g.fillStyle = '#0c0910'; g.fillRect(DOOR_X(), -E.H, w, E.H * 3);
  g.fillStyle = shade('#0c0910', 0.1); g.fillRect(DOOR_X() - 14, -E.H, 14, E.H * 3);
}

// s143 — "She was piecing her life together, one video at a time." Medium: jigsaw puzzle, a person-shaped piece slides in.
registerShot('s143', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.06 * ease.inOut(t / info.dur), x: lerp(-30, 40, ease.inOut(t / info.dur)) };
  const { GY, M } = office(g, t, cam, { board: true });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - V(420, 330), y: GY, s: V(1.4, 1.5), facing: 1, outfit: SHAWNE,
      pose: breathe(posesAt(t, [[0, 'sit'], [0.5, 'reach']]), t), expr: 'determined',
      rim: { color: M.rim, dir: [1, -0.3] } });
    // jigsaw on the desk: grid of pieces with one central slot
    const px = E.W / 2 + V(180, 140), py = GY - V(190, 260), ps = 86;
    const cols = ['#8a5a86', '#4a6a8a', '#6a8a4a', '#a08a4a'];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
      if (i === 1 && j === 1) continue;
      rr(g, px + i * ps, py + j * ps, ps - 8, ps - 8, 10); g.fillStyle = cols[(i + j) % 4]; g.fill();
      circle(g, px + i * ps + (ps - 8) / 2, py + j * ps - 2, 12, cols[(i + j) % 4]);
    }
    // the person-shaped piece sliding into the central slot
    const pieceX = lerp(px - 260, px + ps, ease.inOut(prog(t, 0.8, 2.2)));
    const pieceY = py + ps + ease.inOut(prog(t, 0.8, 2.2)) * 0;
    rr(g, pieceX, pieceY, ps - 8, ps - 8, 10); g.fillStyle = SHAWNE.color; g.fill();
    circle(g, pieceX + 39, pieceY + 22, 14, S().ink);
    seg(g, [[pieceX + 39, pieceY + 36], [pieceX + 39, pieceY + 62]], 12, S().ink);
    if (t > 2.2) FX.rings(g, pieceX + 39, pieceY + 39, t - 2.2, { count: 2, r0: 30, r1: 160, color: SHAWNE.color, a: 0.4 });
  });
  FX.dust(g, t, { count: 22, color: '#ffe2b0', a: 0.3 });
  FX.lightCone(g, E.W / 2 + V(380, 300), GY - V(300, 420), { angle: Math.PI / 2, spread: 0.7, len: 380, color: '#ffd28a', a: 0.1 });
} });

// s144 — "Then TikTok helped her again." UI: "New Comment" notification banner slides down and pulses.
registerShot('s144', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.04 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur) };
  const { GY, M } = office(g, t, cam, { phoneRing: true });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - V(260, 200), y: GY, s: V(1.5, 1.6), facing: -1, outfit: SHAWNE,
      pose: breathe(posesAt(t, [[0, 'sit'], [0.5, 'phone']]), t), expr: t > 0.9 ? 'surprised' : 'neutral',
      prop: 'phone', rim: { color: M.rim, dir: [1, -0.3] }, blink: (t % 3.1) > 3.0 });
    // phone glow as she looks down at it
    glow(g, E.W / 2 - V(480, 380), GY - V(160, 210), 120, '#ffd28a', 0.4 + 0.2 * Math.sin(t * 5));
  });
  // amber banner sliding down from the top, pulsing once
  const drop = ease.outBack(prog(t, 0.3, 0.8));
  const pulse = 1 + 0.06 * Math.sin(t * 5) * (1 - prog(t, 1.2, 2.0));
  const bw = V(760, 620), bx = E.W / 2 - bw / 2, by = lerp(-160, E.H * 0.1, drop);
  rr(g, bx, by, bw, V(110, 130), 18); g.fillStyle = '#ffb860'; g.fill();
  g.save(); g.scale(pulse, pulse);
  text(g, 'NEW COMMENT', E.W / 2 / pulse, (by + V(68, 80)) / pulse, { size: V(40, 46), color: S().ink });
  g.restore();
  FX.dust(g, t, { count: 20, color: '#ffe2b0', a: 0.3 });
  FX.lensStreak(g, E.W / 2, by + 60, E.W * 0.7, '#ffd28a', 0.15);
} });

// s145 — "A follower helped her track down her biological father." Insert: finger sliding across a digital map to Home.
registerShot('s145', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * ease.inOut(t / info.dur), x: 24 * ease.inOut(t / info.dur) };
  const M = mood('night');
  blurLayer(g, 10, (g) => office(g, t, cam, {})); veil(g, '#0e0a14', 0.38);
  const cx = E.W / 2 - 60, cy = E.H * 0.52;
  // digital map: dark streets, glowing route
  rr(g, cx - V(520, 420), cy - V(300, 400), V(1040, 840), V(600, 800), 14); g.fillStyle = '#121a2e'; g.fill();
  g.strokeStyle = alpha(S().ui.blueprint, 0.5); g.lineWidth = 5;
  seg(g, [[cx - 480, cy - 100], [cx + 480, cy - 140]], 5, alpha(S().ui.blueprint, 0.5));
  seg(g, [[cx - 200, cy - 280], [cx - 160, cy + 260]], 5, alpha(S().ui.blueprint, 0.5));
  seg(g, [[cx + 100, cy - 260], [cx + 160, cy + 280]], 5, alpha(S().ui.blueprint, 0.4));
  // route drawing itself toward the Home icon
  const route = ease.inOut(prog(t, 0.3, 2.2));
  seg(g, [[cx - 420, cy + 120], [lerp(cx - 420, cx + 260, route), lerp(cy + 120, cy - 60, route)]], 7, S().ui.gold);
  // Home icon, bright, pulsing
  const hx = cx + 260, hy = cy - 60;
  glow(g, hx, hy, 130, S().ui.gold, 0.5 + 0.25 * Math.sin(t * 4));
  poly(g, [[hx - 44, hy], [hx, hy - 44], [hx + 44, hy]], S().ui.gold);
  rr(g, hx - 30, hy, 60, 40, 4); g.fillStyle = S().ui.gold; g.fill();
  // finger sliding across the map
  const fx = lerp(cx - 420, hx - 30, ease.inOut(prog(t, 0.3, 2.2)));
  const fy = lerp(cy + 120, hy + 10, ease.inOut(prog(t, 0.3, 2.2)));
  seg(g, [[fx + 150, fy + 170], [fx + 30, fy + 50]], 52, S().ink);
  circle(g, fx, fy + 30, 34, S().ink);
  // doorway geometry shared with s146: dark frame at the right edge
  doorframeRight(g);
  FX.dust(g, t, { count: 16, color: '#8fb8e8', a: 0.3 });
} });

// s146 — "A DNA test confirmed it was him." Wide: Shawne and her father meeting in a warm-lit room, seen from the dark hallway.
registerShot('s146', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.05 * ease.inOut(t / info.dur), x: 30 * Math.sin(t * 0.5) };
  // warm-lit room (same doorway geometry as s145: frame at the right edge, plus a left frame)
  const { GY, M } = livingroom(g, t, cam, { variant: 'warm' });
  const warm = mood('interiorWarm');
  layer(g, cam, 1, (g) => {
    // the door opens a crack: warm light spills into the corridor
    const open = ease.inOut(prog(t, 0.2, 1.2));
    glow(g, E.W / 2, GY - 200, 420 * (0.4 + open), '#ffd28a', 0.35 + 0.3 * open);
    // Shawne and her father moving toward each other
    const meet = ease.inOut(prog(t, 0.4, 1.9));
    const sx = lerp(E.W / 2 - V(360, 280), E.W / 2 - V(90, 70), meet);
    const fx = lerp(E.W / 2 + V(360, 280), E.W / 2 + V(90, 70), meet);
    drawFigure(g, { x: sx, y: GY, s: V(1.5, 1.6), facing: 1, outfit: SHAWNE,
      pose: breathe(posesAt(t, [[0, 'walk'], [1.9, 'stand']]), t), expr: t > 1.6 ? 'happy' : 'determined',
      rim: { color: warm.rim, dir: [0, -1] }, blink: (t % 3.3) > 3.2 });
    drawFigure(g, { x: fx, y: GY, s: V(1.55, 1.65), facing: -1, outfit: fatherOutfit(warm),
      pose: breathe(posesAt(t, [[0, 'walk'], [1.9, 'stand']]), t, 1, 2), expr: t > 1.6 ? 'happy' : 'neutral',
      rim: { color: warm.rim, dir: [0, -1] } });
    if (meet > 0.95) FX.rings(g, E.W / 2, GY - 260, t - 1.9, { count: 2, r0: 60, r1: 260, color: '#ffd28a', a: 0.35 });
  });
  // dark hallway foreground: blurred dark frame edges + doorframe silhouettes, viewer looking in from the dark
  blurLayer(g, 12, (g) => {
    g.fillStyle = '#0c0910';
    g.fillRect(-E.W, -E.H, V(300, 240), E.H * 3);
    g.fillRect(E.W - V(300, 240), -E.H, V(300, 240), E.H * 3);
    g.fillRect(-E.W, -E.H, E.W * 3, V(120, 100));
  });
  doorframeRight(g);
  g.fillStyle = '#0c0910'; g.fillRect(-E.W, -E.H, V(180, 140), E.H * 3);
  veil(g, '#0c0910', 0.12);
  FX.dust(g, t, { count: 26, color: '#ffe2b0', a: 0.35 });
  FX.lightCone(g, E.W / 2 + V(420, 320), GY - V(380, 520), { angle: Math.PI / 2, spread: 0.9, len: 460, color: '#ffd28a', a: 0.12 });
} });

// s147 — "They are now in contact, and they get on well." Medium: two figures sitting on a porch bench at dusk.
registerShot('s147', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.05 * ease.inOut(t / info.dur), x: lerp(-40, 30, ease.inOut(t / info.dur)) };
  const M = mood('dusk');
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#3d3360', '#8a5a86', '#e8956b', '#f7cf98']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.sun(g, E.W * 0.68, E.H * 0.55, 60, '#f7cf98');
  FX.godRays(g, E.W * 0.68, E.H * 0.55, { color: '#f7cf98', a: 0.12 });
  const GY = E.H * 0.82;
  layer(g, cam, 0.6, (g) => {
    FX.hills(g, { y: GY + 20, amp: 50, color: shade(M.dark, 0.1) });
    // porch bench
    const bx = E.W / 2;
    rr(g, bx - 300, GY - 130, 600, 34, 8); g.fillStyle = '#3a241c'; g.fill();
    rr(g, bx - 300, GY - 260, 600, 34, 8); g.fillStyle = '#3a241c'; g.fill();
    seg(g, [[bx - 270, GY - 96], [bx - 270, GY]], 10, '#241610'); seg(g, [[bx + 270, GY - 96], [bx + 270, GY]], 10, '#241610');
    // two figures seated side by side, silhouettes against the horizon
    drawFigure(g, { x: bx - 110, y: GY, s: V(1.4, 1.5), facing: 1, outfit: SHAWNE,
      pose: breathe(POSES.sit, t), expr: 'smile', rim: { color: M.rim, dir: [1, -0.5] } });
    drawFigure(g, { x: bx + 110, y: GY, s: V(1.45, 1.55), facing: 1, outfit: fatherOutfit(mood('interiorWarm')),
      pose: breathe(POSES.sit, t, 1, 2), expr: 'smile', rim: { color: M.rim, dir: [1, -0.5] } });
  });
  FX.dust(g, t, { count: 22, color: '#f7cf98', a: 0.3 });
  FX.fog(g, GY - 60, 100, M.fog, 0.2);
} });

// s148 — "Shawne had been missing for more than 40 years." Insert: concentric rings of a tree stump.
registerShot('s148', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.06 * ease.inOut(t / info.dur), x: lerp(-60, 60, ease.inOut(t / info.dur)) };
  const M = mood('day');
  // bright daylight behind: Shawne calm at the window (DS zone), stump rings in the foreground
  blurLayer(g, 8, (g) => office(g, t, cam, { mood: 'day' })); veil(g, '#efe3d2', 0.12);
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W * 0.78, y: E.H * V(0.8, 0.68), s: V(1.2, 1.3), facing: -1, outfit: SHAWNE,
      pose: breathe(POSES.stand, t), expr: 'smile', rim: { color: M.rim, dir: [1, -0.3] } });
  });
  // tree stump: concentric rings, camera panning from centre to bark edge
  const cx = E.W / 2 - 80, cy = E.H * 0.56, R = V(340, 360);
  circle(g, cx, cy, R, '#6a4a30');
  circle(g, cx, cy, R - 26, '#8a6242');
  const r = rng(23);
  for (let i = 1; i <= 9; i++) {
    const rr2 = (R - 26) * (i / 9);
    g.strokeStyle = alpha('#4a2c1e', 0.55); g.lineWidth = 3;
    g.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.25) {
      const wob = 1 + 0.06 * Math.sin(a * 3 + i * 2.1);
      const x = cx + Math.cos(a) * rr2 * wob, y = cy + Math.sin(a) * rr2 * wob;
      a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  circle(g, cx, cy, 12, '#4a2c1e');
  glow(g, cx, cy, R, '#ffd28a', 0.12);
  FX.dust(g, t, { count: 18, color: '#ffe2b0', a: 0.3 });
} });

// s149a — "She found the truth herself, on …" Medium: character's hands clasped together.
registerShot('s149a', { draw(g, t, info) {
  const cam = { z: 1.06 - 0.05 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur) };
  const M = mood('day');
  blurLayer(g, 12, (g) => office(g, t, cam, { mood: 'day' })); veil(g, '#efe3d2', 0.1);
  const cx = E.W / 2, cy = E.H * 0.55;
  // clasped hands at believable scale: each hand ~70 long, no longer than the figure's head is wide.
  // Arms enter from the frame edges, purple tracksuit sleeves over their outer halves.
  const tremble = t < 1.0 ? shake(t, 5 * (1 - prog(t, 0, 1.0)), 22) : [0, 0];
  const grip = ease.inOut(prog(t, 1.0, 1.8));
  g.save(); g.translate(tremble[0], tremble[1]);
  const lwX = cx - 96, lwY = cy + 34, rwX = cx + 96, rwY = cy + 34;
  seg(g, [[-40, cy + 260], [lwX, lwY]], 30, S().ink);
  seg(g, [[lerp(-40, lwX, 0.55), lerp(cy + 260, lwY, 0.55)], [lwX, lwY]], 42, SHAWNE.color);
  seg(g, [[E.W + 40, cy + 260], [rwX, rwY]], 30, S().ink);
  seg(g, [[lerp(E.W + 40, rwX, 0.55), lerp(cy + 260, rwY, 0.55)], [rwX, rwY]], 42, SHAWNE.color);
  // grip tightens: the whole clasp draws slightly inward
  g.save(); g.translate(cx, cy); g.scale(1 - grip * 0.05, 1 - grip * 0.05); g.translate(-cx, -cy);
  // palms, small rounded shapes at the wrists
  circle(g, cx - 58, cy + 8, 26, S().ink);
  circle(g, cx + 58, cy + 8, 26, S().ink);
  // left-hand fingers reaching right, knuckles at their bases
  const lFingers = [
    [[cx - 40, cy - 24], [cx + 16, cy - 34]], [[cx - 36, cy - 6], [cx + 22, cy - 14]],
    [[cx - 40, cy + 12], [cx + 16, cy + 6]], [[cx - 46, cy + 28], [cx + 6, cy + 24]],
  ];
  // right-hand fingers reaching left, interleaved between the left ones
  const rFingers = [
    [[cx + 40, cy - 14], [cx - 16, cy - 24]], [[cx + 36, cy + 4], [cx - 22, cy - 4]],
    [[cx + 40, cy + 22], [cx - 16, cy + 16]], [[cx + 46, cy + 36], [cx - 6, cy + 32]],
  ];
  lFingers.forEach(([[x0, y0], [x1, y1]]) => {
    seg(g, [[x0, y0], [x1, y1]], 13, S().ink);
    circle(g, x0, y0, 8, S().ink);
  });
  rFingers.forEach(([[x0, y0], [x1, y1]]) => {
    seg(g, [[x0, y0], [x1, y1]], 13, S().ink);
    circle(g, x0, y0, 8, S().ink);
  });
  // thumbs crossing over the top of the clasp
  seg(g, [[cx - 70, cy - 16], [cx - 30, cy - 42]], 13, S().ink);
  seg(g, [[cx + 70, cy - 16], [cx + 30, cy - 42]], 13, S().ink);
  circle(g, cx - 70, cy - 16, 9, S().ink);
  circle(g, cx + 70, cy - 16, 9, S().ink);
  // thin rim along the lit top edge of the clasp
  seg(g, [[cx - 70, cy - 44], [cx + 70, cy - 44]], 3, M.rim);
  g.restore();
  g.restore();
  glow(g, cx, cy, 240, M.practical, 0.25);
  FX.dust(g, t, { count: 18, color: '#ffe2b0', a: 0.3 });
  FX.lightCone(g, cx, E.H * 0.1, { angle: Math.PI / 2, spread: 0.7, len: 500, color: '#ffd28a', a: 0.1 });
} });

// s149b — "… TikTok, in front of millions of people." Wide: a single figure in a sea of glowing screens.
registerShot('s149b', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: lerp(40, -40, ease.inOut(t / info.dur)) };
  const M = mood('night');
  g.fillStyle = '#070a12'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  // sea of glowing blue rectangles, pulsing
  const r = rng(31);
  const cells = [];
  for (let i = 0; i < 48; i++) {
    const x = r() * E.W, y = r() * E.H * 0.85, w = 60 + r() * 90, h = 40 + r() * 60, ph = r() * 6.28;
    cells.push([x, y, w, h, ph]);
  }
  cells.forEach(([x, y, w, h, ph]) => {
    const a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2 + ph));
    rr(g, x, y, w, h, 6); g.fillStyle = alpha('#3a6ea5', a); g.fill();
    glow(g, x + w / 2, y + h / 2, w, '#3a6ea5', a * 0.4);
  });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2, y: E.H * 0.82, s: V(1.6, 1.7), facing: 1, outfit: SHAWNE,
      pose: breathe(POSES.stand, t), expr: 'smile', rim: { color: '#8fb8e8', dir: [0, -1] } });
  });
  // screens fade to black at the end
  veil(g, '#000000', ease.inOut(prog(t, info.dur - 0.7, info.dur)) * 0.85);
  FX.stars(g, t, { seed: 33, count: 40, color: '#8fb8e8' });
} });
