// shots/03_bleeding_d.js — Story 3 (Bleeding Wall): s084b–s091.
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

// s084b — insert: two stick-figure hands pull a thin metal sheet back; a dark wet interior shows.
registerShot('s084b', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.7, x: 100, y: -60 }, {})); veil(g, '#120a10', 0.42);
  const M = mood('interiorCool');
  const z = 1.9 - 0.4 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  const sx = E.W / 2, sy = E.H * 0.5;
  rr(g, sx - 380, sy - 220, 760, 440, 10); g.fillStyle = shade(M.dark, -0.2); g.fill();
  const peel = ease.inOut(prog(t, 0.3, 1.6));
  const jit = shake(t, 2, 2.6);
  g.save(); g.translate(jit[0] * peel, jit[1] * peel);
  poly(g, [[sx - 380, sy - 220], [sx + 380, sy - 220], [sx + 380, sy + 220 - 260 * peel], [sx - 380, sy + 220 - 120 * peel]], shade(M.key, -0.15));
  g.restore();
  // wet interior + condensation droplets revealed underneath
  g.fillStyle = shade(M.dark, -0.4); g.fillRect(sx - 300, sy + 60, 600, 130);
  for (let i = 0; i < 6; i++) circle(g, sx - 240 + i * 96, sy + 110 + (i % 2) * 40, 6 + (i % 3) * 2, alpha(M.practical, 0.8));
  // two hands gripping the sheet edge
  for (const hx of [sx - 200, sx + 200]) {
    circle(g, hx, sy + 40 - 200 * peel, 26, S().ink);
    for (let i = 0; i < 3; i++) seg(g, [[hx - 24 + i * 24, sy + 50 - 200 * peel], [hx - 20 + i * 24, sy + 110 - 200 * peel]], 12, S().ink);
  }
  g.restore();
  FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.35 });
} });

// s085 — medium: Lexy gasps as her brother holds the peeled sheet; she shines a light into the channel.
registerShot('s085', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.08, x: -40 * k, y: -10 * k };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  layer(g, cam, 0.55, (g) => {
    rr(g, CAB.x - 6, CAB.y - 6, CAB.w + 12, CAB.h + 12, 8); g.fillStyle = shade(M.wall, -0.1); g.fill();
    rr(g, CAB.x, CAB.y, CAB.w, CAB.h, 6); g.fillStyle = shade(M.dark, -0.25); g.fill();
    poly(g, [[CAB.x, CAB.y + CAB.h], [CAB.x + CAB.w, CAB.y + CAB.h], [CAB.x + CAB.w - 60, CAB.y + CAB.h - 90], [CAB.x + 40, CAB.y + CAB.h - 60]], shade(M.key, -0.1));
    dripTrail(g, DRIPX, CAB.y + CAB.h - 40, 90, 9);
  });
  const hx = E.W / 2 - 190, hy = GY - 250;
  FX.lightCone(g, hx, hy, { angle: 0.15, spread: 0.4, len: 850, color: M.key, a: 0.16 });
  glow(g, hx, hy, 90, M.key, 0.6);
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 260, y: GY, s: 1.6, facing: 1, outfit: LEXY,
      pose: breathe(posesAt(t, [[0, 'stand'], [0.4, 'reach']]), t), expr: 'shocked', prop: 'flashlight',
      rim: { color: M.rim, dir: [1, -0.3] }, blink: (t % 2.9) > 2.8 });
    drawFigure(g, { x: E.W / 2 + 640, y: GY, s: 1.65, facing: -1, outfit: BRO,
      pose: breathe(POSES.holdFront, t, 1, 5), expr: 'neutral',
      rim: { color: M.rim, dir: [-1, -0.3] } });
  });
  FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.35 });
} });

// s086 — insert: a pool of thick amber-red sludge; a single bubble rises and pops.
registerShot('s086', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.8, x: 150, y: -40 }, {})); veil(g, '#0a0c16', 0.5);
  const M = mood('interiorCool');
  const sludge = mix(red(), GOLD(), 0.35);
  const cx = E.W / 2, cy = E.H * 0.62;
  const z = 1.5 + 0.2 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  g.fillStyle = shade(M.dark, -0.3); g.fillRect(-E.W, cy - 260, E.W * 3, 520);
  g.fillStyle = shade(sludge, -0.3);
  g.beginPath(); g.ellipse(cx, cy, 380, 130, 0, 0, 7); g.fill();
  g.fillStyle = alpha(sludge, 0.8);
  g.beginPath(); g.ellipse(cx - 60, cy - 20, 260, 80, -0.1, 0, 7); g.fill();
  glow(g, cx, cy, 300, sludge, 0.25);
  const rise = prog(t, 0.3, 1.9);
  const bx = cx + 40, by = cy - 30 - rise * 90;
  const br = (6 + rise * 22) * (t > 2.0 ? Math.max(0, 1 - (t - 2.0) * 6) : 1);
  if (br > 0.5) { circle(g, bx, by, br, alpha(CREAM(), 0.5)); ring(g, bx, by, br, 3, alpha(sludge, 0.9)); }
  if (t > 2.0) FX.rings(g, bx, by, t - 2.0, { count: 2, r0: 30, r1: 160, color: sludge, a: 0.5 });
  g.restore();
  FX.dust(g, t, { count: 14, color: '#cfe0ff', a: 0.3 });
} });

// s087 — insert: a red drop falls onto a white surface and splatters into a large starburst.
registerShot('s087', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 14, (g) => bathroom(g, t, { z: 1.7, x: -60, y: -100 }, {})); veil(g, shade(mood('interiorCool').dark, -0.2), 0.4);
  const M = mood('interiorCool');
  const rustTint = mix(red(), GOLD(), 0.35);
  const sx = E.W / 2 - 60 + 40 * k, sy = E.H * 0.66;
  const z = 1.06 + 0.08 * k;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  // the white surface fills the frame
  g.fillStyle = CREAM(); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.fillStyle = alpha(shade(M.key, -0.1), 0.08); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 0.22);
  glow(g, sx, sy, 500, M.key, 0.12);
  const impact = 1.1;
  const fall = prog(t, 0, impact);
  const dy = fall * fall * (sy - E.H * 0.1);
  if (t < impact) {
    // the drop, LARGE, falling with a thin trail
    seg(g, [[sx, E.H * 0.1 + dy - 130], [sx, E.H * 0.1 + dy - 40]], 10, alpha(red(), 0.5));
    circle(g, sx, E.H * 0.1 + dy, 42, red());
    circle(g, sx - 14, E.H * 0.1 + dy - 14, 15, alpha(CREAM(), 0.65));
    glow(g, sx, E.H * 0.1 + dy, 120, red(), 0.35);
  } else {
    // the starburst: a big 12-point splatter, orange-brown rusty tint at its heart
    const sp = ease.out(prog(t, impact, impact + 0.5));
    const pts = [];
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const rad = (i % 2 === 0 ? 300 : 150) + (i % 3) * 22;
      pts.push([sx + Math.cos(a) * rad * sp, sy + Math.sin(a) * rad * 0.55 * sp]);
    }
    poly(g, pts, rustTint);
    // satellite droplets flung outward
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + 0.3;
      circle(g, sx + Math.cos(a) * 420 * sp, sy + Math.sin(a) * 210 * sp, 14 + (i % 3) * 6, red());
    }
    // the rusty heart of the splatter + a darker centre pool
    circle(g, sx, sy, 120 * sp, mix(GOLD(), red(), 0.4));
    circle(g, sx, sy, 58 * sp, redDark());
    circle(g, sx - 18, sy - 16, 16 * sp, alpha(CREAM(), 0.5));
  }
  g.restore();
  FX.dust(g, t, { count: 14, color: '#cfe0ff', a: 0.3 });
} });

// s088 — insert: the dead vent. Steam wisps drift PAST it, never entering — no ventilation.
registerShot('s088', { draw(g, t, info) {
  const k = kOf(t, info);
  const M = mood('interiorCool');
  const cam = { z: 1.15, x: 20 * k, y: -50 * k };
  blurLayer(g, 10, (g) => bathroom(g, t, cam, { drip: false, wisps: false })); veil(g, '#0e1424', 0.35);
  const vx = E.W / 2 + 60, vy = E.H * 0.3;
  ring(g, vx, vy, 150, 10, shade(M.key, -0.1));
  ring(g, vx, vy, 118, 4, alpha(M.key, 0.5));
  for (let i = -1; i <= 1; i++) seg(g, [[vx - 100, vy + i * 44], [vx + 100, vy + i * 44]], 8, shade(M.key, -0.25));
  circle(g, vx, vy, 14, shade(M.key, -0.2));
  glow(g, vx, vy, 120, M.key, 0.15);
  // wisps drift horizontally past the vent, at fixed heights below it — never converging on it
  g.save(); g.strokeStyle = alpha(M.practical, 0.35); g.lineWidth = 7; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const y0 = vy + 210 + i * 90;
    const drift = ((t * 55 + i * 420) % 900) - 150;
    g.beginPath();
    g.moveTo(E.W * 0.12 + drift, y0);
    g.bezierCurveTo(E.W * 0.35 + drift, y0 - 50, E.W * 0.6 + drift, y0 + 50, E.W * 0.88 + drift, y0 - 16);
    g.stroke();
  }
  g.restore();
  FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.3 });
} });

// s089a — wide: the bathroom filled with a faint blue haze; the drip forms again and again.
registerShot('s089a', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.05, x: 50 * Math.sin(t * 0.5), y: -10 * k, r: 0.01 * Math.sin(t * 0.6) };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  layer(g, cam, 0.55, (g) => {
    const cyc = (t % 1.6) / 1.6;
    dripTrail(g, DRIPX, DRIPY, 190 * cyc, 11, 0.85);
    dripTrail(g, DRIPX + 70, DRIPY + 8, 120 * ((t + 0.7) % 1.6) / 1.6, 8, 0.7);
  });
  FX.fog(g, E.H * 0.35, 220, M.fog, 0.3);
  FX.fog(g, E.H * 0.62, 180, M.fog, 0.25);
  veil(g, M.fog, 0.1);
  FX.dust(g, t, { count: 34, color: '#cfe0ff', a: 0.4 });
  FX.godRays(g, E.W * 0.78, E.H * 0.25, { count: 6, angle: Math.PI / 2, spread: 0.6, len: 900, a: 0.04, t });
} });

// s089b — insert: a single blue condensation bead rolls down a rusted silver pipe, turning orange.
registerShot('s089b', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.7, x: -40, y: -80 }, {})); veil(g, '#0e1424', 0.45);
  const M = mood('interiorCool');
  const px = E.W / 2 + 80 - 60 * k, py0 = E.H * 0.14, py1 = E.H * 0.86;
  const rust = mix(GOLD(), red(), 0.55);
  rr(g, px - 46, py0, 92, py1 - py0, 20); g.fillStyle = shade(M.key, -0.3); g.fill();
  g.fillStyle = shade(M.key, -0.1); g.fillRect(px - 46, py0, 26, py1 - py0);
  g.fillStyle = alpha(rust, 0.75); g.fillRect(px - 46, E.H * 0.5, 92, 130);
  glow(g, px, E.H * 0.5, 120, rust, 0.3);
  const roll = ease.inOut(prog(t, 0.1, info.dur - 0.1));
  const by = lerp(py0 + 60, py1 - 60, roll);
  const rustMix = clamp((by - E.H * 0.5) / (E.H * 0.18));
  const beadC = mix(M.practical, red(), rustMix);
  circle(g, px + 10, by, 18, beadC);
  circle(g, px + 4, by - 6, 6, alpha(CREAM(), 0.7));
  glow(g, px + 10, by, 50, beadC, 0.5);
  seg(g, [[px + 10, by - 18], [px + 10, by - 70 * roll]], 5, alpha(beadC, 0.5));
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });

// s090 — FACE CU 2 of 2: Lexy in profile looking at the cabinet; she exhales a small breath cloud.
registerShot('s090', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 14, (g) => bathroom(g, t, { z: 1.5, x: 150, y: -120 }, { drip: false })); veil(g, '#120a10', 0.4);
  const M = mood('interiorCool');
  const cx = E.W / 2 - 40, cy = E.H * 0.58, r = 320 * (1 + 0.03 * k);
  bigFace(g, cx, cy, r, { outfit: LEXY, expr: 'determined', look: [0.9, 0],
    rimColor: M.rim, rimSide: 1, tilt: -0.12, blink: (t % 3.1) > 3.0 });
  // breath cloud drifting right and dissipating
  const bp = ease.out(prog(t, 0.5, 2.4));
  if (bp > 0 && bp < 1) {
    for (let i = 0; i < 3; i++) {
      const a = 0.35 * (1 - bp) * (1 - i * 0.25);
      circle(g, cx + r * 0.95 + bp * 160 + i * 44, cy + r * 0.28 - i * 12 + Math.sin(t * 2 + i) * 6, 26 - i * 5, alpha(CREAM(), a));
    }
  }
  FX.dust(g, t, { count: 14, color: '#cfe0ff', a: 0.3 });
} });

// s091 — medium: Lexy, calm, wipes the dissected cabinet clean as warm light fades to cold blue.
registerShot('s091', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.12 - 0.12 * k, x: 30 * k, y: -10 * k };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  const cold = ease.inOut(prog(t, 1.0, info.dur - 0.2));
  layer(g, cam, 0.9, (g) => {
    rr(g, E.W / 2 - 420, GY - 40, 840, 90, 12); g.fillStyle = shade(M.wall, -0.45); g.fill();
    const cx0 = E.W / 2 + 60, cy0 = GY - 180;
    rr(g, cx0 - 190, cy0 - 110, 380, 220, 8); g.fillStyle = shade(M.wall, -0.1); g.fill();
    rr(g, cx0 - 178, cy0 - 98, 356, 196, 6); g.fillStyle = shade(M.dark, -0.2); g.fill();
    poly(g, [[cx0 - 190, cy0 - 110], [cx0 + 190, cy0 - 110], [cx0 + 150, cy0 - 190], [cx0 - 150, cy0 - 190]], shade(M.key, -0.15));
    dripTrail(g, cx0 - 60, cy0 - 60, 60, 7, 0.6);
  });
  glow(g, E.W / 2, E.H * 0.3, 320, M.practical, 0.25 * (1 - cold));
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 300, y: GY, s: 1.55, facing: 1, outfit: LEXY,
      pose: breathe(posesAt(t, [[0, 'stand'], [0.5, 'reach']]), t), expr: 'neutral',
      rim: { color: M.rim, dir: [1, -0.3] }, blink: (t % 3.3) > 3.2 });
  });
  veil(g, M.fog, 0.28 * cold);
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.3 });
} });
