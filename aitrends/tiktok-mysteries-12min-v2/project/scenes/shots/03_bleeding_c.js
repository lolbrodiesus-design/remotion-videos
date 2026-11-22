// shots/03_bleeding_c.js — Story 3 (Bleeding Wall): s078a–s084a.
// Lexy (green cap, LEXY) — black stick figures only, rim light on every lit figure.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, mix, poly, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom } from '../sets/bathroom.js';
import { LEXY } from '../cast.js';

// The red drip: S().ui.accent (coral red) from the style tokens, darkened for depth.
const red = () => S().ui.accent;
const redDark = () => shade(S().ui.accent, -0.45);
const GOLD = () => S().ui.gold;
const CREAM = () => S().ui.cream;
const BLUE = () => S().ui.blueprint;
const BRO = { top: 'tshirt', color: shade(mood('interiorCool').wall, 0.2), head: 'none' }; // Lexy's brother, plain ink figure
function dripTrail(g, x, y, len, w, a = 0.95) {
  if (len <= 2) return;
  g.save(); g.globalAlpha = a; g.fillStyle = red();
  g.beginPath(); g.moveTo(x - w / 2, y);
  g.bezierCurveTo(x - w, y + len * 0.4, x + w, y + len * 0.7, x - w * 0.2, y + len);
  g.bezierCurveTo(x + w * 0.6, y + len * 0.7, x + w / 2, y + len * 0.35, x + w / 2, y);
  g.fill(); g.restore();
  circle(g, x - w * 0.2, y + len, Math.max(2, w * 0.45), redDark());
}
const CAB = { x: E.W / 2 + 330, y: 864 - 470, w: 380, h: 300 };
const DRIPX = CAB.x + CAB.w * 0.3, DRIPY = CAB.y + CAB.h + 6;
const kOf = (t, info) => ease.inOut(clamp(t / info.dur));

// s078a — insert: a single dead geometric bee on a cold blue windowsill.
registerShot('s078a', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.5, x: 100, y: -60 }, {})); veil(g, '#0e1424', 0.5);
  const M = mood('interiorCool');
  const bx = E.W / 2 - 40 + 30 * k, by = E.H * 0.58, z = 1.5 + 0.55 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  rr(g, E.W / 2 - 420, by + 40, 840, 46, 8); g.fillStyle = shade(M.wall, -0.2); g.fill();
  glow(g, bx, by - 120, 180, M.key, 0.3);
  g.save(); g.translate(bx, by); g.rotate(-0.15);
  g.fillStyle = S().ink; g.beginPath(); g.ellipse(0, 0, 64, 40, 0, 0, 7); g.fill();
  g.fillStyle = GOLD();
  g.beginPath(); g.ellipse(-14, -6, 12, 38, 0.15, 0, 7); g.fill();
  g.beginPath(); g.ellipse(16, -4, 12, 38, -0.1, 0, 7); g.fill();
  g.fillStyle = alpha(CREAM(), 0.55);
  g.beginPath(); g.ellipse(-10, -52, 34, 14, -0.5, 0, 7); g.fill();
  g.beginPath(); g.ellipse(18, -54, 30, 12, 0.4, 0, 7); g.fill();
  g.restore();
  g.restore();
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
  FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 0.7, M.key, 0.1);
} });

// s078b — insert: Lexy's hand gripping the edge of the sink, knuckles whitening, trembling.
registerShot('s078b', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 14, (g) => bathroom(g, t, { z: 1.6, x: -80, y: -100 }, {})); veil(g, shade(mood('interiorCool').dark, -0.2), 0.42);
  const M = mood('interiorCool');
  const z = 1.5 + 0.25 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const sx = E.W / 2, sy = E.H * 0.6;
  // the sink: cream countertop slab with a front lip, basin bowl below the lip
  rr(g, sx - 460, sy - 130, 920, 130, 14); g.fillStyle = CREAM(); g.fill();
  g.fillStyle = alpha(shade(M.key, -0.1), 0.25); g.fillRect(sx - 460, sy - 8, 920, 8);
  g.beginPath(); g.ellipse(sx - 40, sy + 130, 300, 90, 0, 0, 7); g.fillStyle = shade(M.key, -0.3); g.fill();
  g.beginPath(); g.ellipse(sx - 40, sy + 110, 240, 60, 0, 0, 7); g.fillStyle = shade(M.dark, -0.25); g.fill();
  glow(g, sx, sy - 180, 220, M.key, 0.25);
  // the hand: forearm enters from the right frame edge, palm on the countertop,
  // four fingers wrapping down over the front lip, thumb braced on top
  const tr = shake(t, 2.5, 3.1);
  const wx = sx + 260 + tr[0], wy = sy - 96 + tr[1];
  // forearm from the right edge to the wrist
  seg(g, [[E.W + 60, wy + 60], [wx + 60, wy + 26]], 46, S().ink);
  // palm, resting on the countertop surface
  g.fillStyle = S().ink;
  g.beginPath(); g.ellipse(wx, wy + 10, 74, 58, -0.15, 0, 7); g.fill();
  circle(g, wx - 10, wy - 20, 46, S().ink);
  // thumb braced flat on the countertop, pointing left
  seg(g, [[wx - 30, wy + 6], [wx - 150, wy - 14]], 26, S().ink);
  circle(g, wx - 150, wy - 14, 15, S().ink);
  // four fingers curling over the front lip and down the sink face
  for (let i = 0; i < 4; i++) {
    const fx = wx - 58 + i * 40;
    seg(g, [[fx, wy + 30], [fx + 4, sy + 6]], 28, S().ink);
    seg(g, [[fx + 4, sy + 6], [fx + 12, sy + 78]], 24, S().ink);
    circle(g, fx + 12, sy + 82, 13, S().ink);
    // knuckle: a small pale circle whitening on each finger joint
    circle(g, fx + 2, sy - 2, 10, alpha(CREAM(), 0.4 + 0.18 * Math.sin(t * 5 + i * 1.3)));
  }
  // rim light along the hand's lit edge
  seg(g, [[wx - 60, wy - 44], [wx + 40, wy - 52]], 5, alpha(M.rim, 0.9));
  g.restore();
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });

// s079a — blueprint: side-profile cross-section of the wall and cabinet; the razor slot is arrowed.
registerShot('s079a', { draw(g, t, info) {
  const k = kOf(t, info);
  UI.blueprint(g, {});
  const bp = BLUE(), cx = E.W / 2, cy = E.H * 0.52;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(1.15 - 0.15 * k, 1.15 - 0.15 * k); g.translate(-E.W / 2, -E.H / 2);
  g.strokeStyle = bp; g.lineWidth = 3;
  g.strokeRect(cx - 560, cy - 300, 1120, 600);                      // wall cross-section
  for (const sx of [cx - 300, cx + 60, cx + 420]) { g.strokeRect(sx, cy - 300, 46, 600); } // studs
  g.strokeRect(cx + 120, cy - 200, 260, 340);                       // cabinet
  g.beginPath(); g.moveTo(cx + 250, cy - 200); g.lineTo(cx + 250, cy + 140); g.stroke();
  // the narrow vertical razor slot, highlighted gold
  const slotX = cx + 250, slotY = cy - 120;
  rr(g, slotX - 8, slotY - 60, 16, 120, 6); g.fillStyle = GOLD(); g.fill();
  glow(g, slotX, slotY, 90, GOLD(), 0.5);
  const ax = slotX + 260, ay = slotY - 40;
  poly(g, [[ax - 120, ay], [ax - 40, ay], [ax - 40, ay - 16], [ax, ay], [ax - 40, ay + 16], [ax - 40, ay]], GOLD());
  text(g, 'RAZOR DISPOSAL', ax - 120, ay - 44, { size: 30, color: GOLD(), font: FONTS.ui, weight: 900, align: 'right', glow: 14, glowColor: alpha(GOLD(), 0.5), alpha: ease.out(prog(t, 0.5, 1.1)) });
  g.restore();
  FX.dust(g, t, { count: 14, color: BLUE(), a: 0.25 });
} });

// s079b — insert: the back interior of the medicine cabinet; a thin dark slit where the metal is bent.
registerShot('s079b', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.7, x: 200, y: -80 }, {})); veil(g, '#0a0c16', 0.5);
  const M = mood('interiorCool');
  const z = 1.7 + 0.15 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 - 120 * k, -E.H / 2);
  const ix = E.W / 2 - 100, iy = E.H * 0.3, iw = 560, ih = 480;
  rr(g, ix - 14, iy - 14, iw + 28, ih + 28, 10); g.fillStyle = shade(M.wall, -0.1); g.fill();
  rr(g, ix, iy, iw, ih, 8); g.fillStyle = shade(M.dark, -0.1); g.fill();
  g.strokeStyle = alpha(M.key, 0.3); g.lineWidth = 3; g.strokeRect(ix + 30, iy + 30, iw - 60, ih - 60);
  // the thin horizontal slit, metal slightly bent
  const sy = iy + ih * 0.45;
  g.fillStyle = shade(M.dark, -0.5); g.fillRect(ix + 60, sy - 7, iw - 120, 14);
  poly(g, [[ix + 60, sy - 7], [ix + 200, sy - 7], [ix + 190, sy - 34], [ix + 80, sy - 30]], shade(M.key, -0.2));
  glow(g, ix + iw / 2, sy, 120, M.key, 0.25);
  g.restore();
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });

// s080a — blueprint: a pile of overlapping grey rectangles — razor blades, rusted orange.
registerShot('s080a', { draw(g, t, info) {
  const k = kOf(t, info);
  UI.blueprint(g, {});
  const bp = BLUE(), cx = E.W / 2, cy = E.H * 0.55;
  const rust = mix(GOLD(), red(), 0.5);
  const r = (() => { let s = 11; return () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let v = Math.imul(s ^ (s >>> 15), 1 | s); v = (v + Math.imul(v ^ (v >>> 7), 61 | v)) ^ v; return ((v ^ (v >>> 14)) >>> 0) / 4294967296; }; })();
  g.save(); g.translate(60 * k, 0);
  for (let i = 0; i < 12; i++) {
    const bx = cx - 320 + (i % 4) * 150 + (r() - 0.5) * 40;
    const by = cy + 60 - Math.floor(i / 4) * 70 + (r() - 0.5) * 24;
    g.save(); g.translate(bx, by); g.rotate((r() - 0.5) * 0.5);
    rr(g, -70, -16, 140, 32, 4); g.fillStyle = shade(mood('void').wall, 0.25); g.fill();
    g.strokeStyle = alpha(rust, 0.8); g.lineWidth = 3; g.stroke();
    g.restore();
  }
  // rust leaking out: an animated red path down the wall cross-section
  const lp = ease.inOut(prog(t, 0.6, info.dur - 0.2));
  dripTrail(g, cx + 260, cy - 120, 200 * lp, 10);
  g.restore();
  text(g, 'RUST', cx + 260, cy - 160, { size: 30, color: rust, font: FONTS.ui, weight: 900, alpha: ease.out(prog(t, 0.8, 1.3)) });
  FX.dust(g, t, { count: 14, color: BLUE(), a: 0.25 });
} });

// s080b — insert: a jagged metal corner inside the wall cross-section; a rust drop forms and falls.
registerShot('s080b', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.8, x: 150, y: -40 }, {})); veil(g, shade(mood('interiorCool').dark, -0.3), 0.55);
  const M = mood('interiorCool');
  const rust = mix(GOLD(), red(), 0.55);
  const cx = E.W / 2, cy = E.H * 0.46;
  const z = 1.35 + 0.2 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  // the wall, cut open: outer face left and right, dark cavity between two wooden studs
  g.fillStyle = shade(M.wall, -0.25); g.fillRect(cx - 560, cy - 330, 1120, 660);
  g.fillStyle = shade(M.dark, -0.4); g.fillRect(cx - 330, cy - 330, 660, 660);
  for (const sx of [cx - 330, cx + 284]) { rr(g, sx, cy - 330, 46, 660, 6); g.fillStyle = shade(M.wall, 0.12); g.fill(); }
  seg(g, [[cx - 560, cy - 330], [cx + 560, cy - 330]], 4, alpha(M.key, 0.4));
  seg(g, [[cx - 560, cy + 330], [cx + 560, cy + 330]], 4, alpha(M.key, 0.4));
  FX.lightCone(g, cx - 200, cy - 330, { angle: Math.PI / 2.3, spread: 0.5, len: 700, color: M.key, a: 0.1 });
  // the jagged metal corner: a torn sheet-metal edge jutting from the cavity, rusted, ending in a sharp point
  const mx = cx - 40, my = cy - 120;
  poly(g, [
    [mx - 260, my - 40], [mx - 120, my - 130], [mx + 20, my - 70], [mx + 150, my - 140],
    [mx + 230, my - 30], [mx + 170, my + 60], [mx + 210, my + 150], [mx + 90, my + 130],
    [mx + 60, my + 240], [mx - 40, my + 170], [mx - 160, my + 210], [mx - 230, my + 90]
  ], shade(M.key, -0.15));
  // rust patches on the metal
  for (const [ox, oy, orr] of [[-140, -60, 52], [60, -90, 44], [140, 40, 58], [-80, 130, 40], [30, 60, 30]]) {
    circle(g, mx + ox, my + oy, orr, alpha(rust, 0.5));
  }
  // torn-edge highlight along the jagged rim
  g.save(); g.strokeStyle = alpha(CREAM(), 0.35); g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.moveTo(mx - 260, my - 40); g.lineTo(mx - 120, my - 130); g.lineTo(mx + 20, my - 70); g.lineTo(mx + 150, my - 140); g.lineTo(mx + 230, my - 30); g.stroke(); g.restore();
  // a dark orange drop forms on the rusty point and falls into the darkness below
  const tipX = mx + 60, tipY = my + 240;
  const grow = ease.out(prog(t, 0, 1.2));
  const fall = prog(t, 1.2, info.dur);
  const dy = fall * fall * 380;
  const dropR = 16 * grow * (1 - fall * 0.35);
  circle(g, tipX, tipY + dy, Math.max(2, dropR), rust);
  circle(g, tipX - 5, tipY + dy - 5, Math.max(1, dropR * 0.35), alpha(CREAM(), 0.6));
  glow(g, tipX, tipY + dy, 70, rust, 0.55);
  if (fall > 0.85) FX.rings(g, tipX, tipY + 380, (fall - 0.85) * 4, { count: 2, r0: 20, r1: 110, color: rust, a: 0.5 });
  g.restore();
  FX.dust(g, t, { count: 14, color: '#cfe0ff', a: 0.3 });
} });

// s081 — medium: Lexy and her brother lift the whole cabinet off the wall; dust explodes.
registerShot('s081', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.1, x: -20 * k, y: -40 * (1 - k) };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  const pull = ease.inOut(prog(t, 0.4, 1.8));
  layer(g, cam, 0.55, (g) => {
    // dark lath-and-plaster revealed where the cabinet was
    rr(g, CAB.x - 6, CAB.y - 6, CAB.w + 12, CAB.h + 12, 6); g.fillStyle = shade(M.dark, -0.3); g.fill();
    for (let i = 0; i < 4; i++) seg(g, [[CAB.x + 20, CAB.y + 40 + i * 70], [CAB.x + CAB.w - 20, CAB.y + 30 + i * 70]], 3, alpha(M.key, 0.2));
    // the cabinet itself, pulled away from the wall
    const cx0 = CAB.x - 170 * pull, cy0 = CAB.y + 40 * pull;
    rr(g, cx0 - 6, cy0 - 6, CAB.w + 12, CAB.h + 12, 8); g.fillStyle = shade(M.wall, -0.1); g.fill();
    rr(g, cx0, cy0, CAB.w, CAB.h, 6); g.fillStyle = shade(M.key, -0.2); g.fill();
    seg(g, [[cx0 + CAB.w / 2, cy0], [cx0 + CAB.w / 2, cy0 + CAB.h]], 3, shade(M.key, -0.4));
  });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 120 - 60 * pull, y: GY, s: 1.6, facing: 1, outfit: LEXY,
      pose: breathe(posesAt(t, [[0, 'stand'], [0.4, 'holdFront']]), t), expr: 'determined',
      rim: { color: M.rim, dir: [1, -0.3] } });
    drawFigure(g, { x: E.W / 2 + 620 + 40 * pull, y: GY, s: 1.65, facing: -1, outfit: BRO,
      pose: breathe(posesAt(t, [[0, 'stand'], [0.4, 'holdFront']]), t, 1, 5), expr: 'determined',
      rim: { color: M.rim, dir: [-1, -0.3] } });
  });
  if (t > 0.4) FX.rings(g, CAB.x + CAB.w / 2, CAB.y + CAB.h / 2, t - 0.4, { count: 2, r0: 80, r1: 420, color: M.key, a: 0.35 });
  FX.dust(g, t, { count: 60, color: '#cfe0ff', a: 0.45 });
  FX.lightCone(g, E.W * 0.78, E.H * 0.2, { angle: Math.PI / 2, spread: 0.5, len: 800, color: M.key, a: 0.08 });
} });

// s082 — blueprint: the empty rectangular void in the drywall — NO RAZORS.
registerShot('s082', { draw(g, t, info) {
  const k = kOf(t, info);
  UI.blueprint(g, {});
  const bp = BLUE(), cx = E.W / 2, cy = E.H * 0.5;
  g.save(); g.translate(40 * k, 0);
  g.strokeStyle = bp; g.lineWidth = 3;
  for (const sx of [cx - 320, cx + 274]) { g.strokeRect(sx, cy - 280, 46, 560); } // wooden studs
  g.strokeRect(cx - 274, cy - 220, 548, 440);                       // the empty void
  g.fillStyle = alpha(mood('void').dark, 0.6); g.fillRect(cx - 274, cy - 220, 548, 440);
  // the razor pile fades out
  const fade = 1 - ease.inOut(prog(t, 0.3, 1.2));
  if (fade > 0.02) {
    g.save(); g.globalAlpha = fade * 0.6;
    for (let i = 0; i < 6; i++) { rr(g, cx - 200 + (i % 3) * 130, cy + 60 - Math.floor(i / 3) * 60, 120, 28, 4); g.fillStyle = shade(mood('void').wall, 0.25); g.fill(); }
    g.restore();
  }
  const blink = Math.sin(t * 5) > 0 ? 0.9 : 0.25;
  circle(g, cx, cy - 260, 12, alpha(red(), blink));
  g.restore();
  text(g, 'NO RAZORS', cx, cy + 300, { size: 46, color: CREAM(), font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(CREAM(), 0.5), alpha: ease.out(prog(t, 0.6, 1.1)) });
  FX.dust(g, t, { count: 14, color: BLUE(), a: 0.25 });
} });

// s083 — medium: Lexy holds the detached cabinet on her lap and tilts it in the moonlight.
registerShot('s083', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.08, x: -40 * k, y: 30 * k };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  FX.lightCone(g, E.W * 0.78, E.H * 0.18, { angle: Math.PI / 2.4, spread: 0.45, len: 800, color: M.key, a: 0.1 });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 120, y: GY, s: 1.6, facing: 1, outfit: LEXY,
      pose: breathe(POSES.sit, t), expr: 'thinking',
      rim: { color: M.rim, dir: [1, -0.4] }, blink: (t % 3.3) > 3.2 });
    const tilt = 0.12 * ease.inOut(prog(t, 0.3, 1.5));
    g.save(); g.translate(E.W / 2 - 60, GY - 130); g.rotate(tilt);
    rr(g, -170, -120, 340, 240, 8); g.fillStyle = shade(M.wall, -0.1); g.fill();
    rr(g, -158, -108, 316, 216, 6); g.fillStyle = shade(M.key, -0.25); g.fill();
    seg(g, [[-170, -30], [170, -30]], 3, alpha(M.key, 0.5));
    g.restore();
  });
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.3 });
} });

// s084a — insert: a flat-head screwdriver pries at a metal seam; the metal bends up, opening a gap.
registerShot('s084a', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.7, x: 120, y: -60 }, {})); veil(g, '#120a10', 0.42);
  const M = mood('interiorCool');
  const z = 1.6 + 0.4 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const sx = E.W / 2, sy = E.H * 0.55;
  rr(g, sx - 420, sy - 60, 840, 120, 8); g.fillStyle = shade(M.key, -0.25); g.fill();
  seg(g, [[sx - 420, sy], [sx + 420, sy]], 4, shade(M.key, -0.45));
  const bend = ease.inOut(prog(t, 0.5, 1.6));
  g.fillStyle = shade(M.dark, -0.3); g.fillRect(sx - 60, sy - 26 * bend, 200, 26 * bend + 4);
  poly(g, [[sx - 60, sy], [sx + 140, sy], [sx + 140, sy - 30 - 70 * bend], [sx - 60, sy - 26 * bend]], shade(M.key, -0.1));
  // screwdriver
  g.save(); g.translate(sx + 260, sy - 90 - 40 * bend); g.rotate(0.5 + 0.25 * bend);
  rr(g, -16, -70, 32, 90, 10); g.fillStyle = GOLD(); g.fill();
  seg(g, [[0, 20], [0, 130]], 10, shade(M.key, -0.1));
  g.restore();
  glow(g, sx + 60, sy - 60, 140, M.key, 0.3);
  g.restore();
  FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.3 });
} });
